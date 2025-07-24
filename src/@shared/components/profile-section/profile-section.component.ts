import { Component, OnInit, Input, ElementRef, AfterViewInit, Inject, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FuseFlag } from 'src/@core/feature-flags';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

@Component({
    selector: 'profile-section',
    templateUrl: './profile-section.component.html',
    styleUrls: ['./profile-section.component.scss']
})
export class ProfileSectionComponent implements OnInit, AfterViewInit {

    @Input() baseId: string;
    @Input() sectionTitle: string;
    @Input() count: string;
    @Input() actions: any[];
    @Input() height: string;
    @Input() showNoAccountIcon: string;
    @Input() inactive: string;
    @Input() layout: number;
    editPersonProfileMFE: boolean;
    constructor(
        private el: ElementRef,
        @Inject('FeatureService') private featureService,
        private featureFlagService: FeatureFlagService,
        private sanitizer: DomSanitizer        
    ) {
        if (!this.layout) {
            this.layout = 1;
        }
    }
    ngOnInit() {
        this.checkFeatureFlags();
    }
    ngAfterViewInit(): void {
        if (this.el.nativeElement.offsetHeight) {
            const contentSection = $(this.el).find('.profile-section .panel-body');
            contentSection.css('height', this.el.nativeElement.offsetHeight);
            contentSection.css('overflow-y', 'auto');
        }
    }

    redirectTo(path: string, actionText: string): void {
        if (path && this.editPersonProfileMFE  && actionText == 'View Flags') {
            path = path.replace('#/Patient/', '#/patientv2/');
        }
        window.location.href = this.sanitizer.sanitize(SecurityContext.URL, path);
    }

    checkFeatureFlags() {    
        this.featureFlagService.getOnce$(FuseFlag.EnableEditProfileMFEPage).subscribe((value) => {
            this.editPersonProfileMFE = value;
        });
    };
}
