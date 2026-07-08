import { Building2, Users, Zap, WifiOff, MapPin, ShoppingBag, Phone } from 'lucide-react';
import { Room } from '@/types';
import { formatTime, getMinutesRemaining } from '@/utils/timeUtils';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
  orderCount?: number;
  callCount?: number;
}

export const RoomCard = ({ room, onClick, orderCount = 0, callCount = 0 }: RoomCardProps) => {
  const isOccupied = room.status === 'occupied';
  const isImportant = room.currentMeeting?.level === 'important';
  const hasError = room.devices.some(d => d.status === 'error');

  const cardClasses = isOccupied
    ? isImportant
      ? 'bg-gradient-to-br from-red-500 to-red-700 text-white'
      : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] overflow-hidden ${cardClasses}`}
    >
      {/* 订单标记 */}
      {orderCount > 0 && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold animate-pulse">
          <ShoppingBag className="w-3 h-3" />
          {orderCount}
        </div>
      )}

      {/* 呼叫标记 */}
      {callCount > 0 && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
          <Phone className="w-3 h-3" />
          {callCount}
        </div>
      )}

      {/* 错误状态图标 */}
      {hasError && orderCount === 0 && callCount === 0 && (
        <div className="absolute top-3 right-3 z-10">
          <WifiOff className={`w-5 h-5 ${isOccupied ? 'text-red-300' : 'text-red-500'}`} />
        </div>
      )}

      {/* 节能模式图标 */}
      {room.energySaving && !hasError && orderCount === 0 && callCount === 0 && (
        <div className="absolute top-3 right-3 z-10">
          <Zap className={`w-5 h-5 ${isOccupied ? 'text-yellow-300' : 'text-yellow-500'}`} />
        </div>
      )}

      {isOccupied ? (
        <>
          {/* 占用状态：会议信息 */}
          <div className="p-5 relative">
            {/* 顶部信息：会议室名 + 标签 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isImportant ? 'bg-white/20' : 'bg-white/20'}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">{room.name}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isImportant ? 'bg-white/25 text-white' : 'bg-white/25 text-white'
              }`}>
                {isImportant ? '重要' : '占用'}
              </span>
            </div>

            {/* 人数和楼层 */}
            <div className="flex items-center gap-3 text-xs opacity-80 mb-4">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {room.capacity}人
              </span>
              {room.floor && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {room.floor}
                </span>
              )}
            </div>

            {/* 会议时间（大字体） */}
            <div className="text-2xl font-bold tracking-wider">
              {formatTime(room.currentMeeting?.startTime || '')}-{formatTime(room.currentMeeting?.endTime || '')}
            </div>
          </div>

          {/* 底部：剩余时长 */}
          <div className={`px-5 py-3 text-sm ${
            isImportant ? 'bg-white/15' : 'bg-white/15'
          }`}>
            <div className="flex items-center justify-between">
              <span className="opacity-80">剩余时长</span>
              <span className="font-semibold">还有 {getMinutesRemaining(room.currentMeeting?.endTime || '')} 分钟结束</span>
            </div>
          </div>
        </>
      ) : (
        /* 空闲状态 */
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gray-200">
                <Building2 className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="font-bold text-base text-gray-800">{room.name}</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
              空闲
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {room.capacity}人
            </span>
            {room.floor && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {room.floor}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
