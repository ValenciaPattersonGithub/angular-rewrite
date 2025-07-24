'use strict';

angular
  .module('common.animations', [])
  .animation('.slide-animation', function () {
    return {
      enter: function (element, done) {
        element = jQuery(element);
        element.css({
          position: 'absolute',
          height: 500,
          left: element.parent().width(),
        });
        element.animate(
          {
            left: 0,
          },
          done
        );
      },

      leave: function (element, done) {
        element = jQuery(element);
        element.css({
          position: 'absolute',
          height: 500,
          left: 0,
        });
        element.animate(
          {
            left: -element.parent().width(),
          },
          done
        );
      },
    };
  })
  .animation('.slide-backward-animation', function () {
    return {
      enter: function (element, done) {
        element = jQuery(element);
        element.css({
          position: 'absolute',
          height: 500,
          left: -element.parent().width(),
        });
        element.animate(
          {
            left: 0,
          },
          done
        );
      },

      leave: function (element, done) {
        element = jQuery(element);
        element.css({
          position: 'absolute',
          height: 500,
          left: 0,
        });
        element.animate(
          {
            left: element.parent().width(),
          },
          done
        );
      },
    };
  });
