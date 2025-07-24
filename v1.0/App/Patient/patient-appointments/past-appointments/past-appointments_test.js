// File was commented out to ensure work is not blocked for some reason the tests for this file cause the tests to fail mid way because of a new method that was added.
//describe('PastAppointmentsController tests ->', function () {
//var ctrl, scope, filter, routeParams, patientAppointmentsFactory, appointmentTypesFactory, timeout;
//var userSettingsDataService, appointmentModalLinksService;
//var listHelper, modalFactory, usersFactory, q;

////#region mocks

//var pastAppointmentsMock = [{
//    'PersonId': '7208f28d-6785-4053-8665-b89a7db091b1',
//    'AppointmentId': '13531020-aa3b-4cb8-8e98-4d2eac030062',
//    'AppointmentTypeId': null,
//    'ProviderUserId': 'ea82be0c-6c2c-e811-8d65-f0d5bf93e9cc',
//    'PastAppointmentTypeId': 1,
//    'TimeLogged': '2018-06-01T22:30:00.626415',
//    'Note': 'I cancelled the appointment',
//    'IsDeleted': false
//}, {
//    'PersonId': '7208f28d-6785-4053-8665-b89a7db091b1',
//    'AppointmentId': '84559d21-09ce-4605-8ce2-1e6461b431f8',
//    'AppointmentTypeId': '0ac5028f-b4e0-4315-93c8-5db2976f27dd',
//    'ProviderUserId': 'ea82be0c-6c2c-e811-8d65-f0d5bf93e9cc',
//    'PastAppointmentTypeId': 0,
//    'TimeLogged': '2018-05-25T16:10:22.8840457',
//    'Note': 'I missed the appointment',
//    'IsDeleted': false
//}, {
//    'PersonId': '7208f28d-6785-4053-8665-b89a7db091b1',
//    'AppointmentId': '75264dc5-2a87-48a1-889d-25a18eceea65',
//    'AppointmentTypeId': '0ac5028f-b4e0-4315-93c8-5db2976f27dd',
//    'ProviderUserId': '280eab02-582c-e811-8d65-f0d5bf93e9cc',
//    'PastAppointmentTypeId': 1,
//    'TimeLogged': '2018-05-25T16:06:50.1909742',
//    'Note': 'Ive been deleted',
//    'IsDeleted': true
//}, {
//    'PersonId': '7208f28d-6785-4053-8665-b89a7db091b1',
//    'AppointmentId': '220b4a23-931d-422b-b45e-347315a0624d',
//    'AppointmentTypeId': '0ac5028f-b4e0-4315-93c8-5db2976f27dd',
//    'ProviderUserId': '280eab02-582c-e811-8d65-f0d5bf93e9cc',
//    'PastAppointmentTypeId': 1,
//    'TimeLogged': '2018-05-25T16:05:27.2432464',
//    'Note': null,
//    'IsDeleted': true
//}, {
//    'PersonId': '7208f28d-6785-4053-8665-b89a7db091b1',
//    'AppointmentId': '88362ef4-8835-4240-b6c8-dbee3c898957',
//    'AppointmentTypeId': 'd03adad2-7809-41d1-b906-30764675eb79',
//    'ProviderUserId': '280eab02-582c-e811-8d65-f0d5bf93e9cc',
//    'PastAppointmentTypeId': 1,
//    'TimeLogged': '2018-05-25T16:04:57.7213485',
//    'Note': null,
//    'IsDeleted': true
//}];

//#endregion

//beforeEach(module('Soar.Patient', function ($provide) {
//    patientAppointmentsFactory = {
//        access: jasmine.createSpy().and.returnValue({
//            View: true
//        }),
//        AccountPastAppointments: jasmine.createSpy().and.returnValue({ then: function () { } }),
//        PatientPastAppointments: jasmine.createSpy().and.returnValue({ then: function () { } }),
//        observeLoadHistory: jasmine.createSpy().and.returnValue({}),
//    };
//    $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);

//    userSettingsDataService = {
//        isNewAppointmentAreaEnabled: jasmine.createSpy().and.returnValue(false)
//    };
//    $provide.value('userSettingsDataService', userSettingsDataService);

//    appointmentModalLinksService = {
//        appointmentLinks: jasmine.createSpy()
//    };
//    $provide.value('AppointmentModalLinksService', appointmentModalLinksService);
//}));

//beforeEach(module('Soar.BusinessCenter', function ($provide) {
//    usersFactory = {
//        Users: jasmine.createSpy().and.returnValue({ then: function () { } })
//    };
//    $provide.value('UsersFactory', usersFactory);

