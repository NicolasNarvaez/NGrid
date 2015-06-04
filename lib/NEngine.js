/**
* An n-dimensional engine, works recursively projection dimension n into n-1 until n = 3.
* it works over optimized functions, amd only dimensions 4 and 3 are precompiled, if
* a given required dimension isnt compiled, uses nmath to create its library. <br/> <br/>
* When you start ngine and specify the working dimension, you can use internal dimension-agnostic
* objects to manipulate the engine elements, and make your app dimension-agnostic.
* @fileoverview
* @author Nicolás Narváez
* @version 0.5
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
    GLMAT_ARRAY_TYPE = NMath.GLMAT_ARRAY_TYPE,
    GLCOLOR_ARRAY_TYPE = NMath.GLCOLOR_ARRAY_TYPE,
    GLINDEX_ARRAY_TYPE = NMath.GLINDEX_ARRAY_TYPE;


  function projection(out,va,vb) {
    vec4.scale(out, vb, vec4.dot(va,vb)/vec4.length(va));
  }

  global.NEngine = (function() {

    var math, Obj, renderer, geometry;

    math = (function() {
      //front-vector : va
      //rotation-vector: vb
      //all ortogonal/

      //gets projection of va over vb
      function projection(out,va,vb) {
        vec4.scale(out, vb, vec4.dot(va,vb)/vec4.length(va));
      }

      //will reorthogonalize vectors
      function repair(vx, vy, vz, vw) {
        var length,
          projection = new vec4.create();

        //repair vx
        projection(projection, vx, vy);
        vec4.sub(vx,vx, projection);
        projection(projection, vx, vz);
        vec4.sub(vx,vx, projection);
        projection(projection, vx, vw);
        vec4.sub(vx,vx, projection);

        vec4.normalize(vx, vx);

        projection(projection, vy, vz);
        vec4.sub(vy,vy, projection);
        projection(projection, vy, vw);
        vec4.sub(vy,vy, projection);

        vec4.normalize(vy,vy);

        projection(projection, vz, vw);
        vec4.sub(vz,vz, projection);

        vec4.normalize(vz,vz);
        vec4.normalize(vw,vw);
      }

      return {
        projection: projection,
        repair: repair,
      };
    })();

    obj = (function() {
      var camera, graphic, physic,
        tmp_m_1 = mat5.create(),
        tmp_m_2 = mat5.create(),
        tmp_v_1 = vec4.create();

      graphic = (function() {

        return {

        };
      })();

      camera = (function() {


        function create() {

        }

        function walk(camera, vector, dt) {
          var m_rotation = mat4.create(),
            v_rotated = vec4.create();

          mat.fromVecs(m_rotation, [camera.rx, camera.ry, camera.rz, camera.rw]);
          mat4.invert(m_rotation, m_rotation);
          mat4.multiplyVec(v_rotated, m_rotation, vector);
          vec4.scaleAndAdd(camera.p, camera.p, v_rotated, dt);
        };

        return {
          walk: walk,
          create: create
        };
      })();

      return {
        camera: camera,
        graphic: graphic,
        physic: physic
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

        this.geom = null;
      };

      return  Obj
    })();

    geometry = (function() {

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

                color[i_dir] = 105;
                color[i_dir+1] = 105;
                color[i_dir+2] = 105;
                color[i_dir+3] = 255;

                if( position[i_dir+0] < 0 )
                  color[i_dir] += 150;

                if( position[i_dir+2] < 0 )
                  color[i_dir+1] += 150;

                if( position[i_dir+3] < 0 )
                  color[i_dir+2] += 150;

                if( position[i_dir+1] < 0 )
                  color[i_dir+1] -= 45;
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

      return {
        grid4: grid4,
        grid3: grid3
      };
    })();

    //all the functions point to a static reference => no memdirection
    //solving after compiling
    //it could be maintained, this pseudo-monolitic mode for multiple instances

    renderer = (function() {
      var obj_list = [],
        options_init,
        context = null,
        canvas = null,
        shader_info = null,
        vertexShader, fragmentShader,
        attrib_vertex, attrib_color,
        uniforms = {},
        config = {
          dimensions : null,
          color_clear : [0.0, 0.0, 0.0, 1.0],
          view_3d : 'mono',
          view_3d_camera_disposition: 'hexagon',
          view_3d_stereo_angle : Math.PI/60,
          view_3d_stereo_separator : [-2.616,0,0,0],
          view_3d_projection: 'perspective',
          view_3d_projection_ortogonal_length : 100,
          view_3d_projection_ortogonal_aspect_x : 1,
          view_3d_projection_ortogonal_aspect_y : 1
        },
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

        global.tmp_debug = true;

        uPMVMatrix2[0] = 0; uPMVMatrix2[5] = 0; uPMVMatrix2[10] = 0; uPMVMatrix2[15] = 0;


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
        var options_default = {
          dim : 4
        }, field;
        for(field in options_default)
          if(options[field] === undefined)
            options[field] = options_default[field];

        //create context
        if(!options) options = {};
        if(!options.container) options.container = document.body;
        if(!options.projection_near) options.projection_near = 1.0;
        if(!options.projection_far) options.projection_far = 100.0;
        if(!options.projection_angle) options.projection_angle = Math.PI/2;

        if(!options.projection_3d_near) options.projection_3d_near = 1.0;
        if(!options.projection_3d_far) options.projection_3d_far = 100.0;
        if(!options.projection_3d_angle) options.projection_3d_angle = Math.PI/2;

        options_init = options;

        config.dim = options.dim;
        math.mat = global.NMath['mat'+(config.dim+1)];
        math.mat_cartesian = global.NMath['mat'+config.dim];

        math.vec = global.NMath['vec'+config.dim];
        math.vec_homogenous = global.NMath['vec'+(config.dim+1)];

        if(options.view_3d_projection)
          config.view_3d_projection = options.view_3d_projection;
        if(options.view_3d_camera_disposition)
          config.view_3d_camera_disposition = options.view_3d_camera_disposition;
        if(options.view_3d_projection_ortogonal_length)
          config.view_3d_projection_ortogonal_length = options.view_3d_projection_ortogonal_length;
        if(options.view_3d)
          config.view_3d = options.view_3d;

        if(config.view_3d_camera_disposition === 'hexagon') {
          if(config.view_3d_projection === 'perspective')  {
            vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.rx, -Math.PI/4);
            vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.ry, Math.PI/5);
            camera3.p[0] = +100;
            camera3.p[1] = -100;
          }
          else if(config.view_3d_projection === 'ortogonal') {
            vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.rx, -Math.PI/4);
            vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.ry, Math.PI/5);
            camera3.p[0] =100;
            camera3.p[1] =-100;
          }
        }

        if(options.container === document.body) {
          options.container = document.createElement('canvas',
            {alpha: false, premultipliedAlpha: false});
          options.container.className = 'NEngine_canvas';
          document.body.appendChild(options.container);
        }
        context = twgl.getWebGLContext(options.container);

        //create shader program
        twgl.setAttributePrefix('a_');
        shader_info = twgl.createProgramInfo(context, ["vs", "fs"]);
        context.useProgram(shader_info.program);

        //fill uniform pointers
        uniforms.uPMVMatrix1 = uPMVMatrix1;
        uniforms.uPMVMatrix2 = uPMVMatrix2;
        uniforms.uPMVMatrix3D = uPMVMatrix3D;

        //adjust canvas size
        interface_obj.canvas = canvas = context.canvas;

        canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock ||
                            canvas.webkitRequestPointerLock;


        global.addEventListener('resize', resize, false);
        resize();
      }
      function set(options) {
        var config_field;
        for(config_field in options.config)
          config[config_field] = options.config[config_field];

        if(options.mouse_axisRotation) {
        }
      }
      function resize() {
        var const_vert = 1,
          const_hor = 1;

        twgl.resizeCanvasToDisplaySize( canvas );

        mat5.projectionLen(PMatrix,
          options_init.projection_angle,
          options_init.projection_angle,
          options_init.projection_angle,
          options_init.projection_near, options_init.projection_far);


        switch(config.view_3d) {
          case 'stereo':
            const_vert = canvas.height/canvas.width;
            const_hor = 1/2;
            break;
          case 'mono':
            const_vert = canvas.height/canvas.width;
            const_hor = 1;
            break;
          default:
            const_vert = canvas.height/canvas.width;
            const_hor = 1;
            return;
        }
        if(config.view_3d_projection === 'perspective')
          mat4.projectionLen(PMatrix3,
            options_init.projection_3d_angle*const_hor,
            options_init.projection_3d_angle*const_vert,
            options_init.projection_3d_near, options_init.projection_3d_far);
        else if(config.view_3d_projection === 'ortogonal')
          mat4.ortogonalLen(PMatrix3,
            config.view_3d_projection_ortogonal_length,
            config.view_3d_projection_ortogonal_aspect_x*const_hor,
            config.view_3d_projection_ortogonal_aspect_y*const_vert);
      }

      function render() {

        if(obj_list.length) {
          context.clearColor(config.color_clear[0],config.color_clear[1],config.color_clear[2],config.color_clear[3]);
          context.clear(context.COLOR_BUFFER_BIT);

          //get camera rotation matrix
          mat5.rotationVecs(m_cameraRotation,
            camera.rx,
            camera.ry,
            camera.rz,
            camera.rw
          );
          for(obj_list_i=obj_list.length; obj_list_i--;) {

            obj_list_obj = obj_list[obj_list_i]

            //get obj rotation matrix
            mat5.rotationVecs(m_objectRotation,
              obj_list_obj.rx,
              obj_list_obj.ry,
              obj_list_obj.rz,
              obj_list_obj.rw
            );

            mat5.copy(matrix_tmp, m_objectRotation);
            vec4.sub(v_totalTraslation, obj_list_obj.p, camera.p);  //get total translation
            mat5.translate(m_objectRotation, v_totalTraslation);


            mat5.multiply(matrix_tmp, m_cameraRotation, m_objectRotation); //multiply
            mat5.multiply(PMVMatrix, PMatrix, matrix_tmp);

            //create perspective uniforms;
            mat5.inferiorProjection(uPMVMatrix1, uPMVMatrix2, PMVMatrix);

            //start drawing
            context.useProgram(shader_info.program);
            twgl.setBuffersAndAttributes(context, shader_info, obj_list_obj.geom.buffers_info);

            if(config.view_3d === 'stereo') {
              //left draw

              //internal eye_translation*eye_rotation
              //eye rotate
              mat5.identity(tmp_matrix5_1);
              mat5.rotateZX(tmp_matrix5_1, config.view_3d_stereo_angle);
              mat.createFrom(tmp_matrix4_1, tmp_matrix5_1);
              //eye translate
              mat4.translate(tmp_matrix4_1, tmp_matrix4_1, config.view_3d_stereo_separator);

              //world eye rotate, translation, translation*rotate
              //console.log(vec.str(camera3.rx));
              mat4.rotationVecs(tmp_matrix4_2, camera3.rx, camera3.ry, camera3.rz);
              mat4.translate(tmp_matrix4_2, tmp_matrix4_2, camera3.p);

              //world -> eye, global*local
              mat4.multiply(tmp_matrix4_3, tmp_matrix4_2, tmp_matrix4_1);

              //projection
              mat4.multiply(PMVMatrix3, PMatrix3, tmp_matrix4_3);

              twgl.setUniforms(shader_info, uniforms);
              context.viewport(0,0, canvas.width/2, canvas.height);
              twgl.drawBufferInfo(context, context.LINES, obj_list_obj.geom.buffers_info);

              //right draw

              //internal eye_translation*eye_rotation
              //eye rotate
              mat5.identity(tmp_matrix5_1);
              mat5.rotateZX(tmp_matrix5_1, -config.view_3d_stereo_angle);
              mat.createFrom(tmp_matrix4_1, tmp_matrix5_1);
              //eye translate
              vec4.scale(tmp_vec1, config.view_3d_stereo_separator, -1 );
              mat4.translate(tmp_matrix4_1, tmp_matrix4_1, tmp_vec1);

              //world eye rotate, translation, translation*rotate
              mat4.rotationVecs(tmp_matrix4_2, camera3.rx, camera3.ry, camera3.rz);
              mat4.translate(tmp_matrix4_2, tmp_matrix4_2, camera3.p);

              //world -> eye, global*local
              mat4.multiply(tmp_matrix4_3, tmp_matrix4_2, tmp_matrix4_1);

              //projection
              mat4.multiply(PMVMatrix3, PMatrix3, tmp_matrix4_3);
              twgl.setUniforms(shader_info, uniforms);
              context.viewport(canvas.width/2,0, canvas.width/2, canvas.height);
              twgl.drawBufferInfo(context, context.LINES, obj_list_obj.geom.buffers_info);
            }
            else if(config.view_3d === 'mono' || !config.view_3d) {
              //rotar mundo

              mat4.rotationVecs(m_cameraRotation3, camera3.rx, camera3.ry, camera3.rz);

              //trasladar a coordenadas relativas
              vec4.copy(tmp_vec1, camera3.p);
              vec4.scale(tmp_vec1, tmp_vec1, -1);
              mat4.translate(tmp_matrix4, m_cameraRotation3, camera3.p);

              //crear matriz de transformación total
              mat4.multiply(PMVMatrix3, PMatrix3, tmp_matrix4);

              twgl.setUniforms(shader_info, uniforms);
              context.viewport(0,0, canvas.width, canvas.height);
              twgl.drawBufferInfo(context, context.LINES, obj_list_obj.geom.buffers_info);
            }

            if(global.tmp_debug) { global.tmp_debug = false;
              console.log(mat.str(PMatrix3));
              console.log(mat.str(PMatrix));
              console.log(mat.str(PMVMatrix));

              var i = 0, data = obj_list_obj.geom.buffers.position.data;
              for(; i < data.length; i+=4) {
                var v = vec.createFrom(5, data, i, 4), v_tmp = vec5.create();
                  v[4] = 1.0, h = 0,
                  v4=null, v4_tmp=vec4.create(),
                  depth = null;

                //to NDC4
                mat5.multiplyVec(v_tmp, PMVMatrix,v);
                h = v_tmp[4];
                vec5.scaleI(v_tmp, 1/h);
                v_tmp[3] *= h;
                ///alreaduy in NDC4!!

                //to eye 3
                v4 = vec.createFrom(4, v_tmp);
                v4[2] += 1.0;
                vec4.scale(v4, v4, 50);
                v4[3] = 1.0;

                //to NDC3
                mat4.multiplyVec(v4_tmp, PMVMatrix3, v4);
                h = v4_tmp[3];
                vec4.scale(v4_tmp, v4_tmp, 1/h);
                v4_tmp[2] = v_tmp[3];
                //already in NDC3
                /*
                console.log(vec.str(v_tmp, 8));
                console.log(vec.str(v4, 8));
                console.log(vec.str(v4_tmp, 8));
                console.log('');
                */

              }
              global.tmp_debug = false;
            }
          }
        }
      }
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
      renderer: renderer
    };
  })();
})();
}
catch(e) {
  console.log(e);
}
}
 catch(e) {
  console.log('You dont have an NEngine requeriment, NEngine not loaded', e);
}
