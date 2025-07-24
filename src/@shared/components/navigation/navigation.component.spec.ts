import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { NavigationComponent } from './navigation.component';
import { TreatmentPlanEditServicesService } from 'src/treatment-plans/component-providers';
import { MenuHelper } from 'src/@shared/providers/menu-helper';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { Observable, of } from 'rxjs';

describe('NavigationComponent', () => {
    let component: NavigationComponent;
    let fixture: ComponentFixture<NavigationComponent>;

    let mockTabLauncher: jasmine.SpyObj<{ launchNewTab: () => void; }>;
    let mockLocationServices: jasmine.SpyObj<{ getLocationSRHEnrollmentStatus: () => { $promise: Promise<{ Result: boolean; }> }; }>;
    let mockFeatureService: jasmine.SpyObj<{ isEnabled: () => Promise<void> }>;
    let mockPayerReportsService: jasmine.SpyObj<{ PracticeHasPayerReport: () => { $promise: Promise<void> } }>;
    let mockTreatmentPlanEditServicesService: jasmine.SpyObj<TreatmentPlanEditServicesService>;
    let mockMenuHelper: jasmine.SpyObj<MenuHelper>;
    let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;

    let esCancelEvent: EventEmitter<string>;

    beforeAll(() => {
        sessionStorage.setItem('userLocation', JSON.stringify({ id: 1 }));
    });

    afterAll(() => {
        sessionStorage.removeItem('userLocation');
    });

    beforeEach(waitForAsync(() => {
        mockTabLauncher = jasmine.createSpyObj('tabLauncher', ['launchNewTab']);
        
        mockLocationServices = jasmine.createSpyObj('LocationServices', ['getLocationSRHEnrollmentStatus']);
        mockLocationServices.getLocationSRHEnrollmentStatus.and.returnValue({ $promise: Promise.resolve({ Result: true }) });

        mockFeatureService = jasmine.createSpyObj('FeatureService', ['isEnabled']);
        mockFeatureService.isEnabled.and.returnValue(Promise.resolve());

        mockPayerReportsService = jasmine.createSpyObj('PayerReportsService', ['PracticeHasPayerReport']);
        mockPayerReportsService.PracticeHasPayerReport.and.returnValue({ $promise: Promise.resolve({ Value: {} }) });

        mockTreatmentPlanEditServicesService = jasmine.createSpyObj('TreatmentPlanEditServicesService', ['esCancelEvent']);
        esCancelEvent = new EventEmitter<string>();
        mockTreatmentPlanEditServicesService.esCancelEvent = esCancelEvent as any;

        mockMenuHelper = jasmine.createSpyObj('MenuHelper', ['businessMenuItems', 'patientMenuItems']);
        mockMenuHelper.businessMenuItems.and.returnValue([]);
        mockMenuHelper.patientMenuItems.and.returnValue([]);

        mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
        mockFeatureFlagService.getOnce$.and.returnValue(of(true));

        TestBed.configureTestingModule({
            declarations: [NavigationComponent],
            providers: [
                { provide: 'tabLauncher', useValue: mockTabLauncher },
                { provide: '$location', useValue: { $$path: '/Dashboard/' } },
                { provide: 'LocationServices', useValue: mockLocationServices },
                { provide: 'FeatureService', useValue: mockFeatureService },
                { provide: 'PayerReportsService', useValue: mockPayerReportsService },
                { provide: TreatmentPlanEditServicesService, useValue: mockTreatmentPlanEditServicesService },
                { provide: MenuHelper, useValue: mockMenuHelper },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should capture esCancelEvent', (done) => {
        esCancelEvent.subscribe((value) => {
            expect(value).toBe('test');
            done();
        });
        esCancelEvent.emit('test');
    });

    it('should set selected in initNavSelect', () => {
        expect(component.selected).toBe('dashboard');
    });

    it('should open new tab on navigate', () => {
        component.navigate('test');
        expect(mockTabLauncher.launchNewTab).toHaveBeenCalled();
    });
});
