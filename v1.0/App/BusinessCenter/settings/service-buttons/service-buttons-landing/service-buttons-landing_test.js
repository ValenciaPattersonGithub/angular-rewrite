describe('ServiceButtonsLandingController -> ', function () {
  var scope,
    modalFactory,
    serviceButtons,
    listHelper,
    serviceButton,
    patSecurityService,
    $location;
  var q;
  var ctrl, toastrFactory, localize;
  var modalFactoryDeferred, serviceButtonsServiceMock;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $q) {
    serviceButton = { ServiceButtonId: 1, Description: 'Description one' };
    serviceButtons = [
      { ServiceButtonId: 1, Description: 'Description one' },
      { ServiceButtonId: 2, Description: 'Description two' },
      { ServiceButtonId: 3, Description: 'Description three' },
    ];
    scope = $rootScope.$new();
    q = $q;

    //mock for modalFactory
    modalFactory = {
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      Modal: jasmine.createSpy('modalFactory.Modal').and.callFake(function () {
        modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
    };

    //mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
      // generateMessage: jasmine.createSpy("patSecurityService.generateMessage")
    };

    //mock for listHelper service
    listHelper = {
      findItemByFieldValueIgnoreCase: jasmine
        .createSpy('listHelper.findItemByFieldValueIgnoreCase')
        .and.returnValue(1),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(1),
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    // mock localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    // serviceButton service mock
    serviceButtonsServiceMock = {
      update: jasmine.createSpy().and.returnValue(''),
      save: jasmine.createSpy().and.returnValue(''),
      delete: jasmine.createSpy().and.returnValue(''),
      get: jasmine.createSpy().and.returnValue(''),
    };

    $location = {
      path: jasmine.createSpy(),
    };

    ctrl = $controller('ServiceButtonsLandingController', {
      $scope: scope,
      ModalFactory: modalFactory,
      ServiceButtons: serviceButtons,
      ListHelper: listHelper,
      ServiceButton: serviceButton,
      ServiceButtonsService: serviceButtonsServiceMock,
      toastrFactory: toastrFactory,
      localize: localize,
      patSecurityService: patSecurityService,
      $location: $location,
    });

    scope.frmServiceButtonCrud = {
      inpDescription: { $error: { required: false, duplicate: false } },
    };
    scope.requiredFieldError = true;
  }));

  //controller object should exists
  it('should exist', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  //toastrFactory
  it('should check that toastrFactory is not null', function () {
    expect(toastrFactory).not.toBe(null);
  });

  it('should check that toastrFactory is not undefined', function () {
    expect(toastrFactory).not.toBeUndefined();
  });

  it('should set scope properties', function () {
    expect(scope.loadingList).toBe(true);
    expect(scope.filteringList).toBe(false);
    expect(ctrl.serviceButtonMarkedForDeletion).toBeNull();
    expect(scope.modalIsOpen).toBe(false);
  });

  describe('addOrEditServiceButton function -> ', function () {
    beforeEach(function () {
      scope.modalIsOpen = false;
    });

    it('should open modal and pass default serviceButton', function () {
      scope.addOrEditServiceButton(scope.serviceButton);
      expect(modalFactory.Modal).toHaveBeenCalled();
    });

    it('should open modal and pass selected serviceButton', function () {
      scope.addOrEditServiceButton(serviceButton);
      expect(modalFactory.Modal).toHaveBeenCalled();
    });
  });

  describe('serviceButtonEditedOrAdded function -> ', function () {
    it('should not do anything if condition sent back from modal is null', function () {
      ctrl.serviceButtonEditedOrAdded(null);
      expect(serviceButtonsServiceMock.get).not.toHaveBeenCalled();
    });

    it('should call get all api if modal returned a condition', function () {
      ctrl.serviceButtonEditedOrAdded(serviceButton);
      expect(serviceButtonsServiceMock.get).toHaveBeenCalled();
    });

    it('should set ctrl.typeOrMaterialReturnedFromModal to null', function () {
      ctrl.serviceButtonEditedOrAdded(serviceButton);
      expect(ctrl.serviceButtonReturnedFromModal).toBe(null);
    });
  });

  describe('serviceButtonsGetSuccess  function  ->', function () {
    var response;
    beforeEach(function () {
      response = {
        Value: { ServiceButtonId: 1, Description: 'Description one' },
      };
    });
    it('should set scope.serviceButtons with response value', function () {
      ctrl.serviceButtonsGetSuccess(response);
      expect(scope.serviceButtons).toEqual(response.Value);
    });
  });

  describe('serviceButtonsGetFailure function ->', function () {
    var response;
    beforeEach(function () {
      response = null;
      ctrl.serviceButtonReturnedFromModal = { Value: { serviceButtonId: 1 } };
    });
    it('should update the serviceButtons collection', function () {
      ctrl.serviceButtonsGetFailure(response);
      expect(listHelper.findIndexByFieldValue).toHaveBeenCalled();
    });
  });

  describe('filterBy Watcher -> ', function () {
    it('should set scope.filteringList true', function () {
      scope.filterBy = 'Asce';
      scope.$apply();
      scope.filterBy = 'Desc';
      scope.$apply();
      expect(scope.filteringList).toBe(true);
    });
  });

  describe('deleteCondition function -> ', function () {
    it('should set ctrl.serviceButtonMarkedForDeletion top selected object', function () {
      expect(ctrl.serviceButtonMarkedForDeletion).toBe(null);
      scope.deleteServiceButton(serviceButton);
      expect(ctrl.serviceButtonMarkedForDeletion).toBe(serviceButton);
    });
  });

  describe('confirmDelete function -> ', function () {
    it('should call delete api', function () {
      ctrl.serviceButtonMarkedForDeletion = serviceButton;
      ctrl.confirmDelete();
      expect(serviceButtonsServiceMock.delete).toHaveBeenCalled();
    });
  });

  describe('serviceButtonDeletionSuccess function -> ', function () {
    beforeEach(function () {
      scope.serviceButtons = [
        { ServiceButtonId: 1, Description: 'Description one' },
        { ServiceButtonId: 2, Description: 'Description two' },
        { ServiceButtonId: 3, Description: 'Description three' },
      ];
    });

    it('should call toastr success and set ctrl.serviceButtonMarkedForDeletion to null', function () {
      ctrl.serviceButtonMarkedForDeletion = serviceButton;
      ctrl.serviceButtonDeletionSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(ctrl.serviceButtonMarkedForDeletion).toBe(null);
    });

    it('should remove serviceButton from list', function () {
      expect(scope.serviceButtons.length).toBe(3);
      ctrl.serviceButtonMarkedForDeletion = scope.serviceButtons[0];
      ctrl.serviceButtonDeletionSuccess();
      expect(scope.serviceButtons.length).toBe(2);
    });
  });

  describe('serviceButtonDeletionFailure function -> ', function () {
    it('should call toastr failure and set ctrl.serviceButtonMarkedForDeletion to null', function () {
      ctrl.serviceButtonMarkedForDeletion = serviceButton;
      ctrl.serviceButtonDeletionFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(ctrl.serviceButtonMarkedForDeletion).toBe(null);
    });
  });

  describe('cancelDelete function -> ', function () {
    it('should set ctrl.serviceButtonMarkedForDeletion to null', function () {
      ctrl.serviceButtonMarkedForDeletion = serviceButton;
      ctrl.cancelDelete();
      expect(ctrl.serviceButtonMarkedForDeletion).toBe(null);
    });
  });

  describe('authViewAccess function -> ', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with view amfa', function () {
      ctrl.authViewAccess();
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-biz-svcbtn-view');
    });
  });

  describe('authAccess function -> ', function () {
    beforeEach(function () {
      ctrl.authViewAccess = jasmine.createSpy().and.returnValue(false);
    });
    it('should call toastrFactory.error if scope.authViewAccess() returns false', function () {
      scope.authAccess();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect($location.path).toHaveBeenCalledWith('/');
    });
  });

  describe('changeSortingForGrid function -> ', function () {
    it('should initialize sort order to asc ', function () {
      expect(scope.orderBy.asc).toBe(true);
    });

    it('should change sort order to desc if sort column selected again ', function () {
      expect(scope.orderBy.asc).toBe(true);
      scope.changeSortingForGrid('Description');
      expect(scope.orderBy.asc).toBe(false);
      scope.changeSortingForGrid('Description');
      expect(scope.orderBy.asc).toBe(true);
    });

    it('should set sort order to asc when sort column changes ', function () {
      scope.changeSortingForGrid('Description');
      expect(scope.orderBy.asc).toBe(false);
    });
  });

  describe('serviceButtonsFilter function -> ', function () {
    var item = { ServiceButtonId: 1, Description: 'Description one' };

    it('should return true if item description contains filterBy', function () {
      scope.filterBy = 'Des';
      var returnValue = scope.serviceButtonsFilter(item);
      expect(returnValue).toBe(true);
    });

    it('should return false if item description does not contains filterBy', function () {
      scope.filterBy = 'EDS';
      var returnValue = scope.serviceButtonsFilter(item);
      expect(returnValue).toBe(false);
    });

    it('should filter item the same if parameter is capitalized or not ', function () {
      scope.filterBy = 'DES';
      var returnValue = scope.serviceButtonsFilter(item);
      expect(returnValue).toBe(true);

      scope.filterBy = 'BLUNTED';
      returnValue = scope.serviceButtonsFilter(item);
      expect(returnValue).toBe(false);
    });
  });
});
