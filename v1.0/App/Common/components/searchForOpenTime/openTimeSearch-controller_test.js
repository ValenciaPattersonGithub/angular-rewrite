//describe('OpenTimeSearchController tests ->', function () {
//    var ctrl, scope, appointmentsOpenTimeFactory, listHelper, filter;

//    var mockLocations =
//         [
//            { LocationId: 1, NameLine1: 'Location A', NameAbbreviation:'Location A', Timezone: 'Eastern Standard Time' },
//            { LocationId: 2, NameLine1: 'Location B', NameAbbreviation: 'Location B', Timezone: 'Central Standard Time' },
//            { LocationId: 3, NameLine1: 'Location C', NameAbbreviation: 'Location C', Timezone: 'Pacific Standard Time' }
//        ];

//    var mockTreatmentRooms = [
//        { RoomId: 1, Name: 'Room A', LocationId: 1 },
//        { RoomId: 2, Name: 'Room B', LocationId: 1 },
//        { RoomId: 3, Name: 'Room C', LocationId: 2 },

//    ];

//    var mockAppointmentTypes =  [
//            { Name: 'Type 1', AppointmentTypeId: 1, AppointmentTypeColor: '#000000', DefaultDuration:45, PerformedByProviderTypeId:2 },
//            { Name: 'Type 2', AppointmentTypeId: 2, AppointmentTypeColor: '#000000' , DefaultDuration:15 , PerformedByProviderTypeId: 1},
//			{ Name: 'Type 21', AppoitnmentTypeId: 21, AppointmentTypeColor: '#ffffff' , DefaultDuration:60, PerformedByProviderTypeId: 1},
//        ];

//    beforeEach(module('Soar.Schedule', function ($provide) {

//        appointmentsOpenTimeFactory = {
//            access: jasmine.createSpy().and.returnValue({View:true}),
//            SlotParams: jasmine.createSpy().and.returnValue({}),
//            Slots: jasmine.createSpy().and.returnValue({
//                then: jasmine.createSpy().and.returnValue({})
//            }),
//            TimeOfDay: jasmine.createSpy().and.returnValue({}),
//            DaysOfWeek: jasmine.createSpy().and.returnValue({})
//        };
//        $provide.value('AppointmentsOpenTimeFactory', appointmentsOpenTimeFactory);
//    }));

//    beforeEach(module('Soar.Common', function ($provide) {
//        //
//        listHelper = {
//            findItemByFieldValue: jasmine.createSpy().and.returnValue({ Timezone: 'Central Standard Time' })
//        };
//        $provide.value('ListHelper', listHelper);
//        //

//    }));
//   //beforeEach(module("common.controllers"));
//    var parentScope;
//    beforeEach(inject(function ($rootScope, $controller, $injector, $timeout, $filter) {
//        scope = $rootScope.$new();
//        parentScope = $rootScope.$new();
//        scope.$parent = parentScope;
//        filter = $filter;
//        scope.selectedLocations=angular.copy(mockLocations);

//        var userLocation = '{"id": "1"}';
//        sessionStorage.setItem('userLocation', userLocation);

//        ctrl = $controller('OpenTimeSearchController', {
//            $scope: scope,
//            $filter:filter,
//            appointmentsOpenTimeFactory:appointmentsOpenTimeFactory
//        });
//        scope.onSchedule = function(){}  ;
//        scope.onPreview = function(){}  ;
//    }));

//    describe('toggleDayOfWeekSelect function -> ', function () {

//        beforeEach(function(){
//        });

//        it('should set the day selected if it was not selected', function () {

//            var day = {selected:false};
//            scope.toggleDayOfWeekSelect(day);
//            expect(day.selected).toBe(true);
//        });

//    });

