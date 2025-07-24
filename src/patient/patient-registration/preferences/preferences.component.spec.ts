import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PreferencesComponent } from './preferences.component';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { OrderByPipe } from 'src/@shared/pipes';
import { TranslateModule } from '@ngx-translate/core';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from 'src/@shared/components/svg-icons/svg-icon.component';
import { AppCheckBoxComponent } from 'src/@shared/components/form-controls/check-box/check-box.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { AppMultiselectComponent } from 'src/@shared/components/form-controls/multiselect/multiselect.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { AppDatePickerComponent } from 'src/@shared/components/form-controls/date-picker/date-picker.component';
import { RegistrationEvent } from 'src/patient/common/models/enums';
import { constants } from 'fs';
import { RegistrationCustomEvent } from 'src/patient/common/models/registration-custom-event.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GroupTypeService } from 'src/@shared/providers/group-type.service';

describe('PreferencesComponent', () => {
    let component: PreferencesComponent;
    let fixture: ComponentFixture<PreferencesComponent>;
    let patSecurityService: any;
    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    const mockservice = {
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({}),
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        get: jasmine.createSpy().and.returnValue([{}]),
        getAllMasterPatientAlerts: () => of({}),
        getAllMasterDiscountTypes: () => of({}),
        entityNames: {
            users: {}
        },
        getCurrentLocation: () => { },
        getCurrentPracticeLocations: () => new Promise((resolve, reject) => { }),
        getData: () => new Promise((resolve, reject) => { }),
    };

    const mockGroupTypeService = {
        save: jasmine.createSpy(),
        update: jasmine.createSpy(),
        get: jasmine.createSpy(),
        delete: jasmine.createSpy(),
        groupTypeWithPatients: jasmine.createSpy(),
      };
      
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), AppKendoUIModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule,HttpClientTestingModule],
            declarations: [PreferencesComponent, OrderByPipe, SvgIconComponent, AppCheckBoxComponent, AppLabelComponent,
                AppMultiselectComponent, AppDatePickerComponent],
            providers: [
                { provide: 'toastrFactory', useValue: mockservice },
                { provide: PatientRegistrationService, useValue: mockservice },
                { provide: 'referenceDataService', useValue: mockservice },
                { provide: 'locationService', useValue: mockservice },
                { provide: GroupTypeService, useValue: mockGroupTypeService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: '$routeParams', useValue: mockservice }

            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PreferencesComponent);
        component = fixture.componentInstance;
        patSecurityService = TestBed.get('patSecurityService');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('authAccess', () => {
        it('should call authAccess and set value true to hasCreateAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            component.authAccess();
            expect(component.hasCreateAccess).toEqual(true);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.soarAuthCustomFlagsAddKey);
            expect(component.soarAuthCustomFlagsAddKey).toEqual("soar-biz-bmalrt-add");
        });
        it('should call authAccess and set value false to hasCreateAccess',()=>{
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(false);
            component.authAccess();
            expect(component.hasCreateAccess).toEqual(false);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.soarAuthCustomFlagsAddKey);
            expect(component.soarAuthCustomFlagsAddKey).toEqual("soar-biz-bmalrt-add");
        });

        it('should call authAccess and set value true to hasEditDiscountAccess',()=>{
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            component.authAccess();
            expect(component.hasEditDiscountAccess).toEqual(true);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.editDiscountAuthAbbreviation);
            expect(component.editDiscountAuthAbbreviation).toEqual("soar-per-perdsc-edit");
        });
        it('should call authAccess and set value false to hasEditDiscountAccess',()=>{
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(false);
            component.authAccess();
            expect(component.hasEditDiscountAccess).toEqual(false);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.editDiscountAuthAbbreviation);
            expect(component.editDiscountAuthAbbreviation).toEqual("soar-per-perdsc-edit");
        });
        it('should call authAccess and set value true to hasEditGroupAccess',()=>{
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            component.authAccess();
            expect(component.hasEditGroupAccess).toEqual(true);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.editGroupAuthAbbreviation);
            expect(component.editGroupAuthAbbreviation).toEqual("soar-per-pergrp-edit");
        });
        it('should call authAccess and set value false to hasEditGroupAccess',()=>{
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(false);
            component.authAccess();
            expect(component.hasEditGroupAccess).toEqual(false);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.editGroupAuthAbbreviation);
            expect(component.editGroupAuthAbbreviation).toEqual("soar-per-pergrp-edit");
        });

        it('should call handlecurrentlocation method when user mark any Hygenist/Dentist not as a provider, check preferred Hygenist/Dentist set to null', () =>{

            //Arrange
            const event:RegistrationCustomEvent = {
                    eventtype: RegistrationEvent.CurrentLocation,
                    data:{ id: 100}
            };            
            component.primaryLocations=
                [
                    {  text:'Location A', value:100},
                    {  text:'Location B', value:101},
                    {  text:'Location C', value:102}
                ];
                component.preferredHygienists=[
                    {   text:'Hygenist 1',value:2001},
                    {   text:'Hygenist 2',value:2002}
                ]
                component.preferredHygienists=[
                    {  text:'Dentist 1',value:3000},
                    {  text:'Dentist 2',value:3001}

                ]
                component.patientPreference= new FormGroup({
                    PrimaryLocation: new FormControl(''),
                    PreferredHygienists: new FormControl(''),
                    PreferredDentists: new FormControl('')

                });
                component.patientPreference.patchValue({
                    PrimaryLocation:101,
                    PreferredHygienists:200,
                    PreferredDentists: 300,
                })
            //Act
            component.handleCurrentLocation(event);

            //Assert
             console.log(component.patientPreference.get('PreferredHygienists').value);
             expect(component.patientPreference.get('PreferredHygienists').value).toEqual(null);
             expect(component.patientPreference.get('PreferredDentists').value).toEqual(null);
           
        })
    });
});
