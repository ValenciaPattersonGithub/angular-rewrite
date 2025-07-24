import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DataStateChangeEvent, GridModule } from '@progress/kendo-angular-grid';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { NoResultsComponent } from 'src/@shared/components/noResult/no-results/no-results.component';
import { OrderByPipe } from 'src/@shared/pipes';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { configureTestSuite } from 'src/configure-test-suite';
import { TeamMemberIdentifiersComponent } from './team-member-identifiers.component';
import { SortDescriptor } from '@progress/kendo-data-query';
import { MasterTeamMemberIdentifier } from 'src/business-center/practice-settings/models/team-member-identifier.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TeamMemberIdentifierService } from 'src/@shared/providers/team-member-identifier.service';


let localize;
let teamMemberIdentifierList = {
  Value: [
    { DataTag: 'AAAAAAALtDw=', DateDeleted: null, DateModified: '2022-06-07T10:02:27.921738', Description: 'Test', MasterUserIdentifierId: '16ca7326-0ae7-4f0f-be7d-16428b431c3b', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
    { DataTag: 'AAAAAAAL/o4=', DateDeleted: null, DateModified: '2022-06-19T07:19:49.5247696', Description: 'Test QA', MasterUserIdentifierId: 'f5c40f16-ed83-4616-aaf5-8600d46d83c8', Qualifier: 4, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
    { DataTag: 'AAAAAAAL/pI="', DateDeleted: null, DateModified: '2022-06-19T07:22:40.6805857', Description: 'Test QA 1', MasterUserIdentifierId: '1697c792-8780-4f1d-b5bd-739d46c4b492', Qualifier: 1, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
    { DataTag: 'AAAAAAAMAQM=', DateDeleted: null, DateModified: '2022-06-20T06:24:26.3819186', Description: 'Test QA 2', MasterUserIdentifierId: '96307e38-a65d-410b-a333-9509bebf5064', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
  ]
};

const retValue = { $promise: { then: jasmine.createSpy() } };
let mockTeamMemberIdentifier = { DataTag: 'AAAAAAALtDw=', DateDeleted: null, DateModified: new Date(), Description: 'Test', MasterUserIdentifierId: '16ca7326-0ae7-4f0f-be7d-16428b431c3b', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' };

let mockTeamMemberIdentifierService = {
  get: () => {
    return {
      then: (success, error) => {
        success({
          Value: [
            { DataTag: 'AAAAAAALtDw=', DateDeleted: null, DateModified: '2022-06-07T10:02:27.921738', Description: 'Test', MasterUserIdentifierId: '16ca7326-0ae7-4f0f-be7d-16428b431c3b', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
            { DataTag: 'AAAAAAAL/o4=', DateDeleted: null, DateModified: '2022-06-19T07:19:49.5247696', Description: 'Test QA', MasterUserIdentifierId: 'f5c40f16-ed83-4616-aaf5-8600d46d83c8', Qualifier: 4, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
            { DataTag: 'AAAAAAAL/pI="', DateDeleted: null, DateModified: '2022-06-19T07:22:40.6805857', Description: 'Test QA 1', MasterUserIdentifierId: '1697c792-8780-4f1d-b5bd-739d46c4b492', Qualifier: 1, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
            { DataTag: 'AAAAAAAMAQM=', DateDeleted: null, DateModified: '2022-06-20T06:24:26.3819186', Description: 'Test QA 2', MasterUserIdentifierId: '96307e38-a65d-410b-a333-9509bebf5064', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
          ]
        }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "Description",
                ValidationMessage: "Not Allowed"
              }]
            }
          })
      }

    }
  },
  save: (masterTeamMemberIdentifier: MasterTeamMemberIdentifier) => {
    return {
      then: (res, error) => {
        res({ Value: mockTeamMemberIdentifier }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "Description",
                ValidationMessage: "Not Allowed"
              }]
            }
          })
      }
    }
  },
  update: (masterTeamMemberIdentifier: MasterTeamMemberIdentifier) => {
    return {
      then: (res, error) => {
        res({ Value: mockTeamMemberIdentifier }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "Description",
                ValidationMessage: "Not Allowed"
              }]
            }
          })
      }
    }
  },
  delete: (MasterUserIdentifierId: MasterTeamMemberIdentifier) => {
    return {
      then: (res) => {
        res({ Value: mockTeamMemberIdentifier.MasterUserIdentifierId })
      }
    }
  },

  teamMemberIdentifier: (MasterUserIdentifierId: MasterTeamMemberIdentifier) => {
    return {
      then: (res) => {
        res({ Value: mockTeamMemberIdentifier.MasterUserIdentifierId })
      }
    }
  },
};

