import { SimpleChanges } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { ProfileSectionComponent } from '../../../@shared/components/profile-section/profile-section.component';
import { SearchBarAutocompleteComponent } from '../../../@shared/components/search-bar-autocomplete/search-bar-autocomplete.component';
import { SoarSelectListComponent } from '../../../@shared/components/soar-select-list/soar-select-list.component';
import { AppKendoUIModule } from '../../../app-kendo-ui/app-kendo-ui.module';
import { ServiceCodeCrudComponent } from './service-code-crud.component';
import cloneDeep from 'lodash/cloneDeep';
import { ServiceFeesByLocationComponent } from '../service-fees-by-location/service-fees-by-location.component';
import { SmartCodeSetupComponent } from '../smart-code-setup/smart-code-setup.component';
import { SwiftpickCodeCrudComponent } from '../swiftpick-code-crud/swiftpick-code-crud.component';
import { SearchBarAutocompleteByIdComponent } from '../../../@shared/components/search-bar-autocomplete-by-id/search-bar-autocomplete-by-id.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CdtCodeService } from '../../../@shared/providers/cdt-code.service';
import { ServiceCodesService } from 'src/@shared/providers/service-codes.service';
import { PreventiveCareService } from 'src/@shared/providers/preventive-care.service';
import { PreventiveLinkedServices, ServiceCodeModel } from '../service-code-model';
import { ServiceSwiftCodeService } from '../service-swift-code-service/service-swift-code.service';
import { NewStandardServiceModel } from 'src/@shared/models/new-standard-service.model';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';
import { ConditionsService } from 'src/@shared/providers/conditions.service';

//mockServiceCode data which we are going to set service codes data
let mockServiceCodes: ServiceCodeModel[] = [
    {
        $$AffectedAreaName: "Mouth",
        $$Dirty: false,
        $$FeeString: "0.00",
        $$IsActiveName: "Active",
        $$IsActiveNo: false,
        $$IsActiveYes: true,
        $$IsEligibleForDiscountName: "Yes",
        $$IsEligibleForDiscountNo: false,
        $$IsEligibleForDiscountYes: true,
        $$OriginalAffectedAreaId: "1",
        $$SubmitOnInsuranceName: "Yes",
        $$SubmitOnInsuranceNo: false,
        $$SubmitOnInsuranceYes: true,
        $$UsuallyPerformedByProviderTypeName: "Dentist",
        $$hashKey: "object:885",
        $$locationFee: 0,
        $$locationTaxableServiceTypeId: 1,
        $$serviceTransactionFee: 0,
        AffectedAreaId: 1,
        AffectedAreaName: null,
        AmaDiagnosisCode: null,
        CPT: null,
        CdtCodeId: null,
        CdtCodeName: "",
        Code: "ServiceCodeCode",
        CompleteDescription: null,
        DataTag: "ServiceCodeDataTag",
        DateModified: "2022-07-20T11:50:09.3773119",
        Description: "e5679i",
        DisplayAs: "!@#$++--",
        DrawTypeDescription: null,
        DrawTypeId: "525",
        IconName: "",
        InactivationDate: null,
        InactivationRemoveReferences: false,
        IsActive: true,
        IsEligibleForDiscount: true,
        IsSwiftPickCode: false,
        LastUsedDate: null,
        LocationSpecificInfo: [],
        Modifications: [],
        Modifier: null,
        Notes: "",
        PracticeId: 322,
        ServiceCodeId: "1",
        ServiceTypeDescription: "01111tes",
        ServiceTypeId: "1",
        SetsToothAsMissing: false,
        SmartCode1Id: null,
        SmartCode2Id: null,
        SmartCode3Id: null,
        SmartCode4Id: null,
        SmartCode5Id: null,
        SubmitOnInsurance: true,
        SwiftPickServiceCodes: null,
        TimesUsed: 0,
        UseCodeForRangeOfTeeth: false,
        UseSmartCodes: false,
        UserModified: "215de079-e9d0-4e07-912b-f7eabc6b038e",
        UsuallyPerformedByProviderTypeId: 1,
        UsuallyPerformedByProviderTypeName: null,
    },
    {
        $$AffectedAreaName: "Tooth",
        $$Dirty: false,
        $$FeeString: "0.00",
        $$IsActiveName: "Active",
        $$IsActiveNo: false,
        $$IsActiveYes: true,
        $$IsEligibleForDiscountName: "Yes",
        $$IsEligibleForDiscountNo: false,
        $$IsEligibleForDiscountYes: true,
        $$OriginalAffectedAreaId: "101",
        $$SubmitOnInsuranceName: "Yes",
        $$SubmitOnInsuranceNo: false,
        $$SubmitOnInsuranceYes: true,
        $$UsuallyPerformedByProviderTypeName: "Dentist",
        $$hashKey: "object:885",
        $$locationFee: 0,
        $$locationTaxableServiceTypeId: 1,
        $$serviceTransactionFee: 0,
        TaxableServiceTypeId: 60,
        AffectedAreaId: 1010,
        AffectedAreaName: null,
        AmaDiagnosisCode: null,
        CPT: null,
        CdtCodeId: null,
        CdtCodeName: "",
        Code: "!@#$++--",
        CompleteDescription: null,
        DataTag: "AAAAAATNeYg=",
        DateModified: "2022-07-20T11:50:09.3773119",
        Description: "e5679i",
        DisplayAs: "!@#$++--",
        DrawTypeDescription: null,
        DrawTypeId: "111",
        IconName: "",
        InactivationDate: null,
        InactivationRemoveReferences: false,
        IsActive: true,
        IsEligibleForDiscount: true,
        IsSwiftPickCode: false,
        LastUsedDate: null,
        LocationSpecificInfo: [],
        Modifications: [],
        Modifier: null,
        Notes: "",
        PracticeId: 322,
        ServiceCodeId: "2",
        ServiceTypeDescription: "01111tes",
        ServiceTypeId: "b1a248f8-4200-4248-bf04-697a66b95724",
        SetsToothAsMissing: false,
        SmartCode1Id: null,
        SmartCode2Id: null,
        SmartCode3Id: null,
        SmartCode4Id: null,
        SmartCode5Id: null,
        SubmitOnInsurance: true,
        SwiftPickServiceCodes: [{
            AffectedAreaId: 1,
            CdtCodeName: "OldCdtCodeName",
            Code: "OldCode",
            DataTag: "OldDataTag",
            DateModified: "2022-09-23T19:20:42.7066804",
            Description: "OldDescription",
            DisplayAs: "Modify - Log Ver",
            ServiceCodeId: "1",
            SwiftPickCodeId: "36dea4d5-3abf-4155-8a85-44bfbd763e5b",
            SwiftPickServiceCodeId: "1aed9dc0-1d15-454a-8896-467a565b01ff",
            UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
            UsuallyPerformedByProviderTypeId: 1
        }],
        TimesUsed: 0,
        UseCodeForRangeOfTeeth: false,
        UseSmartCodes: false,
        UserModified: "215de079-e9d0-4e07-912b-f7eabc6b038e",
        UsuallyPerformedByProviderTypeId: 1,
        UsuallyPerformedByProviderTypeName: null,
    },
    {
        AffectedAreaId: 0,
        AffectedAreaName: null,
        AmaDiagnosisCode: null,
        CPT: null,
        CdtCodeId: null,
        CdtCodeName: "",
        Code: "AArea",
        CompleteDescription: null,
        DataTag: "AAAAABVgTro=",
        DateModified: "2022-10-18T09:15:11.3009155Z",
        Description: "Affected Areasss",
        DisplayAs: "Affected Areas",
        DrawTypeDescription: null,
        DrawTypeId: null,
        IconName: null,
        InactivationDate: null,
        InactivationRemoveReferences: false,
        IsActive: true,
        IsEligibleForDiscount: false,
        IsSwiftPickCode: true,
        LastUsedDate: null,
        SwiftPickServiceCodes: [{
            AffectedAreaId: 1,
            CdtCodeName: "",
            Code: "VSCALR",
            DataTag: "AAAAABVEMYc=",
            DateModified: "2022-09-23T19:20:42.7066804",
            Description: "This is for verify the activity log report! Modified",
            DisplayAs: "Modify - Log Ver",
            ServiceCodeId: "8bd0216b-5146-477b-ba4c-b21c99b1c82a",
            SwiftPickCodeId: "36dea4d5-3abf-4155-8a85-44bfbd763e5b",
            SwiftPickServiceCodeId: "1aed9dc0-1d15-454a-8896-467a565b01ff",
            UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
            UsuallyPerformedByProviderTypeId: 1
        }],

    }
]

let serviceCode = {
    ServiceCodeId: 1,
    CdtCodeId: 2,
    Code: 'myCode2',
    Description: 'myDescription2',
    ServiceTypeId: 2,
    DisplayAs: 'customName2',
    Fee: '44',
    TaxableServiceTypeId: 0,
    AffectedAreaId: 0,
    UsuallyPerformedByProviderTypeId: '',
    UseCodeForRangeOfTeeth: false,
    SetsToothAsMissing: false,
    IsActive: true,
    IsEligibleForDiscount: false,
    Notes: 'myNotes2',
    SubmitOnInsurance: true,
    IconName: null,
    UseSmartCodes: true,
    SmartCode1Id: 1,
    SmartCode2Id: null,
    SmartCode3Id: null,
    SmartCode4Id: null,
    SmartCode5Id: null,
};

