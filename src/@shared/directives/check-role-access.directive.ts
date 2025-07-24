import { AfterViewInit, Directive, ElementRef, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import _isString from 'lodash/isString';
import _includes from 'lodash/includes';

@Directive({
  selector: '[checkRoleAccess]'
})
export class CheckRoleAccessDirective implements OnChanges, OnInit, AfterViewInit {

  @Input() checkRoleAccess: string;
  forceDisable: boolean = false;
  access: string;
  titleString: string;
  elementTitle: string;
  hasAccess: boolean = true;

  constructor(private element: ElementRef,
    @Inject('AuthZService') private authZ) { }

  ngOnInit(): void {
    this.checkAuth();
  }

  ngAfterViewInit(): void {
    //Display Tooltip on disabled element
    if (!this.hasAccess) {
      let elementTitle = this.element.nativeElement.title;
      if (elementTitle) {
        elementTitle += " - " + this.titleString;
      } else {
        elementTitle = this.titleString;
      }
      this.elementTitle = elementTitle;
      this.element.nativeElement.title = this.elementTitle;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.checkRoleAccess) {
      const nv = changes.checkRoleAccess.currentValue;
      const ov = changes.checkRoleAccess.previousValue;
      this.titleString = this.authZ.generateTitleMessage();
      if (nv && nv != ov && _isString(nv)) {
        const valueLowerCase = nv.toLowerCase();
        if (_includes(['true', 'false'], valueLowerCase)) {
          this.forceDisable = JSON.parse(valueLowerCase);
        } else {
          this.access = nv;
        }
      }
    }
  }

  checkAuth = () => {
    if (this.forceDisable) {
      this.disableElement();
    }
    else if (this.access) {
      let accessList = this.access.split(',');
      let hasAllAccess = true;

      // Check multiple AMFA access
      if (accessList && accessList.length > 1) {
        accessList.forEach(access => {
          hasAllAccess = hasAllAccess && this.authZ.checkAuthZ(access);
        });
        this.hasAccess = hasAllAccess;
      } else {
        // Check single AMFA access
        this.hasAccess = this.authZ.checkAuthZ(this.access);
      }
      if (!this.hasAccess) {
        this.disableElement();
      }
    }
  }

  disableElement = () => {
    this.element.nativeElement.classList.add('disabled');
    this.element.nativeElement.disabled = true;

    //Disable anchor element
    if (this.element.nativeElement.tagName.toLowerCase() == 'a' || this.element.nativeElement.tagName.toLowerCase() == 'i') {
      this.element.nativeElement.removeAttribute('href');
    }
  }
}
