// top level test suite
describe('PatientGroupTypesController ->', function () {
  var scope,
    ctrl,
    location,
    compile,
    localize,
    toastrFactory,
    timeout,
    element,
    routeParams,
    filter;
  var _patientServices_, _groupTypeService_;

  //#region mocks
  var mockPatientId = '3bafe8ec-dd4d-457b-9bc2-9d202d2c75d8';

  var mockPatientGroupType = {
    PatientGroupId: null,
    PatientId: null,
    MasterGroupId: null,
    GroupTypeName: null,
  };

  var mockGroupType = {
    GroupTypeId: null,
    Description: null,
  };

  var mockGroupTypesList = [
    {
      GroupTypeId: 'd98d5424-dc5a-4b63-92cd-49439a9d3107',
      GroupTypeName: 'GroupType1',
    },
    {
      GroupTypeId: 'e0eecdb7-6ce3-4c4f-8bb6-fe389fef9c18',
      GroupTypeName: 'GroupType2',
    },
    {
      GroupTypeId: 'af1b5d8c-5d5b-48e2-913a-5621c52a11c7',
      GroupTypeName: 'GroupType3',
    },
    {
      GroupTypeId: '6c86f2ae-d328-443c-8005-d3ccef12e75a',
      GroupTypeName: 'GroupType4',
    },
  ];

  var mockPatientGroupTypesList = [
    {
      PatientGroupId: '3a6b5789-e481-4c39-8827-a37ea7bf0463',
      PatientId: mockPatientId,
      MasterGroupId: 'e0eecdb7-6ce3-4c4f-8bb6-fe389fef9c18',
      Description: 'GroupType2',
    },
    {
      PatientGroupId: '15725b69-d97c-4a76-9a75-ef90cdb81009',
      PatientId: mockPatientId,
      MasterGroupId: 'af1b5d8c-5d5b-48e2-913a-5621c52a11c7',
      Description: 'GroupType3',
    },
    {
      PatientGroupId: '608a290f-cc8a-4419-8207-6c1608912503',
      PatientId: mockPatientId,
      MasterGroupId: '6c86f2ae-d328-443c-8005-d3ccef12e75a',
      Description: 'GroupType4',
    },
  ];

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      _groupTypeService_ = {
        get: jasmine.createSpy().and.returnValue({ Value: mockGroupTypesList }),
      };
      $provide.value('GroupTypeService', _groupTypeService_);

      _patientServices_ = {
        GroupTypes: {
          get: jasmine
            .createSpy()
            .and.returnValue({ Value: mockPatientGroupTypesList }),
          create: jasmine.createSpy().and.returnValue(''),
          delete: jasmine.createSpy().and.returnValue(''),
        },
      };
      $provide.value('PatientServices', _patientServices_);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $injector,
    $controller,
    $location,
    $routeParams,
    $compile,
    $templateCache
  ) {
    location = $location;
    scope = $rootScope.$new();
    routeParams = $routeParams;
    routeParams.patientId = mockPatientId;
    ctrl = $controller('PatientGroupTypesController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
    });
    compile = $compile;
    localize = $injector.get('localize');
    scope.editMode = true;
    // allows location.path declared to find templateUrl
    //$templateCache.put('App/Common/components/dateSelector/dateSelector.html', '');
    $rootScope.$apply();
  }));

  // $scope.checkForDuplicates references html, so we need the following snippet to test that function.
  var loadHtml = function () {
    element = angular.element(
      '<div ng-form="patientAlertsFrm">' +
        '<div class="row" >' +
        '<div class="col-xs-12 col-md-3">' +
        '<select ng-model="patientGroupType" class="form-input" id="inpGroupType"' +
        'ng-change="AddPatientGroupType(patientGroupType)"' +
        'ng-options="groupType.GroupTypeName for groupType in groupTypeList | excludeFromList : patientGroupTypes : GroupTypesAreEqual"' +
        'ng-disabled="patientGroupTypes.length >= 10 || deleteMode">' +
        "<option value=\"\">{{ 'Select {0}' | i18n:['Group'] | uppercase}}</option>" +
        '</select>' +
        '<div id="lblMaxPatientGroupTypesMessage" collapse="patientGroupTypes.length < 10">' +
        '<b>{{ "A patient may only belong to 10 groups at any given time." | i18n }}</b>' +
        '</div>' +
        '</div></div>)'
    );

    // use compile to render the html
    compile(element)(scope);
    scope = element.isolateScope() || element.scope();
    scope.$digest();
    //var inpDescription = element.find('#inpDescription');
  };

  describe('when user is authorized - >', function () {
    //#endregion mocks

    // test specs below
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services and factories ', function () {
      expect(_groupTypeService_).not.toBeNull();
      expect(_patientServices_.GroupTypes).not.toBeNull();
    });

    it('should set default values', function () {
      expect(scope.editMode).toBe(true);
      expect(scope.groupTypeList).toEqual([]);
      expect(scope.patientGroupTypes).toEqual([]);
      expect(scope.patientGroupType).toEqual({});
    });

    describe('getGroupTypes function ->', function () {
      it('should call service', function () {
        scope.getGroupTypes();
        expect(_groupTypeService_.get).toHaveBeenCalled();
      });
    });

    describe('groupTypeServiceGetSuccess function ->', function () {
      it('should populate groupTypeList', function () {
        scope.groupTypeServiceGetSuccess({ Value: mockGroupTypesList });
        expect(scope.groupTypeList).toEqual(mockGroupTypesList);
      });
    });

    describe('groupTypeServiceGetFailure function ->', function () {
      it('should set groupTypeList to empty array', function () {
        scope.groupTypeServiceGetFailure();
        expect(scope.groupTypeList).toEqual([]);
      });
      it('should set groupTypeList to empty array', function () {
        scope.groupTypeServiceGetFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('getPatientGroupTypes function ->', function () {
      it('should call service', function () {
        scope.getPatientGroupTypes();
        expect(_patientServices_.GroupTypes.get).toHaveBeenCalledWith(
          { Id: mockPatientId },
          jasmine.any(Function),
          jasmine.any(Function)
        );
      });
    });

    describe('patientGroupTypesServiceGetSuccess function ->', function () {
      it(' should populate patientGroupTypes', function () {
        scope.patientGroupTypesServiceGetSuccess({
          Value: mockPatientGroupTypesList,
        });
        expect(scope.patientGroupTypes).toEqual(mockPatientGroupTypesList);
      });
    });

    describe('patientGroupTypesServiceGetFailure function ->', function () {
      it('should set patientGroupTypes to empty array', function () {
        scope.patientGroupTypesServiceGetFailure();
        expect(scope.patientGroupTypes).toEqual([]);
      });

      it('should call toastr error', function () {
        scope.patientGroupTypesServiceGetFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('AddPatientGroupType function->', function () {
      it('should set params and call service', function () {
        mockGroupType.GroupTypeName = 'GroupType5';
        mockGroupType.GroupTypeId = 'x98d5424-dc5a-4b63-92cd-49439a9d3107';
        scope.AddPatientGroupType(mockGroupType);

        expect(_patientServices_.GroupTypes.create).toHaveBeenCalledWith(
          {
            PatientId: mockPatientId,
            MasterGroupId: mockGroupType.GroupTypeId,
            Description: mockGroupType.GroupTypeName,
            Id: mockPatientId,
          },
          jasmine.any(Function),
          jasmine.any(Function)
        );
      });
    });

    describe('patientGroupTypesServiceCreateSuccess function->', function () {
      it('should add patientGroup to patientGroupTypes', function () {
        scope.patientGroupTypes = [];
        scope.patientGroupTypes = angular.copy(mockPatientGroupTypesList);
        expect(scope.patientGroupTypes.length).toBe(3);
        mockGroupType.GroupTypeName = 'GroupType5';
        mockGroupType.GroupTypeId = 'x98d5424-dc5a-4b63-92cd-49439a9d3107';
        scope.patientGroupTypesServiceCreateSuccess({ Value: mockGroupType });
        expect(scope.patientGroupTypes.length).toBe(4);
      });

      it('should call toastr success', function () {
        scope.patientGroupTypes = angular.copy(mockPatientGroupTypesList);
        mockGroupType.GroupTypeName = 'GroupType5';
        mockGroupType.GroupTypeId = 'x98d5424-dc5a-4b63-92cd-49439a9d3107';
        scope.patientGroupTypesServiceCreateSuccess({ Value: mockGroupType });
        expect(toastrFactory.success).toHaveBeenCalled();
      });
    });

    describe('patientGroupTypesServiceCreateFailure function->', function () {
      it('should call toastr error', function () {
        scope.patientGroupTypesServiceCreateFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('RemovePatientGroupType function->', function () {
      it('should set properties', function () {
        scope.RemovePatientGroupType(6, mockGroupType);
        expect(scope.deleteMode).toBe(true);
        expect(scope.indexToRemove).toBe(6);
      });

      it('should set groupType to remove', function () {
        mockGroupType.GroupTypeName = 'GroupType5';
        mockGroupType.GroupTypeId = 'x98d5424-dc5a-4b63-92cd-49439a9d3107';
        scope.RemovePatientGroupType(6, mockGroupType);
        expect(scope.groupTypeToDelete).toEqual(mockGroupType);
      });
    });

    describe('GroupTypesAreEqual function->', function () {
      it('should return true if types are same', function () {
        mockPatientGroupType.MasterGroupId =
          'x98d5424-dc5a-4b63-92cd-49439a9d3107';
        mockGroupType.GroupTypeId = 'x98d5424-dc5a-4b63-92cd-49439a9d3107';
        expect(
          scope.GroupTypesAreEqual(mockGroupType, mockPatientGroupType)
        ).toBe(true);
      });

      it('should return false if types are not same', function () {
        mockPatientGroupType.MasterGroupId =
          'y98d5424-dc5a-4b63-92cd-49439a9d3107';
        mockGroupType.GroupTypeId = 'x98d5424-dc5a-4b63-92cd-49439a9d3107';
        expect(
          scope.GroupTypesAreEqual(mockGroupType, mockPatientGroupType)
        ).toBe(false);
      });
    });

    describe('ConfirmRemove function->', function () {
      it('should call service', function () {
        scope.groupTypeToDelete = angular.copy(mockPatientGroupTypesList[1]);
        scope.ConfirmRemove();
        expect(_patientServices_.GroupTypes.delete).toHaveBeenCalledWith(
          {
            Id: scope.groupTypeToDelete.PatientId,
            PatientGroupTypeId: scope.groupTypeToDelete.PatientGroupId,
          },
          jasmine.any(Function),
          jasmine.any(Function)
        );
      });
    });

    describe('patientGroupTypesServiceDeleteSuccess function->', function () {
      it('should call remove deleted group type from patientGroupTypes ', function () {
        scope.groupTypeToDelete = angular.copy(mockPatientGroupTypesList[1]);
        scope.patientGroupTypes = angular.copy(mockPatientGroupTypesList);
        var description = scope.groupTypeToDelete.Description;
        expect(description).toEqual(scope.patientGroupTypes[1].Description);

        expect(scope.patientGroupTypes.length).toBe(3);
        scope.patientGroupTypesServiceDeleteSuccess(scope.groupTypeToDelete);
        expect(scope.patientGroupTypes.length).toBe(2);
        expect(description).not.toEqual(scope.patientGroupTypes[1].Description);
      });

      it('should call toastrFactory success ', function () {
        scope.groupTypeToDelete = angular.copy(mockPatientGroupTypesList[1]);
        scope.patientGroupTypes = angular.copy(mockPatientGroupTypesList);
        scope.patientGroupTypesServiceDeleteSuccess(scope.groupTypeToDelete);
        expect(toastrFactory.success).toHaveBeenCalled();
      });

      it('should call ExitDeleteMode ', function () {
        spyOn(scope, 'ExitDeleteMode');
        scope.groupTypeToDelete = angular.copy(mockPatientGroupTypesList[1]);
        scope.patientGroupTypes = angular.copy(mockPatientGroupTypesList);
        scope.patientGroupTypesServiceDeleteSuccess(scope.groupTypeToDelete);

        expect(scope.ExitDeleteMode).toHaveBeenCalled();
      });
    });

    describe('patientGroupTypesServiceDeleteFailure function->', function () {
      it('should call toastrFactory error ', function () {
        scope.patientGroupTypesServiceDeleteFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('ExitDeleteMode function->', function () {
      it('should reset groupTypeToDelete and properties ', function () {
        scope.ExitDeleteMode();
        expect(scope.deleteMode).toBe(false);
        expect(scope.groupTypeToDelete).toEqual(null);
        expect(scope.indexToRemove).toBe(-1);
      });
    });
  });
});
