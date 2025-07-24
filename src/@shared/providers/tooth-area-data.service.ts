import { Injectable, Inject, OnInit } from '@angular/core';
import { from, BehaviorSubject } from 'rxjs';
import { EventEmitter } from 'events';
import { ToothAreaData } from '../providers/tooth-area-data.model';
import cloneDeep from 'lodash/cloneDeep';


@Injectable()
export class ToothAreaDataService {
    teethDefinitions: any;
    //teeth: any;
    rootAbbreviations: any;
    surfaceAbbreviations
    cdtCodeGroups: any[] = [];
    serviceCodes: any[] = [];
    oneRootTeeth: any[] = [
        '6', '7', '8', '9', '10', '11', '22', '23', '24', '25', '26', '27', '56', '57', '58', '59', '60', '72', '73', '74', '75',
        '76', '77', 'C', 'CS', 'D', 'DS', 'E', 'ES', 'F', 'FS', 'G', 'GS', 'H', 'HS', 'M', 'MS', 'N', 'NS', 'O', 'OS', 'P', 'PS',
        'Q', 'QS', 'R', 'RS', '6, 56', '7, 57', '8, 58', '9, 59', '10, 60', '11, 61', '22, 72', '23, 73', '24, 74', '25, 75',
        '26, 76', '27, 77', 'C, CS', 'D, DS', 'E, ES', 'F, FS', 'G, GS', 'H, HS', 'M, MS', 'N, NS', 'O, OS', 'P, PS', 'Q, QS', 'R, RS'
    ];
    twoRootTeeth: any[] = [
        '4', '5', '12', '13', '20', '21', '28', '29', '54', '55', '62', '63', '70', '71', '78', '79',
        '4, 54', '5, 55', '12, 62', '13, 63', '20, 70', '21, 71', '28, 78', '29, 79'
    ];
    threeRootTeeth: any[] = [
        '1', '2', '3', '14', '15', '16', '17', '18', '19', '30', '31', '32', '51', '52', '53', '64', '65',
        '66', '67', '68', '69', '80', '81', '82', 'A', 'B', 'I', 'J', 'K', 'L', 'S', 'T', 'AS', 'BS', 'IS', 'JS', 'KS',
        'LS', 'SS', 'TS', '1, 51', '2, 52', '3, 53', '14, 64', '15, 65', '16, 66', '17, 67', '18, 68', '19, 69', '30, 80',
        '31, 81', '32, 82', 'A, AS', 'B, BS', 'I, IS', 'J, JS', 'K, KS', 'L, LS', 'S, SS', 'T, TS'
    ];
    quadrants: any[] = [
        {
            USNumber: 'UL',
            range: '9-16',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UR',
            range: '1-8',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LL',
            range: '17-24',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LR',
            range: '25-32',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UA',
            range: '1-16',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LA',
            range: '17-32',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'FM',
            range: '1-32',
            type: 'permanent', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UL',
            range: 'F-J',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UR',
            range: 'A-E',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LL',
            range: 'K-O',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LR',
            range: 'P-T',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'UA',
            range: 'A-J',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'LA',
            range: 'T-K',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        },
        {
            USNumber: 'FM',
            range: 'A-T',
            type: 'primary', selected: false, visible: true, positionAlreadyTaken: false, highlight: false
        }
    ];


    constructor(
        @Inject('referenceDataService') private referenceDataService,
        @Inject('StaticData') private staticData,
        @Inject('MultiLocationProposedServiceFactory') private multiLocationProposedServiceFactory,
    ) { }

