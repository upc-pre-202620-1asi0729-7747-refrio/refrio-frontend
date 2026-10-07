import type { UserRole, SubscriptionPlan } from '../domain/model/user.entity';

/**
 * SignUpRequest — payload sent to the IAM sign-up endpoint.
 */
export class SignUpRequest {
  constructor(
    public username: string,
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public subscriptionPlan: SubscriptionPlan,
    public sede: string
  ) {}
}
