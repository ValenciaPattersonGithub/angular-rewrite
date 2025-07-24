import { Component, Inject, Input, OnChanges, OnDestroy, SecurityContext, SimpleChanges } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PatSharedService } from 'src/@shared/providers';

@Component({
  selector: 'app-uib-modal',
  templateUrl: './app-uib-modal.component.html',
  styleUrls: ['./app-uib-modal.component.scss']
})
export class AppUibModalComponent implements OnChanges, OnDestroy, ControlValueAccessor {
  uibModalInstance; //No data type found for this
  @Input() isVisible: boolean;
  @Input() controllerName: string;
  @Input() templateUrlPath: string;

  constructor(@Inject('$uibModal') private uibModal,
    @Inject('toastrFactory') private toastrFactory,
    private translate: TranslateService,
    private patSharedService: PatSharedService) { }

  // Support ControlValueAccessor in Reactive Form
  writeValue() { }
  onChange = () => { };
  onTouched = () => { };

  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  registerOnChange(fn) {
    this.onChange = fn;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isVisible && changes.isVisible?.currentValue) {
      this.showModal();
    }
    else {
      if (this.uibModalInstance) {
        this.uibModalInstance?.dismiss();
      }
    }
  }

  showModal = () => {
    if (this.templateUrlPath?.length > 0 && this.controllerName?.length > 0) {
      const templateUrl = this.patSharedService.sanitizeInput(SecurityContext.HTML, this.templateUrlPath);
      if (templateUrl?.trim()?.length > 0) {
        this.uibModalInstance = this.uibModal.open({
          animation: true,
          ariaLabelledBy: 'modal-title',
          ariaDescribedBy: 'modal-body',
          templateUrl: templateUrl,
          controller: this.controllerName,
          bindtoController: true,
          size: 'xl',
          backdrop: 'static',
          keyboard: false,
          windowClass: 'uib-modal-display'
        });
      }
    }
    else {
      //Display user error message if missing templateUrlPath or controllerName
      let message = "";
      if (this.templateUrlPath?.length <= 0 && this.controllerName?.length <= 0) {
        message = "templateUrl and controllerName not provided";
      }
      else if (this.templateUrlPath?.length <= 0) {
        message = "templateUrl not provided";
      }
      else if (this.controllerName?.length <= 0) {
        message = "controllerName not provided";
      }
      else {
        message = "refresh the page and try again";
      }
      this.toastrFactory?.error(this.translate.instant(message), this.translate.instant('error'));
    }
  }

  ngOnDestroy(): void {
    if (this.uibModalInstance) {
      this.uibModalInstance?.dismiss();
    }
  }
}
