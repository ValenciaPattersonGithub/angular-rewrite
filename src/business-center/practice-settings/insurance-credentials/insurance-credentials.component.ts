/* global toastr:false */
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { InsuranceCredentialsHttpService, RequestCredentialArgs } from 'src/@core/http-services/insurance-credentials-http.service';
import { IntegrationControlHttpService, RequestIntegrationControlsArgs } from 'src/@core/http-services/integration-control-http.service';
import { InsuranceCredentialsDto, IntegrationControlDto, IntegrationControlPutDto } from 'src/@core/models/integration-control.model';

@Component({
  selector: 'insurance-credentials',
  templateUrl: './insurance-credentials.component.html',
  styleUrls: ['./insurance-credentials.component.scss']
})

export class InsuranceCredentialsComponent implements OnInit {
  @Input() locationId: number;
  @Input() vendor: string;
  constructor(
    @Inject('toastrFactory') private toastrFactory,
    @Inject('patSecurityService') private patSecurityService,
    private datepipe: DatePipe,
    private translate: TranslateService,
    private confirmationModalService: ConfirmationModalService,
    public formBuilder: FormBuilder,    
    private insuranceCredentialsHttpService: InsuranceCredentialsHttpService,
    private integrationControlHttpService: IntegrationControlHttpService) { }
  frmInsuranceCredentials: FormGroup;
  integrationIsActive: boolean = false;
  insuranceCredentials: InsuranceCredentialsDto;
  integrationControls: IntegrationControlDto[];
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;
  
  showUpdateButton: boolean = false;
  enableControls: boolean = false;
  editCredentials: boolean = false;
  dateLastModifiedString: string;
  validForm: boolean = true;
  disableForm: boolean = true;
  toggleInsuranceLabel: string;
  feature: string = "InsuranceServices";

  ngOnInit(): void {
    // checkAccess
    this.checkAuthAccess();
      // initialize the form
    this.toggleInsuranceLabel = 'DXC Insurance Services';
    this.insuranceCredentials = new InsuranceCredentialsDto(); 
    this.frmInsuranceCredentials = this.formBuilder.group({
      UserName: ['', [Validators.required, Validators.minLength(1)]],
        Password: ['', [Validators.required, Validators.minLength(1)]],
    });      
    this.integrationIsActive = false;
    this.getIntegrationControl(); 
    this.getInsuranceCredentials();    
  }

  checkAuthAccess = () => {
    let hasAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizloc-edit');
    this.disableForm = !hasAccess;  
  }

  toggleInsuranceCredentials = (event) => {    
    if (event.currentTarget.checked === true) {
      // if the credentials are not already set, prompt the user to save them, otherwise just save the integration controls
      if (this.editCredentials === false){
        this.confirmActivateInsuranceCredentials();
      } else {
        this.saveIntegrationControls();             
      }
    } else {         
        this.confirmDeactivateInsuranceCredentials();
    }    
  }

  getIntegrationControl = () => {
    this.integrationControlHttpService.requestIntegrationControls({ locationId: this.locationId }).subscribe(controls => {
    // if there are rows in the list, determine if one has InsuranceServices
    this.integrationControls = controls.Value; 
    const hasIntegration = this.integrationControls.find(x => x.Feature.toLowerCase() === 'insuranceservices' && x.Vendor.toLowerCase() === 'dentalxchange'); 
    if (hasIntegration) {
        this.integrationIsActive = true;
      } else {
          this.integrationIsActive = false;
      }      
    }, (err) => {
      this.toastrFactory.error(this.translate.instant('Failed to get integration controls.'),
        this.translate.instant('Server Error'));      
    });
  }

  loadCredentials = (credentials) => {
    this.insuranceCredentials.UserName = credentials.Result.Username;
    this.insuranceCredentials.Password = credentials.Result.Password;
    this.insuranceCredentials.DateLastModified = credentials.Result.DateLastModified;
  }
  
