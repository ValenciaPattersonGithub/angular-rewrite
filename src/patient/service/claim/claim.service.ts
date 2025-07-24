import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ClaimService {
  baseUrl = '_insurancesapi_/insurance/claims';

  constructor(private http: HttpClient) {}

  getClaimById(claimId: string, isClosed: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/getClaimById`, {
      params: { claimId, isClosed },
    });
  }

  updateInsEst(): Observable<any> {
    return this.http.put(`${this.baseUrl}/updateInsEst`, {});
  }

  getClaimEntityByClaimId(claimId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/getClaimEntityByClaimId/${claimId}`);
  }

  updateClaimEntity(): Observable<any> {
    return this.http.put(`${this.baseUrl}/claimEntity`, {});
  }

  search(): Observable<any> {
    return this.http.post(`${this.baseUrl}/insurance/claimsGrid`, {});
  }

  getClaimRejectionMessage(claimId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/getClaimRejectionMessage/${claimId}`);
  }

  getCarrierResponseByClaimId(claimId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/getCarrierResponseByClaimId/`, {
      params: { claimId },
    });
  }

  updateCarrierResponse(): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/insurance/predetermination/carrierResponse`,
      {}
    );
  }

  updateClaimEntityDocumentId(
    claimEntityId: string,
    documentId: string
  ): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/updatedocument`,
      {},
      { params: { claimEntityId, documentId } }
    );
  }
}
