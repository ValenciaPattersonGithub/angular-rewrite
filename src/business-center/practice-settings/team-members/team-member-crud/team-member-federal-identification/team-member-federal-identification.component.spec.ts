import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TeamMemberFederalIdentificationComponent } from './team-member-federal-identification.component';
import cloneDeep from 'lodash/cloneDeep';
import { SimpleChanges } from '@angular/core';
import { OrderByPipe } from 'src/@shared/pipes';
import { SoarSelectListComponent } from 'src/@shared/components/soar-select-list/soar-select-list.component';

let taxonomyCodes = [];
let primaryTaxonomyCodes = [];
let secondaryTaxonomyCodes = [];

let userMock = {
  Value:
    { UserId: '1', RxUserType: 0, FirstName: 'John', LastName: 'Doe', NpiTypeOne: null, ProviderTypeId: null, PrimaryTaxonomyId: null, SecondaryTaxonomyId: null, }
}

let taxonomyCodesMock = [{ TaxonomyCodeId: '1', Category: 'Category1', Code: '123', $$DisplayText: '' },
{ TaxonomyCodeId: '2', Category: 'Category2', Code: '123', $$DisplayText: '' },
{ TaxonomyCodeId: '3', Category: 'Category3', Code: '123', $$DisplayText: '' },
{ TaxonomyCodeId: '4', Category: 'Category4', Code: '123', $$DisplayText: '' },
{ TaxonomyCodeId: '5', Category: 'Category5', Code: '123', $$DisplayText: '' }]

let staticDataMock = {
  TaxonomyCodes: jasmine.createSpy().and.callFake(() => {
    return {
      then(res) {
        res({ Value: taxonomyCodesMock })
      }
    }
  })
};

let mockPatSecurityService = {
  IsAuthorizedByAbbreviation: jasmine.createSpy("patSecurityService.IsAuthorizedByAbbreviation").and.returnValue(true),
  IsAuthorizedByAbbreviationAtPractice: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviationAtPractice').and.returnValue(true)
};

let changes: SimpleChanges = {
  user: {
    currentValue: userMock,
    previousValue: null,
    firstChange: false,
    isFirstChange: () => { return false }
  },
  userLocationSetups: {
    currentValue: [{ 'ProviderTypeId': 1 }],
    previousValue: null,
    firstChange: false,
    isFirstChange: () => { return false }
  },
  userLocationSetupsDataChanged: {
    currentValue: {},
    previousValue: null,
    firstChange: false,
    isFirstChange: () => { return false }
  },
  isPrescribingUser: {
    currentValue: true,
    previousValue: null,
    firstChange: false,
    isFirstChange: () => { return false }
  }
}

let createForm = new FormGroup({
  TaxId: new FormControl(),
  FederalLicense: new FormControl(),
  DeaNumber: new FormControl(),
  NpiTypeOne: new FormControl(),
  PrimaryTaxonomyId: new FormControl(),
});

let rxSettings = { roles: [{ value: 1 }] }

const mockRootScope = {
  $on: jasmine.createSpy().and.returnValue(rxSettings)
}

