
try {
if(glMatrix)
(function() {
  /**
  * For optimization puposes, all functions will do in-place operations over
  * out vector parameter (unless the end in 'I'), or out matrix parameter, this way, you will
  * have to use temporary matrixes for some cases, likes for example, matrix multiplication. <br/>
  *
  * @module NMath
  */
  var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array,
    GLINDEX_ARRAY_TYPE = (typeof Uint16Array !== 'undefined') ? Uint16Array : Array,
    GLCOLOR_ARRAY_TYPE = (typeof Uint8Array !== 'undefined') ? Uint8Array : Array,
    global = this;

  mat4.rotationVecs = function(m, rx, ry, rz) {
    m[0] = rx[0];
    m[1] = rx[1];
    m[2] = rx[2];
    m[3] = 0;

    m[4] = ry[0];
    m[5] = ry[1];
    m[6] = ry[2];
    m[7] = 0;

    m[8] = rz[0];
    m[9] = rz[1];
    m[10] = rz[2];
    m[11] = 0;

    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  }

  vec3.rotateNormalizedRelative = function(obj, va, vb, theta) {
    var mat = NMath.mat,
      mat4 = NMath.mat4,
      vec = NMath.vec,
      vec4 = NMath.vec4,
      m_data_pre = mat4.create();
      m_data = mat4.create();
      m_rotation = mat4.create(),
      m_tmp = mat4.create(),
      vecs = null;

    mat.fromVecs(m_data, [obj.rx, obj.ry, obj.rz]);
    m_data[15] = 1.0;

    if(va === obj.rz && vb === obj.ry)
      mat4.rotateZY( m_rotation, theta);
    else if(va === obj.rz && vb === obj.rx)
      mat4.rotateZX( m_rotation, theta);
    else
      return;

    mat4.multiply(m_tmp, m_rotation, m_data);
    mat.createFrom(m_data_pre, m_tmp);

    vecs = mat.vecs(m_data_pre);
    obj.rx = vecs[0];
    obj.ry = vecs[1];
    obj.rz = vecs[2];
  }
  mat4.rotateZX = function(out, theta) {
  var v_z = vec4.create(),
    v_x = vec4.create();

    v_z[2] = 1.0;
    v_x[0] = 1.0;

    vec4.rotateNormalized(v_x, v_z, theta);
    mat4.identity(out);
    out[0] = v_x[0];
    out[1] = v_x[1];
    out[2] = v_x[2];

    out[8] = v_z[0];
    out[9] = v_z[1];
    out[10] = v_z[2];
  }

  mat4.rotateZY = function(out, theta) {
  var v_z = vec4.create(),
    v_x = vec4.create();

    v_z[2] = 1.0;
    v_x[1] = 1.0;

    vec4.rotateNormalized(v_x, v_z, theta);
    mat4.identity(out);
    out[4] = v_x[0];
    out[5] = v_x[1];
    out[6] = v_x[2];

    out[8] = v_z[0];
    out[9] = v_z[1];
    out[10] = v_z[2];
  }

  mat4.rotateYX = function(out, theta) {
  var v_y = vec4.create(),
    v_x = vec4.create();

    v_y[1] = 1.0;
    v_x[0] = 1.0;

    vec4.rotateNormalized(v_x, v_y, theta);
    mat4.identity(out);
    out[0] = v_x[0];
    out[1] = v_x[1];
    out[2] = v_x[2];

    out[4] = v_y[0];
    out[5] = v_y[1];
    out[6] = v_y[2];
  }
  mat4.fillVecs = function(out, x,y,z,w) {
    out[0] = x[0];
    out[1] = x[1];
    out[2] = x[2];
    out[3] = x[3];

    out[4] = y[0];
    out[5] = y[1];
    out[6] = y[2];
    out[7] = y[3];

    out[8] = z[0];
    out[9] = z[1];
    out[10] = z[2];
    out[11] = z[3];

    out[12] = w[0];
    out[13] = w[1];
    out[14] = w[2];
    out[15] = w[3];
  }
  vec4.rotateNormalizedRelative = function(obj, va, vb, theta) {
    var mat = NMath.mat,
      mat5 = NMath.mat5,
      vec = NMath.vec,
      vec5 = NMath.vec5,
      m_data_pre = mat4.create(),
      m_data = mat5.create();
      m_rotation = mat5.create(),
      m_tmp = mat5.create(),
      vecs = null;

    mat.fromVecs(m_data_pre, [obj.rx, obj.ry, obj.rz, obj.rw]);
    mat.createFrom(m_data, m_data_pre);
    m_data[24] = 1.0;

    if( va === obj.rw && vb === obj.rz)
      mat5.rotateWZ( m_rotation, theta );
    else if(vb === obj.ry && va === obj.rw)
      mat5.rotateWY( m_rotation, theta );
    else if(vb === obj.rx && va === obj.rw)
      mat5.rotateWX( m_rotation, theta );

    else if(va === obj.rz && vb === obj.ry)
      mat5.rotateZY( m_rotation, theta);
    else if(va === obj.rz && vb === obj.rx)
      mat5.rotateZX( m_rotation, theta);
    else
      return;

    mat5.multiply(m_tmp, m_rotation, m_data);
    mat.createFrom(m_data_pre, m_tmp);

    vecs = mat.vecs(m_data_pre);
    obj.rx = vecs[0];
    obj.ry = vecs[1];
    obj.rz = vecs[2];
    obj.rw = vecs[3];
  }

  vec4.rotateNormalized = function(va, vb, theta) {
    var tmp = vec4.clone(va),
      x = Math.cos(theta)-1,
      y = Math.sin(theta);

    va[0] += va[0]*x - vb[0]*y;
    va[1] += va[1]*x - vb[1]*y;
    va[2] += va[2]*x - vb[2]*y;
    va[3] += va[3]*x - vb[3]*y;

    vb[0] += vb[0]*x + tmp[0]*y;
    vb[1] += vb[1]*x + tmp[1]*y;
    vb[2] += vb[2]*x + tmp[2]*y;
    vb[3] += vb[3]*x + tmp[3]*y;
  };
  vec4.projection = function(out, va, vb) {/*
    var relation =
      (va[0])/
      Math.sqrt(
        va[0]*va[0] +
        va[1]*va[1] +
        va[2]*va[2] +
        va[3]*va[3] +
      ),*/
  }

  mat4.multiplyVec = function(out, m, v) {
    out[3] = m[15]*v[3] + m[11]*v[2] + m[7]*v[1] + m[3]*v[0];
    out[2] = m[14]*v[3] + m[10]*v[2] + m[6]*v[1] + m[2]*v[0];
    out[1] = m[13]*v[3] + m[9]*v[2] + m[5]*v[1] + m[1]*v[0];
    out[0] = m[12]*v[3] + m[8]*v[2] + m[4]*v[1] + m[0]*v[0];
  };

  mat4.projectionLen = function(out, alfa, beta, near, far) {
    var x = near*Math.tan(alfa/2),
      y = near*Math.tan(beta/2);
    mat4.projection(out, -x, x, -y, y, near, far);
  };

  mat4.projection = function(out, left, right, back, front, near, far) {
    out[0] = 2*near/(right-left);
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = 2*near/(front-back);
    out[6] = 0;
    out[7] = 0;

    out[8] = (-(right+left))/(right-left);
    out[9] = (-(front+back))/(front-back);
    //out[18] = (near+far)/(far-near);  //the unlinear approach
    out[10] = 2/(far-near);
    out[11] = 1;

    out[12] = 0;
    out[13] = 0;
    //out[23] = -2*far*near/(far-near); //the unlinear approach
    out[14] = -(far+near)/(far-near);
    out[15] = 0;
  };

  mat4.ortogonalLen = function(out, length, aspect_x, aspect_y, position) {
    var x = length*aspect_x/2,
      y = length*aspect_y/2,
      z = length/2;

    mat4.ortogonal(out, -x, x, -y, y, -z, z);
  }

  mat4.ortogonal = function(out, left, right, bottom, top, near, far) {
    out[0] = 2/(right-left);
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = 2/(top-bottom);
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = 2/(far-near);
    out[11] = 0;

    out[12] = -(right+left)/((right-left));
    out[13] = -(top+bottom)/(top-bottom);
    out[14] = -(far+near)/(far-near);
    out[15] = 1;
  }

  global.NMath = (function() {

    var mat = null, mat5 = null,
      vec = null, vec5 = null,
      compile = null;
    /**
    * Common matrix functions
    * @module mat
    * @memberof NMath
    */
    mat = (function() {
      /**
      * Will create a well formated string representing the matrix, ideal for console output
      * @function str
      * @memberof mat
      */
      function str(m, l) {
        var str = '\n',
          l = (!l)? Math.floor(Math.sqrt(m.length+1)+0.05) : l,
          x,y,
          number_width = 1,
          width;
        for(x=l*l; x--;) {
          width = String(m[x]).length;
          if(width > number_width)
            number_width = width;
        }

        for(y=-1; ++y < l; ) {
          for(x=-1; ++x < l; ) {
            width = String(m[(x*l) + y]).length;
            str += m[(x*l) + y] + Array(number_width-width+2).join(' ');
          }
          str += '\n';
        }
        return str;
      }

      function size(m) {
        return Math.floor(Math.sqrt(m.length)+0.5);
      }

      function createFrom(out, input) {
        var out_size = size(out),
          in_size = size(input),
          x=null, y=null;

        for(x=out_size; x--;)
          for(y=out_size; y--;)
            if(x < in_size && y < in_size )
              out[ x*out_size + y ] = input[ x*in_size + y ];
            else
              out[ x*out_size + y ] = 0;

        return out;
      }

      function fromVecs(out, vecs) {
        var out_size = size(out),
          x = 0,
          y = 0;
        for(x = out_size; x--;)
          for(y = out_size; y--;)
            if( x < vecs.length && y < vecs[0].length )
              out[x*out_size + y] =
              vecs[x][y];
      }

      function vecs(m) {
        var m_size = size(m),
          x=null,
          y=null,
          vecs = Array(m_size);
        for(x = m_size; x--;) {
          vecs[x] = global['vec'+m_size].create();
          for(y = m_size; y--;)
            vecs[x][y] = m[x*m_size + y];
        }

        return vecs;
      }

      return {
        str: str,
        size: size,
        createFrom: createFrom,
        fromVecs: fromVecs,
        vecs: vecs
      };

    })();

    /**
    * NSquare matrix lib
    * @class matN
    * @memberof NMath
    */
    mat5 = (function() {

      /**
      * sets out to identity
      * @function identity
      * @memberof matN
      */
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


      function rotateWZ(out, theta) {
        var v_w = vec4.create(),
          v_z = vec4.create();

        v_w[3] = 1.0;
        v_z[2] = 1.0;

        vec4.rotateNormalized(v_z, v_w, theta);
        mat5.identity(out);
        out[10] = v_z[0];
        out[11] = v_z[1];
        out[12] = v_z[2];
        out[13] = v_z[3];

        out[15] = v_w[0];
        out[16] = v_w[1];
        out[17] = v_w[2];
        out[18] = v_w[3];
      }

      function rotateWY(out, theta) {
        var v_w = vec4.create(),
          v_y = vec4.create();

        v_w[3] = 1.0;
        v_y[1] = 1.0;

        vec4.rotateNormalized(v_y, v_w, theta);
        mat5.identity(out);
        out[5] = v_y[0];
        out[6] = v_y[1];
        out[7] = v_y[2];
        out[8] = v_y[3];

        out[15] = v_w[0];
        out[16] = v_w[1];
        out[17] = v_w[2];
        out[18] = v_w[3];
      }

      function rotateWX(out, theta) {
        var v_w = vec4.create(),
          v_x = vec4.create();

        v_w[3] = 1.0;
        v_x[0] = 1.0;

        vec4.rotateNormalized(v_x, v_w, theta);
        mat5.identity(out);
        out[0] = v_x[0];
        out[1] = v_x[1];
        out[2] = v_x[2];
        out[3] = v_x[3];

        out[15] = v_w[0];
        out[16] = v_w[1];
        out[17] = v_w[2];
        out[18] = v_w[3];
      }

      function rotateZY(out, theta) {
        var v_z = vec4.create(),
          v_y = vec4.create();

        v_z[2] = 1.0;
        v_y[1] = 1.0;

        vec4.rotateNormalized(v_y, v_z, theta);
        mat5.identity(out);
        out[5] = v_y[0];
        out[6] = v_y[1];
        out[7] = v_y[2];
        out[8] = v_y[3];

        out[10] = v_z[0];
        out[11] = v_z[1];
        out[12] = v_z[2];
        out[13] = v_z[3];
      }

      function rotateZX(out, theta) {
        var v_z = vec4.create(),
          v_x = vec4.create();

        v_z[2] = 1.0;
        v_x[0] = 1.0;

        vec4.rotateNormalized(v_x, v_z, theta);
        mat5.identity(out);
        out[0] = v_x[0];
        out[1] = v_x[1];
        out[2] = v_x[2];
        out[3] = v_x[3];

        out[10] = v_z[0];
        out[11] = v_z[1];
        out[12] = v_z[2];
        out[13] = v_z[3];
      }
      /**
      * copy a into out
      * @function copy
      * @memberof matN
      */
      function copy(out, m) {
        out[24]=m[24]
        out[23]=m[23]
        out[22]=m[22]
        out[21]=m[21]
        out[20]=m[20]
        out[19]=m[19]
        out[18]=m[18]
        out[17]=m[17]
        out[16]=m[16]
        out[15]=m[15]
        out[14]=m[14]
        out[13]=m[13]
        out[12]=m[12]
        out[11]=m[11]
        out[10]=m[10]
        out[9]=m[9]
        out[8]=m[8]
        out[7]=m[7]
        out[6]=m[6]
        out[5]=m[5]
        out[4]=m[4]
        out[3]=m[3]
        out[2]=m[2]
        out[1]=m[1]
        out[0]=m[0]
      }

      /**
      * creates a zero matrix
      * @function create
      * @memberof matN
      */
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

      /**
      * creates an identity matrix
      * @function createIdentity
      * @memberof matN
      */
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

      /**
      * out = a*b
      * @function multiply
      * @memberof matN
      */
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

      /**
      * applies : out = m*v
      * @function multiplyVec
      * @memberof matN
      */
      function multiplyVec(out, m, v) {
        out[4] = m[24]*v[4] + m[19]*v[3] + m[14]*v[2] + m[9]*v[1] + m[4]*v[0];
        out[3] = m[23]*v[4] + m[18]*v[3] + m[13]*v[2] + m[8]*v[1] + m[3]*v[0];
        out[2] = m[22]*v[4] + m[17]*v[3] + m[12]*v[2] + m[7]*v[1] + m[2]*v[0];
        out[1] = m[21]*v[4] + m[16]*v[3] + m[11]*v[2] + m[6]*v[1] + m[1]*v[0];
        out[0] = m[20]*v[4] + m[15]*v[3] + m[10]*v[2] + m[5]*v[1] + m[0]*v[0];
      }

      /**
      * out = a^T
      * @function traspose
      * @memberof matN
      */
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

      /**
      * a = a^T
      * @function trasposeI
      * @memberof matN
      */
      function trasposeI(a) {
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
      * Will apply a translation transform to m <br/> <br/>
      * m = taslation(p)*m
      * @function translate
      * @memberof matN
      */
      function translate(m, p) {
        m[20] += m[20]+p[0];
        m[21] += m[21]+p[1];
        m[22] += m[22]+p[2];
        m[23] += m[23]+p[3];
      }

      /**
      * Will apply a scaling transform to m and put it into out <br/> <br/>
      * out = scale(v)*m
      * @function scale
      * @memberof matN
      */
      function scale(out, m, v) {
        out[0] = m[0]*v[0];
        out[1] = m[1]*v[0];
        out[2] = m[2]*v[0];
        out[3] = m[3]*v[0];

        out[5] = m[5]*v[1];
        out[6] = m[6]*v[1];
        out[7] = m[7]*v[1];
        out[8] = m[8]*v[1];

        out[10] = m[10]*v[2];
        out[11] = m[11]*v[2];
        out[12] = m[12]*v[2];
        out[13] = m[13]*v[2];

        out[15] = m[15]*v[3];
        out[16] = m[16]*v[3];
        out[17] = m[17]*v[3];
        out[18] = m[18]*v[3];
      }

      /**
      * will generate a transformation using given vectors, ideal for rotations using
      * unitary perpendicular vectors <br/> <br/>
      * out = [vx,0], [vy,0], [vn,0], [0, .., 1]
      * @function rotationVecs
      * @memberof matN
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

      /**
      * Generates a proyection matrix from angles, one for each perpendicular
      * to viewer axis
      * @function projectionLen
      * @memberof matN
      */
      function projectionLen(out, alfa, beta, gamma, near, far) {
        var x = near*Math.tan(alfa/2),
          y = near*Math.tan(beta/2),
          z = near*Math.tan(gamma/2);
        projection(out, -x, x, -y, y, -z, z, near, far);
      }

      /**
      * Generates a projection matrix from viewing fustrum coordinates
      * @function projection
      * @memberof matN
      */
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
        //console.log(near, front, back, out[6]);
        out[10] = 0;
        out[11] = 0;
        out[12] = 2*near/(top-bottom);
        out[13] = 0;
        out[14] = 0;

        out[15] = (-(right+left))/(right-left);
        out[16] = (-(front+back))/(front-back);
        out[17] = (-(top+bottom))/(top-bottom);
        //out[18] = (near+far)/(far-near);  //the unlinear approach
        out[18] = 2/(far-near);
        out[19] = 1;

        out[20] = 0;
        out[21] = 0;
        out[22] = 0;
        //out[23] = -2*far*near/(far-near); //the unlinear approach
        out[23] = -(far+near)/(far-near);
        out[24] = 0;
      }

      /**
      * Cuts a matrix into mat4 matrices, ideal to send them into the graphics card.
      * @function inferiorProjection
      * @memberof matN
      */
      function inferiorProjection(out1, out2, a) {
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

        //vertical line
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
        multiplyVec: multiplyVec,
        inferiorProjection: inferiorProjection,
        traspose: traspose,
        trasposeI: trasposeI,
        copy: copy,

        translate: translate,
        scale: scale,
        rotateWX: rotateWX,
        rotateWY: rotateWY,
        rotateWZ: rotateWZ,
        rotateZY: rotateZY,
        rotateZX: rotateZX,
        rotationVecs: rotationVecs,

        projectionLen: projectionLen,
        projection: projection
      }
    })();

    vec = (function() {
      function create(length) {
        var v = new GLMAT_ARRAY_TYPE(length),
          i=length;
        for(;i--;)
          v[i] = 0;
        return v;
      }

      function createFrom(length, from, offset, from_length) {
        var v = new GLMAT_ARRAY_TYPE(length),
          i = 0,
          offset = (offset)? offset:0,
          from_length = (from_length)? from_length : from.length-offset;

        for(i=length; i--;)
          if(i < from_length)
            v[i] = from[i+offset];
          else
            v[i] = 0;

        return v;
      }

      function str(v, length) {
        var i,
          width_max=(length)?length:0,
          width=0,
          str = '';

        if(!length)
          for(i = v.length; i--;)
            if( (width = (''+v[i]).length) > width_max )
              width_max = width;

        for(i = 0; i < v.length; i++) {
          width = (''+v[i]).substr(0,width_max);
          str += ((v[i] >= 0)?' ':'') + width +
            Array(1+width_max-width.length).join(' ') +
            ((v[i]<0)? ' ':'') + ' , ';
        }

        return str;
      }
      return {
        create: create,
        createFrom: createFrom,
        str: str
      };
    })();

    /**
    * @class vecN
    * @memberof NMath
    */
    vec5 = (function() {

      /**
      * Creates a zero vector, with n-coordinates
      * @function create
      * @memberof vecN
      */
      function create() {
        var v = new GLMAT_ARRAY_TYPE(5);
        v[0] = 0;
        v[1] = 0;
        v[2] = 0;
        v[3] = 0;
        v[4] = 0;
        return v;
      }
      /**
      * Creates and copies vector, returns new one
      * @function clone
      * @memberof vecN
      */
      function clone(a) {
        var v = new GLMAT_ARRAY_TYPE(5);
        v[0] = a[0];
        v[1] = a[1];
        v[2] = a[2];
        v[3] = a[3];
        v[4] = a[4];
      }

      /**
      * Scales v by a
      * @function scale
      * @memberof vecN
      */
      function scale(out, v, a) {
        out[0] = v[0]*a;
        out[1] = v[1]*a;
        out[2] = v[2]*a;
        out[3] = v[3]*a;
        out[4] = v[4]*a;
      }
      function scaleI(v, a) {
        v[0] *= a;
        v[1] *= a;
        v[2] *= a;
        v[3] *= a;
        v[4] *= a;
      }
      function identity(out) {
        out[0] = 1;
        out[0] = 0;
        out[0] = 0;
        out[0] = 0;

        out[0] = 0;
        out[0] = 0;
        out[0] = 0;
        out[0] = 0;

        out[0] = 0;
        out[0] = 0;
        out[0] = 0;
        out[0] = 0;

        out[0] = 0;
        out[0] = 0;
        out[0] = 0;
        out[0] = 0;
        out[0] = 0;

      }
      return {
        create: create,
        clone: clone,
        scale: scale,
        scaleI: scaleI
      };
    })();

    compile = function compile(dimension) {

    }

    return {
      mat : mat,
      vec: vec,
      mat5: mat5,
      mat4: mat4,
      vec5: vec5,
      vec4: vec4,
      vec3: vec3,
      compile: compile,
      GLMAT_ARRAY_TYPE: GLMAT_ARRAY_TYPE,
      GLCOLOR_ARRAY_TYPE: GLCOLOR_ARRAY_TYPE,
      GLINDEX_ARRAY_TYPE: GLINDEX_ARRAY_TYPE
    };
  })();
})();
}
catch(e) {
  console.log('You dont have a NMath requeriment, NMath not loaded');
  console.log(e);
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

//copy
for(var i=25, str=''; i--;) str+='out['+i+']=m['+i+']\n'
*/
