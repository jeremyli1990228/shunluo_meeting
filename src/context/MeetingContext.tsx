import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { MeetingState, MeetingAction, Meeting, Room } from '@/types';
import { mockMeetings, mockRooms, mockMaterials, defaultConfig } from '@/data/mockData';
import { loadConfig, loadMaterials, saveConfig, saveMaterials } from '@/utils/storageUtils';
import { getMeetingStatus } from '@/utils/timeUtils';

const initialState: MeetingState = {
  meetings: mockMeetings,
  rooms: mockRooms,
  materials: loadMaterials(mockMaterials),
  config: loadConfig(defaultConfig),
  activeModal: null,
  modalData: {},
  currentRoomId: null,
};

const reducer = (state: MeetingState, action: MeetingAction): MeetingState => {
  switch (action.type) {
    case 'ADD_MEETING': {
      const newMeetings = [...state.meetings, action.payload];
      const roomIndex = state.rooms.findIndex(r => r.id === action.payload.roomId);
      if (roomIndex !== -1) {
        const newRooms = [...state.rooms];
        newRooms[roomIndex] = {
          ...newRooms[roomIndex],
          status: 'occupied',
          currentMeeting: action.payload,
        };
        return { ...state, meetings: newMeetings, rooms: newRooms };
      }
      return { ...state, meetings: newMeetings };
    }

    case 'END_MEETING': {
      const newMeetings = state.meetings.map(m =>
        m.id === action.payload ? { ...m, status: 'ended' as const } : m
      );
      const newRooms = state.rooms.map(r =>
        r.currentMeeting?.id === action.payload
          ? { ...r, status: 'available' as const, currentMeeting: null }
          : r
      );
      return { ...state, meetings: newMeetings, rooms: newRooms };
    }

    case 'UPDATE_ROOM_STATUS': {
      const newRooms = state.rooms.map(r =>
        r.id === action.payload.roomId ? { ...r, status: action.payload.status } : r
      );
      return { ...state, rooms: newRooms };
    }

    case 'UPDATE_DEVICE_STATUS': {
      const newRooms = state.rooms.map(r => {
        if (r.id === action.payload.roomId) {
          return {
            ...r,
            devices: r.devices.map(d =>
              d.id === action.payload.deviceId
                ? { ...d, status: action.payload.status }
                : d
            ),
          };
        }
        return r;
      });
      return { ...state, rooms: newRooms };
    }

    case 'TOGGLE_DEVICE': {
      const newRooms = state.rooms.map(r => {
        if (r.id === action.payload.roomId) {
          return {
            ...r,
            devices: r.devices.map(d =>
              d.id === action.payload.deviceId ? { ...d, isOn: !d.isOn } : d
            ),
          };
        }
        return r;
      });
      return { ...state, rooms: newRooms };
    }

    case 'ADD_MATERIAL': {
      const newMaterials = [...state.materials, action.payload];
      saveMaterials(newMaterials);
      return { ...state, materials: newMaterials };
    }

    case 'UPDATE_MATERIAL': {
      const newMaterials = state.materials.map(m =>
        m.id === action.payload.id ? action.payload : m
      );
      saveMaterials(newMaterials);
      return { ...state, materials: newMaterials };
    }

    case 'ORDER_MATERIAL': {
      return {
        ...state,
        activeModal: 'success',
        modalData: { order: action.payload },
      };
    }

    case 'OPEN_MODAL': {
      return {
        ...state,
        activeModal: action.payload.type,
        modalData: action.payload.data || {},
      };
    }

    case 'CLOSE_MODAL': {
      return { ...state, activeModal: null, modalData: {} };
    }

    case 'UPDATE_CONFIG': {
      const newConfig = { ...state.config, ...action.payload };
      saveConfig(newConfig);
      return { ...state, config: newConfig };
    }

    case 'SET_CURRENT_ROOM': {
      return { ...state, currentRoomId: action.payload };
    }

    case 'UPDATE_MEETINGS': {
      return { ...state, meetings: action.payload };
    }

    case 'UPDATE_ROOMS': {
      return { ...state, rooms: action.payload };
    }

    case 'DETECT_PEOPLE': {
      const newRooms = state.rooms.map(r =>
        r.id === action.payload.roomId ? { ...r, hasPeople: action.payload.hasPeople } : r
      );
      return { ...state, rooms: newRooms };
    }

    case 'TOGGLE_ENERGY_SAVING': {
      const newRooms = state.rooms.map(r =>
        r.id === action.payload.roomId ? { ...r, energySaving: action.payload.enabled } : r
      );
      return { ...state, rooms: newRooms };
    }

    default:
      return state;
  }
};

