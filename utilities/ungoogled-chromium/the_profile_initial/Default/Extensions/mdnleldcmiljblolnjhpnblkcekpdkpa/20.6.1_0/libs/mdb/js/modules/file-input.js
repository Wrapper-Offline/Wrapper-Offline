"use strict";

(function ($) {
  $(document).on('change', '.file-field input[type="file"]', function (e) {
    var $this = $(e.target);
    var $fileField = $this.closest('.file-field');
    var $pathInput = $fileField.find('input.file-path');
    var files = $this[0].files;
    var fileNames = []; // files.forEach((file) => fileNames.push(file.name));

    if (Array.isArray(files)) {
      files.forEach(function (file) {
        return fileNames.push(file.name);
      });
    } else {
      Object.keys(files).forEach(function (key) {
        fileNames.push(files[key].name);
      });
    }

    $pathInput.val(fileNames.join(', '));
    $pathInput.trigger('change');
  });
})(jQuery);