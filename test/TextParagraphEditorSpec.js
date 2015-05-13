var expect = require('chai').expect;

var exports = require('../');
var TextParagraphEditor = exports.UnitEditor;
//var TextParagraphEditor = require('../src/TextParagraphEditorBackbone');

var AuthoringUnit = require('authormodel').AuthoringUnit;

describe("TextParagraphEditor", function() {

  describe("implements UnitEditor", function() {
    require('authormodel/uniteditors/test/UnitEditorSpec.js')(exports);
  });

  describe("implements UnitEditor, is .content compatible", function() {
    require('authormodel/uniteditors/test/UnitEditorContentSpec.js')(exports);
  });

  describe("implements UnitEditor, actions spec", function() {
    require('authormodel/uniteditors/test/UnitEditorActionSpec.js')(exports);
  });

  describe("Create new", function() {

    var unit1 = new AuthoringUnit({type: 'text'});
    var editor1;

    it("Should take an authoring unit model as inject", function() {
      editor1 = new TextParagraphEditor({model: unit1});
      expect(editor1.model).to.exist;
    });

    it('Should fail to create without options given', function() {
      expect(function() {
        new TextParagraphEditor();
      }).to.throw(/Text Paragraph constructor expects options/);
    });

    it("Should fail creation if the model lacks a type attribute", function() {
      var invalidModel = new AuthoringUnit({type: 'p'});
      delete invalidModel.attributes.type;
      expect(function() {
        new TextParagraphEditor({model: invalidModel})
      }).to.throw("Property 'type' expected for authoring unit");
    });

    it("Avoids automatic render, as render behavior is regulated by UI", function() {
      var u = new AuthoringUnit({type: 'p', content: 'initial'});
      var ue = new TextParagraphEditor({model: u});
      // define backbone behavior, so we get alerted if such fundamentals change
      expect(ue.$el).to.exist;
      expect(ue.el).to.exist;
      expect(ue.$el.length).to.equal(1);
      // the actual assert
      expect(ue.$el.text()).to.not.equal('initial');
      expect(ue.$el.text()).to.equal('');
    });

    it("The new instance should render a $el", function() {
      editor1.render(); // it might be that the impl defers .el creation until first render
      expect(editor1.el).to.exist;
      expect(editor1.$el).to.exist;
    });

    it("Has a $p accessor for the content element", function() {
      expect(editor1.$p).to.exist;
      expect(editor1.$p).to.have.length(1);
    });

    it("Has a $p accessor for the content element", function() {
      expect(editor1.$p).to.exist;

    });

    it("Should render model contents to the element, but this model had no content", function() {
      expect(editor1.$el.text()).to.equal('');
      expect(editor1.$p[0].innerHTML).to.equal('');
    });

  });

  describe("Create from DOM element", function() {

    var $ = require('jquery');

    var unit1 = new AuthoringUnit({type: 'p'});
    var el = $('<div><p>my initial content</p></div>')[0];
    var editor1 = new TextParagraphEditor({model: unit1, el: el});

    it("should set its .el and .$el to the given element", function() {
      expect(editor1.el).to.equal(el);
      expect(editor1.$el[0]).to.equal(el);
      expect(editor1.$el.length).to.equal(1);
    });

    it("save() should bind existing content to model", function() {
      editor1.save();
      expect(editor1.model).to.exist;
      expect(editor1.model.attributes).to.exist;
      expect(editor1.model.attributes.content).to.equal('my initial content');
    });

    it("Also exposes $el corresponding to el", function() {
      expect(editor1.$el).to.exist;
      expect(editor1.$el.text()).to.equal('my initial content');
      expect(editor1.$el[0]).to.be.equal(el);
    });

  });

  describe("Create from DOM element, p only", function() {

    var $ = require('jquery');

    var unit1 = new AuthoringUnit({type: 'p'});
    var el = $('<p>my initial content</p>')[0];
    var editor1 = new TextParagraphEditor({model: unit1, el: el});

    it("render wraps with tagName", function() {
      editor1.render();
    });

  });

  describe("render explicitly", function() {
    var model1 = new AuthoringUnit({type: 'text'});
    editor1 = new TextParagraphEditor({model: model1});

    it('should render an el', function() {
      editor1.render();
      expect(editor1.el).to.exist;
    });

    it('should render an $el', function() {
      editor1.render();
      expect(editor1.$el).to.exist;
    });

    it('should render the contents of the model to el', function() {
      model1.attributes.content = 'helloworld';
      editor1.render();
      expect(editor1.el.textContent).to.equal('helloworld');
    });

    it('should render the contents of the model to $el', function() {
      model1.attributes.content = 'helloworld';
      editor1.render();
      expect(editor1.$el.text()).to.equal('helloworld');
    });

    it('should only render the contents of the model to el when render is called', function() {
      model1.attributes.content = 'helloworld';
      editor1.render();
      model1.attributes.content = 'byeworld';
      expect(editor1.el.textContent).to.equal('helloworld');
    });

    it('should set content editable on the element', function() {
      editor1.render();
      expect(editor1.$p.attr('contenteditable')).to.equal('true');
    });

    it('should return itself for chainability', function() {
      var result = editor1.render();
      expect(result).to.exist;
      expect(result).to.be.an.instanceof(TextParagraphEditor);
    });

  });

  describe("Supports 'preview' render", function() {

    it("Adds common class on render", function() {
      var editor = new TextParagraphEditor({model: new AuthoringUnit({type: 'text', preview: true})});
      editor.render();
      expect(editor.$el.is('.preview')).to.be.true;
    });

    it("Does so through FlagCommon mixin", function() {
      var au = new AuthoringUnit({type: 'text'});
      var editor = new TextParagraphEditor({model: au});
      expect(editor.mixins.FlagCommon).to.exist;
    });

    it("Does not render automatically (at least not yet, and maybe this should always be the responsibility of AuthoringRenderEngine)", function() {
      var au = new AuthoringUnit({type: 'text'});
      var editor = new TextParagraphEditor({model: au});
      editor.render();
      expect(editor.$el.is('.preview')).to.be.false;
      au.set('preview', true);
      editor.render();
      expect(editor.$el.is('.preview')).to.be.true;
    });

  });

  describe("Supports 'removed' render", function() {

    it("Is instead a concern of a UI library that wraps the $el, or do we extend the use of FlagCommon?");

  });

  describe("Automatic save", function() {

    it("Is difficult for downstream code to implement this behavior so unlike render() we auto save()...");

    it("... at blur", function() {
      var u = new AuthoringUnit({type: 'p', content: 'initial'});
      var ue = new TextParagraphEditor({model: u});
      ue.render();
      ue.$el.text('initials');
      expect(u.attributes.content).to.equal('initial');
      ue.$el.trigger('blur');
      expect(u.attributes.content).to.equal('initials');
    });

    it("... at the new HTML5 'input' event", function() {
      var u = new AuthoringUnit({type: 'p', content: 'init'});
      var ue = new TextParagraphEditor({model: u, saveOnChange: true});
      ue.render();
      ue.$el.text('ini');
      expect(u.attributes.content).to.equal('init');
      ue.$el.trigger('input');
      expect(u.attributes.content).to.equal('ini');
    });

    it("Not on input unless the saveOnChange option is set", function() {
      var u = new AuthoringUnit({type: 'p', content: 'init'});
      var ue = new TextParagraphEditor({model: u});
      ue.render();
      ue.$el.text('ini');
      expect(u.attributes.content).to.equal('init');
      ue.$el.trigger('input');
      expect(u.attributes.content).to.equal('init');
    });

  });

});
