
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
      settings,
      controls,
      mouse,
      tmp_v1 = vec4.create(),
      last_time,
      mat5 = NMath.mat5,
      vec5 = NMath.vec5;

    settings = {
      mouse_rotation : Math.PI/200,
      speed : 1,
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

        view_3d_projection: 'perspective',
        view_3d_camera_disposition: 'hexagon',
        view_3d_projection_ortogonal_length : 150,
        projection_3d_angle: Math.PI/2,
        projection_3d_near: 0.01,
        projection_3d_far: 1000.0
      });

      camera3 = renderer.camera3;
      camera = renderer.camera;
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
          //console.log(NEngine.renderer.math.vec);
          if(mouse.y !== e.screenY)
            NEngine.renderer.math.vec.rotateNormalizedRelative(camera, camera.rw,camera.ry,
              (e.screenY - mouse.y)*settings.mouse_rotation);

          if(mouse.x !== e.screenX) {
            if(e.button === 2)
              NEngine.renderer.math.vec.rotateNormalizedRelative(camera, camera.rw, camera.rz,
                (e.screenX - mouse.x)*settings.mouse_rotation);
            else
              NEngine.renderer.math.vec.rotateNormalizedRelative(camera, camera.rw,camera.rx,
                -1.0*(e.screenX - mouse.x)*settings.mouse_rotation);
          }

          global.addEventListener('keydown', function(e) {
            //console.log(e);
            switch(e.keyCode) {
              case 87:
                vec4.scale(tmp_v1, camera.rz, settings.speed*(Date.now() - last_time));
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
