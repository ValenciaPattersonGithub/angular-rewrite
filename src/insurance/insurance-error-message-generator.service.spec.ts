import { ProblemDetails } from './insurance-error-message-generator.service';
import {
  ErrorCode,
  ProblemSource,
  ClaimAttachmentHeaderDto,
  InsuranceErrorMessageGeneratorService,
  ObjectState,
} from './insurance-error-message-generator.service';

describe('InsuranceErrorMessageGeneratorService', () => {
  let service: InsuranceErrorMessageGeneratorService;

  beforeEach(() => {
    service = new InsuranceErrorMessageGeneratorService();
  });

  describe('determineErrorMessages', () => {
    it('should return null if headerDto.AllSucceeded is true', () => {
      const headerDto: ClaimAttachmentHeaderDto = {
        AllSucceeded: true,
        Attachments: [],
      };
      const result = service.determineErrorMessages(headerDto);
      expect(result).toBeNull();
    });

    it('should generate a message indicating success/failure counts if some but not all attachments succeeded', () => {
      const attach1 = {
        ObjectState: ObjectState.Add,
        Attached: true,
        Filename: 'test.jpg',
      };
      const attach2 = {
        ObjectState: ObjectState.Add,
        Attached: false,
        Filename: 'test2.jpg',
        ErrorDetail: {
          ErrorCode: ErrorCode.InvalidInput,
          ProblemSource: ProblemSource.FileAPI,
          Detail: 'Invalid input',
          InvalidProperties: [],
        },
      };
      const headerDto: ClaimAttachmentHeaderDto = {
        AllSucceeded: false,
        Attachments: [attach1, attach2],
      };
      const result = service.determineErrorMessages(headerDto);

      expect(result.primaryMessage).toEqual(
        'Only 1 of 2 attachments successful.  The first error was: An unexpected error occurred during attachment processing.  Please retry or contact Support.'
      );
      expect(result.detailMessage).toEqual('Invalid input');
    });

    it('should generate a remove error if no attach failures but there was a delete failure', () => {
      const attach1 = {
        ObjectState: ObjectState.Add,
        Attached: true,
        Filename: 'test.jpg',
      };
      const attach2 = {
        ObjectState: ObjectState.Delete,
        Attached: false,
        Filename: 'test2.jpg',
        ErrorDetail: {
          ErrorCode: ErrorCode.ResourceNotFound,
          ProblemSource: ProblemSource.ClearingHouseVendor,
          Detail: 'Invalid input',
          InvalidProperties: [],
        },
      };
      const headerDto: ClaimAttachmentHeaderDto = {
        AllSucceeded: false,
        Attachments: [attach1, attach2],
      };
      const result = service.determineErrorMessages(headerDto);

      expect(result.primaryMessage).toEqual(
        'Unable to remove one or more attachments from the claim with the clearinghouse:  An error occurred sending test2.jpg to the clearinghouse: The resource requested was not found.  Retry later or contact Support.'
      );
      expect(result.detailMessage).toEqual('Invalid input');
    });

    it('should generate error messages for the first error only, if all attachments failed', () => {
      const attach1 = {
        ObjectState: ObjectState.Add,
        Attached: false,
        Filename: 'test.jpg',
        ErrorDetail: {
          ErrorCode: ErrorCode.CredentialsBadExpired,
          ProblemSource: ProblemSource.ImageProvider,
          Detail: 'Invalid input',
          InvalidProperties: [],
        },
      };
      const attach2 = {
        ObjectState: ObjectState.Add,
        Attached: false,
        Filename: 'test2.jpg',
        ErrorDetail: {
          ErrorCode: ErrorCode.ResourceNotFound,
          ProblemSource: ProblemSource.ClearingHouseVendor,
          Detail: 'Invalid input',
          InvalidProperties: [],
        },
      };
      const headerDto: ClaimAttachmentHeaderDto = {
        AllSucceeded: false,
        Attachments: [attach1, attach2],
      };
      const result = service.determineErrorMessages(headerDto);

      expect(result.primaryMessage).toEqual(
        'An error occurred retrieving test.jpg from the imaging provider: DentalXchange credentials are bad or expired.' +
          '  Please update under Practice Settings > Locations.'
      );
      expect(result.detailMessage).toEqual('Invalid input');
    });

    it('should generate a narrative error message if no other errors occurred', () => {
      const headerDto: ClaimAttachmentHeaderDto = {
        AllSucceeded: false,
        Attachments: [],
        NarrativeErrorDetail: {
          ErrorCode: ErrorCode.CredentialsBadExpired,
          ProblemSource: ProblemSource.ClearingHouseVendor,
          Detail: 'Invalid input',
          InvalidProperties: [],
        },
      };
      const result = service.determineErrorMessages(headerDto);

      expect(result.primaryMessage).toEqual(
        'Any requested file changes were successful, but an error occurred updating the narrative: DentalXchange credentials are bad or expired.' +
          '  Please update under Practice Settings > Locations.'
      );
      expect(result.detailMessage).toBeUndefined();
    });
  });

  it('should generate the appropriate error message based on ErrorCode.PayerInvalid', () => {
    const problemDetails: ProblemDetails = {
      errorCode: ErrorCode.PayerInvalid,
      problemSource: ProblemSource.ClearingHouseVendor,
      statusCode: 500,
      detail: 'Some detail',
      instance: 'Some instance',
      title: 'Some title',
      type: 'Some type',
      dataObject: {}
    };
    var res = {data: problemDetails}; 
    var errorMessage = service.createErrorMessageForCheckPayer(res.data);
    expect(errorMessage).toEqual('Unable to check Carrier Eligibility: Payer information was not recognized by DentalXchange.  Please validate in the Fuse Carrier page.');
  });

  it('should generate the appropriate error message based on ErrorCode.OtherException', () => {
    const problemDetails: ProblemDetails = {
      errorCode: ErrorCode.OtherException,
      problemSource: ProblemSource.ClearingHouseVendor,
      statusCode: 500,
      detail: 'Some detail',
      instance: 'Some instance',
      title: 'Some title',
      type: 'Some type',
      dataObject: {}
    };
    var res = {data: problemDetails}; 
    var errorMessage = service.createErrorMessageForCheckPayer(res.data);
    expect(errorMessage).toEqual('Unable to check Carrier Eligibility: Unexpected error.  Retry or contact Support.');
  });

  it('should generate the appropriate error message based on ErrorCode.ServiceNotAllowed', () => {
    const problemDetails: ProblemDetails = {
      errorCode: ErrorCode.ServiceNotAllowed,
      problemSource: ProblemSource.ClearingHouseVendor,
      statusCode: 500,
      detail: 'Some detail',
      instance: 'Some instance',
      title: 'Some title',
      type: 'Some type',
      dataObject: {}
    };
    var res = {data: problemDetails}; 
    var errorMessage = service.createErrorMessageForCheckPayer(res.data);
    expect(errorMessage).toEqual('Unable to check Carrier Eligibility: The DentalXchange service is unavailable.  Please contact Support.');
  });
  
});
