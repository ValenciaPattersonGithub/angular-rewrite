describe('ProviderOnClaimsFactory test ->', function () {
  var factory;

  beforeEach(module('Soar.Schedule', function ($provide) {}));

  // list returned from preferredProviders filter
  var mockPreferredProvidersList = [
    {
      UserId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      Name: 'Bob Jones',
      IsPreferred: false,
      Locations: [
        {
          LocationId: 2,
          ProviderTypeId: 1,
          ProviderOnClaimsRelationship: 2,
          ProviderOnClaimsId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
        },
      ],
    },
    {
      UserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      Name: 'Sid Jones',
      IsPreferred: false,
      Locations: [
        {
          LocationId: 2,
          ProviderTypeId: 1,
          ProviderOnClaimsRelationship: 1,
          ProviderOnClaimsId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
        },
      ],
    },
    {
      UserId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      Name: 'Larry Jones',
      IsPreferred: false,
      Locations: [{ LocationId: 2, ProviderTypeId: 3 }],
    },
    {
      UserId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      Name: 'Pat Jones',
      IsPreferred: false,
      Locations: [{ LocationId: 2, ProviderTypeId: 1 }],
    },
    {
      UserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      Name: 'Sylvia Jones',
      IsPreferred: false,
      Locations: [{ LocationId: 2, ProviderTypeId: 2 }],
    },
  ];

  var providerUser = {
    UserId: 'test UserId',
    UserLocationSetup: { ProviderOnClaimsRelationship: 2 },
  };
  var serviceTransaction = {
    ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
    ProviderUserId: providerUser.UserId,
    LocationId: 2,
  };

  beforeEach(inject(function (ProviderOnClaimsFactory) {
    factory = ProviderOnClaimsFactory;
  }));

  it('should exist', function () {
    expect(factory).not.toBeNull();
  });

  describe('setProviderOnClaimsForService function ->', function () {
    describe('when serviceTransaction.ProviderUserId is null ->', function () {
      var providers = [];
      var serviceTransaction = {};
      beforeEach(function () {
        providers = _.cloneDeep(mockPreferredProvidersList);
        serviceTransaction = {
          ProviderOnClaimsId: null,
          ProviderUserId: null,
        };
      });

      it('should not set ProviderOnClaimsId', function () {
        factory.setProviderOnClaimsForService(serviceTransaction, providers);
        expect(serviceTransaction.ProviderOnClaimsId).toBe(null);
      });
    });

    describe('when provider of serviceTransaction has ProviderOnClaimsRelationship set to Self ->', function () {
      var providers = [];
      beforeEach(function () {
        providers = _.cloneDeep(mockPreferredProvidersList);
      });

      it('should set ProviderOnClaimsId to ProviderId', function () {
        serviceTransaction.ProviderUserId = providers[1].UserId;
        //providers[0].Locations[0].ProviderOnClaimsRelationship=1;

        factory.setProviderOnClaimsForService(serviceTransaction, providers);
        expect(serviceTransaction.ProviderOnClaimsId).toEqual(
          serviceTransaction.ProviderUserId
        );
      });
    });

    describe('when provider of serviceTransaction has ProviderOnClaimsRelationship set to Other ->', function () {
      var providers = [];
      beforeEach(function () {
        providers = _.cloneDeep(mockPreferredProvidersList);
      });

      it('should set ProviderOnClaimsId to provider.UserLocationSetup.ProviderOnClaimsId', function () {
        serviceTransaction.ProviderUserId = providers[0].UserId;
        //providers[0].Locations[0].ProviderOnClaimsRelationship=2;
        //providers[0].Locations[0].ProviderOnClaimsId=providers[1].ProviderId;

        factory.setProviderOnClaimsForService(serviceTransaction, providers);
        expect(serviceTransaction.ProviderOnClaimsId).toEqual(
          providers[1].UserId
        );
      });
    });
  });
});
