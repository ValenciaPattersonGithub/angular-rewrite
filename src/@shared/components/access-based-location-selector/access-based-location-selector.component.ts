import { Component, EventEmitter, Inject, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { SoarLocationHttpService } from 'src/@core/http-services/soar-location-http.service';
import { LocationDto } from 'src/@core/models/location/location-dto.model';

@Component({
    selector: 'access-based-location-selector',
    templateUrl: './access-based-location-selector.component.html',
    styleUrls: ['./access-based-location-selector.component.scss']
})
export class AccessBasedLocationSelectorComponent implements OnInit {
    
    constructor(
        private locationService: SoarLocationHttpService,
        private cd: ChangeDetectorRef,
        @Inject('AmfaInfo') private amfaInfo,
    ) { }

    @Input() id: string;
    @Input() expanded: boolean = false;
    @Input() showActiveOnly?: boolean = true;
    @Input() disabled: boolean = false;
    @Input() amfaAccess: any;
    @Input()
    set selectedLocationIds(value: number[]) {
        this._selectedLocationIds = value;

        if(this.permittenLocationsPromise) {
            Promise.all([this.permittenLocationsPromise]).then(() => {
                this.assignSelectedLocations(this.locationList);
            });
        }
    };
    @Output() selectedLocations:  any = [];
    @Output() selectedValueChanged: EventEmitter<any> = new EventEmitter<any>();
    
    allPermittedLocations: LocationDto [] = [];
    permittenLocationsPromise: Promise<void> = null;
    locationList: any[] = [];
    _selectedLocationIds: number[] = [];

    ngOnInit(): void {        
        this.requestPermittedLocations();
    }

    requestPermittedLocations(){
        this.permittenLocationsPromise = new Promise<void>((resolve, reject) => {
            const getActionId = this.amfaInfo[this.amfaAccess].ActionId;
            this.locationService.requestPermittedLocations({ actionId: getActionId }).subscribe(locations => {
                this.allPermittedLocations = locations.Value;
                this.locationList = this.buildLocationList();               
                resolve();
            });
        });
    }

    buildLocationList(): any[] { 
        if (this.showActiveOnly){
            this.allPermittedLocations = this.allPermittedLocations.filter(x => x.DeactivationTimeUtc === null)
        }
        let locationList = this.allPermittedLocations.filter(location => location).map(location => {
            return {
                text: location.NameLine1,
                value: location.LocationId,
                IsDisabled: false,
                subcategory: location.DeactivationTimeUtc ? 'Inactive' : 'Active'
            };
        });

        this.assignSelectedLocations(locationList);

        return locationList;
    }

    assignSelectedLocations(locationList) {
        this.selectedLocations.length = 0;

        if (this._selectedLocationIds && locationList) {
            this._selectedLocationIds.forEach(selected => {
                let match = locationList.find(x => x.value === selected);
                if (match) {
                    this.selectedLocations.push(match);
                }
            });
        }

        this.cd.detectChanges();

        this.onLocationChange();
    }

    onLocationChange() {
        this.selectedValueChanged.emit(this.selectedLocations);        
    } 
}
