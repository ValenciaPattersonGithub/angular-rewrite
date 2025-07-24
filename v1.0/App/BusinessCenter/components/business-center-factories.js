angular
  .module('Soar.BusinessCenter')
  .factory('RolesFactory', [
    'UserServices',
    '$filter',
    'localize',
    '$q',
    '$http',
    'SaveStates',
    'toastrFactory',
    '$timeout',
    'ListHelper',
    'patSecurityService',
    'practiceService',
    'TimestampCachedApiServices',
    function (
      userServices,
      $filter,
      localize,
      $q,
      $http,
      saveStates,
      toastrFactory,
      $timeout,
      listHelper,
      patSecurityService,
      practiceService,
      timestampCachedApiServices
    ) {
      var that = this;
      that.roles = [];
      that.userRolesByLocation = [];
      that.userRoles = [];

      var factory = {
        LoadedUsersPracticeRoles: null,
        LoadedUsersLocationRoles: null,
        // get all user access
        access: authAccess,
        Roles: getRoles,
        AllUsersPracticeRoles: getAllUsersPracticeRoles,
        AllUsersLocationRoles: getAllUsersLocationRoles,
        UserRoles: getAllUserRoles,
        UserPracticeRoles: getUserPracticeRoles,
        UserLocationRoles: getUserLocationRoles,
        AddLocationRole: addLocationRole,
        RemoveLocationRole: removeLocationRole,
        AddUserLocationRoles: addUserLocationRoles,
        RemoveUserLocationRoles: removeUserLocationRoles,
        ProcessUserLocationRoles: processUserLocationRoles,
        ProcessUserPracticeRoles: processUserPracticeRoles,
        AllPracticeAdmins: getAllPracticeAdmins,
        GetInactiveUserAssignedRoles: getInactiveUserAssignedRoles,
        AddInactiveUserAssignedRoles: addInactiveUserAssignedRoles,
      };

      // this method returns a list of stored roles that the user had when they were active
      // these roles are just for reference and the user does not have the permissions associated with them.
      function getInactiveUserAssignedRoles(userId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-read'
          )
        ) {
          userServices.UserScheduleLocation.getInactiveUserAssignedLocations({
            Id: userId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve {0}. Refresh the page to try again.',
                  ['Inactive User Roles']
                ),
                localize.getLocalizedString('Error')
              );
            }
          );
        }
        return promise;
      }

      // this method persists inactive roles when a user is marked for no access
      // these roles are just for reference and the user does not have the permissions associated with them.
      function addInactiveUserAssignedRoles(userId, userAssignedRolesDto) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'soar-biz-bizusr-etprov'
          )
        ) {
          userServices.UserScheduleLocation.retainUserDeletedRoles(
            { Id: userId },
            userAssignedRolesDto
          ).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Result });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString('Failed to assign the {0}', [
                  'inactive user role',
                ]),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      }

      function getAllPracticeAdmins() {
        var defer = $q.defer();
        var promise = defer.promise;
        var userPractice = JSON.parse(sessionStorage.getItem('userPractice'));
        if (userPractice) {
          userServices.Roles.getAllRolesByPractice(
            { practiceId: userPractice.id },
            function (res) {
              promise = $.extend(promise, { values: res.Result });
              defer.resolve(res);
            },
            function () {}
          );
        }
        return promise;
      }

      function getRoles() {
        var defer = $q.defer();
        var promise = defer.promise;
        var userContext = JSON.parse(sessionStorage.getItem('userContext'));
        var applicationId = userContext.Result.Application.ApplicationId;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-read'
          )
        ) {
          userServices.Roles.get({
            applicationId: applicationId,
          }).$promise.then(
            function (res) {
              that.roles = res.Value;
              promise = $.extend(promise, { values: res.Result });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve {0}. Refresh the page to try again.',
                  ['Roles']
                ),
                localize.getLocalizedString('Error')
              );
            }
          );
        }
        return promise;
      }

      function getUserPracticeRoles(userId) {
        var defer = $q.defer();
        var promise = defer.promise;
        var practiceId = practiceService.getCurrentPractice().id;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-read'
          )
        ) {
          userServices.Roles.getUserRoles({
            userId: userId,
            practiceId: practiceId,
          }).$promise.then(
            function (res) {
              that.userRoles = res.Result;
              promise = $.extend(promise, { values: res.Result });
              defer.resolve(res);
            },
            function (res) {
              if (res.status === 403) {
                // this user is not a practice admin and doesn't have access to this api
                that.userRoles = [];
                var returnValue = $.extend(promise, { Result: [] });
                defer.resolve({ Result: [] });
              } else {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to retrieve {0}. Refresh the page to try again.',
                    ['User Roles']
                  ),
                  localize.getLocalizedString('Error')
                );
              }
            }
          );
        }
        return promise;
      }

      function getAllUsersPracticeRoles() {
        var fctr = factory;
        var defer = $q.defer();
        var promise = defer.promise;
        var currentPractice = practiceService.getCurrentPractice();
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-read'
          )
        ) {
          timestampCachedApiServices
            .getAllRolesByPractice({ practiceId: currentPractice.id })
            .then(
              function (usersPracticeRoles) {
                fctr.LoadedUsersPracticeRoles = usersPracticeRoles;
                promise = $.extend(promise, { values: usersPracticeRoles });
                defer.resolve({ Result: fctr.LoadedUsersPracticeRoles });
              },
              function (res) {
                fctr.LoadedUsersPracticeRoles = null;
                if (res.status === 403) {
                  // this user is not a practice admin and doesn't have access to this api
                  var returnValue = $.extend(promise, { Result: [] });
                  defer.resolve({ Result: [] });
                } else {
                  toastrFactory.error(
                    localize.getLocalizedString(
                      'Failed to retrieve {0}. Refresh the page to try again.',
                      ['User Practice Roles']
                    ),
                    localize.getLocalizedString('Error')
                  );
                }
              }
            );
        }
        return promise;
      }

      function getAllUsersLocationRoles(locationId) {
        if (_.isObject(locationId)) {
          locationId = locationId.LocationId;
        }
        var fctr = factory;
        var defer = $q.defer();
        var promise = defer.promise;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-read'
          )
        ) {
          timestampCachedApiServices
            .getAllRolesByLocation({ locationId: locationId })
            .then(
              function (usersLocationRoles) {
                _.forEach(usersLocationRoles, function (locationRole) {
                  locationRole.$$LocationId = locationId;
                });
                fctr.LoadedUsersLocationRoles = usersLocationRoles;
                promise = $.extend(promise, { values: usersLocationRoles });
                defer.resolve({ Result: fctr.LoadedUsersLocationRoles });
              },
              function (res) {
                fctr.LoadedUsersLocationRoles = null;
                if (res.status === 403) {
                  // this user is not a practice admin and doesn't have access to this api
                  var returnValue = $.extend(promise, { Result: [] });
                  defer.resolve({ Result: [] });
                } else {
                  toastrFactory.error(
                    localize.getLocalizedString(
                      'Failed to retrieve {0}. Refresh the page to try again.',
                      ['User Roles by location']
                    ),
                    localize.getLocalizedString('Error')
                  );
                }
              }
            );
        }
        return promise;
      }

      function getUserLocationRoles(userId, locationId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-read'
          )
        ) {
          userServices.Roles.getUserRolesByLocation({
            userId: userId,
            locationId: locationId,
          }).$promise.then(
            function (res) {
              that.userRolesByLocation = res.Result;
              promise = $.extend(promise, {
                values: res.Result,
              });
              defer.resolve(res);
            },
            function (res) {
              if (res.status === 403) {
                // this user is not a practice admin and doesn't have access to this api
                that.userRoles = [];
                defer.resolve({ Result: [] });
              } else {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to retrieve {0}. Refresh the page to try again.',
                    ['User Roles by location']
                  ),
                  localize.getLocalizedString('Error')
                );
              }
            }
          );
        }
        return promise;
      }

      function getAllUserRoles(userId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-read'
          )
        ) {
          userServices.UserRoles.get({ userId: userId }).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Result,
              });
              defer.resolve(res);
            },
            function (res) {
              if (res.status === 403) {
                // this user is not a practice admin and doesn't have access to this api
                var returnValue = $.extend(promise, { Result: [] });
                defer.resolve({ Result: [] });
              } else {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to retrieve {0}. Refresh the page to try again.',
                    ['User Roles']
                  ),
                  localize.getLocalizedString('Error')
                );
              }
            }
          );
        }
        return promise;
      }

      function processUserPracticeRoles(user) {
        var practiceId = practiceService.getCurrentPractice().id;
        var processes = [];
        var defer = $q.defer();
        var promise = defer.promise;
        var addPracticeRoles = _.filter(
          user.$$UserPracticeRoles,
          function (role) {
            return role.$$ObjectState === saveStates.Add;
          }
        );
        _.forEach(addPracticeRoles, function (practiceRole) {
          processes.push(
            addPracticeRole(user.UserId, practiceRole, practiceId)
          );
        });

        var removePracticeRoles = _.filter(
          user.$$UserPracticeRoles,
          function (role) {
            return role.$$ObjectState === saveStates.Delete;
          }
        );
        _.forEach(removePracticeRoles, function (practiceRole) {
          processes.push(
            removePracticeRole(user.UserId, practiceRole, practiceId)
          );
        });

        var hasFailures = false;
        // we may not have any practice roles to update so don't show the success message unless we do
        if (processes.length > 0) {
          $q.all(processes).then(function (res) {
            angular.forEach(res, function (result) {
              if (result.success === false) {
                hasFailures = true;
              }
            });
            // handle post save functions - messaging
            if (hasFailures) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to save at least some of the {0}. Refresh the page and try again.',
                  ['Roles']
                ),
                'Error'
              );
            } else {
              toastrFactory.success(
                localize.getLocalizedString('Roles assigned successfully.'),
                localize.getLocalizedString('Success')
              );
            }
            defer.resolve();
          });
        } else {
          defer.resolve();
        }
        return promise;
      }

      function addPracticeRole(userId, practiceRole, practiceId) {
        var defer = $q.defer();
        var promise = defer.promise;
        userServices.Roles.assignRole({
          userId: userId,
          roleId: practiceRole.RoleId,
          practiceId: practiceId,
        }).$promise.then(
          function (res) {
            defer.resolve({ success: true });
          },
          function (res) {
            defer.resolve({ success: false });
            toastrFactory.error(
              localize.getLocalizedString('Failed to assign the {0}', [
                'user role',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }

      function removePracticeRole(userId, practiceRole, practiceId) {
        var defer = $q.defer();
        var promise = defer.promise;
        userServices.Roles.deleteRole({
          userId: userId,
          roleId: practiceRole.RoleId,
          practiceId: practiceId,
        }).$promise.then(
          function (res) {
            defer.resolve({ success: true });
          },
          function (res) {
            defer.resolve({ success: false });
            toastrFactory.error(
              localize.getLocalizedString('Failed to assign the {0}', [
                'user role',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }

      function processUserLocationRoles(userLocationSetups, userId) {
        var processes = [];
        var defer = $q.defer();
        var promise = defer.promise;
        _.forEach(userLocationSetups, function (userLocationSetup) {
          var addLocationRoles = _.filter(
            userLocationSetup.$$UserLocationRoles,
            function (role) {
              return role.$$ObjectState === saveStates.Add;
            }
          );
          if (addLocationRoles.length > 0) {
            processes.push(
              addUserLocationRoles(
                userId,
                addLocationRoles,
                userLocationSetup.LocationId
              )
            );
          }
          var removeLocationRoles = _.filter(
            userLocationSetup.$$UserLocationRoles,
            function (role) {
              return role.$$ObjectState === saveStates.Delete;
            }
          );
          if (removeLocationRoles.length > 0) {
            processes.push(
              removeUserLocationRoles(
                userId,
                removeLocationRoles,
                userLocationSetup.LocationId
              )
            );
          }
        });
        var hasFailures = false;
        // we may not have any locations roles to update so don't show the
        // success message unless we do
        if (processes.length > 0) {
          $q.all(processes).then(function (res) {
            angular.forEach(res, function (result) {
              if (result.success === false) {
                hasFailures = true;
              }
            });
            // handle post save functions - messaging
            if (hasFailures) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to save at least some of the {0}. Refresh the page and try again.',
                  ['Roles']
                ),
                'Error'
              );
            } else {
              toastrFactory.success(
                localize.getLocalizedString('Roles assigned successfully.'),
                localize.getLocalizedString('Success')
              );
            }
            defer.resolve();
          });
        } else {
          defer.resolve();
        }
        return promise;
      }

      function removeUserLocationRoles(userId, userRoles, locationId) {
        var defer = $q.defer();
        var promise = defer.promise;
        // create the dto that platform api requires
        var userRolesDto = {
          EnterpriseRoles: {},
          PracticeRoles: {},
          LocationRoles: {},
        };
        var roles = [];
        for (var i = 0; i < userRoles.length; i++) {
          roles.push(userRoles[i].RoleId);
        }
        userRolesDto.LocationRoles[locationId] = roles;

        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-delete'
          )
        ) {
          // due to that fact that the 1.5 angular resource doesn't allow a body to be part of the request
          // handle the delete using $httpProvider
          $http({
            url: '_webapiurl_/api/users/roles/' + userId,
            method: 'DELETE',
            data: userRolesDto,
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
            },
          }).then(
            function (res) {
              defer.resolve({ success: true });
            },
            function (res) {
              defer.resolve({ success: false });
            }
          );
        }
        return promise;
      }

      function addUserLocationRoles(userId, userRoles, locationId) {
        var defer = $q.defer();
        var promise = defer.promise;
        // create the dto that platform api requires
        var userRolesDto = {
          EnterpriseRoles: {},
          PracticeRoles: {},
          LocationRoles: {},
        };
        var roles = [];
        for (var i = 0; i < userRoles.length; i++) {
          roles.push(userRoles[i].RoleId);
        }
        userRolesDto.LocationRoles[locationId] = roles;

        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-create'
          )
        ) {
          userServices.UserRoles.save(
            { userId: userId },
            userRolesDto
          ).$promise.then(
            function (res) {
              defer.resolve({ success: true });
            },
            function (res) {
              defer.resolve({ success: false });
              toastrFactory.error(
                localize.getLocalizedString('Failed to assign the {0}', [
                  'user role',
                ]),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      }

      // userServices.UserRoles.save({ userId: userId }, userRolesDto).$promise.then(function (res) {
      //     defer.resolve({ success: true });
      //     ctrl.setObjectState(userRoles, saveStates.Successful);
      // },
      //     function () {
      //         defer.resolve({ success: false });
      //         ctrl.setObjectState(userRoles, saveStates.Failed);
      //     });

      function addLocationRole(userId, locationId, roleId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-create'
          )
        ) {
          userServices.Roles.assignRoleByLocation({
            userId: userId,
            locationId: locationId,
            roleId: roleId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Result,
              });
              defer.resolve(res);
            },
            function (res) {
              toastrFactory.error(
                localize.getLocalizedString('Failed to assign the {0}', [
                  'user role',
                ]),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      }

      function removeLocationRole(userId, locationId, roleId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-delete'
          )
        ) {
          userServices.Roles.assignRoleByLocation({
            userId: userId,
            locationId: locationId,
            roleId: roleId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function (res) {
              toastrFactory.error(
                localize.getLocalizedString('Failed to remove the {0}', [
                  'user role',
                ]),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      }

      //#region authentication
      function authAccess() {
        var hasAccess = {
          Create: false,
          Delete: false,
          Edit: false,
          View: false,
        };
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-read'
          )
        ) {
          hasAccess.Create = patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-create'
          );
          hasAccess.Delete = patSecurityService.IsAuthorizedByAbbreviation(
            'plapi-user-usrrol-delete'
          );
          hasAccess.View = true;
        }
        return hasAccess;
      }
      //#endregion

      return factory;
    },
  ])

  .factory('UserLoginTimesFactory', [
    'UserServices',
    '$filter',
    'localize',
    '$q',
    '$http',
    'SaveStates',
    'toastrFactory',
    '$timeout',
    'ListHelper',
    'patSecurityService',
    'practiceService',
    'TimestampCachedApiServices',
    function (
      userServices,
      $filter,
      localize,
      $q,
      $http,
      saveStates,
      toastrFactory,
      $timeout,
      listHelper,
      patSecurityService,
      practiceService,
      timestampCachedApiServices
    ) {
      var that = this;

      var factory = {
        UpdateLoginTime: updateLoginTime,
      };

      function updateLoginTime(userId, userLoginTimes) {
        var practiceId = practiceService.getCurrentPractice().id;
        var processes = [];
        var defer = $q.defer();
        var promise = defer.promise;
        _.forEach(userLoginTimes, function (loginTime) {
          if (loginTime.$State == saveStates.Update) {
            processes.push(
              userServices.UserLoginTimes.update(
                { practiceId: practiceId, userId: userId },
                loginTime
              )
            );
          } else if (loginTime.$State == saveStates.Delete) {
            processes.push(
              userServices.UserLoginTimes.delete({
                practiceId: practiceId,
                entityId: loginTime.EntityId,
              })
            );
          }
        });
        var hasFailures = false;

        if (processes.length > 0) {
          $q.all(processes).then(function (res) {
            angular.forEach(res, function (result) {
              if (result.success === false) {
                hasFailures = true;
              }
            });
            if (hasFailures) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to save at least some of the {0}. Refresh the page and try again.',
                  ['UserLoginTimes']
                ),
                'Error'
              );
            } else {
              toastrFactory.success(
                localize.getLocalizedString(
                  'UserLoginTimes assigned successfully.'
                ),
                localize.getLocalizedString('Success')
              );
            }
            defer.resolve();
          });
        } else {
          defer.resolve();
        }
        return promise;
      }

      return factory;
    },
  ])

  .factory('UsersFactory', [
    'UserServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'AmfaKeys',
    'ListHelper',
    'patSecurityService',
    'referenceDataService',
    function (
      userServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      AmfaKeys,
      listHelper,
      patSecurityService,
      referenceDataService
    ) {
      var users = [];
      var allUsers = [];
      var providers = [];
      var dentists = [];
      var hygienists = [];
      var factory = {
        // get all user access
        access: authAccess,
        User: getUserById,
        Users: getUsers,
        UsersByLocation: getUsersByLocation,
        Dentists: function () {
          if (users.length === 0) {
            getUsers().then(function (res) {
              users = res.Value;
              return getDentists();
            });
          } else {
            return getDentists();
          }
          return [];
        },
        Hygienists: function () {
          if (users.length === 0) {
            getUsers().then(function (res) {
              users = res.Value;
              return getHygienists();
            });
          } else {
            return getHygienists();
          }
          return [];
        },
        UserName: function (userId) {
          if (users.length === 0) {
            getUsers().then(function (res) {
              users = res.Value;
              return _.escape(getUserName(userId));
            });
          } else {
            return _.escape(getUserName(userId));
          }
        },
        UserNameUnescaped: function (userId) {
          if (users.length === 0) {
            getUsers().then(function (res) {
              users = res.Value;
              return getUserName(userId, false);
            });
          } else {
            return getUserName(userId, false);
          }
        },
        PreferredProviderByLocation: getPreferredProviderByLocation,
        LoadedProviders: null,
        SetLoadedProviders: function (providers) {
          this.LoadedProviders = providers;
        },
      };

      function getUserById(userId) {
        var defer = $q.defer();
        var promise = defer.promise;
        users = referenceDataService.get(
          referenceDataService.entityNames.users
        );
        var user = _.find(users, { UserId: userId });

        if (!_.isNil(user)) {
          promise = $.extend(promise, { values: user });
          defer.resolve({ Value: user });
        } else {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve {0}. Refresh the page to try again.',
              ['current user']
            ),
            localize.getLocalizedString('Error')
          );
        }

        return promise;
      }

      function getUsers() {
        var defer = $q.defer();
        var promise = defer.promise;
        users = referenceDataService.get(
          referenceDataService.entityNames.users
        );
        if (!_.isEmpty(users)) {
          allUsers = users;
          promise = $.extend(promise, { values: allUsers });
          defer.resolve({ Value: allUsers });
        } else {
          // when RDS is not yet ready with users
          userServices.Users.get().$promise.then(
            function (res) {
              allUsers = res.Value;
              promise = $.extend(promise, { values: allUsers });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the list of {0}. Refresh the page to try again.',
                  ['Providers']
                ),
                localize.getLocalizedString('Error')
              );
            }
          );
        }

        return promise;
      }

      function getUsersByLocation(locationId) {
        var defer = $q.defer();
        var promise = defer.promise;

        userServices.UsersByLocation.get({
          locationId: locationId,
        }).$promise.then(
          function (res) {
            users = res.Value;
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0}. Refresh the page to try again.',
                ['Providers']
              ),
              localize.getLocalizedString('Error')
            );
          }
        );

        return promise;
      }

      function getUserName(userId, escaped = true) {
        var user = _.find(users, { UserId: userId });
        if (!_.isNil(user)) {
          const name = `${user.FirstName} ${user.LastName}`;
          return escaped ? _.escape(name) : name;
        }
        return '';
      }

      function getDentists() {
        dentists.splice(0, dentists.length);
        _.forEach(users, function (user) {
          if (user.ProviderTypeId === 1 || user.ProviderTypeId === 5) {
            user.Name = user.FirstName + ' ' + user.LastName;
            dentists.push(user);
          }
        });
        return dentists;
      }

      function getHygienists() {
        hygienists.splice(0, hygienists.length);
        _.forEach(users, function (user) {
          if (
            user.ProviderTypeId === 1 ||
            user.ProviderTypeId === 2 ||
            user.ProviderTypeId === 3 ||
            user.ProviderTypeId === 5
          ) {
            user.Name = user.FirstName + ' ' + user.LastName;
            hygienists.push(user);
          }
        });
        return hygienists;
      }

      function getProviders() {
        if (users.length === 0) {
          getUsers().then(function (res) {
            users = res.Value;
            providers = $filter('filter')(users, providerFilter);
          });
        } else {
          providers = $filter('filter')(users, providerFilter);
        }
      }
      //var providerTypes = [{ ProviderTypeId: 1 }, { ProviderTypeId: 2 }, { ProviderTypeId: 3 }, { ProviderTypeId: 5 }];

      function providerFilter(provider, providerTypeFilter) {
        _.forEach(providerTypeFilter, function (providerType) {
          return providerType.Id === provider.ProviderTypeId;
        });
      }

      // oe pbi 224361
      // modified by bug 324391
      // new logic:
      // if usuallyPerformedByProviderTypeId is null, preferredProvider is null
      // if usuallyPerformedByProviderTypeId is 1 and patient has preferredDentist return that otherwise null
      // if usuallyPerformedByProviderTypeId is2 and patient has preferredHygenist return that otherwise null
      function getPreferredProviderByLocation(
        userId,
        patientInfo,
        usuallyPerformedByProviderTypeId,
        providers
      ) {
        var preferredDentist = null;
        var preferredHygienist = null;

        var preferredDentistInProviderList = listHelper.findItemByFieldValue(
          providers,
          'UserId',
          patientInfo.PreferredDentist
        );
        if (preferredDentistInProviderList) {
          preferredDentist = preferredDentistInProviderList.UserId;
        }

        var preferredHygienistInProviderList = listHelper.findItemByFieldValue(
          providers,
          'UserId',
          patientInfo.PreferredHygienist
        );
        if (preferredHygienistInProviderList) {
          preferredHygienist = preferredHygienistInProviderList.UserId;
        }

        switch (usuallyPerformedByProviderTypeId) {
          case 1:
            return preferredDentist ? preferredDentist : null;
          case 2:
            return preferredHygienist ? preferredHygienist : null;
          default:
            return null;
        }
      }

      //#region authentication
      function authAccess() {
        var access = { Create: false, Delete: false, Edit: false, View: false };
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            AmfaKeys.SoarBizBizusrView
          ) === true
        ) {
          access = {
            Create: patSecurityService.IsAuthorizedByAbbreviation(
              AmfaKeys.SoarBizBizusrAdd
            ),
            Delete: patSecurityService.IsAuthorizedByAbbreviation(
              AmfaKeys.SoarBizBizusrDelete
            ),
            Edit: patSecurityService.IsAuthorizedByAbbreviation(
              AmfaKeys.SoarBizBizusrEdit
            ),
            View: true,
          };
        }
        return access;
      }
      //#endregion

      return factory;
    },
  ])
  .factory('LocationsFactory', [
    '$q',
    'LocationServices',
    'UserServices',
    '$filter',
    'ListHelper',
    'localize',
    'toastrFactory',
    'TimestampCachedApiServices',
    'referenceDataService',
    function (
      $q,
      locationServices,
      userServices,
      $filter,
      listHelper,
      localize,
      toastrFactory,
      timestampCachedApiServices,
      referenceDataService
    ) {
      var factory = {
        LoadedLocations: null,
        LoadedLocationRooms: null,
        LoadedLocationHours: null,
        UserLocations: getUserLocations,
        Location: getLocation,
        Locations: getLocations,
        LocationHours: getLocationHours,
        LocationRooms: getLocationRooms,
        FilterLocationsByUserLocations: filterAllLocationsByUserLocations,
      };

      //TODO add access
      var hasAccess = { View: true };

      function getLocations() {
        if (hasAccess.View === true) {
          var fctr = factory;
          var defer = $q.defer();
          var promise = defer.promise;
          fctr.LoadedLocations = referenceDataService.get(
            referenceDataService.entityNames.locations
          );
          promise = $.extend(promise, { values: fctr.LoadedLocations });
          defer.resolve({ Value: fctr.LoadedLocations });
          return promise;
        }
      }

      function getLocationHours(locationId) {
        if (hasAccess.View === true) {
          var fctr = factory;
          var defer = $q.defer();
          var promise = defer.promise;

          timestampCachedApiServices.getLocationHours(locationId).then(
            function (locationHours) {
              fctr.LoadedLocationHours = locationHours;
              promise = $.extend(promise, { values: fctr.LoadedLocationHours });
              defer.resolve({ Value: fctr.LoadedLocationHours });
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Location Hours']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      }

      function getLocationRooms(locationId) {
        if (hasAccess.View === true) {
          var fctr = factory;
          var defer = $q.defer();
          var promise = defer.promise;

          timestampCachedApiServices.getLocationRooms(locationId).then(
            function (locationRooms) {
              fctr.LoadedLocationRooms = locationRooms;
              promise = $.extend(promise, { values: fctr.LoadedLocationRooms });
              defer.resolve({ Value: fctr.LoadedLocationRooms });
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Location Rooms']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      }

      function getUserLocations(userId) {
        if (hasAccess.View === true) {
          var defer = $q.defer();
          var promise = defer.promise;
          userServices.UserScheduleLocation.get({ Id: userId }).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['User Locations']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      }

      function filterAllLocationsByUserLocations(locations, userLocations) {
        var filteredLocations = [];
        _.forEach(userLocations, function (userLocation) {
          var item = listHelper.findItemByFieldValue(
            locations,
            'LocationId',
            userLocation.LocationId
          );
          if (item) {
            filteredLocations.push(item);
          }
        });
        filteredLocations = $filter('orderBy')(filteredLocations, 'NameLine1');
        return filteredLocations;
      }

      function getLocation(locationId) {
        if (hasAccess.View === true) {
          var fctr = factory;
          var defer = $q.defer();
          var promise = defer.promise;
          if (
            !_.isNil(fctr.LoadedLocations) ||
            !_.isEmpty(fctr.LoadedLocations)
          ) {
            var ofcLocation = _.find(fctr.LoadedLocations, {
              LocationId: locationId,
            });
            promise = $.extend(promise, {
              values: ofcLocation,
            });

            defer.resolve({ Value: ofcLocation });
          } else {
            fctr.LoadedLocations = referenceDataService.get(
              referenceDataService.entityNames.locations
            );
            var loc = _.find(fctr.LoadedLocations, { LocationId: locationId });
            if (!_.isNil(loc)) {
              promise = $.extend(promise, {
                values: loc,
              });
              defer.resolve({ Value: loc });
            } else {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Location']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          }

          return promise;
        }
      }

      return factory;
    },
  ])
  .factory('BusinessValidationMessages', [
    'toastrFactory',
    'localize',
    function (toastrFactory, localize) {
      /**
       * @ngdoc factory
       * @name BusinessCenter.factory:ValidationMessages
       * @description Factory to store and supply Validation events messages
       **/

      var validation = {
        create: function (m) {},
        read: function (m) {},
        success: function (m) {},
        error: function (m) {},
        invalid: function (m) {},
      };

      return validation;
    },
  ])
  .factory('PatientRefferalInitialData', [
    'StaticData',
    '$q',
    function (staticData, $q) {
      return function () {
        var referralTypes = staticData.ReferralTypes();
        return $q.all([referralTypes]).then(function (results) {
          return {
            ReferralTypes: results[0],
          };
        });
      };
    },
  ])
  .factory('BenefitPlansFactory', [
    'BusinessCenterServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'ListHelper',
    'CommonServices',
    'patSecurityService',
    function (
      businessCenterServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      listHelper,
      commonServices,
      patSecurityService
    ) {
      var benefitPlans = [];
      var carriers = [];
      var factory = this;

      //#region authorization
      factory.authCarriersViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-ins-ibcomp-view'
        );
      };

      factory.authBenefitPlanViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-ins-ibplan-view'
        );
      };

      factory.authAccess = function () {
        if (factory.authBenefitPlanViewAccess()) {
          factory.hasBenefitPlanViewAccess = true;
        }
      };

      //endregion

      // get benefit plan by benefitPlanId
      var getBenefitPlan = function (benefitPlanId) {
        // check access
        if (factory.authBenefitPlanViewAccess) {
          var defer = $q.defer();
          var promise = defer.promise;
          businessCenterServices.BenefitPlan.get({
            BenefitId: benefitPlanId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to get Patient Benefit Plans.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      // find benefit plan by benefitPlanId
      var findBenefitPlanByBenefitId = function (benefitPlans, benefitPlanId) {
        var benefitPlan = null;
        if (benefitPlans.length > 0) {
          benefitPlan = listHelper.findItemByFieldValue(
            benefitPlans,
            'BenefitId',
            benefitPlanId
          );
        }
        return benefitPlan;
      };

      // find carrier plan by carrierId
      var findCarrierByCarrierId = function (carriers, carrierId) {
        var carrier = null;
        if (carriers.length > 0) {
          carrier = listHelper.findItemByFieldValue(
            carriers,
            'CarrierId',
            carrierId
          );
        }
        return carrier;
      };

      var getBenefitPlans = function () {
        // Until we have caching strategy reset to always get list
        benefitPlans = [];
        if (factory.authCarriersViewAccess) {
          var defer = $q.defer();
          var promise = defer.promise;
          if (benefitPlans.length == 0) {
            commonServices.Insurance.BenefitPlan.get().$promise.then(
              function (res) {
                benefitPlans = res.Value;
                promise = $.extend(promise, { values: res.Value });
                defer.resolve(res);
              },
              function () {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to retrieve the list of {0}. Refresh the page to try again.',
                    ['Benefit Plans']
                  ),
                  localize.getLocalizedString('Server Error')
                );
              }
            );
          } else {
            $timeout(function () {
              promise = $.extend(promise, { values: benefitPlans });
            }, 0);
          }
          return promise;
        }
      };

      // get carriers
      var getCarriers = function () {
        // Until we have caching strategy reset to always get list
        carriers = [];
        if (true) {
          var defer = $q.defer();
          var promise = defer.promise;
          if (carriers.length == 0) {
            commonServices.Insurance.Carrier.get().$promise.then(
              function (res) {
                carriers = res.Value;
                promise = $.extend(promise, { values: res.Value });
                defer.resolve(res);
              },
              function () {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to retrieve the list of {0}. Refresh the page to try again.',
                    ['Carriers']
                  ),
                  localize.getLocalizedString('Server Error')
                );
              }
            );
          } else {
            $timeout(function () {
              promise = $.extend(promise, { values: carriers });
            }, 0);
          }
          return promise;
        }
      };

      // get benefitPlans with carriers
      var getBenefitPlansAndCarriers = function () {
        // Until we have caching strategy reset to always get list
        carriers = [];
        benefitPlans = [];
        var promises = [];
        promises.push(commonServices.Insurance.BenefitPlan.get().$promise);
        promises.push(commonServices.Insurance.Carrier.get().$promise);
        $q.all(promises).then(function (res) {});
        return promises;
      };
      return {
        BenefitPlans: function () {
          return getBenefitPlans();
        },
        BenefitPlansAndCarriers: function () {
          return getBenefitPlansAndCarriers();
        },
        BenefitPlan: function (benefitPlanId) {
          return getBenefitPlan(benefitPlanId);
        },
        FindBenefitPlan: function (benefitPlans, benefitPlanId) {
          return findBenefitPlanByBenefitId(benefitPlans, benefitPlanId);
        },
        Carriers: function () {
          return getCarriers();
        },
        FindCarrier: function (carriers, carrierId) {
          return findCarrierByCarrierId(carriers, carrierId);
        },
      };
    },
  ])

  .factory('CommunicationTemplateFactory', [
    'CommunicationTemplateService',
    'toastrFactory',
    '$q',
    'localize',
    function (communicationTemplateService, toastrFactory, $q, localize) {
      var deleteActiveCommunicationTemplate = function (template) {
        var defer = $q.defer();
        var promise = defer.promise;

        communicationTemplateService
          .deleteTemplateForm({ communicationTemplateId: template })
          .$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res });
              defer.resolve(res);
              toastrFactory.success(
                localize.getLocalizedString('Delete successful.'),
                localize.getLocalizedString('Success')
              );
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to delete the {0}. Please try again.',
                  ['communication template']
                ),
                'Error'
              );
            }
          );
        return promise;
      };
      return {
        deleteCommunicationTemplate: function (template) {
          return deleteActiveCommunicationTemplate(template);
        },
      };
    },
  ])

  // TODO - Need to remove this code later
  /*.factory('TeamMemberIdentifierFactory', function () {
        var teamMemberIdentifier = {};
        return {
            set: function setTeamMemberIdentifier(type) {
                teamMemberIdentifier = type;
            },
            get: function getTeamMemberIdentifier() {
                return teamMemberIdentifier;
            }
        }
    })*/

  .factory('MedicalHistoryAlertsFactory', [
    'MedicalHistoryAlertsService',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'ListHelper',
    'CommonServices',
    'patSecurityService',
    function (
      medicalHistoryAlertsService,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      listHelper,
      commonServices,
      patSecurityService
    ) {
      var MedicalHistoryAlerts = [];
      var factory = this;
      factory.updateList = [];

      //TODO get amfas and add authorization
      // authenticate the access
      //#region authentication
      factory.hasAccess = {
        Create: false,
        Delete: false,
        Edit: false,
        View: false,
      };

      //factory.authCreateAccess = function () {
      //    return patSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-add');
      //};

      //factory.authDeleteAccess = function () {
      //    return patSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-delete');
      //};

      factory.authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-medalt-update'
        );
      };

      factory.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-medalt-view'
        );
      };

      factory.authAccess = function () {
        if (!factory.authViewAccess()) {
        } else {
          factory.hasAccess.Edit = factory.authEditAccess();
          factory.hasAccess.View = true;
        }
        return factory.hasAccess;
      };

      //#endregion

      // flip value of GenerateAlert
      factory.changeGenerateAlert = function (medicalHistoryAlert) {
        medicalHistoryAlert.GenerateAlert = !medicalHistoryAlert.GenerateAlert;
        // update the ActiveMedicalAlerts list
        var index = listHelper.findIndexByFieldValue(
          factory.medicalHistoryAlerts,
          'MedicalHistoryAlertId',
          medicalHistoryAlert.MedicalHistoryAlertId
        );
        if (index > -1) {
          factory.medicalHistoryAlerts.splice(index, 1, medicalHistoryAlert);
        }
        factory.queueForUpdate(medicalHistoryAlert);
        return medicalHistoryAlert;
      };

      // get medical history alerts
      factory.getMedicalHistoryAlerts = function () {
        factory.updateList = [];
        var defer = $q.defer();
        var promise = defer.promise;
        // check access
        if (factory.authViewAccess()) {
          medicalHistoryAlertsService.get().$promise.then(
            function (res) {
              factory.medicalHistoryAlerts = res.Value;
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the list of {0}. Refresh the page to try again.',
                  ['Medical Alerts']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      factory.queueForUpdate = function (alertToUpdate) {
        var index = listHelper.findIndexByFieldValue(
          factory.updateList,
          'MedicalHistoryAlertId',
          alertToUpdate.MedicalHistoryAlertId
        );
        // either add or replace alertToUpdate in list
        if (index > -1) {
          factory.updateList.splice(index, 1, alertToUpdate);
        } else {
          factory.updateList.push(alertToUpdate);
        }
      };

      factory.saving = false;

      // update medical history alert
      factory.processQueue = function () {
        if (factory.authEditAccess()) {
          // TODO can this be simplified or broken into separate functionality
          if (!factory.saving) {
            // take next from queue and save
            while (factory.updateList.length > 0 && factory.saving === false) {
              factory.saving = true;
              var alertToUpdate = factory.updateList[0];
              factory
                .updateMedicalHistoryAlert(alertToUpdate)
                .then(function (res) {
                  var updatedMedicalHistoryAlert = res.Value;

                  // remove this item from updateList
                  factory.updateList.splice(0, 1);

                  // find in medicalHistoryAlerts and replace
                  var index = listHelper.findIndexByFieldValue(
                    factory.medicalHistoryAlerts,
                    'MedicalHistoryAlertId',
                    updatedMedicalHistoryAlert.MedicalHistoryAlertId
                  );

                  // replace alertToUpdate in list
                  if (index > -1) {
                    factory.medicalHistoryAlerts.splice(
                      index,
                      1,
                      updatedMedicalHistoryAlert
                    );
                  }

                  // replace datatag if this alert is in updatedList a second time
                  var index = listHelper.findIndexByFieldValue(
                    factory.updateList,
                    'MedicalHistoryAlertId',
                    updatedMedicalHistoryAlert.MedicalHistoryAlertId
                  );
                  // replace alertToUpdate in list
                  if (index > -1) {
                    factory.updateList[index].DataTag =
                      updatedMedicalHistoryAlert.DataTag;
                  }

                  // notify observers that list has changed
                  angular.forEach(factory.observers, function (observer) {
                    observer(updatedMedicalHistoryAlert);
                  });

                  factory.saving = false;
                });
            }
          }
        }
      };

      // update medical history alerts NOT USED
      factory.updateMedicalHistoryAlert = function (medicalHistoryAlert) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.authEditAccess()) {
          medicalHistoryAlertsService.update(medicalHistoryAlert).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Save was unsuccessful. Please retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };
      factory.observers = [];

      return {
        access: function () {
          return factory.authAccess();
        },
        ProcessQueue: function (alertToUpdate) {
          factory.processQueue();
        },
        update: function (medicalHistoryAlert) {
          return factory.updateMedicalHistoryAlert(medicalHistoryAlert);
        },
        MedicalHistoryAlerts: function () {
          factory.medicalHistoryAlerts = factory.getMedicalHistoryAlerts();
          return factory.medicalHistoryAlerts;
        },
        SetActiveMedicalHistoryAlerts: function (medicalHistoryAlerts) {
          this.ActiveMedicalHistoryAlerts = medicalHistoryAlerts;
        },
        DataChanged: false,
        SetDataChanged: function (flag) {
          this.DataChanged = flag;
        },
        ActiveMedicalHistoryAlerts: null,
        ChangeGenerateAlert: function (medicalHistoryAlert) {
          this.DataChanged = true;
          return factory.changeGenerateAlert(
            medicalHistoryAlert,
            this.ActiveMedicalHistoryAlerts
          );
        },
        // subscribe to notes list changes
        observeMedicalHistoryAlerts: function (observer) {
          factory.observers.push(observer);
        },
      };
    },
  ])
  .factory('CustomFormsFactory', [
    '$filter',
    'localize',
    'ListHelper',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    function (
      $filter,
      localize,
      listHelper,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService
    ) {
      // TODO not used
      var hasAccess = {
        Create: false,
        Delete: false,
        Edit: false,
        View: false,
      };
      var factory = this;

      //#region auth   TODO not used

      var authCreateAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-bcform-add'
        );
      };

      //var authDeleteAccess = function () {
      //    return patSecurityService.IsAuthorizedByAbbreviation('soar-clin-nottmp-delete');
      //};

      var authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-bcform-edit'
        );
      };

      var authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-biz-bcform-view'
        );
      };

      var authAccess = function () {
        if (!authViewAccess()) {
        } else {
          hasAccess.Create = authCreateAccess();
          //hasAccess.Delete = authDeleteAccess();
          hasAccess.Edit = authEditAccess();
          hasAccess.View = true;
        }
        return hasAccess;
      };

      //#endregion

      //#region validation

      // validate sectionItem
      factory.validateFormSectionItem = function (formSectionItem) {
        var isValid = true;
        switch (formSectionItem.FormItemType) {
          case 2:
          case 3:
          case 7:
          case 8:
          case 10:
            isValid = formSectionItem.FormBankItem.ItemText;
            if (isValid) {
              formSectionItem.FormBankItem.Description =
                formSectionItem.FormBankItem.ItemText;
              formSectionItem.$$Invalid = false;
            } else {
              formSectionItem.$$Invalid = true;
            }
            break;
          case 9:
            angular.forEach(
              formSectionItem.FormBankItemPromptTexts,
              function (formBankItemPromptTexts) {
                if (!formBankItemPromptTexts.ItemText) {
                  formBankItemPromptTexts.$$Invalid = true;
                  isValid = false;
                } else {
                  formBankItemPromptTexts.$$Invalid = false;
                }
              }
            );
            break;
          case 11:
            isValid = formSectionItem.FormItemTextField.NoteText;
            if (isValid) {
              formSectionItem.$$Invalid = false;
            } else {
              formSectionItem.$$Invalid = true;
            }
            break;
        }
        return isValid;
      };

      // validate form
      factory.validateForm = function (customForm) {
        var isValidForm = true;
        _.forEach(customForm.FormSections, function (formSection) {
          _.forEach(formSection.FormSectionItems, function (formSectionItem) {
            var isValid = factory.validateFormSectionItem(formSectionItem);
            if (!isValid) {
              isValidForm = false;
            }
          });
        });
        return isValidForm;
      };

      //#endregion

      //#region Load FormItemTypeName
      // TODO Determine if these names need to be localized ....
      factory.loadFormItemTypeName = function (formSectionItem) {
        switch (formSectionItem.FormItemType) {
          case 1:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Demographic Question'
            );
            break;
          case 2:
          case 8:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Yes/No or True/False'
            );
            break;
          case 3:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Multiple Choice'
            );
            // todo handle separately
            //factory.loadCustomOption(templateBodyCustomForm.FormSections[sectionIndex].FormSectionItems[sectionItemIndex]);
            break;
          case 4:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Signature Box'
            );
            break;
          case 5:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Date of Completion'
            );
            break;
          case 6:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Emergency Contact'
            );
            break;
          case 7:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Comment/Essay'
            );
            break;
          case 9:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Ad-Lib'
            );
            break;
          case 10:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Link Tooth'
            );
            // todo handle somewhere else
            //factory.loadSelectOptions(templateBodyCustomForm.FormSections[sectionIndex].FormSectionItems[sectionItemIndex]);
            break;
          case 11:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Note Text'
            );
            break;
          default:
            formSectionItem.FormItemTypeName = localize.getLocalizedString(
              'Not Implemented'
            );
            toastrFactory.error(
              localize.getLocalizedString(
                'An error occurred loading FormItemType. Please try again'
              ),
              localize.getLocalizedString('Error')
            );
            break;
        }
        return formSectionItem;
      };

      // Load FormItemTypeNames based on FormItemType
      factory.loadFormItemTypeNames = function (customForm) {
        _.forEach(customForm.FormSections, function (formSection) {
          _.forEach(formSection.FormSectionItems, function (formSectionItem) {
            factory.loadFormItemTypeName(formSectionItem);
          });
        });
        return customForm;
      };

      return {
        // get all note template categories
        access: function () {
          return authAccess();
        },
        LoadFormItemTypeNames: function (customForm) {
          return factory.loadFormItemTypeNames(customForm);
        },
        ValidateForm: function (customForm) {
          return factory.validateForm(customForm);
        },
        ValidateFormSectionItem: function (formSectionItem) {
          return factory.validateFormSectionItem(formSectionItem);
        },
      };
    },
  ]);
