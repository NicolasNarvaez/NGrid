
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
      canvas,
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
      vec5 = NMath.vec5,
      mat = null,
      vec = null,
      pressed = kbObserver.pressed;

    config = {
      mouse_rotation : Math.PI/200,
      speed : 1/1000,
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

        projection_angle: Math.PI/2,
        projection_near: 0.01,
        projection_far: 1000.0,

        view_3d: 'stereo',
        view_3d_projection: 'perspective',
        view_3d_camera_disposition: 'hexagon',
        view_3d_projection_ortogonal_length : 150,
        projection_3d_angle: Math.PI/1.5,
        projection_3d_near: 0.01,
        projection_3d_far: 200.0
      });

      canvas = renderer.canvas;

      vec = NEngine.renderer.math.vec;
      mat = NEngine.renderer.math.mat;

      camera3 = renderer.camera3;
      camera = renderer.camera;


      camera.rrx = vec.create();
      camera.rrx[0] = 1.0;
      camera.rry = vec.create();
      camera.rry[1] = 1.0;
      camera.rrz = vec.create();
      camera.rrz[2] = 1.0;
      camera.rrw = vec.create();
      camera.rrw[3] = 1.0;

      camera.rwz = 0.0;
      camera.rwy = 0.0;
      camera.rwx = 0.0;
      camera.rzy = 0.0;
      camera.rzx = 0.0;
      camera.ryx = 0.0;

      var length = 3; size=3;
      for(var i_w=size; i_w--;)
        for(var i_z=size;i_z--;)
          for(var i_y=size;i_y--;)
            for(var i_x=size;i_x--;) {
              //create object

              //camera.p = grid.p;
              grid = new Obj();
              grid.geom = NEngine.geometry.grid4(4,4,4,4, {size: 0.2});
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

      set({ mouse_axisRotation: -Math.PI/4 });

      kbObserver.connect();
    }

    function set(options) {
      var config_field;
      for(config_field in options.config)
        config[config_field] = options.config[config_field];

      if(options.mouse_axisRotation) {
        config.mouse_y_trans_y = Math.cos(options.mouse_axisRotation);
        config.mouse_y_trans_x = -Math.sin(options.mouse_axisRotation);

        config.mouse_x_trans_x = config.mouse_y_trans_y;
        config.mouse_x_trans_y = -config.mouse_y_trans_x;
      }
    }

    function update(dt) {
      var tmp_v2 = vec4.create();
      tmp_v1 = vec4.create();

      //check inputs
      if(pressed(87)) //w
        tmp_v1[3] = 1.0;
      if(pressed(83)) //s
        tmp_v1[3] = -1.0;

      if(pressed(65))
        tmp_v1[0] = -1.0;
      if(pressed(68))
        tmp_v1[2] = -1.0;

      if(pressed(81))
        tmp_v1[2] = 1.0;
      if(pressed(69))
        tmp_v1[0] = 1.0;

      vec4.normalize(tmp_v2, tmp_v1);
      NEngine.obj.camera.walk(camera, tmp_v2, config.speed*dt);
    }

    function loop() {
      if(last_time === undefined)
        last_time = Date.now();

      var dt = Date.now() - last_time;

      update(dt);
      renderer.render();
      if(loop_on) {

        requestAnimationFrame(loop);
        last_time = Date.now();
      }
      else
        last_time = undefined;
    }

    controls = (function() {
      var control = config.controls;

      function generate() {
        global.addEventListener('mousemove', function(e) {
          var dsx, dsy, dx,  dy,
            relative_rotators = [camera.rrx, camera.rry, camera.rrz,camera.rrw];

          //use mouse movement when available
          if(e.movementX !== undefined ||
            e.mozMovementX !== undefined ||
            e.webkitMovementX !== undefined) {

            dsx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            dsy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
          }
          else {
            if(!mouse.x) {
              mouse.x = e.screenX;
              mouse.y = e.screenY;
            }
            dsx = e.screenX - mouse.x;
            dsy = e.screenY - mouse.y;

            mouse.x = e.screenX;
            mouse.y = e.screenY;
          }

          dx = dsx*config.mouse_x_trans_x + dsy*config.mouse_x_trans_y;
          dy = dsy*config.mouse_y_trans_y + dsx*config.mouse_y_trans_x;

          //make rotations according to internal configuration
          if(dy) {
            if(config.camera_rotation === 'relative')
              vec.rotateNormalizedRelative(camera, camera.rrw,camera.rry,
                dy*config.mouse_rotation);

            else if(config.camera_rotation === 'absolute') {
              if(e.button === 2) {
                camera.rwy += (camera.rwy < config.camera_rotation_absolute_y_amplitud)?
                dy*config.mouse_rotation : 0;
              }
              else {
                vec.rotateNormalizedRelative(
                  relative_rotators,
                  mat.rotateWZ,
                  dy*config.mouse_rotation);
              }
            }
          }

          if(dx) {
            if(config.camera_rotation === 'relative') {
              if(e.button === 2)
                vec.rotateNormalizedRelative(camera, camera.rrw, camera.rrz,
                  dx*config.mouse_rotation);
              else
                vec.rotateNormalizedRelative(camera, camera.rrw,camera.rrx,
                  -1.0*dx*config.mouse_rotation);
            }

            else if(config.camera_rotation === 'absolute') {
              if(e.button === 2) {
                //camera.rwx -= (e.screenX - mouse.x)*config.mouse_rotation;
              }
              else {
                vec.rotateNormalizedRelative(
                  relative_rotators,
                  mat.rotateWX,
                  -dx*config.mouse_rotation);
              }
            }
          }
          vec.rotateAbsolute(camera);
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


        global.addEventListener('keydown', function(e) {
          var dt = Date.now() - last_time, tmp_v = vec4.create();
          switch(e.keyCode) {
            case 77:
              renderer.pointerLockAlternate();
              break;
          }
          last_time = Date.now();
          //e.preventDefault();
          e.stopPropagation();
        });
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
