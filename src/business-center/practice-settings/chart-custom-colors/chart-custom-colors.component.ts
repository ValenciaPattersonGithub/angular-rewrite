import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';

import { ToastService } from '../../../@shared/components/toaster/toast.service';
import { ChartColorsHttpService } from './chart-custom-colors-http.service';

@Component({
    selector: 'chart-custom-colors',
    templateUrl: './chart-custom-colors.component.html',
    styleUrls: ['./chart-custom-colors.component.scss']
})
export class ChartCustomColorsComponent implements OnInit {        
    sortOrder: any;
    chartColorsItems: any[] = [];
    isApplyEnabled: boolean = false;
    hasEditAmfa: boolean = false;
    isSaving: boolean = false;    
    breadCrumbs = [
        {
            name: 'Practice Settings',
            path: '#/BusinessCenter/PracticeSettings/',
            title: 'Practice Settings'
        },
        {
            name: 'Chart Colors',
            path: '/BusinessCenter/ChartColors/',
            title: 'Manage Chart Colors'
        }
    ];

    statusColorDefaults: any[] = [
        { status: "Proposed/Pending", color: "#ea4b35" },
        { status: "Accepted", color: "#9d2c1c" },
        { status: "Referred", color: "#9c56b9" },
        { status: "Referred Completed", color: "#5a2670" },
        { status: "Rejected", color: "#6c5547" },
        { status: "Completed", color: "#1aaf5d" },
        { status: "Existing", color: "#000000" },
        { status: "Condition Present", color: "#2c97dd" },
        { status: "Condition Resolved", color: "#14527a" }
    ];

    originalSortOrder: any[] = ["Proposed/Pending", "Accepted", "Referred", "Referred Completed",
    "Rejected", "Completed", "Existing", "Condition Present", "Condition Resolved"]


    constructor(
        private chartColorsHttpService: ChartColorsHttpService,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('DiscardChangesService') private discardChangesService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.sortOrder = 0;        
        this.getEditPermissions();
        this.registerController();

        this.chartColorsHttpService.getAllChartColors().subscribe(
            data => {
                this.chartColorsItems = data.Value;                
                this.setResetColorDisabledStatus();
            },
            error => { });;                
    }

    registerController() {
        this.discardChangesService.onRegisterController({
            controller: 'ChartCustomColorsController',
            hasChanges: false
        });
    };

    registerControllerHasChanges(canSave) {
        if (this.discardChangesService.currentChangeRegistration !== null &&
            this.discardChangesService.currentChangeRegistration.hasChanges != canSave) {
            if (this.discardChangesService.currentChangeRegistration.controller === 'ChartCustomColorsController') {
                this.discardChangesService.currentChangeRegistration.hasChanges = canSave;                
            }
        }
    };

