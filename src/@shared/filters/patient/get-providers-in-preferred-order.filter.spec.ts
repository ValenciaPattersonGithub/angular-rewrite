import { GetProvidersInPreferredOrderFilter } from './get-providers-in-preferred-order.filter';

let mockListHelper = {
    findItemByFieldValue: jasmine.createSpy().and.returnValue({}), get: jasmine.createSpy().and.returnValue({})
};

describe('getProvidersInPreferredOrderFilter', () => {
    var providers;
    beforeEach(() => {
        providers = [
            {
                Name: "Name",
                FullName: "FullName",
                UserId: "UserId",
                IsActive: true,
                ProviderTypeId: 1,
                FirstName: "FirstName",
                LastName: "LastName",
                ProfessionalDesignation: "ProfessionalDesignation",
                UserCode: "UserCode",
                ProviderOnClaimsRelationship: "ProviderOnClaimsRelationship",
                ProviderOnClaimsId: "ProviderOnClaimsId",
                Locations: [{ LocationId: '1234' }]
            }
        ];
    });

    it('create an instance', () => {
        const filter = new GetProvidersInPreferredOrderFilter(mockListHelper);
        expect(filter).toBeTruthy();
    });

    it("should copy correct properties", function () {
        const filter = new GetProvidersInPreferredOrderFilter(mockListHelper);

        var name = providers[0].FirstName + ' ' + providers[0].LastName + ', ' + providers[0].ProfessionalDesignation;
        var fullName = providers[0].FirstName + ' ' + providers[0].LastName;
        var resultProviders = filter.transform(providers, {}, '1234');

        expect(resultProviders).not.toBeNull();
        expect(resultProviders.length).toEqual(1);
        expect(resultProviders[0].Name).toEqual(name);
        expect(resultProviders[0].FullName).toEqual(fullName);
        expect(resultProviders[0].ProviderId).toEqual(providers[0].UserId);
        expect(resultProviders[0].IsActive).toEqual(providers[0].IsActive);
        expect(resultProviders[0].FirstName).toEqual(providers[0].FirstName);
        expect(resultProviders[0].LastName).toEqual(providers[0].LastName);
        expect(resultProviders[0].ProfessionalDesignation).toEqual(providers[0].ProfessionalDesignation);
        expect(resultProviders[0].UserCode).toEqual(providers[0].UserCode);
    });
});