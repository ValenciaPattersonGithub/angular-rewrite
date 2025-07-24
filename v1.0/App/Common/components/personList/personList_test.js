describe('personList directive ->', function () {
  var compile, rootScope, scope;

  beforeEach(module('common.directives'));
  beforeEach(module('common.filters'));
  beforeEach(module('Soar.Common'));
  beforeEach(module('soar.templates'));

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    rootScope = $rootScope;
    scope = rootScope.$new();
  }));

  it('should append the base-id attr value to the id attr on the ul', function () {
    var html =
      '<person-list base-id="AccountMember" current-person-id="7234627" list="[]"></person-list>';
    var element = compile(html)(scope);
    rootScope.$digest();
    expect(element.find('#lstAccountMember').length).toBe(1);
  });

  it('should create a row for each person in the list attr', function () {
    var html =
      '<person-list base-id="AccountMember" current-person-id="7234627" list="[' +
      '{PatientId: 7234627, FirstName: Bill, LastName: Murray, DateOfBirth: 10/06/1956, ResponsibleParty: true},' +
      '{PatientId: 6187781, FirstName: Benjamin, LastName: Franklin, DateOfBirth: 02/13/1712, ResponsibleParty: false}' +
      ']"></person-list>';
    var element = compile(html)(scope);
    rootScope.$digest();
    expect(element.find('.row').length).toBe(2);
  });

  it('should not create any rows if zero persons were passed', function () {
    var html =
      '<person-list base-id="AccountMember" current-person-id="7234627" list="[]"></person-list>';
    var element = compile(html)(scope);
    rootScope.$digest();
    expect(element.find('.row').length).toBe(0);
  });

  it('should italicize the first and last name if the current person matches one in the person list', function () {
    var html =
      '<person-list base-id="AccountMember" current-person-id="6187781" list="[' +
      '{PatientId: 7234627, FirstName: Bill, LastName: Murray, DateOfBirth: 10/06/1956, ResponsibleParty: true},' +
      '{PatientId: 6187781, FirstName: Benjamin, LastName: Franklin, DateOfBirth: 02/13/1712, ResponsibleParty: false}' +
      ']"></person-list>';
    var element = compile(html)(scope);
    rootScope.$digest();
    expect(element.find('#lblAccountMember1').attr('class')).toContain(
      'italic'
    );
  });

  it('should create a link around the first and last name if the current person does not match the person in the list', function () {
    var html =
      '<person-list base-id="AccountMember" current-person-id="6187781" list="[' +
      '{PatientId: 7234627, FirstName: Bill, LastName: Murray, DateOfBirth: 10/06/1956, ResponsibleParty: true},' +
      '{PatientId: 6187781, FirstName: Benjamin, LastName: Franklin, DateOfBirth: 02/13/1712, ResponsibleParty: false}' +
      ']"></person-list>';
    var element = compile(html)(scope);
    rootScope.$digest();
    expect(element.find('#btnAccountMember0').length).toBe(1);
  });

  it('should show RP if the responsible party is true on a given person', function () {
    var html =
      '<person-list base-id="AccountMember" current-person-id="6187781" list="[' +
      '{PatientId: 7234627, FirstName: Bill, LastName: Murray, DateOfBirth: 10/06/1956, ResponsibleParty: true}' +
      ']"></person-list>';
    var element = compile(html)(scope);
    rootScope.$digest();
    expect(element.find('.row b').html()).toContain('(');
  });
});