//    describe('loadDurations function -> ', function () {
//        beforeEach(function(){
//            scope.durations = new kendo.data.ObservableArray([]);
//        });
//        it('should convert minutesString to durations array', function () {
//            scope.minutesString = [{duration: '15'}, {duration: '30'},
//                {duration: '45'}, {duration: '60'}, ] ;
//            ctrl.loadDurations();
//            expect(scope.durations[0]).toEqual(scope.minutesString[0]);
//            expect(scope.durations[1]).toEqual(scope.minutesString[1]);
//            expect(scope.durations[2]).toEqual(scope.minutesString[2]);
//            expect(scope.durations[3]).toEqual(scope.minutesString[3]);
//        });

//    });

//    describe('resetSearchParams function -> ', function () {
//        beforeEach(function(){
//            spyOn(ctrl, 'setFilterLocation');
//        });

//        it('should call appointmentsOpenTimeFactory.SlotParams to reset searchParams to default', function () {
//            ctrl.resetSearchParams();
//            expect(appointmentsOpenTimeFactory.SlotParams).toHaveBeenCalled();
//        });

//        it('should reset openSlots to empty list', function () {
//            ctrl.resetSearchParams();
//            expect(scope.openSlots).toEqual([]);
//        });

//        it('should call ctrl.setFilterLocation to refilter list', function () {
//            ctrl.resetSearchParams();
//            expect(ctrl.setFilterLocation).toHaveBeenCalled();
//        });
//    });

//    describe('ctrl setPreferredDaysParameter function -> ', function () {
//        var searchParams;
//        beforeEach(function(){
//            searchParams ={preferredDays:null};
//            scope.daysOfWeek=[{ name: 'Monday', abbr: 'M', id: 1, selected: false },
//            { name: 'Tuesday', abbr: 'T', id: 2, selected: false },
//            { name: 'Wednesday', abbr: 'W', id: 3, selected: false },
//            { name: 'Thursday', abbr: 'Th', id: 4, selected: false },
//            { name: 'Friday', abbr: 'F', id: 5, selected: false },
//            { name: 'Saturday', abbr: 'Sa', id: 6, selected: false },
//            { name: 'Sunday', abbr: 'Su', id: 0, selected: false }
//        ];
//        });
//        it('should set searchParams.preferredDays to match selected daysOfWeek name', function () {
//            scope.daysOfWeek[3].selected=true;
//            expect(searchParams.preferredDays).toBe(null);
//            ctrl.setPreferredDaysParameter(searchParams);
//            expect(searchParams.preferredDays).toEqual(['Thursday']);

//            scope.daysOfWeek[4].selected=true;
//            ctrl.setPreferredDaysParameter(searchParams);
//            expect(searchParams.preferredDays).toEqual(['Thursday', 'Friday']);
//        });

//    });

//    describe('appointmentTypeChanged function -> ', function () {
//        beforeEach(function(){
//            scope.appointmentTypes = angular.copy(mockAppointmentTypes);
//            scope.searchParams = {preferredDuration:null, dentistId:null};
//        });
//        it('should set preferredDuration to appointmentType.DefaultDuration', function () {
//            var apptTypeId = 1;
//            scope.appointmentTypeChanged(apptTypeId);
//            expect(scope.searchParams.preferredDuration).toEqual(scope.appointmentTypes[0].DefaultDuration);
//        });

//        it('should setscope.searchParams.dentistId equal to  "noexam" if appointmentType PerformedByProviderTypeId equals 2', function () {
//            var apptTypeId = 1;
//            scope.appointmentTypes[0].PerformedByProviderTypeId=1;
//            scope.appointmentTypeChanged(apptTypeId);
//            expect(scope.searchParams.dentistId).toEqual(null);

//            scope.appointmentTypes[0].PerformedByProviderTypeId=2;
//            scope.appointmentTypeChanged(apptTypeId);
//            expect(scope.searchParams.dentistId).toEqual('noexam');
//        });

//    });

