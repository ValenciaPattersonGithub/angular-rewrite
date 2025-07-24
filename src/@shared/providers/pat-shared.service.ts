import { DOCUMENT } from '@angular/common';
import { Injectable, Inject, SecurityContext } from '@angular/core';
import * as moment from 'moment';
import * as $ from 'jquery';
import { Params } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable()
export class PatSharedService {

  constructor(@Inject(DOCUMENT) private document: Document,private sanitizer: DomSanitizer) { }
  sanitizedValue = "";
  public Time = {
    getDuration(from, to) {
      if (from != null && to != null) {
        const fromMoment = moment(from);
        const toMoment = moment(to);

        const duration = toMoment.diff(fromMoment, 'minutes');

        return duration;
      }

      return 0;

    },
    /** checks if newDate is still within the week of the oldDate
     *  newDate: js date required
     *  oldDate: js date required
     *  returns boolean
     */
    isWithinWeek(newDate, oldDate) {
      const startOfWeek = this.getStartDateOfWeek(oldDate);
      const endOfWeek = this.getEndDateOfWeek(oldDate);

      return (newDate.getTime() >= startOfWeek.getTime() && newDate.getTime() <= endOfWeek.getTime());
    },
    /** returns date for Sunday of that week */
    getStartDateOfWeek(dateOn) {
      const date = new Date(dateOn);
      date.setDate(date.getDate() - date.getDay());
      /** sets to first second of the day */
      date.setHours(0, 0, 0, 0);

      return date;
    },
    /** returns date for Saturday of that week */
    getEndDateOfWeek(dateOn) {
      /** if dateOn is invalid, it will return today's date */
      const date = new Date(dateOn);
      date.setDate(date.getDate() + (6 - date.getDay()));
      /** sets to last second of the day */
      date.setHours(23, 59, 59);

      return date;
    }

  };

  /** service to be used when js required scrolling events need to be called
   *  using angular.element since it's offsetTop provides most accurate results
   */
  public DOM = {
    ScrollTo(targetElementId, offset) {
      const target = targetElementId ? targetElementId : 'html, body';
      /** always need some type of offset so the element isn't directly at top of scroll */
      offset = offset !== undefined ? offset : 0;

      const scrollTo = (element) => {
        const elem = $(element);

        $(target).animate({
          scrollTop: elem[0].offsetTop - offset
        }, 300);
      };

      return {
        Element(element) {
          scrollTo(element);
        }
      };
    },
    Find: {
      /** returns lastElement to keep track of your comparison to the new element */
      TopMostElement: (element, lastElement) => {
        const elem = $(element);
        const lastElem = $(lastElement);

        /** does element exist in DOM */
        if (!jQuery.contains(this.document.body, lastElem[0])) {
          lastElement = elem;
        }

        if (element && elem !== lastElem) {
          if (!lastElement || (lastElem.length > 0 && elem[0].offsetTop <= lastElem[0].offsetTop)) {
            lastElement = elem;
          }
        }

        return lastElement;
      }
    }
  };


  public Format = {
    PatientName(patient) {
      /** not all patient/person DTOs return same property for Middle Initial... */
      const MiddleInitial = patient.MiddleInitial !== undefined ? patient.MiddleInitial : patient.MiddleName;

      return patient.FirstName +
        (patient.PreferredName ? ' (' + patient.PreferredName + ')' : '') +
        (MiddleInitial ? ' ' + MiddleInitial + '.' : '') +
        ' ' + patient.LastName + (patient.SuffixName ? ' ' + patient.SuffixName : '');
    },
    ProviderName(provider) {
      const pd = provider.ProfessionalDesignation ? ', ' + provider.ProfessionalDesignation : '';

      return provider.FirstName + ' ' + provider.LastName + pd;
    }
  };

  public setParameter(routerParams: Params): HttpParams {
    let queryParams = new HttpParams();
    for (const key in routerParams) {
      queryParams = queryParams.set(key, routerParams[key]);
    }
    return queryParams;
  }

  compareValues = (a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  };


  // Method used to sanitize input values using DomSanitizer
  // SecurityContext values CanBe - NONE = 0,  HTML = 1,  STYLE = 2,  SCRIPT = 3,  URL = 4,  RESOURCE_URL = 5
  sanitizeInput = (securityContext: SecurityContext, value) => {
    const sanitizedValue = this.sanitizer.sanitize(
      securityContext,
      value
    );
    this.sanitizedValue = sanitizedValue ? sanitizedValue?.toString() : '';
    return this.sanitizedValue;
  }
}
