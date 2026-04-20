import React from 'react'
import EventAlert from './EventAlert'
import { Bell } from 'lucide-react'

export default function EventFeed({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-500">
        <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No events yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin pr-1">
      {events.map((event) => (
        <EventAlert key={event.id} event={event} />
      ))}
    </div>
  )
}