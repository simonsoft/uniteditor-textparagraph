var authormodel = require('authormodel');

var Backbone = authormodel.Backbone;
var _ = authormodel._;

var $ = require('jquery');

var ActionContext = authormodel.ActionContext;
var FlagCommon = require('authormodel/uniteditors/src/FlagCommon');

var rangy = require('rangy');
rangy.init();

/* Exceptions */
function NoOptionsGivenException() {
  this.message = 'Text Paragraph constructor expects options';
  this.toString = function() {
    return this.message;
  };
}

function IllegalArgumentException(property, message) {
  this.message = "Property '" + property + "' " + message;
  this.toString = function() {
    return this.message;
  };
}

var TextParagraphEditor = Backbone.View.extend({

  tagName: 'div', // should be overridden in case the p is wrapped in something else

  mixins: {},

  events: {
    'keypress': 'onKeypress',
    'authoraction': 'onAuthorAction',
    'focus': 'onFocus',
    'keyup': 'onKeyup',
    'blur': 'saveAuto',
    'input': 'saveAuto'
  },

  initialize: function(options) {
    // the above was added, despite the below, because exceptions don't produce a navigable stack in console
    // also mocha in browser handles exceptions really badly unless they are expected for, just bailing out so you don't see which test
    if (typeof options == 'undefined') throw new NoOptionsGivenException();
    if (!this.model) throw new IllegalArgumentException('model', 'required');
    if (!this.model.get('type')) throw new IllegalArgumentException('type', 'expected for authoring unit');
    this.saveOnChange = options.saveOnChange || false;
    new FlagCommon(this);
  },

  render: function() {
    if (!this.$p) {
      var p = this.$el.find('> p');
      if (!p.length) {
        p = $('<p/>').appendTo(this.$el);
      }
      this.$p = p;
    }
    this.$p.html(this.model.get('content') || '');
    this.$p[0].contentEditable = true;
    this.mixins.FlagCommon.render();
    return this;
  },

  save: function() {
    if (!this.$p) {
      throw new Error('Save can not be used prior to first render');
    }
    var encoded = this.$p.html();
    this.model.set('content', encoded);
  },

  saveAuto: function() {
    if (this.saveOnChange) {
      this.save();
    }
  },

  focus: function() {
    if (!this.$p) {
      throw new Error('Focus can not be used prior to render');
    }
    this.$p.focus();
  },

  onFocus: function(event) {
    // TODO add spec then remove debug
    console.debug('onFocus no-op', event, arguments[1]);
    //this.selectAll();
  },

  onKeyup: function(event) {
    // TODO do we need this emulation, or can 'focus' happen? Works pretty well for now because with mouse it is easy to select manually.
    if (event.keyCode == 9) {
      return; // This happens also if you alt-tab to the window and had the cursor in the text, not sure we'd want that
      console.debug('keyup tab emulates focus by keyboard', event.keyCode, event);
      //this.selectAll();
      // messing with rangy, not sure what would make a difference
      window.setTimeout(this.selectAll.bind(this), 100);
    }
  },

  isEmpty: function() {
    return this.$el.text().length === 0;
  },

  onKeypress: function(event) {
    if (event.keyCode == 13) {
      event.stopPropagation();
      event.preventDefault();

      var actionContext = new ActionContext();
      actionContext.setUnitEditor(this);
      actionContext.setUnit(this.model);
      if (this.hasSelection()) {
        actionContext.setSelection(this.getSelection());
      }
      this.trigger('authorintent', actionContext);
    }
  },

  onAuthorAction: function (actionContext) {
    console.log('onAuthorAction', actionContext);
  },

  hasSelection: function () {
    var selection = this.getSelection();
    if (!selection){
      return false;
    } else if(selection.isCollapsed){
      // If selection starts and ends in the same place, i.e. cursor
      return false;
    } else {
      return true;
    }
  },

  getSelection: function () {
    if (!this.$p) {
      throw new Error('Not rendered, selection is unavailable');
    }
    if (!this.$p[0]) {
      throw new Error('Missing element, selection is unavaialble');
    }
    if (rangy.initialized && rangy.supported) {
      var selection = rangy.getSelection();
      var el = this.$p[0];

      if (typeof selection.anchorNode !== 'undefined') {
        var tempNode = selection.anchorNode;
        while (tempNode) {
          //console.log('tempNode', tempNode);
          if (tempNode === el) {
            //console.log('they are the same!!', selection, el);
            return selection;
          } else {
            tempNode = tempNode.parentElement;
          }
        }
      }

      return undefined;
    } else {
      console.log('Rangy not supported');
      return undefined;
    }
  },

  selectAll: function() {
    if (!this.$p || !this.$p[0].firstChild) {
      throw new Error('Invalid state to make selection');
    }
    // TODO spec, init rangy?
    if (rangy.initialized && rangy.supported) {
      rangy.init();
      var range = rangy.createRange();
      range.setStartAndEnd(this.$p[0].firstChild, 0, this.model.get('content').length);
      console.debug('selectAll range', range);
      return range;
    } else {
      console.log('Rangy not supported');
      return undefined;
    }
  }

});

// NPM and plain javascript tag compatibility
if (typeof module != 'undefined') {
  module.exports = TextParagraphEditor;
} else {
  window.TextParagraphEditor = TextParagraphEditor;
}