//    describe('jumpMonth function -> ', function () {
//        beforeEach(function(){
//            scope.searchParams.startDateTime=new Date();
//            scope.searchParams.startDateTime.setHours(0, 0, 0, 0);
//        });
//        it('should set scope.searchParams.startDateTime to increment months ahead and start of day', function () {
//            scope.jumpMonth(3);
//            var newStartDate = moment().add(3, 'month').toDate();
//            newStartDate.setHours(0, 0, 0, 0);
//            expect(scope.searchParams.startDateTime).toEqual(newStartDate);
//        });

//        it('should set scope.searchParams.endDateTime to increment months ahead +  2 months and start of day', function () {
//            scope.jumpMonth(3);
//            var newStartDate = moment().add(3, 'month').toDate();
//            var newEndDate = new Date();
//            newEndDate.setHours(0,0,0,0);
//            newEndDate.setMonth(newStartDate.getMonth() + 2, newStartDate.getDate());
//            expect(scope.searchParams.endDateTime).toEqual(newEndDate);
//        });

//        it('should set scope.searchParams.startDateTime and scope.searchParams.endDateTime when add by 3 months', function () {
//            scope.searchParams.startDateTime = new Date('2019-01-31T00:00:00.000Z');
//            scope.searchParams.endDateTime = new Date('2019-03-31T00:00:00.000Z');
//            scope.jumpMonth(3);
//            expect(scope.searchParams.startDateTime.toDateString()).toEqual('Tue Apr 30 2019');
//        });

//        it('should set scope.searchParams.startDateTime and scope.searchParams.endDateTime when add by 6 months', function () {
//            var startDateStr = '2019-01-31T00:00:00.000Z';
//            scope.searchParams.startDateTime = new Date(startDateStr);
//            scope.searchParams.endDateTime = new Date('2019-03-31T00:00:00.000Z');
//            scope.jumpMonth(6);

//            var expectedVal = new Date(startDateStr);
//            expectedVal.setHours(0, 0, 0, 0);
//            expectedVal.setMonth(expectedVal.getMonth() + 6);

//            expect(scope.searchParams.startDateTime.toDateString()).toEqual(expectedVal.toDateString());
//        });

//        it('should set scope.searchParams.startDateTime and scope.searchParams.endDateTime when add by 8 months', function () {
//            scope.searchParams.startDateTime = new Date('2019-01-31T00:00:00.000Z');
//            scope.searchParams.endDateTime = new Date('2019-03-31T00:00:00.000Z');
//            scope.jumpMonth(8);
//            expect(scope.searchParams.startDateTime.toDateString()).toEqual('Mon Sep 30 2019');
//        });

//        it('should set scope.searchParams.startDateTime and scope.searchParams.endDateTime when add by 3 months and Feb month', function () {
//            scope.searchParams.startDateTime = new Date('2019-11-30T00:00:00.000Z');
//            scope.searchParams.endDateTime = new Date('2020-03-31T00:00:00.000Z');
//            scope.jumpMonth(3);
//            expect(scope.searchParams.startDateTime.toDateString()).toEqual('Sat Feb 29 2020');
//        });

//    });

//    describe('setFilterLocation function -> ', function () {
//        beforeEach(function(){
//            var userLocation = '{"id": "2"}';
//            sessionStorage.setItem('userLocation', userLocation);

//        });
//        it('should set scope.filterLocation to selectedLocation if there is only one', function () {
//            var selectedLocations= [
//                { LocationId: 1, NameLine1: 'Location A', NameAbbreviation:'Location A', Timezone: 'Eastern Standard Time' }] ;
//            ctrl.setFilterLocation(selectedLocations);
//            expect(scope.filteredLocation.LocationId).toEqual(1);
//        });

//        it('should set scope.filterLocation to userLocation if that is one of the selectedLocations', function () {
//            var selectedLocations= [
//                { LocationId: 1, NameLine1: 'Location A', NameAbbreviation:'Location A', Timezone: 'Eastern Standard Time' },
//                { LocationId: 2, NameLine1: 'Location B', NameAbbreviation: 'Location B', Timezone: 'Central Standard Time' },
//                { LocationId: 3, NameLine1: 'Location C', NameAbbreviation: 'Location C', Timezone: 'Pacific Standard Time' }] ;
//                listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(selectedLocations[1]);
//            ctrl.setFilterLocation(selectedLocations);
//            expect(scope.filteredLocation.LocationId).toEqual(2);
//        });

