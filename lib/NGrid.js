
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
      camera3,
      proportion,
      grid,
      player,
      config,
      controls,
      mouse,
      tmp_v1 = vec4.create(),
      last_time,
      mat5 = NMath.mat5,
      vec5 = NMath.vec5;

    config = {
      mouse_rotation : Math.PI/200,
      speed : 1,
      camera_rotation: 'absolute',
      camera_rotation_absolute_y_amplitud: Math.PI,
      //mouse position transformation
      mouse_y_trans_x: 0,
      mouse_y_trans_y: 1,
      mouse_x_trans_x: 1,
      mouse_x_trans_y: 0,
      controls: {
        //camera-mouse rotation asociation
        camera_y : 'ry',
        camera_x : 'rx',
        camera_y_altern : 'ry',
        camera_x_altern : 'rz',

      }
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

        projection_angle: Math.PI/1.5,
        projection_near: 0.01,
        projection_far: 1000.0,

        view_3d: 'stereo',
        view_3d_projection: 'perspective',
        view_3d_camera_disposition: 'hexagon',
        view_3d_projection_ortogonal_length : 150,
        projection_3d_angle: Math.PI/2,
        projection_3d_near: 0.01,
        projection_3d_far: 1000.0
      });

      camera3 = renderer.camera3;
      camera = renderer.camera;

      camera.rwz = 0;
      camera.rwy = 0;
      camera.rwx = 0;

      var length = 100; size=2;
      for(var i_w=size; i_w--;)
        for(var i_z=size;i_z--;)
          for(var i_y=size;i_y--;)
            for(var i_x=size;i_x--;) {
              //create object

              //camera.p = grid.p;
              grid = new Obj();
              grid.geom = NEngine.geometry.grid4(4,4,4,4, {size: 10.0});
              grid.p[0] = length*( i_x/(size-1) - 1/2);
              grid.p[1] = length*( i_y/(size-1) - 1/2);
              grid.p[2] = length*( i_z/(size-1) - 1/2);
              grid.p[3] = length*( i_w/(size-1) - 1/2);

              renderer.objAdd(grid);
            }


            grid = new Obj();
            grid.geom = NEngine.geometry.grid4(6,6,6,6, {size: 1000.0});
            //grid.p[3] = 1000;
            renderer.objAdd(grid);

      controls.generate();
    }

    function set(options) {
      if(options.camera_rotation) {

      }
    }

    function loop() {
      renderer.render();
      if(loop_on) {

        requestAnimationFrame(loop);
        last_time = Date.now();
      }
    }

    controls = (function() {
      var control = config.controls;

      function generate() {
        global.addEventListener('mousemove', function(e) {
          if(!mouse.x) mouse.x = e.screenX;
          if(!mouse.y) mouse.y = e.screenY;
          //console.log(NEngine.renderer.math.vec);
          if(mouse.y !== e.screenY) {
            if(config.camera_rotation === 'relative')
              NEngine.renderer.math.vec.rotateNormalizedRelative(camera, camera.rw,camera.ry,
                (e.screenY - mouse.y)*config.mouse_rotation);
            else if(config.camera_rotation === 'absolute') {
              if(e.button === 2) {
                camera.rwy += (camera.rwy < config.camera_rotation_absolute_y_amplitud)?
                (e.screenY - mouse.y)*config.mouse_rotation : 0;
              }
              camera.rwz += (e.screenY - mouse.y)*config.mouse_rotation;
            }
          }

          if(mouse.x !== e.screenX) {
            if(config.camera_rotation === 'relative') {
              if(e.button === 2)
                NEngine.renderer.math.vec.rotateNormalizedRelative(camera, camera.rw, camera.rz,
                  (e.screenX - mouse.x)*config.mouse_rotation);
              else
                NEngine.renderer.math.vec.rotateNormalizedRelative(camera, camera.rw,camera.rx,
                  -1.0*(e.screenX - mouse.x)*config.mouse_rotation);
            }
            else if(config.camera_rotation === 'absolute') {
              if(e.button === 2) {
                //camera.rwx -= (e.screenX - mouse.x)*config.mouse_rotation;
              }
              else
                camera.rwx -= (e.screenX - mouse.x)*config.mouse_rotation;
            }
          }
          if(config.camera_rotation === 'absolute')
            NEngine.renderer.math.vec.rotateAbsolute(camera);

          global.addEventListener('keydown', function(e) {
            //console.log(e);
            switch(e.keyCode) {
              case 87:
                vec4.scale(tmp_v1, camera.rz, config.speed*(Date.now() - last_time));
                vec4.add(camera.p, camera.p, tmp_v1);
                break;
            }
            last_time = Date.now();
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
  console.log('You dont have a NGrind requeriment, NGrid not loaded');
}
