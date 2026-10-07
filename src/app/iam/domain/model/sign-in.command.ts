/**
 * SignInCommand — value object for sign-in action (BC 01: IAM).
 */
export class SignInCommand {
  constructor(
    public readonly username: string,
    public readonly password: string
  ) {}
}
