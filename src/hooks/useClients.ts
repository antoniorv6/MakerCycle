import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { getClients, createClient, updateClient, deleteClient, type Client, type ClientFormData } from '@/services/clientService';

export { type Client, type ClientFormData } from '@/services/clientService';

export function useClients() {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar clientes desde Supabase
  useEffect(() => {
    if (user) {
      const loadClients = async () => {
        try {
          setLoading(true);
          const data = await getClients(user.id, currentTeam?.id);
          setClients(data);
        } catch (error) {
          console.error('Error loading clients:', error);
          setClients([]);
        } finally {
          setLoading(false);
        }
      };

      loadClients();
    } else {
      setLoading(false);
    }
  }, [user, currentTeam?.id]);

  // Crear nuevo cliente
  const addClient = async (data: ClientFormData): Promise<Client> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Incluir teamId en los datos del cliente
      const clientData = {
        ...data,
        teamId: currentTeam?.id || null
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

  return {
    clients,
    loading,
    addClient,
    updateClient: updateClientById,
    deleteClient: removeClient,
    getClientById
  };
} 