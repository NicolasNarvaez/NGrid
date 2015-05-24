//NEngine
try {
if(glMatrix && twgl)  //requires
(function() {

  var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array,
    GLCOLOR_ARRAY_TYPE = (typeof Uint8Array !== 'undefined') ? Float32Array : Array;

  //we need a mat5 extension to glMatrix, to projection, and translation matrixes
  this.mat5 = (function() {

    function identity(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;

      out[5] = 0;
      out[6] = 1;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;

      out[10] = 0;
      out[11] = 0;
      out[12] = 1;
      out[13] = 0;
      out[14] = 0;

      out[15] = 0;
      out[16] = 0;
      out[17] = 0;
      out[18] = 1;
      out[19] = 0;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 0;
      out[24] = 1;
    }

    function create() {
      var out = new GLMAT_ARRAY_TYPE(25);

      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;

      out[5] = 0;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;

      out[10] = 0;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;

      out[15] = 0;
      out[16] = 0;
      out[17] = 0;
      out[18] = 0;
      out[19] = 0;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 0;
      out[24] = 0;
      return out;
    }

    function createIdentity() {
      var out = new GLMAT_ARRAY_TYPE(25);

      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;

      out[5] = 0;
      out[6] = 1;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;

      out[10] = 0;
      out[11] = 0;
      out[12] = 1;
      out[13] = 0;
      out[14] = 0;

      out[15] = 0;
      out[16] = 0;
      out[17] = 0;
      out[18] = 1;
      out[19] = 0;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 0;
      out[24] = 1;
      return out;
    }


    function multiply(out, a, b) {
      out[24] = a[24]*b[24] + a[19]*b[23] + a[14]*b[22] + a[9]*b[21] + a[4]*b[20];
      out[23] = a[23]*b[24] + a[18]*b[23] + a[13]*b[22] + a[8]*b[21] + a[3]*b[20];
      out[22] = a[22]*b[24] + a[17]*b[23] + a[12]*b[22] + a[7]*b[21] + a[2]*b[20];
      out[21] = a[21]*b[24] + a[16]*b[23] + a[11]*b[22] + a[6]*b[21] + a[1]*b[20];
      out[20] = a[20]*b[24] + a[15]*b[23] + a[10]*b[22] + a[5]*b[21] + a[0]*b[20];
      out[19] = a[24]*b[19] + a[19]*b[18] + a[14]*b[17] + a[9]*b[16] + a[4]*b[15];
      out[18] = a[23]*b[19] + a[18]*b[18] + a[13]*b[17] + a[8]*b[16] + a[3]*b[15];
      out[17] = a[22]*b[19] + a[17]*b[18] + a[12]*b[17] + a[7]*b[16] + a[2]*b[15];
      out[16] = a[21]*b[19] + a[16]*b[18] + a[11]*b[17] + a[6]*b[16] + a[1]*b[15];
      out[15] = a[20]*b[19] + a[15]*b[18] + a[10]*b[17] + a[5]*b[16] + a[0]*b[15];
      out[14] = a[24]*b[14] + a[19]*b[13] + a[14]*b[12] + a[9]*b[11] + a[4]*b[10];
      out[13] = a[23]*b[14] + a[18]*b[13] + a[13]*b[12] + a[8]*b[11] + a[3]*b[10];
      out[12] = a[22]*b[14] + a[17]*b[13] + a[12]*b[12] + a[7]*b[11] + a[2]*b[10];
      out[11] = a[21]*b[14] + a[16]*b[13] + a[11]*b[12] + a[6]*b[11] + a[1]*b[10];
      out[10] = a[20]*b[14] + a[15]*b[13] + a[10]*b[12] + a[5]*b[11] + a[0]*b[10];
      out[9] = a[24]*b[9] + a[19]*b[8] + a[14]*b[7] + a[9]*b[6] + a[4]*b[5];
      out[8] = a[23]*b[9] + a[18]*b[8] + a[13]*b[7] + a[8]*b[6] + a[3]*b[5];
      out[7] = a[22]*b[9] + a[17]*b[8] + a[12]*b[7] + a[7]*b[6] + a[2]*b[5];
      out[6] = a[21]*b[9] + a[16]*b[8] + a[11]*b[7] + a[6]*b[6] + a[1]*b[5];
      out[5] = a[20]*b[9] + a[15]*b[8] + a[10]*b[7] + a[5]*b[6] + a[0]*b[5];
      out[4] = a[24]*b[4] + a[19]*b[3] + a[14]*b[2] + a[9]*b[1] + a[4]*b[0];
      out[3] = a[23]*b[4] + a[18]*b[3] + a[13]*b[2] + a[8]*b[1] + a[3]*b[0];
      out[2] = a[22]*b[4] + a[17]*b[3] + a[12]*b[2] + a[7]*b[1] + a[2]*b[0];
      out[1] = a[21]*b[4] + a[16]*b[3] + a[11]*b[2] + a[6]*b[1] + a[1]*b[0];
      out[0] = a[20]*b[4] + a[15]*b[3] + a[10]*b[2] + a[5]*b[1] + a[0]*b[0];
    }

    function traspose(out,a) {
      out[24]=a[24];
      out[23]=a[19];
      out[22]=a[14];
      out[21]=a[9];
      out[20]=a[4];
      out[19]=a[23];
      out[18]=a[18];
      out[17]=a[13];
      out[16]=a[8];
      out[15]=a[3];
      out[14]=a[22];
      out[13]=a[17];
      out[12]=a[12];
      out[11]=a[7];
      out[10]=a[2];
      out[9]=a[21];
      out[8]=a[16];
      out[7]=a[11];
      out[6]=a[6];
      out[5]=a[1];
      out[4]=a[20];
      out[3]=a[15];
      out[2]=a[10];
      out[1]=a[5];
      out[0]=a[0];
    }

    function trasposeSelf(a) {
      var tmp;
      tmp = a[19]
      a[19] = a[23];
      a[23] = tmp
      tmp = a[14]
      a[14] = a[22];
      a[22] = tmp
      tmp = a[13]
      a[13] = a[17];
      a[17] = tmp
      tmp = a[9]
      a[9] = a[21];
      a[21] = tmp
      tmp = a[8]
      a[8] = a[16];
      a[16] = tmp
      tmp = a[7]
      a[7] = a[11];
      a[11] = tmp
      tmp = a[4]
      a[4] = a[20];
      a[20] = tmp
      tmp = a[3]
      a[3] = a[15];
      a[15] = tmp
      tmp = a[2]
      a[2] = a[10];
      a[10] = tmp
      tmp = a[1]
      a[1] = a[5];
      a[5] = tmp
    }

    /**
    * @param {vec4} p - vector de traslación
    */
    function translate(m, p) {
      m[20] += m[20]+p[0];
      m[21] += m[21]+p[1];
      m[22] += m[22]+p[2];
      m[23] += m[23]+p[3];
    }

    function scale(out, m, vec) {
      out[0] = m[0]*vec[0];
      out[1] = m[1]*vec[0];
      out[2] = m[2]*vec[0];
      out[3] = m[3]*vec[0];

      out[5] = m[5]*vec[1];
      out[6] = m[6]*vec[1];
      out[7] = m[7]*vec[1];
      out[8] = m[8]*vec[1];

      out[10] = m[10]*vec[2];
      out[11] = m[11]*vec[2];
      out[12] = m[12]*vec[2];
      out[13] = m[13]*vec[2];

      out[15] = m[15]*vec[3];
      out[16] = m[16]*vec[3];
      out[17] = m[17]*vec[3];
      out[18] = m[18]*vec[3];
    }

    /**
    * @param {}
    */
    function rotationVecs(out, vx,vy,vz,vw) {
      out[0] = vx[0];
      out[1] = vx[1];
      out[2] = vx[2];
      out[3] = vx[3];
      out[4] = 0;

      out[5] = vy[0];
      out[6] = vy[1];
      out[7] = vy[2];
      out[8] = vy[3];
      out[9] = 0;

      out[10] = vz[0];
      out[11] = vz[1];
      out[12] = vz[2];
      out[13] = vz[3];
      out[14] = 0;

      out[15] = vw[0];
      out[16] = vw[1];
      out[17] = vw[2];
      out[18] = vw[3];
      out[19] = 0;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 0;
      out[24] = 1;
    }

    function projectionLen(out, alfa, beta, gamma, near, far) {
      var x = near/Math.tan(alfa/2),
        y = near/Math.tan(beta/2),
        z = near/Math.tan(gamma/2);
      projection(out, -x, x, -y, y, -z, z, near, far);
    }

    function projection(out, left, right, back, front, bottom, top, near, far) {
      out[0] = 2*near/(right-left);
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;

      out[5] = 0;
      out[6] = 2*near/(front-back);
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;

      out[10] = 0;
      out[11] = 0;
      out[12] = 2*near/(top-bottom);
      out[13] = 0;
      out[14] = 0;

      out[15] = (-(right+left))/(right-left);
      out[16] = (-(front+back))/(front-back);
      out[17] = (-(top+bottom))/(top-bottom);
      out[18] = (-(near+far))/(far-near);
      out[19] = 1;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 2*far*near/(far-near);
      out[24] = 0;
    }

    function inferiorProjection(out1, ou2, a) {
      out1[0] = a[0];
      out1[1] = a[1];
      out1[2] = a[2];
      out1[3] = a[3];
      out2[0] = a[4];

      out1[4] = a[5];
      out1[5] = a[6];
      out1[6] = a[7];
      out1[7] = a[8];
      out2[4] = a[9];

      out1[8] = a[10];
      out1[9] = a[11];
      out1[10] = a[12];
      out1[11] = a[13];
      out2[8] = a[14];

      out1[12] = a[15];
      out1[13] = a[16];
      out1[14] = a[17];
      out1[15] = a[18];
      out2[12] = a[19];

      out2[1] = a[20];
      out2[5] = a[21];
      out2[9] = a[22];
      out2[13] = a[23];

      out2[2] = a[24];
    }

    return {
      create: create,
      createIdentity: createIdentity,
      identity: identity,

      multiply: multiply,
      mul: multiply,

      translate: translate,
      scale: scale,
      rotationVecs: rotationVecs,

      projectionLen: projectionLen,
      projection: projection
    }
  })();

  this.NEngine = (function() {

    var math, Obj, renderer, geometry;

    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;

    math = (function() {
      //front-vector : va
      //rotation-vector: vb
      //all ortogonal

      function rotateNormalized(va, vb, theta) {
        var tmp = vec4.clone(va);

        vec4.scaleAndAdd(va, va, Math.cos(theta)-1);
        vec4.scaleAndAdd(va, vb, Math.sin(theta));

        vec4.scaleAndAdd(vb, vb, Math.cos(theta)-1);
        vec4.scaleAndAdd(vb, tmp, -Math.sin(theta));
      }

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
        rotateNormalized: rotateNormalized,
        ortogonalize: ortogonalize,
        projection: projection,
        repair: repair,
        rotationMat: rotationMat,
        projectionData: projectionData
      };
    })();

    Obj = (function(){

      function Obj(p, rx, ry, rz, rw) {
        //position vectors
        this.p = (p)?p:new vec4.create();
        //derivative
        this.dp = new vec4.create();

        //rotation vectors
        this.rx = new vec4.create();
        this.ry = new vec4.create();
        this.rz = new vec4.create();
        this.rw = new vec4.create();
        this.rx[0] = 1.0;
        this.ry[1] = 1.0;
        this.rz[2] = 1.0;
        this.rw[3] = 1.0;
        //derivative
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
        this
      };

      return Obj;
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

              positions[ i_dir ] =  i_x*step_length_x;
              positions[i_dir+1] =  i_y*step_length_y;
              positions[i_dir+2] =  i_z*step_length_z;
              positions[i_dir+3] =  i_w*step_length_w;
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
          i_w, i_z, i_y, i_x, i_dir;

        //fill vertex position data
        for(i_w = w; i_w--;)
          for(i_z = z; i_z--;)
            for(i_y = y; i_y--;)
              for(i_x = x; i_x--;) {
                i_dir = i_w*step_w + i_z*step_z + i_y*step_y + i_x*step_x;

                positions[ i_dir ] =  i_x*step_length_x;
                positions[i_dir+1] =  i_y*step_length_y;
                positions[i_dir+2] =  i_z*step_length_z;
                positions[i_dir+3] =  i_w*step_length_w;

                color[i_dir] = 127;
                color[i_dir+1] = 127;
                color[i_dir+2] = 127;
                color[i_dir+3] = 255;
              }

        //create indices
        if(!options.linestrip) {
          indices = new GLMAT_ARRAY_TYPE(2*(
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

            var step_x = 2, //svs transformators
              step_y = y*step_x,
              step_z = z*step_y,
              step_w = w*step_z;

            for(i_w = w; i_w--;)
              for(i_z = z; i_z--;)
                for(i_y = y; i_y--;)
                  for(i_x = x-1; i_x--;) {

                    i_dir = offset + i_w*step_w + i_z*step_z + i_y*step_y + i_x*step_x;
                    i_dir2 =  i_w*axis_a_step + i_z*axis_b_step + i_y*axis_c_step + i_x*axis_d_step;

                    indices[i_dir] = i_dir2;
                    indices[i_dir+1] = i_dir2 + axis_d_step;
                  }
          }

          //fill with data
          //think of it like a svs (lines svs) maped
          //throught 4 transformation onto the same svs (points svs)
          //and the steps are the matrix transform from R4 to R1
          createLinesOnAxis(0, step_w, step_z, step_y, step_x);
          createLinesOnAxis( 2*w*z*y*(x-1), step_w, step_z, step_x, step_y);

          createLinesOnAxis( 2*w*z(y*(x-1) + (y-1)*x), step_w, step_y, step_x, step_z);

          createLinesOnAxis( 2*w(z*(y*(x-1) + (y-1)*x) + (z-1)*y*x),
            step_z, step_y, step_x, step_w);
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
            position: {numComponents: 4, data: position},
            indices: {numComponents: 4, data: indices},
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
        context = null,
        canvas = null,
        shader_info = null,
        uniforms,

        PMVMatrix = mat5.create(),
        PMatrix = mat5.create(),

        uPMVMatrix1 = mat4.create(),
        uPMVMatrix2 = mat4.create(),

        matrix_tmp = mat5.create(),
        m_cameraRotation = mat5.create(),
        m_objectRotation = mat5.create(),
        v_totalTraslation = vec4.create(),

        obj_list_i,
        obj_list_obj,
        camera = new Obj();

      function init(options) {
        //create context
        context = twgl.getWebGLContext(options.container);

        //create shader program
        shader_info = twgl.createProgramInfo(gl, ["vs", "fs"]);
        program.useProgram(shader_info.program);

        //fill uniform pointers
        uniforms.uPMVMatrix1 = uPMVMatrix1;
        uniforms.uPMVMatrix2 = uPMVMatrix2;

        //adjust canvas size
        canvas = context.canvas;
        twgl.resizeCanvasToDisplaySize( canvas );
        context.viewport(0,0, canvas.width, canvas.height);

        //create projection matrix
        var projection_angle =
          (options.projection_angle)? options.projection_angle: Math.PI/2;

        if(options.projection_automatic)
          mat5.projectionLen(PMatrix,
            projection_angle,
            (canvas.height/canvas.width)* projection_angle,
            projection_angle, 1, 150);
      }

      function render() {

        if(obj_list.length) {
          //get camera rotation matrix
          mat5.rotationVecs(m_cameraRotation,
            camera.x,
            camera.y,
            camera.z,
            camera.w
          );

          for(obj_list_i=obj_list.length; obj_list_i--;) {
            obj_list_obj = obj_list[obj_list_i]

            //get obj rotation matrix
            mat5.rotationVecs(m_objectRotation,
              obj_list_obj.x,
              obj_list_obj.y,
              obj_list_obj.z,
              obj_list_obj.w
            );
            mat5.multiply(matrix_tmp,m_cameraRotation, m_objectRotation); //multiply

            vec4.add(v_totalTraslation, obj_list_obj.p, camera.p);  //get total translation

            //translate rotated matrix, and transpose to optimize usage
            mat5.translate(matrix_tmp, v_totalTraslation);
            mat5.multiply(PMVMatrix, PMatrix, matrix_tmp);
            mat5.trasposeSelf(PMVMatrix);

            mat5.inferiorProjection(uPMVMatrix1, uPMVMatrix2, PMVMatrix);

            context.useProgram(shader_info.program);
            twgl.setBuffersAndAttributes(program, shader_info, obj.geom.buffers_info);
            twgl.setUniforms(shader_info, uniforms);

            twgl.drawBufferInfo(context, context.LINES, obj.geom.buffers_info);
          }
        }
      }

      function objAdd(obj) {
        if(obj.geom.buffers_info === null)
          obj.geom.buffers_info = twgl.createBufferInfoFromArrays(program, obj.geom.buffers );
        obj_list.push(obj);
      }

      function objRm(obj) {
        if(obj_list[obj_list.length-1] === obj) { obj_list.pop(); return; }
        obj_list[ obj_list.indexOf(obj) ] = obj_list.pop();
      }

      return {
        objAdd: objAdd,
        objRm: objRm,
        init: init,
        render: render,
        obj_list: obj_list
      };
    })();

    return {
      Obj: Obj,
      geometry: geometry,
      math: math,
      renderer: renderer
    };
  })();
})();
}
catch(e) {

}
/*
//math-compiler:
//matrix multiplication
var str='', operands=[], length=5;
for(i_y = length; i_y--;)
for(i_x = length; i_x--;){
str += 'out['+((i_y*length)+i_x)+'] = ';
operands=[];
for(i_z = length; i_z--;)
 operands.push('a['+(i_z*length+i_x)+']*b['+(i_y*length+i_z)+']');
str += operands.join(' + ');
str += ';\n'
}

//traspose optimizado, sin out
var str='', length=5, i_x=length, i_y=length, tmp, compress=false, continuar=true,
  last_i = Math.floor(length/2)*5+Math.floor(length);
for(;i_x--;)
for(i_y=length;i_y--;) {
  if( i_x >= i_y ) continue;
str += 'tmp'+((compress)?'':' ')+'='+((compress)?'':' ')+
  'a['+(i_x*length+i_y)+']'+((compress)?'':'\n');
str += 'a['+(i_x*length+i_y)+']'+((compress)?'':' ')+'='+((compress)?'':' ')+
  'a['+(i_x+i_y*length)+'];'+((compress)?'':'\n');
str += 'a['+(i_x+i_y*length)+']'+((compress)?'':' ')+'='+((compress)?'':' ')+
  'tmp'+((compress)?'':'\n');
}

//traspose con out
var str='', length=5, i_x=length, i_y=length, compress=true;

for(;i_x--;)
for(i_y=length;i_y--;)
str += 'out['+(i_x*length+i_y)+']=a['+(i_x+i_y*length)+'];'+((compress)?'':'\n');
*/
