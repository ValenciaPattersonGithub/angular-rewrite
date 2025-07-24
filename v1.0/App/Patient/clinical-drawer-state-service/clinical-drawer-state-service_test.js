//describe('clinical-drawer-state-service -> ', function () {
//    var service, drawerNotificationService;

//    beforeEach(module('Soar.Patient'), function ($provide) {
//        drawerNotificationService = {

//        };
//        $provide.value('DrawerNotificationService', drawerNotificationService);
//    });
//    beforeEach(inject(function ($injector) {

//        service = $injector.get('ClinicalDrawerStateService', {
//            DrawerNotificationService: drawerNotificationService
//        });
//    }));

//    describe('changeDrawerState -> ', function () {

//        it('should set drawerState true', function () {
//            service.changeDrawerState(true);
//            var result = service.getDrawerState();
//            expect(result).toBe(true);
//        });

//        it('should set drawerState false', function () {
//            service.changeDrawerState(false);
//            var result = service.getDrawerState();
//            expect(result).toBe(false);
//        });

//    });

//    describe('registerObserver -> ', function () {

//        it('should not add observer if null or undefined is passed in.', function () {
//            service.registerObserver(null);
//            service.registerObserver(undefined);
//            let result = service.getObserversForTesting();
//            expect(result.length).toBe(0);
//        });

//        it('should add observer if not null or undefined.', function () {
//            service.registerObserver(function () { });
//            let result = service.getObserversForTesting();
//            expect(result.length).toBe(1);
//        });
//    });

//    describe('clearObserver -> ', function () {

//        it('should not clear out a value in the list if it is not present already', function () {
//            const func = function () { };
//            service.registerObserver(func);
//            let result = service.getObserversForTesting();
//            expect(result.length).toBe(1);
//            service.clearObserver(function () { return true; });
//            result = service.getObserversForTesting();
//            expect(result.length).toBe(1);
//        });

//        it('should clear out a value in the list if it is present', function () {
//            const func = function () { };
//            service.registerObserver(func);
//            let result = service.getObserversForTesting();
//            expect(result.length).toBe(1);
//            service.clearObserver(func);
//            result = service.getObserversForTesting();
//            expect(result.length).toBe(0);
//        });
//    });

//});
