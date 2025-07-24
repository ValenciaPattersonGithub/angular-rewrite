import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ResponsiblePartySearchComponent } from 'src/@shared/components/responsible-party-search/responsible-party-search.component';
import { ReferralsComponent } from './referrals.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { DatePipe } from '@angular/common';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { of, throwError } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ReferralsComponent', () => {
    let component: ReferralsComponent;
    let fixture: ComponentFixture<ReferralsComponent>;
    let registrationService: any;
    const mockService = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        getReferralSources: () => of({}),
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({})
    };
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReferralsComponent, ResponsiblePartySearchComponent, AppLabelComponent],
            imports: [TranslateModule.forRoot(), AppKendoUIModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule],
            providers: [
                { provide: 'toastrFactory', useValue: mockService },
                { provide: PatientRegistrationService, useValue: mockService },
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReferralsComponent);
        component = fixture.componentInstance;
        registrationService = TestBed.get(PatientRegistrationService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getSources', () => {
        it('should call registrationService.getReferralSources when getSources called', () => {
            spyOn(registrationService, 'getReferralSources').and.callThrough();
            component.getSources();
            expect(registrationService.getReferralSources).toHaveBeenCalled();
        });
        it('should call getReferralSourcesFailure when registrationService.getReferralSources throw Error', () => {
            spyOn(registrationService, 'getReferralSources').and.returnValue(throwError('Error'));
            spyOn(component, 'getReferralSourcesFailure').and.callThrough();
            component.getSources();
            expect(registrationService.getReferralSources).toHaveBeenCalled();
            expect(component.getReferralSourcesFailure).toHaveBeenCalled();
        });
    });
});
