// uncommit and add _references file to use test explorer to see the tests
///// <reference path="../../Test/_references.js" />

// Note some tests disabled until after stateListFactory is not using hard coded values.

// top level test suite
describe('common-factories tests ->', function () {
  var globalSearchService, globalSearchFactory;

  var mockRecentListResponse = {
    Value: null,
    Count: 0,
  };

  var mockRecentSaveResponse = {
    MostRecentId: 'e928ed50-1c73-4836-8a07-11d4ac39e947',
    MostRecentTypeId: 'Person',
    ValueEntered: '123456789',
    MostRecentAccessedDateTime: '2015-01-01',
  };

  // before each set up any definitions to be createed before the specs are run...
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module(function ($provide) {
      globalSearchService = {
        MostRecent: {
          get: jasmine.createSpy().and.returnValue(mockRecentListResponse),
          save: jasmine.createSpy().and.returnValue(mockRecentSaveResponse),
        },
      };
      $provide.value('GlobalSearchServices', globalSearchService);
    })
  );

  describe('StaticData ->', function () {
    // #region Test Data

    // #region Alert Icon Data

    var iconList = [
      { AlertIconId: 0, Name: 'fa-asterisk' },
      { AlertIconId: 1, Name: 'far fa-frown' },
      { AlertIconId: 2, Name: 'far fa-smile' },
      { AlertIconId: 3, Name: 'fa-eye' },
    ];

    // #endregion

    // #region Department Data

    var departmentList = [
      { DepartmentId: 1, Name: 'Department 1' },
      { DepartmentId: 2, Name: 'Department 2' },
      { DepartmentId: 3, Name: 'Department 3' },
    ];

    // #endregion

    // #region Phone Type Data

    var phoneTypesList = [
      { PhoneTypeId: 1, Name: 'Phone 1' },
      { PhoneTypeId: 2, Name: 'Phone 2' },
      { PhoneTypeId: 3, Name: 'Phone 3' },
    ];

    // #endregion

    // #region Provider Type Data

    var providerTypesList = [
      { ProviderTypeId: 1, Name: 'Provider Type 1' },
      { ProviderTypeId: 2, Name: 'Provider Type 2' },
      { ProviderTypeId: 3, Name: 'Provider Type 3' },
    ];

    // #endregion

    // #region Referral Type Data

    var referralTypesList = [
      { Id: 1, Name: 'Referral Type 1' },
      { Id: 2, Name: 'Referral Type 2' },
      { Id: 3, Name: 'Referral Type 3' },
    ];

    // #endregion

    // #region Taxonomy Code Data

    var taxonomyCodesList = [
      {
        TaxonomyCodeId: 1,
        Category: 'Dentist',
        Code: '122300000X',
        IsDentalSpecialty: true,
      },
      {
        TaxonomyCodeId: 2,
        Category: 'General Practice',
        Code: '1223G0001X',
        IsDentalSpecialty: true,
      },
      {
        TaxonomyCodeId: 3,
        Category: 'Dental Public Health',
        Code: '1223D0001X',
        IsDentalSpecialty: true,
      },
    ];

    // #endregion

    // #region State Data

    var statesList = [
      { StateId: 1, Name: 'Florida', Abbreviation: 'FL' },
      { StateId: 2, Name: 'California', Abbreviation: 'CA' },
      { StateId: 3, Name: 'Arizona', Abbreviation: 'AZ' },
      { StateId: 4, Name: 'Illinois', Abbreviation: 'IL' },
    ];

    // #endregion

    // #endregion

    var staticData = null;
    var staticDataServiceMock = {};
    var toastrFactoryMock = {};
    var defers = {};
    var $rootScope, $q, $timeout;

    function createService(name) {
      staticDataServiceMock[name] = jasmine
        .createSpy()
        .and.callFake(function () {
          var deferred = $q.defer();
          defers[name] = deferred;
          return { $promise: deferred.promise };
        });
    }

    // provide the stateListService and have it return the stateList when called
    beforeEach(
      module('common.services', function ($provide) {
        $provide.value('StaticDataService', staticDataServiceMock);

        toastrFactoryMock = {
          error: jasmine.createSpy().and.returnValue(''),
        };
        $provide.value('toastrFactory', toastrFactoryMock);

        globalSearchService = {
          MostRecent: {
            get: jasmine.createSpy().and.returnValue(mockRecentListResponse),
            save: jasmine.createSpy().and.returnValue(mockRecentSaveResponse),
          },
        };
        $provide.value('GlobalSearchServices', globalSearchService);
      })
    );

    beforeEach(inject(function ($injector, _$q_, _$rootScope_, _$timeout_) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      $timeout = _$timeout_;

      createService('AlertIcons');
      createService('Departments');
      createService('PhoneTypes');
      createService('ProviderTypes');
      createService('ReferralTypes');
      createService('States');
      createService('TaxonomyCodes');

      staticData = $injector.get('StaticData');
    }));

    it('should exist', function () {
      expect(staticData).not.toBeNull();
    });

    describe('getData function ->', function () {
      var alertIcons;

      it('should call toastrFactory if staticType.GetFunction() fails', function () {
        alertIcons = staticData.AlertIcons();
        defers.AlertIcons.reject('Error');
        $rootScope.$apply();
        expect(toastrFactoryMock.error).toHaveBeenCalled();
      });

      describe('when localStorage value is available ->', function () {
        var cachedIcons = [
          { AlertIconId: 4, Name: 'test1' },
          { AlertIconId: 5, Name: 'test2' },
        ];

        beforeEach(function (done) {
          localStorage.setItem(
            'cachedAlertIcons_v2.1',
            JSON.stringify(cachedIcons)
          );
          alertIcons = staticData.AlertIcons();
          alertIcons.then(function () {
            done();
          });
          //defers.AlertIcons.resolve({ Value: iconList });
          $timeout.flush();
          $rootScope.$apply();
        });

        it('should return the value from localStorage', function () {
          expect(alertIcons.values).toEqual(cachedIcons);
        });

        it('should not call the service', function () {
          expect(staticDataServiceMock.AlertIcons).not.toHaveBeenCalled();
        });
      });
    });

    describe('AlertIcons ->', function () {
      var alertIcons;
      beforeEach(function (done) {
        alertIcons = staticData.AlertIcons();
        alertIcons.then(function () {
          done();
        });
        defers.AlertIcons.resolve({ Value: iconList });
        $rootScope.$apply();
      });

      it('should exist', function () {
        expect(alertIcons).not.toBeNull();
      });

      describe('getClassById function ->', function () {
        it('should be a function', function () {
          expect(alertIcons.getClassById).toBeDefined();
        });

        it('should return icon name if id exists', function () {
          var result = alertIcons.getClassById('0');
          expect(result).toBe('fa-asterisk');
        });

        it('should return empty string if id does not exist', function () {
          var result = alertIcons.getClassById('-1');
          expect(result).toBe('');
        });
      });

      describe('values property ->', function () {
        it('should exist', function () {
          expect(alertIcons.values).toBeDefined();
        });

        it('should contain mocked data', function () {
          expect(alertIcons.values).toEqual(iconList);
        });
      });
    });

    describe('Departments ->', function () {
      var departments;
      beforeEach(function (done) {
        departments = staticData.Departments();
        departments.then(function () {
          done();
        });
        defers.Departments.resolve({ Value: departmentList });
        $rootScope.$apply();
      });

      it('should exist', function () {
        expect(departments).not.toBeNull();
      });

      describe('values property ->', function () {
        it('should exist', function () {
          expect(departments.values).toBeDefined();
        });

        it('should contain mocked data', function () {
          expect(departments.values).toEqual(departmentList);
        });
      });
    });

    describe('PhoneTypes ->', function () {
      var phoneTypes;
      beforeEach(function (done) {
        phoneTypes = staticData.PhoneTypes();
        phoneTypes.then(function () {
          done();
        });
        defers.PhoneTypes.resolve({ Value: phoneTypesList });
        $rootScope.$apply();
      });

      it('should exist', function () {
        expect(phoneTypes).not.toBeNull();
      });

      describe('values property ->', function () {
        it('should exist', function () {
          expect(phoneTypes.values).toBeDefined();
        });

        it('should contain mocked data', function () {
          expect(phoneTypes.values).toEqual(phoneTypesList);
        });
      });
    });

    describe('ProviderTypes ->', function () {
      var providerTypes;
      beforeEach(function (done) {
        providerTypes = staticData.ProviderTypes();
        providerTypes.then(function () {
          done();
        });
        defers.ProviderTypes.resolve({ Value: providerTypesList });
        $rootScope.$apply();
      });

      it('should exist', function () {
        expect(providerTypes).not.toBeNull();
      });

      describe('values property ->', function () {
        it('should exist', function () {
          expect(providerTypes.values).toBeDefined();
        });

        it('should contain mocked data', function () {
          expect(providerTypes.values).toEqual(providerTypesList);
        });
      });
    });

    describe('ReferralTypes ->', function () {
      var referralTypes;
      beforeEach(function (done) {
        referralTypes = staticData.ReferralTypes();
        referralTypes.then(function () {
          done();
        });
        defers.ReferralTypes.resolve({ Value: referralTypesList });
        $rootScope.$apply();
      });

      it('should exist', function () {
        expect(referralTypes).not.toBeNull();
      });

      describe('values property ->', function () {
        it('should exist', function () {
          expect(referralTypes.values).toBeDefined();
        });

        it('should contain mocked data', function () {
          expect(referralTypes.values).toEqual(referralTypesList);
        });
      });
    });

    describe('States ->', function () {
      var states;
      beforeEach(function (done) {
        states = staticData.States();
        states.then(function () {
          done();
        });
        defers.States.resolve({ Value: statesList });
        $rootScope.$apply();
      });

      it('should exist', function () {
        expect(states).not.toBeNull();
      });

      describe('values property ->', function () {
        it('should exist', function () {
          expect(states.values).toBeDefined();
        });

        it('should contain mocked data', function () {
          expect(states.values).toEqual(statesList);
        });
      });
    });

    describe('TaxonomyCodes ->', function () {
      var taxonomyCodes;
      beforeEach(function (done) {
        taxonomyCodes = staticData.TaxonomyCodes();
        taxonomyCodes.then(function () {
          done();
        });
        defers.TaxonomyCodes.resolve({ Value: taxonomyCodesList });
        $rootScope.$apply();
      });

      it('should exist', function () {
        expect(taxonomyCodes).not.toBeNull();
      });

      describe('values property ->', function () {
        it('should exist', function () {
          expect(taxonomyCodes.values).toBeDefined();
        });

        it('should contain mocked data', function () {
          expect(taxonomyCodes.values).toEqual(taxonomyCodesList);
        });
      });
    });

    describe('AppointmentStatuses ->', function () {
      it('should return an object containing the list of standard set of appointment status and an associated Enum object', function () {
        var statusEnum = {
          Unconfirmed: 0,
          ReminderSent: 1,
          Confirmed: 2,
          InReception: 6,
          Completed: 3,
          InTreatment: 4,
          ReadyForCheckout: 5,
          Late: 9,
          CheckOut: 10,
          StartAppointment: 11,
          Unschedule: 12,
          AddToClipboard: 13,
        };

        var resultStatusObject = staticData.AppointmentStatuses();

        expect(resultStatusObject.List[0]).toEqual({
          Value: 0,
          Description: 'Unconfirmed',
          Icon: 'fas fa-question',
        });
        expect(resultStatusObject.List[1]).toEqual({
          Value: 1,
          Description: 'Reminder Sent',
          Icon: 'far fa-bell',
        });
        expect(resultStatusObject.List[2]).toEqual({
          Value: 2,
          Description: 'Confirmed',
          Icon: 'far fa-check',
          SectionEnd: true,
        });
        expect(resultStatusObject.List[3]).toEqual({
          Value: 6,
          Description: 'In Reception',
          Icon: 'far fa-watch',
        });
        expect(resultStatusObject.List[4]).toEqual({
          Value: 3,
          Description: 'Completed',
          Icon: 'far fa-calendar-check',
        });
        expect(resultStatusObject.List[5]).toEqual({
          Value: 4,
          Description: 'In Treatment',
          Icon: 'fas fa-user-md',
        });
        expect(resultStatusObject.List[6]).toEqual({
          Value: 5,
          Description: 'Ready for Check out',
          Icon: 'far fa-shopping-cart',
        });
        expect(resultStatusObject.List[7]).toEqual({
          Value: 9,
          Description: 'Late',
          Icon: 'fas fa-exclamation',
        });
        expect(resultStatusObject.List[8]).toEqual({
          Value: 10,
          Description: 'Check out',
          Icon: 'fa-share',
        });
        expect(resultStatusObject.List[10]).toEqual({
          Value: 12,
          Description: 'Unschedule',
        });
        expect(resultStatusObject.List[11]).toEqual({
          Value: 13,
          Description: 'Add to Clipboard',
        });

        expect(resultStatusObject.Enum).toEqual(statusEnum);
      });
    });
  });

  // tests for toastrFactory
  describe('toastrFactory ->', function () {
    // inject the factory
    var toastrFactory;
    beforeEach(inject(function ($injector) {
      toastrFactory = $injector.get('toastrFactory');
    }));

    it('should exist', function () {
      expect(toastrFactory).not.toBeNull();
    });

    it('should have an error function', function () {
      expect(angular.isFunction(toastrFactory.error)).toBe(true);
    });

    it('should have a success function', function () {
      expect(angular.isFunction(toastrFactory.success)).toBe(true);
    });
  });

  // tests for ListHelper
  describe('ListHelper ->', function () {
    // inject the factory
    var listHelper;
    beforeEach(inject(function ($injector) {
      listHelper = $injector.get('ListHelper');
    }));

    var listOne = [
      { ProductId: 1, Name: 'Product1' },
      { ProductId: 2, Name: 'Product2' },
      { ProductId: 3, Name: 'Product3' },
      { ProductId: 4, Name: 'Product4' },
    ];

    var listTwo = [
      { Id: 1, CustomerName: 'Carol', Age: '36' },
      { Id: 2, CustomerName: 'Bob', Age: '24' },
      { Id: 3, CustomerName: 'Ted', Age: '36' },
      { Id: 4, CustomerName: 'Alice', Age: '48' },
    ];

    it('should exist', function () {
      expect(listHelper).not.toBeNull();
    });

    it('should have a findItemByFieldValue function', function () {
      expect(angular.isFunction(listHelper.findItemByFieldValue)).toBe(true);
    });

    it('should have a findIndexByFieldValue function', function () {
      expect(angular.isFunction(listHelper.findIndexByFieldValue)).toBe(true);
    });

    it('findItemByFieldValue should return matching item  when field name match', function () {
      var val = listHelper.findItemByFieldValue(listOne, 'Name', 'Product1');
      expect(val.ProductId).toBe(1);
      val = listHelper.findItemByFieldValue(listOne, 'Name', 'Product3');
      expect(val.ProductId).toBe(3);
      val = listHelper.findItemByFieldValue(listTwo, 'CustomerName', 'Carol');
      expect(val.Id).toBe(1);
    });

    it('findItemByFieldValue should return null when no field name match', function () {
      var val = listHelper.findItemByFieldValue(
        listTwo,
        'CustomerName',
        'Carol S'
      );
      expect(val).toBe(null);
    });

    it('findIndexByFieldValue should return matching index when field name match', function () {
      var val = listHelper.findIndexByFieldValue(listOne, 'Name', 'Product1');
      expect(val).toBe(0);
      val = listHelper.findIndexByFieldValue(listOne, 'Name', 'Product3');
      expect(val).toBe(2);
      val = listHelper.findIndexByFieldValue(listTwo, 'CustomerName', 'Carol');
      expect(val).toBe(0);
    });

    it('findIndexByFieldValue should return -1 when no field name match', function () {
      var val = listHelper.findIndexByFieldValue(
        listTwo,
        'CustomerName',
        'Carol Ann'
      );
      expect(val).toBe(-1);
    });

    describe('findAllByPredicate ->', function () {
      it('should pass each item in the list to the predicate function provided and return a list containing each item for which the predicate function returned true', function () {
        var isNumber = angular.isNumber;
        var isString = angular.isString;

        var list = [
          'A',
          1,
          new Date(2001, 7, 8),
          -2,
          new Date(2015, 0, 1).toISOString(),
          3.333,
        ];

        var numberList = listHelper.findAllByPredicate(list, isNumber);
        var stringList = listHelper.findAllByPredicate(list, isString);

        expect(numberList).toEqual([1, -2, 3.333]);
        expect(stringList).toEqual(['A', new Date(2015, 0, 1).toISOString()]);
      });
    });

    describe('findIndexByPredicate ->', function () {
      it('should pass each item in the list to the predicate function provided and return the first index for which the predicate function returned true', function () {
        var isDate = angular.isDate;

        var list = [
          'A',
          1,
          new Date(2001, 7, 8),
          -2,
          new Date(2015, 0, 1).toISOString(),
          3.333,
        ];

        var indexOfDate = listHelper.findIndexByPredicate(list, isDate);

        expect(indexOfDate).toEqual(2);
      });
    });

    describe('findItemByPredicate ->', function () {
      it('should pass each item in the list to the predicate function provided and return the first item for which the predicate function returned true', function () {
        var isDate = angular.isDate;

        var list = [
          'A',
          1,
          new Date(2001, 7, 8),
          -2,
          new Date(2015, 0, 1).toISOString(),
          3.333,
        ];

        var dateFound = listHelper.findItemByPredicate(list, isDate);

        expect(dateFound).toEqual(new Date(2001, 7, 8));
      });
    });

    describe('createConcatenatedString ->', function () {
      it('should return an empty string if the display value is undefined', function () {
        var result = listHelper.createConcatenatedString(
          [{ Id: 'Anything' }],
          null,
          ' '
        );

        expect(result).toEqual('');
      });

      it('should call the display function if angular.isFunction returns true', function () {
        angular.isFunction = jasmine.createSpy().and.returnValue(true);

        var displayFunction = jasmine
          .createSpy()
          .and.returnValue('Something Calulated');

        var result = listHelper.createConcatenatedString(
          [{ Id: 'Anything' }],
          displayFunction,
          ' '
        );

        expect(displayFunction).toHaveBeenCalledWith({ Id: 'Anything' });
        expect(result).toEqual('Something Calulated');
      });

      it('should treat the display value as a property name if angular.isFunction returns false', function () {
        angular.isFunction = jasmine.createSpy().and.returnValue(false);

        var result = listHelper.createConcatenatedString(
          [{ Id: 'Anything' }],
          'Id',
          ' '
        );

        expect(result).toEqual('Anything');
      });

      it('should separate values that are not null or empty with the delimiter specified', function () {
        angular.isFunction = jasmine.createSpy().and.returnValue(true);

        var displayFunction = jasmine.createSpy().and.callFake(function (item) {
          if (item.Id % 3 == 1) {
            return item.Id;
          } else if (item.Id % 3 == 2) {
            return '';
          } else {
            return null;
          }
        });

        var list = [
          { Id: 6 },
          { Id: 5 },
          { Id: 4 },
          { Id: 3 },
          { Id: 2 },
          { Id: 1 },
        ];
        var expectedValue = '4***1';

        var result = listHelper.createConcatenatedString(
          list,
          displayFunction,
          '***'
        );

        expect(result).toEqual(expectedValue);
      });
    });
  });

  describe('Page ->', function () {
    var mockLocation = {
      path: jasmine.createSpy().and.returnValue('/SomePath/'),
    };

    var mockDISPLAY_AS = 'something';

    var mockModalFactory = {
      open: jasmine.createSpy(),
    };

    var mockDiscardService = {
      getRelevantController: jasmine
        .createSpy()
        .and.returnValue('some controller'),
      hasChanges: jasmine.createSpy().and.returnValue(true),
    };

    var mockLocalize = {
      getLocalizedString: jasmine.createSpy(),
    };

    var mockPaymentGatewayFactory = {
      isWindowOpen: jasmine.createSpy('PaymentGatewayFactory.IsWindowOpen'),
    };

    beforeEach(
      module(function ($provide) {
        $provide.value('$location', mockLocation);

        $provide.value('ModalFactory', mockModalFactory);

        $provide.value('DiscardService', mockDiscardService);

        $provide.value('localize', mockLocalize);

        $provide.value('DISPLAY_AS', mockDISPLAY_AS);

        $provide.value('PaymentGatewayFactory', mockPaymentGatewayFactory);
      })
    );

    // inject the factory
    var page;
    beforeEach(inject(function ($injector) {
      page = $injector.get('Page');
    }));

    it('should exist', function () {
      expect(page).not.toBeNull();
    });

    it('should have a Title function', function () {
      expect(angular.isFunction(page.Title)).toBe(true);
    });

    it('should have a OnRouteChangeStart function', function () {
      expect(angular.isFunction(page.OnRouteChangeStart)).toBe(true);
    });

    it('should have a OnRouteChangeSuccess function', function () {
      expect(angular.isFunction(page.OnRouteChangeSuccess)).toBe(true);
    });

    it('should have a OnLocationChangeStart function', function () {
      expect(angular.isFunction(page.OnLocationChangeStart)).toBe(true);
    });

    it('should have a BeforeExit function', function () {
      expect(angular.isFunction(page.BeforeExit)).toBe(true);
    });

    describe('Title ->', function () {
      it('should return the last value passed to the it when no value is passed to it', function () {
        expect(page.Title()).toBe(undefined);

        page.Title('Some Value');
        expect(page.Title()).toEqual('Some Value');

        page.Title('Some Different Value');
        expect(page.Title()).toEqual('Some Different Value');
      });
    });

    describe('BeforeExit ->', function () {
      describe('when the OnRouteChangeStart event has NOT been fired', function () {
        it('should NOT call discardService.getRelevantController if the page.routeInfo was not set by the OnRouteChangeStart event', function () {
          expect(
            mockDiscardService.getRelevantController
          ).not.toHaveBeenCalled();
        });

        it('should NOT call discardService.hasChanges if the page.routeInfo was not set by the OnRouteChangeStart event', function () {
          expect(mockDiscardService.hasChanges).not.toHaveBeenCalled();
        });
      });
      var e;
      describe('when the OnRouteChangeStart event has been fired', function () {
        beforeEach(function () {
          e = $.Event('keydown');
          spyOn(e, 'preventDefault');
          var nextRoute = {
            controller: 'any controller',
            scope: 'any scope',
          };
          page.OnRouteChangeStart(null, nextRoute, nextRoute);
          mockLocalize.getLocalizedString = jasmine
            .createSpy()
            .and.returnValue('Some Prompt');
        });

        it('should call discardService.getRelevantController with the controller on page.routeInfo that was set by the OnRouteChangeStart event', function () {
          page.BeforeExit(e);
          expect(mockDiscardService.getRelevantController).toHaveBeenCalledWith(
            'any controller'
          );
        });

        it('should call discardService.hasChanges with the scope on page.routeInfo that was set by the OnRouteChangeStart event', function () {
          page.BeforeExit(e);
          expect(mockDiscardService.hasChanges).toHaveBeenCalledWith(
            'some controller',
            'any scope',
            false
          );
        });

        it('should return the localized message from localize.getLocalizedString', function () {
          var result = page.BeforeExit(e);
          expect(mockLocalize.getLocalizedString).toHaveBeenCalled();
          expect(result).toEqual('Some Prompt');
        });
      });

      describe('when paymentGatewayFactory is called', function () {
        it('should return a message if call indicates open edge window is open', function () {
          mockPaymentGatewayFactory.isWindowOpen.and.returnValue(true);
          var result = page.BeforeExit(e);
          expect(mockPaymentGatewayFactory.isWindowOpen).toHaveBeenCalled();
          expect(result).toEqual('open edge is in progress, are you sure?');
        });

        it('should not return a message if call indicates no open edge window is open', function () {
          mockPaymentGatewayFactory.isWindowOpen.and.returnValue(false);
          var result = page.BeforeExit(e);
          expect(mockPaymentGatewayFactory.isWindowOpen).toHaveBeenCalled();
          expect(result).toEqual(undefined);
        });
      });
    });
  });

  describe('ModalFactory ->', function () {
    var mockRootScope = {
      $new: jasmine.createSpy().and.returnValue({}),
      $watch: jasmine.createSpy(),
      $on: jasmine.createSpy(),
    };

    var mockTemplateCache = {
      put: jasmine.createSpy(),
    };

    var mockModal = {
      open: jasmine.createSpy().and.returnValue({
        result: 'some result',
      }),
    };

    var mockPatientServices = {};

    var mockModalDataFactory = {};

    beforeEach(
      module(function ($provide) {
        $provide.value('$rootScope', mockRootScope);

        $provide.value('$templateCache', mockTemplateCache);

        $provide.value('$uibModal', mockModal);

        $provide.value('PatientServices', mockPatientServices);

        $provide.value('ModalDataFactory', mockModalDataFactory);
      })
    );

    // inject the factory
    var modalFactory;
    beforeEach(inject(function () {
      modalFactory = _modalFactoryProvider_.$get();
    }));

    it('should exist', function () {
      expect(modalFactory).not.toBeNull();
    });

    describe('LocationChangeForStartAppointmentModal function ->', function () {
      var expectedResult;
      beforeEach(function () {
        expectedResult = 'confirmModalResult';
        modalFactory.ConfirmModal = jasmine
          .createSpy()
          .and.returnValue(expectedResult);
      });

      it('should call ConfirmModal with correct parameters', function () {
        var result = modalFactory.LocationChangeForStartAppointmentModal();
        expect(result).toBe(expectedResult);
        expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
          'Location Change',
          "Your active location is different than this appointment's scheduled location. When you start this appointment, your active location will be changed to the appointment's location. Do you wish to proceed?",
          'Yes',
          'No'
        );
      });
    });

    describe('LocationMismatchOnOverrideModal function ->', function () {
      var expectedResult;
      beforeEach(function () {
        expectedResult = 'confirmModalResult';
        modalFactory.ConfirmModal = jasmine
          .createSpy()
          .and.returnValue(expectedResult);
      });

      it('should call ConfirmModal with correct parameters', function () {
        var result = modalFactory.LocationMismatchOnOverrideModal();
        expect(result).toBe(expectedResult);
        expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
          'Not Authorized',
          'The user is not authorized to access the specified location.',
          'OK'
        );
      });
    });
  });

  // tests for SearchFactory
  describe('SearchFactory ->', function () {
    var mockSearchService;
    var searchResults = [
      { ProductId: 1, Name: 'Product1' },
      { ProductId: 2, Name: 'Product2' },
      { ProductId: 3, Name: 'Product3' },
      { ProductId: 4, Name: 'Product4' },
    ];

    beforeEach(function () {
      mockSearchService = {
        query: function () {
          return searchResults;
        },
      };

      module(function ($provide) {
        $provide.value('mockSearchService', mockSearchService);
      });
    });

    //beforeEach(function() {
    //    var store = {};
    //    spyOn(anySearchService, 'query').and.callFake(function() {
    //        return searchResults;
    //    });
    //});

    // inject the factory
    var searchFactory;
    beforeEach(inject(function ($injector) {
      searchFactory = $injector.get('SearchFactory');
    }));

    it('should exist', function () {
      expect(searchFactory).not.toBeNull();
    });

    it('should have a GetDefaultSearchParameters function', function () {
      expect(angular.isFunction(searchFactory.GetDefaultSearchParameters)).toBe(
        true
      );
    });

    it('should have a CreateSearch function', function () {
      expect(angular.isFunction(searchFactory.CreateSearch)).toBe(true);
    });

    it('GetDefaultSearchParameters function should return a default list of search parameters', function () {
      var val = searchFactory.GetDefaultSearchParameters();
      expect(val.search).toBe('');
      expect(val.skip).toBe(0);
      expect(val.descending).toBe(null);
    });

    // Todo search function tests

    it('CreateSearch function should', function () {
      searchFactory.CreateSearch(mockSearchService.query);
    });
  });

  describe(' GlobalSearchFactory ->', function () {
    // inject the factory
    beforeEach(inject(function ($injector) {
      globalSearchFactory = $injector.get('GlobalSearchFactory');
    }));

    it('should exist', function () {
      expect(globalSearchFactory).not.toBeNull();
    });

    describe(' MostRecentPersons function ->', function () {
      it('should have a MostRecentPersons function', function () {
        expect(angular.isFunction(globalSearchFactory.MostRecentPersons)).toBe(
          true
        );
      });
    });

    describe(' SaveMostRecentPerson function ->', function () {
      it('should have a SaveMostRecentPerson function', function () {
        expect(
          angular.isFunction(globalSearchFactory.SaveMostRecentPerson)
        ).toBe(true);
      });
    });
  });

  describe('SurfaceHelper', function () {
    var surfaceHelper;

    beforeEach(inject(function ($injector) {
      surfaceHelper = $injector.get('SurfaceHelper');
    }));

    describe('surfaceCSVStringToSurfaceString ->', function () {
      it('should return correct abbreviated order string for list that contain only summary surfaces', function () {
        var strSelectedServices = 'M';
        var result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('M');
        strSelectedServices = 'M,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MO');
        strSelectedServices = 'D,M,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MOD');
        strSelectedServices = 'D,M,B,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODB');
        strSelectedServices = 'D,M,B5,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODB5');
        strSelectedServices = 'L,D,M,B,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODBL');
        strSelectedServices = 'L,D,M,B5,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODLB5');
        strSelectedServices = 'L5,D,M,B,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODBL5');
        strSelectedServices = 'O,D,B';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DOB');
        strSelectedServices = 'O,L,D,B';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DOBL');
        strSelectedServices = 'O,L5,D,B';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DOBL5');
        strSelectedServices = 'M,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MI');
        strSelectedServices = 'D,M,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MID');
        strSelectedServices = 'D,M,F,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDF');
        strSelectedServices = 'D,M,F5,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDF5');
        strSelectedServices = 'L,D,M,F,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDFL');
        strSelectedServices = 'L,D,M,F5,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDLF5');
        strSelectedServices = 'L5,D,M,F,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDFL5');
        strSelectedServices = 'D,F,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DIF');
        strSelectedServices = 'D,F,I,L';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DIFL');
        strSelectedServices = 'D,F,I,L5';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DIFL5');
      });
      it('should return correct abbreviated order string for list contains both Buccal and Buccal V', function () {
        var strSelectedServices = 'B5,M,B';
        var result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MB5');
        strSelectedServices = 'M,B5,O,B';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MOB5');
        strSelectedServices = 'B,D,M,B5,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODB5');
        strSelectedServices = 'L,B5,D,M,B,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODLB5');
        strSelectedServices = 'L5,B5,D,M,B,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODBL5');
        strSelectedServices = 'L5,B5,L,D,M,B,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODBL5');
        strSelectedServices = 'D,B5,O,B';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DOB5');
        strSelectedServices = 'L,B5,D,B,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DOLB5');
        strSelectedServices = 'L5,B5,D,B,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DOBL5');
        strSelectedServices = 'L5,B5,L,D,B,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DOBL5');
      });
      it('should return correct abbreviated order string for list containing both lingual and lingual V', function () {
        var strSelectedServices = 'L5,M,L';
        var result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('ML5');
        strSelectedServices = 'M,L5,O,L';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MOL5');
        strSelectedServices = 'L,D,M,L5,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODL5');
        strSelectedServices = 'B,L5,D,M,L,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODBL5');
        strSelectedServices = 'L5,B5,D,M,L,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MODLB5');
        strSelectedServices = 'B,L5,D,L,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DOBL5');
        strSelectedServices = 'L5,B5,D,L,O';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DOLB5');
        strSelectedServices = 'M,L5,I,L';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIL5');
        strSelectedServices = 'L,D,M,L5,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDL5');
        strSelectedServices = 'F,L5,D,M,L,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDFL5');
        strSelectedServices = 'L5,F5,D,M,L,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDLF5');
        strSelectedServices = 'L5,F,D,L,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DIFL5');
        strSelectedServices = 'L5,F5,D,L,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DILF5');
      });
      it('should return correct abbreviated order string for list containing both Facial and Facial V', function () {
        var strSelectedServices = 'F5,M,F';
        var result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MF5');
        strSelectedServices = 'M,F5,I,F';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIF5');
        strSelectedServices = 'F,D,M,F5,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDF5');
        strSelectedServices = 'L,F5,D,M,F,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDLF5');
        strSelectedServices = 'L5,F5,D,M,F,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDFL5');
        strSelectedServices = 'L5,F5,D,M,F,I,L';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('MIDFL5');
        strSelectedServices = 'F,D,F5,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DIF5');
        strSelectedServices = 'L,F5,D,F,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DILF5');
        strSelectedServices = 'L5,F5,D,F,I';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DIFL5');
        strSelectedServices = 'L5,F5,D,F,I,L';
        result =
          surfaceHelper.surfaceCSVStringToSurfaceString(strSelectedServices);
        expect(result).toEqual('DIFL5');
      });
    });

    describe('areSurfaceCSVsEqual ->', function () {
      it('should return true if CSV strings are equal', function () {
        var surface1 = 'B,D,O,F5';
        var surface2 = 'F5,O,B,D';
        var result = surfaceHelper.areSurfaceCSVsEqual(surface1, surface2);
        expect(result).toBe(true);
      });
      it('should return false if CSV strings are not equal', function () {
        var surface1 = 'B,D,O,F5,B5';
        var surface2 = 'F5,O,B,D';
        var result = surfaceHelper.areSurfaceCSVsEqual(surface1, surface2);
        expect(result).toBe(false);
      });
      it('should return false if one CSV strings is null', function () {
        var surface1 = 'B,D,O,F5,B5';
        var surface2 = null;
        var result = surfaceHelper.areSurfaceCSVsEqual(surface1, surface2);
        expect(result).toBe(false);
      });
      it('should return true if both CSV strings are null', function () {
        var surface1 = null;
        var surface2 = null;
        var result = surfaceHelper.areSurfaceCSVsEqual(surface1, surface2);
        expect(result).toBe(true);
      });
    });

    describe('validateSelectedSurfaces ->', function () {
      it('should return true when csv surfaces are all in summarySurfaces', function () {
        var summarySurfaces = ['M', 'O', 'D', 'B', 'L', 'B5', 'L5'];

        var csvString = 'B5,L,O,D';
        var result = surfaceHelper.setValidSelectedSurfaces(
          csvString,
          summarySurfaces
        );
        expect(result).toBe(true);
      });
    });

    describe('setValidSelectedSurfaces function --> ', function () {
      var summarySurfaces, flag;
      beforeEach(function () {
        summarySurfaces = ['M', 'O', 'I', 'D', 'B', 'B5', 'F5', 'F', 'L', 'L5'];
      });

      it('should return true if flag is 0', function () {
        summarySurfaces = ['J'];
        var serviceTransaction = {
          Surface: 'MODBL5',
        };
        flag = 0;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MODBL5');
        expect(result).toBe(false);
      });

      it('should return false if serviceTransaction is null', function () {
        summarySurfaces = ['J'];
        var serviceTransaction = null;
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        //expect(serviceTransaction.Surface).toEqual('MODBL5');
        expect(result).toBe(false);
      });

      it('should return false if summarySurfaces does not contain valid surfaces', function () {
        summarySurfaces = ['J'];
        var serviceTransaction = {
          Surface: 'MODBL5',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MODBL5');
        expect(result).toBe(false);
      });

      it('should set serviceTransaction.Surface to  ODB if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'ODB',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('DOB');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  IDF if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'IDF',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('DIF');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MODBL5 if flag is 1', function () {
        var serviceTransaction = { Surface: 'MODBL5' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MODBL5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MIDFL5 if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'MIDFL5',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MIDFL5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MODLB5 if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'MODLB5',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MODLB5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MIDLF5 if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'MIDLF5',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MIDLF5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MODB5 if flag is 1', function () {
        var serviceTransaction = { Surface: 'MODB5' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MODB5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MIDF5 if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'MIDF5',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MIDF5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MBL5 if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'MBL5',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MBL5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MBL if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'MBL',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MBL');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MB5 if flag is 1', function () {
        var serviceTransaction = { Surface: 'MB5' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MB5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  ML5 if flag is 1', function () {
        var serviceTransaction = { Surface: 'ML5' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('ML5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  ML if flag is 1', function () {
        var serviceTransaction = { Surface: 'ML' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('ML');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  MB if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'MB',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('MB');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  DLF5 if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'DLF5',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('DLF5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  DFL5 if flag is 1', function () {
        var serviceTransaction = { Surface: 'DFL5' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('DFL5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  DFL if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'DFL',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('DFL');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  DF5 if flag is 1', function () {
        var serviceTransaction = { Surface: 'DF5' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('DF5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  DL5 if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'DL5',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('DL5');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  DF if flag is 1', function () {
        var serviceTransaction = {
          Surface: 'DF',
        };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('DF');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  DL if flag is 1', function () {
        var serviceTransaction = { Surface: 'DL' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('DL');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  ML if flag is 1', function () {
        var serviceTransaction = { Surface: 'ML' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('ML');
        expect(result).toBe(true);
      });

      it('should set serviceTransaction.Surface to  ML5 if flag is 1', function () {
        var serviceTransaction = { Surface: 'ML5' };
        flag = 1;
        var result = surfaceHelper.setValidSelectedSurfaces(
          serviceTransaction,
          summarySurfaces,
          flag
        );
        expect(serviceTransaction.Surface).toEqual('ML5');
        expect(result).toBe(true);
      });
    });
  });

  describe('RootHelper', function () {
    var rootHelper;

    beforeEach(inject(function ($injector) {
      rootHelper = $injector.get('RootHelper');
    }));

    it('should have a setValidSelectedRoots function', function () {
      expect(angular.isFunction(rootHelper.setValidSelectedRoots)).toBe(true);
    });

    it('should return true if service transaction roots value is DB', function () {
      var serviceTransaction = {
        AccountMemberId: 'e7defcc9-9cd9-477a-80f8-8cceb0f80bbc',
        AffectedAreaId: 3,
        Amount: 12,
        AppointmentId: null,
        CdtCodeName: 'D3331',
        Code: 'D3331',
        Fee: 12,
        invalideTooth: false,
        invalidSurface: false,
        ObjectState: 'Add',
        ProviderUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        Roots: 'DB',
        Tooth: '1',
        ServiceCodeId: 'e3947b6b-e4c1-4ec9-a99c-09eecdd4d13a',
        TransactionTypeId: 1,
        TransactionType: 'Service',
      };

      var rootAbbreviations = '[DB,P,MB]';

      var result = rootHelper.setValidSelectedRoots(
        serviceTransaction,
        rootAbbreviations,
        true
      );
      expect(result).toBe(true);
    });

    it('should return true if service transaction roots values are DB,P ', function () {
      var serviceTransaction = {
        AccountMemberId: 'e7defcc9-9cd9-477a-80f8-8cceb0f80bbc',
        AffectedAreaId: 3,
        Amount: 12,
        AppointmentId: null,
        CdtCodeName: 'D3331',
        Code: 'D3331',
        Fee: 12,
        invalideTooth: false,
        invalidSurface: false,
        ObjectState: 'Add',
        ProviderUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        Roots: 'DB,P',
        Tooth: '1',
        ServiceCodeId: 'e3947b6b-e4c1-4ec9-a99c-09eecdd4d13a',
        TransactionTypeId: 1,
        TransactionType: 'Service',
      };

      var rootAbbreviations = '[DB,P,MB]';
      var result = rootHelper.setValidSelectedRoots(
        serviceTransaction,
        rootAbbreviations,
        true
      );
      expect(result).toBe(true);
    });
    it('should return true if service transaction any root value ', function () {
      var serviceTransaction = {
        AccountMemberId: 'e7defcc9-9cd9-477a-80f8-8cceb0f80bbc',
        AffectedAreaId: 3,
        Amount: 12,
        AppointmentId: null,
        CdtCodeName: 'D3331',
        Code: 'D3331',
        Fee: 12,
        invalideTooth: false,
        invalidSurface: false,
        ObjectState: 'Add',
        ProviderUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        Roots: '',
        Tooth: '1',
        ServiceCodeId: 'e3947b6b-e4c1-4ec9-a99c-09eecdd4d13a',
        TransactionTypeId: 1,
        TransactionType: 'Service',
      };
      var rootAbbreviations = '[DB,P,MB]';
      var result = rootHelper.setValidSelectedRoots(
        serviceTransaction,
        rootAbbreviations,
        true
      );
      expect(result).toBe(true);
    });
    it('should return false if service transaction does not have rootAbbreviations ', function () {
      var serviceTransaction = {
        AccountMemberId: 'e7defcc9-9cd9-477a-80f8-8cceb0f80bbc',
        AffectedAreaId: 3,
        Amount: 12,
        AppointmentId: null,
        CdtCodeName: 'D3331',
        Code: 'D3331',
        Fee: 12,
        invalideTooth: false,
        invalidSurface: false,
        ObjectState: 'Add',
        ProviderUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        Roots: 'DB',
        Tooth: '1',
        ServiceCodeId: 'e3947b6b-e4c1-4ec9-a99c-09eecdd4d13a',
        TransactionTypeId: 1,
        TransactionType: 'Service',
      };
      var rootAbbreviations = '';
      var result = rootHelper.setValidSelectedRoots(
        serviceTransaction,
        rootAbbreviations,
        true
      );
      expect(result).toBe(false);
    });

    it('should return true if isSaveButtonclicked is flase with root value ', function () {
      var serviceTransaction = {
        AccountMemberId: 'e7defcc9-9cd9-477a-80f8-8cceb0f80bbc',
        AffectedAreaId: 3,
        Amount: 12,
        AppointmentId: null,
        CdtCodeName: 'D3331',
        Code: 'D3331',
        Fee: 12,
        invalideTooth: false,
        invalidSurface: false,
        ObjectState: 'Add',
        ProviderUserId: '47b6dc3c-094b-4031-87d6-778e60e1f5e1',
        Roots: 'DB',
        Tooth: '1',
        ServiceCodeId: 'e3947b6b-e4c1-4ec9-a99c-09eecdd4d13a',
        TransactionTypeId: 1,
        TransactionType: 'Service',
      };

      var rootAbbreviations = '[DB,P,MB]';
      var result = rootHelper.setValidSelectedRoots(
        serviceTransaction,
        rootAbbreviations,
        false
      );
      expect(result).toBe(true);
    });
  });

  describe(' PatCacheFactory ->', function () {
    var patCacheFactory;
    // inject the factory
    beforeEach(inject(function ($injector) {
      patCacheFactory = $injector.get('PatCacheFactory');
    }));

    it('should exist', function () {
      expect(patCacheFactory).not.toBeNull();
    });

    describe(' GetCache function ->', function () {
      it('should have a GetCache function', function () {
        expect(angular.isFunction(patCacheFactory.GetCache)).toBe(true);
      });
    });

    describe(' ClearAll function ->', function () {
      it('should have a ClearAll function', function () {
        expect(angular.isFunction(patCacheFactory.ClearAll)).toBe(true);
      });
    });

    describe(' ClearCache function ->', function () {
      it('should have a ClearCache function', function () {
        expect(angular.isFunction(patCacheFactory.ClearCache)).toBe(true);
      });
    });
  });

  describe('PatCachingInterceptor ->', function () {
    var patCachingInterceptor;
    var patCacheFactory;
    var config = {};

    beforeEach(inject(function (PatCachingInterceptor, SoarConfig) {
      patCachingInterceptor = PatCachingInterceptor;
      SoarConfig.domainUrl = '';
      spyOn(SoarConfig, 'domainUrl').and.returnValue('testUrl');
    }));

    it('should exist', function () {
      expect(patCachingInterceptor).not.toBeNull();
    });

    describe('should call cacheFactory.ClearCache if request config.method contains POST ->', function () {
      beforeEach(inject(function ($injector) {
        patCacheFactory = $injector.get('PatCacheFactory');
        config.method = 'POST';

        it('should call cachFactory.ClearCache', function () {
          expect(config.method).toBe('POST');
          expect(patCacheFactory.ClearCache).toHaveBeenCalled();
        });
      }));
    });

    describe('should call cacheFactory.ClearCache if request config.method contains DELETE ->', function () {
      beforeEach(inject(function ($injector) {
        patCacheFactory = $injector.get('PatCacheFactory');
        config.method = 'DELETE';

        it('should call cachFactory.ClearCache', function () {
          expect(config.method).toBe('DELETE');
          expect(patCacheFactory.ClearCache).toHaveBeenCalled();
        });
      }));
    });

    describe('should call cacheFactory.ClearCache if request config.method contains PUT ->', function () {
      beforeEach(inject(function ($injector) {
        patCacheFactory = $injector.get('PatCacheFactory');
        config.method = 'PUT';

        it('should call cachFactory.ClearCache', function () {
          expect(config.method).toBe('PUT');
          expect(patCacheFactory.ClearCache).toHaveBeenCalled();
        });
      }));
    });
  });
});
