'use strict';
var app = angular.module('Soar.BusinessCenter');
app.controller('AlternativeBenefitsController', [
    '$scope',
    '$filter',
    '$timeout',
    function ($scope, $filter, $timeout) {
        var ctrl = this;

        //$scope.alternativeBenefits[] passed in through directive
        //$scope.serviceCodeExceptions[] passed in through directive
        //$scope.allServiceCodes[] passed in through directive

        $scope.allServiceCodesLoading = true;
        $scope.alternativeBenefitsLoading = true;
        $scope.serviceCodeExceptionsLoading = true;
        $scope.fetchingParentData = false;
        $scope.fetchingChildData = false;

        $scope.childServiceCodes = [];
        $scope.parentServiceCodes = [];
        $scope.filteredParentCodes = [];
        $scope.filteredChildCodes = [];
        $scope.filteredAlternativeBenefits = [];

        $scope.currentChild = null;
        $scope.childSearch = '';
        $scope.currentParent = null;
        $scope.parentSearch = '';
        $scope.altBenSearch = '';

        // Watches - since we aren't making service calls, we'll wait until the outer controller fills the data we need and then update the kendo grids
        $scope.$watch('alternativeBenefits', function (nv) {
            if (nv && $scope.alternativeBenefitsLoading) {
                //should only be called the first time there is data in the list
                $scope.alternativeBenefitsLoading = false;
                if (!$scope.allServiceCodesLoading) {
                    ctrl.filterAllCodes();
                    ctrl.setupAltBenefits();
                    ctrl.refreshGrid();
                }
            }
        });

        $scope.$watch('allServiceCodes', function (nv) {
            if (nv && nv.length > 0 && $scope.allServiceCodesLoading) {
                //should only be called the first time there is data in the list
                $scope.allServiceCodesLoading = false;
                if (!$scope.alternativeBenefitsLoading) {
                    ctrl.filterAllCodes();
                    ctrl.setupAltBenefits();
                    ctrl.refreshGrid();
                }
            }
        });

        $scope.$watch('serviceCodeExceptions.length', function () {
            //call everytime a service code exception is added or removed (ignore page load)
            if ($scope.serviceCodeExceptionsLoading) {
                $scope.serviceCodeExceptionsLoading = false;
            } else {
                ctrl.filterAllCodes();
                $scope.cancelChild();
                $scope.cancelParent();
            }
        });

        // Setup -  all service codes and alt benefits for display
        ctrl.filterAllCodes = function () {
            $scope.filteredParentCodes = _.filter(
                $scope.allServiceCodes,
                function (code) {
                    //selectable child/parent codes cannot already be child or swiftpick codes, must have a CDT code, and must be able to submit on insurance
                    var childCode = _.find(
                        $scope.alternativeBenefits,
                        function (benefit) {
                            return benefit.ChildServiceCodeId === code.ServiceCodeId;
                        }
                    );
                    return (
                        code.CdtCodeId &&
                        code.SubmitOnInsurance &&
                        !code.IsSwiftPickCode &&
                        !childCode
                    );
                }
            );
            $scope.filteredChildCodes = _.filter(
                $scope.filteredParentCodes,
                function (code) {
                    //child codes have same rules as parent codes, with added stipulation that they cannot be service code exceptions
                    return !_.find($scope.serviceCodeExceptions, function (exception) {
                        return exception.ServiceCodeId === code.ServiceCodeId;
                    });
                }
            );
        };

        ctrl.setupAltBenefits = function () {
            angular.forEach($scope.alternativeBenefits, function (benefit) {
                var parentCode = _.find($scope.allServiceCodes, function (code) {
                    return benefit.ParentServiceCodeId === code.ServiceCodeId;
                });
                var childCode = _.find($scope.allServiceCodes, function (code) {
                    return benefit.ChildServiceCodeId === code.ServiceCodeId;
                });
                benefit.ParentCode = parentCode.Code;
                benefit.ParentCharge = parentCode.Fee;
                benefit.ChildCode = childCode.Code;
                benefit.ChildCharge = childCode.Fee;
            });
            $scope.showAlternativeBenefits =
                $scope.alternativeBenefits &&
                $scope.alternativeBenefits.length &&
                $scope.alternativeBenefits.length > 0;
        };

        // Search methods
        $scope.selectChild = function (code) {
            $scope.currentChild = code;
            $scope.childSearch = code.Code;
            $scope.childServiceCodes = [];
            $scope.fetchingChildData = false;
        };

        $scope.$watch('childServiceCodes', function (nv) {
            if (nv.length === 1) {
                $scope.selectChild(nv[0]);
            }
        });

        $scope.$watch('parentServiceCodes', function (nv) {
            if (nv.length === 1) {
                $scope.selectParent(nv[0]);
            }
        });

        $scope.selectParent = function (code) {
            $scope.currentParent = code;
            $scope.parentSearch = code.Code;
            $scope.parentServiceCodes = [];
            $scope.fetchingParentData = false;
        };

        $scope.searchForParentCodes = function (term) {
            if ($scope.searchTimeout) {
                $timeout.cancel($scope.searchTimeout);
            }
            $scope.fetchingParentData = true;
            $scope.parentServiceCodes = [];
            if (term === '') {
                // don"t search if no search term
                $scope.fetchingParentData = false;
                return;
            }
            $scope.searchTimeout = $timeout(function () {
                $scope.parentServiceCodes = _.filter(
                    $scope.filteredParentCodes,
                    function (code) {
                        if (
                            $scope.currentChild &&
                            code.ServiceCodeId === $scope.currentChild.ServiceCodeId
                        ) {
                            return false;
                        }
                        return (
                            code.Code.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                            code.CdtCodeName.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                            code.Description.toLowerCase().indexOf(term.toLowerCase()) > -1
                        );
                    }
                );
                $scope.fetchingParentData = false;
            }, 500);
        };

        $scope.searchForChildCodes = function (term) {
            if ($scope.searchTimeout) {
                $timeout.cancel($scope.searchTimeout);
            }
            $scope.fetchingChildData = true;
            $scope.childServiceCodes = [];
            if (term === '') {
                // don"t search if no search term
                $scope.fetchingChildData = false;
                return;
            }
            $scope.searchTimeout = $timeout(function () {
                $scope.childServiceCodes = _.filter(
                    $scope.filteredChildCodes,
                    function (code) {
                        var parentCode = _.find(
                            $scope.alternativeBenefits,
                            function (benefit) {
                                return benefit.ParentServiceCodeId === code.ServiceCodeId;
                            }
                        );
                        if (parentCode) {
                            return false;
                        }
                        if (
                            $scope.currentParent &&
                            code.ServiceCodeId === $scope.currentParent.ServiceCodeId
                        ) {
                            return false;
                        }
                        return (
                            code.Code.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                            code.CdtCodeName.toLowerCase().indexOf(term.toLowerCase()) > -1 ||
                            code.Description.toLowerCase().indexOf(term.toLowerCase()) > -1
                        );
                    }
                );
                $scope.fetchingChildData = false;
            }, 500);
        };

        $scope.filterGrid = function () {
            if ($scope.altBenSearch === '') {
                ctrl.refreshGrid();
            } else {
                $scope.filteredAlternativeBenefits = _.filter(
                    $scope.alternativeBenefits,
                    function (benefit) {
                        return (
                            benefit.ParentCode.toLowerCase().indexOf(
                                $scope.altBenSearch.toLowerCase()
                            ) > -1 ||
                            benefit.ChildCode.toLowerCase().indexOf(
                                $scope.altBenSearch.toLowerCase()
                            ) > -1
                        );
                    }
                );
                ctrl.refreshGrid($scope.filteredAlternativeBenefits);
            }
        };

        $scope.cancelChild = function () {
            $scope.childSearch = ''; // clear the search criteria
            $scope.childServiceCodes = [];
            $scope.currentChild = null;
            if ($scope.searchTimeout && $scope.searchTimeout.cancel) {
                $scope.fetchingChildData = false;
                $scope.searchTimeout.cancel();
            }
        };
        $scope.cancelParent = function () {
            $scope.parentSearch = ''; // clear the search criteria
            $scope.parentServiceCodes = [];
            $scope.currentParent = null;
            if ($scope.searchTimeout && $scope.searchTimeout.cancel) {
                $scope.fetchingParentData = false;
                $scope.searchTimeout.cancel();
            }
        };

        $scope.cancelAlternativeBenefits = function () {
            $scope.cancelChild();
            $scope.cancelParent();
            if ($scope.showAddAlternativeBenefits) {
                $scope.disableAddAlternativeBenefits = false;
            }
            else {
                $scope.disableAddAlternativeBenefits = true;
            }
            $scope.showAddAlternativeBenefits = !$scope.showAddAlternativeBenefits;
        };

        // CRUD methods
        $scope.addAlternativeBenefit = function () {
            if ($scope.currentParent && $scope.currentChild) {
                $scope.alternativeBenefits.push(
                    ctrl.createAlternativeBenefit(
                        $scope.currentParent,
                        $scope.currentChild
                    )
                );
                $scope.disableAddAlternativeBenefits = false;
                $scope.cancelParent();
                $scope.cancelChild();
                ctrl.filterAllCodes(); // to remove new child code from search result lists
                ctrl.refreshGrid();
            }
        };

        $scope.deleteAlternativeBenefit = function (code) {
            $scope.cancelParent();
            $scope.cancelChild();
            $scope.alternativeBenefits = _.filter(
                $scope.alternativeBenefits,
                function (benefit) {
                    return !(
                        benefit.ParentServiceCodeId === code.ParentServiceCodeId &&
                        benefit.ChildServiceCodeId === code.ChildServiceCodeId
                    );
                }
            );
            ctrl.filterAllCodes(); // to add deleted child back to search results list
            ctrl.refreshGrid();
        };

        // Utility methods
        ctrl.createAlternativeBenefit = function (parent, child) {
            return {
                BenefitPlanId: '', //set in back end on update
                ParentServiceCodeId: parent.ServiceCodeId,
                ParentCode: parent.Code,
                ParentCharge: parent.Fee,
                ChildServiceCodeId: child.ServiceCodeId,
                ChildCode: child.Code,
                ChildCharge: child.Fee,
                ObjectState: 'Add',
            };
        };

        ctrl.refreshGrid = function (data) {
            $timeout(function () {
                if (data) {
                    $('#alternativeBenefitsGrid').data('kendoGrid').dataSource.data(data);
                } else {
                    $('#alternativeBenefitsGrid')
                        .data('kendoGrid')
                        .dataSource.data($scope.alternativeBenefits);
                }
            });
        };

        // Kendo grid stuff
        $scope.alternativeBenefitsDataSource = {
            data: $scope.alternativeBenefits,
            schema: {
                model: {
                    fields: {
                        ChildCode: {
                            editable: false,
                            nullable: true,
                        },
                        ChildCharge: {
                            editable: false,
                            nullable: true,
                        },
                        ParentCode: {
                            editable: false,
                            nullable: true,
                        },
                        ParentCharge: {
                            editable: false,
                            nullable: true,
                        },
                    },
                },
            },
        };

        $scope.alternativeBenefitsOptions = {
            sortable: false,
            editable: false,
            columns: [
                {
                    title: $filter('i18n')('Code'),
                    field: 'ChildCode',
                    width: '19%',
                },
                {
                    title: $filter('i18n')('Charge'),
                    field: 'ChildCharge',
                    width: '19%',
                    format: '{0:c2}',
                },
                {
                    title: $filter('i18n')('Treat as if'),
                    template: '<span class="fa fa-arrow-right altben__secClose"></span>',
                    width: '19%',
                },
                {
                    title: $filter('i18n')('Code'),
                    field: 'ParentCode',
                    width: '19%',
                },
                {
                    title: $filter('i18n')('Charge'),
                    field: 'ParentCharge',
                    width: '19%',
                    format: '{0:c2}',
                },
                {
                    width: '5%',
                    template:
                        "<button class='btn btn-link' icon='fa-times-circle' ng-click='deleteAlternativeBenefit(dataItem)'></button>",
                },
            ],
        };
    },
]);
