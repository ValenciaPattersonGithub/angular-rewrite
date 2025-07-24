// top level test suite
describe("GroupTypesCrudController' tests ->", function () {
  var scope, ctrl, httpBackend, location, localize, toastr, element, compile;

  var mockGroupType = {};
  var mockGroupTypesList = [
    { GroupTypeId: 1, GroupTypeName: 'Skins' },
    { GroupTypeId: 2, GroupTypeName: 'Shirts' },
  ];

  //#region before each
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  var _groupTypeFactory_, _groupTypeService_;
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      mockGroupType = {
        GroupTypeId: 1,
        GroupTypeName: 'Cows',
      };
      // toastr mock should be moved to test helpers
      toastr = {};
      toastr.error = jasmine.createSpy();
      toastr.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastr);

      _groupTypeFactory_ = {
        get: jasmine.createSpy().and.returnValue(mockGroupType),
        set: jasmine.createSpy(),
      };
      $provide.value('GroupTypeFactory', _groupTypeFactory_);

      _groupTypeService_ = {
        get: jasmine.createSpy().and.returnValue({ Value: mockGroupTypesList }),
        save: jasmine
          .createSpy()
          .and.returnValue({ GroupTypeId: 1, GroupTypeName: 'Jason' }),
        update: jasmine
          .createSpy()
          .and.returnValue({ GroupTypeId: 1, GroupTypeName: 'Jason' }),
      };
      $provide.value('GroupTypeService', _groupTypeService_);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $injector,
    $controller,
    $location,
    $compile
  ) {
    location = $location;
    compile = $compile;
    scope = $rootScope.$new();

    ctrl = $controller('GroupTypeCrudController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
    });
    localize = $injector.get('localize');
    $rootScope.$apply();
  }));

  // $scope.checkForDuplicates references html, so we need the following snippet to test that function.
  var loadHtml = function () {
    element = angular.element(
      '<div ng-form="frmGroupTypeCrud">' +
        '<input id="inpGroupTypeName" name="inpGroupTypeName" class="required valid master-list-input"' +
        '               set-focus ng-model="groupType.GroupTypeName" maxlength="64" required/>' +
        '<!--message if duplicate-->' +
        '   <label id="lblUniqueName" class="help-text " ng-show="hasErrors && frmGroupTypeCrud.inpGroupTypeName.$error.uniqueGroupTypeName">' +
        '   </label>' +
        '</div>'
    );

    // use compile to render the html
    compile(element)(scope);
    scope = element.isolateScope() || element.scope();
    scope.$digest();
    var inpGroupTypeName = element.find('#inpGroupTypeName');
  };

  //#endregion

  describe('GroupTypeCrudController tests - >', function () {
    describe('when user is authorized - >', function () {
      it('should exist', function () {
        expect(ctrl).not.toBeNull();
      });

      it('should set default values', function () {
        expect(scope.hasErrors).toBe(false);
        expect(scope.isDuplicate).toBe(false);
        expect(scope.groupTypes).toEqual([]);
        expect(scope.groupType).toEqual({
          GroupTypeId: null,
          GroupTypeName: null,
        });
        expect(scope.confirmingDiscard).toBe(false);
        expect(scope.formIsValid).toBe(false);
      });

      it('initGroupType should create empty grouptype object', function () {
        scope.initGroupType();
        expect(scope.groupType).toEqual({
          GroupTypeId: null,
          GroupTypeName: null,
        });
      });

      it('initPage should reset scope properties', function () {
        scope.initPage();
        expect(scope.hasErrors).toBe(false);
        expect(scope.isDuplicate).toBe(false);
        expect(scope.editMode).toBe(false);
        expect(scope.editing).toBe(false);

        expect(scope.groupType).toEqual({
          GroupTypeId: null,
          GroupTypeName: null,
        });
      });

      it('groupTypeId determines whether edit or create', function () {
        loadHtml();
        scope.groupTypeId = null;
        expect(scope.editing).toBe(false);
        scope.groupTypeId = 1;
        scope.$apply();
        expect(scope.editing).toBe(true);
      });
    });

    describe('getGroupTypes function ->', function () {
      it('successful getGroupTypes should call service', function () {
        scope.getGroupTypes();
        expect(_groupTypeService_.get).toHaveBeenCalled();
      });

      it('successful getGroupTypes should populate groupTypes', function () {
        scope.loading = true;
        scope.groupTypesGetSuccess({ Value: mockGroupTypesList });
        expect(scope.loading).toBe(false);
        expect(scope.groupTypes).toEqual(mockGroupTypesList);
      });

      it('getGroupTypes failure should set group types to empty array', function () {
        scope.loading = true;
        scope.groupTypesGetFailure();
        expect(scope.loading).toBe(false);
        expect(scope.groupTypes).toEqual([]);
      });

      it('getGroupTypes failure should call toastr error', function () {
        scope.groupTypesGetFailure();
        expect(toastr.error).toHaveBeenCalled();
      });
    });

    describe('getGroupType function- >', function () {
      it('getGroupType should call factory if groupTypeId is supplied', function () {
        scope.groupTypeId = 1;
        scope.getGroupType();
        expect(_groupTypeFactory_.get).toHaveBeenCalled();
      });

      it('should get grouptype from factory if groupTypeId is supplied', function () {
        scope.groupTypeId = 1;
        expect(scope.editing).toBe(false);
        scope.getGroupType();
        expect(scope.editing).toBe(true);
        expect(scope.groupType.GroupTypeId).toBe(1);
      });

      it('should call toastr error if groupTypeId is supplied and null groupType returned from factory', function () {
        mockGroupType = {};
        _groupTypeFactory_.get.and.returnValue(mockGroupType);
        scope.groupTypeId = 1;
        expect(scope.editing).toBe(false);
        scope.getGroupType();
        expect(scope.editing).toBe(true);
        expect(scope.groupType).toEqual({});
        expect(toastr.error).toHaveBeenCalled();
      });

      it('should do nothing if groupTypeId is not supplied', function () {
        scope.groupTypeId = null;
        expect(scope.editing).toBe(false);
        scope.getGroupType();
        expect(scope.editing).toBe(false);
        expect(scope.groupType).toEqual({
          GroupTypeId: null,
          GroupTypeName: null,
        });
      });
    });

    describe('buildInstance function - >', function () {
      it('should set backupGroupType to passed in groupType', function () {
        scope.backupGroupType = {};
        scope.buildInstance(mockGroupType);
        expect(scope.backupGroupType == mockGroupType);
      });
    });

    describe('discardChanges function - >', function () {
      it('should reset scope properties', function () {
        scope.discardChanges();
        expect(scope.confirmingDiscard).toBe(false);
        expect(scope.hasErrors).toBe(false);
        expect(scope.isDuplicate).toBe(false);
        expect(scope.editMode).toBe(false);
        expect(scope.editing).toBe(false);

        expect(scope.groupType).toEqual({
          GroupTypeId: null,
          GroupTypeName: null,
        });
      });
    });

    describe('confirmDiscard function - >', function () {
      it('should set confirmingDiscard to true', function () {
        expect(scope.confirmingDiscard).toBe(false);
        scope.confirmDiscard();
        expect(scope.confirmingDiscard).toBe(true);
      });
    });

    describe('cancelDiscard function - >', function () {
      it('should set confirmingDiscard to true', function () {
        scope.confirmingDiscard = true;
        scope.cancelDiscard();
        expect(scope.confirmingDiscard).toBe(false);
      });
    });

    describe('checkForDuplicates function - >', function () {
      it('should set formIsValid when new groupType is created with duplicate description', function () {
        loadHtml();
        scope.$apply();
        // mock type with description matching one in groupTypes
        mockGroupType = { GroupTypeName: 'Skins' };
        scope.groupTypes = mockGroupTypesList;

        scope.checkForDuplicates(mockGroupType);
        expect(scope.formIsValid).toBe(false);
        expect(scope.isDuplicate).toBe(true);
        expect(scope.formIsValid).toBe(false);
      });

      it('should set uniqueGroupTypeName to invalid when new groupType is created with duplicate description', function () {
        loadHtml();
        scope.$apply();
        // mock type with description matching one in groupTypes
        mockGroupType = {
          GroupTypeName: 'Skins',
        };
        scope.checkForDuplicates();

        expect(scope.frmGroupTypeCrud.inpGroupTypeName.$valid).toBe(false);
      });

      it('should set isDuplicate to false when new groupType is created with unique description', function () {
        loadHtml();
        scope.$apply();
        // mock type with description matching one in groupTypes
        mockGroupType = { GroupTypeName: 'Jocks' };
        scope.groupTypes = mockGroupTypesList;
        scope.checkForDuplicates(mockGroupType);
        expect(scope.isDuplicate).toBe(false);
      });
    });

    describe('validateForm function - >', function () {
      it('should set formImsValid to false if GroupTypeName is blank', function () {
        loadHtml();
        scope.$apply();

        scope.groupTypes = mockGroupTypesList;
        scope.validateForm({ GroupTypeName: '' }, { GroupTypeName: null });
        expect(scope.formIsValid).toBe(false);
      });

      it('should set formIsValid to false if GroupTypeName is duplicate', function () {
        loadHtml();
        scope.$apply();

        scope.groupTypes = mockGroupTypesList;
        scope.validateForm({ GroupTypeName: 'Skins' }, { GroupTypeName: '' });
        expect(scope.formIsValid).toBe(false);
      });

      it('should set formIsValid to true if GroupTypeName is not blank or duplicate', function () {
        loadHtml();
        scope.$apply();

        scope.groupTypes = mockGroupTypesList;
        scope.validateForm(
          { GroupTypeName: 'Cows' },
          { GroupTypeName: 'Skins' }
        );
        expect(scope.formIsValid).toBe(true);
      });
    });

    describe('groupType watch - >', function () {
      it('should call validateForm function with new and old values', function () {
        loadHtml();
        spyOn(scope, 'validateForm');
        scope.groupType = { GroupTypeName: 'Cows' };
        scope.$apply();
        expect(scope.validateForm).toHaveBeenCalledWith(
          { GroupTypeName: 'Cows' },
          { GroupTypeId: null, GroupTypeName: null }
        );
      });
    });

    describe('saveGroupType watch - >', function () {
      it('should call groupTypeService if formIsValid equals true and group type is created', function () {
        scope.formIsValid = true;
        scope.groupType = { GroupTypeId: null, GroupTypeName: 'Bart' };
        scope.saveGroupType();
        expect(scope.hasErrors).toBe(false);
        expect(scope.savingGroupType).toBe(true);
        expect(_groupTypeService_.save).toHaveBeenCalledWith(
          scope.groupType,
          jasmine.any(Function),
          jasmine.any(Function)
        );
      });

      it('should not call groupTypeService if formIsValid equals false', function () {
        scope.formIsValid = false;
        scope.groupType = { GroupTypeId: 1, GroupTypeName: 'Bart' };
        scope.saveGroupType();
        expect(scope.hasErrors).toBe(true);
        expect(scope.savingGroupType).toBe(false);
        expect(_groupTypeService_.save).not.toHaveBeenCalled();
      });

      it('should call groupTypeService update if formIsValid and editing is true', function () {
        scope.formIsValid = true;
        scope.editing = true;
        scope.saveGroupType();
        expect(_groupTypeService_.update).toHaveBeenCalled();
      });

      it('should call groupTypeService save if formIsValid and editing is false', function () {
        scope.formIsValid = true;
        scope.editing = false;
        scope.saveGroupType();
        expect(_groupTypeService_.save).toHaveBeenCalled();
      });
    });

    describe('groupTypeUpdateSuccess function - >', function () {
      it('should replace groupType in list', function () {
        scope.types = mockGroupTypesList;
        scope.groupType = { GroupTypeId: 2, GroupTypeName: 'Shirts2' };
        scope.groupTypeUpdateSuccess({ Value: scope.groupType });
        expect(scope.types.length).toBe(2);
        expect(scope.types[1].GroupTypeName).toBe('Shirts2');
      });

      it('should call initPage and set savingGroupType to false', function () {
        spyOn(scope, 'initPage');
        scope.types = mockGroupTypesList;
        scope.groupType = { GroupTypeId: 2, GroupTypeName: 'Shirts2' };
        scope.groupTypeUpdateSuccess({ Value: scope.groupType });
        expect(scope.initPage).toHaveBeenCalled();
        expect(scope.savingGroupType).toBe(false);
      });

      it('should call toastr success', function () {
        scope.types = mockGroupTypesList;
        scope.groupType = { GroupTypeId: 2, GroupTypeName: 'Shirts2' };
        scope.groupTypeUpdateSuccess({ Value: scope.groupType });
        expect(toastr.success).toHaveBeenCalled();
        expect(scope.savingGroupType).toBe(false);
      });
    });

    describe('groupTypeUpdateFailure function - >', function () {
      it('should call toastr error', function () {
        scope.groupTypeUpdateFailure();
        expect(toastr.error).toHaveBeenCalled();
        expect(scope.savingGroupType).toBe(false);
      });
    });

    describe('groupTypeSaveSuccess function - >', function () {
      it('should add groupType in list', function () {
        scope.types = mockGroupTypesList;
        scope.groupType = { GroupTypeId: 3, GroupTypeName: 'Refs' };
        scope.groupTypeSaveSuccess({ Value: scope.groupType });
        expect(scope.types.length).toBe(3);
        expect(scope.types[2].GroupTypeName).toBe('Refs');
        expect(scope.savingGroupType).toBe(false);
      });

      it('should call initPage and set savingGroupType to false', function () {
        spyOn(scope, 'initPage');
        scope.types = mockGroupTypesList;
        scope.groupType = { GroupTypeId: 3, GroupTypeName: 'Refs' };
        scope.groupTypeSaveSuccess({ Value: scope.groupType });
        expect(scope.initPage).toHaveBeenCalled();
        expect(scope.savingGroupType).toBe(false);
      });

      it('should call toastr success', function () {
        scope.types = mockGroupTypesList;
        scope.groupType = { GroupTypeId: 3, GroupTypeName: 'Refs' };
        scope.groupTypeSaveSuccess({ Value: scope.groupType });
        expect(toastr.success).toHaveBeenCalled();
        expect(scope.savingGroupType).toBe(false);
      });
    });

    describe('groupTypeSaveFailure function - >', function () {
      it('should call toastr error', function () {
        scope.groupTypeSaveFailure();
        expect(toastr.error).toHaveBeenCalled();
        expect(scope.savingGroupType).toBe(false);
      });
    });

    describe('editMode watch - >', function () {
      it('should call getMasterAlerts to get masterAlerts', function () {
        //loadHtml();
        //spyOn(scope, 'getMasterAlerts');
        //scope.editMode = true;
        //expect(scope.getMasterAlerts).toHaveBeenCalled();
        // TODO how to test call to directive parent controller...
      });
    });
  });
});
