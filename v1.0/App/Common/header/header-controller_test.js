describe('HeaderController ->', function () {
    var scope, ctrl, location, timeout, rootScope, referenceDataService;
    var authService,
        locationService,
        locationServices,
        optionalFeatures,
        scriptService;
    var $uibModal,
        toastrFactory,
        userRxFactory,
        modalFactory,
        rxService,
        patientRegistrationService,
        featureFlagService,
        notificationsService,
        commonServices;

    var currentLocation = {
        name: '45 Hickory Industrial Ct.',
        id: '4',
    };

    // #region mocks
    beforeEach(module('common.factories'));
    beforeEach(module('common.services'));
    beforeEach(
        module('Soar.Common', function ($provide) {
            toastrFactory = {};
            toastrFactory.error = jasmine.createSpy();
            toastrFactory.success = jasmine.createSpy();
            $provide.value('toastrFactory', toastrFactory);
            patientRegistrationService = {};
            patientRegistrationService.setRegistrationEvent = jasmine.createSpy();
            $provide.value(
                'PatientRegistrationService',
                patientRegistrationService
            );

            // mock location services
            locationServices = {
                get: jasmine.createSpy().and.returnValue({
                    then: jasmine.createSpy(),
                }),
            };
            $provide.value('LocationServices', locationServices);

            // mock userRxFactory
            userRxFactory = {
                RxNotifications: jasmine.createSpy().and.returnValue({
                    then: jasmine.createSpy(),
                }),
                NotificationFailed: jasmine.createSpy(),
                SetRxNotificationsTimer: jasmine.createSpy(),
                observeNotifications: jasmine.createSpy(),
                setLocation: jasmine.createSpy(),
                setLocationChange:jasmine.createSpy()
            };
            $provide.value('UserRxFactory', userRxFactory);

            featureFlagService = {
                getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
            };
            $provide.value('FeatureFlagService', featureFlagService);


            locationService = {
                getCurrentLocation: jasmine
                    .createSpy()
                    .and.returnValue(currentLocation),
            };
            $provide.value('locationService', locationService);

            authService = {
                login: jasmine.createSpy().and.returnValue(''),
                logout: jasmine.createSpy().and.returnValue(''),
                fillAuthData: jasmine.createSpy().and.returnValue(''),
                authData: jasmine.createSpy().and.returnValue(''),
            };
            $provide.value('AuthService', authService);

            optionalFeatures = {
                loadWalkme: jasmine.createSpy(),
            };
            $provide.value('webshellOptionalFeatures', optionalFeatures);

            referenceDataService = {
                get: jasmine.createSpy().and.returnValue({}),
                entityNames: {
                    locations: 'locations',
                },
            };

            $provide.value('referenceDataService', referenceDataService);

            modalFactory = {
                ConfirmModal: jasmine
                    .createSpy('ModalFactory.ConfirmModal')
                    .and.returnValue({ then: function () { } }),
            };

            $provide.value('ModalFactory', modalFactory);

            scriptService = {
                loadScript: jasmine.createSpy().and.returnValue({
                    then: jasmine.createSpy(),
                }),
            };

            $provide.value('ScriptService', scriptService);

            rxService = {};
            $provide.value('RxService', rxService);

            notificationsService = {
                updateNotificationBell: jasmine.createSpy('updateNotificationBell'),
                response$: {
                    subscribe: jasmine.createSpy('subscribe'),
                }
            };

            $provide.value('NotificationsService', notificationsService);

            commonServices = {
                PracticeSettings: {
                    Operations: {
                        Retrieve: () => {
                            return {
                                $promise: new Promise((resolve) => resolve({
                                    Value: {
                                        TimeIncrement: 5
                                    }
                                }))
                            }
                        }
                    }
                }
            }
            $provide.value('CommonServices', commonServices);
        })
    );

    beforeEach(inject(function (
        $rootScope,
        $controller,
        $timeout,
        $interval,
        _$uibModal_
    ) {
        location = {
            path: jasmine.createSpy(),
        };

        rootScope = $rootScope;
        scope = $rootScope.$new();
        timeout = $timeout;

        $uibModal = _$uibModal_;
        $uibModal.open = function () { };
        spyOn($uibModal, 'open').and.returnValue({
            close: function () { },
        });

        $rootScope.patAuthContext = {
            isAuthorized: true,
            userInfo: {
                userid: null,
            },
        };

        sessionStorage.setItem(
            'userContext',
            '{"Result":{"User":{"AccessLevel":2,"AccessLevelId":1,"AccessLevelName":"*** Deprecated ***","FirstName":"Chili","LastName":"Mac","UserId":"92fb91d0-fe49-e711-ba9d-8086f2269c78","UserName":"chili@pattcom.onmicrosoft.com"},"Access":[{"AccessLevel":2,"Id":1,"Name":"Default Practice - MB","Privileges":[{"Id":1100,"Name":"plapi-bus-ent-read"},{"Id":1101,"Name":"plapi-bus-ent-create"},{"Id":1102,"Name":"plapi-bus-ent-update"},{"Id":1103,"Name":"plapi-bus-ent-delete"},{"Id":1110,"Name":"plapi-bus-pra-read"},{"Id":1111,"Name":"plapi-bus-pra-create"},{"Id":1112,"Name":"plapi-bus-pra-update"},{"Id":1113,"Name":"plapi-bus-pra-delete"},{"Id":1114,"Name":"plapi-bus-pra-updmap"},{"Id":1120,"Name":"plapi-bus-loc-read"},{"Id":1121,"Name":"plapi-bus-loc-create"},{"Id":1122,"Name":"plapi-bus-loc-update"},{"Id":1123,"Name":"plapi-bus-loc-delete"},{"Id":1130,"Name":"plapi-bus-abinfo-read"},{"Id":1131,"Name":"plapi-bus-abinfo-write"},{"Id":1200,"Name":"plapi-sec-app-read"},{"Id":1201,"Name":"plapi-sec-app-create"},{"Id":1202,"Name":"plapi-sec-app-update"},{"Id":1203,"Name":"plapi-sec-app-delete"},{"Id":1210,"Name":"plapi-sec-mod-read"},{"Id":1211,"Name":"plapi-sec-mod-create"},{"Id":1212,"Name":"plapi-sec-mod-update"},{"Id":1213,"Name":"plapi-sec-mod-delete"},{"Id":1220,"Name":"plapi-sec-fun-read"},{"Id":1221,"Name":"plapi-sec-fun-create"},{"Id":1222,"Name":"plapi-sec-fun-update"},{"Id":1223,"Name":"plapi-sec-fun-delete"},{"Id":1230,"Name":"plapi-sec-act-read"},{"Id":1231,"Name":"plapi-sec-act-create"},{"Id":1232,"Name":"plapi-sec-act-update"},{"Id":1233,"Name":"plapi-sec-act-delete"},{"Id":1240,"Name":"plapi-sec-rol-read"},{"Id":1241,"Name":"plapi-sec-rol-create"},{"Id":1242,"Name":"plapi-sec-rol-update"},{"Id":1243,"Name":"plapi-sec-rol-delete"},{"Id":1250,"Name":"plapi-sec-prv-read"},{"Id":1251,"Name":"plapi-sec-prv-create"},{"Id":1252,"Name":"plapi-sec-prv-update"},{"Id":1253,"Name":"plapi-sec-prv-delete"},{"Id":1260,"Name":"plapi-sec-rolprv-read"},{"Id":1261,"Name":"plapi-sec-rolprv-create"},{"Id":1262,"Name":"plapi-sec-rolprv-delete"},{"Id":1270,"Name":"plapi-sec-prvact-read"},{"Id":1271,"Name":"plapi-sec-prvact-create"},{"Id":1272,"Name":"plapi-sec-prvact-delete"},{"Id":1300,"Name":"plapi-user-usr-read"},{"Id":1301,"Name":"plapi-user-usr-create"},{"Id":1302,"Name":"plapi-user-usr-update"},{"Id":1303,"Name":"plapi-user-usr-delete"},{"Id":1310,"Name":"plapi-user-usrloc-read"},{"Id":1311,"Name":"plapi-user-usrloc-create"},{"Id":1312,"Name":"plapi-user-usrloc-delete"},{"Id":1320,"Name":"plapi-user-usrrol-read"},{"Id":1321,"Name":"plapi-user-usrrol-create"},{"Id":1322,"Name":"plapi-user-usrrol-delete"},{"Id":1330,"Name":"plapi-user-usraut-read"},{"Id":1340,"Name":"plapi-user-usrsvc-read"},{"Id":1341,"Name":"plapi-user-usrsvc-create"},{"Id":1342,"Name":"plapi-user-usrsvc-update"},{"Id":1343,"Name":"plapi-user-usrsvc-delete"},{"Id":1350,"Name":"plapi-user-usrpra-read"},{"Id":1351,"Name":"plapi-user-usrpra-create"},{"Id":1352,"Name":"plapi-user-usrpra-delete"},{"Id":1400,"Name":"plapi-ver-apv-read"},{"Id":1401,"Name":"plapi-ver-apv-create"},{"Id":1402,"Name":"plapi-ver-apv-update"},{"Id":1403,"Name":"plapi-ver-apv-delete"},{"Id":1410,"Name":"plapi-ver-entapv-read"},{"Id":1411,"Name":"plapi-ver-entapv-create"},{"Id":1412,"Name":"plapi-ver-entapv-delete"},{"Id":1420,"Name":"plapi-ver-praapv-read"},{"Id":1421,"Name":"plapi-ver-praapv-create"},{"Id":1422,"Name":"plapi-ver-praapv-delete"},{"Id":1430,"Name":"plapi-ver-usrapv-read"},{"Id":1431,"Name":"plapi-ver-usrapv-create"},{"Id":1432,"Name":"plapi-ver-usrapv-delete"},{"Id":1500,"Name":"plapi-prms-track-read"},{"Id":1510,"Name":"plapi-prms-email-send"},{"Id":1600,"Name":"plapi-files-fsys-nav"},{"Id":1601,"Name":"plapi-files-fsys-write"},{"Id":1602,"Name":"plapi-files-fsys-read"},{"Id":1603,"Name":"plapi-files-fsys-lowlvl"},{"Id":1700,"Name":"plapi-dspart-config-read"},{"Id":1701,"Name":"plapi-dspart-config-create"},{"Id":1702,"Name":"plapi-dspart-config-update"},{"Id":1703,"Name":"plapi-dspart-config-delete"},{"Id":1800,"Name":"plapi-image-tpi-admin"},{"Id":1801,"Name":"plapi-image-tpi-query"},{"Id":1802,"Name":"plapi-image-tpi-export"},{"Id":1803,"Name":"plapi-image-tpi-share"},{"Id":1804,"Name":"plapi-image-tpi-captur"},{"Id":1805,"Name":"plapi-image-tpi-print"},{"Id":2002,"Name":"soar-per-perdem-search"},{"Id":2003,"Name":"soar-per-perdem-modify"},{"Id":2004,"Name":"soar-per-perdem-delete"},{"Id":2005,"Name":"soar-per-perdem-add"},{"Id":2006,"Name":"soar-per-perref-add"},{"Id":2007,"Name":"soar-per-perref-edit"},{"Id":2008,"Name":"soar-per-perref-delete"},{"Id":2009,"Name":"soar-per-peralt-add"},{"Id":2010,"Name":"soar-per-peralt-edit"},{"Id":2011,"Name":"soar-per-peralt-delete"},{"Id":2012,"Name":"soar-per-perdsc-add"},{"Id":2013,"Name":"soar-per-perdsc-edit"},{"Id":2014,"Name":"soar-per-perdsc-delete"},{"Id":2015,"Name":"soar-per-pergrp-add"},{"Id":2016,"Name":"soar-per-pergrp-edit"},{"Id":2017,"Name":"soar-per-pergrp-delete"},{"Id":2018,"Name":"soar-per-perdem-view"},{"Id":2019,"Name":"soar-per-perptm-view"},{"Id":2020,"Name":"soar-per-perref-view"},{"Id":2021,"Name":"soar-per-peralt-view"},{"Id":2022,"Name":"soar-per-pergrp-view"},{"Id":2023,"Name":"soar-per-pbplan-view"},{"Id":2024,"Name":"soar-per-pbplan-add"},{"Id":2025,"Name":"soar-per-pbplan-edit"},{"Id":2026,"Name":"soar-per-pbplan-delete"},{"Id":2027,"Name":"soar-per-perps-view"},{"Id":2028,"Name":"soar-per-perps-aovr"},{"Id":2029,"Name":"soar-per-perps-vovr"},{"Id":2030,"Name":"soar-per-perdsc-view"},{"Id":2031,"Name":"soar-per-perhst-add"},{"Id":2032,"Name":"soar-per-perhst-view"},{"Id":2033,"Name":"soar-per-perptm-vpclst"},{"Id":2040,"Name":"soar-per-perdem-inactv"},{"Id":2050,"Name":"soar-per-pman-pattb"},{"Id":2051,"Name":"soar-per-pman-pctab"},{"Id":2052,"Name":"soar-per-pman-tptab"},{"Id":2053,"Name":"soar-per-pman-atab"},{"Id":2054,"Name":"soar-per-pman-mtab"},{"Id":2055,"Name":"soar-per-pcomm-view"},{"Id":2056,"Name":"soar-per-pcomm-add"},{"Id":2057,"Name":"soar-per-pcomm-edit"},{"Id":2058,"Name":"soar-per-pcomm-delete"},{"Id":2101,"Name":"soar-sch-sptapt-view"},{"Id":2102,"Name":"soar-sch-sptapt-add"},{"Id":2103,"Name":"soar-sch-sptapt-edit"},{"Id":2104,"Name":"soar-sch-sptapt-delete"},{"Id":2105,"Name":"soar-sch-sunapt-view"},{"Id":2106,"Name":"soar-sch-sunapt-add"},{"Id":2107,"Name":"soar-sch-sunapt-edit"},{"Id":2108,"Name":"soar-sch-sunapt-delete"},{"Id":2109,"Name":"soar-sch-schblk-add"},{"Id":2110,"Name":"soar-sch-schblk-edit"},{"Id":2111,"Name":"soar-sch-schblk-delete"},{"Id":2112,"Name":"soar-sch-sfyapt-add"},{"Id":2113,"Name":"soar-sch-sfyapt-edit"},{"Id":2114,"Name":"soar-sch-sfyapt-delete"},{"Id":2115,"Name":"soar-sch-sapttp-view"},{"Id":2116,"Name":"soar-sch-sapttp-add"},{"Id":2117,"Name":"soar-sch-sapttp-edit"},{"Id":2118,"Name":"soar-sch-sapttp-delete"},{"Id":2119,"Name":"soar-sch-stmtrm-view"},{"Id":2120,"Name":"soar-sch-stmtrm-add"},{"Id":2121,"Name":"soar-sch-stmtrm-edit"},{"Id":2122,"Name":"soar-sch-stmtrm-delete"},{"Id":2123,"Name":"soar-sch-schidl-idlprv"},{"Id":2124,"Name":"soar-sch-schidl-idlrm"},{"Id":2125,"Name":"soar-sch-slochr-view"},{"Id":2126,"Name":"soar-sch-slochr-edit"},{"Id":2127,"Name":"soar-sch-sprvhr-view"},{"Id":2128,"Name":"soar-sch-sprvhr-edit"},{"Id":2129,"Name":"soar-sch-schhol-view"},{"Id":2130,"Name":"soar-sch-schhol-add"},{"Id":2131,"Name":"soar-sch-schhol-edit"},{"Id":2132,"Name":"soar-sch-schhol-delete"},{"Id":2133,"Name":"soar-sch-schset-modtim"},{"Id":2134,"Name":"soar-sch-apt-svcs"},{"Id":2135,"Name":"soar-sch-sch-view"},{"Id":2136,"Name":"soar-sch-schset-view"},{"Id":2137,"Name":"soar-sch-swkstp-view"},{"Id":2138,"Name":"soar-sch-swkstp-add"},{"Id":2139,"Name":"soar-sch-swkstp-edit"},{"Id":2140,"Name":"soar-sch-swkstp-delete"},{"Id":2141,"Name":"soar-sch-sprvhr-add"},{"Id":2142,"Name":"soar-sch-slochr-add"},{"Id":2143,"Name":"soar-sch-sptapt-finish"},{"Id":2201,"Name":"soar-acct-actsrv-view"},{"Id":2202,"Name":"soar-acct-actsrv-add"},{"Id":2203,"Name":"soar-acct-actsrv-edit"},{"Id":2204,"Name":"soar-acct-actsrv-delete"},{"Id":2205,"Name":"soar-acct-insinf-view"},{"Id":2206,"Name":"soar-acct-trxhis-view"},{"Id":2207,"Name":"soar-acct-enctr-coedit"},{"Id":2208,"Name":"soar-acct-enctr-chkout"},{"Id":2209,"Name":"soar-acct-enctr-asvcs"},{"Id":2210,"Name":"soar-acct-enctr-add"},{"Id":2211,"Name":"soar-acct-aapmt-add"},{"Id":2212,"Name":"soar-acct-enctr-view"},{"Id":2213,"Name":"soar-acct-enctr-edit"},{"Id":2214,"Name":"soar-acct-enctr-delete"},{"Id":2215,"Name":"soar-acct-crdtrx-view"},{"Id":2216,"Name":"soar-acct-crdtrx-add"},{"Id":2217,"Name":"soar-acct-crdtrx-edit"},{"Id":2218,"Name":"soar-acct-crdtrx-delete"},{"Id":2219,"Name":"soar-acct-dbttrx-view"},{"Id":2220,"Name":"soar-acct-dbttrx-add"},{"Id":2221,"Name":"soar-acct-dbttrx-edit"},{"Id":2222,"Name":"soar-acct-dbttrx-delete"},{"Id":2223,"Name":"soar-acct-accmbr-view"},{"Id":2224,"Name":"soar-acct-accmbr-add"},{"Id":2225,"Name":"soar-acct-accmbr-edit"},{"Id":2226,"Name":"soar-acct-accmbr-delete"},{"Id":2227,"Name":"soar-acct-acct-view"},{"Id":2228,"Name":"soar-acct-acct-add"},{"Id":2229,"Name":"soar-acct-acct-edit"},{"Id":2230,"Name":"soar-acct-acct-delete"},{"Id":2231,"Name":"soar-acct-aapmt-view"},{"Id":2232,"Name":"soar-acct-aapmt-edit"},{"Id":2233,"Name":"soar-acct-aapmt-delete"},{"Id":2234,"Name":"soar-acct-cdtadj-view"},{"Id":2235,"Name":"soar-acct-cdtadj-add"},{"Id":2236,"Name":"soar-acct-cdtadj-edit"},{"Id":2237,"Name":"soar-acct-cdtadj-delete"},{"Id":2238,"Name":"soar-ins-ibcomp-view"},{"Id":2239,"Name":"soar-ins-ibcomp-add"},{"Id":2240,"Name":"soar-ins-ibcomp-edit"},{"Id":2241,"Name":"soar-ins-ibcomp-delete"},{"Id":2242,"Name":"soar-ins-ibplan-view"},{"Id":2243,"Name":"soar-ins-ibplan-add"},{"Id":2244,"Name":"soar-ins-ibplan-edit"},{"Id":2245,"Name":"soar-ins-ibplan-delete"},{"Id":2246,"Name":"soar-ins-ibpcov-view"},{"Id":2247,"Name":"soar-ins-ibpcov-add"},{"Id":2248,"Name":"soar-ins-ibpcov-edit"},{"Id":2249,"Name":"soar-ins-ibpcov-delete"},{"Id":2250,"Name":"soar-ins-insest-calc"},{"Id":2251,"Name":"soar-ins-iclaim-view"},{"Id":2252,"Name":"soar-ins-iclaim-add"},{"Id":2253,"Name":"soar-ins-iclaim-edit"},{"Id":2254,"Name":"soar-ins-iclaim-delete"},{"Id":2255,"Name":"soar-acct-aipmt-add"},{"Id":2256,"Name":"soar-acct-aipmt-view"},{"Id":2257,"Name":"soar-acct-aipmt-edit"},{"Id":2258,"Name":"soar-acct-aipmt-delete"},{"Id":2259,"Name":"soar-ins-iclaim-close"},{"Id":2260,"Name":"soar-acct-acct-aging"},{"Id":2261,"Name":"soar-ins-ifsch-view"},{"Id":2262,"Name":"soar-ins-ifsch-add"},{"Id":2263,"Name":"soar-ins-ifsch-edit"},{"Id":2264,"Name":"soar-ins-ifsch-delete"},{"Id":2265,"Name":"soar-ins-ipred-view"},{"Id":2266,"Name":"soar-ins-ipred-add"},{"Id":2267,"Name":"soar-ins-ipred-edit"},{"Id":2268,"Name":"soar-ins-ipred-delete"},{"Id":2269,"Name":"soar-ins-ipred-close"},{"Id":2270,"Name":"soar-acct-astmt-view"},{"Id":2271,"Name":"soar-acct-astmt-add"},{"Id":2272,"Name":"soar-acct-astmt-edit"},{"Id":2273,"Name":"soar-acct-astmt-delete"},{"Id":2310,"Name":"soar-acct-inv-print"},{"Id":2351,"Name":"soar-clin-cpsvc-view"},{"Id":2352,"Name":"soar-clin-cpsvc-add"},{"Id":2353,"Name":"soar-clin-cpsvc-edit"},{"Id":2354,"Name":"soar-clin-cpsvc-delete"},{"Id":2355,"Name":"soar-clin-ccond-view"},{"Id":2356,"Name":"soar-clin-ccond-add"},{"Id":2357,"Name":"soar-clin-ccond-edit"},{"Id":2358,"Name":"soar-clin-ccond-delete"},{"Id":2359,"Name":"soar-clin-cwtoo-view"},{"Id":2360,"Name":"soar-clin-cwtoo-add"},{"Id":2361,"Name":"soar-clin-cwtoo-edit"},{"Id":2362,"Name":"soar-clin-cwtoo-delete"},{"Id":2363,"Name":"soar-clin-codogm-edit"},{"Id":2364,"Name":"soar-clin-cnotes-view"},{"Id":2365,"Name":"soar-clin-cnotes-add"},{"Id":2366,"Name":"soar-clin-cnotes-edit"},{"Id":2367,"Name":"soar-clin-cnotes-delete"},{"Id":2368,"Name":"soar-clin-cmed-view"},{"Id":2369,"Name":"soar-clin-cimgs-view"},{"Id":2370,"Name":"soar-clin-ceduc-view"},{"Id":2371,"Name":"soar-clin-cperio-view"},{"Id":2372,"Name":"soar-clin-cplan-view"},{"Id":2373,"Name":"soar-clin-cplan-asvccd"},{"Id":2374,"Name":"soar-clin-codogm-view"},{"Id":2375,"Name":"soar-clin-codogm-add"},{"Id":2376,"Name":"soar-clin-codogm-delete"},{"Id":2377,"Name":"soar-clin-cplan-add"},{"Id":2378,"Name":"soar-clin-cplan-edit"},{"Id":2379,"Name":"soar-clin-cplan-delete"},{"Id":2380,"Name":"soar-clin-cplan-dsvccd"},{"Id":2381,"Name":"soar-clin-nottmp-view"},{"Id":2382,"Name":"soar-clin-nottmp-add"},{"Id":2383,"Name":"soar-clin-nottmp-edit"},{"Id":2384,"Name":"soar-clin-nottmp-delete"},{"Id":2385,"Name":"soar-clin-chlth-view"},{"Id":2386,"Name":"soar-clin-cperio-add"},{"Id":2387,"Name":"soar-clin-cperio-edit"},{"Id":2388,"Name":"soar-clin-cperio-delete"},{"Id":2389,"Name":"soar-clin-cplan-addapt"},{"Id":2390,"Name":"soar-clin-clinrx-view"},{"Id":2401,"Name":"soar-doc-docimp-view"},{"Id":2402,"Name":"soar-doc-docimp-add"},{"Id":2403,"Name":"soar-doc-docimp-edit"},{"Id":2404,"Name":"soar-doc-docimp-delete"},{"Id":2405,"Name":"soar-doc-docorg-vgroup"},{"Id":2406,"Name":"soar-doc-docorg-agroup"},{"Id":2407,"Name":"soar-doc-docorg-egroup"},{"Id":2408,"Name":"soar-doc-docorg-dgroup"},{"Id":2409,"Name":"soar-doc-docrec-view"},{"Id":2410,"Name":"soar-doc-docrec-edit"},{"Id":2501,"Name":"soar-biz-bsvccd-view"},{"Id":2502,"Name":"soar-biz-bsvccd-add"},{"Id":2503,"Name":"soar-biz-bsvccd-edit"},{"Id":2504,"Name":"soar-biz-bsvccd-delete"},{"Id":2505,"Name":"soar-biz-bsvccd-setfee"},{"Id":2506,"Name":"soar-biz-bsvccd-aswift"},{"Id":2507,"Name":"soar-biz-bsvccd-eswift"},{"Id":2508,"Name":"soar-biz-bsvccd-dswift"},{"Id":2509,"Name":"soar-biz-bsvct-view"},{"Id":2510,"Name":"soar-biz-bsvct-add"},{"Id":2511,"Name":"soar-biz-bsvct-edit"},{"Id":2512,"Name":"soar-biz-bsvct-delete"},{"Id":2513,"Name":"soar-biz-bizusr-view"},{"Id":2514,"Name":"soar-biz-bizusr-add"},{"Id":2515,"Name":"soar-biz-bizusr-edit"},{"Id":2516,"Name":"soar-biz-bizusr-delete"},{"Id":2517,"Name":"soar-biz-bizusr-vwprov"},{"Id":2518,"Name":"soar-biz-bizusr-etprov"},{"Id":2519,"Name":"soar-biz-bizloc-view"},{"Id":2520,"Name":"soar-biz-bizloc-add"},{"Id":2521,"Name":"soar-biz-bizloc-edit"},{"Id":2522,"Name":"soar-biz-bizloc-delete"},{"Id":2523,"Name":"soar-biz-bcform-view"},{"Id":2524,"Name":"soar-biz-bcform-add"},{"Id":2525,"Name":"soar-biz-bcform-edit"},{"Id":2526,"Name":"soar-biz-bcform-pub"},{"Id":2527,"Name":"soar-biz-bcform-act"},{"Id":2528,"Name":"soar-biz-bmalrt-view"},{"Id":2529,"Name":"soar-biz-bmalrt-add"},{"Id":2530,"Name":"soar-biz-bmalrt-edit"},{"Id":2531,"Name":"soar-biz-bmalrt-delete"},{"Id":2532,"Name":"soar-biz-brfsrc-view"},{"Id":2533,"Name":"soar-biz-brfsrc-add"},{"Id":2534,"Name":"soar-biz-brfsrc-edit"},{"Id":2535,"Name":"soar-biz-brfsrc-delete"},{"Id":2536,"Name":"soar-biz-bizdsc-view"},{"Id":2537,"Name":"soar-biz-bizdsc-add"},{"Id":2538,"Name":"soar-biz-bizdsc-edit"},{"Id":2539,"Name":"soar-biz-bizdsc-delete"},{"Id":2540,"Name":"soar-biz-bpmttp-view"},{"Id":2541,"Name":"soar-biz-bpmttp-add"},{"Id":2542,"Name":"soar-biz-bpmttp-edit"},{"Id":2543,"Name":"soar-biz-bpmttp-delete"},{"Id":2544,"Name":"soar-biz-badjtp-view"},{"Id":2545,"Name":"soar-biz-badjtp-add"},{"Id":2546,"Name":"soar-biz-badjtp-edit"},{"Id":2547,"Name":"soar-biz-badjtp-delete"},{"Id":2548,"Name":"soar-biz-bcond-view"},{"Id":2549,"Name":"soar-biz-bcond-add"},{"Id":2550,"Name":"soar-biz-bcond-edit"},{"Id":2551,"Name":"soar-biz-bcond-delete"},{"Id":2552,"Name":"soar-biz-bdrwtp-view"},{"Id":2553,"Name":"soar-biz-bizgrp-view"},{"Id":2554,"Name":"soar-biz-bizgrp-add"},{"Id":2555,"Name":"soar-biz-bizgrp-edit"},{"Id":2556,"Name":"soar-biz-bizgrp-delete"},{"Id":2557,"Name":"soar-biz-bsvccd-selcdt"},{"Id":2558,"Name":"soar-biz-biz-view"},{"Id":2559,"Name":"soar-biz-cdtcd-view"},{"Id":2560,"Name":"soar-biz-cdtcd-add"},{"Id":2561,"Name":"soar-biz-cdtcd-edit"},{"Id":2562,"Name":"soar-biz-cdtcd-delete"},{"Id":2563,"Name":"soar-biz-bcform-delete"},{"Id":2564,"Name":"soar-biz-bsvccd-spcasc"},{"Id":2565,"Name":"soar-biz-svcbtn-view"},{"Id":2566,"Name":"soar-biz-svcbtn-add"},{"Id":2567,"Name":"soar-biz-svcbtn-edit"},{"Id":2568,"Name":"soar-biz-svcbtn-delete"},{"Id":2569,"Name":"soar-biz-typmat-view"},{"Id":2570,"Name":"soar-biz-typmat-add"},{"Id":2571,"Name":"soar-biz-typmat-edit"},{"Id":2572,"Name":"soar-biz-typmat-delete"},{"Id":2573,"Name":"soar-biz-bizusr-vwfvrt"},{"Id":2574,"Name":"soar-biz-bizusr-afvrt"},{"Id":2575,"Name":"soar-biz-bizusr-dfvrt"},{"Id":2576,"Name":"soar-biz-bprsvc-view"},{"Id":2577,"Name":"soar-biz-bprsvc-add"},{"Id":2578,"Name":"soar-biz-bprsvc-edit"},{"Id":2579,"Name":"soar-biz-bprsvc-vsvcs"},{"Id":2580,"Name":"soar-biz-bprsvc-asvcs"},{"Id":2581,"Name":"soar-biz-bprsvc-dsvcs"},{"Id":2582,"Name":"soar-biz-inspmt-view"},{"Id":2583,"Name":"soar-biz-inspmt-add"},{"Id":2584,"Name":"soar-biz-bizusr-efvrt"},{"Id":2585,"Name":"soar-biz-bizusr-vchbtn"},{"Id":2586,"Name":"soar-biz-bizusr-achbtn"},{"Id":2587,"Name":"soar-biz-bizusr-dchbtn"},{"Id":2588,"Name":"soar-biz-bizusr-echbtn"},{"Id":2589,"Name":"soar-biz-tpmsg-view"},{"Id":2590,"Name":"soar-biz-tpmsg-add"},{"Id":2591,"Name":"soar-biz-tpmsg-edit"},{"Id":2592,"Name":"soar-biz-tpmsg-delete"},{"Id":2593,"Name":"soar-biz-aipat-view"},{"Id":2594,"Name":"soar-biz-aipat-manage"},{"Id":2595,"Name":"soar-biz-ailoc-view"},{"Id":2596,"Name":"soar-biz-ailoc-manage"},{"Id":2597,"Name":"soar-biz-aitm-view"},{"Id":2598,"Name":"soar-biz-aitm-manage"},{"Id":2600,"Name":"soar-biz-bizrcv-view"},{"Id":2602,"Name":"soar-biz-medalt-view"},{"Id":2603,"Name":"soar-biz-medalt-update"},{"Id":2604,"Name":"soar-biz-bilmsg-view"},{"Id":2605,"Name":"soar-biz-bilmsg-add"},{"Id":2606,"Name":"soar-biz-bilmsg-edit"},{"Id":2607,"Name":"soar-biz-comtmp-view"},{"Id":2608,"Name":"soar-biz-comtmp-add"},{"Id":2609,"Name":"soar-biz-comtmp-edit"},{"Id":2610,"Name":"soar-nav-lnav-lnpat"},{"Id":2611,"Name":"soar-biz-comtmp-delete"},{"Id":2612,"Name":"soar-biz-banks-view"},{"Id":2613,"Name":"soar-biz-banks-add"},{"Id":2614,"Name":"soar-biz-banks-edit"},{"Id":2615,"Name":"soar-biz-banks-delete"},{"Id":2616,"Name":"soar-biz-dep-view"},{"Id":2617,"Name":"soar-biz-dep-add"},{"Id":2618,"Name":"soar-biz-dep-edit"},{"Id":2619,"Name":"soar-biz-dep-delete"},{"Id":2620,"Name":"soar-biz-bizusr-vppref"},{"Id":2621,"Name":"soar-biz-bizusr-appref"},{"Id":2622,"Name":"soar-biz-bizusr-eppref"},{"Id":2801,"Name":"soar-lrn-lrn-view"},{"Id":2851,"Name":"soar-dsh-dsh-view"},{"Id":2901,"Name":"soar-soarqa-slauto-all"},{"Id":2911,"Name":"soar-report-acct-pbypsm"},{"Id":2912,"Name":"soar-report-pat-pbycar"},{"Id":2913,"Name":"soar-report-report-view"},{"Id":2914,"Name":"soar-report-pat-pbydsc"},{"Id":2915,"Name":"soar-report-pat-pbybp"},{"Id":2916,"Name":"soar-report-pat-pbyfs"},{"Id":2917,"Name":"soar-report-ins-fsbybp"},{"Id":2918,"Name":"soar-report-ins-cbybp"},{"Id":2919,"Name":"soar-report-acct-fbyloc"},{"Id":3100,"Name":"clmapi-form-common-read"},{"Id":3101,"Name":"clmapi-form-common-create"},{"Id":3102,"Name":"clmapi-form-common-update"},{"Id":3103,"Name":"clmapi-form-common-delete"},{"Id":3200,"Name":"clmapi-form-j430dm-read"},{"Id":3201,"Name":"clmapi-form-j430dm-create"},{"Id":3202,"Name":"clmapi-form-j430dm-update"},{"Id":3203,"Name":"clmapi-form-j430dm-delete"},{"Id":3300,"Name":"clmapi-form-j430dd-read"},{"Id":3301,"Name":"clmapi-form-j430dd-create"},{"Id":3302,"Name":"clmapi-form-j430dd-update"},{"Id":3303,"Name":"clmapi-form-j430dd-delete"},{"Id":3400,"Name":"clmapi-clmapp-taxcod-read"},{"Id":3401,"Name":"clmapi-clmapp-taxcod-create"},{"Id":3402,"Name":"clmapi-clmapp-taxcod-update"},{"Id":3403,"Name":"clmapi-clmapp-taxcod-delete"},{"Id":3500,"Name":"clmapi-payer-paylst-read"},{"Id":3501,"Name":"clmapi-payer-paylst-create"},{"Id":3502,"Name":"clmapi-payer-paylst-update"},{"Id":4100,"Name":"jobapi-procsr-execut-read"},{"Id":4101,"Name":"jobapi-procsr-execut-create"},{"Id":4102,"Name":"jobapi-procsr-execut-update"},{"Id":4103,"Name":"jobapi-procsr-execut-getid"},{"Id":5401,"Name":"rxapi-rx-rxclnc-create"},{"Id":5410,"Name":"rxapi-rx-rxuser-create"},{"Id":5411,"Name":"rxapi-rx-rxpat-create"},{"Id":5412,"Name":"rxapi-rx-rxpat-getmed"},{"Id":5413,"Name":"rxapi-rx-rxuser-getcnt"},{"Id":5414,"Name":"rxapi-rx-rxpat-getalg"},{"Id":5415,"Name":"rxapi-rx-rxuser-rxclcs"},{"Id":6100,"Name":"stmapi-stmt-stmt-create"},{"Id":6101,"Name":"stmapi-stmt-stmt-read"},{"Id":6102,"Name":"stmapi-stmt-stmt-update"},{"Id":6103,"Name":"stmapi-stmt-stmt-delete"},{"Id":6120,"Name":"stmapi-stmt-stmtco-read"},{"Id":6121,"Name":"stmapi-stmt-stmtco-update"},{"Id":6200,"Name":"stmapi-stmt-estjob-submit"},{"Id":7100,"Name":"comapi-comm-email-create"},{"Id":7101,"Name":"comapi-comm-email-read"},{"Id":7200,"Name":"comapi-comm-prcset-create"},{"Id":7201,"Name":"comapi-comm-prcset-read"},{"Id":7202,"Name":"comapi-comm-prcset-update"}]}],"Version":{"ClientUri":"v1.0","ClientVersion":"v1.0","WebApiUri":"v1.0","WebApiVersion":"v1.0"},"Application":{"ApplicationId":2,"Name":"SOAR","Description":"SOAR","Abbreviation":"soar","DataTag":"AAAAAAAALnU=","UserModified":"00000000-0000-0000-0000-000000000000","DateModified":"2017-06-06T12:54:25.4152652"}}}'
        );
        localStorage.setItem(
            'fuseUser',
            '{"UserId":"b94308d3-f824-4d33-b06b-fa90e5fde217","FirstName":"Practice","MiddleName":null,"LastName":"Admin","PreferredName":null,"SuffixName":null,"DateOfBirth":"1963-06-15T05:00:00","UserName":"marybeth.swift@pattcom.onmicrosoft.com","UserCode":"ADMPR1","Color":"#7F7F7F","ImageFile":null,"EmployeeStartDate":null,"EmployeeEndDate":null,"Email":"marybeth.swift.intrx@pattcom.onmicrosoft.com","Address":{"AddressLine1":"123 Easy Street","AddressLine2":null,"City":"Anytown","State":"IL","ZipCode":"62401"},"DepartmentId":null,"JobTitle":null,"ProviderTypeId":1,"ProviderOnClaimsRelationship":1,"ProviderOnClaimsId":null,"RxUserType":2,"TaxId":null,"FederalLicense":null,"DeaNumber":"XX0000000","NpiTypeOne":"0000000000","PrimaryTaxonomyId":null,"SecondaryTaxonomyId":null,"StateLicense":null,"AnesthesiaId":null,"IsActive":true,"StatusChangeNote":null,"ProfessionalDesignation":null,"Locations":null,"Roles":null,"DataTag":"AAAAAAGLd6c=","UserModified":"b94308d3-f824-4d33-b06b-fa90e5fde217","DateModified":"2017-07-31T17:19:21.5646629"}'
        );
        localStorage.setItem('usersLocations', '[]');

        ctrl = $controller('HeaderController', {
            $scope: scope,
            patSecurityService: _authPatSecurityService_,
            $location: location,
            $interval: $interval,
            
        });
        scope.editMode = true;
        $rootScope.$apply();
    }));
    // #endregion mocks

    // #region tests
    describe('$scope.getLocationSuccess method - >', function () {
        var ofcLocation = {};
        beforeEach(function () {
            ofcLocation = {
                Value: {
                    LocationId: 2,
                    Name: 'location1',
                },
            };
            spyOn(ctrl, 'getRxNotifications');
            scope.currentUserData = {};
            scope.currentUserData.RxUserType = 0;
        });
        //it('should not call ctrl.getRxNotifications if the user is not an rxuser ', function () {
        //    scope.rxUser = false;
        //    scope.getLocationSuccess(ofcLocation);
        //    expect(ctrl.getRxNotifications).not.toHaveBeenCalled();
        //});

        //it('should call getRxNotifications if the user is an rxuser ', function () {
        //    scope.rxUser = true;
        //    scope.currentUserData.RxUserType = 1;
        //    scope.getLocationSuccess(ofcLocation);
        //    expect(ctrl.getRxNotifications).toHaveBeenCalled();
        //});

        describe('rxService', function () {
            var result;
            beforeEach(function () {
                result = {};
                rxService.notificationsPreCheck = jasmine.createSpy().and.returnValue({
                    then: function (cb) {
                        cb(result);
                        return { catch: function () { } };
                    },
                });
            });

            it('should call getRxNotifications when result and IsRxRegistered is true', function () {
                result.result = true;
                result.entId = 100;
                scope.rxUser = false;
                scope.currentUserData.IsRxRegistered = true;

                scope.getLocationSuccess(ofcLocation);

                expect(scope.rxUser).toBe(true);
                expect(ctrl.getRxNotifications).toHaveBeenCalledWith(result.entId);
            });

            //it('should not call getRxNotifications when IsRxRegistered is false', function () {
            //    result.result = true;
            //    result.entId = 100;
            //    scope.rxUser = false;
            //    scope.currentUserData.IsRxRegistered = false;

            //    scope.getLocationSuccess(location);

            //    expect(scope.rxUser).toBe(false);
            //    expect(ctrl.getRxNotifications).not.toHaveBeenCalled();
            //    expect(rxService.notificationsPreCheck).not.toHaveBeenCalled();
            //});

            //it('should not call notificationsPreCheck when result is false and IsRxRegistered is false', function () {
            //    result.result = false;
            //    scope.rxUser = false;
            //    scope.currentUserData.IsRxRegistered = false;
            //    scope.currentUserData.userid = 3;

            //    scope.getLocationSuccess(location);

            //    expect(scope.rxUser).toBe(false);
            //    expect(ctrl.getRxNotifications).not.toHaveBeenCalled();
            //    expect(rxService.notificationsPreCheck).not.toHaveBeenCalled();
            //});

            it('should call notificationsPreCheck when result is false and IsRxRegistered is true', function () {
                result.result = false;
                scope.rxUser = false;
                scope.currentUserData.IsRxRegistered = true;
                scope.currentUserData.UserId = 3;

                scope.getLocationSuccess(ofcLocation);

                expect(scope.rxUser).toBe(false);
                expect(ctrl.getRxNotifications).not.toHaveBeenCalled();
                expect(rxService.notificationsPreCheck).toHaveBeenCalledWith(
                    scope.currentUserData.UserId
                );
            });
        });
    });

    describe('getRxNotifications function ->', function () {
        let entId;
        beforeEach(function () {
            entId = 100;
            rootScope.patAuthContext.userInfo.userid = 1;
            scope.loggedInLocation = { LocationId: '22' };
            ctrl.rxNotificationAttempts = 0;
        });

        it('should call userRxFactory.RxNotifications if userRxFactory.NotificationsFailed returns false', function () {
            userRxFactory.NotificationFailed = jasmine
                .createSpy()
                .and.returnValue(false);
            ctrl.getRxNotifications(entId);
            expect(userRxFactory.RxNotifications).toHaveBeenCalledWith(
                rootScope.patAuthContext.userInfo.userid,
                ctrl.rxNotificationAttempts,
                entId
            );
        });

        it('should not call userRxFactory.RxNotifications if userRxFactory.NotificationsFailed returns true', function () {
            userRxFactory.NotificationFailed = jasmine
                .createSpy()
                .and.returnValue(true);
            ctrl.getRxNotifications(entId);
            expect(userRxFactory.RxNotifications).not.toHaveBeenCalled();
        });

        it('should reset counts to 0 if userRxFactory.NotificationsFailed returns true', function () {
            scope.notifications.counts = 7;
            userRxFactory.NotificationFailed = jasmine
                .createSpy()
                .and.returnValue(true);
            ctrl.getRxNotifications(entId);
            expect(scope.notifications.counts).toEqual(0);
        });
    });

    describe('getRxNotificationsSuccess - >', function () {
        var res;
        beforeEach(function () {
            res = {
                Counts: [
                    { NotificationCountsUrl: 'https://myFakeRXurl.com' },
                    { NotificationCountsUrl: 'https://myFakeRXurl.com' },
                    { NotificationCountsUrl: 'https://myFakeRXurl.com' },
                ],
                ClinicianId: 18156,
                RefillRequestsTotalCount: 2,
                TransactionErrorsTotalCount: 5,
                PendingPrescriptionsTotalCount: 0,
            };
        });

        it('should set counts based on results', function () {
            ctrl.rxNotificationsSuccess(res);
            expect(scope.notifications.counts).toEqual(7);
        });

        it('should reset ctrl.rxNotificationAttempts to 0', function () {
            ctrl.rxNotificationAttempts = 3;
            ctrl.rxNotificationsSuccess(res);
            expect(ctrl.rxNotificationAttempts).toEqual(0);
        });

        it('should set notifications url based on first row in results if exists', function () {
            ctrl.rxNotificationsSuccess(res);
            expect(scope.notifications.counts).toEqual(7);
            expect(scope.notifications.url).toEqual(
                res.Counts[0].NotificationCountsUrl
            );
        });

        it('should not set notifications url if no counts', function () {
            res = {
                Counts: [],
                ClinicianId: 18156,
                RefillRequestsTotalCount: 0,
                TransactionErrorsTotalCount: 0,
                PendingPrescriptionsTotalCount: 0,
            };
            ctrl.rxNotificationsSuccess(res);
            expect(scope.notifications.counts).toEqual(0);
            expect(scope.notifications.url).toBe('');
        });
    });

    describe('rxNotificationsFailed - >', function () {
        var entId;
        beforeEach(function () {
            entId = 'entId';
            spyOn(ctrl, 'getRxNotifications');
        });

        it('should call userRxFactory.RxNotifications  if this is not the third attempt', function () {
            ctrl.rxNotificationAttempts = 0;
            ctrl.rxNotificationsFailed(entId);
            timeout.flush();
            expect(ctrl.getRxNotifications).toHaveBeenCalledWith(entId);

            ctrl.rxNotificationAttempts = 1;
            ctrl.rxNotificationsFailed(entId);
            timeout.flush();
            expect(ctrl.getRxNotifications).toHaveBeenCalledWith(entId);

            ctrl.rxNotificationAttempts = 2;
            ctrl.rxNotificationsFailed(entId);
            timeout.flush();
            expect(ctrl.getRxNotifications).toHaveBeenCalledWith(entId);
        });

        it('should reset ctrl.rxNotificationAttempts to 0', function () {
            ctrl.rxNotificationAttempts = 3;
            ctrl.rxNotificationsFailed(entId);
            expect(ctrl.rxNotificationAttempts).toEqual(0);
        });

        it('should show toastr error if this is the third attempt', function () {
            ctrl.rxNotificationAttempts = 3;
            ctrl.rxNotificationsFailed(entId);
            expect(ctrl.getRxNotifications).not.toHaveBeenCalled();
            expect(toastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('ctrl.updateRxNotifications - >', function () {
        it('should call ctrl.updateRxNotifications ', function () {
            spyOn(ctrl, 'rxNotificationsSuccess');
            var res = {};
            ctrl.updateRxNotifications(res);
            expect(ctrl.rxNotificationsSuccess).toHaveBeenCalledWith(res);
        });
    });

    describe('when user is authorized - >', function () {
        it('should exist', function () {
            expect(ctrl).not.toBeNull();
        });

        it('should have injected services and factories ', function () {
            expect(authService).not.toBeNull();
            expect(_authPatSecurityService_).not.toBeNull();
        });

        it('should set initial properties', function () {
            expect(scope.selected).toBeUndefined();
            expect(scope.loginData).toEqual({
                userName: '',
                password: '',
            });
            expect(scope.isNavCollapsed).toBe(true);
            expect(scope.navWasClicked).toBeNull();
        });

        describe('parentPath ->', function () {
            it('should return the parent path of the current url', function () {
                location.path = jasmine
                    .createSpy()
                    .and.returnValue(
                        '/ParentPath/anything-else/ignoring-all-slashes/for-days'
                    );
                var result = scope.parentPath();

                expect(result).toEqual('#/ParentPath');
            });

            it('should return the parent path of the current url if the current url does not have a leading slash', function () {
                location.path = jasmine
                    .createSpy()
                    .and.returnValue(
                        'ParentPath/anything-else/ignoring-all-slashes/for-days'
                    );
                var result = scope.parentPath();

                expect(result).toEqual('#/ParentPath');
            });

            it('should return the parent path of the current url if the current url does not have a trailing slash', function () {
                location.path = jasmine.createSpy().and.returnValue('/ParentPath');
                var result = scope.parentPath();

                expect(result).toEqual('#/ParentPath');
            });

            it('should return the parent path of the current url if the curent url is just the parent path', function () {
                location.path = jasmine.createSpy().and.returnValue('ParentPath');
                var result = scope.parentPath();

                expect(result).toEqual('#/ParentPath');
            });
        });

        describe('openNewTab ->', function () {
            it('should call $window.open with the path to the parent feature in a new tab', function () {
                scope.parentPath = jasmine.createSpy().and.returnValue('SomePath');

                scope.openNewTab();

                expect(scope.parentPath).toHaveBeenCalled();
                expect(_tabLauncher_.launchNewTab).toHaveBeenCalledWith('SomePath');
            });
        });

        describe('logout function ->', function () {
            it('should call modalFactory.ConfirmModal', function () {
                scope.logout();

                expect(modalFactory.ConfirmModal).toHaveBeenCalled();
            });

            describe('modalFactory.ConfirmModal callback', function () {
                var eventCaught;
                beforeEach(function () {
                    modalFactory.ConfirmModal = jasmine.createSpy().and.returnValue({
                        then: function (cb) {
                            cb();
                        },
                    });

                    _authPatSecurityService_.logout.calls.reset();

                    eventCaught = false;
                    scope.$on('fuse:logout', function () {
                        eventCaught = true;
                    });
                });

                it('should call authService logout', function () {
                    scope.logout();

                    expect(_authPatSecurityService_.logout).toHaveBeenCalled();
                    expect(location.path).toHaveBeenCalledWith('/');
                    expect(eventCaught).toEqual(true);
                });
            });
        });

        describe('openCloseNav function -> ', function () {
            it('should set isNavCollapsed to false', function () {
                scope.openCloseNav();

                expect(scope.isNavCollapsed).toBe(false);
            });
        });

        describe('closeNav function -> ', function () {
            it('should set isNavCollapsed to true when navWasClicked is false', function () {
                scope.navWasClicked = false;
                scope.closeNav();
                scope.$apply();
                timeout.flush();

                expect(scope.isNavCollapsed).toBe(true);
            });
        });

        describe('$watch navWasClicked function -> ', function () {
            it('should set navWasClicked to false and isNavCollapsed to true when navWasClicked is true', function () {
                scope.navWasClicked = true;
                scope.forceNavOpen = false;
                scope.$apply();

                expect(scope.navWasClicked).toBe(false);
                expect(scope.isNavCollapsed).toBe(true);
            });
        });

        describe('$watch patAuthContext.isAuthorized function -> ', function () {
            it('should display warning modal when access level is Inactive', function () {
                scope.patAuthContext.isAuthorized = false;
                scope.patAuthContext.accessLevel = 'Inactive';
                scope.$apply();
                scope.patAuthContext.isAuthorized = true;
                scope.$apply();
                expect($uibModal.open).toHaveBeenCalled();
            });
        });

        describe('addUsersLocationsToLocalStorage function -> ', function () {
            it('should add usersLocations to localStorage for the first time', function () {
                rootScope.patAuthContext.userInfo.userid = 1;
                var existingUsersLocations = null;
                localStorage.setItem('usersLocations', existingUsersLocations);
                expect(JSON.parse(localStorage.getItem('usersLocations'))).toBeNull();
                var currentLocation = { id: 101, name: 'Frankfurt', practiceid: 100 };
                scope.addUsersLocationsToLocalStorage(currentLocation);
                var result = [
                    { id: 101, name: 'Frankfurt', practiceid: 100, users: [1] },
                ];
                expect(JSON.parse(localStorage.getItem('usersLocations'))).toEqual(
                    result
                );
            });

            it('should add new location to existing usersLocations in localStorage', function () {
                rootScope.patAuthContext.userInfo.userid = 2;
                var existingUsersLocations =
                    '[{"id":101,"name":"Milan","practiceid":100,"users":[1]}]';
                localStorage.setItem('usersLocations', existingUsersLocations);
                var currentLocation = { id: 200, name: 'Paris', practiceid: 100 };
                scope.addUsersLocationsToLocalStorage(currentLocation);
                var result = [
                    { id: 101, name: 'Milan', practiceid: 100, users: [1] },
                    { id: 200, name: 'Paris', practiceid: 100, users: [2] },
                ];
                expect(JSON.parse(localStorage.getItem('usersLocations'))).toEqual(
                    result
                );
            });

            it('should remove users old location and add new location', function () {
                rootScope.patAuthContext.userInfo.userid = 1;
                var existingUsersLocations =
                    '[{"id":101,"name":"London","practiceid":100,"users":[1]}]';
                localStorage.setItem('usersLocations', existingUsersLocations);
                var currentLocation = { id: 200, name: 'Paris', practiceid: 100 };
                scope.addUsersLocationsToLocalStorage(currentLocation);
                var result = [{ id: 200, name: 'Paris', practiceid: 100, users: [1] }];
                expect(JSON.parse(localStorage.getItem('usersLocations'))).toEqual(
                    result
                );
            });

            it('should add new user to an existing location', function () {
                rootScope.patAuthContext.userInfo.userid = 2;
                var existingUsersLocations =
                    '[{"id":101,"name":"New York","practiceid":100,"users":[1]}]';
                localStorage.setItem('usersLocations', existingUsersLocations);
                var currentLocation = { id: 101, name: 'New York', practiceid: 100 };
                scope.addUsersLocationsToLocalStorage(currentLocation);
                var result = [
                    { id: 101, name: 'New York', practiceid: 100, users: [1, 2] },
                ];
                expect(JSON.parse(localStorage.getItem('usersLocations'))).toEqual(
                    result
                );
            });
        });
    });

    describe('scope watch loading function -> ', function () {
        // it('should create a loading modal if the header location has not loaded', function () {
        //     scope.loading = true;
        //     scope.$digest();
        //     expect(scope.loadingModal).not.toBe(null);
        // });

        // it('should not create a loading modal if the header location has loaded', function () {
        //     scope.loading = false;
        //     scope.$digest();
        //     expect(scope.loadingModal).toBe(null);
        //     //expect(scope.loadingModal.close()).toHaveBeenCalled();
        // });

        // it('should close the loading modal if the scope variable gets set to false', function () {
        //     scope.loading = true;
        //     scope.$digest();
        //     expect(scope.loadingModal).not.toBe(null);

        //     scope.loading = false;
        //     scope.$digest();
        //     expect(scope.loadingModal).toBe(null);
        // });
    });
});
