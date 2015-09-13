(function() {
  var global = this;

  global.kbObserver = (function() {
    var key_timeout={},
      threshold_time = 50, connected = false;

    function pressed(key) {
      var key = key_timeout[key];

      if( key !== true &&
          (key === undefined || key <= Date.now()) )
        return false;

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

      global.addEventListener('keydown', key_down);
      global.addEventListener('keyup', key_up);
      connected = true;
    }
    function disconnect() {
      if(!connected) return;

      global.removeEventListener('keydown', key_down);
      global.removeEventListener('keyup', key_up);
      connected = false;
    }

    function setThreshold(threshold) {
      if(threshold)
        threshold_time = threshold;
    }

    return {
      pressed: pressed,
      connect: connect,
      disconnect: disconnect,
      setThreshold: setThreshold
    };
  })();
})();
