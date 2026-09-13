import { http } from '@/lib/http';

export async function pinToRack(productId: string) {
  return http.post('/rack', { productId });
}

export async function unpinFromRack(id: string) {
  return http.delete(`/rack/${id}`);
}

export async function clearRack() {
  return http.delete('/rack/all');
}

export { mutationKeys } from './mutation-keys';
