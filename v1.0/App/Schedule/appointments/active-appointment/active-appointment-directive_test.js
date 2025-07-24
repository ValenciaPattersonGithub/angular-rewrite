//describe('activeAppointment directive ->', function () {
//    var compile, scope, exceptionHandler, compileProvider;

//    var element;

//    beforeEach(module("Soar.Common"));
//    beforeEach(module("common.factories"));
//    beforeEach(module("Soar.Schedule"));

//    beforeEach(module(function ($compileProvider) {
//        compileProvider = $compileProvider;
//    }));

//    beforeEach(inject(function ($compile, $rootScope, $exceptionHandler) {
//        compile = $compile;
//        exceptionHandler = $exceptionHandler;
//        scope = $rootScope.$new();
//    }));

//    beforeEach(function () {
//        element = angular.element('<active-appointment></active-appointment>');
//        compile(element)(scope);
//    });

//    it("should scope to be defined", function () {
//        expect(scope).toBeDefined();
//    });
//});
