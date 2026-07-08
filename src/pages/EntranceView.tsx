import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Package, AlertCircle, ChevronDown, ArrowLeft } from 'lucide-react';
import { useMeeting } from '@/context/MeetingContext';
import { OrderStatus } from '@/types';

interface EntranceViewProps {
  onBack?: () => void;
}

export const EntranceView = ({ onBack }: EntranceViewProps) => {
  const { state, updateOrderStatus, clearOrders } = useMeeting();
  const { rooms, orders, config } = state;
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const currentRoom = rooms.find(r => r.id === config.currentRoomId);
  const roomOrders = orders.filter(o => o.roomId === config.currentRoomId && o.status !== 'delivered');
  const pendingOrders = roomOrders.filter(o => o.status === 'pending');
  const preparingOrders = roomOrders.filter(o => o.status === 'preparing');

  // 检测新订单并显示通知动画
  useEffect(() => {
    if (pendingOrders.length > 0) {
      const latestOrder = pendingOrders.reduce((latest, order) => {
        return new Date(order.createdAt) > new Date(latest.createdAt) ? order : latest;
      }, pendingOrders[0]);
      
      if (latestOrder && latestOrder.id !== newOrderId) {
        setNewOrderId(latestOrder.id);
        setShowNotification(true);
        const timer = setTimeout(() => {
          setShowNotification(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [pendingOrders]);

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  const handleClearDelivered = () => {
    const deliveredOrders = orders.filter(o => o.roomId === config.currentRoomId && o.status === 'delivered');
    if (deliveredOrders.length > 0) {
      clearOrders(config.currentRoomId);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部状态栏 */}
      <div className="bg-white border-b border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {currentRoom?.name || '会议室门口'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentRoom?.status === 'occupied'
                  ? `会议进行中 · ${currentRoom.currentMeeting?.title || ''}`
                  : '当前空闲'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingOrders.length > 0 && (
              <div className="relative animate-pulse">
                <Bell className="w-6 h-6 text-red-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              </div>
            )}
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              currentRoom?.status === 'occupied'
                ? currentRoom?.currentMeeting?.level === 'important'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {currentRoom?.status === 'occupied'
                ? currentRoom?.currentMeeting?.level === 'important'
                  ? '重要会议'
                  : '占用中'
                : '空闲'}
            </div>
          </div>
        </div>
      </div>

      {/* 新订单通知弹窗 */}
      {showNotification && newOrderId && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-2xl p-5 flex items-center gap-4 animate-bounce min-w-[280px]">
            <div className="p-3 bg-white/20 rounded-xl">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-lg">新订单到达！</p>
              <p className="text-sm opacity-90">请及时处理订单</p>
            </div>
          </div>
        </div>
      )}

      {/* 订单列表 */}
      <div className="flex-1 p-5 overflow-y-auto">
        {roomOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 text-lg">暂无订单</p>
            <p className="text-gray-300 text-sm mt-2">会议室内下单后将在此显示</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 待处理订单 */}
            {pendingOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  待处理订单 ({pendingOrders.length})
                </h2>
                {pendingOrders.map(order => (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl shadow-sm mb-3 overflow-hidden ${
                      newOrderId === order.id ? 'ring-2 ring-orange-500 animate-pulse' : ''
                    }`}
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-xl">
                            <Package className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              订单 #{order.id.slice(-6)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTime(order.createdAt)} · {order.items.length}项
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                            待处理
                          </span>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedOrder === order.id ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">订单内容</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-700">{item.name}</span>
                                <span className="text-gray-500">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'preparing')}
                            className="py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            开始准备
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            className="py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                          >
                            取消订单
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 准备中订单 */}
            {preparingOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  准备中 ({preparingOrders.length})
                </h2>
                {preparingOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden"
                  >
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-xl">
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              订单 #{order.id.slice(-6)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatTime(order.createdAt)} · {order.items.length}项
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
                            准备中
                          </span>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedOrder === order.id ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </div>
                    </div>

                    {expandedOrder === order.id && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-2">订单内容</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-700">{item.name}</span>
                                <span className="text-gray-500">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          标记为已送达
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      {roomOrders.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <button
            onClick={handleClearDelivered}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            清除已完成订单
          </button>
        </div>
      )}
    </div>
  );
};