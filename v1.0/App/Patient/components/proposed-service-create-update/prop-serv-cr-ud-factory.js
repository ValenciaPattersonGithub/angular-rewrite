(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .factory('ProposedServiceFactory', ProposedServiceFactory);

  ProposedServiceFactory.$inject = ['ListHelper', 'PatientOdontogramFactory'];

  function ProposedServiceFactory(listHelper, patientOdontogramFactory) {
    var factory = {
      GetSmartCode: getSmartCode,
      GetSmartCodeForRootAffectedArea: getSmartCodeForRootAffectedArea,
      GetNumberOfRoots: getNumberOfRoots,
      GetNumberOfSurfaces: getNumberOfSurfaces,
      checkPropertiesByAffectedArea: checkPropertiesByAffectedArea,
    };

    //Certain surfaces, when selected together, count as one surface.
    function getNumberOfSurfaces(activeSurfaces) {
      var surfacesSelected = activeSurfaces.length;
      if (surfacesSelected < 2) {
        return surfacesSelected;
      }
      if (
        listHelper.findItemByFieldValue(
          activeSurfaces,
          'SurfaceAbbreviation',
          'L'
        ) &&
        listHelper.findItemByFieldValue(
          activeSurfaces,
          'SurfaceAbbreviation',
          'L5'
        )
      ) {
        surfacesSelected--;
      }
      if (
        listHelper.findItemByFieldValue(
          activeSurfaces,
          'SurfaceAbbreviation',
          'B/F'
        ) &&
        listHelper.findItemByFieldValue(
          activeSurfaces,
          'SurfaceAbbreviation',
          'B5/F5'
        )
      ) {
        surfacesSelected--;
      }
      return surfacesSelected;
    }

    // NOTE if affectedArea is 3 numberOfRoots refers to the number of root channels for the selected tooth
    function getSmartCodeForRootAffectedArea(
      numberOfRoots,
      currentServiceCode
    ) {
      if (numberOfRoots.length > 0) {
        var smartCodeId = 'SmartCode' + numberOfRoots.length + 'Id';
        var smartCode = _.find(
          patientOdontogramFactory.serviceCodes,
          function (serviceCode) {
            return (
              serviceCode.ServiceCodeId === currentServiceCode[smartCodeId]
            );
          }
        );
        return smartCode;
      }
      return '';
    }

    // if affectedArea is 4 activeSurfaces refers to the selected surfaces for the selected tooth
    function getSmartCode(activeSurfaces, currentServiceCode) {
      var surfacesSelected = getNumberOfSurfaces(activeSurfaces);
      if (surfacesSelected > 0) {
        var smartCode = 'SmartCode' + surfacesSelected + 'Id';
        var nextSmartCode = '';
        if (surfacesSelected <= 5) {
          nextSmartCode = listHelper.findItemByFieldValue(
            patientOdontogramFactory.serviceCodes,
            'ServiceCodeId',
            currentServiceCode[smartCode]
          );
        } else {
          nextSmartCode = listHelper.findItemByFieldValue(
            patientOdontogramFactory.serviceCodes,
            'ServiceCodeId',
            currentServiceCode.SmartCode5Id
          );
        }
      }

      return nextSmartCode;
    }

    function getNumberOfRoots(teeth) {
      if (_.isEmpty(teeth)) {
        return [];
      }

      var oneRootTeeth = [
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '56',
        '57',
        '58',
        '59',
        '60',
        '72',
        '73',
        '74',
        '75',
        '76',
        '77',
        'C',
        'CS',
        'D',
        'DS',
        'E',
        'ES',
        'F',
        'FS',
        'G',
        'GS',
        'H',
        'HS',
        'M',
        'MS',
        'N',
        'NS',
        'O',
        'OS',
        'P',
        'PS',
        'Q',
        'QS',
        'R',
        'RS',
        '6, 56',
        '7, 57',
        '8, 58',
        '9, 59',
        '10, 60',
        '11, 61',
        '22, 72',
        '23, 73',
        '24, 74',
        '25, 75',
        '26, 76',
        '27, 77',
        'C, CS',
        'D, DS',
        'E, ES',
        'F, FS',
        'G, GS',
        'H, HS',
        'M, MS',
        'N, NS',
        'O, OS',
        'P, PS',
        'Q, QS',
        'R, RS',
      ];

      var twoRootTeeth = [
        '4',
        '5',
        '12',
        '13',
        '20',
        '21',
        '28',
        '29',
        '54',
        '55',
        '62',
        '63',
        '70',
        '71',
        '78',
        '79',
        '4, 54',
        '5, 55',
        '12, 62',
        '13, 63',
        '20, 70',
        '21, 71',
        '28, 78',
        '29, 79',
      ];

      var threeRootTeeth = [
        '1',
        '2',
        '3',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '30',
        '31',
        '32',
        '51',
        '52',
        '53',
        '64',
        '65',
        '66',
        '67',
        '68',
        '69',
        '80',
        '81',
        '82',
        'A',
        'B',
        'I',
        'J',
        'K',
        'L',
        'S',
        'T',
        'AS',
        'BS',
        'IS',
        'JS',
        'KS',
        'LS',
        'SS',
        'TS',
        '1, 51',
        '2, 52',
        '3, 53',
        '14, 64',
        '15, 65',
        '16, 66',
        '17, 67',
        '18, 68',
        '19, 69',
        '30, 80',
        '31, 81',
        '32, 82',
        'A, AS',
        'B, BS',
        'I, IS',
        'J, JS',
        'K, KS',
        'L, LS',
        'S, SS',
        'T, TS',
      ];

      if (_.includes(oneRootTeeth, teeth)) {
        return [1];
      }
      if (_.includes(twoRootTeeth, teeth)) {
        return [1, 2];
      }
      if (_.includes(threeRootTeeth, teeth)) {
        return [1, 2, 3];
      }
      return [];
    }

    // check for changes to the affected area of a service code which would change the properties allowed for this service transaction
    // null any properties that aren't valid for the new AffectedAreaId
    function checkPropertiesByAffectedArea(serviceTransaction, serviceCodes) {
      // find the service code match
      var serviceCode = _.find(serviceCodes, function (serviceCode) {
        return serviceCode.ServiceCodeId === serviceTransaction.ServiceCodeId;
      });
      if (!_.isNil(serviceCode)) {
        switch (serviceCode.AffectedAreaId) {
          case 1:
            serviceTransaction.Roots = null;
            serviceTransaction.RootSummaryInfo = null;
            serviceTransaction.Tooth = null;
            serviceTransaction.Surface = null;
            serviceTransaction.SurfaceSummaryInfo = null;
            break;
          case 3:
            serviceTransaction.Surface = null;
            serviceTransaction.SurfaceSummaryInfo = null;
            break;
          case 4:
            serviceTransaction.Roots = null;
            serviceTransaction.RootSummaryInfo = null;
            break;
          case 5:
            serviceTransaction.Roots = null;
            serviceTransaction.RootSummaryInfo = null;
            serviceTransaction.Surface = null;
            serviceTransaction.SurfaceSummaryInfo = null;
            break;
        }
      }
    }

    return factory;
  }
})();