    loadPrerequisiteData() {
        const promises = [];
        promises.push(Promise.resolve(this.staticData.TeethDefinitions()));
        promises.push(Promise.resolve(this.staticData.CdtCodeGroups()));
        promises.push(Promise.resolve(this.referenceDataService.getData(this.referenceDataService.entityNames.serviceCodes)));

        Promise.all(promises).then(async ([teethDefinitions, cdtCodeGroups, serviceCodesList]) => {
            if (teethDefinitions !== undefined) {
                this.teethDefinitions = teethDefinitions.Value;
                this.surfaceAbbreviations = this.teethDefinitions.SummarySurfaces.map(x => x.SummarySurfaceAbbreviation);
                this.rootAbbreviations = this.teethDefinitions.Roots.map(x => x.RootAbbreviation);
            }
            if (cdtCodeGroups !== undefined) {
                this.cdtCodeGroups = cdtCodeGroups.Value;
            }

            if (serviceCodesList !== undefined) {
                this.serviceCodes = serviceCodesList;
            }
        });
        return promises;
    }

    setupDataForRangeOfTeeth() {
        var list = [];
        if (this.teethDefinitions && this.teethDefinitions) {
            var result = cloneDeep(this.teethDefinitions.Teeth);
            for (let i = 0; i < result.length; i++) {
                if (result[i].ToothId !== null && result[i]['ToothId'] < 53) {
                    var tooth = result[i];
                    tooth = this.setMapTooth(tooth);

                    tooth.visible = true;
                    tooth.selected = false;
                    tooth.positionAlreadyTaken = false;

                    list.push(tooth);
                }
            }

            return list;
        }
    }

    public setMapTooth(tooth): any {
        if (tooth.ToothId === 4) {
            tooth.toothIdOfOtherDentitionInSamePosition = 33;
        } else if (tooth.ToothId === 5) {
            tooth.toothIdOfOtherDentitionInSamePosition = 34;
        } else if (tooth.ToothId === 6) {
            tooth.toothIdOfOtherDentitionInSamePosition = 35;
        } else if (tooth.ToothId === 7) {
            tooth.toothIdOfOtherDentitionInSamePosition = 36;
        } else if (tooth.ToothId === 8) {
            tooth.toothIdOfOtherDentitionInSamePosition = 37;
        } else if (tooth.ToothId === 9) {
            tooth.toothIdOfOtherDentitionInSamePosition = 38;
        } else if (tooth.ToothId === 10) {
            tooth.toothIdOfOtherDentitionInSamePosition = 39;
        } else if (tooth.ToothId === 11) {
            tooth.toothIdOfOtherDentitionInSamePosition = 40;
        } else if (tooth.ToothId === 12) {
            tooth.toothIdOfOtherDentitionInSamePosition = 41;
        } else if (tooth.ToothId === 13) {
            tooth.toothIdOfOtherDentitionInSamePosition = 42;
        } else if (tooth.ToothId === 20) {
            tooth.toothIdOfOtherDentitionInSamePosition = 43;
        } else if (tooth.ToothId === 21) {
            tooth.toothIdOfOtherDentitionInSamePosition = 44;
        } else if (tooth.ToothId === 22) {
            tooth.toothIdOfOtherDentitionInSamePosition = 45;
        } else if (tooth.ToothId === 23) {
            tooth.toothIdOfOtherDentitionInSamePosition = 46;
        } else if (tooth.ToothId === 24) {
            tooth.toothIdOfOtherDentitionInSamePosition = 47;
        } else if (tooth.ToothId === 25) {
            tooth.toothIdOfOtherDentitionInSamePosition = 48;
        } else if (tooth.ToothId === 26) {
            tooth.toothIdOfOtherDentitionInSamePosition = 49;
        } else if (tooth.ToothId === 27) {
            tooth.toothIdOfOtherDentitionInSamePosition = 50;
        } else if (tooth.ToothId === 28) {
            tooth.toothIdOfOtherDentitionInSamePosition = 51;
        } else if (tooth.ToothId === 29) {
            tooth.toothIdOfOtherDentitionInSamePosition = 52;
        } else if (tooth.ToothId === 33) {// prim > perm
            tooth.toothIdOfOtherDentitionInSamePosition = 4;
        } else if (tooth.ToothId === 34) {
            tooth.toothIdOfOtherDentitionInSamePosition = 5;
        } else if (tooth.ToothId === 35) {
            tooth.toothIdOfOtherDentitionInSamePosition = 6;
        } else if (tooth.ToothId === 36) {
            tooth.toothIdOfOtherDentitionInSamePosition = 7;
        } else if (tooth.ToothId === 37) {
            tooth.toothIdOfOtherDentitionInSamePosition = 8;
        } else if (tooth.ToothId === 38) {
            tooth.toothIdOfOtherDentitionInSamePosition = 9;
        } else if (tooth.ToothId === 39) {
            tooth.toothIdOfOtherDentitionInSamePosition = 10;
        } else if (tooth.ToothId === 40) {
            tooth.toothIdOfOtherDentitionInSamePosition = 11;
        } else if (tooth.ToothId === 41) {
            tooth.toothIdOfOtherDentitionInSamePosition = 12;
        } else if (tooth.ToothId === 42) {
            tooth.toothIdOfOtherDentitionInSamePosition = 13;
        } else if (tooth.ToothId === 43) {
            tooth.toothIdOfOtherDentitionInSamePosition = 20;
        } else if (tooth.ToothId === 44) {
            tooth.toothIdOfOtherDentitionInSamePosition = 21;
        } else if (tooth.ToothId === 45) {
            tooth.toothIdOfOtherDentitionInSamePosition = 22;
        } else if (tooth.ToothId === 46) {
            tooth.toothIdOfOtherDentitionInSamePosition = 23;
        } else if (tooth.ToothId === 47) {
            tooth.toothIdOfOtherDentitionInSamePosition = 24;
        } else if (tooth.ToothId === 48) {
            tooth.toothIdOfOtherDentitionInSamePosition = 25;
        } else if (tooth.ToothId === 49) {
            tooth.toothIdOfOtherDentitionInSamePosition = 26;
        } else if (tooth.ToothId === 50) {
            tooth.toothIdOfOtherDentitionInSamePosition = 27;
        } else if (tooth.ToothId === 51) {
            tooth.toothIdOfOtherDentitionInSamePosition = 28;
        } else if (tooth.ToothId === 52) {
            tooth.toothIdOfOtherDentitionInSamePosition = 29;
        }

        return tooth;
    }