let mockLocalizeService = {
  getLocalizedString: () => 'translated text'
};

let mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error')
};

let mockListHelper = {
  findIndexByFieldValue: () => 2
};

let mockPatSecurityService = {
  IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
};

let mockMasterTeamMemberIdentifierQualifiers = [
  { Value: 0, Text: 'None' },
  { Value: 1, Text: '0B   State License Number' },
  { Value: 2, Text: 'G2   Provider UPIN Number' },
  { Value: 3, Text: 'G2   Provider Commercial Number' },
  { Value: 4, Text: 'LU   Location Number' },
  { Value: 5, Text: 'ZZ   Provider Taxonomy' }
]

let ListHelper;

let mockDataStateChangeEvent: DataStateChangeEvent = {
  skip: 1,
  take: 1,
  group: [],
  sort: []
};

let mockData = [{ id: 1, Description: 'test1' }, { id: 2, Description: 'test2' }, { id: 3, Description: 'test3' }];

let mockLocation = {
  path: jasmine.createSpy().and.returnValue({}), get: jasmine.createSpy().and.returnValue({})
};

const mockSort: SortDescriptor[] = [
  {
    field: "Description",
    dir: "asc",
  },
  {
    field: "Qualifier",
    dir: "asc",
  },
];

const mockSoarConfig = {
  domainUrl: 'https://localhost:35440',
};

// confirmationModal objects
const mockConfirmationModalSubscription = {
  subscribe: jasmine.createSpy(),
  unsubscribe: jasmine.createSpy(),
  _subscriptions: jasmine.createSpy(),
  _parentOrParents: jasmine.createSpy(),
  closed: jasmine.createSpy(),
};

const mockDialogRef = {
  events: {
    pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy().and.returnValue({ type: 'confirm' }) }),
    subscribe: jasmine.createSpy(),
    unsubscribe: jasmine.createSpy(),
  },
  subscribe: jasmine.createSpy(),
  unsubscribe: jasmine.createSpy(),
  _subscriptions: jasmine.createSpy(),
  _parentOrParents: jasmine.createSpy(),
  closed: jasmine.createSpy(),
};

const mockConfirmationModalService = {
  open: jasmine.createSpy().and.returnValue({
    events: {
      pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
    },
    subscribe: jasmine.createSpy(),
    closed: jasmine.createSpy(),
  }),
};

