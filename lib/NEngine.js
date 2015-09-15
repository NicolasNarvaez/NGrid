	/**
* An n-dimensional engine, works recursively projection dimension n into n-1 until n = 3.
* it works over optimized functions, amd only dimensions 4 and 3 are precompiled, if
* a given required dimension isnt compiled, uses nmath to create its library. <br/> <br/>
* When you start ngine and specify the working dimension, you can use internal dimension-agnostic
* objects to manipulate the engine elements, and make your app dimension-agnostic.
* @fileoverview
* @author Nicolás Narváez
* @version 0.5

* sails, loopback,
*/

try {
if(glMatrix && twgl)  //requires
try {
(function() {
  var global = this,
    mat = NMath.mat,
    vec = NMath.vec,
    mat5 = NMath.mat5,
    vec5 = NMath.vec5,
    GLMAT_ARRAY_TYPE = NMath.ARRAY_TYPE,
    GLCOLOR_ARRAY_TYPE = NMath.GLCOLOR_ARRAY_TYPE,
    GLINDEX_ARRAY_TYPE = NMath.GLINDEX_ARRAY_TYPE;


  function projection(out,va,vb) {
    vec4.scale(out, vb, vec4.dot(va,vb)/vec4.length(va));
  }

  global.NEngine = (function() {

    var math, Obj, renderer, geometry,
      util,
      Camera,
      Renderer,
      //TODO Shader logic, optimization, generation, syntax, definition
      //uses ND configs to generate ND materials
      ShaderGenerator,
      //generates materials data canvases
      Shader,
      Entity,
      //TODO:
      //optimized physical sysstem, collisions, force fields, n-dimensional boxing system
      //Huge-Nano space handling
      //fixed world object handler: environment variables, force-fields
      //object factories, for fast replication, on preconfigured engines
      Space;

    util = {
      //return a + every prop not in a but in b
      missing: function missing(a, b) {
        for(prop in b)
          if(!a[prop])
            a[prop] = b[prop];
      },
    }

    //has mouse events API, keyboard events API
    //n n-dimensional cameras for complex projection
    //extra hoisted camera for complex n-dimensional projection
    //    (aka: watch initial ND camera from other camera in World-space coords)
    Camera = (function() {
      //options:
      //
      function Camera(options) {
        var i, length;

        options = options || {};
        util.missing(options, Camera.defaults);

        this.dim = options.dim

        //generate cameras from dim to 3D
        for(i=this.dim+1; --i>=3;)
          this['camera'+i] = new Entity({
            dim: i
          })

        this.camera = new Entity({
          dim: this.dim
        })
      }

      Camera.defaults = {
        dim: 4,
        type: 'recursive',
        stereo_mode: 'splited',    //splited, polarized, alternation timer, etc.

        //camera specific
        camera: {
          stereo_separation: 5.616,
          stereo_distance: 10,

          projection: 'perspective',
          projection_near: 1.0,
          projection_far: 1000.0,
          projection_perspective_angle: Math.PI/2,
        },

        //default for every sub-space camera
        camera_n: {
          projection: 'null',
        },
        projection_3: 'orthogonal',
        projection_3_near: -1.0, //used on  ortogonal
        projection_3_far: 1.0,
        projection_3_orthogonal_size: 300,

        camera_3: {
          disposition_3: 'superior',
        }
      }

      return Camera;
    })();
    //Uses camera object, implements iterator function
    //Has shader generator object
    Renderer = (function() {
      function Renderer() {
      }
      return Renderer;
    })();

    //Has minimal abstract object information
    //position, rotation, meta-data, geometry, material
    Entity = (function() {
      function Entity(options){
        options = options || {};
        util.missing(options, Entity.defaults);

        if(!options.dim) throw "Entity creation, no dim parameter";

        if(options.p && options.p.length === options.dim)
          this.p = options.p;
        else
          this.p = new NMath['vec'+options.dim].create();

        this.r = new NMath['mat'+options.dim].createIdentity();

        this.geometry = null;
        this.material = null;
      }

      Entity.defaults = {
        dim: 4,
      }

      return Entity;
    })();

    obj = (function() {
      var camera,
        tmp_m_1 = mat5.create(),
        tmp_m_2 = mat5.create(),
        tmp_v_1 = vec4.create();

      camera = (function() {

        function walk(camera, vector, dt) {
          var m_rotation = mat4.create(),
            v_rotated = vec4.create();

          mat.fromVecs(m_rotation, [camera.rx, camera.ry, camera.rz, camera.rw]);
          mat4.multiplyVec(v_rotated, m_rotation, vector);
          vec4.scaleAndAdd(camera.p, camera.p, v_rotated, dt);
        };

        return {
          walk: walk
        };
      })();

      iterator = (function() {
        function iterator() {
          this.list = [];
          this.pases = [];
        }
        iterator.prototype = {
          pass: function(tmp_v1, tmp_v2, tmp_m1, tmp_m2) {
            var i, j;

            if(!this.list.length || !this.pases.length)
              return;

            for(i = this.pases.length; i--;)
              for(j = this.list.length; j--;)
                this.pases[i](this.list[j], tmp_v1, tmp_v2, tmp_m1, tmp_m2);
          },
          add: function(obj) {
            if(this.list.indexOf(obj) === -1)
              this.list.push(obj);
          },
          remove: function(obj) {
            var i = this.list.indexOf(obj);
            if( i !== -1)
              this.list.splice(i, 1);
          },
          add_pass: function(pass) {
            if(this.pases.indexOf(pass) === -1)
              this.pases.push(pass);
          },
          remove_pass: function(pass) {
            var i = this.pases.indexOf(pass)
            if(i !== -1)
              this.pases.splice(i,1);
          }
        };

        return iterator;
      })();

      return {
        camera: camera,
        iterator: iterator
      };
    })();

    Obj = (function(){

      function Obj(p, rx, ry, rz, rw) {
        //graphical data:
        //position vectors
        this.p = (p)?p:new vec4.create();
        //rotation vectors
        this.rx = new vec4.create();
        this.ry = new vec4.create();
        this.rz = new vec4.create();
        this.rw = new vec4.create();
        this.rx[0] = 1.0;
        this.ry[1] = 1.0;
        this.rz[2] = 1.0;
        this.rw[3] = 1.0;

        //physical data
        //position derivative
        this.dp = new vec4.create();
        //rotation derivative
          /*  more complex than i need right now my friend ...
          this.drx = new vec4();
          this.dry = new vec4();
          this.drz = new vec4();
          this.drw = new vec4();
          */
        //better this relative-axis relative rotation angles for usage with math.rotateNormalized
        this.drx = 0.0;
        this.dry = 0.0;
        this.drz = 0.0;
        this.drw = 0.0;

        this.drv1 = new vec4.create();
        this.drv2 = new vec4.create();
        this.drtheta = 0.0;

        this.geom = null;
      };

      return  Obj
    })();

    geometry = (function() {

      var geom;

      function geom() {
        this.buffers = {};
        this.obj_list = [];
      }
      geom.prototype = (function() {
        //function
        return {

        };
      })();

      function grid3(x,y,z, options) {
        if(!options) options = {};
        if(!options.size_z) options.size_z = (!options.size)?100.0:options.size;
        if(!options.size_y) options.size_y = (!options.size)?100.0:options.size;
        if(!options.size_x) options.size_x = (!options.size)?100.0:options.size;

        var position = new GLMAT_ARRAY_TYPE(z*y*x*4),
          indices,
          step_x = 4,
          step_y = x*step_x,
          step_z = y*step_y,
          step_length_z = options.size_z/(z-1),
          step_length_y = options.size_y/(y-1),
          step_length_x = options.size_x/(x-1),
          i_z, i_y, i_x, i_dir;


        //fill vertex position data
        for(i_z = z; i_z--;)
          for(i_y = y; i_y--;)
            for(i_x = x; i_x--;) {
              i_dir = i_w*step_w + i_z*step_z + i_y*step_y + i_x*step_x;

              position[ i_dir ] =  i_x*step_length_x;
              position[i_dir+1] =  i_y*step_length_y;
              position[i_dir+2] =  i_z*step_length_z;
              position[i_dir+3] =  i_w*step_length_w;
            }

        //create indices
        if(!options.linestrip) {
          indices = new GLMAT_ARRAY_TYPE(2*(
            z*y*(x-1) + z*(y-1)*x + (z-1)*y*x
          )); //wow ...

            //will create all the indices of lines that point in the final axis parameter
            // direcction
            //
            //with this we can maintain code extensibility and editability, and
            //readability ;) .. well, it maybe should be the defacto way of editing the
            //grid, fuck!
          function createLinesOnAxis(offset,
              axis_a_step, axis_b_step, axis_c_step) {
            var i_dir2;

            var step_x = 2, //svs transformators (matrix elements)
              step_y = y*step_x,
              step_z = z*step_y;

            for(i_z = z; i_z--;)
              for(i_y = y; i_y--;)
                for(i_x = x-1; i_x--;) {

                  i_dir = offset + i_z*step_z + i_y*step_y + i_x*step_x;
                  i_dir2 =  i_z*axis_a_step + i_y*axis_b_step + i_x*axis_c_step;

                  indices[i_dir] = i_dir2;
                  indices[i_dir+1] = i_dir2 + axis_c_step;
                }
          }

          //fill with data
          //think of it like a svs (lines svs) maped
          //throught 4 transformation onto the same svs (points svs)
          //and the steps are the matrix transform from R4 to R1
          createLinesOnAxis(0, step_z, step_y, step_x);
          createLinesOnAxis( 2*z*y*(x-1), step_z, step_x, step_y);

          createLinesOnAxis( 2*z(y*(x-1) + (y-1)*x), step_y, step_x, step_z);
        }

        return {
          length_x:x,
          length_y:y,
          length_z:z,

          size_x: options.size_x,
          size_y: options.size_y,
          size_z: options.size_z,

          buffers: {
            position: position,
            indices: indices
          },
          buffers_info : null
          };
      }

      function grid4(x,y,z,w, options) {

        if(!options) options = {};
        if(!options.size_w) options.size_w = (!options.size)?100.0:options.size;
        if(!options.size_z) options.size_z = (!options.size)?100.0:options.size;
        if(!options.size_y) options.size_y = (!options.size)?100.0:options.size;
        if(!options.size_x) options.size_x = (!options.size)?100.0:options.size;

        var position = new GLMAT_ARRAY_TYPE(w*z*y*x*4),
          color = new GLCOLOR_ARRAY_TYPE(w*z*y*x*4),
          indices,
          step_x = 4,
          step_y = x*step_x,
          step_z = y*step_y,
          step_w = z*step_z,
          step_length_w = options.size_w/(w-1),
          step_length_z = options.size_z/(z-1),
          step_length_y = options.size_y/(y-1),
          step_length_x = options.size_x/(x-1),
          i_w, i_z, i_y, i_x, i_dir,
          min=1, max = -1;

        //fill vertex position data
        for(i_w = w; i_w--;)
          for(i_z = z; i_z--;)
            for(i_y = y; i_y--;)
              for(i_x = x; i_x--;) {
                i_dir = i_w*step_w + i_z*step_z + i_y*step_y + i_x*step_x;

                position[ i_dir ] =  ((x-1)/2-i_x)*step_length_x;
                position[i_dir+1] =  ((y-1)/2-i_y)*step_length_y;
                position[i_dir+2] =  ((z-1)/2-i_z)*step_length_z;
                position[i_dir+3] =  ((w-1)/2-i_w)*step_length_w;

                color[i_dir] = 0.4;
                color[i_dir+1] = 0.4;
                color[i_dir+2] = 0.4;
                color[i_dir+3] = 1;

                if( position[i_dir+0] < 0 )
                  color[i_dir] += 0.6;

                if( position[i_dir+2] < 0 )
                  color[i_dir+1] += 0.6;

                if( position[i_dir+3] < 0 )
                  color[i_dir+2] += 0.6;

                if( position[i_dir+1] < 0 )
                  color[i_dir+1] -= 0.2;
              }

        //create indices
        if(!options.linestrip) {
          indices = new GLINDEX_ARRAY_TYPE(2*(
            w*z*y*(x-1) + w*z*(y-1)*x + w*(z-1)*y*x + (w-1)*z*y*x
          )); //wow ...

            //will create all the indices of lines that point in the final axis parameter
            // direcction
            //
            //with this we can maintain code extensibility and editability, and
            //readability ;) .. well, it maybe should be the defacto way of editing the grid, fuck!
          function createLinesOnAxis(offset,
              axis_a_step, axis_b_step, axis_c_step, axis_d_step) {
            var i_dir2;

            var step_x = 1, //svs transformators
              step_y = y*step_x,
              step_z = z*step_y,
              step_w = w*step_z;

            for(i_w = w; i_w--;)
              for(i_z = z; i_z--;)
                for(i_y = y; i_y--;)
                  for(i_x = x-1; i_x--;) {

                    i_dir = offset + i_w*step_w + i_z*step_z + i_y*step_y + i_x*step_x;
                    i_dir2 =  i_w*axis_a_step + i_z*axis_b_step + i_y*axis_c_step + i_x*axis_d_step;

                    indices[i_dir] = i_dir2/4;
                    indices[i_dir+1] = (i_dir2 + axis_d_step)/4;
                  }
          }

          //fill with data
          //think of it like a svs (lines svs) maped
          //throught 4 transformation onto the same svs (points svs)
          //and the steps are the matrix transform from R4 to R1
          createLinesOnAxis(0, step_w, step_z, step_y, step_x);
          createLinesOnAxis( 2*w*z*y*(x-1), step_w, step_z, step_x, step_y);

          createLinesOnAxis( 2*w*z*(y*(x-1) + (y-1)*x), step_w, step_y, step_x, step_z);

          createLinesOnAxis( 2*w*(z*(y*(x-1) + (y-1)*x) + (z-1)*y*x),step_z, step_y, step_x, step_w);
        }

        return {
          length_x:x,
          length_y:y,
          length_z:z,
          length_w:w,

          size_x: options.size_x,
          size_y: options.size_y,
          size_z: options.size_z,
          size_w: options.size_w,

          buffers: {
            position: {numComponents: 4, data: position, type: Float32Array},
            indices: {numComponents: 2, data: indices, type: Float32Array},
            color: {numComponents: 4, data: color, type: Uint8Array}
          }
          };
      }

      function octahedron3(size) {
        var p, c, i;

        p = new GLMAT_ARRAY_TYPE([
          size, 0.0, 0.0,
          -size, 0.0, 0.0,
          0.0, size, 0.0,
          0.0, -size, 0.0,
          0.0, 0.0, size,
          0.0, 0.0, -size,
        ]),
        c = new GLCOLOR_ARRAY_TYPE([
          0.5, 0.0, 0.0, 1.0,
          -0.5, 0.0, 0.0, 1.0,
          0.0, 0.5, 0.0, 1.0,
          0.0, -0.5, 0.0, 1.0,
          0.0, 0.0, 0.5, 1.0,
          0.0, 0.0, -0.5, 1.0,
        ]),
        i = new GLINDEX_ARRAY_TYPE([
          0, 2,
          2, 4,
          2, 5,

          2, 1,
          1, 4,
          1, 5,

          1, 3,
          3, 4,
          3, 5,

          3, 0,
          0, 4,
          0, 5
        ]);

        return {
          buffers: {
            position: {numComponents: 3, data: p , type: Float32Array},
            indices: {numComponents: 2, data: i, type: Float32Array},
            color: {numComponents: 4, data: c, type: Uint8Array}
          }
        }
      }
      function simplex4(size, type) {
        var p = new GLMAT_ARRAY_TYPE([
            -0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
            0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
            0, 0.5773502743708339, -0.2041241452319315, -0.15811388194561005,
            0, 0, 0.6123724431685174, -0.15811388194561005,
            0, 0, 0, 0.6324555330964848
          ]),
          c,
          i = new GLINDEX_ARRAY_TYPE([
            0, 1,
            0, 2,
            0, 3,
            0, 4,
            1,2,
            1,3,
            1,4,
            2,3,
            2,4,
            3,4,
          ])

          if(type)
          c = new GLCOLOR_ARRAY_TYPE([
            1, 0, 0, 1,
            1, 0, 0, 1,
            0, 1, 0, 1,
            0, 1, 0, 1,
            1, 1, 0, 1,
          ])
          else
          c = new GLCOLOR_ARRAY_TYPE([
            1, 0, 1, 1,
            0, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 0, 1,
            0, 0, 0, 1,
          ])


          /*
          v_tmp[0] = 1.0 + 0.5*3;
          v_tmp[1] = 0.8660254037844386 + 0.28867513459481287*2;
          v_tmp[2] = 0.816496580927726 + 0.2041241452319315;
          v_tmp[3] = 0.7905694150420949;
          */

        return {
          buffers: {
            position: {numComponents: 4, data: p , type: GLMAT_ARRAY_TYPE},
            indices: {numComponents: 2, data: i, type: GLINDEX_ARRAY_TYPE},
            color: {numComponents: 4, data: c, type: GLCOLOR_ARRAY_TYPE}
            }
          }
      }
      function octahedron4(size) {
        var p = new GLMAT_ARRAY_TYPE([
          size, 0, 0, 0,
          -size, 0, 0, 0,
          0, size, 0, 0,
          0, -size, 0, 0,
          0, 0, size, 0,
          0, 0, -size, 0,
          0, 0, 0, size,
          0, 0, 0, -size,
        ]),
        c = new GLCOLOR_ARRAY_TYPE([
          0, 1, 1, 1,
          0, 1, 1, 1,

          1, 0, 0, 1,
          1, 0, 0, 1,

          0, 0, 1, 1,
          0, 0, 1, 1,

          1, 1, 0, 1,
          1, 1, 1, 1
        ]),
        i = new GLINDEX_ARRAY_TYPE([
          0, 2,
          1, 2,
          0, 3,
          1, 3,
          0, 4,
          1, 4,
          0, 5,
          1, 5,
          0, 6,
          1, 6,
          0, 7,
          1, 7,

          2, 4,
          3, 4,
          2, 5,
          3, 5,
          2, 6,
          3, 6,
          2, 7,
          3, 7,

          4, 6,
          5, 6,
          4, 7,
          5, 7,
        ]);

        return {
          buffers: {
            position: {numComponents: 4, data: p , type: GLMAT_ARRAY_TYPE},
            indices: {numComponents: 2, data: i, type: GLINDEX_ARRAY_TYPE},
            color: {numComponents: 4, data: c, type: GLCOLOR_ARRAY_TYPE}
            }
          }
      }

      function axis4(size){
        var p = new GLMAT_ARRAY_TYPE([
          0, 0, 0, 0,
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
        ]),
        c = new GLCOLOR_ARRAY_TYPE([
          1, 1, 1, 1,

          1, 0, 0, 1,
          0, 1, 0, 1,
          0, 0, 1, 1,
          1, 0, 1, 1,
        ]),
        i = new GLINDEX_ARRAY_TYPE([
          0, 1,
          0, 2,
          0, 3,
          0, 4,
        ]);
        return {
          buffers: {
            position: {numComponents: 4, data: p , type: GLMAT_ARRAY_TYPE},
            indices: {numComponents: 2, data: i, type: GLINDEX_ARRAY_TYPE},
            color: {numComponents: 4, data: c, type: GLCOLOR_ARRAY_TYPE}
            }
          }
      }

      return {
        octahedron3: octahedron3,
        octahedron4: octahedron4,
        simplex4: simplex4,
        grid4: grid4,
        grid3: grid3,
        axis4: axis4
      };
    })();

    //all the functions point to a static reference => no memdirection
    //solving after compiling
    //it could be maintained, this pseudo-monolitic mode for multiple instances

    renderer = (function() {
      var obj_list = [],
        context = null,
        canvas = null,
        shader_info = null,
        vertexShader, fragmentShader,
        attrib_vertex, attrib_color,
        uniforms = {},
        config = {},
        math = {
          mat : null,
          mat_cartesian : null,
          vec : null,
          vec_homogenous : null,
          vec_base : null
        },

        PMVMatrix = mat5.create(),
        PMVMatrix3 = mat4.create(),
        PMatrix = mat5.create(),
        PMatrix3 = mat4.create(),

        uPMVMatrix1 = mat4.create(),
        uPMVMatrix2 = mat4.create(),

        uPMatrix1 = mat4.create(),
        uPMatrix2 = mat4.create(),

        uMVMatrix1 = mat4.create(),
        uMVMatrix2 = mat4.create(),

        uPMVMatrix3D = PMVMatrix3,

        matrix_tmp = mat5.create(),
        tmp_matrix5_1 = mat5.create(),
        tmp_matrix5_2 = mat5.create(),
        tmp_matrix5_3 = mat5.create(),
        tmp_matrix4 = mat4.create(),
        tmp_matrix4_1 = mat4.create(),
        tmp_matrix4_2 = mat4.create(),
        tmp_matrix4_3 = mat4.create(),
        tmp_vec1 = vec4.create(),
        tmp_vec2 = vec4.create(),
        tmp_vec3 = vec4.create(),
        tmp_vec4 = vec4.create(),
        tmp_vec5 = vec4.create(),
        tmp_vec_5_1 = vec5.create(),
        tmp_vec_5_2 = vec5.create(),
        tmp_vec_5_3 = vec5.create(),
        tmp_vec_4_1 = vec4.create(),
        tmp_vec_4_2 = vec4.create(),
        tmp_vec_4_3 = vec4.create(),
        m_cameraRotation = mat5.create(),
        m_cameraRotation3 = mat4.create(),
        m_objectRotation = mat5.create(),
        v_totalTraslation = vec4.create(),
        v_totalTraslation3 = vec4.create(),
        obj_list_i,
        obj_list_obj,
        camera = new Obj(),
        camera3 = new Obj(),
        interface_obj;

      var tmp_debug = false;

      uPMVMatrix2[0] = 0; uPMVMatrix2[5] = 0; uPMVMatrix2[10] = 0; uPMVMatrix2[15] = 0;


      ///////
      //just for simplification of acommon task...
      //not related to NEngine concerns, but to renderer instance, aka mouse event looking api
      function pointerLock() {
        if(!canvas.requestPointerLock)  return;
        canvas.requestPointerLock();
      }
      function pointerUnlock() {
        if(!document.exitPointerLock)
          document.exitPointerLock = document.exitPointerLock ||
            document.mozExitPointerLock || document.webkitExitPointerLock;

        document.exitPointerLock();
      }
      function pointerLockAlternate() {
        if(
          document.pointerLockElement === canvas ||
          document.mozPointerLockElement === canvas ||
          document.webkitPointerLockElement === canvas
        )
          this.pointerUnlock();
        else if(!document.pointerLockElement &&
          !document.mozPointerLockElement &&
          !document.webkitPointerLockElement)
          this.pointerLock();
      }

      function init(options) {
        //create context
        if(!options) options = {};

        //config defaults
        var options_default = {

          //no config here relates to NEngine config, but to renderer
          container: document.body,
          resolution_density: 1.0,
          dim : 4,

          color_clear: [0.0, 0.0, 0.0, 1.0],

          //stereo model
          stereo_dim: 3,
          stereo_mode: 'splited',    //splited, polarized, alternation timer, etc.
          stereo_angle: Math.PI/60,
          stereo_separation: 0.07616,
          view_3d_stereo_angle: Math.PI/60,

          //projection schemes
          projection: 'perspective',
          projection_angle: Math.PI/2,
          projection_near: 1.0,
          projection_far: 3000.0,

          projection_3: 'perspective',
          projection_3_near: 1.0, //used on  ortogonal
          projection_3_far: 100.0,
          projection_3_perspective_angle: Math.PI/2,
          projection_3_orthogonal_size: 300,
          projection_3_orthogonal_aspect_x: 1.0,
          projection_3_orthogonal_aspect_y: 1.0,

          projection_3d_angle: Math.PI/2,
          projection_3d_near: 1.0,
          projection_3d_far: 100.0,

          camera_disposition_3: 'hexagon',
        }, field;

        for(field in options_default)
          if(options[field] === undefined)
            options[field] = options_default[field];

        //those are camera related configs
        if(!options.stereo_separator && options.stereo_dim) {
          if(options.stereo_dim === 3) options.stereo_separator = [-1, 0, 0, 0];
          if(options.stereo_dim === 4) options.stereo_separator = [-1, 0, 0, 0];

          vec4.scale(options.stereo_separator, options.stereo_separator, options.stereo_separation);
        }
        for(field in options)
            config[field] = options[field];

        if(config.camera_disposition_3 === 'observer') {
          vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.ry, Math.PI/2);
          camera3.p[2] =200;
          camera3.p[1] = -200;
        }

        if(config.camera_disposition_3 === 'hexagon') {
          vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.ry, Math.PI/5);
          camera3.p[1] =-120;
          if(config.projection_3 === 'perspective')  {
          }
          else if(config.projection_3 === 'ortogonal') {
            //camera3.p[0] =200;
            //camera3.p[1] =-120;
          }
        }

        ///Normalize context to twgl
        if(options.container === document.body) {
          options.container = document.createElement('canvas',
            {alpha: false, premultipliedAlpha: false});
          options.container.className = 'NEngine_canvas';
          document.body.appendChild(options.container);
        }
        context = twgl.getWebGLContext(options.container);

        //create shader program, deprecated, use generator:
        //new NEngine.shader(flags)
        //obj.code(), obj.set(), renderer.use(obj)
        //camera: list of n-dimensional cameras for each lower dim
        //rederer.cameras(camera instance, renderer.shader)
        twgl.setAttributePrefix('a_');
        shader_info = twgl.createProgramInfo(context, ["vs", "fs"]);
        context.useProgram(shader_info.program);

        //fill uniform pointers
        uniforms.uPMVMatrix1 = uPMVMatrix1;
        uniforms.uPMVMatrix2 = uPMVMatrix2;

        uniforms.uPMatrix1 = uPMatrix1;
        uniforms.uPMatrix2 = uPMatrix2;
        uniforms.uMVMatrix1 = uMVMatrix1;
        uniforms.uMVMatrix2 = uMVMatrix2;

        uniforms.uPMVMatrix3D = uPMVMatrix3D;

        //adjust canvas size
        interface_obj.canvas = canvas = context.canvas;
        canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock ||
                            canvas.webkitRequestPointerLock;

        context.clearColor(config.color_clear[0],config.color_clear[1],config.color_clear[2],config.color_clear[3]);
        context.enable( context.DEPTH_TEST );

        math.mat = global.NMath['mat'+(config.dim+1)];
        math.mat_cartesian = global.NMath['mat'+config.dim];

        math.vec = global.NMath['vec'+config.dim];
        math.vec_homogenous = global.NMath['vec'+(config.dim+1)];

        //deprecated, to renderer object
        global.addEventListener('resize', resize, false);
        resize();
      }

      //reconfigure complex NEngine properties .... duno wich xD
      function set(options) {
        var config_field;
        for(config_field in options.config)
          config[config_field] = options.config[config_field];

        //multiple simultaneous NEngine wont need this, but just renderers
        if(options.mouse_axisRotation) {
        }

      }
      function resize() {
        //regenerate renderer transform matrix to catch canvas reshape
        var const_vert = 1,
          const_hor = 1;

        twgl.resizeCanvasToDisplaySize( canvas );

        mat5.projectionLen(PMatrix,
          config.projection_angle,
          config.projection_angle,
          config.projection_angle,
          config.projection_near, config.projection_far);

        if(config.stereo_dim) {
            const_vert = canvas.height/canvas.width;
            const_hor = 1/2;
        }
        else {
          const_vert = canvas.height/canvas.width;
          const_hor = 1;
        }

        if(config.projection_3 === 'perspective')
          mat4.projectionLen(PMatrix3,
            config.projection_3_perspective_angle*const_hor,
            config.projection_3_perspective_angle*const_vert,
            config.projection_3_near, config.projection_3_far);
        else if(config.projection_3 === 'ortogonal')
          mat4.ortogonalLen(PMatrix3,
            config.projection_3_orthogonal_size,
            config.projection_3_orthogonal_aspect_x*const_hor,
            config.projection_3_orthogonal_aspect_y*const_vert);
            /*
            projection_3_orthogonal_size: 300,
            projection_3_orthogonal_aspect_x: 1.0,
            projection_3_orthogonal_aspect_y: 1.0
            */
        //console.log(mat.str(PMatrix3))
      }

      //renderer iterator will handle renderer-space camera, and thus posible
      //mouse oriented handling events when asked for, like camera data, and a posible hosted
      //world-camera for optimized more complex 4D or ND visualization techniques
      //
      //remains to be the renderer iterator suposed structure
      //
      var printed = 5;
      var printed_limit = 2;
      var happened = false;
      function render() {
        var mat_common = NMath.mat,
          //to generate tmp matrix data, withfronVecs
          //deprecated by matrix rotation data storage format in objets
          tmp_vec_5 = NMath.vec5.create(),
          tmp_vec_4 = NMath.vec5.create(),
          stereo_4_rotation_plane = [
            new vec4.create(),
            new vec4.create()
          ],
          stereo=[],
          camera_rot_4,
          camera_rot_3,
          i;

        //to generate 4D rotation, deprecated, local
        stereo_4_rotation_plane[0][3] = 1;
        stereo_4_rotation_plane[1][0] = 1;
        stereo_4_rotation_plane[1][2] = 0;
        vec4.plane(stereo_4_rotation_plane[0], stereo_4_rotation_plane[1]);

        //deprecated by new object rotation storage forma
        tmp_vec_5[4] = 1.0;
        tmp_vec_4[3] = 1.0;

        if(obj_list.length) {
          context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

          //get camera rotation matrix
          mat_common.fromVecs(m_cameraRotation,
            [camera.rx,
            camera.ry,
            camera.rz,
            camera.rw,
            tmp_vec_5]
          );
          mat_common.fromVecs(m_cameraRotation3,
            [camera3.rx,
            camera3.ry,
            camera3.rz,
            tmp_vec_4]
          );

          if(config.stereo_dim) for(i=0;i<2;i++) {

          }
          if(!config.stereo_dim === 4) {
            camera_rot_4=mat5.create();
            mat_common.invert(camera_rot_4, m_cameraRotation)
          }
          if(!config.stereo_dim === 3) {

          }

          for(obj_list_i=obj_list.length; obj_list_i--;) {
            obj_list_obj = obj_list[obj_list_i]
            if(obj_list_i == 1 && !happened) {
              happened = true;
              printed = 0;
              console.log(obj_list_obj)
            }

            //get obj rotation matrix
              mat_common.from(m_objectRotation,obj_list_obj.r, true)
              m_objectRotation[24] = 1;

            mat5.copy(matrix_tmp, m_objectRotation);
            vec4.sub(v_totalTraslation, obj_list_obj.p, camera.p);  //get total translation
            mat5.translate(m_objectRotation, v_totalTraslation);


            //start drawing
            context.useProgram(shader_info.program);
            twgl.setBuffersAndAttributes(context, shader_info, obj_list_obj.geom.buffers_info);

            //optimize with metaprogramatic precompiler
            for(i = 0, length = ( (config.stereo_dim)? 2:1 ) ; i < length; ++i) {

              //4D level
              if(config.stereo_dim === 4) {
                //internal eye_translation*eye_rotation
                //eye rotate m_cameraRotation3
                mat5.identity(tmp_matrix5_1);
                mat4.identity(tmp_matrix4);

                mat4.rotationPlane(tmp_matrix4,
                  stereo_4_rotation_plane[0],
                  stereo_4_rotation_plane[1],
                  config.stereo_angle * ((i === 0)? 1:-1) );

                  //console.log(mat_common.str(tmp_matrix4));
                mat_common.from(tmp_matrix5_1,  tmp_matrix4);

                //eye translate
                vec4.scale(tmp_vec1, config.stereo_separator, ((i === 0)? 1:-1) );
                mat5.translate(tmp_matrix5_1, tmp_vec1);

                //world -> eye, global*local
                mat5.multiply(tmp_matrix5_2, m_cameraRotation, tmp_matrix5_1);
              }
              else {
                //multiply, (total transforms)*(camera_transforms)
                mat5.copy(tmp_matrix5_2, m_cameraRotation);
              }
              NMath.mat.invert(tmp_matrix5_1, tmp_matrix5_2);
              mat5.multiply(matrix_tmp, tmp_matrix5_1, m_objectRotation)

              //create perspective uniforms;
              mat5.multiply(PMVMatrix, PMatrix, matrix_tmp);

              mat5.inferiorProjection(uPMatrix1, uPMatrix2, PMatrix);
              mat5.inferiorProjection(uMVMatrix1, uMVMatrix2, matrix_tmp);

              mat5.inferiorProjection(uPMVMatrix1, uPMVMatrix2, PMVMatrix);

              //3D level
              if(config.stereo_dim === 3) {
                //internal eye_translation*eye_rotation
                //eye rotate m_cameraRotation3
                mat5.identity(tmp_matrix5_1);
                mat5.rotateAxis(tmp_matrix5_1, 2,0,config.stereo_angle * ((i === 0)? 1:-1));
                mat.from(tmp_matrix4_1, tmp_matrix5_1);
                //eye translate
                vec4.scale(tmp_vec1, config.stereo_separator, ((i === 0)? 1:-1) );
                mat4.translate(tmp_matrix4_1, tmp_vec1);

                mat4.copy(tmp_matrix4_2, m_cameraRotation3);
                mat4.translate(tmp_matrix4_2, camera3.p);

                //world -> eye, global*local
                mat4.multiply(tmp_matrix4_3, tmp_matrix4_2, tmp_matrix4_1);
              }
              else {
                //trasladar a coordenadas relativas
                mat4.copy(tmp_matrix4_3, m_cameraRotation3);
                mat4.translate(tmp_matrix4_3, camera3.p);
              }

              mat4.multiply(PMVMatrix3, PMatrix3, tmp_matrix4_3);
              printed++;

              twgl.setUniforms(shader_info, uniforms);
              if(config.stereo_dim) {
                if(i === 0)
                  context.viewport(0, 0, canvas.width/2, canvas.height);
                else
                  context.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);
              }
              else context.viewport(0, 0, canvas.width, canvas.height);

              twgl.drawBufferInfo(context, context.LINES, obj_list_obj.geom.buffers_info);
            }
          }
        }
      }
      //renderer handles ... iterator object copy??
      function objAdd(obj) {
        if(obj.geom && obj.geom.buffers_info !== null) {
          obj.geom.buffers_info = twgl.createBufferInfoFromArrays(context, obj.geom.buffers );
        }
        obj_list.push(obj);
      }

      function objRm(obj) {
        if(obj_list[obj_list.length-1] === obj) { obj_list.pop(); return; }
        obj_list[ obj_list.indexOf(obj) ] = obj_list.pop();
      }

      interface_obj = {
        objAdd: objAdd,
        objRm: objRm,
        init: init,
        resize: resize,
        render: render,
        canvas: canvas,
        obj_list: obj_list,
        camera: camera,
        camera3: camera3,
        math: math,
        config: config,
        pointerLock : pointerLock,
        pointerUnlock: pointerUnlock,
        pointerLockAlternate: pointerLockAlternate
      };

      return interface_obj;
    })();

    return {
      Obj: Obj,
      geometry: geometry,
      obj: obj,
      math: math,
      //physics: physics,
      renderer: renderer,
      Camera: Camera,
      Renderer: Renderer,
      Entity: Entity,
    };
  })();
})();
}
catch(e) {
  console.log('NEngine error: ', e);
}
}
 catch(e) {
  console.log('You dont have an NEngine requeriment, NEngine not loaded', e);
}
