export type MeetingLevel = 'important' | 'normal';
export type MeetingStatus = 'upcoming' | 'ongoing' | 'ended';
export type RoomStatus = 'occupied' | 'available';
export type DeviceType = 'light' | 'aircon' | 'curtain' | 'projector' | 'tv';
export type DeviceStatus = 'online' | 'offline' | 'error';
export type ModalType = 'reminder' | 'confirm' | 'success' | 'order';

export interface Meeting {
  id: string;
  title: string;
  level: MeetingLevel;
  startTime: string;
  endTime: string;
  roomId: string;
  participants: string[];
  status: MeetingStatus;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: RoomStatus;
  currentMeeting: Meeting | null;
  devices: Device[];
  hasPeople: boolean;
  energySaving: boolean;
}

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  status: DeviceStatus;
  value?: number;
  isOn: boolean;
}

export interface Material {
  id: string;
  category: string;
  name: string;
  price: number;
  available: boolean;
}

export interface OrderItem {
  materialId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Config {
  reminderTime: number;
  refreshInterval: number;
  energySavingTimeout: number;
}

export interface MeetingState {
  meetings: Meeting[];
  rooms: Room[];
  materials: Material[];
  config: Config;
  activeModal: ModalType | null;
  modalData: Record<string, unknown>;
  currentRoomId: string | null;
}

export type MeetingAction =
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'END_MEETING'; payload: string }
  | { type: 'UPDATE_ROOM_STATUS'; payload: { roomId: string; status: RoomStatus } }
  | { type: 'UPDATE_DEVICE_STATUS'; payload: { roomId: string; deviceId: string; status: DeviceStatus } }
  | { type: 'TOGGLE_DEVICE'; payload: { roomId: string; deviceId: string } }
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'UPDATE_MATERIAL'; payload: Material }
  | { type: 'ORDER_MATERIAL'; payload: { roomId: string; items: OrderItem[] } }
  | { type: 'OPEN_MODAL'; payload: { type: ModalType; data?: Record<string, unknown> } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'UPDATE_CONFIG'; payload: Partial<Config> }
  | { type: 'SET_CURRENT_ROOM'; payload: string | null }
  | { type: 'UPDATE_MEETINGS'; payload: Meeting[] }
  | { type: 'UPDATE_ROOMS'; payload: Room[] }
  | { type: 'DETECT_PEOPLE'; payload: { roomId: string; hasPeople: boolean } }
  | { type: 'TOGGLE_ENERGY_SAVING'; payload: { roomId: string; enabled: boolean } };
