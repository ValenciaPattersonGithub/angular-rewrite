import { Component, OnInit, OnDestroy, Inject, Renderer2 } from '@angular/core';

import {
  CdkDragStart,
  CdkDragEnd,
} from '@angular/cdk/drag-drop';

import { Subscription } from 'rxjs';
import { DrawerNotificationService } from 'src/@shared/providers/drawer-notification.service';

import { TreatmentPlanOrderingService } from '../../providers';
import { ScheduleAppointmentHttpService } from 'src/scheduling/common/http-providers/schedule-appointment-http.service';
import { TreatmentPlanFilteringService } from '../../providers';
import { TreatmentPlanSelectListService } from '../../providers';
import { TreatmentPlanServicesDrawerDragService } from '../../providers';
import { PatientDetailService } from '../../../patient/patient-detail/services/patient-detail.service';
import { TruncateTextPipe } from '../../../@shared/pipes/truncate/truncate-text.pipe';
import { DatePipe } from '@progress/kendo-angular-intl';
import { TreatmentPlanEditServicesService } from '../../component-providers';
import { LocationHttpService } from '../../../practices/http-providers/location-http.service';
import { LocationsService } from '../../../practices/providers/locations.service';
import { ServiceTypesService } from 'src/business-center/practice-settings/service-types/service-types.service';

