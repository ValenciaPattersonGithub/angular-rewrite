import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HtmlService {

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  escapeHtml(html: string): string {
    const text = this.document.createTextNode(html);
    const p = this.document.createElement('p');
    p.appendChild(text);
    return p.innerHTML;
  }
}
