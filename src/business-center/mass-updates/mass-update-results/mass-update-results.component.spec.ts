import { HttpClient } from '@angular/common/http';
import {  HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MassUpdateResultsComponent } from './mass-update-results.component';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { ToDisplayTimePipe } from 'src/@shared/pipes/time/to-display-time.pipe';

describe('MassUpdateResultsComponent', () => {
  let component: MassUpdateResultsComponent;
  let fixture: ComponentFixture<MassUpdateResultsComponent>;

  const mockToShortDisplayDateUtcPipe = jasmine.createSpy().and.returnValue({})
  const mockToDisplayTimePipe = jasmine.createSpy().and.returnValue({});
  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text'
};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [MassUpdateResultsComponent, ToShortDisplayDateUtcPipe, ToDisplayTimePipe],
        imports: [HttpClientTestingModule],
        providers: [HttpClient,            
          { provide: 'SoarConfig', useValue: {} },   
          { provide: 'localize', useValue: mockLocalizeService },
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MassUpdateResultsComponent);
    component = fixture.componentInstance;
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
    it('should call export', () => {
      component.export(1, null);
    });
  });
});
