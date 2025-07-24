'use strict';

angular.module('PatShared').service('PatSharedServices', function () {
  return {
    Time: {
      getDuration: function (from, to) {
        if (from != null && to != null) {
          var fromMoment = moment(from);
          var toMoment = moment(to);

          var duration = toMoment.diff(fromMoment, 'minutes');

          return duration;
        }

        return 0;
      },
      /** checks if newDate is still within the week of the oldDate
       *  newDate: js date required
       *  oldDate: js date required
       *  returns boolean
       */
      isWithinWeek: function (newDate, oldDate) {
        var startOfWeek = this.getStartDateOfWeek(oldDate);
        var endOfWeek = this.getEndDateOfWeek(oldDate);

        return (
          newDate.getTime() >= startOfWeek.getTime() &&
          newDate.getTime() <= endOfWeek.getTime()
        );
      },
      /** returns date for Sunday of that week */
      getStartDateOfWeek: function (dateOn) {
        var date = new Date(dateOn);
        date.setDate(date.getDate() - date.getDay());
        /** sets to first second of the day */
        date.setHours(0, 0, 0, 0);

        return date;
      },
      /** returns date for Saturday of that week */
      getEndDateOfWeek: function (dateOn) {
        /** if dateOn is invalid, it will return today's date */
        var date = new Date(dateOn);
        date.setDate(date.getDate() + (6 - date.getDay()));
        /** sets to last second of the day */
        date.setHours(23, 59, 59);

        return date;
      },
    },
    /** service to be used when js required scrolling events need to be called
     *  using angular.element since it's offsetTop provides most accurate results
     */
    DOM: {
      ScrollTo: function (targetElementId, offset) {
        var target = targetElementId ? targetElementId : 'html, body';
        /** always need some type of offset so the element isn't directly at top of scroll */
        offset = !angular.isUndefined(offset) ? offset : 0;

        var scrollTo = function (element) {
          var elem = angular.element(element);

          $(target).animate(
            {
              scrollTop: elem[0].offsetTop - offset,
            },
            300
          );
        };

        return {
          Element: function (element) {
            scrollTo(element);
          },
        };
      },
      Find: {
        /** returns lastElement to keep track of your comparison to the new element */
        TopMostElement: function (element, lastElement) {
          var elem = angular.element(element);
          var lastElem = angular.element(lastElement);

          /** does element exist in DOM */
          if (!jQuery.contains(document, lastElem[0])) {
            lastElement = elem;
          }

          if (element && elem != lastElem) {
            if (
              !lastElement ||
              (lastElem.length > 0 &&
                elem[0].offsetTop <= lastElem[0].offsetTop)
            ) {
              lastElement = elem;
            }
          }

          return lastElement;
        },
      },
    },
    Format: {
      PatientName: function (patient) {
        /** not all patient/person DTOs return same property for Middle Initial... */
        var MiddleInitial = !angular.isUndefined(patient.MiddleInitial)
          ? patient.MiddleInitial
          : patient.MiddleName;

        return (
          patient.FirstName +
          (patient.PreferredName ? ' (' + patient.PreferredName + ')' : '') +
          (MiddleInitial ? ' ' + MiddleInitial + '.' : '') +
          ' ' +
          patient.LastName +
          (patient.SuffixName ? ' ' + patient.SuffixName : '')
        );
      },
      ProviderName: function (provider) {
        var pd = provider.ProfessionalDesignation
          ? ', ' + provider.ProfessionalDesignation
          : '';

        return provider.FirstName + ' ' + provider.LastName + pd;
      },
    },
  };
});
