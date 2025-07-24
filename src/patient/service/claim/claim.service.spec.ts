import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ClaimService } from './claim.service';

describe('ClaimService', () => {
  let service: ClaimService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimService],
    });
    service = TestBed.inject(ClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch the claim by ID', () => {
    const mockResponse = {};
    const claimId = '123';
    const isClosed = 'true';

    service.getClaimById(claimId, isClosed).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${service.baseUrl}/getClaimById?claimId=${claimId}&isClosed=${isClosed}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should send a PUT request to update the insurance estimate', () => {
    const mockResponse = {};
    const expectedUrl = `${service.baseUrl}/updateInsEst`;

    service.updateInsEst().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  // Test case for getClaimEntityByClaimId
  it('should fetch claim entity by claim ID', () => {
    const mockResponse = {};
    const claimId = '123';
    service.getClaimEntityByClaimId(claimId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(
      `${service.baseUrl}/getClaimEntityByClaimId/${claimId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // Test case for updateClaimEntity
  it('should update claim entity', () => {
    const mockResponse = {};
    service.updateClaimEntity().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${service.baseUrl}/claimEntity`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  // Test case for search
  it('should perform a search', () => {
    const mockResponse = {};
    service.search().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${service.baseUrl}/insurance/claimsGrid`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  // Test case for getClaimRejectionMessage
  it('should fetch claim rejection message by claim ID', () => {
    const mockResponse = {};
    const claimId = '123';
    service.getClaimRejectionMessage(claimId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(
      `${service.baseUrl}/getClaimRejectionMessage/${claimId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // Test case for getCarrierResponseByClaimId
  it('should fetch carrier response by claim ID', () => {
    const mockResponse = {};
    const claimId = '123';
    service.getCarrierResponseByClaimId(claimId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(
      `${service.baseUrl}/getCarrierResponseByClaimId/?claimId=${claimId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // Test case for updateCarrierResponse
  it('should update carrier response', () => {
    const mockResponse = {};
    service.updateCarrierResponse().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(
      `${service.baseUrl}/insurance/predetermination/carrierResponse`
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  // Test case for updateClaimEntityDocumentId
  it('should update claim entity document ID', () => {
    const mockResponse = {};
    const claimEntityId = '123';
    const documentId = '456';
    service
      .updateClaimEntityDocumentId(claimEntityId, documentId)
      .subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
    const req = httpMock.expectOne(
      `${service.baseUrl}/updatedocument?claimEntityId=${claimEntityId}&documentId=${documentId}`
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });
});
