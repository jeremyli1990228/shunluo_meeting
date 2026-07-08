import { useState } from 'react';
import { Plus, Minus, ShoppingCart, X, Phone, Check, Package } from 'lucide-react';
import { Material } from '@/types';
import { useMeeting } from '@/context/MeetingContext';

interface MaterialOrderProps {
  materials: Material[];
  roomId: string;
  roomName: string;
  onClose: () => void;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    '咖啡': '☕',
    '茶': '🍵',
    '小食': '🍪',
    '饮料': '🥤',
  };
  return icons[category] || '📦';
};

export const MaterialOrder = ({ materials, roomId, roomName, onClose }: MaterialOrderProps) => {
  const { createOrder } = useMeeting();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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
      category: m.category,
    }));

  const groupedItems = selectedItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof selectedItems>);

  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleOrder = () => {
    if (selectedItems.length === 0) return;
    setShowConfirm(true);
  };

  const confirmOrder = () => {
    createOrder(roomId, roomName, selectedItems);
    setShowConfirm(false);
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setQuantities({});
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">会务物资点餐</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-6 max-h-[55vh]">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <span className="text-lg">{getCategoryIcon(category)}</span>
                {category}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {materials
                  .filter(m => m.category === category)
                  .map(material => (
                    <div
                      key={material.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        getQuantity(material.id) > 0
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!material.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800">{material.name}</h4>
                        </div>
                        {!material.available && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">售罄</span>
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
                            className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
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
              <Package className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">已选 {selectedItems.length} 项，共 {totalQuantity} 份</span>
            </div>
          </div>
          <button
            onClick={handleOrder}
            disabled={selectedItems.length === 0}
            className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedItems.length > 0
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Phone className="w-5 h-5" />
            下单（需二次确认）
          </button>
        </div>

        {showConfirm && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-10">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">确认订单</h3>
                    <p className="text-white/80 text-sm">请确认您的点餐内容</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  配送至：{roomName}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-4 max-h-64 overflow-y-auto">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">{getCategoryIcon(category)}</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase">{category}</span>
                      </div>
                      <div className="space-y-2">
                        {items.map(item => (
                          <div
                            key={item.materialId}
                            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">
                                {item.quantity}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-gray-600">总计</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-orange-600">{totalQuantity}</span>
                    <span className="text-gray-500 ml-1">份</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    返回修改
                  </button>
                  <button
                    onClick={confirmOrder}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                  >
                    确认下单
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {orderSuccess && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-20">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">下单成功</h3>
              <p className="text-gray-500">订单已发送，稍后将为您配送</p>
              <div className="mt-4 text-sm text-gray-400">
                配送至：{roomName}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
