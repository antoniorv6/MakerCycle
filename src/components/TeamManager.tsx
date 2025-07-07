"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import type { Team, TeamMember } from '@/types';
import { Plus, X, Users, User, ChevronDown, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemberProfile {
  id: string;
  full_name: string | null;
  email: string;
}

const TeamManager: React.FC = () => {
  const { user } = useAuth();
  const { currentTeam, userTeams, setCurrentTeam, loading, isEditingMode, editingTeam, getEffectiveTeam } = useTeam();
  const supabase = createClient();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, MemberProfile>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [showTeamSwitcher, setShowTeamSwitcher] = useState(false);
  const teamSwitcherRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetchTeams();
  }, [user]);

  // Handle click outside to close team switcher
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamSwitcherRef.current && !teamSwitcherRef.current.contains(event.target as Node)) {
        setShowTeamSwitcher(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowTeamSwitcher(false);
      }
    };

    if (showTeamSwitcher) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showTeamSwitcher]);

  const fetchTeams = async () => {
    if (!user) return;
    setLoadingTeams(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, teams(*)')
      .eq('user_id', user.id);
    if (!error && data) {
      setTeams(data.map((tm: any) => tm.teams));
    }
    setLoadingTeams(false);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !user) return;
    setLoadingTeams(true);
    
    try {
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{ name: teamName, created_by: user.id }])
        .select()
        .single();
      
      if (teamError) {
        console.error('Error creating team:', teamError);
        return;
      }

      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{ 
          team_id: teamData.id, 
          user_id: user.id, 
          role: 'admin' 
        }]);

      if (memberError) {
        console.error('Error adding team member:', memberError);
        return;
      }

      setTeams([...teams, teamData]);
      setTeamName('');
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setLoadingTeams(false);
    }
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

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;
    
    // First, find the user by email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteEmail)
      .single();
    
    if (userError || !userData) {
      alert('Usuario no encontrado. Asegúrate de que el email esté registrado.');
      return;
    }

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{ 
        team_id: selectedTeam.id, 
        user_id: userData.id, 
        role: 'member' 
      }]);

    if (memberError) {
      console.error('Error inviting member:', memberError);
      alert('Error al invitar miembro.');
      return;
    }

    setInviteEmail('');
    handleSelectTeam(selectedTeam); // Refresh members
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!selectedTeam) return;
    const { error } = await supabase
      .from('team_members')
      .update({ role: newRole as 'admin' | 'member' | 'owner' })
      .eq('team_id', selectedTeam.id)
      .eq('user_id', userId);
    if (!error) {
      setMembers(members.map(m => m.user_id === userId ? { ...m, role: newRole as 'admin' | 'member' | 'owner' } : m));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    if (!window.confirm('¿Seguro que quieres eliminar este miembro?')) return;
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', selectedTeam.id)
      .eq('user_id', userId);
    if (!error) {
      setMembers(members.filter(m => m.user_id !== userId));
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

  const handleTeamSwitch = (team: Team | null) => {
    setCurrentTeam(team);
    setShowTeamSwitcher(false);
  };

  const effectiveTeam = getEffectiveTeam();
  const isInEditingMode = isEditingMode && editingTeam !== null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Equipos</h2>
        <p className="text-gray-600">Administra tus equipos y colaboradores</p>
      </div>

      {/* Team Context Switcher */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Contexto Actual</h3>
            <p className="text-sm text-gray-600">
              {isInEditingMode 
                ? `Editando proyecto del equipo: ${editingTeam?.name}`
                : effectiveTeam 
                  ? `Trabajando en equipo: ${effectiveTeam.name}`
                  : 'Vista personal - Tus proyectos privados'
              }
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowTeamSwitcher(!showTeamSwitcher)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 border ${
                isInEditingMode
                  ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                  : effectiveTeam 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isInEditingMode ? (
                <>
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium truncate max-w-32">
                    Editando: {editingTeam?.name}
                  </span>
                </>
              ) : effectiveTeam ? (
                <>
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium truncate max-w-32">
                    {effectiveTeam.name}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Personal</span>
                </>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showTeamSwitcher && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                  style={{
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto'
                  }}
                  ref={teamSwitcherRef}
                >
                  <div className="p-3">
                    {isInEditingMode && (
                      <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Edit className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-medium text-orange-700">
                            Modo de edición activo
                          </span>
                        </div>
                        <div className="text-xs text-orange-600 mt-1">
                          Editando proyecto del equipo: {editingTeam?.name}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">CONTEXTO ACTUAL</div>
                    
                    {/* Personal View Option */}
                    <button
                      onClick={() => handleTeamSwitch(null)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        !effectiveTeam
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium">Vista Personal</div>
                        <div className="text-xs text-gray-500">Tus proyectos y datos privados</div>
                      </div>
                    </button>

                    {/* Team Options */}
                    {userTeams.length > 0 && (
                      <>
                        <div className="text-xs font-medium text-gray-500 mt-3 mb-2 px-2">EQUIPOS</div>
                        {userTeams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => handleTeamSwitch(team)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                              effectiveTeam?.id === team.id
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                            <div>
                              <div className="text-sm font-medium">{team.name}</div>
                              <div className="text-xs text-gray-500">Datos compartidos del equipo</div>
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Create Team Option */}
                    {userTeams.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100 mt-2 pt-2">
                        No tienes equipos. Crea uno abajo.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Create New Team */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crear Nuevo Equipo</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleCreateTeam}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            disabled={loadingTeams}
          >
            <Plus className="w-4 h-4 mr-1" /> Crear equipo
          </button>
        </div>
      </div>

      {/* Team List */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tus Equipos</h3>
          <div className="space-y-2">
            {teams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{team.name}</span>
                <button
                  className="text-primary-600 hover:text-primary-700 underline text-sm"
                  onClick={() => handleSelectTeam(team)}
                >
                  Gestionar
                </button>
              </div>
            ))}
            {teams.length === 0 && (
              <p className="text-gray-500 text-sm">No tienes equipos creados.</p>
            )}
          </div>
        </div>

        {/* Team Details */}
        {selectedTeam && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Miembros de {selectedTeam.name}</h3>
              <div className="flex gap-2">
                {!renaming ? (
                  <button
                    className="text-blue-600 hover:text-blue-700 underline text-sm"
                    onClick={() => { setRenaming(true); setNewTeamName(selectedTeam.name); }}
                  >
                    Renombrar
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={e => setNewTeamName(e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <button
                      className="text-green-600 text-sm"
                      onClick={handleRenameTeam}
                    >
                      Guardar
                    </button>
                    <button
                      className="text-gray-500 text-sm"
                      onClick={() => setRenaming(false)}
                    >
                      Cancelar
                    </button>
                  </>
                )}
                <button
                  className="text-red-600 hover:text-red-700 underline text-sm"
                  onClick={handleDeleteTeam}
                >
                  Eliminar
                </button>
              </div>
            </div>
            
            {/* Invite Member */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Invitar Miembro</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email del miembro"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleInviteMember}
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors duration-200"
                >
                  Invitar
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.map(member => {
                const profile = memberProfiles[member.user_id];
                return (
                  <div key={member.user_id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {profile?.full_name || profile?.email || member.user_id}
                      </span>
                      <span className="text-gray-500 text-xs">{profile?.email && `(${profile.email})`}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        member.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={e => handleChangeRole(member.user_id, e.target.value)}
                        className="px-2 py-1 border rounded text-xs"
                      >
                        <option value="member">Miembro</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar miembro"
                        onClick={() => handleRemoveMember(member.user_id)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManager; 