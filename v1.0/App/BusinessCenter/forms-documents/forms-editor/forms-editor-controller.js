'use strict';

angular.module('Soar.BusinessCenter').controller('FormsEditorController', [
  '$scope',
  '$rootScope',
  'localize',
  '$timeout',
  '$location',
  'toastrFactory',
  function ($scope, $rootScope, localize, $timeout, $location, toastrFactory) {
    var ctrl = this;

    var defaultTools = kendo.ui.Editor.defaultTools;

    defaultTools['insertLineBreak'].options.shift = false;
    defaultTools['insertParagraph'].options.shift = true;

    // ie hack: sometimes ie will make the textarea unfocusable until you focus another element in the form
    // this puts the focus on the textarea, the long timeout is to keep the cursor from appearing above the textarea
    if ($scope.focus) {
      $timeout(function () {
        editor = $('#' + $scope.editorId).data('kendoEditor');
        //editor = $("#" + $scope.editorId).kendoEditor().data("kendoEditor");
        if (editor) {
          editor.focus();
        }
      }, 2000);
    }

    $scope.change = function () {
      $rootScope.$broadcast('setdataChanged', $scope.selectedMedia.Id);
      if ($scope.onChange) {
        $scope.onChange();
      }
    };

    //$scope.onKeydown = function (obj) {
    //    var x = obj;
    //    if ($scope.keydown) {
    //        $scope.keydown();
    //    }

    //}

    $scope.drop = function (obj) {
      if ($scope.onDrop) {
        $scope.onDrop();
      }
    };

    $scope.cancel = function () {
      if ($scope.onCancel) {
        $scope.onCancel();
      }
    };

    $scope.save = function () {
      if ($scope.onSave) {
        $scope.onSave();
        // trying to fix an ie bug, the content was being cached, the previous note was displayed when a second new note was being created
        //$scope.content = null;
      }
    };

    $scope.saveDraft = function () {
      console.log('saving the draft');
      if ($scope.onSaveDraft) {
        $scope.onSaveDraft();
      }
    };

    //$scope.options = {
    //    keydown: function (e) {
    //        $scope.onKeydown(e);
    //    },
    //    onDrop: function (e) {
    //        $scope.drop(e);
    //    },
    //    kendoDropTarget: function (e) {
    //        $scope.drop(e);
    //    },
    //    drop: function (e) {
    //        $scope.drop(e);
    //    },
    //};

    //var container = $("#textEditorForm");

    //kendo.init(container);

    //container.kendoValidator({
    //    rules: {
    //        maxTextLength: function (textarea) {
    //            if (textarea.is("[data-maxtextlength-msg]") && textarea.val() != "") {
    //                var maxlength = textarea.attr("data-maxtextlength");
    //                var value = textarea.data("kendoEditor").value();
    //                return value.replace(/<[^>]+>/g, "").length <= maxlength;

    //            }
    //            return true;
    //        },
    //        maxHtmlLength: function(textarea) {
    //            if (textarea.is("[data-maxhtmllength-msg]") && textarea.val() != "") {
    //                var maxlength = textarea.attr("data-maxhtmllength");
    //                var value = textarea.data("kendoEditor").value();
    //                return value.length <= maxlength;
    //            }

    //            return true;
    //        }
    //    }
    //});
    //console.log(container.kendoValidator)

    // set max length for text

    $scope.$on('callTemplateValidator', function (events, args) {
      $scope.noTemplateName = args.filter(function (obj) {
        return obj.name === 'noTemplateName';
      })[0].value;

      $scope.noGroup = args.filter(function (obj) {
        return obj.name === 'noGroup';
      })[0].value;

      $scope.duplicateTemplateName = args.filter(function (obj) {
        return obj.name === 'duplicateTemplateName';
      })[0].value;
    });

    ctrl.setMaxLength = function () {
      if (!$scope.maxLength) {
        $scope.maxLength = 500;
      }
    };
    ctrl.setMaxLength();

    // validate the content
    $scope.$watch(
      'content',
      function (nv, ov) {
        if (nv && nv != ov) {
          ctrl.validateForm();
        }
      },
      true
    );
    $scope.formIsValid = true;

    $scope.setHasChange = function () {
      $rootScope.$broadcast('setdataChanged', $scope.selectedMedia.Id);
    };
    //TOOD change maxLength;
    ctrl.validateForm = function () {
      if ($scope.content && $scope.content != null) {
        if ($scope.content.length > $scope.maxLength) {
          $scope.formIsValid = false;
        } else {
          $scope.formIsValid = true;
        }
      } else {
        $scope.formIsValid = false;
      }
    };

    ctrl.canEdit = function () {
      $timeout(function () {
        var editor = $('#templateEditor').data('kendoEditor');
        if (editor) {
          var editorBody = $(editor.body);
          if (editorBody) {
            editorBody.add('td', editorBody).removeAttr('contenteditable');
          }
        }
      }, 1000);
    };
    ctrl.canEdit();

    $scope.$on('tooth-widget-active', function (event, nv) {
      $scope.widgetActive = nv;
    });

    //=============
  },
]);

