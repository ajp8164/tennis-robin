export const generateCode = () => {
  return Array.from(
    { length: 6 },
    () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)],
  ).join('');
};
