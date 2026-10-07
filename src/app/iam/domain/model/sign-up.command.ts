import type { UserRole, SubscriptionPlan } from './user.entity';

/**
 * SignUpCommand — value object for user registration (BC 01: IAM).
 */
export class SignUpCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: UserRole,
    public readonly subscriptionPlan: SubscriptionPlan,
    public readonly sede: string
  ) {}
}
