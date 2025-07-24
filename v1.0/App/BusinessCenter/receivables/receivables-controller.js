angular
  .module('Soar.BusinessCenter')
  .controller('ReceivablesController', ReceivablesController);

ReceivablesController.$inject = ['$scope', '$window', '$routeParams', 'ListHelper'];

/**
 * Receivables Controller
 * 
 * @param {ng.IScope} $scope 
 * @param {ng.IWindowService} $window 
 * @param {ng.route.IRouteParamsService} $routeParams 
 * @param {*} listHelper
 */
function ReceivablesController($scope, $window, $routeParams, listHelper) {

  $scope.viewOptions = [
    {
      Name: 'Total Receivables',
      Plural: 'Total Receivables',
      RouteValue: 'Total',
      Url: '#/BusinessCenter/Receivables/TotalReceivables',
      Template: 'App/BusinessCenter/receivables/total-receivables/total-receivables.html',
      title: 'Total Receivables',
      Controls: false,
    },
    {
      Name: 'Statement',
      Plural: 'Statements',
      RouteValue: 'statements',
      Url: '#/BusinessCenter/Receivables/Statements',
      Template: 'App/BusinessCenter/receivables/statements/statements.html',
      title: 'Statements',
      Controls: true,
    },
    {
      Name: 'Statement',
      Plural: 'Statements (New)',
      RouteValue: 'newstatements',
      Url: '#/BusinessCenter/Receivables/NewStatements',
      Template: 'App/BusinessCenter/receivables/new-statements/new-statements.html',
      title: 'Statements (New)',
      Controls: true,
    },
    {
      Name: 'Deposit',
      Plural: 'Deposits',
      RouteValue: 'deposits',
      Url: '#/BusinessCenter/Receivables/Deposits',
      Template: 'App/BusinessCenter/receivables/deposits/deposits.html',
      title: 'Deposits',
      Controls: true,
    },
  ];

  $scope.selectView = function (view) {
    $scope.selectedView = view;
    $scope.filter = '';
    $window.location.href = view.Url;
    document.title = view.title;
  };

  if ($routeParams.SubCategory > '') {
    var viewOption = listHelper.findItemByFieldValue(
      $scope.viewOptions,
      'RouteValue',
      $routeParams.SubCategory.toLowerCase()
    );
    $scope.selectedView = viewOption != null ? viewOption : $scope.viewOptions[0];
  } else {
    $scope.selectedView = $scope.viewOptions[0];
  }
}
