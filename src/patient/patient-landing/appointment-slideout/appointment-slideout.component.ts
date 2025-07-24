import { Component, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { OrderByPipe } from 'src/@shared/pipes';
import { Location } from 'src/business-center/practice-settings/location';
import { SlideoutFilterComponent } from 'src/patient/common/components/slideout-filter/app-slideout-filter.component';
import { SlideoutFilter } from 'src/patient/common/models/enums/patient.enum';
import { AppointmentRequest } from 'src/patient/common/models/patient-grid-request.model';
import { PatientFliterCategory } from 'src/patient/common/models/patient-grid-response.model';
import { PatientFilterService } from 'src/patient/service/patient-filter.service';
import isEqual from 'lodash/isEqual';
@Component({
  selector: 'appointment-slideout',
  templateUrl: './appointment-slideout.component.html',
  styleUrls: ['./appointment-slideout.component.scss']
})
export class AppointmentSlideoutComponent implements AfterViewInit, OnChanges {

  @Input() activeFltrTab: number;
  @Input() activeGridData;
  @Input() selectedLocation: Location;
  @Input() appointmentsFilterCriteria: AppointmentRequest;

  @ViewChild(SlideoutFilterComponent) public slideoutFilter: SlideoutFilterComponent;

  appointmentTypes: PatientFliterCategory<string>[];
  appointmentBlocks: PatientFliterCategory<string>[];
  rooms: PatientFliterCategory<string>[];
  providers: PatientFliterCategory<string>[];
  soonerIfPossible: PatientFliterCategory<string>[];

  appointmentRequest = new AppointmentRequest();

  isFirstLoad = true;
  subscriptions: Array<Subscription> = new Array<Subscription>();

  SoonerIfPossibleData = {
    field: 'SoonerIfPossible',
    value: this.translate.instant('Sooner if Possible'),
    key: 'true',
    isVisible: true,
    isSelected: false
  };

  constructor(private patientFilterService: PatientFilterService, public fb: FormBuilder, private translate: TranslateService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.activeGridData) {
      //Filter data which is coming from the activeGridData
      const nv = changes?.activeGridData?.currentValue;
      const ov = changes?.activeGridData?.previousValue
      if (!isEqual(nv, ov)) {
        //Check if AppointmentTypes data changes
        if (!isEqual(nv?.AppointmentTypes, ov?.AppointmentTypes)) {
          this.getAppointmentTypes();
        }

        //Check if Room data changes
        if (!isEqual(nv?.Rooms, ov?.Rooms)) {
          this.getRooms();
        }

        //Check if Provider data changes
        if (!isEqual(nv?.Providers, ov?.Providers)) {
          this.getProviders();
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this.createForm();
    this.getSectionData();
  }

  getSectionData = () => {
    this.initializeDefaultPropeties();
    if (this.slideoutFilter?.patientFilterForm) {
      this.getAppointmentTypes();
      this.getAppointmentBlocks();
      this.getRooms();
      this.getProviders();
      this.setSoonerNotVisible();
      this.subscriptions?.push(this.patientFilterService?.patientModelStatus?.subscribe(() => {
        const orderPipe = new OrderByPipe();
        this.slideoutFilter.patientModelArray = orderPipe.transform(this.slideoutFilter.patientModelArray, { sortColumnName: "filterText", sortDirection: 1 });
      }));
    }
  }

  initializeDefaultPropeties = () => {
    this.appointmentRequest = this.appointmentsFilterCriteria;
  }

  createForm = () => {
    this.slideoutFilter?.patientFilterForm?.addControl("appointmentTypes", new FormArray([]));
    this.slideoutFilter?.patientFilterForm?.addControl("appointmentBlocks", new FormArray([]));
    this.slideoutFilter?.patientFilterForm?.addControl("rooms", new FormArray([]));
    this.slideoutFilter?.patientFilterForm?.addControl("providers", new FormArray([]));
    this.slideoutFilter?.patientFilterForm?.addControl("soonerIfPossibleForm", new FormArray([]));
  }

  //get appointment types data
  getAppointmentTypes = () => {
    this.appointmentTypes = [];    
    this.appointmentTypes = this.patientFilterService?.appointmentTypes;    
    this.appointmentTypeForm?.clear();
    
    this.appointmentTypes = this.appointmentTypes?.map((item) => {
      return {
        ...item,
        isSelected: this.isFirstLoad
          ? true
          : this.patientFilterService.checkKeyAndItemInFilterCriteria(SlideoutFilter.AppointmentTypes, item?.key),
        isVisible: true
      }
    });

    if (this.activeGridData?.AppointmentTypes) {
      this.activeGridData?.AppointmentTypes?.forEach((item) => {
        this.appointmentTypes?.push({
          field: SlideoutFilter.AppointmentTypes,
          value: item?.Value,
          key: item?.Key,
          isVisible: this.appointmentTypes?.length > 4 ? false : true,
          isSelected: this.isFirstLoad
            ? true
            : this.patientFilterService.checkKeyAndItemInFilterCriteria(SlideoutFilter.AppointmentTypes, item?.Key),
        })
      });
    }

    // Add "All" option to the insurance array
    const control = { field: SlideoutFilter.AppointmentTypes, isSelected: this.patientFilterService.isSelectAllOption(this.appointmentTypes), isVisible: true, key: "", value: "" };
    this.appointmentTypeForm?.push(new FormControl(control));

    for (let i = 0; i < this.appointmentTypes?.length; i++) {
      this.appointmentTypeForm?.push(new FormControl(this.appointmentTypes[i]))
    }
    const appoitmentTypes = this.patientFilterService?.setCommonStructure('apptTypeDiv', 'apptTypeDiv', SlideoutFilter.AppointmentTypes, 'Appointment Type',
      this.appointmentTypeForm, this.appointmentTypes);
    this.addToForm(appoitmentTypes);
  }

  //get appointment blocks data
  getAppointmentBlocks = () => {
    this.appointmentBlocks = [];
    this.appointmentBlocks = this.patientFilterService?.appointmentBlocks;
    // Add "All" option to the insurance array
    const control = { field: SlideoutFilter.AppointmentBlocks, isSelected: true, isVisible: true, key: "", value: "" };
    this.appointmentBlockForm?.clear();
    this.appointmentBlockForm?.push(new FormControl(control));
    for (let i = 0; i < this.appointmentBlocks?.length; i++) {
      this.appointmentBlockForm?.push(new FormControl(this.appointmentBlocks[i]))
    }
    const appoitmentBlocks = this.patientFilterService?.setCommonStructure('blocksDiv', 'blocksDiv', SlideoutFilter.AppointmentBlocks, 'Blocks',
      this.appointmentBlockForm, this.appointmentBlocks);
    this.addToForm(appoitmentBlocks);
  }

  //get rooms types data
  getRooms = () => {
    this.rooms = [];
    this.rooms = this.patientFilterService?.rooms;    
    this.roomForm?.clear();
    this.rooms = this.rooms?.map((item) => {
      return {
        ...item,
        isSelected: this.isFirstLoad
          ? true
          : this.patientFilterService.checkKeyAndItemInFilterCriteria(SlideoutFilter.Rooms, item?.key),
        isVisible: true
      }
    });
    if (this.activeGridData?.Rooms) {
      this.activeGridData?.Rooms?.forEach((item) => {
        this.rooms?.push({
          field: "Rooms",
          value: item?.Value,
          key: item?.Key,
          isVisible: this.rooms?.length > 4 ? false : true,
          isSelected: this.isFirstLoad
            ? true
            : this.patientFilterService.checkKeyAndItemInFilterCriteria(SlideoutFilter.Rooms, item?.Key),
        })
      });
    }

    // Add "All" option to the insurance array
    const control = { field: SlideoutFilter.Rooms, isSelected: this.patientFilterService.isSelectAllOption(this.rooms), isVisible: true, key: "", value: "" };
    this.roomForm?.push(new FormControl(control));

    for (let i = 0; i < this.rooms?.length; i++) {
      this.roomForm?.push(new FormControl(this.rooms[i]))
    }
    const rooms = this.patientFilterService?.setCommonStructure('roomsDiv', 'roomsDiv', SlideoutFilter.Rooms, 'Room',
      this.roomForm, this.rooms);
    this.addToForm(rooms);
  }

  //get providers data
  getProviders = () => {
    this.providers = [];
    this.providers = this.patientFilterService?.providers;
    
    this.providers = this.providers?.map((item) => {
      return {
        ...item,
        isSelected: this.isFirstLoad
          ? true
          : this.patientFilterService.checkKeyAndItemInFilterCriteria(SlideoutFilter.Providers, item?.key),
        isVisible: true
      }
    });
    this.providerForm?.clear();
    if (this.activeGridData?.Providers) {
      this.activeGridData?.Providers?.forEach((item) => {
        this.providers?.push({
          field: "Providers",
          value: item?.Value,
          key: item?.Key,
          isVisible: this.providers?.length > 4 ? false : true,
          isSelected: this.isFirstLoad
            ? true
            : this.patientFilterService.checkKeyAndItemInFilterCriteria(SlideoutFilter.Providers, item?.Key),
        })
      });
    }

    // Add "All" option to the insurance array
    const control = { field: SlideoutFilter.Providers, isSelected: this.patientFilterService.isSelectAllOption(this.providers), isVisible: true, key: "", value: "" };
    this.providerForm?.push(new FormControl(control));

    for (let i = 0; i < this.providers?.length; i++) {
      this.providerForm?.push(new FormControl(this.providers[i]))
    }
    const providers = this.patientFilterService?.setCommonStructure('providersDiv', 'providersDiv', SlideoutFilter.Providers, 'Provider',
      this.providerForm, this.providers);
    this.addToForm(providers);
  }

  setSoonerNotVisible = () => {
    this.soonerIfPossible = [];
    this.soonerIfPossibleForm.clear();
    if (this.SoonerIfPossibleData) {
      this.soonerIfPossible?.push({
        field: this.SoonerIfPossibleData?.field,
        key: this.SoonerIfPossibleData?.key,
        value: this.SoonerIfPossibleData?.value,
        isSelected: false,
        isVisible: true
      });

      this.soonerIfPossibleForm?.push(new FormControl(this.soonerIfPossible[0]))
      const soonerIfPossible = this.patientFilterService?.setCommonStructure(this.SoonerIfPossibleData.field, this.SoonerIfPossibleData.field, SlideoutFilter.SoonerIfPossible, '',
        this.soonerIfPossibleForm, this.soonerIfPossible);
      this.addToForm(soonerIfPossible);
    }

  }

  addToForm = (dataArray) => {
    if (!dataArray || !this.slideoutFilter || !this.slideoutFilter?.patientModelArray) {
        return; // Exit early if any required object is undefined
    }
    const index = this.slideoutFilter?.patientModelArray?.findIndex(x => x?.dataTarget == dataArray?.dataTarget);
    if (index < 0) {
        this.slideoutFilter?.patientModelArray?.push(dataArray);
    } else {
        this.slideoutFilter.patientModelArray[index] = dataArray;
    }
  }

  setFilterData = (param: { id, filterHeader: string }) => {
    const selectedId = param?.id;
    const filterHeader = param?.filterHeader;
    switch (filterHeader) {
      case SlideoutFilter.AdditionalIdentifiers:
        this.appointmentRequest.FilterCriteria.AdditionalIdentifiers = selectedId;
        break;
      case SlideoutFilter.AppointmentDates:
        this.appointmentRequest.FilterCriteria.AppointmentDate = selectedId;
        break;
      case SlideoutFilter.AppointmentState:
        this.appointmentRequest.FilterCriteria.AppointmentState = selectedId;
        break;
      case SlideoutFilter.AppointmentStatusList:
        this.appointmentRequest.FilterCriteria.AppointmentStatusList = selectedId;
        break;
      case SlideoutFilter.IsScheduled:
        this.appointmentRequest.FilterCriteria.IsScheduled = selectedId;
        break;
      case SlideoutFilter.AppointmentTypes:
        this.appointmentRequest.FilterCriteria.AppointmentTypes = selectedId;
        break;
      case SlideoutFilter.AppointmentBlocks:
        this.appointmentRequest.FilterCriteria.AppointmentBlocks = selectedId;
        break;
      case SlideoutFilter.BusinessDays:
        this.appointmentRequest.FilterCriteria.BusinessDays = selectedId;
        break;
      case SlideoutFilter.GroupTypes:
        this.appointmentRequest.FilterCriteria.GroupTypes = selectedId;
        break;
      case SlideoutFilter.PreferredDentists:
        this.appointmentRequest.FilterCriteria.PreferredDentists = selectedId;
        break;
      case SlideoutFilter.PreferredHygienists:
        this.appointmentRequest.FilterCriteria.PreferredHygienists = selectedId;
        break;
      case SlideoutFilter.Providers:
        this.appointmentRequest.FilterCriteria.Providers = selectedId;
        break;
      case SlideoutFilter.Rooms:
        this.appointmentRequest.FilterCriteria.Rooms = selectedId;
        break;
      case SlideoutFilter.SoonerIfPossible:
        this.appointmentRequest.FilterCriteria.SoonerIfPossible = selectedId;
        break;
    }

  }

  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => subscription?.unsubscribe());
  }

  get appointmentTypeForm() {
    return this.slideoutFilter?.patientFilterForm?.controls?.appointmentTypes as FormArray;
  }

  get appointmentBlockForm() {
    return this.slideoutFilter?.patientFilterForm?.controls?.appointmentBlocks as FormArray;
  }

  get roomForm() {
    return this.slideoutFilter?.patientFilterForm?.controls?.rooms as FormArray;
  }

  get providerForm() {
    return this.slideoutFilter?.patientFilterForm?.controls?.providers as FormArray;
  }

  get soonerIfPossibleForm() {
    return this.slideoutFilter?.patientFilterForm?.controls?.soonerIfPossibleForm as FormArray;
  }
}
