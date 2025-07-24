import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AllPatient, Appointment, OtherToDo, PatientManagementCount, PreventiveCare, TreatmentPlans } from '../models/patient-grid-response.model';
import { AllPatientRequest, AppointmentRequest, OtherToDoRequest, PreventiveCareRequest, TreatmentPlansRequest } from '../models/patient-grid-request.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Injectable({
  providedIn: 'root'
})
export class PatientLandingGridService {

  constructor(private httpClient: HttpClient) { }

  updatePatientCount(url: string, locationId: number) {
    if(locationId){
      return new Promise((resolve, reject) => {
        this.httpClient.get(`${url}/patients/count/${locationId}`).toPromise()
          .then((res: SoarResponse<PatientManagementCount>) => {
            resolve(res.Value);
          }, err => { // Error
            reject(err);
          })
      });
    }
  }

  // Get All Patients
  getAllPatients(request: AllPatientRequest, url: string): Promise<AllPatient> {
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${url}/patients/PatientTab`, request).toPromise()
        .then((res: SoarResponse<AllPatient>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  // Get All Treatment Plans
  getAllTreatmentPlans(request: TreatmentPlansRequest, url: string): Promise<TreatmentPlans> {
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${url}/patients/TreatmentPlans`, request).toPromise()
        .then((res: SoarResponse<TreatmentPlans>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  // Appointments
  getAllAppointments(request: AppointmentRequest, url: string): Promise<Appointment> {
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${url}/patients/AppointmentTab`, request).toPromise()
        .then((res: SoarResponse<Appointment>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  // Preventive Care
  getAllPreventiveCare(request: PreventiveCareRequest, url: string): Promise<PreventiveCare> {
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${url}/patients/PreventiveCarePlans`, request).toPromise()
        .then((res: SoarResponse<PreventiveCare>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  // Other To Do
  getAllToDo(request: OtherToDoRequest, url: string): Promise<OtherToDo> {
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${url}/patients/OtherToDoTab`, request).toPromise()
        .then((res: SoarResponse<OtherToDo>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }
}
