import { Component, OnInit, Inject, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';

@Component({
  selector: 'practice-provider-selector',
  templateUrl: './practice-provider-selector.component.html',
  styleUrls: ['./practice-provider-selector.component.scss']
})
export class PracticeProviderSelectorComponent implements OnInit, OnChanges {
    @Input() onlyActive: Boolean;
    @Input() providerOnClaimsOnly: Boolean = false;
    @Input() selectedProviderId: any;
    @Output() selectedProviderIdChange = new EventEmitter();

    filteredProviderList: any[] = [];
    allProvidersList: any[] = []; 

    constructor(
        @Inject('referenceDataService') private referenceDataService)
    { }

    ngOnInit() {
        this.loadProviders();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedProviderId.firstChange == false) {
            if (!this.filteredProviderList.some((provider) => provider.UserId == this.selectedProviderId)) {
                this.selectedProviderId = null;
            }
        }
    }

    onProviderChanged(selectedProviderId) {
        if (this.selectedProviderIdChange) {
            this.selectedProviderIdChange.emit(this.selectedProviderId);
        }
    }

    addDynamicColumnsToProviders() {
        this.allProvidersList.forEach((provider) => {
            provider.Name = provider.FirstName + ' ' + provider.LastName + (provider.ProfessionalDesignation ? ', ' + provider.ProfessionalDesignation : '');
            provider.FullName = provider.FirstName + ' ' + provider.LastName;
            provider.ProviderId = provider.ProviderId > '' ? provider.ProviderId : provider.UserId;
        });
    };

    loadProviders() {
        this.allProvidersList = this.referenceDataService.get(this.referenceDataService.entityNames.users);

        this.addDynamicColumnsToProviders();

        this.filteredProviderList = this.filterProviderList(this.allProvidersList);

        this.filteredProviderList = this.sortProviderList(this.filteredProviderList);
    };

    filterByProviderOnClaimsOnly(providerList: any[]) {
        return (this.providerOnClaimsOnly === true) ?
            cloneDeep(providerList).filter(function (provider) {
                var isProviderOnClaims = provider.Locations.some(x => x.ProviderOnClaimsRelationship == 1);
                return isProviderOnClaims === true;
            }) :
            providerList;
    };

    filterProviderListForOnlyActive(providerList: any[]) {
        return (this.onlyActive === true) ?
            cloneDeep(providerList).filter(function (provider) {
                return provider.IsActive === true;
            }) :
            providerList;
    };

    filterProviderList(allProvidersList) {
        var potentialProviderList = [];
        // filter list for onlyActive
        potentialProviderList = this.filterProviderListForOnlyActive(allProvidersList);
        // filter for providerOnClaims only
        potentialProviderList = this.filterByProviderOnClaimsOnly(potentialProviderList);

        return potentialProviderList;
    };

    sortProviderList(providerList: any[]) {
        providerList.sort((providerA: any, providerB: any) => {
            if (providerA.IsActive !== providerB.IsActive) {
                return providerA.IsActive === true ? -1 : 1;
            }
            return providerA.LastName.localeCompare(providerB.LastName);
        });
        return providerList;
    }
}