//        it('should set scope.filterLocation to first selectedLocation if userLocation is not in selectedLocations', function () {
//            var selectedLocations= [
//                { LocationId: 1, NameLine1: 'Location A', NameAbbreviation:'Location A', Timezone: 'Eastern Standard Time' },
//                { LocationId: 3, NameLine1: 'Location C', NameAbbreviation: 'Location C', Timezone: 'Pacific Standard Time' }] ;
//                listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null);

//            listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(selectedLocations[0]);
//            ctrl.setFilterLocation(selectedLocations);
//            expect(scope.filteredLocation.LocationId).toEqual(1);
//        });

//    });

//    describe('refreshTreatmentRooms function -> ', function () {
//        beforeEach(function(){
//            scope.filteredLocation={LocationId:1};
//            scope.treatmentRooms =angular.copy(mockTreatmentRooms);
//        });
//        it('should filter treatmentRooms by location selected', function () {
//            angular.forEach(scope.treatmentRooms, function(room){
//                room.LocationId = 1;
//            });
//            ctrl.refreshTreatmentRooms();
//            expect(scope.treatmentRoomsByLocation).toEqual(scope.treatmentRooms);

//            angular.forEach(scope.treatmentRooms, function(room){
//                room.LocationId = 2;
//            });
//            scope.treatmentRooms[0].LocationId = 1;
//            ctrl.refreshTreatmentRooms();
//            expect(scope.treatmentRoomsByLocation[0].LocationId).toEqual(scope.treatmentRooms[0].LocationId);
//        });

//    });

//    describe('searchParams watch - >', function () {

//        it('should call validSearchParameters function on change', function () {
//            spyOn(scope, 'validSearchParameters');
//            scope.searchParams = {preferredDuration:null, dentistId:null};
//            scope.$apply();
//            scope.searchParams = {preferredDuration:15, dentistId:'noexam'};
//            scope.$apply();
//            expect(scope.validSearchParameters).toHaveBeenCalled();
//        });

//    });

//    describe('treatmentRooms watch - >', function () {

//        it('should call validSearchParameters function on change', function () {
//            scope.treatmentRooms =angular.copy(mockTreatmentRooms);
//            scope.$apply();
//            spyOn(ctrl, 'refreshTreatmentRooms');
//            scope.treatmentRooms.push({ RoomId: 1, Name: 'Room E', LocationId: 1 });
//            scope.$apply();
//            expect(ctrl.refreshTreatmentRooms).toHaveBeenCalled();
//        });

//    });

//    describe('selectedLocations watch - >', function () {

//        it('should call setFilterLocation function on change', function () {
//            scope.selectedLocations =angular.copy(mockLocations);
//            scope.$apply();
//            spyOn(ctrl, 'setFilterLocation');
//            scope.selectedLocations.splice(0,1);
//            scope.$apply();
//            expect(ctrl.setFilterLocation).toHaveBeenCalledWith(scope.selectedLocations);
//        });

//        it('should call refreshTreatmentRooms function on change', function () {
//            scope.selectedLocations =angular.copy(mockLocations);
//            scope.$apply();
//            spyOn(ctrl, 'refreshTreatmentRooms');
//            scope.selectedLocations.splice(0,1);
//            scope.$apply();
//            expect(ctrl.refreshTreatmentRooms).toHaveBeenCalled();
//        });

//    });

//    describe('clipboardData watch - >', function () {

//        beforeEach(function(){
//            scope.clipboardData = { Data:{ ProposedDuration:15, UserId:1, TreatmentRoomId:1}};
//        });
//        it('should set searchParams with changes from clipboard', function () {

