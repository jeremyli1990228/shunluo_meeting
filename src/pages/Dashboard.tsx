import { useState } from 'react';
import { Calendar, Users, Building2, Settings, RefreshCw } from 'lucide-react';
import { RoomCard } from '@/components/RoomCard';
import { DeviceStatus } from '@/components/DeviceStatus';
import { useMeeting } from '@/context/MeetingContext';
import { formatDateTime } from '@/utils/timeUtils';

interface DashboardProps {
  onRoomClick: (roomId: string) => void;
  onAdminClick: () => void;
}

export const Dashboard = ({ onRoomClick, onAdminClick }: DashboardProps) => {
  const { state, dispatch } = useMeeting();
  const { rooms, config } = state;
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const totalDevices = rooms.reduce((sum, r) => sum + r.devices.length, 0);
  const onlineDevices = rooms.reduce((sum, r) => sum + r.devices.filter(d => d.status === 'online').length, 0);

  const handleRefresh = () => {
    dispatch({ type: 'UPDATE_MEETINGS', payload: state.meetings });
    dispatch({ type: 'UPDATE_ROOMS', payload: state.rooms });
    setLastRefresh(new Date());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">智慧会议驾驶舱</h1>
          <p className="text-gray-500 text-sm mt-1">{formatDateTime(lastRefresh.toISOString())}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={onAdminClick}
            className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">会议室总数</p>
              <p className="text-2xl font-bold text-gray-800">{rooms.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">当前占用</p>
              <p className="text-2xl font-bold text-gray-800">{occupiedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">设备在线</p>
              <p className="text-2xl font-bold text-gray-800">{onlineDevices}/{totalDevices}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">全局设备状态</h2>
        <DeviceStatus devices={rooms.flatMap(r => r.devices)} showControls={false} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">会议室状态</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room.id)} />
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-400 text-sm">
        刷新间隔：{config.refreshInterval}秒 | 提醒时间：{config.reminderTime}分钟 | 节能超时：{config.energySavingTimeout}分钟
      </div>
    </div>
  );
};