    loadToothAreaDataValuesForService(service) {
        let toothAreaData = new ToothAreaData;
        toothAreaData.toothSelection = service.Tooth;

        if (this.serviceCodes) {
            toothAreaData.serviceCode = this.serviceCodes.find(sc => sc.ServiceCodeId == service.ServiceCodeId);
            toothAreaData.originalServiceCode = toothAreaData.serviceCode;
        }

        if (service.Tooth) {
            toothAreaData.toothSelection = service.Tooth;
        }

        if (toothAreaData.serviceCode.AffectedAreaId === 1) {
            //This is a Mouth code skip the rest of this method and return empty toothAreaData lists
            service.Tooth = '';
            service.Roots = '';
            service.Surface = '';
            toothAreaData.areaSelection = [];
            toothAreaData.toothSelection = '';
            toothAreaData.availableTeeth = [];
            toothAreaData.availableAreas = [];
            service.$toothAreaData = toothAreaData;

            return service;
        }
        else if (toothAreaData.serviceCode.AffectedAreaId === 5 && toothAreaData.serviceCode.UseCodeForRangeOfTeeth) {
            //This is a range of teeth code, negate any Roots/Surface selection and send back a blank toothAreaData
            service.Roots = '';
            service.Surface = '';
            toothAreaData.areaSelection = [];
            toothAreaData.toothSelection = toothAreaData.toothSelection;
            toothAreaData.availableTeeth = this.teethDefinitions.Teeth;
            toothAreaData.availableAreas = [];
            service.$toothAreaData = toothAreaData;

            return service;
        }
        else if (toothAreaData.serviceCode.AffectedAreaId === 3) {
            toothAreaData.areaSelection = service.Roots ? service.Roots.split(',') : []
        }
        else if (toothAreaData.serviceCode.AffectedAreaId === 4) {
            toothAreaData.areaSelection = service.Surface ? service.Surface.split(',') : [];
        }
        else {
            toothAreaData.areaSelection = [];
        }

        toothAreaData = this.getTeethForCurrentServiceCode(toothAreaData);

        //Check if this was a range of teeth service
        if (toothAreaData.toothSelection && toothAreaData.toothSelection.indexOf(',') == -1
            && toothAreaData.toothSelection.indexOf('-') == -1) {

            this.settleToothAndAvailableAreas(toothAreaData);
        }
        else {
            //This service was a range of teeth service and isn't now
            toothAreaData.toothSelection = '0';
            if (toothAreaData.serviceCode.AffectedAreaId === 3) {
                toothAreaData.availableAreas = this.rootAbbreviations;
            }
            else if (toothAreaData.serviceCode.AffectedAreaId === 4) {
                toothAreaData.availableAreas = this.surfaceAbbreviations;
            }
            else {
                toothAreaData.availableAreas = [];
            }
        }

        //Set the values on the service being passed in.
        //This makes the service properties match in the event that affected area changed
        //After a service was already saved and now the selections are invalid.
        service = this.setValuesOnServiceTransaction(service, toothAreaData);
        service.$toothAreaData = toothAreaData;
        //Return the service with the toothAreaData property added
        return service;
    }

