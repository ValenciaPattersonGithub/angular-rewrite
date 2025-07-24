import { Component, OnInit, Inject, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'scroll-to-top',
    templateUrl: './scroll-to-top.component.html',
    styleUrls: ['./scroll-to-top.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollToTopComponent implements OnInit {
    windowScrolled: boolean;
    constructor(
        @Inject(DOCUMENT) private document: Document,
        private cd: ChangeDetectorRef
    ) {
        this.cd.detach();
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {
        const scrolled: boolean = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) > 100;
        if( scrolled !== this.windowScrolled) {
            this.windowScrolled = scrolled;
            this.cd.detectChanges();
        }
    }

    scrollToTop() {
        (function smoothscroll() {
            var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            if (currentScroll > 0) {
                window.requestAnimationFrame(smoothscroll);
                window.scrollTo(0, currentScroll - (currentScroll / 8));
            }
        })();
    }

    ngOnInit() {}
}
