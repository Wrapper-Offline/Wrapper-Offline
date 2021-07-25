"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(function ($) {
  var DEFAULT_TOP_SPACING = 0;

  var Sticky =
  /*#__PURE__*/
  function () {
    function Sticky(element, options) {
      _classCallCheck(this, Sticky);

      this.defaults = {
        topSpacing: DEFAULT_TOP_SPACING,
        zIndex: false,
        stopper: '#footer',
        stickyClass: false,
        startScrolling: 'top',
        minWidth: false
      };
      this.$element = element;
      this.options = this.assignOptions(options);
      this.$window = $(window);
      this.stopper = this.options.stopper;
      this.elementWidth = this.$element.outerWidth();
      this.elementHeight = this.$element.outerHeight(true);
      this.$placeholder = $('<div class="sticky-placeholder"></div>');
      this.scrollTop = 0;
      this.setPushPoint();
      this.setStopperPosition();
      this.bindEvents();
    }

    _createClass(Sticky, [{
      key: "assignOptions",
      value: function assignOptions(options) {
        return $.extend({}, this.defaults, options);
      }
    }, {
      key: "bindEvents",
      value: function bindEvents() {
        this.$window.on('resize', this.handleResize.bind(this));
        this.$window.on('scroll', this.init.bind(this));
      }
    }, {
      key: "hasZIndex",
      value: function hasZIndex() {
        return typeof this.options.zIndex === 'number';
      }
    }, {
      key: "hasStopper",
      value: function hasStopper() {
        return $(this.options.stopper).length || typeof this.options.stopper === 'number';
      }
    }, {
      key: "isScreenHeightEnough",
      value: function isScreenHeightEnough() {
        return this.$element.outerHeight() + this.options.topSpacing < this.$window.height();
      }
    }, {
      key: "setStopperPosition",
      value: function setStopperPosition() {
        if (typeof this.options.stopper === 'string') {
          this.stopPoint = $(this.stopper).offset().top - this.options.topSpacing;
        } else if (typeof this.options.stopper === 'number') {
          this.stopPoint = this.options.stopper;
        }
      }
    }, {
      key: "setPushPoint",
      value: function setPushPoint() {
        if (this.options.startScrolling === 'bottom' && !this.isScreenHeightEnough()) {
          this.$pushPoint = this.$element.offset().top + this.$element.outerHeight(true) - this.$window.height();
        } else {
          this.$pushPoint = this.$element.offset().top - this.options.topSpacing;
        }
      }
    }, {
      key: "handleResize",
      value: function handleResize() {
        this.elementWidth = this.$element.outerWidth();
        this.elementHeight = this.$element.outerHeight(true);
        this.setPushPoint();
        this.setStopperPosition();
        this.init();
      }
    }, {
      key: "init",
      value: function init() {
        if (this.options.minWidth && this.options.minWidth > this.$window.innerWidth()) {
          return false;
        }

        if (this.options.startScrolling === 'bottom' && !this.isScreenHeightEnough()) {
          this.scrollTop = this.$window.scrollTop() + this.$window.height();
        } else {
          this.scrollTop = this.$window.scrollTop();
        }

        if (this.$pushPoint < this.scrollTop) {
          this.appendPlaceholder();
          this.stickyStart();
        } else {
          this.stickyEnd();
        }

        if (this.$window.scrollTop() > this.$pushPoint) {
          this.stop();
        } else {
          this.stickyEnd();
        }
      }
    }, {
      key: "appendPlaceholder",
      value: function appendPlaceholder() {
        this.$element.after(this.$placeholder);
        this.$placeholder.css({
          width: this.elementWidth,
          height: this.elementHeight
        });
      }
    }, {
      key: "stickyStart",
      value: function stickyStart() {
        if (this.options.stickyClass) {
          this.$element.addClass(this.options.stickyClass);
        } // @see: https://stackoverflow.com/a/4370047


        this.$element.get(0).style.overflow = 'scroll';
        var scrollHeight = this.$element.get(0).scrollHeight;
        this.$element.get(0).style.overflow = '';
        this.$element.css({
          'position': 'fixed',
          'width': this.elementWidth,
          'height': scrollHeight
        });

        if (this.options.startScrolling === 'bottom' && !this.isScreenHeightEnough()) {
          this.$element.css({
            bottom: 0,
            top: ''
          });
        } else {
          this.$element.css({
            top: this.options.topSpacing
          });
        }

        if (this.hasZIndex()) {
          this.$element.css({
            zIndex: this.options.zIndex
          });
        }
      }
    }, {
      key: "stickyEnd",
      value: function stickyEnd() {
        if (this.options.stickyClass) {
          this.$element.removeClass(this.options.stickyClass);
        }

        this.$placeholder.remove();
        this.$element.css({
          position: 'static',
          top: DEFAULT_TOP_SPACING
        });
      }
    }, {
      key: "stop",
      value: function stop() {
        if (this.stopPoint < $(this.$element).offset().top + this.$element.outerHeight(true)) {
          this.$element.css({
            position: 'absolute',
            bottom: 0,
            top: ''
          });
        }
      }
    }]);

    return Sticky;
  }();

  $.fn.sticky = function (options) {
    return this.each(function () {
      var $self = $(this);
      $(window).on('load', function () {
        var sticky = new Sticky($self, options);
        sticky.init();
      });
    });
  };
})(jQuery);