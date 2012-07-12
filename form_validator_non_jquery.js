var FormValidator = (function() {
  var self = {};
  var core = Validator;

  var callbacks = {};
  var messages = {
    presence : "{display}不能为空。",
    size : "{display}的长度应在{size.minimium}-{size.maximium}之间。",
    format : "{display}格式无效。",
    shoulda : "{display}格式无效。",
    inclusion : "{display}的值应是[{inclusion}]之一。",
    exclusion : "{display}不能包含[{exclusion}]。",
    email : "{display}不是有效的E-mail格式。"
  };

  var generate_message = function(message, item) {
    var msg = message;
    var variables = msg.match(/\{[.\w]+\}/ig);

    if (msg.indexOf('{display}') >= 0) {
      if (item.meta.display) {
        msg = msg.replace('{display}', item.meta.display);
      } else {
        msg = msg.replace('{display}', "");
      }
    }

    for (var i in variables) {
      var key = variables[i].match(/\w+/ig);
      var value = item.pattern[key[0]];
      if (key.length > 1) {
        for (var v = 1; v < key.length; v++) {
          value = value[key[v]];
        }
      }
      if ( typeof (value) === 'object') {
        value = value.toString();
      }
      msg = msg.replace(variables[i], value);
    }
    msg = msg.replace(/\{[.\w]+\}/ig, '');
    return msg;
  };

  self.default_message = "{display} is invalid.";
  self.default_callback = undefined;
  self.submit_callback = undefined;

  self.add_rule = function(name, pattern) {
    messages[name] = pattern.message;
    delete pattern.message;
    core.add_rule(name, pattern);
  };

  self.ensure = function(validate_item, pattern) {
    var item = validate_item;
    var meta = {};

    if ( typeof (item.source) === "string") {
      var dom_id = item.source;
      if (item.identity === undefined) {
        item.identity = item.source;
      }
      item.source = function() {
        return document.getElementById(dom_id).value.trim();
      };
    }
    if (item.callback) {
      callbacks[item.identity] = item.callback;
    }
    if (item.display) {
      meta.display = item.display;
    }

    if (item.callback === undefined && self.default_callback) {
      item.callback = self.default_callback;
    }
    core.ensure(item, pattern, meta);
  };

  self.check_all = function() {
    return core.check_all(function(error_items) {
      for (var item in error_items) {
        error_items[item].error_messages = [];
        for (var i in error_items[item].errors) {
          var msg = generate_message(messages[error_items[item].errors[i]], error_items[item]);
          error_items[item].error_messages.push(msg);
        }
      }
      if (self.submit_callback) {
        self.submit_callback(error_items);
      }
    });
  };

  self.check = function(identity) {
    var callback = callbacks[identity];
    if (callback === undefined && self.default_callback) {
      callback = self.default_callback;
    }
    return core.check(identity, function(item, value) {
      item.error_messages = [];
      for (var i in item.errors) {
        var msg = generate_message(messages[item.errors[i]], item);
        item.error_messages.push(msg);
      }
      callback(item, value);
    });
  }

  return self;
})();