describe('TeamMembersIdentifiersComponent', () => {
  let component: TeamMemberIdentifiersComponent;
  let fixture: ComponentFixture<TeamMemberIdentifiersComponent>;
  let toastrFactory;

  const mockService = {
    // define called methods
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        AppKendoUIModule,
        GridModule,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'ListHelper', useValue: mockListHelper },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: '$location', useValue: mockLocation },
        { provide: TeamMemberIdentifierService, useValue: mockTeamMemberIdentifierService },
        { provide: ConfirmationModalOverlayRef, useValue: mockService },
        { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: 'patSecurityService', useValue: mockPatSecurityService }

      ],
      declarations: [TeamMemberIdentifiersComponent, OrderByPipe, NoResultsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeamMemberIdentifiersComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamMemberIdentifiersComponent);
    component = fixture.componentInstance;
    localize = TestBed.get('localize');
    ListHelper = TestBed.get('ListHelper');
    toastrFactory = TestBed.get('toastrFactory');
    component.sort = mockSort;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call a teamMember identifier method', () => {
      component.getTeamMemberIdentifiers = jasmine.createSpy();
      component.ngOnInit();
      expect(component.getTeamMemberIdentifiers).toHaveBeenCalled();
    });

    it('should call the page navigation method ', () => {
      component.getPageNavigation = jasmine.createSpy();
      component.ngOnInit();
      expect(component.getPageNavigation).toHaveBeenCalled();
    });

    it('should call the auth access method ', () => {
      component.authAccess = jasmine.createSpy();
      component.ngOnInit();
      expect(component.authAccess).toHaveBeenCalled();
    });
  });

  describe('initialize controller ->', () => {
    it('should exist', () => {
      expect(component).not.toBeNull();
    });
  });

  describe('should show a toastr notification in case of no view access -> ', () => {
    it('should trigger the toastr error', () => {
      const authViewAccess = component.authViewAccess();
      component.authAccess();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('should call the auth view access -> ', () => {
    it('should get the boolean value', () => {
      const val = component.authViewAccess();
      expect(val).not.toBeNull();
    });
  });

  describe('should call the auth create access -> ', () => {
    it('should get the boolean value', () => {
      const val = component.authCreateAccess();
      expect(val).not.toBeNull();
    });
  });

  describe('should call the auth delete access -> ', () => {
    it('should get the boolean value', () => {
      const val = component.authDeleteAccess();
      expect(val).not.toBeNull();
    });
  });

  describe('should call the auth edit access -> ', () => {
    it('should get the boolean value', () => {
      const val = component.authEditAccess();
      expect(val).not.toBeNull();
    });
  });

  describe('should call the get teamMember identifier method -> ', () => {
    it('should get the boolean value', () => {
      component.getTeamMemberIdentifiers();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.teamMemberIdentifiersGetSuccess(teamMemberIdentifierList[0])).toHaveBeenCalled();
      });
    });
  });

  describe('getTeamMemberIdentifiers failure ->', () => {
    it('should display toast error', () => {
      component.teamMemberIdentifiersGetFailure();

      expect(component.teamMemberIdentifiers).toEqual([]);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('saveTeamMemberidentifier method ->', () => {
    it('should call the method', () => {
      component.saveTeamMemberIdentifier();
    });
    it('should populate response', () => {
      const spy = component.getTeamMemberIdentifiers = jasmine.createSpy();
      component.savePostSuccess(teamMemberIdentifierList.Value[0]);

      expect(toastrFactory.success).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
    it('should display toast error', () => {
      component.savePostFailure(teamMemberIdentifierList.Value[0]);

      expect(component.loading).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('updateTeamMemberIdentifiers ->', () => {
    it('should update rowIndex', () => {
      component.updateTeamMemberIdentifier(1);
      expect(component.rowIndex).toBe(1);
    });
  });

  describe('updateTeamMemberIdentifiers success ->', () => {
    it('should call toastr success', () => {
      const spy = component.getTeamMemberIdentifiers = jasmine.createSpy();
      component.updatePostSuccess(teamMemberIdentifierList.Value[0]);

      expect(toastrFactory.success).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('updateTeamMemberIdentifiers failure ->', () => {
    it('should display toast error', () => {
      component.updatePostFailure(teamMemberIdentifierList.Value[0]);

      expect(component.loading).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('teamMemberWithTeamMemberIdentifierSuccess method ->', () => {
    it('should call delete location itentifier', () => {
      component.hasDeleteAccess = true;
      const spy = component.openDeleteConfirmationModal = jasmine.createSpy();
      mockTeamMemberIdentifierService.teamMemberIdentifier = jasmine.createSpy().and.returnValue({
        then: (success, failure) => { failure({}), success("") }
      }),
        component.removeHandler({ dataItem: teamMemberIdentifierList.Value[0] })
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('teamMemberWithTeamMemberIdentifierSuccess method ->', () => {
    it('should call confirm delete', () => {
      const spy = component.confirmDelete = jasmine.createSpy();
      const data = { 'Value': '' }
      component.teamMemberWithTeamMemberIdentifierSuccess(data, teamMemberIdentifierList.Value[0]);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('teamMemberWithTeamMemberIdentifierSuccess method ->', () => {
    it('should call confirm delete', () => {
      const data = { 'Value': 'test' }
      component.teamMemberWithTeamMemberIdentifierSuccess(data, teamMemberIdentifierList.Value[0]);
      component.confirmDelete(teamMemberIdentifierList.Value[0]);

    });
  });

  describe('teamMemberIdentifierWithTeamMembers failure ->', () => {
    it('should display toast error', () => {
      component.teamMemberIdentifierWithTeamMembersFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('confirmdelete ->', () => {
    it('should display confirm delete', () => {
      const spy = component.openDeleteConfirmationModal = jasmine.createSpy();
      component.confirmDelete(teamMemberIdentifierList.Value[0]);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('deleteTeamMemberIdentifier Success ->', () => {
    it('should display toast success', () => {
      component.deleteTeamMemberIdentifierSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(component.deletingTeamMemberIdentifier).toBe(false);
    });
  });

  describe('deleteTeamMemberIdentifier failure ->', () => {
    it('should display toast failure', () => {
      component.deleteTeamMemberIdentifierFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(component.deletingTeamMemberIdentifier).toBe(false);
    });
  });

  describe('dataStateChange  method ->', () => {
    it('should call the method', () => {
      component.dataStateChange(mockDataStateChangeEvent);
      expect(component.state).toBe(mockDataStateChangeEvent);
    });
  });

  describe('SaveHandler method ->', () => {
    it('should call the method', () => {
      const spy = component.saveHandler = jasmine.createSpy();
      component.saveHandler({ sender: '', formGroup: '', isNew: false, rowIndex: '' });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('SaveHandler method ->', () => {
    it('should call the openUpdateConfirmationModal method', () => {
      const mockEventObj = {
        sender: {
          closeRow: () => { },
          editRow: () => { }
        },
        rowIndex: 0,
        isNew: false,
        formGroup: undefined
      };
      const spy = component.openUpdateConfirmationModal = jasmine.createSpy();
      component.openUpdateConfirmationModal(null);
      component.saveHandler(mockEventObj);
      expect(spy).toHaveBeenCalled();

    });
  });

  describe('SaveHandler method ->', () => {
    it('should call the saveLocationIdentifier method', () => {
      spyOn(component, "saveTeamMemberIdentifier");
      const mockEventObj = {
        sender: {
          closeRow: () => { },
          editRow: () => { }
        },
        rowIndex: 0,
        isNew: true,
        formGroup: undefined
      };
      component.saveHandler(mockEventObj);
      expect(component.saveTeamMemberIdentifier).toHaveBeenCalled();
    });
  });

  describe('cancelHandler method->', () => {
    const mockEventObj = {
      sender: {
        closeRow: () => { },
        editRow: () => { }
      },
      rowIndex: 0
    };
    it('should make the row cancel', () => {
      spyOn(component, 'closeEditor');
      component.cancelHandler(mockEventObj);
      expect(component.closeEditor).toHaveBeenCalledWith(mockEventObj.sender, mockEventObj.rowIndex);
    });
  });

  describe('Cancel Handler method ->', () => {
    const mockEventObj = {
      sender: {
        closeRow: () => { },
        editRow: () => { }
      },
      rowIndex: 0
    };
    it('should call the method', () => {
      const spy = component.cancelHandler = jasmine.createSpy();
      component.cancelHandler(mockEventObj);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('removeHandler method ->', () => {
    it('should call delete ', () => {
      component.removeHandler({ dataItem: mockData[0] })
    });
  });

  describe('Add Handler method ->', function () {
    const mockEventObj = {
      rowIndex: 0, dataItem: mockData[0], sender: {
        closeRow: () => { },
        editRow: () => { },
        addRow: () => { }
      }, isNew: true
    };
    it('should call the method', function () {

      component.addHandler(mockEventObj);
    });
  });

  describe('editHandler method->', () => {
    const mockEventObj = {
      rowIndex: 0, dataItem: mockData[0], sender: {
        closeRow: () => { },
        editRow: () => { }
      },
    };
    it('should make the row editable', () => {
      component.editHandler(mockEventObj);
    });
  });

  describe('sortChange method -> ', () => {
    it('should sort the grid data', () => {
      spyOn(component, 'getTeamMemberIdentifiers');
      component.sortChange(mockSort);

      expect(component.sort).toEqual(mockSort);
      expect(component.getTeamMemberIdentifiers).toHaveBeenCalled();
    });
  });

  describe('teamMemberIdentifiersGetSuccess method -> ', () => {
    it('should display toast error', function () {
      const data = teamMemberIdentifierList
      component.sort = mockSort;
      component.teamMemberIdentifiersGetSuccess(data);

      expect(component.teamMemberIdentifiers).not.toEqual(null);
    });
  });

  describe('getQualifier method ->', () => {
    it('should return masterLocationIdentifierQualifier', async () => {
      const id = teamMemberIdentifierList.Value[0].Qualifier;
      const qualifier = component.getQualifier(id);
      expect(qualifier).toEqual(mockMasterTeamMemberIdentifierQualifiers[3]);
    });
  });

  describe('closeEditor method ->', () => {
    it('should close grid editor', () => {
      const spy = component.closeEditor = jasmine.createSpy();
      component.closeEditor(teamMemberIdentifierList, 0);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('authAccess ->', () => {
    beforeEach(() => {
      component.authViewAccess = jasmine.createSpy().and.returnValue(true);
    });

    it('should call authViewAccess', () => {
      component.authAccess();
      expect(component.authViewAccess).toHaveBeenCalled();
    });

    it('when authViewAccess returns true, should set hasViewAccess to true', () => {
      component.authAccess();
      expect(component.hasViewAccess).toEqual(true);
    });

    it('when authViewAccess returns false, show a message adnt redirect back to the home page', () => {
      component.authViewAccess = jasmine.createSpy().and.returnValue(false);
      component.authAccess();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(mockLocation.path).toHaveBeenCalledWith(encodeURIComponent("/"));
    });
  });

  describe('validateDelete method ->', () => {
    it('should call the method', () => {
      let locationIdentifier = teamMemberIdentifierList.Value[0];
      component.validateDelete(locationIdentifier);
      expect(mockTeamMemberIdentifierService.teamMemberIdentifier).toHaveBeenCalledWith(locationIdentifier.MasterUserIdentifierId);
    });
  });

  describe('validateDelete method ->', () => {
    it('should call the method', () => {
      const spy = component.validateDelete = jasmine.createSpy();
      component.validateDelete({});
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('validateDelete method success ->', () => {
    let teamMemberIdentifier = { Description: '' };
    let res = { Value: [] }
    it('locationIdentifierWithLocationsSuccess method should call', () => {
      const spy = component.teamMemberWithTeamMemberIdentifierSuccess = jasmine.createSpy();
      component.teamMemberWithTeamMemberIdentifierSuccess(res, teamMemberIdentifier);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('openUpdateConfirmationModal method -> ', () => {
    it('should open openUpdateConfirmationModal', () => {
      const data = component.confirmationModalData;
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      component.openUpdateConfirmationModal(data);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
        events: {
          pipe: (event) => {
            return {
              type: "close",
              subscribe: (success) => {
                success({ type: "close" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy()
      });
      const ref = mockConfirmationModalService.open({ data });
      component.openUpdateConfirmationModal(data);
      expect(component.confirmationRef).toEqual(ref);
    });
  });

  describe('openDeleteConfirmationModal ->', () => {
    it('should open openDeleteConfirmationModal', () => {
      const data = component.confirmationModalData;
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      component.openDeleteConfirmationModal(data);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
        events: {
          pipe: (event) => {
            return {
              type: "close",
              subscribe: (success) => {
                success({ type: "close" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy()
      });
      const ref = mockConfirmationModalService.open({ data });
      component.openDeleteConfirmationModal(data);
      expect(component.confirmationRef).toEqual(ref);
    })
  });

});