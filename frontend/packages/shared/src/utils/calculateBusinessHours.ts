export const calculateBusinessHours = (start: string, end: string): number => {
  const [startHour] = start.split(":").map(Number);
  const [endHour] = end.split(":").map(Number);
  return Math.max(0, endHour - startHour);
};
