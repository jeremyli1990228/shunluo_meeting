import { useState } from 'react';
import {
  ArrowLeft,
  Zap,
  UserCheck,
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
    detectPeople,
  } = useMeeting();
  const { rooms, materials } = state;
  const [showMaterialOrder, setShowMaterialOrder] = useState(false);
  const [deviceCollapsed, setDeviceCollapsed] = useState(false);
  const [sceneCollapsed, setSceneCollapsed] = useState(false);
  const [envCollapsed, setEnvCollapsed] = useState(false);

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

  const handlePeopleDetect = () => {
    detectPeople(roomId, !room.hasPeople);
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

        {/* 底部：会务物资点餐 */}
        <button
          onClick={() => setShowMaterialOrder(true)}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
        >
          <ShoppingCart className="w-6 h-6" />
          会务物资点餐
        </button>
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
              <div className="px-4 pb-4">
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
                <button
                  onClick={() => handleApplyScene('standard')}
                  className="w-full p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left flex items-center gap-3"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">标准会议</p>
                    <p className="text-xs text-gray-500">灯光80% 投影开启</p>
                  </div>
                </button>
                <button
                  onClick={() => handleApplyScene('presentation')}
                  className="w-full p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-left flex items-center gap-3"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Presentation className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">演示模式</p>
                    <p className="text-xs text-gray-500">灯光50% 窗帘关闭</p>
                  </div>
                </button>
                <button
                  onClick={() => handleApplyScene('energy-saving')}
                  className="w-full p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-left flex items-center gap-3"
                >
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">节能模式</p>
                    <p className="text-xs text-gray-500">灯光30% 空调关闭</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 环境状态 */}
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <button
              onClick={() => setEnvCollapsed(!envCollapsed)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-700">环境状态</h3>
              {envCollapsed ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {!envCollapsed && (
              <div className="px-4 pb-4 space-y-2">
                <div
                  onClick={handlePeopleDetect}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                    room.hasPeople
                      ? 'bg-green-50 hover:bg-green-100'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <UserCheck
                    className={`w-5 h-5 ${room.hasPeople ? 'text-green-600' : 'text-gray-400'}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">人体感应</p>
                    <p
                      className={`text-xs ${
                        room.hasPeople ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {room.hasPeople ? '有人' : '无人'}
                    </p>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl flex items-center gap-3 ${
                    room.energySaving ? 'bg-yellow-50' : 'bg-white'
                  }`}
                >
                  <Zap
                    className={`w-5 h-5 ${
                      room.energySaving ? 'text-yellow-600' : 'text-gray-400'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">节能状态</p>
                    <p
                      className={`text-xs ${
                        room.energySaving ? 'text-yellow-600' : 'text-gray-400'
                      }`}
                    >
                      {room.energySaving ? '已开启' : '正常'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 手动关闭所有设备 */}
          <button
            onClick={handleTurnOffAllDevices}
            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Power className="w-4 h-4" />
            关闭所有设备
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
