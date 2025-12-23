import { ForbiddenException } from '@nestjs/common';
import { ROLES } from 'src/common/constants/roles';

export type Actor = {
  id: number;
  role?: string;
};

export function canManageAny(actor?: Actor | null) {
  const role = actor?.role;
  return role === ROLES.ADMIN || role === ROLES.MODERATOR;
}

export function assertCanManageOwnedResource(params: {
  actor?: Actor | null;
  ownerId?: number | null;
  errorMessage?: string;
}) {
  const { actor, ownerId, errorMessage } = params;

  if (!actor?.id) {
    throw new ForbiddenException(errorMessage ?? 'Forbidden');
  }

  if (canManageAny(actor)) return;

  if (typeof ownerId === 'number' && ownerId === actor.id) return;

  throw new ForbiddenException(errorMessage ?? 'Forbidden');
}
