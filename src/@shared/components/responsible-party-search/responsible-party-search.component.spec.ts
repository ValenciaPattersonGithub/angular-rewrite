import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppRadioButtonComponent } from 'src/@shared/components/form-controls/radio-button/radio-button.component';
import { ResponsiblePartySearchComponent } from './responsible-party-search.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { TranslateModule } from '@ngx-translate/core';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResponsiblePersonTypeEnum } from '../../models/responsible-person-type-enum';
import { of } from 'rxjs';
import { SvgIconComponent } from 'src/@shared/components/svg-icons/svg-icon.component';
import { HighlightTextIfContainsPipe } from 'src/@shared/pipes';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';

describe('ResponsiblePartySearchComponent', () => {
    let component: ResponsiblePartySearchComponent;
    let fixture: ComponentFixture<ResponsiblePartySearchComponent>;
    let patientService: any;
    const mockService = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        LaunchPatientLocationErrorModal: (a: any) => { },
        SetCheckingUserPatientAuthorization: (a: any) => { },
        transform: (a: any) => { },
        ConfirmModal: (a: any, b: any, c: any, d: any) => { },
        PatientSearchValidation: (a: any) => { },
        CheckPatientLocation: (a: any, b: any) => { },
        patientSearch: (a: any) => of({}),
        Patients: {
            get: (a: any) => { }
        },
        Persons: {
            get: (a: any) => { }
        },
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({})
    };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [ResponsiblePartySearchComponent, AppRadioButtonComponent, SvgIconComponent, HighlightTextIfContainsPipe],
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule,],
            providers: [
                { provide: 'toastrFactory', useValue: mockService },
                { provide: 'ModalFactory', useValue: mockService },
                { provide: 'PatientValidationFactory', useValue: mockService },
                { provide: DatePipe, useValue: mockService },
                { provide: PatientHttpService, useValue: mockService },
                { provide: 'PersonServices', useValue: mockService },
                { provide: 'PatientServices', useValue: mockService },
                { provide: PatientRegistrationService, useValue: mockService },
                { provide: 'tabLauncher', useValue: mockService }
            ],
        })
            .compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(ResponsiblePartySearchComponent);
        patientService = TestBed.get(PatientHttpService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('initializeSearch', () => {
        it('should initialize search', () => {
            component.initializeSearch();
            expect(component.takeAmount).toBe(45);
            expect(component.limit).toBe(15);
            expect(component.limitResults).toBe(true);
            expect(component.searchTerm).toBe('');
            expect(component.searchString).toBe('');
            expect(component.resultCount).toBe(0);
            expect(component.searchResults.length).toBe(0);
        });
    });
    describe('clearSearch', () => {
        it('should clear search', () => {
            spyOn(component, 'initializeSearch').and.callThrough();
            component.componentName = 'PersonalDetail';
            component.clearSearch();
            expect(component.initializeSearch).toHaveBeenCalled();
            expect(component.responsiblePerson).toBeNull;
            expect(component.disableResponsiblePerson).toBe(false);
            expect(component.IsResponsiblePersonEditable).toBe(false);
        });
    });
    describe('responsiblePersonTypeChange', () => {
        it('should show search input when type is other', () => {
            component.responsiblePersonTypeChange(ResponsiblePersonTypeEnum.other);
            expect(component.showSearch).toBe(true);
        });
    });
});
