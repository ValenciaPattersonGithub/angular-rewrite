import { TestBed } from '@angular/core/testing';

import { AppointmentServiceProcessingRulesService } from './appointment-service-processing-rules.service';

// Item is separate in case we decide to get the data from an API in the future.
describe('AppointmentServiceProcessingRulesService', () => {
    let service: AppointmentServiceProcessingRulesService;

    let serviceTransactionStatuses = [
        { Id: 1, Name: 'Proposed' },
        { Id: 4, Name: 'Completed' },
        { Id: 6, Name: 'Existing' },
        { Id: 3, Name: 'Accepted' }
    ];

    let providerList = [
        {
            UserId: '1',

        },
        {
            UserId: '2',

        },
        {
            UserId: '3',

        },
        {
            UserId: '4',

        },
        {
            UserId: '5',

        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AppointmentServiceProcessingRulesService],
        });
        service = TestBed.get(AppointmentServiceProcessingRulesService);
    }
    );

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('processAppointmentServiceEditRules should allow edit if serviceTransaction is null', () => {
        const result = service.processAppointmentServiceEditRules(null, serviceTransactionStatuses, false);
        expect(result.allowEditingMainFields).toEqual(true);
        expect(result.allowEditingProvider).toEqual(true);
        expect(result.showProviderSelectorForAppointmentServices).toEqual(false);
        expect(result.showProviderSelector).toEqual(true);
    });

    it('processAppointmentServiceEditRules should allow edit if serviceTransactionStatuses is empty', () => {
        const result = service.processAppointmentServiceEditRules({}, [], false);
        expect(result.allowEditingMainFields).toEqual(true);
        expect(result.allowEditingProvider).toEqual(true);
        expect(result.showProviderSelectorForAppointmentServices).toEqual(false);
        expect(result.showProviderSelector).toEqual(true);
    });

    it('processAppointmentServiceEditRules should not allow edit if service has completed status', () => {
        const serviceTransaction = {
            ServiceTransactionStatusId: 4,
            AppointmentId: 12
        }
        const result = service.processAppointmentServiceEditRules(serviceTransaction, serviceTransactionStatuses, false);
        expect(result.allowEditingMainFields).toEqual(false);
        expect(result.allowEditingProvider).toEqual(false);
        expect(result.showProviderSelectorForAppointmentServices).toEqual(false);
        expect(result.showProviderSelector).toEqual(true);
    });

    it('processAppointmentServiceEditRules should allow edit of provider only if AppointmentId is on service and status of the service is not completed and isFromAppointmentModal is false', () => {
        const serviceTransaction = {
            ServiceTransactionStatusId: 10,
            AppointmentId: 12
        }
        const result = service.processAppointmentServiceEditRules(serviceTransaction, serviceTransactionStatuses, false);
        expect(result.allowEditingMainFields).toEqual(false);
        expect(result.allowEditingProvider).toEqual(true);
        expect(result.showProviderSelectorForAppointmentServices).toEqual(true);
        expect(result.showProviderSelector).toEqual(false);
    });

    it('processAppointmentServiceEditRules should allow edit of most fields if isFromAppointmentModal is true', () => {
        const serviceTransaction = {
            ServiceTransactionStatusId: 10,
            AppointmentId: 12
        }
        const result = service.processAppointmentServiceEditRules(serviceTransaction, serviceTransactionStatuses, true);
        expect(result.allowEditingMainFields).toEqual(true);
        expect(result.allowEditingProvider).toEqual(true);
        expect(result.showProviderSelectorForAppointmentServices).toEqual(false);
        expect(result.showProviderSelector).toEqual(true);
    });

    it('processAppointmentServiceProviders when serviceTransaction is null an empty list is returned', () => {
        const result = service.processAppointmentServiceProviders(null, []);
        expect(result).toEqual([]);
    });

    it('processAppointmentServiceProviders when providers is null an empty list is returned', () => {
        const result = service.processAppointmentServiceProviders({}, null);
        expect(result).toEqual([]);
    });

    it('processAppointmentServiceProviders serviceTransaction does not have a ProviderUserId property list is still returned with all providers provided', () => {
        const providers = [
            '1',
            '4',
            '7',
            '56'
        ];

        const result = service.processAppointmentServiceProviders({}, providers);
        expect(result.length).toEqual(4);
    });

    it('processAppointmentServiceProviders when seriviceTransaction contains a value already in the providers list do not add the value twice to the list', () => {
        const providers = [
            '1',
            '4',
            '7',
            '56'
        ];

        const result = service.processAppointmentServiceProviders({ ProviderUserId: '7' }, providers);
        expect(result.length).toEqual(4);
    });

    // This test is very important. It proves the code adds the provider selected on our appointment service but is not in the appointment provider list.
    it('processAppointmentServiceProviders when seriviceTransaction contains a value not in the providers list add the value to the list', () => {
        const providers = [
            '1',
            '4',
            '7',
            '56'
        ];

        const result = service.processAppointmentServiceProviders({ ProviderUserId: '8' }, providers);
        expect(result.length).toEqual(5);
    });

    it('filterProvidersForServicesWithAppointments when providerList is null return empty list', () => {
        const result = service.filterProvidersForServicesWithAppointments(null, []);
        expect(result).toEqual([]);
    });

    it('filterProvidersForServicesWithAppointments when appointmentProviderIds is null return empty list', () => {
        const result = service.filterProvidersForServicesWithAppointments(null, []);
        expect(result).toEqual([]);
    });

    it('filterProvidersForServicesWithAppointments when providerList does not contain items return empty list', () => {
        const tempProviderList = [];
        const providerIdList = [
            '1'
        ];
        const result = service.filterProvidersForServicesWithAppointments(tempProviderList, providerIdList);
        expect(result).toEqual([]);
    });

    it('filterProvidersForServicesWithAppointments when appointmentProviderIds does not contain items return empty list', () => {
        const tempProviderList = [
            {
                UserId: '1'
            }
        ];
        const providerIdList = [];
        const result = service.filterProvidersForServicesWithAppointments(tempProviderList, providerIdList);
        expect(result).toEqual([]);
    });

    it('filterProvidersForServicesWithAppointments when no providerList value match the provided appointmentProviderIds return empty list', () => {
        const providerIdList = [
            '12',
            '14'
        ];
        const result = service.filterProvidersForServicesWithAppointments(providerList, providerIdList);
        expect(result).toEqual([]);
    });

    it('filterProvidersForServicesWithAppointments when providerList and appointmentProviderIds have matching values return those values in a list', () => {
        const providerIdList = [
            '2',
            '4'
        ];
        const result = service.filterProvidersForServicesWithAppointments(providerList, providerIdList);
        expect(result.length).toEqual(2);
        expect(result[0]).toEqual({ UserId: '2' });
        expect(result[1]).toEqual({ UserId: '4' });
    });

    it('formatProviderPropertiesForServices returns empty list when providerList is null', () => {
        const result = service.formatProviderPropertiesForServices(null);
        expect(result).toEqual([]);
    });

    it('formatProviderPropertiesForServices returns Name and FullName properties with first and last name when no Professional Designation is given', () => {
        const providers = [
            {
                UserId: '10',
                FirstName: 'First',
                LastName: 'Last'
            }
        ];
        const result = service.formatProviderPropertiesForServices(providers);
        expect(result[0].Name).toEqual('First Last');
        expect(result[0].FullName).toEqual('First Last');
    });

    it('formatProviderPropertiesForServices returns Name with first and last name and Professional Designation when it is provided given', () => {
        const providers = [
            {
                UserId: '10',
                FirstName: 'First',
                LastName: 'Last',
                ProfessionalDesignation: 'Dr'
            }
        ];
        const result = service.formatProviderPropertiesForServices(providers);
        expect(result[0].Name).toEqual('First Last, Dr');
    });

    it('formatProviderPropertiesForServices returns ProviderId as UserId value if ProviderId is null', () => {
        const providers = [
            {
                UserId: '10',
                FirstName: 'First',
                LastName: 'Last',
                ProviderId: null
            }
        ];
        const result = service.formatProviderPropertiesForServices(providers);
        expect(result[0].ProviderId).toEqual('10');
    });

    it('formatProviderPropertiesForServices returns ProviderId as UserId value if ProviderId is empty string', () => {
        const providers = [
            {
                UserId: '10',
                FirstName: 'First',
                LastName: 'Last',
                ProviderId: ''
            }
        ];
        const result = service.formatProviderPropertiesForServices(providers);
        expect(result[0].ProviderId).toEqual('10');
    });

    it('formatProviderPropertiesForServices returns ProviderId as ProviderId value if ProviderId is not null or empty string', () => {
        const providers = [
            {
                UserId: '10',
                FirstName: 'First',
                LastName: 'Last',
                ProviderId: 'value'
            }
        ];
        const result = service.formatProviderPropertiesForServices(providers);
        expect(result[0].ProviderId).toEqual('value');
    });
});