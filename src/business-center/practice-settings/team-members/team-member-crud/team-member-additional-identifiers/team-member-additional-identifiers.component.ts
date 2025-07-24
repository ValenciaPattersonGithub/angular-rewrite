import { Component, Inject, Input, OnInit } from '@angular/core';
import { TeamMemberIdentifierService } from 'src/@shared/providers/team-member-identifier.service';
import { MasterAdditionalIdentifier } from 'src/business-center/practice-settings/models/team-member-identifier.model';
import { User } from '../../team-member';

@Component({
    selector: 'team-member-additional-identifiers',
    templateUrl: './team-member-additional-identifiers.component.html',
    styleUrls: ['./team-member-additional-identifiers.component.scss']
})
export class TeamMemberAdditionalIdentifiersComponent implements OnInit {
    masterAdditionalIdentifiers: MasterAdditionalIdentifier[];
    @Input() user: User;
    constructor(@Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('UserServices') private userServices,
        private teamMemberIdentifierService: TeamMemberIdentifierService
    ) {
    }

    ngOnInit(): void {
        this.getMasterAdditionalIdenfiers();
    }

    //#region Master Additional Identifiers
    getMasterAdditionalIdenfiers = () => {
        this.teamMemberIdentifierService?.teamMemberIdentifier()
            .then((res: MasterAdditionalIdentifier) => {
                this.masterAdditionalIdentifersGetSuccess(res);
            }, () => {
                this.masterAdditionalIdentifiersGetFailure();
            });
    }

    masterAdditionalIdentifersGetSuccess = (res) => {
        if (!res?.Value?.isEmpty) {
            if (res?.Value?.length > 0) {
                this.masterAdditionalIdentifiers = res?.Value;
                this.getAdditionalIdenfiers();
            }
        }
    }

    masterAdditionalIdentifiersGetFailure = () => {
        this.toastrFactory.error(this.localize.getLocalizedString('{0} {1} {2}', ['Failed to get', 'User', 'Master User Additional Identifiers']), this.localize.getLocalizedString('Error'));
    };

    // #endregion

    // #region Additional Identifiers
    getAdditionalIdenfiers = () => {
        if (this.user?.UserId) {
            this.userServices.AdditionalIdentifiers?.getAllAdditionalIdentifiers({ Id: this.user?.UserId })
                .$promise.then((res) => {
                    this.additionalIdentifersGetSuccess(res);
                }, () => {
                    this.additionalIdentifiersGetFailure();
                });

        }
        else {
            const master = this.masterAdditionalIdentifiers;
            if (master?.length > 0) {
                master.forEach((idn) => {
                    idn.UserId = "";
                    idn.Value = "";
                    idn.UserIdentifierId = "";
                });
                this.masterAdditionalIdentifiers = master;
            }
        }
    }

    additionalIdentifersGetSuccess = (res) => {
        const master = this.masterAdditionalIdentifiers;
        if (!res?.Value?.isEmpty) {
            if (res?.Value?.length > 0) {
                const additionIdentifiers = res?.Value;
                master.forEach((idn) => {
                    const idnValue = additionIdentifiers.find(x => x.MasterUserIdentifierId == idn?.MasterUserIdentifierId);
                    idn.UserId = this.user?.UserId;
                    idn.Value = idnValue != null ? idnValue?.Value : "";
                    idn.UserIdentifierId = idnValue != null ? idnValue?.UserIdentifierId : "";
                });

                this.masterAdditionalIdentifiers = master;
            } else {
                master.forEach((idn) => {
                    idn.UserId = "";
                    idn.Value = "";
                    idn.UserIdentifierId = "";
                });
                this.masterAdditionalIdentifiers = master;
            }
        }
        if (res?.Value?.isEmpty) {
            master.forEach((idn) => {
                idn.UserId = "";
                idn.Value = "";
                idn.UserIdentifierId = "";
            });
            this.masterAdditionalIdentifiers = master;
        }
    }

    additionalIdentifiersGetFailure = function () {
        this.toastrFactory.error(this.localize.getLocalizedString('{0} {1} {2}', ['Failed to get', 'User', 'Additional Identifiers']), this.localize.getLocalizedString('Error'));
    };

    saveAdditionalIdentifiers = (user:User) => {
        this.user = user;
        const resultPromises: Promise<MasterAdditionalIdentifier>[] = [];
        const master = this.masterAdditionalIdentifiers
        const identifiersToUpdate = [];
        const identifiersToAdd = [];
    
        if (master && master?.length > 0) {
          for (let i = 0; i < master.length; i++) {
            const identifier = {
              UserId: "",
              Value: "",
              MasterUserIdentifierId: "",
              UserIdentifierId: "",
            }
            if (master[i]?.UserIdentifierId !== "") {
              identifier.UserIdentifierId = master[i]?.UserIdentifierId;
              identifier.UserId = this.user?.UserId;
              identifier.MasterUserIdentifierId = master[i]?.MasterUserIdentifierId;
              identifier.Value = master[i]?.Value;
              identifiersToUpdate.push(identifier);
            }
    
            if (master[i]?.UserIdentifierId === "" && master[i]?.Value !== "") {
              identifier.UserIdentifierId = "";
              identifier.UserId = this.user?.UserId;
              identifier.MasterUserIdentifierId = master[i]?.MasterUserIdentifierId;
              identifier.Value = master[i]?.Value;
              identifiersToAdd.push(identifier);
            }
          }
        }
        
        if (identifiersToAdd?.length > 0) {
          if (this.user?.UserId) {
            const createPromise = new Promise((resolve, reject) => {
              this.userServices?.AdditionalIdentifiers.create(
                { Id: this.user?.UserId }, identifiersToAdd,
              (res) => {
                this.additionalIdentifersSaveSuccess(res);
                resolve(res);
              }, () => {
                this.additionalIdentifersSaveFailure();
                reject('adding identifiers');
              });
            });
            resultPromises.push(createPromise);
        }
      }

      if (identifiersToUpdate?.length > 0) {
        if (this.user?.UserId) {
          const updatePromise = new Promise((resolve, reject) => {
            this.userServices?.AdditionalIdentifiers.update(
              { Id: this.user?.UserId },
              identifiersToUpdate, (res) => {
              this.additionalIdentifersSaveSuccess(res);
              resolve(res);
            },() => {
              this.additionalIdentifersSaveFailure();
              reject('updating identifiers');
            });
          });
          resultPromises?.push(updatePromise);
        }
      }

      return resultPromises;
};
      additionalIdentifersSaveSuccess = (res) => {
          if (res?.Value?.length > 0) {
            this.masterAdditionalIdentifiers = res?.Value;
          }
      }
    
      additionalIdentifersSaveFailure = () => {
        this.toastrFactory.success(this.localize.getLocalizedString('{0} {1} {2}', ['Failed to save', 'User', 'Additional Identifiers']), this.localize.getLocalizedString('Failure'));
      }

}
