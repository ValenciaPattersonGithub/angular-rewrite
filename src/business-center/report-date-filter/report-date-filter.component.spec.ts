import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportDateFilterComponent } from './report-date-filter.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule} from '@ngx-translate/core';
import * as moment from "moment";
import { configureTestSuite } from 'src/configure-test-suite';
describe('ReportDateFilterComponent', () => {
  let component: ReportDateFilterComponent;
  let fixture: ComponentFixture<ReportDateFilterComponent>;

  const mockTostarfactory: any = {
    error: jasmine.createSpy().and.returnValue('Error Message'),
    success: jasmine.createSpy().and.returnValue('Success Message')
  };
  const mockLocalizeService = {
    getLocalizedString: jasmine
      .createSpy('mockLocalizeService.getLocalizedString')
      .and.callFake((val)=> {
        return val;
      })
  };
  const mockReportIdsForDateOptions = [];

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportDateFilterComponent ],
      imports: [FormsModule, ReactiveFormsModule, 
        TranslateModule.forRoot()  ],
        providers: [
          { provide: 'localize', useValue: mockLocalizeService },
          { provide: 'toastrFactory', useValue: mockTostarfactory },
          { provide: 'ReportIdsForDateOptions', useValue: mockReportIdsForDateOptions }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
});

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDateFilterComponent);
    component = fixture.componentInstance;
    component.EncountersByFeeScheduleReportId = 48;
    component.filterModels = {
      EndDateName: 'EndDate',
      FilterId: 'DateRange',
      Name: 'Date Range',
      ReportCategory: 0,
      ReportId: 48,
      StartDateName: 'StartDate',
      TitleDateRangeString: '',
      StartDate:new Date() 
    };
    component.customOption = {
      Field: 'DateOption',
      Value: '',
      Key: true,
      Checked: false,
      Id: 4,
      FilterValue: null,
      isVisible: true
    };
    component.radioOptions = [
      {
        Field: 'DateOption',
        Value: 'Today',
        Key: true,
        Checked: false,
        Id: 1,
        FilterValue: null,
        isVisible: true
      },
      {
        Field: 'DateOption',
        Value: 'Month to Date',
        Key: true,
        Checked: true,
        Id: 2,
        FilterValue: null,
        isVisible: true
      },
      {
        Field: 'DateOption',
        Value: 'Year to Date',
        Key: true,
        Checked: false,
        Id: 3,
        FilterValue: null,
        isVisible: true
      }
    ];
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call ngOnInit', () => {

      component.ngOnInit();
      // TODO fix this test
    });
  });

  describe('toggleRadio ->', () => {
    it('toggleRadio should be called with value 1', () => {
      var id = 1;
      
      component.currentDate = new Date();
      var today = new Date(
        component.currentDate.getFullYear(),
        component.currentDate.getMonth(),
        component.currentDate.getDate(),
        0,
        0,
        0
      );
      component.toggleRadio(id);
      expect(component.dateFilterModel.FilterDtoStartDate).toEqual(today);
      expect(component.dateFilterModel.FilterString).toEqual(
        moment(today).format("MM/DD/YYYY") +
        mockLocalizeService.getLocalizedString(' - ') +
        moment(today).format("MM/DD/YYYY")
      );
      expect(component.dateFilterModel.TitleDateRangeString).toEqual('Today');
    });

    it('toggleRadio should be called with value 2', () => {
      component.currentDate = new Date();
      component.firstDayOfMonth = new Date(
        component.currentDate.getFullYear(),
        component.currentDate.getMonth(),
        1
      );
      var id = 2;
      component.toggleRadio(id);
      expect(component.dateFilterModel.FilterDtoStartDate).toEqual(
        component.firstDayOfMonth
      );
      expect(component.dateFilterModel.FilterString).toEqual(
        moment(component.firstDayOfMonth).format("MM/DD/YYYY") +
        mockLocalizeService.getLocalizedString(' - ') +
        moment(component.currentDate).format("MM/DD/YYYY")
      );
      expect(component.dateFilterModel.TitleDateRangeString).toEqual('From' + ' '+
      moment(component.firstDayOfMonth).format("MM/DD/YYYY") +
        mockLocalizeService.getLocalizedString(' - ') + 'To' + ' '+
        moment(component.currentDate).format("MM/DD/YYYY")
      );
    });

    it('toggleRadio should be called with value 3', () => {
      component.currentDate = new Date();
      var firstDayOfYear = new Date(component.currentDate.getFullYear(), 0, 1);
      var id = 3;
      component.toggleRadio(id);
      expect(component.dateFilterModel.FilterDtoStartDate).toEqual(firstDayOfYear);
      expect(component.dateFilterModel.FilterString).toEqual(
        moment(firstDayOfYear).format("MM/DD/YYYY")  +
        mockLocalizeService.getLocalizedString(' - ') +
        moment(component.currentDate).format("MM/DD/YYYY")
      );
      expect(component.dateFilterModel.TitleDateRangeString).toEqual('From' + ' '+
      moment(firstDayOfYear).format("MM/DD/YYYY") +
        mockLocalizeService.getLocalizedString(' - ') + 'To' + ' '+
        moment(component.currentDate).format("MM/DD/YYYY")
      );
    });
    it('toggleRadio should be called with value 4 with startDate', () => {
      var id = 4;
      component.toggleRadio(id);
      expect(component.dateFilterModel.StartDate).toBe(null);
    });
    it('toggleRadio should be called with value 4 with endDate', () => {
      var id = 4;
      component.toggleRadio(id);
      expect(component.dateFilterModel.EndDate).toBe(null);
    });
    it('toggleRadio should be called with value 4', () => {
      var id = 4;
      component.toggleRadio(id);
      expect(component.customOption.Checked).toBe(true);
    });
  });

  describe('initializeDateRangeElements ->', () => {
    it('initializeDateRangeElements should be called', () => {
      component.initializeDateRangeElements('');
      expect(component.dateFilterModel.UseOptions).toBe(false);
    });
    it('initializeDateRangeElements should be called with strings', () => {
      component.initializeDateRangeElements('');
      expect(component.errorRequiredDate).toEqual(mockLocalizeService.getLocalizedString('From Date and To Date are required'));
      expect(component.textDateRange).toEqual(mockLocalizeService.getLocalizedString('Date Range'));
      expect(component.invaliDate).toEqual(mockLocalizeService.getLocalizedString('Invalid Date'));
    });
    it('initializeDateRangeElements should be called date range report option', () => {
      component.initializeDateRangeElements('');
      expect(component.dateFilterModel.UseOptions).toBe(false);
    });

    it('initializeDateRangeElements should be called with UseOptions true', () => {
      component.initializeDateRangeElements('');
      component.dateFilterModel.UseOptions = true;
      expect(component.radioOptions[0].Field).toEqual('DateOption');
    });
  });
});

