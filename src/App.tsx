import { useState } from 'react';
import { MeetingProvider, useMeeting } from '@/context/MeetingContext';
import { Dashboard } from '@/pages/Dashboard';
import { RoomDetail } from '@/pages/RoomDetail';
import { Admin } from '@/pages/Admin';
import { Modal } from '@/components/Modal';

type Page = 'dashboard' | 'room-detail' | 'admin';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { state, setCurrentRoom } = useMeeting();
  const { currentRoomId } = state;

  const handleRoomClick = (roomId: string) => {
    setCurrentRoom(roomId);
    setCurrentPage('room-detail');
  };

  const handleAdminClick = () => {
    setCurrentPage('admin');
  };

  const handleBack = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {currentPage === 'dashboard' && (
        <Dashboard onRoomClick={handleRoomClick} onAdminClick={handleAdminClick} />
      )}
      {currentPage === 'room-detail' && currentRoomId && (
        <RoomDetail roomId={currentRoomId} onBack={handleBack} />
      )}
      {currentPage === 'admin' && <Admin onBack={handleBack} />}
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
