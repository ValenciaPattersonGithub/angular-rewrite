import { of } from 'rsjs';

describe('IdealDaysController ->', function () {
  var ctrl, scope, timeout, toastrFactory, localize, location, staticData;
  var listHelper,
    idealDayTemplatesFactory,
    modalFactory,
    q,
    modalInstance,
    templates,
    referenceDataService,
    practiceSettingsService;

  //#region mocks

  templates = [
    { Name: 'Template1', TemplateId: 1, Details: [] },
    { Name: 'Template2', TemplateId: 2, Details: [] },
    { Name: 'Template3', TemplateId: 3, Details: [] },
  ];

  var mockPracticeSettings = {
    SettingsName: 'SOAR',
    DefaultTimeIncrement: 10,
    IsProvisioned: true,
    IsEStatementEnabled: false,
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
          Value: templates,
        }),
        access: jasmine.createSpy().and.returnValue({
          View: true,
          Create: true,
        }),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        delete: jasmine.createSpy().and.returnValue({
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
        observeTemplates: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('IdealDayTemplatesFactory', idealDayTemplatesFactory);

      referenceDataService = {
        get: jasmine.createSpy().and.returnValue(mockAppointmentTypes),
        entityNames: {
          appointmentTypes: 'appointmentTypes',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      practiceSettingsService = {
        get: jasmine.createSpy().and.returnValue(of(mockPracticeSettings))
      };
      $provide.value('practiceSettingsService', practiceSettingsService);

      modalFactory = {
        ConfirmLockModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        ConfirmModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        DeleteModal: jasmine
          .createSpy('modalFactory.DeleteModal')
          .and.callFake(function () {
            var modalFactoryDeferred = q.defer();
            modalFactoryDeferred.resolve(1);
            return {
              result: modalFactoryDeferred.promise,
              then: function () {},
            };
          }),
        CancelModal: jasmine
          .createSpy('modalFactory.CancelModal')
          .and.callFake(function () {
            var modalFactoryDeferred = q.defer();
            modalFactoryDeferred.resolve(1);
            return {
              result: modalFactoryDeferred.promise,
              then: function () {},
            };
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
    $q
  ) {
    q = $q;
    scope = $rootScope.$new();
    timeout = $timeout;
    listHelper = $injector.get('ListHelper');

    //mock for location
    location = {
      url: jasmine.createSpy('$location.url'),
    };

    scope.data = {
      appointmentTypes: mockAppointmentTypes.Value,
      DefaultTimeIncrement: 10,
      mode: 'new',
      DataHasChanged: false,
    };

    ctrl = $controller('IdealDaysController', {
      $scope: scope,
      ModalFactory: modalFactory,
      ListHelper: listHelper,
      $timeout: timeout,
      toastrFactory: toastrFactory,
      localize: localize,
      StaticData: staticData,
      $location: location,
      $uibModalInstance: modalInstance,
      idealDayTemplates: templates,
      manageIdealDaysCallback: function () {},
    });
  }));

  //#endregion

  /*
    $scope.newIdealDay = function () {
            $scope.mode = 'new';
            $scope.dataForCrudOperation.mode = 'new';
        };
    */

  describe('init function -> ', function () {
    it('should call getAppointmentTypes ', function () {
      spyOn(ctrl, 'getAppointmentTypes');
      ctrl.init();
      expect(ctrl.getAppointmentTypes).toHaveBeenCalled();
    });

    it('should call getPracticeSettings ', function () {
      spyOn(ctrl, 'getPracticeSettings');
      ctrl.init();
      expect(ctrl.getPracticeSettings).toHaveBeenCalled();
    });
  });

  describe('newIdealDay function -> ', function () {
    it('should set mode to new', function () {
      scope.newIdealDay();
      expect(scope.mode).toBe('new');
      expect(scope.dataForCrudOperation.mode).toBe('new');
    });
  });

  describe('newIdealDay function -> ', function () {
    it('should set mode to edit', function () {
      var template = templates[0];
      scope.editTemplate(template);
      expect(scope.mode).toBe('edit');
      expect(scope.dataForCrudOperation.mode).toBe('edit');
      expect(scope.dataForCrudOperation.selectedTemplateId).toEqual(
        templates[0].TemplateId
      );
    });
  });

  describe('cancel function -> ', function () {
    it('should set mode to list', function () {
      scope.cancel();
      expect(scope.mode).toBe('list');
      expect(scope.dataForCrudOperation.mode).toBe('list');
    });
  });

  describe('getAppointmentTypes function -> ', function () {
    it('should set mode to list', function () {
      ctrl.getAppointmentTypes();
      expect(referenceDataService.get).toHaveBeenCalledWith(
        referenceDataService.entityNames.appointmentTypes
      );
    });
  });

  describe('practiceSettingsService.get function -> ', function () {
    it('should set mode to list', function () {
      ctrl.getPracticeSettings();
      expect(practiceSettingsService.get).toHaveBeenCalled();
    });
  });

  describe('deleteTemplate method -> ', function () {
    it('should call modalFactory.ConfirmModal', function () {
      var template = angular.copy(templates[0]);
      scope.deleteTemplate(template);
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Delete Template',
        'Deleting this ideal day template will remove it from any provider hour assignments . Are you sure you want to continue?',
        'Yes',
        'No'
      );
    });
  });

  describe('deleteConfirmed method -> ', function () {
    it('should patientNotesFactory.deleteNote', function () {
      var template = angular.copy(templates[0]);
      ctrl.deleteConfirmed(template);
      expect(idealDayTemplatesFactory.delete).toHaveBeenCalledWith(template);
    });
  });

  describe('editTemplate method -> ', function () {
    var template;
    beforeEach(function () {
      template = angular.copy(templates[0]);
    });

    it('should set mode to edit', function () {
      scope.editTemplate(template);
      expect(scope.mode).toBe('edit');
      expect(scope.dataForCrudOperation.mode).toBe('edit');
    });

    it('should setscope.dataForCrudOperation.selectedTemplateId to template.TemplateId', function () {
      scope.editTemplate(template);
      expect(scope.dataForCrudOperation.selectedTemplateId).toEqual(
        template.TemplateId
      );
    });
  });

  describe('updateTemplates method -> ', function () {
    var templates;
    beforeEach(function () {
      templates = angular.copy(templates);
    });

    it('should call ctrl.formatDuration for each template', function () {
      spyOn(ctrl, 'formatDuration');
      scope.updateTemplates(templates);
      expect(ctrl.formatDuration).toHaveBeenCalledWith(templates);
    });
  });

  describe('formatDuration method -> ', function () {
    var idealDayTemplates;
    beforeEach(function () {
      idealDayTemplates = [
        { Name: 'Template1', TemplateId: 1, Details: [], Duration: 240 },
      ];
    });

    it('should format $$Duration based on duration', function () {
      angular.forEach(idealDayTemplates, function (template) {
        template.Duration = 270;
      });
      ctrl.formatDuration(idealDayTemplates);
      angular.forEach(idealDayTemplates, function (template) {
        expect(template.$$Duration).not.toBe(null);
      });
    });
  });
});
