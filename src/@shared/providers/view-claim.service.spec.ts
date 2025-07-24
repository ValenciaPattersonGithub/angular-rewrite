import { TestBed } from '@angular/core/testing';

import { ViewClaimService } from './view-claim.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClaimEntity } from 'src/patient/common/models/patient-apply-insurance-payment.model';
import { ClaimsManagementHttpService } from 'src/insurance/claims/claims-management/claims-management-http.service';
import { PdfService } from './pdf.service';

describe('ViewClaimService', () => {
  let service: ViewClaimService;  
  let claimEntity: ClaimEntity;
  const pdfServiceMock = {  
    viewPdfInNewWindow: jasmine.createSpy('viewPdfInNewWindow').and.callFake(() => {
      return null
    }),
  };
  const patientName = 'Bob Frapples';
  beforeEach(() => {
    // Mock ClaimEntity for testing
    claimEntity = {
        ClaimId: '12345',
        Status: 1,
        ClaimEntityId: '',
        LocationId: 0,
        AccountMemberId: '',
        PatientId: '',
        PatientName: '',
        AccountId: '',
        ProviderId: '',
        ProviderName: '',
        CarrierId: '',
        BenefitPlanId: '',
        CarrierName: '',
        PrimaryClaim: false,
        Type: 0,
        MinServiceDate: undefined,
        MaxServiceDate: undefined,
        DisplayDate: '',
        ServiceTransactionToClaimPaymentDtos: [],
        ApplyInsurancePaymentBackToPatientBenefit: false,
        RecreateClaim: false,
        IsReceived: false,
        TotalCharges: 0,
        TotalEstimatedInsurance: 0,
        TotalEstInsuranceAdj: 0,
        TotalPatientBalance: 0,
        PaymentAmount: 0,
        FinalPayment: false,
        AllowedAmount: 0,
        ClaimEntityDataTag: '',
        DataTag: '',
        UserModified: '',
        DateModified: undefined,
        InsuranceEstimate: 0,
        Charges: 0,
        AdjustedEstimate: 0,
        Balance: 0
      };
  });

  const claimsManagementHttpServiceMock = { 
    refreshClaim: jasmine.createSpy('refreshClaim').and.returnValue(
      of({
        Value: []
      })),
    // Mocking the getClaimPdf method to return an observable with a mock PDF response
    getClaimPdf: jasmine.createSpy('getClaimPdf').and.returnValue(
      of({
        Value: []
      })),
    }

  const translateServiceMock = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

  beforeEach(() => {

      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot(),HttpClientTestingModule],
        declarations: [],
        providers: [
          { provide: PdfService, useValue: pdfServiceMock },
          { provide: ClaimsManagementHttpService, useValue: claimsManagementHttpServiceMock },
          { provide: 'LocationHttpService', useValue: {} }, 
          { provide: 'TranslateService', useValue: translateServiceMock },
          { provide: 'windowObject', useValue: window }, 
          { provide: 'SoarConfig', useValue: {} },
          { provide: 'toastrFactory', useValue: { error: jasmine.createSpy('error') } } 
        ]
      });
      service = TestBed.inject(ViewClaimService);
    });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('viewOrPreviewPdf', () => {
    beforeEach(() => {
      claimsManagementHttpServiceMock.refreshClaim.calls.reset();
      claimsManagementHttpServiceMock.getClaimPdf.calls.reset();
    });

    it('should call refreshClaim for preview if refreshClaim is true and claim.Status is 1', () => { 
      const refreshClaim = true;
      claimEntity.Status = 1; // Change status to preview     
      service.viewOrPreviewPdf(claimEntity, patientName, refreshClaim);
      expect(claimsManagementHttpServiceMock.refreshClaim).toHaveBeenCalledWith({ claimId: claimEntity.ClaimId });
    });

    it('should call refreshClaim for preview if refreshClaim is true and claim.Status is 3', () => { 
      const refreshClaim = true;
      claimEntity.Status = 3; // Change status to preview     
      service.viewOrPreviewPdf(claimEntity, patientName, refreshClaim);
      expect(claimsManagementHttpServiceMock.refreshClaim).toHaveBeenCalledWith({ claimId: claimEntity.ClaimId });
    });

    it('should not call refreshClaim for preview if refreshClaim is false', () => { 
      const refreshClaim = false;
      claimEntity.Status = 3; // Change status to preview     
      service.viewOrPreviewPdf(claimEntity, patientName, refreshClaim);
      expect(claimsManagementHttpServiceMock.refreshClaim).not.toHaveBeenCalled();
    });

    it('should only call getClaimPdf for non-preview', () => {
      const refreshClaim = true;
      claimEntity.Status = 2; // Change status to non-preview
      service.viewOrPreviewPdf(claimEntity, patientName, refreshClaim);
      expect(claimsManagementHttpServiceMock.refreshClaim).not.toHaveBeenCalled();
      expect(claimsManagementHttpServiceMock.getClaimPdf).toHaveBeenCalledWith({ claimId: claimEntity.ClaimId });
    });
  });
});
