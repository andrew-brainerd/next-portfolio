/** `wedding-mock-offset` cookie → ms to add to the real clock; 0 when absent or invalid. Future-only, so never negative. */
export const parseMockOffset = (value: string | undefined): number => {
  const offset = value && /^\d+$/.test(value) ? Number(value) : 0;
  return Number.isSafeInteger(offset) ? offset : 0;
};
