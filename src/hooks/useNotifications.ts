import { useState, useEffect, useCallback } from 'react';
import { NotificationService, Notification } from '@/services/notificationService';
import { useTeam } from '@/components/providers/TeamProvider';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { currentTeam } = useTeam();

  const fetchNotifications = useCallback(async (includeRead = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await NotificationService.getNotifications(50, includeRead, currentTeam?.id);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [currentTeam]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await NotificationService.getUnreadCount(currentTeam?.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [currentTeam]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);
      await NotificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
      console.error('Error in markAllAsRead:', err);
      setError(errorMessage);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, [notifications]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      await NotificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete all notifications');
    }
  }, []);

  const deleteReadNotifications = useCallback(async () => {
    try {
      await NotificationService.deleteReadNotifications();
      setNotifications(prev => prev.filter(notification => !notification.is_read));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete read notifications');
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await Promise.all([fetchNotifications(showAll), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount, showAll]);

  const toggleShowAll = useCallback(async () => {
    setShowAll(!showAll);
    await fetchNotifications(!showAll);
  }, [showAll, fetchNotifications]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    showAll,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    deleteReadNotifications,
    refreshNotifications,
    toggleShowAll
  };
} 