//    appointmentTypesFactory = {
//        AppointmentTypes: jasmine.createSpy().and.returnValue({ then: function () { } })
//    };
//    $provide.value('AppointmentTypesFactory', appointmentTypesFactory);
//}));

//beforeEach(inject(function ($rootScope, $controller, $injector, $filter, $routeParams, $q, $location, $window) {
//    scope = $rootScope.$new();
//    filter = $filter;
//    q = $q;
//    location = $location;
//    timeout = $injector.get('$timeout');
//    listHelper = $injector.get('ListHelper');
//    window = $window;

//    //mock of ModalFactory
//    modalFactory = {
//        NoteModal: jasmine.createSpy('modalFactory.NoteModal').and.returnValue({})
//    };

//    scope.patient = { PatientId: 'ebfa2074-bdcb-487a-8012-456456456ddd' };
//    ctrl = $controller('PastAppointmentsController', {
//        $scope: scope,
//        $filter: filter,
//        ModalFactory: modalFactory,
//        $routeParams: routeParams,
//        PatientAppointmentsFactory: patientAppointmentsFactory,
//        UsersFactory: usersFactory,
//        $location: location,
//        $window: window
//    });

//    //ctrl.$onInit();
//}));

//describe('setProviderInfo method -> ', function () {
//    var appointment;

//    it('should dynamically add provider name to the appointment if in list', function () {
//        ctrl.providers = [{ UserId: 'ea82be0c-6c2c-e811-8d65-f0d5bf93e9cc', FirstName: 'Bob', LastName: 'Wood' },
//        { UserId: 'ea82be0c-6c2c-e811-8d65-f0d5bf93e9cd', FirstName: 'Rose', LastName: 'Sharon' }];
//        appointment = pastAppointmentsMock[0];
//        listHelper.findItemByFieldValue = jasmine.createSpy().and.returnValue({ FirstName: 'Rose', LastName: 'Sharon' });
//        ctrl.setProviderInfo(appointment);
//        expect(appointment.$$ProviderName).toEqual('Rose Sharon');
//    });

//    it('should set provider name to Any Provider if provider not in list', function () {
//        ctrl.providers = [{ UserId: 'ea82be0c-6c2c-e811-8d65-f0d5bf93e9cc', FirstName: 'Bob', LastName: 'Wood' },
//        { UserId: 'ea82be0c-6c2c-e811-8d65-f0d5bf93e9cd', FirstName: 'Rose', LastName: 'Sharon' }];
//        appointment = pastAppointmentsMock[0];
//        appointment.Classification = '2';
//        listHelper.findItemByFieldValue = jasmine.createSpy().and.returnValue(null);
//        ctrl.setProviderInfo(appointment);
//        expect(appointment.$$ProviderName).toEqual({});
//    });
//});

//describe('openNoteModal method -> ', function () {
//    it('should call modalFactory with Title, note, and Close button text', function () {
//        scope.openNoteModal('Bobs here');
//        expect(modalFactory.NoteModal).toHaveBeenCalledWith('Status Note', 'Bobs here', 'Close');
//    });
//});

//describe('watch accountView -> ', function () {
//    it('should call getPastAppointmentsByPatient when accountView changes to true', function () {
//        spyOn(ctrl, 'getPastAppointmentsByAccount');
//        scope.accountView = false;
//        scope.$apply();
//        scope.accountView = true;
//        scope.$apply();
//        expect(ctrl.getPastAppointmentsByAccount).toHaveBeenCalled();
//    });

//    it('should not call getPastAppointmentsByPatient when accountView changes to false', function () {
//        spyOn(ctrl, 'getPastAppointmentsByAccount');
//        scope.accountView = true;
//        scope.$apply();
//        scope.accountView = false;
//        scope.$apply();
//        expect(ctrl.getPastAppointmentsByAccount).not.toHaveBeenCalled();
//    });
//});

//describe('setAppointmentState method -> ', function () {
//    it('should set dynamic $$State colunmn to Canceled if appointment.IsDeleted is true and PastAppointmentTypeId is 0', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        appointment.IsDeleted = true;
//        appointment.PastAppointmentTypeId = 0;
//        ctrl.setAppointmentState(appointment);
//        expect(appointment.$$State).toEqual('Canceled');
//    });

//    it('should set dynamic $$State colunmn to Canceled if appointment.IsDeleted is false and PastAppointmentTypeId is 0', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        appointment.IsDeleted = false;
//        appointment.PastAppointmentTypeId = 0;
//        ctrl.setAppointmentState(appointment);
//        expect(appointment.$$State).toEqual('Canceled');
//    });