//            scope.clipboardData.Data.TreatmentRoomId=2;
//            scope.$apply();
//            expect(scope.searchParams.roomId).toEqual(2);
//            expect(scope.searchParams.duration).toEqual(15);
//            expect(scope.searchParams.providerId).toEqual(1);
//        });

//        it('should call resetSearchParams if clipboardData is null', function () {
//            spyOn(ctrl, 'resetSearchParams');
//            scope.clipboardData=null;
//            scope.$apply();
//            expect(ctrl.resetSearchParams).toHaveBeenCalled();
//        });

//    });

//    describe('clearSlots watch - >', function () {

//        it('should call set scope.initDateSelector to true;', function () {
//            scope.initDateSelector=false;
//            scope.clearSlots = 0;
//            scope.$apply();
//            scope.clearSlots = 1;
//            scope.$apply();
//            expect(scope.initDateSelector).toBe(true);
//        });

//    });

//    describe('search function -> ', function () {
//        var slots = [];
//        beforeEach(function(){
//            spyOn(ctrl, 'setPreferredDaysParameter');
//            scope.searchParams ={preferredDays:null};
//            spyOn(scope, 'validSearchParameters').and.returnValue(true);
//            slots = [
//                {LocationStartTime:'2018-09-13 12:45:00.0000000',LocationEndTime:'2018-09-13 13:45:00.0000000'},
//                {LocationStartTime:'2018-09-12 12:45:00.0000000',LocationEndTime:'2018-09-12 13:45:00.0000000'},
//                {LocationStartTime:'2018-09-11 12:45:00.0000000',LocationEndTime:'2018-09-11 13:45:00.0000000'}];

//            appointmentsOpenTimeFactory.Slots = jasmine.createSpy().and.returnValue({
//                then: jasmine.createSpy().and.returnValue({res:{Value:slots}})
//            });

//        });

//        it('should call appointmentsOpenTimeFactory.Slots if validSearchParameters returns true', function () {
//            scope.search();
//            expect(appointmentsOpenTimeFactory.Slots).toHaveBeenCalledWith(scope.searchParams);
//        });

//    //    it('should sort slots with earliest to latest', function () {
//    //         scope.search();
//    //         expect(scope.openSlots[0].LocationStartTime).toEqual(slots[2].LocationStartTime);
//    //         expect(scope.openSlots[1].LocationStartTime).toEqual(slots[1].LocationStartTime);
//    //         expect(scope.openSlots[2].LocationStartTime).toEqual(slots[0].LocationStartTime);
//    //     });

//    });

//    /*
//    $scope.anyProvider = 1;
//        $scope.anyDentist = 2;
//        $scope.anyHygienist = 3;
//        $scope.singleProvider = 4;
//        $scope.anyRoom = 1;
//        $scope.singleRoom = 2;
//        $scope.viewByRoom = 2;
//        $scope.viewByProvider = 1;
//    */
//    describe('validSearchParameters function -> ', function () {
//        beforeEach(function(){
//            var startDate = new Date();
//            var endDate = moment().add(2, 'month').toDate();
//            scope.searchParams = { duration:15, providerOption:1, roomOption: 1, providerId:null, startDateTime:startDate, endDateTime:endDate    };
//        });
//        // providerOption can be 1 (anyProvider),2 (anyDentist),3 (anyHygienist) if providerId is null,
//        // providerOption can be 4 (singleProvider) if providerId is not null,
//        // any other combination should fail
//        it('should return false if scope.searchParams.providerOption is not a valid entry ', function () {
//            scope.searchParams.providerOption = 1;
//            scope.searchParams.providerId = null;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.providerOption = 2;
//            scope.searchParams.providerId = null;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.providerOption = 3;
//            scope.searchParams.providerId = null;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.providerOption = 4;
//            scope.searchParams.providerId = 1;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.providerOption = 4;
//            scope.searchParams.providerId = null;
//            expect(scope.validSearchParameters()).toEqual(false);
//        });