  getInsuranceCredentials = () => {
    const args: RequestCredentialArgs = {
      locationId: this.locationId,
      vendor: this.vendor
    }
    this.insuranceCredentialsHttpService.requestInsuranceCredentials(args).subscribe(creds => {
      if (!creds) {
        this.showUpdateButton = false;
        this.enableControls = true;
      }
      else {
        this.loadCredentials(creds);
        this.setActiveForm();
        // denotes that this is an existing set of credentials
        this.editCredentials = true;
        this.showUpdateButton = true;
      }
    }, (err) => {

      this.showUpdateButton = false;
      this.enableControls = true;
      this.toastrFactory.error(this.translate.instant('Failed to get insurance credentials.'),
        this.translate.instant('Server Error'));
    });
  }

    saveInsuranceCredentials = () => {
      if (this.validateForm()) {
        const args: RequestCredentialArgs = {
          locationId: this.locationId,
          vendor: this.vendor
          }

          let body: InsuranceCredentialsDto = { UserName: this.frmInsuranceCredentials.controls['UserName'].value, Password: this.frmInsuranceCredentials.controls['Password'].value, DateLastModified: null };
          this.insuranceCredentialsHttpService.processInsuranceCredentialsDto(args, body).subscribe(creds => {
          this.toastrFactory.success(this.translate.instant("Insurance credentials saved successfully."),
            this.translate.instant('Success'));
            // then reload the form
              this.getInsuranceCredentials();
              this.enableControls = false;
            
        }, (err) => {
          this.toastrFactory.error(this.translate.instant('Failed to create insurance credentials.'),
            this.translate.instant('Server Error'));
        });
      };
   // }    
  }

  setControlsEnabled = () => {
    this.showUpdateButton = false;
    this.enableControls = true;
  }

  loadIntegrationControlPutDto = () => {
    let integrationControlPutDto = new IntegrationControlPutDto();
    integrationControlPutDto.ApplicationID = 2;
    integrationControlPutDto.Vendor = 'DentalXchange';
    integrationControlPutDto.Feature = this.feature;
    integrationControlPutDto.Config = '';
    return integrationControlPutDto;    
  }
  
  // My need to revisit DentalXChange vs DentalXchange
  saveIntegrationControls = () => {
    const integrationControlPutDto = this.loadIntegrationControlPutDto();
    const args: RequestIntegrationControlsArgs = {
      locationId: this.locationId,
      vendor: 'DentalXchange',
      feature: this.feature
    };
    this.integrationControlHttpService.processIntegrationControls(args, integrationControlPutDto ).subscribe(controls => {
      this.toastrFactory.success(this.translate.instant('All Insurance eServices are activated "eClaim, Attachments, ERA, RTE"'),
        this.translate.instant('Success'));
    }, (err) => { 
      // if the save fails, we need to reset the toggle 
      console.log(this.integrationIsActive);
      this.integrationIsActive = !this.integrationIsActive; 
      console.log(this.integrationIsActive);
      this.toastrFactory.error(this.translate.instant('Failed to activate Insurance eServices.'),
        this.translate.instant('Server Error'));      
    });
  }

  deleteIntegrationControls = () => {
    const args: RequestIntegrationControlsArgs = {
      locationId: this.locationId,
      vendor: 'DentalXchange',
      feature: this.feature
    };
    this.integrationControlHttpService.deleteIntegrationControls(args).subscribe(controls => {      
    }, (err) => { 
      // if the delete fails, we need to reset the toggle  
      this.integrationIsActive = !this.integrationIsActive; 
      this.toastrFactory.error(this.translate.instant('Failed to save integration controls.'),
        this.translate.instant('Server Error'));      
    });
  }

  cancel = () => {
    this.showUpdateButton = this.editCredentials ? true : false;
    // re-load the formgroup
    this.frmInsuranceCredentials = this.formBuilder.group({
      UserName: [this.insuranceCredentials?.UserName, [Validators.required, Validators.minLength(1)]],
      Password: [this.insuranceCredentials?.Password, [Validators.required, Validators.minLength(1)]],
    });
   // this.enableControls = false;
  }

