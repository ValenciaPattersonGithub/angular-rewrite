import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxService } from './common/providers/rx.service';
import { RxUserSetupComponent } from './rx-user-setup/rx-user-setup.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/@shared/shared.module';



@NgModule({
  declarations: [RxUserSetupComponent],
  imports: [
    CommonModule,
    TranslateModule,
    SharedModule
  ],
  providers: [
    RxService,
    { provide: 'PersonServices', useFactory: ($injector: any) => $injector.get('PersonServices'), deps: ['$injector'] }
  ],
  entryComponents: [RxUserSetupComponent],
  exports :[RxUserSetupComponent]
})
export class RxModule { }