//        // roomOption can be 1 (anyRoom) if roomId is null
//        // roomOption can be 2 (singleRoom) if roomId is not null
//        // all other combinations should fail
//        it('should return false if scope.searchParams.roomOption is not a valid entry ', function () {
//            scope.searchParams.roomOption = 1;
//            scope.searchParams.roomId = null;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.roomOption = 2;
//            scope.searchParams.roomId = 1;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.roomOption = 2;
//            scope.searchParams.roomId = null;
//            expect(scope.validSearchParameters()).toEqual(false);
//        });
//    });

//    describe('scheduleAppointment function -> ', function () {
//        var slot;
//        beforeEach(function(){
//            slot = {};
//            spyOn( ctrl,'scheduleAppointmentFromSlot').and.callFake(function () {

//            });
//            spyOn( ctrl,'scheduleAppointmentFromClipboard').and.callFake(function () {

//            });

//        });
//        it('should call ctrl.scheduleAppointmentFromClipboard if fromClipboard is true', function () {
//            scope.fromClipboard = true;
//            scope.scheduleAppointment(slot);
//            expect(ctrl.scheduleAppointmentFromClipboard).toHaveBeenCalledWith(slot);
//            expect(scope.openSlots).toEqual([]);
//        });

//        it('should call ctrl.scheduleAppointmentFromSlot if fromClipboard is false', function () {
//            scope.fromClipboard = false;
//            scope.scheduleAppointment(slot);
//            expect(ctrl.scheduleAppointmentFromSlot).toHaveBeenCalledWith(slot);
//            expect(scope.openSlots).toEqual([]);
//        });
//    });

//    describe('scheduleAppointmentFromSlot function -> ', function () {
//        // TODO test this after making the function call an attribute of the directive
//    });

//    describe('scheduleAppointmentFromClipboard function -> ', function () {
//        var slot = {};

//        beforeEach(function(){
//            slot = {LocationStartTime:null};
//            scope.clipboardData={Data:{}};
//            spyOn(scope, 'onSchedule');
//        });
//        it('should load clipboardData from searchParams and slot', function () {
//            var newDate = new Date();
//            scope.clipboardData={Data:{StartTime:null}};
//            slot.LocationStartTime = newDate;

//            ctrl.scheduleAppointmentFromClipboard(slot);
//            expect(scope.clipboardData.Data.StartTime).toEqual(slot.LocationStartTime);
//        });
//        it('should call onSchedule', function () {
//            ctrl.scheduleAppointmentFromClipboard(slot);
//            expect(scope.onSchedule).toHaveBeenCalled();
//        });

//    });

//    /*
//    $scope.anyProvider = 1;
//        $scope.anyDentist = 2;
//        $scope.anyHygienist = 3;
//        $scope.singleProvider = 4;
//        $scope.anyRoom = 1;
//        $scope.singleRoom = 2;
//        $scope.viewByRoom = 2;
//        $scope.viewByProvider = 1;
//    */
//    describe('validSearchParameters function -> ', function () {
//        beforeEach(function(){
//            var startDate = new Date();
//            var endDate = moment().add(2, 'month').toDate();
//            scope.searchParams = { duration:15, providerOption:1, roomOption: 1, providerId:null, startDateTime:startDate, endDateTime:endDate    };
//        });
//        // providerOption can be 1 (anyProvider),2 (anyDentist),3 (anyHygienist) if providerId is null,
//        // providerOption can be 4 (singleProvider) if providerId is not null,
//        // any other combination should fail
//        it('should return false if scope.searchParams.providerOption is not a valid entry ', function () {
//            scope.searchParams.providerOption = 1;
//            scope.searchParams.providerId = null;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.providerOption = 2;
//            scope.searchParams.providerId = null;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.providerOption = 3;
//            scope.searchParams.providerId = null;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.providerOption = 4;
//            scope.searchParams.providerId = 1;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.providerOption = 4;
//            scope.searchParams.providerId = null;
//            expect(scope.validSearchParameters()).toEqual(false);
//        });

