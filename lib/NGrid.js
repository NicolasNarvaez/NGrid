
// 2015 Nicolás Narváez
//MIT License
//
try {
  if(NEngine)
(function() {
  var global = this;

	this.NGrid = (function() {
    var  debugging = true,
      loop_on = true,
      MusicPorts,
      renderer = NEngine.renderer,
      Obj = NEngine.Obj,
      camera,
      proportion,
      grid,
      player,
      settings,
      controls,
      mouse;

    settings = {
      mouse_rotation : 10
    };
    mouse = {
      x : null,
      y : null,
      pressed_left_click: 1,
      pressed_right_click : 2
      pressed_wheel: 4,
      pressed_browser_back: 8,
      pressed_browser_forward: 16
    }
    function init(options) {

      renderer.init({
        container : options.container,
        projection_automatic : true,
        projection_angle: Math.PI/2
      });

      camera = new Obj();

      grid = new Obj();
      grid.geom = renderer.geometry.grid4(5,5,5,5, {size: 100});

      renderer.objAdd(camera);
      renderer.objAdd(grid);

      controls.generate();
    }

    function loop() {
      renderer.render();
      if(loop_on)
        requestAnimationFrame(loop);
    }

    controls = (function() {
      function generate() {
        global.addEventListener('mousemove', function(e) {
          if(!mouse.x) mouse.x = e.screenX;
          if(!mouse.y) mouse.y = e.screenY;

          if(mouse.y !== e.screenY)
            NEngine.math.rotateNormalized(camera.rw,camera.rz,
              e.screenY - mouse.y);

          if(mouse.x !== e.screenX)
            if(e.buttons & mouse.pressed_right_click)
                NEngine.math.rotateNormalized(camera.rw, camera.rz,
                  e.screenX - e.screenX);
            else
              if(mouse.x !== e.screenX)
                NEngine.math.rotateNormalized(camera.rw,camera.ry,
                  e.screenX - e.screenX);

        }, false);
      }
      return {
        generate: generate
      };
    })();

    MusicPorts = (function() {

      SC = (function() {

        return {
          available: true
        }
      })();

      return {
        SC: SC
      };
    })();

    return {
      MusicPorts: MusicPorts,
      init: init,
      loop: loop,
      loop_on: loop_on
    };
	})();
})();
}
catch(e) {

}
