import { Component, Inject, OnChanges, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import moment from 'moment';
import { StateList } from 'src/business-center/practice-settings/location';
import { LocationDataService } from 'src/business-center/practice-settings/service/location-data.service';
import { Location } from 'src/business-center/practice-settings/location';

@Component({
	selector: 'location-search',
	templateUrl: './location-search.component.html',
	styleUrls: ['./location-search.component.scss']
})
export class LocationSearchComponent implements OnChanges {

	@Input() hasChanges = false;
	@Input() selectedLocation: Location;
	@Input() locations: Location[] = [];
	@Output() selectedLocationChange = new EventEmitter<Location>();
	loading = true;
	filter = '';
	selectedLocationId: number;
	hasViewAccess = false;
	stateList: StateList[] = [];

	constructor(
		@Inject('patSecurityService') private patSecurityService,
		@Inject('LocationServices') private locationServices,
		@Inject('$routeParams') routeParams,
		@Inject('toastrFactory') private toastrFactory,
		@Inject('$location') private $location,
		@Inject('localize') private localize,
		@Inject('ModalFactory') private modalFactory,
		@Inject('StaticData') private staticData,
		private locationData: LocationDataService
	) {
		/** quick link to a location that was sent from another page*/
		this.selectedLocationId = routeParams.locationId;
		this.authAccess();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.selectedLocation) {
			const nv = changes?.selectedLocation?.currentValue;
			const ov = changes?.selectedLocation?.previousValue;
			this.watchSelectedLocationChange(nv, ov);
		}

		if (changes.locations) {
			this.locations = changes?.locations?.currentValue;
			this.locations[0] && this.locationsGetSuccess();
		}
	}

	//#region Authorization
	authViewAccess = () => {
		this.hasViewAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizloc-view');
	}

	authAccess = () => {
		this.authViewAccess();
		if (!this.hasViewAccess) {
			this.toastrFactory.error(this.patSecurityService.generateMessage('soar-biz-bizloc-view'), 'Not Authorized');
			this.$location.path('/');
		}
	}
	//#endregion

	//#region After getting locations from location landing component
	locationsGetSuccess = () => {
		let index = 0;
		this.loading = false;

		this.getStateList();

		if (this.selectedLocationId) {
			index = this.selectedLocationId > -1 ? this.locations?.findIndex((location) => location['LocationId'] == this.selectedLocationId) : this.selectedLocationId;
		}

		this.selectedLocation = index >= 0 && this.locations?.length > 0 ? this.locations[index] : null;
	}
	//#endregion

	setStateName = () => {
		this.locations?.forEach((location) => {
			if (location?.State) {
				location.StateName = '';
				const state = this.stateList?.filter(state => state?.Abbreviation === location?.State);
				if (state[0]) {
					location.StateName = state[0]?.Name;
				}
			}
		});
	}

	watchSelectedLocationChange = (nv, ov) => {
		if (ov && ov?.LocationId == null && nv && nv != ov) {
			/** if user cancels out of add location we need to add active class to default location */
			this.changeLocationUrl(nv?.LocationId);
		}
		else if (nv && nv?.LocationId && nv?.LocationId == this.selectedLocation?.LocationId) {
			this.changeLocationUrl(nv?.LocationId);
		}
	}

	selectLocation = (location) => {
		if (this.hasChanges) {
			this.modalFactory?.CancelModal()?.then(() => {
				this.confirmCancel(location);
			});
		} else {
			this.confirmCancel(location);
		}
	}

	confirmCancel = (location) => {
		this.selectedLocation = location;
		this.selectedLocationChange?.emit(this.selectedLocation);
		// Send update locationId
		this.locationData?.changeLocationId(this.selectedLocation?.LocationId?.valueOf());

		if (this.selectedLocation) {
			//this.selectedLocation.Timezone = 'Central Standard Time';
		}
		this.changeLocationUrl(location?.LocationId);
	}

	changeLocationUrl = (locationId) => {
		window.location.href = '#/BusinessCenter/PracticeSettings/Locations/' + '?locationId=' + encodeURIComponent(locationId);
	}

	getStateList = () => {
		this.staticData?.States()?.then(res => {
			this.stateList = res?.Value;
			// set the user department Name based on id
			this.setStateName();
		});

	}

	locationOnChange = (nv, ov) => {
		if (nv && nv != ov) {
			this.setStateName();
		}
	}
	//#endregion

	checkLocationStatus = (item) => {
		let isLocActive = false;

		if (item?.DeactivationTimeUtc) {
			isLocActive = true;

			const dateNow = moment()?.format('MM/DD/YYYY');
			const toCheck = moment(item?.DeactivationTimeUtc)?.format('MM/DD/YYYY');

			if (moment(toCheck)?.isBefore(dateNow) || moment(toCheck)?.isSame(dateNow)) {
				item.StatusDisplay = 'Inactive as of ' + toCheck;
				item.IsPendingInactive = false;
			} else {
				item.StatusDisplay = 'Pending Inactive on ' + toCheck;
				item.IsPendingInactive = true;
			}
		}

		return isLocActive;
	}

	getTitle = (item) => {
		const nameLine1 = item?.NameLine1;
		const nameLine2 = item?.NameLine2;
		const title: string = nameLine2 ? `${String(nameLine1)}${' '}${String(nameLine2)}` : item?.NameLine1;
		return title;
	}

}
