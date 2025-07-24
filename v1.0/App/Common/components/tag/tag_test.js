describe('tag directive ->', function () {
  var compile, rootScope, scope;

  beforeEach(module('common.directives'));
  beforeEach(module('soar.templates'));

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    rootScope = $rootScope;
    scope = rootScope.$new();
  }));

  it('should add the base-id attr to the label and link ids', function () {
    var id = 55;
    var element = compile('<tag base-id="' + id + '" title="tag title"></tag>')(
      scope
    );
    rootScope.$digest();
    expect(element.find('#lbl' + id).length).toBe(1);
    expect(element.find('#btn' + id + 'Remove').length).toBe(1);
  });

  it('should render title attr in the label element', function () {
    var element = compile('<tag title="tag title"></tag>')(scope);
    rootScope.$digest();
    expect(element.find('#lbl').html()).toBe('tag title');
  });
});
