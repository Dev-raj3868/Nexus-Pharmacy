import React, { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface InventoryItem {
    id: string;
    item_id: string;
    item_name: string;
    category: string;
    unit: string;
    stock: number;
    batch_no: string;
    min_stock: number;
    rack: string | null;
    product_type: string | null;
    price: number | null;
    gst: string | null;
}

// Type definitions for window.context
declare global {
    interface Window {
        context: {
            [x: string]: any;
            getInventory: (filters?: { name?: string; category?: string }) => Promise<InventoryItem[]>;
            createDistributor: (data: any) => Promise<string>;
            writeDistributor: (id: string, data: string) => Promise<void>;
            
        };
    }
}

const InventorySearch: React.FC = () => {
    const [itemName, setItemName] = useState('')
    const [category, setCategory] = useState('')
    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleSearch = async () => {
        setLoading(true)
        try {
            const data = await window.context.getInventory({
                name: itemName || undefined,
                category: category || undefined,
            })
            setItems(data)
            navigate('/inventory/lists', { state: { items: data } })
        } catch (error) {
            console.error('Failed to search inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleGetAll = async () => {
        setLoading(true)
        try {
            const data = await window.context.getInventory()
            setItems(data)
            navigate('/inventory/lists', { state: { items: data } })
        } catch (error) {
            console.error('Failed to fetch all inventory:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            {/* Search Bar */}
            <div className="flex items-center gap-3 border p-3 rounded-md">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        placeholder="Item Name"
                        value={itemName}
                        onChange={e => setItemName(e.target.value)}
                        className="w-full pl-8 p-2 text-xs border rounded-md disabled:opacity-50"
                        disabled={loading}
                    />
                </div>

                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        placeholder="Category"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full pl-8 p-2 text-xs border rounded-md disabled:opacity-50"
                        disabled={loading}
                    />
                </div>

                <button
                    onClick={handleSearch}
                    className="px-5 py-2 text-xs font-medium text-white bg-pink-400 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    disabled={loading}
                >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Get All */}
            <button
                onClick={handleGetAll}
                className="mt-2 text-xs text-pink-600 underline disabled:opacity-50"
                disabled={loading}
            >
                GET ALL
            </button>

            {/* Results */}
            <div className="mt-4 space-y-2">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="p-3 border rounded-md text-xs flex justify-between"
                    >
                        <div>
                            <div className="font-medium">{item.item_name}</div>
                            <div className="text-gray-500">
                                {item.category} • {item.batch_no}
                            </div>
                        </div>

                        <div className="text-right">
                            <div>Stock: {item.stock}</div>
                            <div className="text-gray-500">{item.unit}</div>
                        </div>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className="text-xs text-gray-500 text-center">
                        No inventory found
                    </div>
                )}
            </div>
        </div>
    )
}

export default InventorySearch
