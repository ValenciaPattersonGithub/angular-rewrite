import { TestBed } from '@angular/core/testing';
import { ServiceCodeSearchInitialDataService } from './service-code-search-initial-data.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';
import { DrawTypesService } from 'src/@shared/providers/drawtypes.service';
import { ServiceTypesService } from '../practice-settings/service-types/service-types.service';

const mockReferenceDataService = {
  get: jasmine.createSpy().and.returnValue([]),
  entityNames: {
    practiceSettings: 'test'
  }
}

const mockDrawTypesService = {
  getAll: jasmine.createSpy()
}

const mockServiceTypesService = {
  getAll: jasmine.createSpy()
}

let taxableServiceData = [
  { Id: 1, Name: 'Not A Taxable Service', Order: 1 },
  { Id: 2, Name: 'Provider', Order: 2 },
  { Id: 3, Name: 'Sales and Use', Order: 3 }
]

let affectedAreasData = {
  Value: [
    { "Id": 1, "Name": "Mouth", "Order": 1 },
    { "Id": 2, "Name": "Quadrant", "Order": 2 },
    { "Id": 3, "Name": "Root", "Order": 3 },
    { "Id": 4, "Name": "Surface", "Order": 4 },
    { "Id": 5, "Name": "Tooth", "Order": 5 }
  ]
};

let providerTypesData = [
  { "ProviderTypeId": 4, "Id": 4, "Name": "Not a Provider", "Order": 1, "IsAppointmentType": false },
  { "ProviderTypeId": 1, "Id": 1, "Name": "Dentist", "Order": 2, "IsAppointmentType": true },
  { "ProviderTypeId": 2, "Id": 2, "Name": "Hygienist", "Order": 3, "IsAppointmentType": true },
  { "ProviderTypeId": 3, "Id": 3, "Name": "Assistant", "Order": 4, "IsAppointmentType": false },
  { "ProviderTypeId": 5, "Id": 5, "Name": "Other", "Order": 5, "IsAppointmentType": false }
]

const mockStaticData = {
  TaxableServices: jasmine.createSpy().and.returnValue({
    then: jasmine.createSpy().and.returnValue(taxableServiceData)
  }),
  AffectedAreas: jasmine.createSpy().and.returnValue({
    then: jasmine.createSpy().and.returnValue(affectedAreasData)
  }),
  ProviderTypes: jasmine.createSpy().and.returnValue({
    then: jasmine.createSpy().and.returnValue(providerTypesData)
  }),
}

describe('ServiceCodeSearchInitialDataService', () => {
  let service: ServiceCodeSearchInitialDataService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        { provide: 'StaticData', useValue: mockStaticData },
        { provide: DrawTypesService, useValue: mockDrawTypesService },
        { provide: ServiceTypesService, useValue: mockServiceTypesService },
        { provide: FeatureFlagService, useValue: {
          getOnce$: jasmine.createSpy().and.returnValue(of(false))
        } }
      ]
    });
    service = TestBed.inject(ServiceCodeSearchInitialDataService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('serviceCodeSearchInitialData', () => {
    it('should match the return object', () => {
      service.serviceCodeSearchInitialData().then(
        res => {
          
          expect(res['DrawTypes'].length).toBe(0);
          expect(res['ProviderTypes'].length).toBe(2);
          expect(res['ServiceTypes'].length).toBe(0);
          expect(res['TaxableServices']).toBe(taxableServiceData)
        }
      );
    });
  });
});
