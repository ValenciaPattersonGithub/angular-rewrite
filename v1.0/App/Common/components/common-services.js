'use strict';

angular
  .module('common.services', ['ngResource', 'PatWebCore'])
  .provider('SoarConfig', [
      '$injector',
    function SoarConfigProvider($injector) {
        this.$get = function SoarConfigFactory() {
        var enterpriseUrl = $injector.get('ENTERPRISE_URL');
        var enterpriseSettingUrl = $injector.get('ENTERPRISE_SETTING_URL');
        var pdcoEnterpriseUrl = $injector.get('PDCO_ENTERPRISE_URL');
        var webApiUrl = $injector.get('WEB_API_URL');
        var platformUserServiceUrl = $injector.get('PLATFORM_USER_SERVICE_URL');
        var domainUrl = $injector.get('DOMAIN_API_URL');
        var paymentGatewayUrl = $injector.get('PAYMENT_PAY_PAGE_URL');
        var fileApiUrl = $injector.get('FILE_API_URL');
        var rteApiUrl = $injector.get('RTE_API_URL');
        var rxApiUrl = $injector.get('RX_API_URL');
        var claimApiUrl = $injector.get('CLAIM_API_URL');
        var eraApiUrl = $injector.get('ERA_API_URL');
        var tenant = $injector.get('TENANT');
        var clientId = $injector.get('CLIENT_ID');
        var rootUrl = $injector.get('ROOT_URL');
        var resetPasswordUrl = $injector
          .get('RESET_PASSWORD_URL')
          .replace(/&amp;/g, '&');
        var supportChatUrl = $injector.get('SUPPORT_CHAT_URL');
        var supportEmailUrl = $injector.get('SUPPORT_EMAIL_URL');
        var environmentName = $injector.get('ENVIRONMENT_NAME');
        var supportLiveChatUrl = $injector.get('SUPPORT_LIVECHAT_URL');
        var supportLiveChatProductCode = $injector.get(
          'SUPPORT_LIVECHAT_PRODUCT_CODE'
        );
        var enableBlue = $injector.get('ENABLE_BLUE');
        var enableUlt = $injector.get('ENABLE_ULT');
        var clinicalApiUrl = $injector.get('CLINICAL_API_URL');
        var sapiSchedulingApiUrl = $injector.get('SAPI_SCHEDULING_API_URL');
        var insuranceSapiUrl = $injector.get('INSURANCE_SAPI_URL');
        var statusPageUrl = $injector.get('Status_Page_Url');
        var fuseNewReportingApiUrl = $injector.get('FUSE_NEW_REPORTING_API_URL');
        var fuseExportApiUrl = $injector.get('FUSE_EXPORT_API_URL');
        var fuseReferralManagementApiUrl = $injector.get('FUSE_REFERRAL_MANAGEMENT_API_URL');
        var prmUrl = $injector.get('PRMUrl');
        var fuseNotificationGatewayServiceUrl = $injector.get('FUSE_NOTIFICATION_GATEWAY_SERVICE_URL');
        var duendeRootUrl = $injector.get('DUENDE_ROOT_URL');
        var mfaSettingsUrl = $injector.get('MFA_SETTINGS_URL');

        return {
          domainUrl: domainUrl,
          paymentGatewayUrl: paymentGatewayUrl,
          enterpriseUrl: enterpriseUrl,
          enterpriseSettingUrl: enterpriseSettingUrl,
          pdcoEnterpriseUrl: pdcoEnterpriseUrl,
          webApiUrl: webApiUrl,
          platformUserServiceUrl: platformUserServiceUrl,
          fileApiUrl: fileApiUrl,
          rteApiUrl: rteApiUrl,
          rxApiUrl: rxApiUrl,
          claimApiUrl: claimApiUrl,
          eraApiUrl: eraApiUrl,
          idaTenant: tenant,
          azureApplicationId: clientId,
          rootUrl: rootUrl,
          resetPasswordUrl: resetPasswordUrl,
          supportChatUrl: supportChatUrl,
          supportEmailUrl: supportEmailUrl,
          environmentName: environmentName,
          supportLiveChatUrl: supportLiveChatUrl,
          supportLiveChatProductCode: supportLiveChatProductCode,
          enableBlue: enableBlue,
          enableUlt: enableUlt,
          clinicalApiUrl: clinicalApiUrl,
          sapiSchedulingApiUrl: sapiSchedulingApiUrl,
          insuranceSapiUrl: insuranceSapiUrl,
          statusPageUrl: statusPageUrl,
          launchDarklyClientId: $injector.get('LAUNCH_DARKLY_CLIENT_ID'),
          fuseNewReportingApiUrl: fuseNewReportingApiUrl,
          fuseExportApiUrl: fuseExportApiUrl,
          fuseReferralManagementApiUrl: fuseReferralManagementApiUrl,
          prmUrl: prmUrl,
          fuseNotificationGatewayServiceUrl: fuseNotificationGatewayServiceUrl,
          duendeRootUrl: duendeRootUrl,
          mfaSettingsUrl: mfaSettingsUrl
          };
      };
    },
  ])
  .service('CommonServices', [
    '$resource',
    '$http',
    '$q',
    'StandardService',
    'PatCacheFactory',
    function ($resource, $http, $q, standardService, cacheFactory) {
      var patCache = cacheFactory.GetCache(
        'CommonServices',
        'aggressive',
        60000,
        60000
      );
      var practiceSettingsCache = cacheFactory.GetCache(
        'PracticeSettingsService',
        'aggressive',
        600000,
        600000,
      );
      var benefitPlansCache = cacheFactory.GetCache(
        'InsuranceBenefitPlanServices',
        'aggressive',
        60000,
        60000
      );
      var carriersCache = cacheFactory.GetCache(
        'CarriersServices',
        'aggressive',
        60000,
        60000
      );
      var feeSchedulesCache = cacheFactory.GetCache(
        'FeeSchedulesServices',
        'aggressive',
        60000,
        60000
      );

      return {
        Holidays: {
          ObjectName: 'Holidays',
          Operations: $resource('_schedulingapi_/api/v0/holidays',
            {},
            {
              Retrieve: { method: 'GET' }
            }
          )
        },
        PracticeSettings: {
          ObjectName: 'Practice Settings',
          Operations: $resource(
            '_practicesapi_/api/v1/practicesettings/',
            {},
            {
              Retrieve: { method: 'GET', cache: practiceSettingsCache },
              Create: { method: 'POST', cache: practiceSettingsCache },
              Update: { method: 'PUT', cache: practiceSettingsCache },
              Delete: { method: 'DELETE' },
            }
          ),
          PracticeSetup: $resource(
            '_practicesapi_/api/v1/practicesettings/practicesetup/',
            {},
            {
              Retrieve: { 
                method: 'GET',
                params: { InputValue: '@InputValue' },
              },
            }
          ),
          IsValid: function (settings) {
            return settings && settings.DefaultTimeIncrement > 0;
          },
        },
        Insurance: {
          BenefitPlan: $resource(
            '_insurancesapi_/insurance/BenefitPlan/:BenefitId/:Category',
            {},
            {
              get: { method: 'GET', cache: benefitPlansCache },
              getActive: {
                method: 'GET',
                cache: benefitPlansCache,
                url: '_insurancesapi_/insurance/BenefitPlan/Active',
              },
              getById: {
                method: 'GET',
                cache: benefitPlansCache,
                params: { BenefitId: '@BenefitId', isCopy: '@IsCopy' },
              },
              getByCarrierId: {
                method: 'GET',
                url: '_insurancesapi_/insurance/Carrier/:CarrierId/BenefitPlans',
                cache: benefitPlansCache,
                params: { CarrierId: '@CarrierId' },
              },
              findDuplicates: {
                method: 'GET',
                params: { Category: 'duplicates' },
              },
              hasUnsubmittedClaims: {
                method: 'GET',
                params: { Category: 'unsubClaims' },
              },
              update: {
                method: 'PUT',
                cache: benefitPlansCache,
                params: { isCarrierChanged: '@isCarrierChanged' },
              },
              updateCarrierChanged: {
                method: 'PUT',
                cache: benefitPlansCache,
                params: { isCarrierChanged: 'true' },
              },
              save: { method: 'POST', cache: benefitPlansCache },
              search: {
                method: 'POST',
                url: '_insurancesapi_/insurance/benefitplangrid',
              },
              delete: { method: 'DELETE', cache: benefitPlansCache },
            }
          ),
          Carrier: $resource(
            '_insurancesapi_/insurance/carrier/:carrierId/:Category',
            { carrierId: '@id' },
            {
              get: { method: 'GET', cache: carriersCache },
              getActive: {
                method: 'GET',
                cache: carriersCache,
                url: '_insurancesapi_/insurance/carrier/active',
              },
              search: {
                method: 'POST',
                url: '_insurancesapi_/insurance/carrierGrid',
              },
              getPlansSummaryById: {
                method: 'GET',
                url: '_insurancesapi_/insurance/carrier/attachedPlansSummary/:carrierId',
              },
              /** using built-in angular resource calls */
              findDuplicates: {
                method: 'GET',
                params: { Category: 'duplicates' },
              },
              update: { method: 'PUT', cache: carriersCache },
              save: { method: 'POST', cache: carriersCache },
              delete: {
                method: 'DELETE',
                cache: carriersCache,
              },
            }
          ),
          CHCCarriers: $resource(
            '_insurancesapi_/insurance/claimpayer',
            {},
            {
              get: { method: 'GET' },
            }
          ),
          FeeSchedule: $resource(
            '_insurancesapi_/feeschedule',
            {},
            {
              /** using built-in angular resource calls */
              get: { method: 'GET', cache: feeSchedulesCache },
              save: { method: 'POST', cache: feeSchedulesCache },
              delete: { method: 'DELETE', cache: feeSchedulesCache },
              update: { method: 'PUT', cache: feeSchedulesCache },
              getById: {
                method: 'GET',
                cache: feeSchedulesCache,
                url: '_insurancesapi_/feeschedule/:feeScheduleId',
                params: { feeScheduleId: '@feeScheduleId' },
              },
              getByLocation: {
                method: 'GET',
                url: '_insurancesapi_/feeschedule/:feeScheduleId/location/:locationId',
                params: {
                  feescheduleId: '@feeScheduleId',
                  locationId: '@locationId',
                },
              },
              checkDuplicateFeeScheduleName: {
                method: 'GET',
                url: '_insurancesapi_/feeschedule/duplicates/:feeScheduleId',
                params: { feeScheduleId: '@feeScheduleId' },
              },
            }
          ),
          Claim: $resource(
            '_insurancesapi_/insurance/claims/',
            {},
            {
              getJ430DClaimById: {
                method: 'GET',
                url: '_insurancesapi_/insurance/claims/:claimId',
                params: { claimId: '@claimId' },
              },
              changeSubmissionMethod: {
                method: 'PUT',
                url: '_insurancesapi_/insurance/claims/:claimId/changeSubmittalMethod',
                params: { claimId: '@claimId' },
              },
              updateJ430DClaim: {
                method: 'PUT',
                url: '_insurancesapi_/insurance/claims/:claimId/dentalj430d',
                params: { claimId: '@claimId' },
              },
              getMedicalCMS1500ById: {
                method: 'GET',
                url: '_insurancesapi_/insurance/claims/:claimId/medicalcms1500',
                params: { claimId: '@claimId' },
              },
              updateMedicalCMS1500ById: {
                method: 'PUT',
                url: '_insurancesapi_/insurance/claims/:claimId/medicalcms1500',
                params: { claimId: '@claimId' },
              },
            }
          ),
          CarrierAttachedPlansPdf: function (data) {
            var q = $q.defer();
            $http({
              url: '_insurancesapi_/insurance/carrier/attachedPlansPdf',
              method: 'POST',
              data: data,
              responseType: 'arraybuffer',
            }).then(
              function (response) {
                q.resolve(response);
              },
              function (error) {
                q.reject(error);
              }
            );
            return q.promise;
          },
          ClaimPdf: function (url) {
            var q = $q.defer();
            $http
              .get(url, {
                responseType: 'arraybuffer',
              })
              .then(
                function (res) {
                  q.resolve(res);
                },
                function (error) {
                  q.reject(error);
                }
              );

            return q.promise;
          },
          PrintClaimBatch: function (claimIds) {
            var q = $q.defer();
            $http
              .post('_insurancesapi_/insurance/claims/pdfbatch', claimIds, {
                responseType: 'arraybuffer',
              })
              .then(
                function (res) {
                  q.resolve(res);
                },
                function (error) {
                  q.reject(error);
                }
              );

            return q.promise;
          },
        },
      };
    },
  ])
  .service('CdtCodeService', [
    '$resource',
    'patSecurityService',
    function ($resource, patSecurityService) {
      return $resource(
        '_soarapi_/cdtcodes',
        {},
        {
          getList: { method: 'GET', isArray: false },
          search: { method: 'GET', url: '_soarapi_/cdtcodes/search' },
          IsValid: {
            method: 'GET',
            params: { Code: '@Code' },
            url: '_soarapi_/cdtcodes/IsValid',
          },
        }
      );
    },
  ])
  .service('DiscountTypesService', [
    '$resource',
    'PatCacheFactory',
    function ($resource, cacheFactory) {
      var discountTypesCache = cacheFactory.GetCache(
        'DiscountTypesService',
        'aggressive',
        120000,
        120000
      );
      return $resource(
        '_soarapi_/discounttypes/:Id',
        {},
        {
          get: { method: 'GET', cache: discountTypesCache },
          save: { method: 'POST', cache: discountTypesCache },
          update: { method: 'PUT', cache: discountTypesCache },
          delete: { method: 'DELETE', cache: discountTypesCache },
          patientsWithDiscount: {
            method: 'GET',
            url: '_soarapi_/discounttypes/:Id/patients',
          },
        }
      );
    },
  ])
  .service('DomainHeaderService', function () {
    var headerData = {
      practiceId: '',
      userId: '',
    };
    //console.log('here');
    ////TODO this is a hack...I'm not able to inject patSecurity here...causes circular reference
    //    // patSecurity has methods to get the userId and PracticeId
    //var userContext = JSON.parse(localStorage.getItem('userContext'));
    //if (userContext) {
    //    if (userContext.data.UserPractices[0]) {
    //        // get the practice id
    //        var id = userContext.data.UserPractices[0].Id;
    //        var result = "10000000-0000-0000-0000-000000000000";
    //        headerData.practiceId = (result.slice(0, 36 -id.toString().length).concat(id));
    //        // get the user id
    //        var userId = userContext.data.User.UserId;
    //        headerData.userId = userId;
    //        console.log(headerData.userId);
    //    };
    //};

    var addDomainHeaders = function (config) {
      config.headers.PtcSoarPracticeId = headerData.practiceId;
      config.headers.PtcSoarUserId = headerData.userId;
      config.headers.PtcSoarUtcOffset = moment().utcOffset() / 60;
    };

    this.addDomainHeaders = addDomainHeaders;
    this.headerData = headerData;
  })
  .service('DomainLocatorService', [
    'SoarConfig',
    'DomainHeaderService',
    function (soarConfig, headerSvc) {
      var request = function (config) {
        if (config.url.indexOf('_soarapi_') >= 0) {
          config.url = config.url.replace('_soarapi_', soarConfig.domainUrl);
          headerSvc.addDomainHeaders(config);
        }

        if (soarConfig && _.isEqual(soarConfig.environmentName, 'FuseQA')) {
          var hostName = window.location.hostname;
          var domain = hostName.substring(
            hostName.lastIndexOf('.', hostName.lastIndexOf('.') - 1) + 1
          );

          // ensure request is going to a fuse domain before including cookies
          if (config.url.indexOf(domain) >= 0) {
            config.withCredentials = true;
          }
        }

        if (config.noPatHeaders === true) {
          delete config.headers['Access-Control-Expose-Headers'];
        }
        return config;
      };

      this.request = request;
    },
  ])
  .service('ClinicalLocatorService', [
    'SoarConfig',
    'DomainHeaderService',
    function (soarConfig, headerSvc) {
      var request = function (config) {
        if (config.url.indexOf('_clinicalapi_') >= 0) {
          config.url = config.url.replace(
            '_clinicalapi_',
            soarConfig.clinicalApiUrl
          );
          headerSvc.addDomainHeaders(config);
        }

        if (soarConfig && _.isEqual(soarConfig.environmentName, 'FuseQA')) {
          var hostName = window.location.hostname;
          var domain = hostName.substring(
            hostName.lastIndexOf('.', hostName.lastIndexOf('.') - 1) + 1
          );

          // ensure request is going to a fuse domain before including cookies
          if (config.url.indexOf(domain) >= 0) {
            config.withCredentials = true;
          }
        }

        if (config.noPatHeaders === true) {
          delete config.headers['Access-Control-Expose-Headers'];
        }
        return config;
      };

      this.request = request;
    },
  ])
  .service('SAPIScheduleLocatorService', [
    'SoarConfig',
    'DomainHeaderService',
    function (soarConfig, headerSvc) {
      var request = function (config) {
        if (config.url.indexOf('_sapischeduleapi_') >= 0) {
          config.url = config.url.replace(
            '_sapischeduleapi_',
            soarConfig.sapiSchedulingApiUrl
          );
          headerSvc.addDomainHeaders(config);
        }

        if (soarConfig && _.isEqual(soarConfig.environmentName, 'FuseQA')) {
          var hostName = window.location.hostname;
          var domain = hostName.substring(
            hostName.lastIndexOf('.', hostName.lastIndexOf('.') - 1) + 1
          );

          // ensure request is going to a fuse domain before including cookies
          if (config.url.indexOf(domain) >= 0) {
            config.withCredentials = true;
          }
        }

        if (config.noPatHeaders === true) {
          delete config.headers['Access-Control-Expose-Headers'];
        }
        return config;
      };

      this.request = request;
    },
  ])
  .service('SchedulingLocatorService', [
    'IdmConfig',
    'DomainHeaderService',
    function (idmConfig, headerSvc) {
      var request = function (config) {
        if (config.url.indexOf('_schedulingapi_') >= 0 ) {
          config.url = config.url.replace('_schedulingapi_', idmConfig.schedulingApimUrl);
          headerSvc.addDomainHeaders(config);
        }
        return config;
      }
      this.request = request;
    }
  ])
  .service('InsuranceSapiLocatorService', [
    'SoarConfig',
    'IdmConfig',
    'DomainHeaderService',
    function (soarConfig, idmConfig, headerSvc) {
      var request = function (config) {
        if (config.url.indexOf('_insurancesapi_') >= 0) {
          config.url = config.url.replace(
            '_insurancesapi_',
            soarConfig.insuranceSapiUrl
          );
          headerSvc.addDomainHeaders(config);
        }

        if (config.url.indexOf('_practicesapi_') >= 0) {
          config.url = config.url.replace(
            '_practicesapi_',
            idmConfig.practicesApimUrl
          );
          headerSvc.addDomainHeaders(config);
        }

        if (soarConfig && _.isEqual(soarConfig.environmentName, 'FuseQA')) {
          var hostName = window.location.hostname;
          var domain = hostName.substring(
            hostName.lastIndexOf('.', hostName.lastIndexOf('.') - 1) + 1
          );

          // ensure request is going to a fuse domain before including cookies
          if (config.url.indexOf(domain) >= 0) {
            config.withCredentials = true;
          }
        }

        if (config.noPatHeaders === true) {
          delete config.headers['Access-Control-Expose-Headers'];
        }
        return config;
      };

      this.request = request;
    },
  ])
  .service('InsuranceApiLocatorService', [
    'IdmConfig',
    'DomainHeaderService',
    function (idmConfig, headerSvc) {
      var request = function (config) {
        if (config.url.indexOf('_insuranceapiurl_') >= 0) {
          config.url = config.url.replace(
            '_insuranceapiurl_',
            idmConfig.insuranceApiUrl
          );
          headerSvc.addDomainHeaders(config);
        }

        if (config.noPatHeaders === true) {
          delete config.headers['Access-Control-Expose-Headers'];
        }
        return config;
      };

      this.request = request;
    },
  ])
  .service('ReportingApiLocatorService', [
    'IdmConfig',
    'DomainHeaderService',
    function (idmConfig, headerSvc) {
      var request = function (config) {
        if (config.url.indexOf('_reportingapiurl_') >= 0) {
          config.url = config.url.replace(
            '_reportingapiurl_',
            idmConfig.reportingApiUrl
          );
          headerSvc.addDomainHeaders(config);
        }
        else if (config.url.indexOf('_newreportingapiurl_') >= 0) {
          config.url = config.url.replace(
            '_newreportingapiurl_',
            idmConfig.newReportingApiUrl
          );
          headerSvc.addDomainHeaders(config);
        }
        else if (config.url.indexOf('_exportapiurl_') >= 0) {
          config.url = config.url.replace(
            '_exportapiurl_',
            idmConfig.exportApiUrl
          );
          headerSvc.addDomainHeaders(config);
          }
        else if (config.url.indexOf('_notificationgatewayserviceurl_') >= 0) {
            config.url = config.url.replace(
                '_notificationgatewayserviceurl_',
                idmConfig.fuseNotificationGatewayServiceUrl
            );
            headerSvc.addDomainHeaders(config);
        }

        if (config.noPatHeaders === true) {
          delete config.headers['Access-Control-Expose-Headers'];
        }
        return config;
      };

      this.request = request;
    },
  ])
  .service('ApiCallHandlerService', [
    '$injector',
    'SoarConfig',
    '$q',
    '$timeout',
    '$location',
    function ($injector, soarConfig, $q, $timeout, $location) {
      var modal,
        openCount = 0,
        modalService;

      var closeModal = function () {
        if (openCount > 0) {
          openCount--;
        }

        if (modal) {
          if (openCount == 0) {
            modal.dismiss();
            modal = null;
          }
        }
      };

      var parseConfig = function (config) {
        if (
          config &&
          (angular.isUndefined(config.data) ||
            (config.data && !config.data.uiSuppressModal)) &&
          config.url &&
          (config.url.indexOf(soarConfig.domainUrl) >= 0 ||
            config.url.indexOf(soarConfig.insuranceSapiUrl) >= 0 ||
            config.url.includes('/api/v1/reports/') ||
            config.url.includes('/api/v1/customReports/')) &&
          ['POST', 'PUT', 'DELETE'].indexOf(config.method) >= 0
        ) {
          if (
            config.url.includes('/api/v1/reports/') &&
            config.skipLoader == true
          )
                return false;

            //show loader with message in this case. It is handled in attachments-modal.js
            if (
                config.url.includes('/insurance/claims/attachment') &&
                ['POST'].indexOf(config.method) >= 0
            )
                return false;

          //intercept to disable loader for uiSuppressModal property on params object in case of data "array". Maybe refactor into above "if" logic later  -mb
          if (config.hasOwnProperty('params')) {
            if (config.params.hasOwnProperty('uiSuppressModal')) {
              if (config.params.uiSuppressModal == true) {
                return false;
              }
            }
          }
          //intercept to disable loader for uiSuppressModal property on params object in case of data "array". Maybe refactor into above "if" logic later  -mb
          if (config.hasOwnProperty('data')) {
            if (config.data.length > 0) {
              if (config.data[0].hasOwnProperty('uiSuppressModal')) {
                if (config.data[0].uiSuppressModal == true) {
                  return false;
                }
              }
            }
          }
          //
          return true;
        }
        return false;
      };

      var errorResponseFunc = function (message, rejection) {
        if (!modalService) {
          modalService = $injector.get('$uibModal');
        }
        modalService.open({
          templateUrl:
            'App/Common/components/errorResponseModal/errorResponseModal.html',
          controller: 'ErrorResponseModalController',
          size: 'lg',
          windowClass: 'warning-modal-center test',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            item: function () {
              return {
                Title: rejection.statusText,
                Message: message,
                Button1Text: 'Refresh Now',
                Button2Text: 'Close',
              };
            },
          },
        });
      };

      var httpErrorResponseHandler = function (rejection) {
        var errorMessage;
        var localize = $injector.get('localize');
        switch (rejection.status) {
          case 409:
            errorMessage = localize.getLocalizedString(
              'Another user has made changes, refresh the page to see the latest information.'
            );
            errorResponseFunc(errorMessage, rejection);
            break;

          case 404:
            errorMessage = localize.getLocalizedString(
              'Another user has made changes, refresh your screen.'
            );
            errorResponseFunc(errorMessage, rejection);
            break;
        }
      };

      var request = function (config) {
        if (!modalService) {
          modalService = $injector.get('$uibModal');
        }
        if (
          $location.$$path !== '/Dashboard/' &&
          $location.$$path !== '/BusinessCenter/PracticeAtAGlance' &&
          $location.$$path !== '/'
        ) {
          if (parseConfig(config)) {
            openCount++;
            $timeout(function () {
              if (!modal && openCount > 0) {
                modal = modalService.open({
                  template:
                    '<div>' +
                    '  <i class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
                    '</div>',
                  size: 'sm',
                  windowClass: 'modal-loading',
                  backdrop: 'static',
                  keyboard: false,
                });
              }
            }, 1500);
          }
        }
        return config;
      };
      var requestError = function (rejection) {
        if (rejection && rejection.config && parseConfig(rejection.config)) {
          closeModal();
        }
        return $q.reject(rejection);
      };
      var response = function (resp) {
        if (resp && resp.config && parseConfig(resp.config)) {
          closeModal();
        }
        return resp;
      };
      var responseError = function (rejection) {
        if (rejection && rejection.config && parseConfig(rejection.config)) {
          closeModal();
          httpErrorResponseHandler(rejection);
        }
        return $q.reject(rejection);
      };

      this.request = request;
      this.requestError = requestError;
      this.response = response;
      this.responseError = responseError;
    },
  ])
  .service('EnterpriseLocatorService', [
    'SoarConfig',
    function (soarConfig) {
      var request = function (config) {
        if (config.url.indexOf('_enterpriseurl_') >= 0) {
          config.url = config.url.replace(
            '_enterpriseurl_',
            soarConfig.enterpriseUrl
          );
        } else if (config.url.indexOf('_enterprisesettingurl_') >= 0) {
          config.url = config.url.replace(
            '_enterprisesettingurl_',
            soarConfig.enterpriseSettingUrl
          );
        } else if (config.url.indexOf('_platformUserServiceUrl_') >= 0){
          config.url = config.url.replace('_platformUserServiceUrl_', soarConfig.platformUserServiceUrl);
        } else if (config.url.indexOf('_pdcoenterpriseurl_') >= 0) {
          config.url = config.url.replace(
            '_pdcoenterpriseurl_',
            soarConfig.pdcoEnterpriseUrl
          );
        } else if (config.url.indexOf('_webapiurl_') >= 0) {
          config.url = config.url.replace('_webapiurl_', soarConfig.webApiUrl);
        } else if (config.url.indexOf('_fileapiurl_') >= 0) {
          config.url = config.url.replace(
            '_fileapiurl_',
            soarConfig.fileApiUrl
          );
        } else if (config.url.indexOf('_rxapiurl_') >= 0) {
          config.url = config.url.replace('_rxapiurl_', soarConfig.rxApiUrl);
        } else if (config.url.indexOf('_claimapiurl_') >= 0) {
          config.url = config.url.replace(
            '_claimapiurl_',
            soarConfig.claimApiUrl
          );
        } else if (config.url.indexOf('_eraapiurl_') >= 0) {
          config.url = config.url.replace('_eraapiurl_', soarConfig.eraApiUrl);
        } else if (config.url.indexOf('_rteApiUrl_') >= 0) {
          config.url = config.url.replace(
            '_rteApiUrl_',
            soarConfig.rteApiUrl
          );
        }
        return config;
      };
      this.request = request;
    },
  ])
  .service('ApiCallDelayService', [
    '$q',
    '$rootScope',
    'UserFetchStatus',
    function ($q, $rootScope, userFetchStatus) {
      var request = function (config) {
        if (config.url.indexOf('_soarapi_') < 0 || userFetchStatus.complete) {
          return config;
        }

        if (config.params && config.params.$bypassDelay) {
          delete config.params.$bypassDelay;
          return config;
        }

        var deferred = $q.defer();

        $rootScope.$on('fuse:initheader', function () {
          deferred.resolve(config);
        });

        return deferred.promise;
      };

      this.request = request;
    },
  ])
  .service('GroupTypeService', [
    '$resource',
    'PatCacheFactory',
    function ($resource, cacheFactory) {
      /**
       * @ngdoc service
       * @name BusinessCenter.factory:GroupTypeService
       * @description Service to access API to supply Group Type data
       **/
      var groupTypesCache = cacheFactory.GetCache(
        'GroupTypeService',
        'aggressive',
        120000,
        120000
      );
      return $resource(
        '_soarapi_/patientgroups/:Id',
        {},
        {
          get: {
            method: 'GET',
            url: '_soarapi_/patientgroups',
            cache: groupTypesCache,
          },
          save: { method: 'POST', cache: groupTypesCache },
          update: { method: 'PUT', cache: groupTypesCache },
          delete: { method: 'DELETE', cache: groupTypesCache },
          groupTypeWithPatients: {
            method: 'GET',
            url: '_soarapi_/patientgroups/:Id/patients',
          },
        }
      );
    },
  ])
  .service('CustomReportService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_soarapi_/customreports',
        {},
        {
          getProviders: {
            method: 'GET',
            url: '_soarapi_/customreports/providers',
          },
          getLocations: {
            method: 'GET',
            url: '_soarapi_/customreports/locations',
          },
        }
      );
    },
  ])
  .service('PatientAdditionalIdentifierService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_soarapi_/masterpatientidentifiers/:Id',
        {},
        {
          Delete: { method: 'DELETE' },
          update: { method: 'PUT' },
          additionalIdentifiersWithPatients: {
            method: 'GET',
            url: '_soarapi_/masterpatientidentifiers/:Id/patients',
          },
        }
      );
    },
  ])
  .service('DrawTypesService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_soarapi_/drawtypes/:Id',
        {},
        {
          // update: { method: 'PUT', params: { Id: '@Id' } },
        }
      );
    },
  ])
  .service('DocumentGroupsService', [
    '$resource',
    'PatCacheFactory',
    function ($resource, cacheFactory) {
      var documentGroupsCache = cacheFactory.GetCache(
        'DocumentGroups',
        'aggressive',
        60000,
        60000
      );
      return $resource(
        '_soarapi_/documentgroups/:Id',
        {},
        {
          get: {
            method: 'GET',
            cache: documentGroupsCache,
            params: { Id: '@Id' },
          },
          save: { method: 'POST', cache: documentGroupsCache, isArray: false },
          getAll: {
            method: 'GET',
            cache: documentGroupsCache,
            url: '_soarapi_/documentgroups',
          },
          update: { method: 'PUT', cache: documentGroupsCache, isArray: false },
          delete: {
            method: 'DELETE',
            cache: documentGroupsCache,
            params: { Id: '@Id' },
          },
        }
      );
    },
  ])
  .service('DocumentService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_soarapi_/documents/',
        {},
        {
          getByDocumentId: {
            method: 'GET',
            url: '_soarapi_/documents/:documentId',
            params: { documentId: '@documentId' },
          },
          get: {
            method: 'GET',
            url: '_soarapi_/documents/:parentType/:parentId',
            params: { parentId: '@patientId', parentType: '@parentType' },
          },
          delete: {
            method: 'DELETE',
            url: '_soarapi_/documents/:documentId',
            params: { documentId: '@documentId' },
          },
          updateDirectoryAllocationId: {
            method: 'PUT',
            url: '_fileapiurl_/api/locations/:locationId/files/:fileId/transfer/:TransferToDirectoryAllocationId',
            params: {
              locationId: '@locationId',
              fileId: '@fileId',
              TransferToDirectoryAllocationId:
                '@TransferToDirectoryAllocationId',
            },
          },
        }
      );
    },
  ])
  .service('RecentDocumentsService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_soarapi_/users/current/recentDocuments',
        {},
        {
          update: {
            method: 'PUT',
            params: { returnList: '@returnList' },
            url: '_soarapi_/users/current/recentDocuments?returnList=:returnList',
          },
          get: { method: 'GET' },
        }
      );
    },
  ])
  .service('TreatmentPlanSnapshotService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_clinicalapi_/treatmentplansnapshots/:Id',
        {},
        {
          getSignatureFileAllocationId: {
            method: 'GET',
            url: '_clinicalapi_/treatmentplansnapshots/:Id/signatureFileId',
          },
          create: { method: 'POST' },
        }
      );
    },
  ])
  .service('ConditionsService', [
    '$resource',
    'PatCacheFactory',
    function ($resource, cacheFactory) {
      var patCache = cacheFactory.GetCache(
        'ConditionsServices',
        'aggressive',
        60000,
        60000
      );
      return $resource(
        '_soarapi_/conditions/:Id',
        {},
        {
          get: { method: 'GET', cache: patCache },
          save: { method: 'POST', cache: patCache },
          update: { method: 'PUT', cache: patCache, params: { Id: '@Id' } },
          Delete: { method: 'DELETE', cache: patCache, params: { Id: '@Id' } },
        }
      );
    },
  ])
  .service('MasterAlertService', [
    '$resource',
    'PatCacheFactory',
    function ($resource, cacheFactory) {
      var masterAlertsCache = cacheFactory.GetCache(
        'MasterAlertService',
        'aggressive',
        120000,
        120000
      );
      return $resource(
        '_soarapi_/patientalerts/:Id',
        {},
        {
          get: { method: 'GET', cache: masterAlertsCache },
          save: { method: 'POST', cache: masterAlertsCache },
          update: { method: 'PUT', cache: masterAlertsCache },
          delete: { method: 'DELETE', cache: masterAlertsCache },
          alertsWithPatients: {
            method: 'GET',
            url: '_soarapi_/patientalerts/:Id/patients',
          },
        }
      );
    },
  ])
  .service('ReferralSourcesService', [
    '$resource',
    'PatCacheFactory',
    function ($resource, cacheFactory) {
      var referralSourcesCache = cacheFactory.GetCache(
        'ReferralSourcesService',
        'aggressive',
        120000,
        120000
      );
      return $resource(
        '_soarapi_/referralsources/:Id',
        {},
        {
          get: { method: 'GET', cache: referralSourcesCache },
          save: { method: 'POST', cache: referralSourcesCache },
          update: { method: 'PUT', cache: referralSourcesCache },
          delete: { method: 'DELETE', cache: referralSourcesCache },
          patientsWithSource: {
            method: 'GET',
            url: '_soarapi_/referralsources/:Id/patients',
          },
        }
      );
    },
  ])
  .service('GlobalSearchServices', [
    '$resource',
    'PatCacheFactory',
    function ($resource, cacheFactory) {
      var patCache = cacheFactory.GetCache(
        'GlobalSearchServices',
        'aggressive',
        60000,
        60000
      );
      return {
        MostRecent: $resource(
          '_soarapi_/globalsearch/mostrecent',
          {},
          {
            get: { method: 'GET', cache: patCache },
            save: { method: 'POST', cache: patCache },
          }
        ),
      };
    },
  ])
  .service('SearchService', [
    '$q',
    function ($q) {
      var self = this,
        defer = $q.defer();
      this.searchTerm = '';
      this.observeSearchTerm = function () {
        return defer.promise;
      };
      this.setTerm = function (searchTerm) {
        self.searchTerm = searchTerm;
        defer.notify(self.searchTerm);
      };
    },
  ])
  .service('StaticDataService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_soarapi_/applicationsettings/:category',
        {},
        {
          AffectedAreas: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/affectedareas',
          },
          AlertIcons: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/alerticons',
          },
          Departments: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/departments',
          },
          PhoneTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/PhoneTypes',
          },
          ProviderTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/providertypes',
          },
          ReferralTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/referraltypes',
          },
          States: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/states',
          },
          TaxonomyCodes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/taxonomycodes',
          },
          TaxableServices: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/taxableservicetypes',
          },
          PlannedServiceStatuses: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/plannedservicestatus',
          },
          ServiceTransactionStatuses: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/servicetransactionstatus',
          },
          NoteTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/notetypes',
          },
          StatusTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/statustypes',
          },
          CurrencyTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/currencytypes',
          },
          //CdtCodes: { method: 'GET', url: '_soarapi_/practicesettings/cdtcodes' },
          TransactionTypes: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/transactiontypes',
          },
          TeethDefinitions: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/teethdefinitions',
          },
          CdtCodeGroups: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/cdtcodegroups',
          },
          ConditionStatus: {
            method: 'GET',
            url: '_soarapi_/applicationsettings/conditionStatus',
          },
        }
      );
    },
  ])
  //Undo / Redo support for the  scope
  .service('UndoSupportService', [
    '$rootScope',
    '$parse',
    function ($rootScope, $parse) {
      var MAX_STRING_CHANGE_SIZE = 1000;
      var MAX_UNDOS_REDOS = 5;
      var isDefined = angular.isDefined,
        isUndefined = angular.isUndefined,
        isFunction = angular.isFunction,
        isArray = angular.isArray,
        isString = angular.isString,
        isObject = angular.isObject,
        isDate = angular.isDate,
        forEach = angular.forEach,
        copy = angular.copy,
        bind = angular.bind;

      function isRegExp(value) {
        return value instanceof RegExp;
      }
      function isWindow(obj) {
        return obj && obj.window === obj;
      }
      function isScope(obj) {
        return obj && obj.$evalAsync && obj.$watch;
      }
      function equals(o1, o2) {
        if (isUndefined(o1)) {
          o1 = '';
        }
        if (isUndefined(o2)) {
          o2 = '';
        }
        if (o1 === o2)
          return {
            isEqual: true,
            unequalVariable: '',
            stringDiff: false,
            o1: o1,
            o2: o2,
          };
        if (o1 === null || o2 === null)
          return {
            isEqual: false,
            unequalVariable: '',
            stringDiff: false,
            o1: o1,
            o2: o2,
          };
        if (o1 !== o1 && o2 !== o2)
          return {
            isEqual: true,
            unequalVariable: '',
            stringDiff: false,
            o1: o1,
            o2: o2,
          }; // NaN === NaN
        var t1 = typeof o1,
          t2 = typeof o2,
          length,
          key,
          keySet;
        if (t1 == t2) {
          if (t1 == 'string') {
            if (o1 != o2) {
              return {
                isEqual: false,
                unequalVariable: '',
                stringDiff: true,
                o1: o1,
                o2: o2,
              };
            }
          }
          if (isUndefined(t1)) {
            if (o1 != o2) {
              return {
                isEqual: false,
                unequalVariable: '',
                stringDiff: true,
                o1: o1,
                o2: o2,
              };
            }
          }
          if (t1 == 'object') {
            if (isArray(o1)) {
              if (!isArray(o2))
                return {
                  isEqual: false,
                  unequalVariable: '',
                  stringDiff: false,
                  o1: o1,
                  o2: o2,
                };
              if ((length = o1.length) == o2.length) {
                var returnEq = {
                  isEqual: true,
                  unequalVariable: '',
                  stringDiff: false,
                  o1: o1,
                  o2: o2,
                };
                for (key = 0; key < length; key++) {
                  var eq = equals(o1[key], o2[key]);
                  if (!eq.isEqual) {
                    eq.unequalVariable =
                      '[' + String(key) + ']' + eq.unequalVariable;
                    if (!eq.stringDiff) {
                      return eq;
                    } else {
                      returnEq = eq;
                    }
                  }
                }
                return returnEq;
              }
            } else if (isDate(o1)) {
              return {
                isEqual: isDate(o2) && o1.getTime() == o2.getTime(),
                unequalVariable: '',
                stringDiff: false,
                o1: o1,
                o2: o2,
              };
            } else if (isRegExp(o1) && isRegExp(o2)) {
              return {
                isEqual: o1.toString() == o2.toString(),
                unequalVariable: '',
                stringDiff: false,
                o1: o1,
                o2: o2,
              };
            } else {
              if (
                isScope(o1) ||
                isScope(o2) ||
                isWindow(o1) ||
                isWindow(o2) ||
                isArray(o2)
              )
                return {
                  isEqual: false,
                  unequalVariable: '',
                  stringDiff: false,
                  o1: o1,
                  o2: o2,
                };
              keySet = {};
              var returnEq = {
                isEqual: true,
                unequalVariable: '',
                stringDiff: false,
                o1: o1,
                o2: o2,
              };
              for (key in o1) {
                if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
                var eq = equals(o1[key], o2[key]);
                if (!eq.isEqual) {
                  eq.unequalVariable = '.' + String(key) + eq.unequalVariable;
                  if (!eq.stringDiff) {
                    return eq;
                  } else {
                    returnEq = eq;
                  }
                }
                keySet[key] = true;
              }
              for (key in o2) {
                if (
                  !keySet.hasOwnProperty(key) &&
                  key.charAt(0) !== '$' &&
                  o2[key] !== undefined &&
                  !isFunction(o2[key])
                )
                  return {
                    isEqual: false,
                    unequalVariable: '',
                    stringDiff: false,
                    o1: o1,
                    o2: o2,
                  };
              }
              return returnEq;
            }
          }
        } else if (t1 == 'undefined' || t2 == 'undefined') {
          return {
            isEqual: false,
            unequalVariable: '',
            stringDiff: true,
            o1: o1,
            o2: o2,
          };
        }
        return {
          isEqual: false,
          unequalVariable: '',
          stringDiff: false,
          o1: o1,
          o2: o2,
        };
      }
      function similarStringDifference(string1, string2) {
        if (string1 && string2) {
          var s1, s2;
          if (string1.length > string2.length) {
            s2 = string1.split('');
            s1 = string2.split('');
          } else {
            s1 = string1.split('');
            s2 = string2.split('');
          }
          var j = 0;
          var difference;
          var differences = [];
          for (var i = 0; i < s1.length && j < s2.length; i++) {
            difference = '';
            while (s1[i] != s2[j] && j < s2.length) {
              difference += s2[j];
              j++;
            }
            if (difference) differences.push(difference);
            if (s1[i] == s2[j]) j++;
          }

          var areSimilar = i == s1.length;
          if (j < s2.length) {
            difference = '';
            while (j < s2.length) {
              difference += s2[j];
              j++;
            }
            differences.push(difference);
          }
        } else if (isUndefined(string1) || isUndefined(string2)) {
          var areSimilar = true;
          var differences = [''];
        } else {
          var areSimilar = false;
          var differences = [];
        }

        return { areSimilar: areSimilar, differences: differences };
      }
      function tooSimilar(differences) {
        var whiteSpace = /\s/g;

        if (differences.length == 1) {
          for (var a in differences[0]) {
            if (a !== 'contains' && differences[0][a].match(whiteSpace)) {
              return false;
            }
          }
        } else {
          return false;
        }
        return true;
      }

      this.record = function record(
        watchVar,
        scope,
        stringHandling,
        noWatchVars
      ) {
        var newWatch = new Watch(watchVar, scope, stringHandling, noWatchVars);
        return newWatch;
      };
      var Watch = function Watch(watchVar, scope, stringHandling, noWatchVars) {
        if (!isString(watchVar)) {
          throw new Error(
            'Watch variable that is not a string was passed to Service.'
          );
        } else {
          this.watchVar = watchVar;
          this.parsedWatchVar = $parse(watchVar);
          if (isUndefined(this.parsedWatchVar(scope))) {
            throw new Error(
              watchVar +
              ', the watch variable passed to Service, is not defined in the given scope.'
            );
          }
        }

        if (isUndefined(scope)) {
          throw new Error('Undefined scope passed to Service.');
        } else {
          if (isScope(scope)) {
            this.isScope = true;
          } else if (isObject(scope)) {
            this.isScope = false;
          } else {
            throw new Error('Incorrect scope type passed to Service.');
          }
          this.scope = scope;
        }

        if (stringHandling !== true && stringHandling !== 'true') {
          this.stringHandling = false;
        } else {
          this.stringHandling = true;
        }

        this.parsedNoWatchVars = [];
        if (isArray(noWatchVars)) {
          for (var i in noWatchVars) {
            if (!isString(noWatchVars[i])) {
              throw new Error(
                "Not all passed 'no watch' variables are in string format"
              );
            } else {
              this.parsedNoWatchVars.push($parse(noWatchVars[i]));
              if (isUndefined(this.parsedNoWatchVars[i](scope))) {
                throw new Error(
                  noWatchVars[i] +
                  ", a 'no watch' variable passed to Service, is not defined in the given scope"
                );
              }
            }
          }
        } else if (isString(noWatchVars)) {
          this.parsedNoWatchVars.push($parse(noWatchVars));
          if (isUndefined(this.parsedNoWatchVars[0](scope))) {
            throw new Error(
              noWatchVars +
              ", the 'no watch' variable passed to Service, is not defined in the given scope"
            );
          }
        } else if (!isUndefined(noWatchVars)) {
          throw new Error("Incorect type for 'no watch' variables");
        }

        this.archive = [];
        this.onAdjustFunctions = [];
        this.onRedoFunctions = [];
        this.onUndoFunctions = [];
        this.currArchivePos = null;
        this.numberOfUndos = 0;

        this.addWatch();
      };

      Watch.prototype.addOnAdjustFunction = function addOnAdjustFunction(fn) {
        if (isFunction(fn)) {
          this.onAdjustFunctions.push(fn);
        } else {
          throw new Error(
            'Function added to run on adjustment is not a function'
          );
        }
      };

      Watch.prototype.removeOnAdjustFunction = function removeOnAdjustFunction(
        fn
      ) {
        this.onAdjustFunctions.splice(this.onAdjustFunctions.indexOf(fn), 1);
      };

      Watch.prototype.addOnUndoFunction = function addOnUndoFunction(fn) {
        if (isFunction(fn)) {
          this.onUndoFunctions.push(fn);
        } else {
          throw new Error('Function added to run on undo is not a function');
        }
      };

      Watch.prototype.removeOnUndoFunction = function removeOnUndoFunction(fn) {
        this.onUndoFunctions.splice(this.onUndoFunctions.indexOf(fn), 1);
      };

      Watch.prototype.addOnRedoFunction = function addOnRedoFunction(fn) {
        if (isFunction(fn)) {
          this.onRedoFunctions.push(fn);
        } else {
          throw new Error('Function added to run on redo is not a function');
        }
      };

      Watch.prototype.removeOnRedoFunction = function removeOnRedoFunction(fn) {
        this.onRedoFunctions.splice(this.onRedoFunctions.indexOf(fn), 1);
      };

      Watch.prototype.clear = function clear() {
        this.archive.splice(0, this.archive.length - 1);
        this.currArchivePos = 0;
        this.numberOfUndos = 0;
        for (var i = 0; i < this.onAdjustFunctions.length; i++) {
          this.onAdjustFunctions[i]();
        }
      };
      Watch.prototype.undo = function undo() {
        if (this.canUndo()) {
          this.currArchivePos -= 1;
          this.numberOfUndos += 1;
          this.revert(this.currArchivePos);

          for (var i = 0; i < this.onUndoFunctions.length; i++) {
            this.onUndoFunctions[i]();
          }
          return true;
        }
        return false;
      };

      Watch.prototype.redo = function redo() {
        if (this.canRedo()) {
          this.currArchivePos += 1;
          this.numberOfUndos -= 1;
          this.revert(this.currArchivePos);

          for (var i = 0; i < this.onRedoFunctions.length; i++) {
            this.onRedoFunctions[i]();
          }
          return true;
        }
        return false;
      };

      Watch.prototype.revert = function revert(revertToPos) {
        this.parsedWatchVar.assign(
          this.scope,
          copy(this.archive[revertToPos].watchVar)
        );

        for (var i = 0; i < this.parsedNoWatchVars.length; i++) {
          this.parsedNoWatchVars[i].assign(
            this.scope,
            copy(this.archive[revertToPos].noWatchVars[i])
          );
        }
      };

      Watch.prototype.canRedo = function canRedo() {
        if (this.numberOfUndos <= MAX_UNDOS_REDOS) {
          if (this.currArchivePos < this.archive.length - 1) {
            return true;
          }
        }
        return false;
      };

      Watch.prototype.canUndo = function canUndo() {
        if (this.numberOfUndos < MAX_UNDOS_REDOS) {
          if (this.currArchivePos > 0) {
            return true;
          }
        }
        return false;
      };

      Watch.prototype.addToArchive = function addToArchive() {
        var shouldBeAdded = false;

        if (this.archive.length) {
          var eq = equals(
            this.parsedWatchVar(this.scope),
            this.archive[this.currArchivePos].watchVar
          );
          if (!eq.isEqual) {
            if (!isUndefined(eq.o1)) {
              shouldBeAdded = true;

              var parsedUnequalVariable = $parse(
                this.watchVar + eq.unequalVariable
              );

              if (this.stringHandling && eq.stringDiff) {
                var tooSim = false;
                var differenceObject = similarStringDifference(eq.o1, eq.o2);

                if (differenceObject.areSimilar) {
                  if (
                    this.archive[this.currArchivePos].parsedUnequalVariable ==
                    parsedUnequalVariable
                  ) {
                    var tooSim = tooSimilar(differenceObject.differences);
                    var typeofVar = $parse('watchVar' + eq.unequalVariable)(
                      this.archive[this.currArchivePos - 1]
                    );
                    if (!isUndefined(typeofVar)) {
                      if (typeof typeofVar != 'string') {
                        tooSim = false;
                      } else if (tooSim) {
                        if (
                          Math.abs(
                            typeofVar.length -
                            $parse('watchVar' + eq.unequalVariable)(
                              this.archive[this.currArchivePos]
                            ).length
                          ) >= MAX_STRING_CHANGE_SIZE
                        ) {
                          tooSim = false;
                        }
                      }
                    }
                  }
                }
              }
            } else {
              shouldBeAdded = false;
            }
          }
        } else {
          shouldBeAdded = true;
        }

        if (shouldBeAdded) {
          this.newEntry(tooSim, parsedUnequalVariable);
        }
      };

      Watch.prototype.newEntry = function newEntry(
        removeOneBefore,
        parsedUnequalVariable
      ) {
        var currentSnapshot = {};
        currentSnapshot.noWatchVars = [];
        currentSnapshot.parsedUnequalVariable = parsedUnequalVariable;

        currentSnapshot.watchVar = copy(this.parsedWatchVar(this.scope));

        for (var i = 0; i < this.parsedNoWatchVars.length; i++) {
          currentSnapshot.noWatchVars.push(
            copy(this.parsedNoWatchVars[i](this.scope))
          );
        }

        if (this.archive.length - 1 > this.currArchivePos) {
          this.archive.splice(0, this.currArchivePos);
          this.archive.splice(1, this.archive.length);
        }

        if (removeOneBefore) {
          this.archive.splice(this.currArchivePos, 1);
        }

        this.archive.push(currentSnapshot);
        this.currArchivePos = this.archive.length - 1;
        this.numberOfUndos = 0;
        for (i = 0; i < this.onAdjustFunctions.length; i++) {
          this.onAdjustFunctions[i]();
        }
      };

      Watch.prototype.addWatch = function addWatch() {
        var _this = this;
        if (_this.isScope) {
          _this.cancelWatch = _this.scope.$watch(
            _this.watchVar,
            function () {
              _this.addToArchive.apply(_this);
            },
            true
          );
        } else {
          _this.cancelWatch = $rootScope.$watch(
            bind(_this, function () {
              return _this.parsedWatchVar(_this.scope);
            }),
            function () {
              _this.addToArchive.apply(_this);
            },
            true
          );
        }
      };
    },
  ])
  .service('UserSettingsService', [
    '$resource',
    function ($resource) {
      return $resource(
        '_soarapi_/users/setting',
        {},
        {
          update: { method: 'PUT' },
        }
      );
    },
  ])
  .service('ColorUtilities', function () {
    var hexToRgb = function (hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
        : null;
    };

    this.hexToRgb = hexToRgb;
  })
  .service('DiscardChangesService', function () {
    this.currentChangeRegistration = {
      controller: null,
      hasChanges: false,
      customMessage: null,
    };

    this.onRegisterController = function (changeRegistration) {
      this.currentChangeRegistration = changeRegistration;
    };
  })
  .service('DiscardService', function () {
    // controllers that need validated
    this.controllers = [
      'PatientCrudController',
      'LocationCrudController',
      'UserCrudController',
      'CustomFormsController',
      'PatientDashboardController',
      'NoteTemplatesController',
      'TreatmentConsentController',
      'ServiceCodeSearchController',
      //'FeeListsLandingController',
      'UserRolesByLocationController',
      'InformedConsentSetupController',
      'IdealDaysCrudController',
      'PaymentTypesController',
      'PredeterminationAuthorizationController',
    ];

    // determining if we have a controller that we need to validate
    this.getRelevantController = function (controllerName) {
      var relevantController;
      angular.forEach(this.controllers, function (ctrl) {
        if (!relevantController && controllerName === ctrl) {
          relevantController = controllerName;
        }
      });
      return relevantController;
    };

    // determining whether or not the passed controller has changes, also used to reset on discard confirmation
    this.hasChanges = function (controllerName, scope, resetting) {
      var result = false;
      switch (controllerName) {
        case this.controllers[0]:
          if (resetting) {
            scope.updateDataHasChangedFlag(resetting);
            result = scope.dataHasChanged;
          }
          break;
        case this.controllers[1]:
          scope.updateDataHasChangedFlag(resetting);
          result = scope.dataHasChanged;
          break;
        case this.controllers[2]:
          if (resetting) {
            scope.user = scope.originalUser;
          }
          // for ie
          for (var key in scope.user) {
            if (key == 'Address') {
              for (var addresskey in scope.user[key]) {
                if (
                  scope.user[key][addresskey] == undefined ||
                  scope.user[key][addresskey] == ''
                ) {
                  scope.user[key][addresskey] = null;
                }
              }
            } else if (
              key == 'Color' &&
              scope.user[key] == '#7F7F7F' &&
              !scope.editMode
            ) {
              scope.user[key] = null;
            } else if (key == 'ProviderTypeId') {
              if (scope.user[key] == 4 && scope.originalUser[key] == null) {
                scope.user[key] = null;
              }
            } else if (
              scope.user[key] == undefined ||
              (scope.user[key] == '' && key != 'UserId')
            ) {
              scope.user[key] = null;
            } else if (scope.user[key] == 'ProviderOnClaimsRelationship') {
              if (scope.user[key] == 0 && scope.originalUser[key] == null) {
                scope.user[key] = null;
              }
            }
          }
          result = !angular.equals(scope.user, scope.originalUser);
          break;
        case this.controllers[3]:
          if (resetting) {
            scope.dataHasChanged = true;
          }
          result = !scope.dataHasChanged && !scope.modalIsOpen;
          break;
        case this.controllers[4]:
          if (resetting) {
            scope.dataHasChanged = false;
            scope.medicalHistoryHasChanged = false;
          }
          if (scope.personalInfo && scope.personalInfo.Updated === true) {
            delete scope.personalInfo.Updated;
            result = false;
          }
          if (scope.medicalHistoryHasChanged === true) {
            result = true;
          } else {
            if (scope.personalInfo) {
              delete scope.personalInfo.PatientId;
            }
            if (scope.dataHasChanged) {
              result = true;
            }
          }
          break;
        case this.controllers[5]:
          if (resetting) {
            scope.resetData();
          } else {
            result = scope.hasChanges().EitherChanged;
          }
          break;
        case this.controllers[6]:
          if (resetting) {
            scope.resetData();
          } else {
            result = scope.hasChanges;
          }
          break;
        case this.controllers[7]:
          if (resetting) {
            scope.resetData();
          } else {
            result = scope.hasChanges;
          }
          break;
        case this.controllers[8]:
          if (resetting) {
            scope.resetDataForInlineEdit(true);
          } else {
            result = !_.isEmpty(scope.updatedServiceCodes);
          }
          break;
        // case this.controllers[9]: // FeeListsLandingController
        //   resetting == true
        //     ? scope.resetData()
        //     : (result = scope.dataForCrudOperation.DataHasChanged);
        //   break;
        case this.controllers[10]: // UserRoleByLocationController
          resetting == true
            ? scope.resetData()
            : (result = scope.dataHasChanged);
          break;
        case this.controllers[11]: // InformedConsentSetupController
          resetting == true
            ? scope.resetData()
            : (result = scope.dataHasChanged);
          break;
        case this.controllers[12]: // IdealDaysCrudController
          resetting == true
            ? scope.resetData()
            : (result = scope.dataHasChanged);
          break;
        case this.controllers[13]:
          if (resetting) {
            scope.resetData();
          } else {
            result = scope.hasCreateChanges() || scope.hasEditChanges();
          }
          break;
        case this.controllers[14]:
          resetting == true
            ? scope.resetData()
            : (result = scope.userHasEnteredData);
          break;
        case this.controllers[15]: // 'PatientNotesCrudController'
          resetting == true
            ? scope.resetData()
            : (result = scope.dataHasChanged);
          break;
      }
      return result;
    };
  })
  .service('ObjectService', function () {
    // returns whether an object is empty UNTESTED
    var isEmptyObject = function (obj) {
      var name;
      for (name in obj) {
        return false;
      }
      return true;
    };

    // returns difference between 2 objects UNTESTED
    this.diff = function (nv, ov) {
      var result = {};
      var change;
      for (var key in nv) {
        if (typeof nv[key] == 'object' && typeof ov[key] == 'object') {
          change = this.diff(ov[key], nv[key]);
          if (isEmptyObject(change) === false) {
            result[key] = change;
          }
        } else if (nv[key] != ov[key]) {
          result[key] = nv[key];
        }
      }
      return result;
    };

    // used to make 'empty' properties consistent before comparison
    this.convertEmptyProperties = function (obj, newValue) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== 0) {
          if (
            obj[key] == null ||
            obj[key] == undefined ||
            obj[key] == '' ||
            /^\s+$/.test(obj[key])
          ) {
            obj[key] = newValue;
          }
        }
      }
      return obj;
    };

    this.objectAreEqual = function (obj1, obj2) {
      return angular.equals(
        this.convertEmptyProperties(obj1, ''),
        this.convertEmptyProperties(obj2, '')
      );
    };
  })
  .service('DocumentsLoadingService', [
    '$http',
    '$window',
    '$sce',
    'toastrFactory',
    'localize',
    function ($http, $window, $sce, toastrFactory, localize) {
      this.executeDownload = function (uri, doc, window, downloadOnly) {
        var config = {
          headers: {
            Accept: 'application/octet-stream',
          },
          responseType: 'arraybuffer',
        };

        $http
          .get(uri, config)
          .then(function (res) {
            var octetStreamMime = 'application/octet-stream';
            var success = false;
            var filename = doc.Name;
            var contentType = res.headers('Content-Type') || octetStreamMime;
            // Get the blob url creator
            var urlCreator =
              $window.URL ||
              $window.webkitURL ||
              $window.mozURL ||
              $window.msURL;
            if (urlCreator) {
              var blob = new Blob([res.data], { type: contentType });
              if ($window.navigator.msSaveOrOpenBlob) {
                $window.navigator.msSaveOrOpenBlob(blob, filename);
              } else {
                var fileExtension;
                if (doc.MimeType && doc.MimeType.indexOf('/') !== -1) {
                  fileExtension = doc.MimeType.slice(
                    doc.MimeType.indexOf('/') + 1
                  ).toLowerCase();
                }
                if (
                  !downloadOnly &&
                  fileExtension &&
                  (fileExtension === 'jpeg' ||
                    fileExtension === 'gif' ||
                    fileExtension === 'png' ||
                    fileExtension === 'pdf')
                ) {
                  var url = urlCreator.createObjectURL(blob);
                  window = $window.open(url);

                  // workaround to set title of new tab
                  setTimeout(function () {
                    return (window.document.title = filename);
                  }, 1000);
                } else {
                  // bug 150574 - work around to keep Chrome and FF from assigning name to file
                  var a = document.createElement('a');
                  document.body.appendChild(a);
                  a.style = 'display: none';
                  var url = urlCreator.createObjectURL(blob);
                  a.href = url;
                  a.download = filename;
                  a.click();
                }
              }
            }
          })
          .catch(function () {
            toastrFactory.error(
              localize.getLocalizedString('{0} {1}', [
                'Document',
                'failed to download.',
              ]),
              localize.getLocalizedString('Server Error')
            );
          });
      };

      this.isBrowserIE = function () {
        if ($window.navigator.msSaveOrOpenBlob) {
          return true;
        } else {
          return false;
        }
      };

      this.openPrintPreview = function (document) {
        //var window;
        var printWindow;
        // special handling for IE?
        if (this.isBrowserIE()) {
          printWindow = $window.open('');
        } else {
          printWindow = $window.open('');
        }
        // document title
        if (document.title) {
          var titleHtml =
            '<html><head><title>' + document.title + '</title></head></html>';
          printWindow.document.write(titleHtml);
        }
        // load css NOTE, is there another way to handle this? ? Add in print only styling?
        printWindow.document.write(
          '<link rel="stylesheet" href="Content/public/style.css" media="all">'
        );

        // TODO move style to treatment plan less file
        printWindow.document.write(
          '</head><body><div style="margin:10px 10px 10px 10px;">'
        );

        //#region header

        // form links, email , print, export,  and cancel links NOTE localize and add amfa? add print classes for docs
        printWindow.document.write(
          '<div style="width:100%; padding:10px; text-align:left; ">'
        );

        // wrap header
        printWindow.document.write(
          '<table style="width:100%;padding:5px;font-size:20px  " ><tr>'
        );

        printWindow.document.write(
          '<td style="width:45%; overflow: hidden; text-overflow: ellipsis;max-width:100px; ">' +
          document.header.PatientName +
          '</td>'
        );
        printWindow.document.write(
          '<td style="width:45%;  ">' +
          document.header.LocationName +
          '</td></tr>'
        );

        //printWindow.document.write('<td style="width:45%; padding:10px; "></td>')
        printWindow.document.write(
          '<td style="width:45%;  "><button id="printLink" onclick="window.print()" class="btn btn-link no-print" >Print this plan</button><span><span class="no-print"> | </span><button id="cancelPrintLink" onclick="window.close()" class="btn btn-link no-print" >Close</button></td>'
        );
        printWindow.document.write(
          '<td style="width:45%;  ">' +
          document.header.LocationAddress +
          '</td></tr>'
        );

        printWindow.document.write('</tr></table >');
        printWindow.document.write('<hr>');

        //#region title
        printWindow.document.write(
          '<div><table style="width:100%; margin:10px 0px 40px 0px;"><head>'
        );
        printWindow.document.write(
          '<tr style=width:100%; padding:10px 0 10px 0" >'
        );
        printWindow.document.write(
          '<td style="width:45%;" ><h4>' + document.title + '</h4></td>'
        );
        if (document.recommendedOption) {
          printWindow.document.write(
            '<td style="width:45%;" ><img id="txPlanTileRecommendTrue" style="width:40px" src="Images/PatientClinical/insignia.svg" /></td>'
          );
        } else {
          printWindow.document.write('<td style="width:45%; "></td>');
        }
        printWindow.document.write('</tr>');

        printWindow.document.write(
          '<tr style=width:100%; padding:10px 0 40px 0;">'
        );
        printWindow.document.write(
          '<td  style="width:45%; ">' + document.date + '</td>'
        );
        if (document.recommendedOption) {
          printWindow.document.write(
            '<td style="width:40% ; padding:5px;font-size:20px ">Best Option</td>'
          );
        } else {
          printWindow.document.write('<td style="width:45%;" ></td>');
        }
        printWindow.document.write('</tr>');
        printWindow.document.write('</head></table></div>');

        //#endregion

        //#region content
        // content section
        printWindow.document.write('<div>' + document.content + '</div> ');
        //#endregion

        //#region notes
        printWindow.document.write(
          '<div style="width:100%"><h4>' +
          localize.getLocalizedString('Provider Notes') +
          '</h4></div> '
        );
        printWindow.document.write(
          '<div style="width:100%"><textarea  class="form-control" rows="3" cols="50" readonly style="background-color:#ffffff">' +
          document.notes +
          '</textarea></div> '
        );
        //#endregion

        //#region footer
        printWindow.document.write(
          '<div style="text-align:right; padding:10px 0 10px 0;">' +
          document.footer +
          '</div> '
        );
        printWindow.document.write('<hr> ');
        //#endregion

        //#region patient signature
        printWindow.document.write(
          '<div>' + document.signatureConsent + '</div> '
        );
        printWindow.document.write(
          '<div><h4>' +
          localize.getLocalizedString('Patient Signature') +
          '</h4></div> '
        );
        printWindow.document.write(
          '<div><textarea class="form-control" rows="3" cols="50" readonly style="background-color:#ffffff">' +
          document.signature +
          '</textarea></div> '
        );
        printWindow.document.write('<hr> ');
        //#endregion

        // end of doc
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.focus();
      };

      this.getDocument = function () {
        return JSON.parse(localStorage.getItem('document'));
      };

      this.setDocument = function (doc) {
        if (doc) {
          localStorage.setItem('document', JSON.stringify(doc));
        } else {
          localStorage.removeItem('document');
        }
      };
    },
  ])
  .service('DecodeJWT', [function() {
    function decodeJWT(token) {
      if (!token) {
        return null;
      }
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        return null;
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      if (!base64) {
        return null;
      }
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      if (!jsonPayload) {
        return null;
      }
      return JSON.parse(jsonPayload);
    }

    return {
      decode: decodeJWT
    };
  }]);
