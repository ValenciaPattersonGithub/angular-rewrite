import { Pipe, PipeTransform } from '@angular/core';
import { ClaimStatus } from 'src/@core/models/claim/claim-enums.model';

@Pipe({
  name: 'claimStatusText'
})
export class ClaimStatusTextPipe implements PipeTransform {
  transform(claimStatus: ClaimStatus, ...args: any[]): any {
    switch (claimStatus) {
      case ClaimStatus.UnsubmittedPaper:
        return "Unsubmitted Paper";
      case ClaimStatus.Printed:
        return "Printed";
      case ClaimStatus.UnsubmittedElectronic:
        return "Unsubmitted Electronic";
      case ClaimStatus.InProcess:
        return "In Process";
      case ClaimStatus.AcceptedElectronic:
        return "Accepted Electronic";
      case ClaimStatus.Rejected:
        return "Rejected";
      case ClaimStatus.Closed:
        return "Closed";
      case ClaimStatus.Paid:
        return "Closed - Paid";
      case ClaimStatus.Queued:
        return "In Process";
      default:
        return "";
    }
  }
}
