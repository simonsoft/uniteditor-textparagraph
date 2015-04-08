
var AuthoringUnit = require('authormodel').AuthoringUnit;
var TextParagraphEditor = require('./').UnitEditor;

var createAnotherOne = function() {
  var unit = new AuthoringUnit({type: 'p'});
  var uniteditor = new TextParagraphEditor({model: unit});
  unit.attributes.content = "hello world"
  uniteditor.render();
  console.assert(!!uniteditor.$el, 'Should have created a $el at first render');
  uniteditor.$el.appendTo('#authoring');
};

var editExisting = function(el) {
  // typically we have some layer that resolves unit (particularily type) from DOM element
  var type = 'p';
  var unit = new AuthoringUnit({type: type});
  var uniteditor = new TextParagraphEditor({model: unit, el: el});
  uniteditor.save();
  uniteditor.render();
};

var $ = require('jquery');

$('#authoring p').each(function(el) {
  editExisting(el);
});

$('#append').click(function() {
  createAnotherOne();
});