let data = {
    ServiceCode: {},
    ServiceTypes: {},
    TaxableServices: {},
    AffectedAreas: {},
    DrawTypes: {},
    UsuallyPerformedByProviderTypes: {},
    PreventiveServices: {
        values: {}
    },
    Favorites: {
        values: {}
    },
    SwiftCodes: {
        values: {}
    }
};

data.ServiceCode = {
    ServiceCodeId: 1,
    CdtCodeId: 1,
    Code: 'myCode',
    Description: 'myDescription',
    ServiceTypeId: 1,
    DisplayAs: 'customName',
    Fee: '10.6',
    TaxableServiceTypeId: 0,
    AffectedAreaId: 0,
    UsuallyPerformedByProviderTypeId: '',
    UseCodeForRangeOfTeeth: false,
    SetsToothAsMissing: false,
    IsActive: true,
    IsEligibleForDiscount: false,
    Notes: 'myNotes',
    SubmitOnInsurance: true,
    IconName: null,
    UseSmartCodes: false,
    SmartCode1Id: 1,
    SmartCode2Id: null,
    SmartCode3Id: null,
    SmartCode4Id: null,
    SmartCode5Id: null,
};

data.PreventiveServices.values = [{ 
    DataTag: "DataTag",
    DateModified: "DateModified",
    FailedMessage: "FailedMessage",
    PreventiveServiceId: "1",
    PreventiveServiceTypeId: "PreventiveServiceTypeId",
    ServiceCodeId: "ServiceCodeId",
    UserModified: "",
    Description:"Description"
}]

data.Favorites.values = [{
    DataTag: "DataTag",
    DateModified: "DateModified",
    FailedMessage: "FailedMessage",
    PreventiveServiceId: "1",
    PreventiveServiceTypeId: "PreventiveServiceTypeId",
    ServiceCodeId: "ServiceCodeId",
    UserModified: ""
}]

let swiftPickServiceCodesDummyList = [
    { "ServiceCodeId": "00000000-0000-0000-0000-000000000001" },
    { "ServiceCodeId": "00000000-0000-0000-0000-000000000002" }
];
let swiftCode = {
    Data: {
        SwiftPickServiceCodes: [],
        IsActive: true
    }
}

data.SwiftCodes.values = [{ "ServiceCodeId": "00000000-0000-0000-0000-000000000001" },
{ "ServiceCodeId": "00000000-0000-0000-0000-000000000002" }];
//serviceTypes data
data.ServiceTypes = [
    { "ServiceTypeId": "e928ed50-1c73-4836-8a07-11d4ac39e947", "IsSystemType": true, "Description": "Adjunctive General Services", "IsAssociatedWithServiceCode": false },
    { "ServiceTypeId": "c44c441e-d3c5-47ff-83b3-617e7c59804c", "IsSystemType": false, "Description": "custom servicetype", "IsAssociatedWithServiceCode": false },
    { "ServiceTypeId": "9f8e66fa-350b-4970-8dfa-873a69e7f10f", "IsSystemType": false, "Description": "custom servicetype2", "IsAssociatedWithServiceCode": false },
    { "ServiceTypeId": "cc08eb08-425d-43af-9d9d-ce976a208489", "IsSystemType": true, "Description": "Diagnostic", "IsAssociatedWithServiceCode": false }
];

//taxableServices data
data.TaxableServices =
    [
        { "Id": 0, "Name": "Not A Taxable Service", "Order": 1, "IsVisible": false, "IsActive": false },
        { "Id": 1, "Name": "Provider", "Order": 2, "IsVisible": false, "IsActive": false },
        { "Id": 2, "Name": "Sales and Use", "Order": 3, "IsVisible": false, "IsActive": false }
    ];

//affectedAreas data
data.AffectedAreas = [
    { "Id": 0, "Name": "Mouth", "Order": 1, "IsVisible": false, "IsActive": false },
    { "Id": 1, "Name": "Quadrant", "Order": 2, "IsVisible": false, "IsActive": false },
    { "Id": 2, "Name": "Root", "Order": 3, "IsVisible": false, "IsActive": false },
    { "Id": 3, "Name": "Surface", "Order": 4, "IsVisible": false, "IsActive": false },
    { "Id": 4, "Name": "Tooth", "Order": 5, "IsVisible": false, "IsActive": false }
];

//serviceTypes data
data.DrawTypes = [
    { DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730", Description: "DrawTypeOne", AffectedAreaId: 5, DrawType: "Static" },
    { DrawTypeId: "cdc35f12-ecb6-555c-99d3-ebb6ea163731", Description: "DrawTypeTwo", AffectedAreaId: 4, DrawType: "Static" },
    { DrawTypeId: "9dc35f12-ecb6-552c-99d3-ebb6ea163730", Description: "DrawTypeThree", AffectedAreaId: 5, DrawType: "Static" },
    { DrawTypeId: "cdc35f12-ecb6-542c-99d3-ebb6ea163732", Description: "DrawTypeFour", AffectedAreaId: 3, DrawType: "Static" }
];

//providerTypes data
data.UsuallyPerformedByProviderTypes = [
    { "ProviderTypeId": 4, "Name": "Not a Provider", "Order": 1, "IsAppointmentType": false },
    { "ProviderTypeId": 1, "Name": "Dentist", "Order": 2, "IsAppointmentType": true },
    { "ProviderTypeId": 2, "Name": "Hygienist", "Order": 3, "IsAppointmentType": true },
    { "ProviderTypeId": 3, "Name": "Assistant", "Order": 4, "IsAppointmentType": false },
    { "ProviderTypeId": 5, "Name": "Other", "Order": 5, "IsAppointmentType": false }
];


let header = [
    {
        label: "Included In",
        filters: false,
        sortable: false,
        sorted: false,
        size: 'col-sm-6 cell'
    },
    {
        label: "Frequency",
        filters: false,
        sortable: false,
        sorted: false,
        size: 'col-sm-6 cell'
    }
];
let headerCategories = [
    {
        label: "Preventive Care",
        show: false,
        data: "PreventiveServices",
        field: "PreventiveServiceTypeId",
        header: [
            {
                label: "Preventive Care Categories",
                filters: false,
                sortable: false,
                sorted: false,
                size: 'col-md-offset-1 col-sm-11 cell'
            }
        ]
    },
    {
        label: "Group Care",
        show: false,
        data: "Favorites",
        field: "FavoritesTypeId",
        header: [
            {
                label: "Group Care Categories",
                filters: false,
                sortable: false,
                sorted: false,
                size: 'col-md-offset-1 col-sm-11 cell'
            }
        ]
    },
    {
        label: "Swift Codes",
        show: false,
        data: "SwiftCodes",
        field: "Code",
        header: [
            {
                label: "Swift Code Name",
                filters: false,
                sortable: false,
                sorted: false,
                size: 'col-md-offset-1 col-sm-11 cell'
            }
        ]
    }
];

let mockModalFactory = {
    CancelModal: jasmine
        .createSpy('ModalFactory.CancelModal')
        .and.returnValue({ then: () => { } }),
    ConfirmModal: jasmine.createSpy('ModalFactory.ConfirmModal').and.returnValue({ then: (res) => ({res:"" }) })
}

let referenceDataService = {
    forceEntityExecution: jasmine.createSpy(),
    setFeesByLocation: jasmine.createSpy(),
    get: jasmine.createSpy(),
    entityNames: {
        serviceTypes: 'serviceTypes',
        serviceCodes: 'serviceCodes'
    }
};

let mockLocation = {
    path: jasmine.createSpy().and.returnValue({}), get: jasmine.createSpy().and.returnValue({})
};

const mockLocalizeService = {
    getLocalizedString: () => 'translated text'
};
const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};
//mock for patSecurityService
const patSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy("patSecurityService.IsAuthorizedByAbbreviation").and.returnValue(true),
    generateMessage: jasmine.createSpy("patSecurityService.generateMessage")
};

const mockPreventiveCareService = {
    GetPreventiveServicesForServiceCode: (CDTServiceResponse) => {
        return {
            then: (res) => {
                res({ Value: mockServiceCodes })
            }
        }
    },
    RemovePreventiveServiceById: (PreventiveServiceTypeId, PreventiveServiceId) => {
        return {
            then: (res) => {
                res({ Value: PreventiveServiceId })
            }
        }
    },
    accessForServiceType: jasmine.createSpy(),
    prevCareItems: jasmine.createSpy().and.returnValue(Promise.resolve(true))
}

const mockCdtCodeResult = [{ "CdtCodeId": "006b48e7-95eb-4215-be3d-392a1ade990a", "Code": "D7820", "Description": "closed reduction of dislocation", "DisplayAs": "", "ServiceTypeId": "2f3d06e1-16c5-433e-b090-728b5c089eab", "SubmitOnInsurance": true, "TaxableServiceTypeId": 1, "AffectedAreaId": 1 }];

