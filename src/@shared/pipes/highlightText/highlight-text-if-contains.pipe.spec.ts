import { HighlightTextIfContainsPipe } from './highlight-text-if-contains.pipe';
import { TestBed, inject } from '@angular/core/testing';
import { BrowserModule} from '@angular/platform-browser';
import { HtmlService } from 'src/@shared/providers/html.service';

describe('HighlightTextIfContainsPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule
      ]
    });
  });
  it('create an instance', inject([HtmlService], (htmlService:HtmlService) => {
    const pipe = new HighlightTextIfContainsPipe(htmlService);
    expect(pipe).toBeTruthy();
  }));

  it('providing no value returns value empty', inject([HtmlService], (htmlService:HtmlService) => {
    const pipe = new HighlightTextIfContainsPipe(htmlService);
    expect(pipe.transform('', '')).toBe('');
  }));

  it('providing value ', inject([HtmlService], (htmlService:HtmlService) => {
    const pipe = new HighlightTextIfContainsPipe(htmlService);
    expect(pipe.transform('cash', 'ca')).toBeDefined();
  }));

  it('when providing empty value ', inject([HtmlService], (htmlService:HtmlService) => {
    const pipe = new HighlightTextIfContainsPipe(htmlService);
    expect(pipe.transform('', 'ab')).toBeDefined();
  }));

  it('when providing value and result not matched', inject([HtmlService], (htmlService:HtmlService) => {
    const pipe = new HighlightTextIfContainsPipe(htmlService);
    expect(pipe.transform('cash', 'ab')).toBeDefined();
  }));
  it('should highlight the text that matches the args', inject([HtmlService], (htmlService:HtmlService) => {
    const pipe = new HighlightTextIfContainsPipe(htmlService);
    expect(pipe.transform('Hello World ', 'World')).toBe('Hello <b>World</b> ');
  }));

  it('should highlight the text that matches the args which have html tag', inject([HtmlService], (htmlService:HtmlService) => {
    const pipe = new HighlightTextIfContainsPipe(htmlService);
    expect(pipe.transform('<a href=https://cobalt.io','<a href')).toBe('<b>'+ htmlService.escapeHtml('<a href')+'</b>'+'=https://cobalt.io');
  }));

});
