import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { GroupType, PatientsWithGroupType } from 'src/business-center/practice-settings/patient-profile/group-types/group-type';

@Injectable({
  providedIn: 'root'
})
export class GroupTypeService {

  constructor(private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig) { }

  get = (): Observable<SoarResponse<Array<GroupType>>> => {
    let url = this.soarConfig.domainUrl + '/patientgroups';
    return this.httpClient.get<SoarResponse<Array<GroupType>>>(url);
  }

  save = (newGroupName: string): Observable<SoarResponse<GroupType>> => {
    let url = this.soarConfig.domainUrl + '/patientgroups';
    return this.httpClient.post<SoarResponse<GroupType>>(url, newGroupName);
  }

  update = (groupData: GroupType): Observable<SoarResponse<GroupType>> => {
    let url = this.soarConfig.domainUrl + '/patientgroups';
    return this.httpClient.put<SoarResponse<GroupType>>(url, groupData);
  }

  delete = (groupTypeId: string) => {
    let url = this.soarConfig.domainUrl + '/patientgroups/' + groupTypeId;
    return this.httpClient.delete(url);
  }

  groupTypeWithPatients = (patientsId): Observable<SoarResponse<Array<PatientsWithGroupType>>> => {
    let url = this.soarConfig.domainUrl + '/patientgroups/' + patientsId + '/patients';
    return this.httpClient.get<SoarResponse<Array<PatientsWithGroupType>>>(url);
  }
}