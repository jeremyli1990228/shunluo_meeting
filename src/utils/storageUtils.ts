import { Config, Material } from '@/types';

const CONFIG_KEY = 'meeting_config';
const MATERIALS_KEY = 'meeting_materials';

export const saveConfig = (config: Config): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const loadConfig = (defaultConfig: Config): Config => {
  const saved = localStorage.getItem(CONFIG_KEY);
  if (saved) {
    try {
      return { ...defaultConfig, ...JSON.parse(saved) };
    } catch {
      return defaultConfig;
    }
  }
  return defaultConfig;
};

export const saveMaterials = (materials: Material[]): void => {
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
};

export const loadMaterials = (defaultMaterials: Material[]): Material[] => {
  const saved = localStorage.getItem(MATERIALS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultMaterials;
    }
  }
  return defaultMaterials;
};

export const clearAll = (): void => {
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(MATERIALS_KEY);
};
