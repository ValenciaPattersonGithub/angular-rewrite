// for service based display of planned services on the schedule at least

import { Injectable, Inject } from '@angular/core';

@Injectable()
export class ScheduleDisplayPlannedServicesService {
    serviceCodes: any[];

    constructor() { }

    findByServiceCodeId(id: string) {
        if (this.serviceCodes) {
            for (let i = 0; i < this.serviceCodes.length; i++) {
                if (this.serviceCodes[i]['ServiceCodeId'] === id) {
                    return this.serviceCodes[i];
                }
            }
        }
        return null;
    } 

    addSpacePrefixIfFirstParamHasAValue(text: string, itemToAdd: string) {
        if (text === null || text === undefined) {
            text = itemToAdd;
        }
        else {
            text += text !== ''
                ? ' ' + itemToAdd
                : itemToAdd;
        }
        return text;
    }

    formatIndividualServiceText(service: any, plannedService: any) {

        if (plannedService.Tooth !== null && plannedService.Tooth !== undefined) {
            service.displayName = '#' + plannedService.Tooth;
        }

        if (plannedService.Surface !== null && plannedService.Surface !== undefined) {
            var surface: string = this.getSurfacesInSummaryFormat(plannedService.Surface);
            service.displayName = this.addSpacePrefixIfFirstParamHasAValue(service.displayName, surface);
        }

        if (plannedService.Roots !== null && plannedService.Roots !== undefined) {
            var roots = plannedService.Roots.split(',').join('');
            service.displayName = this.addSpacePrefixIfFirstParamHasAValue(service.displayName, roots);
        }

        var serviceAbbreviation = service.DisplayAs && service.DisplayAs !== ''
            ? service.DisplayAs
            : service.Code;

        return this.addSpacePrefixIfFirstParamHasAValue(service.displayName, serviceAbbreviation);
    }

    getSurfacesInSummaryFormat(surfaces: string) {
        if (surfaces === null || surfaces === undefined) {
            return '';
        }

        surfaces = surfaces.trim();
        if (surfaces.length < 1) {
            return surfaces;
        }
        var surfaceArr: string[] = surfaces.split(',');
        if (surfaceArr.length === 1) {
            return surfaceArr[0];
        }
        var ordered: string = '';
        var normalOrder = ['M', 'O', 'I', 'D', 'B', 'B5', 'F', 'F5', 'L', 'L5'];
        for (var i = 0; i < normalOrder.length; ++i) {
            if (surfaceArr.includes(normalOrder[i])) {
                ordered += normalOrder[i];
            }
        }
        return this.translateSurfaceDetailToSummary(ordered);
    }

    translateSurfaceDetailToSummary(detailed: string) {
        if (detailed.includes('B')) {
            if (detailed.charAt(0) !== 'M') {
                detailed = detailed.replace('ODB', 'DOB');
            }

            detailed = detailed.replace('BB5LL5', 'BL5');
            detailed = detailed.replace('BB5', 'B5');
            detailed = detailed.replace('B5LL5', 'LB5');
            detailed = detailed.replace('LL5', 'L5');
            detailed = detailed.replace('B5L5', 'BL5');
            detailed = detailed.replace('B5L', 'LB5');
        }
        else if (detailed.includes('F')) {
            if (detailed.charAt(0) !== 'M') {
                detailed = detailed.replace('IDF', 'DIF');
            }

            detailed = detailed.replace('FF5LL5', 'FL5');
            detailed = detailed.replace('FF5', 'F5');
            detailed = detailed.replace('F5LL5', 'LF5');
            detailed = detailed.replace('LL5', 'L5');
            detailed = detailed.replace('F5L5', 'FL5');
            detailed = detailed.replace('F5L', 'LF5');
        }
        else {
            if (detailed.charAt(0) !== 'M') {
                detailed = detailed.replace('OD', 'DO');
                detailed = detailed.replace('ID', 'DI');
            }
            detailed = detailed.replace('LL5', 'L5');
        }
        return detailed;
    }

    getRootsInSummaryFormat(roots: string) {
        if (roots === null || roots === undefined) {
            return '';
        }

        roots = roots.trim();
        if (roots.length < 1) {
            return roots;
        }
        var rootArr: string[] = roots.split(',');
        if (rootArr.length === 1) {
            return rootArr[0];
        }
        var ordered: string = '';
        var normalOrder = ['DB', 'S', 'B', 'P', 'D', 'M', 'MB'];
        for (var i = 0; i < normalOrder.length; ++i) {
            if (rootArr.includes(normalOrder[i])) {
                ordered += normalOrder[i];
            }
        }
        return ordered;
    }

    buildSingleServiceDisplayTextAndAmount(appointment: any, plannedService: any) {
        let tempService: any = this.findByServiceCodeId(plannedService.ServiceCodeId);

        if (tempService !== null) {

            // Add up the fee or amount for the work being done
            if (plannedService.Fee !== null && plannedService.Fee !== undefined && !isNaN(plannedService.Fee))
                appointment.amount += plannedService.Fee;

            // adding view only property to the object.
            tempService.displayName = '';

            tempService.displayName = this.formatIndividualServiceText(tempService, plannedService)

            // Resulting format of the prior method is:
            // #{Tooth} {Surface} {Roots} {serviceAbbreviation}
            //console.log(tempService.displayName);
            if (appointment.concatinatedServices !== '') {
                appointment.concatinatedServices += ', ' + tempService.displayName;
            }
            else {
                appointment.concatinatedServices = tempService.displayName;
            }

            // this collection is some how used later to populate the services in the modal ... do not remove. I found this out the hard way.
            appointment.initialServiceCodes.push(tempService);
        }

        return appointment;
    }

    setAppointmentServiceDisplayTextAndAmount(appointment: any, plannedServices: any[], serviceCodes: any[]) {
        this.serviceCodes = serviceCodes;

        // we default the value to 0
        appointment.amount = 0;
        appointment.concatinatedServices = '';
        appointment.initialServiceCodes = [];
        if (plannedServices !== null && plannedServices !== undefined) {

            for (let a = 0; a < plannedServices.length; a++) {
                appointment = this.buildSingleServiceDisplayTextAndAmount(appointment, plannedServices[a]);
            }
        }

        if ((!appointment.PlannedServices || appointment.PlannedServices.length == 0 ) && appointment.AppointmentType) {
            appointment.amount = appointment.AppointmentType.UsualAmount ? appointment.AppointmentType.UsualAmount : 0;
        }

        return appointment;
    }

}
