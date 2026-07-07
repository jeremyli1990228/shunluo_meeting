import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Zap, UserCheck, Power, Lightbulb, Presentation } from 'lucide-react';
import { MeetingCard } from '@/components/MeetingCard';
import { DeviceStatus } from '@/components/DeviceStatus';
import { MaterialOrder } from '@/components/MaterialOrder';
import { useMeeting } from '@/context/MeetingContext';

interface RoomDetailProps {
  roomId: string;
  onBack: () => void;
}

export const RoomDetail = ({ roomId, onBack }: RoomDetailProps) => {
  const { state, endMeeting, toggleDevice, setCurrentRoom } = useMeeting();
  const { rooms, materials } = state;
  const [showMaterialOrder, setShowMaterialOrder] = useState(false);

  const room = rooms.find(r => r.id === roomId);
  if (!room) return null;

  const handleEndMeeting = () => {
    if (room.currentMeeting) {
      endMeeting(room.currentMeeting.id);
    }
  };

  const handleDeviceToggle = (deviceId: string) => {
    toggleDevice(roomId, deviceId);
  };

  const handleBack = () => {
    setCurrentRoom(null);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
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
            {room.status === 'occupied' ? (room.currentMeeting?.level === 'important' ? '重要会议进行中' : '会议进行中') : '空闲'}
          </p>
        </div>
      </div>

      {room.currentMeeting && (
        <div className="mb-6">
          <MeetingCard
            meeting={room.currentMeeting}
            onEnd={handleEndMeeting}
            showEndButton={true}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">智能设备控制</h2>
        <DeviceStatus devices={room.devices} onToggle={handleDeviceToggle} showControls={true} />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">场景预设</h2>
        <div className="grid grid-cols-3 gap-3">
          <button className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-800">标准会议</span>
            </div>
            <p className="text-xs text-gray-500">灯光80% 投影开启</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-left">
            <div className="flex items-center gap-2 mb-2">
              <Presentation className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-800">演示模式</span>
            </div>
            <p className="text-xs text-gray-500">灯光50% 投影100%</p>
          </button>
          <button className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-left">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-800">节能模式</span>
            </div>
            <p className="text-xs text-gray-500">灯光30% 空调关闭</p>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">环境传感器</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl ${room.hasPeople ? 'bg-green-50' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-3">
              <UserCheck className={`w-6 h-6 ${room.hasPeople ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm text-gray-600">人体感应</p>
                <p className={`font-bold ${room.hasPeople ? 'text-green-600' : 'text-gray-400'}`}>
                  {room.hasPeople ? '有人' : '无人'}
                </p>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${room.energySaving ? 'bg-yellow-50' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-3">
              <Zap className={`w-6 h-6 ${room.energySaving ? 'text-yellow-600' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm text-gray-600">节能状态</p>
                <p className={`font-bold ${room.energySaving ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {room.energySaving ? '已开启' : '正常'}
                </p>
              </div>
            </div>
          </div>
        </div>
        {room.hasPeople && (
          <button
            onClick={() => {}}
            className="mt-4 w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            <Power className="w-4 h-4 inline mr-2" />
            手动关闭所有设备
          </button>
        )}
      </div>

      <button
        onClick={() => setShowMaterialOrder(true)}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
      >
        <ShoppingCart className="w-6 h-6" />
        会务物资点餐
      </button>

      {showMaterialOrder && (
        <MaterialOrder
          materials={materials}
          roomId={roomId}
          onClose={() => setShowMaterialOrder(false)}
        />
      )}
    </div>
  );
};
