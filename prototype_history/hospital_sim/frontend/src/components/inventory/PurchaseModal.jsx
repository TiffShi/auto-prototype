import React, { useState } from 'react'
import { X, ShoppingCart } from 'lucide-react'

const CATEGORIES = ['MEDICINE', 'EQUIPMENT', 'SUPPLIES']

export default function PurchaseModal({ onClose, onPurchase, existingItems }) {
  const [form, setForm] = useState({
    item_name: '',
    category: 'MEDICINE',
    quantity: 10,
    unit_cost: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const existingItem = existingItems?.find(
    (i) => i.item_name.toLowerCase() === form.item_name.toLowerCase()
  )

  const unitCost = existingItem
    ? existingItem.unit_cost
    : parseFloat(form.unit_cost) || 0

  const totalCost = unitCost * parseInt(form.quantity || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.item_name.trim()) {
      setError('Item name is required')
      return
    }
    if (!existingItem && !form.unit_cost) {
      setError('Unit cost is required for new items')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onPurchase({
        item_name: form.item_name,
        category: form.category,
        quantity: parseInt(form.quantity),
        unit_cost: existingItem ? null : parseFloat(form.unit_cost),
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-medical-green" />
            <h2 className="text-lg font-bold text-white">Purchase Supplies</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Item Name</label>
            <input
              className="input"
              placeholder="e.g. Antibiotics"
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
              list="existing-items"
            />
            <datalist id="existing-items">
              {existingItems?.map((i) => (
                <option key={i.id} value={i.item_name} />
              ))}
            </datalist>
            {existingItem && (
              <p className="text-xs text-medical-green mt-1">
                ✓ Existing item — unit cost: ${existingItem.unit_cost}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <select
                className="select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                disabled={!!existingItem}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Quantity</label>
              <input
                type="number"
                className="input"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
          </div>

          {!existingItem && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Unit Cost ($)</label>
              <input
                type="number"
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={form.unit_cost}
                onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
              />
            </div>
          )}

          <div className="bg-navy-700 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Cost</span>
              <span className="text-amber-400 font-mono font-bold">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs bg-red-900/20 border border-red-700/30 rounded-lg p-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Purchasing...' : `Buy ($${totalCost.toLocaleString()})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}