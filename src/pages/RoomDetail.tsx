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
} from 'lucide-react';
import { MeetingCard } from '@/components/MeetingCard';
import { MaterialOrder } from '@/components/MaterialOrder';
import { useMeeting } from '@/context/MeetingContext';
import { DeviceType } from '@/types';

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
  const { rooms, materials } = state;
  const [showMaterialOrder, setShowMaterialOrder] = useState(false);
  const [deviceCollapsed, setDeviceCollapsed] = useState(false);
  const [sceneCollapsed, setSceneCollapsed] = useState(false);

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

          {/* 会务物资点餐 */}
          <button
            onClick={() => setShowMaterialOrder(true)}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            会务物资点餐
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
    </div>
  );
};
