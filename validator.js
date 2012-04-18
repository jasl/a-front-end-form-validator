/**
 * @author Jasl
 * @version 0.4
 *
 */
var Validator = function() {
  var self = this;

  var _val_items = Array();

  self.get_error_items = function() {
    var error_items = Array();
    for(var i in _val_items) {
      if(!_val_items[i].corrected) {
        error_items.push(_val_items[i]);
      }
    }
    return error_items;
  };

  var _final_message = function(message, item) {
    var msg = message;
    var variables = msg.match(/\{[.\w]+\}/ig);

    if(msg.indexOf('{alias}') >= 0) {
      msg = msg.replace('{alias}', item.alias);
    }

    for(var i in variables) {
      key = variables[i].match(/\w+/ig);
      value = item.pattern[key[0]];
      if(key.length > 1) {
        for(var v = 1; v < key.length; v++) {
          value = value[key[v]];
        }
      }
      if( typeof (value) == 'object') {
        value = value.toString();
      }
      msg = msg.replace(variables[i], value);
    }
    msg = msg.replace(/\{[.\w]+\}/ig, '');
    return msg;
  };

  self.call_back = undefined;

  self.error_handler = function() {
    var str = "";
    var error_items = get_error_items();
    for(var i in error_items) {
      str += error_items[i].message + "\n";
    }
    alert(str);
  };

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

  self.do_validate = function(check_item, check_value, use_call_back) {
    item = check_item;
    value = check_value.trim();
    pattern = item.pattern;

    for(var i = 0; i < pattern.validates.length; i++) {
      var rule = Validator.rules[pattern.validates[i]];
      if(rule) {
        if(rule.preprocessing) {
          rule.preprocessing();
        }

        item.corrected = rule.shoulda();
        if(!item.corrected) {
          if(!pattern.message) {
            item.message = _final_message(Validator.rules[pattern.validates[i]].message, item);
          } else {
            item.message = _final_message(pattern.message, item);
          }
        }
      }
    }

    if(use_call_back && self.call_back) {
      self.call_back();
    }

    return item.corrected;
  };

  self.check_form = function() {
    var flag = true;
    for(var i in _val_items) {
      tar = window.document.getElementById(_val_items[i].id);
      if(tar) {
        flag &= self.do_validate(_val_items[i], tar.value);
      }
    }

    if(!flag) {
      self.error_handler();
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
};

Validator.rules = Array();

Validator.rules['presence'] = {
  shoulda : function() {
    return value != '';
  },
  message : "{alias}不能为空。"
};

Validator.rules['size'] = {
  preprocessing : function() {
    if(!pattern.size.minimium) {
      pattern.size.minimium = 0;
    }
    if(!pattern.size.maximium) {
      pattern.size.maximium = 50;
    }
  },
  shoulda : function() {
    flag = (value.length >= pattern.size.minimium);
    flag &= (value.length <= pattern.size.maximium);
    return flag;
  },
  message : "{alias}的长度应在{size.minimium}-{size.maximium}之间。"
};

Validator.rules['format'] = {
  shoulda : function() {
    return pattern.format.test(value);
  },
  message : "{alias}格式无效。"
};

Validator.rules['shoulda'] = {
  shoulda : function() {
    return pattern.shoulda(value);
  },
  message : "{alias}格式无效。"
};

Validator.rules['inclusion'] = {
  shoulda : function() {
    var flag = false;
    for(var i in pattern.inclusion) {
      if(pattern.inclusion[i] == value) {
        flag = true;
        break;
      }
    }
    return flag;
  },
  message : "{alias}的值应是[{inclusion}]之一。"
};

Validator.rules['exclusion'] = {
  shoulda : function() {
    var flag = true;
    for(var i in pattern.exclusion) {
      if(pattern.exclusion[i] == value) {
        flag = false;
        break;
      }
    }
    return flag;
  },
  message : "{alias}不能包含[{exclusion}]。"
};

Validator.rules['email'] = {
  shoulda : function() {
    var regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    return regex.test(value);
  },
  message : "{alias}不是有效的E-mail格式。"
};

Validator.rules['date'] = {
  shoulda : function() {
    var regex = /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2]\d|3[0-1])$/;
    return regex.test(value);
  },
  message : "{alias}不是有效的的日期格式。"
};
