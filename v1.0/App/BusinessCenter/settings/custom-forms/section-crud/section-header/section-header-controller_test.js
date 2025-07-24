describe('Controller: SectionHeaderController', function () {
  var ctrl, scope, toastrFactory, localize, timeout, element;
  var customFormsFactory;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    customFormsFactory = {
      ValidateFormSectionItem: jasmine.createSpy().and.returnValue(true),
    };

    ctrl = $controller('SectionHeaderController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      CustomFormsFactory: customFormsFactory,
    });
    localize = $injector.get('localize');
    timeout = $injector.get('$timeout');

    element = {
      focus: jasmine.createSpy(),
    };
    spyOn(angular, 'element').and.returnValue(element);
  }));

  //controller
  it('should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  //toastrFactory
  it('should check that toastrFactory is not null', function () {
    expect(toastrFactory).not.toBe(null);
  });

  it('should check that toastrFactory is not undefined', function () {
    expect(toastrFactory).not.toBeUndefined();
  });

  //initializeSectionItem
  it('initializeSectionItem should return a form section item which is not null/ is not undefined/ and with default values', function () {
    var sectionIndex = 5;
    var value = 10;

    var result = scope.initializeSectionItem(sectionIndex, value);

    expect(result).not.toBe(null);
    expect(result).not.toBeUndefined();

    //FormSectionId
    expect(result.FormSectionId).not.toBe(null);
    expect(result.FormSectionId).not.toBeUndefined();
    expect(result.FormSectionId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );

    //SectionItemId
    expect(result.SectionItemId).not.toBe(null);
    expect(result.SectionItemId).not.toBeUndefined();
    expect(result.SectionItemId).toEqual(value);

    //FormBankItem
    expect(result.FormBankItem).not.toBe(null);
    expect(result.FormBankItem).not.toBeUndefined();

    expect(result.FormBankItem.ItemText).toEqual('');
    expect(result.FormBankItem.FormItemTypeName).toEqual('');
    expect(result.FormBankItem.Description).toEqual('');
    expect(result.FormBankItem.CommonlyUsed).toEqual('');
    expect(result.FormBankItem.DefaultValue).toEqual('');
    expect(result.FormBankItem.IsVisible).toBe(true);
    expect(result.FormBankItem.UseDefaultValue).toBe(false);

    //IsRequired
    expect(result.IsRequired).toBe(false);

    //MultiSelectAllow
    expect(result.MultiSelectAllow).toBe(false);

    //IsVisible
    expect(result.IsVisible).toBe(true);

    //SequenceNumber
    expect(result.SequenceNumber).toEqual(sectionIndex);

    //BankItemDemographicId
    expect(result.BankItemDemographicId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );

    //FormBankItemDemographic
    expect(result.FormBankItemDemographic).not.toBe(null);
    expect(result.FormBankItemDemographic).not.toBeUndefined();

    //BankItemEmergencyContactId
    expect(result.BankItemEmergencyContactId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );

    //FormBankItemEmergencyContact
    expect(result.FormBankItemEmergencyContact).not.toBe(null);
    expect(result.FormBankItemEmergencyContact).not.toBeUndefined();

    //ItemOptions
    expect(result.ItemOptions).not.toBe(null);
    expect(result.ItemOptions).not.toBeUndefined();
    expect(result.ItemOptions.length).toEqual(0);
  });

  //initializeSectionItemOption
  it('initializeSectionItemOption should return a form section item option which is not null/ is not undefined/ and with default values', function () {
    var result = scope.initializeSectionItemOption(5);

    expect(result).not.toBe(null);
    expect(result).not.toBeUndefined();

    //SectionItemId
    expect(result.SectionItemId).not.toBe(null);
    expect(result.SectionItemId).not.toBeUndefined();
    expect(result.SectionItemId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );

    //SectionItemOptionId
    expect(result.SectionItemOptionId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );

    //BankItemId
    expect(result.BankItemId).toEqual('00000000-0000-0000-0000-000000000000');

    //BankItemOptionId
    expect(result.BankItemOptionId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );

    //BankItemOption
    expect(result.BankItemOption).not.toBe(null);
    expect(result.BankItemOption).not.toBeUndefined();

    expect(result.BankItemOption.BankItemOptionId).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );
    expect(result.BankItemOption.OptionIndex).toEqual(1);
    expect(result.BankItemOption.OptionText).toEqual('');
    expect(result.BankItemOption.OptionValue).toEqual('');
    expect(result.BankItemOption.IsSelected).toEqual('');
    expect(result.BankItemOption.IsVisible).toEqual('');
    expect(result.BankItemOption.SequenceNumber).toEqual(5);

    //IsSelected
    expect(result.IsSelected).toBe(true);

    //IsVisible
    expect(result.IsVisible).toBe(true);

    //SequenceNumber
    expect(result.SequenceNumber).toEqual(5);
  });

  //addSectionItem
  it('addSectionItem should add a section item of type Demographic question to the given section of the customForm', function () {
    scope.section = { FormSectionItems: [] };
    var newSectionItem = {
      FormSectionId: '00000000-0000-0000-0000-000000000000',
      SectionItemId: -1,
      BankItemId: '00000000-0000-0000-0000-000000000000',
      FormBankItem: {
        ItemText: '',
        FormItemTypeId: '00000000-0000-0000-0000-000000000000',
        FormItemTypeName: '',
        Description: '',
        CommonlyUsed: '',
        IsVisible: true,
        UseDefaultValue: false,
        DefaultValue: '',
      },
      IsRequired: false,
      MultiSelectAllow: false,
      IsVisible: true,
      SequenceNumber: 1,
      BankItemDemographicId: '00000000-0000-0000-0000-000000000000',
      FormBankItemDemographic: {},
      BankItemEmergencyContactId: '00000000-0000-0000-0000-000000000000',
      FormBankItemEmergencyContact: {},
      ItemOptions: [],

      FormItemTypeName: '',
      FormItemTypeId: '',
    };
    scope.customForm = {
      SectionValidationFlag: true,
      SectionCopyValidationFlag: 0,
    };
    spyOn(scope, 'initializeSectionItem').and.returnValue(newSectionItem);
    var sectionItemTypeValue = 1;
    var sectionIndex = 1;
    var result = scope.addSectionItem(sectionIndex, sectionItemTypeValue);
    expect(result).toBe(true);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(-1);
    expect(scope.initializeSectionItem).toHaveBeenCalled();
    expect(scope.section.FormSectionItems.length).toBe(1);
    //
    expect(scope.section.FormSectionItems[0].FormItemTypeName).toEqual(
      'Demographic Question'
    );
    expect(scope.section.FormSectionItems[0].FormItemType).toEqual(1);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
    ).not.toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .BankItemDemographicId
    ).toEqual('00000000-0000-0000-0000-000000000001');
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .FirstNameFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .IsRequiredFirstName
    ).toEqual(true);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .LastNameFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .IsRequiredLastName
    ).toEqual(true);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .PreferredNameFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .IsRequiredPreferredName
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .AddressLine1FormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .IsRequiredAddressLine1
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .AddressLine2FormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .IsRequiredAddressLine2
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .CityFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredCity
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .StateFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredState
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .ZipFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic.IsRequiredZip
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .EmailAddressFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .IsRequiredEmailAddress
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .PrimaryNumberFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .IsRequiredPrimaryNumber
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .SecondaryNumberFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
        .IsRequiredSecondaryNumber
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].BankItemEmergencyContactId
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
    ).toBeNull();
    expect(scope.section.FormSectionItems[0].BankItemId).toBeNull();
    expect(scope.section.FormSectionItems[0].FormBankItem).toBeNull();
    //
    expect(
      angular.element(
        '#questionDemographicPreferredNameCKB' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element(
        '#questionDemographicPreferredNameCKB' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).toHaveBeenCalled();
  });

  it('addSectionItem should add a section item of type Emergency question to the given section of the customForm', function () {
    scope.section = { FormSectionItems: [] };
    var newSectionItem = {
      FormSectionId: '00000000-0000-0000-0000-000000000000',
      SectionItemId: -1,
      BankItemId: '00000000-0000-0000-0000-000000000000',
      FormBankItem: {
        ItemText: '',
        FormItemTypeId: '00000000-0000-0000-0000-000000000000',
        FormItemTypeName: '',
        Description: '',
        CommonlyUsed: '',
        IsVisible: true,
        UseDefaultValue: false,
        DefaultValue: '',
      },
      IsRequired: false,
      MultiSelectAllow: false,
      IsVisible: true,
      SequenceNumber: 1,
      BankItemDemographicId: '00000000-0000-0000-0000-000000000000',
      FormBankItemDemographic: {},
      BankItemEmergencyContactId: '00000000-0000-0000-0000-000000000000',
      FormBankItemEmergencyContact: {},
      ItemOptions: [],

      FormItemTypeName: '',
      FormItemTypeId: '',
    };
    scope.customForm = {
      SectionValidationFlag: true,
      SectionCopyValidationFlag: 0,
    };
    spyOn(scope, 'initializeSectionItem').and.returnValue(newSectionItem);
    var sectionItemTypeValue = 6;
    var sectionIndex = 1;

    var result = scope.addSectionItem(sectionIndex, sectionItemTypeValue);
    expect(result).toBe(true);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(-1);
    expect(scope.initializeSectionItem).toHaveBeenCalled();
    expect(scope.section.FormSectionItems.length).toBe(1);
    //
    expect(scope.section.FormSectionItems[0].FormItemTypeName).toEqual(
      'Emergency Contact'
    );
    expect(scope.section.FormSectionItems[0].FormItemType).toEqual(6);
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
    ).not.toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
        .ContactFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
        .IsRequiredContact
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
        .PhoneFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
        .IsRequiredPhone
    ).toEqual(false);
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
        .ContactRelationshipFormItemTypeId
    ).toEqual(0);
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
        .IsRequiredContactRelationship
    ).toEqual(false);
    expect(scope.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
    ).toBeNull();
    expect(scope.section.FormSectionItems[0].BankItemId).toBeNull();
    expect(scope.section.FormSectionItems[0].FormBankItem).toBeNull();
    //
    expect(
      angular.element(
        '#questionEmergencyContactNameCKB' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element(
        '#questionEmergencyContactNameCKB' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).toHaveBeenCalled();
  });

  it('addSectionItem should add a section item of type Yes/No or True/False question to the given section of the customForm', function () {
    scope.section = { FormSectionItems: [] };
    var newSectionItem = {
      FormSectionId: '00000000-0000-0000-0000-000000000000',
      SectionItemId: -1,
      BankItemId: '00000000-0000-0000-0000-000000000000',
      FormBankItem: {
        ItemText: '',
        FormItemTypeId: '00000000-0000-0000-0000-000000000000',
        FormItemTypeName: '',
        Description: '',
        CommonlyUsed: '',
        IsVisible: true,
        UseDefaultValue: false,
        DefaultValue: '',
      },
      IsRequired: false,
      MultiSelectAllow: false,
      IsVisible: true,
      SequenceNumber: 1,
      BankItemDemographicId: '00000000-0000-0000-0000-000000000000',
      FormBankItemDemographic: {},
      BankItemEmergencyContactId: '00000000-0000-0000-0000-000000000000',
      FormBankItemEmergencyContact: {},
      ItemOptions: [],

      FormItemTypeName: '',
      FormItemTypeId: '',
    };
    scope.customForm = {
      SectionValidationFlag: true,
      SectionCopyValidationFlag: 0,
    };
    spyOn(scope, 'initializeSectionItem').and.returnValue(newSectionItem);
    var sectionItemTypeValue = 2;
    var sectionIndex = 1;
    var result = scope.addSectionItem(sectionIndex, sectionItemTypeValue);
    expect(result).toBe(true);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(-1);
    expect(scope.initializeSectionItem).toHaveBeenCalled();
    expect(scope.section.FormSectionItems.length).toBe(1);
    //
    expect(scope.section.FormSectionItems[0].FormItemTypeName).toEqual(
      'Yes/No or True/False'
    );
    expect(scope.section.FormSectionItems[0].FormItemType).toEqual(2);
    expect(scope.section.FormSectionItems[0].FormBankItem).not.toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItem.FormItemTypeName
    ).toEqual('Yes/No or True/False');
    expect(scope.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].BankItemEmergencyContactId
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
    ).toBeNull();
    //

    expect(
      angular.element(
        '#questionYesNoTrueFalseText' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element(
        '#questionYesNoTrueFalseText' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).toHaveBeenCalled();
  });

  it('addSectionItem should add a section item of type Multiple Choice question to the given section of the customForm', function () {
    scope.section = { FormSectionItems: [] };
    var newSectionItem = {
      FormSectionId: '00000000-0000-0000-0000-000000000000',
      SectionItemId: -1,
      BankItemId: '00000000-0000-0000-0000-000000000000',
      FormBankItem: {
        ItemText: '',
        FormItemTypeId: '00000000-0000-0000-0000-000000000000',
        FormItemTypeName: '',
        Description: '',
        CommonlyUsed: '',
        IsVisible: true,
        UseDefaultValue: false,
        DefaultValue: '',
      },
      IsRequired: false,
      MultiSelectAllow: false,
      IsVisible: true,
      SequenceNumber: 1,
      BankItemDemographicId: '00000000-0000-0000-0000-000000000000',
      FormBankItemDemographic: {},
      BankItemEmergencyContactId: '00000000-0000-0000-0000-000000000000',
      FormBankItemEmergencyContact: {},
      ItemOptions: [],

      FormItemTypeName: '',
      FormItemTypeId: '',
    };
    scope.customForm = {
      SectionValidationFlag: true,
      SectionCopyValidationFlag: 0,
    };
    spyOn(scope, 'initializeSectionItem').and.returnValue(newSectionItem);
    var sectionItemTypeValue = 3;
    var sectionIndex = 1;
    var result = scope.addSectionItem(sectionIndex, sectionItemTypeValue);
    expect(result).toBe(true);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(-1);
    expect(scope.initializeSectionItem).toHaveBeenCalled();
    expect(scope.section.FormSectionItems.length).toBe(1);
    //
    expect(scope.section.FormSectionItems[0].FormItemTypeName).toEqual(
      'Multiple Choice'
    );
    expect(scope.section.FormSectionItems[0].FormItemType).toEqual(3);
    expect(scope.section.FormSectionItems[0].FormBankItem).not.toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItem.FormItemTypeName
    ).toEqual('Multiple Choice');
    expect(scope.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].BankItemEmergencyContactId
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
    ).toBeNull();
    //
    expect(
      angular.element(
        '#questionMultipleChoiceText' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element(
        '#questionMultipleChoiceText' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).toHaveBeenCalled();
  });

  it('addSectionItem should add a section item of type Signature Box question to the given section of the customForm', function () {
    scope.section = { FormSectionItems: [] };
    var newSectionItem = {
      FormSectionId: '00000000-0000-0000-0000-000000000000',
      SectionItemId: -1,
      BankItemId: '00000000-0000-0000-0000-000000000000',
      FormBankItem: {
        ItemText: '',
        FormItemTypeId: '00000000-0000-0000-0000-000000000000',
        FormItemTypeName: '',
        Description: '',
        CommonlyUsed: '',
        IsVisible: true,
        UseDefaultValue: false,
        DefaultValue: '',
      },
      IsRequired: false,
      MultiSelectAllow: false,
      IsVisible: true,
      SequenceNumber: 1,
      BankItemDemographicId: '00000000-0000-0000-0000-000000000000',
      FormBankItemDemographic: {},
      BankItemEmergencyContactId: '00000000-0000-0000-0000-000000000000',
      FormBankItemEmergencyContact: {},
      ItemOptions: [],

      FormItemTypeName: '',
      FormItemTypeId: '',
    };
    scope.customForm = {
      SectionValidationFlag: true,
      SectionCopyValidationFlag: 0,
    };
    spyOn(scope, 'initializeSectionItem').and.returnValue(newSectionItem);
    var sectionItemTypeValue = 4;
    var sectionIndex = 1;

    var result = scope.addSectionItem(sectionIndex, sectionItemTypeValue);
    expect(result).toBe(true);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(-1);
    expect(scope.initializeSectionItem).toHaveBeenCalled();
    expect(scope.section.FormSectionItems.length).toBe(1);
    //
    expect(scope.section.FormSectionItems[0].FormItemTypeName).toEqual(
      'Signature Box'
    );
    expect(scope.section.FormSectionItems[0].FormItemType).toEqual(4);
    expect(scope.section.FormSectionItems[0].FormBankItem).not.toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItem.FormItemTypeName
    ).toEqual('Signature Box');
    expect(scope.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].BankItemEmergencyContactId
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
    ).toBeNull();
    //
    expect(
      angular.element(
        '#questionSignatureBoxCKB' + (scope.section.FormSectionItems.length - 1)
      ).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element(
        '#questionSignatureBoxCKB' + (scope.section.FormSectionItems.length - 1)
      ).focus
    ).toHaveBeenCalled();
  });

  it('addSectionItem should add a section item of type Date of Completion question to the given section of the customForm', function () {
    scope.section = { FormSectionItems: [] };
    var newSectionItem = {
      FormSectionId: '00000000-0000-0000-0000-000000000000',
      SectionItemId: -1,
      BankItemId: '00000000-0000-0000-0000-000000000000',
      FormBankItem: {
        ItemText: '',
        FormItemTypeId: '00000000-0000-0000-0000-000000000000',
        FormItemTypeName: '',
        Description: '',
        CommonlyUsed: '',
        IsVisible: true,
        UseDefaultValue: false,
        DefaultValue: '',
      },
      IsRequired: false,
      MultiSelectAllow: false,
      IsVisible: true,
      SequenceNumber: 1,
      BankItemDemographicId: '00000000-0000-0000-0000-000000000000',
      FormBankItemDemographic: {},
      BankItemEmergencyContactId: '00000000-0000-0000-0000-000000000000',
      FormBankItemEmergencyContact: {},
      ItemOptions: [],

      FormItemTypeName: '',
      FormItemTypeId: '',
    };
    scope.customForm = {
      SectionValidationFlag: true,
      SectionCopyValidationFlag: 0,
    };
    spyOn(scope, 'initializeSectionItem').and.returnValue(newSectionItem);
    var sectionItemTypeValue = 5;
    var sectionIndex = 1;
    var result = scope.addSectionItem(sectionIndex, sectionItemTypeValue);
    expect(result).toBe(true);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(-1);
    expect(scope.initializeSectionItem).toHaveBeenCalled();
    expect(scope.section.FormSectionItems.length).toBe(1);
    //
    expect(scope.section.FormSectionItems[0].FormItemTypeName).toEqual(
      'Date of Completion'
    );
    expect(scope.section.FormSectionItems[0].FormItemType).toEqual(5);
    expect(scope.section.FormSectionItems[0].FormBankItem).not.toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItem.FormItemTypeName
    ).toEqual('Date of Completion');
    expect(scope.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].BankItemEmergencyContactId
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
    ).toBeNull();
    //
    expect(
      angular.element(
        '#lblDateOfCompletion' + (scope.section.FormSectionItems.length - 1)
      ).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element(
        '#lblDateOfCompletion' + (scope.section.FormSectionItems.length - 1)
      ).focus
    ).toHaveBeenCalled();
  });

  it('addSectionItem should add a section item of type Comment/Essay question to the given section of the customForm', function () {
    scope.section = { FormSectionItems: [] };
    var newSectionItem = {
      FormSectionId: '00000000-0000-0000-0000-000000000000',
      SectionItemId: -1,
      BankItemId: '00000000-0000-0000-0000-000000000000',
      FormBankItem: {
        ItemText: '',
        FormItemTypeId: '00000000-0000-0000-0000-000000000000',
        FormItemTypeName: '',
        Description: '',
        CommonlyUsed: '',
        IsVisible: true,
        UseDefaultValue: false,
        DefaultValue: '',
      },
      IsRequired: false,
      MultiSelectAllow: false,
      IsVisible: true,
      SequenceNumber: 1,
      BankItemDemographicId: '00000000-0000-0000-0000-000000000000',
      FormBankItemDemographic: {},
      BankItemEmergencyContactId: '00000000-0000-0000-0000-000000000000',
      FormBankItemEmergencyContact: {},
      ItemOptions: [],

      FormItemTypeName: '',
      FormItemTypeId: '',
    };
    scope.customForm = {
      SectionValidationFlag: true,
      SectionCopyValidationFlag: 0,
    };
    spyOn(scope, 'initializeSectionItem').and.returnValue(newSectionItem);
    var sectionItemTypeValue = 7;
    var sectionIndex = 1;
    var result = scope.addSectionItem(sectionIndex, sectionItemTypeValue);
    expect(result).toBe(true);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.SectionCopyValidationFlag).toBe(-1);
    expect(scope.initializeSectionItem).toHaveBeenCalled();
    expect(scope.section.FormSectionItems.length).toBe(1);
    //
    expect(scope.section.FormSectionItems[0].FormItemTypeName).toEqual(
      'Comment/Essay'
    );
    expect(scope.section.FormSectionItems[0].FormItemType).toEqual(7);
    expect(scope.section.FormSectionItems[0].FormBankItem).not.toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItem.FormItemTypeName
    ).toEqual('Comment/Essay');
    expect(scope.section.FormSectionItems[0].BankItemDemographicId).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemDemographic
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].BankItemEmergencyContactId
    ).toBeNull();
    expect(
      scope.section.FormSectionItems[0].FormBankItemEmergencyContact
    ).toBeNull();
    //
    expect(
      angular.element(
        '#questionCommentEssayText' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element(
        '#questionCommentEssayText' +
          (scope.section.FormSectionItems.length - 1)
      ).focus
    ).toHaveBeenCalled();
  });

  //copySection
  it('copySection should copy a given section below it, when the section to be copied is valid', function () {
    scope.customForm = {
      SectionValidationFlag: true,
      FormSections: [{ Title: 'Section1' }, { Title: 'Section2' }],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];

    spyOn(scope, 'isSectionValid').and.returnValue(true);
    spyOn(scope, 'previewSection');
    scope.editSection = jasmine.createSpy();

    expect(scope.customForm.FormSections.length).toEqual(2);

    scope.copySection(0);

    expect(scope.isSectionValid).toHaveBeenCalled();
    expect(scope.customForm.SectionValidationFlag).toBe(false);
    expect(scope.customForm.FormSections.length).toEqual(3);
    expect(scope.customForm.FormSections[0].Title).toEqual('Section1');
    expect(scope.customForm.FormSections[1].Title).toEqual('');
    expect(scope.customForm.FormSections[2].Title).toEqual('Section2');

    var newlyCopiedSection = scope.customForm.FormSections[1];
    expect(scope.previewSection).toHaveBeenCalled();
    expect(scope.editSection).toHaveBeenCalledWith(1);
  });

  it('copySection should not copy a given section below it, when the section to be copied is invalid', function () {
    scope.customForm = {
      FormSections: [{ Title: '' }, { Title: 'Section2' }],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];

    spyOn(scope, 'isSectionValid').and.returnValue(false);
    spyOn(scope, 'previewSection');
    scope.editSection = jasmine.createSpy();

    expect(scope.customForm.FormSections.length).toEqual(2);

    scope.copySection();

    expect(scope.isSectionValid).toHaveBeenCalledWith();
    expect(scope.previewSection).not.toHaveBeenCalled();
    expect(scope.editSection).not.toHaveBeenCalled();

    expect(scope.customForm.FormSections.length).toEqual(2);
    expect(scope.customForm.FormSections[0].Title).toEqual('');
    expect(scope.customForm.FormSections[1].Title).toEqual('Section2');
    expect(scope.customForm.IndexOfSectionInEditMode).toBe(0);
  });

  it("copySection should set focus on newly copied section's title, when the section to be copied is valid", function () {
    scope.customForm = {
      error: true,
      FormSections: [
        { Title: 'Section1', FormSectionItems: [] },
        { Title: 'Section2', FormSectionItems: [] },
      ],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];
    var sectionIndex = 0;

    spyOn(scope, 'isSectionValid').and.returnValue(true);
    spyOn(scope, 'previewSection');
    scope.editSection = jasmine.createSpy();

    expect(scope.customForm.FormSections.length).toEqual(2);

    scope.copySection(0);

    expect(scope.isSectionValid).toHaveBeenCalled();
    expect(scope.customForm.FormSections.length).toEqual(3);

    expect(
      angular.element('#inpSectionTitle_' + (sectionIndex + 1)).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#inpSectionTitle_' + (sectionIndex + 1)).focus
    ).toHaveBeenCalled();
  });

  it('copySection should not set focus on any angular element, when the section to be copied is invalid', function () {
    scope.customForm = {
      error: true,
      FormSections: [{ Title: '' }, { Title: 'Section2' }],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];
    var sectionIndex = 0;

    spyOn(scope, 'isSectionValid').and.returnValue(false);

    expect(scope.customForm.FormSections.length).toEqual(2);

    scope.copySection();

    expect(scope.isSectionValid).toHaveBeenCalled();
    expect(scope.customForm.FormSections.length).toEqual(2);

    expect(
      angular.element('#inpSectionTitle_' + (sectionIndex + 1)).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element('#inpSectionTitle_' + (sectionIndex + 1)).focus
    ).not.toHaveBeenCalled();
  });

  //moveSectionUp
  it('moveSectionUp should move section up', function () {
    scope.customForm = {
      FormSections: [{ Title: 'Section1' }, { Title: 'Section2' }],
      IndexOfSectionInEditMode: 1,
    };
    scope.section = scope.customForm.FormSections[1];

    scope.moveSectionUp(1);

    expect(scope.customForm.FormSections.length).toEqual(2);
    expect(scope.customForm.FormSections[0].Title).toEqual('Section2');
    expect(scope.customForm.FormSections[1].Title).toEqual('Section1');
    expect(scope.customForm.IndexOfSectionInEditMode).toBe(0);
  });

  it("moveSectionUp should set focus on the moved section's title", function () {
    scope.customForm = {
      FormSections: [
        { Title: 'Section1', FormSectionItems: [] },
        { Title: 'Section2', FormSectionItems: [] },
      ],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[1];

    scope.moveSectionUp(1);

    expect(scope.customForm.IndexOfSectionInEditMode).toBe(0);
    expect(
      angular.element(
        '#inpSectionTitle_' + scope.customForm.IndexOfSectionInEditMode
      ).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element(
        '#inpSectionTitle_' + scope.customForm.IndexOfSectionInEditMode
      ).focus
    ).toHaveBeenCalled();
  });

  //moveSectionDown
  it('moveSectionDown should move section down when the section to move is not bottom-most section', function () {
    scope.customForm = {
      FormSections: [{ Title: 'Section1' }, { Title: 'Section2' }],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];

    scope.moveSectionDown(0);

    expect(scope.customForm.FormSections.length).toEqual(2);
    expect(scope.customForm.FormSections[0].Title).toEqual('Section2');
    expect(scope.customForm.FormSections[1].Title).toEqual('Section1');
    expect(scope.customForm.IndexOfSectionInEditMode).toBe(1);
  });

  it("moveSectionDown should set focus on the moved section's title", function () {
    scope.customForm = {
      FormSections: [
        { Title: 'Section1', FormSectionItems: [] },
        { Title: 'Section2', FormSectionItems: [] },
      ],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];

    scope.moveSectionDown(0);

    expect(scope.customForm.IndexOfSectionInEditMode).toBe(1);
    expect(
      angular.element(
        '#inpSectionTitle_' + scope.customForm.IndexOfSectionInEditMode
      ).focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(
      angular.element(
        '#inpSectionTitle_' + scope.customForm.IndexOfSectionInEditMode
      ).focus
    ).toHaveBeenCalled();
  });

  //previewSection
  it('previewSection should set the given section preview mode, when the section is valid', function () {
    scope.customForm = {
      SectionValidationFlag: true,
      FormSections: [{ Title: 'Section1' }],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];

    spyOn(scope, 'isSectionValid').and.returnValue(true);

    expect(scope.customForm.IndexOfSectionInEditMode).toBe(0);

    scope.previewSection();

    expect(scope.isSectionValid).toHaveBeenCalled();
    expect(scope.customForm.IndexOfSectionInEditMode).toBe(-1);
    expect(scope.customForm.SectionValidationFlag).toBe(false);
  });

  it('previewSection should not set the given section preview mode, when the section is invalid', function () {
    scope.customForm = {
      SectionValidationFlag: false,
      FormSections: [{ Title: 'Section1' }],
      IndexOfSectionInEditMode: 0,
    };
    scope.section = scope.customForm.FormSections[0];

    spyOn(scope, 'isSectionValid').and.returnValue(false);

    expect(scope.customForm.IndexOfSectionInEditMode).toBe(0);

    scope.previewSection();

    expect(scope.isSectionValid).toHaveBeenCalled();
    expect(scope.customForm.IndexOfSectionInEditMode).toBe(0);
    expect(scope.customForm.SectionValidationFlag).toBe(true);
  });

  //isSectionValid
  it('isSectionValid should return false when the section is invalid', function () {
    customFormsFactory.ValidateFormSectionItem = jasmine
      .createSpy()
      .and.returnValue(false);

    //for yes-no
    scope.section = {
      FormSectionItems: [{ FormItemTypeId: 2, FormBankItem: { ItemText: '' } }],
    };

    var result = scope.isSectionValid();
    expect(result).toBe(false);

    //for true-false
    scope.section = {
      FormSectionItems: [{ FormItemTypeId: 8, FormBankItem: { ItemText: '' } }],
    };

    var result = scope.isSectionValid();
    expect(result).toBe(false);

    //for multiple choice
    scope.section = {
      FormSectionItems: [{ FormItemTypeId: 3, FormBankItem: { ItemText: '' } }],
    };

    var result = scope.isSectionValid();
    expect(result).toBe(false);

    //for comment-essay
    scope.section = {
      FormSectionItems: [{ FormItemTypeId: 7, FormBankItem: { ItemText: '' } }],
    };

    var result = scope.isSectionValid();
    expect(result).toBe(false);
  });

  it('isSectionValid should return true when the section is valid', function () {
    //for yes-no
    scope.section = {
      FormSectionItems: [
        { FormItemTypeId: 2, FormBankItem: { ItemText: 'sample' } },
      ],
    };

    var result = scope.isSectionValid();
    expect(result).toBe(true);

    //for true-false
    scope.section = {
      FormSectionItems: [
        { FormItemTypeId: 8, FormBankItem: { ItemText: 'sample' } },
      ],
    };

    var result = scope.isSectionValid();
    expect(result).toBe(true);

    //for multiple choice
    scope.section = {
      FormSectionItems: [
        { FormItemTypeId: 3, FormBankItem: { ItemText: 'sample' } },
      ],
    };

    var result = scope.isSectionValid();
    expect(result).toBe(true);

    //for comment-essay
    scope.section = {
      FormSectionItems: [
        { FormItemTypeId: 7, FormBankItem: { ItemText: 'sample' } },
      ],
    };

    var result = scope.isSectionValid();
    expect(result).toBe(true);
  });
});
