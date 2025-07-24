import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountNoteMenuComponent } from './patient-account-note-menu.component';
import { TranslateModule,TranslateService } from '@ngx-translate/core';
import * as moment from "moment";

describe('PatientAccountNoteMenuComponent', () => {
  let component: PatientAccountNoteMenuComponent;
  let fixture: ComponentFixture<PatientAccountNoteMenuComponent>;
  const mockreferenceDataService: any = {
    get: jasmine.createSpy(),
    entityNames: {
      serviceTypes: []
    }
  };
  // const mockModalFactory: any = {
  //   Modal: jasmine.createSpy().and.returnValue([{ isEncounterServices: false }])
  // };
  const mockToastrFactory: any = {
    error: jasmine.createSpy(),
    success: jasmine.createSpy()
  };
  let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
  };
  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text'
  };

  const mockPatientServices = {
    Account: {
      getAllAccountMembersByAccountId: jasmine.createSpy('patientServices.Account.getAllAccountMembersByAccountId').and.returnValue({
        $promise: {
          then: function (callback) {
            callback({
              Value: {
              }
            });
          }
        }
      })
    }
  };

  const mockservice = {
    deleteAccountNote: jasmine.createSpy(),
    viewEob: jasmine.createSpy(),
    viewRte: jasmine.createSpy(),
    getAccountNote: jasmine.createSpy('accountNoteFactory.getAccountNote').and.returnValue({
      then: function (callback) {
        callback({
          Value: {
            Description: 'Test Description'
          }
        });
      }
    }),
    viewStatement: (a: any) => { },
    launchNewTab: (a: any) => { },
    getLocalizedString: (a: any) => { },
  };
  const mockTimeZoneFactory: any = {
    ConvertDateToMomentTZ: jasmine.createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ').and.callFake(function (date) { return moment(date); }),
    ConvertDateTZString: jasmine.createSpy('mockTimeZoneFactory.ConvertDateTZString').and.callFake(function (date) { return date; })
  };

  const patSecurityServiceMock = {
    generateMessage: jasmine.createSpy().and.returnValue(''),
    IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
};
  const mockUibModal: any = {
    open: jasmine.createSpy('modalInstance.open'),
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss'),
    result: {
      then: jasmine.createSpy('modalInstance.result.then')
    }
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientAccountNoteMenuComponent], imports: [
        TranslateModule.forRoot()],
      providers: [
        { provide: 'referenceDataService', useValue: mockreferenceDataService },
        // { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'AccountNoteFactory', useValue: mockservice },
        { provide: 'PatientServices', useValue: mockPatientServices },
        { provide: 'TimeZoneFactory', useValue: mockTimeZoneFactory },
        { provide: '$uibModal', useValue: mockUibModal },
        { provide: '$scope', useValue: {} },
        { provide: 'patSecurityService', useValue: patSecurityServiceMock },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountNoteMenuComponent);
    component = fixture.componentInstance;
    component.accountNotesRow = { };
    fixture.detectChanges();
    component.hasAccountNoteViewAccess = true;
    component.hasAccountNoteEditAccess = true;
    component.hasAccountNoteDeleteAccess = true;
    component.hasViewEOBAccess = true;
    component.hasViewRTEAccess = true;

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('scope.viewAccountNote -> ', function () {
    it('should call to open account note modal', function () {
      var spy = spyOn(component, 'showModalAccountNote');
      component.isAddmode = true;
      component.mode = 'edit';
      component.viewAccountNote();
      expect(spy).toHaveBeenCalled();
      expect(component.isAddmode).toBe(false);
      expect(component.mode).toBe('view');
    });

  });

  describe('scope.editAccountNote -> ', function () {
    it('should call to open account note modal', function () {
      var spy = spyOn(component, 'showModalAccountNote');
      component.mode = 'view';
      component.editAccountNote();
      expect(spy).toHaveBeenCalled();
      expect(component.mode).toBe('edit');
    });
  });


  describe('scope.deleteAccountNote -> ', function () {
    it('should call to delete note', function () {
      mockservice.deleteAccountNote = jasmine.createSpy()
      component.accountNotesRow = { NoteType: 1, ObjectIdLong: 5 };
      component.deleteAccountNote();
      expect(mockservice.deleteAccountNote).toHaveBeenCalledWith(1, 5, component.refreshSummaryPageDataForGrid);
    });
  });

  describe('scope.viewEob ->', function () {
    it('should call account note factory viewEob function', function () {
      mockservice.viewEob = jasmine.createSpy()

      component.accountNotesRow = { EraTransactionSetHeaderId: 2, ObjectIdLong: 5, PersonId: 7 };
      component.viewEob();
      expect(mockservice.viewEob).toHaveBeenCalledWith(2, 5, 7);
    });
  });


  describe('scope.viewRte ->', function () {
    it('should not call account note factory viewRte function if record date before November 2024', function () {
      mockservice.viewRte = jasmine.createSpy();
      component.accountNotesRow = { ObjectIdLong: 2, Date: new Date('2024-10-30') };
      component.viewRte();
      expect(mockservice.viewRte).not.toHaveBeenCalledWith(2);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  
    it('should call account note factory viewRte function if date after October 2024', function () {
      mockservice.viewRte = jasmine.createSpy();
      component.accountNotesRow = { ObjectIdLong: 2, Date: new Date('2024-11-01') };
      component.viewRte();
      expect(mockservice.viewRte).toHaveBeenCalledWith(2);
    });
  });

  describe('ctrl.showModalAccountNote -> ', function () {
    it('should call to get account note', function () {
      component.accountNotesRow = { ObjectIdLong: 2 };
      component.showModalAccountNote();
      expect(mockservice.getAccountNote).toHaveBeenCalledWith(2);
    });
  });

  describe('ctrl.getPersonAccountMembers -> ', function () {
    it('should call to get account members', function () {
      component.personAccountNote = { AccountId: 2 };
      component.getPersonAccountMembers();
      expect(mockPatientServices.Account.getAllAccountMembersByAccountId).toHaveBeenCalledWith({ accountId: component.personAccountNote.AccountId }
        , component.personAccountMemberSuccess, component.personAccountMemberFailure);
    });
  });


  describe('ctrl.personAccountMemberSuccess -> ', function () {
    it('should open account note modal', function () {
      var accountmembers = {
        Value: {
          AccountId: 2
        }
      };
      component.mode == 'edit';
      mockUibModal.open = jasmine.createSpy('modalInstance.open');
      component.personAccountNote = { LocationId: 3, DateEntered: new Date(), PatientId: 2, NoteType: 1 };
      component.personAccountMemberSuccess(accountmembers);
      expect(mockUibModal.open).toHaveBeenCalled();
      expect(component.selectedPatientId).toBe(2);
      expect(component['scope'].accountMembers).toBe(accountmembers.Value);
    });

    it('should not open account note modal if note type is 2 and mode is view', function () {
      var accountmembers = {
        Value: {
          AccountId: 2
        }
      };
      component.mode == 'view';
      mockUibModal.open = jasmine.createSpy('modalInstance.open');
      component.personAccountNote = { LocationId: 3, DateEntered: new Date(), PatientId: 2, NoteType: 2 };
      component.personAccountMemberSuccess(accountmembers);
      expect(mockUibModal.open).not.toHaveBeenCalled();
      expect(component.selectedPatientId).toBe(undefined);
      expect(component['scope'].accountMembers).toBe(undefined);
    });
  });
  describe('ctrl.personAccountMemberFailure -> ', function () {
    it('should create toastr message', function () {
      component.personAccountMemberFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });
});
