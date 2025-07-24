import { TestBed } from '@angular/core/testing';
import { DashboardWidgetService } from './dashboard-widget.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GaugeFiltersTypes } from 'src/@shared/widget/gauge/gauge-chart.model';
import moment from 'moment';

export class MockDropDownListComponent {
    isOpen: boolean = false;
  
    toggle(value: boolean) {
      this.isOpen = value;
    }
  }
describe('DashboardWidgetService', () => {
    let service: DashboardWidgetService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DashboardWidgetService, HttpClient,
                { provide: 'SoarConfig', useValue: {} },
            ]
        });
        service = TestBed.get(DashboardWidgetService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should close the dropdown when it is open', () => {
        const mockDropDownList = new MockDropDownListComponent();
        mockDropDownList.isOpen = true;
    
        service.clickedOutside(mockDropDownList);    
        expect(mockDropDownList.isOpen).toBe(false);
      });
    
      it('should not close the dropdown when it is already closed', () => {
        const mockDropDownList = new MockDropDownListComponent();
        mockDropDownList.isOpen = false;
    
        service.clickedOutside(mockDropDownList);
    
        expect(mockDropDownList.isOpen).toBe(false); // It remains false as it wasn't open
      });

    describe('GetReportFilterDto', () => {
        it('should generate LastYear date range correctly', () => {
            const result = service.GetReportFilterDto([], [], GaugeFiltersTypes.LastYear);
            const currentDate = moment();
            expect(result.PresetFilterDto.StartDate).toEqual(moment(currentDate).add(-1, 'years').startOf('year').toDate());
            expect(result.PresetFilterDto.EndDate).toEqual(moment(currentDate).add(-1, 'years').endOf('year').startOf('day').toDate());
        });

        it('should generate LastMonth date range correctly', () => {
            const result = service.GetReportFilterDto([], [], GaugeFiltersTypes.LastMonth);
            const currentDate = moment();
            expect(result.PresetFilterDto.StartDate).toEqual(moment(currentDate).add(-1, 'months').startOf('month').toDate());
            expect(result.PresetFilterDto.EndDate).toEqual(moment(currentDate).add(-1, 'months').endOf('month').startOf('day').toDate());
        });

        it('should generate YTD date range correctly', () => {
            const result = service.GetReportFilterDto([], [], GaugeFiltersTypes.YTD);
            const currentDate = moment();
            expect(result.PresetFilterDto.StartDate).toEqual(moment(currentDate).startOf('year').toDate());
        });

        it('should generate MTD date range correctly', () => {
            const result = service.GetReportFilterDto([], [], GaugeFiltersTypes.MTD);
            const currentDate = moment();
            expect(result.PresetFilterDto.StartDate).toEqual(moment(currentDate).startOf('month').toDate());
        });

        it('should include ProviderUserIds when provided', () => {
            const result = service.GetReportFilterDto([], ['1', '2'], GaugeFiltersTypes.Today);
            expect(result.PresetFilterDto.ProviderUserIds).toEqual(['1', '2']);
        });

        it('should not include ProviderUserIds when not provided', () => {
            const result = service.GetReportFilterDto([], null, GaugeFiltersTypes.Today);
            expect(result.PresetFilterDto.ProviderUserIds).toBeUndefined();
        });
    });
}); 