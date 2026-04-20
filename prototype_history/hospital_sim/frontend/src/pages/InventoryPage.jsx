import React, { useEffect, useState, useCallback } from 'react'
import { Package, RefreshCw, ShoppingCart, AlertTriangle } from 'lucide-react'
import InventoryTable from '../components/inventory/InventoryTable'
import PurchaseModal from '../components/inventory/PurchaseModal'
import { useHospitalStore } from '../store/hospitalStore'
import { getInventory, purchaseInventory } from '../api/inventoryApi'
import { useNotificationStore } from '../store/notificationStore'

export default function InventoryPage() {
  const hospitalId = useHospitalStore((s) => s.hospitalId)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const loadInventory = useCallback(async () => {
    if (!hospitalId) return
    setLoading(true)
    try {
      const data = await getInventory(hospitalId)
      setInventory(data)
    } catch (e) {
      console.error('Failed to load inventory', e)
    } finally {
      setLoading(false)
    }
  }, [hospitalId])

  useEffect(() => {
    loadInventory()
    const interval = setInterval(loadInventory, 10000)
    return () => clearInterval(interval)
  }, [loadInventory])

  const handlePurchase = async (data) => {
    const item = await purchaseInventory(hospitalId, data)
    addNotification(`Purchased ${data.quantity}x ${data.item_name}`, 'success')
    await loadInventory()
  }

  const lowStockItems = inventory.filter((i) => i.is_low_stock)
  const totalValue = inventory.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            Inventory
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {inventory.length} items • Total value: ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadInventory} disabled={loading} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowPurchaseModal(true)} className="btn-primary">
            <ShoppingCart className="w-4 h-4" />
            Purchase Supplies
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="card border border-red-700/30 bg-red-900/10">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {lowStockItems.length} item(s) below reorder threshold
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span
                key={item.id}
                className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded-full border border-red-700/30"
              >
                {item.item_name}: {item.quantity} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category summary */}
      <div className="grid grid-cols-3 gap-4">
        {['MEDICINE', 'EQUIPMENT', 'SUPPLIES'].map((cat) => {
          const items = inventory.filter((i) => i.category === cat)
          const lowCount = items.filter((i) => i.is_low_stock).length
          return (
            <div key={cat} className="card border border-navy-600">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{cat}</div>
              <div className="text-xl font-bold text-white">{items.length} items</div>
              {lowCount > 0 && (
                <div className="text-xs text-red-400 mt-1">{lowCount} low stock</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Inventory table */}
      {loading && inventory.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading inventory...</div>
      ) : (
        <InventoryTable items={inventory} />
      )}

      {/* Purchase modal */}
      {showPurchaseModal && (
        <PurchaseModal
          onClose={() => setShowPurchaseModal(false)}
          onPurchase={handlePurchase}
          existingItems={inventory}
        />
      )}
    </div>
  )
}