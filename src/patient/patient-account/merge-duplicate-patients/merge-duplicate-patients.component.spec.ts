import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MergeDuplicatePatientsComponent } from './merge-duplicate-patients.component';
import { TableSortComponent } from '../../../@shared/components/table-sort/table-sort.component';
import { TranslateModule } from '@ngx-translate/core';
import { ZipCodePipe } from '../../../@shared/pipes/zipCode/zip-code.pipe';
import { PhoneNumberPipe } from '../../../@shared/pipes/phone-number/phone-number.pipe';
import {
  DialogService,
  DialogContainerService,
  DialogRef,
} from '@progress/kendo-angular-dialog';
import { BestPracticePatientNamePipe } from '../../../@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { TruncateTextPipe } from '../../../@shared/pipes/truncate/truncate-text.pipe';
import { PatientDuplicateSearchComponent } from 'src/patient/patient-duplicate-search/patient-duplicate-search.component';
import { configureTestSuite } from 'src/configure-test-suite';

describe('MergeDuplicatePatientsComponent', () => {
  let component: MergeDuplicatePatientsComponent;
  let fixture: ComponentFixture<MergeDuplicatePatientsComponent>;
  const retValue = { $promise: { then: jasmine.createSpy() } };
  let dialogService: DialogService;
  let patientServices: any;
  let toastrFactory: any;

  const accountMembersMock = [
    // tslint:disable-next-line: max-line-length
    {
      PatientId: '1234',
      FirstName: 'Bob',
      LastName: 'Johnson',
      Name: 'Bob Johnson',
      IsSelected: false,
      City: 'Findlay',
      State: 'IL',
      ZipeCode: '62401',
      IsActive: true,
      IsPatient: true,
      DateOfBirth: '2001-11-05',
      PrimaryDuplicatePatientId: null,
      IsPrimaryDuplicate: false,
      IsResponsiblePerson: true,
      Datatag: '4569',
    },
    // tslint:disable-next-line: max-line-length
    {
      PatientId: '1235',
      FirstName: 'Larry',
      LastName: 'Johnson',
      Name: 'Larry Johnson',
      IsSelected: false,
      City: 'Findlay',
      State: 'IL',
      ZipeCode: '62401',
      IsActive: true,
      IsPatient: true,
      DateOfBirth: '2001-11-05',
      PrimaryDuplicatePatientId: null,
      IsPrimaryDuplicate: false,
      IsResponsiblePerson: false,
      Datatag: '4577',
    },
    // tslint:disable-next-line: max-line-length
    {
      PatientId: '1236',
      FirstName: 'Sid',
      LastName: 'Johnson',
      Name: 'Sid Johnson',
      IsSelected: false,
      City: 'Findlay',
      State: 'IL',
      ZipeCode: '62401',
      IsActive: true,
      IsPatient: true,
      DateOfBirth: '2001-11-05',
      PrimaryDuplicatePatientId: null,
      IsPrimaryDuplicate: false,
      IsResponsiblePerson: false,
      Datatag: '4566',
    },
    // tslint:disable-next-line: max-line-length
    {
      PatientId: '1237',
      FirstName: 'Pat',
      LastName: 'Johnson',
      Name: 'Pat Johnson',
      IsSelected: false,
      City: 'Findlay',
      State: 'IL',
      ZipeCode: '62401',
      IsActive: true,
      IsPatient: true,
      DateOfBirth: '2001-11-05',
      PrimaryDuplicatePatientId: null,
      IsPrimaryDuplicate: false,
      IsResponsiblePerson: false,
      Datatag: '4555',
    },
  ];

  const dialogMock = {
    close: (dialogResult: any) => {},
    open: (dialogResult: any) => {},
    result: [],
    content: {
      instance: {
        title: '',
        accountTypes: [],
      },
    },
  };

  // mock for patSecurityService
  const patSecurityServiceMock = {
    generateMessage: jasmine.createSpy().and.returnValue(''),
    IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(''),
  };

  const mockPatientServices = {
    Account: {
      getAccountMembersWithDuplicates: jasmine
        .createSpy()
        .and.callFake(() => retValue),
    },
  };
  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error'),
  };
  configureTestSuite(() => {
    let mockDialogService = {};

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [
        MergeDuplicatePatientsComponent,
        TableSortComponent,
        TruncateTextPipe,
        PatientDuplicateSearchComponent,
      ],
      providers: [
        ZipCodePipe,
        PhoneNumberPipe,
        BestPracticePatientNamePipe,
        DialogContainerService,
        { provide: 'PatientServices', useValue: mockPatientServices },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: patSecurityServiceMock },
        { provide: DialogService, useValue: mockDialogService },
        { provide: DialogRef, useValue: dialogMock },
      ],
    }).overrideComponent(TableSortComponent, {
      set: {
        selector: 'table-sort',
        template: `<span></span>`,
      },
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeDuplicatePatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    dialogService = TestBed.get(DialogService);
    patientServices = TestBed.get('PatientServices');
    toastrFactory = TestBed.get('toastrFactory');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleAllSelected method', () => {
    let accountMember: any;
    beforeEach(() => {
      component.primaryAccountMembers = accountMembersMock;
      accountMember = accountMembersMock[0];
      spyOn(component, 'allowCombine');
    });

    it('should set all primaryAccountMembers.IsSelected to false if allSelected is true', () => {
      component.allSelected = true;
      component.toggleAllSelected();
      expect(component.allSelected).toBe(false);
      component.primaryAccountMembers.forEach(member => {
        expect(member.IsSelected).toBe(false);
      });
      expect(component.allowCombine).toHaveBeenCalled();
    });

    it('should set all accountMembers.IsSelected to true if allSelected is false and not responsible person', () => {
      component.allSelected = false;
      component.toggleAllSelected();
      expect(component.allSelected).toBe(true);
      component.primaryAccountMembers.forEach(member => {
        expect(member.IsSelected).toBe(true);
      });
      expect(component.allowCombine).toHaveBeenCalled();
    });
  });

  describe('refreshAccountMembers method', () => {
    let updatedAccountMembers: any;
    beforeEach(() => {
      component.accountMembers = accountMembersMock;
      updatedAccountMembers = [];
      updatedAccountMembers.push(component.accountMembers[0]);
      updatedAccountMembers.push(component.accountMembers[1]);
      // set first updated account member to Primary duplicate
      // set second updated account member to duplicate of first
      updatedAccountMembers[0].PrimaryDuplicatePatientId = null;
      updatedAccountMembers[0].Datatag = '1234';
      updatedAccountMembers[1].PrimaryDuplicatePatientId =
        updatedAccountMembers[0].PatientId;
      updatedAccountMembers[1].Datatag = '1235';
      spyOn(component, 'filterForPrimaryAccountMembers');
    });

    it('should update the component.accountMembers to the new values', () => {
      component.refreshAccountMembers(updatedAccountMembers);
      expect(component.accountMembers[0].PrimaryDuplicatePatientId).toBe(null);
      expect(component.accountMembers[0].Datatag).toBe('1234');
      expect(component.accountMembers[0].IsSelected).toBe(false);
      expect(component.accountMembers[1].PrimaryDuplicatePatientId).toBe(
        component.accountMembers[0].PatientId
      );
      expect(component.accountMembers[1].Datatag).toBe('1235');
      expect(component.accountMembers[1].IsSelected).toBe(false);
    });

    it('should set the StatusName based on IsPatient and IsActive after update', () => {
      const showDuplicates = true;
      updatedAccountMembers[0].IsPatient = true;
      updatedAccountMembers[0].IsActive = true;

      updatedAccountMembers[1].IsPatient = false;
      updatedAccountMembers[1].IsActive = true;

      component.refreshAccountMembers(updatedAccountMembers);
      expect(component.accountMembers[0].StatusName).toBe('Active Patient');
      expect(component.accountMembers[1].StatusName).toBe('Active Non-Patient');

      updatedAccountMembers[0].IsPatient = true;
      updatedAccountMembers[0].IsActive = true;

      updatedAccountMembers[1].IsPatient = true;
      updatedAccountMembers[1].IsActive = false;

      component.refreshAccountMembers(updatedAccountMembers);
      expect(component.accountMembers[0].StatusName).toBe('Active Patient');
      expect(component.accountMembers[1].StatusName).toBe('Inactive Patient');
    });

    it('should call filterForPrimaryAccountMembers with true', () => {
      const showDuplicates = true;
      component.refreshAccountMembers(updatedAccountMembers);
      expect(component.filterForPrimaryAccountMembers).toHaveBeenCalledWith(
        showDuplicates
      );
    });
  });

  describe('combineAsDuplicate method', () => {
    beforeEach(() => {
      component.primaryAccountMembers = accountMembersMock;
      spyOn(component, 'refreshAccountMembers');
    });

    // it('should open dialog with selected accountMembers', () => {
    //   const updatedAccountMembers = [];
    //   updatedAccountMembers.push(component.accountMembers[0]);
    //   updatedAccountMembers.push(component.accountMembers[1]);
    //   component.primaryAccountMembers[0].IsSelected = true;
    //   component.primaryAccountMembers[1].IsSelected = true;
    //   const selectedAccountMembers = component.primaryAccountMembers.filter(member => member.IsSelected === true);
    //   spyOn(dialogService, 'open').and.returnValue({ content: { instance: {} }, result: of (updatedAccountMembers) });
    //   component.combineAsDuplicate();
    //   expect(component.dialog.content.instance.accountMembers).toEqual(selectedAccountMembers);
    //   expect(component.dialog.content.instance.title).toEqual('Select the Primary Account');
    // });

    // it('should open call refreshAccountMembers after result returned', () => {
    //   const updatedAccountMembers = [];
    //   updatedAccountMembers.push(component.accountMembers[0]);
    //   updatedAccountMembers.push(component.accountMembers[1]);
    //   component.primaryAccountMembers[0].IsSelected = true;
    //   component.primaryAccountMembers[1].IsSelected = true;
    //   const selectedAccountMembers = component.primaryAccountMembers.filter(member => member.IsSelected === true);
    //   spyOn(dialogService, 'open').and.returnValue({ content: { instance: {} }, result: of (updatedAccountMembers) });
    //   component.combineAsDuplicate();
    //   expect(component.refreshAccountMembers).toHaveBeenCalledWith(updatedAccountMembers);
    // });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(component, 'getAccountMembersWithDuplicates').and.callFake(any => {
        return {
          then(callback) {
            callback({ Value: [] });
          },
        };
      });
      spyOn(component, 'addDynamicProperties').and.callFake(any => {});
      spyOn(component, 'filterForPrimaryAccountMembers').and.callFake(
        any => {}
      );
    });

    it('should call component.getAccountMembersWithDuplicates', () => {
      component.ngOnInit();
      expect(component.getAccountMembersWithDuplicates).toHaveBeenCalledWith(
        component.accountId
      );
    });

    it('should call component.addDynamicProperties when component.getAccountMemberWithDuplicates resolves', () => {
      component.ngOnInit();
      expect(component.addDynamicProperties).toHaveBeenCalled();
    });

    it('should call component.filterForPrimaryAccountMembers when component.getAccountMemberWithDuplicates resolves', () => {
      component.ngOnInit();
      const showDuplicates = false;
      expect(component.filterForPrimaryAccountMembers).toHaveBeenCalledWith(
        showDuplicates
      );
    });
  });

  describe('changeSortingForGrid', () => {
    beforeEach(() => {
      component.orderBy.field = 'StatusName';
      component.orderBy.asc = 1;
    });

    it('should set orderBy.field to param', () => {
      component.changeSortingForGrid('Name');
      expect(component.orderBy.field).toEqual('Name');
    });

    it('should set orderBy.asc to minus 1 if it was 1 and the orderBy.field equals param', () => {
      component.orderBy.field = 'Name';
      component.changeSortingForGrid('Name');
      expect(component.orderBy.asc).toEqual(-1);
    });

    it('should set orderBy.asc to 1 if it was minus 1 and the orderBy.field equals param', () => {
      component.orderBy.field = 'Name';
      component.orderBy.asc = -1;
      component.changeSortingForGrid('Name');
      expect(component.orderBy.asc).toEqual(1);
    });

    it('should set orderBy.asc to minus 1 if orderBy.field does not equal param', () => {
      component.orderBy.field = 'StatusName';
      component.orderBy.asc = -1;
      component.changeSortingForGrid('Name');
      expect(component.orderBy.asc).toEqual(-1);
    });
  });

  describe('toggleSelected', () => {
    beforeEach(() => {
      component.accountMembers = [
        // tslint:disable-next-line: max-line-length
        {
          Name: 'Bob Johnson',
          DateOfBirth: '2001-03-20',
          AddressLine1: '302 Cantrel Drive',
          AddressLine2: '',
          City: 'Waupega',
          State: 'IL',
          ZipCode: '55523',
          IsPatient: true,
          IsActive: true,
          PhoneNumber: '2175403335',
        },
        // tslint:disable-next-line: max-line-length
        {
          Name: 'Pat Stephenson',
          DateOfBirth: '1966-03-20',
          AddressLine1: '',
          AddressLine2: '',
          City: 'Findlay',
          State: 'IL',
          ZipCode: '55523',
          IsPatient: true,
          IsActive: true,
          PhoneNumber: '2175404445',
        },
        // tslint:disable-next-line: max-line-length
        {
          Name: 'Judy Bus',
          DateOfBirth: '1975-12-03',
          AddressLine1: 'Route 2',
          AddressLine2: '',
          City: 'Shelbyville',
          State: 'IL',
          ZipCode: '55523',
          IsPatient: true,
          IsActive: true,
          PhoneNumber: '2175405555',
        },
      ];
    });

    it('should toggle IsSelected on account member', () => {
      const accountMember = component.accountMembers[0];
      accountMember.IsSelected = false;
      component.toggleSelected(accountMember);
      expect(accountMember.IsSelected).toBe(true);
      component.toggleSelected(accountMember);
      expect(accountMember.IsSelected).toBe(false);
    });
  });

  describe('addDynamicProperties', () => {
    beforeEach(() => {
      component.accountMembers = [
        // tslint:disable-next-line: max-line-length
        {
          FirstName: 'Bob',
          LastName: 'Johnson',
          DateOfBirth: '2001-03-20',
          AddressLine1: '302 Cantrel Drive',
          AddressLine2: '',
          City: 'Waupega',
          State: 'IL',
          ZipCode: '55523',
          IsPatient: true,
          IsActive: true,
          PhoneNumber: '2175403335',
        },
        // tslint:disable-next-line: max-line-length
        {
          FirstName: 'Pat',
          LastName: 'Stephenson',
          DateOfBirth: '1966-03-20',
          AddressLine1: 'RR#2',
          AddressLine2: '',
          City: 'Findlay',
          State: 'IL',
          ZipCode: '55523',
          IsPatient: false,
          IsActive: true,
          PhoneNumber: '2175404445',
        },
        // tslint:disable-next-line: max-line-length
        {
          FirstName: 'Annette',
          LastName: 'Lamb',
          DateOfBirth: '1975-12-03',
          AddressLine1: '',
          AddressLine2: '',
          City: 'Shelbyville',
          State: 'IL',
          ZipCode: '55523',
          IsPatient: true,
          IsActive: false,
          PhoneNumber: '2175405555',
        },
      ];
    });

    it('should set StatusName based on IsPatient and IsActive', () => {
      component.addDynamicProperties();
      expect(component.accountMembers[0].StatusName).toBe('Active Patient');
      expect(component.accountMembers[1].StatusName).toBe('Active Non-Patient');
      expect(component.accountMembers[2].StatusName).toBe('Inactive Patient');
    });

    it('should set DateOfBirthDisplay column', () => {
      component.addDynamicProperties();
      expect(component.accountMembers[0].DateOfBirthDisplay).toBe('03/20/2001');
      expect(component.accountMembers[1].DateOfBirthDisplay).toBe('03/20/1966');
      expect(component.accountMembers[2].DateOfBirthDisplay).toBe('12/03/1975');
    });

    it('should set Full Address based on available AddressLine1, AddressLine2, City, State, and ZipCode', () => {
      component.addDynamicProperties();
      expect(component.accountMembers[0].FullAddress).toBe(
        '302 Cantrel Drive Waupega, IL 55523'
      );
      expect(component.accountMembers[1].FullAddress).toBe(
        'RR#2 Findlay, IL 55523'
      );
      expect(component.accountMembers[2].FullAddress).toBe(
        'Shelbyville, IL 55523'
      );
    });

    it('should set FormattedPhoneNumber by calling ', () => {
      component.addDynamicProperties();
      expect(component.accountMembers[0].PhoneNumberFormatted).toBe(
        ' (217) 540-3335'
      );
      expect(component.accountMembers[1].PhoneNumberFormatted).toBe(
        ' (217) 540-4445'
      );
      expect(component.accountMembers[2].PhoneNumberFormatted).toBe(
        ' (217) 540-5555'
      );
    });

    it('should call sortAccountMembers', () => {
      spyOn(component, 'sortAccountMembers').and.callFake(array => {});
      component.addDynamicProperties();
      expect(component.sortAccountMembers).toHaveBeenCalled();
    });
  });

  describe('filterForPrimaryAccountMembers method', () => {
    let showDuplicates;
    beforeEach(() => {
      component.accountMembers = accountMembersMock;
      showDuplicates = false;
    });

    it('should create primaryAccountMembers list and a list of their duplicates', () => {
      // first accountMember is a primary patient
      component.accountMembers[0].PrimaryDuplicatePatientId = null;
      // second accountMember is a duplicate
      component.accountMembers[1].PrimaryDuplicatePatientId =
        component.accountMembers[0].PatientId;
      // third accountMember is a duplicate
      component.accountMembers[2].PrimaryDuplicatePatientId =
        component.accountMembers[0].PatientId;

      component.filterForPrimaryAccountMembers(showDuplicates);
      expect(component.primaryAccountMembers[0].PatientId).toBe(
        component.accountMembers[0].PatientId
      );
      expect(component.primaryAccountMembers[0].PrimaryDuplicatePatientId).toBe(
        null
      );
      expect(
        component.primaryAccountMembers[0].DuplicatePatients[0].PatientId
      ).toEqual(component.accountMembers[1].PatientId);
      expect(
        component.primaryAccountMembers[0].DuplicatePatients[0].StatusName
      ).toEqual('Duplicate');
      expect(
        component.primaryAccountMembers[0].DuplicatePatients[0]
          .PrimaryDuplicatePatientId
      ).toEqual(component.accountMembers[0].PatientId);
      expect(
        component.primaryAccountMembers[0].DuplicatePatients[1].PatientId
      ).toEqual(component.accountMembers[2].PatientId);
      expect(
        component.primaryAccountMembers[0].DuplicatePatients[1].StatusName
      ).toEqual('Duplicate');
      expect(
        component.primaryAccountMembers[0].DuplicatePatients[1]
          .PrimaryDuplicatePatientId
      ).toEqual(component.accountMembers[0].PatientId);
    });

    it('should sort duplicates by name', () => {
      // first accountMember is a primary patient
      component.accountMembers[0].PrimaryDuplicatePatientId = null;
      // second accountMember is a duplicate
      component.accountMembers[1].PrimaryDuplicatePatientId =
        component.accountMembers[0].PatientId;
      // third accountMember is a duplicate
      component.accountMembers[2].PrimaryDuplicatePatientId =
        component.accountMembers[0].PatientId;

      component.filterForPrimaryAccountMembers(showDuplicates);

      expect(
        component.primaryAccountMembers[0].DuplicatePatients[0].Name
      ).toEqual('Larry Johnson');
      expect(
        component.primaryAccountMembers[0].DuplicatePatients[1].Name
      ).toEqual('Sid Johnson');
    });
  });

  describe('removeRelationship', () => {
    beforeEach(() => {
      spyOn(component, 'refreshAccountMembers');
      spyOn(component, 'updatePatientDuplicate').and.callFake(() => {
        return {
          then(callback) {
            callback({ res: { Value: [] } });
          },
        };
      }),
        (component.hasEditAccess = true);
    });

    it('should set PrimaryDuplicatePatientId to null before updating', () => {
      const duplcatePatient = {
        Name: 'Bob Johnson',
        DateOfBirth: '2001-03-20',
        AddressLine1: '302 Cantrel Drive',
        AddressLine2: '',
        // tslint:disable-next-line: max-line-length
        City: 'Waupega',
        State: 'IL',
        ZipCode: '55523',
        IsPatient: true,
        IsActive: true,
        PhoneNumber: '2175403335',
        PrimaryDuplicatePatientId: '1234',
      };
      component.removeRelationship(duplcatePatient);
      expect(duplcatePatient.PrimaryDuplicatePatientId).toBe(null);
    });

    it('should call updatePatientDuplicate with accountMember if user hasEditAccess is true', () => {
      const duplcatePatient = {
        Name: 'Bob Johnson',
        DateOfBirth: '2001-03-20',
        AddressLine1: '302 Cantrel Drive',
        AddressLine2: '',
        // tslint:disable-next-line: max-line-length
        City: 'Waupega',
        State: 'IL',
        ZipCode: '55523',
        IsPatient: true,
        IsActive: true,
        PhoneNumber: '2175403335',
        PrimaryDuplicatePatientId: '1234',
      };
      component.removeRelationship(duplcatePatient);
      expect(component.updatePatientDuplicate).toHaveBeenCalledWith(
        duplcatePatient
      );
    });

    it('should call refreshAccountMembers if call to updatePatientDuplicates is successful', () => {
      const duplcatePatient = {
        Name: 'Bob Johnson',
        DateOfBirth: '2001-03-20',
        AddressLine1: '302 Cantrel Drive',
        AddressLine2: '',
        // tslint:disable-next-line: max-line-length
        City: 'Waupega',
        State: 'IL',
        ZipCode: '55523',
        IsPatient: true,
        IsActive: true,
        PhoneNumber: '2175403335',
        PrimaryDuplicatePatientId: '1234',
      };
      component.removeRelationship(duplcatePatient);
      expect(component.refreshAccountMembers).toHaveBeenCalled();
    });
  });

  describe('duplicateSelected function ->', () => {
    let showDialogSpy, canMergeSpy, thenSpy;
    beforeEach(() => {
      showDialogSpy = jasmine.createSpy();
      thenSpy = jasmine.createSpy();
      canMergeSpy = jasmine
        .createSpy()
        .and.returnValue({ $promise: { then: thenSpy } });

      (component as any).showMergeToAccountDialog = showDialogSpy;
      patientServices.PatientAccountTransfer = { canMerge: canMergeSpy };
    });

    it('should do nothing when mergeInProgress is true', () => {
      let duplicate = { IsActive: true, PatientId: 'patientId' };
      component.mergeInProgress = true;

      component.duplicateSelected(duplicate);

      expect(showDialogSpy).not.toHaveBeenCalled();
      expect(canMergeSpy).not.toHaveBeenCalled();
    });

    it('should do nothing if duplicate is null', () => {
      let duplicate = null;
      component.mergeInProgress = false;

      component.duplicateSelected(duplicate);

      expect(showDialogSpy).not.toHaveBeenCalled();
      expect(canMergeSpy).not.toHaveBeenCalled();
    });

    it('should call showCanMergeValidation when duplicate.IsActive is false', () => {
      let duplicate = { IsActive: false, PatientId: 'patientId' };
      component.mergeInProgress = false;

      component.duplicateSelected(duplicate);

      expect(showDialogSpy).toHaveBeenCalledWith(
        'Unable to merge',
        'The selected person is not active and cannot be merged.',
        false
      );
      expect(canMergeSpy).not.toHaveBeenCalled();
    });

    it('should set mergeInProgress to true and call PatientAccountTransfer.canMerge if duplicate.IsActive is true', () => {
      let duplicate = { IsActive: true, PatientId: 'patientId' };
      component.mergeInProgress = false;

      component.duplicateSelected(duplicate);

      expect(showDialogSpy).not.toHaveBeenCalled();
      expect(canMergeSpy).toHaveBeenCalledWith({
        personId: duplicate.PatientId,
      });
      expect(thenSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        (component as any).canMergeFailure
      );
    });

    describe('canMerge success callback ->', () => {
      let result, successSpy;
      beforeEach(() => {
        result = 'result';
        patientServices.PatientAccountTransfer.canMerge = () => {
          return { $promise: { then: success => success(result) } };
        };

        successSpy = jasmine.createSpy();
        (component as any).canMergeSuccess = successSpy;
      });

      it('should call canMergeSuccess', () => {
        let duplicate = { IsActive: true, PatientId: 'patientId' };
        component.mergeInProgress = false;

        component.duplicateSelected(duplicate);

        expect(successSpy).toHaveBeenCalledWith(result, duplicate.PatientId);
      });
    });
  });

  describe('canMergeSuccess function ->', () => {
    let failureSpy, showDialogSpy;
    beforeEach(() => {
      failureSpy = jasmine.createSpy();
      showDialogSpy = jasmine.createSpy();

      let compRef = component as any;
      compRef.canMergeFailure = failureSpy;
      compRef.showMergeToAccountDialog = showDialogSpy;
    });

    it('should call canMergeFailure if result is null', () => {
      let result = null;
      let patientId = 'id';

      (component as any).canMergeSuccess(result, patientId);

      expect(failureSpy).toHaveBeenCalled();
      expect(showDialogSpy).not.toHaveBeenCalled();
    });

    it('should call canMergeFailure if result.Value is null', () => {
      let result = {};
      let patientId = 'id';

      (component as any).canMergeSuccess(result, patientId);

      expect(failureSpy).toHaveBeenCalled();
      expect(showDialogSpy).not.toHaveBeenCalled();
    });

    describe('when result.Value.CanMerge is false ->', () => {
      let result, patientId;
      beforeEach(() => {
        result = { Value: { CanMerge: false } };
        patientId = 'id';
      });

      it('should call showMergeToAccountDialog with correct parameters when reason exists', () => {
        result.Value.Reason = 'reason';

        let message = 'reasonMessage';
        (component as any).messages.reason = message;

        (component as any).canMergeSuccess(result, patientId);

        expect(failureSpy).not.toHaveBeenCalled();
        expect(showDialogSpy).toHaveBeenCalledWith(
          'Unable to merge',
          message,
          false
        );
      });

      it('should call showMergeToAccountDialog with correct parameters when reason does not exists', () => {
        result.Value.Reason = 'reason';

        (component as any).canMergeSuccess(result, patientId);

        expect(failureSpy).not.toHaveBeenCalled();
        expect(showDialogSpy).toHaveBeenCalledWith(
          'Unable to merge',
          (component as any).messages.DefaultCannotMerge,
          false
        );
      });
    });

    describe('when result.Value.CanMerge is true ->', () => {
      let result, patientId;
      beforeEach(() => {
        result = { Value: { CanMerge: true } };
        patientId = 'id';
      });

      it('should call showMergeToAccountDialog with correct parameters when warning is true', () => {
        result.Value.Warning = true;
        result.Value.Reason = 'reason';

        let message = 'reasonMessage';
        (component as any).messages.reason = message;

        (component as any).canMergeSuccess(result, patientId);

        expect(failureSpy).not.toHaveBeenCalled();
        expect(showDialogSpy).toHaveBeenCalledWith(
          'Merge accounts',
          message,
          true,
          jasmine.any(Function)
        );
      });

      it('should call showMergeToAccountDialog with correct parameters when warning is false', () => {
        result.Value.Warning = false;
        result.Value.Reason = 'reason';

        (component as any).canMergeSuccess(result, patientId);

        expect(failureSpy).not.toHaveBeenCalled();
        expect(showDialogSpy).toHaveBeenCalledWith(
          'Merge accounts',
          (component as any).messages.DefaultMerge,
          true,
          jasmine.any(Function)
        );
      });
    });

    describe('showMergeToAccountDialog confirmCallback function ->', () => {
      let mergeSpy;
      beforeEach(() => {
        mergeSpy = jasmine.createSpy();

        (component as any).showMergeToAccountDialog = (
          title,
          message,
          okAndCancel,
          callback
        ) => {
          callback();
        };
        (component as any).mergePatientToAccount = mergeSpy;
      });

      it('should call mergePatientToAccount with correct parameters', () => {
        let result = { Value: { CanMerge: true } };
        let patientId = 'id';

        (component as any).canMergeSuccess(result, patientId);

        expect(mergeSpy).toHaveBeenCalledWith(patientId);
      });
    });
  });

  describe('canMergeFailure function ->', () => {
    it('should call toastrFactory.error and set mergeInProgress to false', () => {
      component.mergeInProgress = true;

      (component as any).canMergeFailure();

      expect(component.mergeInProgress).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalledWith(
        'Failed to check merge status. Refresh the page to try again.'
      );
    });
  });

  describe('showMergeToAccountDialog function ->', () => {
    let dialog, subSpy;
    beforeEach(() => {
      subSpy = jasmine.createSpy();
      dialog = {
        content: {
          instance: {},
        },
        result: {
          subscribe: subSpy,
        },
      };

      dialogService.open = jasmine.createSpy().and.returnValue(dialog);
    });

    it('should call dialogService.open and setup dialog correctly', () => {
      let title = 'fake title';
      let message = 'fake message';
      let okAndCancel = 'okAndCancel';

      (component as any).showMergeToAccountDialog(title, message, okAndCancel);

      expect(dialogService.open).toHaveBeenCalled();
      expect(component.dialog).toBe(dialog);
      expect(dialog.content.instance.title).toBe(title);
      expect(dialog.content.instance.message).toBe(message);
      expect(dialog.content.instance.okAndCancel).toBe(okAndCancel);
      expect(subSpy).toHaveBeenCalled();
    });

    describe('dialog.result.subscribe callback function ->', () => {
      let resultWrap;
      beforeEach(() => {
        resultWrap = {};
        dialog.result.subscribe = cb => cb(resultWrap.result);
        component.mergeInProgress = true;
      });

      it('should call confirmCallback and set mergeInProgress to false if result is true and confirmCallback exists', () => {
        let title = 'fake title';
        let message = 'fake message';
        let okAndCancel = 'okAndCancel';
        let cbSpy = jasmine.createSpy();
        resultWrap.result = true;

        (component as any).showMergeToAccountDialog(
          title,
          message,
          okAndCancel,
          cbSpy
        );

        expect(cbSpy).toHaveBeenCalled();
        expect(component.mergeInProgress).toBe(false);
      });

      it('should not call confirmCallback if result is not true', () => {
        let title = 'fake title';
        let message = 'fake message';
        let okAndCancel = 'okAndCancel';
        let cbSpy = jasmine.createSpy();
        resultWrap.result = false;

        (component as any).showMergeToAccountDialog(
          title,
          message,
          okAndCancel,
          cbSpy
        );

        expect(cbSpy).not.toHaveBeenCalled();
        expect(component.mergeInProgress).toBe(false);
      });

      it('should set mergeInProgress to false if confirmCallback does not exist', () => {
        let title = 'fake title';
        let message = 'fake message';
        let okAndCancel = 'okAndCancel';
        let cbSpy = null;
        resultWrap.result = true;

        (component as any).showMergeToAccountDialog(
          title,
          message,
          okAndCancel,
          cbSpy
        );

        expect(component.mergeInProgress).toBe(false);
      });
    });
  });

  describe('mergePatientToAccountFunction ->', () => {
    let thenSpy;
    beforeEach(() => {
      thenSpy = jasmine.createSpy();
      patientServices.PatientAccountTransfer = {
        merge: jasmine
          .createSpy()
          .and.returnValue({ $promise: { then: thenSpy } }),
      };
    });

    it('should call patientServices.PatientAccountTransfer.merge', () => {
      component.accountId = 'acct';
      let patientId = 'pat';

      (component as any).mergePatientToAccount(patientId);

      expect(patientServices.PatientAccountTransfer.merge).toHaveBeenCalledWith(
        { patientId: patientId, otherAccountId: component.accountId }
      );
      expect(thenSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.any(Function)
      );
    });

    describe('merge success callback function ->', () => {
      let resultWrap;
      beforeEach(() => {
        resultWrap = {};
        patientServices.PatientAccountTransfer.merge = () => {
          return {
            $promise: {
              then: success => {
                success(resultWrap.result);
              },
            },
          };
        };
        component.ngOnInit = jasmine.createSpy();

        toastrFactory.error.calls.reset();
        toastrFactory.success.calls.reset();
      });

      it('should call methods when res and res.Value are not null', () => {
        resultWrap.result = { Value: {} };

        (component as any).mergePatientToAccount();

        expect(toastrFactory.success).toHaveBeenCalled();
        expect(toastrFactory.error).not.toHaveBeenCalled();
        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call toastrFactory.error when res is null', () => {
        resultWrap.result = null;

        (component as any).mergePatientToAccount();

        expect(toastrFactory.success).not.toHaveBeenCalled();
        expect(toastrFactory.error).toHaveBeenCalled();
        expect(component.ngOnInit).not.toHaveBeenCalled();
      });

      it('should call toastrFactory.error when res.Value is null', () => {
        resultWrap.result = {};

        (component as any).mergePatientToAccount();

        expect(toastrFactory.success).not.toHaveBeenCalled();
        expect(toastrFactory.error).toHaveBeenCalled();
        expect(component.ngOnInit).not.toHaveBeenCalled();
      });
    });

    describe('merge failure callback function ->', () => {
      beforeEach(() => {
        patientServices.PatientAccountTransfer.merge = () => {
          return {
            $promise: {
              then: (success, failure) => {
                failure();
              },
            },
          };
        };
      });

      it('should call toastrFactory.error', () => {
        (component as any).mergePatientToAccount();

        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });
  });
});