$(document).on('keyup', '#k-editor-table-caption', function (e) {
    var tableCaption = e.currentTarget.value;
    if (tableCaption !== null) {
        $("#k-editor-table-caption").val(_.escape(tableCaption));
    }
});

//start
//drag and drop event
var editorOffset;
var editorWidth;
var editorHeight;
var inEditor = false;
//var inSubject = false;
var dragX = 0;
var dragY = 0;
var iframeDoc;
var editor;
var range;

function setIFrameDoc() {
  _.each(document.getElementsByTagName('iframe'), function (obj) {
    if (obj.className === 'k-content') {
      iframeDoc = obj.contentWindow.document;
    }
  });
}

function treenodeDragstart(e) {
  if (iframeDoc == null) {
    setIFrameDoc();
  }

  $('#inpTemplateName').css('pointer-events', 'none');
  var kContent = $('.k-content');

  var kContentParent = $(kContent).parent();
  $(kContentParent).prepend('<div id="editorOverlay" class="overlay"></div>');
  $('#editorOverlay').css({
    // To debug overlay uncomment lines below
    //'border': '2px solid #ff0000',
    //'opacity': 1,
    width: kContent.width(),
    height: kContent.height(),
    top: kContent.position().top,
    left: kContent.position().left,
  });

  $('.overlay').kendoDropTarget({
    drop: dropTargetDrop,
    dragenter: dropTargetDragEnter,
    dragleave: dropTargetDragLeave,
  });

  //var subjectWrapper = $('#subjectWrapper');
  //$('#subjectWrapper').append('<div id="subjectOverlay" class="overlay">' + $('#subject').val() + '</div>');
  //$("#subjectOverlay").css({
  //    "width": $(subjectWrapper).outerWidth(),
  //    "height": $(subjectWrapper).outerHeight(),
  //    "left": $(subjectWrapper).offset().left
  //});

  //$("#subjectOverlay").kendoDropTarget({
  //    drop: subjectDropTargetDrop,
  //    dragenter: subjectDropTargetDragEnter,
  //    dragleave: subjectDropTargetDragLeave
  //});
}

function treenodeDrop(e) {
  $('#inpTemplateName').css('pointer-events', 'auto');
  $('#editorOverlay').remove();
  //$("#subjectOverlay").remove();
}

