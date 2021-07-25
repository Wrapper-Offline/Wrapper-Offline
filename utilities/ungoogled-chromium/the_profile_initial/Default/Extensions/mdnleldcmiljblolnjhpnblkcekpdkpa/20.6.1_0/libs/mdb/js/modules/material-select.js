"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(function ($) {
  var MaterialSelect =
  /*#__PURE__*/
  function () {
    function MaterialSelect($nativeSelect, options) {
      _classCallCheck(this, MaterialSelect);

      this.options = options;
      this.$nativeSelect = $nativeSelect;
      this.isMultiple = Boolean(this.$nativeSelect.attr('multiple'));
      this.isSearchable = Boolean(this.$nativeSelect.attr('searchable'));
      this.isRequired = Boolean(this.$nativeSelect.attr('required'));
      this.uuid = this._randomUUID();
      this.$selectWrapper = $('<div class="select-wrapper"></div>');
      this.$materialOptionsList = $("<ul id=\"select-options-".concat(this.uuid, "\" class=\"dropdown-content select-dropdown w-100 ").concat(this.isMultiple ? 'multiple-select-dropdown' : '', "\"></ul>"));
      this.$materialSelectInitialOption = $nativeSelect.find('option:selected').html() || $nativeSelect.find('option:first').html() || '';
      this.$nativeSelectChildren = this.$nativeSelect.children('option, optgroup');
      this.$materialSelect = $("<input type=\"text\" class=\"select-dropdown\" readonly=\"true\" ".concat(this.$nativeSelect.is(':disabled') ? 'disabled' : '', " data-activates=\"select-options-").concat(this.uuid, "\" value=\"\"/>"));
      this.$dropdownIcon = $('<span class="caret">&#9660;</span>');
      this.$searchInput = null;
      this.$toggleAll = $('<li class="select-toggle-all"><span><input type="checkbox" class="form-check-input"><label>Select all</label></span></li>');
      this.valuesSelected = [];
      this.keyCodes = {
        tab: 9,
        esc: 27,
        enter: 13,
        arrowUp: 38,
        arrowDown: 40
      };
      MaterialSelect.mutationObservers = [];
    }

    _createClass(MaterialSelect, [{
      key: "init",
      value: function init() {
        var alreadyInitialized = Boolean(this.$nativeSelect.data('select-id'));

        if (alreadyInitialized) {
          this._removeMaterialWrapper();
        }

        if (this.options === 'destroy') {
          this.$nativeSelect.data('select-id', null).removeClass('initialized');
          return;
        }

        this.$nativeSelect.data('select-id', this.uuid);
        this.$selectWrapper.addClass(this.$nativeSelect.attr('class'));
        var sanitizedLabelHtml = this.$materialSelectInitialOption.replace(/"/g, '&quot;');
        this.$materialSelect.val(sanitizedLabelHtml);
        this.renderMaterialSelect();
        this.bindEvents();

        if (this.isRequired) {
          this.enableValidation();
        }
      }
    }, {
      key: "_removeMaterialWrapper",
      value: function _removeMaterialWrapper() {
        var currentUuid = this.$nativeSelect.data('select-id');
        this.$nativeSelect.parent().find('span.caret').remove();
        this.$nativeSelect.parent().find('input').remove();
        this.$nativeSelect.unwrap();
        $("ul#select-options-".concat(currentUuid)).remove();
      }
    }, {
      key: "renderMaterialSelect",
      value: function renderMaterialSelect() {
        var _this = this;

        this.$nativeSelect.before(this.$selectWrapper);
        this.appendDropdownIcon();
        this.appendMaterialSelect();
        this.appendMaterialOptionsList();
        this.appendNativeSelect();
        this.appendSaveSelectButton();

        if (!this.$nativeSelect.is(':disabled')) {
          this.$materialSelect.dropdown({
            hover: false,
            closeOnClick: false
          });
        }

        if (this.$nativeSelect.data('inherit-tabindex') !== false) {
          this.$materialSelect.attr('tabindex', this.$nativeSelect.attr('tabindex'));
        }

        if (this.isMultiple) {
          this.$nativeSelect.find('option:selected:not(:disabled)').each(function (i, element) {
            var index = $(element).index();

            _this._toggleSelectedValue(index);

            _this.$materialOptionsList.find('li:not(.optgroup):not(.select-toggle-all)').eq(index).find(':checkbox').prop('checked', true);
          });
        } else {
          var index = this.$nativeSelect.find('option:selected').index();
          this.$materialOptionsList.find('li').eq(index).addClass('active');
        }

        this.$nativeSelect.addClass('initialized');
      }
    }, {
      key: "appendDropdownIcon",
      value: function appendDropdownIcon() {
        if (this.$nativeSelect.is(':disabled')) {
          this.$dropdownIcon.addClass('disabled');
        }

        this.$selectWrapper.append(this.$dropdownIcon);
      }
    }, {
      key: "appendMaterialSelect",
      value: function appendMaterialSelect() {
        this.$selectWrapper.append(this.$materialSelect);
      }
    }, {
      key: "appendMaterialOptionsList",
      value: function appendMaterialOptionsList() {
        if (this.isSearchable) {
          this.appendSearchInputOption();
        }

        this.buildMaterialOptions();

        if (this.isMultiple) {
          this.appendToggleAllCheckbox();
        }

        this.$selectWrapper.append(this.$materialOptionsList);
      }
    }, {
      key: "appendNativeSelect",
      value: function appendNativeSelect() {
        this.$nativeSelect.appendTo(this.$selectWrapper);
      }
    }, {
      key: "appendSearchInputOption",
      value: function appendSearchInputOption() {
        var placeholder = this.$nativeSelect.attr('searchable');
        this.$searchInput = $("<span class=\"search-wrap ml-2\"><div class=\"md-form mt-0\"><input type=\"text\" class=\"search form-control w-100 d-block\" placeholder=\"".concat(placeholder, "\"></div></span>"));
        this.$materialOptionsList.append(this.$searchInput);
      }
    }, {
      key: "appendToggleAllCheckbox",
      value: function appendToggleAllCheckbox() {
        this.$materialOptionsList.find('li.disabled').first().after(this.$toggleAll);
      }
    }, {
      key: "appendSaveSelectButton",
      value: function appendSaveSelectButton() {
        this.$selectWrapper.parent().find('button.btn-save').appendTo(this.$materialOptionsList);
      }
    }, {
      key: "buildMaterialOptions",
      value: function buildMaterialOptions() {
        var _this2 = this;

        this.$nativeSelectChildren.each(function (index, option) {
          var $this = $(option);

          if ($this.is('option')) {
            _this2.buildSingleOption($this, _this2.isMultiple ? 'multiple' : '');
          } else if ($this.is('optgroup')) {
            var $materialOptgroup = $("<li class=\"optgroup\"><span>".concat($this.attr('label'), "</span></li>"));

            _this2.$materialOptionsList.append($materialOptgroup);

            var $optgroupOptions = $this.children('option');
            $optgroupOptions.each(function (index, optgroupOption) {
              _this2.buildSingleOption($(optgroupOption), 'optgroup-option');
            });
          }
        });
      }
    }, {
      key: "buildSingleOption",
      value: function buildSingleOption($nativeSelectChild, type) {
        var disabled = $nativeSelectChild.is(':disabled') ? 'disabled' : '';
        var optgroupClass = type === 'optgroup-option' ? 'optgroup-option' : '';
        var iconUrl = $nativeSelectChild.data('icon');
        var fa = $nativeSelectChild.data('fas') ? "<i class=\"fas fa-".concat($nativeSelectChild.data('fas'), "\"></i> ") : '';
        var classes = $nativeSelectChild.attr('class');
        var iconHtml = iconUrl ? "<img alt=\"\" src=\"".concat(iconUrl, "\" class=\"").concat(classes, "\">") : '';
        var checkboxHtml = this.isMultiple ? "<input type=\"checkbox\" class=\"form-check-input\" ".concat(disabled, "/><label></label>") : '';
        this.$materialOptionsList.append($("<li class=\"".concat(disabled, " ").concat(optgroupClass, "\">").concat(iconHtml, "<span class=\"filtrable\">").concat(checkboxHtml).concat(fa).concat($nativeSelectChild.html(), "</span></li>")));
      }
    }, {
      key: "enableValidation",
      value: function enableValidation() {
        this.$nativeSelect.css({
          position: 'absolute',
          top: '1rem',
          left: '0',
          height: '0',
          width: '0',
          opacity: '0',
          padding: '0',
          'pointer-events': 'none'
        });

        if (this.$nativeSelect.attr('style').indexOf('inline!important') === -1) {
          this.$nativeSelect.attr('style', "".concat(this.$nativeSelect.attr('style'), " display: inline!important;"));
        }

        this.$nativeSelect.attr('tabindex', -1);
        this.$nativeSelect.data('inherit-tabindex', false);
      }
    }, {
      key: "bindEvents",
      value: function bindEvents() {
        var _this3 = this;

        var config = {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        };
        var observer = new MutationObserver(this._onMutationObserverChange.bind(this));
        observer.observe(this.$nativeSelect.get(0), config);
        observer.customId = this.uuid;
        observer.customStatus = 'observing';
        MaterialSelect.clearMutationObservers();
        MaterialSelect.mutationObservers.push(observer);
        var $saveSelectBtn = this.$nativeSelect.parent().find('button.btn-save');
        $saveSelectBtn.on('click', this._onSaveSelectBtnClick);
        this.$materialSelect.on('focus', this._onMaterialSelectFocus.bind(this));
        this.$materialSelect.on('click', this._onMaterialSelectClick.bind(this));
        this.$materialSelect.on('blur', this._onMaterialSelectBlur.bind(this));
        this.$materialSelect.on('keydown', this._onMaterialSelectKeydown.bind(this));
        this.$toggleAll.on('click', this._onToggleAllClick.bind(this));
        this.$materialOptionsList.on('mousedown', this._onEachMaterialOptionMousedown.bind(this));
        this.$materialOptionsList.find('li:not(.optgroup)').not(this.$toggleAll).each(function (materialOptionIndex, materialOption) {
          $(materialOption).on('click', _this3._onEachMaterialOptionClick.bind(_this3, materialOptionIndex, materialOption));
        });

        if (!this.isMultiple && this.isSearchable) {
          this.$materialOptionsList.find('li').on('click', this._onSingleMaterialOptionClick.bind(this));
        }

        if (this.isSearchable) {
          this.$searchInput.find('.search').on('keyup', this._onSearchInputKeyup);
        }

        $('html').on('click', this._onHTMLClick.bind(this));
      }
    }, {
      key: "_onMutationObserverChange",
      value: function _onMutationObserverChange(mutationsList) {
        mutationsList.forEach(function (mutation) {
          var $select = $(mutation.target).closest('select');

          if ($select.data('stop-refresh') !== true && (mutation.type === 'childList' || mutation.type === 'attributes' && $(mutation.target).is('option'))) {
            MaterialSelect.clearMutationObservers();
            $select.materialSelect('destroy');
            $select.materialSelect();
          }
        });
      }
    }, {
      key: "_onSaveSelectBtnClick",
      value: function _onSaveSelectBtnClick() {
        $('input.select-dropdown').trigger('close');
      }
    }, {
      key: "_onEachMaterialOptionClick",
      value: function _onEachMaterialOptionClick(materialOptionIndex, materialOption, e) {
        e.stopPropagation();
        var $this = $(materialOption);

        if ($this.hasClass('disabled') || $this.hasClass('optgroup')) {
          return;
        }

        var selected = true;

        if (this.isMultiple) {
          $this.find('input[type="checkbox"]').prop('checked', function (index, oldPropertyValue) {
            return !oldPropertyValue;
          });
          var hasOptgroup = Boolean(this.$nativeSelect.find('optgroup').length);
          var thisIndex = this._isToggleAllPresent() ? $this.index() - 1 : $this.index();

          if (this.isSearchable && hasOptgroup) {
            selected = this._toggleSelectedValue(thisIndex - $this.prevAll('.optgroup').length - 1);
          } else if (this.isSearchable) {
            selected = this._toggleSelectedValue(thisIndex - 1);
          } else if (hasOptgroup) {
            selected = this._toggleSelectedValue(thisIndex - $this.prevAll('.optgroup').length);
          } else {
            selected = this._toggleSelectedValue(thisIndex);
          }

          if (this._isToggleAllPresent()) {
            this._updateToggleAllOption();
          }

          this.$materialSelect.trigger('focus');
        } else {
          this.$materialOptionsList.find('li').removeClass('active');
          $this.toggleClass('active');
          this.$materialSelect.val($this.text());
          this.$materialSelect.trigger('close');
        }

        this._selectSingleOption($this);

        this.$nativeSelect.data('stop-refresh', true);
        this.$nativeSelect.find('option').eq(materialOptionIndex).prop('selected', selected);
        this.$nativeSelect.removeData('stop-refresh');

        this._triggerChangeOnNativeSelect();

        if (typeof this.options === 'function') {
          this.options();
        }
      }
    }, {
      key: "_triggerChangeOnNativeSelect",
      value: function _triggerChangeOnNativeSelect() {
        var keyboardEvt = new KeyboardEvent('change', {
          bubbles: true,
          cancelable: true
        });
        this.$nativeSelect.get(0).dispatchEvent(keyboardEvt);
      }
    }, {
      key: "_onMaterialSelectFocus",
      value: function _onMaterialSelectFocus(e) {
        var $this = $(e.target);

        if ($('ul.select-dropdown').not(this.$materialOptionsList.get(0)).is(':visible')) {
          $('input.select-dropdown').trigger('close');
        }

        if (!this.$materialOptionsList.is(':visible')) {
          $this.trigger('open', ['focus']);
          var label = $this.val();
          var $selectedOption = this.$materialOptionsList.find('li').filter(function () {
            return $(this).text().toLowerCase() === label.toLowerCase();
          })[0];

          this._selectSingleOption($selectedOption);
        }
      }
    }, {
      key: "_onMaterialSelectClick",
      value: function _onMaterialSelectClick(e) {
        e.stopPropagation();
      }
    }, {
      key: "_onMaterialSelectBlur",
      value: function _onMaterialSelectBlur(e) {
        var $this = $(e);

        if (!this.isMultiple && !this.isSearchable) {
          $this.trigger('close');
        }

        this.$materialOptionsList.find('li.selected').removeClass('selected');
      }
    }, {
      key: "_onSingleMaterialOptionClick",
      value: function _onSingleMaterialOptionClick() {
        this.$materialSelect.trigger('close');
      }
    }, {
      key: "_onEachMaterialOptionMousedown",
      value: function _onEachMaterialOptionMousedown(e) {
        var option = e.target;

        if ($('.modal-content').find(this.$materialOptionsList).length) {
          if (option.scrollHeight > option.offsetHeight) {
            e.preventDefault();
          }
        }
      }
    }, {
      key: "_onHTMLClick",
      value: function _onHTMLClick(e) {
        if (!$(e.target).closest("#select-options-".concat(this.uuid)).length) {
          this.$materialSelect.trigger('close');
        }
      }
    }, {
      key: "_onToggleAllClick",
      value: function _onToggleAllClick() {
        var _this4 = this;

        var checkbox = $(this.$toggleAll).find('input[type="checkbox"]').first();
        var state = !$(checkbox).prop('checked');
        $(checkbox).prop('checked', state);
        this.$materialOptionsList.find('li:not(.optgroup):not(.disabled):not(.select-toggle-all)').each(function (materialOptionIndex, materialOption) {
          var $optionCheckbox = $(materialOption).find('input[type="checkbox"]');

          if (state && $optionCheckbox.is(':checked') || !state && !$optionCheckbox.is(':checked')) {
            return;
          }

          if (_this4._isToggleAllPresent()) {
            materialOptionIndex++;
          }

          $optionCheckbox.prop('checked', state);

          _this4.$nativeSelect.find('option').eq(materialOptionIndex).prop('selected', state);

          if (state) {
            $(materialOption).removeClass('active');
          } else {
            $(materialOption).addClass('active');
          }

          _this4._toggleSelectedValue(materialOptionIndex);

          _this4._selectOption(materialOption);

          _this4._setValueToMaterialSelect();
        });
        this.$nativeSelect.data('stop-refresh', true);

        this._triggerChangeOnNativeSelect();

        this.$nativeSelect.removeData('stop-refresh');
      }
    }, {
      key: "_onMaterialSelectKeydown",
      value: function _onMaterialSelectKeydown(e) {
        var $this = $(e.target);
        var isTab = e.which === this.keyCodes.tab;
        var isEsc = e.which === this.keyCodes.esc;
        var isEnter = e.which === this.keyCodes.enter;
        var isArrowUp = e.which === this.keyCodes.arrowUp;
        var isArrowDown = e.which === this.keyCodes.arrowDown;
        var isMaterialSelectVisible = this.$materialOptionsList.is(':visible');

        if (isTab) {
          this._handleTabKey($this);

          return;
        } else if (isArrowDown && !isMaterialSelectVisible) {
          $this.trigger('open');
          return;
        } else if (isEnter && !isMaterialSelectVisible) {
          return;
        }

        e.preventDefault();

        if (isEnter) {
          this._handleEnterKey($this);
        } else if (isArrowDown) {
          this._handleArrowDownKey();
        } else if (isArrowUp) {
          this._handleArrowUpKey();
        } else if (isEsc) {
          this._handleEscKey($this);
        } else {
          this._handleLetterKey(e);
        }
      }
    }, {
      key: "_handleTabKey",
      value: function _handleTabKey(materialSelect) {
        this._handleEscKey(materialSelect);
      }
    }, {
      key: "_handleEnterKey",
      value: function _handleEnterKey(materialSelect) {
        var $materialSelect = $(materialSelect);
        var $activeOption = this.$materialOptionsList.find('li.selected:not(.disabled)');
        $activeOption.trigger('click');

        if (!this.isMultiple) {
          $materialSelect.trigger('close');
        }
      }
    }, {
      key: "_handleArrowDownKey",
      value: function _handleArrowDownKey() {
        var $firstOption = this.$materialOptionsList.find('li').not('.disabled').not('.select-toggle-all').first();
        var $lastOption = this.$materialOptionsList.find('li').not('.disabled').not('.select-toggle-all').last();
        var anySelected = this.$materialOptionsList.find('li.selected').length > 0;
        var $currentOption = anySelected ? this.$materialOptionsList.find('li.selected') : $firstOption;
        var $matchedMaterialOption = $currentOption.is($lastOption) || !anySelected ? $currentOption : $currentOption.next('li:not(.disabled)');

        this._selectSingleOption($matchedMaterialOption);

        this.$materialOptionsList.find('li').removeClass('active');
        $matchedMaterialOption.toggleClass('active');
      }
    }, {
      key: "_handleArrowUpKey",
      value: function _handleArrowUpKey() {
        var $firstOption = this.$materialOptionsList.find('li').not('.disabled').not('.select-toggle-all').first();
        var $lastOption = this.$materialOptionsList.find('li').not('.disabled').not('.select-toggle-all').last();
        var anySelected = this.$materialOptionsList.find('li.selected').length > 0;
        var $currentOption = anySelected ? this.$materialOptionsList.find('li.selected') : $lastOption;
        var $matchedMaterialOption = $currentOption.is($firstOption) || !anySelected ? $currentOption : $currentOption.prev('li:not(.disabled)');

        this._selectSingleOption($matchedMaterialOption);

        this.$materialOptionsList.find('li').removeClass('active');
        $matchedMaterialOption.toggleClass('active');
      }
    }, {
      key: "_handleEscKey",
      value: function _handleEscKey(materialSelect) {
        var $materialSelect = $(materialSelect);
        $materialSelect.trigger('close');
      }
    }, {
      key: "_handleLetterKey",
      value: function _handleLetterKey(e) {
        var _this5 = this;

        var filterQueryString = '';
        var letter = String.fromCharCode(e.which).toLowerCase();
        var nonLetters = Object.keys(this.keyCodes).map(function (key) {
          return _this5.keyCodes[key];
        });
        var isLetterSearchable = letter && nonLetters.indexOf(e.which) === -1;

        if (isLetterSearchable) {
          filterQueryString += letter;
          var $matchedMaterialOption = this.$materialOptionsList.find('li').filter(function () {
            return $(this).text().toLowerCase().indexOf(filterQueryString) !== -1;
          }).first();

          if (!this.isMultiple) {
            this.$materialOptionsList.find('li').removeClass('active');
          }

          $matchedMaterialOption.addClass('active');

          this._selectSingleOption($matchedMaterialOption);
        }
      }
    }, {
      key: "_onSearchInputKeyup",
      value: function _onSearchInputKeyup(e) {
        var $this = $(e.target);
        var $ul = $this.closest('ul');
        var searchValue = $this.val();
        var $options = $ul.find('li span.filtrable');
        $options.each(function () {
          var $option = $(this);

          if (typeof this.outerHTML === 'string') {
            var liValue = this.textContent.toLowerCase();

            if (liValue.includes(searchValue.toLowerCase())) {
              $option.show().parent().show();
            } else {
              $option.hide().parent().hide();
            }
          }
        });
      }
    }, {
      key: "_isToggleAllPresent",
      value: function _isToggleAllPresent() {
        return this.$materialOptionsList.find(this.$toggleAll).length;
      }
    }, {
      key: "_updateToggleAllOption",
      value: function _updateToggleAllOption() {
        var $allOptionsButToggleAll = this.$materialOptionsList.find('li').not('.select-toggle-all, .disabled').find('[type=checkbox]');
        var $checkedOptionsButToggleAll = $allOptionsButToggleAll.filter(':checked');
        var isToggleAllChecked = this.$toggleAll.find('[type=checkbox]').is(':checked');

        if ($checkedOptionsButToggleAll.length === $allOptionsButToggleAll.length && !isToggleAllChecked) {
          this.$toggleAll.find('[type=checkbox]').prop('checked', true);
        } else if ($checkedOptionsButToggleAll.length < $allOptionsButToggleAll.length && isToggleAllChecked) {
          this.$toggleAll.find('[type=checkbox]').prop('checked', false);
        }
      }
    }, {
      key: "_toggleSelectedValue",
      value: function _toggleSelectedValue(optionIndex) {
        var selectedValueIndex = this.valuesSelected.indexOf(optionIndex);
        var isSelected = selectedValueIndex !== -1;

        if (!isSelected) {
          this.valuesSelected.push(optionIndex);
        } else {
          this.valuesSelected.splice(selectedValueIndex, 1);
        }

        this.$materialOptionsList.find('li:not(.optgroup):not(.select-toggle-all)').eq(optionIndex).toggleClass('active');
        this.$nativeSelect.find('option').eq(optionIndex).prop('selected', !isSelected);

        this._setValueToMaterialSelect();

        return !isSelected;
      }
    }, {
      key: "_selectSingleOption",
      value: function _selectSingleOption(newOption) {
        this.$materialOptionsList.find('li.selected').removeClass('selected');

        this._selectOption(newOption);
      }
    }, {
      key: "_selectOption",
      value: function _selectOption(newOption) {
        var option = $(newOption);
        option.addClass('selected');
      }
    }, {
      key: "_setValueToMaterialSelect",
      value: function _setValueToMaterialSelect() {
        var value = '';
        var itemsCount = this.valuesSelected.length;

        for (var i = 0; i < itemsCount; i++) {
          var text = this.$nativeSelect.find('option').eq(this.valuesSelected[i]).text();
          value += ", ".concat(text);
        }

        if (itemsCount >= 5) {
          value = "".concat(itemsCount, " options selected");
        } else {
          value = value.substring(2);
        }

        if (value.length === 0) {
          value = this.$nativeSelect.find('option:disabled').eq(0).text();
        }

        this.$nativeSelect.siblings('input.select-dropdown').val(value);
      }
    }, {
      key: "_randomUUID",
      value: function _randomUUID() {
        var d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
        });
      }
    }], [{
      key: "clearMutationObservers",
      value: function clearMutationObservers() {
        MaterialSelect.mutationObservers.forEach(function (observer) {
          observer.disconnect();
          observer.customStatus = 'stopped';
        });
      }
    }]);

    return MaterialSelect;
  }();

  $.fn.materialSelect = function (callback) {
    $(this).not('.browser-default').not('.custom-select').each(function () {
      var materialSelect = new MaterialSelect($(this), callback);
      materialSelect.init();
    });
  };

  $.fn.material_select = $.fn.materialSelect;

  (function (originalVal) {
    $.fn.val = function (value) {
      if (!arguments.length) {
        return originalVal.call(this);
      }

      if (this.data('stop-refresh') !== true && this.hasClass('mdb-select') && this.hasClass('initialized') && !this.hasClass('browser-default') && !this.hasClass('custom-select')) {
        MaterialSelect.clearMutationObservers();
        this.materialSelect('destroy');
        var ret = originalVal.call(this, value);
        this.materialSelect();
        return ret;
      }

      return originalVal.call(this, value);
    };
  })($.fn.val);
})(jQuery);

jQuery('select').siblings('input.select-dropdown').on('mousedown', function (e) {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    if (e.clientX >= e.target.clientWidth || e.clientY >= e.target.clientHeight) {
      e.preventDefault();
    }
  }
});