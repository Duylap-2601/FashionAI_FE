import { api } from '@/lib/api';

export async function pinToRack(productId: string) {
  const res = await api.post('/rack', { productId });
  return res.data;
}

export async function unpinFromRack(id: string) {
  const res = await api.delete(`/rack/${id}`);
  return res.data;
}

export async function clearRack() {
  const res = await api.delete('/rack/all');
  return res.data;
}

export { mutationKeys } from './mutation-keys';
