import { Component, Inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { filter, finalize } from 'rxjs/operators';
import escape from 'lodash/escape';
import { AdjustmentTypesService } from 'src/@shared/providers/adjustment-types.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { AdjustmentTypes } from 'src/business-center/practice-settings/adjustment-types/adjustment-types';
import { ViewClaimService } from 'src/@shared/providers/view-claim.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { FuseFlag } from 'src/@core/feature-flags';

@Component({
  selector: 'patient-encounter-claims',
  templateUrl: './patient-encounter-claims.component.html',
  styleUrls: ['./patient-encounter-claims.component.scss']
})
export class PatientEncounterClaimsComponent implements OnInit {


  adjustmentTypes = [];
  filteredProviders: any;
  locations = [];
  hasViewOrEditAccessToServiceTransaction = false;
  @Input() encounterClaimsList: any;
  @Input() encounter: any;
  @Input() serviceTransaction: any;
  @Input() patientInfo: any;
  @Input() serviceCodes: any;
  @Input() providers: any;
  @Input() refreshPageDataForGrid: any;

  showTemplate = false;
  soarAuthSvcTrViewKey = 'soar-acct-actsrv-view';
  soarAuthEditTrViewKey = 'soar-acct-dbttrx-view';

  optionTitle = '';
  isClaimsMenuOpen = false;
  isLoadingPdf = false;
  enableEliminateStaleClaims = false; 
  constructor(@Inject('localize') private localize
    , @Inject('referenceDataService') private referenceDataService
    , private adjustmentTypesService: AdjustmentTypesService
    , @Inject('ListHelper') private listHelper
    , @Inject("ModalFactory") private modalFactory
    , @Inject('patSecurityService') private patSecurityService
    , @Inject('toastrFactory') private toastrFactory
    , @Inject('$location') private $location
    , @Inject('$q') private $q
    , @Inject('LocationServices') private locationServices
    , @Inject("AccountNoteFactory") private accountNoteFactory
    , @Inject('CommonServices') private commonServices,
    private viewClaimService: ViewClaimService,
    private featureFlagService: FeatureFlagService

  ) { }
  ngOnInit(): void {
    this.optionTitle = this.encounterClaimsList && this.encounterClaimsList.length === 1 && this.encounterClaimsList[0].Type === 2 ? this.localize.getLocalizedString('View Predetermination: ') : this.localize.getLocalizedString('View Claim: ');
    this.checkFeatureFlags();
  }


  claimStatus(status) {
    var claimStat = null;
    switch (status) {
      case 0:
        claimStat = "None";
        return claimStat;
      case 1:
        claimStat = "Unsubmitted Paper";
        return claimStat;
      case 2:
        claimStat = "Printed";
        return claimStat;
      case 3:
        claimStat = "Unsubmitted Electronic";
        return claimStat;
      case 4:
        claimStat = "In Process";
        return claimStat;
      case 5:
        claimStat = "Accepted Electronic";
        return claimStat;
      case 6:
        claimStat = "Rejected";
        return claimStat;
      case 7:
        claimStat = "Closed";
        return claimStat;
      case 8:
        claimStat = "Paid";
        return claimStat;
      case 9:
        claimStat = "Queued";
        return claimStat;
      default:
        break;
    }
  };

  toggleClaimsView($event) {
    this.isClaimsMenuOpen = !this.isClaimsMenuOpen;
    $event.stopPropagation();
  };

  closePopover() {
    this.isClaimsMenuOpen = false;
  };

  // Get adjustment types
  getAdjustmentTypes = () => {
    return new Promise((resolve, reject) => {
      this.adjustmentTypesService.get({ active: false })
        .then((successResponse: SoarResponse<AdjustmentTypes[]>) => {
          this.adjustmentTypes = successResponse?.Value;
          resolve(this.adjustmentTypes);
        },() => {
          this.toastrFactory.error(this.localize.getLocalizedString('{0} failed to load.', ['Adjustment Types']),
            this.localize.getLocalizedString('Server Error'));
          reject();
        });
    });
  }
  

  // Get locations
  getLocations =  () => {
    return new Promise((resolve, reject) => {
      this.locationServices.get(
        (successResponse) => {
          this.locations = successResponse?.Value;
          resolve(this.locations);
        }, () => {
          this.toastrFactory.error(
            this.localize.getLocalizedString('{0} failed to load.', ['Locations']),
            this.localize.getLocalizedString('Server Error')
          );
          reject();
        }
      );
    });
  }
  
  // Get user location
  getUserLocation() {
    var userLocation = JSON.parse(sessionStorage.getItem("userLocation"));
    return this.listHelper.findItemByFieldValue(this.locations, "LocationId", userLocation.id);
  };

  // Get location nameline1
  getLocationNameLine1 = function (locationId) {
    var item = this.listHelper.findItemByFieldValue(this.locations, "LocationId", locationId);
    if (item) {
      return item.NameLine1;
    } else {
      return '';
    }
  }
  dataForModal: any;
  // Get name of the person using EnteredByUserId
  getNameForTheEnteredByUserId = function (enteredByUserId) {
    var userDetails = this.listHelper.findItemByFieldValue(this.providers, "UserId", enteredByUserId);
    if (userDetails != null) {
      return userDetails.FirstName + ' ' + userDetails.LastName + (userDetails.ProfessionalDesignation ? ', ' + userDetails.ProfessionalDesignation : '');
    } else {
      return "";
    }
  };

  //Notify user, he is not authorized to access current area
  notifyNotAuthorized(authMessageKey) {
    this.toastrFactory.error(this.patSecurityService.generateMessage(authMessageKey), 'Not Authorized');
      this.$location.path(encodeURIComponent('/'));
  };

  previewPdf(claim) {
    this.isLoadingPdf = true;    
    this.viewClaimService.viewOrPreviewPdf(claim, claim.PatientName, this.enableEliminateStaleClaims)
    .pipe(
      finalize(() => { this.isLoadingPdf = false; })
    )
    .subscribe();
  };

  checkFeatureFlags() {
    this.featureFlagService.getOnce$(FuseFlag.EnableEliminateStaleClaims).subscribe(value => {
      this.enableEliminateStaleClaims = value;
    });
  }

  setupFeeScheduleFlags(serviceTran) {
    serviceTran.hasFeeScheduleWriteOff = false;
    serviceTran.hasCheckoutFeeScheduleWriteOff = false;
    if (this.encounter.ServiceTransactionDtos && serviceTran) {
      this.encounter.ServiceTransactionDtos.forEach(credTrans => {
        if (credTrans.IsFeeScheduleWriteOff) {
          var details = filter(credTrans.CreditTransactionDetails, function (detail) {
            return !detail.IsDeleted;
          });
          if (details && details.length === 1 && details[0].AppliedToServiceTransationId === serviceTran.ServiceTransactionId) {
            serviceTran.hasFeeScheduleWriteOff = true;
            if (credTrans.IsCollectedAtCheckOut) {
              serviceTran.hasCheckoutFeeScheduleWriteOff = true;
            }
          }
        }
      });
    }
  };
  closeDropDown() {
    //this is a hack because bootstrap dropdown doesn't close when you click one of the options
    $('body').trigger('click');
  };

  openClaimNotes(claimSubmissionResultsDto) {
    this.closeDropDown();
    this.accountNoteFactory.openClaimNoteModal(claimSubmissionResultsDto, this.encounter.PersonId, this.encounter.LocationId, this.refreshPageDataForGrid);
  }

  closePopOver() {
    this.showTemplate = false;
  }
  
  priorityLabel(priority) {
    switch (priority) {
      case 0: return 'Primary'
        break;
      case 1: return 'Secondary'
        break;

      case 2: return '3rd'
        break;

      case 3: return '4th'
        break;

      case 4: return '5th'
        break;

      case 5: return '6th'
        break;
    }
  }
}
