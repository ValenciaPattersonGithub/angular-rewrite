// ***************************************
// This file is obsolete, has been migrated to Angular and is only here for reference
// Please see src\@shared\components\elapsed-time\elapsed-time.component.spec.ts for the new version
// ***************************************

// describe('elapsedTime ->', function () {
//     var scope, ctrl, $interval, localize;

//     beforeEach(module("common.controllers"));

//     beforeEach(inject(function ($rootScope, $interval, $controller) {

//         scope = $rootScope.$new();

//         //mock for localize
//         localize = {
//             getLocalizedString: jasmine.createSpy()
//         };

//         ctrl = $controller('ElapsedTimeController', {
//             $scope: scope,
//             localize: localize

//         });
//     }));

//     //controller
//     it('elapsedTime : should check if controller exists', function () {
//         expect(ctrl).not.toBeNull();
//         expect(ctrl).not.toBeUndefined();
//     });

//     it('should set stop to undefined', function () {
//         scope.endTime = new Date()
//         expect(scope.stop).toBeUndefined();
//     });

//     describe('setElapsedTime function -> ', function () {

//         it('setElapsedTime : should set value to scope.elapsedTimeString', function () {
//             scope.startTime = new Date();
//             scope.endTime = 'undefined';
//             scope.startTime.lastIndexOf = jasmine.createSpy('scope.startTime.lastIndexOf').and.returnValue(1);
//             ctrl.setElapsedTime();
//             expect(scope.elapsedTimeString).not.toBeNull();
//             expect(scope.elapsedTimeString).not.toBeUndefined();
//         });

//         it('setElapsedTime : should not set value to scope.elapsedTimeString', function () {
//             scope.startTime = null;
//             ctrl.setElapsedTime();
//             expect(scope.elapsedTimeString).not.toBeNull();
//             expect(scope.elapsedTimeString).not.toBeUndefined();
//         });

//         it('should set value 1 Minute Elapsed', function () {

//             var dateNow = new Date();
//             var subtractMinutes = dateNow.getMinutes() - 1;
//             dateNow.setMinutes(dateNow.getTimezoneOffset())
//             dateNow.setMinutes(subtractMinutes);
//             scope.startTime = dateNow;

//             scope.startTime.lastIndexOf = jasmine.createSpy('scope.startTime.lastIndexOf').and.returnValue(1);
//             localize.getLocalizedString = jasmine.createSpy().and.returnValue('Minute Elapsed');
//             ctrl.setElapsedTime();
//             expect(scope.elapsedTimeString).toBe('(1 Minute Elapsed)');
//         });

//         it('should set value to 20 Minutes Elapsed', function () {
//             var dateNow = new Date();
//             var subtractMinutes = dateNow.getMinutes() - 20;
//             dateNow.setMinutes(dateNow.getTimezoneOffset())
//             dateNow.setMinutes(subtractMinutes);
//             scope.startTime = dateNow;
//             scope.startTime.lastIndexOf = jasmine.createSpy('scope.startTime.lastIndexOf').and.returnValue(-1);
//             localize.getLocalizedString = jasmine.createSpy().and.returnValue('Minutes Elapsed');
//             ctrl.setElapsedTime();
//             expect(scope.elapsedTimeString).toBe('(20 Minutes Elapsed)');
//         });

//         it('should add Z to end of startTime if not there', function () {
//             var startTime = '2017-08-07T19:19:29.6579187';
//             scope.startTime = startTime;
//             scope.endTime = null;
//             scope.startTime.lastIndexOf = jasmine.createSpy('scope.startTime.lastIndexOf').and.returnValue(-1);
//             localize.getLocalizedString = jasmine.createSpy().and.returnValue('Minutes Elapsed');
//             ctrl.setElapsedTime();
//             expect(scope.startTime).toBe(startTime + 'Z');

//         });

//         it('should not add Z to end of startTime if there', function () {
//             var startTime = '2017-08-07T19:19:29.6579187Z';
//             scope.startTime = startTime;
//             scope.endTime = null;
//             scope.startTime.lastIndexOf = jasmine.createSpy('scope.startTime.lastIndexOf').and.returnValue(1);
//             localize.getLocalizedString = jasmine.createSpy().and.returnValue('Minutes Elapsed');
//             ctrl.setElapsedTime();
//             expect(scope.startTime).toBe(startTime);

//         });

//     });

// });
