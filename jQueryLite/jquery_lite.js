(function() {
  function DOMNodeCollection(elementArray) {
    this.elementArray = elementArray;
  }

  DOMNodeCollection.prototype.html = function(string) {
    if (typeof string === 'undefined') {
      return (this.elementArray[0].innerHTML);
    } else {
      for (var i = 0; i < this.elementArray.length; i++) {
        this.elementArray[i].innerHTML = string;
      }
      return this;
    }
  };

  DOMNodeCollection.prototype.empty = function() {
    this.html("");
    return this;
  };

  DOMNodeCollection.prototype.append = function(newElement) {

    for (var i = 0; i < this.elementArray.length; i++) {

      if (newElement instanceof DOMNodeCollection) {
        for (var j = 0; j < newElement.elementArray.length; j++) {
          this.elementArray[i].appendChild(newElement.elementArray[j]);
        }
      } else if (newElement instanceof HTMLElement) {
        this.elementArray[i].appendChild(newElement);
      } else {
        this.elementArray[i].innerHTML += newElement;
      }
    }
  };

  DOMNodeCollection.prototype.attr = function(name, value) {
    if (value) {
      for(var i = 0; i < this.elementArray.length; i++ ) {
        this.elementArray[i].attributes[name] = value;
      }
      return this;
    } else {
      return this.elementArray[0].attributes[name];
    }
  };

  DOMNodeCollection.prototype.addClass = function(value) {
    // refactor to use classList method
    for (var i = 0; i < this.elementArray.length; i++) {
      this.elementArray[i].classList.add(value);
    }
    return this;
  };

  DOMNodeCollection.prototype.removeClass = function(className) {
    // refactor to use classList stuff
    for ( var i = 0; i < this.elementArray.length; i++ ) {
      if (className) {
        // var classes = this.elementArray[i].className.split(" ");
        // var classIdx = classes.indexOf(className);
        // classes = classes.splice(classIdx, 1).join(" ");
        // this.attr(0).value = classes;
        this.elementArray[i].classList.remove(className);
        }
      else {
        this.elementArray[i].className = "";
      }
    }
  };

  DOMNodeCollection.prototype.children = function() {
    var children = [];
    var currentChildren;
    for (var i = 0; i < this.elementArray.length; i++) {
      currentChildren = [].slice.call(this.elementArray[i].children);
      children = children.concat(currentChildren);
    }
    return (new DOMNodeCollection(children));
  };


  var unique = function(array) {
    var uniques = [];
    var included = false;
    for (var i = 0; i < array.length; i++) {
      included = uniques.indexOf(array[i]);
      if (included === -1) {
        uniques.push(array[i]);
      }

    }
    return uniques;
  };
  DOMNodeCollection.prototype.parent = function() {
    var parent = [];
    var currentParent;
    for (var i = 0; i < this.elementArray.length; i++) {
      parent.push(this.elementArray[i].parentElement);
    }
    return (new DOMNodeCollection(unique(parent)));
  };


  DOMNodeCollection.prototype.find = function(selectors) {
    var descendants = [];
    var currentDescendants;
    for (var i = 0; i < this.elementArray.length; i++) {
      currentDescendants = [].slice.call(this.elementArray[i].querySelectorAll(selectors));
      descendants = descendants.concat(currentDescendants);
    }
    return (new DOMNodeCollection(descendants));
  };

  DOMNodeCollection.prototype.remove = function() {
    // look for better method than outerHTML
    for (var i = 0; i < this.elementArray.length; i++) {
      this.elementArray[i].remove();
    }
  };

  DOMNodeCollection.prototype.on = function(eventName) {
    // function bindDelegate(e) {
    //   var subElements = self.find(subSelector);
    //   var descendantElements = subElements.find("*").elementArray;
    //   var isSubElement = subElements.elementArray
    //       .concat(descendantElements).indexOf(e.target);
    //
    //   if (isSubElement > -1) {
    //     e.currentTarget = e.target;
    //     eventHandler(e);
    //   }
    // }
    //
    // if (arguments.length < 3) {
      for (var i = 0; i < this.elementArray.length; i++) {
        this.elementArray[i].addEventListener(eventName, arguments[1]);

        var dataAttr = this.elementArray[i].attributes["data-" + eventName];
        dataAttr = dataAttr || [];
        dataAttr.push(arguments[1]);
        this.elementArray[i].attributes["data-" + eventName] = dataAttr;

      }
    // } else {
    //   var self = this;
    //   var subSelector = arguments[1];
    //   var eventHandler = arguments[2];
    //
    //   for (var i = 0; i < this.elementArray.length; i++) {
    //     var eventId = this.elementArray[i].addEventListener(eventName, bindDelegate);
    //     console.log(this.elementArray[i].attributes);
    //   }
    //
    // }
  };

  DOMNodeCollection.prototype.off = function(eventName, listener) {
    if (arguments.length < 2) {
      for (var i = 0; i < this.elementArray.length; i++ ) {
        var listeners = this.elementArray[i].attributes["data-" + eventName];
        for (var j = 0; j < listeners.length; j++ ) {
          this.elementArray[i].removeEventListener(eventName, listeners[j]);
        }
      this.elementArray[i].attributes["data-" + eventName] = "";
      }
    } else {
      for (var i = 0; i < this.elementArray.length; i ++ ) {
        this.elementArray[i].removeEventListener(eventName, listener);
      }
    }
  };


  var functionArray = [];

 //One onload for all functions in query
  window.onload = function() {
    functionArray.forEach(function(fn) {
      fn();
    });
  };

  function $l(something) {
    var elementArray = [];

    if (something instanceof HTMLElement) {
      elementArray.push(something);
    } else if (something instanceof NodeList) {
      elementArray = [].slice.call(something);
    }
    else if (something instanceof Function) {
      if (document.readyState !== 'complete') {
        functionArray.push(something);
      } else {
        something();
      }
    }
    else {
      var elementList = document.querySelectorAll(something);
      elementArray = [].slice.call(elementList);
    }
    return (new DOMNodeCollection(elementArray));
  }

  $l.extend = function(firstObject) {
    var objects = [].slice.call(arguments, 1);
    for (var i = 0; i < objects.length; i++) {
      for(var property in objects[i]) {
        if (objects[i].hasOwnProperty(property)) {
          firstObject[property] = objects[i][property];
        }
      }
    }
    return firstObject;
  };

  $l.ajax = function(options) {
    var defaults = {
      type: 'GET',
      async: true,
      success: function() {alert();},
      error: function() {alert('failure');},
    };
    this.extend(defaults, options);

    var xmlhttp;

   if (window.XMLHttpRequest) {
       // code for IE7+, Firefox, Chrome, Opera, Safari
       xmlhttp = new XMLHttpRequest();
   }


   xmlhttp.onreadystatechange = function() {
       if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
          if(xmlhttp.status == 200){
              document.querySelector("div").innerHTML = xmlhttp.responseText;
              defaults['success']();
          }
          else if(xmlhttp.status == 400) {
             alert('There was an error 400');
             defaults['error']();
          }
          else {
              alert('something else other than 200 was returned');
              defaults['error']();
          }
       }
   };

   xmlhttp.open(defaults['type'], defaults['url'], defaults['async']);
   xmlhttp.setRequestHeader("Content-type", defaults['content-type']);
   xmlhttp.send(defaults['data']);

  };


  window.$l = $l;
})();
