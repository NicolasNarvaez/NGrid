
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
      mouse,
      tmp_v1 = vec4.create(),
      last_time;

    settings = {
      mouse_rotation : Math.PI/200,
      speed : 0.05 / 1000
    };
    mouse = {
      x : null,
      y : null,
      pressed_left_click: 1,
      pressed_right_click : 2,
      pressed_wheel: 4,
      pressed_browser_back: 8,
      pressed_browser_forward: 16
    }
    function init(options) {
      if(!options) options = {};
      if(!options.container)
        options.container = document.body;

      //set renderer
      renderer.init({
        container : options.container,
        projection_automatic : true,

        projection_angle: Math.PI/8,
        projection_near: 1.0,
        projection_far: 100,

        projection_3d_angle: Math.PI/4,
        projection_3d_near: 1.0,
        projection_3d_far: 100.0
      });

      //create object
      camera = renderer.camera;
      grid = new Obj();
      grid.geom = NEngine.geometry.grid4(2,2,2,2, {size: 30.0});
      grid.p[3] = 40;
      //camera.p = grid.p;

      renderer.objAdd(grid);

      /*
      grid = new Obj();
      grid.geom = NEngine.geometry.grid4(2,2,2,2, {size: 20.0});
      grid.p[3] = 20;

      renderer.objAdd(grid);
      */
      controls.generate();
    }

    function loop() {
      renderer.render();
      if(loop_on) {

        requestAnimationFrame(loop);
        last_time = Date.now();
      }
    }

    controls = (function() {
      function generate() {
        global.addEventListener('mousemove', function(e) {
          if(!mouse.x) mouse.x = e.screenX;
          if(!mouse.y) mouse.y = e.screenY;

          if(mouse.y !== e.screenY)
            NEngine.math.rotateNormalized(camera.rw,camera.rz,
              (e.screenY - mouse.y)*settings.mouse_rotation);

          if(mouse.x !== e.screenX) {
            if(e.button === 2)
              NEngine.math.rotateNormalized(camera.rw, camera.rx,
                (e.screenX - mouse.x)*settings.mouse_rotation);
            else
              NEngine.math.rotateNormalized(camera.rw,camera.ry,
                (e.screenX - mouse.x)*settings.mouse_rotation);
          }

          global.addEventListener('keydown', function(e) {
            //console.log(e);
            switch(e.keyCode) {
              case 87:
                vec4.scale(tmp_v1, camera.rz, settings.speed*(Date.now() - last_time));
                vec4.add(camera.p, camera.p, tmp_v1);
                break;
            }
            //e.preventDefault();
            e.stopPropagation();
          });

          mouse.x = e.screenX;
          mouse.y = e.screenY;

        }, false);
        global.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }, true);
        global.addEventListener('contextmenu', function(e) {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }, true);
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
  console.log(e)
}
