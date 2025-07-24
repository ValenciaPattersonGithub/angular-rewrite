
export class InsuranceCredentialsDto {
    UserName:string = '';
    Password:string= '';
    DateLastModified: string= '';
  }

export class IntegrationControlDto {
    ApplicationID?:number = null;
    EntityId:string = '';
    StartDateTimeUTC: Date;
    EndDateTimeUTC?: Date;
    Feature?:string;
    Vendor?:string = '';
    PracticeId:number = null;
    LocationId?:number = null;
    Config: string='';
    DataTag: string='';
    UserModified: string='';
    DateModified?: Date;
}

export class IntegrationControlPutDto {
    ApplicationID?:number = null;
    Vendor?:string = '';
    Feature?:string;
    Config: string=''
}

  
