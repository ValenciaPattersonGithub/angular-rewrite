'use strict';

var app = angular.module('Soar.BusinessCenter');
app.controller('UserRolesController', [
  '$scope',
  'toastrFactory',
  'LocationServices',
  'localize',
  'UserServices',
  '$q',
  '$filter',
  'tabLauncher',
  'patSecurityService',
  'practiceService',
  '$location',
  'UsersFactory',
  function (
    $scope,
    toastrFactory,
    locationServices,
    localize,
    userServices,
    $q,
    $filter,
    tabLauncher,
    patSecurityService,
    practiceService,
    $location,
    usersFactory
  ) {
    var ctrl = this;

    $scope.users = [];
    $scope.roles = [];
    ctrl.selectedUsers = [];
    ctrl.hintHtml = '';
    $scope.assigningRole = false;
    $scope.hasRoleDetailsAccess = false;
    $scope.hasHighRoleAccess = false;
    $scope.practiceId = practiceService.getCurrentPractice().id;

    //#region Authorization

    // Check if logged in user has high role access
    ctrl.checkUserHasRoleDetailsAccess = function () {
      // check high role access
      var hasUserRoleReadAccess = patSecurityService.IsAuthorizedByAbbreviation(
        'plapi-user-usrrol-read'
      );
      var hasUserRoleCreateAccess =
        patSecurityService.IsAuthorizedByAbbreviation(
          'plapi-user-usrrol-create'
        );
      var hasUserRoleDeleteAccess =
        patSecurityService.IsAuthorizedByAbbreviation(
          'plapi-user-usrrol-delete'
        );

      // check if user has access to read the roles
      var hasRoleReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-rol-read');

      // check AMFA access
      var hasApplicationReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-app-read');
      var hasModuleReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-mod-read');
      var hasFunctionReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-fun-read');
      var hasActionReadAccess =
        patSecurityService.IsAuthorizedByAbbreviation('plapi-sec-act-read');

      // check users read access
      var hasUsersReadAccess = patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bizusr-view'
      );

      $scope.hasHighRoleAccess =
        hasUserRoleReadAccess &&
        hasUserRoleCreateAccess &&
        hasUserRoleDeleteAccess &&
        hasRoleReadAccess &&
        hasUsersReadAccess;

      $scope.hasBasicRoleAccess = hasUserRoleReadAccess && hasRoleReadAccess;

      var roleDetailsAccess =
        hasUserRoleReadAccess &&
        hasUserRoleCreateAccess &&
        hasUserRoleDeleteAccess &&
        hasRoleReadAccess &&
        hasApplicationReadAccess &&
        hasModuleReadAccess &&
        hasFunctionReadAccess &&
        hasActionReadAccess;

      return roleDetailsAccess;
    };

    // check authorization for logged in user to perform activities as per his/her access rights
    ctrl.authAccess = function () {
      if (ctrl.checkUserHasRoleDetailsAccess()) {
        $scope.hasRoleDetailsAccess = true;
      }

      if (!$scope.hasBasicRoleAccess) {
        ctrl.notifyNotAuthorized();
        $location.path('/');
      }
    };

    //Notify user, he is not authorized to access current area
    ctrl.notifyNotAuthorized = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'User is not authorized to access this area'
        ),
        'Not Authorized'
      );
    };

    // check authorization for logged in user to perform activities as per his/her access rights
    ctrl.authAccess();
    //#endregion

    //#region Method to get the users
    ctrl.getPracticeUsers = function () {
      $scope.loadingUsersDone = false;
      usersFactory
        .Users()
        .then(ctrl.getPracticeUsersSuccess, ctrl.getPracticeUsersFailure);
    };

    // Success handler to retrive users
    ctrl.getPracticeUsersSuccess = function (res) {
      $scope.loadingUsersDone = true;
      $scope.users = res.Value;
    };

    // Failure handler to reset users collection
    ctrl.getPracticeUsersFailure = function () {
      $scope.loadingUsersDone = true;
      $scope.users = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of users. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Error')
      );
    };
    // #endregion

    //#region Method to get the user roles
    ctrl.getRoles = function () {
      $scope.loadingRolesDone = false;
      userServices.Roles.get({}, ctrl.getRolesSuccess, ctrl.getRolesFailure);
    };

    // Handler to retrive user roles
    ctrl.getRolesSuccess = function (res) {
      $scope.roles = [];
      if (res && res.Result) {
        angular.forEach(res.Result, function (role) {
          var roleName = $filter('lowercase')(role.RoleName);
          if (roleName === 'low') {
            role.Order = 1;
          } else if (roleName === 'medium') {
            role.Order = 2;
          } else if (roleName === 'high') {
            role.Order = 3;
          } else {
            role.Order = 4;
          }

          $scope.roles.push(role);
        });
        $scope.roles = $filter('orderBy')($scope.roles, ['Order', 'RoleName']);
      }
      $scope.loadingRolesDone = true;
    };

    // Handler to reset user roles collection
    ctrl.getRolesFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} {1}', ['Roles', 'failed to load.']),
        localize.getLocalizedString('Server Error')
      );
      $scope.loadingRolesDone = true;
    };
    // #endregion

    // #region Drap n Drop

    // Change visual properties of an users collection while being dragged to a roles section
    $scope.draggableHint = function () {
      ctrl.selectedUsers = $filter('filter')($scope.users, { selected: true });
      ctrl.hintHtml = "<table class='userRoles__tableDrag'>";
      if (ctrl.selectedUsers.length > 0) {
        angular.forEach(ctrl.selectedUsers, function (user) {
          ctrl.hintHtml =
            ctrl.hintHtml +
            '<tr><td>' +
            "<span title='" +
            user.FirstName +
            "'>" +
            user.FirstName +
            '</span>  ' +
            "<span title='" +
            user.LastName +
            "'>" +
            user.LastName +
            '</span></td></tr>';
        });
      } else {
        ctrl.hintHtml =
          ctrl.hintHtml +
          "<tr><td><span title='" +
          localize.getLocalizedString(
            'Please select user for adding to a role.'
          ) +
          "'>" +
          localize.getLocalizedString(
            'Please select user for adding to a role.'
          ) +
          '</span></td></tr>';
      }
      ctrl.hintHtml = ctrl.hintHtml + '</table>';
      return ctrl.hintHtml;
    };

    // Event to handle user items drop on roles
    $scope.onDrop = function (e) {
      var roleId = e.dropTarget[0].id;
      // To assign the role to collection of users
      $scope.assignRoleToSelectedUsers(roleId);
    };

    // #endregion

    // #region User Role operations

    // Uncheck all the selected user checkboxes
    ctrl.clearUserSelection = function () {
      angular.forEach(ctrl.selectedUsers, function (user) {
        user.selected = false;
      });

      ctrl.selectedUsers = [];
      $scope.assigningRole = false;
      ctrl.role.selected = false;
      ctrl.role = null;
    };

    // function to assign role to selected users
    $scope.assignRoleToSelectedUsers = function (roleId) {
      if ($scope.hasHighRoleAccess) {
        ctrl.role = $filter('filter')($scope.roles, { RoleId: roleId })[0];
        if (!$scope.assigningRole) {
          var promises = [];
          ctrl.selectedUsers = $filter('filter')($scope.users, {
            selected: true,
          });
          if (ctrl.selectedUsers.length > 0) {
            // To disable the drag n drop and add selected while assigning role
            $scope.assigningRole = true;
            ctrl.role.selected = true;
            angular.forEach(ctrl.selectedUsers, function (user) {
              var defer = $q.defer();
              promises.push(defer.promise);

              // get roles associated with user and perform further operations on success
              userServices.Roles.getUserRoles(
                { userId: user.UserId, practiceId: $scope.practiceId },
                function (successResponse) {
                  ctrl.getUserRolesOnSuccess(
                    user.UserId,
                    roleId,
                    successResponse.Result,
                    defer
                  );
                },
                function () {
                  ctrl.getUserRolesOnFailure(defer);
                }
              );
            });

            $q.all(promises).then(
              function () {
                // clear user selection
                ctrl.clearUserSelection();
                toastrFactory.success(
                  localize.getLocalizedString('Role assigned successfully.'),
                  localize.getLocalizedString('Success')
                );
              },
              function () {
                ctrl.clearUserSelection();
                toastrFactory.error(
                  localize.getLocalizedString('Failed to assign roles.'),
                  localize.getLocalizedString('Error')
                );
              }
            );
          }
        }
      } else {
        ctrl.notifyNotAuthorized();
      }
    };

    // Success callback to fetch roles associated with specific user. The function perform user-role mapping based on current role
    ctrl.getUserRolesOnSuccess = function (
      userId,
      roleIdToBeAssigned,
      userRoles,
      deferredObject
    ) {
      if (userRoles.length > 0) {
        // as per current scenario, user will have only 1 role associated with it, so using first role in present in the array
        var currentRoleId = userRoles[0].RoleId;

        if (currentRoleId !== roleIdToBeAssigned) {
          // if the current user does not match the user role to be assigned, delete current role, and perform further operation on success
          userServices.Roles.deleteRole(
            {
              userId: userId,
              roleId: currentRoleId,
              practiceId: $scope.practiceId,
            },
            function () {
              ctrl.deleteUserRoleOnSuccess(
                userId,
                roleIdToBeAssigned,
                deferredObject
              );
            },
            function () {
              ctrl.deleteUserRoleOnFailure(deferredObject);
            }
          );
        } else {
          // if current user role mapping is same as the new mapping to be assigned, resolve the current operation
          deferredObject.resolve();
        }
      } else {
        // if user role mapping doesn't exists, assign new user role
        ctrl.addUserRole(userId, roleIdToBeAssigned, deferredObject);
      }
    };

    // Error callback to fetch roles associated with specific user
    ctrl.getUserRolesOnFailure = function (deferredObject) {
      toastrFactory.error('Failed to get user roles', 'Server Error');
      deferredObject.reject();
    };

    // Success callback of delete user-role mapping. The function assigns a new user role association
    ctrl.deleteUserRoleOnSuccess = function (userId, roleId, deferredObject) {
      ctrl.addUserRole(userId, roleId, deferredObject);
    };

    // Error callback of delete user-role mapping
    ctrl.deleteUserRoleOnFailure = function (deferredObject) {
      toastrFactory.error(
        localize.getLocalizedString(
          'Current role is not removed hence not able to update user role.'
        ),
        localize.getLocalizedString('Server Error')
      );
      deferredObject.reject();
    };

    // Add a new role to the user
    ctrl.addUserRole = function (userId, roleId, deferredObject) {
      userServices.Roles.assignRole(
        { userId: userId, roleId: roleId, practiceId: $scope.practiceId },
        function () {
          ctrl.addUserRoleOnSuccess(deferredObject);
        },
        function () {
          ctrl.addUserRoleOnFailure(deferredObject);
        }
      );
    };

    // Success callback of assign user-role mapping
    ctrl.addUserRoleOnSuccess = function (deferredObject) {
      deferredObject.resolve();
    };

    // Error callback of assign user-role mapping
    ctrl.addUserRoleOnFailure = function (deferredObject) {
      deferredObject.reject();
    };

    // #endregion

    // #region to open role details page in new tab window

    $scope.openDetailsInNewTab = function (roleId) {
      if ($scope.hasRoleDetailsAccess) {
        var source = 1;
        tabLauncher.launchNewTab(
          '#/BusinessCenter/Roles/' + roleId + '/' + source
        );
      } else {
        ctrl.notifyNotAuthorized();
      }
    };

    // #endregion

    // #region initialize dependencies

    // function to initialize dependencies
    ctrl.init = function () {
      ctrl.getPracticeUsers();
      ctrl.getRoles();
    };

    ctrl.init();

    // #endregion

    //Kendo Grid data Object
    //Must contain a taxonomy for grouping
    //Must be grouped at the dataSource
    $scope.rolesDemoData = new kendo.data.DataSource({
      data: [
        {
          name: 'Teams and Locations',
          section: 'Practice Setup',
          actionID: '556',
        },
        {
          name: 'Business Settings',
          section: 'Practice Setup',
          actionID: '557',
        },
        {
          name: 'Receivables Management',
          section: 'Practice Setup',
          actionID: '558',
        },
        { name: 'Schedule', section: 'Schedule', actionID: '559' },
        { name: 'Patient Management', section: 'Patient', actionID: '560' },
        { name: 'Patient Account Record', section: 'Patient', actionID: '561' },
        {
          name: 'Patient Clinical Management',
          section: 'Patient',
          actionID: '562',
        },
      ],
      // group by the "category" field
      group: { field: 'section' },
    });
    //Detail template for actionable buttons
    //Unique ID of data item is passed to function
    $scope.roleActionTemplate =
      '<div class="userRoles__detail">' +
      '<div><button class="btn btn-link" ng-click="testAction(#: actionID #)">View Team Members</button></div>' +
      '<div><button class="btn btn-link" ng-click="testAction(#: actionID #)">Add Team Members</button></div>' +
      '<div><button class="btn btn-link" ng-click="testAction(#: actionID #)">Edit Team Members</button></div>' +
      '</div>';
    // Grid Settings
    $scope.rolesGridOptions = {
      dataSource: $scope.rolesDemoData,
      columns: [
        { field: 'name' },
        { field: 'section', hidden: true, groupHeaderTemplate: '#: value #' },
      ],
      detailTemplate: $scope.roleActionTemplate,
    };

    //Test function to make sure the detail template buttons work
    //Takes parameter of UniqueID
    $scope.testAction = function (e) {
      console.log(e);
    };
  },
]);
