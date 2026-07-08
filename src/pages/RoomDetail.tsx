import { useState } from 'react';
import {
  ArrowLeft,
  Zap,
  Power,
  Lightbulb,
  Presentation,
  ShoppingCart,
  Thermometer,
  Wind,
  Monitor,
  Speaker,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  PowerOff,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  X,
  ChevronRight,
  Phone,
  SprayCan,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { MeetingCard } from '@/components/MeetingCard';
import { MaterialOrder } from '@/components/MaterialOrder';
import { useMeeting } from '@/context/MeetingContext';
import { DeviceType, CallType } from '@/types';
import { loadCalls, saveCalls, generateCallId } from '@/utils/callStorage';

interface RoomDetailProps {
  roomId: string;
  onBack: () => void;
}

const deviceIconMap: Record<DeviceType, typeof Lightbulb> = {
  light: Lightbulb,
  aircon: Thermometer,
  curtain: Wind,
  projector: Monitor,
  tv: Monitor,
  volume: Speaker,
};

export const RoomDetail = ({ roomId, onBack }: RoomDetailProps) => {
  const {
    state,
    endMeeting,
    toggleDevice,
    setCurrentRoom,
    applyScene,
    turnOffAllDevices,
    turnOnAllDevices,
  } = useMeeting();
  const { rooms, materials, orders } = state;
  const [showMaterialOrder, setShowMaterialOrder] = useState(false);
  const [deviceCollapsed, setDeviceCollapsed] = useState(false);
  const [sceneCollapsed, setSceneCollapsed] = useState(false);
  const [orderCollapsed, setOrderCollapsed] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<CallType>('cleaning');
  const [callNote, setCallNote] = useState('');
  const [callSuccess, setCallSuccess] = useState(false);

  const room = rooms.find(r => r.id === roomId);
  if (!room) return null;

  const handleEndMeeting = () => {
    if (room.currentMeeting) {
      endMeeting(room.currentMeeting.id);
      onBack();
    }
  };

  const handleDeviceToggle = (deviceId: string) => {
    toggleDevice(roomId, deviceId);
  };

  const handleBack = () => {
    setCurrentRoom(null);
    onBack();
  };

  const handleApplyScene = (preset: 'standard' | 'presentation' | 'energy-saving') => {
    applyScene(roomId, preset);
  };

  const handleTurnOffAllDevices = () => {
    turnOffAllDevices(roomId);
  };

  const handleTurnOnAllDevices = () => {
    turnOnAllDevices(roomId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧主内容区 */}
      <div className="flex-1 p-5 overflow-y-auto">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{room.name}</h1>
            <p className="text-gray-500 text-sm">
              {room.status === 'occupied'
                ? room.currentMeeting?.level === 'important'
                  ? '重要会议进行中'
                  : '会议进行中'
                : '空闲'}
            </p>
          </div>
        </div>

        {/* 会议信息卡片 */}
        {room.currentMeeting && (
          <div className="mb-6">
            <MeetingCard
              meeting={room.currentMeeting}
              onEnd={handleEndMeeting}
              showEndButton={true}
            />
          </div>
        )}

      </div>

      {/* 右侧悬浮控制面板 */}
      <div className="w-80 bg-white border-l border-gray-100 shadow-lg overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* 面板标题 */}
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            <h2 className="font-bold text-gray-800">智能控制</h2>
          </div>

          {/* 智能设备控制 */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <button
              onClick={() => setDeviceCollapsed(!deviceCollapsed)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-700">设备控制</h3>
              {deviceCollapsed ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {!deviceCollapsed && (
              <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {room.devices.map(device => {
                    const Icon = deviceIconMap[device.type];
                    return (
                      <button
                        key={device.id}
                        onClick={() => handleDeviceToggle(device.id)}
                        className={`p-3 rounded-xl transition-all text-left ${
                          device.isOn
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'bg-white border-2 border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mb-2 ${
                            device.isOn ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        />
                        <p
                          className={`text-xs font-medium ${
                            device.isOn ? 'text-blue-700' : 'text-gray-500'
                          }`}
                        >
                          {device.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {device.isOn
                            ? device.type === 'aircon'
                              ? `${device.value}°C`
                              : `${device.value}%`
                            : '已关闭'}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={handleTurnOnAllDevices}
                    className="py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Power className="w-4 h-4" />
                    开启所有
                  </button>
                  <button
                    onClick={handleTurnOffAllDevices}
                    className="py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PowerOff className="w-4 h-4" />
                    关闭所有
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 场景预设 */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <button
              onClick={() => setSceneCollapsed(!sceneCollapsed)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-700">场景预设</h3>
              {sceneCollapsed ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {!sceneCollapsed && (
              <div className="px-4 pb-4 space-y-2">
                {[
                  { key: 'standard', label: '标准会议', desc: '灯光80% 投影开启', color: 'blue', icon: Lightbulb },
                  { key: 'presentation', label: '演示模式', desc: '灯光50% 窗帘关闭', color: 'purple', icon: Presentation },
                  { key: 'energy-saving', label: '节能模式', desc: '灯光30% 空调关闭', color: 'green', icon: Zap },
                ].map(scene => {
                  const Icon = scene.icon;
                  const isActive = room.currentScene === scene.key;
                  const colorMap: Record<string, { bg: string; iconBg: string; iconText: string; border: string; ring: string }> = {
                    blue: { bg: isActive ? 'bg-blue-100' : 'bg-blue-50', iconBg: isActive ? 'bg-blue-500' : 'bg-blue-100', iconText: isActive ? 'text-white' : 'text-blue-600', border: isActive ? 'border-blue-500' : 'border-transparent', ring: 'ring-blue-200' },
                    purple: { bg: isActive ? 'bg-purple-100' : 'bg-purple-50', iconBg: isActive ? 'bg-purple-500' : 'bg-purple-100', iconText: isActive ? 'text-white' : 'text-purple-600', border: isActive ? 'border-purple-500' : 'border-transparent', ring: 'ring-purple-200' },
                    green: { bg: isActive ? 'bg-green-100' : 'bg-green-50', iconBg: isActive ? 'bg-green-500' : 'bg-green-100', iconText: isActive ? 'text-white' : 'text-green-600', border: isActive ? 'border-green-500' : 'border-transparent', ring: 'ring-green-200' },
                  };
                  const colors = colorMap[scene.color];
                  return (
                    <button
                      key={scene.key}
                      onClick={() => handleApplyScene(scene.key as 'standard' | 'presentation' | 'energy-saving')}
                      className={`w-full p-3 rounded-xl border-2 ${colors.border} ${colors.bg} hover:brightness-95 transition-all text-left flex items-center gap-3 ${isActive ? 'shadow-sm ring-2 ' + colors.ring : ''}`}
                    >
                      <div className={`p-2 ${colors.iconBg} rounded-lg transition-colors`}>
                        <Icon className={`w-4 h-4 ${colors.iconText}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                          {scene.label}
                          {isActive && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/80 text-gray-600 font-semibold">
                              当前
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{scene.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 订单状态 */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <button
              onClick={() => setOrderCollapsed(!orderCollapsed)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">我的订单</h3>
                {orders.filter(o => o.roomId === roomId).length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-orange-100 text-orange-600 rounded-full font-medium">
                    {orders.filter(o => o.roomId === roomId).length}
                  </span>
                )}
              </div>
              {orderCollapsed ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {!orderCollapsed && (
              <div className="px-4 pb-4 space-y-2">
                {orders
                  .filter(o => o.roomId === roomId)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(order => {
                    const getStatusInfo = (status: string) => {
                      switch (status) {
                        case 'pending':
                          return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: '待处理', steps: ['已下单', '准备中', '配送中', '已送达'], current: 0 };
                        case 'preparing':
                          return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: '准备中', steps: ['已下单', '准备中', '配送中', '已送达'], current: 1 };
                        case 'delivered':
                          return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: '已送达', steps: ['已下单', '准备中', '配送中', '已送达'], current: 3 };
                        case 'cancelled':
                          return { icon: X, color: 'text-gray-400', bg: 'bg-gray-50', label: '已取消', steps: ['已下单', '已取消'], current: 1 };
                        default:
                          return { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-50', label: '未知', steps: [], current: 0 };
                      }
                    };
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${statusInfo.bg} rounded-lg flex items-center justify-center`}>
                              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{statusInfo.label}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {order.items.length}项 · {order.items.reduce((sum, item) => sum + item.quantity, 0)}份
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-1">
              {statusInfo.steps.map((_, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${index <= statusInfo.current ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  {index < statusInfo.steps.length - 1 && (
                    <div className={`w-4 h-0.5 ${index < statusInfo.current ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
                      </div>
                    );
                  })}
                {orders.filter(o => o.roomId === roomId).length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无订单</p>
                    <p className="text-xs">点击下方按钮点餐</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 会务物资点餐 */}
          <button
            onClick={() => setShowMaterialOrder(true)}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            会务物资点餐
          </button>

          {/* 呼叫服务按钮 */}
          <button
            onClick={() => setShowCallModal(true)}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <Phone className="w-5 h-5" />
            呼叫服务
          </button>
        </div>
      </div>

      {/* 物资点餐弹窗 */}
      {showMaterialOrder && (
        <MaterialOrder
          materials={materials.filter(m => m.available)}
          roomId={roomId}
          roomName={room.name}
          onClose={() => setShowMaterialOrder(false)}
        />
      )}

      {/* 订单详情弹窗 */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">订单详情</h3>
                    <p className="text-white/80 text-sm">
                      订单号：{selectedOrder.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Truck className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">配送至</p>
                  <p className="text-xs text-gray-500">{selectedOrder.roomName}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">点餐内容</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-xs font-bold">
                          {item.quantity}
                        </span>
                        <span className="text-sm text-gray-500">份</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">配送进度</h4>
                <div className="space-y-3">
                  {(() => {
                    switch (selectedOrder.status) {
                      case 'pending':
                        return [
                          { step: '已下单', time: selectedOrder.createdAt, done: true, active: true },
                          { step: '准备中', time: '', done: false, active: false },
                          { step: '配送中', time: '', done: false, active: false },
                          { step: '已送达', time: '', done: false, active: false },
                        ];
                      case 'preparing':
                        return [
                          { step: '已下单', time: selectedOrder.createdAt, done: true, active: false },
                          { step: '准备中', time: selectedOrder.updatedAt, done: true, active: true },
                          { step: '配送中', time: '', done: false, active: false },
                          { step: '已送达', time: '', done: false, active: false },
                        ];
                      case 'delivered':
                        return [
                          { step: '已下单', time: selectedOrder.createdAt, done: true, active: false },
                          { step: '准备中', time: '', done: true, active: false },
                          { step: '配送中', time: '', done: true, active: false },
                          { step: '已送达', time: selectedOrder.updatedAt, done: true, active: true },
                        ];
                      case 'cancelled':
                        return [
                          { step: '已下单', time: selectedOrder.createdAt, done: true, active: false },
                          { step: '已取消', time: selectedOrder.updatedAt, done: true, active: true },
                        ];
                      default:
                        return [];
                    }
                  })().map((progress, index, arr) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          progress.done ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                        } ${progress.active ? 'ring-2 ring-orange-200' : ''}`}>
                          {progress.done ? (
                            progress.active ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        {index < arr.length - 1 && (
                          <div className={`w-0.5 h-6 ${progress.done ? 'bg-orange-500' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <p className={`text-sm font-medium ${progress.active ? 'text-orange-600' : progress.done ? 'text-gray-800' : 'text-gray-400'}`}>
                          {progress.step}
                        </p>
                        {progress.time && (
                          <p className="text-xs text-gray-400">
                            {new Date(progress.time).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">下单时间</p>
                  <p className="text-sm text-gray-700">
                    {new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedOrder.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                  selectedOrder.status === 'preparing' ? 'bg-blue-100 text-blue-600' :
                  selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {selectedOrder.status === 'pending' ? '待处理' :
                   selectedOrder.status === 'preparing' ? '准备中' :
                   selectedOrder.status === 'delivered' ? '已送达' : '已取消'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 呼叫服务弹窗 */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {!callSuccess && (
              <>
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">呼叫服务</h3>
                        <p className="text-white/80 text-sm">{room.name}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowCallModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">选择服务类型</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'cleaning', label: '清洁打扫', desc: '需要保洁人员打扫会议室', icon: SprayCan, color: 'bg-blue-50 text-blue-600' },
                        { key: 'maintenance', label: '设备维护', desc: '设备故障需要维修', icon: Wrench, color: 'bg-purple-50 text-purple-600' },
                        { key: 'other', label: '其他事务', desc: '其他需要协助的事项', icon: HelpCircle, color: 'bg-orange-50 text-orange-600' },
                      ].map(type => {
                        const Icon = type.icon;
                        const isSelected = callType === type.key;
                        return (
                          <button
                            key={type.key}
                            onClick={() => setCallType(type.key as CallType)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                              isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-red-500 text-white' : type.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{type.label}</p>
                              <p className="text-xs text-gray-500">{type.desc}</p>
                            </div>
                            {isSelected && <CheckCircle className="w-5 h-5 text-red-500 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">备注说明（可选）</h4>
                    <textarea
                      value={callNote}
                      onChange={(e) => setCallNote(e.target.value)}
                      placeholder="请描述具体需求..."
                      className="w-full p-3 border-2 border-gray-200 rounded-xl resize-none focus:border-red-500 focus:outline-none text-sm"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCallModal(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        const now = new Date().toISOString();
                        const newCall = {
                          id: generateCallId(),
                          roomId: roomId,
                          roomName: room.name,
                          type: callType,
                          note: callNote || undefined,
                          status: 'pending' as const,
                          createdAt: now,
                          updatedAt: now,
                        };
                        const calls = loadCalls([]);
                        calls.push(newCall);
                        saveCalls(calls);

                        if (typeof BroadcastChannel !== 'undefined') {
                          const bc = new BroadcastChannel('meeting_service_calls');
                          bc.postMessage({ type: 'CALL_CREATED' });
                          bc.close();
                        }

                        setCallSuccess(true);
                        setTimeout(() => {
                          setCallSuccess(false);
                          setCallType('cleaning');
                          setCallNote('');
                          setShowCallModal(false);
                        }, 2000);
                      }}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      确认呼叫
                    </button>
                  </div>
                </div>
              </>
            )}

            {callSuccess && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">呼叫已发送</h3>
                <p className="text-white/80 text-sm">门口服务人员已收到通知</p>
                <div className="mt-4 text-white/60 text-xs">
                  正在等待服务人员响应...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
