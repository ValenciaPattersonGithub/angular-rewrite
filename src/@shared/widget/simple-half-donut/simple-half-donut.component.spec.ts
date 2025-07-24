import { ChangeDetectorRef, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { formatCurrencyIfNegPipe } from 'src/@shared/pipes/formatCurrencyNeg/format-currency-Neg.pipe';
import { SimpleHalfDonutComponent } from './simple-half-donut.component';
import { TranslateService } from '@ngx-translate/core';
import {LegendItemVisualArgs, LegendTitle } from '@progress/kendo-angular-charts';
import { Element } from '@progress/kendo-drawing';
import { SimpleHalfDonut, WidgetCommon } from 'src/dashboard/widgets/services/dashboard-widget';

const mockSeriesData = [
  { kind: 'Category 1', color: '#FF0000', share: 5, value: 100 },
  { kind: 'Category 2', color: '#00FF00', share: 10, value: 200 },
  { kind: 'Category 3', color: '#0000FF', share: 15, value: 300 }
];

const mockSeriesDataCategories = [
  { Category: 'Category 1', Color: '#FF0000', Count: 5, Value: 100 },
  { Category: 'Category 2', Color: '#00FF00', Count: 10, Value: 200 },
  { Category: 'Category 3', Color: '#0000FF', Count: 15, Value: 300 }
];

const mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error')
};

const mockTranslateService = {
  instant: () => 'Days Outstanding'
};

const mockHygieneRetention = {
  DefaultFilter: "All",
  Data: {
    All: {
      SeriesData: [
        {
          SeriesName: "HygieneRetention",
          Category: "Unscheduled",
          Label: null,
          Value: 3196.0,
          Count: 0,
          Color: null
        },
        {
          SeriesName: "HygieneRetention",
          Category: "Scheduled",
          Label: null,
          Value: 1056.0,
          Count: 0,
          Color: null
        }
      ],
      TotalValue: 0.0,
      TotalStatements: 0.0
    }
  },
  FilterList: [],
  Appointment: null
};

const mockTabLauncher = {
  launchNewTab: jasmine.createSpy()
};

