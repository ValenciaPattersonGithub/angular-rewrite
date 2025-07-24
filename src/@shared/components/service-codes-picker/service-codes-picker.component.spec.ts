import { ComponentFixture, TestBed } from '@angular/core/testing';
import { configureTestSuite } from 'src/configure-test-suite';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { OrderByPipe, Search1Pipe, BoldTextIfContainsPipe } from 'src/@shared/pipes';

import { ServiceCodesPickerComponent } from './service-codes-picker.component';
import { ColumnSortComponent } from '../column-sort/column-sort.component';
import { TruncateTextPipe } from 'src/@shared/pipes/truncate/truncate-text.pipe';

describe('ServiceCodesPickerComponent', () => {
  let component: ServiceCodesPickerComponent;
  let fixture: ComponentFixture<ServiceCodesPickerComponent>;

  //region Mock
  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text'
  };

  const mockReferenceDataService = {
    get: jasmine.createSpy().and.returnValue([]),
    entityNames: {
      serviceCodes: 'test'
    }
  };

  const mockServiceCodes = [{
    $$FeeString: "0.00",
    AffectedAreaId: 1,
    AffectedAreaName: null,
    AmaDiagnosisCode: null,
    CPT: null,
    CdtCodeId: null,
    CdtCodeName: "",
    Code: "!@#$++--",
    CompleteDescription: null,
    DataTag: "AAAAAARYSnI=",
    DateModified: "2019-09-03T06:28:30.1559591",
    Description: "e5679i",
    DisplayAs: "!@#$++--",
    DrawTypeDescription: null,
    DrawTypeId: null,
    IconName: "",
    InactivationDate: null,
    InactivationRemoveReferences: false,
    IsActive: true,
    IsEligibleForDiscount: true,
    IsSwiftPickCode: false,
    LastUsedDate: null,
    LocationSpecificInfo: null,
    Modifications: [],
    Modifier: null,
    Notes: "",
    PracticeId: 322,
    ServiceCodeId: "b1a205e9-8fbf-473d-b3df-da3054be2be3",
    ServiceTypeDescription: "01 test add2dd test",
    ServiceTypeId: "80d0b14b-cfc3-47b9-a203-003144b9cc06",
    SetsToothAsMissing: false,
    SmartCode1Id: null,
    SmartCode2Id: null,
    SmartCode3Id: null,
    SmartCode4Id: null,
    SmartCode5Id: null,
    SubmitOnInsurance: true,
    SwiftPickServiceCodes: null,
    TimesUsed: 0,
    UseCodeForRangeOfTeeth: false,
    UseSmartCodes: false,
    UserModified: "215de079-e9d0-4e07-912b-f7eabc6b038e",
    UsuallyPerformedByProviderTypeId: 1,
    UsuallyPerformedByProviderTypeName: null,
  }];

  //End region

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      // TranslateModule import required for components that use ngx-translate in the view or componenet code
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [{ provide: 'localize', useValue: mockLocalizeService },
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        Search1Pipe,TruncateTextPipe
      ],
      declarations: [ServiceCodesPickerComponent, Search1Pipe,TruncateTextPipe, ColumnSortComponent, OrderByPipe, BoldTextIfContainsPipe]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCodesPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit -> ', () => {
    it('should call initialize method', () => {
      spyOn(component, 'initialize');
      component.ngOnInit();
      expect(component.initialize).toHaveBeenCalled();
    });
  });

  describe('onSelectedCodes -> ', () => {
    it('should call onSelectedCodes when Add Service button is clicked', () => {
      component.filteredServiceCodes = mockServiceCodes;
      fixture.detectChanges();

      const buttonElement = fixture.debugElement.query(By.css('#lblAddServiceCodes'));

      buttonElement.triggerEventHandler('click', null);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.onSelect.emit).toHaveBeenCalled();
      });
    });
  });

  describe('quickAdd -> ', () => {
    it('should call quickAddService method when + quick add button is clicked', () => {
      component.filteredServiceCodes = mockServiceCodes;
      fixture.detectChanges();

      const buttonElement = fixture.debugElement.query(By.css('#quickAdd0'));

      buttonElement.triggerEventHandler('click', null);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.quickAddService).toHaveBeenCalled();
      });
    });
  });

  describe('selectedService -> ', () => {
    it('should call selectedService method when service code checkbox is checked/unchecked', () => {
      component.filteredServiceCodes = mockServiceCodes;
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('#chkServiceCode0'));

      inputElement.triggerEventHandler('change', event);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.quickAddService).toHaveBeenCalledWith(event, mockServiceCodes[0]);
      });
    });
  });

  describe('onsearchServiceCodesKeywordChange -> ', () => {
    it('should call onsearchServiceCodesKeywordChange method when search box value changes', () => {
      component.filteredServiceCodes = mockServiceCodes;
      component.searchServiceCodesKeyword = 'test';
      fixture.detectChanges();

      const inputElement = fixture.debugElement.query(By.css('#searchBoxServiceCodes'));

      inputElement.triggerEventHandler('change', null);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.onsearchServiceCodesKeywordChange).toHaveBeenCalledWith();
      });
    });
  });

});
