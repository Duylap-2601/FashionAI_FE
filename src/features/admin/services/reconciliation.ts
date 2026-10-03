import { fetchUnmatchedTransactions, fetchWebhookFailures } from '@/features/admin/services/queries';
import { confirmManualPayment, resolveWebhookFailure } from '@/features/admin/services/mutations';
import type { ConfirmManualPaymentPayload } from '@/features/admin/types/admin-reconciliation';

export const reconciliationKeys = {
  all: ['admin', 'reconciliation'] as const,
  unmatched: (filters: { resolved?: boolean; page?: number; limit?: number }) =>
    [...reconciliationKeys.all, 'unmatched', filters] as const,
  rawFailures: (filters?: { resolved?: boolean }) =>
    [...reconciliationKeys.all, 'raw-failures', filters] as const,
};

export {
  fetchUnmatchedTransactions,
  fetchWebhookFailures,
  confirmManualPayment,
  resolveWebhookFailure,
};

export async function processManualReconciliation(
  orderCode: number,
  failureId: string,
  payload: ConfirmManualPaymentPayload,
) {
  const confirmResult = await confirmManualPayment(orderCode, payload);
  if (failureId) {
    try {
      await resolveWebhookFailure(failureId);
    } catch (err) {
      console.warn('Failed to auto-resolve webhook failure after manual confirmation:', err);
    }
  }
  return confirmResult;
}
