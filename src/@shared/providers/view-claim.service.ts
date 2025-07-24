import { Inject, Injectable } from '@angular/core';
import { PdfService } from './pdf.service';
import { ClaimsManagementHttpService } from '../../insurance/claims/claims-management/claims-management-http.service';
import { catchError, delay, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { PdfResponse } from 'src/@core/models/core/soar-response';
import { ClaimEntity } from 'src/patient/common/models/patient-apply-insurance-payment.model';

@Injectable({
  providedIn: 'root'
})
export class ViewClaimService {

  constructor( private pdfService: PdfService,
    private claimsManagementHttpService: ClaimsManagementHttpService,
    private translate: TranslateService,
    @Inject('toastrFactory') private toastrFactory,
  ) { }

  viewOrPreviewPdf(claim: ClaimEntity, patientName: string, refreshClaim: boolean): Observable<PdfResponse> {    
    // Preview PDF is for claims in Unsubmitted Paper or Unsubmitted Electronic status    
    const isPreview = (claim.Status === 1 || claim.Status === 3);
    const claimType = claim.Type === 1 ? 'Claim' : 'Predetermination';
    const viewType = isPreview ? `Preview` : `View`;
    const pdfTitle = `${viewType} ${claimType} for ${patientName}`;    
    let pdfResponse$: Observable<PdfResponse>;
    if (isPreview && refreshClaim) {
      // If it's a preview and refreshClaim is true, we need to refresh the claim first
      // This will only happen for claims in Unsubmitted Paper or Unsubmitted Electronic status    
      pdfResponse$ = this.claimsManagementHttpService.refreshClaim({ claimId: claim.ClaimId }).pipe(
        switchMap(() => this.claimsManagementHttpService.getClaimPdf({ claimId: claim.ClaimId }))
      );
    } else {
      pdfResponse$ = this.claimsManagementHttpService.getClaimPdf({ claimId: claim.ClaimId });
    }
    return pdfResponse$.pipe(
      catchError(error => {
        this.toastrFactory.error(
          this.translate.instant(`Failed to get ${claimType} ${viewType}.`),
          this.translate.instant('Server Error')
        );
        return of(null);
      }),
      tap(res => {
        if (res && res.data) {
          this.pdfService.viewPdfInNewWindow(res.data, pdfTitle, claim.PatientName);
        }
      })
    );
  }
}
