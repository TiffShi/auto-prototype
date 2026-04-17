import React from 'react';

export default function StatusBadge({ isResolved }) {
  return (
    <span className={`status-badge ${isResolved ? 'badge-resolved' : 'badge-unresolved'}`}>
      {isResolved ? '✅ Resolved' : '❌ Unresolved'}
    </span>
  );
}