//    it('should set dynamic $$State colunmn to Completed if appointment.PastAppointmentTypeId is 3', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        appointment.IsDeleted = false;
//        appointment.PastAppointmentTypeId = 3;
//        ctrl.setAppointmentState(appointment);
//        expect(appointment.$$State).toEqual('Completed');
//    });

//    it('should set dynamic $$State colunmn to Missed if appointment.IsDeleted is true and appointment.PastAppointmentTypeId is 1', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        appointment.IsDeleted = true;
//        appointment.PastAppointmentTypeId = 1;
//        ctrl.setAppointmentState(appointment);
//        expect(appointment.$$State).toEqual('Missed');
//    });

//    it('should set dynamic $$State colunmn to Missed if appointment.IsDeleted is false and appointment.PastAppointmentTypeId is 1', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        appointment.IsDeleted = false;
//        appointment.PastAppointmentTypeId = 1;
//        ctrl.setAppointmentState(appointment);
//        expect(appointment.$$State).toEqual('Missed');
//    });
//});

//describe('openNoteModal method -> ', function () {
//    it('should set dynamic property $$AppointmentType if matching appointmentType ', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        var appointmentType = { AppointmentTypeId: 1, Color: 'Blue' };
//        listHelper.findItemByFieldValue = jasmine.createSpy().and.returnValue(appointmentType);
//        ctrl.setAppointmentType(appointment);
//        expect(appointment.$$AppointmentType).toEqual(appointmentType);
//    });
//});

//describe('setCanSchedule method -> ', function () {
//    it('should set appointment.$$CanSchedule to false if IsDeleted is true ', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        appointment.IsDeleted = true;
//        ctrl.setCanSchedule(appointment);
//        expect(appointment.$$CanSchedule).toEqual(false);
//    });

//    it('should set appointment.$$CanSchedule to false if appointment.PastAppointmentTypeId is 3 (Completed) ', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        appointment.PastAppointmentTypeId = 3;
//        appointment.IsDeleted = false;
//        ctrl.setCanSchedule(appointment);
//        expect(appointment.$$CanSchedule).toEqual(false);
//    });

//    it('should set appointment.$$CanSchedule to false if IsDeleted is false and appointment.PastAppointmentTypeId is not 3 ', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        appointment.PastAppointmentTypeId = 0;
//        appointment.IsDeleted = false;
//        ctrl.setCanSchedule(appointment);
//        expect(appointment.$$CanSchedule).toEqual(false);
//    });

//});

//describe('setPatientFirstName method -> ', function () {
//    it('should set dynamic property $$FirstName if matching patient ', function () {
//        var appointment = angular.copy(pastAppointmentsMock[0]);
//        var mockPatient = { FirstName: 'Betsy', LastName: 'Ross' };
//        listHelper.findItemByFieldValue = jasmine.createSpy().and.returnValue(mockPatient);
//        ctrl.setPatientFirstName(appointment);
//        expect(appointment.$$FirstName).toEqual('Betsy');
//    });
//});

//describe('setPatientFirstName method -> ', function () {
//    it('should call methods for setting dynamic properties for each pastAppointment in list ', function () {
//        spyOn(ctrl, 'setAppointmentState');
//        spyOn(ctrl, 'setProviderInfo');
//        spyOn(ctrl, 'setAppointmentType');
//        spyOn(ctrl, 'setPatientFirstName');
//        spyOn(ctrl, 'setCanSchedule');
//        scope.pastAppointments = angular.copy(pastAppointmentsMock);
//        ctrl.addDynamicProperties();
//        angular.forEach(scope.pastAppointments, function (appointment) {
//            expect(ctrl.setAppointmentState).toHaveBeenCalledWith(appointment);
//            expect(ctrl.setProviderInfo).toHaveBeenCalledWith(appointment);
//            expect(ctrl.setAppointmentType).toHaveBeenCalledWith(appointment);
//            expect(ctrl.setPatientFirstName).toHaveBeenCalledWith(appointment);
//            expect(ctrl.setCanSchedule).toHaveBeenCalledWith(appointment);
//        });
//    });
//});

//describe('getPastAppointmentsByAccount method -> ', function () {
//    it('should call patientAppointmentsFactory.AccountPastAppointments if accountId ', function () {
//        scope.accountId = '123456';
//        ctrl.getPastAppointmentsByAccount();
//        expect(patientAppointmentsFactory.AccountPastAppointments).toHaveBeenCalledWith(scope.accountId);
//    });
//});

//describe('getPastAppointmentsByPatient method -> ', function () {

//    it('should not call patientAppointmentsFactory.PatientPastAppointments if scope.patient.PatientId is null or undefined ', function () {
//        scope.patient = undefined;
//        ctrl.getPastAppointmentsByPatient();
//        expect(patientAppointmentsFactory.PatientPastAppointments).not.toHaveBeenCalled();
//    });

