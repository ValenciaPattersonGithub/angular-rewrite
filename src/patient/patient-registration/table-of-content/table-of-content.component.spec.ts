import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { configureTestSuite } from 'src/configure-test-suite';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';

import { TableOfContentComponent } from './table-of-content.component';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';

describe('TableOfContentComponent', () => {
    let component: TableOfContentComponent;
    let fixture: ComponentFixture<TableOfContentComponent>;
    let mockFeatureFlagService;
    const mockservice = {
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({})
    };
    configureTestSuite(() => {
        mockFeatureFlagService = {
            getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
                of({
                    Value: []
                })),
        };
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), AppKendoUIModule, BrowserAnimationsModule],
            declarations: [TableOfContentComponent],
            providers: [
                { provide: PatientRegistrationService, useValue: mockservice },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                { provide: "$routeParams", useValue: {} }
            ]
        })
            .compileComponents();
    });
   
    beforeEach(() => {
        fixture = TestBed.createComponent(TableOfContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
