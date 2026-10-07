import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SignInRequest } from './sign-in.request';
import { SignInResponse } from './sign-in.response';
import { SignUpRequest } from './sign-up.request';
import { SignUpResponse } from './sign-up.response';
import { UsersResponse } from './users-response';

@Injectable({ providedIn: 'root' })
export class IamService {
  private readonly basePath = `${environment.serverBasePath}`;

  constructor(private http: HttpClient) {}

  signIn(request: SignInRequest): Observable<SignInResponse> {
    return this.http.get<any[]>(`${this.basePath}/users?username=${request.username}&password=${request.password}`).pipe(
      delay(800),
      map(users => {
        if (users && users.length > 0) {
          const user = users[0];
          const res = new SignInResponse();
          res.token = user.token; // Using the mock token stored in db.json
          res.tokenType = 'Bearer';
          res.expiresIn = 3600;
          return res;
        } else {
          throw { error: { message: 'Invalid credentials' } };
        }
      })
    );
  }

  signUp(request: SignUpRequest): Observable<SignUpResponse> {
    const newUser = {
      username: request.username,
      password: request.password,
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      role: request.role,
      subscriptionPlan: request.subscriptionPlan,
      sede: request.sede,
      token: 'mock-jwt-token-distrib'
    };
    
    return this.http.post<any>(`${this.basePath}/users`, newUser).pipe(
      delay(800),
      map(savedUser => {
        const res = new SignUpResponse();
        res.id = savedUser.id;
        res.username = savedUser.username;
        res.message = 'User created successfully';
        return res;
      })
    );
  }

  getCurrentUser(): Observable<UsersResponse> {
    const token = localStorage.getItem('refrio_token');
    
    return this.http.get<any[]>(`${this.basePath}/users?token=${token}`).pipe(
      delay(500),
      map(users => {
        if (users && users.length > 0) {
          const user = users[0];
          const res = new UsersResponse();
          res.id = user.id;
          res.username = user.username;
          res.email = user.email;
          res.firstName = user.firstName;
          res.lastName = user.lastName;
          res.role = user.role;
          res.subscriptionPlan = user.subscriptionPlan;
          res.sede = user.sede;
          return res;
        } else {
          throw new Error('User not found');
        }
      })
    );
  }
}