    getEditPermissions() {
        if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-chclrs-edit')) {
            this.hasEditAmfa = true;            
        } else {            
            this.hasEditAmfa = false;            
        }
    }

    resetColorToDefault(colorToReset) {
        if (!colorToReset.isDisabled && this.hasEditAmfa) {
            var newColor = '';
            switch (colorToReset.StatusName) {
                case "Proposed/Pending":
                    newColor = "#ea4b35";
                    break;
                case "Accepted":
                    newColor = "#9d2c1c";
                    break;
                case "Referred":
                    newColor = "#9c56b9";
                    break;
                case "Referred Completed":
                    newColor = "#5a2670";
                    break;
                case "Rejected":
                    newColor = "#6c5547";
                    break;
                case "Completed":
                    newColor = "#1aaf5d";
                    break;
                case "Existing":
                    newColor = "#000000";
                    break;
                case "Condition Present":
                    newColor = "#2c97dd";
                    break;
                case "Condition Resolved":
                    newColor = "#14527a";
                    break;
            }

            this.colorChanged(colorToReset, newColor);                       
        }        
    }

    colorChanged(chartingColorObject, newColor) {
        if (chartingColorObject.Color != newColor) {
            chartingColorObject.Color = newColor;
            this.isApplyEnabled = true;
            this.registerControllerHasChanges(true);
        }
        
        this.setResetColorDisabledStatus();
    }

    saveColorChanges() {
        this.isApplyEnabled = false;
        this.isSaving = true;
        this.chartColorsHttpService.update(this.chartColorsItems).subscribe(
            data => {                
                data.Value.forEach(result => {
                    var indexMatchChartColorsItems = this.chartColorsItems.findIndex(x => x.StatusName == result.StatusName);

                    if (indexMatchChartColorsItems >= 0) {
                        this.chartColorsItems[indexMatchChartColorsItems] = result;
                    }
                });                
                this.registerControllerHasChanges(false);
                this.isSaving = false;

                this.setResetColorDisabledStatus();
                this.toastService.show({
                    type: 'success',
                    title: ' Chart Colors Updated',
                },
                    true
                );
            },
            error => {
                
                if (error && error.status === 409) {                    
                    this.toastService.show({
                        type: 'error',
                        title: ' Another user has updated chart colors. Please refresh the page.',                        
                    },
                        false
                    );

                    
                }
                else if (error) {
                    console.log(error);
                    this.toastService.show({
                        type: 'error',
                        title: ' An error has occurred while updating chart colors. Please refresh the page and try again',                        
                    },
                        false
                    );

                }
                
                this.hasEditAmfa = false;
                this.registerControllerHasChanges(false);                
            });
    }

    changeSortOrder() {
        if (this.sortOrder == 2) { //Descending{
            this.sortOrder = 0;

            var sortedList = [];
            this.originalSortOrder.forEach(x => {
                var chartColor = this.chartColorsItems.find(color => color.StatusName == x);

                if (chartColor) {
                    sortedList.push(chartColor);
                }
            });
            
            this.chartColorsItems = cloneDeep(sortedList);
        }
        else {
            this.sortOrder = this.sortOrder + 1;

            if (this.sortOrder == 1) {
                this.chartColorsItems = this.chartColorsItems.sort((a, b) => (a.StatusName > b.StatusName) ? 1 : -1);
            }
            else {
                this.chartColorsItems = this.chartColorsItems.sort((a, b) => (a.StatusName > b.StatusName) ? -1 : 1);
            }
        }

        this.setResetColorDisabledStatus();
    }

    setResetColorDisabledStatus() {
        this.chartColorsItems.forEach(color => {
            switch (color.StatusName) {
                case "Proposed/Pending":
                    if (color.Color == "#ea4b35") {
                        color.isDisabled = true
                    }
                    else {
                        color.isDisabled = false;
                    }
                    break;
                case "Accepted":                    
                    if (color.Color == "#9d2c1c") {
                        color.isDisabled = true
                    }
                    else {
                        color.isDisabled = false;
                    }
                    break;
                case "Referred":                    
                    if (color.Color == "#9c56b9") {
                        color.isDisabled = true
                    }
                    else {
                        color.isDisabled = false;
                    }
                    break;
                case "Referred Completed":                    
                    if (color.Color == "#5a2670") {
                        color.isDisabled = true
                    }
                    else {
                        color.isDisabled = false;
                    }
                    break;
                case "Rejected":                    
                    if (color.Color == "#6c5547") {
                        color.isDisabled = true
                    }
                    else {
                        color.isDisabled = false;
                    }
                    break;
                case "Completed":                    
                    if (color.Color == "#1aaf5d") {
                        color.isDisabled = true
                    }
                    else {
                        color.isDisabled = false;
                    }
                    break;
                case "Existing":                    
                    if (color.Color == "#000000") {
                        color.isDisabled = true
                    }
                    else {
                        color.isDisabled = false;
                    }
                    break;
                case "Condition Present":                    
                    if (color.Color == "#2c97dd") {
                        color.isDisabled = true
                    }
                    else {
                        color.isDisabled = false;
                    }
                    break;
                case "Condition Resolved":                    
                    if (color.Color == "#14527a") {
                        color.isDisabled = true
                    }
                    else {
                        color.isDisabled = false;
                    }
                    break;
            }
        });       
    }

    ngOnDestroy() {        
        this.toastService.close()
        this.registerControllerHasChanges(false);
    }

}