const mockServiceReturnWrapper = {
    Value: mockCdtCodeResult,
    Count: 1
};

const mockServiceReturnWrapperNoCdtCodes = {
    Value: null,
    Count: 0
};
let CDTServiceResponse = {
    Value: [{
        Code: "selectedCdtCode",
        CdtCodeId: "selectedCdtCodeId",
        ServiceTypeId: "ServiceTypeId",
        TaxableServiceTypeId: 2,
        Id: 1,
        Description: "Type1",
        DisplayAs: "Type1",
        AffectedAreaId: 1,
        DataTag: "DataTag",
        DateModified: "DateModified",
        IconName: "",
        SubmitOnInsurance: false,
        UserModified: ""
    }, {
            Code: "selectedCdtCode",
            CdtCodeId: "selectedCdtCodeId",
            ServiceTypeId: "",
            TaxableServiceTypeId: null,
            Id: 1,
            Description: "Type1",
            DisplayAs: "Type1",
            AffectedAreaId: null,
            DataTag: "DataTag",
            DateModified: "DateModified",
            IconName: "",
            SubmitOnInsurance: false,
            UserModified: ""
        }]
}
let mockCdtCodeService = {  
    search: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
            resolve({ Value: CDTServiceResponse }),
                reject({});
        })
    }) ,
    IsValid: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
            resolve({ Value: CDTServiceResponse }),
                reject({});
        });
    }),
    getList: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
            resolve({ Value: CDTServiceResponse }),
                reject({});
        });
    }),
};

const mockCacheFactory = {
    GetCache: () => new Promise((resolve, reject) => {

    }),
    ClearCache: () => new Promise((resolve, reject) => {

    }),
};


//mock for serviceCodeCrudService
const mockServiceCodeCrudService = {
    Dtos: {
        ServiceCode: jasmine.createSpy().and.returnValue({
            IdField: "ServiceCodeId",
            ObjectName: "ServiceCode",
            Operations:
            {
                Create: jasmine.any(Function),
                Retrieve: jasmine.any(Function),
                Update: jasmine.any(Function),
                delete: jasmine.any(Function),
                get: jasmine.any(Function),
                query: jasmine.any(Function),
                remove: jasmine.any(Function),
                save: jasmine.any(Function)
            },
            IsValid: jasmine.any(Function)
        })
    }
}

const mockChartingFavoritesFactory = {
    GetAllFavoritesContainingServiceId: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy()
    })
};

//For mock feature service related with Profile Section component
const mockFeaturService = {
    isEnabled: () => new Promise((resolve, reject) => {
    }),
};

const mockServiceCodesService = {
    checkForServiceCodeUsage: (serviceCodeId) => {
        return {
            then: (res) => {
                let tempData = [];
                tempData.push(serviceCode)
                let a = tempData.filter(x => x["serviceCodeId"] == serviceCodeId);
                if (a.length > 0) {
                    res({ Value: true })
                }
                else {
                    res({ Value: false })
                }                
            }
        }
    },
    getSwiftCodesAttachedToServiceCode: (serviceCodeId) => {
        return {
            then: (res) => {
                res({ Value: swiftCodeData })
            }
        }
    }
};


let changes: SimpleChanges = {
    initialData: {
        currentValue: serviceCode,
        previousValue: null,
        firstChange: false,
        isFirstChange: () => { return false }
    },
    data: {
        currentValue: data,
        previousValue: serviceCode,
        firstChange: false,
        isFirstChange: () => { return false }
    }
}


let swiftCodeData = {
    "ServiceCodeId": "ServiceCodeId1",
    "CdtCodeId": null, "CdtCodeName": null, "Code": "TestQA29",
    "Description": "TestQA29", "CompleteDescription": null, "ServiceTypeId": null, "ServiceTypeDescription": "Swift Code",
    "DisplayAs": "TestQA29", "AffectedAreaId": 0, "AffectedAreaName": null, "UsuallyPerformedByProviderTypeId": null,
    "UsuallyPerformedByProviderTypeName": null, "UseCodeForRangeOfTeeth": false, "IsActive": true, "IsEligibleForDiscount": false,
    "Notes": null, "SubmitOnInsurance": false, "IsSwiftPickCode": true,    
    "SwiftPickServiceCodes":
        [{
            "SwiftPickServiceCodeId": "0b8a6e75-2503-4bb9-aafa-05cd259aa76d", "SwiftPickCodeId": "d80e13db-d03a-47cd-b74f-e3a90339f66e",
            "ServiceCodeId": "972ac794-de69-4401-b1b9-c9bc4bc5d495", "AffectedAreaId": 5, "DisplayAs": "D9912", "Code": "11111113",
            "CdtCodeName": "D9912", "Description": "pre-visit patient screening", "UsuallyPerformedByProviderTypeId": null,
            "LocationSpecificInfo": [{
                "ServiceCodeId": "ServiceCodeId1", "LocationId": 5053276, "Fee": 0,
                "TaxableServiceTypeId": 1
            },
            { "ServiceCodeId": "ServiceCodeId2", "LocationId": 5369307, "Fee": 0, "TaxableServiceTypeId": 1 },
            { "ServiceCodeId": "ServiceCodeId3", "LocationId": 5369322, "Fee": 0, "TaxableServiceTypeId": 1 },
                { "ServiceCodeId": "ServiceCodeId4", "LocationId": 5369327, "Fee": 0, "TaxableServiceTypeId": 1 }
            ], "DrawTypeId": null, "DrawTypeDescription": null, "TimesUsed": 0, "LastUsedDate": null, "IconName": null,           
            "SetsToothAsMissing": false, "InactivationDate": null,
            "InactivationRemoveReferences": false, "AmaDiagnosisCode": null, "CPT": null, "Modifier": null, "Modifications": [],
            "UseSmartCodes": false, "SmartCode1Id": null, "SmartCode2Id": null, "SmartCode3Id": null, "SmartCode4Id": null, "SmartCode5Id": null,
            "DataTag": "AAAAAAAMi9A=", "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf", "DateModified": "2022-07-27T14:14:27.5959469"
        }],
    "Data": {
        "SwiftPickServiceCodes":
            [{
                "SwiftPickServiceCodeId": "0b8a6e75-2503-4bb9-aafa-05cd259aa76d", "SwiftPickCodeId": "d80e13db-d03a-47cd-b74f-e3a90339f66e",
                "ServiceCodeId": "972ac794-de69-4401-b1b9-c9bc4bc5d495", "AffectedAreaId": 5, "DisplayAs": "D9912", "Code": "11111113",
                "CdtCodeName": "D9912", "Description": "pre-visit patient screening", "UsuallyPerformedByProviderTypeId": null,
                "LocationSpecificInfo": [{
                    "ServiceCodeId": "ServiceCodeId1", "LocationId": 5053276, "Fee": 0,
                    "TaxableServiceTypeId": 1
                },
                { "ServiceCodeId": "ServiceCodeId2", "LocationId": 5369307, "Fee": 0, "TaxableServiceTypeId": 1 },
                { "ServiceCodeId": "ServiceCodeId3", "LocationId": 5369322, "Fee": 0, "TaxableServiceTypeId": 1 },
                { "ServiceCodeId": "ServiceCodeId4", "LocationId": 5369327, "Fee": 0, "TaxableServiceTypeId": 1 }
                ], "DrawTypeId": null, "DrawTypeDescription": null, "TimesUsed": 0, "LastUsedDate": null, "IconName": null,
                "SetsToothAsMissing": false, "InactivationDate": null,
                "InactivationRemoveReferences": false, "AmaDiagnosisCode": null, "CPT": null, "Modifier": null, "Modifications": [],
                "UseSmartCodes": false, "SmartCode1Id": null, "SmartCode2Id": null, "SmartCode3Id": null, "SmartCode4Id": null, "SmartCode5Id": null,
                "DataTag": "AAAAAAAMi9A=", "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf", "DateModified": "2022-07-27T14:14:27.5959469"
            }],"Fee":10,
        "LocationSpecificInfo": [{
            "ServiceCodeId": "ServiceCodeId1", "LocationId": 5053276, "Fee": 0,
            "TaxableServiceTypeId": 1
        }],
        "TaxableServiceTypeId": 1
    } ,
    Save: () => { }
    
}

let mockStandardService = {
    validate: jasmine.createSpy().and.returnValue({
      then: (res, error) => {
        res(true),
          error({})
      }
    }),
    checkDuplicate: jasmine.createSpy().and.returnValue({
      then: (res, error) => {
        res({ Value: true }),
          error({})
      }
    }),
    save: jasmine.createSpy().and.returnValue({
      then: (res, error) => {
        res(mockServiceCodes),
          error({})
      }
    })
  };

  const mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
  };

