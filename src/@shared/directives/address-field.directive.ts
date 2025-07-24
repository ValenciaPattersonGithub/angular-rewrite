import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[addressField]'
})
export class AddressFieldDirective {
  regexStr = "^[a-zA-Z0-9-'.\\()# ]*$";

  constructor() { }

  @HostListener('keypress', ['$event']) onKeyPress(event: KeyboardEvent) {
    return new RegExp(this.regexStr)?.test(event?.key);
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    return new RegExp(this.regexStr)?.test(event?.key);
  }

  @HostListener('paste', ['$event']) blockPaste(event: ClipboardEvent) {
    this.validateFields(event);
  }

  validateFields(event: ClipboardEvent) {
      event.preventDefault();
      let pasteData = event?.clipboardData?.getData('text/plain')?.replace(/[^a-zA-Z0-9-'.\\()# ]/g, '');
      document.execCommand('insertHTML', false, pasteData);
  }
}