    getTeethForCurrentServiceCode(toothAreaData) {
        //This is necessary because a CdtCode may have been added to the service code after the service was saved
        //If that happens, the saved toothSelection might not be valid anymore

        //A service code might not have a CdtCode.
        if (toothAreaData.serviceCode.CdtCodeName && toothAreaData.serviceCode.CdtCodeName != '') {
            let selectedCode = this.cdtCodeGroups.find((cdtGroup) => { return cdtGroup.CdtCode == toothAreaData.serviceCode.CdtCodeName });
            if (selectedCode) {
                //The CdtCode might specify only certain teeth as available, assign only those teeth as available
                if (selectedCode && selectedCode.AllowedTeeth.indexOf('All') == -1) {
                    //The CDT Code only allows certain teeth to be selected
                    var applicableTeeth = [];

                    selectedCode.AllowedTeeth.forEach((tooth) => {

                        var toothObj = this.teethDefinitions.Teeth.find((td) => { return td.USNumber == tooth.toString() });
                        if (toothObj)
                            applicableTeeth.push(toothObj);
                    });

                    toothAreaData.availableTeeth = applicableTeeth;
                }
                else {
                    //The CDT Code allowed all teeth
                    toothAreaData.availableTeeth = this.teethDefinitions.Teeth;
                }
            }
            else {
                //If the CdtCode doesn't specify available teeth, assign all possible teeth
                toothAreaData.availableTeeth = this.teethDefinitions.Teeth;
            }
        }
        else {
            //The service had no CdtCode, assign all possible teeth
            toothAreaData.availableTeeth = this.teethDefinitions.Teeth;
        }

        let toothSelectionInTeethList = this.findToothFromAvailableTeeth(toothAreaData);
        toothAreaData.toothSelection = toothSelectionInTeethList ? toothSelectionInTeethList.USNumber : '0';

        return toothAreaData;
    }

