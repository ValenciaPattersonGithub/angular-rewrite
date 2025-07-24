import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type MFASettingsResponseMethodType =  'none' | 'phone' | 'authenticator';

export interface MFASettingsResponse {
  mfaEnabled: boolean;
  preferredMFAMethod: MFASettingsResponseMethodType;
}

@Injectable({
  providedIn: 'root'
})

export class MfaSettingsService {
    
  constructor(
    private httpClient: HttpClient,
    @Inject('mfaPracticeSettingsUrl') private mfaPracticeSettingsUrl: string,
    @Inject('mfaManagementPracticeServiceUrl') private mfaManagementPracticeServiceUrl: string,
  ) {}

  getMFASettingsByPracticeId(practiceId: string): Observable<MFASettingsResponse> {
    const url = `${this.mfaPracticeSettingsUrl}/api/v1/Read/GetByPracticeId`;
    const params = new HttpParams()
      .set('practiceId', practiceId);

    return this.httpClient.get<MFASettingsResponse>(url, { 
      params,
    }).pipe(
      catchError(error => {
        console.error('Error fetching MFA settings:', error);
        return throwError(() => error);
      })
    );
  }

  saveMFASettingsById(practiceId: string, settings: { mfaEnabled: boolean; preferredMFAMethod: string }): Observable<MFASettingsResponse> {
    const params = new HttpParams()
      .set('practiceId', practiceId)
      .set('mfaEnabled', settings.mfaEnabled.toString())
      .set('preferredMethod', settings.preferredMFAMethod)

    return this.httpClient.post<MFASettingsResponse>(`${this.mfaManagementPracticeServiceUrl}/api/v1/Write/update`, null, {
      params,
    }).pipe(
      catchError(error => {
        console.error('Error updating MFA settings:', error);
        return throwError(() => error);
      })
    );
  }
}
