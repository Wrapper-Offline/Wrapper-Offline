"use strict";

$(document).ready(function () {
  $('body').attr('aria-busy', true);
  $('#preloader-markup').load('mdb-addons/preloader.html', function () {
    $(window).on('load', function () {
      $('#mdb-preloader').fadeOut('slow');
      $('body').removeAttr('aria-busy');
    });
  });
});