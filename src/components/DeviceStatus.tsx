import { Lightbulb, Thermometer, Wind, Presentation, Monitor, Volume2, Power } from 'lucide-react';
import { Device } from '@/types';

interface DeviceStatusProps {
  devices: Device[];
  onToggle?: (deviceId: string) => void;
  showControls?: boolean;
}

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'light':
      return Lightbulb;
    case 'aircon':
      return Thermometer;
    case 'curtain':
      return Wind;
    case 'projector':
      return Presentation;
    case 'tv':
      return Monitor;
    case 'volume':
      return Volume2;
    default:
      return Power;
  }
};

const getStatusColor = (status: string, isOn: boolean) => {
  if (!isOn) return 'text-gray-400';
  switch (status) {
    case 'online':
      return 'text-green-500';
    case 'offline':
      return 'text-gray-400';
    case 'error':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
};

export const DeviceStatus = ({ devices, onToggle, showControls = true }: DeviceStatusProps) => {
  return (
    <div className="grid grid-cols-6 gap-3">
      {devices.map(device => {
        const Icon = getDeviceIcon(device.type);
        const colorClass = getStatusColor(device.status, device.isOn);
        const bgClass = device.isOn && device.status === 'online' ? 'bg-gray-50' : 'bg-gray-100';

        return (
          <button
            key={device.id}
            onClick={() => showControls && onToggle?.(device.id)}
            disabled={!showControls || device.status !== 'online'}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${bgClass} ${
              showControls && device.status === 'online' ? 'cursor-pointer hover:bg-gray-200' : 'cursor-default'
            } ${!showControls ? 'opacity-70' : ''}`}
          >
            <div className={`relative ${colorClass}`}>
              <Icon className={`w-6 h-6 ${!device.isOn ? 'opacity-40' : ''}`} />
              {device.status === 'error' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </div>
            <span className="text-xs text-gray-600 text-center">{device.name}</span>
            {device.value !== undefined && device.isOn && (
              <span className={`text-xs font-medium ${colorClass}`}>
                {device.type === 'aircon' ? `${device.value}°C` : `${device.value}%`}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
