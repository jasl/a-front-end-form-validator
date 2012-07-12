/**
 * A simple validator core. but I think it isn't simple now - -
 * @author Jasl
 * @version 0.9
 *
 */
var Validator = (function() {
  var self = {};

  var _val_items = [];

  var _val_rules = [];

  var get_error_items = function() {
    var error_items = [];
    for (var i in _val_items) {
      if (!_val_items[i].is_correct) {
        error_items.push(_val_items[i]);
      }
    }
    return error_items;
  };

  /**
   * Validate a item by rules
   * @param {Object} item item which to be validated
   * @param {Boolean} use_callback call callback after validate or not
   * @return (Boolean) validate's result
   */
  var do_validate = function(item, callback) {
    item.is_correct = true;
    item.errors = [];

    if (!item.condition || item.condition()) {
      var pattern = item.pattern;
      var value = item.source();
      for (var i in pattern.validates) {
        var rule = _val_rules[pattern.validates[i]];
        if (rule.preprocessing) {
          rule.preprocessing(pattern);
        }

        if (!rule.shoulda(value, pattern)) {
          item.is_correct = false;
          item.errors.push(pattern.validates[i]);
        }
      }
      if (callback) {
        callback(item, value);
      }
    }

    return item.is_correct;
  };

  /**
   * Add rule to validator.
   * @param {String} name pattern's name
   * @param {Object} pattern pattern object
   */
  self.add_rule = function(name, pattern) {
    _val_rules[name] = pattern;
  };

  /**
   * Regist a validate item.
   * @param {Object} item must have source,
   *                 and identity will help you to check one
   *                 specific field
   *                 condition is optional that made the validates
   *                 only when condition is true
   *                 callback is optional
   * @param {Object} pattern validate rules and other meta
   */
  self.ensure = function(item, pattern, meta) {
    var val_item = {
      source : item.source,
      pattern : pattern
    };

    if (item.condition) {
      val_item.condition = item.condition;
    }
    if (item.callback) {
      val_item.callback = item.callback;
    }
    if (meta) {
      val_item.meta = meta;
    }

    if (item.identity) {
      val_item.identity = item.identity;
      _val_items[item.identity] = val_item;
    } else {
      _val_items.push(val_item);
    }
  };

  /**
   * Check all items
   * @param {Function} callback it will be called after validate
   * @return (Boolean) if one of item not passed validates, return false
   */
  self.check_all = function(callback) {
    var flag = true;
    for (var i in _val_items) {
      flag = do_validate(_val_items[i]) && flag;
    }

    if (callback) {
      callback(get_error_items());
    }

    return flag;
  };

  /**
   * Check a form's field.
   * @param {String} identity identity of one specific item.
   * @param {Function} callback it will be called after validate
   * @return (Boolean) validate's result or undefined when identity isn't exists
   */
  self.check = function(identity, callback) {
    var item = _val_items[identity];
    var flag = undefined;
    if (item) {
      flag = do_validate(item, callback);
    }
    return flag;
  };

  return self;
})();

Validator.add_rule('presence', {
  shoulda : function(value, pattern) {
    return value !== '';
  }
});

Validator.add_rule('size', {
  preprocessing : function(pattern) {
    if (!pattern.size.minimium) {
      pattern.size.minimium = 0;
    }
    if (!pattern.size.maximium) {
      pattern.size.maximium = 50;
    }
  },
  shoulda : function(value, pattern) {
    return value.length >= pattern.size.minimium && value.length <= pattern.size.maximium;
  }
});

Validator.add_rule('format', {
  shoulda : function(value, pattern) {
    if (!pattern.format) {
      return false;
    }
    return pattern.format.test(value);
  }
});

Validator.add_rule('shoulda', {
  shoulda : function(value, pattern) {
    if (!pattern.shoulda) {
      return false;
    }
    return pattern.shoulda(value);
  }
});

Validator.add_rule('inclusion', {
  shoulda : function(value, pattern) {
    if (!pattern.inclusion) {
      return false;
    }

    var flag = false;
    if (value === "") {
      return true;
    }
    for (var i in pattern.inclusion) {
      if (pattern.inclusion[i] === value) {
        flag = true;
        break;
      }
    }
    return flag;
  }
});

Validator.add_rule('exclusion', {
  shoulda : function(value, pattern) {
    if (!pattern.exclusion) {
      return false;
    }

    var flag = true;
    for (var i in pattern.exclusion) {
      if (pattern.exclusion[i] === value) {
        flag = false;
        break;
      }
    }
    return flag;
  }
});

Validator.add_rule('email', {
  shoulda : function(value, pattern) {
    if (value === "") {

    }
    var regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    return regex.test(value);
  },
});
