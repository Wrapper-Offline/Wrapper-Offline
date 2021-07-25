"use strict";

(function ($) {
  var _this = this;

  $(document).ready(function () {
    $(document).on('mouseenter', '.fixed-action-btn', function () {
      var $this = $(this);
      openFABMenu($this);
    });
    $(document).on('mouseleave', '.fixed-action-btn', function () {
      var $this = $(this);
      closeFABMenu($this);
    });
    $(document).on('click', '.fixed-action-btn > a', function () {
      var $this = $(this);
      var $menu = $this.parent();
      $menu.hasClass('active') ? openFABMenu($menu) : closeFABMenu($menu);

      if ($menu.hasClass('active')) {
        closeFABMenu($menu);
      } else {
        openFABMenu($menu);
      }
    });
  });
  $.fn.extend({
    openFAB: function openFAB() {
      openFABMenu($(this));
    },
    closeFAB: function closeFAB() {
      closeFABMenu($(this));
    }
  });

  var openFABMenu = function openFABMenu(btn) {
    var fab = btn;

    if (!fab.hasClass('active')) {
      fab.addClass('active');
      var btnList = document.querySelectorAll('ul .btn-floating');
      btnList.forEach(function (el) {
        el.classList.add('shown');
      });
    }
  };

  var closeFABMenu = function closeFABMenu(btn) {
    var fab = btn;
    fab.removeClass('active');
    var btnList = document.querySelectorAll('ul .btn-floating');
    btnList.forEach(function (el) {
      el.classList.remove('shown');
    });
  };

  $('.fixed-action-btn:not(.smooth-scroll) > .btn-floating').on('click', function (e) {
    if (!$(_this).hasClass('smooth-scroll')) {
      e.preventDefault();
      toggleFABMenu($('.fixed-action-btn'));
      return false;
    }
  });

  function toggleFABMenu(btn) {
    var elem = btn;

    if (elem.hasClass('active')) {
      closeFABMenu(elem);
    } else {
      openFABMenu(elem);
    }
  }
})(jQuery);