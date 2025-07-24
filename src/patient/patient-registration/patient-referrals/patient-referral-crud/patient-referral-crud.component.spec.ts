import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { BehaviorSubject } from 'rxjs';
import { BlueImagingService } from '../../../imaging/services/blue.service';
import { ImagingMasterService } from '../../../imaging/services/imaging-master.service';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PatientReferralCrudComponent } from './patient-referral-crud.component';
import { AgePipe } from 'src/@shared/pipes/age/age.pipe';
import { PhoneNumberPipe } from 'src/@shared/pipes/phone-number/phone-number.pipe';
import { TruncateTextPipe } from 'src/@shared/pipes/truncate/truncate-text.pipe';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler/compiler';
import { AppSelectComponent } from '../../../../@shared/components/form-controls/select-list/select-list.component';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { MicroServiceApiService } from '../../../../security/providers';
import { PatientReferralPrintService } from '../patient-referral-print.service';
import { ProviderSelectorWithGroupingComponent } from '../../../../@shared/components/provider-selector-with-grouping/provider-selector-with-grouping.component';
import { AppointmentServiceProcessingRulesService } from '../../../../scheduling/common/providers';
import { AppDatePickerComponent } from 'src/@shared/components/form-controls/date-picker/date-picker.component';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';

let referralManagementHttpService: any;
let patientReferralPrintService: any;
describe('PatientReferralCrudComponent', () => {
    let component: PatientReferralCrudComponent;
    let fixture: ComponentFixture<PatientReferralCrudComponent>;
    let microServiceApiService: Partial<MicroServiceApiService>;
    let patSecurityService: any;
    const blueUrl = 'blueImagingApiUrl';
    const mockPatientMedicalHistoryAlerts = {
        ExtendedStatusCode: null,
        Value: null,
        Count: null,
        InvalidProperties: null
    };

    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { },
        generateMessage: (authtype: string) => { },
    };

    const mockpatientReferralsService = {
        getMedicalHistoryAlerts: () => { },
        getPatientInformation: () => { },
        getReferralDirections: () => { },
        getReferralCategories: () => { },
        getBlueImage: () => { },
    };

    const mockpatientReferralPrintService = {
        downloadPatientReferral: () => { }
    };

    const mockDialogRef = {
        open: (dialogResult: any) => { },
        close: () => of({}),
        content: {
            instance: {
                title: ''
            }
        }
    }

    const mockservice = {
        IsAuthorizedByAbbreviation: (authtype: string) => { },
        getServiceStatus: () =>
            new Promise((resolve, reject) => {
                // the resolve / reject functions control the fate of the promise
            }),
        esCancelEvent: new BehaviorSubject<{}>(undefined),
        isEnabled: () => new Promise((resolve, reject) => { }),
        getCurrentLocation: jasmine
            .createSpy()
            .and.returnValue({ practiceId: 'test' }),
        getPatientResponsiblePartyPhonesAndEmails: (a: any) => of({
        }),
        getAppointmentsByPatientId: (a: any, b: any) => of({
        }),
        getActiveLocations: () => of({
        }),
    };
    const blueImagingServiceSpy = jasmine.createSpyObj('BlueImagingService', ['getImage']);
    var personResult = { Value: '' };
    const mockPersonFactory = {
        getById: jasmine.createSpy('PersonFactory.getById').and.returnValue({
            then: function (callback) {
                callback(personResult);
            }
        }),
    };

    const mockPatientServices = {
        PatientLocations: {
            get: jasmine.createSpy().and.callFake(array => {
                return {
                    then(callback) {
                        callback(array);
                    },
                };
            }),
        },
        TreatmentPlans: {
            getTreatmentPlansWithServicesByPersonId: jasmine.createSpy().and.callFake(array => {
                return {
                    $promise: {
                        then(callback) {
                            callback(array);
                        },
                    },
                };
            }),
        },
    };

    const patientMedicalHistoryAlertsFactory = {
        PatientMedicalHistoryAlerts: () => {
            return {
                then: (res) => {
                    res(mockPatientMedicalHistoryAlerts)
                }
            }
        }
    };
    const mockSoarConfig = {
        domainUrl: 'https://localhost:35440',
    };
    const mockPatientProfile = {
        PatientId: 'e98afd59-9a8a-45c5-a549-03229b6de026',
        LastName: 'LastName',
        FirstName: 'FirstName',
        Suffix: 'Mr',
        DateOfBirth: '02/02/2002',
        HeightFeet: "5",
        HeightInches: "12",
        Sex: "M",
        IsSignatureOnFile: 1,
        ResponsiblePersonType: 1,
        IsActive: 0,
        Weight: 76,

    };
    var mockProviderList = [
        { 'UserId': 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e', 'FirstName': 'RK Assist', 'MiddleName': null, 'LastName': 'Assitant', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'raks@pattcom.onmicrosoft.com', 'UserCode': 'ASSRK1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'rkas@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': null, 'JobTitle': null, 'ProviderTypeId': 3, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': 'RK Assist Pat Soar C', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T11:50:18.2199196+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A50%3A18.2199196Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T11:50:16.9153383Z' },
        { 'UserId': '43189973-d808-4fd1-a8cc-fabf84c9f18f', 'FirstName': 'Terra', 'MiddleName': 'D', 'LastName': 'Data', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'terradata123@pattcom.onmicrosoft.com', 'UserCode': 'DATTE1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'terra@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': 1, 'JobTitle': 'Dental surgeon', 'ProviderTypeId': 1, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T14:26:13.9041626+00:00","RowVersion":"W/\\"datetime\'2015-09-30T14%3A26%3A13.9041626Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T14:26:12.1070625Z' },
        { 'UserId': 'ab796156-f6f9-4057-a463-4d4c23a74dca', 'FirstName': 'SHA', 'MiddleName': null, 'LastName': 'GOE', 'PreferredName': 'Shalini', 'DateOfBirth': null, 'UserName': 'shhh@pattcom.onmicrosoft.com', 'UserCode': 'GOESH1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'sss@test.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': null, 'JobTitle': null, 'ProviderTypeId': 4, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': 'Den', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-28T15:55:14.6622633+00:00","RowVersion":"W/\\"datetime\'2015-09-28T15%3A55%3A14.6622633Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-28T15:55:12.9146859Z' },
        { 'UserId': 'eedf5827-6735-4832-9d20-99758df70a8b', 'FirstName': 'Inc Assist', 'MiddleName': '', 'LastName': 'Inactive', 'PreferredName': 'Inca', 'DateOfBirth': null, 'UserName': 'inca@pattcom.onmicrosoft.com', 'UserCode': 'INAIN1', 'Color': '#7F7F7F', 'ImageFile': '', 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'inca@email.com', 'Address': { 'AddressLine1': '', 'AddressLine2': '', 'City': '', 'State': '', 'ZipCode': '' }, 'DepartmentId': null, 'JobTitle': '', 'ProviderTypeId': 3, 'TaxId': '', 'FederalLicense': '', 'DeaNumber': '', 'NpiTypeOne': '', 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': '', 'AnesthesiaId': '', 'IsActive': false, 'StatusChangeNote': null, 'ProfessionalDesignation': 'Assistant of the Pat', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T09:26:01.353604+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A01.353604Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T09:26:00.0431939Z' },
        { 'UserId': '517ce215-b71b-408f-8b20-62a4c1386f77', 'FirstName': 'Inc Dentist', 'MiddleName': '', 'LastName': 'Inactive', 'PreferredName': '', 'DateOfBirth': null, 'UserName': 'incden@pattcom.onmicrosoft.com', 'UserCode': 'INAIN2', 'Color': '#7F7F7F', 'ImageFile': '', 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'incden@email.com', 'Address': { 'AddressLine1': '', 'AddressLine2': '', 'City': '', 'State': '', 'ZipCode': '' }, 'DepartmentId': null, 'JobTitle': '', 'ProviderTypeId': 1, 'TaxId': '', 'FederalLicense': '', 'DeaNumber': '', 'NpiTypeOne': '', 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': '', 'AnesthesiaId': '', 'IsActive': false, 'StatusChangeNote': null, 'ProfessionalDesignation': 'Dentist of the Pat C', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T09:26:22.6941851+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A22.6941851Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T09:26:21.6120902Z' },
        { 'UserId': 'cf0e2663-80f5-43ad-89d4-4416a6111521', 'FirstName': 'Inc Hygienist', 'MiddleName': '', 'LastName': 'Inactive', 'PreferredName': '', 'DateOfBirth': null, 'UserName': 'inchyg@pattcom.onmicrosoft.com', 'UserCode': 'INAIN3', 'Color': '#7F7F7F', 'ImageFile': '', 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'inchyg@email.com', 'Address': { 'AddressLine1': '', 'AddressLine2': '', 'City': '', 'State': '', 'ZipCode': '' }, 'DepartmentId': null, 'JobTitle': '', 'ProviderTypeId': 2, 'TaxId': '', 'FederalLicense': '', 'DeaNumber': '', 'NpiTypeOne': '', 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': '', 'AnesthesiaId': '', 'IsActive': false, 'StatusChangeNote': null, 'ProfessionalDesignation': 'Hygienist of PAT Com', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T09:26:38.2970666+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A38.2970666Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T09:26:37.2170122Z' },
        { 'UserId': '444842d4-1e9e-4183-b290-a27a8a5f9351', 'FirstName': 'Inc Other', 'MiddleName': '', 'LastName': 'Inactive', 'PreferredName': '', 'DateOfBirth': null, 'UserName': 'incoth@pattcom.onmicrosoft.com', 'UserCode': 'INAIN4', 'Color': '#7F7F7F', 'ImageFile': '', 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'incoth@email.com', 'Address': { 'AddressLine1': '', 'AddressLine2': '', 'City': '', 'State': '', 'ZipCode': '' }, 'DepartmentId': null, 'JobTitle': '', 'ProviderTypeId': 5, 'TaxId': '', 'FederalLicense': '', 'DeaNumber': '', 'NpiTypeOne': '', 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': '', 'AnesthesiaId': '', 'IsActive': false, 'StatusChangeNote': null, 'ProfessionalDesignation': 'Inactive Other of PA', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T09:26:57.6304013+00:00","RowVersion":"W/\\"datetime\'2015-09-30T09%3A26%3A57.6304013Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T09:26:56.2933199Z' },
        { 'UserId': '451b2356-6833-4e42-9681-e1bf042a9e5b', 'FirstName': 'RK Blank', 'MiddleName': null, 'LastName': 'RKbla', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'RKbla@pattcom.onmicrosoft.com', 'UserCode': 'RKBRK1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'RKbla@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': null, 'JobTitle': null, 'ProviderTypeId': null, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-29T08:43:12.3159591+00:00","RowVersion":"W/\\"datetime\'2015-09-29T08%3A43%3A12.3159591Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-29T08:43:11.5361316Z' },
        { 'UserId': '0fa21181-8d2e-454d-9dcd-ffb33f95bfa5', 'FirstName': 'RK Dentist', 'MiddleName': '', 'LastName': 'RKDen', 'PreferredName': '', 'DateOfBirth': null, 'UserName': 'RKDEN@pattcom.onmicrosoft.com', 'UserCode': 'RKDRK1', 'Color': '#7F7F7F', 'ImageFile': '', 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'rkden@email.com', 'Address': { 'AddressLine1': '', 'AddressLine2': '', 'City': '', 'State': '', 'ZipCode': '' }, 'DepartmentId': null, 'JobTitle': '', 'ProviderTypeId': 1, 'TaxId': '', 'FederalLicense': '', 'DeaNumber': '', 'NpiTypeOne': '', 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': '', 'AnesthesiaId': '', 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': '', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T11:43:57.6941016+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A43%3A57.6941016Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T11:43:56.5618443Z' },
        { 'UserId': '227cf131-5210-4944-98cf-788c9f4f51f8', 'FirstName': 'RK Hygienist', 'MiddleName': '', 'LastName': 'Rkhyg', 'PreferredName': '', 'DateOfBirth': null, 'UserName': 'rkhyg@pattcom.onmicrosoft.com', 'UserCode': 'RKHRK1', 'Color': '#7F7F7F', 'ImageFile': '', 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'rkhyg@email.com', 'Address': { 'AddressLine1': '', 'AddressLine2': '', 'City': '', 'State': '', 'ZipCode': '' }, 'DepartmentId': null, 'JobTitle': '', 'ProviderTypeId': 2, 'TaxId': '', 'FederalLicense': '', 'DeaNumber': '', 'NpiTypeOne': '', 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': '', 'AnesthesiaId': '', 'IsActive': false, 'StatusChangeNote': null, 'ProfessionalDesignation': '', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T11:32:21.7375333+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A32%3A21.7375333Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T11:32:20.5137411Z' },
        { 'UserId': '29691744-6de7-4679-bb55-824a51d4df58', 'FirstName': 'RK NotP', 'MiddleName': null, 'LastName': 'Rknotp', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'Rknotp@pattcom.onmicrosoft.com', 'UserCode': 'RKNRK1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'Rknotp@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': null, 'JobTitle': null, 'ProviderTypeId': 4, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-29T08:41:35.9948486+00:00","RowVersion":"W/\\"datetime\'2015-09-29T08%3A41%3A35.9948486Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-29T08:41:34.9463004Z' },
        { 'UserId': '3398f3b4-b261-4c9b-aa13-59bf0127f488', 'FirstName': 'RK Other', 'MiddleName': '', 'LastName': 'RKOther', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'RKOther@pattcom.onmicrosoft.com', 'UserCode': 'RKORK1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'RKOther@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': null, 'JobTitle': null, 'ProviderTypeId': 5, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-29T08:39:45.049056+00:00","RowVersion":"W/\\"datetime\'2015-09-29T08%3A39%3A45.049056Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-29T08:39:44.0458392Z' },
        { 'UserId': 'cb8cb621-8e1f-4564-9c41-9ffcbc583416', 'FirstName': 'Mary Beth', 'MiddleName': '', 'LastName': 'Swift', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'marybeth.swift@pattcom.onmicrosoft.com', 'UserCode': 'SWIMA1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'User@TenantInfo.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': 1, 'JobTitle': null, 'ProviderTypeId': 1, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-25T05:35:52.9058232+00:00","RowVersion":"W/\\"datetime\'2015-09-25T05%3A35%3A52.9058232Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-25T05:35:51.577119Z' },
        { 'UserId': 'ffbf6738-06a9-4438-b6b0-ceac9ad78fd1', 'FirstName': 'Hour', 'MiddleName': null, 'LastName': 'Test', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'hourtest123@pattcom.onmicrosoft.com', 'UserCode': 'TESHO1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'hourtest@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': null, 'JobTitle': null, 'ProviderTypeId': 4, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T06:43:15.7153229+00:00","RowVersion":"W/\\"datetime\'2015-09-30T06%3A43%3A15.7153229Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T06:43:14.3781493Z' },
        { 'UserId': '81f90124-b912-49f8-b5f2-092156cf7800', 'FirstName': 'Aaron', 'MiddleName': 'T', 'LastName': 'Tester', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'AaronTester@pattcom.onmicrosoft.com', 'UserCode': 'TESAA1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'sadgasd@asdfg.dsaf', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': null, 'JobTitle': null, 'ProviderTypeId': 4, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-29T16:56:07.5504077+00:00","RowVersion":"W/\\"datetime\'2015-09-29T16%3A56%3A07.5504077Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-29T16:56:05.8548252Z' },
        { 'UserId': '3a9e0fb7-74f2-4ab3-859b-afbe3d19ffb8', 'FirstName': 'Harry', 'MiddleName': null, 'LastName': 'User', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'HarryUser@pattcom.onmicrosoft.com', 'UserCode': 'USEHA1', 'Color': '#00a2e8', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'Harry@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': 1, 'JobTitle': 'Dentist', 'ProviderTypeId': 1, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': false, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T12:44:35.9872305+00:00","RowVersion":"W/\\"datetime\'2015-09-30T12%3A44%3A35.9872305Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T12:44:34.0898085Z' }
    ];
    let mockReferenceDataService: any = {
        get: jasmine.createSpy('referenceDataService.get(users)').and.returnValue(mockProviderList),
        entityNames: {
            users: 'users'
        }
    };

    let mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };
    let practiceService = {
        getCurrentPractice: jasmine.createSpy().and.returnValue({ id: '1' }),
    };
    const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);
    let mockLocalizeService = {
        getLocalizedString: () => 'translated text'
    };
    let mockPatientLandingfactory = {
        setPreferredProvider: jasmine.createSpy(),
    };
    let scheduleFactoryPromise: Promise<any> = new Promise<any>(
        (resolve, reject) => { }
    );
    let mockShowOnScheduleFactory: any = {
        getAll: jasmine.createSpy().and.returnValue(scheduleFactoryPromise),
    };
    let mockListHelper: any = {
        findItemByFieldValue: jasmine.createSpy().and.returnValue({}),
        get: jasmine.createSpy().and.returnValue({}),
    };
    let appointmentServiceProcessingRulesService: any = {
        filterProvidersForServicesWithAppointments: jasmine
            .createSpy()
            .and.returnValue({}),
        get: jasmine.createSpy().and.returnValue({}),
    };

    const mockPatientCommunicationCenterService: any = {
        getPatientCommunicationByPatientId: (a: any) => of([{}]),
        updatePreview: (a: any) => { },
        deletePatientCommunicationById: (a: any) => of({}),
        setCommunicationEvent: (a: any) => of({}),
        getCommunicationEvent: () => of({}),
        GetPatientCommunicationTemplates: () => of({}),
        patientDetail: of({}),
        createAccountNoteCommunication: (a: any, b: any) => of({}),
        updatePatientCommunication: (a: any, b: any) => of({}),
        updatePatientCommunications$: updatePatientCommSubjectMock
    };
    microServiceApiService = {
        getBlueImagingApiUrl: jasmine.createSpy().and.returnValue(blueUrl)
    };

    let referralSources = {
        Value: [
            {
                PatientReferralSourceId: "2df3b05f-d2b4-40fd-86fa-44c93cec7425",
                SourceName: "facebook",
                DataTag: "AAAAAAAAyeE=",
                UserModified: "d0be7456-e01b-e811-b7c1-a4db3021bfa0",
                DateModified: "2020-02-20T11:54:55.5081129"
            }
        ]
    }
    const mockReferralSourcesService = {
        get: jasmine.createSpy('ReferralSourcesService.get').and.returnValue({
            $promise: {
                Value: [],
                then: (callback) => {
                    callback({
                        Value:
                            referralSources.Value
                    })
                }
            }
        })
    };

    const mockReferralManagementHttpService = {
        getSources: jasmine.createSpy().and.returnValue({
            then: function (callback) {
                callback(personResult);
            }
        }),
        getPracticeProviders: () => of([]),
    }

    const mockreferenceDataService: any = {
        get: function (x) {
          return [];
        },
        entityNames: {
          users: [],
        },
      };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PatientReferralCrudComponent, EnumAsStringPipe, AgePipe, PhoneNumberPipe, TruncateTextPipe, AppSelectComponent, AppDatePickerComponent],
            imports: [FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), HttpClientTestingModule],
            providers: [DialogService, DialogContainerService, TruncateTextPipe, EnumAsStringPipe,
                { provide: 'ReferralManagementHttpService', useValue: mockpatientReferralsService },
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: BlueImagingService, useValue: blueImagingServiceSpy },
                { provide: '$routeParams', useValue: mockservice },
                { provide: ImagingMasterService, useValue: mockservice },
                { provide: 'PersonFactory', useValue: mockPersonFactory },
                { provide: 'PatientMedicalHistoryAlertsFactory', useValue: patientMedicalHistoryAlertsFactory },
                { provide: PatientHttpService, useValue: mockservice },
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: 'locationService', useValue: mockservice },
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'practiceService', useValue: practiceService },
                { provide: 'ReferralSourcesService', useValue: mockReferralSourcesService },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: PatientCommunicationCenterService, mockPatientCommunicationCenterService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: MicroServiceApiService, useValue: microServiceApiService },
                { provide: PatientReferralPrintService, useValue: mockpatientReferralPrintService },
                { provide: 'ListHelper', useValue: mockListHelper },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: ReferralManagementHttpService, useValue: mockReferralManagementHttpService },
                {
                    provide: AppointmentServiceProcessingRulesService,
                    useValue: appointmentServiceProcessingRulesService,
                },
                {
                    provide: 'PatientLandingFactory',
                    useValue: mockPatientLandingfactory,
                },
                {
                    provide: 'ProviderShowOnScheduleFactory',
                    useValue: mockShowOnScheduleFactory,
                },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                FormBuilder
            ]
        })
            .compileComponents();
    });

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(PatientReferralCrudComponent);
        component = fixture.componentInstance;
        referralManagementHttpService = TestBed.get('ReferralManagementHttpService');
        component.dialog.content.instance.PatientProfile = mockPatientProfile;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // describe('cancelReferral', () => {
    //     it('should close form when cancelReferral called', () => {
    //         component.cancelReferral();
    //     });
    // });

    // describe('getPatientInformation', () => {
    //     it('should get patient information when getPatientInformation called', () => {
    //         component.getPatientInformation();
    //     });
    // });


    // describe('getReferralDirections', () => {
    //     it('should get referral directions when getReferralDirections called', () => {
    //         component.getReferralDirections();
    //     });
    // });

    // describe('getReferralCategories', () => {
    //     it('should get referral categories when getReferralCategories called', () => {
    //         component.getReferralCategories();
    //     });
    // });
});