interface MeetingContextType {
  state: MeetingState;
  dispatch: React.Dispatch<MeetingAction>;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'status'>) => void;
  endMeeting: (meetingId: string) => void;
  toggleDevice: (roomId: string, deviceId: string) => void;
  orderMaterials: (roomId: string, items: { materialId: string; name: string; quantity: number; price: number }[]) => void;
  updateConfig: (config: Partial<{ reminderTime: number; refreshInterval: number; energySavingTimeout: number }>) => void;
  updateMaterial: (material: { id: string; category: string; name: string; price: number; available: boolean }) => void;
  setCurrentRoom: (roomId: string | null) => void;
}

const MeetingContext = createContext<MeetingContextType | null>(null);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const updateMeetingStatus = () => {
      const updatedMeetings: Meeting[] = state.meetings.map(m => ({
        ...m,
        status: getMeetingStatus(m.startTime, m.endTime),
      }));

      const updatedRooms: Room[] = state.rooms.map(r => {
        const meeting = r.currentMeeting
          ? updatedMeetings.find(m => m.id === r.currentMeeting?.id)
          : null;
        return {
          ...r,
          status: meeting?.status === 'ongoing' ? 'occupied' : 'available',
          currentMeeting: meeting?.status === 'ongoing' ? meeting : null,
        };
      });

      dispatch({ type: 'UPDATE_MEETINGS', payload: updatedMeetings });
      dispatch({ type: 'UPDATE_ROOMS', payload: updatedRooms });
    };

    updateMeetingStatus();
    const interval = setInterval(updateMeetingStatus, state.config.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [state.config.refreshInterval, state.meetings, state.rooms]);

  useEffect(() => {
    const checkReminders = () => {
      state.meetings.forEach(meeting => {
        if (meeting.status !== 'ongoing') return;

        const endTime = new Date(meeting.endTime);
        const now = new Date();
        const minutesRemaining = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));

        if (minutesRemaining === state.config.reminderTime) {
          dispatch({
            type: 'OPEN_MODAL',
            payload: {
              type: 'reminder',
              data: { meeting, minutesRemaining },
            },
          });
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(interval);
  }, [state.meetings, state.config.reminderTime]);

  useEffect(() => {
    const checkEnergySaving = () => {
      state.rooms.forEach(room => {
        if (!room.currentMeeting || room.currentMeeting.status !== 'ongoing') return;

        if (!room.hasPeople && !room.energySaving) {
          dispatch({ type: 'TOGGLE_ENERGY_SAVING', payload: { roomId: room.id, enabled: true } });
        } else if (room.hasPeople && room.energySaving) {
          dispatch({ type: 'TOGGLE_ENERGY_SAVING', payload: { roomId: room.id, enabled: false } });
        }
      });
    };

    checkEnergySaving();
    const interval = setInterval(checkEnergySaving, state.config.energySavingTimeout * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.rooms, state.config.energySavingTimeout]);

  const addMeeting = (meetingData: Omit<Meeting, 'id' | 'status'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: `m${Date.now()}`,
      status: 'upcoming',
    };
    dispatch({ type: 'ADD_MEETING', payload: newMeeting });
  };

  const endMeeting = (meetingId: string) => {
    dispatch({ type: 'END_MEETING', payload: meetingId });
  };

  const toggleDevice = (roomId: string, deviceId: string) => {
    dispatch({ type: 'TOGGLE_DEVICE', payload: { roomId, deviceId } });
  };

  const orderMaterials = (roomId: string, items: { materialId: string; name: string; quantity: number; price: number }[]) => {
    dispatch({ type: 'ORDER_MATERIAL', payload: { roomId, items } });
  };

  const updateConfig = (config: Partial<{ reminderTime: number; refreshInterval: number; energySavingTimeout: number }>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  };

  const updateMaterial = (material: { id: string; category: string; name: string; price: number; available: boolean }) => {
    dispatch({ type: 'UPDATE_MATERIAL', payload: material });
  };

  const setCurrentRoom = (roomId: string | null) => {
    dispatch({ type: 'SET_CURRENT_ROOM', payload: roomId });
  };

  return (
    <MeetingContext.Provider
      value={{
        state,
        dispatch,
        addMeeting,
        endMeeting,
        toggleDevice,
        orderMaterials,
        updateConfig,
        updateMaterial,
        setCurrentRoom,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};
