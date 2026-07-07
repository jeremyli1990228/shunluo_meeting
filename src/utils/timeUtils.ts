export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

export const getMinutesRemaining = (endTimeStr: string): number => {
  const now = new Date();
  const endTime = new Date(endTimeStr);
  const diff = endTime.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60)));
};

export const getMeetingStatus = (startTimeStr: string, endTimeStr: string): 'upcoming' | 'ongoing' | 'ended' => {
  const now = new Date();
  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  if (now < startTime) return 'upcoming';
  if (now >= startTime && now < endTime) return 'ongoing';
  return 'ended';
};

export const isMeetingOngoing = (startTimeStr: string, endTimeStr: string): boolean => {
  const now = new Date();
  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);
  return now >= startTime && now < endTime;
};

export const getDuration = (startTimeStr: string, endTimeStr: string): number => {
  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);
  return Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
};

export const getTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
};
