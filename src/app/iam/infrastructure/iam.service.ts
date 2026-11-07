import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.post<SignInResponse>(this.basePath + '/session', request);
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
      sede: request.sede
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
    return this.http.get<UsersResponse>(this.basePath + '/session');
  }
}