    getApplicableTeeth(toothAreaData, smartCodeGroupId) {
        //This will give us back all of the cdt codes for a particular group

        let groupCodes = this.cdtCodeGroups.filter((cdtGroup) => { return cdtGroup.GroupId == smartCodeGroupId; });

        if (groupCodes && groupCodes[0].AllowedTeeth.indexOf('All') == -1) {
            var applicableTeeth = [];

            groupCodes.forEach((code) => {
                code.AllowedTeeth.forEach((tooth) => {
                    if (applicableTeeth.length == 0 || applicableTeeth.find((teeth) => { return teeth.USNumber == tooth.toString() }) === undefined) {
                        var toothObj = this.teethDefinitions.Teeth.find((td) => { return td.USNumber == tooth.toString() });
                        if (toothObj)
                            applicableTeeth.push(toothObj);
                    }
                });
            });

            toothAreaData.availableTeeth = applicableTeeth;
        }
        else {
            //If we've selected all teeth, we don't need to loop through CdtCodeGroups anymore
            toothAreaData.availableTeeth = this.teethDefinitions.Teeth;
        }

        return toothAreaData;
    };

    async toothChange(toothAreaData) {
        //Assuming we didn't just 0 out the tooth selection...
        if (toothAreaData.toothSelection && toothAreaData.toothSelection != '0') {
            let tempTooth = this.teethDefinitions.Teeth.find((item) => {
                return item.USNumber === toothAreaData.toothSelection;
            });

            if (toothAreaData.serviceCode.AffectedAreaId === 3) {
                toothAreaData.availableAreas = tempTooth.RootAbbreviations;
            }
            else if (toothAreaData.serviceCode.AffectedAreaId === 4) {
                toothAreaData.availableAreas = tempTooth.SummarySurfaceAbbreviations;
            }

            toothAreaData = this.settleAreaSelection(toothAreaData);
        }
        else {
            //We don't have a tooth selected
            if (toothAreaData.serviceCode.AffectedAreaId === 3) {
                toothAreaData.availableAreas = this.rootAbbreviations;
            }
            else if (toothAreaData.serviceCode.AffectedAreaId === 4) {
                toothAreaData.availableAreas = this.surfaceAbbreviations;
            }
            else {
                toothAreaData.availableAreas = [];
            }
        }

        if (toothAreaData.serviceCode.AffectedAreaId === 4) {
            //If this is a surface code, changing the tooth could change the area selection, which could change the service code            
            toothAreaData = await this.loadNextSurfaceSmartCode(toothAreaData);
        } else if (toothAreaData.serviceCode.AffectedAreaId === 3) {
            //Reset the area, if there is any area to the new values
            toothAreaData = await this.loadNextRootSmartCode(toothAreaData);
        }
        return toothAreaData;
    }

    async rotToothChange(toothAreaData) {
        if (toothAreaData.toothSelection) {
            return await this.getRoTSmartCode(toothAreaData);
        }
    }

    async areaChange(toothAreaData) {
        //If this is an surface code, look for the next smart code if we have a tooth already selected
        if (toothAreaData.toothSelection && toothAreaData.toothSelection != 0 && toothAreaData.serviceCode.AffectedAreaId === 4) {
            toothAreaData = await this.loadNextSurfaceSmartCode(toothAreaData);
        }

        return toothAreaData;
    }

    findToothFromAvailableTeeth(toothAreaData) {
        let tooth = toothAreaData.availableTeeth.find((item) => {
            return item.USNumber == toothAreaData.toothSelection;
        });
        return tooth;
    }

    settleToothAndAvailableAreas(toothAreaData) {

        let tempTooth = this.findToothFromAvailableTeeth(toothAreaData);

        if (!tempTooth) {
            toothAreaData.toothSelection = '0';
            toothAreaData.areaSelection = [];
        }

        if (toothAreaData.serviceCode.AffectedAreaId === 3) {
            toothAreaData.availableAreas = tempTooth ? tempTooth.RootAbbreviations : this.rootAbbreviations;
        }
        else if (toothAreaData.serviceCode.AffectedAreaId === 4) {
            toothAreaData.availableAreas = tempTooth ? tempTooth.SummarySurfaceAbbreviations : this.surfaceAbbreviations;
        }
        else {
            //This wasn't a root/surface code, clear area out entirely
            toothAreaData.availableAreas = [];
            toothAreaData.areaSelection = [];
        }

        return toothAreaData;
    }

