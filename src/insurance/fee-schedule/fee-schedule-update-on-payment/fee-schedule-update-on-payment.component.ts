import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FEE_SCHEDULE_UPDATE_MODAL_DATA, FeeScheduleUpdateModalRef } from './fee-schedule-update-modal.service';
import { UpdatedAllowedAmountDto, FeeScheduleDto, FeeScheduleGroupDetailUpdateDto, FeeScheduleGroupDetailDto, FeeScheduleDetailDto } from '../fee-schedule-dtos';
import { FeeScheduleHttpService } from '../../../@core/http-services/fee-schedule-http.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
@Component({
  selector: 'fee-schedule-update-on-payment',
  templateUrl: './fee-schedule-update-on-payment.component.html',
  styleUrls: ['./fee-schedule-update-on-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeeScheduleUpdateOnPaymentComponent implements OnInit {
    updatedAllowedAmountData: UpdatedAllowedAmountDto[] = [];
    feeScheduleGroupDetailUpdateDtos: FeeScheduleGroupDetailUpdateDto[] = [];
    feeScheduleDtos: FeeScheduleDto[] = [];    
    selectAll: boolean = true;
    disableSaveButton: boolean = false;
    constructor(
        public dialogRef: FeeScheduleUpdateModalRef,
        @Inject(FEE_SCHEDULE_UPDATE_MODAL_DATA) public data: any,
        @Inject('patSecurityService') private patSecurityService: any,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('referenceDataService') private referenceDataService,
        private feeScheduleHttpService: FeeScheduleHttpService,
        private cd: ChangeDetectorRef,
        private translate: TranslateService,
    ) { }

    ngOnInit() {
        this.updatedAllowedAmountData = this.data.updatedAllowedAmounts;
        if (!this.patSecurityService.IsAuthorizedByAbbreviation('soar-ins-ifsch-edit')) {
            this.toastrFactory.error(this.patSecurityService.generateMessage('soar-ins-ifsch-edit'), 'Not Authorized');
            this.closeModal(null);
            return;
        }
       
        this.getFeeSchedules().subscribe(async feeSchedules => {
            this.feeScheduleDtos = feeSchedules;
            this.feeScheduleGroupDetailUpdateDtos = await this.loadGridData();
            this.cd.markForCheck(); 
        });
    }

     // helper method to compute location names
    getLocationNames(locations: any[]): string {
        return locations.map(location => location.LocationName).join('\n');
    }

    // initializes the grid data
    async loadGridData () : Promise<FeeScheduleGroupDetailUpdateDto[]> {
        let feeScheduleGroupDetailUpdates: FeeScheduleGroupDetailUpdateDto[] = [];
        const serviceCodes = await this.getServiceCodes();
        const practiceLocations = await this.getLocations();

        for (const updatedAllowedAmount of this.updatedAllowedAmountData) {
            // find a matching fee schedule and add a row to the grid data
            const feeSchedule = this.feeScheduleDtos.find(feeSchedule => feeSchedule.FeeScheduleId === updatedAllowedAmount.FeeScheduleId);
            if (!feeSchedule) continue;

            // Find the group that matches the ClaimLocationId
            const matchingGroup = feeSchedule.FeeScheduleGroupDtos.find(
                groupDto => Array.isArray(groupDto.LocationIds) && groupDto.LocationIds.includes(updatedAllowedAmount.ClaimLocationId)
            );

            // Find the group detail if FeeScheduleGroupDetailId is present
            let groupDetail: FeeScheduleGroupDetailDto | undefined;
            if (updatedAllowedAmount.FeeScheduleGroupDetailId && matchingGroup && Array.isArray(matchingGroup.FeeScheduleGroupDetails)) {
                groupDetail = matchingGroup.FeeScheduleGroupDetails.find(
                    detail => detail.FeeScheduleGroupDetailId === updatedAllowedAmount.FeeScheduleGroupDetailId
                );
            }
            const groupDetailUpdateDto: FeeScheduleGroupDetailUpdateDto = {
            FeeScheduleId: feeSchedule.FeeScheduleId,
            FeeScheduleName: feeSchedule.FeeScheduleName,
            IsSelected: true,
            ServiceCodeId: updatedAllowedAmount.ServiceCodeId,
            ServiceCodeDisplayAs: serviceCodes[updatedAllowedAmount.ServiceCodeId || ''],
            FeeScheduleGroupId: matchingGroup ? matchingGroup.FeeScheduleGroupId : updatedAllowedAmount.FeeScheduleGroupId,
            FeeScheduleGroupDetailId: groupDetail ? groupDetail.FeeScheduleGroupDetailId : updatedAllowedAmount.FeeScheduleGroupDetailId,
            CurrentAmount: groupDetail ? groupDetail.AllowedAmount : 0,
            UpdatedAmount: updatedAllowedAmount.UpdatedAmount,
            Locations: matchingGroup
                ? matchingGroup.LocationIds.map(locationId => {
                    const location = practiceLocations.find(loc => loc.LocationId === locationId);
                    return {
                        LocationId: locationId,
                        LocationName: location ? location.NameLine1 : ''
                    };
                })
                : []
        };

        feeScheduleGroupDetailUpdates.push(groupDetailUpdateDto);
        }
        return feeScheduleGroupDetailUpdates;        
    }

    getServiceCodes = async () => {
        const serviceCodes: any[] = await this.referenceDataService.getData(this.referenceDataService.entityNames.serviceCodes);
        // map the service codes to a dictionary     
        return serviceCodes.reduce((all, serviceCode) => ({ ...all, [serviceCode.ServiceCodeId]: `(${serviceCode.CdtCodeName}) ${serviceCode.Description}` }), {});
    }

    getLocations = async () => {
        const locations: any[] = await this.referenceDataService.getData(this.referenceDataService.entityNames.locations);  
        return locations.map(location => ({
            LocationId: location.LocationId,
            NameLine1: location.NameLine1
        }));
    }

    getFeeSchedules(): Observable<FeeScheduleDto[]> {
        const feeScheduleIds = [...new Set(this.updatedAllowedAmountData.map(x => x.FeeScheduleId))];

        const feeScheduleRequests = feeScheduleIds.map(feeScheduleId =>
            this.feeScheduleHttpService.requestFeeScheduleById({ feeScheduleId }).pipe(
                map(response => response.Value),
                catchError(err => {
                    this.toastrFactory.error(
                        this.translate.instant('Failed to get fee schedules.'),
                        this.translate.instant('Server Error')
                    );
                    // Handle the error and return null or an empty object
                    return of(null); 
                })
            )
        );        
        return forkJoin(feeScheduleRequests).pipe(
            map(results => results.filter(feeSchedule => feeSchedule !== null)) 
        );
    }


    onSortChange($event) {
        console.log($event);
    }

    toggleSelectAll(selectAll) {        
        this.feeScheduleGroupDetailUpdateDtos.forEach(item => {
            item.IsSelected = selectAll;
        });
        this.validateSave();
    }

    onCheckboxChange(dataItem: any): void {
        this.selectAll = this.feeScheduleGroupDetailUpdateDtos.every(item => item.IsSelected); 
        this.validateSave();       
    }

    validateSave() {
        const selectedItems = this.feeScheduleGroupDetailUpdateDtos.filter(item => item.IsSelected);
        this.disableSaveButton = selectedItems.length > 0 ? false : true;
    }

    processUpdates($event): void {
        this.updateFeeSchedules().subscribe(feeSchedules => {
            this.feeScheduleDtos = feeSchedules;
            this.toastrFactory.success(
                this.translate.instant('Fee schedules updated successfully.'),
                this.translate.instant('Success')
            );
            this.confirmModal($event);
        });
    }

    updateFeeSchedules(): Observable<FeeScheduleDto[]> {
        const feeSchedulesToUpdate = this.filterForUpdatedFeeSchedules();
        // if we fee schedules to update
        if (feeSchedulesToUpdate.length > 0) {
            const feeScheduleUpdateRequests = feeSchedulesToUpdate.map(feeSchedule =>
                this.feeScheduleHttpService.updateFeeSchedule(feeSchedule).pipe(                
                    map(response => response.Value),
                    catchError(err => {
                        this.toastrFactory.error(
                            this.translate.instant('Failed to update fee schedule.'),
                            this.translate.instant('Server Error')
                        );
                        return of(null);
                    })
                )
            );
            return forkJoin(feeScheduleUpdateRequests).pipe(
                map(results => results.filter(feeSchedule => feeSchedule !== null)) 
            );
        }
        // if we don't have any fee schedules to update throw an error
        // note this should never happen
        this.toastrFactory.error(
            this.translate.instant('No fee schedules were found to be updated.'),
            this.translate.instant('Server Error')
        );
        return of(null);       
    }
    
    filterForUpdatedFeeSchedules() {       
        const saveStates = {
            Add: 'Add',
            Update: 'Update',
            Delete: 'Delete',
            None: 'None'
        };

        // for each feeSchedule, we need to get a list of selected items
        for (const feeSchedule of this.feeScheduleDtos) {
            // for each feeSchedule, we need to get a list of selected items
            const selectedGroupDetails = this.feeScheduleGroupDetailUpdateDtos.filter(item => item.IsSelected && item.FeeScheduleId === feeSchedule.FeeScheduleId);
            
            // if we have selected items, we need to update the feeSchedule 
            for (const groupDetail of selectedGroupDetails) {
                // if we have a FeeScheduleGroupDetailId and FeeScheduleGroupId
                // we need to update the existing group detail               
                if (groupDetail.FeeScheduleGroupDetailId && groupDetail.FeeScheduleGroupId !== '') {                    
                    // find the matching group
                    const groupDto = feeSchedule.FeeScheduleGroupDtos.find(group => group.FeeScheduleGroupId === groupDetail.FeeScheduleGroupId); 
                    // find the matching group detail
                    if (groupDto) {
                        const groupDetailToUpdate = groupDto.FeeScheduleGroupDetails.find(detail => detail.FeeScheduleGroupDetailId === groupDetail.FeeScheduleGroupDetailId);
                        // update this record
                        if (groupDetailToUpdate) {
                            groupDetailToUpdate.AllowedAmount = groupDetail.UpdatedAmount;
                            groupDetailToUpdate.ObjectState = saveStates.Update;
                            // update the groupDto
                            groupDto.ObjectState = saveStates.Update;                            
                        }
                    }
                } else if (groupDetail.FeeScheduleGroupId !== '') {
                    // find the matching group
                    const groupDto = feeSchedule.FeeScheduleGroupDtos.find(group => group.FeeScheduleGroupId === groupDetail.FeeScheduleGroupId);
                    if (groupDto) {
                        // add a new group detail to this group and update the groupDto
                        const newGroupDetail = {                         
                            AllowedAmount: groupDetail.UpdatedAmount,
                            FeeScheduleGroupId: groupDetail.FeeScheduleGroupId,
                            ServiceCodeId: groupDetail.ServiceCodeId,
                            ObjectState: saveStates.Add
                        } as FeeScheduleGroupDetailDto;
                        // add the new group detail to the group
                        groupDto.FeeScheduleGroupDetails.push(newGroupDetail);
                        // update the groupDto
                        groupDto.ObjectState = saveStates.Update;  
                    
                        // when adding a new group detail we may or may not need to add a new FeeScheduleDetail
                        // find the matching FeeScheduleDetail
                        const feeScheduleDetail = feeSchedule.FeeScheduleDetailDtos.find(detail => detail.ServiceCodeId === groupDetail.ServiceCodeId);
                        if (!feeScheduleDetail) {
                            // if we don't have a matching FeeScheduleDetail, we need to create a new one
                            const newFeeScheduleDetail = {
                                ServiceCodeId: groupDetail.ServiceCodeId,                                
                                IsManagedCare: true,
                                ObjectState: saveStates.Add,
                                FeeScheduleId: feeSchedule.FeeScheduleId,
                                FeeScheduleDetailId: null,
                                
                            } as FeeScheduleDetailDto;
                            feeSchedule.FeeScheduleDetailDtos.push(newFeeScheduleDetail);
                        };
                    } 
                }
            }
        }
        // now we need to save the fee schedules that have been updated or have new group details
        return this.feeScheduleDtos.filter(feeSchedule =>
            feeSchedule.FeeScheduleGroupDtos.some(groupDto =>
                groupDto.FeeScheduleGroupDetails.some(detail =>
                    detail.ObjectState === saveStates.Add || detail.ObjectState === saveStates.Update
                )
            )
        );               
    }    

    public closeModal($event) {
        this.dialogRef.events.next({
            type: 'close',
            data: null
        });
    }

    public confirmModal($event) {
        this.dialogRef.events.next({
            type: 'confirm',            
        });
    }

}