describe('ServiceCodeCrudComponent', () => {
    let component: ServiceCodeCrudComponent;
    let fixture: ComponentFixture<ServiceCodeCrudComponent>;
    let componentServiceFeesByLocation: ServiceFeesByLocationComponent;
    let fixtureServiceFeesByLocation: ComponentFixture<ServiceFeesByLocationComponent>;
    let componentSmartCode: SmartCodeSetupComponent;
    let fixtureSmartCode: ComponentFixture<SmartCodeSetupComponent>;
    let componentSwiftCode: SwiftpickCodeCrudComponent;
    let fixtureSwiftCode: ComponentFixture<SwiftpickCodeCrudComponent>;
    
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(), AppKendoUIModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule
            ],
            providers: [
                { provide: 'ModalFactory', useValue: mockModalFactory },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'patSecurityService', useValue: patSecurityService },
                { provide: 'referenceDataService', useValue: referenceDataService },
                { provide: 'PatCacheFactory', useValue: mockCacheFactory },
                { provide: '$location', useValue: mockLocation },
                { provide: 'ServiceCodeCrudService', useValue: mockServiceCodeCrudService },
                { provide: CdtCodeService, useValue: mockCdtCodeService },
                { provide: PreventiveCareService, useValue: mockPreventiveCareService },
                { provide: 'ChartingFavoritesFactory', useValue: mockChartingFavoritesFactory },
                { provide: 'FeatureService', useValue: mockFeaturService },
                { provide: ServiceCodesService, useValue: mockServiceCodesService },
                { provide: ServiceSwiftCodeService, useValue: mockStandardService },
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: ConditionsService, useValue: jasmine.createSpyObj<ConditionsService>('ConditionsService', ['get', 'getAll']) },
                { provide: FeatureFlagService, useValue: {
                    getOnce$: jasmine.createSpy().and.returnValue(of(false))
                }}
            ],
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [ServiceCodeCrudComponent, SearchBarAutocompleteComponent, SearchBarAutocompleteByIdComponent, ProfileSectionComponent,
                SoarSelectListComponent]
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ServiceCodeCrudComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ServiceCodeCrudComponent);
        component = fixture.componentInstance;
        fixtureServiceFeesByLocation = TestBed.createComponent(ServiceFeesByLocationComponent);
        componentServiceFeesByLocation = fixtureServiceFeesByLocation.componentInstance;
        fixtureSmartCode = TestBed.createComponent(SmartCodeSetupComponent);
        componentSmartCode = fixtureSmartCode.componentInstance;
        fixtureSwiftCode = TestBed.createComponent(SwiftpickCodeCrudComponent);
        componentSwiftCode = fixtureSwiftCode.componentInstance;
        component.data = data;
        component.swiftCode = swiftCode;
        component.serviceCode.Data = data.ServiceCode;
        component.header = header;
        component.headerCategories = headerCategories;
        fixture.detectChanges();
        fixtureSwiftCode.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    //serviceCodeOnChange
    it('serviceCodeOnChange should reset duplicate flag on service-code value change', () => {
        component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
        component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
        component.serviceCodeOnChange();
        expect(component.serviceCode.IsDuplicate).toEqual(false);
    });


    describe('ngOnChanges ->', () => {
        it('should perform operation if any data change found', () => {
            spyOn(component, 'watchServiceCode');
            component.ngOnChanges(changes);
            expect(component.watchServiceCode).toHaveBeenCalled();
        })
    })

    describe('ngOnInit ->', () => {
        it('should call all ngoninit methods', () => {
            component.hasViewChartButtonAccess = true;
            component.loadHeaderCategories = jasmine.createSpy();
            component.watchServiceCode = jasmine.createSpy();
            component.loadPreventiveServiceTypes = jasmine.createSpy();
            component.getServiceCodes = jasmine.createSpy();
            component.initializeSearch = jasmine.createSpy();
            component.getList = jasmine.createSpy();
            component.setFieldLabels = jasmine.createSpy();
            component.ngOnInit();
            expect(component.loadHeaderCategories).toHaveBeenCalled();
            expect(component.watchServiceCode).toHaveBeenCalled();
            expect(component.loadPreventiveServiceTypes).toHaveBeenCalled();
            expect(component.getServiceCodes).toHaveBeenCalled();
            expect(component.initializeSearch).toHaveBeenCalled();
            expect(component.getList).toHaveBeenCalled();
            expect(component.setFieldLabels).toHaveBeenCalled();
        });

    });

    //cancelChanges

    describe('cancelChanges ->', () => {
        it('cancelChanges should cancel and close the crud screen', () => {
            component.headerCategories = null;
            component.cancelChanges();
            expect(component.displayActiveStatusConfirmation).toBe(false);

            component.headerCategories = headerCategories;
            component.cancelChanges();
            expect(component.displayActiveStatusConfirmation).toBe(false);
        });

        //cancelOnClick
        it('cancelOnClick should set confirmCancel flag to true and not call cancelChanges method', () => {
            spyOn(component, 'cancelChanges');
            component.serviceCodeForm.control.markAsDirty();
            component.cancelOnClick();
            expect(component.cancelChanges).not.toHaveBeenCalled();
        });

        it('cancelOnClick should call cancelChanges method and not set confirmCancel flag', () => {
            spyOn(component, 'cancelChanges');
            component.serviceCodeForm = undefined;
            component.cancelOnClick();
            expect(component.cancelChanges).toHaveBeenCalled();

            component.serviceCodeForm = null;
            component.cancelOnClick();
            expect(component.cancelChanges).toHaveBeenCalled();
        });
    });


    it('on initializeSearch reset all the properties', () => {
         component.initializeSearch();
         expect(component.takeAmount).toEqual(45);
         expect(component.limit).toEqual(15);
         expect(component.limitResults).toEqual(true);
         expect(component.searchString).toEqual("");
         expect(component.resultCount).toEqual(0);
         expect(component.searchTimeout).toBeNull();
    });

    describe('authViewAccess ->', () => {
        it('should call patSecurityService.IsAuthorizedByAbbreviation with \'soar-biz-bsvccd-view\' and return the result', () => {
            let result = component.authViewAccess();
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith("soar-biz-bsvccd-view");
            expect(result).toEqual(true);
        });
    });

    describe('authAccess ->', () => {
         //UT for this method is not possible as it has window.location.href = '/'; which is causing issue
    });

    //notifyNotAuthorized
    describe('notifyNotAuthorized function ->', () => {
        it('should call toastrFactory.error service function', () => {
            let authMessageKey = "Message Key";
            component.notifyNotAuthorized(authMessageKey);
            expect(mockToastrFactory.error).toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalledWith(authMessageKey);
        });
    });

    describe('affectedAreaChange function ->', () => {
        it('should set draw-type-id to null when affected area selection changes and current draw-type-id is not null but matching record for it is not found in updated filteredDrawTypes list', () => {
            component.drawTypes = [
                { DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730", Description: "DrawTypeOne", AffectedAreaId: 5, DrawType: "Static" },
                { DrawTypeId: "cdc35f12-ecb6-555c-99d3-ebb6ea163731", Description: "DrawTypeTwo", AffectedAreaId: 4, DrawType: "Static" },
                { DrawTypeId: "9dc35f12-ecb6-552c-99d3-ebb6ea163730", Description: "DrawTypeThree", AffectedAreaId: 5, DrawType: "Static" },
                { DrawTypeId: "cdc35f12-ecb6-542c-99d3-ebb6ea163732", Description: "DrawTypeFour", AffectedAreaId: 3, DrawType: "Static" }
            ];
            component.serviceCode = {
                Data: {
                    DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730",
                    DrawTypeDescription: 'a data1'
                }
            }
            let affectedArea = {
                Id:5, Name:"Tooth"
            }
            component.soarSelectListComponent = new SoarSelectListComponent();
            component.affectedAreaChange(affectedArea);
            expect(component.serviceCode.Data.DrawTypeDescription).not.toBeNull();
            expect(component.serviceCode.Data.DrawTypeId).not.toBeNull();

            component.affectedAreaChange(false);
            expect(component.serviceCode.Data.DrawTypeDescription).toBeNull();
            expect(component.serviceCode.Data.DrawTypeId).toBeNull();
        });

        it('should not set draw-type-id to null when affected area selection changes and current draw-type-id is not null and matching record for it is found in updated filteredDrawTypes list', () => {
            component.drawTypes = [
                { DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730", Description: "DrawTypeOne", AffectedAreaId: 5, DrawType: "Static" },
                { DrawTypeId: "cdc35f12-ecb6-555c-99d3-ebb6ea163731", Description: "DrawTypeTwo", AffectedAreaId: 4, DrawType: "Static" },
                { DrawTypeId: "9dc35f12-ecb6-552c-99d3-ebb6ea163730", Description: "DrawTypeThree", AffectedAreaId: 5, DrawType: "Static" },
                { DrawTypeId: "cdc35f12-ecb6-542c-99d3-ebb6ea163732", Description: "DrawTypeFour", AffectedAreaId: 3, DrawType: "Static" }
            ];
            component.serviceCode = {
                Data: {
                    DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730",
                    DrawTypeDescription: 'a data1'
                }
            }
            component.soarSelectListComponent = new SoarSelectListComponent();
            component.affectedAreaChange(15);
            expect(component.serviceCode.Data.DrawTypeDescription).toBeNull();
            expect(component.serviceCode.Data.DrawTypeId).toBeNull();
        });
    });

    describe('validateServiceTypeChange -> function', () => {
        beforeEach(() => {
            spyOn(component, 'validateServiceCode');
            component.serviceTypes = [{ Description: 'option1', ServiceTypeId: "1111" }, { Description: 'option2', ServiceTypeId: "1234" }];          
        });

        it('should set the serviceCode.ServiceTypeId based on the serviceType', () => {
            component.serviceCode.Data = { Code: '1234', Description: 'Description', ServiceTypeId: null, AffectedAreaId: 91011 };
            component.validateServiceTypeChange('serviceType');
            expect(component.serviceCode.Data.ServiceTypeId).toBeNull();
        });

        it('should set the serviceCode.ServiceTypeId based on the serviceType', () => {
            component.serviceCode.Data = { Code: '1234', Description: 'Description', ServiceTypeId: null, AffectedAreaId: 91011 };
            component.validateServiceTypeChange('serviceType');
            expect(component.serviceCode.Data.ServiceTypeId).toBe(null);
        });
    });

    describe('validateServiceCode -> function', () => {
        let tempServiceCode;
        beforeEach(() => {
            component.serviceCode.Data = { Code: '1234', Description: 'Description', ServiceTypeId: null, AffectedAreaId: 91011 };
            component.serviceCodeError = false;
            component.serviceDescriptionError = false;
            component.serviceTypeIdError = false;
            component.affectedAreaIdError = false;
            component.saveAttempted = true;
            tempServiceCode = { Code: '1234', Description: 'Description', ServiceTypeId: 5678, AffectedAreaId: 91011 };
        });

        it('should set serviceCodeError to true if saveAttempted is true and serviceCode.Code is null or undefined', () => {
            tempServiceCode.Code = null;
            component.validateServiceCode(tempServiceCode);
            fixture.detectChanges();
            component.inputServiceCode = fixture.debugElement.query(By.css('#inpServiceCode'));
            expect(component.serviceCodeError).toBe(true);
            fixture.whenStable().then(() => {
                expect(component.inputServiceCode.nativeElement.focus()).toHaveBeenCalled();
            });
        });

        it('should set serviceDescriptionError to true if saveAttempted is true and serviceCode.Description is empty', () => {
            serviceCode.Description = '';
            component.validateServiceCode(serviceCode);
            fixture.detectChanges();
            expect(component.serviceDescriptionError).toBe(true);
            component.inputDescription = fixture.debugElement.query(By.css('#inpDescription'));
            fixture.whenStable().then(() => {
                expect(component.inputDescription.nativeElement.focus()).toHaveBeenCalled();
            });
        });

        it('should set serviceTypeIdError to true if saveAttempted is true and serviceCode.Description is empty', () => {
            serviceCode.ServiceTypeId = null;
            component.validateServiceCode(serviceCode);
            expect(component.serviceTypeIdError).toBe(true);
            fixture.detectChanges();
            component.lstServiceType = fixture.debugElement.query(By.css('#lstServiceType'));
            fixture.whenStable().then(() => {
                expect(component.lstServiceType.nativeElement.focus()).toHaveBeenCalled();
            });
        });

        it('should set affectedAreaIdError to true if saveAttempted is true and serviceCode.AffectedAreaId is null', () => {
            serviceCode.AffectedAreaId = null;
            component.validateServiceCode(serviceCode);
            expect(component.affectedAreaIdError).toBe(true);
            fixture.detectChanges();
            component.lstAffectedArea = fixture.debugElement.query(By.css('#lstAffectedArea'));
            fixture.whenStable().then(() => {
                expect(component.lstAffectedArea.nativeElement.focus()).toHaveBeenCalled();
            });
        });

        it('should not set properties if saveAttempted is false ', () => {
            component.serviceCodeError = false;
            component.serviceDescriptionError = false;
            component.serviceTypeIdError = false;
            component.affectedAreaIdError = false;

            serviceCode.AffectedAreaId = null;
            serviceCode.ServiceTypeId = null;
            component.saveAttempted = false;
            component.validateServiceCode(serviceCode);

            expect(component.affectedAreaIdError).toBe(false);
            expect(component.serviceTypeIdError).toBe(false);
            expect(component.serviceDescriptionError).toBe(false);
            expect(component.affectedAreaIdError).toBe(false);
        });

    });

    describe('validateAffectedAreaChange', () => {
        beforeEach(() => {
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            spyOn(component, 'validateServiceCode');            
        });

        it('should call validateServiceCode', () => {
            component.validateAffectedAreaChange(1234);
            expect(component.validateServiceCode).toHaveBeenCalledWith(component.serviceCode.Data);
        });

        it('should call validateServiceCode & open warning model for associate smart code', () => {
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.data.ServiceCode.UseSmartCodes = true;
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.allServiceCodes = [serviceCode];
            component.editMode = true;
            component.validateAffectedAreaChange(1234);
            expect(component.validateServiceCode).toHaveBeenCalledWith(component.serviceCode.Data);
        });

        it('should call validateServiceCode & open warning model for associate smart code with smart code null', () => {
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.data.ServiceCode.UseSmartCodes = true;
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            let tempdata = serviceCode;
            tempdata.SmartCode1Id = null;
            component.allServiceCodes = [tempdata];
            component.editMode = true;
            component.validateAffectedAreaChange(1234);
            expect(component.validateServiceCode).toHaveBeenCalledWith(component.serviceCode.Data);
        });

        it('should call validateServiceCode & open warning model for associate smart code', () => {
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.data.ServiceCode.UseSmartCodes = true;
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.allServiceCodes = [serviceCode];
            component.editMode = true;
            component.validateAffectedAreaChange(1234);
            expect(component.validateServiceCode).toHaveBeenCalledWith(component.serviceCode.Data);
        });
    });

    describe('validateSmartCodeSetup -> function', () => {
        beforeEach(() => {
            serviceCode.SmartCode1Id = 1;
            serviceCode.SmartCode2Id = 2;
            serviceCode.SmartCode3Id = 3;
            serviceCode.SmartCode4Id = null;
            serviceCode.SmartCode5Id = null;
            serviceCode.ServiceCodeId = 1;
        })

        it('should set the service code data when UseSmartCodes is true', () => {
            const serviceCode = {
            UseSmartCodes: true,
            Data: {
                AffectedAreaId: 5,
                UseCodeForRangeOfTeeth: false
            }
            };
            component.editMode = true;
            component.serviceCode = serviceCode;
            component.validateSmartCodeSetup(serviceCode);
            expect(component.serviceCode.Data.UseSmartCodes).toBe(true);
        });

        it('should remove all smart code setup when UseSmartCodes is false', () => {
            serviceCode.UseSmartCodes = false;
            component.allServiceCodes = [serviceCode];
            component.serviceCode.Data.UseCodeForRangeOfTeeth = false;
            component.serviceCode.Data.AffectedAreaId = 5;
            component.editMode = false;
            component.validateSmartCodeSetup(serviceCode);
            expect(component.serviceCode.Data.SmartCode1Id).toBe(null);
            expect(component.serviceCode.Data.SmartCode2Id).toBe(null);
            expect(component.serviceCode.Data.SmartCode3Id).toBe(null);
            expect(component.serviceCode.Data.SmartCode4Id).toBe(null);
            expect(component.serviceCode.Data.SmartCode5Id).toBe(null);
        });

        it('should remove all smart code setup when UseSmartCodes is false', () => {
            serviceCode.UseSmartCodes = false;
            component.data.ServiceCode.UseCodeForRangeOfTeeth = true;
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.validateSmartCodeSetup(serviceCode);
            expect(component.serviceCode.Data.SmartCode1Id).toBe(null);
            expect(component.serviceCode.Data.SmartCode2Id).toBe(null);
            expect(component.serviceCode.Data.SmartCode3Id).toBe(null);
            expect(component.serviceCode.Data.SmartCode4Id).toBe(null);
            expect(component.serviceCode.Data.SmartCode5Id).toBe(null);
        });
    });

    describe('search function ->', () => {
        it('should return  without searching if search is in progress', () => {
            component.searchIsQueryingServer = true;
            component.search("");
            expect(mockCdtCodeService.search).not.toHaveBeenCalled();
        });

        it('should return  without searching if searchResults equal resultCount', () => {
            component.searchResults = mockCdtCodeResult;
            component.resultCount = 3;
            component.search("");
        });

        it('should return without searching if searchString is empty', () => {
            component.searchString = '';
            component.search("");
        });

        it('should return without searching if component.searchResults.length == component.resultCount', () => {
            component.searchString = 'searchMe';
            spyOn(component, 'search');
            component.searchResults = [{ res: 1 }];
            component.resultCount = 1;
            component.search(component.searchString);
            expect(mockCdtCodeService.search).not.toHaveBeenCalled();
        });

        it('should set searchParams if search conditions are valid', () => {            
            component.searchIsQueryingServer = false;
            component.searchString = 'mockSearch';
            component.searchResults = [];
            component.resultCount = 0;            
            component.search(component.searchString);
            expect(mockCdtCodeService.search).toHaveBeenCalled();
        });

        it('should call serviceCodesService search if valid search ', () => {
            component.searchString = 'Anything I want';
            component.search(component.searchString);
            expect(mockCdtCodeService.search).toHaveBeenCalled();
            expect(component.searchIsQueryingServer).toBe(true);
        });
    });

    describe('searchGetOnSuccess function ->', () => {
        it('should set searchResults', () => {
            component.searchString = "keyword";
            component.searchGetOnSuccess(mockServiceReturnWrapper);
            expect(component.searchIsQueryingServer).toBe(false);
        });

        it('should set resultCount if gets results', () => {
            component.searchString = "D7820";
            expect(component.resultCount).toBe(0);
            component.searchGetOnSuccess(mockServiceReturnWrapper);
            expect(component.searchIsQueryingServer).toBe(false);
            expect(component.noSearchResults).toBe(false);
            expect(component.resultCount).toBe(1);
        });

        it('should set noSearchResults to false if gets results', () => {
            component.searchGetOnSuccess(mockServiceReturnWrapper);
            expect(component.noSearchResults).toBe(false);
        });

        it('should set noSearchResults to false if resultCount equals 0', () => {
            component.searchGetOnSuccess(mockServiceReturnWrapperNoCdtCodes);
            expect(component.noSearchResults).toBe(false);
        });
    });

    describe('searchGetOnError function ->', () => {
        it('should set component variables ', () => {
            component.searchGetOnError();
            expect(component.searchIsQueryingServer).toBe(false);
            expect(component.resultCount).toBe(0);
            expect(component.searchResults).toEqual([]);
            expect(component.noSearchResults).toBe(true);
        });

        it('should call toastr error ', () => {
            component.searchGetOnError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('activateSearch function ->', () => {
        it('should not do search if user is not authorized for search ', () => {
            spyOn(component, 'search');
            expect(component.search).not.toHaveBeenCalled();
        });

        it('should set component variables and call search if user is authorized for search ', () => {
            spyOn(component, 'search');
            component.searchParams.searchTerm = 'mockTerm';
            component.activateSearch(component.searchParams.searchTerm);
            expect(component.searchString).toEqual(component.searchParams.searchTerm);
            expect(component.limit).toBe(15);
            expect(component.limitResults).toBe(true);
            expect(component.resultCount).toBe(0);
            expect(component.searchResults).toEqual([]);
            expect(component.search).toHaveBeenCalled();
        });

        it('should set component variables and call search if user is authorized for search ', () => {
            spyOn(component, 'search');
            component.searchParams.searchTerm = 'mockTerm';
            component.activateSearch(component.searchParams.searchTerm);
            expect(component.searchString).toEqual(component.searchParams.searchTerm);
            expect(component.limit).toBe(15);
            expect(component.limitResults).toBe(true);
            expect(component.resultCount).toBe(0);
            expect(component.searchResults).toEqual([]);
            expect(component.search).toHaveBeenCalled();
        });

        it('should set noSearchResults to false if searchTerm is equal to searchString ', () => {
            let searchTerm = 'mockTerm';
            component.searchString = 'mockTerm';
            component.activateSearch(searchTerm);
            expect(component.searchString).toEqual(searchTerm);
            expect(component.noSearchResults).toBe(false);
        });

        it('should set noSearchResults to false if searchTerm is equal to searchString ', () => {
            let searchTerm = 'mockTerm';
            component.searchString = 'mockTerm';
            component.activateSearch(searchTerm);
            expect(component.searchString).toEqual(searchTerm);
            expect(component.noSearchResults).toBe(false);
        });
    });

    //getDefaultValue
    describe('getDefaultValue function ->', () => {
        it('should search the item in the array and return null if not found', () => {
            let data = [{ Id: 1 }, { Id: 2 }, { Id: 3 }];
            let property = 'Id';
            let value = 4;
            let defaultItem = component.getDefaultValue(data, property, value);
            expect(defaultItem).not.toBeNull();
        });

        it('should search the item in the array and return item if found', () => {
            let data = [{ Id: 1 }, { Id: 2 }, { Id: 3 }];
            let property = 'Id';
            let value = 2;
            let defaultItem = component.getDefaultValue(data, property, value);

            expect(defaultItem.Id).toBe(2);
        });
    });

    describe('selectResult function ->', () => {
        beforeEach(() => {
            component.cdtCodes = CDTServiceResponse.Value;
        })
        it('should do nothing when selectedCdt is null or undefined ', () => {
            let selectedCdt = null;          
            component.selectResult(selectedCdt);
            expect(component.validCdtCodeServerMessage).toEqual("");
        });

        it('should set all component variables when selectedCdt is not null and it has data for service-types, affected-area, taxable-service', () => {
            let searchResultFromList = {
                Code: "selectedCdtCode",
                CdtCodeId: "selectedCdtCodeId",
                ServiceTypeId: "ServiceTypeId",
                Description: "Type1",
                Id: 1,
                Name: "sample"
            };
            component.searchParams = { searchTerm: '' };
            component.serviceCode = { Data: { CdtCodeId: '', CdtCodeName: '' } };
            component.serviceTypes = [{ Description: 'Type1', ServiceTypeId: "1" }, { Description: 'Type2', ServiceTypeId: "2" }];
            component.selectResult("selectedCdtCode");
            expect(component.searchParams.searchTerm).toEqual(CDTServiceResponse.Value[0].Code);
            expect(component.serviceCode.Data.CdtCodeId).toEqual(CDTServiceResponse.Value[0].CdtCodeId);
            expect(component.serviceCode.Data.CdtCodeName).toEqual(CDTServiceResponse.Value[0].Code);
            expect(component.serviceCode.Data.Description).toEqual(searchResultFromList.Description);

            expect(component.serviceCode.Data.UseSmartCodes).toEqual(false);
            expect(component.serviceCode.Data.UseCodeForRangeOfTeeth).toEqual(false);

            expect(component.serviceCode.Data.SmartCode1Id).toEqual(null);
            expect(component.serviceCode.Data.SmartCode2Id).toEqual(null);
            expect(component.serviceCode.Data.SmartCode3Id).toEqual(null);
            expect(component.serviceCode.Data.SmartCode4Id).toEqual(null);
            expect(component.serviceCode.Data.SmartCode5Id).toEqual(null);
            
            expect(component.serviceCode.Data.TaxableServiceTypeName).not.toEqual(searchResultFromList.Name);
            expect(component.serviceCode.Data.TaxableServiceTypeId).not.toEqual(searchResultFromList.Id);
            expect(component.serviceCode.Data.AffectedAreaName).not.toEqual(searchResultFromList.Name);
            expect(component.serviceCode.Data.AffectedAreaId).toEqual(searchResultFromList.Id);
        });

        it('should set component variables related to CDT code only when selectedCdt is not null and it does not have any data for service-types, affected-area, taxable-service', () => {
          
            component.searchParams = { searchTerm: '' }
            component.serviceCode = { Data: { CdtCodeId: '', CdtCodeName: '' } };
            component.serviceTypes = [{ Description: 'Type1', ServiceTypeId: "1" }, { Description: 'Type2', ServiceTypeId: "2" }];
            component.cdtCodes = CDTServiceResponse.Value;
            component.selectResult("selectedCdtCode");
            expect(component.searchParams.searchTerm).toEqual(CDTServiceResponse.Value[1].Code);
            expect(component.serviceCode.Data.CdtCodeId).toEqual(CDTServiceResponse.Value[1].CdtCodeId);
            expect(component.serviceCode.Data.CdtCodeName).toEqual(CDTServiceResponse.Value[1].Code);
        });
    });

    //serviceTypeBlur
    describe('serviceTypeBlur function ->', () => {
        it('should do nothing when serviceTypes is not present', () => {
            component.serviceTypes = null;
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            let originalData = component.serviceCode.Data;
            component.serviceTypeBlur();
            expect(component.serviceCode.Data).toEqual(originalData);
        });

        it('should clear the service type soar-select-list when it has bad value', () => {
            component.serviceTypes = [{ Description: 'option1', ServiceTypeId: "1" }];
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.serviceTypeBlur();
            expect(component.serviceCode.Data.ServiceTypeDescription).toBeNull();
            expect(component.serviceCode.Data.ServiceTypeId).toBeNull();
        });

        it('should set service type id corresponding to soar-select-list value when it has proper value', () => {
            let correctItem = { ServiceTypeId: 2 };
            component.serviceCode = { Data: { ServiceTypeId: '1' } }
            component.serviceTypes = [
                { Description: 'option1', ServiceTypeId: "1" },
                { Description: 'option2', ServiceTypeId: "2" }];
            component.serviceTypeBlur();
            expect(component.serviceCode.Data.ServiceTypeId).toEqual(null);
        });
    });

    //affectedAreaBlur
    describe('affectedAreaBlur function ->', () => {
        it('should do nothing when affectedAreas is not present', () => {
            component.affectedAreas = null;
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            let originalData = component.serviceCode.Data;
            component.affectedAreaBlur();
            expect(component.serviceCode.Data).toEqual(originalData);
        });

        it('should set affected area soar-select-list to default value when it has bad value', () => {
            component.affectedAreas = [{ Name: 'option1', Id: 1 }, { Name: 'option2', Id: 2 }];
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            spyOn(component, 'getDefaultValue').and.returnValue({ Name: 'option1', Id: 1 });

            component.affectedAreaBlur();
            expect(component.serviceCode.Data.AffectedAreaName).not.toBeNull();
            expect(component.serviceCode.Data.AffectedAreaId).not.toBeNull();
        });

        it('should not set affected area defaults for service code data, when the default item does not exists', () => {
            component.affectedAreas = [{ Name: 'option1', Id: 1 }, { Name: 'option2', Id: 2 }];
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.serviceCode.Data.AffectedAreaName = null;
            component.serviceCode.Data.AffectedAreaId = null;
            spyOn(component, 'getDefaultValue').and.returnValue(null);

            component.affectedAreaBlur();
            expect(component.serviceCode.Data.AffectedAreaName).toBeNull();
            expect(component.serviceCode.Data.AffectedAreaId).toBeNull();
        });

        it('should set affected area id corresponding to soar-select-list value when it has proper value', () => {
            component.affectedAreas = [{ Name: 'option1', Id: 1 }, { Name: 'option2', Id: 2 }];
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);

            component.affectedAreaBlur();
            expect(component.serviceCode.Data.AffectedAreaName).not.toBe('option1');
            expect(component.serviceCode.Data.AffectedAreaId).toBe(5);
        });

        it('should uncheck ROT and missing tooth when affectedAreas is 5', () => {
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.affectedAreaBlur();
            expect(component.serviceCode.Data.UseCodeForRangeOfTeeth).toBe(true);
            expect(component.serviceCode.Data.SetsToothAsMissing).toBe(false);
        });
    });


    //usuallyPerformedByProviderTypeBlur
    describe('usuallyPerformedByProviderTypeBlur function ->', () => {
        it('should clear the usually performed by soar-select-list when it has bad value', () => {
            component.providerTypes = [{ Name: 'option1', Id: 1 }];
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.usuallyPerformedByProviderTypeBlur();
            expect(component.serviceCode.Data.UsuallyPerformedByProviderTypeId).toBeNull();
            expect(component.serviceCode.Data.UsuallyPerformedByProviderTypeName).toBeNull();
        });

        it('should set usually performed by provider type id corresponding to soar-select-list value when it has proper value', () => {
            let correctItem = { Id: 2 };
            component.serviceCode = { Data: { UsuallyPerformedByProviderTypeName: "option2" } }
            component.providerTypes = [{ Name: 'option1', Id: 1 },
            { Name: 'option2', Id: 2 }];
            component.usuallyPerformedByProviderTypeBlur();
            expect(component.serviceCode.Data.UsuallyPerformedByProviderTypeId).toEqual(2);
        });

        it('should set usually performed by provider type id as null', () => {
            component.serviceCode = { Data: { UsuallyPerformedByProviderTypeName: "option2" } }
            component.providerTypes = [{ Name: 'option1', Id: 1 },
            { Name: 'option2', Id: 2 }];
            component.usuallyPerformedByProviderTypeBlur();
            expect(component.serviceCode.Data.UsuallyPerformedByProviderTypeId).not.toBeNull();
        });
    });

    //drawTypeBlur
    describe('drawTypeBlur function ->', () => {
        it('should do nothing when drawTypes is not present', () => {
            component.drawTypes = null;
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            let originalData = component.serviceCode.Data;
            component.drawTypeBlur();
            expect(component.serviceCode.Data).toEqual(originalData);
        });

        it('should clear the service code draw-type when soar-select-list has bad value', () => {
            // use mock to return this when blur on dd
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.drawTypeBlur();
            expect(component.serviceCode.Data.DrawTypeDescription).toBeNull();
            expect(component.serviceCode.Data.DrawTypeId).toBeNull();
        });

        it('should set service code draw-type-id to soar-select-list value when it has value from list', () => {
            // mock item selected in dd
            let selectedDrawType = { DrawTypeId: "cdc35f12-ecb6-555c-99d3-ebb6ea163731", Description: "DrawTypeTwo" };
            // use mock to return this when blur
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.drawTypeBlur();
            expect(component.serviceCode.Data.DrawTypeId).not.toEqual(selectedDrawType.DrawTypeId);
        });
    });

    describe('checkServiceCodeUsage function ->', () => {
        it('should call checkForServiceCodeUsage when it has valid service code id and cdt code id ', () => {
            component.serviceCode = { Data: { CdtCodeId: '123', ServiceCodeId: '123' } };
            component.checkServiceCodeUsage();
            component.serviceCode.IsServiceCodeUsed = false;
        });

        it('should not call checkForServiceCodeUsage when service code id undefined', () => {
            component.serviceCode = { Data: { CdtCodeId: "123", ServiceCodeId: undefined } };
            component.checkServiceCodeUsage();
            component.serviceCode.IsServiceCodeUsed = false;
        });
    });


    //checkUniqueServiceCode
    describe('checkUniqueServiceCode function and it\'s handlers ', () => {
        it('should verify unique service code from server with valid component.serviceCode.Data.ServiceCodeId', () => {
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.checkUniqueServiceCode();
            expect(mockStandardService.checkDuplicate).toHaveBeenCalled();
        });

        it('should verify unique service code from server with null component.serviceCode.Data.ServiceCodeId', () => {
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.serviceCode.Data.ServiceCodeId = null;
            component.checkUniqueServiceCode();
            expect(mockStandardService.checkDuplicate).toHaveBeenCalled();
        });

        it('should do nothing when component.serviceCode.Data.Code is null', () => {        
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.serviceCode.Data.Code = null;
            component.checkUniqueServiceCode();
            expect(mockStandardService.checkDuplicate).toHaveBeenCalled();
        });

        //checkUniqueServiceCodeGetSuccess
        it('should do nothing if service code is unique', () => {
            component.serviceCode = { IsDuplicate: false };
            component.checkUniqueServiceCodeGetSuccess();
            expect(component.uniqueServiceCodeServerMessage).toBeUndefined();
        });

        it('should notify user if service code is not unique', () => {
            component.serviceCode = { IsDuplicate: true };
            component.checkUniqueServiceCodeGetSuccess();
            expect(component.uniqueServiceCodeServerMessage).not.toEqual('');
        });

        //checkUniqueServiceCodeGetFailure
        it('should notify user after it failed to verify unique service code', () => {
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.checkUniqueServiceCodeGetFailure();
            expect(component.serviceCode.IsDuplicate).toEqual(true);
            expect(component.uniqueServiceCodeServerMessage).not.toEqual('');
        });
    });

    // saveServiceCode
    describe('saveServiceCode function ->', () => {

        it('should throw focus on service code input field when IsDuplicate flag is true', () => {
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.serviceCode.IsDuplicate = true;
            component.saveServiceCode();
            component.inputServiceCode = fixture.debugElement.query(By.css('#inpServiceCode'));
            expect(component.serviceCode.IsDuplicate).toEqual(true);
            expect(component.uniqueServiceCodeServerMessage).not.toBeUndefined();
            fixture.whenStable().then(() => {
                expect(component.inputServiceCode.nativeElement.focus()).not.toHaveBeenCalled();
                expect(component.inputServiceCode.nativeElement.focus()).toHaveBeenCalled();
            });
        });

        it('should fire service call to save service-code when searchTerm is not present and cdtCodeId is null', () => {
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.serviceCode.IsDuplicate = false;
            component.searchParams = { searchTerm: '' };
            component.searchString = "";
            component.displayActiveStatusConfirmation = true;
            component.saveServiceCode();
            expect(component.serviceCode.IsDuplicate).toEqual(false);
            expect(component.uniqueServiceCodeServerMessage).toBeUndefined();
            expect(mockStandardService.save).toHaveBeenCalled();
        });

    });

    describe('removeServiceCodeFromSwiftCode', () => {
        it('should remove found service code from list when more then 1 service code', () => {
            component.swiftCode.Data.SwiftPickServiceCodes = swiftPickServiceCodesDummyList;
            component.editMode = true;
            let targetServiceCode = component.swiftCode.Data.SwiftPickServiceCodes[0];
            let listCount = component.swiftCode.Data.SwiftPickServiceCodes.length;
            component.removeServiceCodeFromSwiftCode(targetServiceCode);
            expect(component.swiftCode.Data.SwiftPickServiceCodes.length == (listCount - 1));
        });
        it('should make an empty list when only 1 service code', () => {
            component.swiftCode.Data.SwiftPickServiceCodes.push(swiftPickServiceCodesDummyList[0]);
            component.editMode = true;
            let targetServiceCode = component.swiftCode.Data.SwiftPickServiceCodes[0];
            let listCount = component.swiftCode.Data.SwiftPickServiceCodes.length;
            component.removeServiceCodeFromSwiftCode(targetServiceCode);
            expect(component.swiftCode.Data.SwiftPickServiceCodes.length == 0);
            expect(component.swiftCode.Data.SwiftPickServiceCodes == null);
        });
        it('should do nothing if swift code is not active', () => {
            component.swiftCode.Data.SwiftPickServiceCodes = swiftPickServiceCodesDummyList;
            component.editMode = true;
            component.swiftCode.Data.IsActive = false;
            let targetServiceCode = component.swiftCode.Data.SwiftPickServiceCodes[0];
            let listCount = component.swiftCode.Data.SwiftPickServiceCodes.length;
            component.removeServiceCodeFromSwiftCode(targetServiceCode);
            expect(component.swiftCode.Data.SwiftPickServiceCodes == swiftPickServiceCodesDummyList);
        });
    });

    //saveServiceCodeSuccessHandler
    describe('saveServiceCodeSuccessHandler function ->', () => {
        it('should handle success flow of adding service code with valid successResponse and should call serviceCode.Save when isFeeInRange is true', () => {
            let successResponse = { Value: "i am of some value" };
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.saveServiceCodeSuccessHandler(successResponse);
            expect(component.validCdtCodeServerMessage).toEqual('');
            expect(mockStandardService.save).toHaveBeenCalled();
        });

        it('should save service code as active when isFeeInRange and displayActiveStatusConfirmation flags are true ', () => {
            let successResponse = { Value: "i am of some value" };
            component.displayActiveStatusConfirmation = true;
            component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
            component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
            component.serviceCode.Data.IsActive = false;
            component.saveServiceCodeSuccessHandler(successResponse);
            expect(component.validCdtCodeServerMessage).toEqual('');
            expect(component.serviceCode.Data.IsActive).toBe(true);
            expect(mockStandardService.save).toHaveBeenCalled();
        });

        it('should handle success flow of adding service code with invalid successResponse by setting error message', () => {
            let successResponse = { Value: null };
            component.saveServiceCodeSuccessHandler(successResponse);
            expect(component.validCdtCodeServerMessage).not.toBe(null);
        });
    });

    //saveServiceCodeErrorHandler
    describe('saveServiceCodeErrorHandler function ->', () => {
        it('saveServiceCodeErrorHandler should handle error flow of adding service code by setting the error message', () => {
            component.saveServiceCodeErrorHandler();
            expect(component.isValidCdtCode).toBe(false);
            expect(component.validCdtCodeServerMessage).not.toEqual('');
        });
    });

    //serviceCodeIsActiveOnChange
    it('serviceCodeIsActiveOnChange should make displayActiveStatusConfirmation false when IsActive flag is true', () => {
        component.serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
        component.serviceCode.Data = cloneDeep(component.data.ServiceCode);
        component.serviceCode.Data.IsActive = true;
        component.displayActiveStatusConfirmation = false;
        component.toggleIsActive(true);
        expect(component.displayActiveStatusConfirmation).toBe(false);
    });

    //CDT Picker Model
    describe('CDT Picker Modal  ->', () => {
        it('On openCTDCodePickerModal set showCTDCodePickerModal to be true', () => {
            component.openCTDCodePickerModal();
            expect(component.showCTDCodePickerModal).toBe(true);
        });

        it('On close CTD Picker Modal set showCTDCodePickerModal to be false and set selected CDT Code', () => {
            component.cdtCodes = CDTServiceResponse.Value;
            let selectedCDTCode = { Code:"C1010"}
            component.onCTDCodePickerModalClose(selectedCDTCode);
            expect(component.cdtCodeselected).toBe("C1010");
            expect(component.showCTDCodePickerModal).toBe(false);
        });
    });

    describe('openFeesByLocation ->', () => {
        it('should open openFeesByLocation ', () => {
            spyOn(componentServiceFeesByLocation,'openPreviewDialog');
            component.openFeesByLocation();
        })
    })

    describe('closeFeesByLocation ->', () => {
       
    it('should set feesByLocation and locationDataChanged to true when receiving false', () => {
        component.closeFeesByLocation(false);

        expect(component.feesByLocation).toBe(true);
        expect(component.locationDataChanged).toBe(true);
        expect(component.serviceCode.Data.LocationSpecificInfo).toBeFalsy();
    });

    it('should set feesByLocation and locationDataChanged to true when receiving true', () => {
        component.closeFeesByLocation(true);

        expect(component.feesByLocation).toBe(true);
        expect(component.locationDataChanged).toBe(true);
        expect(component.serviceCode.Data.LocationSpecificInfo).toBeTruthy();
    });
});
    

    describe('watchServiceCode ->', () => {       
        it('should set data for initial objects while adding new record', () => {
            component.data.ServiceCodeId = null;
            component.hasAddServiceCodeAccess = true;
            component.watchServiceCode();
        });
        it('should set data for initial objects while editing current record', () => {
            component.locationDataChanged = true;
            component.swiftCode = swiftCode;
            component.serviceCode.Data = data.ServiceCode;

            component.hasEditServiceCodeAccess = true;
            component.watchServiceCode();
        });
    })

    describe('openSmartCodeSetup ->', () => {
        it('should open closeSmartCode ', () => {
            component.serviceCode.Data.AffectedAreaId = 5;
            component.smartCodeSetup = componentSmartCode;
            component.openSmartCodeSetup();
        })
    })

    describe('closeSmartCode ->', () => {
        it('should set new data to serviceCode.Data', () => {
            spyOn(component, "validateSmartCodeSetup");
            component.closeSmartCode(null);
            expect(component.validateSmartCodeSetup).not.toHaveBeenCalled();
        })

        it('should set new data to serviceCode.Data', () => {
            spyOn(component,"validateSmartCodeSetup");
            component.closeSmartCode(component.serviceCode.Data);
            expect(component.validateSmartCodeSetup).toHaveBeenCalled();
        })
    })

    describe('deleteReference ->', () => {
        beforeEach(() => {
            component.swiftPickCrud = componentSwiftCode;
        })

        it('should call deleteReference to delete PreventiveServices', () => {
            let preventiveCareData = {
                DataTag: "AAAAAAAdUcg=",
                DateModified: "2022-11-22T11:32:44.7212152",
                FailedMessage:null,
                ObjectState: null,
                PreventiveServiceId:"dfbd71ac-65c9-4a40-b5e2-19d5cf91d9d6",
                PreventiveServiceTypeId:"26296581-8a2d-4b16-b1dd-c04f217d8b19",
                PreventiveServiceTypeId_Name: "FMX/Pano",
                ServiceCodeId: "6247e559-27e7-48af-a789-757f2d9b4c5a",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
            }
            component.serviceCode.Data.AffectedAreaId = 5;
            component.deleteReference(preventiveCareData, { data: "PreventiveServices" });
        })

        it('should call deleteReference to delete swift code & open a popup', () => {
            component.swiftCode.Data.SwiftPickServiceCodes = swiftPickServiceCodesDummyList;
            component.swiftCode = swiftCodeData;
            component.deleteReference(swiftCodeData, { data: "SwiftCodes" });
        })

        it('should call deleteReference to delete swift code & open a popup', () => {
            component.swiftCode.Data.SwiftPickServiceCodes = swiftPickServiceCodesDummyList;
            component.swiftCode.Data.IsActive = true;
            component.swiftCode.Data.ServiceCodeId = "00000000-0000-0000-0000-000000000003";
            component.swiftCode.Data.SwiftPickServiceCodes.push({ "ServiceCodeId": "00000000-0000-0000-0000-000000000003" });
        })
    })

    describe('saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess ->', () => {
        it('should display msg if swiftcode is duplicate', () => {
            swiftCodeData["IsDuplicate"] = true;
            component.swiftCode = swiftCodeData;
            component.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess();
            expect(component.uniqueSwiftPickCodeServerMessage).not.toEqual("");
        });

        it('should save swift code if unique swift code', () => {
            swiftCodeData["IsDuplicate"] = false;
            swiftCodeData["Valid"] = true;            
            component.swiftCode = swiftCodeData;
            component.displayActiveStatusConfirmation = true;
            component.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess();
            expect(component.isAtleastOneServiceCode).toBe(true);
        });
    })

    describe('reloadFavorites ->', () => {
        it('should call close category on reloadFavorites', () => {
            spyOn(component,"closeCategories");
            component.reloadFavorites();
            expect(component.closeCategories).toHaveBeenCalled();
        })
    })

    describe('onSwiftCodeModalClose ->', () => {
        it('should call close category on onSwiftCodeModalClose & update data', () => {
            spyOn(component, "closeCategories");
            component.onSwiftCodeModalClose(swiftCodeData);
            expect(component.closeCategories).toHaveBeenCalled();
        })
    })

    describe('cdtCodeGetAllFailure', () => {
        it('should call error method of ToastrFactory with correct parameters', () => {   
          component.cdtCodeGetAllFailure();    
          expect(mockToastrFactory.error).not.toHaveBeenCalledWith(
            'Failed to retrieve the list of CDT Codes. Refresh the page to try again.',
            'Server Error'
          );
        });
      });

    describe('getName', () => {
        const mockPreventiveServiceTypes: PreventiveLinkedServices[] = [
            { PreventiveServiceTypeId: '1', Description: 'Service 1' },
            { PreventiveServiceTypeId: '2', Description: 'Service 2' },
          ];
        
        it('should return the correct description for a valid ID', () => {
            component.preventiveServiceTypes = mockPreventiveServiceTypes;
            const id = { PreventiveServiceTypeId: '1' };
            const result = component.getName(id);        
            expect(result).toBe('Service 1');
          });
    })
    
});