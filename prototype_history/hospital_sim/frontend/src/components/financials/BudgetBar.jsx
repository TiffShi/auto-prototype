import React from 'react'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import clsx from 'clsx'

export default function BudgetBar({ budget, totalRevenue, totalExpenses }) {
  const netProfit = totalRevenue - totalExpenses
  const isProfit = netProfit >= 0

  const budgetColor =
    budget < 10000
      ? 'text-red-400'
      : budget < 50000
      ? 'text-amber-400'
      : 'text-medical-green'

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card border border-medical-green/20 glow-green">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-medical-green/10 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-medical-green" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Current Budget</div>
            <div className={clsx('text-2xl font-bold font-mono', budgetColor)}>
              ${budget.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      <div className="card border border-medical-blue/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-medical-blue/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-medical-blue" />
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Revenue</div>
            <div className="text-2xl font-bold font-mono text-medical-blue">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      <div className={clsx('card border', isProfit ? 'border-emerald-500/20' : 'border-red-500/20')}>
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', isProfit ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
            {isProfit ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Net P&L</div>
            <div className={clsx('text-2xl font-bold font-mono', isProfit ? 'text-emerald-400' : 'text-red-400')}>
              {isProfit ? '+' : ''}${netProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}