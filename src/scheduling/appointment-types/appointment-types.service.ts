import { Injectable, inject } from '@angular/core';
import { AppointmentType } from '../appointment-types/appointment-type';
import { ColorUtilitiesService } from '../common/providers/color-utilities.service';

@Injectable()
export class AppointmentTypesService {
    appointmentTypes: AppointmentType[];

    constructor(private colorUtilitiesService: ColorUtilitiesService) { }

    findByAppointmentTypeId(id: string) {
        if (this.appointmentTypes) {
            for (let i = 0; i < this.appointmentTypes.length; i++) {
                if (this.appointmentTypes[i]['AppointmentTypeId'] === id) {
                    return this.appointmentTypes[i];
                }
            }
        }
        return null;
    }

    findByName(name: string) {
        if (this.appointmentTypes) {
            for (let i = 0; i < this.appointmentTypes.length; i++) {
                if (this.appointmentTypes[i]['Name'] === name) {
                    return this.appointmentTypes[i];
                }
            }
        }
        return null;
    }

    getAppointmentTypeColors(type, status) {
        const isCompleted = status === 3;
        const baseRgb = {
            r: 160,
            g: 160,
            b: 160
        };
        const noColor = {
            r: 100,
            g: 100,
            b: 100
        };

        let rgb = null;
        let fontColor = '#000';
        if (type === null || type === undefined || type.AppointmentTypeColor === null || type.AppointmentTypeColor === undefined || type.AppointmentTypeColor === '') {
            rgb = isCompleted
                ? baseRgb
                : noColor;
        }
        else {
            rgb = isCompleted
                ? baseRgb
                : this.colorUtilitiesService.getHexToRgb(type.AppointmentTypeColor);
            fontColor = type.FontColor
        }

        return {
            Display: rgb.r + ', ' + rgb.g + ', ' + rgb.b,
            Font: fontColor
        };
    }

    getRgbFormattedFromHex(hex: string) {
        var rgb = this.colorUtilitiesService.getHexToRgb(hex);

        return {
            Display: rgb.r + ', ' + rgb.g + ', ' + rgb.b,
            Font: "#000000"
        };
    }

    setAppointmentTypeWithBaseColorsAndStyles(appointment: any) {
        appointment.AppointmentType = this.findByAppointmentTypeId(appointment.AppointmentTypeId);
        const typeColor = this.getAppointmentTypeColors(appointment.AppointmentType, appointment.Status);
        appointment.typeColor = typeColor;
        appointment.patientNameTypeColor = 'background-color: rgba(' + appointment.typeColor.Display + ', 1.0)';
        appointment.cardStyle = 'border-radius: 0, border: none, background-color: rgba(' + appointment.typeColor.Display + ', 0.35),' +
            'color: ' + appointment.typeColor.Font + ', overflow: visible';
        return appointment;
    }


    getFormattedDuration(duration: number) {
        var durationString = '';
        if (duration) {
            var hours = Math.floor(duration / 60);
            var minutes = duration % 60;

            if (hours > 0) {
                durationString = durationString.concat(hours.toString());
                durationString = durationString.concat(':');
            } else {
                durationString = durationString.concat('0:');
            }

            if (minutes > 0) {
                if (minutes == 5) {
                    durationString = durationString.concat('0');
                }
                durationString = durationString.concat(minutes.toString());
            } else {
                durationString = durationString.concat('00');
            }
        }
        return durationString;
    }

    setAppointmentTypes(types: AppointmentType[]) {
        let resultTypes = null;
        if (types) {
            for (let i = 0; i < types.length; i++) {
                types[i]['FormattedDuration'] = this.getFormattedDuration(types[i]['DefaultDuration']);
            }
            this.appointmentTypes = types;
            resultTypes = this.appointmentTypes;
        }
        return resultTypes
    }

    addAppointmentType(type: AppointmentType) {
        if (this.appointmentTypes === null) {
            this.appointmentTypes = [];
        }

        let returnType = this.findByAppointmentTypeId(type.AppointmentTypeId);
        if (returnType === null) {
            type.FormattedDuration = this.getFormattedDuration(type.DefaultDuration);
            this.appointmentTypes.push(type);
            returnType = type;
        }

        return returnType;
    }

    updateAppointmentType(type: AppointmentType) {
        let returnType = null;
        if (this.appointmentTypes) {
            for (let i = 0; i < this.appointmentTypes.length; i++) {
                if (this.appointmentTypes[i].AppointmentTypeId === type.AppointmentTypeId) {
                    this.appointmentTypes[i].DateModified = type.DateModified;
                    this.appointmentTypes[i].DefaultDuration = type.DefaultDuration;
                    this.appointmentTypes[i].FormattedDuration = this.getFormattedDuration(type.DefaultDuration);
                    this.appointmentTypes[i].FontColor = type.FontColor;
                    this.appointmentTypes[i].Name = type.Name;
                    this.appointmentTypes[i].PerformedByProviderTypeId = type.PerformedByProviderTypeId;
                    this.appointmentTypes[i].UpdatesNextPreventiveAppointmentDate = type.UpdatesNextPreventiveAppointmentDate;
                    this.appointmentTypes[i].UserModified = type.UserModified;
                    this.appointmentTypes[i].UsualAmount = type.UsualAmount;
                    returnType = this.appointmentTypes[i]; // we only wanted to update the one record so exit the loop.
                    break;
                }
            }
        }
        return returnType;
    }

    removeAppointmentType(type: AppointmentType) {
        if (this.appointmentTypes) {
            let shouldProcess = false;
            let index = 0;
            for (let i = 0; i < this.appointmentTypes.length; i++) {
                if (this.appointmentTypes[i].AppointmentTypeId === type.AppointmentTypeId) {
                    index = i;
                    shouldProcess = true;
                    break;
                }
            }
            if (shouldProcess === true) {
                // remove the items from the list
                this.appointmentTypes.splice(index, 1);
            }
        }
    }
}
