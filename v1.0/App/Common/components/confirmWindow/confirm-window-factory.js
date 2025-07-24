'use strict';

angular.module('common.factories').factory('ConfirmWindowFactory', [
  '$q',
  'localize',
  function ($q, localize) {
    var factory = this;

    // opening kendo confirm window
    factory.open = function (event, rowID, window, message, mode) {
      var defer = $q.defer();
      var promise = defer.promise;
      var msg = '';
      var safeMessage = _.escape(message);

      switch (mode) {
        case 'confirm':
          msg =
            '<div class="confirmWindow">' +
            '<div ng-non-bindable class="confirmWindow__msg">' +
            safeMessage +
            '</div>' +
            '<div class="confirmWindow__actions">' +
            '<button id="cancel-' +
            rowID +
            '" class="btn btn-default">' +
            localize.getLocalizedString('Cancel') +
            '</button>' +
            '<button id="delete-' +
            rowID +
            '"class="btn btn-primary">' +
            localize.getLocalizedString('Delete') +
            '</button></div>' +
            '</div>';
          break;
        case 'confirmSave':
          msg =
            '<div class="confirmWindow">' +
            '<div ng-non-bindable class="confirmWindow__msg">' +
            safeMessage +
            '</div>' +
            '<div class="confirmWindow__actions">' +
            '<button id="cancel-' +
            rowID +
            '" class="btn btn-default">' +
            localize.getLocalizedString('Cancel') +
            '</button>' +
            '<button id="save-' +
            rowID +
            '"class="btn btn-primary">' +
            localize.getLocalizedString('Save') +
            '</button></div>' +
            '</div>';
          break;
        case 'warning':
          msg =
            '<div class="confirmWindow">' +
            '<div ng-non-bindable class="confirmWindow__msg">' +
            safeMessage +
            '</div>' +
            '<div class="confirmWindow__actions">' +
            '<button id="ok-' +
            rowID +
            '"class="btn btn-primary">' +
            localize.getLocalizedString('OK') +
            '</button></div>' +
            '</div>';
          break;
      }

      // reset the window content
      window.content(msg);

      // reset the window options
      window.setOptions({
        visible: false,
        resizable: false,
        scrollable: false,
        iframe: false,
        appendTo: 'body',
        actions: [],
        animation: {
          open: {
            effects: 'fade:in',
          },
          close: {
            effects: 'fade:out',
          },
        },
        position: {
          top: event.pageY + 16,
          left: event.pageX - 200,
        },
        width: '270px',
        title: false,
      });

      // open the window
      window.open();

      // delete click handler
      $('button#delete-' + rowID).on('click', function (event) {
        window.close();
        var res = 'delete';
        promise = $.extend(promise, { value: res });
        defer.resolve(res);
      });

      $('button#save-' + rowID).on('click', function (event) {
        window.close();
        var res = 'confirmSave';
        promise = $.extend(promise, { value: res });
        defer.resolve(res);
      });

      // cancel click handler
      $('button#cancel-' + rowID).on('click', function (event) {
        window.close();
        var res = 'cancel';
        promise = $.extend(promise, { value: res });
        defer.resolve(res);
      });

      // ok click handler
      $('button#ok-' + rowID).on('click', function (event) {
        window.close();
      });

      return promise;
    };

    return {
      Open: function (event, grid, window, message, mode) {
        return factory.open(event, grid, window, message, mode);
      },
    };
  },
]);
