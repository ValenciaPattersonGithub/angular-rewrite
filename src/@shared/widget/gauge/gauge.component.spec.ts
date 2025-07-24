import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaugeComponent } from './gauge.component';
import { GaugeChartType, GaugeFiltersTypes, SeriesData, SeriesNameTypes } from './gauge-chart.model';
import { SimpleChange, SimpleChanges } from '@angular/core';

describe('GaugeComponent', () => {
  let component: GaugeComponent;
  let fixture: ComponentFixture<GaugeComponent>;

  const gaugeChartData: Array<SeriesData> = [
    {
    Category: "Value",
    Color: "#30AFCD",
    Count: 0,
    Label: null,
    SeriesName: null,
    Value: 15726.43,
  }]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GaugeComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the expected type for GaugeChartType', () => {
    const result = component.GaugeChartType;
    expect(result).toEqual(GaugeChartType);
  });

  describe('ngOnChanges ->', () => {
    it('should call ngOnChanges', () => {
      spyOn(component, 'loadData')
      const changes: SimpleChanges = {}
      component.ngOnChanges(changes);
      expect(component.loadData).not.toHaveBeenCalled();
    });
    it('should call loadData if gaugeChartData changes', () => {
      const changes: SimpleChanges = {
        gaugeChartData: new SimpleChange('old value', 'new value', false)
      };
      spyOn(component, 'loadData');
      component.ngOnChanges(changes);
      expect(component.loadData).toHaveBeenCalled();
    });
  
    it('should not call loadData if gaugeChartData does not change', () => {
      const changes: SimpleChanges = {
        gaugeChartData: new SimpleChange('same value', 'same value', false)
      };
      spyOn(component, 'loadData');
      component.ngOnChanges(changes);
      expect(component.loadData).not.toHaveBeenCalled();
    });
  });

  describe('loadData ->', () => {
    it('Should Set Default Values for Gross Producation', () => {
      component.gaugeChartType = GaugeChartType.GrossProduction;
      component.gaugeFiltersTypes = GaugeFiltersTypes.YTD;
      component.gaugeChartData = gaugeChartData;
      component.loadData();
      expect(component.configSettings.startAngle).toEqual(-45);
      expect(component.configSettings.endAngle).toEqual(225);
      expect(component.configSettings.rangeLineCap).toEqual("butt");
      expect(component.configSettings.showLabels).toEqual(true);
      expect(component.configSettings.value).toEqual(100);
      const color = { from: 0, to: 100, color: "#59ADC9", opacity:1 };
      expect(component.configSettings.colors[0]).toEqual(color);
      expect(component.gaugeValue).toEqual(15726.43);
    });

    it('Should Set Default Values for Net Producation', () => {
      component.gaugeChartType = GaugeChartType.NetProduction;
      component.gaugeFiltersTypes = GaugeFiltersTypes.YTD;
      component.gaugeChartData = gaugeChartData;
      component.loadData();
      expect(component.configSettings.startAngle).toEqual(-45);
      expect(component.configSettings.endAngle).toEqual(225);
      expect(component.configSettings.rangeLineCap).toEqual("butt");
      expect(component.configSettings.showLabels).toEqual(true);
      expect(component.configSettings.value).toEqual(100);
      const color = { from: 0, to: 100, color: "#59ADC9", opacity:1 };
      expect(component.configSettings.colors[0]).toEqual(color);
      expect(component.gaugeValue).toEqual(15726.43);
    });

    it('Should Set Default Values for Schedule Utilization', () => {
      component.gaugeChartType = GaugeChartType.ScheduleUtilization;
      component.gaugeFiltersTypes = GaugeFiltersTypes.YTD;
      const serialData = {
        SeriesName: SeriesNameTypes._hole_,
        Value: 100,
        Category: 'Booked Category'
      };
      component.gaugeChartData = [serialData];
      component.loadData();
      expect(component.configSettings.startAngle).toEqual(-45);
      expect(component.configSettings.endAngle).toEqual(225);
      expect(component.configSettings.rangeLineCap).toEqual("butt");
      expect(component.configSettings.showLabels).toEqual(true);
      expect(component.configSettings.value).toEqual(100);
      const color = { from: 0, to: 100, color: "#59ADC9", opacity:1 };
      expect(component.configSettings.colors[0]).toEqual(color);
      expect(component.gaugeValue).toEqual(serialData.Value);
      expect(component.booked).toEqual(serialData.Category);
    });

    it('Should set configSettings.value to 0 when gaugeChartData is not truthy', () => {
      component.gaugeChartType = GaugeChartType.ScheduleUtilization;
      component.gaugeFiltersTypes = GaugeFiltersTypes.YTD;
      component.gaugeChartData = null;     
      component.loadData();
      expect(component.configSettings.value).toEqual(0);
    });

    it('should set the correct properties when gaugeChartType is not GrossProduction, NetProduction, or ScheduleUtilization', () => {
      component.gaugeChartType = GaugeChartType.OtherType;
      component.gaugeChartData = [
        { Category: 'Value', Value: 50 },
        { SeriesName: '_hole_', Value: 60, Category: 'Booked' }
      ];
  
      component.loadData();
  
      expect(component.configSettings.startAngle).toBe(0);
      expect(component.configSettings.endAngle).toBe(180);
      expect(component.configSettings.rangeLineCap).toBe('round');
      expect(component.configSettings.showLabels).toBe(false);
      const color = { from: 0, to: 100, color: '#75c2de', opacity: 1 };
      expect(component.configSettings.value).toBe(0);
      expect(component.configSettings.colors[0]).toEqual(color);
      expect(component.gaugeValue).toBe(0);
    });
    
  });  

  describe('onClick->', () => {
    it('Should Call output event drilldown', () => {
      component.drilldown.emit = jasmine.createSpy();
      component.onClick()
      expect(component.drilldown.emit).toHaveBeenCalled();
    });
  });

});
