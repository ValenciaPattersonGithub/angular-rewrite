import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { PhoneNumberPipe } from 'src/@shared/pipes/phone-number/phone-number.pipe';
import { PatientContactComponent } from './patient-contact.component';

describe('PatientContactComponent', () => {
    let component: PatientContactComponent;
    let fixture: ComponentFixture<PatientContactComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [PatientContactComponent, PhoneNumberPipe],
            imports: [TranslateModule.forRoot()]

        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientContactComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
