import { TestBed } from '@angular/core/testing';

import { GroupTypeService } from './group-type.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { GroupType, PatientsWithGroupType } from 'src/business-center/practice-settings/patient-profile/group-types/group-type';

describe('GroupTypeService', () => {
  let service: GroupTypeService;
  let httpTestingController: HttpTestingController;
  
  let mockSoarConfig = {
    domainUrl: "http://localhost"
  };

  let patientgroupsListResponse: SoarResponse<Array<GroupType>> = {
    ExtendedStatusCode: 0,
    InvalidProperties: null,
    Value: [
      {
        DataTag: "AAAAAAAhwC4=",
        DateModified: "2023-02-22T14:16:15.0820817",
        GroupTypeName: "Group 1",
        MasterPatientGroupId: "c0e3ac3d-c230-4961-92a9-2bxcv103487e8",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cy"
      },
      {
        DataTag: "AAAAAAAhwC4=",
        DateModified: "2023-02-22T14:16:15.0820817",
        GroupTypeName: "Group 2",
        MasterPatientGroupId: "c0e3ac3d-c230-4961-92a9-2b78103487e8",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      }]
  }

  let groupTypeWithPatientsList: SoarResponse<Array<PatientsWithGroupType>> = {
    ExtendedStatusCode: null,
    InvalidProperties: [],
    Value:
      [{
        AddressReferrerId: 'test',
        DateOfBirth: 'text value',
        FirstName: 'text value',
        IsActive: false,
        IsActiveAccountMember: false,
        IsPatient: false,
        IsResponsiblePerson: false,
        IsRxRegistered: false,
        LastName: false,
        MiddleName: false,
        PatientCode: 'text value',
        PatientId: 'text value',
        PhoneNumber: 'text value',
        PreferredName: 'text value',
        PrimaryDuplicatePatientId: 'text value',
        RelationshipToPolicyHolder: 'text value',
        SuffixName: 'text value'
      }]

  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [GroupTypeService,
        { provide: 'SoarConfig', useValue: mockSoarConfig },
      ]
    });
    service = TestBed.inject(GroupTypeService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get patient groups types List', () => {
    it('should return value from observable list of patient groups types ',
      () => {
        service.get().subscribe(value => {
          expect(value).toBe(patientgroupsListResponse);
        });
      });
  });

  describe('Save', () => {
    it('should Call save patient groups types', () => {
      const input: string = 'new Group';
      service.save(input).subscribe();
      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patientgroups`);
      expect(req.request.method).toBe("POST");
      req.flush({});
      httpTestingController.verify();
    });
  });

  describe('Update', () => {
    it('should Call update patient groups types', () => {
      const input: GroupType = {
        DataTag: "AAAAAAAmDxg=",
        DateModified: "2023-04-27T13:35:32.2541442Z",
        GroupTypeName: "Updated New",
        MasterPatientGroupId: "6e18efbc-afdc-460e-beda-6bfd8370123b",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      }

      const expected: GroupType = {
        DataTag: "AAAAAAAmDxg=",
        DateModified: "2023-04-27T13:35:32.2541442Z",
        GroupTypeName: "Updated New",
        MasterPatientGroupId: "6e18efbc-afdc-460e-beda-6bfd8370123b",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      }

      service.update(input).subscribe();
      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patientgroups`);
      expect(req.request.method).toBe("PUT");
      let patientgroups = req.request.body;
      expect(Object.keys(patientgroups)).toEqual(Object.keys(expected));
      req.flush({});
      httpTestingController.verify();
    });
  });

  describe('Delete ', () => {
    it('should delete patient groups types ',
      () => {
        let groupTypeId = 'c0e3ac3d-c230-4961-92a9-2b78103487e8';
        service.delete(groupTypeId).subscribe(value => {
          expect(value).toBe(patientgroupsListResponse);
        });
      });
  });

  describe('groupTypeWithPatients ', () => {
    it('should Call groupTypeWithPatients',
      () => {
        let patientId = 'c0e3ac3d-c230-4961-92a9-2b78103487e8';
        service.groupTypeWithPatients(patientId).subscribe(value => {
          expect(value).toBe(groupTypeWithPatientsList);
        });
      });
  });

});
