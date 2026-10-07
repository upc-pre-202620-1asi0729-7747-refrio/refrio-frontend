import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { User } from '../domain/model/user.entity';
import { UsersResponse } from './users-response';

/**
 * SignInAssembler — maps IAM user response DTOs to User domain entities.
 */
@Injectable({ providedIn: 'root' })
export class SignInAssembler extends BaseAssembler<User, UsersResponse> {
  override toEntityFromResponse(response: UsersResponse): User {
    return new User(
      response.id,
      response.username,
      response.email,
      response.firstName,
      response.lastName,
      response.role,
      response.subscriptionPlan,
      response.sede
    );
  }
}
