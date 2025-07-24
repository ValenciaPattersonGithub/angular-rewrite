import { Component, OnInit, Input, Inject, SimpleChanges } from '@angular/core';
import { OrderByPipe } from 'src/@shared/pipes';
import isNumber from 'lodash/isNumber'
import { Location } from 'src/business-center/practice-settings/location';
import { PaymentProvider, PaymentProviderLabels } from '../../../@shared/enum/accounting/payment-provider';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { FuseFlag } from '../../../@core/feature-flags/fuse-flag';
import { ClaimEnumService, IPlaceOfTreatment } from 'src/@core/data-services/claim-enum.service';

@Component({
    selector: 'view-location',
    templateUrl: './view-location.component.html',
    styleUrls: ['./view-location.component.scss']
})
export class ViewLocationComponent implements OnInit {

    @Input() selectedLocation: Location;
    @Input() locations;
    @Input() hasTreatmentRoomsViewAccess = false;
    @Input() hasAdditionalIdentifierViewAccess = false;
    @Input() isEstatementsEnabled = false;
    @Input() additionalIdentifiers = [];
    @Input() taxonomyCodesSpecialties: { Category: string, TaxonomyCodeId: number, Code: string }[] = [];
    taxonomyCodeSpeciality;
    paymentProviders: { Text: string, Value: number }[] = [];
    showPaymentProvider = false;
    placeOfTreatmentList: IPlaceOfTreatment[] = [];
    placeOfTreatmentDescription: string;
    FAKE_MASK_ACCOUNT_CREDENTIALS="zzzzzzzzzz";

    constructor(@Inject('LocationServices') private locationServices,
        @Inject('toastrFactory') private toastrFactory,
        private featureFlagService: FeatureFlagService,
        private claimPlaceOfTreatmentService: ClaimEnumService
    ) {
        this.placeOfTreatmentList = this.claimPlaceOfTreatmentService.getPlaceOfTreatment();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes?.selectedLocation && changes?.selectedLocation?.currentValue) {
            this.getRoomsByLocation();
            if (this.selectedLocation?.TaxonomyId) {
                this.displayTaxonomyCodeByField();
            }
            this.setDefaultValues();
            this.placeOfTreatmentDescription = this.placeOfTreatmentList.find(x => x.code == this.selectedLocation.PlaceOfTreatment)?.description;
            if( this.selectedLocation?.PaymentProvider === PaymentProvider.TransactionsUI){
                this.selectedLocation.PaymentProviderAccountCredential = this.FAKE_MASK_ACCOUNT_CREDENTIALS;
            }
        }
    }

    ngOnInit() {
        this.checkFeatureFlags();    
        this.mapPaymentProvider();
    }
    
    checkFeatureFlags() {
        this.featureFlagService.getOnce$(FuseFlag.UsePaymentService).subscribe((value) => {
            this.showPaymentProvider = value;
        })
    }
    mapPaymentProvider() {
        this.paymentProviders = Object.keys(PaymentProviderLabels).map(key => ({ Text: PaymentProviderLabels[key], Value: +key }));
    }

    getRoomsByLocation = () => {
        if (this.selectedLocation && this.selectedLocation?.LocationId && this.hasTreatmentRoomsViewAccess) {
            const orderPipe = new OrderByPipe();

            this.locationServices.getRooms({ Id: this.selectedLocation?.LocationId }, (res) => {
                const rooms = orderPipe.transform(res?.Value, { sortColumnName: 'Name', sortDirection: 1 });

                /** update rooms */
                this.selectedLocation.Rooms = rooms;

            }, () => {
                this.toastrFactory.error({ Text: 'Failed to retrieve the {0} for {1}.', Params: ['treatment rooms', 'location'] }, 'Error');
            });
        }
    }

    displayTaxonomyCodeByField = () => {
        const result = this.taxonomyCodesSpecialties.filter((taxonomyData) => taxonomyData.TaxonomyCodeId === this.selectedLocation.TaxonomyId)[0];

        this.taxonomyCodeSpeciality = result ? `${result['Code']} / ${result['Category']}` : '';
    }

    setDefaultValues = () => {
        // conversion from decimal to percentage for view
        if (isNumber(this.selectedLocation?.ProviderTaxRate) && this.selectedLocation?.ProviderTaxRate <= 1) {
            let provtaxRate = this.selectedLocation?.ProviderTaxRate * 100;
            provtaxRate = +provtaxRate?.toFixed(3);
            this.selectedLocation.ProviderTaxRate = provtaxRate;
        }
        if (isNumber(this.selectedLocation?.SalesAndUseTaxRate) && this.selectedLocation?.SalesAndUseTaxRate <= 1) {
            let salestaxRate = this.selectedLocation?.SalesAndUseTaxRate * 100;
            salestaxRate = +salestaxRate?.toFixed(3);
            this.selectedLocation.SalesAndUseTaxRate = salestaxRate;
        }
    }
}