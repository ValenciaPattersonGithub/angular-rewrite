'use strict';

var app = angular.module('Soar.Schedule');

var AppointmentTypesCrudController = app.controller(
  'AppointmentTypesLandingController',
  [
    '$scope',
    '$uibModal',
    '$routeParams',
    '$location',
    '$timeout',
    'ListHelper',
    'patSecurityService',
    'AuthZService',
    'toastrFactory',
    'StaticData',
    'ModalFactory',
    'localize',
    '$filter',
    'AppointmentTypesFactory',
    'ConfirmWindowFactory',
    'NewAppointmentTypesService',
    function (
      $scope,
      $uibModal,
      $routeParams,
      $location,
      $timeout,
      listHelper,
      patSecurityService,
      authZ,
      toastrFactory,
      staticData,
      modalFactory,
      localize,
      $filter,
      appointmentTypesFactory,
      confirmWindowFactory,
      newAppointmentTypesService
    ) {
      var ctrl = this;
      ctrl.$onInit = function () {
        $scope.loading = true;
        $scope.addingRow = false;
      };
      ctrl.$onInit();

      //#region breadcrumb

      $scope.dataForCrudOperation = {};
      $scope.dataForCrudOperation.DataHasChanged = false;
      $scope.dataForCrudOperation.BreadCrumbs = [
        {
          name: localize.getLocalizedString('Practice Settings'),
          path: '/BusinessCenter/PracticeSettings/',
          title: 'Practice Settings',
        },
        {
          name: localize.getLocalizedString('Appointment Types'),
          path: '/Schedule/AppointmentTypes/',
          title: 'Appointment Types',
        },
      ];

      //#endregion

      //#region auth

      $scope.authAccess = appointmentTypesFactory.Access();
      if (!$scope.authAccess.View) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-sch-sapttp-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path(_.escape('/'));
      }

      //#endregion

      //#region init

      $scope.appointmentTypes = [];
      $scope.appointmentTypeColors = [];

      $scope.providersLoaded = false;
      $scope.appointmentTypeMinutes = appointmentTypesFactory.AppointmentTypeMinutes();

      staticData.ProviderTypes().then(function (data) {
        $scope.providerTypes = $filter('filter')(data.Value, function (val) {
          return val.Id === 1 || val.Id === 2;
        });
        $scope.providersLoaded = true;
      });

      //#endregion

      //#region manage breadcrumbs

      // handle URL update for breadcrumbs
      $scope.changePageState = function (breadcrumb) {
        ctrl.currentBreadcrumb = breadcrumb;
        if (
          $scope.dataForCrudOperation.DataHasChanged &&
          $scope.dataForCrudOperation.BreadCrumbs.length > 2
        ) {
          modalFactory.CancelModal().then(ctrl.changePath);
        } else {
          ctrl.changePath();
        }
        document.title = breadcrumb.title;
      };

      // change URL
      ctrl.changePath = function () {
        if (
          ctrl.currentBreadcrumb.name ===
          localize.getLocalizedString('Appointment Types')
        ) {
          // Show the adjustment types
          $timeout(function () {
            ctrl.resetDataForCrud();
          }, 0);
        } else {
          // Jump to business-center page
          $location.url(_.escape(ctrl.currentBreadcrumb.path));
        }
      };

      $scope.getProviderType = function (typeId) {
        var providerTypesList = $scope.providerTypes;
        if (!_.isNil(providerTypesList)) {
          for (var i = 0; i < providerTypesList.length; i++) {
            if (providerTypesList[i].Id == typeId) {
              return providerTypesList[i].Name;
            }
          }
        }

        return '';
      };

      //#endregion

      //#region manage discount type list
      ctrl.manageListChanges = function (appointmentTypes) {
        $scope.appointmentTypes = appointmentTypes;
      };

      appointmentTypesFactory.ObserveTypes(ctrl.manageListChanges);

      //#endregion

      // This function is used for removing '{}' to address XSS vulnerabilities
      // Bug 480813
      function regExpression(val) {
        val = val.replace(/[{}]/g, '');
        return val;
      }

      //#region kendo events

      ctrl.onEdit = function (e) {
        // modify text on button and popup header
        var addText = localize.getLocalizedString('Add Appointment Type');
        var editText = localize.getLocalizedString('Edit Appointment Type');
        var durationText = localize.getLocalizedString(
          'Default Duration (Minutes) '
        );
        e.container
          .parent()
          .find('.k-window-title')
          .text(e.model.isNew() ? addText : editText);
        // modify save button text
        e.container
          .parent()
          .find('.k-grid-update')
          .text(localize.getLocalizedString('Save'));
        // add asterisk to required fields
        e.container
          .find('[name=Name]')
          .parent()
          .prev()
          .append('<span style="font-weight:bold"> *<span>');
        e.container
          .find('[name=PerformedByProviderTypeId]')
          .parent()
          .prev()
          .append('<span style="font-weight:bold"> *<span>');
        e.container
          .find('[name=DefaultDuration]')
          .parent()
          .prev()
          .append('<span style="font-weight:bold"> *<span>');
        e.container
          .find('[name=UsualAmount]')
          .parent()
          .prev()
          .append('<span style="font-weight:bold"> *<span>');
        // different header when editing
        e.container
          .find('[name=DefaultDuration]')
          .parent()
          .parent()
          .prev()
          .text('');
        e.container
          .find('[name=DefaultDuration]')
          .parent()
          .parent()
          .prev()
          .append(
            '<span style="font-weight:bold">' +
              _.escape(durationText) +
              '<span>'
          );
        // restrict negative numbers in default duration and amount
      };

      ctrl.onCancel = function (e) {
        ctrl.onAddRow(false);
      };

      ctrl.onAddRow = function (addingRow) {
        $scope.addingRow = addingRow;
        if (addingRow) {
          $('#createButton').addClass('k-state-disabled');
        } else {
          $('#createButton').removeClass('k-state-disabled');
        }
      };

      $scope.addRow = function () {
        if ($scope.addingRow === false) {
          $scope.appointmentTypesGrid.dataSource.filter(null);
          $scope.appointmentTypesGrid.addRow();
          ctrl.onAddRow(true);
        }
      };

      // holds event data during edit
      ctrl.setEventData = function (e) {
        $scope.eventData = e;
      };

      $scope.AppointmentTypeColorPickerEditor = function (container, options) {
        // initial color picker configuration
        $(
          "<input id='appointmentTypeColor' name='appointmentTypeColor' type='color' data-bind='value:" +
            _.escape(options.field) +
            "' />"
        )
          .appendTo(container)
          .kendoColorPicker({
            palette: 'basic',
            value: '#fff',
            buttons: false,
            tileSize: 16,
          });
        //$('<span style="padding:0 10px 0 30px"><a id="btnEditAppointmentColor" class="soar-link" ng-click="toggleAdvanced()">{{showAdvancedOption ? "Less" : "More" | i18n }}</a></span>').appendTo(container)
        $(
          '<span style="padding:0 10px 0 30px" id="btnEditAppointmentColor" >{{ "More" | i18n }}</span>'
        ).appendTo(container);

        $(
          "<input id='appointmentTypeColorAdvanced' name='appointmentTypeColorAdvanced' type='color' data-bind='value:" +
            _.escape(options.field) +
            "' />"
        )
          .appendTo(container)
          .kendoColorPicker({
            value: '#fff',
            preview: false,
            buttons: false,
          });
      };

      $scope.getUpdateNextPrevString = function (isUpdateNextPrev) {
        if (isUpdateNextPrev) {
          return 'Yes';
        } else {
          return 'No';
        }
      };

      $scope.usualAmountEditor = function (container, options) {
        // set an id
        var ctrlId = 'numTextBox-' + options.model.uid;
        var input = $(
          '<input id="' +
            _.escape(ctrlId) +
            '" name="' +
            _.escape(options.field) +
            '" />'
        );
        input.attr('UsualAmount', options.field);
        // append it to the container
        input.appendTo(container);
        input.kendoNumericTextBox({
          min: 1,
          step: 1,
        });
      };

      // Check box for update next Preventive care
      $scope.UpdatesNextPreventiveAppointmentDateEditor = function (
        container,
        options
      ) {
        // set an id
        var ctrlId = 'chkBox-' + options.model.uid;
        var chkBox = $(
          '<input id="' +
            _.escape(ctrlId) +
            '" name="' +
            _.escape(options.field) +
            '"></checkbox>'
        );
        chkBox.attr('UpdatesNextPreventiveAppointmentDate', options.field);
        chkBox.attr('type', 'checkbox');
        chkBox.attr(
          'checked',
          options.model.UpdatesNextPreventiveAppointmentDate
        );
        chkBox.attr(
          'value',
          options.model.UpdatesNextPreventiveAppointmentDate
        );
        // append it to the container
        chkBox.appendTo(container);
      };

      $scope.providerTypeDropDownEditor = function (container, options) {
        // set an id
        var ctrlId = 'dtSelect-' + options.model.uid;
        // Instantiate the selectbox
        var input = $(
          '<input id="' +
            _.escape(ctrlId) +
            '" name="' +
            _.escape(options.field) +
            '" />'
        );
        // set its name to the field to which the column is bound
        input.attr('PerformedByProviderTypeId', options.field);
        // append it to the container
        input.appendTo(container);
        input.kendoDropDownList({
          optionLabel: localize.getLocalizedString('Performed by'),
          dataTextField: 'Name',
          dataValueField: 'Id',
          dataSource: $scope.providerTypes,
        });
      };

      $scope.durationDropDownEditor = function (container, options) {
        // set an id
        var ctrlId = 'dtSelect-' + options.model.uid;
        // Instantiate the selectbox
        var input = $(
          '<input id="' +
            _.escape(ctrlId) +
            '" name="' +
            _.escape(options.field) +
            '" />'
        );
        // set its name to the field to which the column is bound
        input.attr('DefaultDuration', options.field);
        // append it to the container
        input.appendTo(container);
        input.kendoDropDownList({
          dataSource: $scope.appointmentTypeMinutes,
        });
      };

      $scope.confirmOpt = {
        visible: false,
        resizable: false,
        scrollable: false,
        iframe: false,
        appendTo: 'body',
        actions: [],
      };

      //#endregion

      // returns true if AppointmentType Name is same as existing Name
      var isDuplicate = function (appointmentType, name) {
        var item = newAppointmentTypesService.findByName(name);
        if (
          item === null ||
          item.AppointmentTypeId === appointmentType.AppointmentTypeId
        ) {
          return false;
        }
        return true;
      };

      ctrl.onDataBound = function (e) {
        var message = authZ.generateTitleMessage();
        var deleteBtn =
          '<button class="k-button k-button-icontext k-grid-customDelete disabled" disabled="disabled" title="' +
          _.escape(message) +
          '"><span class="k-icon k-i-delete"></span></button>';
        var editBtn =
          '<button class="k-button k-button-icontext k-grid-edit disabled" disabled="disabled" title="' +
          _.escape(message) +
          '"><span class="k-icon k-i-edit"></span></button>';
        if ($scope.appointmentTypesGrid.table[0]) {
          $scope.appointmentTypesGrid.table[0].id =
            'appointmentTypesGrid_table';
        }
        angular.forEach(
          $scope.appointmentTypesGrid.items(),
          function (item, $index) {
            var i = $index;
            item.id = 'appointmentTypesGrid_row_' + i;
            angular.forEach(item.childNodes, function (td) {
              td.id = td.textContent + '_td_' + i;
              if (td.className === 'k-grid-commands') {
                angular.forEach(td.childNodes, function (button) {
                  if (button.className.indexOf('k-grid-customDelete') !== -1) {
                    button.id = 'btn_delete_' + i;
                  } else if (button.className.indexOf('k-grid-edit') !== -1) {
                    button.id = 'btn_edit_' + i;
                  }
                });
              }
            });
            if (!$scope.authAccess.Delete) {
              angular
                .element(item)
                .find('.k-grid-customDelete')
                .replaceWith(deleteBtn);
            }
            if (!$scope.authAccess.Edit) {
              angular.element(item).find('.k-grid-edit').replaceWith(editBtn);
            }
          }
        );
      };

      //#region Kendo grid configuration

      $scope.appointmentTypesOptions = {
        sortable: true,
        pageable: false,
        dataBound: ctrl.onDataBound,
        ignoreCase: true,
        // datasource configuration
        dataSource: new kendo.data.DataSource({
          autoSync: false,
          //default sort
          sort: {
            field: 'Name',
            dir: 'asc',
          },
          schema: {
            model: {
              id: 'AppointmentTypeId',
              fields: {
                Name: {
                  type: 'string',
                  validation: {
                    required: {
                      message: localize.getLocalizedString('Name is required.'),
                    },
                    namevalidation: function (input) {
                      //validate that removal of {{}} will make name 0 characters
                      if (
                        input.is("[name='Name']") &&
                        input.val() !== '' &&
                        regExpression(input.val()) === ''
                      ) {
                        input.attr(
                          'data-namevalidation-msg',
                          localize.getLocalizedString(
                            'Name character cleaning will result in a Name less than 1 character.'
                          )
                        );
                        return false;
                      }
                      // validate length
                      if (
                        input.is("[name='Name']") &&
                        input.val().length > 50
                      ) {
                        input.attr(
                          'data-namevalidation-msg',
                          localize.getLocalizedString(
                            'Name must be 1 to 50 characters.'
                          )
                        );
                        return false;
                      }
                      // validate not a dupe
                      if (input.is("[name='Name']") && input.val() !== '') {
                        // get the row data for the duplicate check
                        var appointmentType = $(input)
                          .closest('.k-popup-edit-form')
                          .data('kendoEditable').options.model;
                        // message for duplicate description
                        input.attr(
                          'data-namevalidation-msg',
                          localize.getLocalizedString(
                            'An {0} with this name already exists.',
                            ['appointment type']
                          )
                        );
                        return !isDuplicate(appointmentType, input.val());
                      }
                      return true;
                    },
                  },
                },
                AppointmentTypeColor: {
                  type: 'string',
                  defaultValue: '#ffffff',
                  validation: {
                    required: {
                      message: localize.getLocalizedString(
                        'Appointment background color is required.'
                      ),
                    },
                  },
                },
                FontColor: {
                  type: 'string',
                  defaultValue: '#000000',
                  validation: {
                    required: {
                      message: localize.getLocalizedString(
                        'Font color is required.'
                      ),
                    },
                  },
                },
                PerformedByProviderTypeId: {
                  type: 'string',
                },
                DefaultDuration: {
                  type: 'number',
                  defaultValue: 5,
                },
                UsualAmount: {
                  type: 'number',
                  defaultValue: 0,
                  validation: {
                    usualamountvalidation: function (input) {
                      // validate has selected usual amount
                      if (input.is("[name='UsualAmount']") && input.val() < 0) {
                        input.attr(
                          'data-usualamountvalidation-msg',
                          localize.getLocalizedString(
                            'Usual amount must be positive.'
                          )
                        );
                        return false;
                      }
                      return true;
                    },
                  },
                },
                UpdatesNextPreventiveAppointmentDate: {
                  type: 'boolean',
                  defaultValue: false,
                },
              },
            },
          },
          transport: {
            create: function (options) {
              // Bug 480813 -  using _.escape() and a regexpression
              // To avoid XSS vulnerabilities.
              options.data.Name = _.escape(regExpression(options.data.Name));
              options.data.Name = _.unescape(options.data.Name);
              // kendo dropdown intermittently returns the entire object rather than the Id
              options.data.PerformedByProviderTypeId =
                options.data.PerformedByProviderTypeId &&
                typeof options.data.PerformedByProviderTypeId === 'object'
                  ? options.data.PerformedByProviderTypeId.Id
                  : options.data.PerformedByProviderTypeId;
              appointmentTypesFactory
                .Create(options.data, $scope.appointmentTypes)
                .then(function (data) {
                  if (data.Value.PerformedByProviderTypeId === null) {
                    data.Value.PerformedByProviderTypeId = '';
                  }
                  // this is put in place to ensure the new storage location updates when we add a new appointment type
                  let result = newAppointmentTypesService.addAppointmentType(
                    data.Value
                  );
                  options.success(result);
                  ctrl.onAddRow(false);
                });
            },
            read: function (options) {
              if ($scope.loading === true) {
                appointmentTypesFactory
                  .AppointmentTypes()
                  .then(function (data) {
                    $scope.appointmentTypes = data.Value;
                    $scope.appointmentTypes.forEach(function (aptType) {
                      if (aptType.PerformedByProviderTypeId === null) {
                        aptType.PerformedByProviderTypeId = '';
                      }
                    });
                    // load the list used else where when this page starts up.
                    $scope.appointmentTypes = newAppointmentTypesService.setAppointmentTypes(
                      $scope.appointmentTypes
                    );
                    options.success($scope.appointmentTypes);
                    $scope.loading = false;
                  });
              } else {
                options.success($scope.appointmentTypes);
              }
            },
            update: function (options) {
              // Bug 480813 -  using _.escape() and a regexpression
              // To avoid XSS vulnerabilities.
              options.data.Name = _.escape(regExpression(options.data.Name));
              options.data.Name = _.unescape(options.data.Name);
              // kendo dropdown intermittently returns the entire object rather than the Id
              options.data.PerformedByProviderTypeId =
                options.data.PerformedByProviderTypeId &&
                typeof options.data.PerformedByProviderTypeId === 'object'
                  ? options.data.PerformedByProviderTypeId.Id
                  : options.data.PerformedByProviderTypeId;
              appointmentTypesFactory
                .Update(options.data, $scope.appointmentTypes)
                .then(function (data) {
                  if (data.Value.PerformedByProviderTypeId === null) {
                    data.Value.PerformedByProviderTypeId = '';
                  }
                  let type = newAppointmentTypesService.updateAppointmentType(
                    data.Value
                  );
                  options.success(type);
                });
            },
            destroy: function (options) {
              appointmentTypesFactory
                .Delete(options.data, $scope.appointmentTypes)
                .then(function (data) {
                  newAppointmentTypesService.removeAppointmentType(
                    options.data
                  );
                  options.success(data.Value);
                });
            },
          },
        }),
        filterable: false,
        editable: 'popup',
        edit: ctrl.onEdit,
        cancel: ctrl.onCancel,
        toolbar: [
          {
            name: 'create',
            template: kendo.template(
              '<a id="createButton" ng-click="addRow();" check-auth-z="{{ !authAccess.Create }}" class="btn btn-primary" icon="fa-plus">' +
                localize.getLocalizedString('Add Appointment Type') +
                '</a>'
            ),
          },
        ],
        columns: [
          {
            field: 'Name',
            title: localize.getLocalizedString('Name'),
          },
          {
            field: 'AppointmentTypeColor',
            title: localize.getLocalizedString('Appointment Type Color'),
            editor: $scope.AppointmentTypeColorPickerEditor,
            template: kendo.template(
              "<span style = ' padding:4px; background-color: #: AppointmentTypeColor #; color: #: FontColor #'>Preview Text</span>"
            ),
          },
          {
            field: 'FontColor',
            hidden: true,
            title: localize.getLocalizedString('Font Color'),
            editor: $scope.AppointmentTypeColorPickerEditor,
          },
          {
            field: 'PerformedByProviderTypeId',
            title: localize.getLocalizedString('Performed By'),
            template: kendo.template(
              '<span>{{ getProviderType(dataItem.PerformedByProviderTypeId) }}</span>'
            ),
            // Add dropdown editor for popup
            editor: $scope.providerTypeDropDownEditor,
          },
          {
            field: 'DefaultDuration',
            title: localize.getLocalizedString('Default Duration (H:MM)'),
            type: 'number',
            editor: $scope.durationDropDownEditor,
            template: kendo.template(
              '<span>{{dataItem.FormattedDuration}}</span>'
            ),
          },
          {
            field: 'UsualAmount',
            title: localize.getLocalizedString('Usual Amount'),
            type: 'number',
            editor: $scope.usualAmountEditor,
            template: kendo.template(
              '#:kendo.format("{0:c}", UsualAmount ? UsualAmount : 0)#'
            ),
          },
          {
            field: 'UpdatesNextPreventiveAppointmentDate',
            title: localize.getLocalizedString('Updates Next Prev Appt'),
            type: 'boolean',
            editor: $scope.UpdatesNextPreventiveAppointmentDateEditor,
            template: kendo.template(
              '<span>{{getUpdateNextPrevString(dataItem.UpdatesNextPreventiveAppointmentDate)}}</span'
            ),
          },
          {
            attributes: { class: 'k-grid-commands' },
            command: [
              //},
              {
                name: 'customDelete',
                text: '',
                iconClass: 'fas fa-trash-alt',
                click: function (e) {
                  e.preventDefault();
                  console.log(e);
                  if ($scope.authAccess.Delete) {
                    var row = $scope.appointmentTypesGrid.dataItem(
                      $(e.target).closest('tr')
                    );
                    var msg = localize.getLocalizedString(
                      'Deleting {0} will remove it from all associated appointments and schedule templates.',
                      [{ skip: _.unescape(row.Name) }]
                    );
                    confirmWindowFactory
                      .Open(e, row.uid, $scope.confirm, msg, 'confirm')
                      .then(function (res) {
                        if (res === 'delete') {
                          $scope.appointmentTypesGrid.dataSource.remove(row);
                          $scope.appointmentTypesGrid.dataSource.sync();
                        }
                      });
                  }
                },
              },
              {
                name: 'edit',
                iconClass: 'fas fa-pencil-alt',
                text: { update: 'Save', cancel: 'Cancel', edit: '' },
                click: function (e) {
                  ctrl.setEventData(e);
                  if (!$scope.authAccess.Edit) {
                    e.preventDefault();
                  }
                },
              },
            ],
            title: '',
            width: '10%',
          },
        ],
      };

      //#endregion
    },
  ]
);
