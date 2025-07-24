import { TestBed } from "@angular/core/testing";
import { RichTextSanitizerService } from "./rich-text-sanitizer.service";

describe('richTextSanitizerService', () => {
    var providers;


    beforeEach(() => {
        //TestBed.configureTestingModule({

        //    providers: [
        //        RichTextSanitizerService                
        //    ],
        //});
        //docUploadService = TestBed.get(RichTextSanitizerService);
    });


    describe('sanitizeRichText', () => {

        it('should return null if input is null', () => {
            const service = new RichTextSanitizerService();
            const result = service.sanitizeRichText(null);
            expect(result).toBeNull();
        });

        it('should return undefined if input is undefined', () => {
            const service = new RichTextSanitizerService();
            const result = service.sanitizeRichText(undefined);
            expect(result).toBeUndefined();
        });

        it('should return empty string if input is empty string', () => {
            const service = new RichTextSanitizerService();
            const result = service.sanitizeRichText('');
            expect(result).toEqual('');
        });

        it('should return sanitized text if input is not null, undefined or empty string', () => {
            const service = new RichTextSanitizerService();
            const result = service.sanitizeRichText('<script>alert("hello")</script>');
            expect(result).toEqual('alert("hello")');
        });

        it('should remove tags that are not in the whitelist', () => {
            const service = new RichTextSanitizerService();
            const result = service.sanitizeRichText('<p>hello</p><script>alert("hello")</script>');
            expect(result).toEqual('<p>hello</p>alert("hello")');
        });

        it('should remove tags that are not in the whitelist, but start with a whitelisted tag', () => {
            const service = new RichTextSanitizerService();
            const result = service.sanitizeRichText('<badstuff>hello</badstuff>');
            expect(result).toEqual('hello');
        });



    });


    
});