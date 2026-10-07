/**
 * SignInRequest — payload sent to the IAM sign-in endpoint.
 */
export class SignInRequest {
  constructor(
    public username: string,
    public password: string
  ) {}
}
