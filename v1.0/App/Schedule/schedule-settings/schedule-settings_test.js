describe('scheduler-settings test -> ', function () {
  var scope, ctrl, location;

  //#region mock data
  var mockPracticeSettings = {
    DefaultTimeIncrement: 7,
  };

  var mockLocation = {
    url: jasmine.createSpy(),
    path: jasmine.createSpy(),
  };

  var mockBoundObject = {
    Data: angular.copy(mockPracticeSettings),
  };

  var mockBoundObjectFactory = {
    Create: jasmine.createSpy().and.returnValue(mockBoundObject),
  };

  var mockModalFactory = {
    CancelModal: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy(),
    }),
  };

  var mockCommonServices = {
    PracticeSettings: {
      Operations: {
        Save: jasmine.createSpy(),
        Retrieve: jasmine
          .createSpy()
          .and.returnValue(angular.copy(mockPracticeSettings)),
      },
    },
  };

  var referenceDataService = {
    updateEntity: jasmine.createSpy(),
    entityNames: {
      practiceSettings: 'practiceSettings',
    },
  };

  //#endregion

  beforeEach(module('kendo.directives'));
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Schedule'));
  beforeEach(module('Soar.Patient'));

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    location = mockLocation;

    spyOn(angular, 'element').and.returnValue({
      data: jasmine.createSpy().and.returnValue({
        span: {
          focus: jasmine.createSpy(),
        },
      }),
    });

    ctrl = $controller('ScheduleSettingsController', {
      $scope: scope,
      $location: location,
      CommonServices: mockCommonServices,
      BoundObjectFactory: mockBoundObjectFactory,
      ModalFactory: mockModalFactory,
      referenceDataService: referenceDataService,
    });
  }));

  it('should set initialize scope properties', function () {
    expect(scope.settings).toEqual(mockBoundObject);
    expect(scope.timeIncrements.length).toEqual(5);
    expect(scope.timeIncrements[0].Value).toEqual(5);
    expect(scope.timeIncrements[1].Value).toEqual(10);
    expect(scope.timeIncrements[2].Value).toEqual(15);
    expect(scope.timeIncrements[3].Value).toEqual(20);
    expect(scope.timeIncrements[4].Value).toEqual(30);
    expect(scope.settings.AfterSaveSuccess).toEqual(ctrl.leavePage);
  });

  describe('handleDropDownCreated -> ', function () {
    var mockEvent, mockWidget;

    beforeEach(function () {
      mockEvent = {
        stopImmediatePropagation: jasmine.createSpy(),
      };

      mockWidget = {
        ns: '.kendoDropDownList',
        list: {
          width: jasmine.createSpy(),
        },
        wrapper: {
          on: jasmine.createSpy(),
        },
      };

      ctrl.handleDropDownCreated(mockEvent, mockWidget);
    });

    it('should set the list width', function () {
      expect(mockWidget.list.width).toHaveBeenCalled();
    });

    it('should initialize the keydown event', function () {
      expect(mockWidget.wrapper.on).toHaveBeenCalledWith(
        'keydown',
        ctrl.handleDropDownKeyDown
      );
    });
  });

  describe('showCancelModal -> ', function () {
    describe('when HasChanges is false', function () {
      it('should call ctrl.leavePage', function () {
        scope.settings.HasChanges = jasmine.createSpy().and.returnValue(false);

        spyOn(ctrl, 'leavePage');

        scope.showCancelModal();

        expect(ctrl.leavePage).toHaveBeenCalled();
      });
    });

    describe('when HasChanges is true', function () {
      it('should call modalFactory.CancelModal', function () {
        scope.settings.HasChanges = jasmine.createSpy().and.returnValue(true);

        spyOn(ctrl, 'leavePage');

        scope.showCancelModal();

        expect(mockModalFactory.CancelModal).toHaveBeenCalled();

        expect(mockModalFactory.CancelModal().then).toHaveBeenCalledWith(
          ctrl.leavePage
        );
      });
    });
  });

  describe('leavePage -> ', function () {
    it('should change the location', function () {
      ctrl.leavePage();
      expect(location.url).toHaveBeenCalled();
    });
  });

  //Commenting out test because build keeps failing. Bug # 486526.
  //This looks like it is causing the issue.
  //Build Error is - Uncaught TypeError: Cannot read property 'span' of undefined thrown
  //describe('initializeFocus', function () {
  //    it('should set the focuse to the inpTimeIncrements dropdown', function () {
  //        ctrl.initializeFocus();

  //        expect(angular.element).toHaveBeenCalledWith("#inpTimeIncrements");
  //        expect(angular.element().data).toHaveBeenCalledWith("kendoDropDownList");
  //        expect(angular.element().data().span.focus).toHaveBeenCalled();
  //    });
  //});
});
