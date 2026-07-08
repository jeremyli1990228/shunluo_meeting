import { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from 'react';
import { MeetingState, MeetingAction, Meeting, Room, ScenePreset, MaterialOrder, DeviceRole, OrderStatus } from '@/types';
import { mockMeetings, mockRooms, mockMaterials, mockOrders, defaultConfig } from '@/data/mockData';
import { loadConfig, loadMaterials, saveConfig, saveMaterials } from '@/utils/storageUtils';
import { loadOrders, saveOrders } from '@/utils/orderStorage';
import { getMeetingStatus } from '@/utils/timeUtils';

const initialState: MeetingState = {
  meetings: mockMeetings,
  rooms: mockRooms,
  materials: loadMaterials(mockMaterials),
  orders: loadOrders(mockOrders),
  config: loadConfig(defaultConfig),
  activeModal: null,
  modalData: {},
  currentRoomId: loadConfig(defaultConfig).currentRoomId || null,
};

const sceneConfigs: Record<ScenePreset, Record<string, { isOn: boolean; value: number }>> = {
  'standard': {
    light: { isOn: true, value: 80 },
    projector: { isOn: true, value: 100 },
    volume: { isOn: true, value: 70 },
    aircon: { isOn: true, value: 24 },
    curtain: { isOn: true, value: 50 },
    tv: { isOn: false, value: 0 },
  },
  'presentation': {
    light: { isOn: true, value: 50 },
    projector: { isOn: true, value: 100 },
    volume: { isOn: true, value: 80 },
    aircon: { isOn: true, value: 25 },
    curtain: { isOn: true, value: 0 },
    tv: { isOn: false, value: 0 },
  },
  'energy-saving': {
    light: { isOn: true, value: 30 },
    projector: { isOn: false, value: 0 },
    volume: { isOn: false, value: 0 },
    aircon: { isOn: false, value: 0 },
    curtain: { isOn: true, value: 100 },
    tv: { isOn: false, value: 0 },
  },
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

    case 'APPLY_SCENE': {
      const sceneConfig = sceneConfigs[action.payload.preset];
      const newRooms = state.rooms.map(r => {
        if (r.id === action.payload.roomId) {
          return {
            ...r,
            devices: r.devices.map(d => {
              const config = sceneConfig[d.type];
              if (config) {
                return { ...d, isOn: config.isOn, value: config.value };
              }
              return d;
            }),
          };
        }
        return r;
      });
      return { ...state, rooms: newRooms };
    }

    case 'TURN_OFF_ALL_DEVICES': {
      const newRooms = state.rooms.map(r => {
        if (r.id === action.payload) {
          return {
            ...r,
            devices: r.devices.map(d => ({ ...d, isOn: false, value: 0 })),
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

    case 'CREATE_ORDER': {
      const newOrders = [...state.orders, action.payload];
      saveOrders(newOrders);
      return { ...state, orders: newOrders };
    }

    case 'UPDATE_ORDER_STATUS': {
      const newOrders = state.orders.map(o =>
        o.id === action.payload.orderId
          ? { ...o, status: action.payload.status, updatedAt: new Date().toISOString() }
          : o
      );
      saveOrders(newOrders);
      return { ...state, orders: newOrders };
    }

    case 'CLEAR_ORDERS': {
      const newOrders = state.orders.filter(o => o.roomId !== action.payload);
      saveOrders(newOrders);
      return { ...state, orders: newOrders };
    }

    case 'UPDATE_ORDERS_FROM_STORAGE': {
      return { ...state, orders: action.payload };
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
      const newConfig = { ...state.config, currentRoomId: action.payload || '' };
      saveConfig(newConfig);
      return { ...state, currentRoomId: action.payload, config: newConfig };
    }

    case 'SET_DEVICE_ROLE': {
      const newConfig = { ...state.config, deviceRole: action.payload };
      saveConfig(newConfig);
      return { ...state, config: newConfig };
    }

    case 'UPDATE_MEETINGS': {
      return { ...state, meetings: action.payload };
    }

    case 'UPDATE_ROOMS': {
      return { ...state, rooms: action.payload };
    }

    case 'DETECT_PEOPLE': {
      const newRooms = state.rooms.map(r => {
        if (r.id === action.payload.roomId) {
          const hasPeople = action.payload.hasPeople;
          let newDevices = r.devices;
          
          if (hasPeople && !r.hasPeople) {
            newDevices = r.devices.map(d => ({ ...d, isOn: true, value: d.type === 'aircon' ? 24 : d.type === 'light' ? 80 : 100 }));
          }
          
          return { ...r, hasPeople, devices: newDevices };
        }
        return r;
      });
      return { ...state, rooms: newRooms };
    }

    case 'TOGGLE_ENERGY_SAVING': {
      const newRooms = state.rooms.map(r => {
        if (r.id === action.payload.roomId) {
          const enabled = action.payload.enabled;
          let newDevices = r.devices;
          
          if (enabled) {
            newDevices = r.devices.map(d => {
              if (d.type === 'light') return { ...d, isOn: true, value: 30 };
              if (d.type === 'aircon') return { ...d, isOn: false, value: 0 };
              if (d.type === 'projector') return { ...d, isOn: false, value: 0 };
              if (d.type === 'volume') return { ...d, isOn: false, value: 0 };
              return d;
            });
          }
          
          return { ...r, energySaving: enabled, devices: newDevices };
        }
        return r;
      });
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
  applyScene: (roomId: string, preset: ScenePreset) => void;
  turnOffAllDevices: (roomId: string) => void;
  detectPeople: (roomId: string, hasPeople: boolean) => void;
  createOrder: (roomId: string, roomName: string, items: { materialId: string; name: string; quantity: number; price: number }[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  clearOrders: (roomId: string) => void;
  updateConfig: (config: Partial<{ reminderTime: number; refreshInterval: number; energySavingTimeout: number; deviceRole: DeviceRole; currentRoomId: string }>) => void;
  setDeviceRole: (role: DeviceRole) => void;
  setCurrentRoom: (roomId: string | null) => void;
}

const MeetingContext = createContext<MeetingContextType | null>(null);

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const updateMeetingStatus = () => {
      const currentState = stateRef.current;
      const updatedMeetings: Meeting[] = currentState.meetings.map(m => ({
        ...m,
        status: getMeetingStatus(m.startTime, m.endTime),
      }));

      const updatedRooms: Room[] = currentState.rooms.map(r => {
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
  }, [state.config.refreshInterval]);

  useEffect(() => {
    const checkReminders = () => {
      const currentState = stateRef.current;
      const now = new Date();
      
      currentState.meetings.forEach(meeting => {
        if (meeting.status !== 'ongoing') return;

        const endTime = new Date(meeting.endTime);
        const minutesRemaining = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60));
        const reminderTime = currentState.config.reminderTime;

        if (minutesRemaining <= reminderTime && minutesRemaining > 0 && !meeting.reminded) {
          dispatch({
            type: 'UPDATE_MEETINGS',
            payload: currentState.meetings.map(m => 
              m.id === meeting.id ? { ...m, reminded: true } : m
            ),
          });
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

    const interval = setInterval(checkReminders, 30 * 1000);
    return () => clearInterval(interval);
  }, [state.config.reminderTime]);

  useEffect(() => {
    const checkEnergySaving = () => {
      const currentState = stateRef.current;
      currentState.rooms.forEach(room => {
        if (!room.currentMeeting || room.currentMeeting.status !== 'ongoing') return;

        if (!room.hasPeople && !room.energySaving) {
          dispatch({ type: 'TOGGLE_ENERGY_SAVING', payload: { roomId: room.id, enabled: true } });
        } else if (room.hasPeople && room.energySaving) {
          dispatch({ type: 'TOGGLE_ENERGY_SAVING', payload: { roomId: room.id, enabled: false } });
        }
      });
    };

    const interval = setInterval(checkEnergySaving, state.config.energySavingTimeout * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.config.energySavingTimeout]);

  useEffect(() => {
    const checkPostMeeting = () => {
      const currentState = stateRef.current;
      currentState.rooms.forEach(room => {
        if (room.status === 'available' && !room.hasPeople) {
          const allOff = room.devices.every(d => !d.isOn);
          if (!allOff) {
            dispatch({ type: 'TURN_OFF_ALL_DEVICES', payload: room.id });
          }
        }
      });
    };

    const interval = setInterval(checkPostMeeting, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 跨窗口实时同步订单
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('meeting_orders');
      bc.onmessage = (event) => {
        if (event.data?.type === 'ORDER_UPDATED') {
          const storedOrders = loadOrders([]);
          dispatch({ type: 'UPDATE_ORDERS_FROM_STORAGE', payload: storedOrders } as MeetingAction);
        }
      };
    }

    // Fallback: 使用 storage 事件
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'meeting_orders') {
        const storedOrders = loadOrders([]);
        dispatch({ type: 'UPDATE_ORDERS_FROM_STORAGE', payload: storedOrders } as MeetingAction);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const broadcastOrderUpdate = () => {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('meeting_orders');
      bc.postMessage({ type: 'ORDER_UPDATED' });
      bc.close();
    }
  };

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

  const applyScene = (roomId: string, preset: ScenePreset) => {
    dispatch({ type: 'APPLY_SCENE', payload: { roomId, preset } });
  };

  const turnOffAllDevices = (roomId: string) => {
    dispatch({ type: 'TURN_OFF_ALL_DEVICES', payload: roomId });
  };

  const detectPeople = (roomId: string, hasPeople: boolean) => {
    dispatch({ type: 'DETECT_PEOPLE', payload: { roomId, hasPeople } });
  };

  const createOrder = (roomId: string, roomName: string, items: { materialId: string; name: string; quantity: number; price: number }[]) => {
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder: MaterialOrder = {
      id: `order_${Date.now()}`,
      roomId,
      roomName,
      items,
      totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'CREATE_ORDER', payload: newOrder });
    broadcastOrderUpdate();
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
    broadcastOrderUpdate();
  };

  const clearOrders = (roomId: string) => {
    dispatch({ type: 'CLEAR_ORDERS', payload: roomId });
  };

  const updateConfig = (config: Partial<{ reminderTime: number; refreshInterval: number; energySavingTimeout: number; deviceRole: DeviceRole; currentRoomId: string }>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  };

  const setDeviceRole = (role: DeviceRole) => {
    dispatch({ type: 'SET_DEVICE_ROLE', payload: role });
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
        applyScene,
        turnOffAllDevices,
        detectPeople,
        createOrder,
        updateOrderStatus,
        clearOrders,
        updateConfig,
        setDeviceRole,
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