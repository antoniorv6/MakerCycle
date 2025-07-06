"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Team, TeamMember } from '@/types';
import { Plus, X } from 'lucide-react';

interface MemberProfile {
  id: string;
  full_name: string | null;
  email: string;
}

const TeamManager: React.FC = () => {
  const { user } = useAuth();
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, MemberProfile>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    if (user) fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, teams(*)')
      .eq('user_id', user.id);
    if (!error && data) {
      setTeams(data.map((tm: any) => tm.teams));
    }
    setLoading(false);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name: teamName, created_by: user.id }])
      .select()
      .single();
    if (!error && data) {
      setTeams([...teams, data]);
      setTeamName('');
    }
    setLoading(false);
  };

  const handleSelectTeam = async (team: Team) => {
    setSelectedTeam(team);
    // Fetch members
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team.id);
    if (!error && data) {
      setMembers(data);
      // Fetch member profiles in batch
      const userIds = data.map((m: TeamMember) => m.user_id);
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        if (!profilesError && profiles) {
          const profileMap: Record<string, MemberProfile> = {};
          profiles.forEach((p: MemberProfile) => { profileMap[p.id] = p; });
          setMemberProfiles(profileMap);
        }
      } else {
        setMemberProfiles({});
      }
    }
  };

  // For demo: invite by user ID (in real app, resolve email to user ID)
  const handleInviteMember = async () => {
    if (!selectedTeam || !inviteEmail.trim()) return;
    // Find user by email
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteEmail.trim())
      .single();
    if (userError || !users) return;
    const { error } = await supabase
      .from('team_members')
      .insert([{ team_id: selectedTeam.id, user_id: users.id, role: 'member' }]);
    if (!error) {
      setMembers([...members, { id: Date.now().toString(), team_id: selectedTeam.id, user_id: users.id, role: 'member' as const, created_at: new Date().toISOString() }]);
      setInviteEmail('');
      // Optionally, refetch profiles
      handleSelectTeam(selectedTeam);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    if (!window.confirm('¿Seguro que quieres eliminar a este miembro del equipo?')) return;
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', selectedTeam.id)
      .eq('user_id', userId);
    if (!error) {
      setMembers(members.filter(m => m.user_id !== userId));
      // Optionally, refetch profiles
      const newProfiles = { ...memberProfiles };
      delete newProfiles[userId];
      setMemberProfiles(newProfiles);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!selectedTeam) return;
    const { error } = await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('team_id', selectedTeam.id)
      .eq('user_id', userId);
    if (!error) {
      setMembers(members.map(m => m.user_id === userId ? { ...m, role: newRole as 'owner' | 'member' | 'admin' } : m));
    }
  };

  const handleRenameTeam = async () => {
    if (!selectedTeam || !newTeamName.trim()) return;
    const { error } = await supabase
      .from('teams')
      .update({ name: newTeamName })
      .eq('id', selectedTeam.id);
    if (!error) {
      setTeams(teams.map(t => t.id === selectedTeam.id ? { ...t, name: newTeamName } : t));
      setSelectedTeam({ ...selectedTeam, name: newTeamName });
      setRenaming(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    if (!window.confirm('¿Seguro que quieres eliminar este equipo? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', selectedTeam.id);
    if (!error) {
      setTeams(teams.filter(t => t.id !== selectedTeam.id));
      setSelectedTeam(null);
      setMembers([]);
      setMemberProfiles({});
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Tus Equipos</h2>
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Nombre del equipo"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleCreateTeam}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-1" /> Crear equipo
        </button>
      </div>
      <ul className="space-y-2 mb-8">
        {teams.map(team => (
          <li key={team.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow border">
            <span>{team.name}</span>
            <button
              className="text-primary-600 underline"
              onClick={() => handleSelectTeam(team)}
            >
              Ver miembros
            </button>
          </li>
        ))}
      </ul>
      {selectedTeam && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Miembros de {selectedTeam.name}</h3>
            <div className="flex gap-2">
              {!renaming ? (
                <button
                  className="text-blue-600 underline text-sm"
                  onClick={() => { setRenaming(true); setNewTeamName(selectedTeam.name); }}
                >Renombrar equipo</button>
              ) : (
                <>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    className="px-2 py-1 border rounded"
                  />
                  <button
                    className="text-green-600 text-sm ml-2"
                    onClick={handleRenameTeam}
                  >Guardar</button>
                  <button
                    className="text-gray-500 text-sm ml-2"
                    onClick={() => setRenaming(false)}
                  >Cancelar</button>
                </>
              )}
              <button
                className="text-red-600 underline text-sm ml-4"
                onClick={handleDeleteTeam}
              >Eliminar equipo</button>
            </div>
          </div>
          <ul className="mb-4">
            {members.map(member => {
              const profile = memberProfiles[member.user_id];
              return (
                <li key={member.user_id} className="py-1 flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {profile?.full_name || profile?.email || member.user_id}
                  </span>
                  <span className="text-gray-500 text-xs">{profile?.email && `(${profile.email})`}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${member.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{member.role}</span>
                  <select
                    value={member.role}
                    onChange={e => handleChangeRole(member.user_id, e.target.value)}
                    className="ml-2 px-1 py-0.5 border rounded text-xs"
                  >
                    <option value="member">Miembro</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="Eliminar miembro"
                    onClick={() => handleRemoveMember(member.user_id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Invitar por email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleInviteMember}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Invitar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager; 