import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Package, AlertCircle, ChevronDown, ArrowLeft, Phone, SprayCan, Wrench, HelpCircle } from 'lucide-react';
import { useMeeting } from '@/context/MeetingContext';
import { OrderStatus, ServiceCall, CallStatus } from '@/types';
import { loadCalls, saveCalls } from '@/utils/callStorage';

interface EntranceViewProps {
  onBack?: () => void;
}

export const EntranceView = ({ onBack }: EntranceViewProps) => {
  const { state, updateOrderStatus, clearOrders } = useMeeting();
  const { rooms, orders, config } = state;
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const [newCallId, setNewCallId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showCallNotification, setShowCallNotification] = useState(false);
  const [calls, setCalls] = useState<ServiceCall[]>([]);

  const currentRoom = rooms.find(r => r.id === config.currentRoomId);
  const roomOrders = orders.filter(o => o.roomId === config.currentRoomId && o.status !== 'delivered');
  const pendingOrders = roomOrders.filter(o => o.status === 'pending');
  const preparingOrders = roomOrders.filter(o => o.status === 'preparing');
  const pendingCalls = calls.filter(c => c.status === 'pending');
  const handlingCalls = calls.filter(c => c.status === 'handling');

  // 加载呼叫数据并监听更新
  useEffect(() => {
    setCalls(loadCalls([]));

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('meeting_service_calls');
      bc.onmessage = () => {
        setCalls(loadCalls([]));
      };
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'meeting_service_calls') {
        setCalls(loadCalls([]));
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

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

  // 检测新呼叫并显示通知动画
  useEffect(() => {
    if (pendingCalls.length > 0) {
      const latestCall = pendingCalls.reduce((latest, call) => {
        return new Date(call.createdAt) > new Date(latest.createdAt) ? call : latest;
      }, pendingCalls[0]);

      if (latestCall && latestCall.id !== newCallId) {
        setNewCallId(latestCall.id);
        setShowCallNotification(true);
        const timer = setTimeout(() => {
          setShowCallNotification(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [pendingCalls]);

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  const handleCallStatusUpdate = (callId: string, status: CallStatus) => {
    const updatedCalls = calls.map(c => {
      if (c.id === callId) {
        return { ...c, status, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    saveCalls(updatedCalls);
    setCalls(updatedCalls);

    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('meeting_service_calls');
      bc.postMessage({ type: 'CALL_UPDATED' });
      bc.close();
    }
  };

  const handleClearDelivered = () => {
    const deliveredOrders = orders.filter(o => o.roomId === config.currentRoomId && o.status === 'delivered');
    if (deliveredOrders.length > 0) {
      clearOrders(config.currentRoomId);
    }
  };

  const handleClearCalls = () => {
    const completedCalls = calls.filter(c => c.status === 'completed');
    if (completedCalls.length > 0) {
      const remainingCalls = calls.filter(c => c.status !== 'completed');
      saveCalls(remainingCalls);
      setCalls(remainingCalls);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const getCallTypeInfo = (type: string) => {
    switch (type) {
      case 'cleaning':
        return { icon: SprayCan, label: '清洁打扫', color: 'bg-blue-100 text-blue-600' };
      case 'maintenance':
        return { icon: Wrench, label: '设备维护', color: 'bg-purple-100 text-purple-600' };
      case 'other':
        return { icon: HelpCircle, label: '其他事务', color: 'bg-orange-100 text-orange-600' };
      default:
        return { icon: HelpCircle, label: '未知', color: 'bg-gray-100 text-gray-600' };
    }
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
                <Package className="w-6 h-6 text-orange-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              </div>
            )}
            {pendingCalls.length > 0 && (
              <div className="relative animate-pulse">
                <Phone className="w-6 h-6 text-red-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCalls.length}
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
              <Package className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-lg">新订单到达！</p>
              <p className="text-sm opacity-90">请及时处理订单</p>
            </div>
          </div>
        </div>
      )}

      {/* 新呼叫通知弹窗 */}
      {showCallNotification && newCallId && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl shadow-2xl p-5 flex items-center gap-4 animate-bounce min-w-[280px]">
            <div className="p-3 bg-white/20 rounded-xl">
              <Phone className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-lg">服务呼叫！</p>
              <p className="text-sm opacity-90">会议室需要服务人员</p>
            </div>
          </div>
        </div>
      )}

      {/* 订单和呼叫列表 */}
      <div className="flex-1 p-5 overflow-y-auto">
        {roomOrders.length === 0 && pendingCalls.length === 0 && handlingCalls.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 text-lg">暂无订单和呼叫</p>
            <p className="text-gray-300 text-sm mt-2">会议室内下单或呼叫后将在此显示</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 待处理呼叫 */}
            {pendingCalls.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  服务呼叫 ({pendingCalls.length})
                </h2>
                {pendingCalls.map(call => {
                  const typeInfo = getCallTypeInfo(call.type);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <div
                      key={call.id}
                      className={`bg-white rounded-2xl shadow-sm mb-3 overflow-hidden ${
                        newCallId === call.id ? 'ring-2 ring-red-500 animate-pulse' : ''
                      }`}
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 ${typeInfo.color} rounded-xl`}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{typeInfo.label}</p>
                              <p className="text-sm text-gray-500">
                                {call.roomName} · {formatTime(call.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                              待处理
                            </span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedCall === call.id ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                      </div>

                      {expandedCall === call.id && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50">
                          {call.note && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-600 mb-2">备注说明</h4>
                              <p className="text-sm text-gray-700">{call.note}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleCallStatusUpdate(call.id, 'handling')}
                              className="py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              立即响应
                            </button>
                            <button
                              onClick={() => handleCallStatusUpdate(call.id, 'cancelled')}
                              className="py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                            >
                              取消呼叫
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 处理中呼叫 */}
            {handlingCalls.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  处理中 ({handlingCalls.length})
                </h2>
                {handlingCalls.map(call => {
                  const typeInfo = getCallTypeInfo(call.type);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <div
                      key={call.id}
                      className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden"
                    >
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 bg-green-100 rounded-xl`}>
                              <TypeIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{typeInfo.label}</p>
                              <p className="text-sm text-gray-500">
                                {call.roomName} · {formatTime(call.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                              处理中
                            </span>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedCall === call.id ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                      </div>

                      {expandedCall === call.id && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50">
                          {call.note && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-600 mb-2">备注说明</h4>
                              <p className="text-sm text-gray-700">{call.note}</p>
                            </div>
                          )}
                          <button
                            onClick={() => handleCallStatusUpdate(call.id, 'completed')}
                            className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            完成处理
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

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
      {(roomOrders.length > 0 || calls.length > 0) && (
        <div className="bg-white border-t border-gray-200 p-4 space-y-2">
          {calls.filter(c => c.status === 'completed').length > 0 && (
            <button
              onClick={handleClearCalls}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              清除已完成呼叫
            </button>
          )}
          {orders.filter(o => o.roomId === config.currentRoomId && o.status === 'delivered').length > 0 && (
            <button
              onClick={handleClearDelivered}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              清除已完成订单
            </button>
          )}
        </div>
      )}
    </div>
  );
};