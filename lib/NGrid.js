
/*
haxx0r
var sc = NZVisualyser.audioSources._sourceSoundcloud,
  a = 'https://soundcloud.com/agile-recordings/agile-recordings-podcast-0',
  i = 40, i_max = 50;

sc.loadUrlCallSuc = function() {
  console.log(sc.streamURL);
  i++;
  if(i <= i_max)
    sc.loadUrl(a+i);
}
sc.loadUrl( a+i );
*/
// 2015 Nicolás Narváez
//MIT License
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
      controls,
      tmp_v1 = new vec4.create(),
      tmp_v2 = new vec4.create(),
      tmp_m1 = new mat4.create(),
      tmp_m2 = new mat4.create(),
      tmp_m3 = new mat4.create(),
      last_time,
      last_time_key,
      mat5 = NMath.mat5,
      vec5 = NMath.vec5,
      mat = null,
      vec = null,
      pressed = Input.Keyboard.pressed,
      dt,
      length=2, grid_size=2, size=1,
      world_grid_geom, world_grid = [], world_grid_size = 0, world_grid_length = 100,
      world_grid_unit_length = 10, world_grid_unit_size = 4,
      i_w, i_z, i_y, i_x, obj,
      enemy_geom0 = NEngine.geometry.grid4(2,2,2,2, {size: size*0.5}),
      pointer_geom = NEngine.geometry.grid4(2,2,2,2, {size: 0.2}),
      enemy_geom4 = NEngine.geometry.grid4(4,4,4,4, {size: size*1.6}),
      enemy_octahedron0 = NEngine.geometry.octahedron4(size/4),
      bullet = NEngine.geometry.simplex4(size/2,false),
      enemy_simplex0 = NEngine.geometry.simplex4(size/3,true),

    config = {
      mouse_rotation : Math.PI/200,
      speed : 1/1000,
      camera_rotation: 'absolute',
      camera_rotation_y: 'normal',
      camera_rotation_absolute_y_amplitud: Math.PI/2,
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
        camera_x_altern : 'rz'
      }
    },
    mouse = {
      x : null,
      y : null,
      pressed_left_click: 1,
      pressed_right_click : 2,
      pressed_wheel: 4,
      pressed_browser_back: 8,
      pressed_browser_forward: 16
    },
    ui = {
      info_basic_panel_en : document.getElementById('info-basic-en'),
      info_basic_panel_es : document.getElementById('info-basic-es'),
      info_basic_buttons : document.getElementById('info-basic-buttons')
    },
    pointer;

    function init(options) {
      if(!options) options = {};
      if(!options.container)
        options.container = document.body;

      //set renderer
      var renderer_default = {
        stereo_dim: 0,

        projection_near: 0.1,
        projection_angle: Math.PI/1.2,
        projection_3: 'ortogonal',
        projection_3_near: 1,
        projection_3_perspective_angle: Math.PI/2,

        camera_disposition_3: 'hexagon',
      };
      renderer.init(renderer_default);

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

      for(i_w=grid_size; i_w--;)
        for(i_z=grid_size;i_z--;)
        {
          for(i_y=grid_size;i_y--;)
          {
            for(i_x=grid_size;i_x--;) {
              //create object

              grid = new Obj();
              grid.geom = enemy_octahedron0;
              if(grid_size != 1) {
                grid.p[0] = length*( i_x/(grid_size-1) - 1/2);
                grid.p[1] = length*( i_y/(grid_size-1) - 1/2);
                grid.p[2] = length*( i_z/(grid_size-1) - 1/2);
                grid.p[3] = length*( i_w/(grid_size-1) - 1/2);
              }

              enemigos.add(grid);
              renderer.objAdd(grid);
            }

            grid = new Obj();
            grid.geom = enemy_geom0;
            if(grid_size != 1) {
              grid.p[0] = length*( i_x/(grid_size-1) - 1/2);
              grid.p[1] = length*( i_y/(grid_size-1) - 1/2);
              grid.p[2] = length*( i_z/(grid_size-1) - 1/2);
              grid.p[3] = length*( i_w/(grid_size-1) - 1/2);
            }

            enemigos.add(grid);
            //renderer.objAdd(grid);

          }

          grid = new Obj();
          grid.geom = enemy_octahedron0;
          if(grid_size != 1) {
            grid.p[0] = length*( i_x/(grid_size-1) - 1/2);
            grid.p[1] = length*( i_y/(grid_size-1) - 1/2);
            grid.p[2] = length*( i_z/(grid_size-1) - 1/2);
            grid.p[3] = length*( i_w/(grid_size-1) - 1/2);
          }

          enemigos.add(grid);
          //renderer.objAdd(grid);

        }
      grid = new Obj();
      grid.geom = NEngine.geometry.grid4(6,6,6,6, {size:50});
      renderer.objAdd(grid);

      pointer = new Obj();
      pointer.geom = pointer_geom;
      renderer.objAdd(pointer);

      window.game = {
        pointer: pointer,
        enemigos: enemigos,
        grid : grid,
        renderer: renderer
      }



      world_grid_geom =  NEngine.geometry.grid4(
        world_grid_unit_size,
        world_grid_unit_size,
        world_grid_unit_size,
        world_grid_unit_size,
        {size: world_grid_unit_length});
      for(i_w=world_grid_size; i_w--;)
        for(i_z=world_grid_size;i_z--;)
          for(i_y=world_grid_size;i_y--;)
            for(i_x=world_grid_size;i_x--;) {
              obj = new Obj();
              obj.geom = world_grid_geom;

              obj.p[0] = world_grid_length*( i_x/(world_grid_size-1) - 1/2);
              obj.p[1] = world_grid_length*( i_y/(world_grid_size-1) - 1/2);
              obj.p[2] = world_grid_length*( i_z/(world_grid_size-1) - 1/2);
              obj.p[3] = world_grid_length*( i_w/(world_grid_size-1) - 1/2);

              renderer.objAdd(obj);
            }

      controls.generate();
      set({ mouse_axisRotation:0 });
      set({ config: { camera_disposition_3 : renderer_default.camera_disposition_3 } })
      Input.connectAll();
      console.log(enemigos);
    }


    function set(options) {
      var config_field;
      for(config_field in options.config)
        config[config_field] = options.config[config_field];

      //deprecated, to NEngine camera config
      if(options.mouse_axisRotation) {
        config.mouse_y_trans_y = Math.cos(options.mouse_axisRotation);
        config.mouse_y_trans_x = -Math.sin(options.mouse_axisRotation);

        config.mouse_x_trans_x = config.mouse_y_trans_y;
        config.mouse_x_trans_y = -config.mouse_y_trans_x;
      }
    }

    var iterators = [],
      enemigos = new NEngine.obj.iterator(),
      balas = new NEngine.obj.iterator();

    iterators.push(enemigos);
    iterators.push(balas);

    //avanzar
    var psum=0;
    enemigos.add_pass(function(obj, tmp_v1, tmp_v2, tmp_m1, tmp_m2) {
      //console.log(tmp_v1, tmp_v2, tmp_m1, tmp_m2);
      //console.log(camera.p, pointer.p);
      var vecs, ang, dot;
      tmp_v1[0] = 0;
      tmp_v1[1] = 0;
      tmp_v1[2] = 0;
      tmp_v1[3] = 0.001*dt;
      current = false;
      if(timer_seg < Date.now()) {
        timer_seg = Date.now() + 1000;
        //current = true;
      }
      NMath.mat.fromVecs(tmp_m1, [obj.rx, obj.ry, obj.rz, obj.rw]);
      mat4.multiplyVec(tmp_v2, tmp_m1, tmp_v1);
      vec4.add(obj.p, obj.p, tmp_v2);

      vec4.copy(tmp_v1, [0,0,0,1])
      mat4.multiplyVec(tmp_v2, tmp_m1, tmp_v1)
      vec4.sub(tmp_v1, camera.p, obj.p);

      dot = vec4.angleDot(tmp_v2, tmp_v1);
      if(dot > Math.PI/1000) {

        vec4.normalizeI(tmp_v1);
        vec4.normalizeI(tmp_v2);
        vec4.plane(tmp_v2, tmp_v1);

        ang = dt*Math.PI/(10000);
        //console.log(ang, dot)
        if(ang > dot)
          ang = dot;
        //ang = 0;
        mat4.rotationPlane(tmp_m2, tmp_v2, tmp_v1, ang, current);
        mat4.multiply(tmp_m3, tmp_m2, tmp_m1);
        mat4.orthogonalizeI(tmp_m3);
        vecs = NMath.mat.vecs(tmp_m3);

        obj.rx = vecs[0];
        obj.ry = vecs[1];
        obj.rz = vecs[2];
        obj.rw = vecs[3];

        vec4.normalize(obj.rx,obj.rx);
        vec4.normalize(obj.ry,obj.ry);
        vec4.normalize(obj.rz,obj.rz);
        vec4.normalize(obj.rw,obj.rw);
      }
      //if(Input.Mouse.pressed())
    });

    //rotar
    balas.add_pass(function(obj, tmp_v1, tmp_v2, tmp_m1, tmp_m2) {

    });

    //wordl related updates -> most to iterators
    var timer_5000 = Date.now() + 5000,
      timer_seg = Date.now() + 1000;
    function update(dt) {
      var i, tmp_v2 = vec4.create(), grid,j, m,m_rot,m_mult,vecs;

      if(Input.Mouse.pressed('left')) {
        grid = new NEngine.Obj();
        grid.geom = bullet;
        NMath.vec4.copy(grid.p, camera.p);
        balas.add(grid);
        renderer.objAdd(grid)

        NMath.vec4.copy(grid.rx,camera.rx);
        NMath.vec4.copy(grid.ry,camera.ry);
        NMath.vec4.copy(grid.rz,camera.rz);
        NMath.vec4.copy(grid.rw,camera.rw);
        console.log(grid.rw);
      }

      tmp_v1 = vec4.create();

      tmp_v2 = vec4.create();
      tmp_v1 = vec4.create();
      ///////////////////////////////////////////////////////////////////camara
      //check inputs
      if(pressed(87)) //w
        tmp_v1[3] += 1.0;
      if(pressed(83)) //s
        tmp_v1[3] += -1.0;

      if(pressed(69)) { //e
        tmp_v1[0] += 1.0;
        tmp_v1[2] += 1.0;
      }
      if(pressed(65)) { //a
        tmp_v1[0] += -1.0;
        tmp_v1[2] += -1.0;
      }

      if(pressed(81)) { //q
        tmp_v1[0] += -1.0;
        tmp_v1[2] += 1.0;
      }
      if(pressed(68)) { //d
        tmp_v1[0] += 1.0;
        tmp_v1[2] += -1.0;
      }

      if(Date.now() > timer_5000) {
        timer_5000 = Date.now() + 5000;

        for(i=0,length = enemigos.list.length; i<length;i++)
          if(enemigos.list[i].geom == enemy_octahedron0)
          {

          grid = new Obj();
          vec4.copy(grid.p, enemigos.list[i].p);
          grid.geom = enemy_simplex0;
          enemigos.add(grid);
          renderer.objAdd(grid);
        }
      }

      vec4.normalize(tmp_v2, tmp_v1);
      NEngine.obj.camera.walk(camera, tmp_v2, config.speed*dt);
      ///////////////////////////////////////////////////////////////////

      enemigos.pass(tmp_v1, tmp_v2, tmp_m1, tmp_m2);
    }

    function loop() {
      if(last_time === undefined)
        last_time = Date.now();

      dt = Date.now() - last_time;

      update(dt);
      renderer.render();
      if(loop_on) {

        requestAnimationFrame(loop);
        last_time = last_time + dt;
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

                camera.rwy += (
                  (camera.rwy < config.camera_rotation_absolute_y_amplitud && dy > 0) ||
                  (camera.rwy > -config.camera_rotation_absolute_y_amplitud && dy < 0))?
                dy*config.mouse_rotation : 0;

              }
              else {
                if(config.camera_rotation_y === 'absolute') {
                  camera.rwz += ((camera.rwz < config.camera_rotation_absolute_y_amplitud && dy > 0) ||
                  (camera.rwz > -config.camera_rotation_absolute_y_amplitud && dy < 0))?
                dy*config.mouse_rotation:0;
                }
                else {
                  vec.rotateNormalizedRelative(
                    relative_rotators,
                    3,2,
                    dy*config.mouse_rotation);
                }
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
                /*
                camera.rwy += (
                  (camera.rwy < config.camera_rotation_absolute_y_amplitud && dy > 0) ||
                  (camera.rwy > -config.camera_rotation_absolute_y_amplitud && dy < 0))?
                dx*config.mouse_rotation : 0;
                */
                //camera.rwx -= (e.screenX - mouse.x)*config.mouse_rotation;
              }
              else {
                /*
                camera.rwz += ((camera.rwz < config.camera_rotation_absolute_y_amplitud && dx > 0) ||
                (camera.rwz > -config.camera_rotation_absolute_y_amplitud && dx < 0))?
              dx*config.mouse_rotation:0;
                */
                vec.rotateNormalizedRelative(
                  relative_rotators,
                  3,0,
                  -dx*config.mouse_rotation);

              }
            }
          }
          vec.rotateAbsolute(camera);
        }, false);

        renderer.canvas.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }, true);
        renderer.canvas.addEventListener('contextmenu', function(e) {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }, true);


        global.addEventListener('keydown', function(e) {
          var dt = Date.now() - last_time_key, tmp_v = vec4.create();
          //console.log(e.keyCode);
          switch(e.keyCode) {
            case 77:
              renderer.pointerLockAlternate();
              break;
            case 73: //i
              ui.info_basic_panel_es.classList.toggle('hide');
              ui.info_basic_panel_en.classList.toggle('hide');
              break;
            case 72: //h
              ui.info_basic_buttons.classList.toggle('hide');
              break;
          }
          last_time_key = Date.now();
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
