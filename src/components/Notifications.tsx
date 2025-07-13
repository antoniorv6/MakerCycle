'use client';

import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/services/notificationService';

interface NotificationsProps {
  className?: string;
}

export function Notifications({ className = '' }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
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
    toggleShowAll 
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      await deleteNotification(notificationId);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
      await deleteAllNotifications();
    }
  };

  const handleDeleteReadNotifications = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones leídas?')) {
      await deleteReadNotifications();
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'project':
        return '📁';
      case 'sale':
        return '💰';
      case 'cost':
        return '💸';
      case 'team_member':
        return '👥';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ahora mismo';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) {
      return `Hace ${Math.floor(diffInHours / 24)}d`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label="Notificaciones"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Notificaciones</h3>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar notificaciones"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions Bar */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleShowAll}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    showAll 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {showAll ? 'Solo no leídas' : 'Ver todas'}
                </button>
                {unreadCount > 0 && !showAll && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Marcar como leídas
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showAll && (
                  <button
                    onClick={handleDeleteReadNotifications}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Eliminar leídas
                  </button>
                )}
                <button
                  onClick={handleDeleteAllNotifications}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Eliminar todas
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando notificaciones...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">🔔</div>
                <p className="text-gray-500 font-medium">
                  {showAll ? 'No hay notificaciones' : 'No hay notificaciones nuevas'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {showAll ? 'Las notificaciones aparecerán aquí cuando las recibas' : 'Todas las notificaciones están leídas'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                      !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className={`text-base font-semibold ${
                                notification.is_read ? 'text-gray-600' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </p>
                              {!notification.is_read && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Nuevo
                                </span>
                              )}
                            </div>
                            <p className={`text-sm leading-relaxed ${
                              notification.is_read ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="text-xs text-gray-400">
                                {formatDate(notification.created_at)}
                              </span>
                              {notification.is_read ? (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <CheckCheck className="w-3 h-3" />
                                  <span>Leída</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-xs text-blue-500">
                                  <Check className="w-3 h-3" />
                                  <span>Sin leer</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar notificación"
                            aria-label="Eliminar notificación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''}
                  {unreadCount > 0 && ` • ${unreadCount} sin leer`}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 