@Component({
  selector: 'new-treatment-plan-services-drawer-view',
  templateUrl: './treatment-plan-services-drawer-view.component.html',
  styleUrls: ['./treatment-plan-services-drawer-view.component.scss'],
})
export class TreatmentPlanServicesDrawerViewComponent
  implements OnInit, OnDestroy
{
  content: string = 'proposed'; // the default starting state of the drawer

  dragAreaSubscription: Subscription;
  dragStateSubscription: Subscription;
  getProposedSubscription: Subscription;
  public isCardBeingDragged: boolean = false;
  dragAreas: string[] = [];
  dragAreasAdded: string[] = [];

  proposed: any[] = [];
  proposedStartingList: any[] = [];
  proposedOrder: number;
  proposedFilter: string;
  providerLocations: any[] = [];

  serviceTypeFilterList: any[] = [];
  proposedServicesOrderingList: any[] = [];

  servicesNew: any[] = [];

  resetCheckedItemsSubscription: Subscription;
  checkedItems: any[] = [];
  isMasterSelect: boolean = false;

  constructor(
    private drawerDragService: TreatmentPlanServicesDrawerDragService,
    private drawerNotificationService: DrawerNotificationService,
    @Inject('TreatmentPlansFactory') private treatmentPlanFactory,
    private patientDetailService: PatientDetailService,
    @Inject('referenceDataService') private referenceDataService,
    private orderingService: TreatmentPlanOrderingService,
    private selectListService: TreatmentPlanSelectListService,
    private filteringService: TreatmentPlanFilteringService,
    private scheduleAppointmentHttpService: ScheduleAppointmentHttpService,
    private treatmentPlansEditServicesService: TreatmentPlanEditServicesService,
    private datePipe: DatePipe,
    private locationHttpService: LocationHttpService,
    @Inject('PatientValidationFactory') private patientValidationFactory,
    @Inject('locationService') private locationsService,
    private locationService: LocationsService,
    private serviceTypesService: ServiceTypesService,
  ) {
    this.populateServiceTypeFilterList();

    let proposedList = this.selectListService.getProposedOrderingSelectList();
    this.proposedServicesOrderingList = proposedList;
  }

  private async populateServiceTypeFilterList() {
    // get the preset items;
    let list = this.selectListService.getServiceTypeSelectList();

    let types = await this.serviceTypesService.getAll();
    let orderedList = this.orderingService.orderServiceTypesByDescription(
      types,
      true
    );
    for (let i = 0; i < orderedList.length; i++) {
      let item = {
        Text: orderedList[i].Description,
        Value: orderedList[i].ServiceTypeId,
      };

      list.push(item);
    }

    this.serviceTypeFilterList = list;
  }

  ngOnInit() {
    //This will get called whenever the proposed variable changes.
    this.getProposedSubscription = this.drawerDragService
      .getProposed()
      .subscribe(proposed => {
        proposed.forEach(value => {
          for (let i = 0; i < this.proposed.length; i++) {
            if (
              value.id ===
              this.proposed[i].ServiceTransaction.ServiceTransactionId
            ) {
              this.proposed[i].displayProposed = value.display;
            }
          }
        });
      });

    this.locationHttpService
      .getLocationsWithDetailsByPermissionsObservable(1120)
      .subscribe(data => {
        let patientData = this.patientValidationFactory.GetPatientData();
        let allLoc = this.locationsService.getActiveLocations();

        let newData = this.locationService.addInactiveFlagtoLocations(
          data,
          allLoc
        );

        // get locations that are in both lists.
        let tempLocations =
          this.locationService.findLocationsInBothPatientLocationsAndUsersLocations(
            patientData.PatientLocations,
            newData
          );

        this.providerLocations = tempLocations;

        let locations = this.referenceDataService.get(
          this.referenceDataService.entityNames.locations
        );
        // providers
        let providers = this.referenceDataService.get(
          this.referenceDataService.entityNames.users
        );

        let tempList = [];
        let serviceCodes = [];
        Promise.resolve(
          this.referenceDataService.getData(
            this.referenceDataService.entityNames.serviceCodes
          )
        ).then(allServiceCodes => {
          serviceCodes = allServiceCodes;
        });
        let patientId = this.patientDetailService.getActivePatientId();

        // get list of current services so I can ensure they are not added again.
        let activeTreatmentPlan = this.treatmentPlanFactory.ActiveTreatmentPlan;
        let alreadyOnThisTreatmentPlan = null;

        this.scheduleAppointmentHttpService
          .getProposedServicesWithAppointmentStartTime(patientId)
          .subscribe(dataList => {
            for (let i = 0; i < dataList.length; i++) {
              if (dataList[i].AppointmentId !== null) {
                dataList[i].ScheduledStatus = this.datePipe.transform(
                  new Date(dataList[i].StartTime),
                  'MM/dd/yyyy'
                );
              }

              if (activeTreatmentPlan !== null) {
                alreadyOnThisTreatmentPlan =
                  activeTreatmentPlan.TreatmentPlanServices.some(
                    item =>
                      item.ServiceTransaction.ServiceTransactionId ===
                      dataList[i].ServiceTransactionId
                  );
              } else {
                alreadyOnThisTreatmentPlan = false;
              }

              let ofcLocation = locations.find(function (item) {
                return item.LocationId == dataList[i].LocationId;
              });

              let provider = providers.find(function (item) {
                return item.UserId == dataList[i].ProviderUserId;
              });

              let serviceCode = serviceCodes.find(function (item) {
                return item.ServiceCodeId == dataList[i].ServiceCodeId;
              });

              // without the above data we cannot display the items so check if it is loaded.
              if (ofcLocation && provider && serviceCode) {
                // used to truncate the text before loading on the view.
                let truncateText = new TruncateTextPipe();
                // I want this to be the new name or LocationName ... so adding this here so eventually we can make this work
                dataList[i].LocationName = ofcLocation.NameLine1; // bridge to new variable on the client eventually
                dataList[i].DisplayName = ofcLocation.NameAbbreviation; // existing name that I want to switch out.
                dataList[i].ProviderFullName =
                  provider.FirstName + ' ' + provider.LastName;
                dataList[i].ShortProviderFullName = truncateText.transform(
                  dataList[i].ProviderFullName,
                  60
                );
                dataList[i].ProviderLastName = provider.LastName; // added to ensure we can order the list by provider last name

                dataList[i].ServiceCode = serviceCode.Code;
                dataList[i].Description = serviceCode.Description;
                if (dataList[i].Description.length > 80) {
                  dataList[i].showTooltip = true;
                } else {
                  dataList[i].showTooltip = false;
                }
                dataList[i].ShortDescription = truncateText.transform(
                  dataList[i].Description,
                  80
                );
                if (dataList[i].Surface) {
                  dataList[i].SurfaceSummary =
                    this.treatmentPlansEditServicesService.normalizeSurfaces(
                      dataList[i].Surface
                    );
                }
                if (dataList[i].Roots) {
                  dataList[i].RootsSummary = dataList[i].Roots.replace(
                    /,/g,
                    ''
                  );
                }

                // for later filtering
                dataList[i].ServiceTypeId = serviceCode.ServiceTypeId;

                let area = serviceCode.AffectedAreaId;

                let displayProposed = true;
                if (alreadyOnThisTreatmentPlan) {
                  displayProposed = false;
                }

                tempList.push({
                  drawerState: {
                    area: area,
                  },
                  isSelected: false,
                  displayProposed: displayProposed, //this variable will or hide the proposed service card in the proposed service drawer
                  ServiceTransaction: dataList[i],
                  TreatmentPlanServiceHeader: {
                    TreatmentPlanGroupNumber: 0,
                    Priority: 0,
                  },
                  isDisabled:
                    this.providerLocations.find(
                      x => x.LocationId == dataList[i].LocationId
                    ) === undefined,
                  toolTip:
                    this.providerLocations.find(
                      x => x.LocationId == dataList[i].LocationId
                    ) === undefined
                      ? 'User is not authorized to access this area.'
                      : '',
                });
              }
            }

            let list = this.orderingService.orderProposedServices(tempList, 1);
            // populate the starter list so that proposed services can be filtered later.
            this.proposedStartingList = list;
            this.proposed = list;
            this.proposedOrder = 1;
            this.proposedFilter = 'All';
            this.dragAreaSubscription = this.drawerDragService
              .getDragAreas()
              .subscribe(message => {
                this.dragAreas = message;
              });

            this.dragStateSubscription = this.drawerNotificationService
              .getDragState()
              .subscribe(message => {
                this.isCardBeingDragged = message;
              });

            this.checkedItems = [];
            this.drawerDragService.setCheckedItems([]);
            this.resetCheckedItemsSubscription = this.drawerDragService
              .resetCheckedItemsNotfication()
              .subscribe(message => {
                // if the other pages change the list ... then we need to uncheck items.
                if (message === true) {
                  // if the list is empty reset the items if they need to be reset.
                  for (let i = 0; i < this.proposed.length; i++) {
                    this.proposed[i].isSelected = false;
                  }
                  this.isMasterSelect = false;
                  this.checkedItems = [];
                }
              });
          });

        //get a list of proposed services with Start Time for an appointment

        let proposedCollectionName = 'treatmentPlanProposedServicesDrawer';

        if (
          !this.dragAreas.find(function (item) {
            return item === proposedCollectionName;
          })
        ) {
          this.dragAreas.push(proposedCollectionName);
          this.drawerDragService.changeDragAreas(this.dragAreas);
        }

        // add to the collection that we will utilize later to remove the drag areas
        this.dragAreasAdded.push(proposedCollectionName);

        //TODO: Include query to get services. ... right now this is only a stub.
        // this is stub of test data for an items we still have to finish is upcoming sprints.
        this.servicesNew = [
          {
            ServiceTransaction: {
              ServiceCode: 'D0350',
              BasicDescription: 'left bitwing oral evaluation - new or esta',
              ShortBasicDescription:
                'left bitwing oral evaluation - new or esta', // generated
              Description: 'D0350: left bitwing oral evaluation - new or esta',
              Tooth: null,
              $$Area: null,
              Fee: 125.92,
              Type: 'Endodontics',
            },
            TreatmentPlanServiceHeader: {
              TreatmentPlanGroupNumber: 0,
              Priority: 0,
            },
          },
          {
            ServiceTransaction: {
              ServiceCode: 'D0250',
              BasicDescription: 'routine cleaning - new',
              ShortBasicDescription: 'routine cleaning - new', // generated
              Description: 'D0250: routine cleaning - new',
              Tooth: '3',
              $$Area: '2,3,6',
              Fee: 34.56,
              Type: 'Diagnostic',
            },
            TreatmentPlanServiceHeader: {
              TreatmentPlanGroupNumber: 0,
              Priority: 0,
            },
          },
          {
            ServiceTransaction: {
              ServiceCode: 'D0120',
              BasicDescription: 'consultation - new patient',
              ShortBasicDescription: 'consultation - new patient', // generated
              Description: 'D0120: consultation - new patient',
              Tooth: null,
              $$Area: null,
              Fee: 96.45,
              Type: 'Preventative',
              ProviderFullName: 'Donald Driver',
              DisplayName: 'Joe',
            },
            TreatmentPlanServiceHeader: {
              TreatmentPlanGroupNumber: 0,
              Priority: 0,
            },
          },
        ];
      });
  }

  dragStarted(event: CdkDragStart<string[]>) {
    this.drawerNotificationService.changeDragState(true);
  }

  dragEnded(event: CdkDragEnd<string[]>) {
    this.drawerNotificationService.changeDragState(false);
  }

  showMultipleSelectedDragPreview(item) {
    let result =
      this.checkedItems.length > 1 &&
      this.checkedItems.some(
        x =>
          x.ServiceTransaction.ServiceTransactionId ===
          item.ServiceTransaction.ServiceTransactionId
      );
    return result;
  }

  getCheckedItemList() {
    let checkedItems = [];
    for (let i = 0; i < this.proposed.length; i++) {
      if (this.proposed[i].isSelected) checkedItems.push(this.proposed[i]);
    }

    this.drawerDragService.setCheckedItems(checkedItems);
    this.checkedItems = checkedItems;
  }

  onCheckboxSelectAllChange(event) {
    for (let i = 0; i < this.proposed.length; i++) {
      if (!this.proposed[i].isDisabled) {
        this.proposed[i].isSelected = this.isMasterSelect;
      }
    }
    this.getCheckedItemList();
  }

  onCheckboxChange(event, item) {
    this.isMasterSelect = this.proposed.every(function (record: any) {
      return record.isSelected == true || record.isDisabled;
    });

    this.getCheckedItemList();
  }

  proposedOrderChange(order) {
    let list = this.orderingService.orderProposedServices(this.proposed, order);
    this.proposed = list;
  }

  proposedFilterChange(filter) {
    let list = this.filteringService.filterListByServiceTypeSelectListValue(
      this.proposed,
      filter
    );
    this.proposed = list;
  }

  ngOnDestroy() {
    // clean up items

    this.dragAreaSubscription.unsubscribe();

    this.dragStateSubscription.unsubscribe();

    this.getProposedSubscription.unsubscribe();

    this.drawerDragService.setCheckedItems([]);
    this.resetCheckedItemsSubscription.unsubscribe();

    for (let i = 0; i < this.dragAreasAdded.length; i++) {
      for (let x = 0; x < this.dragAreas.length; x++) {
        if (this.dragAreasAdded[i] === this.dragAreas[x]) {
          this.dragAreas.splice(x, 1);
        }
      }
    }
    this.drawerDragService.changeDragAreas(this.dragAreas);
  }
}
