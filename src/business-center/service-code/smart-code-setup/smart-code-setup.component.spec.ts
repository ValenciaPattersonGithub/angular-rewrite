import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  DialogContainerDirective,
  DialogContainerService,
  DialogRef,
  DialogService,
} from '@progress/kendo-angular-dialog';
import { SmartCodeSetupComponent } from './smart-code-setup.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { configureTestSuite } from 'src/configure-test-suite';
import cloneDeep from 'lodash/cloneDeep';

let refDataService: any;
let dialogservice: DialogService;
let dialogRef: DialogRef;
let dialogContainerService: DialogContainerService;
let mockReferenceService: any = {
  get: () => new Promise((resolve, reject) => {}),
  entityNames: {},
};
let serviceCode = [
  {
    $$FeeString: '$50',
    $$locationFee: 50,
    $$locationTaxableServiceId: 3,
    $$serviceTransactionFee: 50,
    $$useCodeForAllSurfaces: true,
    Surface: '',
    Tooth: '',
    CreationDate: '',
    ServiceCodeId: '52331da3-45c1-4d58-be35-197f96d23918',
    CdtCodeId: '08e058d1-e313-4a56-8a46-b877dc9feebb',
    CdtCodeName: 'D9211',
    Code: 'scTest1',
    Description: 'scTest1 deswc',
    ServiceTypeId: 'cc08eb08-425d-43af-9d9d-ce976a208489',
    ServiceTypeDescription: 'Diagnostic',
    DisplayAs: 'scTest1',
    Fee: 57,
    TaxableServiceTypeId: 3,
    AffectedAreaId: 4,
    UsuallyPerformedByProviderTypeId: 2,
    UseSmartCodes: false,
    SmartCode1Id: null,
    SmartCode2Id: null,
    SmartCode3Id: null,
    SmartCode4Id: null,
    SmartCode5Id: null,
    UseCodeForRangeOfTeeth: false,
    IsActive: true,
    IsEligibleForDiscount: true,
    Notes: 'text',
    SubmitOnInsurance: true,
    IsSwiftPickCode: false,
    SwiftPickServiceCodes: null,
  },
  {
    $$FeeString: '$50',
    $$locationFee: 50,
    $$locationTaxableServiceId: 3,
    $$serviceTransactionFee: 50,
    $$useCodeForAllSurfaces: true,
    Surface: '',
    Tooth: '',
    CreationDate: '',
    ServiceCodeId: '52331da3-45c1-4d58-be35-197f96d23918',
    CdtCodeId: '08e058d1-e313-4a56-8a46-b877dc9feebb',
    CdtCodeName: 'D9213',
    Code: 'Test2',
    Description: 'scTest1 deswc',
    ServiceTypeId: 'cc08eb08-425d-43af-9d9d-ce976a208489',
    ServiceTypeDescription: 'Diagnostic',
    DisplayAs: 'scTest1',
    Fee: 57,
    TaxableServiceTypeId: 3,
    AffectedAreaId: 4,
    UsuallyPerformedByProviderTypeId: 2,
    UseSmartCodes: false,
    SmartCode1Id: null,
    SmartCode2Id: null,
    SmartCode3Id: null,
    SmartCode4Id: null,
    SmartCode5Id: null,
    UseCodeForRangeOfTeeth: false,
    IsActive: true,
    IsEligibleForDiscount: true,
    Notes: 'text',
    SubmitOnInsurance: true,
    IsSwiftPickCode: false,
    SwiftPickServiceCodes: null,
  },
];
const mockDialogRef = {
  close: () => of({}),
  open: (dialogResult: any) => {},
  content: {
    instance: {
      title: '',
    },
  },
  result: of({}),
};
const mockLocalizeService: any = {
  getLocalizedString: () => 'translated text',
};
const mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error'),
};
describe('SmartCodeSetupComponent', () => {
  let component: SmartCodeSetupComponent;
  let fixture: ComponentFixture<SmartCodeSetupComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        DialogService,
        DialogContainerService,
        { provide: 'referenceDataService', useValue: mockReferenceService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: DialogRef, useValue: mockDialogRef },
      ],
      declarations: [SmartCodeSetupComponent],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartCodeSetupComponent);
    component = fixture.componentInstance;

    refDataService = TestBed.get('referenceDataService');
    dialogservice = TestBed.get(DialogService);
    dialogRef = TestBed.get(DialogRef);
    spyOn(dialogservice, 'open').and.returnValue({
      content: { instance: {} },
      result: of({}),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call the method Affected area', () => {
      component.setCodesByAffectedArea = jasmine.createSpy();
      component.ngOnInit();
      expect(component.setCodesByAffectedArea).toHaveBeenCalled();
    });

    it('should call the validate method ', () => {
      component.validateOptions = jasmine.createSpy();
      component.ngOnInit();
      expect(component.validateOptions).toHaveBeenCalled();
    });

    it('should call the filterServices method ', () => {
      component.filterServices = jasmine.createSpy();
      component.ngOnInit();
      expect(component.filterServices).toHaveBeenCalled();
    });

    it('should call the search data method ', () => {
      component.setSearchData = jasmine.createSpy();
      component.ngOnInit();
      expect(component.setSearchData).toHaveBeenCalled();
    });
  });

  describe('toggle -> function', () => {
    beforeEach(function () {
      component.serviceCode = this.serviceCode;
      spyOn(component, 'validateOptions');
    });

    it('should call the validateOptions function', () => {
      component.serviceCode = serviceCode;
      component.serviceCode.AffectedAreaId = 5;
      component.serviceCode.UseCodeForRangeOfTeeth = false;
      component.toggle();
      expect(component.validateOptions).toHaveBeenCalled();
    });
  });
  describe('component.setSearchData -> function', () => {
    beforeEach(() => {
      component.serviceCode = serviceCode;
      component.codesByArea = {
        count: 3,
        label: 'Channel',
      };
      component.searchData = {
        searchTerms: [{ term: '05213' }],
      };
    });
    it('should set the search term to null if there is no matching service code selected', () => {
      var smartCode = 'SmartCode' + 'Id';
      component.setSearchData();
      expect(component.searchData.searchTerms[0].term).toBe(null);
    });
  });
  describe('component.setCodesByAffectedArea -> function', () => {
    beforeEach(() => {
      component.serviceCode = serviceCode;
      component.codesByArea = {
        count: 0,
        label: '',
      };
    });
    it('should set the correct number of view items for affected area of root', () => {
      component.serviceCode.AffectedAreaId = 3;
      component.setCodesByAffectedArea();
      expect(component.codesByArea.count).toBe(3);
      expect(component.codesByArea.label).toBe(
        mockLocalizeService.getLocalizedString('Channel(s)')
      );
    });

    it('should set the correct number of view items for affected area of surface', () => {
      component.serviceCode.AffectedAreaId = 4;
      component.setCodesByAffectedArea();
      expect(component.codesByArea.count).toBe(5);
      expect(component.codesByArea.label).toBe(
        mockLocalizeService.getLocalizedString('Surface(s)')
      );
    });

    it('should set the correct number of view items for affected area of range of teeth', () => {
      component.serviceCode.AffectedAreaId = 5;
      component.setCodesByAffectedArea();
      expect(component.codesByArea.count).toBe(2);
      expect(component.codesByArea.RoT.length).toBe(2);
    });
  });
  describe('toggle -> function', () => {
    beforeEach(() => {
      spyOn(component, 'validateOptions');
    });

    it('should call the filterServices function', () => {
      const spy = (component.filterServices = jasmine.createSpy());
      component.filterServices();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('component.validateSmartCodeSelection -> function', () => {
    beforeEach(() => {
      component.searchData = {
        searchTerms: [{ term: '05213' }],
      };
      component.serviceCode = {
        ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
        Code: 'D5213',
        Description:
          'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
        DisplayAs: 'PartialMax-Metal',
        AffectedAreaId: 5,
        UseCodeForRangeOfTeeth: true,
        UseSmartCodes: true,
      };

      component.allServiceCodes = [
        {
          ServiceCodeId: '98B0EEAC-C9FC-4671-B065-7EB4FEB20597',
          Code: 'D1110',
          Description: 'prophylaxis, adult',
          DisplayAs: 'AdultPro',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '4A8A6CAB-A18B-41AF-A7F2-0BA0C5E3FDBE',
          Code: 'D1320',
          Description:
            'tobacco counseling for the control and prevention of oral disease',
          DisplayAs: 'D1320',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '574EFC00-484F-4372-90C7-0714D6CB2D72',
          Code: 'D1550',
          Description: 're-cement or re-bond space maintainer',
          DisplayAs: 'D1550',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '62AE023F-804F-473E-B015-272235329FC6',
          Code: 'D2140',
          Description: 'amalgam - one surface, primary or permanent',
          DisplayAs: 'Amal1S',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '940A0368-8E5B-4AF8-9430-C7710CF51B3A',
          Code: 'D2150',
          Description: 'amalgam - two surfaces, primary or permanent',
          DisplayAs: 'Amal2S',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
          Code: 'D5213',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMax-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: true,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827E',
          Code: 'D5214',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMan-Metal',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '98B0EEAC-C9FC-4671-B065-7EB4FEB20591',
          Code: '01110',
          Description: 'prophylaxis, adult',
          DisplayAs: 'AdultPro',
          AffectedAreaId: 2,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '1C6CB2ED-98DB-4322-B072-0213891CA89F',
          Code: '02921',
          Description: 'reattachment of tooth fragment, incisal edge or cusp',
          DisplayAs: 'D2921',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '1C6CB2ED-98DB-4322-B072-0213891CA89G',
          Code: 'D2921',
          Description: 'reattachment of tooth fragment, incisal edge or cusp',
          DisplayAs: 'D2921',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827f',
          Code: '05214',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMan-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827D',
          Code: '05213',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMax-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: false,
        },
      ];
    });

    it('should set $$invalidCode to true if no serviceCode matches entry', () => {
      component.serviceCode.Code = 'D5213';
      component.serviceCode.AffectedAreaId = 5;
      component.serviceCode.UseCodeForRangeOfTeeth = true;

      component.searchData.searchTerms = [{ term: '05215' }];
      component.validateSmartCodeSelection(component.searchData.searchTerms);
      expect(component.hasErrors).toBe(true);
      expect(component.searchData.searchTerms[0].invalidCode).toEqual(true);
      expect(component.searchData.searchTerms[0].validationMessage).toEqual(
        mockLocalizeService.getLocalizedString(
          'Smart codes for this service code must have the same affected area as this service code.'
        )
      );
    });

    it(
      'should set $$invalidCode to true if component.serviceCode.AffectedAreaId = 5 and component.serviceCode.UseCodeForRangeOfTeeth is false ' +
        'and match.AffectedAreaId is not 5',
      () => {
        component.serviceCode.Code = 'D5213';
        component.serviceCode.AffectedAreaId = 5;
        component.serviceCode.UseCodeForRangeOfTeeth = false;
        component.searchData.searchTerms = [{ term: 'D5214' }];
        component.validateSmartCodeSelection(component.searchData.searchTerms);
        expect(component.hasErrors).toBe(true);
        expect(component.searchData.searchTerms[0].invalidCode).toEqual(true);
        expect(component.searchData.searchTerms[0].validationMessage).toEqual(
          mockLocalizeService.getLocalizedString(
            'Smart codes for this service code must have the same affected area as this service code.'
          )
        );
      }
    );

    it('should set $$invalidCode to true if matching service has a different AffectedAreaId than serviceCode.AffectedAreaId ', () => {
      component.serviceCode = serviceCode;
      component.serviceCode.Code = 'D2921';
      component.serviceCode.AffectedAreaId = 4;
      component.searchData.searchTerms = [{ term: '02921' }];
      component.validateSmartCodeSelection(component.searchData.searchTerms);
      expect(component.hasErrors).toBe(true);
      expect(component.searchData.searchTerms[0].invalidCode).toEqual(true);
      expect(component.searchData.searchTerms[0].validationMessage).toEqual(
        mockLocalizeService.getLocalizedString(
          'Smart codes for this service code must all be allowed to be used with a range of teeth.'
        )
      );
    });

    it(
      'should set $$invalidCode to false if matching service has same AffectedAreaId as serviceCode.AffectedAreaId ' +
        ' and serviceCode.UseCodeForRangeOfTeeth is false ',
      () => {
        component.serviceCode.Code = 'D2921';
        component.serviceCode.AffectedAreaId = 5;
        component.serviceCode.UseCodeForRangeOfTeeth = false;

        component.searchData.searchTerms = [{ term: '02921' }];
        component.validateSmartCodeSelection(component.searchData.searchTerms);
        expect(component.hasErrors).toBe(false);
        expect(component.searchData.searchTerms[0].invalidCode).toEqual(false);
        expect(component.searchData.searchTerms[0].validationMessage).toEqual(
          ''
        );
      }
    );

    it('should set $$invalidCode to false if term is empty or null', () => {
      component.serviceCode.Code = 'D2921';
      component.serviceCode.AffectedAreaId = 5;
      component.serviceCode.UseCodeForRangeOfTeeth = false;

      component.searchData.searchTerms = [{ term: null }];
      component.validateSmartCodeSelection(component.searchData.searchTerms);
      expect(component.hasErrors).toBe(false);
      expect(component.searchData.searchTerms[0].invalidCode).toEqual(false);
      expect(component.searchData.searchTerms[0].validationMessage).toEqual('');

      component.serviceCode.Code = 'D2921';
      component.serviceCode.AffectedAreaId = 5;
      component.serviceCode.UseCodeForRangeOfTeeth = false;

      component.searchData.searchTerms = [{ term: '' }];
      component.validateSmartCodeSelection(component.searchData.searchTerms);
      expect(component.hasErrors).toBe(false);
      expect(component.searchData.searchTerms[0].invalidCode).toEqual(false);
      expect(component.searchData.searchTerms[0].validationMessage).toEqual('');
    });

    it('should set component.hasErrors to true if one of many is invalid', () => {
      component.serviceCode.Code = '05213';
      component.serviceCode.AffectedAreaId = 5;
      component.serviceCode.UseCodeForRangeOfTeeth = true;

      component.searchData.searchTerms = [{ term: '05213' }, { term: '05215' }];
      component.validateSmartCodeSelection(component.searchData.searchTerms);
      expect(component.hasErrors).toBe(true);
      expect(component.searchData.searchTerms[0].invalidCode).toEqual(false);
      expect(component.searchData.searchTerms[0].validationMessage).toEqual('');

      expect(component.searchData.searchTerms[1].invalidCode).toEqual(true);
      expect(component.searchData.searchTerms[1].validationMessage).toEqual(
        mockLocalizeService.getLocalizedString(
          'Smart codes for this service code must all be allowed to be used with a range of teeth.'
        )
      );
    });
  });

  describe('openPreviewDialog ->', () => {
    it('should open a dialog', () => {
      dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
      fixture.detectChanges();
      component.openPreviewDialog();
      expect(dialogservice.open).toHaveBeenCalled();
    });
  });

  describe('cancel -> ', () => {
    it('should close the dialog', () => {
      component.dialog = TestBed.get(DialogRef);
      component.close();
      component.cancel();
    });
  });

  describe('validateOptions ->', () => {
    beforeEach(() => {
      component.serviceCode = {
        ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
        Code: 'D5213',
        Description:
          'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
        DisplayAs: 'PartialMax-Metal',
        AffectedAreaId: 5,
        UseCodeForRangeOfTeeth: true,
        UseSmartCodes: true,
      };
      component.serviceCode = serviceCode;
    });

    it('should return true component serviceCode.UseSmartCodes = component.radioButtonModel  if component.serviceCode?.UseSmartCodes == true or this.serviceCode?.UseSmartCodes == "true"', () => {
      component.serviceCode.UseSmartCodes = component.radioButtonModel;
      component.serviceCode.UseSmartCodes = 'true';
      component.validateOptions();
    });

    it('should set the value serviceCode.UseSmartCodes = false  if component.serviceCode?.UseCodeForRangeOfTeeth == true or !component.serviceCode?.UseCodeForRangeOfTeeth', () => {
      component.serviceCode.UseCodeForRangeOfTeeth = component.radioButtonModel;
      component.serviceCode.AffectedAreaId = 5;
      component.serviceCode.UseCodeForRangeOfTeeth = 'false';
      component.serviceCode.UseSmartCodes = 'true';
      component.validateOptions();
    });

    it('should return true', () => {
      component.serviceCode.UseCodeForRangeOfTeeth = 'true';
      component.validateOptions();
    });
  });

  describe('filterServices ->', () => {
    beforeEach(() => {
      component.serviceCode = {
        ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
        Code: 'D5213',
        Description:
          'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
        DisplayAs: 'PartialMax-Metal',
        AffectedAreaId: 5,
        UseCodeForRangeOfTeeth: true,
        UseSmartCodes: true,
      };

      component.allServiceCodes = [
        {
          ServiceCodeId: '98B0EEAC-C9FC-4671-B065-7EB4FEB20597',
          Code: 'D1110',
          Description: 'prophylaxis, adult',
          DisplayAs: 'AdultPro',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '4A8A6CAB-A18B-41AF-A7F2-0BA0C5E3FDBE',
          Code: 'D1320',
          Description:
            'tobacco counseling for the control and prevention of oral disease',
          DisplayAs: 'D1320',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '574EFC00-484F-4372-90C7-0714D6CB2D72',
          Code: 'D1550',
          Description: 're-cement or re-bond space maintainer',
          DisplayAs: 'D1550',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '62AE023F-804F-473E-B015-272235329FC6',
          Code: 'D2140',
          Description: 'amalgam - one surface, primary or permanent',
          DisplayAs: 'Amal1S',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '940A0368-8E5B-4AF8-9430-C7710CF51B3A',
          Code: 'D2150',
          Description: 'amalgam - two surfaces, primary or permanent',
          DisplayAs: 'Amal2S',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
          Code: 'D5213',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMax-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: true,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827E',
          Code: 'D5214',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMan-Metal',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '98B0EEAC-C9FC-4671-B065-7EB4FEB20591',
          Code: '01110',
          Description: 'prophylaxis, adult',
          DisplayAs: 'AdultPro',
          AffectedAreaId: 2,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '1C6CB2ED-98DB-4322-B072-0213891CA89F',
          Code: '02921',
          Description: 'reattachment of tooth fragment, incisal edge or cusp',
          DisplayAs: 'D2921',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '1C6CB2ED-98DB-4322-B072-0213891CA89G',
          Code: 'D2921',
          Description: 'reattachment of tooth fragment, incisal edge or cusp',
          DisplayAs: 'D2921',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827f',
          Code: '05214',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMan-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827D',
          Code: '05213',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMax-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: false,
        },
      ];
    });

    it('should Filter the cached list of services based on the current service codes affect area', () => {
      component.serviceCode.AffectedAreaId = 5;
      component.filterServices();
      component.allServiceCodes.forEach(element => {
        element.code = component.serviceCode.Code;
        component.filteredServices.push(component.serviceCode.code);
      });
    });
    it('should Filter the cached list of services based on the current service codes affect area', () => {
      component.serviceCode.AffectedAreaId = 4;
      component.filterServices();
      component.allServiceCodes.forEach(element => {
        element.code = component.serviceCode.Code;
        component.filteredServices.push(component.serviceCode.code);
      });
    });
  });

  describe('close', () => {
    beforeEach(() => {
      component.searchData = {
        searchTerms: [{ term: '05213' }],
      };
      component.serviceCode = {
        ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
        Code: 'D5213',
        Description:
          'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
        DisplayAs: 'PartialMax-Metal',
        AffectedAreaId: 5,
        UseCodeForRangeOfTeeth: true,
        UseSmartCodes: true,
      };

      component.allServiceCodes = [
        {
          ServiceCodeId: '98B0EEAC-C9FC-4671-B065-7EB4FEB20597',
          Code: 'D1110',
          Description: 'prophylaxis, adult',
          DisplayAs: 'AdultPro',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '4A8A6CAB-A18B-41AF-A7F2-0BA0C5E3FDBE',
          Code: 'D1320',
          Description:
            'tobacco counseling for the control and prevention of oral disease',
          DisplayAs: 'D1320',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '574EFC00-484F-4372-90C7-0714D6CB2D72',
          Code: 'D1550',
          Description: 're-cement or re-bond space maintainer',
          DisplayAs: 'D1550',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '62AE023F-804F-473E-B015-272235329FC6',
          Code: 'D2140',
          Description: 'amalgam - one surface, primary or permanent',
          DisplayAs: 'Amal1S',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '940A0368-8E5B-4AF8-9430-C7710CF51B3A',
          Code: 'D2150',
          Description: 'amalgam - two surfaces, primary or permanent',
          DisplayAs: 'Amal2S',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
          Code: 'D5213',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMax-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: true,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827E',
          Code: 'D5214',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMan-Metal',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '98B0EEAC-C9FC-4671-B065-7EB4FEB20591',
          Code: '01110',
          Description: 'prophylaxis, adult',
          DisplayAs: 'AdultPro',
          AffectedAreaId: 2,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '1C6CB2ED-98DB-4322-B072-0213891CA89F',
          Code: '02921',
          Description: 'reattachment of tooth fragment, incisal edge or cusp',
          DisplayAs: 'D2921',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '1C6CB2ED-98DB-4322-B072-0213891CA89G',
          Code: 'D2921',
          Description: 'reattachment of tooth fragment, incisal edge or cusp',
          DisplayAs: 'D2921',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827f',
          Code: '05214',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMan-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827D',
          Code: '05213',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMax-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: false,
        },
      ];
    });

    it('close the modal popup', () => {
      component.dialog = TestBed.get(DialogRef);
      component.close();
    });
  });

  describe('selectResult', () => {
    beforeEach(() => {
      component.searchData = {
        searchTerms: [{ term: '05213' }],
      };
      component.serviceCode = {
        ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
        Code: 'D5213',
        Description:
          'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
        DisplayAs: 'PartialMax-Metal',
        AffectedAreaId: 5,
        UseCodeForRangeOfTeeth: true,
        UseSmartCodes: true,
      };
    });
    it('Capture the result from the search, and update values', () => {
      component.selectResult('test', 0);
    });

    it(' Clear the currently entered value and remove the value from this service codes smart code index', () => {
      component.selectResult('', 0);
    });
  });

  describe('filterServiceCodes', () => {
    it('should filter record based on search tearm', () => {
      component.filteredServices = cloneDeep(serviceCode);
      component.filteredServicesInitial = cloneDeep(serviceCode);
      component.filterServiceCodes('test2');
      expect(component.filteredServices.length).toEqual(1);
    });
  });
});
