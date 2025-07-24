import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockRepository } from '../../payment-types-mock-repo';

import { AdjustmentTypesComponent } from './adjustment-types.component';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';


// // NG15CLEANUP  can fix incrementally after merge to DEV NO TESTS
describe('AdjustmentTypesComponent', () => {
    let component: AdjustmentTypesComponent;
    let fixture: ComponentFixture<AdjustmentTypesComponent>;
    let mockRepo: any;
    let mockTostarfactory;
    let mockAdjustmentTypesService;
    let mockProviderList;
    let mockreferenceDataService;
    let userContextSpy;
    let mockplatformSessionCachingService;


    beforeEach(async () => {
        mockRepo = MockRepository();

        mockTostarfactory = {
            error: jasmine.createSpy().and.returnValue('Error Message'),
            success: jasmine.createSpy().and.returnValue('Success Message')

        };
        mockAdjustmentTypesService = {
            GetAdjustmentTypeAssociatedWithTransactions: () => { },
            GetAllAdjustmentTypesWithOutCheckTransactions: () => { }
        };
        mockProviderList = [
            { 'UserId': 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e', 'FirstName': 'RK Assist', 'MiddleName': null, 'LastName': 'Assitant', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'raks@pattcom.onmicrosoft.com', 'UserCode': 'ASSRK1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'rkas@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': null, 'JobTitle': null, 'ProviderTypeId': 3, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': 'RK Assist Pat Soar C', 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T11:50:18.2199196+00:00","RowVersion":"W/\\"datetime\'2015-09-30T11%3A50%3A18.2199196Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T11:50:16.9153383Z' },
            { 'UserId': '43189973-d808-4fd1-a8cc-fabf84c9f18f', 'FirstName': 'Terra', 'MiddleName': 'D', 'LastName': 'Data', 'PreferredName': null, 'DateOfBirth': null, 'UserName': 'terradata123@pattcom.onmicrosoft.com', 'UserCode': 'DATTE1', 'Color': '#7F7F7F', 'ImageFile': null, 'EmployeeStartDate': null, 'EmployeeEndDate': null, 'Email': 'terra@email.com', 'Address': { 'AddressLine1': null, 'AddressLine2': null, 'City': null, 'State': null, 'ZipCode': null }, 'DepartmentId': 1, 'JobTitle': 'Dental surgeon', 'ProviderTypeId': 1, 'TaxId': null, 'FederalLicense': null, 'DeaNumber': null, 'NpiTypeOne': null, 'PrimaryTaxonomyId': null, 'SecondaryTaxonomyId': null, 'StateLicense': null, 'AnesthesiaId': null, 'IsActive': true, 'StatusChangeNote': null, 'ProfessionalDesignation': null, 'Locations': null, 'DataTag': '{"Timestamp":"2015-09-30T14:26:13.9041626+00:00","RowVersion":"W/\\"datetime\'2015-09-30T14%3A26%3A13.9041626Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '2015-09-30T14:26:12.1070625Z' },
        ];
        mockreferenceDataService = {
            get: jasmine.createSpy('referenceDataService.get(users)').and.returnValue(mockProviderList),
            entityNames: {
                users: []
            }
        };
        userContextSpy = jasmine.createSpy().and.returnValue({ Result: { User: { UserId: 'testUserId' } } });
        mockplatformSessionCachingService = {
            userContext: { get: userContextSpy }
        };

        await TestBed.configureTestingModule({
            declarations: [AdjustmentTypesComponent],
            providers: [
                { provide: 'localize', useValue: mockRepo.mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: AdjustmentTypesService, useValue: mockAdjustmentTypesService },
                { provide: 'patSecurityService', useValue: mockRepo.mockpatSecurityService },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'platformSessionCachingService', useValue: mockplatformSessionCachingService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdjustmentTypesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});

