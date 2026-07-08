export type MeetingLevel = 'important' | 'normal';
export type MeetingStatus = 'upcoming' | 'ongoing' | 'ended';
export type RoomStatus = 'occupied' | 'available';
export type DeviceType = 'light' | 'aircon' | 'curtain' | 'projector' | 'tv' | 'volume';
export type DeviceStatus = 'online' | 'offline' | 'error';
export type ModalType = 'reminder' | 'confirm' | 'success' | 'order';
export type DeviceRole = 'inside' | 'entrance';
export type OrderStatus = 'pending' | 'preparing' | 'delivered' | 'cancelled';

export interface MeetingAttachment {
  id: string;
  name: string;
  type: string;
  size?: string;
}

export interface Meeting {
  id: string;
  title: string;
  level: MeetingLevel;
  startTime: string;
  endTime: string;
  roomId: string;
  participants: string[];
  status: MeetingStatus;
  reminded?: boolean;
  contact?: string;
  category?: string;
  department?: string;
  content?: string;
  attachments?: MeetingAttachment[];
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
  currentScene?: ScenePreset;
  building?: string;
  floor?: string;
  area?: string;
}

export interface Building {
  id: string;
  name: string;
  groups: RoomGroup[];
}

export interface RoomGroup {
  id: string;
  name: string;
  icon?: string;
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

export interface MaterialOrder {
  id: string;
  roomId: string;
  roomName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Config {
  reminderTime: number;
  refreshInterval: number;
  energySavingTimeout: number;
  deviceRole: DeviceRole;
  currentRoomId: string;
}

export interface MeetingState {
  meetings: Meeting[];
  rooms: Room[];
  materials: Material[];
  orders: MaterialOrder[];
  config: Config;
  activeModal: ModalType | null;
  modalData: Record<string, unknown>;
  currentRoomId: string | null;
}

export type ScenePreset = 'standard' | 'presentation' | 'energy-saving';

export interface SceneConfig {
  light: { isOn: boolean; value: number };
  projector: { isOn: boolean; value: number };
  volume: { isOn: boolean; value: number };
  aircon: { isOn: boolean; value: number };
  curtain: { isOn: boolean; value: number };
  tv: { isOn: boolean; value: number };
}

export type MeetingAction =
  | { type: 'ADD_MEETING'; payload: Meeting }
  | { type: 'END_MEETING'; payload: string }
  | { type: 'UPDATE_ROOM_STATUS'; payload: { roomId: string; status: RoomStatus } }
  | { type: 'UPDATE_DEVICE_STATUS'; payload: { roomId: string; deviceId: string; status: DeviceStatus } }
  | { type: 'TOGGLE_DEVICE'; payload: { roomId: string; deviceId: string } }
  | { type: 'APPLY_SCENE'; payload: { roomId: string; preset: ScenePreset } }
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'UPDATE_MATERIAL'; payload: Material }
  | { type: 'CREATE_ORDER'; payload: MaterialOrder }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'CLEAR_ORDERS'; payload: string }
  | { type: 'UPDATE_ORDERS_FROM_STORAGE'; payload: MaterialOrder[] }
  | { type: 'OPEN_MODAL'; payload: { type: ModalType; data?: Record<string, unknown> } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'UPDATE_CONFIG'; payload: Partial<Config> }
  | { type: 'SET_CURRENT_ROOM'; payload: string | null }
  | { type: 'SET_DEVICE_ROLE'; payload: DeviceRole }
  | { type: 'UPDATE_MEETINGS'; payload: Meeting[] }
  | { type: 'UPDATE_ROOMS'; payload: Room[] }
  | { type: 'DETECT_PEOPLE'; payload: { roomId: string; hasPeople: boolean } }
  | { type: 'TOGGLE_ENERGY_SAVING'; payload: { roomId: string; enabled: boolean } }
  | { type: 'TURN_OFF_ALL_DEVICES'; payload: string }
  | { type: 'TURN_ON_ALL_DEVICES'; payload: string };
