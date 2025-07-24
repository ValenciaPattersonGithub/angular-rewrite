import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Inject,
} from "@angular/core";
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from "@angular/platform-browser";
import { finalize } from "rxjs/operators";
import { FuseFlag } from "src/@core/feature-flags";
import { ViewClaimService } from "src/@shared/providers/view-claim.service";
import { FeatureFlagService } from "src/featureflag/featureflag.service";

@Component({
  selector: 'patient-account-summary-grid',
  templateUrl: './patient-account-summary-grid.component.html',
  styleUrls: ['./patient-account-summary-grid.component.scss']
})
export class PatientAccountSummaryGridComponent implements OnInit {
  //encounter amfas
  soarAuthEnctrAddKey = 'soar-acct-enctr-add';
  soarAuthEnctrChkOutKey = 'soar-acct-enctr-chkout';
  soarAuthEnctrEditKey = 'soar-acct-enctr-edit';
  soarAuthEnctrDeleteKey = 'soar-acct-enctr-delete';
  soarAuthActPmtDeleteKey='soar-acct-aapmt-delete';
  soarAuthCdtAdjDeleteKey='soar-acct-cdtadj-delete';
  quiz_id: number;
  loggedInLocationId: number;

  constructor(
    @Inject('AccountSummaryFactory') private accountSummaryFactory,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('AccountServiceTransactionFactory') private accountServiceTransactionFactory,
    @Inject('AccountDebitTransactionFactory') private accountDebitTransactionFactory,
    @Inject('AccountSummaryDeleteFactory') private accountSummaryDeleteFactory,
    @Inject("AccountNoteFactory") private accountNoteFactory,
    @Inject('CommonServices') private commonServices,
    @Inject('localize') private localize,
    @Inject('PatientServices') private patientServices,
    @Inject('ModalFactory') private modalFactory,
    @Inject('tabLauncher') private tabLauncher,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private viewClaimService: ViewClaimService,
    private featureFlagService: FeatureFlagService,
  ) {
    this.matIconRegistry.addSvgIcon(
      'assignment',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../v1.0/images/assignment.svg'
      )
    );
    
   }
    
  showTemplate = false;
  isClaimsMenuOpen = false;
  parentindex = 0;
  childindex = 0;
  @Input() patient: any;
  @Input() locations: any;
  @Input() pendingEncounters: any;
  @Input() rows: any;
  @Input() currentPatientId: any;
  @Output() refreshDataTx = new EventEmitter<any>();
  @Output() editAccountSummaryRowDetail = new EventEmitter<any>();
  @Output() deleteInsurancePayment = new EventEmitter<any>();
  @Output() editAcctPaymentOrNegAdjustmentModal = new EventEmitter<any>();
  @Output() deleteAcctPaymentOrNegAdjustmentModal = new EventEmitter<any>();
  @Output() applyPayment = new EventEmitter<any>();
  @Output() applyAdjustment = new EventEmitter<any>();
  @Output() createClaim = new EventEmitter<any>();
  @Output() viewAccountNote = new EventEmitter<any>();
  @Output() editAccountNote = new EventEmitter<any>();
  @Output() deleteAccountNote = new EventEmitter<any>();
  @Output() viewEob = new EventEmitter<any>();
  @Output() viewInvoice = new EventEmitter<any>();
  @Output() createCurrentInvoice = new EventEmitter<any>();


  hasSoarAuthEnctrEditKey=false;
  hasSoarAuthEnctrDeleteKey=false;
  hasSoarAuthEnctrChkOutKey=false;
  hasSoarAuthSvcTrViewKey=false;
  hasSoarAuthSrvTrDeleteKey=false;
  hasSoarAuthDbtTrxEditKey=false;
  hasSoarAuthDbtTrxDeleteKey=false;
  hasSoarAuthInsPmtDeleteKey=false;
  hasSoarAuthActPmtEditKey=false;
  hasSoarAuthCdtAdjEditKey=false;
  hasSoarAuthActPmtDeleteKey=false;
  hasSoarAuthCdtAdjDeleteKey=false;
  hasSoarAuthActPmtAddKey=false;
  hasSoarAuthCdtAdjAddKey=false;
  hasSoarPerViewNoteKey=false;
  hasSoarPerEditNoteKey=false;
  hasSoarPerDeleteNoteKey=false;
  hasSoarViewEOBKey=false;

  multiLocationEncounterTooltip = this.localize.getLocalizedString('Your {0} has {1}s spanning multiple {1} {2}s. Please delete your {0} and create a new one so that all {1}s are assigned to the same {2}.', ['encounter', 'service', 'location']);
  noDeleteAccessTooltipMessage = this.localize.getLocalizedString('You do not have permission to Delete {0}s at the service location.', ['encounter']);

  isPopoverOpen = false;
  patientDet: any;
  IsServiceLocationMatch:boolean=false;
  cachedLocation:any;
  plans = [];
  isLoadingPdf: boolean = false;
  enableEliminateStaleClaims: boolean = false;
  ngOnInit(): void {
    // Get location ID of logged in User
    var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    if (cachedLocation) {
      this.loggedInLocationId = cachedLocation.id;
    }
    this.patientDet = this.patient.Data.PersonAccount;
    this.patientServices.PatientBenefitPlan.getPatientBenefitPlansByAccountId({ accountId: this.patient.Data.PersonAccount.AccountId }).$promise
      .then((res)=> this.setPlans(res) );
    this.authAccess();
    this.checkFeatureFlags();
  }

  setPlans(res) {
    this.plans = res.Value;
  }

  authAccess = () => {
  this.hasSoarAuthEnctrEditKey=this.authAccessByType("soar-acct-enctr-edit");
  this.hasSoarAuthEnctrDeleteKey=this.authAccessByType("soar-acct-enctr-delete");
  this.hasSoarAuthEnctrChkOutKey=this.authAccessByType("soar-acct-enctr-chkout");
  this.hasSoarAuthSvcTrViewKey=this.authAccessByType("soar-acct-actsrv-view");
  this.hasSoarAuthSrvTrDeleteKey=this.authAccessByType("soar-acct-actsrv-delete");
  this.hasSoarAuthDbtTrxEditKey=this.authAccessByType("soar-acct-dbttrx-edit");;
  this.hasSoarAuthDbtTrxDeleteKey=this.authAccessByType("soar-acct-dbttrx-delete");
  this.hasSoarAuthInsPmtDeleteKey=this.authAccessByType("soar-acct-aipmt-delete");
  this.hasSoarAuthActPmtEditKey=this.authAccessByType("soar-acct-aapmt-edit");
  this.hasSoarAuthCdtAdjEditKey=this.authAccessByType("soar-acct-cdtadj-edit");
  this.hasSoarAuthActPmtDeleteKey=this.authAccessByType("soar-acct-aapmt-delete");
  this.hasSoarAuthCdtAdjDeleteKey=this.authAccessByType("soar-acct-cdtadj-delete");
  this.hasSoarAuthActPmtAddKey=this.authAccessByType("soar-acct-aapmt-add");
  this.hasSoarAuthCdtAdjAddKey=this.authAccessByType("soar-acct-cdtadj-add");
  this.hasSoarPerViewNoteKey=this.authAccessByType("soar-per-acnote-view");
  this.hasSoarPerEditNoteKey=this.authAccessByType("soar-per-acnote-edit");
  this.hasSoarPerDeleteNoteKey=this.authAccessByType("soar-per-acnote-delete");
  this.hasSoarViewEOBKey=this.authAccessByType("soar-acct-aipmt-view");
  }

  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
}

  getRowDetails(row, focus) {
    // $timeout(function () {
    //     isPopoverOpen = false;
    // });
    if (!row.retrieved && row.ObjectType !== 'PersonAccountNote') {
      this.accountSummaryFactory.getEncounterDetails(row, this.patient.Data.PersonAccount.AccountId, this.plans, this.locations);
    }
    row.showDetail = !row.showDetail;
    // if (focus) {
    //     $timeout(function () {
    //         angular.element('#row' + row.ObjectId)[0].scrollIntoView(true);
    //         $window.scrollBy(0, -100); // Offset to get row header out from under app header
    //     });
    // }
  };

  toggleClaimsView($event, index, rowIndex) {
    this.parentindex = rowIndex;
    this.childindex = index;
    this.showTemplate = true;
    $event.stopPropagation();
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

  notifyNotAuthorized = function (authMessageKey) {
    this.toastrFactory.error(this.patSecurityService.generateMessage(authMessageKey), 'Not Authorized');
    this.$location.path('/');
};

  previewPdf(claim) {
    this.isLoadingPdf = true;  
    this.viewClaimService.viewOrPreviewPdf(claim,claim.PatientName, this.enableEliminateStaleClaims)
    .pipe(
      finalize(() => { this.isLoadingPdf = false; })
    )
    .subscribe();
  };
  closeDropDown() {
    //this is a hack because bootstrap dropdown doesn't close when you click one of the options
    $('body').trigger('click');
  };
  openClaimNotes(claimSubmissionResultsDto, encounter) {
    this.closeDropDown();
    this.accountNoteFactory.openClaimNoteModal(claimSubmissionResultsDto, encounter.PersonId, encounter.LocationId, this.refreshData);
  }

  setRouteParams(row, route) {
    var routeParams = {
        patientId: this.currentPatientId,
        accountId: this.patient.Data.PersonAccount.AccountId,
        encounterId: row.ObjectId,
        route: route,
        location: row.$$locationId,
        overrideLocation: false
    };

    var currentUserLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    if (row.$$locationId == currentUserLocation.id) {
        routeParams.overrideLocation = false;
    }
    else {
        routeParams.overrideLocation = true;
    }

    return routeParams;
  };

  changeCheckoutEncounterLocation(routeParams) {
    var queryString = '';
    var locationRoute = '';
    var encounters = routeParams.encounterId === null ? '/' : `/Encounter/${routeParams.encounterId}/`;
    var checkoutEditMessage = this.localize.getLocalizedString('Your active {1} is different than this {0}\'s service {1}. When you check out or edit this {0}, your active {1} will be changed to the {0}\'s {1}. Do you wish to proceed?', ['encounter', 'location']);
    var checkoutAllMessage = this.localize.getLocalizedString('Your active {1} is different than the {0}s\' service {1}. When you check out this {0}, your active {1} will be changed to the {0}s\' {1}. Do you wish to proceed?', ['encounter', 'location']);

    //Set up route based on navigation
    if (routeParams.overrideLocation) {
        var title = this.localize.getLocalizedString("Change Location");
        var message = routeParams.encounterId === null ? checkoutAllMessage : checkoutEditMessage;
        var button1Text = this.localize.getLocalizedString("Yes");
        var button2Text = this.localize.getLocalizedString("No");

        this.modalFactory.ConfirmModal(title, message, button1Text, button2Text).then(() => {
            queryString = `activeSubTab=0${routeParams.overrideLocation === true ? `&setLocation=${routeParams.location}` : ''}`;
            let patientPath = '#/Patient/';
            locationRoute = `${patientPath}${routeParams.patientId}/Account/${routeParams.accountId}${encounters}${routeParams.route}/?${queryString}`;
            this.tabLauncher.launchNewTab(locationRoute);
        });
    } else {
        let patientPath = '#/Patient/';
        locationRoute = `${patientPath}${routeParams.patientId}/Account/${routeParams.accountId}${encounters}${routeParams.route}`;
        window.location.href = locationRoute;
    }
  }

  editEncounter(encounter) {
    if (this.hasSoarAuthEnctrEditKey){
      var routeParams = this.setRouteParams(encounter, 'EncountersCart/AccountSummary');
      this.changeCheckoutEncounterLocation(routeParams);
    } else {
      this.notifyNotAuthorized(this.soarAuthEnctrEditKey);
    }
  }

  deleteAccountSummaryRowDetail(accountSummaryRow, accountSummaryRowDetail) {
    var currentUserLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    if (accountSummaryRowDetail && accountSummaryRowDetail.ObjectType == 'ServiceTransaction') {
        this.accountServiceTransactionFactory.deleteServiceTransaction(accountSummaryRowDetail.ObjectId, accountSummaryRowDetail.LocationId, accountSummaryRow.PersonId, this.refreshData, accountSummaryRowDetail.Claims);
    } else if (accountSummaryRow.ObjectType == 'DebitTransaction' && accountSummaryRowDetail.ObjectType == 'DebitTransaction' && accountSummaryRowDetail.TransactionTypeId == 5) {
      this.accountDebitTransactionFactory.deleteDebit(accountSummaryRowDetail.ObjectId, accountSummaryRowDetail.TransactionTypeId, this.refreshData);
    } else {
      this.accountSummaryDeleteFactory.deleteAccountSummaryRowDetail(accountSummaryRow, accountSummaryRowDetail, this.refreshData, currentUserLocation.id);
    }
  }

  checkoutPendingEncounter(encounter, index) {
    if (this.patSecurityService.IsAuthorizedByAbbreviation(this.soarAuthEnctrChkOutKey)) {
      var routeParams = this.setRouteParams(encounter, 'Checkout/AccountSummary');
      this.changeCheckoutEncounterLocation(routeParams);
    } else {
      //  ctrl.notifyNotAuthorized(this.soarAuthEnctrChkOutKey);
    }
  }
 
  refreshData=(event:any)=> {
    this.refreshDataTx.emit(event);
  }

  editRowDetail(row, item) {
    var detail = { accountSummaryRow: {}, accountSummaryRowDetail: {}};
    detail.accountSummaryRow = row;
    detail.accountSummaryRowDetail = item;
    this.editAccountSummaryRowDetail.emit(detail);
  }

  deleteInsPayment(item) {
    this.deleteInsurancePayment.emit(item)
  }

  editacctPayorNegAdj(item) {
    this.editAcctPaymentOrNegAdjustmentModal.emit(item);
  }
  deleteacctPayorNegAdj(item) {
    this.deleteAcctPaymentOrNegAdjustmentModal.emit(item);
  }

  vieweob(item, row) {
    var detail = { item: {}, row: {}};
    detail.item = item;
    detail.row = row;
    this.viewEob.emit(detail);
  }

  deleteAcctNote(row) {
    this.deleteAccountNote.emit(row);
  }

  editAcctNote(row) {
    this.editAccountNote.emit(row);
  }

  viewAcctNote(row) {
    this.viewAccountNote.emit(row);
  }

  createClm(row) {
    this.createClaim.emit(row);
  }

  applyPaymnt(row) {
    this.applyPayment.emit(row);
  }

  applyAdj(row) {
    this.applyAdjustment.emit(row);
  }

  viewInv(row) {
    this.viewInvoice.emit(row);
  }

  createCurrentInv(row) {
    this.createCurrentInvoice.emit(row);
  }

  checkFeatureFlags() {
      this.featureFlagService.getOnce$(FuseFlag.EnableEliminateStaleClaims).subscribe(value => {
        this.enableEliminateStaleClaims = value;
      });
    }  
  
}
