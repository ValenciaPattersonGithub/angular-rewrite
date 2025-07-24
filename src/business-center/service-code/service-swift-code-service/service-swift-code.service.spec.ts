import { TestBed } from '@angular/core/testing';

import { ServiceSwiftCodeService } from './service-swift-code.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ServiceCodeModel } from '../service-code-model';
import { NewStandardService } from 'src/@shared/providers/new-standard.service';

describe('ServiceSwiftCodeService', () => {
  let service: ServiceSwiftCodeService;
  let httpTestingController: HttpTestingController;
  let mockSoarConfig;
  let serviceMockRequestData: ServiceCodeModel;
  let mockNewStandardServiceService;

  beforeEach(async () => {
    mockSoarConfig = {
      domainUrl: 'https://localhost:35440',
    }

    serviceMockRequestData = {
      ServiceCodeId: '1234',
      CdtCodeName: 'Test Service Code',
      Description: 'Text Description'
    };

    mockNewStandardServiceService = {
      save: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          resolve({ Value: 'Save API Success Response' }),
            reject({});
        });
      }),
      checkDuplicate: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          resolve({ Value: 'Check Duplicate API Success Response' }),
            reject({});
        });
      }),
      validate: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          resolve({ Value: 'Validate API Success Response' }),
            reject({});
        });
      }),
      validationFunction: jasmine.createSpy().and.returnValue({}),
    }

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: NewStandardService, useValue: mockNewStandardServiceService }
      ]
    })

    service = TestBed.inject(ServiceSwiftCodeService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    service = TestBed.inject(ServiceSwiftCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('save ->', () => {
    it('should call standardService save method', async () => {
      await service.save(serviceMockRequestData, 'ServiceCodeId')
        .then(() => {
          expect(mockNewStandardServiceService.save).toHaveBeenCalled();
        });
    });

    it('should return Promise.resolve, when save API success', async () => {
      // NG15CLEANUP The typing here is wrong. The return type of save is a Promise<ServiceCodeModel>, not a Promise<{ Value: ... }>.
      await service.save(serviceMockRequestData, 'ServiceCodeId')
        .then((response) => {
          expect(response).toEqual({ Value: 'Save API Success Response' } as any);
        });
    });

    it('should return Promise.reject, when save API failed', async () => {
      mockNewStandardServiceService.save = jasmine.createSpy().and.returnValue(Promise.reject({ error: 'failed' }));
      await service.save(serviceMockRequestData, 'ServiceCodeId')
        .catch((error) => {
          expect(error).toEqual({ error: 'failed' });
        });
    });
  });


  describe('checkDuplicate ->', () => {
    it('should call standardService checkDuplicate method', async () => {
      await service.checkDuplicate(serviceMockRequestData)
        .then(() => {
          expect(mockNewStandardServiceService.checkDuplicate).toHaveBeenCalled();
        });
    });

    it('should return Promise.resolve, when standardService.checkDuplicate API success', async () => {
      await service.checkDuplicate(serviceMockRequestData)
        .then((response) => {
          expect(response).toEqual({ Value: 'Check Duplicate API Success Response' });
        });
    });

    it('should return Promise.reject, when standardService.checkDuplicate  API failed', async () => {
      mockNewStandardServiceService.checkDuplicate = jasmine.createSpy().and.returnValue(Promise.reject({ error: 'failed' }));
      await service.checkDuplicate(serviceMockRequestData)
        .catch((error) => {
          expect(error).toEqual({ error: 'failed' });
        });
    });

  });

  describe('validate ->', () => {
    it('should call standardService validate method', async () => {
      await service.validate(serviceMockRequestData)
        .then(() => {
          expect(mockNewStandardServiceService.validate).toHaveBeenCalled();
        });
    });

    it('should return Promise.resolve, when standardService.validate API success', async () => {
      // NG15CLEANUP The typing here is wrong. The return type of validate is a Promise<boolean>, not a Promise<{ Value: ... }>.
      await service.validate(serviceMockRequestData)
        .then((response) => {
          expect(response).toEqual({ Value: 'Validate API Success Response' } as any);
        });
    });

    it('should return Promise.reject, when standardService.validate  API failed', async () => {
      mockNewStandardServiceService.validate = jasmine.createSpy().and.returnValue(Promise.reject({ error: 'failed' }));
      await service.validate(serviceMockRequestData)
        .catch((error) => {
          expect(error).toEqual({ error: 'failed' });
        });
    });

  });

  describe('validationFunction ->', () => {
    it('should return true for following condition, when code is service code', () => {
      const serviceCode = { IsSwiftPickCode: null, Code: 123, Description: 'text', ServiceTypeId: 123, AffectedAreaId: 12 };
      const response = service.validationFunction(serviceCode);
      expect(response).toEqual(true);
    });

    it('should return false for following condition, when code is swift code, and SwiftPickServiceCodes null', () => {
      const serviceCode = { IsSwiftPickCode: 123, Code: 123, Description: 'text' };
      const response = service.validationFunction(serviceCode);
      expect(response).toEqual(false);
    });

    it('should return true for following condition, when code is swift code', () => {
      const serviceCode = { IsSwiftPickCode: 123, Code: 123, Description: 'text', SwiftPickServiceCodes: [{ SwiftPickServiceCodeId: 123 }] };
      const response = service.validationFunction(serviceCode);
      expect(response).toEqual(true);
    });

  });

});
