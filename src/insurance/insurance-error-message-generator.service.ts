import { Injectable } from '@angular/core';
import { InvalidPropertyInfo } from 'src/@core/models/base-models.model';

// ErrorMessages specific to the attachment process
export class AttachErrorMessages {
  primaryMessage: string;
  detailMessage?: string;
}

export enum ObjectState {
  Add = 'Add',
  Delete = 'Delete',
  None = 'None',
}

// Only the portion of this class used for attachment errors, for now
export class ClaimAttachmentHeaderDto {
  AllSucceeded: boolean;
  Attachments: ClaimAttachmentDto[];
  NarrativeErrorDetail?: ClaimAttachmentErrorDto;
}

// Only the portion of this class used for errors, for now
export class ClaimAttachmentDto {
  ObjectState: ObjectState;
  Attached: boolean;
  Filename: string;
  ErrorDetail?: ClaimAttachmentErrorDto;
}

export class ClaimAttachmentErrorDto {
  ErrorCode: ErrorCode;
  ProblemSource: ProblemSource;
  Detail: string;
  InvalidProperties?: InvalidPropertyInfo[];
}

export enum ProblemSource {
  ClearingHouseVendor = 'ClearingHouseVendor',
  ImageProvider = 'ImageProvider',
  FileAPI = 'FileAPI',
  CAPI = 'CAPI',
  SAPI = 'SAPI',
  OtherSource = 'OtherSource',
}

export enum ErrorCode {
  CredentialsBadExpired = 'CredentialsBadExpired',
  CredentialsMissing = 'CredentialsMissing',
  GeneralAuth = 'GeneralAuth',
  ServiceUnavailable = 'ServiceUnavailable',
  TransientServiceFailure = 'TransientServiceFailure',
  ConnectionFailure = 'ConnectionFailure',
  ResponseTimeout = 'ResponseTimeout',
  InvalidInput = 'InvalidInput',
  InvalidImageType = 'InvalidImageType',
  InvalidResponseStatus = 'InvalidResponseStatus',
  ValidationFailure = 'ValidationFailure',
  ResourceNotFound = 'ResourceNotFound',
  ImageRetrieval = 'ImageRetrieval',
  PayerNotSupported = 'PayerNotSupported',
  OtherException = 'OtherException',
  TxtFileSizeExceeded = 'TxtFileSizeExceeded',
  PayerInvalid = 'PayerInvalid',
  PayerNotResponding = 'PayerNotResponding',
  InvalidClient = 'InvalidClient',
  ServiceNotAllowed = 'ServiceNotAllowed',
}

export class ProblemDetails {
  detail: string;
  instance: string;
  statusCode: number;
  title: string;
  type: string;
  errorCode: ErrorCode;
  problemSource: ProblemSource;
  dataObject: object;
}

@Injectable({
  providedIn: 'root',
})
export class InsuranceErrorMessageGeneratorService {
  messageByErrorCode: { [id: string]: string } = {};

  constructor() {
    // This is a placeholder for clearinghouse vendor name, assuming Dental Exchange is the vendor for now
    // should we call integration control to get the clearinghouse vendor name?
    var clearingHouseVendorName = 'DentalXchange';
    this.messageByErrorCode[
      ErrorCode.CredentialsBadExpired
    ] = `${clearingHouseVendorName} credentials are bad or expired.  Please update under Practice Settings > Locations.`;
    this.messageByErrorCode[
      ErrorCode.CredentialsMissing
    ] = `${clearingHouseVendorName} credentials were not configured for this patient's location.  Please update under Practice Settings > Locations.`;
    this.messageByErrorCode[ErrorCode.GeneralAuth] = 'Authentication Failure.  Retry later or contact Support.';
    this.messageByErrorCode[
      ErrorCode.ServiceUnavailable
    ] = `The ${clearingHouseVendorName} service is currently unavailable.  Please retry again later.`;
    this.messageByErrorCode[
      ErrorCode.ServiceNotAllowed
    ] = `The ${clearingHouseVendorName} service is unavailable.  Please contact Support.`;
    this.messageByErrorCode[
      ErrorCode.InvalidClient
    ] = `The ${clearingHouseVendorName} client id is invalid.  Please retry later or contact Support.`;
    this.messageByErrorCode[ErrorCode.TransientServiceFailure] =
      'The service reported an unexpected error.  Retry later or contact Support.';
    this.messageByErrorCode[ErrorCode.ConnectionFailure] = 'Connection Failure.  Retry later or contact Support.';
    this.messageByErrorCode[ErrorCode.ResponseTimeout] =
      'Timeout in transit - file size may be a factor.  Retry later or contact Support. ' +
      'If this happens repeatedly for this claim, consider attaching from a screen-capture instead.';
    this.messageByErrorCode[ErrorCode.InvalidInput] = this.messageByErrorCode[ErrorCode.InvalidResponseStatus] =
      `The patient information was not recognized as valid by ${clearingHouseVendorName}.`;
    this.messageByErrorCode[ErrorCode.InvalidImageType] =
      'The image type sent is not supported.  Please contact Support.';
    this.messageByErrorCode[ErrorCode.ValidationFailure] = 'The request was rejected.  Please contact Support.';
    this.messageByErrorCode[ErrorCode.ResourceNotFound] =
      'The resource requested was not found.  Retry later or contact Support.';
    this.messageByErrorCode[ErrorCode.ImageRetrieval] = 'Unexpected error.  Retry or contact Support';
    this.messageByErrorCode[ErrorCode.PayerNotSupported] =
      "The carrier for this claim is not supported.  See the resource titled 'Attachment Error: Carrier Not Supported for next steps.'";
    this.messageByErrorCode[ErrorCode.TxtFileSizeExceeded] = 'Failed to upload the txt file.   ';
    this.messageByErrorCode[
      ErrorCode.PayerInvalid
    ] = `Payer information was not recognized by ${clearingHouseVendorName}.  Please validate in the Fuse Carrier page.`;
    this.messageByErrorCode[ErrorCode.PayerNotResponding] = 
      `The selected payer is currently experiencing problems and is unable to respond.  Please retry again later.`;
    this.messageByErrorCode[ErrorCode.OtherException] = 'Unexpected error.  Retry or contact Support.';
  }

