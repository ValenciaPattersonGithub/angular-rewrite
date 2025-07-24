import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PatientInsuranceCardComponent } from './patient-insurance-card.component';
import { PatientRegistrationService } from '../../../common/http-providers/patient-registration.service';
import { MockRepository } from '../../../patient-profile/patient-profile-mock-repo';
import { PhoneNumberPipe } from '../../../../@shared/pipes/phone-number/phone-number.pipe';
import { DatePipe } from '@angular/common';

describe('PatientInsuranceCardComponent', () => {
    let component: PatientInsuranceCardComponent;
    let fixture: ComponentFixture<PatientInsuranceCardComponent>;
    let mockRepo;

    beforeEach(async () => {
        mockRepo = MockRepository();
        await TestBed.configureTestingModule({
            declarations: [PatientInsuranceCardComponent, PhoneNumberPipe],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: 'tabLauncher', useValue: mockRepo.mockService },
                { provide: PatientRegistrationService, useValue: mockRepo.mockService },
                { provide: DatePipe, useValue: mockRepo.mockService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientInsuranceCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