    settleAreaSelection(toothAreaData) {
        if (toothAreaData.areaSelection && toothAreaData.areaSelection.length > 0) {
            let selectedAreaList = [];
            let currentAreaList = toothAreaData.areaSelection;
            for (let x = 0; x < currentAreaList.length; x++) {
                for (let y = 0; y < toothAreaData.availableAreas.length; y++) {
                    if (currentAreaList[x] === toothAreaData.availableAreas[y]) {
                        selectedAreaList.push(currentAreaList[x]);
                    }
                }
            }

            toothAreaData.areaSelection = selectedAreaList;
        }

        return toothAreaData;
    }

    async loadNextSurfaceSmartCode(toothAreaData): Promise<any> {
        const newSmartCode = await this.getNextSmartCode(toothAreaData.areaSelection, toothAreaData.originalServiceCode);
        if (newSmartCode !== null && newSmartCode !== undefined) {
            if (toothAreaData.serviceCode.ServiceCodeId != newSmartCode.ServiceCodeId) {
                //The service code changed, so the available teeth and/or tooth selection may have changed                

                toothAreaData.serviceCode = newSmartCode;
                //Take care of the teeth selection
                toothAreaData = this.getTeethForCurrentServiceCode(toothAreaData);

                //Now if the teeth selection was cleared out, show all the available areas
                if (toothAreaData.toothSelection && toothAreaData.toothSelection == 0) {
                    toothAreaData.availableAreas = this.surfaceAbbreviations;
                }
            }
        }
        return toothAreaData;
    }

    loadNextRootSmartCode(toothAreaData) {
        var numberOfRoots = this.getNumberOfRoots(toothAreaData.toothSelection);
        let newSmartCode = this.getNextRootSmartCode(numberOfRoots, toothAreaData.originalServiceCode);

        if (newSmartCode !== null && newSmartCode !== undefined && newSmartCode !== '') {
            if (toothAreaData.serviceCode.ServiceCodeId != newSmartCode.ServiceCodeId) {
                toothAreaData.serviceCode = newSmartCode;

                //Take care of the teeth selection
                toothAreaData = this.getTeethForCurrentServiceCode(toothAreaData);

                //Now if the teeth selection was cleared out, show all the available areas
                if (toothAreaData.toothSelection && toothAreaData.toothSelection == 0) {
                    toothAreaData.availableAreas = this.rootAbbreviations;
                }
            }
        }
        return toothAreaData;
    }

    getNextSmartCode(activeSurfaces, currentServiceCode): Promise<any> {
        return this.multiLocationProposedServiceFactory.GetSmartCode(activeSurfaces, currentServiceCode);
    };

    getNextRootSmartCode(activeSurfaces, currentServiceCode) {
        if (activeSurfaces.length > 0) {
            var smartCodeId = 'SmartCode' + activeSurfaces.length + 'Id';
            var smartCode = this.serviceCodes.find((serviceCode) => {
                return serviceCode.ServiceCodeId === currentServiceCode[smartCodeId];
            });
            return smartCode;
        }
        return '';
    };

    getNumberOfRoots(teeth) {
        if (!teeth || teeth == "" || teeth.length == 0) {
            return [];
        }

        if (this.oneRootTeeth.includes(teeth)) {
            return [1];
        } else if (this.twoRootTeeth.includes(teeth)) {
            return [1, 2];
        } else if (this.threeRootTeeth.includes(teeth)) {
            return [1, 2, 3];
        }
        return [];
    }

