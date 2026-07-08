import { useState } from 'react';
import { Plus, Minus, ShoppingCart, X, Phone } from 'lucide-react';
import { Material } from '@/types';
import { useMeeting } from '@/context/MeetingContext';

interface MaterialOrderProps {
  materials: Material[];
  roomId: string;
  roomName: string;
  onClose: () => void;
}

export const MaterialOrder = ({ materials, roomId, roomName, onClose }: MaterialOrderProps) => {
  const { createOrder } = useMeeting();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const categories = [...new Set(materials.map(m => m.category))];

  const getQuantity = (id: string) => quantities[id] || 0;

  const increment = (id: string) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id: string) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  };

  const selectedItems = materials
    .filter(m => getQuantity(m.id) > 0)
    .map(m => ({
      materialId: m.id,
      name: m.name,
      quantity: getQuantity(m.id),
      price: 0,
    }));

  const handleOrder = () => {
    if (selectedItems.length === 0) return;
    setShowConfirm(true);
  };

  const confirmOrder = () => {
    createOrder(roomId, roomName, selectedItems);
    setShowConfirm(false);
    setQuantities({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">会务物资点餐</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-6 max-h-[60vh]">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">{category}</h3>
              <div className="grid grid-cols-2 gap-3">
                {materials
                  .filter(m => m.category === category)
                  .map(material => (
                    <div
                      key={material.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        getQuantity(material.id) > 0
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!material.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800">{material.name}</h4>
                        </div>
                        {!material.available && (
                          <span className="text-xs text-gray-400">售罄</span>
                        )}
                      </div>
                      {material.available && (
                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() => decrement(material.id)}
                            disabled={getQuantity(material.id) === 0}
                            className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-bold text-gray-800">
                            {getQuantity(material.id)}
                          </span>
                          <button
                            onClick={() => increment(material.id)}
                            className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">已选 {selectedItems.length} 项</span>
            </div>
          </div>
          <button
            onClick={handleOrder}
            disabled={selectedItems.length === 0}
            className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedItems.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Phone className="w-5 h-5" />
            下单（需二次确认）
          </button>
        </div>

        {showConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">确认订单</h3>
              <div className="bg-gray-50 rounded-xl p-4 mb-4 max-h-32 overflow-y-auto">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span>{item.name}</span>
                    <span className="font-medium">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300"
                >
                  取消
                </button>
                <button
                  onClick={confirmOrder}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  确认下单
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
