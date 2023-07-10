"use strict";

(function ($) {
  $.fn.characterCounter = function () {
    return this.each(function () {
      var itHasLengthAttribute = $(this).attr('length') !== undefined;

      if (itHasLengthAttribute) {
        $(this).on('input', updateCounter);
        $(this).on('focus', updateCounter);
        $(this).on('blur', removeCounterElement);
        addCounterElement($(this));
      }
    });
  };

  function updateCounter() {
    var maxLength = Number($(this).attr('length'));
    var actualLength = Number($(this).val().length);
    var isValidLength = actualLength <= maxLength;
    $(this).parent().find('span[class="character-counter"]').html("".concat(actualLength, "/").concat(maxLength));
    addInputStyle(isValidLength, $(this));
  }

  function addCounterElement($input) {
    var $counterElement = $('<span/>').addClass('character-counter').css('float', 'right').css('font-size', '12px').css('height', 1);
    $input.parent().append($counterElement);
  }

  function removeCounterElement() {
    $(this).parent().find('span[class="character-counter"]').html('');
  }

  function addInputStyle(isValidLength, $input) {
    var inputHasInvalidClass = $input.hasClass('invalid');

    if (isValidLength && inputHasInvalidClass) {
      $input.removeClass('invalid');
    } else if (!isValidLength && !inputHasInvalidClass) {
      $input.removeClass('valid');
      $input.addClass('invalid');
    }
  }

  $(document).ready(function () {
    $('input, textarea').characterCounter();
  });
})(jQuery);