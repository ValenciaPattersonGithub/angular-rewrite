// ***************************************
// This file is obsolete, has been migrated to Angular and is only here for reference
// Please see src\@shared\components\profile-section\profile-section.component.ts for the new version
// ***************************************
//

// 'use strict';

// angular.module("common.directives")
// 	.directive('profileSection', function()
// 	{
// 		return {
// 			restrict: 'E',
// 			transclude: true,
// 			scope: {
// 				baseId: '@',
// 				sectionTitle: '@',
//                 count: '=?',
// 				actions: '=?',
// 				height: '@',
// 				showNoAccountIcon: '=?',
// 				inactive: '@?',
//                 layout: '=?'
// 			},
// 			templateUrl: 'App/Common/components/profileSection/profileSection.html',
// 			link: function link(scope, elem, attr, ctrl) {

// 				if (attr.height)
// 				{
// 					var contentSection = $(elem).find('.profile-section .panel-body');
// 					contentSection.css('height', attr.height);
// 					contentSection.css('overflow-y', 'auto');
//                 }

//                 elem.on('$destroy', function elementOnDestroy() {
//                     scope.$destroy();
//                     scope.$$watches = [];
//                     scope.$$listeners.$destroy = null;

//                     if (scope.$$childHead) {
//                         var nextChild = scope.$$childHead;
//                         while (nextChild) {
//                             var currentChild = nextChild;
//                             nextChild = nextChild.$$nextSibling;
//                             currentChild.$destroy();
//                             currentChild.$$watchers = [];
//                             currentChild.$$nextSibling = null;
//                             currentChild.$$previousSibling = null;
//                         }
//                     }
//                 });
// 			},
// 			controller: ["$scope",function ($scope) {
// 			    if (angular.isUndefined($scope.layout)) {
// 			        $scope.layout = 1;
// 			    }
//             }]
// 		}
// 	});
