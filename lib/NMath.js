
try{
if(true) {  //requeriments
try{
(function() {
  /**
  * For optimization puposes, all functions will do in-place operations over
  * out vector parameter (unless the end in 'I'), or out matrix parameter, this way, you will
  * have to use temporary matrixes for some cases, likes for example, matrix multiplication. <br/>
  *
  * @module NMath
  * StudioClick
  //recluse, bachelor. oath
  //6202
  */
  var ARRAY_TYPE = Float32Array || Array,
    ARRAY_TYPE_STR = 'Float32Array' || 'Array',
    GLINDEX_ARRAY_TYPE =  Uint16Array || Array,
    GLCOLOR_UI8_ARRAY_TYPE = Uint8Array || Array,
    GLCOLOR_F32_ARRAY_TYPE = Float32Array || Array,
    GLCOLOR_ARRAY_TYPE = GLCOLOR_F32_ARRAY_TYPE,
    global = this;



  global.NMath = (function() {

    var mat,mat4,mat5,
      vec,vec3,vec4,vec5,
      common,
      code,
      generatos;


    mat4 = (function() {

        function rotationPlane(out, v1, v2, theta, print) {
          var tmp_v1 = new vec4.create();

          vec4.rotateOnPlane(tmp_v1, [1,0,0,0], v1, v2, theta, print);
          NMath.common.copy(out, tmp_v1, 0, 4);

          vec4.rotateOnPlane(tmp_v1, [0,1,0,0], v1, v2, theta, print);
          NMath.common.copy(out, tmp_v1, 4, 4);

          vec4.rotateOnPlane(tmp_v1, [0,0,1,0], v1, v2, theta, print);
          NMath.common.copy(out, tmp_v1, 8, 4);

          vec4.rotateOnPlane(tmp_v1, [0,0,0,1], v1, v2, theta, print);
          NMath.common.copy(out, tmp_v1, 12, 4);
        };
      //camera projection matrices

        function projectionLen(out, alfa, beta, near, far) {
          var x = near*Math.tan(alfa/2),
            y = near*Math.tan(beta/2);
            console.log('here')
          mat4.projection(out, -x, x, -y, y, near, far);
        };

        function projection(out, left, right, back, front, near, far) {
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

        function ortogonalLen(out, length, aspect_x, aspect_y, position) {
          var x = length*aspect_x/2,
            y = length*aspect_y/2,
            z = length/2;

          mat4.ortogonal(out, -x, x, -y, y, -z, z);
        }

        function ortogonal(out, left, right, bottom, top, near, far) {
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

        return {
          rotationPlane: rotationPlane,
          projection: projection,
          ortogonal: ortogonal,
          projectionLen: projectionLen,
          ortogonalLen: ortogonalLen,
        }
    })()

    /**
    * NSquare matrix lib
    * @class matN
    * @memberof NMath
    */
    mat5 = (function() {
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
        inferiorProjection: inferiorProjection,
        projectionLen: projectionLen,
        projection: projection
      }
    })();
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

      function fromVecs(out, vecs) {
        var size_o = size(out),
          size_v_x = vecs.length, size_v_y,
          x, y;

        for(x = size_o; x--;)
          for(y = size_o, size_v_y = (vecs[x])? vecs[x].length:0; y--;) {
            if( x < size_v_x && y < size_v_y )
              out[x*size_o + y] = vecs[x][y];
            else
              out[x*size_o + y] = 0.0;
            }
      }

      function from(out, m, fill) {
        var size_o = mat.size(out),
          size_m = mat.size(m),
          x, y;

        for(x=size_o;x--;)
          for(y=size_o;y--;)
            if(x < size_m && y < size_m)
              out[x*size_o+y] = m[x*size_m+y];
            else if(fill)
              out[x*size_o+y] = 0.0;
      }

      function vecs(m) {
        var m_size = size(m),
          x=null,
          y=null,
          vecs = Array(m_size);
        for(x = m_size; x--;) {
          vecs[x] = NMath['vec'+m_size].create();
          for(y = m_size; y--;)
            vecs[x][y] = m[x*m_size + y];
        }

        return vecs;
      }

      function invert(o,m) {
        var dim=size(m), c,
          //i: normal diagonal, j: row traversing, k:vertical traversing
          i,j,k, d, //d: current data
          mat=NMath['mat'+dim];

        mat.identity(o);
        c = mat.create();
        mat.copy(c,m);

        for(i=0;i<dim;i++){  //for each diagonal
          d=c[i*dim + i];

          if(d===0) {//if null, find no-null row and switch
            for(k=i+1;k<dim;k++)  if(c[i*dim + k] !== 0)
              for(j=0;j<dim;j++) {
                d=c[j*dim + i];
                c[j*dim + i] = c[j*dim + k];
                c[j*dim + k] = d;

                d=o[j*dim + i];
                o[j*dim + i] = o[j*dim + k];
                o[j*dim + k] = d;
              }

            d=c[i*dim + i];
          }

          for(j=0;j<dim;j++){  //cancelar fila actual
            c[j*dim+i] /= d;
            o[j*dim+i] /= d;
          }

          for(k=0;k<dim;k++){ //eliminar filas restantes
            if(k===i) continue;
            d=c[i*dim+k]; //multiplicador
            if(d===0) continue;

            for(j=0;j<dim;j++) {
              c[j*dim+k] -= c[j*dim+i]*d;
              o[j*dim+k] -= o[j*dim+i]*d;
            }
          }
        }
      }

      return {
        str: str,
        size: size,
        fromVecs: fromVecs,
        from: from,
        vecs: vecs,
        invert: invert,
      };

    })();

    vec3 = (function() {

      function rotateNormalizedRelative(obj, va, vb, theta) {
        var mat = NMath.mat,
          mat4 = NMath.mat4,
          vec = NMath.vec,
          vec4 = NMath.vec4,
          m_data_pre = mat4.create(),
          m_data = mat4.create(),
          m_rotation = mat4.createIdentity(),
          m_tmp = mat4.create(),
          vecs = null;

        mat.fromVecs(m_data, [obj.rx, obj.ry, obj.rz]);
        m_data[15] = 1.0;

        if(va === obj.rz && vb === obj.ry)
          NMath.mat4.rotateAxis(m_rotation, 2,1, theta)
        else if(va === obj.rz && vb === obj.rx)
          NMath.mat4.rotateAxis(m_rotation, 2,0, theta)
        else
          return;

        mat4.multiply(m_tmp, m_rotation, m_data);
        mat.from(m_data_pre, m_tmp);

        vecs = mat.vecs(m_data_pre);
        obj.rx = vecs[0];
        obj.ry = vecs[1];
        obj.rz = vecs[2];
      }

      return {
        rotateNormalizedRelative: rotateNormalizedRelative
      }
    })();

    vec4 = (function() {
      /*
      var a = new mat4.create();
      var v1 = [1,1,0,0], v2 = [0,0,1,0];
      vec4.plane(v1,v2);
      mat4.rotationPlane(a, v1, v2, Math.PI/4); console.log(NMath.mat.str(a))
      */
      //rota la projeccion del vector sobre el plano, con sentido desde v1 hacia v2
      function rotateOnPlane(out, v, v1, v2, theta) {
        var v_perpendicular = new vec4.create(),
          tmp_v1 = new vec4.create(),
          tmp_v2 = new vec4.create(),
          v1_close, v2_close, rotated = false,
          v1p, v2p;


        //obtener componente perpendicular (v_perpendicular)
        //console.log('entrada',v);
        vec4.projection(tmp_v1, v, v1);
        //console.log('projeccion en v1',tmp_v1);
        vec4.sub(tmp_v1, v, tmp_v1);
        vec4.projection(tmp_v2, tmp_v1, v2);
        //console.log('projeccion en v2',tmp_v2);
        vec4.sub(v_perpendicular, tmp_v1, tmp_v2);
        //console.log('perpendicular',v_perpendicular);

        //tmp_v1 is vector projection
        vec4.sub(tmp_v1, v, v_perpendicular);
        //console.log('projeccion',tmp_v1);


        if( !(vec4.length(tmp_v1)/vec4.length(v1)) ) {
          vec4.copy(out, v)
          return;
        }

        vec4.projection(tmp_v2, tmp_v1, v1);
        v1p = vec4.length(tmp_v2)/vec4.length(v1);
        if(vec4.angleDot(tmp_v1, v1) >= Math.PI/2)
          v1p *= -1;

        vec4.projection(tmp_v2, tmp_v1, v2);
        v2p = vec4.length(tmp_v2)/vec4.length(v2);
        if(vec4.angleDot(tmp_v1, v2) >= Math.PI/2)
          v2p *= -1;

        vec4.scale(out, v1,
          v1p*Math.cos(theta) - v2p*Math.sin(theta));
        vec4.scaleAndAdd(out, out, v2,
          v2p*Math.cos(theta) + v1p*Math.sin(theta));

        vec4.add(out,out,v_perpendicular);
      }

        //aplica rotadores relativos a rotación global segmentada para generar rotación total
        function rotateAbsolute(obj) {
          var mat5 = NMath.mat5,
            mat = NMath.mat,
            rwz = mat4.createIdentity(),
            rwy = mat4.createIdentity(),
            rwx = mat4.createIdentity(),
            m_data_pre = mat4.create(),
            m_data = mat4.create(),
            m_tmp1 = mat4.create(),
            m_tmp2 = mat4.create(),
            vecs = null;

          mat.fromVecs(m_data, [obj.rrx, obj.rry, obj.rrz, obj.rrw]);
          mat4.rotateAxis(rwz, 3,2, obj.rwz)
          mat4.rotateAxis(rwy, 3,1, obj.rwy)
          mat4.rotateAxis(rwx, 3,0, obj.rwx)

          mat4.multiply(m_tmp1, rwz, rwx);
          mat4.multiply(m_tmp2, rwy, m_tmp1);
          mat4.multiply(m_tmp1, m_data, m_tmp2);

          vecs = mat.vecs(m_tmp1);

          obj.rx = vecs[0];
          obj.ry = vecs[1];
          obj.rz = vecs[2];
          obj.rw = vecs[3];
        }

        function rotateNormalizedRelative(vecs, a,b ,theta) {
          //console.log('relative')
          var mat = NMath.mat,
            mat5 = NMath.mat5,
            vec = NMath.vec,
            m_data = mat5.create(),
            m_rotation = mat5.createIdentity(),
            m_rotation2 = mat5.create(),
            m_tmp = mat5.create();

          mat.fromVecs(m_data, vecs);

          mat5.rotateAxis(m_rotation, a, b, theta);

          mat5.multiply(m_tmp, m_data, m_rotation);
          vec.fromMat(vecs, m_tmp);
        }

        //rota v hacia p theta ang
        function rotatePivot(out, v, p, theta) {
          var v_norm = new vec4.create(),
            pivot = new vec4.create();

          //console.log('rotatePivot entrada [vec, piv]:', v, p);

          vec4.projection(v_norm, p, v);
          //console.log('projecion de piv en v',v_norm);
          vec4.sub(v_norm, p, v_norm);
          //console.log('pivote componente perpendicular',v_norm);
          vec4.normalize(pivot, v_norm);
          //console.log('pivote normalizado',pivot);
          //pivot is the normalized perpendicular to v part of p

          vec4.normalize(v_norm, v);

          vec4.rotateNormalized(pivot,v_norm, theta);
          vec4.scale(out, v_norm, vec4.length(v));
          //console.log('v rotado',out);
        }

        //rota va hacia vb el angulo theta
        function rotateNormalized(va, vb, theta) {
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


      return {
        rotateOnPlane: rotateOnPlane,
        rotateAbsolute: rotateAbsolute,
        rotateNormalizedRelative: rotateNormalizedRelative,
        rotatePivot: rotatePivot,
        rotateNormalized: rotateNormalized,
      }
    })();

    vec = (function() {
      function create(length) {
        var v = new ARRAY_TYPE(length),
          i=length;
        for(;i--;)
          v[i] = 0;
        return v;
      }

      function createFrom(length, from, offset, from_length) {
        var v = new ARRAY_TYPE(length),
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

      function from(out, v) {
        for(var i = out.length; i--;)
          out[i] = v[i];
      }

      function fromMat(out, m) {
        var size = mat.size(m),
          x, y;

        for(x = out.length; x--;)
          for(y = out[x].length; y--;)
            if( x<size && y<size )
              out[x][y] = m[x*size+y];
            else
              out[x][y] = 0;
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
        from: from,
        fromMat: fromMat,
        str: str
      };
    })();

    generators = (function() {
      var vec,mat;

      //uses template for generate common n-times operation code
      //:TODO: create 2-variable forEach, and inline-ecs(syntax: $(ec.) ). for complex index
      function forEach(dim, template, joiner) {
        if(!joiner) joiner = '';
        return Array.apply(null, Array(dim)).map(function(e,i){
          var t = template.replace(/\$\(.*?\)/g,function(m){
            return (new Function(
              'return '+m.substr(2,m.length-3).replace('i',i) ))()
            });
          return t.replace(new RegExp('\\$i','g'), i)
        }).join(joiner);
      }

      vec={
        create: function(dim) {
          return 'return new '+ARRAY_TYPE_STR+'('+dim+');';
        },
        clone: function (dim) {
          return 'var o=new '+ARRAY_TYPE_STR+'('+dim+');'+
          forEach(dim,'o[$i]=a[$i];')+
          'return o'
        },
        copy: function (dim) {
          return forEach(dim,'a[$i]=b[$i];')
        },
        add: function(dim) {
          return forEach(dim,'o[$i]=a[$i]+b[$i];')
        },
        sub: function(dim) {
          return forEach(dim,'o[$i]=a[$i]-b[$i];')
        },
        scaleAndAdd: function(dim) {
          return forEach(dim,'o[$i]=a[$i]+b[$i]*c;')
        },
        dot: function(dim) {
          return 'return '+forEach(dim,'a[$i]*b[$i]','+')
        },
        scale: function(dim) {
          return forEach(dim,'o[$i]=v[$i]*a;')
        },
        //scaling in-place
        scaleI: function(dim) {
          return forEach(dim,'v[$i]*=a;')
        },
        //generates a projection over b axis
        //o = b/b.length*( dot/b.length ) = b*(dot/(b.length^2)) = b*(dot/(b.dot))
        projection: function(dim) {
          return 'var r=('+forEach(dim,'a[$i]*b[$i]','+')+ //relation = dot
            ')/('+forEach(dim,'b[$i]*b[$i]','+')+ // /b.dot
            ');'+
            forEach(dim,'o[$i]=b[$i]*r;');
        },
        //angle from dot product: acos(dot/a.length*b.length)
        angleDot: function(dim) {
          return 'return Math.acos(('+forEach(dim,'a[$i]*b[$i]','+')+
            ')/(Math.sqrt('+forEach(dim,'a[$i]*a[$i]','+')+
            ')*Math.sqrt('+forEach(dim,'b[$i]*b[$i]','+')+')))'
        },
        length: function(dim) {
          return 'return Math.sqrt('+forEach(dim, 'v[$i]*v[$i]','+')+')'
        },
        normalize: function(dim) {
          return 'var l='+forEach(dim,'i[$i]*i[$i]','+')+';'+
            'l>0&&(l=1/Math.sqrt(l),'+forEach(dim,'o[$i]=i[$i]*l',',')+')'
        },
        normalizeI: function(dim) {
          return 'var l='+forEach(dim,'v[$i]*v[$i]','+')+';'+
            'l>0&&(l=1/Math.sqrt(l),'+forEach(dim,'v[$i]*=l',',')+')'
        },
        //converts 2 vectors into perpendicular plane directors
        plane: function(dim) {
          return 'var t=this.create();'+
            'this.projection(t,a,b);'+
            'this.sub(a,a,t);'+
            'this.normalizeI(a);'+
            'this.normalizeI(b);'
        },
        flip: function(dim) {
          return 'var r=('+
            forEach(dim,'a[$i]*b[$i]','+')+')/Math.sqrt('+
            forEach(dim, "b[$i]*b[$i]",'+')+');'+
            forEach(dim,"o[$i]=a[$i]+2*(b[$i]*r-a[$i]);")
        },
        subsets: {
          basic: ['create','clone','copy','add','sub','scaleAndAdd','dot','scale','scaleI',
            'angleDot','projection','length','normalize','normalizeI','plane','flip'],
        },
      };

      vec.clone.args = 'a';
      vec.copy.args = 'a,b';
      vec.add.args = 'o,a,b';
      vec.sub.args = 'o,a,b';
      vec.scaleAndAdd.args = 'o,a,b,c';
      vec.dot.args = 'a,b';
      vec.projection.args = 'o,a,b';
      vec.angleDot.args = 'a,b';
      vec.scale.args = 'o,v,a';
      vec.scaleI.args = 'v,a';
      vec.length.args = 'v';
      vec.normalize.args = 'o,i';
      vec.normalizeI.args = 'v';
      vec.plane.args = 'a,b';
      vec.flip.args = 'o,a,b';

      mat={
        /**
        * creates a zero matrix
        * @function create
        * @memberof matN
        */
        create: function (dim) {
          return 'return new '+ARRAY_TYPE_STR+'('+(dim*dim)+')'
        },
        /**
        * creates an identity matrix
        * @function createIdentity
        * @memberof matN
        */
        createIdentity: function (dim) {
          var s = 'var o=new '+ARRAY_TYPE_STR+'('+(dim*dim)+');', x, y;
          for(x=dim;x--;) for(y=dim;y--;)
            s+= 'o['+(x*dim+y)+']='+(x===y?1:0)+';'
          return s+'return o';
        },
        /**
        * sets out to identity
        * @function identity
        * @memberof matN
        */
        identity: function(dim) {
          var s='',x,y;
          for(x=dim;x--;) for(y=dim;y--;)
            s+= 'o['+(x*dim+y)+']='+(x===y?1:0)+';\n'
          return s;
        },
        sum: function(dim) {
          return forEach(dim,'o[$i]=a[$i]+b[$i];')
        },
        sumI: function(dim) {
          return forEach(dim,'a[$i]+=b[$i];')
        },
        /**
        * copy a into out
        * @function copy
        * @memberof matN
        */
        copy: function(dim) {
          return forEach(dim*dim,'a[$i]=b[$i];')
        },
        multiply: function (dim) {
          var s='', o=[], x,y,z;
          for(x = dim; x--;)
          for(y = dim; y--;){
            s += 'o['+((y*dim)+x)+']=';

            for(z = dim, o=[]; z--;)
              o.push('a['+(z*dim+x)+']*b['+(y*dim+z)+']');
            s += o.join('+')+';\n';
          }
          return s;
        },
        /**
        * applies : out = m*v
        * @function multiplyVec
        * @memberof matN
        */
        multiplyVec: function(dim) {
          var i,str='';
          for(i=dim;i--;)
            str += 'o['+i+']='+Array.apply(null, Array(dim)).map(function(e,j){
                return 'm['+(j*dim+i)+']*v['+j+']'
              }).join('+')+';'
          return str;
        },
        multiplyVecPre: function(dim) {
          var i,str='';
          for(i=dim;i--;)
            str += 'o['+i+']='+Array.apply(null, Array(dim)).map(function(e,j){
                return 'm['+(i*dim+j)+']*v['+j+']'
              }).join('+')+';'
          return str;
        },
        normalizeI: function(dim) {
          var i,str='';
          str+='var r;';
          for(i=0;i<dim;i++)
            str+='r=Math.sqrt('+forEach(dim,'o[$i*'+i+']','+')+');';
          return str;
        },
        orthogonalizeI: function(dim){
          var str = 'var r;', i, j, k=dim;
          for(i=0; i<dim; i++)
            for(j=i+1; j<dim; j++)
          str += 'r=('+forEach(dim,'m[$('+(i*dim)+'+i)]*m[$('+(j*dim)+'+i)]','+')+ //relation = dot
            ')/('+forEach(dim,'m[$('+(j*dim)+'+i)]*m[$('+(j*dim)+'+i)]','+')+ // /b.dot
            ');'+
            forEach(dim,'m[$('+(i*dim)+'+i)]-=m[$('+(j*dim)+'+i)]*r;')+'\n\n';  //
          return str;
        },
        /**
        * out = a^T
        * @function traspose
        * @memberof matN
        */
        traspose: function (dim) {
          var s='', x,y;
          for(x=dim;x--;) for(y=dim;y--;)
            s+='o['+(x*5+y)+']=a['+(y*5+x)+'];'
          return s
        },
        /**
        * a = a^T
        * @function trasposeI
        * @memberof matN
        */
        trasposeI: function(dim) {
          var s='var t;', x,y;
          for(x=dim;x--;) for(y=dim;y--;)
            if(y > x){
            s+='t=o['+(y*5+x)+'];'
            s+='o['+(y*5+x)+']=o['+(x*5+y)+'];'
            s+='o['+(x*5+y)+']=t;'
          }
          return s
        },
        /**
        * Function for optimized rotation construction on identity
        * matrix, generates a rotation from 'a' axis to 'b' axis
        * @function rotateIdentityAxis
        * @memberof matN
        */
        rotateAxis: function(dim) {
          return 'var x=Math.cos(e),y=Math.sin(e);'+
            'o[a*'+dim+'+a]=x;o[a*'+dim+'+b]=y;'+
            'o[b*'+dim+'+b]=x;o[b*'+dim+'+a]=-y;';
        },
        /**
        * Will apply a translation transform to m <br/> <br/>
        * m = taslation(p)*m
        * @function translate
        * @memberof matN
        */
        translate: function(dim) {
          var str='', i;
          for(i=dim-1; i--;)
            str +='o['+(dim*(dim-1)+i)+']=v['+i+']+o['+(dim*(dim-1)+i)+'];';
          return str;
        },
        /**
        * Will apply a scaling transform to m and put it into out <br/> <br/>
        * out = scale(v)*m
        * @function scale
        * @memberof matN
        */
        scale: function(dim) {
          var i, j, str='';
          for(i=dim-1; i--;)
            for(j=dim-1;j--;)
              str+='o['+(dim*i+j)+']=m['+(dim*i+j)+']*v['+i+'];';
          return str;
        },
        projectionPerspective: function(dim) {
          if(dim === 1)
            return 'o[0]=0';  //base case

          var str='', i, j, str_x;
          str+='if(arguments.length<3||!o) throw "Insuficient parameters on projection matrix";'
          str+='var d_limit=Math.floor(arguments.length/2), last_index=('+
            (dim*2)+'>arguments.length)?(d_limit-1)*2+1:arguments.length,'+
            'n=arguments[1],f=arguments[2];'+
            'console.log(last_index, d_limit);'

          for(i=dim; i--;) //zeroes
            for(j=dim; j--;)
              if( (i!=j || (i==dim-1 && j==dim-1) ) && i!=dim-2 && !(i==dim-1 && j==dim-2) )
                str+='o['+(i*dim+j)+']=0;';
          //out[x] = (near+far)/(far-near);  //the unlinear approach

          str+='o['+((dim-1)*dim-1)+']=1;'+  //special cases
            'o['+((dim-1)*dim-2)+']=2/(f-n);'+
            'o['+(dim*dim-2)+']=-(f+n)/(f-n);'

          for(i=dim-2;i-- >0;) {
            str+='\nif('+(i+2)+'>d_limit){\n'+
              'o['+((dim-2)*dim+i)+']=(-(arguments[last_index+1]+arguments[last_index]))'+
              '/(arguments[last_index+1]-arguments[last_index]);'+
              'o['+(i*dim+i)+']=(2*n)/(arguments[last_index+1]-arguments[last_index]);'+
            '\n}else{\n'+
              'o['+((dim-2)*dim+i)+']=(-(arguments['+((i+2)*2)+']+arguments['+((i+2)*2-1)+
                ']))/(arguments['+((i+2)*2)+']-arguments['+((i+2)*2-1)+']);'+
              'o['+(i*dim+i)+']=(2*n)/(arguments['+((i+2)*2)+']-arguments['+((i+2)*2-1)+']);'+
            '}'
          }
          return str
        },
        /*
         mat4.projectionLen = function(out, near, far, a, b, ...) {
          var x = near*Math.tan(a/2),
            y = near*Math.tan(b/2);
            console.log('here')
          mat4.projection(out, -x, x, -y, y, near, far);
        };
        mat4.ortogonalLen = function(out, length, aspect_a, aspect_b ...) {
          var x = length*aspect_x/2,
            y = length*aspect_y/2,
            z = length/2;
          mat4.ortogonal(out, -x, x, -y, y, -z, z);
        }
        */
        projectionPerspectiveLen: function(dim) {

        },
        projectionPerspectiveCollapse: function(dim) {

        },
        projectionOrthogonal: function(dim) {
          if(dim === 1)
            return 'o[0]=0';  //base case

          var str='', i, j, str_x;
          str+='if(arguments.length<3||!o) throw "Insuficient parameters on projection matrix";'
          str+='var d_limit=Math.floor(arguments.length/2), last_index=('+
            (dim*2)+'>arguments.length)?(d_limit-1)*2+1:arguments.length,'+
            'n=arguments[1],f=arguments[2];'+
            'console.log(last_index, d_limit);'

          for(i=dim; i--;) //zeroes
            for(j=dim; j--;)
              if( i!=j && i!=dim-1 )
                str+='o['+(i*dim+j)+']=0;';
          //out[x] = (near+far)/(far-near);  //the unlinear approach

          str+='o['+(dim*dim-1)+']=1;'+  //special cases
            'o['+((dim-1)*dim-2)+']=2/(f-n);'+
            'o['+(dim*dim-2)+']=-(f+n)/(f-n);'

          for(i=dim-2;i-- >0;) {
            str+='\nif('+(i+2)+'>d_limit){\n'+
              'o['+((dim-1)*dim+i)+']=(-(arguments[last_index+1]+arguments[last_index]))'+
              '/(arguments[last_index+1]-arguments[last_index]);'+
              'o['+(i*dim+i)+']=2/(arguments[last_index+1]-arguments[last_index]);'+
            '\n}else{\n'+
              'o['+((dim-1)*dim+i)+']=(-(arguments['+((i+2)*2)+']+arguments['+((i+2)*2-1)+
                ']))/(arguments['+((i+2)*2)+']-arguments['+((i+2)*2-1)+']);'+
              'o['+(i*dim+i)+']=2/(arguments['+((i+2)*2)+']-arguments['+((i+2)*2-1)+']);'+
            '}'
          }
          return str
        },
        projectionOrthogonalLen: function(dim) {

        },
        projectionOrthogonalCollapse: function(dim) {

        },
        subsets: {
          basic: ['multiply','create','sum','sumI','copy','createIdentity',
            'traspose','trasposeI','identity','rotateAxis','translate',
            'scale','multiplyVec','multiplyVec','multiplyVecPre',
            'orthogonalizeI','projectionPerspective','projectionOrthogonal'],
        },
      };

      mat.multiply.args = 'o,a,b'
      mat.sum.args = 'o,a,b'
      mat.sumI.args = 'a,b'
      mat.copy.args = 'a,b'
      mat.traspose.args = 'o,a'
      mat.trasposeI.args = 'o'
      mat.identity.args = 'o'
      mat.rotateAxis.args = 'o,a,b,e'
      mat.translate.args = 'o,v'
      mat.scale.args = 'o,m,v'
      mat.multiplyVec.args = 'o,m,v'
      mat.multiplyVecPre.args = 'o,m,v'
      mat.orthogonalizeI.args = 'm'
      mat.projectionPerspective.args = 'o'
      mat.projectionOrthogonal.args = 'o'
      return {
        vec: vec,
        mat: mat,
      }
    })()

    code = function code(descriptor) {
      var generator,mod;

      if(descriptor instanceof Number || typeof descriptor === 'number') {
        code({dim:descriptor})
        return
      }
      if(!descriptor.module) {
        if(!NMath['vec'+descriptor.dim])
          NMath['vec'+descriptor.dim] = {};
        if(!NMath['mat'+descriptor.dim])
          NMath['mat'+descriptor.dim] = {};
        code({dim:descriptor.dim,module:'vec'})
        code({dim:descriptor.dim,module:'mat'})
      }
      else if(!descriptor.func) {
        generators[descriptor.module].subsets.basic.forEach(function(e){
          code({
            dim:descriptor.dim,
            module:descriptor.module,
            func:e
          })
        })
      }
      else {
        generator = generators[ descriptor.module ][ descriptor.func ];
        mod = NMath[descriptor.module+descriptor.dim]
        try {
        NMath[ descriptor.module + descriptor.dim ][ descriptor.func ] =
          (generator.args)?
            Function( generator.args, generator( descriptor.dim )):
            Function( generator( descriptor.dim ))//function body
          }
        catch(e) {
            console.log('Bug compiling: ',descriptor, '\nCode:'+generator( descriptor.dim ));
          }
      }
    }

    common = (function() {

      function copy(out, from, out_offset, copy_length, from_offset) {
        if(!out_offset) out_offset = 0;
        if(!from_offset) from_offset = 0;
        if(!copy_length) copy_length = from.length - from_offset;

        var out_length = out_offset + copy_length,
          i = 0;

        for(;i < copy_length; i++)
          out[i+out_offset] = from[i+from_offset];
      }

      return {
        copy: copy
      };
    })();

    return {
      common: common,
      mat : mat,
      vec: vec,
      mat5: mat5,
      mat4: mat4,
      vec5: vec5,
      vec4: vec4,
      vec3: vec3,
      code: code,
      ARRAY_TYPE: ARRAY_TYPE,
      GLCOLOR_ARRAY_TYPE: GLCOLOR_ARRAY_TYPE,
      GLINDEX_ARRAY_TYPE: GLINDEX_ARRAY_TYPE
    };
  })();
})();
NMath.code(2);
NMath.code(3);
NMath.code(4);
NMath.code(5);

}catch(e) {console.log(e);}
}
}catch(e) {console.log('You dont have a NMath requeriment, NMath not loaded');}

/*
mat4.projectionLen = function(out, alfa, beta, near, far) {
  var x = near*Math.tan(alfa/2),
    y = near*Math.tan(beta/2);
    console.log('here')
  mat4.projection(out, -x, x, -y, y, near, far);
};
mat4.ortogonalLen = function(out, length, aspect_x, aspect_y, position) {
  var x = length*aspect_x/2,
    y = length*aspect_y/2,
    z = length/2;

  mat4.ortogonal(out, -x, x, -y, y, -z, z);
}
mat4.projection = function(out, left, right, back, front, near, far) {
  out[0] = 2*near/(right-left);
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;

  out[4] = 0;
  out[5] = 2*near/(front-back);
  out[6] = 0;
  out[7] = 0;

  out[8] = -(right+left)/(right-left);
  out[9] = -(front+back)/(front-back);
  //out[18] = (near+far)/(far-near);  //the unlinear approach
  out[10] = 2/(far-near);
  out[11] = 1;

  out[12] = 0;
  out[13] = 0;
  //out[23] = -2*far*near/(far-near); //the unlinear approach
  out[14] = -(far+near)/(far-near);
  out[15] = 0;
};
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

  out[12] = -(right+left)/(right-left);
  out[13] = -(top+bottom)/(top-bottom);
  out[14] = -(far+near)/(far-near);
  out[15] = 1;
}
*/
