import React, { useEffect, useState, useCallback } from 'react'
import { DollarSign, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import BudgetBar from '../components/financials/BudgetBar'
import TransactionLog from '../components/financials/TransactionLog'
import RevenueChart from '../components/dashboard/RevenueChart'
import { useHospitalStore } from '../store/hospitalStore'
import { getFinancials } from '../api/hospitalApi'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS = ['#00d4aa', '#ef4444', '#0ea5e9', '#f59e0b', '#8b5cf6']

export default function FinancialsPage() {
  const hospitalId = useHospitalStore((s) => s.hospitalId)
  const [financials, setFinancials] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadFinancials = useCallback(async () => {
    if (!hospitalId) return
    setLoading(true)
    try {
      const data = await getFinancials(hospitalId, 100)
      setFinancials(data)
    } catch (e) {
      console.error('Failed to load financials', e)
    } finally {
      setLoading(false)
    }
  }, [hospitalId])

  useEffect(() => {
    loadFinancials()
    const interval = setInterval(loadFinancials, 10000)
    return () => clearInterval(interval)
  }, [loadFinancials])

  // Build expense breakdown from transactions
  const expenseBreakdown = React.useMemo(() => {
    if (!financials?.transactions) return []
    const expenses = financials.transactions.filter((t) => t.type === 'EXPENSE')
    const grouped = {}
    expenses.forEach((t) => {
      const key = t.description.split(':')[0].trim()
      grouped[key] = (grouped[key] || 0) + parseFloat(t.amount)
    })
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [financials])

  const budget = financials?.budget ?? 0
  const totalRevenue = financials?.total_revenue ?? 0
  const totalExpenses = financials?.total_expenses ?? 0
  const netProfit = financials?.net_profit ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-medical-green" />
            Financials
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Budget tracking and transaction history</p>
        </div>
        <button onClick={loadFinancials} disabled={loading} className="btn-secondary">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Budget overview */}
      <BudgetBar
        budget={budget}
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <RevenueChart transactions={financials?.transactions ?? []} />

        {/* Expense breakdown pie */}
        <div className="card">
          <div className="card-header">Expense Breakdown</div>
          {expenseBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0d1526',
                    border: '1px solid #162040',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#9ca3af', fontSize: '11px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              No expense data yet
            </div>
          )}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card border border-navy-600 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Revenue</div>
          <div className="text-xl font-bold text-medical-green font-mono">
            ${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="card border border-navy-600 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Expenses</div>
          <div className="text-xl font-bold text-red-400 font-mono">
            ${totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="card border border-navy-600 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Net P&L</div>
          <div className={`text-xl font-bold font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="card border border-navy-600 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Transactions</div>
          <div className="text-xl font-bold text-white">
            {financials?.transactions?.length ?? 0}
          </div>
        </div>
      </div>

      {/* Transaction log */}
      <TransactionLog transactions={financials?.transactions ?? []} />
    </div>
  )
}