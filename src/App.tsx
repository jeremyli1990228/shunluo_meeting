import { useState, useEffect } from 'react';
import { MeetingProvider, useMeeting } from '@/context/MeetingContext';
import { Dashboard } from '@/pages/Dashboard';
import { RoomDetail } from '@/pages/RoomDetail';
import { Admin } from '@/pages/Admin';
import { EntranceView } from '@/pages/EntranceView';
import { RoleSelection } from '@/components/RoleSelection';
import { Modal } from '@/components/Modal';
import { Settings } from 'lucide-react';

type InsidePage = 'dashboard' | 'room-detail' | 'admin';
type EntrancePage = 'dashboard' | 'orders';

const AppContent = () => {
  const [insidePage, setInsidePage] = useState<InsidePage>('dashboard');
  const [entrancePage, setEntrancePage] = useState<EntrancePage>('dashboard');
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const { state, setCurrentRoom } = useMeeting();
  const { currentRoomId, config } = state;

  // 检查是否已选择角色
  useEffect(() => {
    const storedConfig = localStorage.getItem('meeting_config');
    if (!storedConfig) {
      setShowRoleSelection(true);
    }
  }, []);

  const handleRoleSelected = () => {
    setShowRoleSelection(false);
  };

  const handleRoomClick = (roomId: string) => {
    setCurrentRoom(roomId);
    if (config.deviceRole === 'entrance') {
      setEntrancePage('orders');
    } else {
      setInsidePage('room-detail');
    }
  };

  const handleAdminClick = () => {
    setInsidePage('admin');
  };

  const handleBack = () => {
    if (config.deviceRole === 'entrance') {
      setEntrancePage('dashboard');
    } else {
      setInsidePage('dashboard');
    }
  };

  const handleSwitchRole = () => {
    setShowRoleSelection(true);
  };

  // 显示角色选择界面
  if (showRoleSelection) {
    return (
      <RoleSelection onComplete={handleRoleSelected} />
    );
  }

  // 门口接待模式
  if (config.deviceRole === 'entrance') {
    return (
      <div className="max-w-6xl mx-auto">
        {entrancePage === 'dashboard' && (
          <Dashboard onRoomClick={handleRoomClick} showOrderCount={true} />
        )}
        {entrancePage === 'orders' && (
          <EntranceView onBack={handleBack} />
        )}
        <button
          onClick={handleSwitchRole}
          className="fixed bottom-5 right-5 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow z-40"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        <Modal />
      </div>
    );
  }

  // 会议室内模式
  return (
    <div className="max-w-6xl mx-auto">
      {insidePage === 'dashboard' && (
        <Dashboard onRoomClick={handleRoomClick} onAdminClick={handleAdminClick} />
      )}
      {insidePage === 'room-detail' && currentRoomId && (
        <RoomDetail roomId={currentRoomId} onBack={handleBack} />
      )}
      {insidePage === 'admin' && <Admin onBack={handleBack} />}
      <button
        onClick={handleSwitchRole}
        className="fixed bottom-5 right-5 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow z-40"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
      <Modal />
    </div>
  );
};

function App() {
  return (
    <MeetingProvider>
      <AppContent />
    </MeetingProvider>
  );
}

export default App;
