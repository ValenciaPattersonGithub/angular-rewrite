describe('appointment-slideout-directive ->', function () {
  var compile;
  var scope;

  beforeEach(
    module('Soar.Patient', function ($controllerProvider) {
      $controllerProvider.register(
        'AppointmentSlideoutController',
        function () {}
      );
    })
  );

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    compile = $compile;
    scope = $rootScope.$new();
    scope.data = 'Data';
    scope.location = 'Location';
    $templateCache.put(
      'App/Patient/patient-landing/patient-landing-appointment/appointment-slideout.html',
      '<div>Unit Test: {{gridData}} {{selectedLocation}}</div>'
    );
  }));

  it('creates a slideout filter', function () {
    var element = compile(
      '<appointment-slideout grid-data="data" selected-location="location"></appointment-slideout>'
    )(scope);
    scope.$digest();

    expect(element.html()).toContain(
      '<div class="ng-binding">Unit Test: Data Location</div>'
    );
  });
});
