'use strict';
angular.module('Soar.Patient').factory('PatientPerioExamFactory', [
  'PatientServices',
  '$filter',
  'localize',
  'ListHelper',
  '$q',
  'toastrFactory',
  '$timeout',
  'patSecurityService',
  'ToothSelectionService',
  'ExamState',
  'StaticData',
  'PerioService',
  function (
    patientServices,
    $filter,
    localize,
    listHelper,
    $q,
    toastrFactory,
    $timeout,
    patSecurityService,
    toothSelectionService,
    examState,
    staticData,
    perioService
  ) {
    var factory = this;
    var hasChanges = false;
    var perioExam = {};
    var perioExamDetails = [];
    var perioExamHeaders = [];
    var perioExamSummary = [];
    var savedExam = {};
    var hasAccess = {
      Create: false,
      Delete: false,
      Edit: false,
      View: false,
    };
    var toothChart =
      '1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25;26;27;28;29;30;31;32';
    var primaryToothChart =
      ';;;A;B;C;D;E;F;G;H;I;J;;;;;;;K;L;M;N;O;P;Q;R;S;T;;;';
    var toothArray = toothChart.split(';');
    var primaryToothArray = primaryToothChart.split(';');
    var isBleedingAll = false;
    var isSuppurationAll = false;
    var teethDefinitions;

    var alertLevels = {
      DepthPocket: 4,
      GingivalMarginPocket: 4,
      AttachmentLevel: 4,
    };

    var getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value && res.Value.Teeth) {
          teethDefinitions = res.Value.Teeth;
        }
      });
    };
    getTeethDefinitions();

    var getNewPerioExamHeader = function (personId) {
      var perioExamHeader = {
        ExamId: null,
        PatientId: personId,
      };
      return perioExamHeader;
    };

    // merge saved exam with template to hold toothChart positions
    var mergeExam = function (savedExam, exam) {
      for (var i = 0; i < exam.ExamDetails.length; i++) {
        if (exam.ExamDetails[i].ToothId === null) {
          savedExam.ExamDetails.splice(i, 0, exam.ExamDetails[i]);
        } else {
          var index = listHelper.findIndexByFieldValue(
            savedExam.ExamDetails,
            'ToothId',
            exam.ExamDetails[i].ToothId
          );
          if (index > -1) {
            savedExam.ExamDetails[index].ToothNumber = parseInt(
              exam.ExamDetails[i].ToothNumber,
              10
            );
            savedExam.ExamDetails[index].ToothState =
              exam.ExamDetails[i].ToothState;
          } else {
            savedExam.ExamDetails.splice(i, 0, exam.ExamDetails[i]);
          }
        }
      }
      savedExam.ExamDetails = $filter('orderBy')(savedExam.ExamDetails, [
        'ToothNumber',
      ]);
      return savedExam;
    };

    var processExam = function (savedExam) {
      for (var i = 0; i < savedExam.ExamDetails.length; i++) {
        var detail = savedExam.ExamDetails[i];
        var toothIndex = toothArray.indexOf(detail.ToothId);
        if (toothIndex < 0) {
          toothIndex = primaryToothArray.indexOf(detail.ToothId);
        }
        detail.ToothNumber = toothIndex + 1;
      }
      savedExam.ExamDetails = $filter('orderBy')(savedExam.ExamDetails, [
        'ToothNumber',
      ]);
      return savedExam;
    };

    var getTeethInfo = function (teeth, tooth) {
      var noMatch = true;
      var toothState = null;
      for (var i = 0; i < teeth.length; i++) {
        if (tooth === teeth[i].split(',')[0]) {
          toothState = teeth[i];
          break;
        }
      }
      return toothState;
    };

    // create a new perio details object
    var getNewPerioExamDetails = function (personId, teeth, usePreviousExam) {
      perioExamDetails = [];
      angular.forEach(toothArray, function (tooth) {
        var toothExam = {
          ExamId: null,
          ToothId: tooth,
          ToothNumber: parseInt(tooth),
          PatientId: personId,
          BleedingPocket: [null, null, null, null, null, null],
          DepthPocket: [null, null, null, null, null, null],
          AttachmentLvl: [],
          FurcationGradeRoot: [null, null, null],
          GingivalMarginPocket: [null, null, null, null, null, null],
          MgjPocket: [null, null, null, null, null, null],
          Mobility: null,
          SuppurationPocket: [null, null, null, null, null, null],
        };
        perioExamDetails.push(toothExam);
      });

      // populate toothExam.ToothId based on teethState
      angular.forEach(perioExamDetails, function (toothExam) {
        // get toothData for this toothId
        var toothData = toothSelectionService.getToothDataByToothId(
          toothExam.ToothId
        );
        if (toothData) {
          // find matching toothInfo for primary
          var toothState = getTeethInfo(teeth, toothData.primaryLetter);
          if (toothState !== null) {
            // if toothState does not contain 'Missing' attribute, set ToothId
            if (
              toothState.indexOf('Missing') === -1 &&
              toothState.indexOf('Implant') === -1
            ) {
              toothExam.ToothId = toothState.split(',')[0];
              toothExam.ToothState = '';
            } else {
              //toothExam.ToothId = null;
              toothExam.ToothId = toothState.split(',')[0];
              toothExam.ToothState = toothState.split(',')[1];
            }
            if (usePreviousExam && toothState.indexOf('Missing') === -1) {
              toothExam = loadPreviousExamDetails(toothExam, usePreviousExam);
            }
          } else {
            // find matching toothInfo for permanentNumber
            toothState = getTeethInfo(
              teeth,
              toothData.permanentNumber.toString()
            );
            if (toothState !== null) {
              // if toothState does not contain 'Missing' attribute, set ToothId
              if (
                toothState.indexOf('Missing') === -1 &&
                toothState.indexOf('Implant') === -1
              ) {
                toothExam.ToothId = toothState.split(',')[0];
                toothExam.ToothState = '';
              } else {
                toothExam.ToothId = toothState.split(',')[0];
                toothExam.ToothState = toothState.split(',')[1];
              }
              if (usePreviousExam && toothState.indexOf('Missing') === -1) {
                toothExam = loadPreviousExamDetails(toothExam, usePreviousExam);
              }
            } else {
              // this should only be due to the tooth being marked as primary
              // when a primary tooth doesn't exist for the position (31,32, 30,1,2,3,14,15,16,17,18,19)
              toothExam.ToothState = 'MissingPrimary';
            }
          }
        }
      });
      return perioExamDetails;
    };

    var loadPreviousExamDetails = function (currentExamDetail, previousExam) {
      var currentToothOnPreviousExam = listHelper.findIndexByFieldValue(
        previousExam.ExamDetails,
        'ToothId',
        currentExamDetail.ToothId
      );

      if (
        !_.isNil(currentToothOnPreviousExam) &&
        currentToothOnPreviousExam != -1
      ) {
        currentExamDetail.BleedingPocket =
          previousExam.ExamDetails[currentToothOnPreviousExam].BleedingPocket;
        currentExamDetail.DepthPocket =
          previousExam.ExamDetails[currentToothOnPreviousExam].DepthPocket;
        currentExamDetail.AttachmentLvl =
          previousExam.ExamDetails[currentToothOnPreviousExam].AttachmentLvl;
        currentExamDetail.FurcationGradeRoot =
          previousExam.ExamDetails[
            currentToothOnPreviousExam
          ].FurcationGradeRoot;
        currentExamDetail.GingivalMarginPocket =
          previousExam.ExamDetails[
            currentToothOnPreviousExam
          ].GingivalMarginPocket;
        currentExamDetail.MgjPocket =
          previousExam.ExamDetails[currentToothOnPreviousExam].MgjPocket;
        currentExamDetail.Mobility =
          previousExam.ExamDetails[currentToothOnPreviousExam].Mobility;
        currentExamDetail.SuppurationPocket =
          previousExam.ExamDetails[
            currentToothOnPreviousExam
          ].SuppurationPocket;
      }

      return perioExam;
    };

    // create a new perio exam object
    var getNewPerioExam = function (personId, teeth, previousExam) {
      var details = null;
      if (previousExam && perioExamHeaders && perioExamHeaders.length > 0) {
        details = getNewPerioExamDetails(personId, teeth, previousExam);
      } else {
        details = getNewPerioExamDetails(personId, teeth);
      }
      var header = getNewPerioExamHeader(personId);
      var perioExam = {
        ExamHeader: header,
        ExamDetails: details,
      };
      setCustomProperties(perioExam);
      return perioExam;
    };

    // alert subscribers when the exams changes
    var observers = [];
    // alerts subscribers when the focusedIndex is set
    factory.focusedIndexObservers = [];

    // validate exam
    var validatePerioExam = function (exam) {
      var examIsValid = true;
      // validate personId

      // validate exam has at least one reading
      if (!hasChanges === true) {
        examIsValid = false;
      }
      // DO these validations as we add these to chart
      // validate pocket depth range
      // validate gm
      // validate bleeding
      // validate fg
      //validate ?
      return examIsValid;
    };

    // remove an exam from list
    var removeFromExams = function (exam) {
      var index = listHelper.findIndexByFieldValue(
        perioExamHeaders,
        'ExamId',
        exam.ExamId
      );
      if (index > -1) {
        perioExamHeaders.splice(index, 1);
      }
      angular.forEach(observers, function (observer) {
        observer(perioExamHeaders);
      });
    };

    // add exam to list
    var addToExams = function (exam) {
      var index = listHelper.findIndexByFieldValue(
        perioExamHeaders,
        'ExamId',
        exam.ExamHeader.ExamId
      );
      if (index > -1) {
        perioExamHeaders.splice(index, 1, exam.ExamHeader);
      } else {
        perioExamHeaders.push(exam.ExamHeader);
      }
      addTitleToExam(perioExamHeaders);
      angular.forEach(observers, function (observer) {
        observer(perioExamHeaders);
      });
    };

    // for each exam, create a title for the dropdown
    var addTitleToExam = function (perioExams) {
      angular.forEach(perioExams, function (perioExam) {
        var local = moment.utc(perioExam.ExamDate).toDate();
        perioExam.Title =
          moment(local).format('MM/DD/YYYY') +
          ' - ' +
          moment(local).format('h:mm a');
      });
    };

    // get all perioExams
    var getAllExamHeaders = function (personId) {
      var defer = $q.defer();
      var promise = defer.promise;
      perioExamHeaders = [];
      if (hasAccess.View === true) {
        if (perioExamHeaders.length === 0) {
          patientServices.PerioExam.getAllHeaders({
            Id: personId,
          }).$promise.then(
            function (res) {
              perioExamHeaders = res.Value;
              addTitleToExam(perioExamHeaders);
              promise = $.extend(promise, {
                values: perioExamHeaders,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the list of {0}. Refresh the page to try again.',
                  ['Perio Exams']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        } else {
          $timeout(function () {
            promise = $.extend(promise, {
              values: perioExamHeaders,
            });
          }, 0);
        }
      }
      return promise;
    };

    // tacking on allowed reading count for dynamic creation of furcation grade inputs and setting default input arrays based on MouthSide to mimic Eaglesoft
    var setCustomProperties = function (exam) {
      angular.forEach(exam.ExamDetails, function (detail) {
        var def = listHelper.findItemByFieldValue(
          teethDefinitions,
          'USNumber',
          detail.ToothId
        );
        if (def) {
          detail.$$FurcationReadingsAllowed =
            def.NumberOfFurcationGradeReadingsAllowed;
          detail.$$MouthSide = def.MouthSide;
          detail.$$BuccalInputArray =
            def.MouthSide === 'Right' ? [0, 1, 2] : [2, 1, 0];
          detail.$$LingualInputArray =
            def.MouthSide === 'Right' ? [5, 4, 3] : [3, 4, 5];
        }
      });
    };

    // get a specific perioExam by id
    var getExamById = function (personId, examId) {
      if (hasAccess.View === true) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.PerioExam.get({
          Id: personId,
          examId: examId,
        }).$promise.then(
          function (res) {
            perioExam = res.Value;
            setCustomProperties(perioExam);
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Perio Exam']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    var getAllExamsByPatientId = function (personId, toothIdFilter) {
      if (hasAccess.View === true) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.PerioExam.getAllExamsByPatient(
          {
            Id: personId,
          },
          toothIdFilter
        ).$promise.then(
          function (res) {
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Perio Exam']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    // filter exam to remove teeth that don't exist from object to be persisted
    var filterExam = function (exam) {
      var detailsToSave = [];
      angular.forEach(exam.ExamDetails, function (detail) {
        if (detail.ToothId !== null) {
          detailsToSave.push(detail);
        }
      });
      exam.ExamDetails = angular.copy(detailsToSave);
      return exam;
    };

    // save new or modified exam
    var savePerioExam = function (exam) {
      var examToSave = angular.copy(exam);
      var defer = $q.defer();
      var promise = defer.promise;
      // remove missing teeth or teeth with no toothId
      var perioExam = filterExam(examToSave);
      //TODO remove this after testing
      if (perioExam.ExamHeader.ExamId) {
        if (hasAccess.Edit === true) {
          patientServices.PerioExam.update(
            {
              Id: perioExam.ExamHeader.PatientId,
            },
            perioExam
          ).$promise.then(
            function (res) {
              //toastrFactory.success(localize.getLocalizedString('Your Perio Exam has been updated.'), localize.getLocalizedString('Success'));
              savedExam = res.Value;
              setCustomProperties(savedExam);
              addToExams(savedExam);
              promise = $.extend(promise, {
                values: res.Value,
              });
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
      } else {
        if (hasAccess.Create === true) {
          patientServices.PerioExam.create(
            {
              Id: perioExam.ExamHeader.PatientId,
            },
            perioExam
          ).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString(
                  'Your Perio Exam has been created.'
                ),
                localize.getLocalizedString('Success')
              );
              savedExam = res.Value;
              setCustomProperties(savedExam);
              addToExams(savedExam);
              promise = $.extend(promise, {
                values: savedExam,
              });
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
      }
      return promise;
    };

    // delete a perio exam
    var deletePerioExam = function (exam) {
      var defer = $q.defer();
      var promise = defer.promise;

      if (hasAccess.Delete === true) {
        patientServices.PerioExam.delete({
          Id: exam.PatientId,
          examId: exam.ExamId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res });
            defer.resolve(res);
            removeFromExams(exam);
            toastrFactory.success(
              localize.getLocalizedString('Delete successful.'),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to delete the {0}. Please try again.',
                ['Perio Exam']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      }
    };

    //getting brief information of all the perio exams done for a patient
    var getPerioExamSummary = function (personId) {
      var defer = $q.defer();
      var promise = defer.promise;
      perioExamSummary = [];
      if (hasAccess.View === true) {
        patientServices.PerioExam.summaries({
          Id: personId,
        }).$promise.then(
          function (res) {
            perioExamSummary = res.Value;
            promise = $.extend(promise, { values: perioExamSummary });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0}. Refresh the page to try again.',
                ['Perio Exams']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    factory.keyCodeLookup = [
      { keyCode: 89, value: 'y' },
      { keyCode: 78, value: 'n' },
      { keyCode: 48, value: '0' },
      { keyCode: 49, value: '1' },
      { keyCode: 50, value: '2' },
      { keyCode: 51, value: '3' },
      { keyCode: 52, value: '4' },
      { keyCode: 53, value: '5' },
      { keyCode: 54, value: '6' },
      { keyCode: 55, value: '7' },
      { keyCode: 56, value: '8' },
      { keyCode: 57, value: '9' },
      { keyCode: 96, value: '0' },
      { keyCode: 97, value: '1' },
      { keyCode: 98, value: '2' },
      { keyCode: 99, value: '3' },
      { keyCode: 100, value: '4' },
      { keyCode: 101, value: '5' },
      { keyCode: 102, value: '6' },
      { keyCode: 103, value: '7' },
      { keyCode: 104, value: '8' },
      { keyCode: 105, value: '9' },
    ];

    // gives back the value of the keyCode entered if in keycodes
    factory.getValueWithKeyCode = function (code) {
      var keyCodeObject = listHelper.findItemByFieldValue(
        factory.keyCodeLookup,
        'keyCode',
        code
      );
      return keyCodeObject ? keyCodeObject.value : null;
    };

    // gives back the value of the input entered if in keycodes
    factory.getValueByInputValue = function (inputValue) {
      var keyCodeObject = listHelper.findItemByFieldValue(
        factory.keyCodeLookup,
        'value',
        inputValue
      );
      return keyCodeObject ? keyCodeObject.value : null;
    };

    factory.getAcceptableKeyCodes = function (examType) {
      var keyCodes = [];
      // arrow keys, b, and s are acceptable for all exam types
      var arrowKeyCodes = [37, 38, 39, 40, 66, 83];
      switch (examType) {
        case 'BleedingPocket':
        case 'SuppurationPocket':
          // y and n
          keyCodes = arrowKeyCodes.concat([78, 89]);
          break;
        case 'Mobility':
        case 'FurcationGradeRoot':
          // 0-4
          keyCodes = arrowKeyCodes.concat([
            48,
            49,
            50,
            51,
            52,
            96,
            97,
            98,
            99,
            100,
          ]);
          break;
        default:
          // 1-9
          keyCodes = arrowKeyCodes.concat([
            48,
            49,
            50,
            51,
            52,
            53,
            54,
            55,
            56,
            57,
            96,
            97,
            98,
            99,
            100,
            101,
            102,
            103,
            104,
            105,
          ]);
          break;
      }
      return keyCodes;
    };

    // move to the next valid position in the chartedTeeth
    // TODO white board this function to make more efficient
    factory.getNextValidTooth = function (
      chartedTeeth,
      activeTooth,
      fwdDirection
    ) {
      var nextValidTooth;

      if (chartedTeeth) {
        // index 0 - 15 upper arch ---or 50 to 65 after we add supers?
        // index 16 - 31 lower arch ---or 56 to 81 after we add supers?
        var index = chartedTeeth.indexOf(activeTooth.toString());
        var validTooth = null;

        if (index > 15) {
          do {
            if (fwdDirection) {
              if (index > 0) {
                nextValidTooth = chartedTeeth[index - 1];
              } else {
                nextValidTooth = chartedTeeth[chartedTeeth.length - 1];
              }

              if (
                nextValidTooth.indexOf('Missing') === -1 &&
                nextValidTooth.indexOf('Implant') === -1
              ) {
                validTooth = nextValidTooth;
              } else {
                index--;
              }
            } else {
              if (index >= 0 && index < chartedTeeth.length - 1) {
                nextValidTooth = chartedTeeth[index + 1];
              } else {
                nextValidTooth = chartedTeeth[0];
              }

              if (
                nextValidTooth.indexOf('Missing') === -1 &&
                nextValidTooth.indexOf('Implant') === -1
              ) {
                validTooth = nextValidTooth;
              } else {
                index++;
              }
            }
          } while (!validTooth);
        } else {
          do {
            if (fwdDirection) {
              if (index >= 0 && index < chartedTeeth.length - 1) {
                nextValidTooth = chartedTeeth[index + 1];
              } else {
                nextValidTooth = chartedTeeth[0];
              }

              if (
                nextValidTooth.indexOf('Missing') === -1 &&
                nextValidTooth.indexOf('Implant') === -1
              ) {
                validTooth = nextValidTooth;
              } else {
                index++;
              }
            } else {
              if (index > 0) {
                nextValidTooth = chartedTeeth[index - 1];
              } else {
                nextValidTooth = chartedTeeth[chartedTeeth.length - 1];
              }

              if (
                nextValidTooth.indexOf('Missing') === -1 &&
                nextValidTooth.indexOf('Implant') === -1
              ) {
                validTooth = nextValidTooth;
              } else {
                index--;
              }
            }
          } while (!validTooth && index < chartedTeeth.length);
        }
        return validTooth;
      }
    };

    // this advance is independant of the path, only considers the tooth numbers
    factory.arrowAdvanceToNextValidTooth = function (
      activePerioExam,
      activeTooth,
      arrowDirection
    ) {
      var nextValidTooth;

      if (activePerioExam) {
        //var index = chartedTeeth.indexOf(activeTooth.toString());
        //var index = _.find(activePerioExam, function (exam) { return exam.ToothId === activeTooth; });
        var perioToothList = [];

        angular.forEach(activePerioExam, function (exam) {
          perioToothList.push(exam.ToothId);
        });
        var index = perioToothList.indexOf(activeTooth.toString());
        //var index = Data.map(function (e) { return e.ToothId; }).indexOf(activeTooth.toString());

        var validTooth = null;
        do {
          if (arrowDirection === 'forward') {
            if (index >= 0 && index < activePerioExam.length - 1) {
              nextValidTooth = activePerioExam[index + 1];
            } else {
              nextValidTooth = activePerioExam[0];
              //set to -1 so that if tooth#1 is missing or implant
              //increment in else below does not skip a tooth
              index = -1;
            }
            if (
              nextValidTooth.ToothState.indexOf('Missing') === -1 &&
              nextValidTooth.ToothState.indexOf('Implant') === -1 &&
              index != activePerioExam[index]
            ) {
              validTooth = nextValidTooth;
            } else {
              index++;
            }
          } else {
            if (index > 0) {
              if (index < 32) {
                nextValidTooth = activePerioExam[index - 1];
              } else {
                nextValidTooth = activePerioExam[index];
              }
            } else {
              nextValidTooth = activePerioExam[activePerioExam.length - 1];
              index = 32;
            }

            if (
              nextValidTooth.ToothState.indexOf('Missing') === -1 &&
              nextValidTooth.ToothState.indexOf('Implant') === -1
            ) {
              validTooth = nextValidTooth;
            } else {
              index--;
            }
          }
        } while (!validTooth);
        return validTooth.ToothId;
      }
    };

    //#region authentication

    var authCreateAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cperio-add'
      );
    };

    var authDeleteAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cperio-delete'
      );
    };

    var authEditAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cperio-edit'
      );
    };

    var authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cperio-view'
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

    factory.getInputArrayForTooth = function (
      examType,
      surface,
      examForActiveTooth
    ) {
      var inputArray;
      switch (surface) {
        case 'B':
          inputArray = examForActiveTooth.$$BuccalInputArray;
          break;
        case 'L':
          inputArray = examForActiveTooth.$$LingualInputArray;
          break;
      }
      return inputArray;
    };

    // first pass at getting PerioComparisonInfo
    factory.getPerioComparisonInfo = function (personId, examIds) {
      var params = {
        Id: personId,
      };
      if (examIds) {
        params.examIds = examIds;
      }
      var defer = $q.defer();
      var promise = defer.promise;
      if (hasAccess.View === true) {
        patientServices.PerioExam.getPerioComparison(params).$promise.then(
          function (res) {
            var perioExams = res.Value;
            promise = $.extend(promise, { values: perioExams });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0}. Refresh the page to try again.',
                ['Perio Exams']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    // gets all perio exam navigation paths defined for the current practice
    factory.getPerioExamPaths = function () {
      var defer = $q.defer();
      var promise = defer.promise;
      if (hasAccess.View === true) {
        perioService.get().$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the list of {0} for {1}. Refresh the page to try again.',
                ['Perio Exams Paths', 'Practice']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      }
      return promise;
    };

    //
    factory.convertNullsToZero = function (examDetails) {
      var propertiesToUpdate = [
        'DepthPocket',
        'GingivalMarginPocket',
        'AttachmentLvl',
        'MgjPocket',
        'Mobility',
        'FurcationGradeRoot',
      ];
      angular.forEach(examDetails, function (detail) {
        if (detail.ToothState !== 'MissingPrimary') {
          for (var prop in detail) {
            if (detail.hasOwnProperty(prop)) {
              if (propertiesToUpdate.indexOf(prop) !== -1) {
                if (angular.isArray(detail[prop])) {
                  for (var i = 0; i < detail[prop].length; i++) {
                    if (detail[prop][i] === null) {
                      detail[prop][i] = 0;
                    }
                  }
                } else if (detail[prop] === null) {
                  detail[prop] = 0;
                }
              }
            }
          }
        }
      });
    };

    //#endregion
    return {
      // set the active perio tab
      ActiveTab: null,
      setActiveTab: function (tabIndex) {
        this.ActiveTab = tabIndex;
        return tabIndex;
      },
      // access to perio
      access: function () {
        return authAccess();
      },
      getById: function (personId, examId) {
        return getExamById(personId, examId);
      },
      getAllExamsByPatientId: function (personId, toothIdFilter) {
        return getAllExamsByPatientId(personId, toothIdFilter);
      },

      get: function (personId) {
        return getAllExamHeaders(personId);
      },
      //get summary of all the perio exams done for a patient
      getSummary: function (personId) {
        return getPerioExamSummary(personId);
      },
      merge: function (exam, examTemplate) {
        return mergeExam(exam, examTemplate);
      },
      process: function (exam) {
        return processExam(exam);
      },
      // save
      save: function (exam, teeth) {
        return savePerioExam(exam, teeth);
      },
      // validate
      validateExam: function (exam) {
        return validatePerioExam(exam);
      },
      deleteExam: function (exam) {
        return deletePerioExam(exam);
      },
      ExamState: examState.Initializing,
      setExamState: function (state) {
        if (state === 'Start') {
          this.setFocusedIndex(0);
          this.ActiveTooth = null;
          this.ActiveToothIndex = null;
          this.ActiveExamPath = null;
        }
        this.ExamState = state;
        return state;
      },
      SelectedExamHeader: null,
      SelectedExamId: null,
      setSelectedExamId: function (selectedExamId) {
        this.SelectedExamId = selectedExamId;
        if (selectedExamId && perioExamHeaders.length > 0) {
          this.SelectedExamHeader = listHelper.findItemByFieldValue(
            perioExamHeaders,
            'ExamId',
            selectedExamId
          );
        } else {
          this.SelectedExamHeader = null;
        }
        return selectedExamId;
      },
      ActiveQuadrant: null,
      setActiveQuadrant: function (quadrant) {
        this.ActiveQuadrant = quadrant;
        return quadrant;
      },
      ActiveExam: null,
      setActiveExam: function (exam) {
        this.ActiveExam = exam;
        return exam;
      },
      ActiveTooth: null,
      setActiveTooth: function (tooth) {
        if (tooth != this.ActiveTooth) {
          this.ActiveTooth = tooth;
        }
        return tooth;
      },
      ActiveToothIndex: null,
      setActiveToothIndex: function (index) {
        this.ActiveToothIndex = index;
      },
      AlertLevels: alertLevels,
      // DataChanged
      DataChanged: false,
      setDataChanged: function (dataHasChanged) {
        hasChanges = dataHasChanged;
        this.DataChanged = dataHasChanged;
        return this.DataChanged;
      },
      getNewExam: function (personId, teeth, usePreviousExam) {
        return getNewPerioExam(personId, teeth, usePreviousExam);
      },
      getBleedingAll: function () {
        if (this.ActivePerioExam && this.ActivePerioExam.ExamDetails) {
          var examDetails = this.ActivePerioExam.ExamDetails;

          if (examDetails != null) {
            return !examDetails.some(detail => {
              return detail.BleedingPocket.some(value => {
                return (
                  (detail.ToothState == null ||
                    detail.ToothState.indexOf('Missing') === -1) &&
                  (value == false || value == null)
                );
              });
            });
          }
        }

        return false;
      },
      getSuppurationAll: function () {
        if (this.ActivePerioExam && this.ActivePerioExam.ExamDetails) {
          var examDetails = this.ActivePerioExam.ExamDetails;

          if (examDetails != null) {
            return !examDetails.some(detail => {
              return detail.SuppurationPocket.some(value => {
                return (
                  (detail.ToothState == null ||
                    detail.ToothState.indexOf('Missing') === -1) &&
                  (value == false || value == null)
                );
              });
            });
          }
        }

        return false;
      },
      setBleedingAll: function (newValue) {
        var examDetails = this.ActivePerioExam.ExamDetails;

        if (examDetails != null) {
          angular.forEach(examDetails, function (detail) {
            if (
              detail.ToothState == null ||
              detail.ToothState.indexOf('Missing') === -1
            ) {
              if (newValue == true) {
                detail.BleedingPocket = [true, true, true, true, true, true];
              } else {
                detail.BleedingPocket = [null, null, null, null, null, null];
              }
            }
          });
        }
      },
      setSuppurationAll: function (newValue) {
        var examDetails = this.ActivePerioExam.ExamDetails;

        if (examDetails != null) {
          angular.forEach(examDetails, function (detail) {
            if (
              detail.ToothState == null ||
              detail.ToothState.indexOf('Missing') === -1
            ) {
              if (newValue == true) {
                detail.SuppurationPocket = [true, true, true, true, true, true];
              } else {
                detail.SuppurationPocket = [null, null, null, null, null, null];
              }
            }
          });
        }
      },
      ActivePerioExam: null,
      SetActivePerioExam: function (exam) {
        if (this.ActivePerioExam !== exam) {
          this.ActivePerioExam = exam;
        }
        return this.ActivePerioExam;
      },
      AcceptableKeyCodes: function (examType) {
        return factory.getAcceptableKeyCodes(examType);
      },
      ValueByKeyCode: function (keyCode) {
        return factory.getValueWithKeyCode(keyCode);
      },
      ValueByInputValue: function (inputValue) {
        return factory.getValueByInputValue(inputValue);
      },
      getNextValidTooth: function (toothChart, activeTooth, fwdDirection) {
        var nextValidTooth = factory.getNextValidTooth(
          toothChart,
          activeTooth,
          fwdDirection
        );
        return nextValidTooth;
      },
      ActiveArch: null,
      ActiveSide: null,
      NextExamType: null,
      setActiveExamParameters: function (activeArch, activeSide, examType) {
        this.ActiveArch = activeArch;
        this.ActiveSide = activeSide;
        this.NextExamType = examType;
      },
      PerioFocusToggle: false,
      setActivePerioFocus: function (toggle) {
        this.PerioFocusToggle = toggle;
      },
      ToggleExam: false,
      setToggleExam: function (toggleExam) {
        this.ToggleExam = toggleExam;
        return this.ToggleExam;
      },
      // yes these are duplicates to ActiveQuadrant, but that is used to drive other behavior
      ActivePerioQuadrant: null,
      setActivePerioQuadrant: function (quadrant) {
        this.ActivePerioQuadrant = quadrant;
        return quadrant;
      },
      ArrowAdvanceToNextValidTooth: function (
        activePerioExam,
        activeTooth,
        arrowDirection
      ) {
        return factory.arrowAdvanceToNextValidTooth(
          activePerioExam,
          activeTooth,
          arrowDirection
        );
      },
      // clear observers when patient changes
      clearObservers: function () {
        observers = [];
        factory.focusedIndexObservers = [];
      },
      // subscribe to focusedIndexObservers
      observeFocusedIndex: function (observer) {
        factory.focusedIndexObservers.push(observer);
      },
      // subscribe to exams list changes
      observeExams: function (observer) {
        observers.push(observer);
      },
      TeethDefinitions: function (observer) {
        return teethDefinitions;
      },
      getInputArrayForTooth: function (examType, surface, examForActiveTooth) {
        return factory.getInputArrayForTooth(
          examType,
          surface,
          examForActiveTooth
        );
      },
      PerioComparisonInfo: function (personId, examIds) {
        return factory.getPerioComparisonInfo(personId, examIds);
      },
      ActiveExamPath: null,
      setActiveExamPath: function (path) {
        if (this.ActivePerioExam && path) {
          var examDetails = this.ActivePerioExam.ExamDetails;
          // always remove missing teeth from path
          var filter = function (tp) {
            var toothId = tp.slice(0, tp.indexOf(','));
            var detailForTooth = listHelper.findItemByFieldValue(
              examDetails,
              'ToothNumber',
              toothId
            );
            return detailForTooth &&
              detailForTooth.ToothState &&
              detailForTooth.ToothState.indexOf('Missing') !== -1
              ? false
              : true;
          };
          this.ActiveExamPath = angular.copy(path);
          this.ActiveExamPath.ToothPockets = $filter('filter')(
            this.ActiveExamPath.ToothPockets,
            filter
          );
          this.UnfilteredActiveExamPath = angular.copy(this.ActiveExamPath);
        }
      },
      UnfilteredActiveExamPath: null,
      filterActiveExamPath: function (examType) {
        // special filtering for exam types that do not have all the pockets
        var currentFocusedToothPocket = null;
        if (this.FocusedIndex > 0 && !_.isNil(this.ActiveExamPath)) {
          currentFocusedToothPocket = this.ActiveExamPath.ToothPockets[
            this.FocusedIndex
          ];
        }
        this.ActiveExamPath = angular.copy(this.UnfilteredActiveExamPath);
        if (!_.isNil(this.ActiveExamPath)) {
          switch (examType) {
            case 'FurcationGradeRoot':
              var filter = function (tp) {
                var validPockets = [
                  '1,0',
                  '1,1',
                  '1,2',
                  '2,0',
                  '2,1',
                  '2,2',
                  '3,0',
                  '3,1',
                  '3,2',
                  '4,0',
                  '4,1',
                  '5,0',
                  '5,1',
                  '12,2',
                  '12,1',
                  '13,2',
                  '13,1',
                  '14,2',
                  '14,1',
                  '14,0',
                  '15,2',
                  '15,1',
                  '15,0',
                  '16,2',
                  '16,1',
                  '16,0',
                  '32,0',
                  '32,1',
                  '31,0',
                  '31,1',
                  '30,0',
                  '30,1',
                  '29,0',
                  '29,1',
                  '28,0',
                  '28,1',
                  '21,2',
                  '21,1',
                  '20,2',
                  '20,1',
                  '19,2',
                  '19,1',
                  '18,2',
                  '18,1',
                  '17,2',
                  '17,1',
                ];
                return validPockets.indexOf(tp) !== -1 ? true : false;
              };
              this.ActiveExamPath.ToothPockets = $filter('filter')(
                this.ActiveExamPath.ToothPockets,
                filter
              );
              var counter = 0;
              var lastToothId;
              var newList = [];
              var examDetails = this.ActivePerioExam.ExamDetails;
              angular.forEach(this.ActiveExamPath.ToothPockets, function (tp) {
                var toothId = tp.slice(0, tp.indexOf(','));
                var detailForTooth = listHelper.findItemByFieldValue(
                  examDetails,
                  'ToothNumber',
                  toothId
                );
                if (!isNaN(detailForTooth.ToothId)) {
                  if (toothId === lastToothId) {
                    newList.push(toothId + ',' + counter++);
                  } else {
                    counter = 0;
                    newList.push(toothId + ',' + counter++);
                  }
                }
                lastToothId = toothId;
              });
              this.ActiveExamPath.ToothPockets = newList;
              if (currentFocusedToothPocket != null) {
                var toothId = currentFocusedToothPocket.substring(
                  0,
                  currentFocusedToothPocket.indexOf(',')
                );
                var pocketIndex = currentFocusedToothPocket.slice(
                  currentFocusedToothPocket.indexOf(',') + 1
                );
                var focusedIndex = this.ActiveExamPath.ToothPockets.indexOf(
                  toothId + ',' + pocketIndex
                );

                this.setFocusedIndex(focusedIndex);
              }
              break;
            case 'Mobility':
              var filter = function (tp) {
                var validPockets = [
                  '1,0',
                  '2,0',
                  '3,0',
                  '4,0',
                  '5,0',
                  '6,0',
                  '7,0',
                  '8,0',
                  '9,0',
                  '10,0',
                  '11,0',
                  '12,0',
                  '13,0',
                  '14,0',
                  '15,0',
                  '16,0',
                  '17,0',
                  '18,0',
                  '19,0',
                  '20,0',
                  '21,0',
                  '22,0',
                  '23,0',
                  '24,0',
                  '25,0',
                  '26,0',
                  '27,0',
                  '28,0',
                  '29,0',
                  '30,0',
                  '31,0',
                  '32,0',
                ];
                return validPockets.indexOf(tp) !== -1 ? true : false;
              };
              this.ActiveExamPath.ToothPockets = $filter('filter')(
                this.ActiveExamPath.ToothPockets,
                filter
              );
              if (this.FocusedIndex > 0 && this.ActiveTooth > 0) {
                var focusedIndex = this.ActiveExamPath.ToothPockets.indexOf(
                  this.ActiveTooth + ',0'
                );

                this.setFocusedIndex(focusedIndex);
              }
              break;
            default:
              if (currentFocusedToothPocket != null) {
                var toothId = currentFocusedToothPocket.substring(
                  0,
                  currentFocusedToothPocket.indexOf(',')
                );
                var pocketIndex = currentFocusedToothPocket.slice(
                  currentFocusedToothPocket.indexOf(',') + 1
                );
                var focusedIndex = this.ActiveExamPath.ToothPockets.indexOf(
                  toothId + ',' + pocketIndex
                );

                this.setFocusedIndex(focusedIndex);
              }
              break;
          }
        }
      },
      FocusedIndex: 0,
      setFocusedIndex: function (focusedIndex) {
        this.FocusedIndex = focusedIndex;
        angular.forEach(factory.focusedIndexObservers, function (observer) {
          observer(focusedIndex);
        });
      },
      getPerioExamPaths: function () {
        return factory.getPerioExamPaths();
      },
      setActiveExamType: function (examType) {
        angular.forEach(this.ExamTypes, function (type) {
          if (examType) {
            type.Active =
              type.Abbrev === examType.Abbrev || type.Type === examType.Type
                ? true
                : false;
          }
        });
      },
      ExamTypes: [
        { Abbrev: 'dp', Active: true, Type: 'DepthPocket' },
        { Abbrev: 'gm', Active: false, Type: 'GingivalMarginPocket' },
        { Abbrev: 'mgj', Active: false, Type: 'MgjPocket' },
        { Abbrev: 'mob', Active: false, Type: 'Mobility' },
        { Abbrev: 'fg', Active: false, Type: 'FurcationGradeRoot' },
      ],
      convertNullsToZero: function (examDetails) {
        return factory.convertNullsToZero(examDetails);
        },
      IsGMNegativeMode: false
    };
  },
]);
