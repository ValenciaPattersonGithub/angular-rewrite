describe('localize-filter tests ->', function () {
  var filter;

  // access module where filter is located
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));

  describe('i18n ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('i18n');
    }));

    it('should exist', function () {
      expect(filter).not.toBeNull();
    });

    it('should call localize.getLocalizedString passing along input and params', function () {
      filter('input', 'params');
      expect(_localize_.getLocalizedString).toHaveBeenCalledWith(
        'input',
        'params'
      );
    });
  });
});
