/**
 * @author Jasl
 * @version 0.2
 *
 */
var Validator = function() {
  var self = this;

  var _val_items = Array();

  self.error_items = Array();

  self.error_handler = function() {
    str = "";
    for(var i in self.error_items) {
      if(self.error_items[i].message) {
        if(self.error_items[i].alias) {
          str += self.error_items[i].alias + ": " + self.error_items[i].message;
        } else {
          str += self.error_items[i].message;
        }
        str += "\n";
      }
    }
    alert(str);
  };

  self.add = function(item) {
    if( typeof (item.id) == 'string') {
      _val_items.push(item);
    } else {
      for(var i in item.id) {
        sub_item = new Object();

        sub_item.id = item.id[i];
        if(item.alias) {
          sub_item.alias = item.alias[i];
        }
        for(var j in item) {
          if(j == 'id' || j == 'alias') {
            continue;
          }
          sub_item[j] = item[j];
        }
        _val_items.push(sub_item);
      }
    }
  };

  self.validate = function() {
    for(var i in _val_items) {
      flag = true;
      item = _val_items[i];
      if(window.document.getElementById(item.id)) {
        value = window.document.getElementById(item.id).value.trim();
        for(var i = 0; i < item.validates.length; i++) {
          if(Validator.rules[item.validates[i]]) {
            flag &= Validator.rules[item.validates[i]].should();
            if(!item.message) {
              item.message = Validator.rules[item.validates[i]].message;
            }
          }
        }
      }

      if(flag == false) {
        self.error_items.push(item);
      }
    }

    if(self.error_items.length > 0) {
      self.error_handler();
      self.error_items.length = 0;

      return false;
    } else {
      return true
    }
  };
  return self;
}

Validator.rules = Array();

Validator.rules['presence'] = {
  should : function() {
    return value != '';
  },
  message : "不能为空。"
};

Validator.rules['size'] = {
  should : function() {
    flag = true;
    if(item.size.minimium) {
      flag &= (value.length >= item.size.minimium);
    }
    if(item.size.maximium) {
      flag &= (value.length <= item.size.maximium);
    }
    return flag;
  },
  message : "长度无效。"
};

Validator.rules['format'] = {
  should : function() {
    return item.format.test(value);
  },
  message : "格式无效。"
};

Validator.rules['should'] = {
  should : function() {
    return item.should(value);
  },
  message : "格式无效。"
};

Validator.rules['inclusion'] = {
  should : function() {
    flag = false;
    for(var i in item.inclusion) {
      if(item.inclusion[i] == value) {
        flag = true;
        break;
      }
    }
    return flag;
  },
  message : "内容无效。"
};

Validator.rules['exclusion'] = {
  should : function() {
    flag = true;
    for(var i in item.exclusion) {
      if(item.exclusion[i] == value) {
        flag = false;
        break;
      }
    }
    return flag;
  },
  message : "内容无效。"
};

Validator.rules['email'] = {
  should : function() {
    regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    return regex.test(value);
  },
  message : "不是有效的E-mail格式。"
};

Validator.rules['date'] = {
  should : function() {
    regex = /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2]\d|3[0-1])$/;
    return regex.test(value);
  },
  message : "不是有效的的日期格式。"
};
