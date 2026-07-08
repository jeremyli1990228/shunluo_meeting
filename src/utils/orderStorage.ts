import { MaterialOrder } from '@/types';

const ORDERS_KEY = 'meeting_orders';

export const loadOrders = (defaultOrders: MaterialOrder[]): MaterialOrder[] => {
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load orders:', e);
  }
  return defaultOrders;
};

export const saveOrders = (orders: MaterialOrder[]): void => {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
};

export const clearOrders = (): void => {
  localStorage.removeItem(ORDERS_KEY);
};