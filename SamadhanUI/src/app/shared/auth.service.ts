import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResult, AuthResponse, LoginRequest, RegisterRequest, VerifyRequest } from './models';

const KEY = 'samadhan_auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _user = signal<AuthResponse | null>(this.load());

  readonly user = this._user.asReadonly();
  readonly isAuth = computed(() =>
    !!this._user() && new Date(this._user()!.expiry) > new Date()
  );

  readonly isAdmin = computed(() =>
    ['Admin', 'InvestigatorLayer', 'Lawyer'].includes(this._user()?.role ?? '')
  );

  readonly userId = computed(() => this._user()?.userId ?? 0);
  readonly token = computed(() => this._user()?.token ?? '');

  constructor(private http: HttpClient, private router: Router) {}

  // ───────── REGISTER ─────────
  register(r: RegisterRequest) {

    const url = `${environment.apiUrl}/auth/register`;
    console.log('Register API:', url, r);

    return this.http.post<ApiResult>(url, r).pipe(

      catchError((err: HttpErrorResponse) => {

        console.error('Register Error:', err);

        const msg = err.status === 0
          ? 'Cannot connect to server. Check if .NET API is running.'
          : (err.error?.message ?? 'Registration failed');

        return of({ success: false, message: msg } as ApiResult);
      })
    );
  }

  // ───────── VERIFY EMAIL ─────────
  verify(r: VerifyRequest) {

    const payload = {
      email: r.email.trim().toLowerCase(),
      token: r.token.trim().toUpperCase(),
      password: r.password
    };

    const url = `${environment.apiUrl}/auth/verify-email`;

    console.log('Verify API:', url, payload);

    return this.http.post<ApiResult>(url, payload).pipe(

      catchError((err: HttpErrorResponse) => {

        console.error('Verify Error:', err);

        const msg = err.status === 0
          ? 'Cannot connect to server. Check if .NET API is running.'
          : (err.error?.message ?? 'Verification failed');

        return of({ success: false, message: msg } as ApiResult);
      })
    );
  }

  // ───────── LOGIN ─────────
  login(r: LoginRequest) {

    const payload = {
      email: r.email.trim().toLowerCase(),
      password: r.password
    };

    const url = `${environment.apiUrl}/auth/login`;

    console.log('Login API:', url, payload);

    return this.http.post<ApiResult<AuthResponse>>(url, payload).pipe(

      tap(res => {

        if (res.success && res.data) {

          localStorage.setItem(KEY, JSON.stringify(res.data));
          this._user.set(res.data);

          console.log('Login Success Role:', res.data.role);
        }

      }),

      catchError((err: HttpErrorResponse) => {

        console.error('Login Error:', err);

        const msg = err.status === 0
          ? 'Cannot connect to server. Check if .NET API is running.'
          : (err.error?.message ?? 'Login failed');

        return of({ success: false, message: msg, data: null } as ApiResult<AuthResponse>);
      })
    );
  }

  // ───────── LOGOUT ─────────
  logout() {

    localStorage.removeItem(KEY);
    this._user.set(null);

    this.router.navigate(['/auth/login']);
  }

  // ───────── LOAD USER ─────────
  private load(): AuthResponse | null {

    try {

      const s = localStorage.getItem(KEY);

      return s ? JSON.parse(s) : null;

    } catch {

      return null;
    }
  }

}