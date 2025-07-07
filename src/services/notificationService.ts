import { createClient } from '@/lib/supabase';

export interface Notification {
  id: string;
  team_id: string;
  user_id: string;
  type: 'project' | 'sale' | 'cost' | 'team_member';
  title: string;
  message: string;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationParams {
  team_id: string;
  type: 'project' | 'sale' | 'cost' | 'team_member';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Fetch notifications for the current user
   */
  static async getNotifications(limit = 50, includeRead = false): Promise<Notification[]> {
    const supabase = createClient();
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Only fetch unread notifications by default
    if (!includeRead) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get unread notifications count for the current user
   */
  static async getUnreadCount(): Promise<number> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc('mark_notification_read', { p_notification_id: notificationId });

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }

    // Check if the RPC function returned an error
    if (data && !data.success) {
      throw new Error(data.error || 'Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for the current user
   */
  static async markAllAsRead(): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc('mark_all_notifications_read');

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }

    // Check if the RPC function returned an error
    if (data && !data.success) {
      throw new Error(data.error || 'Failed to mark all notifications as read');
    }
  }

  /**
   * Create a notification for all team members
   */
  static async createTeamNotification(params: CreateNotificationParams): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc('create_team_notification', {
        p_team_id: params.team_id,
        p_type: params.type,
        p_title: params.title,
        p_message: params.message,
        p_metadata: params.metadata || {}
      });

    if (error) {
      console.error('Error creating team notification:', error);
      throw error;
    }

    // Check if the RPC function returned an error
    if (data && !data.success) {
      console.error('Error creating team notification:', data.error);
      throw new Error(data.error || 'Failed to create team notification');
    }
  }

  /**
   * Create notification for new project
   */
  static async notifyNewProject(teamId: string, projectName: string, createdBy: string): Promise<void> {
    await this.createTeamNotification({
      team_id: teamId,
      type: 'project',
      title: 'Nuevo Proyecto Creado',
      message: `Se ha creado un nuevo proyecto "${projectName}".`,
      metadata: {
        project_name: projectName,
        created_by: createdBy
      }
    });
  }

  /**
   * Create notification for new sale
   */
  static async notifyNewSale(teamId: string, saleAmount: number, projectName?: string): Promise<void> {
    await this.createTeamNotification({
      team_id: teamId,
      type: 'sale',
      title: 'Nueva Venta Registrada',
      message: `Se ha registrado una nueva venta de $${saleAmount.toFixed(2)}${projectName ? ` para el proyecto "${projectName}"` : ''}.`,
      metadata: {
        sale_amount: saleAmount,
        project_name: projectName
      }
    });
  }

  /**
   * Create notification for new cost/expense
   */
  static async notifyNewCost(teamId: string, costAmount: number, description: string): Promise<void> {
    await this.createTeamNotification({
      team_id: teamId,
      type: 'cost',
      title: 'Nuevo Costo Registrado',
      message: `Se ha registrado un nuevo costo de $${costAmount.toFixed(2)}: ${description}`,
      metadata: {
        cost_amount: costAmount,
        description: description
      }
    });
  }

  /**
   * Create notification for new team member
   */
  static async notifyNewTeamMember(teamId: string, newMemberName: string, addedBy: string): Promise<void> {
    await this.createTeamNotification({
      team_id: teamId,
      type: 'team_member',
      title: 'Nuevo Miembro del Equipo',
      message: `${newMemberName} ha sido añadido al equipo por ${addedBy}.`,
      metadata: {
        new_member_name: newMemberName,
        added_by: addedBy
      }
    });
  }
} 