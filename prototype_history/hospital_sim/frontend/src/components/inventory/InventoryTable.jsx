import React from 'react'
import { AlertTriangle, Package } from 'lucide-react'
import clsx from 'clsx'

const CATEGORY_COLORS = {
  MEDICINE: 'text-medical-green',
  EQUIPMENT: 'text-medical-blue',
  SUPPLIES: 'text-amber-400',
}

export default function InventoryTable({ items }) {
  if (items.length === 0) {
    return (
      <div className="card text-center py-12 text-gray-500">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No inventory items</p>
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-navy-700/50 border-b border-navy-600">
            <tr>
              <th className="table-header">Item</th>
              <th className="table-header">Category</th>
              <th className="table-header">Quantity</th>
              <th className="table-header">Threshold</th>
              <th className="table-header">Unit Cost</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={clsx('table-row', item.is_low_stock && 'bg-red-900/10')}>
                <td className="table-cell">
                  <div className="font-medium text-white text-sm">{item.item_name}</div>
                </td>
                <td className="table-cell">
                  <span className={clsx('text-xs font-semibold', CATEGORY_COLORS[item.category])}>
                    {item.category}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-20">
                      <div
                        className={clsx(
                          'progress-fill',
                          item.quantity <= item.reorder_threshold
                            ? 'bg-red-500'
                            : item.quantity <= item.reorder_threshold * 2
                            ? 'bg-amber-500'
                            : 'bg-medical-green'
                        )}
                        style={{
                          width: `${Math.min(100, (item.quantity / (item.reorder_threshold * 5)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-white font-mono">{item.quantity}</span>
                  </div>
                </td>
                <td className="table-cell text-sm text-gray-400">{item.reorder_threshold}</td>
                <td className="table-cell text-sm text-gray-300 font-mono">
                  ${item.unit_cost.toLocaleString()}
                </td>
                <td className="table-cell">
                  {item.is_low_stock ? (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock
                    </span>
                  ) : (
                    <span className="text-xs text-medical-green">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}