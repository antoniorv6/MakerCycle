import { createClient } from '@/lib/supabase';
import type { KanbanCard, KanbanStatus } from '@/types';

export class KanbanBoardService {
  private supabase = createClient();

  async getKanbanCards(userId: string, teamId?: string | null): Promise<KanbanCard[]> {
    let query = this.supabase
      .from('kanban_board')
      .select('*, project:projects(*)')
      .order('created_at', { ascending: true });

    if (teamId) {
      query = query.eq('team_id', teamId);
    } else {
      query = query.eq('user_id', userId).is('team_id', null);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Error fetching kanban cards: ${error.message}`);
    }
    return data || [];
  }

  async addKanbanCard(userId: string, projectId: string, status: KanbanStatus = 'pending', teamId?: string | null): Promise<KanbanCard> {
    const { data, error } = await this.supabase
      .from('kanban_board')
      .insert([
        {
          user_id: userId,
          project_id: projectId,
          status,
          team_id: teamId || null,
        },
      ])
      .select()
      .single();
    if (error) {
      throw new Error(`Error adding kanban card: ${error.message}`);
    }
    return data;
  }

  async updateKanbanCardStatus(cardId: string, status: KanbanStatus): Promise<KanbanCard> {
    const { data, error } = await this.supabase
      .from('kanban_board')
      .update({ status })
      .eq('id', cardId)
      .select()
      .single();
    if (error) {
      throw new Error(`Error updating kanban card status: ${error.message}`);
    }
    return data;
  }

  async deleteKanbanCard(cardId: string): Promise<void> {
    const { error } = await this.supabase
      .from('kanban_board')
      .delete()
      .eq('id', cardId);
    if (error) {
      throw new Error(`Error deleting kanban card: ${error.message}`);
    }
  }
}

export const kanbanBoardService = new KanbanBoardService(); 