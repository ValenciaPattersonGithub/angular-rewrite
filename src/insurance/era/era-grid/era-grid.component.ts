import { Component, Input, OnInit, Inject, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PdfService } from 'src/@shared/providers/pdf.service';
import { TranslateService } from '@ngx-translate/core';
import { ClaimStatusTextPipe } from 'src/@shared/pipes/claims/claim-status-text.pipe';
import { EraHeaderSortColumn, RequestEraArgs, SoarEraHttpService } from 'src/@core/http-services/soar-era-http.service';
import { EraHeaderDto, EraClaimPaymentDto } from 'src/@core/models/era/soar-era-dtos.model';
import { ClaimStatus } from 'src/@core/models/claim/claim-enums.model';

declare let _: any;

@Component({
    selector: 'app-era-grid',
    templateUrl: './era-grid.component.html',
    styleUrls: ['./era-grid.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EraGridComponent implements OnInit {
    private HeaderPageSize = 300; // # of records to load at a time
    private _filteredLocations: number[] = [];
    private _filterOption = { Description: 'Not Completed', IsProcessed: false };

    @Input()
    set filteredLocations(locations: number[]) {
        if (locations) {
            this._filteredLocations = locations;
            if (this._filteredLocations.length < 1) {
                this.eras = [];
                this.viewShowMoreButton = false;
                this.cd.detectChanges();
            }
            else {
                this.loadFirstPageEras();
            }
        }
    }
    get filteredLocations() {
        return this._filteredLocations;
    }

    @Input()
    set filterOption(option: { Description: string, IsProcessed: any }) {
        this._filterOption = option;
        if (this._filteredLocations.length > 0) {
            this.loadFirstPageEras();
        }
    }
    get filterOption() {
        return this._filterOption;
    }

    @Input() allLocations: any;
    @Input() allowedLocations: any[];
    @Input() insurancePaymentTypes: any[];
    @Input() loggedInLocation: any = { id: 0, name: '', status: '' };

    firstPageLoading = false;
    allErasLoaded = false; // true if the user has loaded all ERAs that match the filter
    loadingMore = false;
    viewShowMoreButton = false;

    eras: EraHeaderDto[] = [];
    claimStatusPipe: ClaimStatusTextPipe = new ClaimStatusTextPipe();
    eraHeaderSortColumn: typeof EraHeaderSortColumn = EraHeaderSortColumn;
    eraOrder = {
        sortColumn: EraHeaderSortColumn.PayDate,
        ascending: true
    };
    menuItemAccessKeys = {
        applyBulkPayment: 'soar-acct-aipmt-add'
    };

    constructor(
        @Inject('windowObject') private window: Window,//inject window so it can be mocked
        @Inject('CommonServices') private commonServices: any,
        @Inject('locationService') private locationService: any, //Platform
        @Inject('patSecurityService') private patSecurityService,
        @Inject('tabLauncher') private tabLauncher: any,
        @Inject('ModalFactory') private modalFactory,
        private pdfService: PdfService,
        private eraService: SoarEraHttpService,
        private cd: ChangeDetectorRef,
        private translate: TranslateService
    ) {

        // If you don't do this + manual detectChanges() calls in this component, then every (click) event in an a child component
        // (like the elipsis menus) will trigger a full change detection from the top component on-down, even through ChangeDetectionStrategy.OnPush
        // components.  This means as soon you have ~1000 items in the list (or 10x worse for 10k!), the UI will be crazy sluggish
        // even opening the elipsis menus.
        // Read: https://jackthenomad.com/mastering-the-angular-performance-by-dropping-the-magic-of-change-detector-2b605b444b04
        this.cd.detach();
    }

    ngOnInit() {
        this.cd.detectChanges(); // Initial bindings
    }

    expandEra(era: EraHeaderDto) {

        era.expanded = !era.expanded;
        this.cd.detectChanges();
    }

    eraTrackById(index: number, item: EraHeaderDto) {
        return item.EraHeaderId;
    }

    //move into service when available, use observables/service instead
    processEras(eras: EraHeaderDto[]): EraHeaderDto[] {
        const getLocationTooltip = (loc: string[]) => this.translate.instant('You do not have access to submit payments for location(s) {{0}}. For help please contact your system administrator.', { 0: _.join(_.uniq(loc), ',') });
        const noBulkPaymentAddAccess = !this.patSecurityService.IsAuthorizedByAbbreviation(this.menuItemAccessKeys.applyBulkPayment)

        for (const era of eras) {
            const type = this.insurancePaymentTypes.find(i => i.CurrencyTypeId == era.CurrencyType);
            era.PaymentString = type ? type.Description : 'Other';
            era.PaymentString += era.PaymentNumber ? '/' + era.PaymentNumber : '';
            era.claimOrder = { sortColumnName: 'patientName', sortDirection: 1 };
            let disabledText: string | undefined;
            if (noBulkPaymentAddAccess) {
                disabledText = this.patSecurityService.generateMessage(this.menuItemAccessKeys.applyBulkPayment);
            } else if (era.ContainsAllPredeterminations && !era.IsProcessed) {
                disabledText = 'Cannot apply payment on a predetermination ERA';
            }
            era.items = [
                {
                    label: 'View ERA',
                    click: 'viewEra',
                },
                {
                    label: 'Apply Bulk Payment',
                    click: 'bulkPayment',
                    disabled: noBulkPaymentAddAccess || era.IsProcessed || era.ContainsAllPredeterminations,
                    disabledText
                },
            ];
            if (!era.IsAssociatedWithBulk || !era.IsProcessed) {
                era.items.push({
                    label: era.IsProcessed ? 'Mark As Not Completed' : 'Mark As Completed',
                    click: era.IsProcessed ? 'uncompleteEraAndReload' : 'completeEraAndReload',
                });
            }

            era.Paid = era.EraClaimPayments.reduce((total, claim) => total + claim.Amount, 0);

            for (const claim of era.EraClaimPayments) {
                // This would be false if the user doesn't have permissions to the location of the claim
                claim.inAllowedLocation = !claim.Matched || this.allowedLocations.filter(l => l.LocationId === claim.LocationId).length > 0;
                claim.location = this.allLocations[claim.LocationId];
                claim.patientName = claim.Matched ? (claim.PatientFirstName || '') + ' ' + (claim.PatientLastName || '')
                    : (claim.EraPatientFirst || '') + ' ' + (claim.EraPatientMiddle || '') + ' ' + (claim.EraPatientLast || '');

                claim.ClaimStatusText = claim.Matched ? this.claimStatusPipe.transform(claim.ClaimStatus) : 'Unmatched';
                claim.items = [
                    {
                        label: 'View EOB',
                        click: 'viewEob',
                    }
                ];

                if (claim.Matched) {
                    claim.items.push(
                        {
                            label: 'View Claim',
                            click: 'viewClaim',
                        });
                }
            }
            era.EraClaimPayments = this.orderBy(era.EraClaimPayments, era.claimOrder.sortColumnName, era.claimOrder.sortDirection, 'patientName');

            // If the user is not authorized to all locations in the ERA, they should not be allowed to interact with the ERA
            const claimsNoAccess: EraClaimPaymentDto[] = _.filter(era.EraClaimPayments, claim => !claim.inAllowedLocation);
            if (claimsNoAccess.length) {
                // User location access to each ERA
                era.canView = false;
                era.tooltip = getLocationTooltip(_.map(claimsNoAccess, (claim: EraClaimPaymentDto) => claim.location));
                era.items = []; // remove menu items
            }
            else {
                era.canView = true;
            }
        }

        return eras;
    }

    // Load only the first page of ERA headers, given the current filter / sort order
    loadFirstPageEras(): void {

        const eraArgs: RequestEraArgs = {
            isProcessed: this.filterOption.IsProcessed,
            selectedLocations: this.filteredLocations,
            sortOn: this.eraOrder.sortColumn,
            skip: 0,
            take: this.HeaderPageSize,
            ascending: this.eraOrder.ascending
        };

        this.eras = [];
        this.firstPageLoading = true;
        this.cd.detectChanges();
        this.eraService.requestEraList(eraArgs).subscribe(eraList => {
            this.eras = this.processEras(eraList.Value);
            this.firstPageLoading = false;
            this.viewShowMoreButton = eraList.Value.length === this.HeaderPageSize;
            this.allErasLoaded = this.eras.length < this.HeaderPageSize;
            this.cd.detectChanges();
        });
    }

    @HostListener("window:scroll", [])
    onScroll(): void {

        // Load more upon scroll to bottom, only if all other conditions are met first
        if (!this.viewShowMoreButton &&
            !this.loadingMore &&
            !this.allErasLoaded) {

            // https://stackoverflow.com/questions/55419779/check-if-a-user-has-scrolled-to-the-bottom-in-subpixel-precision-era
            const elem = document.documentElement;
            const rest = elem.scrollHeight - elem.scrollTop;
            if (Math.abs(elem.clientHeight - rest) < 1) {
                this.showMoreResults();
            }
        }
    }

    @HostListener('document:visibilitychange', [])
    appVisibility(): void {
        if (!document.hidden && localStorage.getItem('eraPaymentApplied')) {
            localStorage.removeItem('eraPaymentApplied');
            this.loadFirstPageEras();
        }
    }

    showMoreResults(): void {

        const eraArgs: RequestEraArgs = {
            isProcessed: this.filterOption.IsProcessed,
            selectedLocations: this.filteredLocations,
            sortOn: this.eraOrder.sortColumn,
            skip: this.eras.length,
            take: this.HeaderPageSize,
            ascending: this.eraOrder.ascending
        };

        this.viewShowMoreButton = false;
        this.loadingMore = true;
        this.cd.detectChanges();
        this.eraService.requestEraList(eraArgs).subscribe(eraList => {
            const newEras = this.processEras(eraList.Value);
            this.allErasLoaded = newEras.length < this.HeaderPageSize;
            this.loadingMore = false;
            this.eras.push(...newEras);
            this.cd.detectChanges();
        });
    }

    orderEra(column: EraHeaderSortColumn) {
        if (this.eraOrder.sortColumn !== column)
            this.eraOrder = { sortColumn: column, ascending: true };
        else
            this.eraOrder.ascending = !this.eraOrder.ascending;

        this.loadFirstPageEras();
    }

    orderEraClaims(order, era) {
        if (era.claimOrder.sortColumnName !== order)
            era.claimOrder = { sortColumnName: order, sortDirection: 1 };
        else
            era.claimOrder.sortDirection = era.claimOrder.sortDirection * -1;
        era.EraClaimPayments = this.orderBy(era.EraClaimPayments, era.claimOrder.sortColumnName, era.claimOrder.sortDirection, 'patientName');
        this.cd.detectChanges();
    }

    orderBy(list: any[], field: any, direction: number, secondaryField: string) {
        return list.sort((first, second) => {
            const a = typeof (first[field]) === 'string' ? first[field].toLowerCase() : first[field];
            const b = typeof (first[field]) === 'string' ? second[field].toLowerCase() : second[field];
            if (a > b) return 1 * direction;
            if (a < b) return -1 * direction;
            const a2 = first[secondaryField].toLowerCase();
            const b2 = second[secondaryField].toLowerCase();
            if (a2 > b2) return 1;
            if (a2 < b2) return -1;
            return 0;
        });
    }

    call(i) {
        this[i.func](i.ref);
    }

    completeEraAndReload(era: EraHeaderDto): void {
        this.eraService.toggleIsProcessed({ eraId: era.EraHeaderId, isProcessed: true }).subscribe(() => {
            this.loadFirstPageEras();
        });
    }

    uncompleteEraAndReload(era: EraHeaderDto): void {
        this.eraService.toggleIsProcessed({ eraId: era.EraHeaderId, isProcessed: false }).subscribe(() => {
            this.loadFirstPageEras();
        });
    }

    viewEra(era, claim) {
        const claimSection = claim ? '/Claim/' + claim.ClaimCommonId : '';
        const carrierSection = '?carrier=' + era.CarrierName;
        const patientSection = claim ? '&patient=' + claim.PatientCode : '';
        this.tabLauncher.launchNewTab(`#/BusinessCenter/Insurance/ERA/${era.TransactionSetHeaderId}${claimSection}${carrierSection}${patientSection}`);
    }

    viewEob(claim) {
        const era = this.eras.find(x => x.EraHeaderId === claim.EraHeaderId);
        this.viewEra(era, claim);
    }

    viewClaim(claim) {
        //move into service when http available, use observables instead
        this.commonServices.Insurance.ClaimPdf(`_soarapi_/insurance/claims/pdf?claimCommondId=${claim.ClaimId}`).then((res) => {
            this.pdfService.viewPdfInNewWindow(res.data, `View Claim for ${claim.patientName}`, claim.patientName);
        });
    }

    bulkPayment(era) {

        //Check if some of the claims are closed

        const closedClaims = era.EraClaimPayments.filter(x => x.ClaimStatus === ClaimStatus.Closed || x.ClaimStatus === ClaimStatus.Paid);

        if (closedClaims.length > 0) {

            let message = `${closedClaims.length} of ${era.EraClaimPayments.length} claim(s) are already closed and will not show on Apply payment screen.
                Total paid amount will be adjusted for open claims`;
            let title = this.translate.instant('Apply Bulk Payment');
            let continueButtonText = this.translate.instant('Continue');
            let cancelButtonText = this.translate.instant('Cancel');
            this.modalFactory.ConfirmModal(title, message, continueButtonText, cancelButtonText)
                .then(() => this.openBulkPayment(era));
        }
        else {
            this.openBulkPayment(era);
        }
    }

    openBulkPayment(era) {
            this.tabLauncher.launchNewTab('#/BusinessCenter/Insurance/BulkPayment/' + era.EraHeaderId);
    }

    ngOnDestroy() {
        
    }
}