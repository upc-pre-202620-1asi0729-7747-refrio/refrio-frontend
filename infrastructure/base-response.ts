/**
 * BaseResponse — base class for all API response DTOs.
 * Maps raw server data before assembling into domain entities.
 */
export class BaseResponse {
  id!: number;
  createdAt?: string;
  updatedAt?: string;
}
