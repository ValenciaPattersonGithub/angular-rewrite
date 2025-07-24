import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ClaimAlertHistoryModalRef, CLAIM_ALERT_HISTORY_MODAL_DATA, ClaimAlertHistoryModalData, EClaimEventDTO } from '../claim-alert-history.models';
import { ClaimAlertHistoryHttpService } from '../claim-alert-history-http.service';
import * as moment from 'moment-timezone';
import { LocationTimeService } from 'src/practices/common/providers';
@Component({
  selector: 'claim-alert-history-modal',
  templateUrl: './claim-alert-history-modal.component.html',
  styleUrls: ['./claim-alert-history-modal.component.scss']
})
export class ClaimAlertHistoryModalComponent implements OnInit {
  claimAlertHistory: EClaimEventDTO[] = [];
  dialogHeader: string = 'Submission History';
  claimTimezone: string = null;
  claimId: string = null;
  constructor(
    public dialogRef: ClaimAlertHistoryModalRef,
    private translate: TranslateService,
    private locationTimeService: LocationTimeService,
    private claimAlertHistoryHttpService: ClaimAlertHistoryHttpService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject(CLAIM_ALERT_HISTORY_MODAL_DATA) public data: ClaimAlertHistoryModalData,
  ) { }

  ngOnInit(): void {
    this.claimId = this.data.claimId;
    this.claimTimezone = this.data.claimTimezone; 
    this.getClaimAlertHistory(this.claimId);
  }


  // show the location timezone appropriate to the claim
  setFormattedEventTime(claimAlertHistory) {
    console.log(this.claimTimezone)
    let timeZone = this.locationTimeService.findTimezoneByValue(this.claimTimezone);
    claimAlertHistory.forEach(x => { 
      x.FormattedEventTime = moment.utc(x.EventTimeUtc).tz(timeZone.momentTz).format();
    })
  }

  getClaimAlertHistory(claimId) {
    this.claimAlertHistoryHttpService.requestEClaimEvents({ claimId: claimId }).subscribe(
      claimAlertHistories => {
        this.claimAlertHistory = claimAlertHistories.Value;        
        this.claimAlertHistory.sort((a, b) => (a.EventTimeUtc < b.EventTimeUtc ? 1 : -1));
        this.setFormattedEventTime(this.claimAlertHistory);
      },
      err => {
        this.toastrFactory.error(
          this.translate.instant('Failed to retrieve Claim Alert History'),
          this.translate.instant('Error')
        );
      }
    );
  }

  cancel() {
    this.dialogRef.events.next({
      type: 'close',
    });
  }

}