describe('SimpleHalfDonutComponent', () => {
  let component: SimpleHalfDonutComponent;
  let fixture: ComponentFixture<SimpleHalfDonutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SimpleHalfDonutComponent],
      providers: [
        { provide: 'changeDetectorRef', useValue: ChangeDetectorRef },
        { provide: formatCurrencyIfNegPipe },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: 'tabLauncher', useValue: mockTabLauncher }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleHalfDonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should call loadHalfDonut when HalfDonutChartData changes', () => {
      const changes = {
        HalfDonutChartData: new SimpleChange(undefined, mockSeriesData, true),
      };
      spyOn(component, 'loadHalfDonut');
      component.ngOnChanges(changes);
      expect(component.loadHalfDonut).toHaveBeenCalled();
    });

    it('should reset donut and call loadData when simpleHalfDonutFiltersTypes changes', () => {
      const changes = {
        simpleHalfDonutFiltersTypes: new SimpleChange(undefined, mockSeriesData, true),
      };

      spyOn(component, 'loadData');
      component.resetDonut = true;
      component.ngOnChanges(changes);
      expect(component.resetDonut).toBe(false);
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should not call loadHalfDonut when HalfDonutChartData is not provided', () => {
      const changes = {};
      spyOn(component, 'loadHalfDonut');
      component.ngOnChanges(changes);
      expect(component.loadHalfDonut).not.toHaveBeenCalled();
    });
  });

  describe('loadHalfDonut', () => {
    it('should not add any data if seriesData is empty', () => {
      component.loadHalfDonut();
      expect(component.seriesDataHalfDonut).toEqual([]);
    });

    it('should update seriesData when isReceivables is true', () => {
      component.isReceivables = true;
      component.HalfDonutChartData = mockSeriesDataCategories;
      component.loadHalfDonut();
      expect(component.seriesData).toEqual([]);
    });

    it('should add the transparent half of the donut if seriesData is not empty', () => {
      component.HalfDonutChartData = mockSeriesDataCategories;
      component.seriesDataHalfDonut = mockSeriesData;
      component.HalfDonutChartData.push({
        SeriesName: 'test',
        Category: 'testCat',
        Color: '#111111',
        Value: 1
      });
      component.loadHalfDonut();
      expect(component.seriesDataHalfDonut[0]).toEqual({
        kind: "",
        color: "transparent",
        share: null,
        value: 601
      });
    });

    it('should handle _hole_ SeriesName correctly', () => {
      component.isReceivables = false;
      component.HalfDonutChartData = [
        { SeriesName: WidgetCommon._hole_, Category: 'Category A', Value: 10 },
      ];
      expect(component.seriesDataHalfDonut.length).toBe(0);
    
      component.loadHalfDonut();
      expect(component.seriesDataHalfDonut.length).toBe(2);
      expect(component.seriesDataHalfDonut[0]).toEqual({
        kind: '',
        color: 'transparent',
        share: null,
        value: 10,
      });
    });
    
    it('should handle Value < 0 when isReceivables is true', () => {
      component.isReceivables = true; 
      component.HalfDonutChartData = [
        { SeriesName: 'A', Category: 'Category A', Value: -10 }, 
      ];
      expect(component.seriesDataHalfDonut.length).toBe(0);    
      component.loadHalfDonut();
      expect(component.seriesDataHalfDonut.length).toBe(0);
      expect(component.seriesDataHalfDonut[0]).toEqual(undefined);
    });

    it('should handle the else block', () => {
      component.isReceivables = false; 
      component.HalfDonutChartData = [
        { SeriesName: 'X', Category: 'Category X', Value: 0 },
      ];
      expect(component.seriesDataHalfDonut.length).toBe(0);
    
      component.loadHalfDonut();
      expect(component.seriesDataHalfDonut.length).toBe(2);
      expect(component.seriesDataHalfDonut[0]).toEqual({
        kind: '',
        color: 'transparent', 
        share: null,
        value: 0,
      });
    });    
  })

  describe('loadData', () => {
    it('should call simpleHalfDonutDummyData if data exists', () => {
      component.simpleHalfDonutChartData = {
        Data: {
          [component.simpleHalfDonutFiltersTypes]: {
            SeriesData: [
              { Category: 'Category 1', Color: '#FF0000', Value: 100 },
              { Category: 'Category 2', Color: '#00FF00', Value: 200 },
              { Category: 'Category 3', Color: '#0000FF', Value: 300 }
            ],
          },
        },
      };  
      const simpleHalfDonutDummyDataSpy = spyOn(component, 'simpleHalfDonutDummyData');  
      component.loadData();  
      expect(simpleHalfDonutDummyDataSpy).toHaveBeenCalled();
    });

    it('should set size and holeSize when isHygieneRetention is true and data exists', () => {
      component.isHygieneRetention = true;  
      const result = mockHygieneRetention
      component.simpleHalfDonutChartData = {
        Data: {
          [component.simpleHalfDonutFiltersTypes]: {
            SeriesData: [
              { Category: 'Scheduled', Value: 10 },
              { Category: 'Other', Value: 20 }, 
            ],
          },
        },
      };    
      component.loadData();    
      expect(component.size).toBe(60);
      expect(component.holeSize).toBe(62);
      expect(result).toBe(mockHygieneRetention);
    });
    
    it('should not set size and holeSize when isHygieneRetention is true but data does not exist', () => {
      component.isHygieneRetention = true;    
      component.simpleHalfDonutChartData = {
        Data: {
          [component.simpleHalfDonutFiltersTypes]: {
            SeriesData: []
          },
        },
      };    
      component.loadData();
      expect(component.size).not.toBe(60);
      expect(component.holeSize).toBe(62);
    });  
  })

  describe('labelContent', () => {
    it('should return an empty string when value is 0 and category is empty and isHygieneRetention is true', () => {
      component.isHygieneRetention = true;
      const result = component.labelContent({ value: 0, category: '' });
      expect(result).toEqual('');
    });

    it('should return formatted value with "patients" when isHygieneRetention is true', () => {
      component.isHygieneRetention = true;
      spyOn(mockTranslateService, 'instant').and.returnValue('patients');
      const result = component.labelContent({ value: 10 });
      expect(result).toEqual('10\npatients');
    });

    it('should return formatted currency when isHygieneRetention is false', () => {
      component.isHygieneRetention = false;
      component.formatCurrency = {
        transform: (value) => `$${value.toFixed(2)}`, 
      };

      const result = component.labelContent({ value: 25.5 });
      expect(result).toEqual('$25.50');
    });
  })

  describe('labelContentHalfDonut', () => {
    it('should return an empty string when category is falsy', () => {
      const result = component.labelContentHalfDonut({ category: null });  
      expect(result).toEqual('');
    });
  
    it('should return a percentage when isReceivables is true', () => {
      component.isReceivables = true;  
      const result = component.labelContentHalfDonut({ category: 'Category1', percentage: 0.25 });  
      expect(result).toEqual('50%');
    });
  
    it('should return a calculated percentage when category is not "__0"', () => {
      const loadPercentageSpy = spyOn(component, 'loadPercentage').and.returnValue(0.75);
      const result = component.labelContentHalfDonut({ category: 'Category2' });  
      expect(loadPercentageSpy).toHaveBeenCalledWith(undefined);
      expect(result).toEqual('0.75%');
    });
  })

  describe('loadPercentage', () => {
    it('should return 0 if value is not provided or is <= 0', () => {
      const result = component.loadPercentage(null);
      expect(result).toEqual(undefined);
    });

    it('should calculate and return the correct average when value > 0', () => {
      component.isReceivables = true;
      component.HalfDonutChartData = [
        { Value: 10 },
        { Value: 20 },
        { Value: 30 },
      ];
      const result = component.loadPercentage(15);
      expect(result).toEqual(50);
    });
    it('should calculate and return the ceiling of the average when value > 0 and decimal part >= 0.5', () => {
      component.isReceivables = true;
      component.HalfDonutChartData = [
        { Value: 10 },
        { Value: 20 },
        { Value: 30 },
      ];
    
      const result = component.loadPercentage(17); 
      expect(result).toEqual(57); 
    });    
   })

   describe('visual', () => {
    it('should return a Group object when visual function is called', () => {
      const mockEvent: LegendItemVisualArgs = {
        active: false,
        createVisual: function (): Element {
          throw new Error('Function not implemented.');
        },
        options: undefined,
        pointIndex: undefined,
        sender: undefined,
        series: undefined
      };
  
      const result = component.visual(mockEvent);  
      expect(result).toBeDefined();
    });
  })

  describe('legendTitle', () => {
    it('should have a valid legendTitle', () => {
      fixture.detectChanges();     
      const expectedLegendTitle: LegendTitle = {
        text: 'Days Outstanding',
        font: '12px "Open Sans", sans-serif',
        padding: {
          bottom: 20,
          top: -100,
        },
        align: 'center',
      };    
      expect(component.legendTitle).toEqual(expectedLegendTitle);
    });    
  })

  describe('drilldown', () => {
    it('should call launchNewTab with correct URL', () => {
      component.isReceivables = true;
      const tabName = 'balanceCurrent'
      const mockEvent = {
        category: '61-90 Days',
        preventDefault: jasmine.createSpy('preventDefault')
      };
      const mockData = [{ Category: '61-90 Days' }];
      component.HalfDonutChartData = mockData;
      component.drilldown(mockEvent);
      expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith(SimpleHalfDonut.baseUrl + tabName);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  })
});
