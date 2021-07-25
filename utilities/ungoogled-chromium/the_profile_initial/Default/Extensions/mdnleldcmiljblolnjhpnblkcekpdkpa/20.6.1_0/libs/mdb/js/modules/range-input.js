"use strict";

(function ($) {
  var rangeWrapper = '.range-field';
  var rangeType = 'input[type=range]:not(.custom-range)';
  var thumbHtml = '<span class="thumb"><span class="value"></span></span>';
  var rangeMousedown = false;
  var left;

  var addThumb = function addThumb() {
    var $thumb = $(thumbHtml);
    $(rangeType).after($thumb);
  };

  $(document).on('change', rangeType, function () {
    var $thumb = $(this);
    var $thumbValue = $thumb.siblings('.thumb').find('.value');
    $thumbValue.html($thumb.val());
  });
  $(document).on('input mousedown touchstart', rangeType, function (e) {
    var $this = $(this);
    var $thumb = $this.siblings('.thumb');
    var width = $this.outerWidth();
    var noThumb = !$thumb.length;

    if (noThumb) {
      addThumb();
    } // Set indicator value


    $thumb.find('.value').html($this.val());
    rangeMousedown = true;
    $this.addClass('active');

    if (!$thumb.hasClass('active')) {
      $thumb.velocity({
        height: '30px',
        width: '30px',
        top: '-20px',
        marginLeft: '-15px'
      }, {
        duration: 300,
        easing: 'easeOutExpo'
      });
    }

    if (e.type !== 'input') {
      var isMobile = e.pageX === undefined || e.pageX === null;

      if (isMobile) {
        left = e.originalEvent.touches[0].pageX - $(this).offset().left;
      } else {
        left = e.pageX - $(this).offset().left;
      }

      if (left < 0) {
        left = 0;
      } else if (left > width) {
        left = width;
      }

      $thumb.addClass('active').css('left', left);
    }

    $thumb.find('.value').html($this.val());
  });
  $(document).on('mouseup touchend', rangeWrapper, function () {
    rangeMousedown = false;
    $(this).removeClass('active');
  });
  $(document).on('mousemove touchmove', rangeWrapper, function (e) {
    var $thumb = $(this).children('.thumb');
    var left;

    if (rangeMousedown) {
      if (!$thumb.hasClass('active')) {
        $thumb.velocity({
          height: '30px',
          width: '30px',
          top: '-20px',
          marginLeft: '-15px'
        }, {
          duration: 300,
          easing: 'easeOutExpo'
        });
      }

      var isMobile = e.pageX === undefined || e.pageX === null;

      if (isMobile) {
        left = e.originalEvent.touches[0].pageX - $(this).offset().left;
      } else {
        left = e.pageX - $(this).offset().left;
      }

      var width = $(this).outerWidth();

      if (left < 0) {
        left = 0;
      } else if (left > width) {
        left = width;
      }

      $thumb.addClass('active').css('left', left);
      $thumb.find('.value').html($thumb.siblings(rangeType).val());
    }
  });
  $(document).on('mouseout touchleave', rangeWrapper, function () {
    if (!rangeMousedown) {
      var $thumb = $(this).children('.thumb');

      if ($thumb.hasClass('active')) {
        $thumb.velocity({
          height: '0',
          width: '0',
          top: '10px',
          marginLeft: '-6px'
        }, {
          duration: 100
        });
      }

      $thumb.removeClass('active');
    }
  });
})(jQuery);