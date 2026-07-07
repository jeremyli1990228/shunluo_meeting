import { Building2, Users, Zap, WifiOff } from 'lucide-react';
import { Room } from '@/types';
import { formatTime, getMinutesRemaining } from '@/utils/timeUtils';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
}

export const RoomCard = ({ room, onClick }: RoomCardProps) => {
  const isOccupied = room.status === 'occupied';
  const isImportant = room.currentMeeting?.level === 'important';
  const hasError = room.devices.some(d => d.status === 'error');

  const cardClasses = isOccupied
    ? isImportant
      ? 'bg-gradient-to-br from-red-500 to-red-700 text-white'
      : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  const getDeviceStatusText = () => {
    const online = room.devices.filter(d => d.status === 'online').length;
    const total = room.devices.length;
    return `${online}/${total} 设备在线`;
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl p-5 shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${cardClasses}`}
    >
      {hasError && (
        <div className="absolute top-3 right-3">
          <WifiOff className={`w-5 h-5 ${isOccupied ? 'text-red-300' : 'text-red-500'}`} />
        </div>
      )}

      {room.energySaving && (
        <div className="absolute top-3 right-3">
          <Zap className={`w-5 h-5 ${isOccupied ? 'text-yellow-300' : 'text-yellow-500'}`} />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isOccupied ? 'bg-white/20' : 'bg-gray-200'}`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{room.name}</h3>
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-3 h-3" />
              <span>{room.capacity}人</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          isOccupied
            ? isImportant
              ? 'bg-red-400/30 text-red-100'
              : 'bg-blue-400/30 text-blue-100'
            : 'bg-gray-400/30 text-gray-200'
        }`}>
          {isOccupied ? (isImportant ? '重要' : '占用') : '空闲'}
        </span>
      </div>

      {isOccupied && room.currentMeeting && (
        <div className="space-y-3">
          <div>
            <p className="text-sm opacity-80 mb-1">当前会议</p>
            <p className="font-semibold truncate">{room.currentMeeting.title}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-70">
              {formatTime(room.currentMeeting.startTime)} - {formatTime(room.currentMeeting.endTime)}
            </span>
            <span className={`text-xs px-2 py-1 rounded-lg ${
              isImportant ? 'bg-red-400/20' : 'bg-blue-400/20'
            }`}>
              剩余 {getMinutesRemaining(room.currentMeeting.endTime)} 分钟
            </span>
          </div>
        </div>
      )}

      {!isOccupied && (
        <div className="mt-4 p-3 rounded-xl bg-white/10">
          <p className="text-sm opacity-70">{getDeviceStatusText()}</p>
        </div>
      )}
    </div>
  );
};
