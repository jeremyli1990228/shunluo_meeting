import { ServiceCall } from '@/types';

const STORAGE_KEY = 'meeting_service_calls';

export const loadCalls = (defaultCalls: ServiceCall[]): ServiceCall[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load service calls from localStorage:', error);
  }
  return defaultCalls;
};

export const saveCalls = (calls: ServiceCall[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calls));
  } catch (error) {
    console.error('Failed to save service calls to localStorage:', error);
  }
};

export const generateCallId = (): string => {
  return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};