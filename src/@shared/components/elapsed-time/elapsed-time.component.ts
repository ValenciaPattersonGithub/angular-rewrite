import { Component, OnInit, Input, Inject, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'elapsed-time',
  templateUrl: './elapsed-time.component.html',
  styleUrls: ['./elapsed-time.component.scss']
})
export class ElapsedTimeComponent implements OnInit, OnDestroy {

  @Input() startTime: string;
  @Input() endTime: string;
  stop: Subscription;
  elapsedTimeString = '';

  constructor(@Inject('localize') private localize) {
  }

  ngOnInit() {
    // Start calculating elapsed time of an InTreatment appointment
    if (!this.endTime && this.startTime) {
      this.stop = interval(3000).subscribe(res => {
        this.setElapsedTime();
      });

    }

    // Stop calculating elapsed time for InTreatment appointment once appointment has finished and actual end time is provided
    if (this.endTime) {
      if (this.stop) {
        this.stop.unsubscribe();
      }
    }
  }

  ngOnDestroy(): void {
    // Stop calculation of elapsed time
    if (this.stop) {
      this.stop.unsubscribe();
    }

  }

  // Calculate the elapsed time every 1 minute
  setElapsedTime() {

    if (!this.startTime) { return; }

    // handle utc
    this.startTime = (this.startTime.lastIndexOf('Z') === this.startTime.length - 1) ? this.startTime : this.startTime + 'Z';

    let elapsedTime = '';
    const time = Date.parse(this.startTime);
    const timeNow = new Date().getTime();
    const difference = timeNow - time;
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 1) {
      elapsedTime = elapsedTime + minutes + ' ' + this.localize.getLocalizedString('Minutes Elapsed');
      this.elapsedTimeString = '(' + elapsedTime + ')';
    }

    if (minutes === 1) {
      elapsedTime = elapsedTime + minutes + ' ' + this.localize.getLocalizedString('Minute Elapsed');
      this.elapsedTimeString = '(' + elapsedTime + ')';
    }

  }

}
