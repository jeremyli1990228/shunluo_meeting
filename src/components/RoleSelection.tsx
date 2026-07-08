import { useState } from 'react';
import { Monitor, DoorOpen, ArrowRight } from 'lucide-react';
import { useMeeting } from '@/context/MeetingContext';
import { DeviceRole } from '@/types';

interface RoleSelectionProps {
  onComplete: () => void;
}

export const RoleSelection = ({ onComplete }: RoleSelectionProps) => {
  const { state, setDeviceRole, setCurrentRoom } = useMeeting();
  const [selectedRole, setSelectedRole] = useState<DeviceRole | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(state.rooms[0]?.id || '');

  const handleConfirm = () => {
    if (selectedRole) {
      setDeviceRole(selectedRole);
      if (selectedRole === 'inside' || selectedRole === 'entrance') {
        setCurrentRoom(selectedRoomId);
      }
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">智慧会议系统</h1>
          <p className="text-gray-500">请选择当前设备的使用场景</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setSelectedRole('inside')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              selectedRole === 'inside'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`p-4 rounded-xl mb-4 ${
                selectedRole === 'inside' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Monitor className={`w-10 h-10 ${
                  selectedRole === 'inside' ? 'text-blue-600' : 'text-gray-500'
                }`} />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">会议室内模式</h3>
              <p className="text-sm text-gray-500 text-center">
                放置在会议桌上<br/>
                支持会议控制、设备管理、物资点餐
              </p>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('entrance')}
            className={`p-6 rounded-2xl border-2 transition-all ${
              selectedRole === 'entrance'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className={`p-4 rounded-xl mb-4 ${
                selectedRole === 'entrance' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <DoorOpen className={`w-10 h-10 ${
                  selectedRole === 'entrance' ? 'text-purple-600' : 'text-gray-500'
                }`} />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">门口接待模式</h3>
              <p className="text-sm text-gray-500 text-center">
                放置在会议室门口<br/>
                显示状态、接收订单通知、提醒服务
              </p>
            </div>
          </button>
        </div>

        {selectedRole && (
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <h4 className="font-medium text-gray-700 mb-3">选择关联会议室</h4>
            <div className="grid grid-cols-3 gap-3">
              {state.rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    selectedRoomId === room.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selectedRole}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          确认选择
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};