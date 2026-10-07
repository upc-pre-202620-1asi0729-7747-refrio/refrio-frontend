import { BaseResponse } from '../../shared/infrastructure/base-response';
import type { UserRole, SubscriptionPlan } from '../domain/model/user.entity';

/**
 * UsersResponse — DTO returned by the IAM API for a user profile.
 */
export class UsersResponse extends BaseResponse {
  username!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: UserRole;
  subscriptionPlan!: SubscriptionPlan;
  sede!: string;
}
