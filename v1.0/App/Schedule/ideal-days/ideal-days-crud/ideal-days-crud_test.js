describe('IdealDaysCrudController ->', function () {
  var ctrl,
    scope,
    timeout,
    toastrFactory,
    localize,
    location,
    staticData,
    compile,
    rootScope,
    element;
  var listHelper,
    idealDayTemplatesFactory,
    modalFactory,
    modalInstance,
    colorUtilities;

  var template = {
    Name: 'Template1',
    TemplateId: 1,
    Details: [
      {
        StartTime: '2017-12-08 08:00:00.0000000',
        EndTime: '2017-12-08 10:00:00.0000000',
        AppointmentTypeId: '21',
      },
      {
        StartTime: '2017-12-08 10:00:00.0000000',
        EndTime: '2017-12-08 12:00:00.0000000',
        AppointmentTypeId: '482',
      },
    ],
  };

  var templates = [{}, {}, {}];

  //#region mocks

  var mockPracticeSettings = {
    Value: {
      SettingsName: 'SOAR',
      DefaultTimeIncrement: 10,
      IsProvisioned: true,
      IsEStatementEnabled: false,
    },
  };

  var mockAppointmentTypes = {
    Value: [
      {
        AppointmentTypeId: '21',
        Name: 'Consultation',
        AppointmentTypeColor: '#FFa980',
        FontColor: '#000000',
        PerformedByProviderTypeId: 1,
        DefaultDuration: 30,
      },
      {
        AppointmentTypeId: '482',
        Name: 'Crown Bridge Delivery',
        AppointmentTypeColor: '#FFFFBB',
        FontColor: '#000000',
        PerformedByProviderTypeId: 1,
        DefaultDuration: 40,
      },
      {
        AppointmentTypeId: '0e8a',
        Name: 'Crown Bridge Prep',
        AppointmentTypeColor: '#FFFF00',
        FontColor: '#000000',
        PerformedByProviderTypeId: 2,
        DefaultDuration: 90,
      },
      {
        AppointmentTypeId: '5d98',
        Name: 'Emergency',
        AppointmentTypeColor: '#FF2F2F',
        FontColor: '#000000',
        PerformedByProviderTypeId: 1,
        DefaultDuration: 45,
      },
    ],
  };

  //#endregion

  //#region before each

  //beforeEach( module( "Soar.Common" ) );
  //beforeEach( module( "common.factories" ) );
  beforeEach(
    module('Soar.Schedule', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('localize', localize);

      idealDayTemplatesFactory = {
        get: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({ Value: templates }),
        }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({ Value: template }),
        }),
        access: jasmine.createSpy().and.returnValue({
          View: true,
          Create: true,
        }),
        AppointmentTypes: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockAppointmentTypes),
        }),
        PracticeSettings: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockPracticeSettings),
        }),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        IdealDayTemplateDto: jasmine.createSpy().and.returnValue({
          TemplateId: null,
          Name: null,
          Details: [],
        }),
        IdealDayDetailDto: jasmine.createSpy().and.returnValue({
          StartTime: null,
          EndTime: null,
          AppointmentTypeId: null,
        }),
      };
      $provide.value('IdealDayTemplatesFactory', idealDayTemplatesFactory);

      modalFactory = {
        CancelModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        Modal: jasmine.createSpy().and.returnValue({
          result: {
            then: function (fn) {
              fn();
            },
          },
        }),
      };
      $provide.value('ModalFactory', modalFactory);

      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };
      $provide.value('ModalInstance', modalInstance);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $timeout,
    $compile
  ) {
    scope = $rootScope.$new();
    timeout = $timeout;
    compile = $compile;
    listHelper = $injector.get('ListHelper');
    rootScope = $rootScope;

    //mock for location
    location = {
      url: jasmine.createSpy('$location.url'),
    };

    ////mock for staticData
    //staticData = {
    //    TaxableServices: jasmine.createSpy().and.returnValue( {
    //        then: jasmine.createSpy().and.returnValue( {} )
    //    })
    //};

    scope.data = {
      appointmentTypes: mockAppointmentTypes.Value,
      DefaultTimeIncrement: 10,
      mode: 'new',
      DataHasChanged: false,
      practiceSettings: mockPracticeSettings.Value,
    };

    ctrl = $controller('IdealDaysCrudController', {
      $scope: scope,
      ModalFactory: modalFactory,
      ListHelper: listHelper,
      $timeout: timeout,
      toastrFactory: toastrFactory,
      $uibModalInstance: modalInstance,
      localize: localize,
      StaticData: staticData,
      $location: location,
      ColorUtilities: colorUtilities,
    });
    scope.cancel = function () {};
    scope.saveIdealDay = function () {};
  }));

  var loadHtml = function () {
    element = angular.element(
      '<div class="idealDaysCrud">' +
        '<form name="frmIdealDaysCrud" novalidate> ' +
        '<input id="inpIdealDayTemplateName" class="form-input required valid" ng-model="idealDaysTemplateDto.Name" ' +
        'name="inpIdealDayTemplateName" type="text" set-focus required /> ' +
        '</form></div>'
    );

    // use compile to render the html
    compile(element)(scope);
    scope = element.isolateScope() || element.scope();
    scope.$digest();
  };

  //#endregion
  describe('init function -> ', function () {
    it('should set initial properties', function () {
      ctrl.init();
      expect(scope.idealDaysOccurrences).toEqual(
        new kendo.data.ObservableArray([])
      );
      expect(scope.idealDaysTemplateDto).toEqual({
        TemplateId: null,
        Name: null,
        Details: [],
      });
      expect(scope.defaultTimeIncrement).toEqual(
        mockPracticeSettings.Value.DefaultTimeIncrement
      );
      expect(scope.ticksPerHour).toEqual(
        60 / mockPracticeSettings.Value.DefaultTimeIncrement
      );
    });

    it('should call getExistingTemplate if scope.data.selectedTemplateId is not null and mode is edit', function () {
      spyOn(ctrl, 'getExistingTemplate');
      scope.data.mode = 'edit';
      scope.data.selectedTemplateId = 2;
      ctrl.init();
      expect(ctrl.getExistingTemplate).toHaveBeenCalledWith(2);
    });

    it('should set save button text to Save if mode is edit', function () {
      spyOn(ctrl, 'getExistingTemplate');
      scope.data.mode = 'edit';
      scope.data.selectedTemplateId = 2;
      ctrl.init();
      expect(scope.actionText).toEqual('Save');
    });

    it('should set save button text to Create {} if mode is new', function () {
      scope.data.mode = 'new';
      ctrl.init();
      expect(scope.actionText).toEqual('Create {0} ');
    });
  });

  describe('setupOccurrences function -> ', function () {
    beforeEach(function () {
      scope.idealDaysScheduler = {
        setDataSource: function () {},
        refresh: function () {},
        view: function () {
          return {
            content: {
              find: function () {
                return [];
              },
            },
          };
        },
      };
    });

    it('should add event to idealDaysOccurrences for each detail in idealDaysTemplateDto with dates based on scheduler date(2015-01-01) plus occurrence time', function () {
      scope.idealDaysTemplateDto = angular.copy(template);
      ctrl.setupOccurrences();
      timeout.flush(200);
      expect(scope.idealDaysOccurrences[0].start).toEqual(
        new Date('2015-01-01 08:00:00.0000000')
      );
      expect(scope.idealDaysOccurrences[0].end).toEqual(
        new Date('2015-01-01 10:00:00.0000000')
      );
      expect(scope.idealDaysOccurrences[1].start).toEqual(
        new Date('2015-01-01 10:00:00.0000000')
      );
      expect(scope.idealDaysOccurrences[1].end).toEqual(
        new Date('2015-01-01 12:00:00.0000000')
      );
      expect(scope.idealDaysOccurrences[0].AppointmentTypeId).toEqual(
        scope.idealDaysTemplateDto.Details[0].AppointmentTypeId
      );
      expect(scope.idealDaysOccurrences[1].AppointmentTypeId).toEqual(
        scope.idealDaysTemplateDto.Details[1].AppointmentTypeId
      );
    });
  });

  describe('cancelChanges function -> ', function () {
    it('should call parent cancel method if exists ', function () {
      spyOn(scope, 'cancel');
      scope.cancelChanges();
      expect(scope.formIsValid).toBe(true);
      expect(scope.cancel).toHaveBeenCalled();
    });
  });

  describe('cancelListChanges function -> ', function () {
    it('should call CancelModal if dataHasChanged is true', function () {
      scope.cancelListChanges();
      scope.dataHasChanged = true;
      scope.DataHasChanged = true;
      scope.cancelListChanges();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });

    it('should call cancel if dataHasChanged is false', function () {
      spyOn(scope, 'cancelChanges');
      scope.dataHasChanged = false;
      scope.cancelListChanges();
      expect(scope.cancelChanges).toHaveBeenCalled();
    });
  });

  describe('validateForm function -> ', function () {
    beforeEach(function () {
      var html =
        '<div class="idealDaysCrud">  ' +
        '<form name="frmIdealDaysCrud" novalidate> ' +
        '<input id="inpIdealDayTemplateName" ' +
        'class="form-input required valid"  ' +
        'ng-model="idealDaysTemplateDto.Name" ' +
        'name="inpIdealDayTemplateName" ' +
        'maxlength="500" ' +
        'type="text"  ' +
        'required />  ' +
        '</form></div>';
      compile(html)(scope);
      rootScope.$digest();
    });

    it('should set formIsValid to true if template name is valid and we have at least one event', function () {
      scope.idealDaysTemplateDto.Name = 'Template1';
      scope.idealDaysTemplateDto.Details = [{}, {}];
      scope.frmIdealDaysCrud.inpIdealDayTemplateName.$error.required = false;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(true);
    });

    it('should set formIsValid to true if template name is not valid', function () {
      scope.frmIdealDaysCrud.inpIdealDayTemplateName.$error.required = true;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to true if no details', function () {
      scope.frmIdealDaysCrud.inpIdealDayTemplateName.$error.required = false;
      scope.idealDaysTemplateDto.Details = [];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });
  });

  describe('setFocusOnElement function -> ', function () {
    beforeEach(function () {
      var html =
        '<div class="idealDaysCrud">  ' +
        '<form name="frmIdealDaysCrud" novalidate> ' +
        '<input id="inpIdealDayTemplateName" ' +
        'class="form-input required valid"  ' +
        'ng-model="idealDaysTemplateDto.Name" ' +
        'name="inpIdealDayTemplateName" ' +
        'maxlength="500" ' +
        'type="text"  ' +
        'required />  ' +
        '</form></div>';
      compile(html)(scope);
      rootScope.$digest();
    });

    // TODO not working
    it('should set formIsValid to true if template name is not valid', function () {
      scope.frmIdealDaysCrud.inpIdealDayTemplateName.$valid = false;
      expect(scope.setFocusOnElement()).toBe(true);
      //expect(angular.element('#inpIdealDayTemplateName').focus).toHaveBeenCalled();
    });
  });

  describe('draggableHint function -> ', function () {
    var element;
    beforeEach(function () {
      element = {
        clone: jasmine
          .createSpy()
          .and.returnValue({
            Name: 'Consultation',
            css: jasmine.createSpy(),
            attr: jasmine.createSpy(),
            indexOf: jasmine.createSpy().and.returnValue(1),
          }),
      };
      spyOn(angular, 'element').and.returnValue(element);
    });

    it('should return html with appointmentType data applied', function () {
      var appointmentTypes = [
        {
          AppointmentTypeId: '312',
          Name: 'Consultation',
          AppointmentTypeColor: '#FFa980',
          FontColor: '#000000',
          PerformedByProviderTypeId: 1,
          DefaultDuration: 30,
        },
      ];
      var hintHtml = scope.draggableHint(element);
      expect(hintHtml.indexOf(appointmentTypes[0].Name) > -1).toBe(true);
    });
  });

  describe('onDragEnd function -> ', function () {
    var element;
    beforeEach(function () {
      element = {
        removeClass: jasmine.createSpy(),
      };
      spyOn(angular, 'element').and.returnValue(element);
    });

    it('should remove class hollow', function () {
      scope.onDragEnd(element);
      expect(element.removeClass).toHaveBeenCalled();
    });
  });

  describe('onDragStart function -> ', function () {
    var element;
    beforeEach(function () {
      element = {
        removeClass: jasmine.createSpy(),
        initialTarget: { id: 'abc' },
      };
      spyOn(angular, 'element').and.returnValue(element);
      spyOn(ctrl, 'getAppointmentType').and.returnValue({
        AppointmentTypeId: '312',
        Name: 'Consultation',
        AppointmentTypeColor: '#FFa980',
        FontColor: '#000000',
        PerformedByProviderTypeId: 1,
        DefaultDuration: 30,
      });
    });

    it('should remove class hollow', function () {
      scope.draggableClass = '';
      scope.onDragEnd(element);
      // TODO fix this
      //expect(scope.draggableClass).toEqual('hollow');
    });
  });

  describe('dropToSchedule function -> ', function () {
    var element;
    beforeEach(function () {
      angular.element(document.body).append('<div> </div>');
      element = {
        draggable: {
          element: [{ id: 1 }, { id: 2 }],
        },
        target: {
          offsetLeft: 0,
          offsetTop: 0,
        },
      };

      scope.idealDaysScheduler = {
        dataSource: { add: jasmine.createSpy().and.returnValue({}) },
        slotByPosition: function () {
          return {
            startDate: new Date(),
            endDate: new Date(),
          };
        },
      };
      scope.currentAppointmentType = scope.data.appointmentTypes[0];
      spyOn(ctrl, 'getAppointmentType').and.returnValue(
        scope.currentAppointmentType
      );
    });

    it('should not add new event to scheduler when #event-hint not found', function () {
      angular.element(document.body).append('<div> </div>');
      scope.dropToSchedule(element);
      expect(scope.idealDaysScheduler.dataSource.add).not.toHaveBeenCalled();
    });

    it('should add new event to scheduler when #event-hint can be found with valid position and data', function () {
      scope.allowDrop = true;
      angular.element(document.body).append('<div id="event-hint"> </div>');
      scope.dropToSchedule(element);
      expect(scope.idealDaysScheduler.dataSource.add).toHaveBeenCalled();
    });
  });

  describe('checkPosition when slotByPosition returns slot', function () {
    var element;
    beforeEach(function () {
      scope.draggerState = false;
      scope.isNewDragger = true;

      scope.idealDaysScheduler = {
        slotByPosition: function () {
          return {
            startDate: new Date(),
            endDate: new Date(),
          };
        },
      };
      scope.currentAppointmentType = scope.data.appointmentTypes[0];
      element = { x: { client: 0 }, y: { client: 0 } };
    });

    it('should set draggerState to true and isNewDragger to false when isOkToDrop', function () {
      // slot is not taken
      spyOn(scope, 'checkAvailability').and.callFake(function () {
        return true;
      });
      scope.checkPosition(element);
      expect(scope.draggerState).toBe(true);
      expect(scope.isNewDragger).toBe(false);
    });

    it('should set draggerState to false and isNewDragger to false when isOkToDrop is false', function () {
      // slot is taken
      spyOn(scope, 'checkAvailability').and.callFake(function () {
        return false;
      });
      scope.checkPosition(element);
      expect(scope.draggerState).toBe(false);
      expect(scope.isNewDragger).toBe(false);
    });
  });

  describe('checkPosition when slotByPosition returns null', function () {
    var element;
    beforeEach(function () {
      scope.draggerState = false;
      scope.isNewDragger = true;
      scope.idealDaysScheduler = {
        slotByPosition: function () {
          return null;
        },
      };
      scope.currentAppointmentType = scope.data.appointmentTypes[0];
      element = { x: { client: 0 }, y: { client: 0 } };
    });

    it('should set isNewDragger to false when slot is null', function () {
      // slot is not taken
      spyOn(scope, 'checkAvailability').and.callFake(function () {
        return false;
      });
      scope.checkPosition(element);
      expect(scope.draggerState).toBe(false);
      expect(scope.isNewDragger).toBe(false);
    });
  });

  describe('getAppointmentType function -> ', function () {
    it('should return AppointmentType based on AppointmentTypeId', function () {
      var apptTypeId = mockAppointmentTypes.Value[1].AppointmentTypeId;
      expect(ctrl.getAppointmentType(apptTypeId)).toEqual(
        mockAppointmentTypes.Value[1]
      );
    });
  });

  describe('getEndDate function -> ', function () {
    it('should return endDate based on startDate plus DefaultDuration', function () {
      var dataItem = { DefaultDuration: 90 };
      var slot = { startDate: new Date() };
      var endDate = new Date(slot.startDate.getTime());
      endDate.setMinutes(endDate.getMinutes() + dataItem.DefaultDuration);
      expect(ctrl.getEndDate(dataItem, slot)).toEqual(endDate);
    });
  });

  describe('occurrencesInRange function -> ', function () {
    it('should ', function () {});
  });

  describe('filterOccurences function -> ', function () {
    it('should ', function () {});
  });

  describe('occurrencesConflict function -> ', function () {
    it('should ', function () {});
  });

  describe('occurrencesConflict function -> ', function () {
    //var mockOccurrences;
    //beforeEach(function(){
    //    mockOccurrences=[{ start: new Date(), end: new Date() },{ start: new Date(), end: new Date() }, ];
    //    scope.idealDaysScheduler = {
    //        occurrencesInRange: jasmine.createSpy().and.returnValue({mockOccurrences})
    //    };
    //});
    //it( 'should call occurrencesInRange', function () {
    //    spyOn(mockOccurrences, 'indexOf').and.returnValue(1);
    //    var start = new Date();
    //    var end = new Date();;
    //    var event = {};
    //    scope.occurrencesConflict(start, end, event);
    //    expect( scope.idealDaysScheduler.occurrencesInRange).toHaveBeenCalledWith(start, end, event);
    //});
  });

  describe('inDayRange function -> ', function () {
    it('should ', function () {});
  });

  describe('checkAvailability function -> ', function () {
    it('should ', function () {});
  });

  describe('setEventCss function -> ', function () {
    it('should ', function () {});
  });

  describe('removeOccurrence function -> ', function () {
    it('should ', function () {});
  });

  describe('confirmDelete function -> ', function () {
    it('should ', function () {});
  });

  describe('buildIdealDaysDetails function -> ', function () {
    it('should build an occurrence and convert times to utc and add to scope.idealDaysOccurrencesDetails', function () {
      scope.idealDaysOccurrences = [];
      var occurrenceEvent = {
        start: '2017-12-14 12:00:00.0000000Z',
        end: '2017-12-14 13:30:00.0000000Z',
        AppointmentTypeId: 21,
      };
      scope.idealDaysOccurrences.push(occurrenceEvent);
      ctrl.buildIdealDaysDetails();

      var format = 'YYYY-MM-DD[T]HH:mm:ss[.00Z]';
      expect(scope.idealDaysTemplateDto.Details[0].StartTime).toEqual(
        moment('2017-12-14 12:00:00.0000000Z').format(format)
      );
      expect(scope.idealDaysTemplateDto.Details[0].EndTime).toEqual(
        moment('2017-12-14 13:30:00.0000000Z').format(format)
      );
      expect(scope.idealDaysTemplateDto.Details[0].AppointmentTypeId).toEqual(
        21
      );
    });
  });

  describe('saveIdealDayTemplate function -> ', function () {
    beforeEach(function () {
      scope.idealDaysTemplateDto = {};
      loadHtml();
      spyOn(ctrl, 'buildIdealDaysDetails');
      spyOn(ctrl, 'validateForm').and.returnValue(true);
    });

    it('should call ctrl.buildIdealDaysDetails -> ', function () {
      scope.saveIdealDayTemplate(scope.idealDaysTemplateDto);
      expect(ctrl.buildIdealDaysDetails).toHaveBeenCalled();
    });

    it('should call validateForm -> ', function () {
      scope.saveIdealDayTemplate(scope.idealDaysTemplateDto);
      expect(ctrl.validateForm).toHaveBeenCalled();
    });

    it('should idealDayTemplatesFactory.save with scope.idealDaysTemplateDto if user has access and validateForm returns true -> ', function () {
      scope.saveIdealDayTemplate(scope.idealDaysTemplateDto);
      expect(idealDayTemplatesFactory.save).toHaveBeenCalledWith(
        scope.idealDaysTemplateDto
      );
    });
  });
});
