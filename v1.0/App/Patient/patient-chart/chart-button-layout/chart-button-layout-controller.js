'use strict';

var app = angular.module('Soar.Patient');

var PatientChartControl = app.controller('ChartButtonLayoutController', [
  '$scope',
  '$routeParams',
  '$location',
  'localize',
  '$timeout',
  'ListHelper',
  'ModalFactory',
  '$filter',
  function (
    $scope,
    $routeParams,
    $location,
    localize,
    $timeout,
    listHelper,
    modalFactory,
    $filter
  ) {
    //Tabs Object
    $scope.tabData = {
      services: { active: true, disabled: false },
      swiftcodes: { active: false, disabled: false },
      conditions: { active: false, disabled: false },
    };

    //Sortable List Region
    $scope.services = [
      { Services: 'Service 1' },
      { Services: 'Service 2' },
      { Services: 'Service 3' },
      { Services: 'Service 4' },
      { Services: 'Service 5' },
      { Services: 'Service 6' },
    ];
    $scope.favoritesSelected = [];
    $scope.trashData = [];
    $scope.mainDataSource = new kendo.data.DataSource({
      data: $scope.services,
      pageSize: 20,
    });

    $scope.trashData = new kendo.data.DataSource({
      data: [],
    });

    $scope.favoritesSelected = new kendo.data.DataSource({
      data: [],
    });

    $scope.favData = new kendo.data.DataSource({
      data: [],
    });

    function openModal() {
      alert('Open Modal');
    }

    $scope.activateListView = function () {
      $('#favorites').kendoSortable({
        dataSource: $scope.favoritesSelected,
        connectWith: '#listview',
        end: function (e) {
          e.preventDefault();
          $scope.dataItem = $scope.mainDataSource.getByUid(e.item.data('uid'));
          $scope.favData.add($scope.dataItem);
          console.log('Fav: ' + $scope.favData.total());
        },
      });

      $('#trash').kendoSortable({
        dataSource: $scope.trashData,
        connectWith: '#favList',
        end: function (e) {
          $scope.trashItem = $scope.mainDataSource.getByUid(e.item.data('uid'));
          $scope.favData.remove($scope.trashItem);
          console.log('Trash: ' + $scope.trashData.total());
          console.log('Fav: ' + $scope.favData.total());
        },
      });

      $('#favList').kendoListView({
        dataSource: $scope.favData,
        template:
          '<button class="services" onclick="openModal()">#:Services#</button>',
      });

      $('#favList').kendoSortable({
        dataSource: $scope.favData,
        connectWith: '#trash',
        start: function (e) {
          $('#trash').addClass('red');
        },
        end: function (e) {
          $('#trash').removeClass('red');
        },
      });

      $('#pager').kendoPager({
        dataSource: $scope.mainDataSource,
      });

      $('#listView').kendoListView({
        dataSource: $scope.mainDataSource,
        template:
          '<button class="services" onclick="alert(#:Services#);">#:Services#</button>',
      });

      $('#listView').kendoSortable({
        filter: '>button.services',
        cursor: 'move',
        container: $('#container'),
        connectWith: '#favorites',
        placeholder: function (element) {
          return element.clone().css('opacity', 0.1);
        },
        hint: function (element) {
          return element.clone().removeClass('k-state-selected');
        },
        start: function (e) {
          $('#favorites').addClass('green');
        },
        end: function (e) {
          $('#favorites').removeClass('green');
        },
      });
    };
    $timeout(function () {
      $scope.activateListView();
    }, 50);
    //end sortable list region
  },
]);
