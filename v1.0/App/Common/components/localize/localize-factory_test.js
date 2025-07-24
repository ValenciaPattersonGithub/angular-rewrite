// top level test suite
describe('localize factory tests ->', function () {
  // before each set up any definitions to be createed before the specs are run...
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.services'));

  // provide the stateListService and have it return the stateList when called
  var localize;
  var $httpBackend;

  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend');
    localize = _localizeFactory_.$get();
    localize.initLocalizedResources = jasmine.createSpy();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(localize).not.toBeNull();
  });

  it('should have a getLocalizedString function', function () {
    expect(angular.isFunction(localize.getLocalizedString)).toBe(true);
  });

  it('should have a setLanguage function', function () {
    expect(angular.isFunction(localize.setLanguage)).toBe(true);
  });

  it('should have a setUrl function', function () {
    expect(angular.isFunction(localize.setUrl)).toBe(true);
  });

  it('should have a buildUrl function', function () {
    expect(angular.isFunction(localize.buildUrl)).toBe(true);
  });

  it('should have a setUrl initLocalizedResources', function () {
    expect(angular.isFunction(localize.initLocalizedResources)).toBe(true);
  });

  it('should set initial language to empty', function () {
    expect(localize.language).toBe('');
  });

  it('buildUrl should build Url based on spanish if language is spanish', function () {
    localize.language = 'es_mx';
    var url = localize.buildUrl();
    expect(url).toBe('i18n/resources-locale_es_mx.js');
  });

  it('buildUrl should build Url based on french if language is french', function () {
    localize.language = 'fr_ca';
    var url = localize.buildUrl();
    expect(url).toBe('i18n/resources-locale_fr_ca.js');
  });

  it('buildUrl should build Url based on english if language is english', function () {
    localize.language = 'en_us';
    var url = localize.buildUrl();
    expect(url).toBe('i18n/resources-locale_en_us.js');
  });

  it('should set spanish as language when language set to spanish', function () {
    localize.setLanguage('es_mx');
    expect(localize.language).toBe('es_mx');
    expect(localize.initLocalizedResources).toHaveBeenCalled();
  });

  it('should set french as language when language set to french', function () {
    localize.setLanguage('fr_ca');
    expect(localize.language).toBe('fr_ca');
    expect(localize.initLocalizedResources).toHaveBeenCalled();
  });

  it('should set english as language when language set to english', function () {
    localize.setLanguage('en_us');
    expect(localize.language).toBe('en_us');
    expect(localize.initLocalizedResources).toHaveBeenCalled();
  });
});
