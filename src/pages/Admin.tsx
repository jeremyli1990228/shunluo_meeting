import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useMeeting } from '@/context/MeetingContext';
import { Material } from '@/types';

interface AdminProps {
  onBack: () => void;
}

export const Admin = ({ onBack }: AdminProps) => {
  const { state, updateConfig, updateMaterial } = useMeeting();
  const { config, materials } = state;
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({ category: '', name: '', price: 0 });

  const handleConfigChange = (key: 'reminderTime' | 'refreshInterval' | 'energySavingTimeout', value: number) => {
    updateConfig({ [key]: value });
  };

  const handleMaterialSave = () => {
    if (editingMaterial) {
      updateMaterial({ ...editingMaterial, ...newMaterial } as Material);
    }
    setEditingMaterial(null);
    setNewMaterial({ category: '', name: '', price: 0 });
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setNewMaterial(material);
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

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
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

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">物料管理</h2>
          <button
            onClick={() => {
              setEditingMaterial(null);
              setNewMaterial({ category: '', name: '', price: 0 });
            }}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {editingMaterial || Object.keys(newMaterial).some(k => newMaterial[k as keyof typeof newMaterial]) ? (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">
                {editingMaterial ? '编辑物料' : '新增物料'}
              </h3>
              <button onClick={() => { setEditingMaterial(null); setNewMaterial({}); }}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">品类</label>
                <input
                  type="text"
                  value={newMaterial.category || ''}
                  onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="如：咖啡"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">名称</label>
                <input
                  type="text"
                  value={newMaterial.name || ''}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="如：美式咖啡"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">价格</label>
                <input
                  type="number"
                  value={newMaterial.price || ''}
                  onChange={(e) => setNewMaterial({ ...newMaterial, price: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="0"
                />
              </div>
              <button
                onClick={handleMaterialSave}
                disabled={!newMaterial.category || !newMaterial.name || !newMaterial.price}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {materials.map(material => (
            <div
              key={material.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div>
                <span className="text-xs text-gray-400 mr-2">{material.category}</span>
                <span className="font-medium text-gray-800">{material.name}</span>
                <span className="text-gray-500 ml-2">¥{material.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditMaterial(material)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => updateMaterial({ ...material, available: !material.available })}
                  className={`p-2 rounded-lg transition-colors ${
                    material.available ? 'hover:bg-gray-200' : 'bg-red-100 hover:bg-red-200'
                  }`}
                >
                  <Trash2 className={`w-4 h-4 ${material.available ? 'text-gray-600' : 'text-red-600'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
