import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'paypage-modal',
  templateUrl: './paypage-modal.component.html',
  styleUrls: ['./paypage-modal.component.scss'],
})
export class PaypageModalComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false; // Controls modal visibility
  @Input() iframeSrc: SafeUrl; // Source URL for the iframe
  @Output() close = new EventEmitter<void>(); // Emits when modal is closed from corner button
  @Output() paypageRedirectCallBackEvent = new EventEmitter<void>(); // Emits when modal is closed by Pay Page event
  @Output() iframeLoaded = new EventEmitter<void>(); // Emits when iframe loads
  paypageRedirectEvent = fromEvent(document.defaultView, 'paypageRedirectCallback');
  paypageRedirectEventSubscription;
  iframeLoadCount: number = 0;
  isLoading: boolean = true;

  @HostListener('window:beforeunload', ['$event'])
  preventRefreshPage($event) {
    if (this.isVisible) {
      $event.preventDefault();
      window.addEventListener('unload', () => {
        this.clearPaypageModal();
      });
      return;
    }
  }

  ngOnInit(): void {
    this.paypageRedirectEventSubscription = this.paypageRedirectEvent.pipe(
      tap(() => this.handlePayPageTransactionCallback())
    ).subscribe();
  }

  handlePayPageTransactionCallback(): void {
    this.paypageRedirectCallBackEvent.emit();
    this.clearPaypageModal();
  }

  onIframeLoad(): void {
    // The iframe fires two load events. During the first load, there is a black screen
    // inside the iframe. This counter just hides that from the user so they only see
    // a white background with the loader until the actual page loads
    this.iframeLoadCount++;
    if (this.iframeLoadCount > 1) {
      this.isLoading = false;
      this.iframeLoadCount = 0;
    }
  }

  closeModal(): void {
    if (window.confirm('Are you sure you want to close the paypage? All incomplete transactions will be lost.')) {
      this.clearPaypageModal();
    }
  }

  clearPaypageModal(): void {
    sessionStorage.removeItem('isPaypageModalOpen');
    this.isVisible = false;
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.paypageRedirectEventSubscription.unsubscribe();
    this.clearPaypageModal();
  }
}
