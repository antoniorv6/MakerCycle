"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import type { Team, TeamMember } from '@/types';
import { Plus, X, Users, User, ChevronDown, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

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

  const handleCreateMissingProfiles = async () => {
    try {
      const { data, error } = await supabase
        .rpc('create_missing_profiles');
      
      if (error) {
        console.error('Error creating missing profiles:', error);
        toast.error('No se pudieron crear los perfiles. Por favor, inténtalo de nuevo.');
        return;
      }
      
      toast.success('Perfiles creados correctamente.');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Ha ocurrido un error al crear los perfiles.');
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;
    
    try {
      const searchEmail = inviteEmail.trim();
      
      // Try exact match first
      let { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', searchEmail)
        .maybeSingle();
      
      // If no exact match, try case-insensitive
      if (!userData && !userError) {
        const { data: userDataCI, error: userErrorCI } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .ilike('email', searchEmail)
          .maybeSingle();
        
        if (userDataCI) {
          userData = userDataCI;
        }
      }
      
      if (userError) {
        console.error('Error searching for user:', userError);
        toast.error('No se pudo encontrar el usuario. Intenta de nuevo.');
        return;
      }
      
      if (!userData) {
        // Let's also try a broader search to see what's in the database
        const { data: similarProfiles, error: similarError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .or(`email.ilike.%${searchEmail.split('@')[0]}%,email.ilike.%${searchEmail.split('@')[1]}%`)
          .limit(5);
        
        let errorMessage = `Usuario no encontrado con el email: ${searchEmail}\n\n`;
        errorMessage += 'Asegúrate de que:\n';
        errorMessage += '- El email esté correctamente escrito\n';
        errorMessage += '- El usuario esté registrado en la aplicación\n';
        errorMessage += '- El email coincida exactamente con el registrado\n\n';
        
        if (similarProfiles && similarProfiles.length > 0) {
          errorMessage += 'Emails similares encontrados:\n';
          similarProfiles.forEach(profile => {
            errorMessage += `- ${profile.email}\n`;
          });
        }
        
        toast.error(errorMessage);
        return;
      }

      // Check if user is already a member of this team
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('team_members')
        .select('team_id, user_id')
        .eq('team_id', selectedTeam.id)
        .eq('user_id', userData.id)
        .maybeSingle();

      if (memberCheckError) {
        console.error('Error checking existing membership:', memberCheckError);
        toast.error('No se pudo verificar la membresía. Intenta de nuevo.');
        return;
      }

      if (existingMember) {
        toast('El usuario ya forma parte de este equipo.');
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
        toast.error('No se pudo invitar al miembro. Intenta de nuevo.');
        return;
      }

      setInviteEmail('');
      handleSelectTeam(selectedTeam); // Refresh members
      toast.success('Usuario invitado correctamente al equipo.');
    } catch (error) {
      console.error('Unexpected error during invitation:', error);
      toast.error('Ha ocurrido un error al invitar al miembro.');
    }
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
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <Users className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Equipos</h1>
        <p className="text-slate-600">Administra tus equipos y colaboradores</p>
      </div>

      {/* Team Context Switcher */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Contexto Actual</h3>
              <p className="text-sm text-slate-600">
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
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  : effectiveTeam 
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
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
                  className="absolute top-full right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-50"
                  style={{
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto'
                  }}
                  ref={teamSwitcherRef}
                >
                  <div className="p-3">
                    {isInEditingMode && (
                                        <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Edit className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">
                        Modo de edición activo
                      </span>
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      Editando proyecto del equipo: {editingTeam?.name}
                    </div>
                  </div>
                    )}
                    
                    <div className="text-xs font-medium text-slate-500 mb-2 px-2">CONTEXTO ACTUAL</div>
                    
                    {/* Personal View Option */}
                    <button
                      onClick={() => handleTeamSwitch(null)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        !effectiveTeam
                          ? 'bg-slate-50 text-slate-700 border border-slate-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium">Vista Personal</div>
                        <div className="text-xs text-slate-500">Tus proyectos y datos privados</div>
                      </div>
                    </button>

                    {/* Team Options */}
                    {userTeams.length > 0 && (
                      <>
                        <div className="text-xs font-medium text-slate-500 mt-3 mb-2 px-2">EQUIPOS</div>
                        {userTeams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => handleTeamSwitch(team)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                              effectiveTeam?.id === team.id
                                ? 'bg-slate-50 text-slate-700 border border-slate-200'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                            <div>
                              <div className="text-sm font-medium">{team.name}</div>
                              <div className="text-xs text-slate-500">Datos compartidos del equipo</div>
                            </div>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Create Team Option */}
                    {userTeams.length === 0 && (
                      <div className="px-3 py-2 text-xs text-slate-500 border-t border-slate-100 mt-2 pt-2">
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Crear Nuevo Equipo</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre del equipo"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
          <button
            onClick={handleCreateTeam}
            className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200"
            disabled={loadingTeams}
          >
            <Plus className="w-4 h-4 mr-1" /> Crear equipo
          </button>
        </div>
      </div>

      {/* Admin Tools */}
      <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Herramientas de Administración</h3>
        <p className="text-sm text-amber-700 mb-4">
          Si tienes problemas invitando usuarios que están registrados, puede que no tengan perfiles creados.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCreateMissingProfiles}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
          >
            Crear Perfiles Faltantes
          </button>
        </div>
      </div>

      {/* Team List */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tus Equipos</h3>
          <div className="space-y-2">
            {teams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-900">{team.name}</span>
                <button
                  className="text-slate-600 hover:text-slate-700 underline text-sm"
                  onClick={() => handleSelectTeam(team)}
                >
                  Gestionar
                </button>
              </div>
            ))}
            {teams.length === 0 && (
              <p className="text-slate-500 text-sm">No tienes equipos creados.</p>
            )}
          </div>
        </div>

        {/* Team Details */}
        {selectedTeam && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Miembros de {selectedTeam.name}</h3>
              <div className="flex gap-2">
                {!renaming ? (
                  <button
                    className="text-slate-600 hover:text-slate-700 underline text-sm"
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
                      className="text-emerald-600 text-sm"
                      onClick={handleRenameTeam}
                    >
                      Guardar
                    </button>
                    <button
                      className="text-slate-500 text-sm"
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
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Invitar Miembro</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email del miembro"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
                <button
                  onClick={handleInviteMember}
                  className="px-3 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors duration-200"
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
                  <div key={member.user_id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {profile?.full_name || profile?.email || member.user_id}
                      </span>
                      <span className="text-slate-500 text-xs">{profile?.email && `(${profile.email})`}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        member.role === 'admin' ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-700'
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