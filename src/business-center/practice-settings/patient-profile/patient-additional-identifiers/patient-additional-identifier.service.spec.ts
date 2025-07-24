import { TestBed } from '@angular/core/testing';

import { PatientAdditionalIdentifierService } from './patient-additional-identifier.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientAdditionalIdentifiers } from './patient-additional-identifier';
import { SoarResponse } from 'src/@core/models/core/soar-response';

describe('PatientAdditionalIdentifierService', () => {
  let service: PatientAdditionalIdentifierService;

  let httpTestingController: HttpTestingController;
  let mockSoarConfig = {
    domainUrl: "http://localhost"
  };

  let getDateObject = (dateString: string) => {
    return new Date(dateString);
  }

  let getPatAddIdentListResponse: SoarResponse<Array<PatientAdditionalIdentifiers>> = {
    ExtendedStatusCode: 0,
    InvalidProperties: null,
    Value: [
      {
        DataTag: "AAAAAAAg6W8=",
        DateModified: getDateObject("2022-11-14T16:20:37.4412041"),
        Description: "Description_xwbnaslcia",
        IsSpecifiedList: true,
        IsSpecifiedListName: "Specified List",
        IsUsed: true,
        ListValues: [
          {
            DataTag: "AAAAAAAg6XB=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 1,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description2",
          },
          {
            DataTag: "AAAAAAAg6ZC=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 2,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description3",
          },
        ],
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      },
      {
        DataTag: "AAAAAAAg6W9=",
        DateModified: getDateObject("2022-12-23T16:15:40.3249394"),
        Description: "Description2",
        IsSpecifiedList: true,
        IsSpecifiedListName: "Specified List",
        IsUsed: false,
        ListValues: [
          {
            DataTag: "AAAAAAAg6XB=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 1,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description2",
          },
          {
            DataTag: "AAAAAAAg6ZC=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 2,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description3",
          },
        ],
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      }]
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [PatientAdditionalIdentifierService,
        { provide: 'SoarConfig', useValue: mockSoarConfig },
      ]
    });
    service = TestBed.inject(PatientAdditionalIdentifierService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get Patient addtional identifiers List', () => {
    it('should return value from observable list of Patient addtional identifiers ',
      () => {
        service.getPatientAdditionalIdentifiers().subscribe(value => {
          expect(value).toBe(getPatAddIdentListResponse);
        });
      });
  });

  describe('Save', () => {
    it('should Call save Patient addtional identifiers', () => {
      const input: PatientAdditionalIdentifiers = {
        DataTag: "AAAAAAAg6W8=",
        DateModified: getDateObject("2022-11-14T16:20:37.4412041"),
        Description: "Description_xwbnaslcia",
        IsSpecifiedList: true,
        IsSpecifiedListName: "Specified List",
        IsUsed: true,
        ListValues: [
          {
            DataTag: "AAAAAAAg6XB=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 1,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description2",
          },
          {
            DataTag: "AAAAAAAg6ZC=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 2,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description3",
          },
        ],
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      }



      service.save(input).subscribe();
      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/masterpatientidentifiers`);
      expect(req.request.method).toBe("POST");
      let masterpatientidentifiers = req.request.body;
      expect(Object.keys(masterpatientidentifiers)).toEqual(Object.keys(getPatAddIdentListResponse.Value[1]));
      req.flush({});
      httpTestingController.verify();
    });


  });

  describe('Update', () => {
    it('should Call update Patient addtional identifiers', () => {
      const input: PatientAdditionalIdentifiers = {
        DataTag: "AAAAAAAg6W8=",
        DateModified: getDateObject("2022-11-14T16:20:37.4412041"),
        Description: "Description_xwbnaslcia",
        IsSpecifiedList: true,
        IsSpecifiedListName: "Specified List",
        IsUsed: true,
        ListValues: [
          {
            DataTag: "AAAAAAAg6XB=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 1,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description2",
          },
          {
            DataTag: "AAAAAAAg6ZC=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 2,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description3",
          },
        ],
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      }

      const expected: PatientAdditionalIdentifiers = {
        DataTag: "AAAAAAAg6W8=",
        DateModified: getDateObject("2022-11-14T16:20:37.4412041"),
        Description: "Description_xwbnaslcia",
        IsSpecifiedList: true,
        IsSpecifiedListName: "Specified List",
        IsUsed: true,
        ListValues: [
          {
            DataTag: "AAAAAAAg6XB=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 1,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description2",
          },
          {
            DataTag: "AAAAAAAg6ZC=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 2,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description3",
          },
        ],
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      }

      service.update(input).subscribe();
      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/masterpatientidentifiers`);
      expect(req.request.method).toBe("PUT");
      let masterpatientidentifiers = req.request.body;
      expect(Object.keys(masterpatientidentifiers)).toEqual(Object.keys(expected));
      req.flush({});
      httpTestingController.verify();
    });


  });

  describe('Delete ', () => {
    it('should delete Patient addtional identifiers ',
      () => {
        service.delete(getPatAddIdentListResponse.Value[0].MasterPatientIdentifierId).subscribe(value => {
          expect(value).toBe(getPatAddIdentListResponse);
        });
      });
  });

  describe('additionalIdentifiersWithPatients ', () => {
    it('should Call additionalIdentifiersWithPatients',
      () => {
        service.additionalIdentifiersWithPatients(getPatAddIdentListResponse.Value[0].MasterPatientIdentifierId).subscribe(value => {
          expect(value).toBe(getPatAddIdentListResponse);
        });
      });
  });

});
