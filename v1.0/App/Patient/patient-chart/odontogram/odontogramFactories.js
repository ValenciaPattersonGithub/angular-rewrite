angular.module('Soar.Patient').factory('PatientOdontogramFactory', [
  'PatientServices',
  '$filter',
  'localize',
  'ListHelper',
  '$q',
  'toastrFactory',
  '$timeout',
  'patSecurityService',
  function (
    patientServices,
    $filter,
    localize,
    listHelper,
    $q,
    toastrFactory,
    $timeout,
    patSecurityService
  ) {
    var odontogram = {};
    var savedOdontogram = {};
    var observers = [];
    var hasAccess = {
      Create: false,
      Delete: false,
      Edit: false,
      View: false,
    };
    var mouthStatus = {};

    // TODO?  validate odontogram
    var validateOdontogram = function (odontogram) {
      return true;
    };

    var getChartedTeethArray = function (teethState) {
      return teethState.split(';');
    };

    var getDefaultTeethList = function () {
      var teeth = [];
      for (var i = 1; i < 33; i++) {
        var tooth = {};
        tooth.OrderedDrawItems = null;
        tooth.ToothNumber = i.toString();
        teeth.push(tooth);
      }
      return teeth;
    };

    var getById = function (personId) {
      var defer = $q.defer();
      var promise = defer.promise;

      if (hasAccess.View === true) {
        patientServices.Odontogram.get({
          Id: personId,
        }).$promise.then(
          function (res) {
            if (res && res.Value) {
              odontogram = res.Value;
              promise = $.extend(promise, {
                values: odontogram,
              });
              defer.resolve(res);
            } else {
              odontogram = {
                PatientId: personId,
                Teeth: getDefaultTeethList(),
              };
              promise = $.extend(promise, {
                values: odontogram,
              });
              defer.resolve(res);
            }
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Patient Odontogram']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    // save new or modified odontogram
    var saveOdontogram = function (odontogram) {
      var defer = $q.defer();
      var promise = defer.promise;
      if (odontogram.OdontogramId) {
        if (hasAccess.Edit === true) {
          patientServices.Odontogram.update(
            {
              Id: odontogram.PatientId,
            },
            odontogram
          ).$promise.then(
            function (res) {
              odontogram = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'An error occurred while saving the odontogram.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
      } else {
        if (hasAccess.Create === true) {
          patientServices.Odontogram.create(
            {
              Id: odontogram.PatientId,
            },
            odontogram
          ).$promise.then(
            function (res) {
              odontogram = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'An error occurred while saving the odontogram.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
      }
      return promise;
    };

    var getMouthStatusByPersonId = function (personId) {
      var defer = $q.defer();
      var promise = defer.promise;

      if (hasAccess.View === true) {
        patientServices.Odontogram.mouthstatus({
          Id: personId,
        }).$promise.then(
          function (res) {
            mouthStatus = res.Value;
            promise = $.extend(promise, {
              values: mouthStatus,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the mouth status. Refresh the page to try again.',
                ['Perio Exams']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    //#region authentication

    var authCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-codogm-add'
      );
    };

    var authDeleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-codogm-delete'
      );
    };

    var authEditAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-codogm-edit'
      );
    };

    var authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-codogm-view'
      );
    };

    var authAccess = function () {
      if (!authViewAccess()) {
      } else {
        hasAccess.Create = authCreateAccess();
        hasAccess.Delete = authDeleteAccess();
        hasAccess.Edit = authEditAccess();
        hasAccess.View = true;
      }
      return hasAccess;
    };

    // Control the close function of the tooth options ellipse menu
    var closeToothOptions = function () {};

    //#endregion

    return {
      access: function () {
        return authAccess();
      },
      // get odontogram
      get: function (personId) {
        return getById(personId);
      },
      getChartedTeeth: function (teethState) {
        return getChartedTeethArray(teethState);
      },
      getNewOdontogram: function (personId) {
        return {
          PatientId: personId,
          Teeth: getDefaultTeethList(),
        };
      },
      getMouthStatus: function (personId) {
        return getMouthStatusByPersonId(personId);
      },
      // save odontogram
      save: function (odontogram) {
        return saveOdontogram(odontogram);
      },
      // validate note
      validateOdontogram: function (odontogram) {
        return validateOdontogram(odontogram);
      },
      // DataChanged
      DataChanged: false,
      setDataChanged: function (dataHasChanged) {
        this.DataChanged = dataHasChanged;
        return this.DataChanged;
      },
      // subscribe to changes
      observeOdontogram: function (observer) {
        observers.push(observer);
      },
      // patients selected teeth
      selectedTeeth: [],
      setSelectedTeeth: function (teeth) {
        if (teeth) this.selectedTeeth.push(teeth);
        else {
          this.selectedTeeth = [];
        }
      },
      patientsAllTeeth: [],

      TeethDefinitions: [],
      CdtCodeGroups: [],

      selectedChartButtonId: null,
      setselectedChartButton: function (buttonId) {
        this.selectedChartButtonId = buttonId;
      },

      selectedSwiftPickCode: null,
      setSelectedSwiftPickCode: function (swftPkCode) {
        this.selectedSwiftPickCode = swftPkCode;
      },

      // TODO Remove this after caching is implemented
      serviceCodes: [],

      activeQuadrant: null,
      setActiveQuadrant: function (quad) {
        this.activeQuadrant = quad;
      },
      // indicates we should overwrite the snapshot
      saveNewSnapshot: false,
      setSaveNewSnapshot: function (value) {
        this.saveNewSnapshot = value;
      },
      CloseToothOptions: null,
      setCloseToothOptions: function (value) {
        var result = document.getElementsByClassName(
          'odontogram__toothMenuPopover'
        )[0];
        var wrappedResult = angular.element(result);
        wrappedResult.remove();
        this.CloseToothOptions = value;
      },
    };
  },
]);
