import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { configureTestSuite } from 'src/configure-test-suite';

import { AdditionalIdentifiersComponent } from './additional-identifiers.component';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';

describe('AdditionalIdentifiersComponent', () => {
    let component: AdditionalIdentifiersComponent;
    let fixture: ComponentFixture<AdditionalIdentifiersComponent>;
    const mockPatientAdditionalIdentifierService = {
        save: jasmine.createSpy(),
        update: jasmine.createSpy(),
        get: jasmine.createSpy(),
        getPatientAdditionalIdentifiers: jasmine.createSpy(),
        delete: jasmine.createSpy(),
    }
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            declarations: [AdditionalIdentifiersComponent, AppLabelComponent],
            providers: [
                { provide: PatientAdditionalIdentifierService, useValue: mockPatientAdditionalIdentifierService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdditionalIdentifiersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
