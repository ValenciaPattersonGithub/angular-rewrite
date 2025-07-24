'use strict';

angular.module('PatShared').factory('ResourceFactory', [
  'toastrFactory',
  'localize',
  function (toastrFactory, localize) {
    var Enum = {
      Method: {
        POST: 'POST',
        DELETE: 'DELETE',
        PUT: 'PUT',
        GET: 'GET',
      },
      Success: {
        POST: 'saved',
        DELETE: 'deleted',
        PUT: 'updated',
        GET: 'retrieved',
      },
      Error: {
        POST: 'save',
        DELETE: 'delete',
        PUT: 'update',
        GET: 'retrieve',
      },
    };

    var GetEnum = function (method, type) {
      var enumObj = type == 'success' ? Enum.Success : Enum.Error;

      var result = enumObj[method];

      return result;
    };

    var onSuccess = function (method, name, custom) {
      var action = GetEnum(method, 'success');

      if (custom) {
        toastrFactory.success(custom, 'Success');
      } else {
        toastrFactory.success(
          localize.getLocalizedString('Successfully {0} the {1}.', [
            action,
            name,
          ]),
          'Success'
        );
      }
    };

    var onError = function (method, name, custom) {
      var action = GetEnum(method, 'error');

      if (custom) {
        toastrFactory.error(custom, 'Error');
      } else {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to {0} the {1}. Please try again.',
            [action, name]
          ),
          'Success'
        );
      }
    };

    var promise = function (
      method,
      resource,
      params,
      success,
      error,
      name,
      customSuccessMsg,
      customErrMsg
    ) {
      /** if no property or function is passed we return the promise */
      if (angular.isUndefined(success)) {
        return resource;
      }

      if (resource) {
        resource(
          params,
          function (res) {
            if (angular.isFunction(success)) {
              success(res);
            } else {
              success = res.Value;
            }

            if (method != Enum.Method.GET) {
              onSuccess(method, name, customSuccessMsg);
            }
          },
          function (err) {
            if (angular.isFunction(error)) {
              error(err);
            } else {
              onError(method, name, customErrMsg);
            }
          }
        );
      }
    };

    return {
      Enum: Enum,
      Promise: promise,
    };
  },
]);
