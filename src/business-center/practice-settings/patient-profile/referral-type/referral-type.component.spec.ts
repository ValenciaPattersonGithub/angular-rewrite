import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockRepository } from './referral-type-mock-repo';
import { ReferralTypeComponent } from './referral-type.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchPipe, HighlightTextIfContainsPipe, OrderByPipe } from 'src/@shared/pipes';
import { DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SelectEvent } from '@progress/kendo-angular-layout';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { ReferralType } from './referral-type.model';
import { TranslateModule } from '@ngx-translate/core';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { HttpClient } from '@microsoft/signalr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

let localize;
let referralTypesService;
let patSecurityService;
let toastrFactory;
let referenceDataService: any;
let dialogservice: DialogService;
let practiceService: any;

describe('ReferralTypeComponent', () => {
    let component: ReferralTypeComponent;
    let fixture: ComponentFixture<ReferralTypeComponent>;
    const defaultOrderKey = 'Description';
    let httpClient: HttpClient;

    let mockPracticeService = {
        getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 1 })
    };

    const mockTostarfactory = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')

    };
    var mockProviderList = [
        { 'UserId': 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e', 'FirstName': 'RK Assist', 'MiddleName': null, 'LastName': 'Assitant', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'raks@pattcom.onmicrosoft.com', 'UserCode': 'ASSRK1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'rkas@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': null, 'JobTitle': null, 'ProviderTypeId': 3, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': 'RK Assist Pat Soar C', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T11:50:18.2199196+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A50%3A18.2199196Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T11:50:16.9153383Z' },
        { 'UserId': '43189973-d808-4fd1-a8cc-fabf84c9f18f', 'FirstName': 'Terra', 'MiddleName': 'D', 'LastName': 'Data', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'terradata123@pattcom.onmicrosoft.com', 'UserCode': 'DATTE1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'terra@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': 1, 'JobTitle': 'Dental surgeon', 'ProviderTypeId': 1, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T14:26:13.9041626+00:00","RowVersion":"W/\\"datetime\'2015-09-30T14%3A26%3A13.9041626Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T14:26:12.1070625Z' },

    ];
    const users = 'users';
    let mockreferenceDataService: any = {
        get: jasmine.createSpy('referenceDataService.get(users)').and.returnValue(mockProviderList),
        entityNames: {
            users: []
        }
    };

    let mockFeatureFlagService = {
        getOnce$: jasmine
            .createSpy('FeatureFlagService.getOnce$')
            .and.returnValue(of(true)),
    };

    let mockPlatformSessionCachingService = {
        userContext: {
            get: jasmine.createSpy().and.returnValue({
                Result: {
                    User: {
                        UserId: 3
                    }
                }
            })
        }
    };

    beforeEach(async () => {

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, TranslateModule.forRoot()],
            declarations: [ReferralTypeComponent, OrderByPipe],
            providers: [
                DialogService,
                DialogContainerService,
                ReferralManagementHttpService,
                HttpClient,
                { provide: 'localize', useValue: MockRepository.mockLocalizeService },
                { provide: 'ReferralTypeService', useValue: MockRepository.mockreferralTypeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'patSecurityService', useValue: MockRepository.mockpatSecurityService },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'ReferralSourcesService', useValue: {} },
                { provide: 'platformSessionCachingService', useValue: mockPlatformSessionCachingService },
                { provide: 'practiceService', useValue: mockPracticeService },
                { provide: 'SoarConfig', useValue: {} },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
            ],

        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReferralTypeComponent);
        component = fixture.componentInstance;
        referralTypesService = TestBed.get('ReferralTypeService');
        patSecurityService = TestBed.get('patSecurityService');
        referenceDataService = TestBed.get('patSecurityService');
        dialogservice = TestBed.get(DialogService);
        httpClient = TestBed.inject(HttpClient);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('ngOnInit', () => {
        it('should call GetAllReferralTypesAsync function with valid paramter', () => {
            spyOn(referralTypesService, 'GetAllReferralTypesAsync').and.returnValue(Promise.resolve(MockRepository.mockReferralTypesList));

            referralTypesService.GetAllReferralTypesAsync()
                .then((result: SoarResponse<ReferralType[]>) => {
                    component.getAllReferralTypeSuccess(result);
                    expect(component.referralType).toBeDefined();
                });
        });

        it('should call GetAllReferralTypesAsync function with invalid paramter', () => {
            spyOn(referralTypesService, 'GetAllReferralTypesAsync').and.returnValue(Promise.reject({ reason: 'reject' }));
            referralTypesService.GetAllReferralTypesAsync()
                .then((result: SoarResponse<ReferralType[]>) => {
                }, () => {
                    component.getAllReferralTypeFailure();
                });
        });
    });

    describe('addReferralType', () => {
        it('should add Referral Type', () => {
            const event: SelectEvent = new SelectEvent(1, '');
            component.hasCreateAccess = true;
            component.defaultOrderKey = 'Description';
            spyOn(dialogservice, 'open').and.returnValue({ content: { instance: {} }, result: of(MockRepository.mockNewReferralType) });
            component.showReferralForm();
        });
    });

});
