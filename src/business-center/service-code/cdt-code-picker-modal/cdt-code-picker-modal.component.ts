import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ViewChild } from '@angular/core';
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
import { CDTCodeModel } from '../cdtcodepickermodel';
import { Search1Pipe } from 'src/@shared/pipes/search1/search1.pipe';
import { CdtCodeService } from '../../../@shared/providers/cdt-code.service';

declare var angular: angular.IAngularStatic;
declare var _: any;

@Component({
  selector: 'cdt-code-picker-modal',
  templateUrl: './cdt-code-picker-modal.component.html',
  styleUrls: ['./cdt-code-picker-modal.component.scss'],
})
export class CdtCodePickerModalComponent implements OnInit {
  @Output()
  closeModal: EventEmitter<CDTCodeModel> = new EventEmitter<CDTCodeModel>();

  @ViewChild('templateRef') templateElement: TemplateRef<NgTemplateOutlet>;
  ctdCodeModel: CDTCodeModel;
  dialog: DialogRef;
  loadingCodes: boolean = false;
  filteringCodes: boolean = false;
  cdtCodes: CDTCodeModel[] = [];
  filterCDTCodes: CDTCodeModel[] = [];
  filteringMessageNoResults: string = '';
  loadingMessageNoResults: string = '';
  searchCdtCodesKeyword: string = '';
  orderBy = {
    field: '',
    asc: true,
  };

  constructor(
    @Inject('localize') private localize,
    @Inject('toastrFactory') private toastrFactory,
    private dialogService: DialogService,
    private searchPipe: Search1Pipe,
    private cdtCodeService: CdtCodeService
  ) {}

  ngOnInit(): void {
    this.loadingCodes = true;
    this.filteringCodes = false;
    this.filteringMessageNoResults = this.localize.getLocalizedString(
      'There are no {0} that match the filter.',
      ['CDT Codes']
    );
    this.loadingMessageNoResults = this.localize.getLocalizedString(
      'There are no {0}.',
      ['CDT Codes']
    );
    this.getList();
  }

  cdtCodeGetAllSuccess = successResponse => {
    this.loadingCodes = false;
    this.filteringCodes = true;
    this.cdtCodes = successResponse.Value;
    this.filterCDTCodes = this.cdtCodes;
  };

  cdtCodeGetAllFailure = () => {
    this.loadingCodes = false;
    this.toastrFactory.error(
      this.localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again.',
        ['CDT Codes']
      ),
      this.localize.getLocalizedString('Server Error')
    );
  };

  //Used to filter data source and display message from no result component if not data found
  getFilterCDTLength = event => {
    if (event != '') {
      this.filterCDTCodes = this.searchPipe.transform(this.cdtCodes, {
        Code: event,
        Description: event,
      });
    } else {
      this.filterCDTCodes = this.cdtCodes;
    }
  };

  getList = () => {
    this.cdtCodeService.getList().then(
      res => {
        this.cdtCodeGetAllSuccess(res);
      },
      err => {
        this.cdtCodeGetAllFailure();
      }
    );
  };

  openPreviewDialog = () => {
    if (this.dialogService) {
      this.dialog = this.dialogService.open({
        content: this.templateElement,
      });
    }

    if (this.dialog.result) {
      this.dialog.result.subscribe((result: any) => {
        if (!result.primary) {
          this.dialog.close();
        }
      });
    }
  };

  close = () => {
    this.searchCdtCodesKeyword = '';
    this.dialog.close();
  };

  changeSortingForGrid = field => {
    var asc = this.orderBy.field === field ? !this.orderBy.asc : true;
    this.orderBy = { field: field, asc: asc };
  };

  onSelectCode = ctdCode => {
    this.searchCdtCodesKeyword = '';
    this.dialog.close();
    this.closeModal.emit(ctdCode);
  };
}
