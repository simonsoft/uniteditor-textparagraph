var authormodel = require('authormodel');

var Backbone = authormodel.Backbone;
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

  tagName: 'p',

  mixins: {},

  events: {
    'keypress': 'onKeypress',
    'authoraction': 'onAuthorAction'
  },

  initialize: function(options) {
    // the above was added, despite the below, because exceptions don't produce a navigable stack in console
    // also mocha in browser handles exceptions really badly unless they are expected for, just bailing out so you don't see which test
    if (typeof options == 'undefined') throw new NoOptionsGivenException();
    if (!this.model) throw new IllegalArgumentException('model', 'required');
    if (!this.model.get('type')) throw new IllegalArgumentException('type', 'expected for authoring unit');
    new FlagCommon(this);
  },

  render: function() {
    this.$el.text(this.model.get('content') || '');
    this.el.contentEditable = true;
    this.mixins.FlagCommon.render();
    return this;
  },

  save: function() {
    this.model.set('content', this.$el.text());
  },

  focus: function() {
    this.$el.focus();
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
    if (!this.el) {
      throw new Error('Missing element, selection is unavaialble')
    }
    if (rangy.initialized && rangy.supported) {
      var selection = rangy.getSelection();
      var el = this.el;

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

});

// NPM and plain javascript tag compatibility
if (typeof module != 'undefined') {
  module.exports = TextParagraphEditor;
} else {
  window.TextParagraphEditor = TextParagraphEditor;
}
