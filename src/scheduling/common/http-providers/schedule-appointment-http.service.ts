import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpParams} from '@angular/common/http';
import { Observable} from "rxjs";
import { shareReplay, catchError, map, tap } from 'rxjs/operators';

import { MicroServiceApiService } from '../../../security/providers';

@Injectable()
export class ScheduleAppointmentHttpService {
    constructor(private http: HttpClient, private microServiceApis: MicroServiceApiService) {
    }
    
    getDayViewAppointments(from, to, locationIds) {
        let params = new HttpParams()
            .set('startTime', from)
            .set('endTime', to);
        // handling Array
        locationIds.forEach(id => {
            params = params.append('locationIds', id);
        });

        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/scheduleappointments/dayview', { params })
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }

    getDayViewAppointmentById(appointmentId, locationIds) {
        let params = new HttpParams()
            .set('appointmentId', appointmentId);
          
        // handling Array
        locationIds.forEach(id => {
            params = params.append('locationIds', id);
        });

        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/scheduleappointments/dayviewbyid', { params })
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }

    getWeekViewAppointments(from, to, locationIds) {
        let params = new HttpParams()
            .set('startTime', from)
            .set('endTime', to);
        // handling Array
        locationIds.forEach(id => {
            params = params.append('locationIds', id);
        });

        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/scheduleappointments/weekview', { params })
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }



    getPinnedAppointmentsByPracticeId() {
        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/pinnedappointments/by-practice')
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }

    getUnscheduledAppointmentsByPatientId(patientId) {
        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/unscheduled-appointments/for-schedule/by-patient/' + patientId)
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }

    getAppointmentModalAndPatientByAppointmentId(appointmentId) {

        //let params = new HttpParams()
        //    .set('id', appointmentId)

        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/appointmentmodal/appointment-and-patient-info/' + appointmentId)
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }

    getPatientDataForAppointmentModal(patientId) {

        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/appointmentmodal/patient-info/' + patientId)
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }

    getAppointmentProviders(appointmentId) {

        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/appointments/appointment-providers/' + appointmentId)
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }

    getAppointmentProvidersForMultipleAppointments(appointmentIds) {
        let params = new HttpParams();
        // handling Array
        appointmentIds.forEach(thisAppointmentId => {
            params = params.append('appointmentIds', thisAppointmentId);
        });

        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/appointments/appointment-providers/for-multiple-appointments/', { params })
            .pipe(
                map(res => <any>res)
            );
    }

    async getAppointmentById(appointmentId): Promise<any> {
          return await this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/appointments/' + appointmentId)
            .pipe(
                map(res => <any>res)
            ).toPromise();
    }

      //This gets Proposed Services for a patient and returns the proposed services with an appointment start time if the service has an appointment
   getProposedServicesWithAppointmentStartTime(patientId){
          return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/patientservices/proposed-with-starttime/' + patientId)
           .pipe(
               map(res => <any>res)
           );
    }

    getProposedServicesWithAppointmentStartTimeWithPromise(patientId): Promise<any> {
        return this.http.get(this.microServiceApis.getSchedulingUrl() + '/api/v1/patientservices/proposed-with-starttime/' + patientId
            ).toPromise();
    }

    createFamilyAppointments(appointments) {
        return this.http.post(this.microServiceApis.getDomainUrl() + '/Appointments/Family', appointments)
            .pipe(
                map(res => <any>res)
            );
    }
}