  // This method is used to generate error messages for the attachment process
  determineErrorMessages(headerDto: ClaimAttachmentHeaderDto): AttachErrorMessages | null {
    if (headerDto.AllSucceeded) return null;

    const attachRequests = headerDto.Attachments.filter(x => x.ObjectState == ObjectState.Add);
    const deleteRequests = headerDto.Attachments.filter(x => x.ObjectState == ObjectState.Delete);
    const successfulAttachments: number = attachRequests.filter(x => x.Attached && !x.ErrorDetail).length;
    const firstFailedAttach = attachRequests.find(x => x.ErrorDetail);
    const firstFailedDelete = deleteRequests.find(x => x.ErrorDetail);

    // If any attachments were successfully transmitted, but not all, we need to report that.
    if (successfulAttachments && firstFailedAttach) {
      const errorMessages = this.createMessagesForErrorDto(firstFailedAttach.ErrorDetail, firstFailedAttach.Filename);
      errorMessages.primaryMessage = `Only ${successfulAttachments} of ${attachRequests.length} attachments successful.  The first error was: ${errorMessages.primaryMessage}`;

      return errorMessages;
    } else if (!firstFailedAttach && firstFailedDelete) {
      const errorMessages = this.createMessagesForErrorDto(firstFailedDelete.ErrorDetail, firstFailedDelete.Filename);
      errorMessages.primaryMessage = `Unable to remove one or more attachments from the claim with the clearinghouse:  ${errorMessages.primaryMessage}`;
      return errorMessages;
    } else if (firstFailedAttach) {
      return this.createMessagesForErrorDto(firstFailedAttach.ErrorDetail, firstFailedAttach.Filename);
    } else if (headerDto.NarrativeErrorDetail) {
      const failureString =
        this.messageByErrorCode[headerDto.NarrativeErrorDetail.ErrorCode] ??
        this.messageByErrorCode[ErrorCode.OtherException];
      return {
        primaryMessage: `Any requested file changes were successful, but an error occurred updating the narrative: ${failureString}`,
      };
    } else return null; // shouldn't happen, but no need to blow up
  }

  // this method is used to generate error messages for the attachment process
  private createMessagesForErrorDto(
    errorDto: ClaimAttachmentErrorDto,
    filename: string | undefined
  ): AttachErrorMessages {
    const messages = new AttachErrorMessages();
    messages.primaryMessage = this.createErrorMessage(errorDto.ProblemSource, errorDto.ErrorCode, filename);
    messages.detailMessage = errorDto.Detail;
    return messages;
  }

  // This method is used to generate error messages for the attachment process
  private createErrorMessage(problemSource: string, errorCode: string, filename: string | undefined): string {
    let message: string;
    filename = filename ?? 'a file';
    const failureString = this.messageByErrorCode[errorCode] ?? this.messageByErrorCode[ErrorCode.OtherException];

    if (problemSource == ProblemSource.ImageProvider)
      message = `An error occurred retrieving ${filename} from the imaging provider: ${failureString}`;
    else if (problemSource == ProblemSource.ClearingHouseVendor && errorCode == ErrorCode.PayerNotSupported)
      message = `An error occurred sending file to the clearinghouse: ${failureString}`;
    else if (problemSource == ProblemSource.ClearingHouseVendor)
      message = `An error occurred sending ${filename} to the clearinghouse: ${failureString}`;
    else if (problemSource == ProblemSource.SAPI && errorCode == ErrorCode.TxtFileSizeExceeded)
      message = `${failureString} ${filename} must be less than 100 KB.`;
    else message = 'An unexpected error occurred during attachment processing.  Please retry or contact Support.';

    return message;
  }

  // This method is used to generate error messages for the check payer process
  createErrorMessageForCheckPayer(problemDetails: ProblemDetails): string {
    const failureString =
      this.messageByErrorCode[problemDetails.errorCode] ?? this.messageByErrorCode[ErrorCode.OtherException];
    return 'Unable to check Carrier Eligibility: ' + failureString;
  }
}
