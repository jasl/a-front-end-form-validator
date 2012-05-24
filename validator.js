/**
 * @author Jasl
 * @version 0.6
 *
 */
var Validator = (function() {
  var self = this;

  var _default_message = '{alias}输入有误。';

  var _val_items = [];

  var _val_rules = [];

  var _final_message = function(message, item) {
    var msg = message;
    var variables = msg.match(/\{[.\w]+\}/ig);

    if(msg.indexOf('{alias}') >= 0) {
      msg = msg.replace('{alias}', item.alias);
    }

    for(var i in variables) {
      var key = variables[i].match(/\w+/ig);
      var value = item.pattern[key[0]];
      if(key.length > 1) {
        for(var v = 1; v < key.length; v++) {
          value = value[key[v]];
        }
      }
      if( typeof (value) === 'object') {
        value = value.toString();
      }
      msg = msg.replace(variables[i], value);
    }
    msg = msg.replace(/\{[.\w]+\}/ig, '');
    return msg;
  };

  self.add_rule = function(name, pattern) {
    if(name !== '' && pattern && pattern.shoulda) {
      _val_rules[name] = pattern;
      return true;
    } else {
      return false;
    }
  };

  self.get_error_items = function() {
    var error_items = Array();
    for(var i in _val_items) {
      if(!_val_items[i].corrected) {
        error_items.push(_val_items[i]);
      }
    }
    return error_items;
  };

  self.callback = undefined;

  self.summit_callback = undefined;

  self.ensure = function(item, pattern) {
    for(var i in item) {
      _val_items[i] = {
        id : i,
        alias : item[i],
        pattern : pattern,
        corrected : false
      };
    }
  };

  self.do_validate = function(item, value, use_callback) {
    var pattern = item.pattern;

    for(var i = 0; i < pattern.validates.length; i++) {
      var rule = _val_rules[pattern.validates[i]];
      if(rule) {
        if(rule.preprocessing) {
          rule.preprocessing(pattern);
        }

        item.corrected = rule.shoulda(value, pattern);
        if(!item.corrected) {
          if(!pattern.message) {
            item.message = _final_message(rule.message, item);
          } else if(pattern.message) {
            item.message = _final_message(pattern.message, item);
          } else {
            item.message = _final_message(_default_message, item);
          }
        }
      }
    }

    if(use_callback && self.callback) {
      self.callback(item, value);
    }

    return item.corrected;
  };

  self.check_form = function() {
    var flag = true;
    for(var i in _val_items) {
      var tar = window.document.getElementById(_val_items[i].id);
      if(tar) {
        flag = self.do_validate(_val_items[i], tar.value.trim()) && flag;
      }
    }

    if(!flag) {
      if(self.summit_callback) {
        self.summit_callback();
      }

      return false;
    } else {
      return true;
    }
  };

  self.check = function(e) {
    var event = arguments[0] || window.event;
    return self.do_validate(_val_items[event.id], event.value, true);
  };

  return self;
})();

Validator.add_rule('presence', {
  shoulda : function(value, pattern) {
    return value !== '';
  },
  message : "{alias}不能为空。"
});

Validator.add_rule('size', {
  preprocessing : function(pattern) {
    if(!pattern.size.minimium) {
      pattern.size.minimium = 0;
    }
    if(!pattern.size.maximium) {
      pattern.size.maximium = 50;
    }
  },
  shoulda : function(value, pattern) {
    return value.length >= pattern.size.minimium && value.length <= pattern.size.maximium;
  },
  message : "{alias}的长度应在{size.minimium}-{size.maximium}之间。"
});

Validator.add_rule('format', {
  shoulda : function(value, pattern) {
    if(!pattern.format) {
      return false;
    }
    return pattern.format.test(value);
  },
  message : "{alias}格式无效。"
});

Validator.add_rule('shoulda', {
  shoulda : function(value, pattern) {
    if(!pattern.shoulda) {
      return false;
    }
    return pattern.shoulda(value);
  },
  message : "{alias}格式无效。"
});

Validator.add_rule('inclusion', {
  shoulda : function(value, pattern) {
    if(!pattern.inclusion) {
      return false;
    }

    var flag = false;
    for(var i in pattern.inclusion) {
      if(pattern.inclusion[i] === value) {
        flag = true;
        break;
      }
    }
    return flag;
  },
  message : "{alias}的值应是[{inclusion}]之一。"
});

Validator.add_rule('exclusion', {
  shoulda : function(value, pattern) {
    if(!pattern.exclusion) {
      return false;
    }

    var flag = true;
    for(var i in pattern.exclusion) {
      if(pattern.exclusion[i] === value) {
        flag = false;
        break;
      }
    }
    return flag;
  },
  message : "{alias}不能包含[{exclusion}]。"
});

Validator.add_rule('email', {
  shoulda : function(value, pattern) {
    var regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    return regex.test(value);
  },
  message : "{alias}不是有效的E-mail格式。"
});
