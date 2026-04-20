import React from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useNotificationStore } from '../../store/notificationStore'
import NotificationToast from '../events/NotificationToast'

export default function Layout({ children }) {
  const notifications = useNotificationStore((s) => s.notifications)
  const removeNotification = useNotificationStore((s) => s.removeNotification)

  return (
    <div className="flex h-screen overflow-hidden bg-navy-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {children}
        </main>
      </div>

      {/* Notification toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {notifications.map((n) => (
          <NotificationToast
            key={n.id}
            notification={n}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>
    </div>
  )
}