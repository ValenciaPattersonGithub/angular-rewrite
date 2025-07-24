'use strict';

angular.module('Soar.BusinessCenter').controller('FormsTemplatesController', [
  '$scope',
  '$location',
  'DocumentsKendoFactory',
  'referenceDataService',
  'locationService',
  'localize',
  'PatientServices',
  'toastrFactory',
  '$filter',
  '$http',
  '$routeParams',
  'patSecurityService',
  '$timeout',
  'KendoGridFactory',
  'MedicalHistoryFactory',
  'ListHelper',
  '$q',
  'CommunicationTemplateDataPointsService',
  'CommunicationTemplateService',
  'ModalFactory',
  'CommunicationTemplateFactory',
  '$rootScope',
  function (
    $scope,
    $location,
    documentsKendoFactory,
    referenceDataService,
    locationService,
    localize,
    patientServices,
    toastrFactory,
    $filter,
    $http,
    $routeParams,
    patSecurityService,
    $timeout,
    kendoGridFactory,
    medicalHistoryFactory,
    listHelper,
    $q,
    communicationTemplateDataPointsService,
    communicationTemplateService,
    modalFactory,
    communicationTemplateFactory,
    $rootScope
  ) {
    var ctrl = this;

    // #region Authorization

    ctrl.getAccess = function () {
      $scope.access = medicalHistoryFactory.access();
      if (!$scope.access.View) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-per-perhst-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };
    ctrl.getAccess();

    //#endregion

    // #region Initial Values

    $scope.selectedTemplate = {};

    ctrl.$onInit = function () {
      $scope.emptyGrid = false;
      $scope.populateGrid(null);
      $scope.itemsQueuedForDownload = [];
      $scope.activeTab = true;

      ctrl.getLocations();

      $scope.showGrid = false;
      $scope.showEditor = false;

      $scope.groups = [
        { id: 1, name: 'Account' },
        { id: 2, name: 'Appointments' },
        { id: 3, name: 'Miscellaneous' },
        { id: 4, name: 'Preventive Care' },
        { id: 5, name: 'Treatment Plans' },
      ];

      $scope.groups.forEach(function (item) {
        var isOpened = false;
        Object.defineProperty(item, 'IsOpened', {
          get: function () {
            return isOpened;
          },
          set: function (newValue) {
            isOpened = newValue;
            if (isOpened) {
              $scope.getGridData(item, '');
            }
          },
        });
      });

      $scope.mediaTypes = [
        { Id: 0, Name: 'Create Template' },
        //{ Id: 3, Name: "Email" },
        //{ Id: 2, Name: "Text" },
        { Id: 4, Name: 'Postcards' },
        { Id: 1, Name: 'US Mail' },
      ];

      //$scope.categoriesCreate =[{ Id: 1, Name : "US Mail"}];

      $scope.itemSelected = $scope.mediaTypes[0];

      /*NOTE viewHtml removed from options because of cross scripting vulnerabilities */
      $scope.noteToolOptions = [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'insertUnorderedList',
        'insertOrderedList',
        'indent',
        'outdent',
        'createLink',
        'unlink',
        'insertImage',
        'insertFile',
        'subscript',
        'superscript',
        'createTable',
        'addRowAbove',
        'addRowBelow',
        'addColumnLeft',
        'addColumnRight',
        'deleteRow',
        'deleteColumn',
        'formatting',
        'cleanFormatting',
        'fontName',
        'fontSize',
        'foreColor',
        'backColor',
        {
          name: 'Save-Cancel',
          tooltip: 'Cancel',
          template: '<div>&nbsp;</div>',
        },
      ];

      $scope.dataMergePoints = {};

      ctrl.getTemplateDataPoints();
    };

    // #endregion

    //#region Locations

    // getting the user's current location from service, aligning the properties
    ctrl.getCurrentLocation = function () {
      var currentLocation = locationService.getCurrentLocation();
      if (currentLocation) {
        currentLocation.NameLine1 = currentLocation.name;
        currentLocation.LocationId = currentLocation.id;
      }
      return currentLocation;
    };

    // calling the api
    ctrl.getLocations = function () {
      ctrl.locationsGetSuccess(
        referenceDataService.get(referenceDataService.entityNames.locations)
      );
    };

    // success handler, instantiating locationNav with response, inserting all locations option, etc.
    ctrl.locationsGetSuccess = function (locations) {
      $timeout(function () {
        $scope.currentLocation = ctrl.getCurrentLocation();
        $scope.locationNav = {
          isOpen: false,
          activeLocation: $scope.currentLocation,
        };
        if (locations) {
          $scope.locationNav.locations = locations;
        }
        $scope.locationNav.locations.unshift({
          NameLine1:
            localize.getLocalizedString('All Locations') +
            ' (' +
            $scope.locationNav.locations.length +
            ')',
          LocationId: 'all',
        });
      }, 0);
    };

    ctrl.toggleChevron = function (e) {
      $(e.target)
        .prev('.panel-heading')
        .find('i.indicator')
        .toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
    };

    $scope.$watch('locationNav.activeLocation.LocationId', function (nv, ov) {
      if (ov && nv != ov && nv != 'all') {
        angular.forEach($scope.patients, function (patient) {
          if (patient.PreferredLocation != nv) {
            patient.open = false;
          }
        });
        var patient = $filter('filter')($scope.patients, {
          PatientId: $scope.currentPatient,
          PreferredLocation: nv,
        });
        if (!patient || patient.length == 0) {
          $scope.currentPatient = null;
          $scope.activeDir = {};
          $scope.documentList = {};
          $scope.populateGrid(null);
        }
      }
    });

    // #endregion

    // #region DataPoints
    ctrl.getTemplateDataPoints = function () {
      communicationTemplateDataPointsService.get(
        ctrl.templateDataPointsGetSuccess,
        ctrl.templateDataPointsGetFailure
      );
    };

    ctrl.templateDataPointsGetSuccess = function (res) {
      $scope.grouping = 'Group';
      if (res && res.Value) {
        $scope.dataMergePoints = res.Value;
      }
      $scope.dataMergePoints = _.groupBy(
        $scope.dataMergePoints,
        $scope.grouping
      );
    };

    ctrl.noEvent = true;

    $scope.isEventReady = function () {
      if (ctrl.noEvent) {
        _.each(document.getElementsByTagName('iframe'), function (obj) {
          if (obj.className === 'k-content') {
            var iframeDoc = obj.contentWindow.document;
          }
        });
        /* eslint-disable no-undef */
        $('.draggablenode').each(function () {
          $(this).kendoDraggable({
            cursorOffset: {
              top: 10,
              left: 10,
            },
            hint: function (element) {
              var cloned = $(element).clone();
              $(cloned).addClass('k-header k-drag-clue');
              return cloned;
            },
            dragstart: treenodeDragstart,
            dragend: treenodeDrop,
            drag: treenodeDrag,
          });
        });
        /* eslint-enable no-undef */

        ctrl.noEvent = false;
      }
    };

    $scope.setupDrag = function () {
      //$(event.currentTarget).kendoDraggable({
      //    cursorOffset: {
      //        top: 10,
      //        left: 10
      //    },
      //    hint: function (element) {
      //        var cloned = $(element).clone();
      //        $(cloned).addClass("k-header k-drag-clue");
      //        return cloned;
      //    },
      //    dragstart: treenodeDragstart,
      //    dragend: treenodeDrop,
      //    drag: treenodeDrag
      //});
    };

    ctrl.templateDataPointsGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} {1}', [
          'Data Points',
          'failed to load.',
        ]),
        localize.getLocalizedString('Server Error')
      );
    };
    // #endregion

    // #region Create Communication Templates
    $scope.selectedMediaTypeId = 0;
    ctrl.toggleKendoTools = function (mediaId) {
      $scope.selectedMediaTypeId = mediaId;
      if (mediaId === 1 || mediaId === 4) {
        $('#editorLocker').css('z-index', 0);
        $('a.k-tool').removeClass('tool-disabled');
        $('span.k-editor-widget').removeClass('tool-disabled');
        $timeout(function () {
          $('#inpTemplateName').focus();
        }, 500);
      }
    };

    $scope.onMediaTypeChange = function (mediaType) {
      if (mediaType.Id !== 0) {
        $scope.selectedTemplate.activeGroup =
          $scope.activeGroup == null ? $scope.groups[1] : $scope.activeGroup;
        $scope.selectedTemplate.activeMediaType = mediaType;
        if ($scope.selectedNote) {
          $scope.selectedNote.TemplateName = null;
          $scope.selectedNote.Note = '';
        } else {
          $scope.selectedNote = {};
          $scope.selectedNote.Note = '';
        }
        $scope.dataChanged = false;
        $scope.adding = true;

        $scope.validNote = false;
        $scope.validGroup = false;
        $scope.duplicateTemplate = false;
        $scope.noTemplateName = false;
        $scope.duplicateTemplateName = false;
        $scope.noGroup = false;

        $scope.showEditor = true;
        $scope.showGrid = false;
        $scope.editMode = true;

        $scope.selectedMediaTypeId = mediaType.Id;
      }
      ctrl.toggleKendoTools(mediaType.Id);
    };
      
      function removeXssTags(content) {
          content = content.replace(/<svg[\s\S]*?>/g, '');
          content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
          content = content.replace(/<[/]?h1>/g, '');
          content = content.replace(/<img[^>]*>/g, '');
          return content;
      }

    ctrl.previewPostcardSuccess = function (res) {
      $scope.postcardDto = res.Value;
      var newTab = window.open();

      var style =
        '<style>' +
        'body {background-color: #dddddd;padding: 0;border: 0;margin: 0;padding-top: 10px; font-family: "Open Sans", sans-serif;}' +
        '.page {background-color: #ffffff;width: 11in;height: 8.5in;margin: .25in auto;outline: 1px dashed #888888;}' +
        '.page-content {}' +
        '.page-content::after {content: " ";display: block;height: 0;clear: both;}' +
        '.postcard {width: 5.5in;height: 4.25in;float: left;overflow: hidden;outline: 1px dotted #888888;}' +
        '.postcard-content {position: relative;padding-top: 1.525in;}' +
        '.postcard-message {width: 2.75in;float: left;padding-top: .25in;padding-left: .25in;max-height: 380px;overflow: hidden;min-height: 250px;}' +
        '.postcard-address {float: left;padding-top: .25in;padding-left: .5in;width: 180px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;}' +
        '@media screen {.postcard-stamp {width: .87in;height: .979in;position: absolute;top: .125in;right: .125in;outline: 4px double #888888;}}' +
        '@media print {.body {background-color: transparent;}' +
        '.page {background-color: transparent;outline: none;page-break-after: always;height: auto;margin: 0;}' +
        '.postcard {outline: none;height: 4.20in}}' +
        '</style>';
      var divMessage =
        '<div class="postcard-message">' +
          removeXssTags($scope.postcardDto.Content) +
        '</div>';
      var pcPatientName = _.escape($scope.postcardDto.PatientName);
      var pcAddressLine1 = '<br />' + _.escape($scope.postcardDto.AddressLine1);
      var pcLocationCityStateZip =
        '<br />' + _.escape($scope.postcardDto.LocationCityStateZip);

      var divPostcard =
        '<div class="postcard">' +
        divMessage +
        '<div class="postcard-content">' +
        '    <div class="postcard-stamp"></div>' +
        '    <div class="postcard-address">' +
        pcPatientName +
        pcAddressLine1 +
        pcLocationCityStateZip +
        '    </div>' +
        '</div>' +
        '</div>';

      var outputHtml =
        '<html>' +
        '<head>' +
        '<title>Postcard Preview</title>' +
        style +
        '</head>' +
        '<body>' +
        '<div class="page"><div class="page-content">' +
        divPostcard +
        divPostcard +
        divPostcard +
        divPostcard +
        '</div></div>' +
        '</body></html>';

      newTab.document.write(outputHtml);
      newTab.document.title = 'Postcard Preview';
      newTab.document.close();
    };
    ctrl.previewPostcardFailure = function (res) {
      toastrFactory.error('Failed to preview postcard', 'Error');
    };

    ctrl.postcardDto = {
      PatientName: '',
      AddressLine1: '',
      AddressLine2: '',
      LocationCityStateZip: '',
      Content: '',
    };

    $scope.previewPostcard = function () {
      ctrl.postcardDto.Content = $scope.selectedNote.Note;
      communicationTemplateService
        .previewPostcard(ctrl.postcardDto)
        .$promise.then(
          ctrl.previewPostcardSuccess,
          ctrl.previewPostcardFailure
        );
    };

    $scope.previewPostcard1 = function () {
      var newTab = window.open();

      var style =
        '<style>' +
        '.body {background-color: #dddddd;padding: 0;border: 0;margin: 0;padding-top: 10px;}' +
        '.page {background-color: #ffffff;width: 11in;height: 8.5in;margin: .25in auto;outline: 1px dashed #888888;}' +
        '.page-content {}' +
        '.page-content::after {content: " ";display: block;height: 0;clear: both;}' +
        '.postcard {width: 5.5in;height: 4.25in;float: left;overflow: hidden;outline: 1px dotted #888888;}' +
        '.postcard-content {position: relative;padding-top: 1.525in;}' +
        '.postcard-message {width: 2.75in;float: left;padding-top: .25in;padding-left: .25in;max-height: 390px;overflow: hidden;min-height: 250px;}' +
        '.postcard-address {float: left;padding-top: .25in;padding-left: .5in;width: 250px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;}' +
        '@media screen {.postcard-stamp {width: .87in;height: .979in;position: absolute;top: .125in;right: .125in;outline: 4px double #888888;}}' +
        '@media print {.body {background-color: transparent;}' +
        '.page {background-color: transparent;outline: none;page-break-after: always;height: auto;margin: 0;}' +
        '.postcard {outline: none;}}' +
        '</style>';
      var divMessage =
        '<div class="postcard-message">' +
          $scope.postcardDto.Content +
        '</div>';
      var pcPatientName = _.escape($scope.postcardDto.PatientName);
      var pcAddressLine1 = '<br />' + _.escape($scope.postcardDto.AddressLine1);
      var pcLocationCityStateZip =
        '<br />' + _.escape($scope.postcardDto.LocationCityStateZip);

      var outputHtml =
        '<html>' +
        '<head>' +
        '<title>Postcard Preview</title>' +
        style +
        '</head>' +
        '<body>' +
        '<div class="page"><div class="page-content"><div class="postcard">' +
        divMessage +
        '<div class="postcard-content">' +
        '    <div class="postcard-stamp"></div>' +
        '    <div class="postcard-address">' +
        pcPatientName +
        pcAddressLine1 +
        pcLocationCityStateZip +
        '    </div>' +
        '</div>' +
        '</div></div></div>' +
        '</body></html>';

      newTab.document.write(outputHtml);
      newTab.document.title = 'Postcard Preview';
      newTab.document.close();
    };

    $scope.noTemplateName = false;
    $scope.noGroup = false;
    $scope.duplicateTemplateName = false;
    ctrl.origGroupId = 0;
    ctrl.origMediaTypeId = 0;
    $scope.save = function () {
      $scope.noTemplateName = false;
      $scope.noGroup = false;
      $scope.duplicateTemplateName = false;
      $scope.validNote = true;

      if ($scope.selectedNote) {
        if (
          !$scope.selectedNote.TemplateName ||
          $scope.selectedNote.TemplateName === ''
        ) {
          $scope.noTemplateName = true;
          // $scope.duplicateTemplateName = true;
          $scope.validNote = false;
        }
      } else {
        $scope.noTemplateName = true;
        $scope.validNote = false;
      }

      if (!$scope.selectedTemplate.activeGroup) {
        $scope.noGroup = true;
        $scope.validNote = false;
      }

      if ($scope.validNote) {
        $scope.validNote = true;
        var template = {
          //CommunicationTemplateId:  20,
          GroupId: $scope.selectedTemplate.activeGroup.id,
          MediaTypeId: $scope.selectedTemplate.activeMediaType.Id,
          TemplateName: $scope.selectedNote.TemplateName,
          Note: $scope.selectedNote.Note,
        };
        //$scope.templateName = typeof $scope.content == 'undefined' ? '' : $scope.content.TemplateName;

        if ($scope.adding) {
          // checks if the template name already exists
          //if ($scope.commTemplates.filter(
          //    function (item) {
          //         return item.TemplateName.toLowerCase() == $scope.selectedNote.TemplateName.toLowerCase()
          //    }).length > 0)
          //{
          //    $scope.duplicateTemplate = true;
          //    $scope.duplicateTemplateName = true;
          //}
          //else
          //communicationTemplateService.create(template)
          //    .$promise.then(ctrl.saveTemplateSuccess, ctrl.saveTemplateFailure);
          communicationTemplateService
            .create(template)
            .$promise.then(ctrl.saveTemplateSuccess, ctrl.saveTemplateFailure);
        } else {
          //if ($scope.commTemplates.filter(
          //    function (item) {
          //         return (item.TemplateName.toLowerCase() == $scope.selectedNote.TemplateName.toLowerCase() && item.CommunicationTemplateId != $scope.selectedNote.CommunicationTemplateId)
          //}).length > 0) {
          //    $scope.duplicateTemplate = true;
          //    $scope.duplicateTemplateName = true;
          //}
          var isDuplicate = false;

          //var foundItem = $filter('filter')($scope.commTemplates, { TemplateName: $scope.selectedNote.TemplateName }, true);

          //if (foundItem.length === 0) {
          //    isDuplicate = false;
          //}

          //if (foundItem.length === 1 && foundItem[0].CommunicationTemplateId === $scope.selectedNote.CommunicationTemplateId) {
          //    isDuplicate = false;
          //}

          if (isDuplicate) {
            $scope.duplicateTemplate = true;
            $scope.duplicateTemplateName = true;
          } else {
            ctrl.origGroupId = $scope.selectedNote.GroupId;
            ctrl.origMediaTypeId = $scope.selectedNote.MediaTypeId;
            $scope.selectedNote.GroupId =
              $scope.selectedTemplate.activeGroup.id;
            $scope.selectedNote.MediaTypeId =
              $scope.selectedTemplate.activeMediaType.Id;

            communicationTemplateService
              .updateTemplateForm($scope.selectedNote)
              .$promise.then(
                ctrl.saveTemplateSuccess,
                ctrl.saveTemplateFailure
              );
          }
        }
      }

      if (!$scope.validNote || $scope.duplicateTemplateName) {
        $scope.errorResult = [
          { name: 'noTemplateName', value: $scope.noTemplateName },
          { name: 'noGroup', value: $scope.noGroup },
          {
            name: 'duplicateTemplateName',
            value: $scope.duplicateTemplateName,
          },
        ];
        $rootScope.$broadcast('callTemplateValidator', $scope.errorResult);
      }
    };

    ctrl.saveTemplateSuccess = function () {
      ctrl.origGroupId = 0;
      ctrl.origMediaTypeId = 0;

      $scope.itemSelected = $scope.mediaTypes[0];
      ctrl.getCommunicationTemplates();
      $scope.showEditor = false;
      $scope.dataChanged = false;
      $scope.adding = false;
      $scope.validNote = false;
      $scope.validGroup = false;
      $scope.duplicateTemplate = false;
      $scope.duplicateTemplateName = false;
      $scope.noTemplateName = false;
      $scope.noGroup = false;
      $scope.selectedNote.TemplateName = null;
      $scope.selectedNote.Note = null;
      toastrFactory.success('Saved template', 'Success');

      //cleare validator
      $scope.errorResult = [
        { name: 'noTemplateName', value: false },
        { name: 'noGroup', value: false },
        { name: 'duplicateTemplateName', value: $scope.duplicateTemplateName },
      ];
      $rootScope.$broadcast('callTemplateValidator', $scope.errorResult);
    };

    ctrl.saveTemplateFailure = function (res) {
      $scope.selectedNote.GroupId = ctrl.origGroupId;
      $scope.selectedNote.MediaTypeId = ctrl.origMediaTypeId;

      var foundItem = $filter('filter')(
        res.data.InvalidProperties,
        { PropertyName: 'TemplateNameMustUnique' },
        true
      );
      if (foundItem) {
        if (foundItem.length > 0) {
          $scope.duplicateTemplate = true;
          $scope.duplicateTemplateName = true;
        }
      }

      if (res.status && res.status === 403) {
        toastrFactory.error(res.data.Message, 'Error');
      } else {
        if (
          res.data.InvalidProperties[0].ValidationMessage ===
          'Template already exist'
        ) {
          toastrFactory.error(
            res.data.InvalidProperties[0].ValidationMessage + 's',
            'Error'
          );
        } else {
          toastrFactory.error(
            res.data.InvalidProperties[0].ValidationMessage,
            'Error'
          );
        }
      }

      //cleare validator
      $scope.errorResult = [
        { name: 'noTemplateName', value: false },
        { name: 'noGroup', value: false },
        { name: 'duplicateTemplateName', value: $scope.duplicateTemplateName },
      ];
      $rootScope.$broadcast('callTemplateValidator', $scope.errorResult);
    };

    $scope.cancel = function () {
      if ($scope.dataChanged) {
        modalFactory.CancelModal().then(ctrl.confirmCancel);
      } else {
        ctrl.confirmCancel();
      }
    };

    $scope.$on('setdataChanged', function (events, args) {
      $scope.dataChanged = true;

      ctrl.toggleKendoTools(args);
    });
    // validate the content

    // process cancel confirmation
    ctrl.confirmCancel = function () {
      $scope.dataChanged = false;
      $scope.itemSelected = $scope.mediaTypes[0];
      $scope.showEditor = false;
      $scope.adding = false;
      //$scope.selectedNote.TemplateName = null;
      if ($scope.selectedNote && $scope.uneditedNote) {
        $scope.selectedNote.TemplateName = $scope.uneditedNote.TemplateName;
        $scope.selectedNote.Note = $scope.uneditedNote.Note;
      }
      $scope.duplicateTemplate = false;
      $scope.duplicateTemplateName = false;
      if (typeof $scope.activeMediaType != 'undefined') {
        $scope.showGrid = true;
      }

      //clear validator
      $scope.errorResult = [
        { name: 'noTemplateName', value: false },
        { name: 'noGroup', value: false },
        { name: 'duplicateTemplateName', value: $scope.duplicateTemplateName },
      ];

      $rootScope.$broadcast('callTemplateValidator', $scope.errorResult);
    };

    // #endregion

    // #region Get Communication Templates
    ctrl.getCommunicationTemplates = function () {
      communicationTemplateService
        .get({})
        .$promise.then(
          ctrl.getCommunicationTemplatesSuccess,
          ctrl.getCommunicationTemplatesFailure
        );
    };

    ctrl.getCommunicationTemplatesSuccess = function (res) {
      $scope.commTemplates = res.Value;
      if (typeof $scope.activeMediaType !== 'undefined') {
        $scope.getGridData($scope.activeGroup, $scope.activeMediaType.Name);
      }
    };

    ctrl.getCommunicationTemplatesFailure = function () {
      toastrFactory.error(
        'Failed to retrieve communication templates',
        'Error'
      );
    };

    ctrl.getCommunicationTemplates();

    // #endregion

    // #region Patients

    // updates the count displayed by the group name
    ctrl.updateCounts = function (allPatientDocs) {
      // clearing left-over counts
      $scope.clinicalCount = 0;
      $scope.accountCount = 0;
      $scope.insuranceCount = 0;
      angular.forEach($scope.documentGroupsList, function (group) {
        group.$$Count = 0;
      });
      angular.forEach(allPatientDocs, function (doc) {
        var group = listHelper.findItemByFieldValue(
          $scope.documentGroupsList,
          'DocumentGroupId',
          doc.DocumentGroupId
        );
        if (group) {
          group.$$Count++;
          switch (group.Description) {
            case 'Account':
              $scope.accountCount++;
              break;
            case 'Insurance':
              $scope.insuranceCount++;
              break;
            default:
              $scope.clinicalCount++;
              break;
          }
        }
      });
    };

    // gets a pristine version of the medical history form for adding answers
    $scope.getNewMedicalHistoryForm = function () {
      var medicalHistoryTemplate = null;
      medicalHistoryFactory
        .create()
        .then(function (res) {
          medicalHistoryTemplate = res.Value;
        })
        .then(function () {
          var templateData = [
            {
              Name: medicalHistoryTemplate.FormName,
              Type: 'Medical History',
              DateModified: medicalHistoryTemplate.DateModified,
              Description: medicalHistoryTemplate.Description,
            },
          ];
          $scope.populateGrid(templateData);
        });
    };

    // updates the count displayed by the group name
    ctrl.updateCounts = function (allPatientDocs) {
      // clearing left-over counts
      $scope.clinicalCount = 0;
      $scope.accountCount = 0;
      $scope.insuranceCount = 0;
      angular.forEach($scope.documentGroupsList, function (group) {
        group.$$Count = 0;
      });
      angular.forEach(allPatientDocs, function (doc) {
        var group = listHelper.findItemByFieldValue(
          $scope.documentGroupsList,
          'DocumentGroupId',
          doc.DocumentGroupId
        );
        if (group) {
          group.$$Count++;
          switch (group.Description) {
            case 'Account':
              $scope.accountCount++;
              break;
            case 'Insurance':
              $scope.insuranceCount++;
              break;
            default:
              $scope.clinicalCount++;
              break;
          }
        }
      });
    };

    $scope.populateGrid = function (template) {
      //documentsKendoFactory.setDocList(docList);
      if (template == null) {
        $scope.emptyGrid = true;
        $scope.defaultMessage = localize.getLocalizedString(
          'Please select a folder to get started.'
        );
      } else if (angular.isUndefined(template)) {
        $scope.emptyGrid = true;
        $scope.defaultMessage = localize.getLocalizedString(
          'There are no items to display.'
        );
      } else {
        $scope.emptyGrid = false;
        $scope.formatRecord(template);
      }
      // Basic Kendo Grid Placeholder
      if (!$scope.emptyGrid) {
        $scope.dirListOpt = {
          dataSource: {
            data: template,
          },
          columns: [
            {
              template: kendo.template(
                "<div class='filename'><a ng-click='' class='disabled'>#: Name #</a></div>"
              ),
              field: 'Name',
              title: 'Name',
            },
            {
              field: 'Description',
              title: 'Description',
            },
            {
              field: 'FormattedDate',
              title: 'Date Created',
            },
            {
              field: 'Type',
              title: 'Type',
            },
            {
              attributes: {
                class: 'k-grid-commands',
              },
              command: [
                {
                  name: 'Menu',
                  text: '',
                  className: 'fa fa-ellipsis-v ellipse',
                  click: function (e) {
                    e.preventDefault();
                  },
                },
              ],
              title: '',
            },
          ],
        };
      }
    };

    $scope.formatRecord = function (templateList) {
      angular.forEach(templateList, function (template) {
        template.FormattedDate = $filter('date')(
          template.DateModified,
          'MM/dd/yyyy'
        );
      });
      return templateList;
    };

    ctrl.filterDocuments = function (selectedDirectory) {
      $scope.activeDir = selectedDirectory;
    };

    // #endregion

    // #region View

    $scope.viewOptions = [
      {
        Index: 0,
        Name: 'Patients',
        Disabled: false,
      },
      {
        Index: 1,
        Name: 'Practice',
        Disabled: true,
      },
      {
        Index: 2,
        Name: 'Team Members',
        Disabled: true,
      },
      {
        Index: 3,
        Name: 'Templates & Forms',
        Disabled: false,
      },
    ];

    $scope.selectedItem = $scope.viewOptions[3].Name;

    $scope.breadcrumbs = [
      {
        name: localize.getLocalizedString('Practice Settings'),
        path: '/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings',
      },
      {
        name: localize.getLocalizedString('Forms & Documents'),
        path: '/BusinessCenter/FormsDocuments/',
        title: 'Forms & Documents',
      },
    ];

    // handle URL update for breadcrumbs
    $scope.changePageState = function (breadcrumb) {
      document.title = breadcrumb.title;
      $location.url(_.escape(breadcrumb.path));
    };

    // Link to the correct page when a tab is clicked
    $scope.getTab = function (index) {
      switch (index) {
        case 0:
          window.location = _.escape('#/BusinessCenter/FormsDocuments');
          break;
        case 1:
          break;
        case 2:
          break;
        case 3:
          window.location = _.escape(
            '#/BusinessCenter/FormsDocuments/FormsTemplates'
          );
          break;
      }
    };

    $scope.getGridData = function (group, mediaType) {
      $scope.activeGroup = group;
      if (mediaType !== '' && typeof mediaType !== 'undefined') {
        $scope.activeDir = mediaType;
        var mediaTypeId = $filter('filter')($scope.mediaTypes, {
          Name: mediaType,
        })[0];
        $scope.activeMediaType = mediaTypeId;

        //$scope.activeCommTemplates = $filter('filter')($scope.commTemplates,
        //{ GroupId: group.id, MediaTypeId: mediaType.Id });
        $scope.activeCommTemplates = $filter('filter')($scope.commTemplates, {
          GroupId: group.id,
          MediaTypeId: mediaTypeId.Id,
        });

        angular.forEach($scope.activeCommTemplates, function (obj) {
          var selectedGroup = $filter('filter')($scope.groups, {
            id: obj.GroupId,
          })[0];
          var selectedSubFolder = $filter('filter')($scope.mediaTypes, {
            Id: obj.MediaTypeId,
          })[0];
          obj.GroupName = selectedGroup.name;
          obj.MediaName = selectedSubFolder.Name;
        });

        $scope.groupTemplates = localize.getLocalizedString(
          mediaType + ' Templates (' + group.name + ')'
        );
        $scope.showGrid = true;
      } else {
        $scope.showGrid = false;
        $scope.activeDir = '';
      }
    };

    //#region Delete Note

    ctrl.templateId = null;
    $scope.deleteNote = function (template) {
      ctrl.templateId = angular.copy(template.CommunicationTemplateId);
      modalFactory
        .DeleteModal('template ', template.TemplateName)
        .then($scope.confirmDelete, ctrl.cancelDelete);
    };

    $scope.confirmDelete = function () {
      communicationTemplateFactory.deleteCommunicationTemplate(ctrl.templateId);
      var foundItem = $filter('filter')(
        $scope.activeCommTemplates,
        { CommunicationTemplateId: ctrl.templateId },
        true
      )[0];
      var index = $scope.activeCommTemplates.indexOf(foundItem);
      $scope.activeCommTemplates.splice(index, 1);

      var foundItemAll = $filter('filter')(
        $scope.commTemplates,
        { CommunicationTemplateId: ctrl.templateId },
        true
      )[0];
      var indexAll = $scope.commTemplates.indexOf(foundItemAll);
      $scope.commTemplates.splice(indexAll, 1);
    };

    ctrl.cancelDelete = function () {
      ctrl.selectedTreatmentRoom = null;
    };

    //#endregion

    $scope.uneditedNote = null;

    $scope.editNote = function (note) {
      // strip <iframe .* </iframe>`
      note.Note = note.Note.replace(/(<iframe.*?>.*?<\/iframe>)/g, '');

      $scope.selectedTemplate.activeGroup = $scope.activeGroup;
      //$scope.selectedTemplate.activeMediaType = $scope.mediaTypes[1];
      $scope.selectedTemplate.activeMediaType = $filter('filter')(
        $scope.mediaTypes,
        { Id: note.MediaTypeId },
        true
      )[0];

      $scope.uneditedNote = angular.copy(note);
      $scope.selectedNote = note;
      $scope.dataChanged = false;
      $scope.showEditor = true;

      $scope.editMode = true;
      //ctrl.getCommunicationTemplates();
      $scope.showGrid = false;
      $scope.adding = false;

      ctrl.toggleKendoTools($scope.selectedTemplate.activeMediaType.Id);
    };

    $('#accordion').on('hidden.bs.collapse', ctrl.toggleChevron);
    $('#accordion').on('shown.bs.collapse', ctrl.toggleChevron);

    // #endregion

    $scope.getDisplayKey = function (key) {
      return key.replace(/ /g, '');
    };

    ctrl.$onInit();
  },
]);