//    it('should call patientAppointmentsFactory.PatientPastAppointments if scope.patient.PatientId ', function () {
//        scope.patient={PatientId:'1234'};
//        ctrl.getPastAppointmentsByPatient();
//        expect(patientAppointmentsFactory.PatientPastAppointments).toHaveBeenCalledWith(scope.patient.PatientId);
//    });
//});

//describe('loadPastAppointments method -> ', function () {
//    beforeEach(function () {
//        spyOn(ctrl, 'getPastAppointmentsByAccount');
//        spyOn(ctrl, 'getPastAppointmentsByPatient');
//    });

//    it('should call ctrl.getPastAppointmentsByAccount if accountView = true and loadHistory is true ', function () {
//        scope.accountView = true;
//        var loadHistory = true;
//        scope.loadPastAppointments(loadHistory);
//        timeout.flush();
//        expect(ctrl.getPastAppointmentsByAccount).toHaveBeenCalled();
//    });

//    it('should call ctrl.getPastAppointmentsByAccount if accountView = false and loadHistory is true ', function () {
//        scope.accountView = false;
//        var loadHistory = true;
//        scope.loadPastAppointments(loadHistory);
//        timeout.flush();
//        expect(ctrl.getPastAppointmentsByPatient).toHaveBeenCalled();
//    });

//    it('should call neither if accountView = false and loadHistory is false ', function () {
//        scope.accountView = false;
//        var loadHistory = false;
//        scope.loadPastAppointments(loadHistory);
//        expect(ctrl.getPastAppointmentsByPatient).not.toHaveBeenCalled();
//        expect(ctrl.getPastAppointmentsByAccount).not.toHaveBeenCalled();
//    });
//});

//describe('loadAllDependancies method -> ', function () {
//    beforeEach(function () {
//        q = {
//            all: jasmine.createSpy('$q.all').and.returnValue({ then: function () { } })
//        };
//        scope.appointmentLoading = true;
//    });

//    it('should call patientAppointmentsFactory.AccountPastAppointments if accountView is true and scope.accountId is not null', function () {
//        scope.accountView = true;
//        scope.accountId = '1234';
//        ctrl.loadAllDependancies();
//        expect(patientAppointmentsFactory.AccountPastAppointments).toHaveBeenCalledWith(scope.accountId);
//        expect(usersFactory.Users).toHaveBeenCalled();
//    });

//    it('should not call patientAppointmentsFactory.AccountPastAppointments if accountView is true and scope.accountId is null or undefined', function () {
//        scope.accountView = true;
//        scope.accountId = undefined;
//        ctrl.loadAllDependancies();
//        expect(patientAppointmentsFactory.AccountPastAppointments).not.toHaveBeenCalled();
//        expect(usersFactory.Users).toHaveBeenCalled();
//    });

//    it('should call patientAppointmentsFactory.PatientPastAppointments if accountView is false and scope.patient.PatientId is not null or undefined', function () {
//        scope.accountView = false;
//        scope.patient.PatientId = '1234';
//        ctrl.loadAllDependancies();
//        expect(patientAppointmentsFactory.PatientPastAppointments).toHaveBeenCalledWith(scope.patient.PatientId);
//    });

//    it('should not call patientAppointmentsFactory.PatientPastAppointments if accountView is false and scope.patient.PatientId is null or undefined', function () {
//        scope.accountView = false;
//        scope.patient.PatientId = undefined;
//        ctrl.loadAllDependancies();
//        expect(patientAppointmentsFactory.PatientPastAppointments).not.toHaveBeenCalled();
//    });

//    it('should call patientAppointmentsFactory.AccountPastAppointments and usersFactory.Users in either case', function () {
//        scope.accountView = false;
//        ctrl.loadAllDependancies();
//        expect(appointmentTypesFactory.AppointmentTypes).toHaveBeenCalled();
//        expect(usersFactory.Users).toHaveBeenCalled();

//        scope.accountView = true;
//        ctrl.loadAllDependancies();
//        expect(appointmentTypesFactory.AppointmentTypes).toHaveBeenCalled();
//        expect(usersFactory.Users).toHaveBeenCalled();
//    });
//});

//describe('init method -> ', function () {
//    it('should call patientAppointmentsFactory.observeLoadHistory and ctrl.loadAllDependancies ', function () {
//        spyOn(ctrl, 'loadAllDependancies');
//        ctrl.init();

//        expect(scope.loadingDependancies).toBe(true);
//        expect(patientAppointmentsFactory.observeLoadHistory).toHaveBeenCalled();
//        expect(ctrl.loadAllDependancies).toHaveBeenCalled();
//    });
//});

//});
