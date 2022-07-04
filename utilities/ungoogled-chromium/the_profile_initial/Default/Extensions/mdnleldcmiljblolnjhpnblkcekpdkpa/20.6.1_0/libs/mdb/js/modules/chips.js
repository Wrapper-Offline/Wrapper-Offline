"use strict";

(function ($) {
  $(document).ready(function () {
    $(document).on('click', '.chip .close', function () {
      var $this = $(this);

      if ($this.closest('.chips').data('initialized')) {
        return;
      }

      $this.closest('.chip').remove();
    });
  });

  $.fn.materialChip = function (options) {
    var _this = this;

    this.$el = $(this);
    this.$document = $(document);
    this.eventsHandled = false;
    this.defaultOptions = {
      data: [],
      placeholder: '',
      secondaryPlaceholder: ''
    };
    this.selectors = {
      chips: '.chips',
      chip: '.chip',
      input: 'input',
      delete: '.fas',
      selectedChip: '.selected'
    };
    this.keyCodes = {
      enter: 13,
      backspace: 8,
      delete: 46,
      arrowLeft: 37,
      arrowRight: 39
    };

    if (options === 'data') {
      return this.$el.data('chips');
    }

    if (options === 'options') {
      return this.$el.data('options');
    }

    this.$el.data('options', $.extend({}, this.defaultOptions, options));

    this.init = function () {
      _this.$el.each(function (index, element) {
        var $this = $(element);

        if ($this.data('initialized')) {
          return;
        }

        var options = $this.data('options');

        if (!options.data || !Array.isArray(options.data)) {
          options.data = [];
        }

        $this.data('chips', options.data);
        $this.data('index', index);
        $this.data('initialized', true);

        if (!$this.hasClass(_this.selectors.chips)) {
          $this.addClass('chips');
        }

        _this.renderChips($this);
      });
    };

    this.handleEvents = function () {
      var _this2 = this;

      this.$document.on('click', this.selectors.chips, function (e) {
        $(e.target).find(_this2.selectors.input).focus();
      });
      this.$document.on('click', this.selectors.chip, function (e) {
        $(_this2.selectors.chip).removeClass('selected');
        $(e.target).addClass('selected');
      });
      this.$document.on('keydown', function (e) {
        if ($(e.target).is('input, textarea')) {
          return;
        }

        var $selectedChip = _this2.$document.find(_this2.selectors.chip + _this2.selectors.selectedChip);

        var $chipsWrapper = $selectedChip.closest(_this2.selectors.chips);
        var siblingsLength = $selectedChip.siblings(_this2.selectors.chip).length;

        if (!$selectedChip.length) {
          return;
        }

        var backspacePressed = e.which === _this2.keyCodes.backspace;
        var deletePressed = e.which === _this2.keyCodes.delete;
        var leftArrowPressed = e.which === _this2.keyCodes.arrowLeft;
        var rightArrowPressed = e.which === _this2.keyCodes.arrowRight;

        if (backspacePressed || deletePressed) {
          e.preventDefault();

          _this2.deleteSelectedChip($chipsWrapper, $selectedChip, siblingsLength);
        } else if (leftArrowPressed) {
          _this2.selectLeftChip($chipsWrapper, $selectedChip);
        } else if (rightArrowPressed) {
          _this2.selectRightChip($chipsWrapper, $selectedChip, siblingsLength);
        }
      });
      this.$document.on('focusin', "".concat(this.selectors.chips, " ").concat(this.selectors.input), function (e) {
        $(e.target).closest(_this2.selectors.chips).addClass('focus');
        $(_this2.selectors.chip).removeClass('selected');
      });
      this.$document.on('focusout', "".concat(this.selectors.chips, " ").concat(this.selectors.input), function (e) {
        $(e.target).closest(_this2.selectors.chips).removeClass('focus');
      });
      this.$document.on('keydown', "".concat(this.selectors.chips, " ").concat(this.selectors.input), function (e) {
        var $target = $(e.target);
        var $chipsWrapper = $target.closest(_this2.selectors.chips);
        var chipsIndex = $chipsWrapper.data('index');
        var chipsLength = $chipsWrapper.children(_this2.selectors.chip).length;
        var enterPressed = e.which === _this2.keyCodes.enter;

        if (enterPressed) {
          e.preventDefault();

          _this2.addChip(chipsIndex, {
            tag: $target.val()
          }, $chipsWrapper);

          $target.val('');
          return;
        }

        var leftArrowOrDeletePressed = e.keyCode === _this2.keyCodes.arrowLeft || e.keyCode === _this2.keyCodes.delete;
        var isValueEmpty = $target.val() === '';

        if (leftArrowOrDeletePressed && isValueEmpty && chipsLength) {
          _this2.selectChip(chipsIndex, chipsLength - 1, $chipsWrapper);

          $target.blur();
        }
      });
      this.$document.on('click', "".concat(this.selectors.chips, " ").concat(this.selectors.delete), function (e) {
        var $target = $(e.target);
        var $chipsWrapper = $target.closest(_this2.selectors.chips);
        var $chip = $target.closest(_this2.selectors.chip);
        e.stopPropagation();

        _this2.deleteChip($chipsWrapper.data('index'), $chip.index(), $chipsWrapper);

        $chipsWrapper.find('input').focus();
      });
    };

    this.deleteSelectedChip = function ($chipsWrapper, $selectedChip, siblingsLength) {
      var chipsIndex = $chipsWrapper.data('index');
      var chipIndex = $selectedChip.index();

      _this.deleteChip(chipsIndex, chipIndex, $chipsWrapper);

      var selectIndex = null;

      if (chipIndex < siblingsLength - 1) {
        selectIndex = chipIndex;
      } else if (chipIndex === siblingsLength || chipIndex === siblingsLength - 1) {
        selectIndex = siblingsLength - 1;
      }

      if (selectIndex < 0) {
        selectIndex = null;
      }

      if (selectIndex !== null) {
        _this.selectChip(chipsIndex, selectIndex, $chipsWrapper);
      }

      if (!siblingsLength) {
        $chipsWrapper.find('input').focus();
      }
    };

    this.selectLeftChip = function ($chipsWrapper, $selectedChip) {
      var chipIndex = $selectedChip.index() - 1;

      if (chipIndex < 0) {
        return;
      }

      $(_this.selectors.chip).removeClass('selected');

      _this.selectChip($chipsWrapper.data('index'), chipIndex, $chipsWrapper);
    };

    this.selectRightChip = function ($chipsWrapper, $selectedChip, siblingsLength) {
      var chipIndex = $selectedChip.index() + 1;
      $(_this.selectors.chip).removeClass('selected');

      if (chipIndex > siblingsLength) {
        $chipsWrapper.find('input').focus();
        return;
      }

      _this.selectChip($chipsWrapper.data('index'), chipIndex, $chipsWrapper);
    };

    this.renderChips = function ($chipsWrapper) {
      var html = '';
      $chipsWrapper.data('chips').forEach(function (elem) {
        html += _this.getSingleChipHtml(elem);
      });
      html += '<input class="input" placeholder="">';
      $chipsWrapper.html(html);

      _this.setPlaceholder($chipsWrapper);
    };

    this.getSingleChipHtml = function (elem) {
      if (!elem.tag) {
        return '';
      }

      var html = "<div class=\"chip\">".concat(elem.tag);

      if (elem.image) {
        html += " <img src=\"".concat(elem.image, "\"> ");
      }

      html += '<i class="close fas fa-times"></i>';
      html += '</div>';
      return html;
    };

    this.setPlaceholder = function ($chips) {
      var options = $chips.data('options');

      if ($chips.data('chips').length && options.placeholder) {
        $chips.find('input').prop('placeholder', options.placeholder);
      } else if (!$chips.data('chips').length && options.secondaryPlaceholder) {
        $chips.find('input').prop('placeholder', options.secondaryPlaceholder);
      }
    };

    this.isValid = function ($chipsWrapper, elem) {
      var chips = $chipsWrapper.data('chips');

      for (var i = 0; i < chips.length; i++) {
        if (chips[i].tag === elem.tag) {
          return false;
        }
      }

      return elem.tag !== '';
    };

    this.addChip = function (chipsIndex, elem, $chipsWrapper) {
      if (!_this.isValid($chipsWrapper, elem)) {
        return;
      }

      var chipHtml = _this.getSingleChipHtml(elem);

      $chipsWrapper.data('chips').push(elem);
      $(chipHtml).insertBefore($chipsWrapper.find('input'));
      $chipsWrapper.trigger('chip.add', elem);

      _this.setPlaceholder($chipsWrapper);
    };

    this.deleteChip = function (chipsIndex, chipIndex, $chipsWrapper) {
      var chip = $chipsWrapper.data('chips')[chipIndex];
      $chipsWrapper.find('.chip').eq(chipIndex).remove();
      $chipsWrapper.data('chips').splice(chipIndex, 1);
      $chipsWrapper.trigger('chip.delete', chip);

      _this.setPlaceholder($chipsWrapper);
    };

    this.selectChip = function (chipsIndex, chipIndex, $chipsWrapper) {
      var $chip = $chipsWrapper.find('.chip').eq(chipIndex);

      if ($chip && $chip.hasClass('selected') === false) {
        $chip.addClass('selected');
        $chipsWrapper.trigger('chip.select', $chipsWrapper.data('chips')[chipIndex]);
      }
    };

    this.getChipsElement = function (index, $chipsWrapper) {
      return $chipsWrapper.eq(index);
    };

    this.init();

    if (!this.eventsHandled) {
      this.handleEvents();
      this.eventsHandled = true;
    }

    return this;
  }; // Deprecated. To be deleted in future releases


  $.fn.material_chip = $.fn.materialChip;
})(jQuery);