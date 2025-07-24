import { Component, Input, OnInit, Inject } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'account-members',
    templateUrl: './account-members.component.html',
    styleUrls: ['./account-members.component.scss']
})
export class AccountMembersComponent implements OnInit {
    profileAccountMembers: any;
    accountMembers: Array<{ Name: string, DOB: string, PatientId: any, IsActive: any }>;
    dob: any = '';
    name: any = '';
    patientId: any = '';
    defaultOrderKey = 'IsResponsiblePerson';
    sortDirectionAsce: any = -1;

    constructor(@Inject('$routeParams') private route,
        @Inject('tabLauncher') private tabLauncher,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        private translate: TranslateService,
        @Inject('toastrFactory') private toastrFactory) { }

    ngOnInit() {
        const patientProfile = this.patientCommunicationCenterService.patientDetail.Profile;
        if ((patientProfile && patientProfile.PersonAccountId)) {
            this.getPatientAccountOverview(patientProfile.PersonAccountId);
        }
    }
    getPatientAccountOverview = (accountId: any) => {
        this.patientCommunicationCenterService
            .getPatientAccountOverviewByAccountId(accountId)
            .subscribe((data: any) => this.getPatientAccountOverviewByAccountIdSuccess(data),
                error => this.getPatientAccountOverviewByAccountIdFailure());
    }
    getPatientAccountOverviewByAccountIdSuccess = (accountOverview: any) => {
        if ((accountOverview && accountOverview.AccountMembersProfileInfo)) {
                this.accountMembers = [];
                this.patientId = this.route.patientId;
                this.profileAccountMembers = accountOverview.AccountMembersProfileInfo.sort(({ IsResponsiblePerson: A }, { IsResponsiblePerson: B }) => B - A)
                this.profileAccountMembers.forEach(member => {
                    if (member.LastName) {
                        this.name = `${member.LastName} `;
                    }
                    if (member.SuffixName) {
                        this.name += `${member.SuffixName}`;
                    }
                    if ((member.LastName || member.SuffixName) && (member.FirstName || member.MiddleName || member.PreferredName)) {
                        this.name += `, `;
                    }
                    if (member.FirstName) {
                        this.name += `${member.FirstName} `;
                    }
                    if (member.MiddleName) {
                        this.name += `${member.MiddleName} `;
                    }
                    if (member.PreferredName) {
                        this.name += `(${member.PreferredName}) `;
                    }
                    if (member.IsResponsiblePerson) {
                        this.name += `(RP)`;
                    }
                    if (member.DateOfBirth) {
                        this.dob = member.DateOfBirth;
                    } else {
                        this.dob = '';
                    }
                    this.accountMembers.push({ Name: this.name, DOB: this.dob, PatientId: member.PatientId, IsActive: member.IsActiveAccountMember });
                });
        }
    }
    getPatientAccountOverviewByAccountIdFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the Account Members.'),
            this.translate.instant('Server Error'));
    }
    overview = (patientId: any, isActive: any) => {
        if (this.patientId !== patientId && isActive) {
            this.tabLauncher.launchNewTab(`#/Patient/${patientId}/Overview/`);
        }
    }
}
