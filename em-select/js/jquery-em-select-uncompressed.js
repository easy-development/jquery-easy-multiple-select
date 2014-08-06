var jQueryEMSelect = {

  selectObject        : {},
  selectOptionsList   : {}, // value => text
  selectedOptionsList : [], // value

  Init : function(selectObject) {
    if(selectObject.hasClass('dispatched'))
      return;

    selectObject.addClass('dispatched');

    this.selectObject = selectObject;
    this.selectObject.data('em_select', this);

    this.switchToInteractiveMode();
  },

  switchToInteractiveMode : function() {
    this.Helper.Init(this);
    this.InteractiveSection.Init(this);
    this.DOMObserver.Init(this);
  },

  InteractiveSection : {

    containerObject         : {},
    selectObject            : {},
    informationListObject   : {},
    containerClass          : 'jquery-em-interactive-container',
    selectClass             : 'jquery-em-interactive-select',
    informationListClass    : 'jquery-em-interactive-information-list',
    selectOptionDisplayKey  : 'jquery-em-select-placeholder',
    selectOptionDisplayText : 'Please Select...',

    Controller : {},

    Init : function(Controller) {
      this.Controller = Controller;

      this.Controller.selectObject.hide();
      this.SetContainer();
      this.SetSelectInteraction();
    },

    Reset : function() {
      this.containerObject.remove();
      this.SetContainer();
      this.SetSelectInteraction();
    },

    SetContainer : function() {
      this.Controller.selectObject.after(this._getContainerHTML());

      this.containerObject = this.Controller.selectObject.next();

      this.selectObject    = this.containerObject.find('> .' + this.selectClass );
      this.informationListObject = this.containerObject.find('> .' + this.informationListClass);

      this.SetSelectRemove();
    },

    _getContainerHTML : function() {
      var objectInstance = this;

      var html = "";

      html += '<div class="' + objectInstance.containerClass + '">';
      html +=   '<select class="' + this.selectClass + '">';

      html +=     '<option value="' + this.selectOptionDisplayKey + '">' + this.selectOptionDisplayText + '</option>';

      jQuery.each(objectInstance.Controller.selectOptionsList, function(key, value){
        html += '<option value="' + key + '" ' + (jQuery.inArray(key, objectInstance.Controller.selectedOptionsList) != -1 ? 'disabled="disabled"' : '') + '>' + value + '</option>';
      });

      html +=   '</select>';

      html +=   '<ul class="' + objectInstance.informationListClass + '">';

      jQuery.each(objectInstance.Controller.selectedOptionsList, function(index, key){
        html += objectInstance._getSelectLineItem(key, objectInstance.Controller.selectOptionsList[key]);
      });

      html +=   '</ul>';

      html += '</div>';

      return html;
    },

    SetSelectInteraction : function() {
      var objectInstance = this;

      this.selectObject.bind('change', function(){
        if(jQuery(this).val() == objectInstance.selectOptionDisplayKey)
          return;

        var key   = jQuery(this).val(),
            value = objectInstance.selectObject.find('> option[value="' + key + '"]').html();

        objectInstance.Controller.selectObject.val(
            jQuery.merge(
                (
                    jQuery.isEmptyObject(objectInstance.Controller.selectObject.val())
                        ? [] : objectInstance.Controller.selectObject.val()
                    ),
                [key]
            )
        );

        objectInstance.selectObject.find('> option[value="' + key + '"]').attr('disabled', 'disabled');
        objectInstance.selectObject.val(objectInstance.selectOptionDisplayKey);

        objectInstance.informationListObject.append(objectInstance._getSelectLineItem(key, value));
        objectInstance.informationListObject.find(' > *:last').hide().slideDown('slow');
        objectInstance.SetSelectRemove();
      });
    },

    SetSelectRemove : function() {
      var objectInstance = this;

      this.informationListObject.find('> li > span.remove').not('.binded').addClass('binded').bind('click touchstart', function(){
        var key                    = jQuery(this).parent('li').attr('data-option-key'),
            controllerSelectValues = objectInstance.Controller.selectObject.val();

        jQuery.each(controllerSelectValues, function(selectVKey, selectVValue){
          if(selectVValue == key)
            delete controllerSelectValues[selectVKey];
        });

        objectInstance.Controller.selectObject.val(controllerSelectValues);
        objectInstance.selectObject.find('> option[value="' + key + '"]').removeAttr('disabled');

        jQuery(this).parent('li').slideUp('slow', function(){
          jQuery(this).remove();
        });
      });
    },

    _getSelectLineItem : function(key, value) {
      return '<li data-option-key="' + key + '"><span class="text">' + value + '</span><span class="remove">Remove</span><span class="clear"></span></li>';
    }

  },

  DOMObserver : {

    Observer   : {},
    Controller : {},

    Init : function(Controller) {
      var objectInstance = this;

      this.Controller = Controller;

      if(typeof MutationObserver == "function") {
        this.Observer = new MutationObserver(function(mutations) {
          objectInstance._observed();
        });

        this.Observer.observe(objectInstance.Controller.selectObject[0], { childList: true });
      }
    },

    _observed : function() {
      var aKeys = Object.keys(this.Controller.Helper.getCurrentSelectElements()).sort();
      var bKeys = Object.keys(this.Controller.selectOptionsList).sort();

      if(!(JSON.stringify(aKeys) === JSON.stringify(bKeys))) {
        this.Controller.Helper.setCurrentSelectElements();
        this.Controller.InteractiveSection.Reset();
      }
    }

  },

  Helper : {

    Controller : {},

    Init : function(Controller) {
      this.Controller = Controller;

      this.setCurrentSelectElements();
    },

    setCurrentSelectElements : function() {
      var objectInstance = this;

      objectInstance.Controller.selectOptionsList   = this.getCurrentSelectElements();
      objectInstance.Controller.selectedOptionsList = this.getCurrentSelectedElements();
    },

    getCurrentSelectElements : function() {
      var objectInstance = this,
          ret = {};

      this.Controller.selectObject.find('> option').each(function(){
          ret[jQuery(this).attr('value')] = jQuery(this).html();
      });

      return ret;
    },

    getCurrentSelectedElements : function() {
      var objectInstance = this,
          ret = [];

      this.Controller.selectObject.find('> option:selected').each(function(){
        ret[ret.length] = jQuery(this).attr('value');
      });

      return ret;
    }

  }

};

jQuery(document).ready(function(){

  jQuery('.component-em-select').em_select();

});

jQuery.fn.extend({
  em_select : function () {
    jQuery(this).each(function(){
      var instance = jQuery.extend(true, {}, jQueryEMSelect);

      instance.Init(jQuery(this));
    });

    return jQuery(this);
  }
});