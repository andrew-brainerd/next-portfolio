import dayjs, { unix } from 'dayjs';

export const getDateTime = (date: number | string): string => {
  if (typeof date === 'number') {
    return dayjs(unix(date)).format('M/DD/YYYY h:mm A');
  }

  return dayjs(date).format('M/DD/YYYY h:mm A');
};