function treenodeDrag(event) {
  if (inEditor) {
    var x = event.clientX - editorOffset.left;
    var y = event.clientY - editorOffset.top;
    dragX = x;
    dragY = y;
    // Try the standards-based way first
    if (iframeDoc.caretPositionFromPoint) {
      var sel = iframeDoc.getSelection();
      var pos = iframeDoc.caretPositionFromPoint(x, y);
      range = iframeDoc.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.setEnd(pos.offsetNode, pos.offset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    // Next, the WebKit way
    else if (iframeDoc.caretRangeFromPoint) {
      var sel = iframeDoc.getSelection();
      range = iframeDoc.caretRangeFromPoint(x, y);
      range.setStart(range.startContainer, range.startOffset);
      range.setEnd(range.startContainer, range.startOffset);

      sel.removeAllRanges();
      sel.addRange(range);
    }
    // Finally, the IE way
    else if (iframeDoc.body.createTextRange) {
      $('.overlay').hide();
      range = iframeDoc.body.createTextRange();
      range.moveToPoint(x, y);
      range.select();

      $('.overlay').show();
    }
  }
  //} else if (inSubject) {
  //    var x = event.x.location;
  //    var y = event.y.location;
  //    dragX = x;
  //    dragY = y;
  //    var offset;
  //    // Try the standards-based way first
  //    if (iframeDoc.caretPositionFromPoint) {
  //        var pos = document.caretPositionFromPoint(x, y);
  //        offset = pos.offset;
  //    }
  //    // Next, the WebKit way
  //    else if (document.caretRangeFromPoint) {
  //        range = document.caretRangeFromPoint(x, y);
  //        offset = range.startOffset;
  //    } else if (document.body.createTextRange) {
  //        range = document.body.createTextRange();

  //        range.moveToPoint(x, y);
  //        range.select();
  //        offset = caret(document.getElementById('subjectOverlay'));
  //    }

  //    setCaretPosition(document.getElementById('subject'), offset);
  //}
}

function dropTargetDragEnter(e) {
  inEditor = true;
  editor.focus();
  editorOffset = $('#inpNotes').parent()[0].getBoundingClientRect();
  editorWidth = $('#inpNotes').parent().width();
  editorHeight = $('#inpNotes').parent().height();
}

function dropTargetDragLeave(e) {
  inEditor = false;
}

function dropTargetDrop(e) {
  $('#editorOverlay').remove();
  var range;
  editor.focus();
  // Try the standards-based way first
  if (iframeDoc.caretPositionFromPoint) {
    var pos = iframeDoc.caretPositionFromPoint(dragX, dragY);
    range = editor.createRange();
    range.setStart(pos.offsetNode, pos.offset);
    range.collapse(true);
  }
  // Next, the WebKit way
  else if (iframeDoc.caretRangeFromPoint) {
    range = iframeDoc.caretRangeFromPoint(dragX, dragY);
  }
  // Finally, the IE way
  else if (iframeDoc.body.createTextRange) {
    var textRange = iframeDoc.body.createTextRange();
    textRange.moveToPoint(dragX, dragY);
    textRange.select();

    //Gets the caret as an offset
    // eslint-disable-next-line no-undef
    var caret = getCaret(editor.body);

    range = iframeDoc.createRange();
    range.setStart(editor.body.firstChild, caret);
    range.collapse(true);
  }

  editor.selectRange(range);

  if (!range.endContainer.parentElement.hasAttribute('datapoint')) {
    editor.exec('insertHtml', {
      value:
        '<span datapoint="' +
        _.escape(e.draggable.hint[0].attributes.datapoint.textContent) +
        '" style="color:#0080FF" contenteditable="false">[' +
        _.escape(e.draggable.hint[0].textContent) +
        ']</span> ',
    });
  }

  inEditor = false;
}

//function subjectDropTargetDrop(e) {
//    var caretPos = document.getElementById("subject").selectionStart;
//    var textAreaTxt = $("#subject").val();
//    var txtToAdd = "{" + e.draggable.element[0].textContent + "} ";
//    $("#subject").val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos));

//    inSubject = false;
//}

//function subjectDropTargetDragEnter(e) {
//    inSubject = true;
//    editorOffset = $("#subject").parent()[0].getBoundingClientRect();
//    editorWidth = $("#subject").parent().width();
//    editorHeight = $("#subject").parent().height();
//}

//function subjectDropTargetDragLeave(e) {
//    inSubject = false;
//}