  // prompt user to save before taking next action
  confirmActivateInsuranceCredentials = () => {
    let data = {
      header: this.translate.instant('Activating Insurance Services'),
      message: this.translate.instant('Please update the username and password generated on DentalXchange portal for Insurance Services. '),
      message3: this.translate.instant('Note: It may take up to 10 minutes for the \'Insurance eServices\' to become active in Fuse.'),
      confirm: this.translate.instant('Ok'),
      cancel: this.translate.instant('Cancel'),
      height: 225,
      width: 620,
    }
    this.confirmationRef = this.confirmationModalService.open({
      data
    });
    this.confirmationModalSubscription = this.confirmationRef.events.pipe(
      filter((event) => !!event),
      filter((event) => {
        return event.type === 'confirm' || event.type === 'close';
      }),
      take(1)
    ).subscribe((events) => {
      switch (events.type) {
        case 'confirm':
          this.saveIntegrationControls();
          this.confirmationRef.close();
          break;
        case 'close':
          this.confirmationRef.close();
          break;
      }
    });
  }

  confirmDeactivateInsuranceCredentials = () => {
    let data = {
      header: this.translate.instant('Deactivating Insurance Services'),
      message: this.translate.instant('This action will disable all Insurance eServices : “eClaim, Attachments, ERA, RTE“. '),
      message2: this.translate.instant('Note: It may take up to 10 minutes for the \'Insurance eServices\' to deactivate in Fuse.'),
      confirm: this.translate.instant('Acknowledge'),
      cancel: this.translate.instant('Cancel'),
      height: 250,
      width: 650,
    }
    this.confirmationRef = this.confirmationModalService.open({
      data
    });
    this.confirmationModalSubscription = this.confirmationRef.events.pipe(
      filter((event) => !!event),
      filter((event) => {
        return event.type === 'confirm' || event.type === 'close';
      }),
      take(1)
    ).subscribe((events) => {
      switch (events.type) {
        case 'confirm':
          this.deleteIntegrationControls();
          this.confirmationRef.close();
          break;
        case 'close':
          // if not confirmed we need to reset the toggle  
          this.integrationIsActive = true; 
          this.confirmationRef.close();
          break;
      }
    });
  }

  setActiveForm= () => {
    if (this.insuranceCredentials) {
      this.frmInsuranceCredentials = this.formBuilder.group({
        UserName: [this.insuranceCredentials?.UserName, [Validators.required, Validators.minLength(1)]],
        Password: [this.insuranceCredentials?.Password, [Validators.required, Validators.minLength(1)]],
      });
        if (this.insuranceCredentials.DateLastModified) {
            this.dateLastModifiedString = `Last Credentials update on ${this.datepipe.transform(this.insuranceCredentials.DateLastModified, 'yyyy-MM-dd HH:mm:ss')}`;
      }
      
    } else {
      this.frmInsuranceCredentials = this.formBuilder.group({
        UserName: ['', [Validators.required, Validators.minLength(1)]],
        Password: ['', [Validators.required, Validators.minLength(1)]],
      });
    }    
  }

  // obsolete? i dont see that this is used
  setDeactivatedForm= () => {
    if (this.editCredentials) {
      this.frmInsuranceCredentials = this.formBuilder.group({
          UserName: [''],
          Password: [''],
      });
      this.enableControls = true;
      this.showUpdateButton = false;
      this.integrationIsActive = false;
    }
  }

  validateForm = () => {
    if (this.integrationIsActive === false) {
      // no validation
      return true;
    } else {
      this.insuranceCredentials.UserName = this.frmInsuranceCredentials.controls['UserName'].value;
      this.insuranceCredentials.Password = this.frmInsuranceCredentials.controls['Password'].value;
      if (this.insuranceCredentials.UserName.length >= 1 && this.insuranceCredentials.Password.length >= 1) {
        this.validForm = true;
        return true;        
      }
      this.validForm = false;
      return false;
    }
  }
}