describe('TeamMemberFederalIdentificationComponent', () => {
  let component: TeamMemberFederalIdentificationComponent;
  let fixture: ComponentFixture<TeamMemberFederalIdentificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
      providers: [
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'StaticData', useValue: staticDataMock },
        { provide: '$rootScope', useValue: mockRootScope },
      ],
      declarations: [TeamMemberFederalIdentificationComponent, OrderByPipe, SoarSelectListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamMemberFederalIdentificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    taxonomyCodes = cloneDeep(taxonomyCodesMock);
    primaryTaxonomyCodes = cloneDeep(taxonomyCodesMock);
    secondaryTaxonomyCodes = cloneDeep(taxonomyCodesMock);
    component.user = cloneDeep(userMock);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges ->', () => {
    it('should call ngOnChanges method', () => {
      spyOn(component, 'checkIfUserIsProviderOfService');
      component.ngOnChanges(changes);
      expect(component.checkIfUserIsProviderOfService).toHaveBeenCalled();
    });

    it('should set validations when isPrescribingUser is false', () => {
      let changes: SimpleChanges = {
        isPrescribingUser: {
          currentValue: false,
          previousValue: null,
          firstChange: false,
          isFirstChange: () => { return false }
        }
      }
      component.ngOnChanges(changes);
      expect(component.userIdentificationFrm.get('TaxId').validator).not.toBeNull();
      expect(component.userIdentificationFrm.get('DeaNumber').validator).toBeNull();
      expect(component.userIdentificationFrm.get('NpiTypeOne').validator).not.toBeNull();
    });
  });

  describe('ngOnInit ->', () => {
    it('should call getList method', () => {
      component.createForm = jasmine.createSpy();
      component.hasEditProviderInfoAccess = jasmine.createSpy();
      component.getTaxonomyCodes = jasmine.createSpy();      
      component.ngOnInit();
      expect(component.createForm).toHaveBeenCalled();
      expect(component.hasEditProviderInfoAccess).toHaveBeenCalled();
      expect(component.getTaxonomyCodes).toHaveBeenCalled();      
    });

    it('should set isPrescribingUser to true', () => {
      component.user.RxUserType = 1;
      component.validateRxAdmin = jasmine.createSpy();
      component.setDeaNumberState = jasmine.createSpy();
      component.ngOnInit();
      expect(component.isPrescribingUser).toBe(true);
      expect(component.validateRxAdmin).toHaveBeenCalled();
      expect(component.setDeaNumberState).toHaveBeenCalled();
    });

    it('should set editmode to true', () => {
      component.user.UserId = '1';
      component.ngOnInit();
      expect(component.editMode).toBe(true);
    });

    it('should set editmode to false', () => {
      component.user.UserId = null;
      component.ngOnInit();
      expect(component.editMode).toBe(false);
    });
  });

  describe('createForm ->', () => {
    it('should call createForm method', () => {
      component.isPrescribingUser = true;
      component.createForm();
      expect(component.userIdentificationFrm).not.toBe(null);
    });
  });

  describe('hasEditProviderInfoAccess ->', () => {
    it('should call hasEditProviderInfoAccess method', () => {
      component.checkAuthorization = jasmine.createSpy().and.returnValue(true);
      component.hasEditProviderInfoAccess();
      expect(component.checkAuthorization).toHaveBeenCalledWith('soar-biz-bizusr-etprov');
      expect(component.canEditProviderInfo).toEqual(true);
    });
  });

  describe('checkAuthorization ->', () => {
    it('should call checkAuthorization method', () => {
      component.checkAuthorization('amfa');
      expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
    });
  });


  describe('getTaxonomyCodes ->', () => {
    it('should call getTaxonomyCodes method', () => {
      spyOn(component, 'filterPrimaryTaxonomyCodes').and.callFake(() => { });
      spyOn(component, 'filterSecondaryTaxonomyCodes').and.callFake(() => { });
      spyOn(component, 'setTaxonomyDropdownText').and.callFake(() => { });
      component.editMode = true;
      const promise = staticDataMock.TaxonomyCodes();
      component.getTaxonomyCodes();
      promise.then(x => {
        expect(staticDataMock.TaxonomyCodes).toHaveBeenCalled();
        expect(component.setTaxonomyDropdownText).toHaveBeenCalled();
        expect(component.filterPrimaryTaxonomyCodes).toHaveBeenCalled();
        expect(component.filterSecondaryTaxonomyCodes).toHaveBeenCalled();
      });
    });
  });

  describe('filter primary taxonomy codes -> ', () => {
    it('should remove selected secondary taxonomy code from primary list', () => {
      let secondaryTaxonomyCodeSelected = {
        'Category': 'Category1',
        'TaxonomyCodeId': 1
      };
      // list should be culled by one
      let lengthBeforeSplice = primaryTaxonomyCodes.length;
      component.primaryTaxonomyCodes = primaryTaxonomyCodes;
      component.user.SecondaryTaxonomyId = secondaryTaxonomyCodeSelected.TaxonomyCodeId;
      component.filterPrimaryTaxonomyCodes();
      expect(component.primaryTaxonomyCodes.length).toBe(lengthBeforeSplice - 1);
    });

    it('should not remove anything', () => {
      var lengthBeforeSplice = primaryTaxonomyCodes.length;
      component.primaryTaxonomyCodes = primaryTaxonomyCodes;
      component.user.SecondaryTaxonomyId = null;
      component.filterPrimaryTaxonomyCodes();
      expect(component.primaryTaxonomyCodes.length).toBe(lengthBeforeSplice);
    });
  });

  describe('filter secondary taxonomy codes -> ', () => {
    it('should remove selected primary taxonomy code from secondary list', () => {
      var primaryTaxonomyCodeSelected = {
        'Category': 'Category1',
        'TaxonomyCodeId': 1
      };

      // list should be culled by one
      var lengthBeforeSplice = secondaryTaxonomyCodes.length;
      component.secondaryTaxonomyCodes = secondaryTaxonomyCodes;
      component.user.PrimaryTaxonomyId = primaryTaxonomyCodeSelected.TaxonomyCodeId;
      component.filterSecondaryTaxonomyCodes();
      expect(component.secondaryTaxonomyCodes.length).toBe(lengthBeforeSplice - 1);
    });

    it('should not remove anything', () => {
      let lengthBeforeSplice = secondaryTaxonomyCodes.length;
      component.secondaryTaxonomyCodes = secondaryTaxonomyCodes;
      component.user.PrimaryTaxonomyId = null;
      component.filterSecondaryTaxonomyCodes();
      expect(component.secondaryTaxonomyCodes.length).toBe(lengthBeforeSplice);
    });
  });

  describe('checkDeaNumberValid -> ', () => {
    it('should return true when Dea Number is undefined or null', () => {
      let res = component.checkDeaNumberValid(null);
      expect(res).toBe(true);
    });

    it('should return false when Dea Number is not undefined or not null', () => {
      let res = component.checkDeaNumberValid('12345');
      expect(res).toBe(false);
    });
  });

  describe('isProvider ->', () => {
    it('should return true when User is a Dentist (1)', () => {
      var ofcLocation = { 'ProviderTypeId': 1 };
      var result = component.isProvider(ofcLocation);
      expect(result).toBe(true);
    });

    it('should return true when User is a Hygienist (2)', () => {
      var ofcLocation = { 'ProviderTypeId': 2 };
      var result = component.isProvider(ofcLocation);
      expect(result).toBe(true);
    });

    it('should return true when User is an Assistant (3)', () => {
      var ofcLocation = { 'ProviderTypeId': 3 };
      var result = component.isProvider(ofcLocation);
      expect(result).toBe(true);
    });

    it('should return false when User is NOT Provider of Service', () => {
      var ofcLocation = { 'ProviderTypeId': 4 };
      var result = component.isProvider(ofcLocation);
      expect(result).toBe(false);
    });

    it('should return true when User is an Other (5)', () => {
      var ofcLocation = { 'ProviderTypeId': 5 };
      var result = component.isProvider(ofcLocation);
      expect(result).toBe(true);
    });

    it('should return false when User is invalid (0)', () => {
      var ofcLocation = { 'ProviderTypeId': 0 };
      var result = component.isProvider(ofcLocation);
      expect(result).toBe(false);
    });

    it('should return false when User is an undefined type (6)', () => {
      var ofcLocation = { 'ProviderTypeId': 6 };
      var result = component.isProvider(ofcLocation);
      expect(result).toBe(false);
    });
  });

  describe('checkIfUserIsProviderOfService ->', () => {
    it('should return false when userLocationSetups is an empty array', () => {
      component.userLocationSetups = [];
      let result = component.checkIfUserIsProviderOfService();
      expect(result).toBe(false);
    });

    it('should return true when userLocationSetups has a provider in the first position', () => {
      component.userLocationSetups = [
        { 'ProviderTypeId': 1 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 }
      ];
      let result = component.checkIfUserIsProviderOfService();
      expect(result).toBe(true);
    });

    it('should return true when userLocationSetups has a provider in the a middle position', () => {
      component.userLocationSetups = [
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 1 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 }
      ];
      let result = component.checkIfUserIsProviderOfService();
      expect(result).toBe(true);
    });

    it('should return true when userLocationSetups has a provider in the last position', () => {
      component.userLocationSetups = [
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 1 }
      ];
      let result = component.checkIfUserIsProviderOfService();
      expect(result).toBe(true);
    });

    it('should return false when userLocationSetups has no providers of service in the array', () => {
      component.userLocationSetups = [
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 },
        { 'ProviderTypeId': 4 }
      ];
      let result = component.checkIfUserIsProviderOfService();
      expect(result).toBe(false);
    });
  });

  describe('setTaxonomyDropdownText ->', () => {
    it('should call method setTaxonomyDropdownText and check $$DisplayText for PrimaryTaxonomyCodes', () => {
      component.primaryTaxonomyCodes = cloneDeep(primaryTaxonomyCodes[1]);
      component.setTaxonomyDropdownText();
      for (let i = 0; i < component.primaryTaxonomyCodes.length; i++) {
        expect(component.primaryTaxonomyCodes[i].$$DisplayText).toBe('Category1 / 123');
      }
    });

    it('should call method setTaxonomyDropdownText and check $$DisplayText for SecondaryTaxonomyCodes', () => {
      component.secondaryTaxonomyCodes = secondaryTaxonomyCodes[1];
      component.setTaxonomyDropdownText();
      for (let i = 0; i < component.secondaryTaxonomyCodes.length; i++) {
        expect(component.secondaryTaxonomyCodes[i].$$DisplayText).toBe('Category1 / 123');
      }
    });
  });

  describe('setDeaNumberState ->', () => {
    beforeEach(() => {
      component.userIdentificationFrm = createForm;
    });
    it('should call method setDeaNumberState and return disableDeaNumber as false when form is null', () => {
      component.userIdentificationFrm = null;
      component.setDeaNumberState();
      expect(component.disableDeaNumber).toBe(false);
    });

    it('should call method setDeaNumberState and return disableDeaNumber as true when form is not null', () => {
      component.user.RxUserType = 3;
      component.setDeaNumberState();
      expect(component.disableDeaNumber).toBe(true);
    });
  });

  describe('validateRxAdmin function ->', () => {
    beforeEach(() => {
      component.userIdentificationFrm = createForm;
    });
    it('should set errors to Dea Number and form is invalid', () => {
      component.validateRxAdmin();
      expect(component.userIdentificationFrm.valid).toBe(false);
    });

    it('should set form to valid', () => {
      component.user.RxUserType = 3;
      component.user.DeaNumber = 'GE12345'
      component.validateRxAdmin();
      expect(component.userIdentificationFrm.invalid).toBe(true);
    });
  });

  describe('primaryTaxonomyChanged ->', () => {
    beforeEach(() => {
      createForm = new FormGroup({
        TaxId: new FormControl(""),
        FederalLicense: new FormControl(""),
        DeaNumber: new FormControl(""),
        NpiTypeOne: new FormControl(""),
        PrimaryTaxonomyId: new FormControl(1),
        SecondaryTaxonomyId: new FormControl(1),
      });
    })
    it('should call primaryTaxonomyChanged on any form value changed when primary and secondary dropdown values are different', () => {
      component.userIdentificationFrm = createForm;
      component.userIdentificationFrm.get('SecondaryTaxonomyId').setValue(1);
      component.primaryTaxonomyChanged(2);
      expect(component.TaxonomyCodesAreUnique).toEqual(true);
    });

    it('should call primaryTaxonomyChanged on any form value changed when primary and secondary dropdown values are same', () => {
      component.userIdentificationFrm = createForm;
      component.userIdentificationFrm.get('SecondaryTaxonomyId').setValue(1);
      component.primaryTaxonomyChanged(1);
      expect(component.TaxonomyCodesAreUnique).toEqual(false);
    });
  });

  describe('secondaryTaxonomyChanged ->', () => {
    beforeEach(() => {
      createForm = new FormGroup({
        TaxId: new FormControl(""),
        FederalLicense: new FormControl(""),
        DeaNumber: new FormControl(""),
        NpiTypeOne: new FormControl(""),
        PrimaryTaxonomyId: new FormControl(2),
        SecondaryTaxonomyId: new FormControl(2),
      });
    })
    it('should call secondaryTaxonomyChanged on any form value changed when primary and secondary dropdown values are different', () => {
      component.userIdentificationFrm = createForm;
      component.userIdentificationFrm.get('PrimaryTaxonomyId').setValue(1);
      component.secondaryTaxonomyChanged(2);
      expect(component.TaxonomyCodesAreUnique).toEqual(true);
    });

    it('should call secondaryTaxonomyChanged on any form value changed when primary and secondary dropdown values are same', () => {
      component.userIdentificationFrm = createForm;
      component.userIdentificationFrm.get('PrimaryTaxonomyId').setValue(2);
      component.secondaryTaxonomyChanged(2);
      expect(component.TaxonomyCodesAreUnique).toEqual(false);
    });
  });

});
