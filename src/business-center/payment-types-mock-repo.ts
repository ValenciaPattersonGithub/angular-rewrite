import { of } from "rxjs";

export const MockRepository = () => ({
    mockLocalizeService: {
        getLocalizedString: () => { }
    },
    mockpaymentTypeService: {
        getAllPaymentTypes: () => {
            return {
                then: (res, error) => {
                    res({ Value: [] }),
                        error({})
                }
            }
        },
        updatePaymentTypeOptions: jasmine.createSpy(),
        hasWeavePaymentsIntegration: jasmine
            .createSpy('PaymentTypesService.hasWeavePaymentsIntegration')
            .and.returnValue(of({ Result: true })),
        deletePaymentTypeById: () => {
            return {
                then: (res, error) => {
                    res({ Value: [] }),
                        error({})
                }
            }
        },
        update: () => {
            return {
                then: (res, error) => {
                    res({ Value: [] }),
                        error({})
                }
            }
        },
    },
    mockLocationService: {
        getCurrentLocation: () => { return { id: 123456 } }
    },
    mockFeatureFlagService: {
        getOnce$: jasmine
            .createSpy('FeatureFlagService.getOnce$')
            .and.returnValue(of(true)),
    },
    mockpatSecurityService: {
        IsAuthorizedByAbbreviation: jasmine.
            createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
    },
    mocklistHelper: {
        findItemByFieldValue: () => {
            return {};
        },
        findIndexByFieldValue: (a: any, b: any, c: any) => { }
    },
    mockDeletePaymentType: {
        CurrencyTypeId: 1,
        CurrencyTypeName: 'CASH',
        DataTag: 'AAAAAAAAhsE=',
        DateModified: '2019-11-05T07:25:21.36071',
        Description: 'dgfgds',
        IsActive: true,
        IsSystemType: false,
        IsUsedInCreditTransactions: false,
        IsDefaultTypeOnBenefitPlan: false,
        PaymentTypeCategory: 1,
        PaymentTypeId: 'cc1bd364-9cc7-4f76-8607-ac8ea29ffb7d',
        Prompt: 'gdf',
        UserModified: 'd7188401-6ef2-e811-b7f9-8056f25c3d57',
    },
    mockPaymentTypesList: {
        Value: [{
            PaymentTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false,
            Description: 'AccoountPaymentType', PaymentTypeCategory: 1, IsActive: true
        },
        {
            PaymentTypeId: '00000000-0000-0000-0000-000000000002', IsSystemType: false,
            Description: 'InsurancePaymentType1', PaymentTypeCategory: 2, IsActive: false
        }]
    },
    mockupReversearray: [
        {
            PaymentTypeId: '00000000-0000-0000-0000-000000000002', IsSystemType: false,
            Description: 'InsurancePaymentType1', PaymentTypeCategory: 2, IsActive: false
        },
        {
            PaymentTypeId: '00000000-0000-0000-0000-000000000001', IsSystemType: false,
            Description: 'AccoountPaymentType', PaymentTypeCategory: 1, IsActive: true
        }
    ],
    mockNewPaymentType: {
        Description: 'Accoount Payment Type',
        CurrencyTypeId: 0,
        Prompt: '',
        IsActive: [true]
    },
    mockEditPaymentType: {
        PaymentTypeId: 'e98afd59-9a8a-45c5-a549-03229b6de026',
        IsSystemType: false,
        Description: 'AAAd',
        Prompt: 'AAA',
        CurrencyTypeId: 3,
        CurrencyTypeName: 'CREDIT CARD',
        IsActive: true,
        IsUsedInCreditTransactions: false,
        IsDefaultTypeOnBenefitPlan: false,
        PaymentTypeCategory: 1,
        DataTag: 'AAAAAAAAiRA=',
        UserModified: 'd7188401-6ef2-e811-b7f9-8056f25c3d57',
        DateModified: '2019-10-30T09:16:33.7132509'
    },
    mockCurrencyTypeList: {
        Value: [{ Id: 1, Name: 'CASH', Order: 1 }, { Id: 2, Name: 'CHECK', Order: 2 },
        { Id: 3, Name: 'CREDIT CARD', Order: 3 }, { Id: 4, Name: 'DEBIT CARD', Order: 4 },
        { Id: 5, Name: 'OTHER', Order: 5 }
        ]
    },

});
