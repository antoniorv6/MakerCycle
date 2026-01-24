import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { getClients, createClient, updateClient, deleteClient, type Client, type ClientFormData } from '@/services/clientService';

export { type Client, type ClientFormData } from '@/services/clientService';

export function useClients() {
  const { user } = useAuth();
  const { currentTeam, isEditingMode, editingTeam } = useTeam();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calcular el equipo efectivo directamente
  const effectiveTeamId = isEditingMode && editingTeam ? editingTeam.id : currentTeam?.id;
  
  // Usar ref para evitar llamadas duplicadas
  // Usamos un símbolo especial para indicar "nunca fetched" vs "fetched con undefined/null"
  const NEVER_FETCHED = useRef(Symbol('NEVER_FETCHED'));
  const lastFetchedTeamId = useRef<string | null | undefined | symbol>(NEVER_FETCHED.current);

  const loadClients = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Evitar refetch si el equipo no ha cambiado (y ya se hizo un fetch)
    if (lastFetchedTeamId.current !== NEVER_FETCHED.current && lastFetchedTeamId.current === effectiveTeamId) {
      return;
    }
    
    try {
      setLoading(true);
      const data = await getClients(user.id, effectiveTeamId);
      setClients(data);
      lastFetchedTeamId.current = effectiveTeamId;
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [user, effectiveTeamId]);

  // Cargar clientes desde Supabase
  useEffect(() => {
    if (user) {
      // Reset lastFetchedTeamId cuando cambia el equipo para forzar refetch
      if (lastFetchedTeamId.current !== NEVER_FETCHED.current && lastFetchedTeamId.current !== effectiveTeamId) {
        lastFetchedTeamId.current = NEVER_FETCHED.current;
      }
      loadClients();
    } else {
      setLoading(false);
    }
  }, [user, effectiveTeamId, loadClients]);

  // Crear nuevo cliente
  const addClient = async (data: ClientFormData): Promise<Client> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Incluir teamId en los datos del cliente usando el equipo efectivo
      const clientData = {
        ...data,
        teamId: effectiveTeamId || null
      };
      
      const newClient = await createClient(user.id, clientData);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  // Actualizar cliente
  const updateClientById = async (clientId: string, data: Partial<ClientFormData>): Promise<Client> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const updatedClient = await updateClient(clientId, data);
      setClients(prev => prev.map(client => 
        client.id === clientId ? updatedClient : client
      ));
      return updatedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  // Eliminar cliente
  const removeClient = async (clientId: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      await deleteClient(clientId);
      setClients(prev => prev.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  // Obtener cliente por ID
  const getClientById = (clientId: string): Client | undefined => {
    return clients.find(client => client.id === clientId);
  };

  // Función de refetch que fuerza la actualización
  const refetch = useCallback(async () => {
    lastFetchedTeamId.current = NEVER_FETCHED.current;
    await loadClients();
  }, [loadClients]);

  return {
    clients,
    loading,
    addClient,
    updateClient: updateClientById,
    deleteClient: removeClient,
    getClientById,
    refetch
  };
} 