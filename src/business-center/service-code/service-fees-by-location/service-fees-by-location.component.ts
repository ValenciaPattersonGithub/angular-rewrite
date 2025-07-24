import { NgTemplateOutlet } from '@angular/common';
import { AfterContentInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TemplateRef } from '@angular/core';
import {
  Component,
  Inject,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { ServiceCodeModel } from '../service-code-model';
import { Location } from 'src/business-center/practice-settings/location';
import { AfterViewChecked } from '@angular/core';
import { take } from 'rxjs/operators';
declare var _: any;

@Component({
  selector: 'service-fees-by-location',
  templateUrl: './service-fees-by-location.component.html',
  styleUrls: ['./service-fees-by-location.component.scss'],
})
export class ServiceFeesByLocationComponent implements OnInit {
  //ToDo : Remove as option parameter
  //ToDo : Replace any type data with service code object
  @Input()
  ServiceCodeData: ServiceCodeModel;

  @Output()
  ClosePopup: EventEmitter<any> = new EventEmitter<any>(); //ToDo : Replace any type data with servicecode/locationinfo object

    @ViewChild('templateRef') templateElement: TemplateRef<NgTemplateOutlet>;
    @ViewChild("container", { read: ViewContainerRef })
    public containerRef: ViewContainerRef;

  dialog: DialogRef;
  searchTerm: string = '';

  locations: Location[]; //ToDo : Replace any type data with service code object
  filteredLocations: Location[]; //ToDo : Replace any type data with service code object, keep same type as locations
  defaultFee: number = 0.0;
  taxableServiceTypes: Array<{ id: number; label: string }> = [
    { id: 1, label: 'Not A Taxable Service' },
    { id: 2, label: 'Provider' },
    { id: 3, label: 'Sales And Use' },
  ];

  constructor(
    @Inject('referenceDataService') private referenceDataService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.getLocations();
    this.setDefaultFee();
  }

    openPreviewDialog = () => {
        if (this.dialogService) {
            this.dialog = this.dialogService.open({
                content: this.templateElement,
                appendTo: this.containerRef
            });
        }

        if (this.dialog.result) {
            this.dialog.result.pipe(take(1)).subscribe((result: any) => {
                if (!result.primary) {
                    this.dialog.close();
                }
            });
        }
  };

  cancel = () => {
    this.dialog.close();
    this.ClosePopup.emit(false);
    this.ClosePopup.emit(this.ServiceCodeData.LocationSpecificInfo);
  };

  getLocations = () => {
    this.locations = this.referenceDataService.get(
      this.referenceDataService.entityNames.locations
    );
    this.filteredLocations = this.locations;
    this.referenceDataService.setFeesForLocations(
      this.ServiceCodeData,
      _.map(this.locations, 'LocationId')
    );
    this.setLocationProperties(this.locations);
  };

  setLocationProperties = locations => {
    if (locations) {
      for (var i = 0; i < locations.length; i++) {
        let location = locations[i];
        var locationInfo = [];
        if (
          this.ServiceCodeData.LocationSpecificInfo != null &&
          this.ServiceCodeData.LocationSpecificInfo != undefined
        ) {
          locationInfo = this.ServiceCodeData.LocationSpecificInfo.filter(
            x => x.LocationId == location?.LocationId
          );
        }
        if (locationInfo?.length == 0 || locationInfo == undefined) {
          locationInfo = null;
        }

        var taxableServiceTypeIdType = '';
        if (locationInfo != null) {
          // set the information for this location if any
          // get taxable service label
          taxableServiceTypeIdType = this.getTaxableServiceTypeType(
            locationInfo[0]?.TaxableServiceTypeId
          );

          location.$$LocationOverrides = {
            $$FeeOverride: locationInfo[0]?.Fee,
            $$TaxableServiceTypeId: locationInfo[0]?.TaxableServiceTypeId,
            $$TaxableServiceTypeIdType: taxableServiceTypeIdType,
            $$DataTag: locationInfo[0]?.DataTag,
          };
        } else {
          // get taxable service label
          taxableServiceTypeIdType = this.getTaxableServiceTypeType(
            this.ServiceCodeData?.TaxableServiceTypeId
          );
          // Add the object to hold the override values
          location.$$LocationOverrides = {
            $$FeeOverride: this.defaultFee,
            $$TaxableServiceTypeId: this.ServiceCodeData?.TaxableServiceTypeId,
            $$TaxableServiceTypeIdType: taxableServiceTypeIdType,
            $$DataTag: null,
          };
        }
      }
    }
  };

  getTaxableServiceTypeType = taxableServiceTypeId => {
    taxableServiceTypeId = parseInt(taxableServiceTypeId);
    var type = [];
    if (this.taxableServiceTypes) {
      type = this.taxableServiceTypes.filter(x => x.id == taxableServiceTypeId);
    }

    return type && type.length > 0 ? type[0].label : '';
  };

  setDefaultFee = () => {
    if (this.ServiceCodeData) {
      if (this.ServiceCodeData.Fee && this.ServiceCodeData.Fee != null) {
        this.defaultFee = this.ServiceCodeData.Fee;
      } else {
        this.defaultFee = 0.0;
      }
    } else {
      this.defaultFee = 0.0;
    }
  };

  clearLocation = () => {
    this.searchTerm = '';
    this.filteredLocations = [];
    this.filteredLocations = this.locations;
  };
}
