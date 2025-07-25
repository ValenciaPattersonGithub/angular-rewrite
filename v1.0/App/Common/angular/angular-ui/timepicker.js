﻿angular
  .module('ui.bootstrap.timepicker', [])
  .constant('timepickerConfig', {
    hourStep: 1,
    minuteStep: 1,
    showMeridian: !0,
    meridians: null,
    readonlyInput: !1,
    mousewheel: !0,
  })
  .controller('TimepickerController', [
    '$scope',
    '$attrs',
    '$parse',
    '$log',
    '$locale',
    'timepickerConfig',
    function (a, b, c, d, e, f) {
      function g() {
        var b = parseInt(a.hours, 10),
          c = a.showMeridian ? b > 0 && 13 > b : b >= 0 && 24 > b;
        return c
          ? (a.showMeridian &&
              (12 === b && (b = 0), a.meridian === p[1] && (b += 12)),
            b)
          : void 0;
      }

      function h() {
        var b = parseInt(a.minutes, 10);
        return b >= 0 && 60 > b ? b : void 0;
      }

      function i(a) {
        return angular.isDefined(a) && a.toString().length < 2 ? '0' + a : a;
      }

      function j(a) {
        k(), o.$setViewValue(new Date(n)), l(a);
      }

      function k() {
        o.$setValidity('time', !0),
          (a.invalidHours = !1),
          (a.invalidMinutes = !1);
      }

      function l(b) {
        var c = n.getHours(),
          d = n.getMinutes();
        a.showMeridian && (c = 0 === c || 12 === c ? 12 : c % 12),
          (a.hours = 'h' === b ? c : i(c)),
          (a.minutes = 'm' === b ? d : i(d)),
          (a.meridian = n.getHours() < 12 ? p[0] : p[1]);
      }

      function m(a) {
        var b = new Date(n.getTime() + 6e4 * a);
        n.setHours(b.getHours(), b.getMinutes()), j();
      }

      var n = new Date(),
        o = { $setViewValue: angular.noop },
        p = angular.isDefined(b.meridians)
          ? a.$parent.$eval(b.meridians)
          : f.meridians || e.DATETIME_FORMATS.AMPMS;

      this.init = function (c, d) {
        (o = c), (o.$render = this.render);
        var e = d.eq(0),
          g = d.eq(1),
          h = angular.isDefined(b.mousewheel)
            ? a.$parent.$eval(b.mousewheel)
            : f.mousewheel;
        h && this.setupMousewheelEvents(e, g),
          (a.readonlyInput = angular.isDefined(b.readonlyInput)
            ? a.$parent.$eval(b.readonlyInput)
            : f.readonlyInput),
          this.setupInputEvents(e, g);
      };

      var q = f.hourStep;

      b.hourStep &&
        a.$parent.$watch(c(b.hourStep), function (a) {
          q = parseInt(a, 10);
        });

      var r = f.minuteStep;
      b.minuteStep &&
        a.$parent.$watch(c(b.minuteStep), function (a) {
          r = parseInt(a, 10);
        }),
        (a.showMeridian = f.showMeridian),
        b.showMeridian &&
          a.$parent.$watch(c(b.showMeridian), function (b) {
            if (((a.showMeridian = !!b), o.$error.time)) {
              var c = g(),
                d = h();
              angular.isDefined(c) &&
                angular.isDefined(d) &&
                (n.setHours(c), j());
            } else l();
          }),
        (this.setupMousewheelEvents = function (b, c) {
          var d = function (a) {
            a.originalEvent && (a = a.originalEvent);
            var b = a.wheelDelta ? a.wheelDelta : -a.deltaY;
            return a.detail || b > 0;
          };

          b.bind('mousewheel wheel', function (b) {
            a.$apply(d(b) ? a.incrementHours() : a.decrementHours()),
              b.preventDefault();
          }),
            c.bind('mousewheel wheel', function (b) {
              a.$apply(d(b) ? a.incrementMinutes() : a.decrementMinutes()),
                b.preventDefault();
            });
        }),
        (this.setupInputEvents = function (b, c) {
          if (a.readonlyInput)
            return (
              (a.updateHours = angular.noop),
              void (a.updateMinutes = angular.noop)
            );
          var d = function (b, c) {
            o.$setViewValue(null),
              o.$setValidity('time', !1),
              angular.isDefined(b) && (a.invalidHours = b),
              angular.isDefined(c) && (a.invalidMinutes = c);
          };
          (a.updateHours = function () {
            var a = g();
            angular.isDefined(a) ? (n.setHours(a), j('h')) : d(!0);
          }),
            b.bind('blur', function () {
              !a.invalidHours &&
                a.hours < 10 &&
                a.$apply(function () {
                  a.hours = i(a.hours);
                });
            }),
            (a.updateMinutes = function () {
              var a = h();
              angular.isDefined(a) ? (n.setMinutes(a), j('m')) : d(void 0, !0);
            }),
            c.bind('blur', function () {
              !a.invalidMinutes &&
                a.minutes < 10 &&
                a.$apply(function () {
                  a.minutes = i(a.minutes);
                });
            });
        }),
        (this.render = function () {
          var a = o.$modelValue ? new Date(o.$modelValue) : null;
          isNaN(a)
            ? (o.$setValidity('time', !1),
              d.error(
                'Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.'
              ))
            : (a && (n = a), k(), l());
        }),
        (a.incrementHours = function () {
          m(60 * q);
        }),
        (a.decrementHours = function () {
          m(60 * -q);
        }),
        (a.incrementMinutes = function () {
          m(r);
        }),
        (a.decrementMinutes = function () {
          m(-r);
        }),
        (a.toggleMeridian = function () {
          m(720 * (n.getHours() < 12 ? 1 : -1));
        });
    },
  ])
  .directive('timepicker', function () {
    return {
      restrict: 'EA',
      require: ['timepicker', '?^ngModel'],
      controller: 'TimepickerController',
      replace: !0,
      scope: {},
      templateUrl: 'template/timepicker/timepicker.html',
      link: function (a, b, c, d) {
        var e = d[0],
          f = d[1];
        f && e.init(f, b.find('input'));

        var inputs = $(b).find('input');
        var links = $(b).find('a');
        var buttons = $(b).find('button');

        inputs.each(function (index) {
          $(this).attr('tabindex', b.attr('tabindex'));
          if (index == 0) {
            $(this).on('keydown', function (key) {
              switch (key.keyCode) {
                case 38: // Up
                  a.$apply(a.incrementHours());
                  break;
                case 40: // Down
                  a.$apply(a.decrementHours());
                  break;
              }
            });
          }
          if (index == 1) {
            $(this).on('keydown', function (key) {
              switch (key.keyCode) {
                case 38: // Up
                  a.$apply(a.incrementMinutes());
                  break;
                case 40: // Down
                  a.$apply(a.decrementMinutes());
                  break;
              }
            });
          }
        });
        // removes parent tab index, no longer necessary
        b.attr('tabindex', '');

        if (c.showArrows != 'true') {
          links.each(function (index) {
            $(this.parentElement.parentElement).addClass('hidden');
          });
        }

        if (c.editable == 'false') {
          inputs.each(function (index) {
            $(this).attr('disabled', true);
          });

          buttons.each(function (index) {
            $(this).attr('disabled', true);
          });

          links.each(function (index) {
            $(this).attr('disabled', true);
          });
        }
      },
    };
  });
