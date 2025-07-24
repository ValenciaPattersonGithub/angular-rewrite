'use strict';

angular
  .module('common.services')
  .service('ApiDefinitions', [
    'ResourceFactory',
    function (resourceFactory) {
      var Enum = resourceFactory.Enum;

      var createAction = function (name, method, params) {
        var action = { Name: name, Method: method, Params: params };

        return action;
      };

      /** Legend: apiUrl + '/' + apiDefinition.BaseUrl + '/:Id/:Extension/:Child/:ChildId/:ChildExtension'
       * Fill params as needed
       * If wanting to use an uniquely named Id and/or ChildId, please specify in Definition
       */
      return {
        // resourceService(apiDefinitions.Carrier).GetWithDetails()
        Appointment: {
          BaseUrl: 'appointments',
          Name: 'Appointment',
          Id: 'appointmentId',
          Actions: [
            createAction('GetWithDetails', Enum.Method.GET, {
              Extension: 'detail',
            }),
            createAction('GetAllWithDetails', Enum.Method.GET, {
              Extension: 'detail',
            }),
            createAction('GetAllWithDetailsForSchedule', Enum.Method.GET, {
              Extension: 'detailForScheduler',
            }),
          ],
        },
        // resourceService(apiDefinitions.Carrier).duplicates()
        Carrier: {
          BaseUrl: 'insurance/carrier',
          Name: 'Carrier',
          Id: 'carrierId',
          Actions: [
            createAction('duplicates', Enum.Method.GET, {
              Extension: 'duplicates',
            }),
          ],
        },
      };
    },
  ])
  .service('ResourceService', [
    '$resource',
    'ResourceFactory',
    'SaveStates',
    'ListHelper',
    function ($resource, resourceFactory, saveStates, listHelper) {
      var apiUrl = '_soarapi_';
      var Enum = resourceFactory.Enum;
      var promise = resourceFactory.Promise;

      return function (apiDefinition) {
        var apiFunctions = {};
        var resource = null;

        var actions = {
          Create: { method: 'POST' },
          Update: { method: 'PUT' },
          Delete: { method: 'DELETE' },
          Get: { method: 'GET' },
        };

        /** add addtional actions */
        angular.forEach(apiDefinition.Actions, function (action) {
          actions[action.Name] = {
            method: action.Method,
            params: action.Params,
          };
        });

        resource = $resource(
          apiUrl +
            '/' +
            apiDefinition.BaseUrl +
            '/:Id/:Extension/:Child/:ChildId/:ChildExtension',
          {},
          actions
        );

        var createApiFunction = function (Name, action) {
          var resourceToCall;

          resourceToCall = resource[Name];

          return function (a1, a2, a3) {
            var params = {},
              success,
              error;

            if (a3) {
              params = a1;
              success = a2;
              error = a3;
            } else if (a2) {
              if (angular.isFunction(a1)) {
                success = a1;
                error = a2;
              } else {
                params = a1;
                success = a2;
              }
            } else {
              success = a1;
            }

            /** make sure this is not a function */
            if (a1 && !angular.isFunction(a1)) {
              if (apiDefinition.Id) {
                params.Id = apiDefinition.Id ? a1[apiDefinition.Id] : params.Id;
              }
              if (apiDefinition.ChildId) {
                params.ChildId = apiDefinition.ChildId
                  ? a1[apiDefinition.ChildId]
                  : params.ChildId;
              }
            }

            return promise(
              action.method,
              resourceToCall,
              params,
              success,
              error,
              apiDefinition.Name
            );
          };
        };

        /** loop through again to create functions accessing the resource */
        angular.forEach(actions, function (value, key) {
          apiFunctions[key] = createApiFunction(key, value);
        });

        return apiFunctions;
      };
    },
  ]);
