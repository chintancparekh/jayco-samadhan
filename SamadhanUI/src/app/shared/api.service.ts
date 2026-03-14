// src/app/shared/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  ApiResult, AuditLog, CaseDetail, CaseListItem,
  DashboardStats, Grievance, CaseQuery, UserItem
} from './models';

const BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CaseApiService {
  constructor(private http: HttpClient) {}

  list(status?: string, page = 1, size = 20) {
    let p = new HttpParams().set('page', page).set('size', size);
    if (status) p = p.set('status', status);
    return this.http.get<ApiResult<CaseListItem[]>>(`${BASE}/cases`, { params: p });
  }

  get(id: number) {
    return this.http.get<ApiResult<CaseDetail>>(`${BASE}/cases/${id}`);
  }

  create(body: unknown) {
    return this.http.post<ApiResult<CaseDetail>>(`${BASE}/cases`, body);
  }

  updateStatus(id: number, status: string, remarks?: string) {
    return this.http.put<ApiResult>(`${BASE}/cases/${id}/status`, { status, remarks });
  }

  updateChecklist(id: number, body: unknown) {
    return this.http.put<ApiResult>(`${BASE}/cases/${id}/checklist`, body);
  }
}

@Injectable({ providedIn: 'root' })
export class QueryApiService {
  constructor(private http: HttpClient) {}

  create(body: unknown) {
    return this.http.post<ApiResult<CaseQuery>>(`${BASE}/queries`, body);
  }

  reply(id: number, reply: string) {
    return this.http.put<ApiResult>(`${BASE}/queries/${id}/reply`, { reply });
  }

  byCase(caseId: number) {
    return this.http.get<ApiResult<CaseQuery[]>>(`${BASE}/queries/by-case/${caseId}`);
  }

  mine() {
    return this.http.get<ApiResult<CaseQuery[]>>(`${BASE}/queries/my`);
  }
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  constructor(private http: HttpClient) {}
  stats() { return this.http.get<ApiResult<DashboardStats>>(`${BASE}/dashboard/stats`); }
}

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  constructor(private http: HttpClient) {}
  list(page = 1, size = 30) {
    const p = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResult<AuditLog[]>>(`${BASE}/audit`, { params: p });
  }
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  constructor(private http: HttpClient) {}
  list(role?: string) {
    const p = role ? new HttpParams().set('role', role) : new HttpParams();
    return this.http.get<ApiResult<UserItem[]>>(`${BASE}/users`, { params: p });
  }
  updateRole(id: number, role: string) {
    return this.http.put<ApiResult>(`${BASE}/users/${id}/role`, { role });
  }
  toggle(id: number) {
    return this.http.put<ApiResult>(`${BASE}/users/${id}/toggle`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class GrievanceApiService {
  constructor(private http: HttpClient) {}
  list() { return this.http.get<ApiResult<Grievance[]>>(`${BASE}/grievances`); }
  create(subject: string, description: string) {
    return this.http.post<ApiResult<Grievance>>(`${BASE}/grievances`, { subject, description });
  }
}
