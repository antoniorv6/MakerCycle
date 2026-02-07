import { createClient } from '@/lib/supabase';
import type { KanbanCard, KanbanCardTodo, KanbanCardTodoInput, KanbanPriority, KanbanStatus } from '@/types';

export class KanbanBoardService {
  private supabase = createClient();

  async getKanbanCards(userId: string, teamId?: string | null): Promise<KanbanCard[]> {
    let query = this.supabase
      .from('kanban_board')
      .select('*, project:projects(*), todos:kanban_card_todos(*)')
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

  async addKanbanCard(
    userId: string,
    projectId: string,
    status: KanbanStatus = 'pending',
    teamId?: string | null,
    priority: KanbanPriority = 'medium',
    deadline: string | null = null
  ): Promise<KanbanCard> {
    const { data, error } = await this.supabase
      .from('kanban_board')
      .insert([
        {
          user_id: userId,
          project_id: projectId,
          status,
          team_id: teamId || null,
          priority,
          deadline,
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

  async updateKanbanCard(
    cardId: string,
    updates: Partial<Pick<KanbanCard, 'status' | 'priority' | 'deadline'>>
  ): Promise<KanbanCard> {
    const { data, error } = await this.supabase
      .from('kanban_board')
      .update(updates)
      .eq('id', cardId)
      .select('*, project:projects(*), todos:kanban_card_todos(*)')
      .single();
    if (error) {
      throw new Error(`Error updating kanban card: ${error.message}`);
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

  // --- TODO methods ---

  async addTodos(kanbanCardId: string, todos: KanbanCardTodoInput[]): Promise<KanbanCardTodo[]> {
    if (todos.length === 0) return [];
    const rows = todos.map(t => ({
      kanban_card_id: kanbanCardId,
      phase: t.phase,
      title: t.title,
      sort_order: t.sort_order,
    }));
    const { data, error } = await this.supabase
      .from('kanban_card_todos')
      .insert(rows)
      .select();
    if (error) {
      throw new Error(`Error adding todos: ${error.message}`);
    }
    return data || [];
  }

  async toggleTodo(todoId: string, isCompleted: boolean): Promise<KanbanCardTodo> {
    const { data, error } = await this.supabase
      .from('kanban_card_todos')
      .update({ is_completed: isCompleted })
      .eq('id', todoId)
      .select()
      .single();
    if (error) {
      throw new Error(`Error toggling todo: ${error.message}`);
    }
    return data;
  }

  async deleteTodo(todoId: string): Promise<void> {
    const { error } = await this.supabase
      .from('kanban_card_todos')
      .delete()
      .eq('id', todoId);
    if (error) {
      throw new Error(`Error deleting todo: ${error.message}`);
    }
  }

  async updateTodos(kanbanCardId: string, todos: KanbanCardTodoInput[]): Promise<KanbanCardTodo[]> {
    // Delete existing todos then re-insert (simpler than diffing, handles reorders)
    const { error: delError } = await this.supabase
      .from('kanban_card_todos')
      .delete()
      .eq('kanban_card_id', kanbanCardId);
    if (delError) {
      throw new Error(`Error clearing todos: ${delError.message}`);
    }
    return this.addTodos(kanbanCardId, todos);
  }
}

export const kanbanBoardService = new KanbanBoardService();
