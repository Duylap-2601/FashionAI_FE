export const mutationKeys = {
  pinToRack: () => ['rack', 'pinToRack'] as const,
  unpinFromRack: () => ['rack', 'unpinFromRack'] as const,
  clearRack: () => ['rack', 'clearRack'] as const,
};
