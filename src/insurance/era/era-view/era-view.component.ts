import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';
import { DOCUMENT } from '@angular/common';
import { PlatformEraHttpService } from 'src/@core/http-services/platform-era-http.service';

@Component({
  selector: 'app-era-view',
  templateUrl: './era-view.component.html',
  styleUrls: ['./era-view.component.scss']
})
export class EraViewComponent implements OnInit {

  constructor(private renderer: Renderer2, 
    @Inject(DOCUMENT) private document: Document, 
    private titleService: Title, 
    @Inject('$routeParams') private route, 
    private eraService: PlatformEraHttpService
  ) { }

  eraId: string = this.route.EraId;
  carrierName: string = this.route.carrier;
  claimId: string = this.route.ClaimCommonId;
  patientName: string = this.route.patient;
  singleClaim: boolean = this.claimId != null;
  era: FullEraDto = null;

  ngOnInit(): void {
    //hide the headers, there's probably a better way to do this
    //$('body').addClass('hide-header');
    this.renderer.addClass(this.document.body, 'hide-header');
    this.titleService.setTitle(this.singleClaim ? this.patientName + " - EOB" : this.carrierName + " - eRA")
    //could use service to retrieve this when it is converted
    const practice: any = JSON.parse(sessionStorage.getItem("userPractice"));

    this.eraService.requestFullEra({ practiceId: practice.id, eraId: this.eraId }).subscribe(fullEra =>
      this.processEra(fullEra));
  }

  processEra(era: FullEraDto): void {
    if(this.singleClaim){
      for (const h of era.HeaderNumbers) {
        h.ClaimPaymentInfos = h.ClaimPaymentInfos.filter(claim => claim.ClaimCommonId == this.claimId);
        for(const c of h.ClaimPaymentInfos) {
          //convert to lodash when available. Sort by CompositeMedicalProcedureIdentifier alphabetically
          c.ServicePaymentInfos = c.ServicePaymentInfos.sort((first, second) => { 
            const a = first.CompositeMedicalProcedureIdentifier.toUpperCase();
            const b = second.CompositeMedicalProcedureIdentifier.toUpperCase();
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
          });
        }
      }
    }
    this.era = era;
  }
}

function ngOnInit() {
  throw new Error('Function not implemented.');
}
