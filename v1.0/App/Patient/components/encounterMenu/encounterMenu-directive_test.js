describe('encounterMenu directive ->', function () {
  var compile, scope, compileProvider, element;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module(function ($compileProvider) {
      compileProvider = $compileProvider;
    })
  );

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    scope = $rootScope.$new();

    scope.encounterIndex = 1;
    scope.checkoutActionFunction = 1;
    scope.disableCheckoutAllButton = {};
    scope.hideCheckoutAllButton = true;
    scope.isPendingEncounterGrid = true;
    scope.viewDetailsActionFunction = true;
    scope.showViewDetailButton = true;
    scope.showDeleteButton = true;
    scope.deleteActionFunction = true;
    scope.showEditButton = true;
    scope.showEditEncounterButton = true;
    scope.editActionFunction = true;
    scope.showApplyAdjustmentButton = true;
    scope.applyAdjustmentActionFunction = true;
    scope.showApplyPaymentButton = true;
    scope.showViewCompleteEncounterButton = true;
    scope.applyPaymentActionFunction = true;
    scope.viewCompleteEncounterActionFunction = true;
    scope.encounter = {};
    scope.changePaymentOrAdjustmentActionFunction = true;
    scope.showChangePaymentOrAdjustmentOption = true;
    scope.disableEditEncounterButton = true;
    scope.showViewEobButton = true;
    scope.viewEobActionFunction = true;
  }));

  beforeEach(function () {
    element = angular.element(
      '<encounter-menu encounter-index="currentEncounterIndex" checkout-action-function="openCheckoutPopup()"' +
        'disable-checkout-all-button="disableCheckoutAllButton" hide-checkout-all-button="filteredPendingEncounterData.length <= 1" ' +
        'isPendingEncounterGrid="isPendingEncounterGrid" viewDetailsActionFunction="viewDetailsActionFunction" showViewDetailButton="showViewDetailButton"' +
        'showDeleteButton="showDeleteButton" deleteActionFunction="deleteActionFunction" showEditButton="showEditButton" showEditEncounterButton="showEditEncounterButton" ' +
        'showApplyPaymentButton="showApplyPaymentButton" applyPaymentActionFunction="applyPaymentActionFunction"' +
        'editActionFunction="editActionFunction" showApplyAdjustmentButton="showApplyAdjustmentButton" applyAdjustmentActionFunction="applyAdjustmentActionFunction"' +
        'showViewCompleteEncounterButton="showViewCompleteEncounterButton" viewCompleteEncounterActionFunction="viewCompleteEncounterActionFunction" ' +
        'encounter="encounter" changePaymentOrAdjustmentActionFunction="changePaymentOrAdjustmentActionFunction"' +
        'showChangePaymentOrAdjustmentOption="showChangePaymentOrAdjustmentOption" ' +
        'disableEditEncounterButton="disableEditEncounterButton" showViewEobButton="showViewEobButton" viewEobActionFunction="viewEobActionFunction"></encounter-menu>'
    );
    compile(element)(scope);
  });

  it('should scope to be defined', function () {
    expect(scope).toBeDefined();
    expect(scope.encounterIndex).not.toBeNull();
    expect(scope.checkoutActionFunction).not.toBeNull();
    expect(scope.disableCheckoutAllButton).not.toBeNull();
    expect(scope.hideCheckoutAllButton).not.toBeNull();
    expect(scope.isPendingEncounterGrid).not.toBeNull();
    expect(scope.viewDetailsActionFunction).not.toBeNull();
    expect(scope.showViewDetailButton).not.toBeNull();
    expect(scope.showDeleteButton).not.toBeNull();
    expect(scope.deleteActionFunction).not.toBeNull();
    expect(scope.showEditButton).not.toBeNull();
    expect(scope.showEditEncounterButton).not.toBeNull();
    expect(scope.editActionFunction).not.toBeNull();
    expect(scope.showApplyAdjustmentButton).not.toBeNull();
    expect(scope.applyAdjustmentActionFunction).not.toBeNull();
    expect(scope.showApplyPaymentButton).not.toBeNull();
    expect(scope.applyPaymentActionFunction).not.toBeNull();
    expect(scope.showViewCompleteEncounterButton).not.toBeNull();
    expect(scope.viewCompleteEncounterActionFunction).not.toBeNull();
    expect(scope.encounter).not.toBeNull();
    expect(scope.changePaymentOrAdjustmentActionFunction).not.toBeNull();
    expect(scope.showChangePaymentOrAdjustmentOption).not.toBeNull();
    expect(scope.disableEditEncounterButton).not.toBeNull();
    expect(scope.showViewEobButton).not.toBeNull();
    expect(scope.viewEobActionFunction).not.toBeNull();
  });
});
