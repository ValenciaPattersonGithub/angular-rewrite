import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportRadioFilterComponent } from './report-radio-filter.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule} from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
describe('ReportRadioFilterComponent', () => {
  let component: ReportRadioFilterComponent;
  let fixture: ComponentFixture<ReportRadioFilterComponent>;
  let filterData = {
    Name: 'Locations',
    data: [
      {
        Checked: true,
        Field: 'ViewTransactionsBy',
        FilterValue: null,
        Id: 0,
        Key: true,
        Value: 'Service Date',
        isVisible: true,
        Name: 'Locations',
        LocationStatus:'Active'
      },
      {
        Checked: false,
        Field: 'ViewTransactionsBy',
        FilterValue: null,
        Id: 1,
        Key: true,
        Value: 'Posted Date',
        isVisible: true,
        Name: 'Locations1',
        LocationStatus:'Inactive'
      },
      {
        Checked: false,
        Field: 'ViewTransactionsBy',
        FilterValue: null,
        Id: 2,
        Key: true,
        Value: 'Posted1 Date',
        isVisible: true,
        Name: 'Locations2',
        LocationStatus: 'Pending Inactive'
      },
      {
        Checked: false,
        Field: 'ViewTransactionsBy',
        FilterValue: null,
        Id: 3,
        Key: true,
        Value: 'Posted2 Date',
        isVisible: true,
        Name: 'Locations3'
      },
      {
        Checked: false,
        Field: 'ViewTransactionsBy',
        FilterValue: null,
        Id: 4,
        Key: true,
        Value: 'Posted3 Date',
        isVisible: true,
        Name: 'Locations4'
      },
      {
        Checked: false,
        Field: 'ViewTransactionsBy',
        FilterValue: null,
        Id: 5,
        Key: true,
        Value: 'Posted4 Date',
        isVisible: false,
        Name: 'Locations5'
      },
      {
        Checked: false,
        Field: 'ViewTransactionsBy',
        FilterValue: null,
        Id: 6,
        Key: true,
        Value: 'Posted5 Date',
        isVisible: false,
        Name: 'Locations6'
      }
    ]
  };
  const mockTostarfactory: any = {
    error: jasmine.createSpy().and.returnValue('Error Message'),
    success: jasmine.createSpy().and.returnValue('Success Message')
  };
  const mockLocalizeService = {
    getLocalizedString: jasmine
      .createSpy('localize.getLocalizedString')
      .and.callFake((val) => {
        return val;
      })
  };
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportRadioFilterComponent ],
      imports: [FormsModule, ReactiveFormsModule,
        TranslateModule.forRoot()  ],
        providers: [
          { provide: 'localize', useValue: mockLocalizeService },
          { provide: 'toastrFactory', useValue: mockTostarfactory }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
});

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRadioFilterComponent);
    component = fixture.componentInstance;
    component.filterModels = {
      Name: 'Locations',
      data: [
        {
          Checked: true,
          Field: 'ViewTransactionsBy',
          FilterValue: null,
          Id: 0,
          Key: true,
          Value: 'Service Date',
          isVisible: true,
          Name: 'Locations'
        },
        {
          Checked: false,
          Field: 'ViewTransactionsBy',
          FilterValue: null,
          Id: 1,
          Key: true,
          Value: 'Posted Date',
          isVisible: true,
          Name: 'Locations'
        }
      ]
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
    });
    it('should call ngOnInit', () => {
        component.ngOnInit();
    });
  });

  describe('toggleRadio ->', () => {
    it('toggleRadio should be called', () => {
      const filterValue = 'Posted Date';
      component.toggleRadio(filterValue);
      expect(component.reportRadioFilterModel.data[1].Checked).toBe(true);
      expect(component.reportRadioFilterModel.data[0].Checked).toBe(false);
      expect(component.reportRadioFilterModel.FilterDto).toEqual(1);
      expect(component.reportRadioFilterModel.FilterString).toEqual('Posted Date');
    });
  });

  describe('showMoreButton ->', () => {
    it('showMoreButton should be called', () => {
      component.showMoreButtonText = 'Show Less';
      component.showMoreButton();
      expect(component.reportRadioFilterModel.data[1].isVisible).toBe(true);
      expect(component.reportRadioFilterModel.data[0].isVisible).toBe(true);
      expect(component.showMoreButtonText).toEqual('Show More');
    });
  });

  describe('showMoreButton ->', () => {
    it('showMoreButton should be called', () => {
      component.showMoreButton();
      expect(component.reportRadioFilterModel.data[1].isVisible).toBe(true);
      expect(component.reportRadioFilterModel.data[0].isVisible).toBe(true);
      expect(component.showMoreButtonText).toEqual('Show Less');
    });
  });

  describe('getSelectedItemIds ->', () => {
    it('getSelectedItemIds should be called with id', () => {
      const result = component.getSelectedItemIds();
      expect(result).toEqual(component.reportRadioFilterModel.data[0].Id);
    });
  });

  describe('onChangeText ->', () => {
    it('onChangeText should be called with id', () => {
      component.onChangeText();
      expect(component.reportRadioFilterModel.FilterDto).toEqual(component.reportRadioFilterModel.data[0].Id);
    });
  });

  describe('buildFilterString ->', () => {
    beforeEach(() => {

    });
    it('buildFilterString should be called for true', () => {
      component.buildFilterString();
      expect(component.reportRadioFilterModel.data[0].Value).toEqual('Service Date');
    });
    it('buildFilterString should be called for true', () => {
      component.reportRadioFilterModel.data[0].Checked = false;
      const result = component.buildFilterString();
      expect(result).toEqual(mockLocalizeService.getLocalizedString('No filters applied'));
    });
    it('buildFilterString should be called for true', () => {
      component.reportRadioFilterModel.data[0].Value = 'Location';
      const result = component.buildFilterString();
      expect(result).toEqual('Location');
    });
  });

  describe('setArrayVisibility ->', () => {
    beforeEach(() => {
      component.reportRadioFilterModel = filterData;
    });
    it('setArrayVisibility should be called with true', () => {
      component.setArrayVisibility(true);
      expect(component.reportRadioFilterModel.data[5].isVisible).toBe(true);
    });
    it('setArrayVisibility should be called with false', () => {
      component.reportRadioFilterModel.data[5].isVisible = true;
      component.setArrayVisibility(false);
      expect(component.reportRadioFilterModel.data[5].isVisible).toBe(false);
    });
  });

  describe('showMoreCheck ->', () => {
    beforeEach(() => {
      component.reportRadioFilterModel = filterData;
    });
    it('showMoreCheck should be called with false', () => {
      component.showMoreButtonText = mockLocalizeService.getLocalizedString('Show More');
      const isVisible = component.showMoreButtonText === mockLocalizeService.getLocalizedString('Show More') ? false : true;
      component.setArrayVisibility(isVisible);
      expect(component.reportRadioFilterModel.data[5].isVisible).toBe(false);
    });
    it('showMoreCheck should be called with true', () => {
      component.showMoreButtonText = mockLocalizeService.getLocalizedString('Show Less');
      component.reportRadioFilterModel.data[5].isVisible = false;
      const isVisible = component.showMoreButtonText === mockLocalizeService.getLocalizedString('Show More') ? false : true;
      component.setArrayVisibility(isVisible);
      expect(component.reportRadioFilterModel.data[5].isVisible).toBe(true);
    });
  });

  describe('resetMethod ->', () => {
    beforeEach(() => {
      component.reportRadioFilterModel = filterData;
    });
    it('resetMethod should be called with showMoreCheck method', () => {
      component.showMoreButtonText = mockLocalizeService.getLocalizedString('Show More');
      component.showMoreCheck();
    });
    it('resetMethod should be called with showMoreButton method', () => {
      component.showMoreButtonText = mockLocalizeService.getLocalizedString('Show Less');
      component.showMoreButton();
      component.showMoreCheck();
    });

  });

  describe('hasLocations ->', () => {
    beforeEach(() => {
      component.reportRadioFilterModel = filterData;
    });

    it('hasLocations should be called with Active true', () => {
      const model = filterData.data;
      const result = component.hasLocations(model, 'Active');
      expect(result).toEqual(true);
    });

    it('hasLocations should be called with Pending Inactive true', () => {
      const model = filterData.data;
      const result = component.hasLocations(model, 'Pending Inactive');
      expect(result).toEqual(true);
    });

    it('hasLocations should be called with Inactive true', () => {
      const model = filterData.data;
      const result = component.hasLocations(model, 'Inactive');
      expect(result).toEqual(true);
    });

    it('hasLocations should be called with Inactive false', () => {
      const model = {data: [
        {
          Checked: true,
          Field: 'ViewTransactionsBy',
          FilterValue: null,
          Id: 0,
          Key: true,
          Value: 'Service Date',
          isVisible: true,
          Name: 'Locations',
          LocationStatus: 'Active'
        }
      ]};
      const result = component.hasLocations(model, 'Inactive');
      expect(result).toEqual(false);
    });

    it('hasLocations should be called with Active false', () => {
      const model = {data: [
        {
          Checked: true,
          Field: 'ViewTransactionsBy',
          FilterValue: null,
          Id: 0,
          Key: true,
          Value: 'Service Date',
          isVisible: true,
          Name: 'Locations',
          LocationStatus: 'Inactive'
        }
      ]};
      const result = component.hasLocations(model, 'Active');
      expect(result).toEqual(false);
    });

    it('hasLocations should be called with Pending Inactive false', () => {
      const model = {data: [
        {
          Checked: true,
          Field: 'ViewTransactionsBy',
          FilterValue: null,
          Id: 0,
          Key: true,
          Value: 'Service Date',
          isVisible: true,
          Name: 'Locations',
          LocationStatus: 'Inactive'
        }
      ]};
      const result = component.hasLocations(model, 'Pending Inactive');
      expect(result).toEqual(false);
    });
  });
});
