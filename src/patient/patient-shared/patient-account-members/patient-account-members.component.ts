import { Component, Inject, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { PatientHttpService } from "src/patient/common/http-providers/patient-http.service";
import { PatientRegistrationService } from "src/patient/common/http-providers/patient-registration.service";
import { RegistrationEvent } from "src/patient/common/models/enums";
import { RegistrationCustomEvent } from "src/patient/common/models/registration-custom-event.model";
import { SortOrder } from "src/patient/common/models/enums";
import { PatientCommunicationCenterService } from "src/patient/common/http-providers/patient-communication-center.service";
import { FormControl } from "@angular/forms";

declare let _: any;
@Component({
  selector: "app-patient-account-members",
  templateUrl: "./patient-account-members.component.html",
  styleUrls: ["./patient-account-members.component.scss"],
})
export class PatientAccountMembersComponent implements OnInit {
  gridHeaders: any[];
  accountMembers: any[];
  patientAccountMembers: any[];
  patientPath = "#/Patient/";
  @Input() featureName: string;
  @Output() accoumentMemberListFillEvent = new EventEmitter<any[]>();
  sortObject = {};
  accountId: any;
  viewAuthAbbreviation = "soar-per-perdem-add";
  hasViewAccess: any;
  constructor(
    private registrationService: PatientRegistrationService,
    @Inject("tabLauncher") private tabLauncher,
    private patientService: PatientHttpService,
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    @Inject("$routeParams") private route,
    @Inject("patSecurityService") private patSecurityService
  ) {}

  ngOnInit(): void {
    this.sortObject["LastName"] = SortOrder.Descending;
    if (this.featureName === "PatientRegistration") {
      this.gridHeaders = [{ label: "Account Member" }];
    } else if (this.featureName === "PatientProfile") {
      this.gridHeaders = [
        {
          label: "Account Member",
          click: "LastName",
          span: true,
        },
        {
          label: "DOB",
          click: "DateOfBirth",
          span: true,
        },
        {
          label: "Age",
        },
        {
          label: "Transfer",
        },
      ];
      this.patientCommunicationCenterService.getPatientInfoByPatientId(this.route.patientId).subscribe(
        (patientInfo: any) => {
          if (patientInfo) {
            if (patientInfo && patientInfo.PersonAccountId) {
              this.accountId = patientInfo.PersonAccountId;
              this.patientService.getAllAccountMembersByAccountId(this.accountId).subscribe(
                (data: any) => this.getAllAccountMembersByAccountIdOnSuccess(data),
                (error) => this.getAllAccountMembersByAccountIdOnFail()
              );
            }
          }
        },
        (err: any) => {}
      );
    }
    this.registrationService
      .getRegistrationEvent()
      .pipe()
      .subscribe((event: RegistrationCustomEvent) => {
        if (event) {
          switch (event.eventtype) {
            case RegistrationEvent.AccountMembers:
              this.handleAccountmMemberEvent(event.data);
              break;
          }
        }
      });
    this.authAccess();
  }
  handleAccountmMemberEvent = (eventData: any) => {
    this.accountMembers = [];
    if (eventData) {
      if (eventData.length) {
        this.accountMembers = eventData.sort((a: any, b: any) => a.LastName.localeCompare(b.LastName));
      }
    }
  };
  openNewTab = (member: any) => {
    const overviewUrl = this.patientPath + member.PatientId + "/Overview/";
    this.tabLauncher.launchNewTab(overviewUrl);
  };
  getAllAccountMembersByAccountIdOnSuccess = (res) => {
    if (res.Value && res.Value.length) {
      this.patientAccountMembers = res.Value.sort(({ IsResponsiblePerson: A }, { IsResponsiblePerson: B }) => B - A);
      this.accoumentMemberListFillEvent.emit(this.patientAccountMembers);
    }
  };
  getAllAccountMembersByAccountIdOnFail = () => {};
  sortColumn = (field) => {
    let listOfField;
    listOfField = _.filter(this.gridHeaders, (filteredList) => {
      if (filteredList.click === field && filteredList.span === true) {
        if (this.sortObject[field]) {
          this.sortObject[field] = this.sortObject[field] === SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
          this.patientAccountMembers = this.patientAccountMembers.sort((a, b) => {
            if ((a[field] && a[field].toLowerCase()) > (b[field] && b[field].toLowerCase()) || !b[field]) {
              return this.sortObject[field] === SortOrder.Descending ? 1 : -1;
            }
            if ((a[field] && a[field].toLowerCase()) < (b[field] && b[field].toLowerCase()) || !a[field]) {
              return this.sortObject[field] === SortOrder.Descending ? -1 : 1;
            }
            return 0;
          });
        } else {
          this.sortObject = {};
          this.sortObject[field] = SortOrder.Ascending;
          this.patientAccountMembers = this.patientAccountMembers.sort((a, b) => {
            if ((a[field] && a[field].toLowerCase()) > (b[field] && b[field].toLowerCase()) || !b[field]) {
              return this.sortObject[field] === SortOrder.Descending ? 1 : -1;
            }
            if ((a[field] && a[field].toLowerCase()) < (b[field] && b[field].toLowerCase()) || !a[field]) {
              return this.sortObject[field] === SortOrder.Descending ? -1 : 1;
            }
            return 0;
          });
        }
      }
    });
  };
  transfer = (patientId: any) => {
    if (patientId && this.accountId) {
      this.registrationService.setRegistrationEvent({
        eventtype: RegistrationEvent.PerformNavigation,
        data: `#/Patient/${patientId}/Account/${this.accountId}/TransferAccount/Profile?tab=Profile&currentPatientId=0`,
      });
    }
  };
  sortcss(event) {
    if (this.sortObject) {
      if (this.sortObject[event] === SortOrder.Ascending) {
        return "fa-sort-up";
      } else if (this.sortObject[event] === SortOrder.Descending) {
        return "fa-sort-down";
      } else if (!this.sortObject[event]) {
        return "fa-sort";
      }
    } else {
      return "fa-sort";
    }
  }
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  };
  authAccess = () => {
    this.hasViewAccess = this.authAccessByType(this.viewAuthAbbreviation);
  };
}
