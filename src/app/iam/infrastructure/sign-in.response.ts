/**
 * SignInResponse — token returned by the IAM sign-in endpoint.
 */
export class SignInResponse {
  token!: string;
  tokenType!: string;
  expiresIn!: number;
}