    setValuesOnServiceTransaction(service, toothAreaData) {
        if (service.ServiceCodeId != toothAreaData.serviceCode.ServiceCodeId) {
            service.Code = toothAreaData.serviceCode.Code;
            service.ServiceCode = toothAreaData.serviceCode.Code;
            service.Description = toothAreaData.serviceCode.Description;
            service.ServiceCodeId = toothAreaData.serviceCode.ServiceCodeId;
            service.Fee = toothAreaData.serviceCode.$$locationFee ? toothAreaData.serviceCode.$$locationFee : 0;
        }

        if (toothAreaData.serviceCode.AffectedAreaId != 1) {
            service.Tooth = toothAreaData.toothSelection;
        }
        else {
            service.Tooth = '';
        }


        if (toothAreaData.serviceCode.AffectedAreaId === 3) {
            service.Surface = '';
            service.Roots = toothAreaData.areaSelection &&
                toothAreaData.areaSelection.length > 0 ?
                toothAreaData.areaSelection.join(',') : '';
        }
        else if (toothAreaData.serviceCode.AffectedAreaId === 4) {
            service.Roots = '';
            service.Surface = toothAreaData.areaSelection &&
                toothAreaData.areaSelection.length > 0 ?
                toothAreaData.areaSelection.join(',') : '';
        }
        else {
            service.Roots = '';
            service.Surface = '';
        }
        return service;
    }

    async getRoTSmartCode(toothAreaData) {
        var arches = [];
        toothAreaData.toothSelection.forEach((tooth) => {
            if (tooth.indexOf('-')) {
                var toothRange = tooth.split('-');
                arches = this.checkRange(toothRange, arches);
            } else {
                arches = this.checkRange([tooth], arches);
            }
        });
        var archesValid = arches.length > 0 ? arches.every(function (val, i, arches) { return val === arches[0]; }) : false;
        let newSmartCode = await this.setRoTSmartCode(toothAreaData, archesValid, arches[0]);
        toothAreaData.serviceCode = newSmartCode;
        return toothAreaData;
    };

    // Call to the getNextSmartCode function with the correct number of selections
    async setRoTSmartCode(toothAreaData, archesValid, arch) {
        let newSmartCode = null;
        if (arch) {
            if (archesValid && arch == 'Upper') {
                //All of the arches are Upper, so go with the Upper code
                newSmartCode = await this.getNextSmartCode([1], toothAreaData.originalServiceCode);
            }
            else if (archesValid && arch == 'Lower') {
                newSmartCode = await this.getNextSmartCode([1, 2], toothAreaData.originalServiceCode);
            } else {
                //Not all of the arches match, so go with the original service code
                return toothAreaData.originalServiceCode;
            }

            if (newSmartCode && newSmartCode != null) {
                //If we have a new smart code, return it
                return newSmartCode;
            }
            else {
                //We didn't have a new smart code, so return the original
                return toothAreaData.originalServiceCode
            }
        }
        else {
            //If we don't have anything in arch, go with original service code
            return toothAreaData.originalServiceCode;
        }
    };

    checkRange(toothRange, arches) {
        if (toothRange.length > 1) {
            var toothRangeParsed = parseInt(toothRange[0]);
            // ARWEN: #509747 This was always true...
            // toothRangeParsed != NaN <--- replaced
            // it's possible that the condition should just be removed since the code
            // was always executing.
            if (!isNaN(toothRangeParsed)) {
                //It parsed to Int correctly. Parse the toothRange array
                for (var index = 0; index < toothRange.length; index++) {
                    toothRange[index] = parseInt(toothRange[index]);
                }
            }

            for (var i = toothRange[0]; i <= toothRange[1]; i++) {

                let tooth = this.teethDefinitions.Teeth.find((item) => {
                    return item.USNumber === i.toString();
                });
                if (tooth) {
                    arches.push(tooth.ArchPosition);
                }
            }
        } else if (toothRange.length === 1) {
            let tooth = this.teethDefinitions.Teeth.find((item) => {
                return item.USNumber === toothRange[0].toString();
            });
            if (tooth) {
                arches.push(tooth.ArchPosition);
            }
        }
        return arches;
    };

}