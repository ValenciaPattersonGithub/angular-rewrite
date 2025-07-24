import { Component, OnInit, Inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'solution-reach',
    templateUrl: './solution-reach.component.html',
    styleUrls: ['./solution-reach.component.scss']
})
export class SolutionReachComponent implements OnInit {
    public secureUrl: SafeResourceUrl;
    solutionReachUrl = 'https://app.solutionreach.com?externalToken=';
    constructor(
        private sanitizer: DomSanitizer,
        @Inject('patAuthenticationService') private patAuthenticationService,
    ) {

    }
    async ngOnInit() {
        this.secureUrl = await this.getIframeURL();
    }
    private getIframeURL = async () => {
        let token = '';
        if (this.patAuthenticationService) {
            token = this.patAuthenticationService.getCachedToken();
            if (!this.isTokenExpired(token)) {
                token = await this.triggerRefeshAndWait()
            }
        }
        if (this.solutionReachUrl) {
            return this.sanitizer
                .bypassSecurityTrustResourceUrl(`${this.solutionReachUrl}${token}`);
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    async triggerRefeshAndWait() {
        await this.patAuthenticationService.refresh()

        let token = this.patAuthenticationService.getCachedToken()

        if (this.isTokenExpired(token)) {
            return await this.triggerRefeshAndWait();
        }
        else {
            return token;
        }
    }

    isTokenExpired(token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp < currentTime;
    }

}
