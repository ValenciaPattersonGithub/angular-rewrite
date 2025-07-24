import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { of } from 'rxjs';
import { ViewCompareRoleType } from './roles-matrix.model';
import { ViewCompareRolesComponent } from './view-compare-roles.component';

describe('ViewCompareRolesComponent', () => {
  let component: ViewCompareRolesComponent;
  let fixture: ComponentFixture<ViewCompareRolesComponent>;

  let dialogservice: DialogService;
  let mockSections = [
    { text: 'Account', value: 'Account' },
    { text: 'Clinical', value: 'Clinical' }];
  let mockRes = "{\"Modules\":[{\"Name\":\"Dashboard\",\"Functions\":[{\"Name\":\"PracticeataGlanceDashboard\",\"Actions\":[{\"Name\":\"View\",\"Roles\":[\"PracticeAdmin/Exec.Dentist\",\"AssociateDentist\"],\"ActionIds\":[\"2851\"]}]}]}]}"
  let mockRoles = [
    { RoleName: 'Assistant' },
    { RoleName: 'Associate Dentist' },
    { RoleName: 'low' },
    { RoleName: 'medium' },
    { RoleName: 'high' }];

  let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: (AccessCode) => {
      if (AccessCode == "soar-biz-sec-roldet") {
        return true;
      }
      else {
        return false;
      }

    }
  };

  let mockRoleNames = {
    PracticeAdmin: 'Practice Admin/Exec. Dentist',
    RxUser: 'Rx User'
  }

  let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };
  

  let mockUserServices = {
    Roles: {
      getRoleMatrix: () => {
        return {
          $promise: {
            then: (res, error) => {
              res({Value:mockRes}),
                error({
                  data: {
                    InvalidProperties: [{
                      PropertyName: "",
                      ValidationMessage: ""
                    }]
                  }
                })
            }
          }
        }
      },
      get: () => {
              return {
                  $promise: {
                      then: (res, error) => {
                          res({Result:mockRoles}),
                              error({
                                  data: {
                                      InvalidProperties: [{
                                          PropertyName: "",
                                          ValidationMessage: ""
                                      }]
                                  }
                              })
                      }
                  }
              }
          }
      },
  }

  const mockLocalizeService = {
    getLocalizedString: () => 'translated text'
  };

  const mockDialogRef = {
    close: () => of({}),
    open: () => { },
    content: {
      instance: {
        title: ''
      }
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewCompareRolesComponent],
      imports: [TranslateModule.forRoot()],
      providers: [DialogService, DialogContainerService,
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: 'UserServices', useValue: mockUserServices },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'RoleNames', useValue: mockRoleNames },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCompareRolesComponent);
    component = fixture.componentInstance;
    dialogservice = TestBed.inject(DialogService)
    spyOn(dialogservice, 'open').and.returnValue({ content: { instance: {} }, result: of() });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //notifyNotAuthorized
  describe('notifyNotAuthorized function -> ', () => {
    it('should call toastrFactory', () => {
      component.notifyNotAuthorized();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('role selection -> ', () => {
    it('on role selection', () => {
        component.filterRoles = component.selectedRoles = mockRoles
        component.onRoleSelectedChange({ RoleName: 'Assistant' })
        expect(component.selectedValue).toEqual(null);
    })
}) 
describe('remove role -> ', () => {
  it('remove role from selection', () => {
      component.filterRoles = component.selectedRoles = mockRoles
      component.removeRoles("Assistant")
      expect(component.filterRoles.length).toEqual(5);
  })
})
describe('filter display role and display section -> ', () => {
  it('filter display role', () => {
      component.filterRoles = component.roles = mockRoles
      component.handleRoleFilter("Assistant")
      expect(component.filterRoles.length).toEqual(1);
  })

  it('filter display selection', () => {
      component.filterDisplaySections = component.displaySections = mockSections
      component.handleSectionFilter("Account")
      expect(component.filterDisplaySections.length).toEqual(1);
  })
})
describe('openViewComapreModal ->', () => {
  it('Open compare role model up', () => {
    mockUserServices.Roles.getRoleMatrix()
      component.openViewComapreModal(ViewCompareRoleType.compare);
      expect(component.isCompareRole).toEqual(true);
  });
  it('Open view role model up', () => {
    mockUserServices.Roles.getRoleMatrix()
      component.openViewComapreModal(ViewCompareRoleType.view);
      expect(component.isCompareRole).toEqual(false);
  });
});

describe('toggle ->', () => {
    it('toggle should open accordion when closed', () => {
        component.roleMatrix = [{ Name: "name", Functions: [], active: false }]
        let index = 0;
        component.toggle(index);
        expect(component.roleMatrix[index].active).toEqual(true);
    });

    it('toggle should close accordion when opend', () => {
        component.roleMatrix = [{ Name: "name", Functions: [], active: false }]
        let index = 0;
        component.toggle(index);
        expect(component.roleMatrix[index].active).not.toEqual(false);
    });
});
});
