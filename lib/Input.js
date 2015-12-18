/**
* @file
*
* @desc -
*  A general input observer, to simplify inputs state access outside event
* handlers, and normalize event handling on diferente platforms. Currently
* observes Mouse and Keyboard states.
*
* @author - Nicolas Narvaez
* @licence - MIT
*/
(function() {

  var Module, eventHandler;

  //:TODO:extensibility??, node??
  eventHandler = window;

  Module = (function() {
    var Mouse,
      Touch,
      Pointer,
      Keyboard;

    function connectAll() {
      Mouse.connect();
      Keyboard.connect();
    }
    function disconnectAll() {
      Mouse.disconnect();
      Keyboard.disconnect();
    }

    Keyboard = (function() {
      var key_timeout={},
        threshold_time = 50, connected = false;

      function pressed(key) {
        var key = key_timeout[key];

        if( key === true) return true;


        if( key === undefined ) return undefined;

        if( key <= Date.now() ) return false;

        return true;
      }

      function key_down(e) {
        key_timeout[e.keyCode] = true;
      }

      function key_up(e) {
        key_timeout[e.keyCode] = Date.now() + threshold_time;
      }

      function connect() {
        if(connected) return;

        eventHandler.addEventListener('keydown', key_down);
        eventHandler.addEventListener('keyup', key_up);
        connected = true;
      }

      function disconnect() {
        if(!connected) return;

        eventHandler.removeEventListener('keydown', key_down);
        eventHandler.removeEventListener('keyup', key_up);
        connected = false;
      }

      function setThreshold(threshold) {
        if(threshold)
          threshold_time = threshold;
      }

      return {
        setThreshold: setThreshold,
        disconnect: disconnect,
        connect: connect,
        key_up: key_up,
        key_down: key_down,
        pressed: pressed
      };
    })();

    Mouse = (function() {
      var button_state,
        button_map,
        position,
        connected = false;

      button_state = [false,false,false];
      button_map = {left:0, middle:1, right:2};
      position = {x:null,y:null};

      function pressed(id) {
        if(typeof id === 'number' || id instanceof Number)
          return button_state[id];
        if(typeof id === 'string' || id instanceof String)
          return button_state[button_map[id]];
      }

      function key_down(e) {
        button_state[e.button] = true;
      }

      function key_up(e) {
        button_state[e.button] = false;
      }

      function move(e) {
        //console.log(e).
      }

      function connect() {
        if(connected) return;

        eventHandler.addEventListener('mousedown', key_down);
        eventHandler.addEventListener('mouseup', key_up);
        eventHandler.addEventListener('mousemove', move);
        connected = true;
      }

      function disconnect() {
        if(!connected) return;

        eventHandler.removeEventListener('mousedown', key_down);
        eventHandler.removeEventListener('mouseup', key_up);
        eventHandler.removeEventListener('mousemove', move);
        connected = false;
      }

      return {
        disconnect: disconnect,
        connect: connect,
        key_up: key_up,
        key_down: key_down,
        pressed: pressed,
        position: position,
      }
    })();


    return {
      Mouse: Mouse,
      Touch: Touch,
      Pointer: Pointer,
      Keyboard: Keyboard,


      connectAll: connectAll,
      disconnectAll: disconnectAll
    };
  })();

  //:TODO:extensibility??, node??
  window.Input = Module;

})();
