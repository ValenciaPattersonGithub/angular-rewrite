import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { PatientFilterService } from '../../service/patient-filter.service';
import { SlideoutFilterComponent } from '../../common/components/slideout-filter/app-slideout-filter.component';
import { OrderByPipe } from 'src/@shared/pipes';
import { Subscription } from 'rxjs';
import { PatientFliterCategory, PatientTabFilter } from '../../common/models/patient-grid-response.model';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PatientAdditionalIdentifiers } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier';
import { SlideoutFilter } from '../../common/models/enums/patient.enum';
import { OtherToDoRequest } from 'src/patient/common/models/patient-grid-request.model';
import { OtherToDoGridFilter } from '../../common/models/patient-grid-filter.model';

@Component({
  selector: 'other-to-do-slideout',
  templateUrl: './other-to-do-slideout.component.html',
  styleUrls: ['./other-to-do-slideout.component.scss']
})
export class OtherToDoSlideoutComponent implements AfterViewInit, OnDestroy {

  @Input() activeFltrTab: number;
  @Input() activeGridData;
  @Input() otherToDoFilterCriteria: OtherToDoRequest;
  @Input() selectedLocation: { LocationId: 0, LocationName: '' };
  dueDateItem: PatientFliterCategory<string>[];
  subscriptions: Array<Subscription> = new Array<Subscription>();
  patientAdditionalIdentifiers: PatientAdditionalIdentifiers[];
  hasIdentifiers = false;
  isFirstLoad = true;
  patientModel = new PatientTabFilter();
  patientModelArray: PatientTabFilter[] = [];
  additionalIdentifiers: PatientFliterCategory<string>[];
  patientFilterForm: FormGroup;
  orderPipe = new OrderByPipe();
  OtherToDoRequest = new OtherToDoRequest();
  @ViewChild(SlideoutFilterComponent) public slideoutFilter: SlideoutFilterComponent;

  constructor(
    private patientFilterService: PatientFilterService,
  ) { }

  ngAfterViewInit(): void {
    if(this.OtherToDoRequest?.FilterCriteria)
    this.OtherToDoRequest.FilterCriteria = new OtherToDoGridFilter();
    this.createForm();
    this.initializeDefaultPropeties();
    this.getDueDateItem()
    this.subscriptions?.push(this.patientFilterService?.patientModelStatus?.subscribe(() => {
      const orderPipe = new OrderByPipe();
      this.slideoutFilter.patientModelArray = orderPipe.transform(this.slideoutFilter?.patientModelArray, { sortColumnName: "filterText", sortDirection: 1 });
    }));
  }

  createForm = () => {
    this.slideoutFilter?.patientFilterForm.addControl('dueDate', new FormArray([]));
  }

  initializeDefaultPropeties = () => {
    this.OtherToDoRequest = this.otherToDoFilterCriteria;
  }
  
  getDueDateItem = () => {
    this.dueDateItem = [];
    this.dueDateItem = this.patientFilterService?.dueDateItems;
    // Add "All" option to the insurance array
    const control = { field: SlideoutFilter.DueDateItems, isSelected: true, isVisible: true, key: "", value: "" };
    this.dueDateArray.push(new FormControl(control));
    for (let i = 0; i < this.dueDateItem?.length; i++) {
      this.dueDateArray?.push(new FormControl(this.dueDateItem[i]))
    }
    const dueDateModel = this.patientFilterService?.setCommonStructure('dueDateDiv', 'dueDateDiv', 'DueDateItems', 'Due Date',
      this.dueDateArray, this.dueDateItem);
    this.slideoutFilter?.patientModelArray?.push(dueDateModel);
  }

  get dueDateArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.dueDate as FormArray;
  }

  setFilterData = (param: { id: string[], filterHeader: string }) => {
    const selectedId = param?.id;
    const filterHeader = param?.filterHeader;
    switch (filterHeader) {
      case SlideoutFilter.AdditionalIdentifiers:
        this.OtherToDoRequest.FilterCriteria.AdditionalIdentifiers = selectedId;
        break;
      case SlideoutFilter.DueDateItems:
        this.OtherToDoRequest.FilterCriteria.DueDateItems = selectedId;
        break;
      case SlideoutFilter.IsActive:
        this.OtherToDoRequest.FilterCriteria.IsActive = selectedId;
        break;
      case SlideoutFilter.IsPatient:
        this.OtherToDoRequest.FilterCriteria.IsPatient = selectedId;
        break;
      case SlideoutFilter.GroupTypes:
        this.OtherToDoRequest.FilterCriteria.GroupTypes = selectedId;
        break;
      case SlideoutFilter.PreferredDentists:
        this.OtherToDoRequest.FilterCriteria.PreferredDentists = selectedId;
        break;
      case SlideoutFilter.PreferredHygienists:
        this.OtherToDoRequest.FilterCriteria.PreferredHygienists = selectedId;
        break;
    }

    // When under 'Patient/Non-Patients' filter 'All' checkbox is checked/unchecked -> removed the related properties from filter criteria
    if (filterHeader == SlideoutFilter.PatientTypeStatus) {      
      delete this.OtherToDoRequest?.FilterCriteria?.IsActive;
      delete this.OtherToDoRequest?.FilterCriteria?.IsPatient;
    }
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => subscription?.unsubscribe());
  }

}
