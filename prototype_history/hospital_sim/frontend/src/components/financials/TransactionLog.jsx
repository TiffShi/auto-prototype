import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export default function TransactionLog({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-500 text-sm">
        No transactions yet
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-navy-600">
        <h3 className="card-header mb-0">Transaction History</h3>
      </div>
      <div className="overflow-y-auto max-h-96 scrollbar-thin">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors"
          >
            <div
              className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                t.type === 'REVENUE'
                  ? 'bg-emerald-900/50 text-emerald-400'
                  : 'bg-red-900/50 text-red-400'
              )}
            >
              {t.type === 'REVENUE' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-300 truncate">{t.description}</div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
              </div>
            </div>
            <div
              className={clsx(
                'text-sm font-mono font-semibold shrink-0',
                t.type === 'REVENUE' ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {t.type === 'REVENUE' ? '+' : '-'}${parseFloat(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}