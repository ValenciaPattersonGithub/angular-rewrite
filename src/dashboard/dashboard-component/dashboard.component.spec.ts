import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';

const mockplatformSessionCachingService = {};
const mockLocationServices = {};
const users = 'users';
const dashboardDefinitionData = {
    CanDrag: true,
    CanResize: false,
    Columns: 8,
    items:
        [{
            ActionId: 2715,
            BatchLoadId: 0,
            IsHidden: true,
            ItemId: 14,
            ItemType: 'widget',
            Locations: [1],
            Position: [1, 1],
            Size: { Width: 2, Height: 2 },
            Template: 'pending-claims-half-donut-widget.html',
            Title: 'Pending Claims',
            initMode: 0
        }]
};


const mockreferenceDataService = {
    get: jasmine.createSpy('referenceDataService.get(users)').and.returnValue({
        $promise: {
            Value: '',
            then: (callback) => {
                callback({
                    Value:
                        users
                });
            }
        }
    })
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

const mockFeatureFlagService = {
    getOnce$: jasmine.createSpy().and.returnValue(of("white"))
}

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [DashboardComponent],
            imports: [
                TranslateModule.forRoot()  // Required import for componenets that use ngx-translate in the view or componenet code
            ],
            providers: [
                { provide: 'locationService', useValue: mockLocationServices },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'platformSessionCachingService', useValue: mockplatformSessionCachingService },
                { provide: 'DashboardService', useValue: {} },
                { provide: 'UserServices', useValue: {} },
                { provide: 'FeatureService', useValue: {} },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        component.standardItems = dashboardDefinitionData.items;
        component.hiddenItems = [];
        component.hiddenWidgetFilterOptions = [];
        component.unSelectedItems = [];
        component.setDefaultItem = ({ Value: 'Hidden', Id: null });
        component.columns = 6;
        component.draggable = false;
        component.resizable = true;
        component.callMethods = false;
        component.dashboardDefinition = dashboardDefinitionData;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('createGridster method ->', () => {
        it('createGridster should be called with standardItems', () => {
            component.createGridster();
            expect(component.standardItems.length).toEqual(0);
        });
        it('createGridster should be called with hiddenItems', () => {
            component.createGridster();
            expect(component.hiddenItems.length).toEqual(0);
        });
        it('createGridster should be called with hiddenWidgetFilterOptions', () => {
            component.createGridster();
            expect(component.hiddenWidgetFilterOptions.length).toEqual(0);
        });
        it('createGridster should be called with columns', () => {
            component.createGridster();
            expect(component.columns).toEqual(8);
        });
        it('createGridster should be called with draggable', () => {
            component.createGridster();
            expect(component.draggable).toBe(true);
        });
        it('createGridster should be called with resizable', () => {
            component.createGridster();
            expect(component.resizable).toBe(false);
        });
    });
});

