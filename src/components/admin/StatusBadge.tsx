import { Badge } from '@/components/ui/Badge';
import {
  PROVIDER_STATUS_BADGE_CLASSES,
  PROVIDER_STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from '@/lib/constants';
import type { ProviderStatus, RequestStatus } from '@/types/db';

export function StatusBadge({ statut }: { statut: RequestStatus }) {
  return (
    <Badge className={STATUS_BADGE_CLASSES[statut]}>
      {STATUS_LABELS[statut]}
    </Badge>
  );
}

export function ProviderStatusBadge({
  statut,
}: {
  statut: ProviderStatus;
}) {
  return (
    <Badge className={PROVIDER_STATUS_BADGE_CLASSES[statut]}>
      {PROVIDER_STATUS_LABELS[statut]}
    </Badge>
  );
}
