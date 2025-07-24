describe('TypeOrMaterialsLandingController -> ', function () {
  var scope,
    modalFactory,
    typeOrMaterials,
    listHelper,
    typeOrMaterial,
    patSecurityService,
    location;
  var q;
  var ctrl, toastrFactory, localize;
  var modalFactoryDeferred, typeOrMaterialsServiceMock;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $q, $location) {
    typeOrMaterial = { typeOrMaterialId: 1, Description: 'Description one' };
    typeOrMaterials = [
      { typeOrMaterialId: 1, Description: 'Description one' },
      { typeOrMaterialId: 2, Description: 'Description two' },
      { typeOrMaterialId: 3, Description: 'Description three' },
    ];
    scope = $rootScope.$new();
    q = $q;
    location = $location;
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
    typeOrMaterialsServiceMock = {
      update: jasmine.createSpy().and.returnValue(''),
      save: jasmine.createSpy().and.returnValue(''),
      delete: jasmine.createSpy().and.returnValue(''),
      get: jasmine.createSpy().and.returnValue(''),
    };

    location = {
      path: jasmine.createSpy(),
    };

    ctrl = $controller('TypeOrMaterialsLandingController', {
      $scope: scope,
      localize: localize,
      patSecurityService: patSecurityService,
      $location: location,
      TypeOrMaterials: typeOrMaterials,
      TypeOrMaterialsService: typeOrMaterialsServiceMock,
      ListHelper: listHelper,
      ModalFactory: modalFactory,
      toastrFactory: toastrFactory,
    });

    scope.frmServiceButtonCrud = {
      inpDescription: { $error: { required: false, duplicate: false } },
    };
    scope.requiredFieldError = true;
  }));

  //controller object should exists
  it('TypeOrMaterialsLandingController: should exist', function () {
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
    expect(ctrl.typeOrMaterialMarkedForDeletion).toBeNull();
    expect(scope.modalIsOpen).toBe(false);
  });

  describe('addOrEditTypeOrMaterial function -> ', function () {
    beforeEach(function () {
      scope.modalIsOpen = false;
    });

    it('should open modal and pass default typeOrMaterial', function () {
      scope.addOrEditTypeOrMaterial(scope.typeOrMaterial);
      expect(modalFactory.Modal).toHaveBeenCalled();
    });
  });

  describe('typeOrMaterialEditedOrAdded function -> ', function () {
    it('should not do anything if condition sent back from modal is null', function () {
      ctrl.typeOrMaterialEditedOrAdded(null);
      expect(typeOrMaterialsServiceMock.get).not.toHaveBeenCalled();
    });

    it('should call get all api if modal returned a condition', function () {
      ctrl.typeOrMaterialEditedOrAdded(typeOrMaterial);
      expect(typeOrMaterialsServiceMock.get).toHaveBeenCalled();
    });

    it('should set ctrl.typeOrMaterialReturnedFromModal to null', function () {
      ctrl.typeOrMaterialEditedOrAdded(typeOrMaterial);
      expect(ctrl.typeOrMaterialReturnedFromModal).toBe(null);
    });
  });

  describe('typeOrMaterialGetSuccess  function  ->', function () {
    var response;
    beforeEach(function () {
      response = {
        Value: { typeOrMaterialId: 1, Description: 'Description one' },
      };
    });
    it('should set scope.typeOrMaterials with response value', function () {
      ctrl.typeOrMaterialGetSuccess(response);
      expect(scope.typeOrMaterials).toEqual(response.Value);
    });
  });

  describe('typeOrMaterialGetFailure function ->', function () {
    var response;
    beforeEach(function () {
      response = null;
      ctrl.typeOrMaterialReturnedFromModal = { Value: { TypeOrMaterialId: 1 } };
    });
    it('should update the typeOrMaterial collection', function () {
      ctrl.typeOrMaterialGetFailure(response);
      expect(listHelper.findIndexByFieldValue).toHaveBeenCalled();
    });
  });

  describe('deleteTypeOrMaterial function -> ', function () {
    it('should set ctrl.typeOrMaterialMarkedForDeletion to top selected object', function () {
      expect(ctrl.typeOrMaterialMarkedForDeletion).toBe(null);
      scope.deleteTypeOrMaterial(typeOrMaterial);
      expect(ctrl.typeOrMaterialMarkedForDeletion).toBe(typeOrMaterial);
    });
  });

  describe('confirmDelete function -> ', function () {
    it('should call delete api', function () {
      ctrl.typeOrMaterialMarkedForDeletion = typeOrMaterial;
      ctrl.confirmDelete();
      expect(typeOrMaterialsServiceMock.delete).toHaveBeenCalled();
    });
  });

  describe('typeOrMaterialDeletionSuccess function -> ', function () {
    beforeEach(function () {
      scope.typeOrMaterials = [
        { typeOrMaterialId: 1, Description: 'Description one' },
        { typeOrMaterialId: 2, Description: 'Description two' },
        { typeOrMaterialId: 3, Description: 'Description three' },
      ];
    });

    it('should call toastr success and set ctrl.serviceButtonMarkedForDeletion to null', function () {
      ctrl.typeOrMaterialMarkedForDeletion = typeOrMaterial;
      ctrl.typeOrMaterialDeletionSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(ctrl.typeOrMaterialMarkedForDeletion).toBe(null);
    });

    it('should remove typrOrMaterial from list', function () {
      expect(scope.typeOrMaterials.length).toBe(3);
      ctrl.typeOrMaterialMarkedForDeletion = scope.typeOrMaterials[1];
      ctrl.typeOrMaterialDeletionSuccess();
      expect(scope.typeOrMaterials.length).toBe(2);
    });
  });

  describe('typeOrMaterialDeletionFailure function -> ', function () {
    it('should call toastr failure and set ctrl.typeOrMaterialMarkedForDeletion to null', function () {
      ctrl.typeOrMaterialMarkedForDeletion = typeOrMaterial;
      ctrl.typeOrMaterialDeletionFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(ctrl.typeOrMaterialMarkedForDeletion).toBe(null);
    });
  });

  describe('cancelDelete function -> ', function () {
    it('should set ctrl.typeOrMaterialMarkedForDeletion to null', function () {
      ctrl.typeOrMaterialMarkedForDeletion = typeOrMaterial;
      ctrl.cancelDelete();
      expect(ctrl.typeOrMaterialMarkedForDeletion).toBe(null);
    });
  });

  //#region authorization
  describe('authViewAccess function -> ', function () {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with view amfa', function () {
      ctrl.authViewAccess();
      expect(
        patSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-biz-typmat-view');
    });
  });

  describe('authAccess function -> ', function () {
    beforeEach(function () {
      ctrl.authViewAccess = jasmine.createSpy().and.returnValue(false);
    });

    it('should call toastrFactory.error if scope.authViewAccess() returns false', function () {
      ctrl.authAccess();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(location.path).toHaveBeenCalledWith('/');
    });
  });

  //#endregion

  describe('filterBy Watcher -> ', function () {
    it('should set scope.filteringList true', function () {
      scope.filterBy = 'Asce';
      scope.$apply();
      scope.filterBy = 'Desc';
      scope.$apply();
      expect(scope.filteringList).toBe(true);
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

  describe('typeOrMaterialsFilter  function -> ', function () {
    var item = { ServiceButtonId: 1, Description: 'Description one' };

    it('should return true if item description contains filterBy', function () {
      scope.filterBy = 'Des';
      var returnValue = scope.typeOrMaterialsFilter(item);
      expect(returnValue).toBe(true);
    });

    it('should return false if item description does not contains filterBy', function () {
      scope.filterBy = 'EDS';
      var returnValue = scope.typeOrMaterialsFilter(item);
      expect(returnValue).toBe(false);
    });

    it('should filter item the same if parameter is capitalized or not ', function () {
      scope.filterBy = 'DES';
      var returnValue = scope.typeOrMaterialsFilter(item);
      expect(returnValue).toBe(true);

      scope.filterBy = 'BLUNTED';
      returnValue = scope.typeOrMaterialsFilter(item);
      expect(returnValue).toBe(false);
    });
  });
});
