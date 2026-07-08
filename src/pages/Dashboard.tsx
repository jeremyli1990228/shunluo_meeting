import { useState } from 'react';
import { Calendar, Users, Building2, Layers, ChevronDown } from 'lucide-react';
import { RoomCard } from '@/components/RoomCard';
import { useMeeting } from '@/context/MeetingContext';
import { mockBuildings } from '@/data/mockData';

interface DashboardProps {
  onRoomClick: (roomId: string) => void;
  onAdminClick?: () => void;
  showOrderCount?: boolean;
}

export const Dashboard = ({ onRoomClick, showOrderCount = false }: DashboardProps) => {
  const { state } = useMeeting();
  const { rooms, orders, config } = state;
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [expandedBuilding, setExpandedBuilding] = useState<string>('b1');

  const filteredRooms = selectedGroup === 'all'
    ? rooms
    : rooms.filter(r => r.area === selectedGroup || r.floor === selectedGroup);

  const occupiedCount = filteredRooms.filter(r => r.status === 'occupied').length;
  const totalDevices = filteredRooms.reduce((sum, r) => sum + r.devices.length, 0);
  const onlineDevices = filteredRooms.reduce((sum, r) => sum + r.devices.filter(d => d.status === 'online').length, 0);

  const building = mockBuildings[0];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧分组导航 */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
        {/* 建筑选择下拉 */}
        <div className="p-4 border-b border-gray-100">
          <button className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <span className="font-medium text-gray-800 text-sm">{building.name}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 分组列表 */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* 全部 */}
          <button
            onClick={() => setSelectedGroup('all')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
              selectedGroup === 'all'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">全部</span>
          </button>

          {/* A栋 */}
          <div className="mt-1">
            <button
              onClick={() => setExpandedBuilding(expandedBuilding === 'b1' ? '' : 'b1')}
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${expandedBuilding === 'b1' ? '' : '-rotate-90'}`} />
              <Building2 className="w-4 h-4" />
              <span className="text-xs font-medium">A栋</span>
            </button>

            {expandedBuilding === 'b1' && (
              <div className="ml-4">
                {building.groups.filter(g => g.id !== 'all').map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      selectedGroup === group.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">{group.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">会议室总数</p>
                <p className="text-2xl font-bold text-gray-800">{filteredRooms.length}</p>
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

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            {selectedGroup === 'all' ? '全部会议室' : `${selectedGroup} 会议室`}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(room => {
              const roomOrderCount = showOrderCount
                ? orders.filter(o => o.roomId === room.id && o.status === 'pending').length
                : 0;
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  orderCount={roomOrderCount}
                  onClick={() => onRoomClick(room.id)}
                />
              );
            })}
          </div>
          {filteredRooms.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>该分组暂无会议室</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          刷新间隔：{config.refreshInterval}秒 | 提醒时间：{config.reminderTime}分钟 | 节能超时：{config.energySavingTimeout}分钟
        </div>
      </div>
    </div>
  );
};
