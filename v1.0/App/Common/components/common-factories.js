/* global toastr:false */

'use strict';

angular
    .module('common.factories', [])
    .factory('StaticData', [
        'StaticDataService',
        'ListHelper',
        'toastrFactory',
        'localize',
        '$q',
        '$timeout',
        'CommonServices',
        'ActivityTypes',
        'ActivityActions',
        'ActivityAreas',
        function (
            staticDataService,
            listHelper,
            toastrFactory,
            localize,
            $q,
            $timeout,
            commonServices,
            activityTypes,
            activityActions,
            activityAreas
        ) {
            var createStaticType = function (
                name,
                getFunction,
                storageName,
                errorMessage,
                cacheData,
                deprecatedKeys
            ) {
                if (deprecatedKeys && deprecatedKeys.length > 0) {
                    for (var index = 0; index < deprecatedKeys.length; index++) {
                        localStorage.removeItem(deprecatedKeys[index]);
                    }
                }

                return {
                    Name: name,
                    GetFunction: getFunction,
                    StorageName: storageName,
                    ErrorMessage: errorMessage,
                    Cached: cacheData == false ? false : true,
                };
            };

            var getData = function (staticType) {
                var taskToComplete = $q.defer();
                var promise = taskToComplete.promise;

                var data = staticType
                    ? localStorage.getItem(staticType.StorageName)
                    : null;
                // If the list is empty or null, go get it
                if (!staticType.Cached || (staticType && _.isEmpty(data))) {
                    staticType.GetFunction().$promise.then(
                        function (result) {
                            promise = $.extend(promise, { values: result.Value });

                            if (staticType.Cached) {
                                localStorage.setItem(
                                    staticType.StorageName,
                                    JSON.stringify(result.Value)
                                );
                            }

                            taskToComplete.resolve(result);
                        },
                        function () {
                            toastrFactory.error(staticType.ErrorMessage, 'Error');
                        }
                    );
                } else {
                    promise.then(function (result) {
                        promise = $.extend(promise, { values: result.Value });
                    });

                    // This is used to allow the promise to be returned.
                    taskToComplete.resolve({
                        Value: data ? JSON.parse(data) : null,
                    });
                }
                return promise;
            };

            var staticTypes = {
                AffectedAreas: createStaticType(
                    'AffectedAreas',
                    staticDataService.AffectedAreas,
                    'cachedAffectedAreas',
                    'Failed to load affected areas.'
                ),
                AlertIcons: createStaticType(
                    'AlertIcons',
                    staticDataService.AlertIcons,
                    'cachedAlertIcons_v2.1',
                    'Failed to load alert icons.',
                    true,
                    [
                        'cachedAlertIcons',
                        'cachedAlertIcons-v.2.0',
                        'cachedAlertIcons-v.2.1',
                    ]
                ),
                //AppointmentStatuses: createStaticType("AppointmentStatuses", staticDataService.AppointmentStatuses, "cachedAppointmentStatuses", "Failed to load appointment statuses."),
                //CdtCodes: createStaticType("CdtCodes", staticDataService.CdtCodes, "cachedCdtCodes", "Failed to load CDT codes."),
                Departments: createStaticType(
                    'Departments',
                    staticDataService.Departments,
                    'cachedDepartments',
                    'Failed to load departments.'
                ),
                NoteTypes: createStaticType(
                    'NoteTypes',
                    staticDataService.NoteTypes,
                    'cachedNoteTypes',
                    'Failed to load note types.'
                ),
                PhoneTypes: createStaticType(
                    'PhoneTypes',
                    staticDataService.PhoneTypes,
                    'cachedPhoneTypes',
                    'Failed to load phone types.'
                ),
                ProviderTypes: createStaticType(
                    'ProviderTypes',
                    staticDataService.ProviderTypes,
                    'cachedProviderTypes',
                    'Failed to load phone types.'
                ),
                ReferralTypes: createStaticType(
                    'ReferralTypes',
                    staticDataService.ReferralTypes,
                    'cachedReferralTypes',
                    'Failed to load referral types.'
                ),
                States: createStaticType(
                    'States',
                    staticDataService.States,
                    'cachedStateList',
                    'Failed to load the list of states.'
                ),
                StatusTypes: createStaticType(
                    'StatusTypes',
                    staticDataService.StatusTypes,
                    'cachedStatusTypes',
                    'Failed to load status types.'
                ),
                TaxonomyCodes: createStaticType(
                    'TaxonomyCodes',
                    staticDataService.TaxonomyCodes,
                    'cachedTaxonomyCodes',
                    'Failed to load taxonomy codes.'
                ),
                TaxableServices: createStaticType(
                    'TaxableServices',
                    staticDataService.TaxableServices,
                    'cachedTaxableServices',
                    'Failed to load taxable services.'
                ),
                PlannedServiceStatuses: createStaticType(
                    'PlannedServiceStatuses',
                    staticDataService.PlannedServiceStatuses,
                    'cachedPlannedServiceStatuses',
                    'Failed to load planned service statuses.'
                ),
                ServiceTransactionStatuses: createStaticType(
                    'ServiceTransactionStatuses',
                    staticDataService.ServiceTransactionStatuses,
                    'cachedServiceTransactionStatuses_v2.0',
                    'Failed to load service transaction statuses.',
                    true,
                    [
                        'ServiceTransactionStatuses',
                        'cachedServiceTransactionStatuses_v2.0',
                    ]
                ),
                CurrencyTypes: createStaticType(
                    'CurrencyTypes',
                    staticDataService.CurrencyTypes,
                    'cachedCurrencyTypes',
                    'Failed to load currency types.'
                ),
                TransactionTypes: createStaticType(
                    'TransactionTypes',
                    staticDataService.TransactionTypes,
                    'cachedTransactionTypes',
                    'Failed to load transaction types.'
                ),
                TeethDefinitions: createStaticType(
                    'TeethDefinitions',
                    staticDataService.TeethDefinitions,
                    'cachedTeethDefinitions',
                    'Failed to load teeth definitions.'
                ),
                CdtCodeGroups: createStaticType(
                    'CdtCodeGroups',
                    staticDataService.CdtCodeGroups,
                    'cachedCdtCodeGroups_v2.1',
                    'Failed to load CDT code groups.',
                    true,
                    ['cachedCdtCodeGroups', 'cachedCdtCodeGroups_v2.0']
                ),
                ConditionStatus: createStaticType(
                    'ConditionStatus',
                    staticDataService.ConditionStatus,
                    'cachedConditionStatus',
                    'Failed to load condition services.'
                ),
            };

            return {
                AffectedAreas: function () {
                    return getData(staticTypes.AffectedAreas);
                },
                AlertIcons: function () {
                    var iconList = getData(staticTypes.AlertIcons);

                    iconList.getClassById = function (id) {
                        var icon = listHelper.findItemByFieldValue(
                            this.values,
                            'AlertIconId',
                            id
                        );

                        return icon ? icon.Name : '';
                    };

                    return iconList;
                },
                AppointmentStatuses: function () {
                    var statuses = [
                        { Value: 0, Description: 'Unconfirmed', Icon: 'fas fa-question' },
                        { Value: 1, Description: 'Reminder Sent', Icon: 'far fa-bell' },
                        {
                            Value: 2,
                            Description: 'Confirmed',
                            Icon: 'far fa-check',
                            SectionEnd: true,
                        },
                        { Value: 6, Description: 'In Reception', Icon: 'far fa-watch' },
                        {
                            Value: 3,
                            Description: 'Completed',
                            Icon: 'far fa-calendar-check',
                        },
                        { Value: 4, Description: 'In Treatment', Icon: 'fas fa-user-md' },
                        {
                            Value: 5,
                            Description: 'Ready for Check out',
                            Icon: 'far fa-shopping-cart',
                        },
                        { Value: 9, Description: 'Late', Icon: 'fas fa-exclamation' },
                        { Value: 10, Description: 'Check out', Icon: 'fa-share' },
                        {
                            Value: 11,
                            Description: 'Start Appointment',
                            Icon: 'fa-thumbs-up',
                            SectionEnd: true,
                        },
                        { Value: 12, Description: 'Unschedule' },
                        { Value: 13, Description: 'Add to Clipboard' },
                    ];

                    var statusKeys = {
                        Unconfirmed: 0,
                        ReminderSent: 1,
                        Confirmed: 2,
                        InReception: 6,
                        Completed: 3,
                        InTreatment: 4,
                        ReadyForCheckout: 5,
                        Late: 9,
                        CheckOut: 10,
                        StartAppointment: 11,
                        Unschedule: 12,
                        AddToClipboard: 13,
                    };

                    return {
                        List: statuses,
                        Enum: statusKeys,
                    };
                    //return getData(staticTypes.AppointmentStatuses);
                },
                //CdtCodes: function () {
                //	return getData(staticTypes.CdtCodes);
                //},
                ClearinghouseVendors: function () {
                    const clearingHouseVendors = {
                        Noop: 1,
                        ChangeHealthCare: 2,
                        DentalXChange: 3
                    };

                    return clearingHouseVendors;
                },
                Departments: function () {
                    return getData(staticTypes.Departments);
                },
                NoteTypes: function () {
                    return getData(staticTypes.NoteTypes);
                },
                PaymentProviders: function() {
                    const paymentProviders = { 
                        OpenEdge: 0, 
                        TransactionsUI: 1 
                    };

                    return paymentProviders;
                },
                PhoneTypes: function () {
                    return getData(staticTypes.PhoneTypes);
                },
                ProviderTypes: function () {
                    return getData(staticTypes.ProviderTypes);
                },
                ReferralTypes: function () {
                    return getData(staticTypes.ReferralTypes);
                },
                States: function () {
                    return getData(staticTypes.States);
                },
                StatusTypes: function () {
                    return getData(staticTypes.StatusTypes);
                },
                ConditionStatus: function () {
                    return getData(staticTypes.ConditionStatus);
                },
                TaxableServices: function () {
                    return getData(staticTypes.TaxableServices);
                },
                PlannedServiceStatuses: function () {
                    return getData(staticTypes.PlannedServiceStatuses);
                },
                ServiceTransactionStatuses: function () {
                    return getData(staticTypes.ServiceTransactionStatuses);
                },
                TaxonomyCodes: function () {
                    return getData(staticTypes.TaxonomyCodes);
                },
                CurrencyTypes: function () {
                    return getData(staticTypes.CurrencyTypes);
                },
                TransactionTypes: function () {
                    return getData(staticTypes.TransactionTypes);
                },
                TeethDefinitions: function () {
                    return getData(staticTypes.TeethDefinitions);
                },
                CdtCodeGroups: function () {
                    return getData(staticTypes.CdtCodeGroups);
                },
                TeethQuadrantAbbreviations: function () {
                    return {
                        'Upper Right': 'UR',
                        'Upper Left': 'UL',
                        'Lower Left': 'LL',
                        'Lower Right': 'LR',
                    };
                },
                ToothRangeToCodeMap: function () {
                    var map = {};
                    map['1-8'] = 'UR';
                    map['A-E'] = 'UR';
                    map['9-16'] = 'UL';
                    map['F-J'] = 'UL';
                    map['1-16'] = 'UA';
                    map['A-J'] = 'UA';
                    map['25-32'] = 'LR';
                    map['P-T'] = 'LR';
                    map['17-24'] = 'LL';
                    map['K-O'] = 'LL';
                    map['17-32'] = 'LA';
                    map['K-T'] = 'LA';
                    map['1-32'] = 'FM';
                    map['A-T'] = 'FM';
                    return map;
                },
                ActivityTypes: activityTypes,
                ActivityActions: activityActions,
                ActivityAreas: activityAreas,
            };
        },
    ])
    .factory('SurfaceHelper', function () {
        return {
            surfaceCSVStringToSurfaceString: function (csvSurfaceString) {
                var result = '';
                var mSelected = false;
                var oSelected = false;
                var iSelected = false;
                var dSelected = false;
                var bSelected = false;
                var fSelected = false;
                var lSelected = false;
                var b5Selected = false;
                var l5Selected = false;
                var f5Selected = false;
                var remainingPart = '';
                var resultString = '';
                var surfaces = csvSurfaceString.split(',');
                _.each(surfaces, function (surface) {
                    switch (surface.trim()) {
                        case 'M':
                            mSelected = true;
                            break;
                        case 'O':
                            oSelected = true;
                            break;
                        case 'I':
                            iSelected = true;
                            break;
                        case 'D':
                            dSelected = true;
                            break;
                        case 'B':
                            bSelected = true;
                            break;
                        case 'F':
                            fSelected = true;
                            break;
                        case 'L':
                            lSelected = true;
                            break;
                        case 'B5':
                            b5Selected = true;
                            break;
                        case 'L5':
                            l5Selected = true;
                            break;
                        case 'F5':
                            f5Selected = true;
                            break;
                        default:
                            break;
                    }
                });
                if (
                    mSelected &&
                    oSelected &&
                    dSelected &&
                    bSelected &&
                    lSelected &&
                    b5Selected &&
                    l5Selected
                ) {
                    resultString = 'MODBL5';
                } else if (
                    mSelected &&
                    iSelected &&
                    dSelected &&
                    fSelected &&
                    lSelected &&
                    f5Selected &&
                    l5Selected
                ) {
                    resultString = 'MIDFL5';
                } else {
                    if (mSelected) {
                        resultString = resultString + 'M';
                    }
                    if (oSelected) {
                        resultString = resultString + 'O';
                    }
                    if (iSelected) {
                        resultString = resultString + 'I';
                    }
                    if (dSelected) {
                        resultString = resultString + 'D';
                    }

                    if (!iSelected && !fSelected && !f5Selected) {
                        if (
                            (bSelected && b5Selected && lSelected && l5Selected) ||
                            (bSelected && b5Selected && !lSelected && l5Selected) ||
                            (bSelected && !b5Selected && !lSelected && l5Selected) ||
                            (!bSelected && b5Selected && !lSelected && l5Selected) ||
                            (bSelected && !b5Selected && lSelected && l5Selected)
                        ) {
                            remainingPart = 'BL5';
                        } else if (
                            (!bSelected && b5Selected && lSelected && l5Selected) ||
                            (!bSelected && b5Selected && lSelected && !l5Selected) ||
                            (bSelected && b5Selected && lSelected && !l5Selected)
                        ) {
                            remainingPart = 'LB5';
                        } else if (bSelected && !b5Selected && lSelected && !l5Selected) {
                            remainingPart = 'BL';
                        } else if (
                            (bSelected && b5Selected && !lSelected && !l5Selected) ||
                            (!bSelected && b5Selected && !lSelected && !l5Selected)
                        ) {
                            remainingPart = 'B5';
                        } else if (
                            (!bSelected && !b5Selected && lSelected && l5Selected) ||
                            (!bSelected && !b5Selected && !lSelected && l5Selected)
                        ) {
                            remainingPart = 'L5';
                        } else if (bSelected && !b5Selected && !lSelected && !l5Selected) {
                            remainingPart = 'B';
                        } else if (!bSelected && !b5Selected && lSelected && !l5Selected) {
                            remainingPart = 'L';
                        }
                    } else if (!oSelected && !bSelected && !b5Selected) {
                        if (
                            (fSelected && f5Selected && lSelected && l5Selected) ||
                            (fSelected && f5Selected && !lSelected && l5Selected) ||
                            (fSelected && !f5Selected && !lSelected && l5Selected) ||
                            (!fSelected && f5Selected && !lSelected && l5Selected) ||
                            (fSelected && !f5Selected && lSelected && l5Selected)
                        ) {
                            remainingPart = 'FL5';
                        } else if (
                            (!fSelected && f5Selected && lSelected && l5Selected) ||
                            (!fSelected && f5Selected && lSelected && !l5Selected) ||
                            (fSelected && f5Selected && lSelected && !l5Selected)
                        ) {
                            remainingPart = 'LF5';
                        } else if (fSelected && !f5Selected && lSelected && !l5Selected) {
                            remainingPart = 'FL';
                        } else if (
                            (fSelected && f5Selected && !lSelected && !l5Selected) ||
                            (!fSelected && f5Selected && !lSelected && !l5Selected)
                        ) {
                            remainingPart = 'F5';
                        } else if (
                            (!fSelected && !f5Selected && lSelected && l5Selected) ||
                            (!fSelected && !f5Selected && !lSelected && l5Selected)
                        ) {
                            remainingPart = 'L5';
                        } else if (fSelected && !f5Selected && !lSelected && !l5Selected) {
                            remainingPart = 'F';
                        } else if (!fSelected && !f5Selected && lSelected && !l5Selected) {
                            remainingPart = 'L';
                        }
                    }
                }
                result = resultString + remainingPart;
                if (!iSelected && !fSelected && !f5Selected) {
                    if (result.indexOf('MOD') < 0 && result.indexOf('OD') >= 0)
                        result = result.replace('OD', 'DO');
                } else if (!oSelected && !bSelected && !b5Selected) {
                    if (result.indexOf('MID') < 0 && result.indexOf('ID') >= 0)
                        result = result.replace('ID', 'DI');
                }

                return result;
            },
            areSurfaceCSVsEqual: function (surfaceCSV1, surfaceCSV2) {
                if (surfaceCSV1 && surfaceCSV2) {
                    if (surfaceCSV1.length !== surfaceCSV2.length) {
                        return false;
                    }
                    var surfaces = surfaceCSV1.split(',');
                    var surfaces2 = surfaceCSV2.split(',');
                    return _.isEqual(surfaces.sort(), surfaces2.sort());
                } else if (!surfaceCSV1 && !surfaceCSV2) {
                    return true;
                } else {
                    return false;
                }
            },
            validateSelectedSurfaces: function (csvSurfaceString, summarySurfaces) {
                var selected = true;
                if (csvSurfaceString) {
                    var mSelected = false;
                    var oSelected = false;
                    var iSelected = false;
                    var dSelected = false;
                    var bSelected = false;
                    var fSelected = false;
                    var lSelected = false;
                    var b5Selected = false;
                    var l5Selected = false;
                    var f5Selected = false;
                    var surfaces = csvSurfaceString.split(',');
                    _.each(surfaces, function (surface) {
                        switch (surface.trim()) {
                            case 'M':
                                mSelected = true;
                                break;
                            case 'O':
                                oSelected = true;
                                break;
                            case 'I':
                                iSelected = true;
                                break;
                            case 'D':
                                dSelected = true;
                                break;
                            case 'B':
                                bSelected = true;
                                break;
                            case 'F':
                                fSelected = true;
                                break;
                            case 'L':
                                lSelected = true;
                                break;
                            case 'B5':
                                b5Selected = true;
                                break;
                            case 'L5':
                                l5Selected = true;
                                break;
                            case 'F5':
                                f5Selected = true;
                                break;
                            default:
                                break;
                        }
                    });
                    if (mSelected) {
                        if ($.inArray('M', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                    if (oSelected) {
                        if ($.inArray('O', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                    if (iSelected) {
                        if ($.inArray('I', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                    if (dSelected) {
                        if ($.inArray('D', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                    if (bSelected) {
                        if ($.inArray('B', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                    if (b5Selected) {
                        if ($.inArray('B5', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                    if (f5Selected) {
                        if ($.inArray('F5', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                    if (fSelected) {
                        if ($.inArray('F', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                    if (lSelected) {
                        if ($.inArray('L', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                    if (l5Selected) {
                        if ($.inArray('L5', summarySurfaces) < 0) {
                            selected = false;
                        }
                    }
                }
                return selected;
            },
            surfaceStringFromCSVs: function (strSelectedServices) {
                var result = '';
                var mSelected = false;
                var oSelected = false;
                var iSelected = false;
                var dSelected = false;
                var bSelected = false;
                var fSelected = false;
                var lSelected = false;
                var b5Selected = false;
                var l5Selected = false;
                var f5Selected = false;
                var remainingPart = '';
                var resultString = '';

                if (strSelectedServices) {
                    if (strSelectedServices.indexOf('M') >= 0) {
                        mSelected = true;
                    }
                    if (strSelectedServices.indexOf('O') >= 0) {
                        oSelected = true;
                    }
                    if (strSelectedServices.indexOf('I') >= 0) {
                        iSelected = true;
                    }
                    if (strSelectedServices.indexOf('D') >= 0) {
                        dSelected = true;
                    }
                    //BL5 entries consideration
                    if (strSelectedServices.indexOf('BL5') >= 0) {
                        lSelected = true;
                        b5Selected = true;
                        l5Selected = true;
                        bSelected = true;
                    }
                    if (strSelectedServices.indexOf('LB5') >= 0) {
                        lSelected = true;
                        b5Selected = true;
                        l5Selected = true;
                    } else if (strSelectedServices.indexOf('B5') >= 0) {
                        b5Selected = true;
                        bSelected = true;
                    } else if (strSelectedServices.indexOf('B') >= 0) {
                        bSelected = true;
                    }
                    if (strSelectedServices.indexOf('L5') >= 0) {
                        l5Selected = true;
                        lSelected = true;
                    } else if (strSelectedServices.indexOf('L') >= 0) {
                        lSelected = true;
                    }

                    //FL5 entries consideration
                    if (strSelectedServices.indexOf('FL5') >= 0) {
                        lSelected = true;
                        f5Selected = true;
                        l5Selected = true;
                        fSelected = true;
                    }
                    if (strSelectedServices.indexOf('LF5') >= 0) {
                        lSelected = true;
                        f5Selected = true;
                        l5Selected = true;
                    } else if (strSelectedServices.indexOf('F5') >= 0) {
                        f5Selected = true;
                        fSelected = true;
                    } else if (strSelectedServices.indexOf('F') >= 0) {
                        fSelected = true;
                    }
                    if (strSelectedServices.indexOf('L5') >= 0) {
                        l5Selected = true;
                        lSelected = true;
                    } else if (strSelectedServices.indexOf('L') >= 0) {
                        lSelected = true;
                    }
                }

                if (
                    mSelected &&
                    oSelected &&
                    dSelected &&
                    bSelected &&
                    lSelected &&
                    b5Selected &&
                    l5Selected
                ) {
                    resultString = 'MODBL5';
                } else if (
                    mSelected &&
                    iSelected &&
                    dSelected &&
                    fSelected &&
                    lSelected &&
                    f5Selected &&
                    l5Selected
                ) {
                    resultString = 'MIDFL5';
                } else {
                    if (mSelected) {
                        resultString = resultString + 'M';
                    }
                    if (oSelected) {
                        resultString = resultString + 'O';
                    }
                    if (iSelected) {
                        resultString = resultString + 'I';
                    }
                    if (dSelected) {
                        resultString = resultString + 'D';
                    }

                    if (!iSelected && !fSelected && !f5Selected) {
                        if (
                            (bSelected && b5Selected && lSelected && l5Selected) ||
                            (bSelected && b5Selected && lSelected && !l5Selected) ||
                            (bSelected && b5Selected && !lSelected && l5Selected) ||
                            (!bSelected && b5Selected && lSelected && !l5Selected) ||
                            (bSelected && !b5Selected && !lSelected && l5Selected) ||
                            (!bSelected && b5Selected && !lSelected && l5Selected) ||
                            (bSelected && !b5Selected && lSelected && l5Selected)
                        ) {
                            remainingPart = 'BL5';
                        } else if (!bSelected && b5Selected && lSelected && l5Selected) {
                            remainingPart = 'LB5';
                        } else if (bSelected && !b5Selected && lSelected && !l5Selected) {
                            remainingPart = 'BL';
                        } else if (
                            (bSelected && b5Selected && !lSelected && !l5Selected) ||
                            (!bSelected && b5Selected && !lSelected && !l5Selected)
                        ) {
                            remainingPart = 'B5';
                        } else if (
                            (!bSelected && !b5Selected && lSelected && l5Selected) ||
                            (!bSelected && !b5Selected && !lSelected && l5Selected)
                        ) {
                            remainingPart = 'L5';
                        } else if (bSelected && !b5Selected && !lSelected && !l5Selected) {
                            remainingPart = 'B';
                        } else if (!bSelected && !b5Selected && lSelected && !l5Selected) {
                            remainingPart = 'L';
                        }
                    } else if (!oSelected && !bSelected && !b5Selected) {
                        if (
                            (fSelected && f5Selected && lSelected && l5Selected) ||
                            (fSelected && f5Selected && lSelected && !l5Selected) ||
                            (fSelected && f5Selected && !lSelected && l5Selected) ||
                            (!fSelected && f5Selected && lSelected && !l5Selected) ||
                            (fSelected && !f5Selected && !lSelected && l5Selected) ||
                            (!fSelected && f5Selected && !lSelected && l5Selected) ||
                            (fSelected && !f5Selected && lSelected && l5Selected)
                        ) {
                            remainingPart = 'FL5';
                        } else if (!fSelected && f5Selected && lSelected && l5Selected) {
                            remainingPart = 'LF5';
                        } else if (fSelected && !f5Selected && lSelected && !l5Selected) {
                            remainingPart = 'FL';
                        } else if (
                            (fSelected && f5Selected && !lSelected && !l5Selected) ||
                            (!fSelected && f5Selected && !lSelected && !l5Selected)
                        ) {
                            remainingPart = 'F5';
                        } else if (
                            (!fSelected && !f5Selected && lSelected && l5Selected) ||
                            (!fSelected && !f5Selected && !lSelected && l5Selected)
                        ) {
                            remainingPart = 'L5';
                        } else if (fSelected && !f5Selected && !lSelected && !l5Selected) {
                            remainingPart = 'F';
                        } else if (!fSelected && !f5Selected && lSelected && !l5Selected) {
                            remainingPart = 'L';
                        }
                    }
                }
                result = resultString + remainingPart;
                if (!iSelected && !fSelected && !f5Selected) {
                    if (result.indexOf('MODB') < 0 && result.indexOf('ODB') >= 0)
                        result = result.replace('OD', 'DO');
                } else if (!oSelected && !bSelected && !b5Selected) {
                    if (result.indexOf('MIDF') < 0 && result.indexOf('IDF') >= 0)
                        result = result.replace('ID', 'DI');
                }

                return result;
            },
            csvStringFromSurfaceString: function (surfaceString) {
                var result = '';
                if (surfaceString) {
                    var strSelectedServices = surfaceString;
                    var mSelected = false;
                    var oSelected = false;
                    var iSelected = false;
                    var dSelected = false;
                    var bSelected = false;
                    var fSelected = false;
                    var lSelected = false;
                    var b5Selected = false;
                    var l5Selected = false;
                    var f5Selected = false;

                    if (strSelectedServices.indexOf('M') >= 0) {
                        mSelected = true;
                    }
                    if (strSelectedServices.indexOf('O') >= 0) {
                        oSelected = true;
                    }
                    if (strSelectedServices.indexOf('I') >= 0) {
                        iSelected = true;
                    }
                    if (strSelectedServices.indexOf('D') >= 0) {
                        dSelected = true;
                    }
                    //BL5 entries consideration
                    if (strSelectedServices.indexOf('BL5') >= 0) {
                        lSelected = true;
                        b5Selected = true;
                        l5Selected = true;
                        bSelected = true;
                    }
                    if (strSelectedServices.indexOf('LB5') >= 0) {
                        lSelected = true;
                        b5Selected = true;
                        l5Selected = true;
                    } else if (strSelectedServices.indexOf('B5') >= 0) {
                        b5Selected = true;
                    } else if (strSelectedServices.indexOf('B') >= 0) {
                        bSelected = true;
                    }
                    if (strSelectedServices.indexOf('L5') >= 0) {
                        l5Selected = true;
                    } else if (strSelectedServices.indexOf('L') >= 0) {
                        lSelected = true;
                    }

                    //FL5 entries consideration
                    if (strSelectedServices.indexOf('FL5') >= 0) {
                        lSelected = true;
                        f5Selected = true;
                        l5Selected = true;
                        fSelected = true;
                    }
                    if (strSelectedServices.indexOf('LF5') >= 0) {
                        lSelected = true;
                        f5Selected = true;
                        l5Selected = true;
                    } else if (strSelectedServices.indexOf('F5') >= 0) {
                        f5Selected = true;
                        fSelected = true;
                    } else if (strSelectedServices.indexOf('F') >= 0) {
                        fSelected = true;
                    }
                    if (strSelectedServices.indexOf('L5') >= 0) {
                        l5Selected = true;
                    } else if (strSelectedServices.indexOf('L') >= 0) {
                        lSelected = true;
                    }

                    result = mSelected ? 'M' : '';
                    if (oSelected) result = result == '' ? 'O' : result + ',' + 'O';
                    if (iSelected) result = result == '' ? 'I' : result + ',' + 'I';
                    if (dSelected) result = result == '' ? 'D' : result + ',' + 'D';
                    if (bSelected) result = result == '' ? 'B' : result + ',' + 'B';
                    if (b5Selected) result = result == '' ? 'B5' : result + ',' + 'B5';
                    if (fSelected) result = result == '' ? 'F' : result + ',' + 'F';
                    if (f5Selected) result = result == '' ? 'F5' : result + ',' + 'F5';

                    if (lSelected) result = result == '' ? 'L' : result + ',' + 'L';

                    if (l5Selected) result = result == '' ? 'L' : result + ',' + 'L5';
                }

                return result;
            },
            setValidSelectedSurfaces: function (
                serviceTransaction,
                summarySurfaces,
                flag
            ) {
                if (serviceTransaction) {
                    var strSelectedServices = serviceTransaction.Surface
                        ? serviceTransaction.Surface.toUpperCase()
                        : serviceTransaction.Surface;
                    var selected = true;
                    if (!strSelectedServices) {
                        return selected;
                    } else {
                        var mSelected = false;
                        var oSelected = false;
                        var iSelected = false;
                        var dSelected = false;
                        var bSelected = false;
                        var fSelected = false;
                        var lSelected = false;
                        var b5Selected = false;
                        var l5Selected = false;
                        var f5Selected = false;
                        var remainingPart = '';
                        var resultString = '';

                        if (strSelectedServices.indexOf('M') >= 0) {
                            mSelected = true;
                        }
                        if (strSelectedServices.indexOf('O') >= 0) {
                            oSelected = true;
                        }
                        if (strSelectedServices.indexOf('I') >= 0) {
                            iSelected = true;
                        }
                        if (strSelectedServices.indexOf('D') >= 0) {
                            dSelected = true;
                        }
                        //BL5 entries consideration
                        if (strSelectedServices.indexOf('BL5') >= 0) {
                            lSelected = true;
                            b5Selected = true;
                            l5Selected = true;
                            bSelected = true;
                        }
                        if (strSelectedServices.indexOf('LB5') >= 0) {
                            lSelected = true;
                            b5Selected = true;
                            l5Selected = true;
                        } else if (strSelectedServices.indexOf('B5') >= 0) {
                            b5Selected = true;
                            bSelected = true;
                        } else if (strSelectedServices.indexOf('B') >= 0) {
                            bSelected = true;
                        }
                        if (strSelectedServices.indexOf('L5') >= 0) {
                            l5Selected = true;
                            lSelected = true;
                        } else if (strSelectedServices.indexOf('L') >= 0) {
                            lSelected = true;
                        }

                        //FL5 entries consideration
                        if (strSelectedServices.indexOf('FL5') >= 0) {
                            lSelected = true;
                            f5Selected = true;
                            l5Selected = true;
                            fSelected = true;
                        }
                        if (strSelectedServices.indexOf('LF5') >= 0) {
                            lSelected = true;
                            f5Selected = true;
                            l5Selected = true;
                        } else if (strSelectedServices.indexOf('F5') >= 0) {
                            f5Selected = true;
                            fSelected = true;
                        } else if (strSelectedServices.indexOf('F') >= 0) {
                            fSelected = true;
                        }
                        if (strSelectedServices.indexOf('L5') >= 0) {
                            l5Selected = true;
                            lSelected = true;
                        } else if (strSelectedServices.indexOf('L') >= 0) {
                            lSelected = true;
                        }
                        if (mSelected) {
                            if ($.inArray('M', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }
                        if (oSelected) {
                            if ($.inArray('O', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }
                        if (iSelected) {
                            if ($.inArray('I', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }
                        if (dSelected) {
                            if ($.inArray('D', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }
                        if (bSelected) {
                            if ($.inArray('B', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }
                        if (b5Selected) {
                            if ($.inArray('B5', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }
                        if (f5Selected) {
                            if ($.inArray('F5', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }
                        if (fSelected) {
                            if ($.inArray('F', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }
                        if (lSelected) {
                            if ($.inArray('L', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }
                        if (l5Selected) {
                            if ($.inArray('L5', summarySurfaces) < 0) {
                                selected = false;
                            }
                        }

                        if (flag) {
                            if (
                                mSelected &&
                                oSelected &&
                                dSelected &&
                                bSelected &&
                                lSelected &&
                                b5Selected &&
                                l5Selected
                            ) {
                                resultString = 'MODBL5';
                            } else if (
                                mSelected &&
                                iSelected &&
                                dSelected &&
                                fSelected &&
                                lSelected &&
                                f5Selected &&
                                l5Selected
                            ) {
                                resultString = 'MIDFL5';
                            } else {
                                if (mSelected) {
                                    resultString = resultString + 'M';
                                }
                                if (oSelected) {
                                    resultString = resultString + 'O';
                                }
                                if (iSelected) {
                                    resultString = resultString + 'I';
                                }
                                if (dSelected) {
                                    resultString = resultString + 'D';
                                }

                                if (!iSelected && !fSelected && !f5Selected) {
                                    if (
                                        (bSelected && b5Selected && lSelected && l5Selected) ||
                                        (bSelected && b5Selected && lSelected && !l5Selected) ||
                                        (bSelected && b5Selected && !lSelected && l5Selected) ||
                                        (!bSelected && b5Selected && lSelected && !l5Selected) ||
                                        (bSelected && !b5Selected && !lSelected && l5Selected) ||
                                        (!bSelected && b5Selected && !lSelected && l5Selected) ||
                                        (bSelected && !b5Selected && lSelected && l5Selected)
                                    ) {
                                        remainingPart = 'BL5';
                                    } else if (
                                        !bSelected &&
                                        b5Selected &&
                                        lSelected &&
                                        l5Selected
                                    ) {
                                        remainingPart = 'LB5';
                                    } else if (
                                        bSelected &&
                                        !b5Selected &&
                                        lSelected &&
                                        !l5Selected
                                    ) {
                                        remainingPart = 'BL';
                                    } else if (
                                        (bSelected && b5Selected && !lSelected && !l5Selected) ||
                                        (!bSelected && b5Selected && !lSelected && !l5Selected)
                                    ) {
                                        remainingPart = 'B5';
                                    } else if (
                                        (!bSelected && !b5Selected && lSelected && l5Selected) ||
                                        (!bSelected && !b5Selected && !lSelected && l5Selected)
                                    ) {
                                        remainingPart = 'L5';
                                    } else if (
                                        bSelected &&
                                        !b5Selected &&
                                        !lSelected &&
                                        !l5Selected
                                    ) {
                                        remainingPart = 'B';
                                    } else if (
                                        !bSelected &&
                                        !b5Selected &&
                                        lSelected &&
                                        !l5Selected
                                    ) {
                                        remainingPart = 'L';
                                    }
                                } else if (!oSelected && !bSelected && !b5Selected) {
                                    if (
                                        (fSelected && f5Selected && lSelected && l5Selected) ||
                                        (fSelected && f5Selected && lSelected && !l5Selected) ||
                                        (fSelected && f5Selected && !lSelected && l5Selected) ||
                                        (!fSelected && f5Selected && lSelected && !l5Selected) ||
                                        (fSelected && !f5Selected && !lSelected && l5Selected) ||
                                        (!fSelected && f5Selected && !lSelected && l5Selected) ||
                                        (fSelected && !f5Selected && lSelected && l5Selected)
                                    ) {
                                        remainingPart = 'FL5';
                                    } else if (
                                        !fSelected &&
                                        f5Selected &&
                                        lSelected &&
                                        l5Selected
                                    ) {
                                        remainingPart = 'LF5';
                                    } else if (
                                        fSelected &&
                                        !f5Selected &&
                                        lSelected &&
                                        !l5Selected
                                    ) {
                                        remainingPart = 'FL';
                                    } else if (
                                        (fSelected && f5Selected && !lSelected && !l5Selected) ||
                                        (!fSelected && f5Selected && !lSelected && !l5Selected)
                                    ) {
                                        remainingPart = 'F5';
                                    } else if (
                                        (!fSelected && !f5Selected && lSelected && l5Selected) ||
                                        (!fSelected && !f5Selected && !lSelected && l5Selected)
                                    ) {
                                        remainingPart = 'L5';
                                    } else if (
                                        fSelected &&
                                        !f5Selected &&
                                        !lSelected &&
                                        !l5Selected
                                    ) {
                                        remainingPart = 'F';
                                    } else if (
                                        !fSelected &&
                                        !f5Selected &&
                                        lSelected &&
                                        !l5Selected
                                    ) {
                                        remainingPart = 'L';
                                    }
                                }
                            }
                            var result = resultString + remainingPart;
                            if (!iSelected && !fSelected && !f5Selected) {
                                if (result.indexOf('MODB') < 0 && result.indexOf('ODB') >= 0)
                                    result = result.replace('OD', 'DO');
                            } else if (!oSelected && !bSelected && !b5Selected) {
                                if (result.indexOf('MIDF') < 0 && result.indexOf('IDF') >= 0)
                                    result = result.replace('ID', 'DI');
                            }

                            serviceTransaction.Surface = result;
                        } else {
                            serviceTransaction.Surface = strSelectedServices.toUpperCase();
                        }

                        return selected;
                    }
                }
                return false;
            },
        };
    })
    .factory('RootHelper', function () {
        return {
            setValidSelectedRoots: function (
                serviceTransaction,
                RootAbbreviations,
                isSaveButtonclicked
            ) {
                if (serviceTransaction) {
                    var selected = true;
                    if (!serviceTransaction.Roots) {
                        return selected;
                    } else {
                        serviceTransaction.Roots = serviceTransaction.Roots.toUpperCase();
                        serviceTransaction.Roots = serviceTransaction.Roots.replace(
                            /,{2,}/,
                            ','
                        );
                        serviceTransaction.Roots = serviceTransaction.Roots.replace(
                            /[^DBMPS,]/gi,
                            ''
                        );
                        serviceTransaction.Roots = serviceTransaction.Roots.replace(
                            /^,/,
                            ''
                        );
                        var arraySelectedServices = serviceTransaction.Roots.split(',');
                        var uniqueArraySelectedServices = [];
                        angular.forEach(arraySelectedServices, function (ele) {
                            if (uniqueArraySelectedServices.indexOf(ele) < 0) {
                                uniqueArraySelectedServices.push(ele);
                            } else {
                                uniqueArraySelectedServices.push('');
                            }
                        });
                        arraySelectedServices = uniqueArraySelectedServices;
                        if (!arraySelectedServices.length) {
                            return selected;
                        } else {
                            if (isSaveButtonclicked) {
                                serviceTransaction.Roots = serviceTransaction.Roots.replace(
                                    /,$/,
                                    ''
                                );
                            }
                            angular.forEach(arraySelectedServices, function (root) {
                                if (selected && root.length > 0) {
                                    var index = RootAbbreviations.indexOf(root);
                                    if (index < 0) {
                                        selected = false;
                                    }
                                }
                            });
                            if (!isSaveButtonclicked) {
                                serviceTransaction.Roots = arraySelectedServices.join(',');
                            }

                            return selected;
                        }
                    }
                }
                return false;
            },
        };
    })
    .factory('BoundObjectFactory', [
        'toastrFactory',
        'localize',
        '$timeout',
        function (toastrFactory, localize, $timeout) {
            var hasId = function (id) {
                return id != undefined && id != null && id != '';
            };

            // special handling for Appointment error if invalid properties contains ServiceCodeId property give alternate toastr message to
            // prompt user to verify the services (one example would be when the serviceCode.AffectedAreaId
            // has been changed after a service has been added to the appointment)
            var checkAppointmentFailedOnInvalidService = function (error) {
                var invalidProperty = _.find(
                    error.data.InvalidProperties,
                    function (property) {
                        return property.PropertyName === 'ServiceCodeId';
                    }
                );
                if (!_.isNil(invalidProperty)) {
                    // we need to provide a different toastr message
                    toastrFactory.error(
                        localize.getLocalizedString(
                            'One or more services on this appointment is invalid.  Please verify the services on this appointment.'
                        ),
                        localize.getLocalizedString('Server Error')
                    );
                    return true;
                }
                return false;
            };

            return {
                Create: function (standardService, objectId, onLoad) {
                    var boundObject = {};
                    boundObject.OriginalData = {};
                    boundObject.Data = {};
                    boundObject.IdField = angular.copy(standardService.IdField);
                    boundObject.Name = angular.copy(standardService.ObjectName);

                    // #region Flags

                    boundObject.Valid = true;
                    boundObject.Loading = false;
                    boundObject.Saving = false;
                    boundObject.Deleting = false;
                    boundObject.IsDuplicate = false;

                    // #endregion

                    // #region Callbacks

                    boundObject.AfterSaveSuccess = null;
                    boundObject.AfterSaveError = null;
                    boundObject.AfterDeleteSuccess = null;
                    boundObject.AfterDeleteError = null;

                    // #endregion

                    // #region Functions

                    boundObject.Validate = function () {
                        boundObject.Valid =
                            !standardService.IsValid ||
                            standardService.IsValid(boundObject.Data);

                        return boundObject.Valid;
                    };

                    boundObject.Load = function (id, afterLoad) {
                        if (!standardService.IdField || hasId(id)) {
                            boundObject.Loading = true;

                            var promise;

                            if (standardService.IdField) {
                                var retrieveParams = {};
                                retrieveParams[standardService.IdField] = id;

                                promise = standardService.Operations.Retrieve(retrieveParams)
                                    .$promise;
                            } else {
                                promise = standardService.Operations.Retrieve().$promise;
                            }

                            promise.then(
                                function (result) {
                                    boundObject.Data = $.extend(boundObject.Data, result.Value);
                                    boundObject.OriginalData = angular.copy(boundObject.Data);

                                    boundObject.Loading = false;

                                    if (afterLoad) {
                                        afterLoad();
                                    }
                                },
                                function (error) {
                                    boundObject.Loading = false;

                                    toastrFactory.error(
                                        localize.getLocalizedString('Failed to retrieve {0}.', [
                                            boundObject.Name,
                                        ]),
                                        'Error'
                                    );
                                }
                            );
                        }
                    };

                    boundObject.HasChanges = function () {
                        var originalData = JSON.stringify(boundObject.OriginalData);
                        var currentData = JSON.stringify(boundObject.Data);

                        return currentData != originalData;
                    };

                    boundObject._SaveSuccessful = function (result) {
                        var successMessage =
                            !standardService.Operations.Create ||
                                !standardService.Operations.Update
                                ? '{0} saved successfully.'
                                : hasId(boundObject.Data[standardService.IdField])
                                    ? '{0} updated successfully.'
                                    : '{0} created successfully.';

                        boundObject.Data = result.Value;
                        boundObject.OriginalData = angular.copy(boundObject.Data);

                        boundObject.Saving = false;

                        toastrFactory.success(
                            localize.getLocalizedString(successMessage, [boundObject.Name]),
                            'Success'
                        );
                        //debugger;

                        if (boundObject.AfterSaveSuccess) {
                            boundObject.AfterSaveSuccess();
                        }
                    };

                    boundObject._SaveFailed = function (error) {
                        boundObject.Saving = false;

                        // intercept the error if this is an appointment and the Invalid Property PropertyName is 'ServiceCodeId'
                        var displayDefaultMessage = true;
                        if (boundObject.Name === 'Appointment') {
                            if (checkAppointmentFailedOnInvalidService(error) === true) {
                                displayDefaultMessage = false;
                            }
                        }
                        if (displayDefaultMessage) {
                            var errorMessage =
                                !standardService.Operations.Create ||
                                    !standardService.Operations.Update
                                    ? 'Failed to save {0}.'
                                    : hasId(boundObject.Data[standardService.IdField])
                                        ? 'Failed to update {0}.'
                                        : 'Failed to create {0}.';

                            toastrFactory.error(
                                localize.getLocalizedString(errorMessage, [boundObject.Name]),
                                'Error'
                            );
                        }

                        if (boundObject.AfterSaveError) {
                            boundObject.AfterSaveError();
                        }
                    };

                    boundObject.Save = function (suppressModal) {
                        if (boundObject.Validate) {
                            boundObject.Validate();
                        }

                        if (boundObject.Valid) {
                            var saveFunction =
                                !standardService.Operations.Create ||
                                    !standardService.Operations.Update
                                    ? standardService.Operations.Save
                                    : hasId(boundObject.Data[standardService.IdField])
                                        ? standardService.Operations.Update
                                        : standardService.Operations.Create;

                            boundObject.Saving = true;
                            boundObject.Data.uiSuppressModal = suppressModal;

                            saveFunction(boundObject.Data).$promise.then(
                                boundObject._SaveSuccessful,
                                boundObject._SaveFailed
                            );
                        } else {
                            if (boundObject.AfterSaveError) {
                                boundObject.AfterSaveError();
                            }
                        }
                    };

                    if (standardService.Operations.Delete) {
                        boundObject.Delete = function () {
                            if (hasId(boundObject.Data[standardService.IdField])) {
                                boundObject.Deleting = true;

                                var promise;

                                if (standardService.IdField) {
                                    var deleteParams = {};
                                    deleteParams[standardService.IdField] =
                                        boundObject.Data[standardService.IdField];

                                    promise = standardService.Operations.Delete(deleteParams)
                                        .$promise;
                                } else {
                                    promise = standardService.Operations.Delete().$promise;
                                }

                                promise.then(
                                    function () {
                                        /** we actually want to return deleted object, mainly for splicing in an array */
                                        //boundObject.Data = {};
                                        boundObject.Deleting = false;

                                        toastrFactory.success(
                                            localize.getLocalizedString('{0} deleted successfully.', [
                                                boundObject.Name,
                                            ]),
                                            'Success'
                                        );

                                        if (boundObject.AfterDeleteSuccess) {
                                            boundObject.AfterDeleteSuccess();
                                        }
                                    },
                                    function (error) {
                                        boundObject.Deleting = false;

                                        toastrFactory.error(
                                            localize.getLocalizedString('Failed to delete {0}.', [
                                                boundObject.Name,
                                            ]),
                                            'Error'
                                        );

                                        if (boundObject.AfterDeleteError) {
                                            boundObject.AfterDeleteError();
                                        }
                                    }
                                );
                            }
                        };
                    }

                    if (standardService.Operations.CheckDuplicate) {
                        boundObject.CheckDuplicate = function (
                            requiredParams,
                            afterCheckDuplicateSuccess,
                            afterCheckDuplicateFailure
                        ) {
                            standardService.Operations.CheckDuplicate(
                                requiredParams
                            ).$promise.then(
                                function (result) {
                                    boundObject.IsDuplicate = result.Value;

                                    if (
                                        afterCheckDuplicateSuccess &&
                                        angular.isFunction(afterCheckDuplicateSuccess)
                                    ) {
                                        afterCheckDuplicateSuccess(result);
                                    }
                                },
                                function (error) {
                                    if (
                                        afterCheckDuplicateFailure &&
                                        angular.isFunction(afterCheckDuplicateFailure)
                                    ) {
                                        afterCheckDuplicateFailure(error);
                                    }
                                }
                            );
                        };
                    }

                    // #endregion

                    boundObject.Load(objectId, onLoad);

                    return boundObject;
                },
                //CreateList: function(standardService, onLoad)
                //{
                //	var boundList = {};
                //	boundList.Items = [];
                //	boundList.IdField = angular.copy(standardService.IdField);
                //	boundList.Name = angular.copy(standardService.ObjectName);
                //	boundList.SearchParams = {
                //		search: "",
                //		skip: 0,
                //		includeInactive: false,
                //		take: null, // null defaults to the service function's defalt.
                //		orderBy: null, // null defaults to the service function's defalt.
                //		descending: null, // null defaults to the service function's defalt.
                //	};

                //	// #region Flags

                //	boundList.Valid = true;
                //	boundList.Loading = true;

                //	// #endregion

                //	// #region Functions

                //	boundList.Validate = function ()
                //	{
                //		angular.forEach(boundList.Items, function(item)
                //		{
                //			item.Valid = (!standardService.IsValid || standardService.IsValid(item));

                //			boundList.Valid = (boundList.Valid && item.Valid);
                //		});

                //		return boundList.Valid;
                //	};

                //	// #region Search Function

                //	if (standardService.Operations.Search)
                //	{
                //		boundList.Delay = 500;
                //		var timeOut = null;
                //		var resultCount = 0;

                //		boundList.AfterSearchSuccess = null;
                //		boundList.AfterSearchError = null;

                //		boundList.CancelSearch = function () {
                //			if (timeOut) {
                //				$timeout.cancel(timeOut);
                //			}
                //		};

                //		boundList.Search = function (scrolling) {
                //			// This is to prevent weird timing issues where the search text is changed after the search is queued, but before it is executed.
                //			var copyOfParams = angular.copy(boundList.SearchParams);

                //			boundList.CancelSearch();

                //			timeOut = $timeout(function () {
                //				if (!scrolling) {
                //					resultCount = 0;
                //					boundList.Items = [];
                //				}

                //				// Don't search if not needed!
                //				if (boundList.Loading || (boundList.Items && resultCount > 0 && boundList.Items.length == resultCount)) {
                //					return;
                //				}

                //				boundList.Loading = true;

                //				standardService.Operations.Search(copyOfParams,
                //						function (result) {
                //							boundList.Loading = false;

                //							angular.forEach(result.Value, function(item)
                //							{
                //								boundList.Items.push(item);
                //							});

                //							// If we are getting a PagedResult object
                //							if (result.Count != undefined && result.Count != null && result.Value) {
                //								resultCount = result.Count;
                //							}
                //							else // otherwise, we are getting an array of values
                //							{
                //								resultCount = result.Value.length;
                //							}

                //							if (boundList.AfterSearchSuccess) {
                //								boundList.AfterSearchSuccess(result);
                //							}
                //						},
                //						function (error) {
                //							boundList.Loading = false;

                //							toastr.error('Please search again.', 'Server Error');

                //							if (boundList.AfterSearchError) {
                //								boundList.AfterSearchError(error);
                //							}
                //						});
                //			}, boundList.Delay);
                //		};
                //	}

                //	// #endregion

                //	// #region GetAll Function

                //	if (standardService.Operations.GetAll)
                //	{
                //		boundList.Load = function(params, afterLoad)
                //		{
                //			boundList.Loading = true;

                //			var promise = params ? standardService.Operations.GetAll(params).$promise : standardService.Operations.GetAll().$promise;

                //			promise.then(function (result)
                //			{
                //				angular.forEach(result.Value, function (item) {
                //					boundList.Items.push(item);
                //				});

                //				boundList.Loading = false;

                //				if (afterLoad)
                //				{
                //					afterLoad();
                //				}
                //			},
                //			function(error)
                //			{
                //				boundList.Loading = false;

                //				toastrFactory.error(localize.getLocalizedString("Failed to retrieve list of {0}.", [boundList.Name]), 'Error');
                //			});
                //		};
                //	}

                //	// #endregion

                //	// #endregion

                //	return boundList;
                //}
            };
        },
    ])
    .factory('StandardService', [
        '$resource',
        function ($resource) {
            return {
                Create: function (
                    name,
                    idParams,
                    url,
                    canUpdate,
                    canDelete,
                    validationFunction
                ) {
                    var methodParams = {};

                    if (angular.isArray(idParams)) {
                        for (var i = 0; i < idParams.length; i++) {
                            methodParams[idParams[i]] = '@' + idParams[i];
                        }
                    } else {
                        methodParams[idParams] = '@' + idParams;
                    }

                    var operations = {
                        Retrieve: { method: 'GET', params: methodParams },
                    };

                    if (canUpdate) {
                        operations.Create = { method: 'POST' };
                        operations.Update = { method: 'PUT' };
                    } else {
                        operations.Save = { method: 'POST' };
                    }

                    if (canDelete) {
                        operations.Delete = { method: 'DELETE', params: methodParams };
                    }

                    return {
                        ObjectName: name,
                        IdField: angular.isArray(idParams) ? idParams[0] : idParams,
                        IsValid: validationFunction,
                        Operations: $resource(url, {}, operations),
                    };
                },
            };
        },
    ])
    .factory('AvailableTime', [
        'ListHelper',
        function (listHelper) {
            var timeObject = function (time, duration, showDuration) {
                return {
                    Duration: duration,
                    Display: time.format('h:mm a'),
                    ShowDuration: showDuration == true ? true : false,
                    Time: moment(time).toISOString(),
                    Visible: true,
                };
            };

            var generateTimes = function (date) {
                var list = [];
                var today = new Date();
                var dateAsJSDate = date
                    ? date.getFullYear
                        ? date
                        : date.toDate()
                    : today;
                var originalStartDate = null;

                if (dateAsJSDate.getDate() >= 28 && dateAsJSDate.getMonth() == 1) {
                    originalStartDate = angular.copy(dateAsJSDate);
                    dateAsJSDate.setMonth(2, dateAsJSDate.getDate());
                }
                var startDate = date
                    ? moment(date)
                    : moment([
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate(),
                        0,
                        0,
                        0,
                        0,
                    ]);
                if (startDate.date() >= 28 && startDate.month() == 1) {
                    startDate = moment(
                        startDate.toDate().setMonth(2, new Date(startDate).getDate())
                    );
                }
                var endDate = moment([
                    dateAsJSDate.getFullYear(),
                    dateAsJSDate.getMonth(),
                    dateAsJSDate.getDate() + 1,
                    0,
                    0,
                    0,
                    0,
                ]);
                if (!endDate.isValid()) {
                    endDate = moment([
                        dateAsJSDate.getFullYear(),
                        dateAsJSDate.getMonth(),
                        dateAsJSDate.getDate(),
                        23,
                        59,
                        0,
                        0,
                    ]);
                }

                var currentDuration = 0;
                var increment = 5; // 5 minutes gets us all of our time options.
                var max = endDate.diff(startDate, 'minutes') - 5;

                if (originalStartDate) {
                    startDate = moment(originalStartDate);
                }

                while (currentDuration <= max) {
                    list.push(timeObject(startDate, currentDuration));

                    startDate.add(increment, 'm');
                    currentDuration += increment;
                }

                return list;
            };

            var getLocalDate = function (isoString) {
                return moment(moment(isoString).format('YYYY-MM-DD HH:mm:ss')).toDate();
            };

            return {
                Generate: function (
                    date,
                    startHour,
                    startMinute,
                    timeIncrement,
                    maxDuration,
                    includeDuration,
                    maxItems,
                    includeZeroDuration
                ) {
                    var times = generateTimes(date);
                    var list = [];

                    var increment = timeIncrement ? timeIncrement : 5;
                    var showDuration = includeDuration == true ? true : false;

                    if (includeZeroDuration != false && times.length > 0) {
                        list.push(times[0]);
                    }

                    for (var i = 1; i < times.length; i++) {
                        if (
                            times[i].Duration <= maxDuration &&
                            getLocalDate(times[i].Time).getMinutes() % increment == 0
                        ) {
                            times[i].ShowDuration = showDuration;
                            list.push(times[i]);
                        }
                    }

                    return list;
                },
            };
        },
    ])
    .factory('ObjectFactory', [
        '$resource',
        'toastrFactory',
        'localize',
        function ($resource, toastrFactory, localize) {
            var createRourceParams = function (params) {
                var resourceParams = {};

                if (angular.isString(params) && params != '') {
                    resourceParams[params] = '@' + params;
                } else if (angular.isArray(params)) {
                    angular.forEach(params, function (param) {
                        resourceParams[params] = '@' + param;
                    });
                } else if (angular.isObject(params)) {
                    resourceParams = params;
                }

                return resourceParams;
            };

            return {
                Validator: {
                    Behaviors: {},
                    Create: function (vlidationBehaviors) {
                        var validator = {};
                        validator.Behaviors = [];
                        validator.Validate = function (object) {
                            var valid = true;

                            angular.forEach(this.Behaviors, function (behavior) {
                                valid = valid && behavior.Validate(object);
                            });

                            return valid;
                        };
                        validator.AddValidationBehavior = function (validationBehavior) {
                            this.Behaviors.push(validationBehavior);
                        };

                        angular.forEach(vlidationBehaviors, function (behavior) {
                            validator.AddValidationBehavior(behavior);
                        });

                        return validator;
                    },
                },
                Dto: {
                    Builder: function (dtoBehaviors) {
                        var behaviors = [];

                        angular.forEach(dtoBehaviors, function (behavior) {
                            behaviors.push(behavior);
                        });

                        return {
                            AddBehavior: function (behavior) {
                                behaviors.push(behavior);
                            },
                            Create: function () {
                                var dto = {};

                                dto.ObjectName = name;

                                angular.forEach(behaviors, function (behavior) {
                                    dto = $.extend(true, dto, behavior);
                                });

                                if (dto.ResourceUrl || dto.ResourceConfig) {
                                    dto.Operations = $resource(
                                        dto.ResourceUrl ? dto.ResourceUrl : {},
                                        {},
                                        dto.ResourceConfig ? dto.ResourceConfig : {}
                                    );
                                }

                                return dto;
                            },
                        };
                    },
                    Behaviors: {
                        IdField: function (idField) {
                            return {
                                IdField: idField,
                            };
                        },
                        ResourceUrl: function (url) {
                            return {
                                ResourceUrl: url ? url : '',
                            };
                        },
                        Validate: function (validator) {
                            return {
                                IsValid: function (object) {
                                    return validator ? validator.Validate(object) : true;
                                },
                                Validator: validator,
                                Valid: false,
                            };
                        },
                        GetById: function (params, urlOverride) {
                            return {
                                ResourceConfig: {
                                    Retrieve: {
                                        method: 'GET',
                                        params: createRourceParams(params),
                                        url: urlOverride,
                                    },
                                },
                            };
                        },
                        Create: function (params, urlOverride) {
                            return {
                                ResourceConfig: {
                                    Create: {
                                        method: 'POST',
                                        params: createRourceParams(params),
                                        url: urlOverride,
                                    },
                                },
                            };
                        },
                        Update: function (params, urlOverride) {
                            return {
                                ResourceConfig: {
                                    Update: {
                                        method: 'PUT',
                                        params: createRourceParams(params),
                                        url: urlOverride,
                                    },
                                },
                            };
                        },
                        Delete: function (params, urlOverride) {
                            return {
                                ResourceConfig: {
                                    Delete: {
                                        method: 'DELETE',
                                        params: createRourceParams(params),
                                        url: urlOverride,
                                    },
                                },
                            };
                        },
                    },
                },
                Dynamic: {
                    Builder: function (genericBehaviors) {
                        var behaviors = [];

                        return {
                            AddBehavior: function (behavior) {
                                behaviors.push(behavior);
                            },
                            Create: function () {
                                var instance = {};

                                instance.Name = name;

                                angular.forEach(behaviors, function (behavior) {
                                    instance = $.extend(instance, behavior);
                                });

                                return instance;
                            },
                        };
                    },
                },
                List: {
                    Behaviors: {},
                    Builder: function (listBehaviors) {
                        var behaviors = [];

                        return {
                            AddBehavior: function (behavior) {
                                behaviors.push(behavior);
                            },
                            Create: function () {
                                var list = [];

                                list.Name = name;

                                angular.forEach(behaviors, function (behavior) {
                                    list = $.extend(list, behavior);
                                });

                                return list;
                            },
                        };
                    },
                },
            };
        },
    ])
    .factory('toastrFactory', [
        'localize',
        function (localize) {
            // Set Toastr Preferences
            toastr.options = {
                closeButton: false,
                debug: false,
                positionClass: 'toast-bottom-right',
                onclick: null,
                showDuration: '300',
                hideDuration: '1000',
                timeOut: '2500',
                showEasing: 'swing',
                hideEasing: 'linear',
                showMethod: 'fadeIn',
                hideMethod: 'fadeOut',
            };

            var localizeMessage = function (message) {
                if (angular.isObject(message)) {
                    return localize.getLocalizedString(message.Text, message.Params);
                } else {
                    return localize.getLocalizedString(message);
                }
            };

            return {
                error: function (msg, title) {
                    return toastr.error(localizeMessage(msg), localizeMessage(title));
                },
                warning: function (msg, title) {
                    return toastr.warning(localizeMessage(msg), localizeMessage(title));
                },
                success: function (msg, title) {
                    return toastr.success(localizeMessage(msg), localizeMessage(title));
                },
                info: function (msg, title, options) {
                    return toastr.info(
                        localizeMessage(msg),
                        localizeMessage(title),
                        options
                    );
                },
            };
        },
    ])
    .factory('ListHelper', function () {
        function compare(s1, s2, ignoreCase, useLocale) {
            if (ignoreCase) {
                if (useLocale) {
                    s1 = s1.toLocaleLowerCase();
                    s2 = s2.toLocaleLowerCase();
                } else {
                    s1 = s1.toLowerCase();
                    s2 = s2.toLowerCase();
                }
            }
            return s1 === s2;
        }

        return {
            findAllByPredicate: function (list, predicateFunction) {
                var items = [];

                if (predicateFunction != null) {
                    for (var i = 0, length = list.length; i < length; i++) {
                        if (predicateFunction(list[i], i)) {
                            items.push(list[i]);
                        }
                    }
                }

                return items;
            },
            findItemByFieldValue: function (list, fieldName, value) {
                if (list && fieldName && value != null) {
                    for (var i = 0; i < list.length; i++) {
                        if (list[i][fieldName] == value) {
                            return list[i];
                        }
                    }
                }
                return null;
            },
            findItemsByFieldValue: function (list, fieldName, value) {
                // find all matching records and return them as a list
                var allMatchingItems = [];
                if (list && fieldName && value != null) {
                    for (var i = 0; i < list.length; i++) {
                        if (list[i][fieldName] == value) {
                            allMatchingItems.push(list[i]);
                        }
                    }
                }
                return allMatchingItems.length > 0 ? allMatchingItems : null;
            },
            findItemByFieldValueIgnoreCase: function (list, fieldName, value) {
                if (list && fieldName && value) {
                    for (var i = 0; i < list.length; i++) {
                        if (compare(list[i][fieldName], value, true, false)) {
                            return list[i];
                        }
                    }
                }
                return null;
            },
            findIndexByFieldValue: function (list, fieldName, value) {
                if (list && fieldName && value != null) {
                    for (var i = 0; i < list.length; i++) {
                        if (list[i][fieldName] == value) {
                            return i;
                        }
                    }
                }
                return -1;
            },
            findIndexByPredicate: function (list, predicateFunction) {
                if (predicateFunction != null) {
                    for (var i = 0, length = list.length; i < length; i++) {
                        if (predicateFunction(list[i], i)) {
                            return i;
                        }
                    }
                }

                return -1;
            },
            findItemByPredicate: function (list, predicateFunction) {
                var item = null;

                if (predicateFunction != null) {
                    for (
                        var i = 0, length = list.length;
                        i < length && item == null;
                        i++
                    ) {
                        if (predicateFunction(list[i], i)) {
                            return list[i];
                        }
                    }
                }

                return item;
            },
            addObjectToList: function (list, item, index) {
                if (!list) {
                    list = [];
                }
                if (item) {
                    if (index && index > -1) {
                        list.splice(index, 0, angular.copy(item));
                    } else {
                        list.push(angular.copy(item));
                    }
                } else {
                    list.push({});
                }
            },
            createConcatenatedString: function (list, display, delimiter) {
                var value = '';
                var listSize = list ? list.length : 0;
                var delimiterSize = delimiter ? String(delimiter).length : 0;
                var itemString;
                if (display != null) {
                    for (var i = 0; i < listSize; i++) {
                        itemString = angular.isFunction(display)
                            ? display(list[i])
                            : list[i][display];

                        value += itemString > '' ? itemString + delimiter : '';
                    }

                    if (value > '') {
                        value = value.substr(0, value.length - delimiterSize);
                    }
                }

                return value;
            },
        };
    })
    .factory('SearchFactory', [
        '$timeout',
        'toastrFactory',
        'localize',
        function ($timeout, toastrFactory, localize) {
            var toastr = toastrFactory;
            var timeOut = $timeout;
            var defaultSearchParameters = {
                search: '',
                skip: 0,
                includeInactive: false,
                take: null, // null defaults to the service function's defalt.
                orderBy: null, // null defaults to the service function's defalt.
                descending: null, // null defaults to the service function's defalt.
            };

            return {
                GetDefaultSearchParameters: function () {
                    return angular.copy(defaultSearchParameters);
                },
                CreateSearch: function (
                    searchFunction,
                    onSuccess,
                    onError,
                    searchDelay
                ) {
                    var newSearch = {};

                    newSearch.Delay = searchDelay ? searchDelay : 500;
                    newSearch.Executing = false;
                    newSearch.TimeOut = null;
                    newSearch.Results = [];
                    newSearch.ResultCount = 0;

                    newSearch.SearchFunction = searchFunction;
                    newSearch.OnSuccess = onSuccess;
                    newSearch.OnError = onError;

                    newSearch.Cancel = function () {
                        if (newSearch.TimeOut) {
                            timeOut.cancel(newSearch.TimeOut);
                        }
                    };

                    newSearch.Execute = function (params, scrolling) {
                        // This is to prevent weird timing issues where the search text is changed after the search is queued, but before it is executed.
                        var copyOfParams = angular.copy(params);

                        newSearch.Cancel();

                        newSearch.TimeOut = timeOut(function () {
                            if (!scrolling) {
                                newSearch.ResultCount = 0;
                                newSearch.Results = [];
                            }

                            // Don't search if not needed!
                            if (
                                newSearch.Executing ||
                                (newSearch.Results &&
                                    newSearch.ResultCount > 0 &&
                                    newSearch.Results.length == newSearch.ResultCount)
                            ) {
                                return;
                            }

                            newSearch.Executing = true;

                            newSearch.SearchFunction(
                                copyOfParams,
                                function (result) {
                                    newSearch.Executing = false;

                                    if (newSearch.OnSuccess) {
                                        newSearch.OnSuccess(result);
                                    } else {
                                        // If we are getting a PagedResult object
                                        if (
                                            result.Count != undefined &&
                                            result.Count != null &&
                                            result.Value
                                        ) {
                                            newSearch.ResultCount = result.Count;
                                            newSearch.Results = newSearch.Results.concat(
                                                result.Value
                                            );
                                        } // otherwise, we are getting an array of values
                                        else {
                                            newSearch.ResultCount = result.Value.length;
                                            newSearch.Results = newSearch.Results.concat(result);
                                        }
                                    }
                                },
                                function (error) {
                                    newSearch.Executing = false;

                                    toastr.error(
                                        localize.getLocalizedString('Please search again.'),
                                        localize.getLocalizedString('Server Error')
                                    );

                                    if (newSearch.OnError) {
                                        newSearch.OnError(error);
                                    }
                                }
                            );
                        }, newSearch.Delay);
                    };

                    return newSearch;
                },
            };
        },
    ])
    .factory('NavigationData', function () {
        var secondaryNavHeaderText = '';
        var secondaryNavMenuItems = [];

        return {
            secondaryNavHeaderText: secondaryNavHeaderText,
            secondaryNavMenuItems: secondaryNavMenuItems,
        };
    })
    .factory('FlyoutData', function () {
        var flyoutMenuItems = [
            {
                id: '1',
                name: 'New Dashboard',
                auth: '',
            },
            {
                id: '0',
                name: 'Original Dashboard',
                auth: '',
            },
            {
                id: '2',
                name: 'Schedule',
                auth: 'soar-sch-sptapt-finish',
            },
        ];

        return {
            flyoutMenuItems: flyoutMenuItems,
        };
    })
    .factory('Page', [
        '$rootScope',
        '$location',
        '$timeout',
        '$window',
        'ModalFactory',
        'DiscardChangesService',
        'DiscardService',
        'localize',
        'DISPLAY_AS',
        'PaymentGatewayFactory',
        function (
            $rootScope,
            $location,
            $timeout,
            $window,
            modalFactory,
            discardChangesService,
            discardService,
            localize,
            pageTitle,
            paymentGatewayFactory
        ) {
            var page = this;

            // preventing location change and prompting users if they have changes for relevant controllers
            page.modalIsOpen = false;

            // keeping track of the route info to check for changes below
            page.routeInfo = null;

            page.previousRoute = null;

            page.RouteChangeSuccessEvents = [];

            var pageFactory = {
                Title: function (newTitle) {
                    if (newTitle != null) {
                        page.Title = newTitle;
                    }
                    if (page.Title === '') {
                        page.Title = pageTitle;
                    }
                    document.title = page.Title;
                    return page.Title;
                },
                Previous: function () {
                    return angular.copy(page.previousRoute);
                },
                OnRouteChangeStart: function (event, next, current) {
                    $rootScope.suppressLoadingModal = false;
                    page.routeInfo = current;
                },
                OnRouteChangeSuccess: function (event, route) {
                    if (route.$$route && route.$$route.title) {
                        pageFactory.Title(
                            angular.isFunction(route.$$route.title)
                                ? route.$$route.title(route.locals)
                                : route.$$route.title
                        );
                    }
                    _.each(page.RouteChangeSuccessEvents, function (event) {
                        if (event && typeof event == 'function') event(route);
                    });
                },
                OnLocationChangeStart: function (event, newUrl, oldUrl) {
                    if (
                        newUrl != oldUrl &&
                        (page.previousRoute == null || page.previousRoute != oldUrl)
                    ) {
                        page.previousRoute = oldUrl;
                    }
                    if (
                        page.routeInfo &&
                        page.routeInfo.controller &&
                        page.routeInfo.scope
                    ) {
                        // special handling of discards for tabs that aren't connected with a route change
                        // currently this is just in place for the PatientNotesCrudController
                        if (
                            discardChangesService.currentChangeRegistration !== null &&
                            discardChangesService.currentChangeRegistration.hasChanges ===
                            true
                        ) {
                            event.preventDefault();
                            // ask to discard
                            $rootScope.suppressLoadingModal = true;
                            modalFactory
                                .WarningModal(
                                    discardChangesService.currentChangeRegistration.customMessage
                                )
                                .then(function (result) {
                                    if (result === true) {
                                        // discard changes and reroute
                                        discardChangesService.currentChangeRegistration.hasChanges = false;
                                        $location.path(
                                            newUrl.substring(
                                                $location.absUrl().length - $location.url().length
                                            )
                                        );
                                    }
                                });
                            return;
                        }

                        // prompting the user if there are changes
                        var relevantController = discardService.getRelevantController(
                            page.routeInfo.controller
                        );
                        if (
                            relevantController &&
                            discardService.hasChanges(
                                relevantController,
                                page.routeInfo.scope,
                                false
                            )
                        ) {
                            // stopping the location change
                            event.preventDefault();
                            $rootScope.suppressLoadingModal = true;
                            if (page.modalIsOpen === false) {
                                page.modalIsOpen = true;
                                modalFactory.WarningModal().then(function (result) {
                                    // if the result is true, they confirmed that they want to discard changes, restart location change
                                    if (result === true) {
                                        discardService.hasChanges(
                                            relevantController,
                                            page.routeInfo.scope,
                                            true
                                        );
                                        $location.path(
                                            newUrl.substring(
                                                $location.absUrl().length - $location.url().length
                                            )
                                        );
                                        page.modalIsOpen = false;
                                    } else if (result === false) {
                                        page.modalIsOpen = false;
                                    }
                                });
                            }
                        }
                        if (paymentGatewayFactory.isWindowOpen()) {
                            paymentGatewayFactory.forceCloseWindow();
                        }
                    }
                },
                BeforeExit: function (event) {
                    if (
                        page.routeInfo &&
                        page.routeInfo.controller &&
                        page.routeInfo.scope
                    ) {
                        // prompting the user if there are changes
                        var relevantController = discardService.getRelevantController(
                            page.routeInfo.controller
                        );
                        if (
                            relevantController &&
                            discardService.hasChanges(
                                relevantController,
                                page.routeInfo.scope,
                                false
                            )
                        ) {
                            return localize.getLocalizedString(
                                'There are unsaved changes on this page. Leaving this page will discard all unsaved changes.'
                            );
                        }
                    }
                    if (paymentGatewayFactory.isWindowOpen()) {
                        return 'open edge is in progress, are you sure?';
                    }
                },
                AddRouteChangeSuccessEvent: function (eventFunction) {
                    page.RouteChangeSuccessEvents.push(eventFunction);
                },
            };

            return pageFactory;
        },
    ])
    .factory('GlobalSearchFactory', [
        'GlobalSearchServices',
        '$timeout',
        '$rootScope',
        'PatCacheFactory',
        function (globalSearchServices, $timeout, $rootScope, cacheFactory) {
            var recentPersons = [];
            var queryingServer = false;

            var mostRecentPerson = {
                MostRecentTypeId: '',
                ValueEntered: '',
            };
            // load the recent persons list to local storage
            var loadRecentPersons = function () {
                if (!queryingServer) {
                    queryingServer = true;
                    globalSearchServices.MostRecent.get(
                        loadMostRecentOnSuccess,
                        loadMostRecentOnError
                    ).$promise.finally(function () {
                        queryingServer = false;
                    });
                }
            };
            var loadMostRecentOnSuccess = function (res) {
                $timeout(function () {
                    sessionStorage.setItem(
                        'MostRecentPersons',
                        JSON.stringify(res.Value)
                    );
                    // broadcast that we are finished reloading the list
                    $rootScope.$broadcast(
                        'soar:loading-most-recent-list',
                        false,
                        res.Value
                    );
                }, 0);
            };
            var loadMostRecentOnError = function () {};
            // get the recent persons list to local storage
            var getRecentPersons = function () {
                if ($rootScope.patAuthContext.accessLevel != 'Inactive') {
                    loadRecentPersons();
                    recentPersons = JSON.parse(
                        sessionStorage.getItem('MostRecentPersons')
                    );
                    return recentPersons;
                }
            };
            // save the most recent
            var saveMostRecentPerson = function (personId) {
                mostRecentPerson = {};
                mostRecentPerson.PatientId = personId;
                mostRecentPerson.uiSuppressModal = true;
                // broadcast that we are reloading the list
                $rootScope.$broadcast('soar:loading-most-recent-list', true);
                globalSearchServices.MostRecent.save(
                    mostRecentPerson,
                    saveMostRecentOnSuccess,
                    saveMostRecentOnError
                );
            };
            var saveMostRecentOnSuccess = function () {
                queryingServer = false;
                var cache = cacheFactory.GetCache('GlobalSearchServices');
                cache.removeAll();
                loadRecentPersons();
            };
            var saveMostRecentOnError = function () {};
            var clearRecentPersons = function () {
                sessionStorage.setItem('MostRecentPersons', null);
            };
            return {
                ClearRecentPersons: function () {
                    clearRecentPersons();
                },
                LoadRecentPersons: function () {
                    loadRecentPersons();
                },
                MostRecentPersons: function () {
                    return getRecentPersons();
                },
                SaveMostRecentPerson: function (personId) {
                    saveMostRecentPerson(personId);
                },
            };
        },
    ])
    .factory('RequestHelper', [
        '$q',
        '$timeout',
        '$uibModal',
        'toastrFactory',
        'localize',
        function ($q, $timeout, $uibModal, toastrFactory, localize) {
            var paramsHaveChanged = function (params1, params2) {
                var p1 = params1 != null ? params1 : {};
                var p2 = params2 != null ? params2 : {};

                return JSON.stringify(p1) != JSON.stringify(p2);
            };

            var createObjectRequest = function (
                serviceFunction,
                params,
                objectType,
                reretrieve,
                afterSuccess,
                afterError
            ) {
                var objectRequestCompleted = $q.defer();
                var objectRequest = {
                    AfterSuccess: afterSuccess,
                    AfterError: afterError,
                    ServiceCall: serviceFunction,
                    ServiceCalled: false,
                    Params: params,
                    Promise: objectRequestCompleted.promise.then(function (existingData) {
                        objectRequest.Executing = false;

                        objectRequest.Result = existingData;

                        if (objectRequest.AfterSuccess != null) {
                            objectRequest.AfterSuccess(objectRequest.Result);
                        }
                    }),
                    Result: {
                        Params: null,
                        Value: null,
                    },
                    Reretrieve: reretrieve != null ? reretrieve : false,
                    Execute: function (existingData) {
                        // call the service call if
                        // 1. we don't have any existing data
                        // 2. we want to re-retrieve the data regardless if whether we have data already dertmined by
                        //   a. reretrieve being set to true
                        //   b. retreive being a function that is passed the parameters, it should return true if data should be reretrieved
                        // 3. we have don't have a list
                        if (
                            existingData == null ||
                            existingData.Value == null ||
                            paramsHaveChanged(existingData.Params, objectRequest.Params) ||
                            reretrieve == true ||
                            (angular.isFunction(reretrieve) &&
                                reretrieve(objectRequest.Params))
                        ) {
                            objectRequest.Executing = true;
                            objectRequest.ServiceCalled = true;

                            var promise = serviceFunction(params);
                            promise = promise.$promise != null ? promise.$promise : promise;

                            objectRequest.Promise = promise.then(
                                function (result) {
                                    objectRequest.Executing = false;

                                    objectRequest.Result = {
                                        Params: objectRequest.Params,
                                        Value: result.Value,
                                    };

                                    if (objectRequest.AfterSuccess != null) {
                                        objectRequest.AfterSuccess(objectRequest.Result);
                                    }
                                },
                                function (error) {
                                    objectRequest.Executing = false;

                                    objectRequest.Result.Value = {};

                                    if (error.status != 400 && error.status != 404) {
                                        toastrFactory.error(
                                            localize.getLocalizedString('Failed to retrieve {0}.', [
                                                objectType != null ? objectType : objectType,
                                            ]),
                                            'Error'
                                        );
                                    }

                                    if (objectRequest.AfterError != null) {
                                        objectRequest.AfterError(error);
                                    }
                                }
                            );
                        } else {
                            $timeout(function () {
                                objectRequestCompleted.resolve(existingData);
                            }, 0);
                        }

                        return objectRequest.Promise;
                    },
                    Executing: false,
                };

                return objectRequest;
            };

            var createListRequest = function (
                serviceFunction,
                params,
                objectType,
                reretrieve,
                afterSuccess,
                afterError
            ) {
                var listRequestCompleted = $q.defer();
                var listRequest = {
                    AfterSuccess: afterSuccess,
                    AfterError: afterError,
                    ServiceCall: serviceFunction,
                    ServiceCalled: false,
                    Params: params,
                    Promise: listRequestCompleted.promise.then(function (existingData) {
                        listRequest.Executing = false;

                        listRequest.Result = existingData;

                        if (listRequest.AfterSuccess != null) {
                            listRequest.AfterSuccess(listRequest.Result);
                        }
                    }),
                    Result: {
                        Params: null,
                        Value: [],
                    },
                    Reretrieve: reretrieve != null ? reretrieve : false,
                    Execute: function (existingData) {
                        // call the service call if
                        // 1. we don't have any existing data
                        // 2. we want to re-retrieve the data regardless if whether we have data already dertmined by
                        //   a. reretrieve being set to true
                        //   b. retreive being a function that is passed the parameters, it should return true if data should be reretrieved
                        // 3. we have don't have a list
                        if (
                            existingData == null ||
                            existingData.Value == null ||
                            existingData.Value.length == 0 ||
                            paramsHaveChanged(existingData.Params, listRequest.Params) ||
                            reretrieve == true ||
                            (angular.isFunction(reretrieve) && reretrieve(listRequest.Params))
                        ) {
                            listRequest.Executing = true;
                            listRequest.ServiceCalled = true;

                            var promise = serviceFunction(params);
                            promise = promise.$promise != null ? promise.$promise : promise;

                            listRequest.Promise = promise.then(
                                function (result) {
                                    listRequest.Executing = false;

                                    listRequest.Result = {
                                        Params: listRequest.Params,
                                        Value: result.Value,
                                    };

                                    if (listRequest.AfterSuccess != null) {
                                        listRequest.AfterSuccess(listRequest.Result);
                                    }
                                },
                                function (error) {
                                    listRequest.Executing = false;

                                    listRequest.Result.Value = [];
                                    toastrFactory.error(
                                        localize.getLocalizedString(
                                            'Failed to retrieve list of {0}.',
                                            [objectType != null ? objectType : objectType]
                                        ),
                                        'Error'
                                    );

                                    if (listRequest.AfterError != null) {
                                        listRequest.AfterError(error);
                                    }
                                }
                            );
                        } else {
                            $timeout(function () {
                                listRequestCompleted.resolve(existingData);
                            }, 0);
                        }

                        return listRequest.Promise;
                    },
                    Executing: false,
                };

                return listRequest;
            };

            var createBatchRequest = function (
                existingData,
                afterSuccess,
                afterError
            ) {
                var requestsToMake = [];
                var loadingModal = null;
                var loadingModalTimer = null;

                var batchRequest = {
                    AfterSuccess: afterSuccess,
                    AfterError: afterError,
                    AddRequest: function (request, destinationProprty) {
                        request.AppendTo =
                            destinationProprty > '' ? destinationProprty : null;

                        requestsToMake.push(request);
                    },
                    Executing: false,
                    ShowLoadingModal: true,
                    Execute: function () {
                        var promises = [];
                        var promise = null;
                        var existingRequestData = null;

                        if (batchRequest.ShowLoadingModal) {
                            $timeout.cancel(loadingModalTimer);
                            loadingModalTimer = $timeout(function () {
                                if (batchRequest.Executing) {
                                    loadingModal = $uibModal.open({
                                        template:
                                            '<div>' +
                                            '  <i id="resolveLoadingSpinner" class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
                                            '  <label style="padding-top: 5px">{{ \'Loading\' | i18n }}...</label>' +
                                            '</div>',
                                        size: 'sm',
                                        windowClass: 'modal-loading',
                                        backdrop: 'static',
                                        keyboard: false,
                                    });
                                }
                            }, 250);
                        }

                        batchRequest.Executing = true;

                        angular.forEach(requestsToMake, function (request) {
                            existingRequestData = batchRequest.Result[request.AppendTo];

                            promise = request.Execute(existingRequestData).then(function () {
                                batchRequest.Result[request.AppendTo] = request.Result;
                            });

                            if (promise != null) {
                                promises.push(promise);
                            }
                        });

                        batchRequest.Promise = $q.all(promises).then(
                            function () {
                                batchRequest.Executing = false;

                                if (batchRequest.AfterSuccess != null) {
                                    batchRequest.AfterSuccess(batchRequest.Result);
                                }

                                if (loadingModal != null) {
                                    loadingModal.dismiss();
                                }
                            },
                            function (error) {
                                if (loadingModal != null) {
                                    loadingModal.dismiss();
                                }
                            },
                            function (error) {
                                batchRequest.Executing = false;

                                angular.forEach(requestsToMake, function (request) {
                                    if (batchRequest[request.AppendTo] == null) {
                                        batchRequest[request.AppendTo] = request.Result;
                                    }
                                });

                                if (batchRequest.AfterError != null) {
                                    batchRequest.AfterError(error);
                                }
                            }
                        );

                        return batchRequest.Promise;
                    },
                    Promise: {
                        then: function () {
                            return batchRequest.Result;
                        },
                    },
                    Result: existingData != null ? existingData : {},
                };

                return batchRequest;
            };

            var dataFactory = {
                BatchRequest: createBatchRequest,
                ListRequest: createListRequest,
                ObjectRequest: createObjectRequest,
            };

            return dataFactory;
        },
    ])
    .factory('ModalDataFactory', [
        '$q',
        'RequestHelper',
        'PatientServices',
        'ScheduleServices',
        'UserServices',
        'LocationServices',
        'StaticData',
        'ScheduleViews',
        '$filter',
        'PaymentTypesService',
        'AdjustmentTypesService',
        'ListHelper',
        'ShareData',
        'CommonServices',
        'AppointmentService',
        'AppointmentTypesFactory',
        'LocationsFactory',
        'UsersFactory',
        'referenceDataService',
        function (
            $q,
            requestHelper,
            patientServices,
            scheduleServices,
            userServices,
            locationServices,
            staticData,
            scheduleViews,
            $filter,
            paymentTypesService,
            adjustmentTypesService,
            listHelper,
            shareData,
            commonServices,
            appointmentService,
            appointmentTypesFactory,
            locationsFactory,
            usersFactory,
            referenceDataService
        ) {
            return {
                GetBlockEditData: function (appointment, locationId) {
                    // code to deal with some odd code in the Block Modal
                    appointment.existingAppointment = angular.copy(appointment);

                    var appointmentEditBatchRequest = requestHelper.BatchRequest(
                        appointment
                    );

                    return appointmentEditBatchRequest.Execute().then(function () {
                        var ofcLocation = $.extend(
                            _.find(
                                referenceDataService.get(
                                    referenceDataService.entityNames.locations
                                ),
                                { LocationId: locationId }
                            ),
                            { id: locationId }
                        );
                        appointmentEditBatchRequest.Result.location = {
                            Value: ofcLocation,
                        };
                        return appointmentEditBatchRequest.Result;
                    });
                },
                GetAppointmentEditData: function (
                    existingAppointmentEditData,
                    patientId,
                    locationId,
                    providerId,
                    appointment
                ) {
                    var appointmentEditData =
                        existingAppointmentEditData != null
                            ? angular.copy(existingAppointmentEditData)
                            : {};
                    appointmentEditData.existingAppointment = angular.copy(appointment);
                    appointmentEditData.existingAppointment.StartTime = appointment.StartTime
                        ? new Date(appointment.StartTime)
                        : null;
                    appointmentEditData.existingAppointment.EndTime = appointment.EndTime
                        ? new Date(appointment.EndTime)
                        : null;

                    var appointmentEditBatchRequest = requestHelper.BatchRequest(
                        appointmentEditData
                    );

                    var patientObjectRequest = requestHelper.ObjectRequest(
                        patientServices.Patient.Operations.Retrieve,
                        { PatientId: patientId },
                        'Patient'
                    );
                    var patientPhonesListRequest = requestHelper.ListRequest(
                        patientServices.Contacts.get,
                        { Id: patientId },
                        'Patient Phone Numbers'
                    );

                    if (
                        patientId > '' &&
                        patientId != '00000000-0000-0000-0000-000000000000'
                    ) {
                        appointmentEditBatchRequest.AddRequest(
                            patientObjectRequest,
                            'patient'
                        );
                        appointmentEditBatchRequest.AddRequest(
                            patientPhonesListRequest,
                            'patientPhones'
                        );
                    } else {
                        appointmentEditData.patient = {
                            Params: null,
                            Value: null,
                        };
                    }

                    return appointmentEditBatchRequest.Execute().then(function () {
                        var ofcLocation = $.extend(
                            _.find(
                                referenceDataService.get(
                                    referenceDataService.entityNames.locations
                                ),
                                { LocationId: locationId }
                            ),
                            { id: locationId }
                        );
                        appointmentEditBatchRequest.Result.location = {
                            Value: ofcLocation,
                        };
                        return appointmentEditBatchRequest.Result;
                    });
                },
                GetAppointmentEditDataRefactor: function (
                    locationId,
                    providerId,
                    appointment
                ) {
                    //debugger;
                    var appointmentEditData = {};

                    var appointmentEditBatchRequest = requestHelper.BatchRequest(
                        appointmentEditData
                    );

                    var paramsApointment = {
                        appointmentId: angular.isUndefined(appointment.AppointmentId)
                            ? appointment
                            : appointment.AppointmentId,
                        FillAppointmentType: true,
                        FillLocation: true,
                        FillPerson: true,
                        FillProviders: true,
                        FillRoom: false,
                        FillProviderUsers: true,
                        FillServices: true,
                        FillServiceCodes: true,
                        FillPhone: true,
                        IncludeCompletedServices: true,
                    };
                    var appointmentObjectRequest = requestHelper.ObjectRequest(
                        patientServices.PatientAppointment.GetWithDetails,
                        paramsApointment,
                        'Appointment Detail'
                    );

                    appointmentEditBatchRequest.AddRequest(
                        appointmentObjectRequest,
                        'appointmentDetail'
                    );

                    return appointmentEditBatchRequest.Execute().then(function () {
                        //debugger;
                        var apptDetail =
                            appointmentEditBatchRequest.Result.appointmentDetail.Value;
                        appointmentService.AppendDetails(
                            apptDetail.Appointment,
                            apptDetail
                        );
                        appointmentEditBatchRequest.Result.existingAppointment = angular.copy(
                            apptDetail.Appointment
                        );
                        appointmentEditBatchRequest.Result.location = {
                            Value: apptDetail.Location,
                        };
                        appointmentEditBatchRequest.Result.patient = {
                            Value: apptDetail.Person,
                        };
                        appointmentEditBatchRequest.Result.patientPhones = {
                            Value: apptDetail.ContactInformation,
                        };
                        appointmentEditBatchRequest.Result.location.Value = $.extend(
                            appointmentEditBatchRequest.Result.location.Value,
                            { id: locationId }
                        );

                        return appointmentEditBatchRequest.Result;
                    });
                },
                GetEncounterModalData: function (
                    existingEncounterModalData,
                    patientId,
                    locationId,
                    operationMode,
                    appointmentId,
                    appointmentTypeId,
                    encounterToEdit
                ) {
                    var encounterModalData =
                        existingEncounterModalData != null
                            ? angular.copy(existingEncounterModalData)
                            : {};

                    encounterModalData.OperationMode = operationMode;
                    encounterModalData.EncounterToEdit = encounterToEdit;

                    var ecounterModalBatchRequest = requestHelper.BatchRequest(
                        encounterModalData
                    );

                    var patientObjectRequest = requestHelper.ObjectRequest(
                        patientServices.Patient.Operations.Retrieve,
                        { PatientId: patientId },
                        'Patient'
                    );
                    var accountObjectRequest = requestHelper.ObjectRequest(
                        patientServices.Account.getByPersonId,
                        { personId: patientId },
                        'Account'
                    );
                    var transactionTypeListRequest = requestHelper.ListRequest(
                        staticData.TransactionTypes,
                        null,
                        'Transaction Types'
                    );

                    ecounterModalBatchRequest.AddRequest(
                        patientObjectRequest,
                        'CurrentPatient'
                    );
                    ecounterModalBatchRequest.AddRequest(accountObjectRequest, 'Account');
                    ecounterModalBatchRequest.AddRequest(
                        transactionTypeListRequest,
                        'TransactionTypes'
                    );

                    if (appointmentId > '') {
                        var appointmentObjectRequest = requestHelper.ObjectRequest(
                            scheduleServices.Dtos.Appointment.Operations.Retrieve,
                            {
                                AppointmentId: appointmentId,
                                FillProviders: true,
                                FillServices: true,
                            },
                            'Appointment'
                        );
                        ecounterModalBatchRequest.AddRequest(
                            appointmentObjectRequest,
                            'ActiveAppointment'
                        );
                    } else {
                        encounterModalData.ActiveAppointment = {
                            Params: null,
                            Value: null,
                        };
                    }

                    if (appointmentTypeId > '') {
                        var appointmentTypeObjectRequest = requestHelper.ObjectRequest(
                            scheduleServices.Dtos.AppointmentType.Operations.Retrieve,
                            { AppointmentTypeId: appointmentTypeId },
                            'Appointment Type'
                        );
                        ecounterModalBatchRequest.AddRequest(
                            appointmentTypeObjectRequest,
                            'ActiveAppointmentType'
                        );
                    } else {
                        encounterModalData.ActiveAppointmentType = {
                            Params: null,
                            Value: null,
                        };
                    }

                    return ecounterModalBatchRequest.Execute().then(function () {
                        return ecounterModalBatchRequest.Result;
                    });
                },
                GetCheckoutModalData: function (
                    existingCheckoutModalData,
                    patientId,
                    accountId,
                    pendingEncounters
                ) {
                    var checkoutModalData =
                        existingCheckoutModalData != null
                            ? angular.copy(existingCheckoutModalData)
                            : {};

                    checkoutModalData.PendingEncounters = pendingEncounters;

                    var checkoutModalBatchRequest = requestHelper.BatchRequest(
                        checkoutModalData
                    );

                    var patientObjectRequest = requestHelper.ObjectRequest(
                        patientServices.Patient.Operations.Retrieve,
                        { PatientId: patientId },
                        'Patient'
                    );

                    var accountMembersListRequest = requestHelper.ListRequest(
                        patientServices.Account.getAllAccountMembersByAccountId,
                        { accountId: accountId },
                        'Account Members'
                    );

                    var accountMemberDetailsListRequest = requestHelper.ListRequest(
                        patientServices.Account.getAccountMembersDetailByAccountId,
                        { accountId: accountId },
                        'Account Member Details'
                    );

                    var paymentTypeListRequest = requestHelper.ListRequest(
                        paymentTypesService.getAllPaymentTypesMinimal,
                        { isActive: true, paymentTypeCategory: 1 },
                        'Payment Types'
                    );

                    checkoutModalBatchRequest.AddRequest(
                        accountMembersListRequest,
                        'AccountMembersList'
                    );
                    checkoutModalBatchRequest.AddRequest(
                        accountMemberDetailsListRequest,
                        'AccountMembersDetail'
                    );
                    checkoutModalBatchRequest.AddRequest(
                        patientObjectRequest,
                        'CurrentPatient'
                    );
                    checkoutModalBatchRequest.AddRequest(
                        paymentTypeListRequest,
                        'PaymentTypes'
                    );

                    return checkoutModalBatchRequest.Execute().then(function () {
                        return checkoutModalBatchRequest.Result;
                    });
                },
                GetTransactionModalData: function (
                    existingTransactionModalData,
                    patientId,
                    isAdjustmentOnUnappliedAmount,
                    isChangingAdjustmentOrPayment
                ) {
                    var transactionModalData =
                        existingTransactionModalData != null
                            ? angular.copy(existingTransactionModalData)
                            : {};
                    var transactionModalBatchRequest = requestHelper.BatchRequest(
                        transactionModalData
                    );

                    transactionModalBatchRequest.Result.IsAdjustmentOnUnappliedAmount = isAdjustmentOnUnappliedAmount
                        ? true
                        : false;
                    transactionModalBatchRequest.Result.IsChangingAdjustmentOrPayment = isChangingAdjustmentOrPayment
                        ? true
                        : false;

                    // if applying adjustment/payment on unapplied or if changing how adjustment/payment is applied then no need to to fetch adjustment-types, payment-types
                    if (
                        !isAdjustmentOnUnappliedAmount &&
                        !isChangingAdjustmentOrPayment
                    ) {
                        var adjustmentTypeListRequest = requestHelper.ListRequest(
                            adjustmentTypesService.GetAllAdjustmentTypesWithOutCheckTransactions,
                            { active: true },
                            'Adjustment Types'
                        );
                        transactionModalBatchRequest.AddRequest(
                            adjustmentTypeListRequest,
                            'AdjustmentTypes'
                        );
                    }
                    var paymentTypeListRequest = requestHelper.ListRequest(
                        paymentTypesService.getAllPaymentTypes,
                        { isActive: true },
                        'Payment Types'
                    );
                    transactionModalBatchRequest.AddRequest(
                        paymentTypeListRequest,
                        'PaymentTypes'
                    );

                    var providerListRequest = requestHelper.ListRequest(
                        usersFactory.Users,
                        null,
                        'Providers'
                    );
                    transactionModalBatchRequest.AddRequest(
                        providerListRequest,
                        'providersList'
                    );

                    var patientObjectRequest = requestHelper.ObjectRequest(
                        patientServices.Patient.Operations.Retrieve,
                        { PatientId: patientId },
                        'Patient'
                    );
                    transactionModalBatchRequest.AddRequest(
                        patientObjectRequest,
                        'CurrentPatient'
                    );

                    var accountMembersObjectRequest = requestHelper.ListRequest(
                        patientServices.Account.getAccountMembersDetailByAccountId,
                        {
                            accountId:
                                existingTransactionModalData.PatientAccountDetails.AccountId,
                        },
                        'Account Members'
                    );
                    transactionModalBatchRequest.AddRequest(
                        accountMembersObjectRequest,
                        'AccountMembersList'
                    );

                    var accountMembersObjectRequest = requestHelper.ListRequest(
                        patientServices.Account.getAllAccountMembersByAccountId,
                        {
                            accountId:
                                existingTransactionModalData.PatientAccountDetails.AccountId,
                        },
                        'Account Members'
                    );
                    transactionModalBatchRequest.AddRequest(
                        accountMembersObjectRequest,
                        'AccountMembersDetail'
                    );

                    return transactionModalBatchRequest.Execute().then(function () {
                        return transactionModalBatchRequest.Result;
                    });
                },
            };
        },
    ])
    .factory('ShareData', function () {
        /*
         * Basic Use: This factory can be used to share data between different controllers
         *
         * Defined data that you want to share -
         * Inject factory into the controller: let's say with name 'shareData'
         * then bind whatever data you want to share with other controllers
         *
         * shareData.PatientDetails = $scope.currentPatientDetails;
         * Where,
         *          $scope.currentPatientDetails =
         *          {
         *              AccountId: 1,
         *              AccountMemberId: 11
         *          }
         *
         *
         * Access shared data -
         * Inject factory into the controller: let's say with name 'shareData'
         *
         * $scope.patientDetails = shareData.PatientDetails;
         * Where,
         *          shareData.PatientDetails =
         *          {
         *              AccountId: 1,
         *              AccountMemberId: 11
         *          }
         *
         */
        var data = {};

        return data;
    })
    .factory('ModalFactory', [
        '$uibModal',
        '$rootScope',
        '$templateCache',
        '$filter',
        'ListHelper',
        '$q',
        'SaveStates',
        'ModalDataFactory',
        'AuthZService',
        'ShareData',
        'localize',
        function (
            $uibModal,
            $rootScope,
            $templateCache,
            $filter,
            listHelper,
            $q,
            saveStates,
            modalDataFactory,
            authorizationService,
            shareData,
            localize
        ) {
            var modalFactory = {
                AppointmentDeleteModal: function (classification, allowed, message) {
                    var type, amfa;

                    if (angular.isUndefined(allowed) || allowed == null) {
                        allowed = true;
                    }

                    if (angular.isUndefined(message) || message == null) {
                        message = null;
                    }

                    if (classification == 1) {
                        type = 'block';
                        amfa = 'soar-sch-schblk-delete';
                    } else {
                        type = 'appointment';
                        amfa = 'soar-sch-sptapt-delete';
                    }

                    return $uibModal.open({
                        templateUrl:
                            'App/Schedule/appointment-delete-modal/appointment-delete-modal.html',
                        controller: 'AppointmentDeleteModalController',
                        size: 'md',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        amfa: amfa,
                        resolve: {
                            item: function () {
                                return {
                                    Allowed: allowed,
                                    Type: type,
                                    Message: message,
                                    Amfa: amfa,
                                };
                            },
                        },
                    }).result;
                },
                ScheduleInactiveProviderModal: function () {
                    return $uibModal.open({
                        templateUrl:
                            'App/Schedule/schedule-inactive-provider-modal/schedule-inactive-provider-modal.html',
                        controller: 'ScheduleInactiveProviderModalController',
                        size: 'lg',
                        windowClass: 'schedule-inactive-provider-modal',
                        backdrop: 'static',
                        keyboard: false,
                    }).result;
                },
                AppointmentRescheduleConfirmModal: function (appointment) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Schedule/appointment-reschedule-confirm-modal/appointment-reschedule-confirm-modal.html',
                        controller: 'AppointmentRescheduleConfirmModalController',
                        size: 'md',
                        windowClass: 'appointment-reschedule-confirm-modal',
                        backdrop: 'static',
                        keyboard: false,
                        amfa: 'soar-sch-sptapt-edit',
                        resolve: {
                            appointment: function () {
                                return angular.copy(appointment);
                            },
                        },
                    }).result;
                },
                AppointmentStatusModal: function (options) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/appointment-status/modal/appointment-status-modal.html',
                        controller: 'AppointmentStatusModalController',
                        size: 'md',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        amfa: 'soar-sch-sptapt-edit',
                        resolve: {
                            item: function () {
                                return options;
                            },
                        },
                    }).result;
                },
                ResponsiblePartyModal: function (options) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/appointment-status/modal/responsible-party-modal.html',
                        controller: 'ResponsiblePartyController',
                        size: 'md',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        amfa: 'soar-sch-sptapt-edit',
                        resolve: {
                            item: function () {
                                return options;
                            },
                        },
                    }).result;
                },

                CancelModal: function () {
                    return $uibModal.open({
                        templateUrl: 'App/Common/components/cancelModal/cancelModal.html',
                        controller: 'CancelModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                    }).result;
                },
                CreateClaimsModal: function (createClaimData) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/createClaimsModal/createClaimsModal.html',
                        controller: 'CreateClaimsModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            createClaimData: function () {
                                return createClaimData;
                            },
                        },
                    }).result;
                },
                CloseClaimCancelModal: function (
                    getBenefitPlansAvailableByClaimIdResult
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/closeClaimCancelModal/closeClaimCancelModal.html',
                        controller: 'CloseClaimCancelModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            availablePlansRes: function () {
                                return getBenefitPlansAvailableByClaimIdResult;
                            },
                        },
                    }).result;
                },
                ConfirmModal: function (
                    title,
                    message,
                    button1Text,
                    button2Text,
                    data
                ) {
                    return $uibModal.open({
                        templateUrl: 'App/Common/components/confirmModal/confirmModal.html',
                        controller: 'ConfirmModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    Message: message,
                                    Button1Text: button1Text,
                                    Button2Text: button2Text,
                                    Data: data,
                                };
                            },
                        },
                    }).result;
                },
                ConfirmModalWithLink: function (
                    title,
                    message,
                    button1Text,
                    button2Text,
                    data
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/confirmModalWithLink/confirmModalWithLink.html',
                        controller: 'ConfirmModalWithLinkController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    Message: message,
                                    Button1Text: button1Text,
                                    Button2Text: button2Text,
                                    Data: data,
                                };
                            },
                        },
                    }).result;
                },

                PaymentVoidConfirmModal: function (
                    title,
                    message,
                    message2,
                    button1Text,
                    button2Text
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/paymentVoidConfirmModal/paymentVoidConfirmModal.html',
                        controller: 'PaymentVoidConfirmModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: 'false',
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    Message: message,
                                    Message2: message2,
                                    Button1Text: button1Text,
                                    Button2Text: button2Text,
                                };
                            },
                        },
                    }).result;
                },

                CardReaderModal: function (cardReadersList
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/cardReaderModal/cardReaderModal.html',
                        controller: 'CardReaderController',
                        size: 'sm',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: 'false',
                        resolve: {
                            item: function () {
                                return {
                                   cardReaders:cardReadersList
                                };
                            },
                        },
                    }).result;
                },

                PayPageModal: function (payPageUrl
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/payPageModal/payPageModal.html',
                        controller: 'PayPageModalController',
                        size: 'md',
                        windowClass: 'modal-paypage',
                        backdrop: 'static',
                        keyboard: 'false',
                        resolve: {
                            item: function () {
                                return {
                                    payPageUrl:payPageUrl
                                };
                            },
                        },
                    }).result;
                },


                CardServiceDisabledModal: function (locationName, user) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/cardServiceDisabledModal/cardServiceDisabledModal.html',
                        controller: 'CardServiceDisabledController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            LocationName: function () {
                                return locationName;
                            },
                            User: function () {
                                return user;
                            },
                        },
                    }).result;
                },

                ConfirmModalWithInclude: function (
                    title,
                    upperMessage,
                    lowerMessage,
                    button1Text,
                    button2Text,
                    sourceUrl,
                    data
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/confirmModalWithInclude/confirmModalWithInclude.html',
                        controller: 'ConfirmModalWithIncludeController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    UpperMessage: upperMessage,
                                    LowerMessage: lowerMessage,
                                    Button1Text: button1Text,
                                    Button2Text: button2Text,
                                    SourceUrl: sourceUrl,
                                    Data: data,
                                };
                            },
                        },
                    }).result;
                },
                CloseClaimConfirmWithRecreate: function (
                    title,
                    upperMessage,
                    lowerMessage,
                    button1Text,
                    button2Text,
                    sourceUrl,
                    data
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/closeClaimConfirmWithRecreate/closeClaimConfirmWithRecreate.html',
                        controller: 'CloseClaimConfirmWithRecreateController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    UpperMessage: upperMessage,
                                    LowerMessage: lowerMessage,
                                    Button1Text: button1Text,
                                    Button2Text: button2Text,
                                    SourceUrl: sourceUrl,
                                    Data: data,
                                };
                            },
                        },
                    }).result;
                },
                ServiceTransactionCrudCloseClaimModal: function (inputData) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Patient/patient-account/service-transaction-crud-close-claim/service-transaction-crud-close-claim.html',
                        controller: 'ServiceTransactionCrudCloseClaimController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            inputData: function () {
                                return inputData;
                            },
                        },
                    }).result;
                },
                ConfirmLockModal: function (
                    title,
                    message,
                    message2,
                    button1Text,
                    button2Text,
                    button3Text,
                    data
                ) {
                    return $uibModal.open({
                        templateUrl: 'App/Common/components/optionsModal/optionsModal.html',
                        controller: 'OptionsModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    Message: message,
                                    Message2: message2,
                                    Button1Text: button1Text,
                                    Button2Text: button2Text,
                                    Button3Text: button3Text,
                                    Data: data,
                                };
                            },
                        },
                    }).result;
                },
                ConfirmCancelModal: function (
                    title,
                    message,
                    message2,
                    button1Text,
                    button2Text,
                    button3Text,
                    data
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/confirmCancelModal/confirm-cancel-modal.html',
                        controller: 'ConfirmCancelModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    Message: message,
                                    Message2: message2,
                                    Button1Text: button1Text,
                                    Button2Text: button2Text,
                                    Button3Text: button3Text,
                                    Data: data,
                                };
                            },
                        },
                    }).result;
                },
                EligibilityAlertModal: function (data) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Patient/patient-account/patient-insurance-info/real-time-eligibility/real-time-eligibility-alert/real-time-eligibility-alert.html',
                        controller: 'RealTimeEligibilityAlertController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            data: function () {
                                return data;
                            },
                        },
                    }).result;
                },
                StatementSubmissionMethodModal: function (
                    title,
                    button1Text,
                    button2Text,
                    data
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/statementSubmissionMethodModal/statementSubmissionMethodModal.html',
                        controller: 'StatementSubmissionMethodModalController',
                        size: 'md',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    Button1Text: button1Text,
                                    Button2Text: button2Text,
                                    Data: data,
                                };
                            },
                        },
                    }).result;
                },
                DecisionModal: function (
                    title,
                    message,
                    message2,
                    button1Text,
                    button2Text,
                    button3Text,
                    data
                ) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/decisionModal/decision-modal.html',
                        controller: 'DecisionModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    Message: message,
                                    Message2: message2,
                                    Button1Text: button1Text,
                                    Button2Text: button2Text,
                                    Button3Text: button3Text,
                                    Data: data,
                                };
                            },
                        },
                    }).result;
                },
                NoteModal: function (title, note, button1Text) {
                    return $uibModal.open({
                        templateUrl: 'App/Common/components/noteModal/note-modal.html',
                        controller: 'NoteModalController',
                        size: 'md',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: title,
                                    Note: note,
                                    Button1Text: button1Text,
                                };
                            },
                        },
                    }).result;
                },
                DeleteModal: function (type, name, allowed, message) {
                    if (angular.isUndefined(allowed) || allowed == null) {
                        allowed = true;
                    }

                    return $uibModal.open({
                        templateUrl: 'App/Common/components/deleteModal/deleteModal.html',
                        controller: 'DeleteModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Allowed: allowed,
                                    Type: type,
                                    Name: name,
                                    Message: message,
                                };
                            },
                        },
                    }).result;
                },
                PersonalModal: function (patientInfo, amfa) {
                    var createEncounterModal = modalFactory.Modal({
                        templateUrl:
                            'App/Patient/components/edit-personal-info-modal/edit-personal-info-modal.html',
                        keyboard: false,
                        windowClass: 'modal-65',
                        backdrop: 'static',
                        controller: 'EditPersonalInfoModalController',
                        amfa: amfa,
                        resolve: {
                            PatientInfo: function () {
                                return patientInfo;
                            },
                        },
                    });

                    return createEncounterModal.result;
                },
                TransactionModal: function (
                    data,
                    onTransactionSave,
                    onTransactionCancel
                ) {
                    var isDismissed = true;
                    var returnData = null;
                    // Handle OK return callback from "Apply Payment, (+) Adjustment, (-) Adjustment" modal popup
                    var openTransactionModalResultOk = function (dataFromModal) {
                        isDismissed = false;
                        returnData = dataFromModal;
                    };

                    // Handle CANCEL return callback from ""Apply Payment, (+) Adjustment, (-) Adjustment" modal popup
                    var openTransactionModalResultCancel = function (dataFromModal) {
                        isDismissed = true;
                        if (onTransactionCancel != null) {
                            onTransactionCancel(dataFromModal);
                        }
                    };

                    // Handle Modal Closed execute OK callback after the modal is closed completely
                    var openTransactionmodalClosed = function () {
                        if (!isDismissed && onTransactionSave != null) {
                            onTransactionSave(returnData);
                        }
                    };

                    var createTransactionModal = modalFactory.Modal({
                        templateUrl:
                            'App/Patient/patient-account/patient-adjustment/patient-adjustment.html',
                        keyboard: false,
                        windowClass: 'modal-dialog-large',
                        backdrop: 'static',
                        controller: 'PatientAdjustmentController',
                        amfa: 'soar-acct-aapmt-add',
                        resolve: {
                            DataForModal: function () {
                                return data;
                            },
                        },
                    });

                    //Handle callback for "OK" & "CANCEL" buttons action of dialog
                    createTransactionModal.result.then(
                        openTransactionModalResultOk,
                        openTransactionModalResultCancel
                    );
                    createTransactionModal.closed.then(openTransactionmodalClosed);
                },
                TransactionModalBeta: function (data) {
                    var createTransactionModal = modalFactory.Modal({
                        templateUrl:
                            'App/Patient/patient-account/patient-adjustment/patient-adjustment.html',
                        keyboard: false,
                        windowClass: 'modal-dialog-large',
                        backdrop: 'static',
                        controller: 'PatientAdjustmentController',
                        amfa: 'soar-acct-aapmt-add',
                        resolve: {
                            DataForModal: function () {
                                return data;
                            },
                        },
                    });

                    return createTransactionModal.result;
                },

                ToothQuadrantModal: function (
                    data,
                    onToothQuadrantSave,
                    onToothQuadrantCancel
                ) {
                    // Handle OK return callback from tooth/quadrant
                    var openToothQuadrantModalResultOk = function () {
                        if (onToothQuadrantSave != null) {
                            onToothQuadrantSave();
                        }
                    };

                    // Handle CANCEL return callback from tooth/quadrant
                    var openToothQuadrantModalResultCancel = function () {
                        if (onToothQuadrantCancel != null) {
                            onToothQuadrantCancel();
                        }
                    };

                    var toothQuadrantModal = modalFactory.Modal({
                        templateUrl:
                            'App/Patient/components/tooth-quadrant/tooth-quadrant.html',

                        keyboard: false,
                        windowClass: 'modal-dialog-large',
                        backdrop: 'static',
                        controller: 'ToothQuadrantController',
                        amfa: 'soar-acct-enctr-edit',
                        resolve: {
                            DataForModal: function () {
                                return data;
                            },
                        },
                    });

                    //Handle callback for "OK" & "CANCEL" buttons action of dialog
                    toothQuadrantModal.result.then(
                        openToothQuadrantModalResultOk,
                        openToothQuadrantModalResultCancel
                    );
                },

                LoadingModal: function LoadingModal(init) {
                    var scope = $rootScope.$new();
                    scope.init = init;
                    scope.$instantiatedBy = 'LoadingModal';

                    return $uibModal.open({
                        templateUrl: 'App/Common/components/loadingModal/loadingModal.html',
                        controller: 'LoadingModalController',
                        size: 'sm',
                        windowClass: 'modal-loading',
                        backdrop: 'static',
                        keyboard: false,
                        scope: scope,
                    }).result;
                },
                LoadingModalWithoutTemplate: function LoadingModalWithoutTemplate(
                    init
                ) {
                    var scope = $rootScope.$new();
                    scope.init = init;
                    scope.$instantiatedBy = 'LoadingModalWithoutTemplate';

                    return $uibModal.open({
                        template: '<div style="display:none;"></div>',
                        controller: 'LoadingModalController',
                        scope: scope,
                        size: 'sm',
                        windowClass: 'empty-modal-loading',
                        backdrop: 'static',
                        keyboard: false,
                    }).result;
                },
                Modal: function (modalOptions) {
                    if (!modalOptions.windowTemplateUrl) {
                        if (!modalOptions.amfa) {
                            throw new Error(
                                'The amfa option must be specified if using the default soar modal window template.'
                            );
                        }

                        if (authorizationService.checkAuthZ(modalOptions.amfa)) {
                            modalOptions.windowTemplateUrl =
                                'template/modal/windowFeedback.html';
                            $templateCache.put(
                                'template/modal/windowFeedback.html',
                                '<div modal-render="{{$isRendered}}" tabindex="-1" role="dialog" class="modal"\n' +
                                '    uib-modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}">\n' +
                                "    <div class=\"modal-dialog {{size ? 'modal-' + size : ''}}\">\n" +
                                '		<div class="modal-content" >\n' +
                                '			<div uib-modal-transclude></div>\n' +
                                '       </div>' +
                                '    </div>\n' +
                                '</div>'
                            );
                        } else {
                            return modalFactory.NotAuthorizedModal();
                        }
                    }

                    return $uibModal.open(modalOptions);
                },
                ModalOnTop: function (modalOptions) {
                    if (!modalOptions.windowTemplateUrl) {
                        if (!modalOptions.amfa) {
                            throw new Error(
                                'The amfa option must be specified if using the default soar modal window template.'
                            );
                        }

                        if (authorizationService.checkAuthZ(modalOptions.amfa)) {
                            modalOptions.windowTemplateUrl =
                                'template/modal/windowFeedback.html';
                            $templateCache.put(
                                'template/modal/windowFeedback.html',
                                '<div modal-render="{{$isRendered}}" tabindex="-1" role="dialog" class="modal"\n' +
                                '    uib-modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1000000, display: \'block\'}">\n' +
                                "    <div class=\"modal-dialog {{size ? 'modal-' + size : ''}}\">\n" +
                                '		<div class="modal-content" >\n' +
                                '			<div uib-modal-transclude></div>\n' +
                                '       </div>' +
                                '    </div>\n' +
                                '</div>'
                            );
                        } else {
                            return modalFactory.NotAuthorizedModal();
                        }
                    }

                    return $uibModal.open(modalOptions);
                },
                NotAuthorizedModal: function () {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/notAuthorizedModal/notAuthorizedModal.html',
                        controller: 'NotAuthorizedModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                    });
                },
                ReorderScheduleColumnModal: function (list, displayField) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Common/components/reorder-column-modal/reorder-column-modal.html',
                        controller: 'ReorderColumnModalController',
                        size: 'md',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        amfa: 'soar-sch-column-order',
                        resolve: {
                            modalResolve: function () {
                                return {
                                    list: list != null ? angular.copy(list) : [],
                                    display: displayField,
                                };
                            },
                        },
                    }).result;
                },
                WarningModal: function (item) {
                    return $uibModal.open({
                        templateUrl: 'App/Common/components/warningModal/warningModal.html',
                        controller: 'WarningModalController',
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return item;
                            },
                        },
                    }).result;
                },

                SendMailingModal: function (model) {
                    return $uibModal.open({
                        templateUrl:
                            'App/Patient/components/send-mailing-modal/send-mailing-modal.html',
                        controller: 'SendMailingModalController',
                        windowClass: 'modal-50',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            item: function () {
                                return {
                                    Title: model.title,
                                    ActiveFltrTab: model.activeFltrTab,
                                    activeGridDataCount: model.activeGridDataCount,
                                };
                            },
                        },
                    }).result;
                },

                AttachmentsModal: function (claim) {
                    var obj = {
                        templateUrl:
                            'App/BusinessCenter/insurance/claims/claims-management/attachments-modal/attachments-modal.html',
                        controller: 'AttachmentsModalController',
                        size: 'lg',
                        windowClass: 'attachments-modal',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            claim: function () {
                                obj.claim = null;
                                obj.resolve = null;
                                obj = null;
                                return claim;
                            },
                        },
                    };
                    return $uibModal.open(obj).result;
                },
            };

            // add ons that call other modals
            modalFactory.LocationChangeForStartAppointmentModal = function () {
                return modalFactory.ConfirmModal(
                    localize.getLocalizedString('Location Change'),
                    localize.getLocalizedString(
                        "Your active location is different than this appointment's scheduled location. When you start this appointment, your active location will be changed to the appointment's location. Do you wish to proceed?"
                    ),
                    localize.getLocalizedString('Yes'),
                    localize.getLocalizedString('No')
                );
            };

            modalFactory.LocationMismatchOnOverrideModal = function () {
                return modalFactory.ConfirmModal(
                    localize.getLocalizedString('Not Authorized'),
                    localize.getLocalizedString(
                        'The user is not authorized to access the specified location.'
                    ),
                    localize.getLocalizedString('OK')
                );
            };

            return modalFactory;
        },
    ])
    .factory('TabsetFactory', function () {
        return {
            ActivateTab: function (tabSet, tab) {
                angular.forEach(tabSet, function (value, key) {
                    value.active = false;
                });
                tabSet[tab].active = true;
            },
        };
    })
    .factory('KendoGridFactory', [
        'localize',
        function (localize) {
            /**
             * @ngdoc factory
             * @name CommonFactory.KendoGridFactory
             * @description Factory to store and supply Kendo Grid default functions
             **/
            var grid = {};

            grid.liveFilter = function (a) {
                /**
                     * @ngdoc function
                     * @name CommonFactory.KendoGridFactory:liveFilter
                     * @description Function to add Live Text Filter to Grid Cell
                        a = arguments supplied by cell template
                    **/
                a.element.addClass('k-textbox');
                a.element.attr('name', 'txtSearch');
                a.element.attr('id', 'txtSearch');
                a.element.keydown(function (e) {
                    setTimeout(function () {
                        $(e.target).trigger('change');
                    });
                });
            };

            grid.confirmWindow = function () {
                /**
                 * @ngdoc function
                 * @name CommonFactory.KendoGridFactory:confirmWindow
                 * @description Default settings for Confirm Window
                 **/
                return {
                    visible: false,
                    resizable: false,
                    scrollable: false,
                    iframe: false,
                    appendTo: 'body',
                    actions: [],
                };
            };

            grid.openMessage = function (e, rowID, g, w, msg) {
                /**
                     * @ngdoc function
                     * @name CommonFactory.KendoGridFactory:openMessage
                     * @description Function to open the confirm window for a grid
                        e = event object
                        g = kendo grid
                        w = Kendo Window
                        msg = message
                    **/
                //

                // Define window contents
                var message =
                    '<div class="gridConfirm">' +
                    '<div class="gridConfirm__msg">' +
                    _.escape(msg) +
                    '</div>' +
                    '<div class="gridConfirm__actions">' +
                    '<button id="cancel-' +
                    _.escape(rowID) +
                    '" class="btn btn-default">' +
                    localize.getLocalizedString('Close') +
                    '</button>' +
                    '</div>';

                // Reset the window content
                w.content(message);

                // Reset the window options
                w.setOptions({
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
                        top: e.pageY + 16,
                        left: e.pageX - 130,
                    },
                    width: '270px',
                    title: false,
                });

                // Open the window
                w.open();

                $('button#cancel-' + rowID).on('click', function (e) {
                    w.close();
                });
            };

            grid.openUpdateConfirm = function (e, rowID, g, w, msg) {
                // get the row data item
                //var r = this.rowDataItem(e, g);
                //var rowID = r.uid;

                // Define window contents
                var message =
                    '<div class="gridConfirm">' +
                    '<div class="gridConfirm__msg">' +
                    _.escape(msg) +
                    '</div>' +
                    '<div class="gridConfirm__actions">' +
                    '<button id="cancel-' +
                    _.escape(rowID) +
                    '" class="btn btn-default">' +
                    localize.getLocalizedString('Cancel') +
                    '</button>' +
                    '<button id="update-' +
                    _.escape(rowID) +
                    '"class="btn btn-primary">' +
                    localize.getLocalizedString('Save') +
                    '</button></div>' +
                    '</div>';

                // Reset the window content
                w.content(message);

                // Reset the window options
                w.setOptions({
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
                        top: e.pageY + 16,
                        left: e.pageX - 58,
                    },
                    width: '200px',
                    title: false,
                });

                // Open the window
                w.open();

                // Have to add jQuery click events...for now.
                $('button#update-' + rowID).on('click', function (e) {
                    g.dataSource.sync();
                    w.close();
                    //enable the search textbox after update
                    $('#txtSearch').prop('disabled', false);
                });
                $('button#cancel-' + rowID).on('click', function (e) {
                    w.close();
                    //exit in edit mode
                    g.dataSource.cancelChanges();

                    //enable the search textbox
                    $('#txtSearch').prop('disabled', false);
                });
            };

            grid.openDeleteConfirm = function (
                e,
                rowID,
                g,
                w,
                msg,
                deleteFunction,
                param
            ) {
                // get the row data item
                //var r = this.rowDataItem(e, g);
                //var rowID = r.uid;

                // Define window contents
                var message =
                    '<div class="gridConfirm">' +
                    '<div class="gridConfirm__msg">' +
                    _.escape(msg) +
                    '</div>' +
                    '<div class="gridConfirm__actions">' +
                    '<button id="cancel-' +
                    _.escape(rowID) +
                    '" class="btn btn-default">' +
                    localize.getLocalizedString('Cancel') +
                    '</button>' +
                    '<button id="delete-' +
                    _.escape(rowID) +
                    '"class="btn btn-primary">' +
                    localize.getLocalizedString('Delete') +
                    '</button></div>' +
                    '</div>';

                // Reset the window content
                w.content(message);

                // Reset the window options
                w.setOptions({
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
                        top: e.pageY + 16,
                        left: e.pageX - 103,
                    },
                    width: '200px',
                    title: false,
                });

                // Open the window
                w.open();

                // Have to add jQuery click events...for now.
                $('button#delete-' + rowID).on('click', function (e) {
                    w.close();
                    deleteFunction.apply(this, param);
                    return true;
                });
                $('button#cancel-' + rowID).on('click', function (e) {
                    w.close();
                    return false;
                });
            };

            grid.openConfirm = function (e, g, w, msg) {
                /**
                     * @ngdoc function
                     * @name CommonFactory.KendoGridFactory:openConfirm
                     * @description Function to open the confirm window for a grid
                        e = event object
                        g = kendo grid
                        w = Kendo Window
                        msg = message
                    **/
                //

                // get the row data item
                var r = this.rowDataItem(e, g);
                var rowID = r.uid;

                // Define window contents
                var message =
                    '<div class="gridConfirm">' +
                    '<div class="gridConfirm__msg" ng-Non-Bindable>' +
                    _.escape(msg) +
                    '</div>' +
                    '<div class="gridConfirm__actions">' +
                    '<button id="cancel-' +
                    _.escape(rowID) +
                    '" class="btn btn-default">' +
                    localize.getLocalizedString('Cancel') +
                    '</button>' +
                    '<button id="delete-' +
                    _.escape(rowID) +
                    '"class="btn btn-primary">' +
                    localize.getLocalizedString('Delete') +
                    '</button></div>' +
                    '</div>';

                // Reset the window content
                w.content(message);

                // Reset the window options
                w.setOptions({
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
                        top: e.pageY + 16,
                        left: e.pageX - 130,
                    },
                    width: '270px',
                    title: false,
                });

                // Open the window
                w.open();

                // I hate this, but I hope it's temporary
                // Have to add jQuery click events...for now.
                $('button#delete-' + rowID).on('click', function (e) {
                    g.dataSource.remove(r);
                    g.dataSource.sync();
                    w.close();
                });
                $('button#cancel-' + rowID).on('click', function (e) {
                    w.close();
                });

                $(document).on('click', function (event) {
                    // closing the delete record confirm if user clicks outside of it so they cant perform edit and delete actions at the same time.
                    if (
                        !event.target.closest('.gridConfirm') &&
                        !event.target.matches('span.fas.fa-trash-alt')
                    ) {
                        w.close();
                        $(document).off('click');
                    }
                });
            };

            grid.rowDataItem = function (e, g) {
                // Generic function to target the data item of a grid
                // e = event object
                // g = grid

                var row = g.dataItem($(e.target).closest('tr'));

                return row;
            };

            grid.removeRow = function (e, g) {
                // e = event
                // g = grid
                var row = this.rowDataItem(e);
                g.dataSource.remove(row);
                g.dataSource.sync();
            };

            grid.editRow = function (e, g) {
                // e = event
                // g = grid
                var row = $(e.target).closest('tr');
                g.editRow(row);
            };

            grid.setIsEditable = function (e, g, f) {
                // e = event
                // g = grid
                // f = name of field validator

                // To get at Factory inside foreach
                var fac = this;

                // The items to test
                var items = e.sender.items();

                // Test the items and set Edit/Delete classes accordingly
                angular.forEach(items, function (v, k) {
                    // Get the row data item
                    var row = g.dataItem(v);
                    // Test whether or not the row may be edited
                    fac.testIsEditable(
                        f,
                        row,
                        function (e) {
                            //nuthin
                        },
                        function (e) {
                            $(v).attr('editable', false);
                            $(v).find('.k-grid-customDelete').addClass('disabled');
                            $(v).find('.k-grid-customEdit').addClass('disabled');
                        }
                    );
                });
            };

            grid.testIsEditable = function (n, r, cT, cF) {
                /*
                 *  Because we don't have a standard monicker from the domain of when
                 *  something is editable, we are storing the rules in this here function
                 *  n = the name of the property
                 *  r = the row to test
                 *  cT = callback function when the row IS editable
                 *  cF = callback function when the row IS NOT editable
                 */

                if (n === 'IsDefault') {
                    if (r.IsDefault) {
                        // If IsDefault is true, then the row IS NOT editable.
                        // Run the Callback-False function
                        if (typeof cF == 'function') {
                            cF();
                        }
                    } else {
                        // If IsDefault is false, then the row IS editable.
                        // Run the Callback-True function
                        if (typeof cT == 'function') {
                            cT();
                        }
                    }
                }
                /*
                     * This isn't working for some reason.
                    switch (n) {
                        case n === 'IsDefault':
                            // If the entry is a default entry, run false command
                            if (r.IsDefault) {
                                console.log('disable');
                                if (typeof cF == 'function') { cF(); }
                            } else {
                                console.log('enable');
                                if (typeof cT == 'function') { cT(); }
                            }
                        default:
                            return true;
                    }*/
            };

            return grid;
        },
    ])
    .factory('DocumentsKendoFactory', [
        'RecentDocumentsService',
        'toastrFactory',
        function (recentDocumentsService, toastrFactory) {
            var documents = {};
            var docList = null;

            var factory = this;

            (documents.columns = [
                {
                    template: "<div class='filename'><a>#: filename #</a></div>",
                    field: 'filename',
                    title: 'Name',
                },
                { field: 'dateUploaded', title: 'Date Uploaded' },
                { field: 'type', title: 'Type' },
            ]),
                (documents.dataSource = new kendo.data.DataSource({
                    schema: {
                        model: {
                            id: 'DocumentId',
                            fields: {
                                filename: {
                                    type: 'String',
                                },
                            },
                        },
                    },
                    transport: {
                        read: function (options) {
                            //console.log(options);
                            if (this.docList != null) {
                                var data = [];

                                angular.forEach(docList, function (file) {
                                    var fileType = file.Name.split('.')[1];
                                    data.push({
                                        filename: file.Name,
                                        dateUploaded: file.DateUploaded,
                                        type: fileType,
                                    });
                                });

                                // Read Success
                                options.success(data);
                            } else {
                                recentDocumentsService.get(
                                    function (r) {
                                        var data = [];
                                        //console.log(r);

                                        angular.forEach(r.Value, function (file) {
                                            var fileType = file.Name.split('.')[1];
                                            data.push({
                                                filename: file.Name,
                                                dateUploaded: file.DateUploaded,
                                                type: fileType,
                                            });
                                        });

                                        // Read Success
                                        options.success(data);
                                    },
                                    function (r) {
                                        //console.log(r);
                                        // Read Error
                                        options.error(r);
                                        toastrFactory.error(
                                            'Failed to retrieve the list of documents. Refresh the page to try again.',
                                            'Error'
                                        );
                                    }
                                );
                            }
                        },
                    },
                }));

            return documents;
        },
    ])
    .factory('PatCacheFactory', [
        'CacheFactory',
        function (cacheFactory) {
            var factory = this;
            // reference (https://github.com/jmdobry/angular-cache) for a complete list of configuration choices
            // get an instance of a particular cache
            function getCache(cache, deleteOnExpire, recycleFrequency, expireAfter) {
                if (!cacheFactory.get(cache)) {
                    cacheFactory.createCache(cache, {
                        deleteOnExpire: deleteOnExpire, //*see below for some configuration choices
                        recycleFreq: recycleFrequency, //Determines how often a cache will scan for expired items when in aggressive mode. Default: 1000 (milliseconds).
                        maxAge: expireAfter, //expires in a minute
                        //storageMode: 'localStorage' // just while debugging
                    });
                }
                return cacheFactory.get(cache);
            }

            // clear a specific cache created by the cacheFactory
            function removeAll(cache) {
                return cache.removeAll();
            }
            // clear all caches created with cacheFactory
            function clearAll() {
                return cacheFactory.clearAll();
            }
            function getKeys() {
                return cacheFactory.keys();
            }
            return {
                GetCache: getCache,
                ClearAll: clearAll,
                ClearCache: removeAll,
                Keys: getKeys,
            };
        },
    ])
    .factory('PatCachingInterceptor', [
        'PatCacheFactory',
        function (cacheFactory) {
            return {
                request: function ($config) {
                    // clear cache when item in cache is edited or new item added or an item is deleted
                    if (
                        $config &&
                        $config.cache &&
                        ($config.method === 'POST' ||
                            $config.method === 'PUT' ||
                            $config.method === 'DELETE')
                    ) {
                        cacheFactory.ClearCache($config.cache);
                    }
                    return $config;
                },
            };
        },
    ])
    .factory('TimeZoneFactory', [
        'TimeZones',
        'ListHelper',
        'moment',
        function (timeZones, listHelper, moment) {
            // This function accepts a standard Date object and tz database name.
            //  The Date() object is converted to the tz database name timezone
            //  and then flipped to UTC.
            var getLocationLocalizedUtcDateTimeFromSystemDateObject = function (
                systemDateObject,
                tzDatabaseName,
                forceEndOfDay
            ) {
                var locationLocalizedMomentDate; // used to store the moment object
                var dateString = systemDateObject.toISOString().substr(0, 10); // 11 will keep the T, 10 drops it

                if (forceEndOfDay) {
                    dateString = dateString + '23:59:59';
                } else {
                    dateString = dateString + '00:00:00';
                }

                locationLocalizedMomentDate = moment
                    .tz(dateString, 'YYYY-MM-DD hh:mm:ss', tzDatabaseName)
                    .format();
                var locationLocalizedMomentUtc = moment(locationLocalizedMomentDate)
                    .utc()
                    .format('YYYY-MM-DDTHH:mm:ss');

                return locationLocalizedMomentUtc;
            };

            var getLocationLocalizedUtcDateTimeFromSystemDateObjectNew = function (
                systemDateObject,
                tzDatabaseName
            ) {
                var locationLocalizedMomentDate; // used to store the moment object
                // Bug 433313 - using ISO date changes the calendar date for +12 timezone
                // please remove the commented out line after a suitable time has proven the moment format stable - D1 1/18/2020
                // var dateString = systemDateObject.toISOString().substr(0, 10); // 11 will keep the T, 10 drops it
                let dateString = moment(systemDateObject).format('YYYY-MM-DD');

                locationLocalizedMomentDate = moment
                    .tz(dateString, 'YYYY-MM-DD hh:mm:ss', tzDatabaseName)
                    .format();
                var locationLocalizedMomentUtc = moment(locationLocalizedMomentDate)
                    .utc()
                    .format('YYYY-MM-DDTHH:mm:ss');

                return locationLocalizedMomentUtc;
            };

            var getTimeZoneIfo = function (timezone, dateItem) {
                var res = angular.copy(_.find(timeZones, { Value: timezone }));
                var momentObj = angular.isUndefined(dateItem)
                    ? new moment()
                    : new moment(dateItem);
                var momentTZObj = getMomentTZObj(
                    momentObj.format('YYYY-MM-DD 23:59:59'),
                    res.MomentTZ
                );
                res.Abbr = momentTZObj.isDST() ? res.DSTAbbr : res.Abbr;
                return res;
            };

            var getTimeZoneAbbr = function (timezone, dateItem) {
                var res = getTimeZoneIfo(timezone, dateItem);
                res = res ? res.Abbr : '';
                return res;
            };

            var getFullTZ = function (timezone) {
                return getTimeZoneIfo(timezone);
            };

            var getMomentTZ = function (timezone) {
                var tz = null;
                if (timezone !== undefined && timezone.MomentTZ !== undefined) {
                    tz = timezone.MomentTZ;
                } else if (
                    typeof timezone == 'string' &&
                    (timezone.indexOf('America/') > -1 ||
                        timezone.indexOf('Pacific/') > -1)
                ) {
                    tz = timezone;
                } else {
                    var tzInfo = getTimeZoneIfo(timezone);
                    tz = tzInfo.MomentTZ;
                }
                return tz;
            };

            var getMomentTZObj = function (dateItem, timezone) {
                if (_.isNil(dateItem)) {
                    return dateItem;
                }

                if (
                    typeof dateItem == 'string' &&
                    !dateItem.toLowerCase().endsWith('z')
                ) {
                    dateItem += 'Z';
                }
                return moment.tz(dateItem, timezone);
            };

            var convertToBasicMomentTZ = function (dateItem, timezone) {
                if (!dateItem) {
                    return dateItem;
                }

                if (
                    typeof dateItem == 'string' &&
                    !dateItem.toLowerCase().endsWith('z')
                ) {
                    dateItem += 'Z';
                }

                var resultMoment = moment(
                    moment(dateItem).tz(timezone).format('YYYY-MM-DD HH:mm:ss')
                );
                return resultMoment;
            };

            var convertToMomentTZ = function (dateItem, timezone) {
                if (_.isNil(dateItem)) {
                    return dateItem;
                }
                var tz = getMomentTZ(timezone);
                if (
                    typeof dateItem == 'string' &&
                    !dateItem.toLowerCase().endsWith('z')
                ) {
                    dateItem += 'Z';
                }
                var dateMoment = moment(dateItem);
                var resultMoment = moment(
                    dateMoment.clone().tz(tz).format('YYYY-MM-DD HH:mm:ss')
                );
                return resultMoment;
            };

            var convertDateToSave = function (dateItem, timezone) {
                var tz = getMomentTZ(timezone);
                if (
                    typeof dateItem == 'string' &&
                    !dateItem.toLowerCase().endsWith('z')
                ) {
                    dateItem += 'Z';
                }
                var dateMoment = moment(dateItem);
                var returnDate = moment.tz(dateMoment.format('YYYY-MM-DD HH:mm'), tz);
                return returnDate.toDate();
            };

            var convertAppointmentDatesTZ = function (appointment, timezone) {
                if (
                    !_.isNil(appointment) &&
                    (!_.isNil(timezone) || !_.isNil(appointment.Location))
                ) {
                    var tz = timezone ? timezone : appointment.Location.Timezone;
                    if (
                        angular.isUndefined(appointment.originalStart) &&
                        appointment.StartTime
                    ) {
                        appointment.originalStart = angular.copy(appointment.StartTime);
                        appointment.originalEnd = angular.copy(appointment.EndTime);
                        appointment.StartTime = convertToMomentTZ(
                            appointment.StartTime,
                            tz
                        ).toDate();
                        appointment.EndTime = convertToMomentTZ(
                            appointment.EndTime,
                            tz
                        ).toDate();
                        appointment.start = angular.copy(appointment.StartTime);
                        appointment.end = angular.copy(appointment.EndTime);
                        appointment.tzAbbr = getTimeZoneAbbr(tz, appointment.StartTime);
                        _.forEach(appointment.ProviderAppointments, function (provAppt) {
                            provAppt.originalStartTime = angular.copy(provAppt.StartTime);
                            provAppt.originalEndTime = angular.copy(provAppt.EndTime);
                            provAppt.StartTime = convertToMomentTZ(provAppt.StartTime, tz)
                                .toDate()
                                .toISOString();
                            provAppt.EndTime = convertToMomentTZ(provAppt.EndTime, tz)
                                .toDate()
                                .toISOString();
                        });
                    }
                }
            };

            var convertAppointmentDatesToSave = function (appointment, timezone) {
                var tz = timezone ? timezone : appointment.Location.Timezone;
                if (
                    appointment.StartTime &&
                    (angular.isDefined(appointment.originalStart) ||
                        !appointment.AppointmentId)
                ) {
                    appointment.StartTime = convertDateToSave(appointment.StartTime, tz);
                    appointment.EndTime = convertDateToSave(appointment.EndTime, tz);
                    appointment.start = angular.copy(appointment.StartTime);
                    appointment.end = angular.copy(appointment.EndTime);
                    if (appointment.originalStart) {
                        delete appointment.originalStart;
                        delete appointment.originalEnd;
                    }
                    _.forEach(appointment.ProviderAppointments, function (provAppt) {
                        provAppt.StartTime = convertDateToSave(
                            provAppt.StartTime,
                            tz
                        ).toISOString();
                        provAppt.EndTime = convertDateToSave(
                            provAppt.EndTime,
                            tz
                        ).toISOString();
                        if (provAppt.originalStart) {
                            delete provAppt.originalStartTime;
                            delete provAppt.originalEndTime;
                        }
                    });
                }
            };

            var resetAppointmentDates = function (appointment) {
                // Not sure why we are constantly doing this. It suggests we should just keep the dates in this format to begin with.
                if (angular.isDefined(appointment.originalStart)) {
                    appointment.StartTime = angular.copy(appointment.originalStart);
                    appointment.EndTime = angular.copy(appointment.originalEnd);
                    delete appointment.originalStart;
                    delete appointment.originalEnd;
                    _.forEach(appointment.ProviderAppointments, function (provAppt) {
                        provAppt.StartTime = angular.copy(provAppt.originalStartTime);
                        provAppt.EndTime = angular.copy(provAppt.originalEndTime);
                        delete provAppt.originalStartTime;
                        delete provAppt.originalEndTime;
                    });
                }
            };

            return {
                GetFullTZ: getFullTZ,
                GetLocationLocalizedUtcDateTimeFromSystemDateObject: getLocationLocalizedUtcDateTimeFromSystemDateObject,
                GetLocationLocalizedUtcDateTimeFromSystemDateObjectNew: getLocationLocalizedUtcDateTimeFromSystemDateObjectNew,
                GetTimeZoneInfo: getTimeZoneIfo,
                GetTimeZoneAbbr: getTimeZoneAbbr,
                ConvertDateToBasicMomentTZ: convertToBasicMomentTZ,
                ConvertDateToMomentTZ: convertToMomentTZ,
                ConvertDateTZ: function (dateItem, timezone) {
                    if (!_.isNil(dateItem)) {
                        var momentObj = convertToMomentTZ(dateItem, timezone);
                        return momentObj.toDate();
                    }

                    return dateItem;
                },
                ConvertDateToBasicTZ: function (dateItem, timezone) {
                    if (!_.isNil(dateItem)) {
                        var momentObj = convertToBasicMomentTZ(dateItem, timezone);
                        return momentObj.toDate();
                    }

                    return dateItem;
                },
                ConvertDateTZString: function (dateItem, timezone) {
                    if (!_.isNil(dateItem)) {
                        var momentObj = convertToMomentTZ(dateItem, timezone);
                        return momentObj.toDate().toISOString();
                    }

                    return dateItem;
                },
                ConvertDateToSave: convertDateToSave,
                ConvertDateToSaveString: function (dateItem, timezone) {
                    if (!_.isNil(dateItem)) {
                        var dateRes = convertDateToSave(dateItem, timezone);
                        return dateRes.toISOString();
                    }

                    return dateItem;
                },
                ConvertAppointmentDatesTZ: convertAppointmentDatesTZ,
                ConvertAppointmentDatesToSave: convertAppointmentDatesToSave,
                ResetAppointmentDates: resetAppointmentDates,
            };
        },
    ])
    .config([
        '$httpProvider',
        function ($httpProvider) {
            $httpProvider.interceptors.push('PatCachingInterceptor');
        },
    ])
    .constant('RxUserType', {
        ProxyUser: 'ProxyUser',
        PrescribingUser: 'PrescribingUser',
        RxAdminUser: 'PracticeAdmin',
    })
    .constant('SaveStates', {
        None: 'None',
        Update: 'Update',
        Add: 'Add',
        Delete: 'Delete',
        Successful: 'Successful',
        Failed: 'Failed',
    })
    .constant('FuseFlag', {
        DashboardGrossProductionWidgetMvp: { key: "release-dashboard-gross-production-widget-mvp", defaultValue: false },
        DashboardPendingClaimsWidgetMvp: { key: "release-dashboard-pending-claims-widget-mvp", defaultValue: false },
        DashboardNetProductionWidgetMvp: { key: "release-dashboard-net-production-widget-mvp", defaultValue: false },
        DashboardClinicalNotesWidgetMvp: { key: "release-open-clinical-notes-dashboard-widget-mvp", defaultValue: false },
        DashboardInsuranceClaimsWidgetMvp: { key: "release-insurance-claims-dashboard-widget-mvp", defaultValue: false },
        EnableClaimStatusHistory: { key: "enable-claim-status-history", defaultValue: false },
        DashboardReceivablesWidgetMvp: { key: "release-receivables-dashboard-widget-mvp", defaultValue: false },
        DashboardAppointmentWidgetMvp: { key: "release-appointment-dashboard-widget-mvp", defaultValue: false },
        DashboardScheduleUtilizationWidgetMvp: { key: "release-schedule-utilization-dashboard-widget-mvp", defaultValue: false },
        ReportReceivablesByProvider: { key: "release-receivables-by-provider-report", defaultValue: false },
        EClaimSubmissionDisabledMessage: { key: "configure-eclaim-submission-disabled-message", defaultValue: "" },
        UsePaymentService: { key: "release-payment-management-service", defaultValue: false },
        ReportPatientsByBenefitPlan: { key: "release-patients-by-benefit-plan-report", defaultValue: false },
        AllowClaimAttachments: { key: "allow-claim-attachments", defaultValue: true },
        ConfigureClaimAttachmentsDisabledMessage: { key: "configure-claim-attachments-disabled-message", defaultValue: "" },
        ReportServiceCodeByServiceTypeProductivity: { key: "release-service-code-by-service-type-productivity-report", defaultValue: false },
        AllowVendorEligibilityCheckForAttachmentDialog: { key: "allow-vendor-eligibility-check-for-attachment-dialog", defaultValue: true },
        ShowPatientReferrals: { key: "release-referral-managemnt-create-referral", defaultValue: false },
        ShowPatientReferralsOnClinical: { key: "release-referral-management-clinical-referral", defaultValue: false },
        ReferredPatientsReport: { key: "release-referred-patients-report", defaultValue: false },
        ReferredPatientsReportFilter: { key: "release-referral-patients", defaultValue: false },
        DisableStatusIconOnAppointmentCard: { key: "release-disable-status-icon-onappointment-card", defaultValue: false },
        ShowPrmLinkInSettings: { key: "release-prm-settings-link", defaultValue: false },
        ShowScheduleV2: { key: "release-schedule-new-ui-enabled", defaultValue: false },
        ReportDaySheet: { key: "release-day-sheet-report", defaultValue: false },
        ReportDaySheetPdf: { key: "release-day-sheet-pdf-report", defaultValue: false },
        EnableNewStatementsExperience: { key: "release-new-statements-experience", defaultValue: false },
        ShowInsuranceUIErrors: {key:"show-insurance-ui-errors",defaultValue:false},                        
        ReleseOldReferral: { key: "release-hide-patient-profile-referral", defaultValue: false },
        EnableChartColorsCache: { key: "release-chart-colors-cache", defaultValue: true },
        AddNarlugaLinkInQuickLinksSection: { key: "release-add-narluga-link-in-quick-links-section", defaultValue: true },
        LiveUpdatesVisibilityCheck: { key: "release-live-updates-visibility-check", defaultValue: false },
        viewAddEditCarriersNewUi: { key: "release-view-add-edit-carriers-new-ui", defaultValue: false },
        EnableOrthodonticContracts: { key: "release-orthodontic-contracts", defaultValue: false },                
        ReportProductionByProvider: { key:"release-production-by-provider-report", defaultValue:false },        
        ShowNotifications: {key:"release-notifications",defaultValue:false},
        IncreaseTimeout: { key:"release-increase-timeout",defaultValue:false},
        AllowRealTimeEligibilityVerification: { key: "allow-real-time-eligibility-verification", defaultValue: true },
        ConfigureRealTimeEligibilityDisabledMessage: { key: "configure-real-time-eligibility-disabled-message", defaultValue: "" },
        PositiveAdjustmentsWidget: { key: "release-positive-adjustments-widget", defaultValue: false },
        GrossProductionWidget: { key: "release-gross-production-widget", defaultValue: false },
        NegativeAdjustmentsWidget: { key: "release-negative-adjustments-widget", defaultValue: false },
        CollectionToNetProductionWidget: { key: "release-collection-to-net-production-widget", defaultValue: false },
        ApteryxDevEnvironment: { key: "config-xv-web-developer-environment", defaultValue: "false" },
        CreateApptColorProvColorToggle: { key: "release-create-appt-color-prov-color-toggle", defaultValue: false },
        UsePracticeApiForConditions: { key: "release-practices-api-migration-conditions", defaultValue: false },
        ReleseEnableReferralNewPatientSection: { key: "release-enable-referral-new-patient-section", defaultValue: false },
        EnablePayerIdCorrection: { key: "release-full-practice-payer-id-validation", defaultValue: false },
        UsePracticeApiForPreventiveServicesOverview: { key: "release-practices-api-migration-preventive-services-overview", defaultValue: false },
        EnableClinicalMedHxV2Navigation: { key: "release-clinical-v-2-medical-history", defaultValue: false },
        ShowProviderGoals: { key: "release-show-provider-goals", defaultValue: false },
        EnableUpdateAllowedAmountOnPaymentScreen: { key: "release-update-allowed-amounts-on-payment-screens", defaultValue: false },
        EnableNotificationsForGrossPerformanceByProviderReport: { key: "release-enable-gross-performance-report-notification", defaultValue: true },
        EnableNotificationsForActivityLogsReport: { key: "release-enable-activity-logs-report-notification", defaultValue: true } ,
        EnableNotificationsForServiceHistoryReport: { key: "release-enable-service-history-report-notification", defaultValue: false },
        EnableMFASettings: { key:"release-enable-mfa-settings", defaultValue: false },
        EnableNotificationsForCollectionByProviderReport: { key: "release-enable-collection-by-provider-report-notification", defaultValue: false },
        MedicareAdministrativeModifier: { key: "release-medicare-administrative-modifier", defaultValue: false },
        EnableNotificationsForUnAssignedUnAppliedCreditsReport: { key: "release-unassigned-unapplied-credits-report-notification", defaultValue: false },
        EnableTimeZoneForPaymentReconciliationReport: { key: "release-timezone-for-payment-reconciliation-report", defaultValue: false },
        ReleaseReportInconsistencies: { key: "release-report-inconsistencies", defaultValue: false },
        EnableEliminateStaleClaims: { key: "release-eliminate-stale-claims", defaultValue: false },
        ShowProviderGoalReport: { key: "release-provider-goal-report", defaultValue: false },
        ReleaseReferralExport: { key: "release-referral-export", defaultValue: false }
    })
    .constant('KeyCodes', {
        esc: 27,
        space: 32,
        enter: 13,
        tab: 9,
        backspace: 8,
        shift: 16,
        ctrl: 17,
        alt: 18,
        capslock: 20,
        numlock: 144,
    })
    .constant('CustomEvents', {
        AppointmentsUpdated: 'appointments-updated',
    })
    .constant(
        'modelFormats',
        (function () {
            var smallKeyBoard = function (event) {
                var which = event.which;
                return (which >= 96 && which <= 105) || which == 46;
            };
            var numberKeyBoard = function (event) {
                var which = event.which;
                return which >= 48 && which <= 57 && !event.shiftKey;
            };
            var functionKeyBoard = function (event) {
                var which = event.which;
                return (
                    which <= 40 ||
                    (navigator.platform.indexOf('Mac') > -1 && event.metaKey) ||
                    (navigator.platform.indexOf('Win') > -1 && event.ctrlKey)
                );
            };
            var currencyKeyBoard = function (event, viewValue) {
                var which = event.which;
                return (
                    viewValue.toString().indexOf('$') === -1 &&
                    which === 52 &&
                    event.shiftKey
                );
            };
            var floatKeyBoard = function (event, viewValue) {
                var which = event.which;
                return (
                    [188].indexOf(which) != -1 ||
                    ((which === 190 || which === 110) &&
                        viewValue.toString().indexOf('.') === -1)
                );
            };
            return {
                currency: {
                    formatter: function (args) {
                        var modelValue = args.$modelValue ? args.$modelValue : '',
                            filter = args.$filter,
                            attrs = args.$attrs,
                            $eval = args.$eval;
                        if (args.$modelValue === 0) {
                            modelValue = '0';
                        }
                        var val = modelValue;
                        if (modelValue != '') {
                            val = filter('currency')(modelValue);
                        }
                        return val;
                        //return attrs.prefixed && $eval(attrs.prefixed) ? val : val.substr(1);
                    },
                    parser: function (args) {
                        var viewValue = args.$viewValue ? args.$viewValue : '';
                        var num = viewValue.replace(/[^0-9.]/g, '');
                        var result = parseFloat(num, 10);
                        return isNaN(result) ? '' : parseFloat(result.toFixed(2));
                    },
                    isEmpty: function (value) {
                        return !value.$modelValue;
                    },
                    keyDown: function (args) {
                        var event = args.$event,
                            viewValue = args.$viewValue ? args.$viewValue : '';
                        if (
                            !(
                                smallKeyBoard(event) ||
                                numberKeyBoard(event) ||
                                functionKeyBoard(event) ||
                                currencyKeyBoard(event, viewValue) ||
                                floatKeyBoard(event, viewValue)
                            )
                        ) {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    },
                },
                currencyNoSymbol: {
                    formatter: function (args) {
                        var modelValue = args.$modelValue ? args.$modelValue : '',
                            filter = args.$filter,
                            attrs = args.$attrs,
                            $eval = args.$eval;
                        var val = modelValue;
                        if (modelValue != '') {
                            val = filter('currency')(modelValue);
                            val = val.replace(/[^0-9.,]/g, '');
                        }
                        return val;
                        //return attrs.prefixed && $eval(attrs.prefixed) ? val : val.substr(1);
                    },
                    parser: function (args) {
                        var viewValue = args.$viewValue ? args.$viewValue : '';
                        var num = viewValue.replace(/[^0-9.]/g, '');
                        var result = parseFloat(num, 10);
                        return isNaN(result) ? '' : parseFloat(result.toFixed(2));
                    },
                    isEmpty: function (value) {
                        return !value.$modelValue;
                    },
                    keyDown: function (args) {
                        var event = args.$event,
                            viewValue = args.$viewValue ? args.$viewValue : '';
                        if (
                            !(
                                smallKeyBoard(event) ||
                                numberKeyBoard(event) ||
                                functionKeyBoard(event) ||
                                currencyKeyBoard(event, viewValue) ||
                                floatKeyBoard(event, viewValue)
                            )
                        ) {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    },
                },
                digit: {
                    formatter: function (args) {
                        return args.$modelValue;
                    },
                    parser: function (args) {
                        return args.$viewValue
                            ? args.$viewValue.replace(/[^0-9]/g, '')
                            : undefined;
                    },
                    isEmpty: function (value) {
                        return !value.$modelValue;
                    },
                    keyDown: function (args) {
                        var event = args.$event;
                        if (
                            !(
                                smallKeyBoard(event) ||
                                numberKeyBoard(event) ||
                                functionKeyBoard(event)
                            )
                        ) {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    },
                },
                int: {
                    formatter: function (args) {
                        var modelValue = args.$modelValue,
                            filter = args.$filter;
                        return filter('number')(modelValue);
                    },
                    parser: function (args) {
                        var val = parseInt(args.$viewValue.replace(/[^0-9]/g, ''), 10);
                        return isNaN(val) ? undefined : val;
                    },
                    isEmpty: function (value) {
                        return !value.$modelValue;
                    },
                    keyDown: function (args) {
                        var event = args.$event;

                        if (
                            !(
                                smallKeyBoard(event) ||
                                numberKeyBoard(event) ||
                                functionKeyBoard(event)
                            )
                        ) {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    },
                },
                float: {
                    formatter: function (args) {
                        var modelValue = args.$modelValue,
                            filter = args.$filter;
                        return filter('number')(modelValue);
                    },
                    parser: function (args) {
                        var val = parseFloat(args.$viewValue.replace(/[^0-9.]/g, '')),
                            ENOB = 3,
                            tempNum = Math.pow(10, ENOB);
                        return isNaN(val) ? undefined : Math.round(val * tempNum) / tempNum;
                    },
                    isEmpty: function (value) {
                        return !value.$modelValue;
                    },
                    keyDown: function (args) {
                        var event = args.$event,
                            viewValue = args.$viewValue;
                        if (
                            !(
                                smallKeyBoard(event) ||
                                numberKeyBoard(event) ||
                                functionKeyBoard(event) ||
                                floatKeyBoard(event, viewValue)
                            )
                        ) {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    },
                },
                boolean: {
                    formatter: function (args) {
                        var modelValue = args.$modelValue ? args.$modelValue : '';
                        if (!angular.isUndefined(modelValue)) {
                            return modelValue.toString();
                        }
                    },
                    parser: function (args) {
                        var viewValue = args.$viewValue;
                        if (!angular.isUndefined(viewValue)) {
                            return viewValue.trim() === 'true';
                        }
                    },
                    isEmpty: function (value) {
                        return angular.isUndefined(value);
                    },
                },
                percentage: {
                    formatter: function (args) {
                        var modelValue = args.$modelValue ? args.$modelValue : '',
                            filter = args.$filter,
                            attrs = args.$attrs,
                            $eval = args.$eval;
                        var val = modelValue;
                        if (modelValue != '') {
                            val = modelValue + '%';
                        }
                        return val;
                        //return attrs.prefixed && $eval(attrs.prefixed) ? val : val.substr(1);
                    },
                    parser: function (args) {
                        var viewValue = args.$viewValue ? args.$viewValue : '';
                        var num = viewValue.replace(/[^0-9.]/g, '');
                        var result = parseFloat(num, 10);
                        return isNaN(result) ? '' : parseFloat(result.toFixed(2));
                    },
                    isEmpty: function (value) {
                        return !value.$modelValue;
                    },
                    keyDown: function (args) {
                        var event = args.$event,
                            viewValue = args.$viewValue ? args.$viewValue : '';
                        if (
                            !(
                                smallKeyBoard(event) ||
                                numberKeyBoard(event) ||
                                functionKeyBoard(event) ||
                                floatKeyBoard(event, viewValue)
                            )
                        ) {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    },
                },
            };
        })()
    )
    .constant('AccountsOverdueValues', [
        { Id: 0, Value: 0 },
        { Id: 30, Value: 30 },
        { Id: 60, Value: 60 },
        { Id: 90, Value: 90 },
    ])
    .constant('TimeZones', [
        {
            Value: 'Alaskan Standard Time',
            Display: 'Alaskan Time Zone',
            Offset: -9,
            Abbr: 'AKST',
            DSTAbbr: 'AKDT',
            MomentTZ: 'America/Anchorage',
        },
        {
            Value: 'Central Standard Time',
            Display: 'Central Time Zone',
            Offset: -6,
            Abbr: 'CST',
            DSTAbbr: 'CDT',
            MomentTZ: 'America/Chicago',
        },
        {
            Value: 'Eastern Standard Time',
            Display: 'Eastern Time Zone',
            Offset: -5,
            Abbr: 'EST',
            DSTAbbr: 'EDT',
            MomentTZ: 'America/New_York',
        },
        {
            Value: 'Aleutian Standard Time',
            Display: 'Hawaii–Aleutian Time Zone',
            Offset: -10,
            Abbr: 'HAST',
            DSTAbbr: 'HAST',
            MomentTZ: 'Pacific/Honolulu',
        },
        {
            Value: 'Hawaiian Standard Time',
            Display: 'Hawaii Standard Time (Honolulu)',
            Offset: -10,
            Abbr: 'HST',
            DSTAbbr: 'HST',
            MomentTZ: 'Pacific/Honolulu',
        },
        {
            Value: 'Mountain Standard Time',
            Display: 'Mountain Time Zone (Denver)',
            Offset: -7,
            Abbr: 'MST',
            DSTAbbr: 'MDT',
            MomentTZ: 'America/Denver',
        },
        {
            Value: 'US Mountain Standard Time',
            Display: 'Mountain Time Zone (Phoenix)',
            Offset: -7,
            Abbr: 'MST',
            DSTAbbr: 'MST',
            MomentTZ: 'America/Phoenix',
        },
        {
            Value: 'Pacific Standard Time',
            Display: 'Pacific Time Zone',
            Offset: -8,
            Abbr: 'PST',
            DSTAbbr: 'PDT',
            MomentTZ: 'America/Los_Angeles',
        },
    ])
    .constant('ActivityTypes', [
        { Id: 1, Name: 'Account Payment' },
        { Id: 2, Name: 'Service' },
        { Id: 3, Name: 'Account Note' },
        { Id: 4, Name: 'Insurance Payment' },
        { Id: 5, Name: 'Negative Adjustment' },
        { Id: 6, Name: 'Positive Adjustment' },
        { Id: 7, Name: 'Finance Charge' },
        { Id: 8, Name: 'Account Split' },
        { Id: 9, Name: 'Team Member' },
        { Id: 10, Name: 'Location' },
        { Id: 11, Name: 'Practice Information' },
        { Id: 12, Name: 'Location Fee Lists' },
        { Id: 13, Name: 'Service Types' },
        { Id: 14, Name: 'Treatment Consent Letter' },
        { Id: 15, Name: 'Service and Swift Codes' },
        { Id: 16, Name: 'Medical History Alerts' },
        { Id: 17, Name: 'Bank Accounts' },
        { Id: 18, Name: 'Default Messages' },
        { Id: 19, Name: 'Appointment' },
        { Id: 20, Name: 'Unscheduled Appointment' },
        { Id: 21, Name: 'Block' },
        { Id: 22, Name: 'Clinical Note' },
        { Id: 23, Name: 'Treatment Plan' },
        { Id: 24, Name: 'Perio Exam' },
        { Id: 25, Name: 'Medical Health History' },
        { Id: 26, Name: 'Report' },
        { Id: 27, Name: 'Benefit Plan' },
        { Id: 28, Name: 'Carrier' },
        { Id: 29, Name: 'Fee Schedule' },
        { Id: 30, Name: 'Patient Profile' },
        { Id: 31, Name: 'Insurance Information' },
        { Id: 32, Name: 'Flags' },
        { Id: 33, Name: 'Adjustment Types' },
        { Id: 34, Name: 'Group Types' },
        { Id: 35, Name: 'Referral Sources' },
        { Id: 36, Name: 'Additional Identifier' },
        { Id: 37, Name: 'Discount Types' },
        { Id: 38, Name: 'Payment Types' },
        { Id: 39, Name: 'Conditions' },
        { Id: 40, Name: 'Clinical Note Template' },
        { Id: 41, Name: 'Preventive Care' },
        { Id: 42, Name: 'Change Deposit' },
        { Id: 43, Name: 'Appointment Type' },
        { Id: 44, Name: 'Holidays' },
        { Id: 45, Name: 'Login' },
        { Id: 46, Name: 'Deposit' },
        { Id: 47, Name: 'Document' },
        { Id: 48, Name: 'Communication' },
        { Id: 49, Name: 'Referral Types' },
        { Id: 50, Name: 'Referral Affiliates' },
        { Id: 51, Name: 'Referral Out' },
        { Id: 52, Name: 'Referral In' },
        { Id: 53, Name: 'Notification Center' },
        { Id: 54, Name: 'Asynchronous Reporting' },
        { Id: 55, Name: 'Provider Goal' },
    ])
    .constant('ActivityActions', [
        { Id: 1, Name: 'Addition' },
        { Id: 2, Name: 'Modification' },
        { Id: 3, Name: 'Deletion' },
        { Id: 4, Name: 'Redistribution' },
        { Id: 5, Name: 'Exported' },
        { Id: 6, Name: 'Printed' },
        { Id: 7, Name: 'Removal' },
        { Id: 8, Name: 'Viewed' },
        { Id: 9, Name: 'Logged In' },
        { Id: 10, Name: 'Created' },
        { Id: 11, Name: 'Mark Read' },
        { Id: 12, Name: 'Mark Unread' },
        { Id: 13, Name: 'Progress' },
        { Id: 14, Name: 'Completion' },
        { Id: 15, Name: 'Errors' },
    ])
    .constant('ActivityAreas', [
        { Id: 1, Name: 'Account' },
        { Id: 2, Name: 'Business' },
        { Id: 3, Name: 'Clinical' },
        { Id: 4, Name: 'Forms and Documents' },
        { Id: 5, Name: 'Insurance' },
        { Id: 6, Name: 'Patient Management' },
        { Id: 7, Name: 'Person' },
        { Id: 8, Name: 'Receivables' },
        { Id: 9, Name: 'Reports' },
        { Id: 10, Name: 'Schedule' },
        { Id: 11, Name: 'Team Members' },
        { Id: 12, Name: 'Practice and Locations' },
        { Id: 13, Name: 'Services and Fees' },
        { Id: 14, Name: 'Billing' },
        { Id: 15, Name: 'Patient' },
        { Id: 16, Name: 'Practice and Settings' },
        { Id: 17, Name: 'Patient Profile' },
        { Id: 18, Name: 'Chart' },
        { Id: 19, Name: 'Deposits' },
    ])
    .constant('MasterListStatus', [
        { Value: true, Text: 'Active' },
        { Value: false, Text: 'InActive' },
    ])
    .constant('PatientClaimInfoOptions', {
        Unsubmitted: 1,
        All: 2,
        UnsubmittedPreds: 3,
    })
    .constant('ReportCategories', [
        { ReportCategory: 'All Reports', ReportCategoryValue: 0 },
        { ReportCategory: 'Activity Log Reports', ReportCategoryValue: 9 },
        { ReportCategory: 'Clinical Reports', ReportCategoryValue: 7 },
        { ReportCategory: 'Financial Reports', ReportCategoryValue: 6 },
        { ReportCategory: 'Insurance Reports', ReportCategoryValue: 1 },
        { ReportCategory: 'Patient Reports', ReportCategoryValue: 2 },
        { ReportCategory: 'Provider Reports', ReportCategoryValue: 3 },
        { ReportCategory: 'Referral Reports', ReportCategoryValue: 8 },
        { ReportCategory: 'Schedule Reports', ReportCategoryValue: 4 },
        { ReportCategory: 'Service Reports', ReportCategoryValue: 5 },
    ])
    .constant('ReportIds', {
        PerformanceByProviderSummaryReportId: 1,
        PatientsByDiscountReportId: 3,
        PatientsByBenfitPlansReportId: 6,
        PatientsByFeeScheduleReportId: 7,
        PatientsWithPendingEncountersReportId: 8,
        CarriersReportId: 9,
        FeeScheduleMasterReportId: 11,
        ServiceCodeFeesByLocationReportId: 12,
        PatientsByAdditionalIdentifiersReportId: 13,
        PatientsSeenReportId: 14,
        ReferredPatientsReportId: 15,
        NewPatientsByComprehensiveExamReportId: 16,
        ServiceCodeByServiceTypeProductivityReportId: 17,
        PerformanceByProviderDetailsReportId: 18,
        DaySheetReportId: 19,
        ServiceCodeProductivityByProviderReportId: 20,
        NetProductionByProviderReportId: 21,
        AdjustmentsByProviderReportId: 22,
        NetCollectionByProviderReportId: 23,
        ActivityLogReportId: 24,
        ServiceCodeFeesByFeeScheduleReportId: 25,
        FeeExceptionsReportId: 26,
        ServiceHistoryReportId: 27,
        UnassignedUnappliedCreditsReportId: 28,
        ProviderServiceHistoryReportId: 29,
        ProductionExceptionsReportId: 30,
        ServiceTypeProductivityReportId: 31,
        DeletedTransactionsReportId: 32,
        CarrierProductivityAnalysisReportId: 33,
        TreatmentPlanPerformanceReportId: 34,
        CarrierProductivityAnalysisDetailedReportId: 35,
        PendingClaimsReportId: 36,
        FeeScheduleAnalysisByCarrier: 37,
        TreatmentPlanProviderReconciliationReportId: 38,
        ReferralSourcesProductivityDetailedReportId: 39,
        PatientsWithRemainingBenefitsReportId: 40,
        AppointmentsReportId: 41,
        CollectionsAtCheckoutReportId: 42,
        ReferralSourcesProductivitySummaryReportId: 43,
        ServiceTransactionsWithDiscountsReportId: 44,
        PeriodReconciliationReportId: 45,
        AppointmentTimeElapsedReportId: 46,
        CollectionsByServiceDateReportId: 47,
        EncountersByFeeScheduleReportId: 48,
        NewPatientsSeenReportId: 49,
        PaymentReconciliationReportId: 50,
        PatientsByPatientGroupsReportId: 51,
        PatientsByFlagsReportId: 52,
        DailyProductionCollectionSummaryReportId: 53,
        ReceivablesByProviderReportId: 54,
        PatientsByMedicalHistoryAlertsReportId: 55,
        ProjectedNetProductionReportId: 56,
        PatientsByLastServiceDateReportId: 57,
        PatientAnalysisReportId: 58,
        PatientAnalysisBetaReportId: 66,
        MedicalHistoryFormAnswersReportId: 59,
        AdjustmentsByTypeReportId: 60,
        ProposedTreatmentReportId: 61,
        ReceivablesByAccountId: 62,
        AccountsWithOffsettingProviderBalancesReportId: 63,
        CreditDistributionHistoryReportId: 64,
        PotentialDuplicatePatientsReportId: 65,
        TreatmentPlanPerformanceBetaReportId: 134,
        ProposedTreatmentBetaReportId: 124,
        NetCollectionByProviderReportIdBeta: 69,
        BenefitPlansbyAdjustmentTypeReportId: 70,
        NetProductionByProviderReportBetaId: 102,
        BenefitPlansbyInsurancePaymentType: 72,
        ProjectedNetProductionBetaReportId: 102,
        EncountersByCarrierReportId: 103,
        PaymentLocationReconciliationReportId: 104,
        ReferralSourcesProductivityDetailedBetaReportId: 113,
        PaymentReconciliationBetaReportId: 114,
        ReceivablesByAccountBetaId: 115,
        PaymentLocationReconciliationBetaReportId: 116,
        ReferredPatientsBetaReportId: 120,
        EncountersByCarrierBetaReportId: 121,
        AppointmentsBetaReportId: 122,
        CreditDistributionHistoryBetaReportId: 123,
        EncountersByPaymentReportId: 125,
        PatientsClinicalNotesReportId: 126,
        ServiceCodeByServiceTypeProductivityBetaReportId: 127,
        AccountWithOffsettingProviderBalancesBetaReportId: 128,
        ServiceCodeProductivityByProviderBetaReportId: 129,
        PatientsByBenefitPlanBetaReportId: 201,
        PatientsByFlagsBetaReportId: 202,
        PatientsByPatientGroupsBetaReportId: 203,
        BenefitPlansByInsurancePaymentTypeBetaReportId: 204,
        BenefitPlansByFeeScheduleBetaReportId: 206,
        NewPatientsSeenBetaReportId: 207,
        BenefitPlansByCarrierBetaReportId: 208,
        FeeScheduleAnalysisByCarrierBetaReportId: 209,
        ServiceCodeFeesByFeeScheduleBetaReportId: 210,
        ProductionExceptionsBetaReportId: 211,
        CollectionsByServiceDateBetaReportId: 212,
        MedicalHistoryFormAnswersBetaReportId: 213,
        FeeSchedulesByCarrierBetaActionId: 214,
        ServiceHistoryBetaReportId: 215,
        ServiceTransactionsWithDiscountsBetaReportId: 216,
        ReferralSourcesProductivitySummaryBetaReportId: 217,
        FeeExceptionsBetaReportId: 218,
        CarrierProductivityAnalysisDetailedBetaReportId: 220,
        CarrierProductivityAnalysisBetaReportId: 219,
        TreatmentPlanProviderReconciliationBetaReportId: 221,
        PatientsByPatientGroupsNewReportId:222,
        PatientsByCarrierBetaReportId: 223,
        ReceivablesByProviderBetaReportId: 224,
        CarriersBetaReportId: 225,
        PeriodReconciliationBetaReportId: 226,
        PatientByFlagsBetaReportId: 228,
        ActivityLogBetaReportId: 227,
        NewPatientSeenReportId: 229,
        PatientSeenReportId: 230,
        PatientsByLastServiceDateBetaReportId: 231,
        ReferralSourceProductivityReportId: 232,
        PatientsByDiscountBetaReportId: 235,
        PatientsByMedicalHistoryAlertsBetaReportId: 234,
        PatientsByFeeScheduleBetaReportId: 236,
        ReferralAffiliatesReportId: 233,
        BenefitPlansbyAdjustmentTypeBetaReportId: 237,
        AppointmentTimeElapsedBetaReportId: 238,
        ProviderServiceHistoryBetaReportId: 239,
        CollectionAtCheckoutBetaReportId: 240,
        PendingClaimsBetaReportId: 241,
        ServiceCodeFeesByLocationBetaReportId: 242,
        BenefitPlansByFeeSchedulesBetaReportId: 243,
        DeletedTransactionsBetaReportId: 244,
        PatientsWithPendingEncountersBetaReportId: 245,      
        FeeSchedulesMasterReportId: 248,        
        ServiceTypesProductivityReportId: 250,   
        PatientsByBenefitPlansReportId: 246,
        ActivityLogAsyncReportId:252       
    })
    .constant('ReportIdsForDateOptions', [
        { ReportCategory: 'Collection by Provider', ReportId: 23 },
        { ReportCategory: 'Production by Provider', ReportId: 21 },
        { ReportCategory: 'Net Production by Provider alternate', ReportId: 71 },
        { ReportCategory: 'Adjustments by Provider', ReportId: 22 },
        { ReportCategory: 'Day Sheet', ReportId: 19 },
        { ReportCategory: 'Performance by Provider-Detailed', ReportId: 18 },
        { ReportCategory: 'Performance by Provider-Summary', ReportId: 1 },
        { ReportCategory: 'Adjustments by Type', ReportId: 60 },
        { ReportCategory: 'Collections at Checkout', ReportId: 42 },
        { ReportCategory: 'Collections by Service Date', ReportId: 47 },
        { ReportCategory: 'Daily Production/Collection Summary', ReportId: 53 },
        { ReportCategory: 'Fee Exceptions', ReportId: 26 },
        { ReportCategory: 'Payment Reconciliation', ReportId: 50 },
        { ReportCategory: 'Fee Schedule Analysis by Carrier', ReportId: 37 },
        { ReportCategory: 'Production Exceptions', ReportId: 30 },
        { ReportCategory: 'New Patients by Comprehensive Exam', ReportId: 16 },
        { ReportCategory: 'Patients Seen', ReportId: 14 },
        { ReportCategory: 'Referral Sources Productivity-Detailed', ReportId: 39 },
        { ReportCategory: 'Referral Sources Productivity-Summary', ReportId: 43 },
        { ReportCategory: 'Credit Distribution History', ReportId: 64 },
        { ReportCategory: 'Service Transactions with Discounts', ReportId: 44 },
        { ReportCategory: 'Unassigned/Unapplied Credits', ReportId: 28 },
        { ReportCategory: 'Provider Service History', ReportId: 29 },
        { ReportCategory: 'Service Code Productivity by Provider', ReportId: 20 },
        { ReportCategory: 'Service History', ReportId: 27 },
        { ReportCategory: 'Deleted Transactions', ReportId: 32 },
        { ReportCategory: 'Period Reconciliation', ReportId: 45 },
        { ReportCategory: 'Carrier Productivity Analysis-Detailed', ReportId: 35 },
        { ReportCategory: 'Carrier Productivity Analysis', ReportId: 33 },
        { ReportCategory: 'Patients with Pending Encounters', ReportId: 8 },
        { ReportCategory: 'Proposed Treatment', ReportId: 61 },
        { ReportCategory: 'Treatment Plan Performance', ReportId: 34 },
        { ReportCategory: 'Net Patients Seen', ReportId: 49 }, //
        { ReportCategory: 'Scheduled Appointments', ReportId: 41 }, //
        { ReportCategory: 'Treatment Plan Provider Reconciliation', ReportId: 38 },
        { ReportCategory: 'Referred Patients', ReportId: 15 },
        { ReportCategory: 'Appointment Time Elapsed', ReportId: 46 },
        { ReportCategory: 'Activity Log', ReportId: 24 },
        { ReportCategory: 'Encounters By Fee Schedule', ReportId: 48 },
        { ReportCategory: 'Projected Production', ReportId: 56 },
        { ReportCategory: 'Encounters By Carrier', ReportId: 103 },
        { ReportCategory: 'Service Code Productivity by Provider', ReportId: 134 },
        { ReportCategory: 'Payment Location Reconciliation', ReportId: 104 },
        {
            ReportCategory: 'Referral Sources Productivity-Detailed Beta',
            ReportId: 113,
        },
        { ReportCategory: 'Payment Reconciliation Beta', ReportId: 114 },
        { ReportCategory: 'Payment Location Reconciliation Beta', ReportId: 116 },
        { ReportCategory: 'Projected Net Production Beta', ReportId: 102 },
        { ReportCategory: 'Referred Patients Beta', ReportId: 120 },
        { ReportCategory: 'Encounters By Carrier Beta', ReportId: 121 },
        { ReportCategory: 'Scheduled Appointments Beta', ReportId: 122 },
        { ReportCategory: 'Credit Distribution History Beta', ReportId: 123 },
        { ReportCategory: 'Proposed Treatment Beta', ReportId: 124 },
        { ReportCategory: 'Encounters By Payment', ReportId: 125 },
        { ReportCategory: 'Patients Clinical Notes', ReportId: 126 },
        { ReportCategory: 'Service Code by Service Type Productivity', ReportId: 127 },
        { ReportCategory: 'Patients by Additional Identifiers', ReportId: 13 },
        {
            ReportCategory: 'Accounts With Offsetting Provider Balances Beta',
            ReportId: 128,
        },
        {
            ReportCategory: 'Service Code Productivity by Provider Beta',
            ReportId: 129,
        },
        { ReportCategory: 'Patients by Benefit Plan Beta', ReportId: 201 },
        { ReportCategory: 'Patients by Flags Beta', ReportId: 202 },
        { ReportCategory: 'Patients by Patient Groups Beta', ReportId: 203 },
        { ReportCategory: 'Benefit Plans by Insurance Payment Type', ReportId: 204 },
        { ReportCategory: 'Benefit Plans by Fee Schedule Beta', ReportId: 206 },
        { ReportCategory: 'Benefit Plans by Carrier', ReportId: 208 },
        { ReportCategory: 'New Patients Seen Beta', ReportId: 207 },
        { ReportCategory: 'Fee Schedule Analysis by Carrier', ReportId: 209 },
        { ReportCategory: 'Service Code Fees by Fee Schedule', ReportId: 210 },
        { ReportCategory: 'Production Exceptions', ReportId: 211 },
        { ReportCategory: 'Collections by Service Date', ReportId: 212 },
        { ReportCategory: 'Medical History Form Answers', ReportId: 213 }, 
        { ReportCategory: 'Fee Schedules by Carrier', ReportId: 214 },
        { ReportCategory: 'Service History', ReportId: 215 },
        { ReportCategory: 'Service Transactions with Discounts', ReportId: 216 },
        { ReportCategory: 'Referral Sources Productivity - Summary', ReportId: 217 },
        { ReportCategory: 'Fee Exceptions', ReportId: 218 },
        { ReportCategory: 'Carrier Productivity Analysis', ReportId: 219 },
        { ReportCategory: 'Carrier Productivity Analysis - Detailed', ReportId: 220 },
        { ReportCategory: 'Treatment Plan Provider Reconciliation', ReportId: 221 },
        { ReportCategory: 'Patients by Patient Groups', ReportId: 222 },
        { ReportCategory: 'Patients by Carrier', ReportId: 223 },
        { ReportCategory: 'Receivables by Provider', ReportId: 224 },
        { ReportCategory: 'Period Reconciliation', ReportId: 226 },
        { ReportCategory: 'Carriers', ReportId: 225 },
        { ReportCategory: 'Patients by Flags', ReportId: 228 },
        { ReportCategory: 'Activity Log', ReportId: 227 },
        { ReportCategory: 'New Patients Seen', ReportId: 229 },
        { ReportCategory: 'Patient Seen', ReportId: 230 },
        { ReportCategory: 'Patients by Last Service Date', ReportId: 231 },
        { ReportCategory: 'Patients by Medicaly History Alerts', ReportId: 234 },
        { ReportCategory: 'Referral Productivity - Detailed and Summary', ReportId: 232 },
        { ReportCategory: 'Patients by Discount', ReportId: 235 },
        { ReportCategory: 'Patients by Fee Schedule', ReportId: 236 },
        { ReportCategory: 'Referral Affiliates', ReportId: 233 },
        { ReportCategory: 'Benefit Plans by Adjustment Type', ReportId: 237 },
        { ReportCategory: 'Appointment Time Elapsed', ReportId: 238 },
        { ReportCategory: 'Provider Service History', ReportId: 239 },
        { ReportCategory: 'Collections at Checkout', ReportId: 240 },
        { ReportCategory: 'Pending Claims', ReportId: 241 },
        { ReportCategory: 'Service Code Fees by Location', ReportId: 242 },
        { ReportCategory: 'Benefit Plans by Fee Schedule', ReportId: 243 },
        { ReportCategory: 'Deleted Transactions', ReportId: 244 },
        { ReportCategory: 'Patients with Pending Encounter', ReportId: 245 },
        { ReportCategory: 'Fee Schedule Master', ReportId: 248 },
        { ReportCategory: 'Service Type Productivity', ReportId: 250 },
        { ReportCategory: 'Patient by Benefit Plan', ReportId: 246 },
        {ReportCategory:'Activity Logs', ReportId: 252},
    ])
    .constant('moment', moment)
    .constant('RoleNames', {
        PracticeAdmin: 'Practice Admin/Exec. Dentist',
        RxUser: 'Rx User',
    })
    .constant('PlaceOfTreatmentEnums', {
        Office: 11,
        Other: -1
    });