//        // roomOption can be 1 (anyRoom) if roomId is null
//        // roomOption can be 2 (singleRoom) if roomId is not null
//        // all other combinations should fail
//        it('should return false if scope.searchParams.roomOption is not a valid entry ', function () {
//            scope.searchParams.roomOption = 1;
//            scope.searchParams.roomId = null;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.roomOption = 2;
//            scope.searchParams.roomId = 1;
//            expect(scope.validSearchParameters()).toEqual(true);

//            scope.searchParams.roomOption = 2;
//            scope.searchParams.roomId = null;
//            expect(scope.validSearchParameters()).toEqual(false);
//        });
//    });

//    describe('previewAppointment function -> ', function () {
//        var selectedSlot={};
//        var index = 2;
//        beforeEach(function(){
//            selectedSlot = {LocationStartTime:new Date(), LocationEndTime:new Date()};
//            scope.previewParam = {
//                EndDateTime:null,
//                StartDateTime:null,
//                OpenSlots: null,
//                SelectedSlot: null,
//                SelectedSlotIndex: null,
//                Duration: null,
//                AppointmentTypeId: null,
//                ProviderId: null,
//                TreatmentRoomId: null,
//                ExaminingDentist: null,
//                Location: null,
//                SearchGroup: null,
//            };
//        });
//        it('should load scope.previewParam', function () {
//            scope.previewAppointment(selectedSlot, index);
//            expect(scope.previewParam.StartDateTime).toEqual(selectedSlot.LocationStartTime);
//            expect(scope.previewParam.EndDateTime).toEqual(selectedSlot.LocationEndTime);
//        });

//        it('should call onPreview', function () {
//            spyOn(scope, 'onPreview');
//            scope.previewAppointment(selectedSlot, index);
//            expect(scope.onPreview).toHaveBeenCalled();
//        });
//    });

//    describe('scope.hideFilters method - >', function () {
//        var angularElement;
//        beforeEach(function(){
//            spyOn(ctrl, 'resetSearchParams');
//            angularElement = { removeClass: jasmine.createSpy() };
//            spyOn(angular, 'element').and.returnValue(angularElement);
//        });

//        it('should call ctrl.resetSearchParams', function () {
//            scope.initDateSelector=false;
//            scope.hideFilters();
//            expect(ctrl.resetSearchParams).toHaveBeenCalled();
//        });

//        it('should set initDateSelector to false', function () {
//            scope.initDateSelector=true;
//            scope.hideFilters();
//            expect(scope.initDateSelector).toBe(false);
//        });

//        it('should set initDateSelector to false', function () {
//            scope.initDateSelector=true;
//            scope.hideFilters();
//            expect(angularElement.removeClass).toHaveBeenCalledWith('open');
//        });
//    });

//    describe('addSearchGroup method - >', function () {

//        var res = {};
//        var slots = [];
//        beforeEach(function(){
//            scope.searchGroup = 1;
//            slots = [
//                {LocationStartTime:'2018-09-13 12:45:00.0000000',LocationEndTime:'2018-09-13 13:45:00.0000000'},
//                {LocationStartTime:'2018-09-12 12:45:00.0000000',LocationEndTime:'2018-09-12 13:45:00.0000000'},
//                {LocationStartTime:'2018-09-11 12:45:00.0000000',LocationEndTime:'2018-09-11 13:45:00.0000000'}];
//            res={Value:slots};
//        });

//        it('should add searchGroup to record', function () {

//            ctrl.addSearchGroup(res.Value);
//            expect(res.Value[0].$$searchGroup).toEqual(scope.searchGroup);
//            expect(res.Value[1].$$searchGroup).toEqual(scope.searchGroup);
//            expect(res.Value[2].$$searchGroup).toEqual(scope.searchGroup);
//        });
//    });

//});
