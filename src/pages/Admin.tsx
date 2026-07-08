import { ArrowLeft } from 'lucide-react';
import { useMeeting } from '@/context/MeetingContext';

interface AdminProps {
  onBack: () => void;
}

export const Admin = ({ onBack }: AdminProps) => {
  const { state, updateConfig } = useMeeting();
  const { config } = state;

  const handleConfigChange = (key: 'reminderTime' | 'refreshInterval' | 'energySavingTimeout', value: number) => {
    updateConfig({ [key]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">系统管理</h1>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">系统配置</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              会议结束提醒时间（分钟）
            </label>
            <div className="flex gap-2">
              {[10, 15, 20].map(time => (
                <button
                  key={time}
                  onClick={() => handleConfigChange('reminderTime', time)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    config.reminderTime === time
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {time}分钟
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              页面刷新间隔（秒）
            </label>
            <div className="flex gap-2">
              {[15, 30, 60].map(time => (
                <button
                  key={time}
                  onClick={() => handleConfigChange('refreshInterval', time)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    config.refreshInterval === time
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {time}秒
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              节能模式超时时间（分钟）
            </label>
            <div className="flex gap-2">
              {[5, 10, 15].map(time => (
                <button
                  key={time}
                  onClick={() => handleConfigChange('energySavingTimeout', time)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    config.energySavingTimeout === time
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {time}分钟
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
