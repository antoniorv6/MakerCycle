'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import type { Team } from '@/types';

interface TeamContextType {
  currentTeam: Team | null;
  userTeams: Team[];
  setCurrentTeam: (team: Team | null) => void;
  refreshTeams: () => Promise<void>;
  loading: boolean;
  // Editing mode support
  editingTeam: Team | null;
  setEditingTeam: (team: Team | null) => void;
  isEditingMode: boolean;
  setIsEditingMode: (editing: boolean) => void;
  // Get the effective team (current or editing)
  getEffectiveTeam: () => Team | null;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

interface TeamProviderProps {
  children: ReactNode;
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  const fetchUserTeams = async () => {
    if (!user) {
      setUserTeams([]);
      setCurrentTeam(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, teams(*)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching teams:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return;
      }

      const teams = data?.map((tm: any) => tm.teams) || [];
      setUserTeams(teams);

      // If no team is currently selected and user has teams, select the first one
      if (!currentTeam && teams.length > 0) {
        setCurrentTeam(teams[0]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTeams();
  }, [user]);

  const refreshTeams = async () => {
    await fetchUserTeams();
  };

  // Get the effective team (current team or editing team if in editing mode)
  const getEffectiveTeam = () => {
    if (isEditingMode && editingTeam) {
      return editingTeam;
    }
    return currentTeam;
  };

  const value: TeamContextType = {
    currentTeam,
    userTeams,
    setCurrentTeam,
    refreshTeams,
    loading,
    editingTeam,
    setEditingTeam,
    isEditingMode,
    setIsEditingMode,
    getEffectiveTeam
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
} 