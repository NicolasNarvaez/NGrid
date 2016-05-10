try {
  if(twgl)  //requires
    try {
      (function() {

        var global_root = this;

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

var
  mat = NMath.mat,
  vec = NMath.vec,
  mat5 = NMath.mat5,
  vec3 = NMath.vec3,
  vec4 = NMath.vec4,
  vec5 = NMath.vec5,
  GLMAT_ARRAY_TYPE = NMath.ARRAY_TYPE,
  GLCOLOR_ARRAY_TYPE = NMath.GLCOLOR_ARRAY_TYPE,
  GLINDEX_ARRAY_TYPE = NMath.GLINDEX_ARRAY_TYPE;

function projection(out,va,vb) {
  vec4.scale(out, vb, vec4.dot(va,vb)/vec4.length(va));
}

global_root.NEngine = (function() {

  var math, Obj, renderer, geometry,
    util,
    Engine,
    Frame,
    Physic,
    Camera,
    Renderer,
    //TODO Shader logic, optimization, generation, syntax, definition
    //uses ND configs to generate ND materials
    ShaderCompiler,
    //generates materials data canvases
    Shader,
    Entity,
    //TODO:
    //optimized physical sysstem, collisions, force fields, n-dimensional boxing system
    //Huge-Nano space handling
    //fixed world object handler: environment variables, force-fields
    //object factories, for fast replication, on preconfigured engines
    SubSpace, //minimal unit of SVS
    Space,  //module of a system
    System, //Physycal collection of data and transforms
    GLNSLCompiler,
    vec4=NMath.vec4,
    vec5=NMath.vec5,
    mat4=NMath.mat4,
    mat5=NMath.mat5;

  util = {
    //return a + every prop not in a but in b
    missing: function missing(a, b) {
      for(prop in b)
        if(!a[prop])
          a[prop] = b[prop];
    },
  }

  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

geometry = (function() {

  function clone(g) {

  }

  function boundingBox(g) {
    var box = {};

    return box;
  }

  function boundingSphere(g) {

  }

  function merge() {

  }

  /*
  creates new geom space and fills it with the geoms in the given order
  if entity passed, applies transformatios before adding
  TODO: n geoms to one (optimize), keep_geom applies to first
  */
  function concat(a, b, keep_geom) {
    var
      ag = (a instanceof Geom)? a : a.geom,
      bg = (b instanceof Geom)? b : b.geom,
      ad = ag.data,
      bd = bg.data,
      og = (keep_geom)? ag: new Geom(),
      od = (keep_geom)? (og.data={}) : og.data,
      lm, lv, d_copy, v, v_tmp, av, bv, ov, i,offset_from,offset_to ,
      dim = ag.dim || bg.dim,
      ari, bri, api, bpi, ar, ap, br, bp;

    ari = bri = api = bpi = true;
    av = ad.vertex;
    bv = bd.vertex;

    og.dim = dim;

    od.vertex = new GLMAT_ARRAY_TYPE(
      ((av)?av.length:0) +
      ((bv)?bv.length:0) );
    ov = od.vertex;

    od.color = new GLCOLOR_ARRAY_TYPE(
      ((ad.color)?ad.color.length:0) +
      ((bd.color)?bd.color.length:0) );


    if(ad.edges || bd.edges) {
      od.edges = new GLINDEX_ARRAY_TYPE(
        ((ad.edges)? ad.edges.length:0) +
        ((bd.edges)? bd.edges.length:0) );
    }
    if(ad.faces || bd.faces) {
      od.faces = new GLINDEX_ARRAY_TYPE(
        ((ad.faces)?ad.faces.length:0) +
        ((bd.faces)?bd.faces.length:0) );
    }

    if(a instanceof Entity || b instanceof Entity) {
      lm = NMath['mat'+og.dim];
      lv = NMath['vec'+og.dim];
      d_copy = NMath.common.copy

      if(a instanceof Entity) {
        ar = a.r; ap = a.p;
        ari = lm.isIdentity(ar);
        api = lv.isNull(ap);
      }
      if(b instanceof Entity) {
        br = b.r; bp = b.p;
        bri = lm.isIdentity(br);
        bpi = lv.isNull(bp);
      }

    }




    //copy vertex
    //if vertex by vertex copy is needed execute this, otherwise
    //just copy the whole chunks
    if(av) {

      if( av instanceof Array || !ari || !api ) {
        //this cheks if there are transformations to be done into
        //each vertex to be copied
        i = av.length;
        v = lv.create();
        v_tmp = lv.create();

        //a rotation is identity, and a position is identity => just copy
        if( ari && api) {
          for(; i--;)
            ov[i] = av[i];
          }

        else {
          for(; (i-=dim) >= 0;) {
            d_copy(v, av, 0, dim, i);

            if(!ari) {
              lm.multiplyVec(v_tmp, ar, v);
              lv.copy(v, v_tmp)
            }
            if(!api)
              lv.add(v,v,ap);

            d_copy(ov, v, i, dim, 0);
          }
        }

      }
      else
        od.vertex.set(av);
    }

    if(bv) {
      offset_to = (av)? av.length:0;

      //repeat what was done in before section into second geometry
      if( bv instanceof Array || !bri || !bpi ) {
        i = bv.length;
        v = lv.create();
        v_tmp = lv.create();



        if( bri && bpi)
          for(; i--;)
            ov[i] = bv[i];

        else {
          for(; (i-=dim) >= 0;) {
            d_copy(v, bv, 0, dim, i);

            if(!bri) {
              lm.multiplyVec(v_tmp, br, v);
              lv.copy(v, v_tmp)
            }
            if(!bpi)
              lv.add(v,v,bp);
            d_copy(ov, v, i+offset_to, dim, 0);
          }
        }

      }
      else
        od.vertex.set(bv, offset_to);
    }

    if(ad.edges)
      od.edges.set(ad.edges);
    if(ad.faces)
      od.faces.set(ad.faces);

    offset_from = ((av)?av.length/dim:0);
    if(bd.edges) {
      offset_to = (ad.edges)? ad.edges.length : 0;
      console.log(offset_to)
      for(i=bd.edges.length; i--;)
        od.edges[i+offset_to] = bd.edges[i] + offset_from;
    }
    if(bd.faces) {
      offset_to = (ad.faces)? ad.faces.length : 0;
      for(i=bd.faces.length; i--;)
        od.faces[i+offset_to] = bd.faces[i] + offset_from;
    }

    if(ad.color)
      od.color.set(ad.color);
    if(bd.color)
      od.color.set(bd.color, (ad.color)?ad.color.length:0);

    return og;
  }

  function forEach() {

  }

  function twglize(g) {
    g.buffers = {
      position: {
        numComponents: g.dim,
        data: g.data.vertex,
        type: GLMAT_ARRAY_TYPE},
      color: {
        numComponents: 4,
        data: g.data.color,
        type: GLCOLOR_ARRAY_TYPE
      }
    }

    if(g.data.edges || g.data.faces) {
      g.buffers.indices = {
        numComponents: (g.data.edges)? 2:3,
        data: (g.data.edges)? g.data.edges:g.data.faces,
        type: Float32Array
      }
    }
  }

  function Geom() {
    this.boundingBoxMin = 0;
    this.boundingBoxMax = 0;
    this.boundingSphereRadius = 0;

    this.dim;

    this.data = {
      vertex: null,
      color: null,

      edges: null,
      faces: null,
    };
    this.buffers = {};
  }
  Geom.prototype = (function() {
    //function
    function concat_geom(b) {
      return concat(this, b);
    }
    function twglize_geom() {
      twglize(this);
    }
    return {
      concat: concat_geom,
      twglize: twglize_geom,
    };
  })();

  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function grid4(options) {
  if(!options) options = {};

  var
    size_x = options.size_x || options.size || 2,
    size_y = options.size_y || options.size || size_x,
    size_z = options.size_z || options.size || size_y,
    size_w = options.size_w || options.size || size_z,

    length_x = options.length_x || options.length || 1,
    length_y = options.length_y || options.length || length_x,
    length_z = options.length_z || options.length || length_y,
    length_w = options.length_w || options.length || length_z,

    //this transforms from vertex coordinate to array coordinate
    size_step_x = 4,
    size_step_y = size_x*size_step_x,
    size_step_z = size_y*size_step_y,
    size_step_w = size_z*size_step_z,

    //separation between vertex acording to given size
    length_step_y = length_y/(size_y-1),
    length_step_z = length_z/(size_z-1),
    length_step_x = length_x/(size_x-1),
    length_step_w = length_w/(size_w-1),

    //used as cache for in-loop position assignment
    length_y_m = length_y/2,
    length_z_m = length_z/2,
    length_x_m = length_x/2,
    length_w_m = length_w/2,

    //loop iterators
    i_w, i_z, i_y, i_x, i_dir, i_dir2;

  //just a recursion, calm down guys
  if(options.iteration || options.recursion_depth) {
    var p = NMath.vec4.create(),
      recursion_i = Array(4);

    if(options.recursion_depth) {
      if(!options.recursion_depth_total) {
        options.recursion_depth_total = options.recursion_depth;
        options.recursion_depth_current = 0;
      }

      if(!options.recursion_is)
        options.recursion_is = [recursion_i];
      else
        options.recursion_is.push(recursion_i);

      if(!options.recursion_ps)
        options.recursion_ps = [p];
      else
        options.recursion_ps.push(p);
    }

    for(recursion_i[3] = size_w; recursion_i[3]--;)
      for(recursion_i[2] = size_z; recursion_i[2]--;)
        for(recursion_i[1] = size_y; recursion_i[1]--;)
          for(recursion_i[0] = size_x; recursion_i[0]--;) {

            p[0] =  recursion_i[0]*length_step_x - length_x_m;
            p[1] =  recursion_i[1]*length_step_y - length_y_m;
            p[2] =  recursion_i[2]*length_step_z - length_z_m;
            p[3] =  recursion_i[3]*length_step_w - length_w_m;

            options.recursion_i = recursion_i;
            options.iteration(p, options);

            if(options.recursion_depth) {
              options.recursion_depth--;
              options.recursion_depth_current++;
              grid4(options);
              options.recursion_depth++;
              options.recursion_depth_current--;
            }
          }
      if(options.functional)
        return
  }

  var position = new GLMAT_ARRAY_TYPE(size_w*size_z*size_y*size_x*4),
    color = new GLCOLOR_ARRAY_TYPE(size_w*size_z*size_y*size_x*4),
    indices = (options.wire)? new GLINDEX_ARRAY_TYPE(2*(
      size_w*size_z*size_y*(size_x-1) +
      size_w*size_z*(size_y-1)*size_x +
      size_w*(size_z-1)*size_y*size_x +
      (size_w-1)*size_z*size_y*size_x
    )) : new GLINDEX_ARRAY_TYPE(

    );

  if(options.wire){
    //fill vertex position data
    for(i_w = size_w; i_w--;)
      for(i_z = size_z; i_z--;)
        for(i_y = size_y; i_y--;)
          for(i_x = size_x; i_x--;) {
            i_dir =
              i_w*size_step_w +
              i_z*size_step_z +
              i_y*size_step_y +
              i_x*size_step_x;

            position[ i_dir ] =  i_x*length_step_x - length_x_m;
            position[i_dir+1] =  i_y*length_step_y - length_y_m;
            position[i_dir+2] =  i_z*length_step_z - length_z_m;
            position[i_dir+3] =  i_w*length_step_w - length_w_m;

            color[ i_dir ] = 0.7+ ((i_x-size_x/2)/size_x) + (i_w/size_w)/6;
            color[i_dir+1] = 0.7+ ((i_y-size_y/2)/size_y) + (i_w/size_w)/6;
            color[i_dir+2] = 0.7+ ((i_z-size_z/2)/size_z) + (i_w/size_w)/6;
            color[i_dir+3] = 1;
          }

    //will create all the indices of lines that point in the final axis
    // parameter data direcction
    function createLinesOnAxis(offset,
        size_w, size_z, size_y, size_x,
        size_step_w, size_step_z, size_step_y, size_step_x, db) {

      var indices_size_step_x = 2,
        indices_size_step_y = indices_size_step_x*(size_x-1),
        indices_size_step_z = indices_size_step_y*size_y,
        indices_size_step_w = indices_size_step_z*size_z;

      //para cada elemento en el mapa de lineas
      for(i_w = size_w; i_w--;)
        for(i_z = size_z; i_z--;)
          for(i_y = size_y; i_y--;)
            for(i_x = size_x; --i_x;) {

              //line dir
              i_dir = offset +
                i_w*indices_size_step_w + i_z*indices_size_step_z +
                i_y*indices_size_step_y + (i_x-1)*indices_size_step_x;

              i_dir2 =  (i_w*size_step_w + i_z*size_step_z +
                i_y*size_step_y + i_x*size_step_x)/4;

              indices[i_dir] = i_dir2;
              indices[i_dir+1] = (i_dir2 - size_step_x/4);
            }
    }
    //use for every axis, calculating offset accordingly
    createLinesOnAxis(
      0, size_w, size_z, size_y, size_x,
      size_step_w, size_step_z, size_step_y, size_step_x);
    createLinesOnAxis(
      2*size_w*size_z*size_y*(size_x-1),
      size_w, size_z, size_x, size_y,
      size_step_w, size_step_z, size_step_x, size_step_y);
    createLinesOnAxis(
      2*size_w*size_z*
      (size_y*(size_x-1) + (size_y-1)*size_x),
      size_w, size_x, size_y, size_z,
      size_step_w, size_step_x, size_step_y, size_step_z);
    createLinesOnAxis(
      2*size_w*
        (size_z* (size_y*(size_x-1) + (size_y-1)*size_x) +
        (size_z-1)*size_y*size_x),
      size_x, size_z, size_y, size_w,
      size_step_x, size_step_z, size_step_y, size_step_w);
    }
    else {

    }


    Geom.apply(this);
    this.dim = 4;

    this.length_x = length_x;
    this.length_y = length_y;
    this.length_z = length_z;
    this.length_w = length_w;

    this.size_x = size_x;
    this.size_y = size_y;
    this.size_z = size_z;
    this.size_w = size_w;

    this.data = {}
    this.data.vertex = position;
    if(options.wire)
      this.data.edges = indices;
    else
      this.data.faces = indices;

    this.data.color = color;

    twglize(this);
    return this;
}
grid4.prototype = Geom.prototype;
function simplex4(ops) {
  var size = ops.size, type = ops.enemy,
   p = new GLMAT_ARRAY_TYPE([
      -0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
      0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
      0, 0.5773502743708339, -0.2041241452319315, -0.15811388194561005,
      0, 0, 0.6123724431685174, -0.15811388194561005,
      0, 0, 0, 0.6324555330964848
    ]),
    c,
    i = (ops.wire)?new GLINDEX_ARRAY_TYPE([
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
    ]):
    new GLINDEX_ARRAY_TYPE([
      0,1,2,
      0,1,3,
      0,1,4,
      0,2,3,
      0,2,4,
      0,3,4,
      1,2,3,
      1,2,4,
      1,3,4,
      2,3,4,
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
      indices: {numComponents: (ops.wire)?2:3, data: i, type: GLINDEX_ARRAY_TYPE},
      color: {numComponents: 4, data: c, type: GLCOLOR_ARRAY_TYPE}
      }
    }
}
function octahedron4(ops) {
  var size = ops.size,
    p = new GLMAT_ARRAY_TYPE([
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
  i = (ops.wire)? new GLINDEX_ARRAY_TYPE([
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
  ]): new GLINDEX_ARRAY_TYPE([
    0,2,3,
    0,2,4,
    0,2,5,
    0,2,6,
    0,2,7,

    0,3,4,
    0,3,5,
    0,3,6,
    0,3,7,

    0,4,5,
    0,4,6,
    0,4,7,

    0,5,6,
    0,5,7,
    0,6,7,

    1,2,3,
    1,2,4,
    1,2,5,
    1,2,6,
    1,2,7,

    1,3,4,
    1,3,5,
    1,3,6,
    1,3,7,

    1,4,5,
    1,4,6,
    1,4,7,

    1,5,6,
    1,5,7,
    1,6,7,

    2,4,5,
    2,4,6,
    2,4,7,
    2,5,6,
    2,5,7,
    2,6,7,

    3,4,5,
    3,4,6,
    3,4,7,
    3,5,6,
    3,5,7,
    3,6,7,

    4,6,7,
    5,6,7,
  ]);

  return {
    boundingSphereRadius: size,
    boundingBoxMax: size,
    boundingBoxMin: size,
    buffers: {
      position: {numComponents: 4, data: p , type: GLMAT_ARRAY_TYPE},
      indices: {numComponents: (ops.wire)?2:3, data: i, type: GLINDEX_ARRAY_TYPE},
      color: {numComponents: 4, data: c, type: GLCOLOR_ARRAY_TYPE}
      }
    }
}

function axis4(options){
  var s = options.size,p = new GLMAT_ARRAY_TYPE([
    0, 0, 0, 0,
    s, 0, 0, 0,
    0, s, 0, 0,
    0, 0, s, 0,
    0, 0, 0, s,
  ]),
  c = new GLCOLOR_ARRAY_TYPE([
    1, 1, 1, 1,

    1, 0, 0, 1,
    1, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 1, 1,
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

function tree4(options) {

}


  return {
    octahedron4: octahedron4,
    simplex4: simplex4,
    grid4: grid4,
    axis4: axis4,
    Geom: Geom,
    twglize: twglize,
    concat: concat
  };
})();

  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//has mouse events API, keyboard events API
//n n-dimensional cameras for complex projection
//extra hoisted camera for more complex n-dimensional projection
//    (aka: watch initial ND camera from other camera in World-space coords)
Camera = (function() {
  //options:
  //type,dim, stereo_mode and the options of those

  //
  function Camera(cfg) {
    var i, length;

    cfg = cfg || {};
    util.missing(cfg, Camera.defaults);

    this.cfg = cfg;

    //create cameras
    if(cfg.type === 'recursive') {
      //generate cameras from dim to 3D
      for(i=cfg.dim+1; --i>0;)
        this['camera'+i] = new SubSpace({
          dim: i
        })
      this.camera = this.camera['camera'+cfg.dim];
    }
    if(cfg.type === 'collapsed') {
      this.camera = new SubSpace({
        dim: cfg.dim,
      })
    }

    this.cameraObj = new SubSpace({
      dim: cfg.dim
    })

    this.updateProyection();
  }

  Camera.prototype = {
    updateProyection: function updateProyection(dim) {
      var cfg = this.cfg;
      if(cfg.type === 'recursive') {
        if(dim) {

        }
        else {

        }
      }
      if(cfg.type === 'collapsed') {

      }
    },
    //activates inputs for camera
    connectInput: function connectInput(input, settings) {
      if(input === 'all') {

      }
      if(!input) {

      }
    }
  };

  Camera.defaults = {
    dim: 4,
    type: 'collapsed',  //recursive || colapsed
    stereo_mode: 'splited',    //splited, polarized, alternation timer, etc.

    //camera specific
    camera: {
      //stereo
      stereo_separation: 5.616,
      stereo_distance: 10,

      //projection 1
      projection: 'perspective',
      projection_near: 1.0,
      projection_far: 1000.0,
      projection_perspective_angle: Math.PI/2,
    },

    ////// recursive!!
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

//Has minimal abstract object information
//position, rotation, meta-data, geometry, material
Entity = (function() {

  function Entity(cfg){
    cfg = cfg || {};
    util.missing(cfg, Entity.defaults);

    if(!cfg.dim) throw "Entity creation, no dim parameter";

    SubSpace.call(this, cfg);
    //this.p = new NMath['vec'+cfg.dim].create();
    //this.r = new NMath['mat'+cfg.dim].createIdentity();

    if(cfg.p && cfg.p.length === options.dim)
      this.p = options.p;

    this.geometry = null;
    this.material = null;
    this.container = null;
  }

  Entity.defaults = {
    dim: 4,
  }

  Entity.prototype = {
    /**
    * requires that the entity has previously registered on a space node
    * sets a physic type, using a module object, module name, or module enum
    * checks whether the objects array in the entity container has the
    * needed object type array instantiated.
    */
    setType: function set(type, opts) {
      var container = this.container, objects;
      if(!container) return;

      //sanitizes type parameter
      if(type instanceof String || typeof type == 'string')
        type = NEngine.Physic.PhysicModules[type];
      else  if(type instanceof 'Number' || typeof type == 'number')
        type = NEngine.Physic.PhysicModulesEnum[type];

      //sanitize objects array in ent.container
      objects = container.objects[type.i];
      if(!objects)
        objects = container.objects[type.i] = Array();
      else if(objects.indexOf(this) != -1) return;

      //convert object and add to list
      type.convert.call(this, opts);
      objects.push(this);
    }
  }

  return Entity;
})();


obj = (function() {
  var camera,
    vec4=NMath.vec4,
    mat5=NMath.mat5,
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
      //console.log(camera.p)
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
    var vec4 = NMath.vec4;
    //graphical data:
    //position vectors
    this.p = (p)? p:vec4.create();
    //rotation vectors
    this.rx = vec4.create();
    this.ry = vec4.create();
    this.rz = vec4.create();
    this.rw = vec4.create();
    this.rx[0] = 1.0;
    this.ry[1] = 1.0;
    this.rz[2] = 1.0;
    this.rw[3] = 1.0;

    //physical data
    //position derivative
    this.dp = vec4.create();
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


  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
###################################################################Description:

SpaceNt is a developing teorethical model for plug-and-play distributed
virtual reality of nodes (servers), the idea is create a metaverse not
controlled by a governmental or private entity, but to be colectively developed
has a standard and sustained by opensource nodes.

The computers on connecting to spacenet would be adopting the standard and
thus start processing data of the network to keep it online

It has implementation dificulies on security, specifically detection of
corrupt nodes that could be distroting network data

The security bugs generated by corrup nodes can be of multiple types and
thus is necesary to detect the corrup nodes and tke them off the grid when
they emerge, withouth generating data loss, being this maybe the only way to
ensure the viability of this. It is also possible, in case of this problem
to be too difficult to solve, to shrink certain caracteristics to increase DB
consistency and mantein them in development stage, for example, having along
with the DNS server, high latency vigilance servers

This can be very simplified if we find a way to make a node to compute
external data without being possible for it to make an idea of what is
computing, thus, DNS node along vigilants could compare computation on
diferent nodes and change the petition routing constantly.

The reason for so much interest on the network is for the posibility of it
to become a widespread technnology when VR and AR become more common.

What this file contains is mainly a group of data structures useful on
implementing an infinite universe, that would be the NSPace standard for the
data transmit on SpaceNet, but due to its complexity it is probably to
left it on another proyect for parallel but not interdependant development.

###################################################################Descripcion:
SpaceNet es un modelo teorico en desarrollo para una realidad virtual
distribuida y estilo plug-and play de nodos (servidores), la idea es
crear un metaverso no controlado por una entidad privada o gubernamental
sino que se comporte como un estandar diseñado colectivamente.

Los computadores al conectarse a la spacenet estarian aceptando el estandar
y epezarian a procesar los datos de la red para mantenerla online

Tiene dificultades de implementacion referentes a la seguridad en la
transmision de datos y el reconocimiento de nodos corruptos que puedan
distorsionar datos de la red

Los errores en seguridad de transmision de dartos son producto de la
posible existencia de nodos corruptos en la red, por esto es necesario
tener una manera de detectar los distintos tipos de corrupcion de los nodos
y desconectarlos cuando ocurran, sin que se genere perdida de datos de la red
siendo esta quiza la unica manera de asegurar que sea viable. Tambien
es posible en caso que esto sea muy dificil acotar ciertas caracteristicas
en pos de aumentar la consistencia de la DB y mantenerlas en desarrollo
por ejemplo teniendo ademas del nodo DNS, nodos de vigilancia de alta latencia

Lo anterior se puede simplificar mucho si se encuentra una manera de hacer que
un nodo pueda computar datos externos sin que exista posibilidad de que
se haga una idea de lo que esta computando, asi el nodo DNS junto a los
vigilantes podrian comparar computacion en distintos nodos y cambiar el
enrutamiento de peticiones constantemente

La razon de tanto interes en la red es por la posibilidad de que sea una
tecnologia muy relevante cuando los dispositivos de realidad aumentada y
realidad virtual sean mas utilizados

Lo que contiene este fichero es principalmente un conjunto de estructuras de
datos utiles en implementar un universo infinito, que seria el estandar de
transmision de datos NSpace, pero debido a su complejidad es probablemente
mejor dejarlo para un proyecto aparte para desarrollo paralelo pero no
interdependiente.
*/
SubSpace = function SubSpace(cfg) {
  this.p = new NMath['vec'+cfg.dim].create();
  this.r = new NMath['mat'+cfg.dim].createIdentity();
};

Space = (function () {
})();

System = (function () {
})();

/**
* @module NPhysics
* contiene implementación, capas de soportar varias caracteristicas de
* primer estandar. Primera implementación:
*/
NPhysics = (function() {
  var simulate,
    simulation_types, SpaceNode, PhyNodem, UniversePhy;

  /**
  * @class UniversePhy
  * @desc: specific phy tree library describing fractal object data.
  * each tree is a free graph, a dictionary of fractal interrelated objects.
  * the two methods given allow easy managing of universes
  */
  UniversePhy = {
    /**
    * @method create
    * @desc copia un arbol descriptor de universo desde la
    * biblioteca de universos
    * @param uname universe tree name, defaults to 'real'
    */
    create: function(uname) {
      return UniversePhy.copy(UniversePhy.universes['real']);
    },

    copy: function(universe) {
      var universe_new,
        i,length, prop_value;

      for(prop in universe)
        if(prop != 'objects') {
          universe_new[prop] = universe[prop];
        }
        else {
          prop_value = universe[prop];
          for(i=0, length =prop_value.length; i<length; i++)
            universe_new.push(universe[i]);

        }
    },
    universes: [
      {
        name: 'real',
        objects: [
          {
            name: 'universe',
            //density cloud??
            //neural galactic system??
            //lets be clasic for now. A spherical matter distribution
            //a particle.
            phy_type: 'fluid',
            mass: 1,
            geom: function real_universe_geom() {

            }
          },
          {
            name: 'electron',
            //just a point
            phy_type: 'wave',
            geom: function electron_geom() {
              return {

              }
            },
            //electrons contains universe
            childs: [
              'universe'
            ]
          }
        ],
      }, {
        name: 'psychodelic',
        objects: [

        ]
      }
    ]
  }

  /**
  * phy objet descripcion:
  * es una descripción de universo recursiva, un arbol descriptor de
  * universo que se itera conforme se requiere informacion, puede ser
  * rizómico y por tanto soportar universos estructuralmente fractales
  *
  * Cada nodo es un objeto, cada objeto se compone de otros.
  * Y entre los objetos hay espacio (indexadores de espacio), tanto en la misma
  *  escala, como entre escalas
  *
  * Los objetos pueden cambiar de espacio contenedor (indexador) dependiendo de
  * cambios en su oposicion, configuracion, o propiedades como la cantidad
  * de energia que contienen, la razon de tenerlos constantemente indexadores
  * en los contenedores es para mantener la eficiencia lo mas alta posible
  * en calculos de colision y predictibilidad, aun falta hacer un estudio de
  * esto pero a grandez rasgos y con un estudio preliminar, es lo mejor
  * ademas permite tener la maleabilidad de crear spacios grid distribuidos
  * en multiples servidores
  *
  * campos:
  * -str name: nombre del tipo de objeto físico
  * -str geom: funcion generadora de geometria, vertices, triangulos, o modelo
  * -str phy_type: tipo de modelo fisico
  *   object: es un objeto discreto, masa puntual, mecánica clásica
  *   fluid: fluido, o agregado de partículas
  *   wave: es una onda, una vez existiendo, encontrarselo es probabilistico
  *
  * -float mass: masa proporcional a escala
  * -float speed_length
  * -string speed_deviation_type
  * -float speed_deviation
  * -[vector, string deviation, value] speed: velocidad
  * -float t_speed: velocidad proporcional a escala superior
  *
  * Propiedades de generación en medio contenedor:
  * [float, int exp] dist_parent_scale //determina escala en que se vuelve subobjeto de otro
  * -str dist_parent_type: //determina regiones de objetos que llenar con subobjetos
  *                      para cuando se encuentra en igual orden de magnitud
  *   uniform_space: llenar espacio uniformemente
  *   uniform_surface: llenar según área, densidad uniforme
  *   uniform_inner: llenar los triangulos de la geom con masa
  *   vertex: calcular subparticulas según vertex
  * -function dist_parent_f: una función que indica regiones de probabilidad
  *                          en ejes espaciales y escalares
  * -str dist_rot_parent_type: //análogo dos anteriores pero rotaciones
  * function child_generator(child, coords): configura propiedades especiales
  *                     de nodo hijo según coordenadas.
  *
  * recursion
  * array[PhyNode] childs:
  *
  *
  */

  PhyNode = function() {
    this.name;
    this.geom;

    this.mass;
    this.speed;
    this.scale;

    this.t_speed;

    this.dist_parent;
    this.dist_parent_type;
    this.dist_parent_f;

    this.child_generator;

    this.phy_type;
    this.childs=[];
   }

   PhyNode.prototype = {
   }

  /**
  * @class SpaceNode
  * @desc implementacion orientada a espacios basados en objetos
  * fractales (only object refractalization)
  *
  * el arbol fractal de espacios es una red que comunica objetos fractales,
  * los objetos fractales son uniones entre espacios, sistemas coordenados
  * distintos y que estan interrelacionados generativamente con un
  * conjunto de rizomias
  *
  * el campo phy es de la clase PhyNode
  */

  SpaceNode = (function() {
    function SpaceNode() {
      this.subunit_base = 4;
      this.phy_depth = 0;
      this.entity = new Entity();

      this.parent = null;
      this.childs = [];
      this.phytree = {};

    }
    SpaceNode.prototype = {
      copy: function() {

      }
    }
    return SpaceNode;
  })();



  simulation_types = {
    real: {
      //generates a virtual reality environment oriented to
      //universe and levels of organization
      create: function simulation_type_real (SpaceNode) {
        //SpaceNode.data = simulation_types.
      },
      defaults: {
        //node_cero: =
      }
    }
  }

  simulate = function(SpaceNode) {

    if(!SpaceNode.data)
      SpaceNode.data = simulation_types[SpaceNode.phy_type].create(SpaceNode);


  }

  return {
    simulate: simulate
  }
})();



/**
* @module: NSpace
* realidad virtual global
* es un interprete de datos externos para metaverso
* permite injeccion de servicios para configuracion de metaverso
* y sincronizacion con metaversos externos y ejecucion en múltiples
* protocolos distintos
* hasta que no sea necesario agregar compresion de datos o formatos
* alternos, no sera necesario crear estructura de interpretacion
* en el mejor de los casos, los datos siempre seran compartidos con este
* formato y no sera necesario implementar interpretacion a
* formatos ajenos a la descripcion js universal
*/
NSpace = (function () {
  var SpaceParser, SpaceNode, SpaceNodeService, SpaceNodeInjector, SpaceServices={};


  SpaceNodeInjector = (function() {
    function injectService(service) {
      SpaceSevices[service.name] = service.data;
    }
    return {
      injectService: injectService
    }
  })();

  SpaceServices.NNode = (function() {
    var parse, Node, random;

    /**
    * module:
    */

    Node = function() {
    }

    Node.defaults = {
      //space properties
      fractality : true,
      fractality_distribution_axis : 'spaceType', //dynamics| interleaved| mimics(spacetype)
      //subunit: cada voxel separado en n^3 subinidesdes (distribution multipier)
      fractality_distribution_depth_unit : 'subunit',
      //proporcion en la cual iniciar nuevo voxelamiento
      fractality_distribution_proportion: 0.0000001,  //flotante de reparación de errores, 7 digitos precision, mínimo (alguna forma de mantencion de coherencia)
      //elejido según dist hasta proxima aparicion de objetos en escala
      fractality_distribution_base: 4,
      fractality_horizontal_links : true,

      fractality_object_coord : true, //permite a los nodos objeto disparar nodos espacio
      fractality_object_coord_only : true,  //obliga a que todos los nodos espacios sean nodos objetos
      fractality_function : false,
      spaceType : 'Axial',
      spaceAxis : 'Euclid',
      spaceAxisNum : 4,
      //vert_density //obliga campos de conf. de distribution en cada nodo obj
      //phy_fractal: según información física de fractalización
      object_fractal_res : 'phy_fractal',
      phy_engine : 'nphysics',
      phy_type : 'real',  //on each scale, complex objects appears
      data: null,
      //space chunk properties
      depth : 'unlimited'
    }

    parse = function(SpaceNode) {
      var node = new Node();

      for(def in Node.defaults)
        node[def] = Node.defaults[def];

      for(def in SpaceNode.fields)
        node[def] = SpaceNode[def];

        //normalización valores


    }
    return {
      parse: parse
    }
  })();

  //unidad mínima de seguridad??? minimum security unit??
  SpaceNode=function SpaceNode(){
    this.arch='NNode';  //HSDL.js
  }
  SpaceNode.prototype = {

  }


  SpaceParser = (function(spaceNode){
    var parse;

    parse = function SpaceParser_parse(spaceNodeData) {
      var Space;

      try{
        Space = SpaceServices[spaceNodeData.arch].parse(spaceNodeData);
      }
      catch(e) {
        console.log(e)
        throw e;
      }

      return Space;
    }

    return {
      parse: parse
    }
  })();

  return {
    SpaceNodeInjector: SpaceNodeInjector,
    SpaceParser: SpaceParser,
    SpaceNode: SpaceNode
  }
})();


  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//all the functions point to a static reference => no memdirection
//solving after compiling
//it could be maintained, this pseudo-monolitic mode for multiple instances

renderer = (function() {
  var obj_list = [],
    mat4 = NMath.mat4,
    mat5 = NMath.mat5,
    vec4 = NMath.vec4,
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
      projection_3_far: 200.0,
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
      vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.ry, -Math.PI/4);
      camera3.p[1] += 200;

      /*
      camera3.p[0] += 200;
      camera3.p[2] += 200;
      vec3.rotateNormalizedRelative(camera3, camera3.rz, camera3.rx, -Math.PI/4);
      */
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
    context = twgl.getWebGLContext(options.container,{alpha:false});

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

    //blending
    context.enable( context.BLEND );
    //context.disable( context.DEPTH_TEST );
    context.blendFunc( context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA );


    math.mat = global_root.NMath['mat'+(config.dim+1)];
    math.mat_cartesian = global_root.NMath['mat'+config.dim];

    math.vec = global_root.NMath['vec'+config.dim];
    math.vec_homogenous = global_root.NMath['vec'+(config.dim+1)];

    //deprecated, to renderer object
    global_root.addEventListener('resize', resize, false);
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
      mat5.translate(m_cameraRotation, camera.p);
      mat4.translate(m_cameraRotation3, camera3.p);

      ///////////////////////////////////globalcamera matrix calculations
      if(config.stereo_dim) for(i=0;i<2;i++) {
        if(config.stereo_dim === 4) {
          //internal eye_translation*eye_rotation
          //eye rotate m_cameraRotation3
          mat5.identity(tmp_matrix5_1);
          mat4.identity(tmp_matrix4);
          /*
          :TODO:
          el visor entereoscopico n-d esta con errores en las regiones de
          alternación vectorial por ojo y propiedades matriciales de rotación en
          bases vectoriales elegidas
          */
          mat4.rotationPlane(tmp_matrix4,
          stereo_4_rotation_plane[0],
          stereo_4_rotation_plane[1],
          config.stereo_angle * ((i !== 0)? 1:-1) );

          //console.log(mat_common.str(tmp_matrix4));
          mat_common.from(tmp_matrix5_1,  tmp_matrix4);

          //eye translate
          vec4.scale(tmp_vec1, config.stereo_separator, ((i !== 0)? 1:-1) );
          mat5.translate(tmp_matrix5_1, tmp_vec1);

          //world -> eye, global*local
          mat5.multiply(tmp_matrix5_2, m_cameraRotation, tmp_matrix5_1);
          stereo.push(mat5.create());
          mat_common.invert(stereo[i],tmp_matrix5_2)
        }
        if(config.stereo_dim === 3) {
          //internal eye_translation*eye_rotation
          //eye rotate m_cameraRotation3
          mat4.identity(tmp_matrix4_1);
          mat4.rotateAxis(tmp_matrix4_1, 2,0,config.stereo_angle * ((i === 0)? 1:-1));
          //eye translate
          vec4.scale(tmp_vec1, config.stereo_separator, ((i === 0)? 1:-1) );
          mat4.translate(tmp_matrix4_1, tmp_vec1);

          //world -> eye, global*local
          mat4.multiply(tmp_matrix4_2, m_cameraRotation3, tmp_matrix4_1);
          stereo.push(mat4.create());
          mat_common.invert(stereo[i], tmp_matrix4_2);
        }
      }
      if(!(config.stereo_dim === 4)) {
        camera_rot_4=mat5.create();
        mat_common.invert(camera_rot_4, m_cameraRotation)
      }
      if(!(config.stereo_dim === 3)) {
        camera_rot_3=mat4.create();
        mat_common.invert(camera_rot_3, m_cameraRotation3)
      }

      for(obj_list_i=obj_list.length; obj_list_i--;) {
        obj_list_obj = obj_list[obj_list_i]

        //get obj rotation matrix
        mat_common.from(m_objectRotation,obj_list_obj.r, true)
        m_objectRotation[24] = 1;

        mat5.copy(matrix_tmp, m_objectRotation);
        mat5.translate(m_objectRotation, obj_list_obj.p);

        //start drawing
        context.useProgram(shader_info.program);
        twgl.setBuffersAndAttributes(context, shader_info, obj_list_obj.geom.buffers_info);

        //optimize with metaprogramatic precompiler
        for(i = 0, length = ( (config.stereo_dim)? 2:1 ) ; i < length; ++i) {
          //////////////////////////////////////4D level
          if(config.stereo_dim === 4) camera_rot_4 = stereo[i];

          mat5.multiply(matrix_tmp, camera_rot_4, m_objectRotation)

          //create perspective uniforms;
          mat5.multiply(PMVMatrix, PMatrix, matrix_tmp);
          mat5.inferiorProjection(uPMatrix1, uPMatrix2, PMatrix);
          mat5.inferiorProjection(uMVMatrix1, uMVMatrix2, matrix_tmp);
          mat5.inferiorProjection(uPMVMatrix1, uPMVMatrix2, PMVMatrix);

          //////////////////////////////////////3D level
          if(config.stereo_dim === 3) camera_rot_3 = stereo[i];
          mat4.multiply(PMVMatrix3, PMatrix3, camera_rot_3);

          twgl.setUniforms(shader_info, uniforms);
          if(config.stereo_dim) {
            if(i === 0)
              context.viewport(0, 0, canvas.width/2, canvas.height);
            else
              context.viewport(canvas.width/2, 0, canvas.width/2, canvas.height);
          }
          else context.viewport(0, 0, canvas.width, canvas.height);

          twgl.drawBufferInfo(context, (obj_list_obj.geom.buffers.indices.numComponents === 2)? context.LINES:context.TRIANGLES, obj_list_obj.geom.buffers_info);
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

  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

Shader = (function() {
  function Shader() {
    this.src = null;
    this.src_compiled = null;
    this.compiled = null;
  }

  Shader.prototype = {
    compile: function compile() {
      if(!this.src) return false;
      this.src_compiled = ShaderCompiler.compile(this.src);
    },
    load: function load(context) {

    }
  }

  return Shader;
})();

  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

GLNSLCompiler = (function() {
  var GrammarUtil,
    Vartypes;

  /**
  * Used to create recursive expressión trees
  *
  * a and b point to expresions (variable expression) and in
  * operantor == null this.a contains a variable (literal expression)
  */
  function Expression(opts) {
    this.src = opts.src || null;
    this.scope = opts.scope || null;

    this.a = opts.a || null;
    this.b = opts.b || null;
    this.operator = opts.op || null;
    //if operator == "function"
    this.function = opts.function || null;

    if(this.src)
      this.interpret();
  }

  Expression.prototype = {
    /**
    * each element its a regexp + operator identifier
    * for each expression, there are 3 parenthesis operator a, operator b, and
    * operation
    */
    operators: [
      {
        id: '=',
        //EQUALITY REQUIRES THAT LEFT SIDE OPERAND ITS THE VARIABLE
        //CONTAINER AND NOT ITS VALUE, FOR ELEMENT SELECTION, THIS CHANGES
        //NORMAL TRANSLATION.
        reg: /[^\+\-\^\|&!=<>%\*/](?:\+\+)*(?:--)*(=)[^=]/gi,
      },
      {
        id: '+',
        reg: /[^\+](?:\+\+)*(\+)[^\+=]/gi,
      },
      {
        id: '-',
        reg: /[^\-](?:--)*(-)[^-=]/gi,
      },
      {
        id: '*',
        reg: /(\*)[^=]/gi,
      },
      {
        id: '/',
        reg: /(\/)[^=]/gi,
      },
    ],

    /**
    * returns te end variable type after aplication of the operation
    */
    vartype: function vartype() {

    },
    /**
    * indicates wheter the operands-operand combination implicates a
    * right-operator replication,this is for optimization purposes
    * avoiding expresion operations multiplication on after-compilation
    * sentences
    */
    replicates: function replicates() {

    },
    /**
    * first, if this is a parenthesis, cuts the borders so it can process
    * the content. Then, converts all parenthesis into special variables
    * so they dont interfere with operators on this precedence layer
    * then, start from lowest precedence operators (the last executing)
    * and splits the expression on the lower it finds into the next
    * two expressions, then, starts the new expressions sending them
    * the code with the parenthesis instead of the variables
    */
    interpret: function interpret() {
      var re, res, i, j, l, l2, str_a, str_b
        code,
        c,
        parenthesis_last,
        parenthesis_level,
        parenthesis,
        parenthesis_symbol,
        parenthesis_table = [],
        operators = ['=', '+', '-', '*', '/'];

      re = /^\s*\((.*)\)\s*$/gi;

      code = this.src;
      while( res = re.exec(code) )
        code = res[1];

      //create parenthesis table

      for(i=0,l=code.length, parenthesis_level=0; i<l;i++) {
        c = code[i];
        if(c == '(') {
          if(parenthesis_level == 0)
            parenthesis_last = i;

          parenthesis_level++;
        }
        if(c == ')') {
          parenthesis_level--;
          if(parenthesis_level == 0) {
            parenthesis = code.substr(parenthesis_last, i+1);

            parenthesis_table.push(parenthesis);
            parenthesis_symbol = ' $'+(parenthesis_table.length-1)+" ";

            code = code.replace(parenthesis, parenthesis_symbol);
            i = parenthesis_last + parenthesis_symbol.length - 1;
          }
        }
      }

      //start spliting the operators from lower precedence into higher

      for(i = 0, l = code.length; i < l; i++) {
        c = code[i];
        for(j=0, l2=operators.length; j<l2; j++)
          if(c == operators[j]) {

            this.a = code.substr(0, i);
            this.b = code.substr(i+1, code.length-i);

            this.operator = operators[j];
            this.a =

            l2 = l = 0;
          }
      }

      //when there was no operator found, this is a variable
      if(!this.a) {

      }
    }
  }

  Vartypes = (function() {
    var types ={
      /**
      *
      */
      vecn: {
        exp: 'vec\d+',
        /**
        * creates type info from variable declaration information
        */
        constructor : function (data) {
          this.size = data.datatype.match(/\d/gi);
        },
        /**
        * expresion operator is an expression!!, not a variable!!
        * expresions only contain datatype info and expresion identifier
        * wich can be a variable identifier or a transparent temporary
        * identifier for temporal operantions cache
        *
        * into_variable can be a variable name or false,indicating to
        * return an array of the sentences without asignment instead
        */
        operations: {
          '[+-]': function addminus(operation, expresion_operator, into_variable) {

          }
        }
      },
      matn_m: {
        exp: 'mat\d(_\d+)',
        constructor: function(data) {

        },
        operations: {
          '\*': function multiply(operation, expresion_operator, into_variable) {

          }
        },
        valueAt: function nmat_at(i,j,n) {
          var p = j*n+i,
            mat = Math.floor( p/16 ); //matrix holding position
          p = mat*16 - p;
          j = Math.floor( p/4 );
          i = p - j*4;
          return ''+mat+'['+i+']['+j+']';
        }
      }
    }



    return {
      types: types,
    }
  })();

  GrammarUtil = (function(){
    var grammar_lists;

    grammar_lists = {
      datatypes: [
        'void',
        'bool',
        'int',
        'float',
        'sampler2D',
        'samplerCube',
        'vec\d+',
        'bvec\d+',
        'ivec\d+',
        'mat\d+',
        'mat\d+_\d+', //n*m matrix
      ],
      storage_qualifiers: [
        'const',
        'attribute',
        'uniform',
        'varying',
      ],
      precision_qualifiers: [
        'highp',
        'mediump',
        'lowp',
      ]
    };

    return {
      grammar_lists: grammar_lists,
    }
  })()

  /**
  * removes extra spaces and line feeds
  */
  function serialize(str) {
    var i, l, post = '';

    str = str.replace(/\n/ig, ' ');

    for(i = 0, l = str.length; i < l; i++) {
      if(!(str[i] == ' ' && post[post.length-1] == ' '))
        post += str[i];
    }

    return post;
  }

  /**
  * represents a variable in a scope
  */
  function Variable(opts) {
    this.sentence = opts.sentence || null;
    this.sentence_place = opts.sentence_place || -1; //wtf why?
    this.scope = opts.scope || null;

    //primitive or function
    this.type = opts.type || null;
    //array with datatype dependant data
    //primitives: variable declaration qualifiers
    //function: return and parameters variables
    this.qualifiers = opts.qualifiers || null;
    //object with more specific datatype data for primitives
    //like length
    this.type_data = null;
    //if this is a literal variable, this will contain the value string
    this.value = opts.value || null;

    this.name = opts.name || '';
    if(qualifiers)
      this.declare();
  }
  Variable.prototype = {
    operation: function operation() {

    },
    declare: function() {
      if(this.scope.variables[this.name])
        throw "variable "+this.name+" already declared";

      if(this.type == 'primitive') {
        if(this.qualifiers[3].match('vec')) {
          this.type_data = {
              length: Number( (/\d+$/).exec(this.qualifiers[3]) )
          }
          this.qualifiers[3] = 'vec';
        }
        if(this.qualifiers[3].match('mat')) {
          this.type_data = {
            x: Number( (/\d+/).exec(this.qualifiers[3]) ),
            y: Number( (/\d+$/).exec(this.qualifiers[3]) )
          }
          this.qualifiers[3] = 'mat';
        }
      }

      this.scope.variables[this.name] = this;
    }
  }

  /**
  * represents a single glsl sentence
  * has inf. about variables, post-translation, and source location
  *
  * this.number -> the number of sentences before this plus 1;
  * this.thisScope -> filled only on sentence-block containing sentences
  */
  function Sentence(opts) {
    this.src = opts.src;
    this.scope = opts.scope || null;
    this.range = opts.range || null;
    this.number = opts.number || -1;

    this.type = opts.type || null;

    //variables or expressions in declaration sentences
    this.components = opts.components || [];
    //only scope containing sentences (ifs, fors, etc)
    this.thisScope = null;
    //only in declaration sentences
    this.variables = null;


    this.out = null;


    if(this.src && this.scope && this.number)
      this.interpret();
  }
  Sentence.prototype = {
    /**
    * fills the sentence information interpreting the sentence str
    * components list, its type and type related cfg,
    *
    * recognizes the sentence type and configures it accordingly
    * types:  declaration, function call, expression,
    *         null, etc
    *     currently only types declaration, expression and null
    *     are implemented, expression sentences include assignation
    *       null represents an instruction that doesnt needs translation
    *       or that does nothing at all
    */
    interpret: function interpret() {
      var src = this.src, re, str, res, i, opts,
        lists = GrammarUtil.grammar_lists;

        //declaration
      if( res = RegExp(
        "\s*(invariant)+\s*("+lists.storage_qualifiers.join('|')+")*\s*"+
        "("+lists.precision_qualifiers.join('|')+")\s*"+
        "("+lists.datatypes.join('|')+")\s*(.*)", 'gi'
        ).exec(src) ) {

        //verify sentence
        res.shift();
        res[0] = res[0] || null;
        res[1] = res[1] || 'none';
        if(!res[2]) throw "no precision qualifier in variable declaration";
        if(!res[3]) throw "no datatype on variable declaration";


        //variable constructor dara
        opts = {
          sentence: this,
          scope: this.scope,
          type: 'primitive',
          qualifiers: [res[0], res[1], res[2], res[3]],

          }

        str = res[4];
        re = /([^,]+)/g;

        i = 0;
        while(res = re.exec(str)) {
          opts.sentence_number = i++;
          opts.name = (/\w+/g).exec(res);
          if(res.match('=')) {

          }
        }
      }
      else if( src.match(/^\s*\w+\s*/gi) ) { //expression

      }

      //this.type obnviously is null => this will not be processed in any way
    },
    /**
    * generates a valid GLSL sentence (or group of sentences) that mimics the
    * functionality on this sentence and stores it in this.out as a str
    * it works differently on each sentence type
    */
    translate: function() {

    }
  }

  /**
  * represents a single scope
  */
  function Scope() {
    this.rootScope = null;
    this.parent = null;
    this.childs = [];

    this.range = null;
    this.variables = {};
    this.sentences = [];

    this.cacheVariables = [];
  }
  Scope.prototype = {
    setParent: function(parent) {
      this.unsetParent();
      this.parent = parent;
      parent.childs.push(this);

      this.rootScope = parent.rootScope || parent;
    },
    unsetParent: function() {
      if(!this.parent) return;

      this.parent.childs.splice(this.parent.childs.indexOf(this),1);
      this.parent = null;
    },
    getVariable: function(varname) {
      var link, scope = this, variable;

      while(!(variable = scope.variables[varname]) && scope.parent)
        scope = scope.parent;

      return variable;
    },
    /**
    * ensures that a given type has its cache variables instantiated for
    * operations upon it
    * this is useful only during translation and final code writting
    *
    * adds them to variables array and cacheVariables sentence array for
    * post-writting usage
    */
    ensureTypeCache: function ensureTypeCache(type) {
      if(this != this.rootScope )
        this.rootScope.ensureTypeCache(type)
    }
  }

  /**
  * represents the code structure as a scope recursive tree that contains
  * variables and sentences
  */
  function CodeTree(src) {
    this.src = src;
    this.rootScope = null;
    this.out = null;

    if(src)
      this.interpret(src);
  }
  CodeTree.prototype = {
    /**
    * create scope tree and fills data
    */
    interpret: function(src) {
      var i, l, c,
        sentence, sentence_number, index_a,
        scope_parent,
        scope_current = new Scope();

      for(i = 0, l = src.length, sentence_number = 0, index_a = 0;
          i<l ; i++) {

        c = src[i];

        if(c == '{') {
          scope_parent = scope;
          scope = new Scope();
          scope.setParent(scope_parent);
          index_a = i+1;
          scope.range = [i];
        }
        if(c == '}') {
          scope.range.push(i);
          scope = scope_parent;
          index_a = i+1;
        }

        //to recognize also scope-creating sentences
        if(c == ';' || c == '{') {
          sentence = new Sentence({
            src: src.substr(index_a, i-1),
            range: [index_a, i-1],
            number: sentence_number++,
            scope: scope,
            });

            index_a = i+1;
        }

      }

      this.rootScope = scope;
    },
    /**
    * detects sentences that use glnsl syntax or datatypes and ask them to
    * translate
    */
    translate: function() {
      if(!this.rootScope) return null;

    },
    /**
    * it uses the translated sentences versions to generate an
    * updated src string
    */
    write: function() {

    }
  }



  function compile(src, cfg) {
    var code_tree = CodeTree(src);

    code_tree.translate();

    return code_tree.write();
  }

  console.log(document.getElementById("testshader").innerHTML)
  return {
    compile: compile
  }
})();


  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

Physic = (function() {

  var SpaceGraph,
    Space,
    SpaceNode,
    Transform,
    PhysicModules;

  SpaceGraph = (function() {

    function SpaceGraph() {
      this.spaces = {}
      this.transforms = {}
    }

    SpaceGraph.prototype = {

    }

    return SpaceGraph;
  })()

  /**
  * Space and SpaceNode implement an axis oriented topology
  * cappable of optimize them for collisisions and interspace
  * intersections.
  *
  * Space is the SpaceNode network container, and holds common configurations
  * for every SpaceNode.
  * SpaceNode is a recursive representation of a n-axis
  *
  */

  /**
  * Space
  *
  * type - kind of space network that holds // add opts new types or separate them??

  * dim - dims of SpaceNode network
  * size - number of subnodes along an axis
  * length - length of the subnode on depth 0, to generate space coordinates

  * root - the root node of the SpaceNodes network, root.parent equals null
  * level - the number of levels deper the network is

  * lib_vec - corresponding vectorial lib
  * lib_mat - corresponding matrix lib
  */

  Space = (function() {

    /**
    * Space Constructor
    *
    * @param dim -
    *
    * @param size -
    * @param length -
    * @param level -  0 is for bottom, give the level for root, huper node
    *
    * @param fill - if fill Space Network on creation
    */
    function Space(opts) {
      this.type = 'Euclid';

      this.dim = opts.dim;
      this.size = opts.size;
      this.length = opts.length;
      this.level = opts.level;

      //cache dimensional libs
      this.lib_vec = NMath['vec'+this.dim];
      this.lib_mat = NMath['mat'+this.dim];

      this.p = opts.p || this.lib_vec.create();
      this.r = opts.r || this.lib_mat.create();

      //store default node creation parameters for this system
      this.nodesOpts = {
        space: this,
        level: this.level,
        fill: false,

        dim: this.dim,
        size: this.size,
        p: this.lib_vec.create(),
      };
      this.root = new SpaceNode(this.nodesOpts);

      if(opts.fill)
        this.root.fill();

      this.nodesOpts.fill = undefined;
    }

    Space.prototype = {
      /**
      * add hupper levels to the space system
      */
      enlarge: function(repeat) {
        //create new root node
        var root, old_root_index, i, opts;
        opts.level = ++this.level;
        opts.p = null;
        opts.parent = undefined;
        root = new SpaceNode( opts );

        //determine root index inside of the new root
        //set it on the center
        if(this.size%2)
          old_root_index = Math.floor(root.childs.length/2);
        //alternate on non-centers to ensure
        //radial node distribution, avoid eternal extends, etc
        else {
          old_root_index = Math.pow(this.size,this.dim)/2;
          //add or sustract the alf of every subdimension
          for(i=dim-1; i>0; i--)
            old_root_index += ((this.level%2)?-1:1)*Math.pow(this.size, i)/2;
        }

        //relink
        this.root.parent = root;
        this.root.index = old_root_index;
        root.childs[ old_root_index ] = this.root;
        this.root = root;

        //calculate new root system relative position
        this.root.setPChild( root.childs[old_root_index] );

        if(repeat)
          this.enlarge(--repeat);
      },
      /**
      * removes an entity from the space system
      */
      remEnt: function(ent) {
        if(!ent.container) return;

        var objects = ent.container.objects,
          i = 0; l = objects.length;
        for(;i<l;)
          if(objects[i] && objects[i].indexOf(ent) != -1)
            objects[i].splice( objects[i].indexOf(ent), 1 );

        ent.container = null;
      },
      /**
      * adds an entity to the space system
      * checks that the systems has instantiated the corresponding space
      * node and then adds it to the objects array[0] (entity) (checking
      * coherent instantiation of it)
      */
      addEnt: function(ent) {
        var node, array;
        node = this.root.include(ent.p);
        array = node.objects[0];

        if(ent.container)
          this.remEnt(ent);

        if(!array)
          array = node.objects[0] = Array();
        if(array.indexOf(ent) != -1)
          return;

        array.push(ent);
        ent.container = node;
        return node;
      }
    }

    return Space;
  })();

  /**
  * Represents single space net unit, if its a bottom SpaceNode
  * it will contain lists for objects inside their respective physic
  * processor type (for example, Entities in Dynamic array)
  *
  * space - Space containing general configs
  * level - Space Index depnes, 0 equals bottom
  * p - system relative position,
  *
  * parent - Spatially containing node
  * siblings - Siblings linear Array
  * capsuled - indicates whether all siblings are occupied
  *
  * last_visited - last time it was processed by physic processor
  * active - If registered for physics processing
  * index - index for fast translation into parent relative position
  *        the mapping is from a n-d vector such as
  *         p[0] + p[1]*size + p[2]*size*size [..]
  *
  * childs - Child Spaces linear Array
  * objects - Dictionary containing the objects inside the SpaceNode
  *       separated in arrays, each for each corresponding processor type
  *
  *
  */
  SpaceNode = (function() {

    /**
    * constructor
    * fill isnt an automatic option because is rarely needed and
    * extremply complicates code simplicity and opts caching
    +
    * space -
    * parent -
    * level -
    *
    * dim -
    * size -
    *
    * index -
    * p - requires
    *          undefined = calculate with setP, index and parent required
    *          null = leave empty
    */
    function SpaceNode(opts) {

      this.space = opts.space;
      this.level = opts.level;
      this.length = Math.pow(this.space.length, this.level+1);

      this.parent = opts.parent;
      this.siblings = new Array( opts.dim*2 );
      this.capsuled = false;

      //set index and parent connection
      this.index = opts.index;
      if(!this.parent)
        this.index = -1;
      if(this.index >= 0)
        this.parent.childs[this.index] = this;

      this.p = opts.p;
      if(this.index >= 0 && opts.p === undefined)
        this.setP();
      this.childs = new Array( Math.pow(opts.size,opts.dim) );

      this.last_visited = -1;
      this.active = false;

      if( this.level == 0 )
        this.objects = []
      else
        this.objects = [];

    }

    /**
    * for dynamic space generation
    */
    SpaceNode.prototype = {
      /**
      * calculates the position traslation from parent p vector
      * to child p given the index and child level
      */
      parentPSeparation: function(child_index, child_level, p) {
        if(!p)  p = this.space.vec_lib.reate();

        if(child_index instanceof Number)
          child_index = this.indextop(index);

        var index_p_middle = this.space.size/2, dim, dims,
          length_transform = Math.pow(this.space.length, child_level);

        for(dim = 0; dim < dims; dim++)
          p[dim] = (child_index[dim]+0.5  -index_p_middle)*length_transform;

        return p;
        },
      /**
      * configures p according to parent data
      */
      setP: function(p) {
        if(!p) p = this.space.vec_lib.create();

        this.parentPSeparation(this.index, this.level, p);
        this.space.vec_lib.add(p, p, this.parent.p);

        this.p = p;
      },
      /**
      * configures p using specific child data
      */
      setPChild: function(child, p) {
        if(!p) p = this.space.vec_lib.create();

        this.parentPSeparation(child.index, child.level, p);
        this.space.vec_lib.sub(p, child.p, p);

        this.p = p;
      },
      /**
      * returns a parent and enlarges the space if necesary
      */
      parentEnsured: function() {
        var parent = this.parent;

        if(!parent) {
          this.space.enlarge();
          parent = this.parent;
        }

        return parent;
      },
      /**
      * converts coord to a index vector
      * doesnt check if coord is inside this node
      */
      coordtoindexp: function(coord, p) {
        if(!p) p = this.space.vec_lib.create();
        var dim = 0, dims = this.space.dim,
          p_this = this.p,
          length = this.length,
          length_mid = length/2,
          unit_size = length/this.space.size;

        for(;dim<dims;)
          p[dim] = Math.floor(coord[dim] - p_this[dim] + length_mid)/unit_size;

        return p;
      },
      /**
      * converts coord to a index integer
      * doesnt check if coord is inside this node
      */
      coordtoindex: function(coord) {
        var dim = 0, dims = this.space.dim,
          size = this.space.size,
          p_this = this.p,
          length = this.length,
          length_mid = length/2,
          unit_size = length/this.space.size,
          index=0;

        for(;dim<dims;)
          index += Math.floor(coord[dim] - p_this[dim] + length_mid)/unit_size*
            Math.pow(size, dim);

        return p;
      },
      /**
      * informs whether coord is inside this node
      */
      isInside: function(coord) {
        var i=0, dim = this.space.dim,
          p_this = this.p,
          limit = this.length/2;

        for(;i<dim;)
          if( Math.abs(coord[i] - p_this[i]) > limit)
            return false;

        return true;
      },
      /**
      * ensures that a given location is internalized
      */
      include: function(coord) {
        //if coord doesnt fit this node search on parent
        if(!this.isInside(coord)) {
          this.parentEnsured().include(coord);
          return;
        }

        var index, opts, child;
        //already reached bottom node
        if(!this.level) return this;

        index = this.coordtoindex(coord);
        child = this.childs[index];

        if(!child) {
          opts = this.space.nodesOpts;

          opts.parent = this;
          opts.level = this.level-1;

          opts.index = index;
          opts.p = undefined;

          child = new SpaceNode(opts);
        }

        return child.include(coord);
      },
      /**
      * creates sibling on given direction
      * doesnt check tree consistency
      */
      extend: function(direction, length) {
        if(this.siblings[direction])
          return;

        var orientation = (direction%2)? 1:-1,
          dim = Math.floor(direction/2),
          size = this.space.size;
          index_max = this.childs.length,

          parent = this.parentEnsured(),
          node,  node_index,
          opts = this.space.nodesOpts,

        opts.p = undefined;
        opts.level = this.level;

        ///////////////////configure opts

        //get index
        node_index = this.index + orientation*Math.pow(size, dim);
        //get parent
        //gets outside of parent, need to find a parent
        if(node_index >= index_max || node_index < 0) {
          //parent needed doesnt exists => extend parent into sibling
          if(!parent.siblings[i])
            parent.extend(direction, length);

          opts.parent = parent.siblings[i];
          node_index = this.index - orientation*(size-1)*Math.pow(size,dim);
        }
        else
          opts.parent = parent;
        opts.index = node_index;

        /////////////////////create-link node
        node = new SpaceNode(opts);
        this.siblings[direction] = node;
        node.siblings[direction - orientation] = this;

        return node;
      },
      /**
      * ensures that siblings of node are instantiated
      * doesnt check tree conectivity
      */
      capsule: function(depth) {
        var direction=0, directions = this.space.dim*2;
        for(;direction < directions;) {
          this.extend(direction);
          if(depth)
            this.sibling[direction].capsule(depth-1);
        }
        return this;
      },
      /*+
      fills the childs array with childs
      opts are the options passed to childs

      travels to each child using a position vector and sets its index
      for each child, the process repeats recursively if fill == true
      */
      fill: function(opts) {
        //first creates childs, then executes connect_childs
        var  index = 0, dim, child, sibling,
          space = this.space,
          dim_top_index = space.dim-1,
          size = space.size,

          pos = space.lib_vec.create(),
          opts;

        opts = {
          parent: this,
          space: space,
          level: this.level-1,

          p: undefined,
          dim: dim_top_index+1,
          size: size,
        };

        //iterate until every position is checked
        for(; pos[dim_top_index] != size;) {

          //create child only if it not exists
          if(!this.childs[index]) {
            opts.index = index;
            child = new SpaceNode(opts);

            if(opts.fill)
              child.fill(opts);
          }

          pos[0]++;
          index++;
          // renormalize position vector
          for(dim = 0; dim < dim_top_index; dim++)
            if(pos[dim] == opts.size) {
              pos[dim] = 0;
              pos[dim+1]++;
            }
        }

        this.connect_childs();

        return this;
      },
      /**
      * connects childs of node
      * to their siblings, posibly in a recursive manner
      */
      connect_childs: function() {
        var parent = this.parent,
          dim, dims = this.space.dim, directions = dims*2, i, d,
          dim_top_index = dims-1,
          size = this.space.size,
          pos = this.space.vec_lib.create(),
          sibling,
          index = 0,
          childs = this.childs,
          child, siblings, sibling;

        //iterate each child
        for(; pos[dim_top_index] != size;) {
          child = childs[index];
          if(!child) continue;

          child_siblings = child.siblings;

          ////start connecting unconnected siblings
          //for each direction
          for(dim=0; dim < directions;) if(!child_siblings[dim]) {
            i = ( dim%2 )? -1 : 1 ;//orientation
            d = Math.floor(dim/2);  //current dimension

            //its a limit node
            if( pos[d] == ( (i==-1)?0:(size-1) ) ) {

              /**if parent brother exists, check if sibling on that brother
              * exists
              */
              if( this.siblings[dim] )
                //get posibly existing child in sibling
                sibling = this.siblings[dim].
                  childs[ child.index - i*(size-1)*Math.pow(size, d) ];
              else
                sibling = null;

            } else //not a limit node
                sibling = this.childs[ child.index + i*Math.pow(size, d ) ];

            if(sibling) {
              //double link:
              //invert direction
              child_siblings[dim] = sibling;
              sibling.siblings[ dim-i ] = child;
            }

          } //siblings ready

          child.connect_childs();

          ////common iteration code
          pos[0]++;
          index++;
          for(dim=0; dim < dim_top_index; dim++) {
            if(pos[dim] == size) {
              pos[dim] = 0;
              pos[dim+1]++;
            }
          }

        }

      },
      /**
      * check sibblings of itself using
      * parent space data
      */
      connect: function() {
        var dim, i, d,
          directions = this.space.dim*2,
          size = this.space.size,
          siblings = this.siblings,
          parent = this.parent,
          pos = this.indextop(this.index);

        for(dim = 0; dim < directions;) if(!siblings[dim]) {
          i = ( dim%2 )? -1 : 1;
          d = Math.floor(dim/2);

          //its a limit conection
          if( pos[d] == (i==-1)?0:(size-1) ) {

            /**if parent brother exists, check if sibling on that brother
            * exists
            */
            if( parent.siblings[dim] )
              //check if searched child brother exists
              sibling = parent.siblings[dim].
                childs[ this.index - i*(size-1)*Math.pow(size, d) ];
            else
              sibling = null;

          } else  //not a limit node
            sibling = parent.childs[ this.index + i*Math.pow(size, d ) ]

          if( sibling ) {
            //double link:
            //invert direction
            siblings[dim] = sibling;
            sibling.siblings[ dim-i ] = this;
          }

        }

      },
      sibling: function(axis, positive) {
        return this.siblings[ axis*2 + ((positive)?1:0) ];
      },
      /**
      * converts p to its corresponding integer index
      */
      ptoindex: function(p) {
        var i,
          l = p.length, index = 0, size = this.space.size;

        for(i=0; i<l; i++)
          index += p[i]*Math.pow(size, i);

        return index;
      },
      /**
      * converts index to its corresponding n-d position
      */
      indextop: function(index, p) {
        if(!p) p = this.space.lib_vec.create();
        var i, offset,
          size = this.space.size;

        for(i = p.length-1; i >= 0; i--) {
          offset = Math.pow(size, i)

          while(index >= 0) {
            index -= offset;

            if(index >= 0)
              p[i]++;
          }
          index += offset;

        }


        return p;
      },
      iterate_bottom: function(f) {
        var i=0, childs=this.childs, l = childs.length, child;
        for(;i<l;) {

          child = childs[i];
          if(child && child.active) {
            if(!child.level)
              f(child);
            else
              child.iterate_bottom(f);
          }

        }
      },
      iterate: function() {

      }
    }

    return SpaceNode;
  })();

  Transform = (function() {

  })();

  PhysicModulesEnum = [];

  PhysicModules = {
    /**
    * placeholder for normal entity instance
    */
    Entity: (function() {
      function convert() {

      }

      function apply() {

      }

      return {
        convert: convert,
        apply: apply,
      }
    })(),
    /**
    * Represents a basic cynetic object
    */
    Cynetic : (function() {
      var mod;
      function convert(opts) {
        if(!this.dp)
          this.dp = NMath['vec'+this.p.length];
        if(!this.dr)
          this.dr = NMath['mat'+this.p.length];
      }

      function apply(node, dt) {
        var i = 0; childs = node.objects[mod.i]; l = childs.length, child,
          vec_lib = node.space.vec_lib, mat_lib = node.space.mat_lib;

        for(;i<l;) {
          child = childs[i];
          vec_lib.scaleAndAdd(child.p, child.p, child.dp, dt);
          mat_lib.scaleAndAdd(child.r, child.r, child.dr, dt);
        }
      }

      return mod = {
        convert: convert,
        apply: apply,
      }
    })(),

    /**
    * Represents physical object
    */
    Dynamic : (function(){
      var prot, ent_prot;

      function convert(opts) {

        this.type = opts.type;
        switch(this.type) {

          case 'solid':

            this.shape = opts.shape;
            this.mass = opts.mass;
            this.dumpness = opts.dumpness;
            this.friction = opts.friction;

            this.equilibrium = false;
            break;

          default:
        }

      }

      function apply(node) {

      }

      return {
        convert: convert,
        apply: apply,
      }

    })(),

  };
  //instantiates the physic modules enumeration object for fastmodule access
  (function(){
    PhysicModulesEnum.push(PhysicModules.Entity);
    PhysicModules.Entity.i = 0;

    var i=1;
    for(module in PhysicModules) {
      if(module === PhysicModules.Entity) continue;

      module.i = i++;
      PhysicModulesEnum.push(module);
    }
  })();

  return {
    SpaceGraph: SpaceGraph,
    Space: Space,
    SpaceNode: SpaceNode,
    Transform: Transform,
    PhysicModules: PhysicModules,
  }
})()


  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


  /*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**

*/
Engine = (function() {

  function Engine(type) {

    this.frames = {};

    this.outputs;
    this.spaceHierarchy;

    this.world;
  }

  Engine.prototype = {
    /**
    * opts {
    * repeat = true, framename = main
    * }
    */
    loop: function loop(opts) {

    },
    configure: function configure(opts) {

    }
  }

  return Engine;
})()

/**
* A frame is the minimal unit of execution managed by the engine
* It is a arbitrary functions that gets executed according to its
* configuration, this can include change its behaviour in response
* to the execution of other frames
*
* They disseminate the td parameter they recieve when executed into
* any other frame executed from it
*
* They can automatically loop, on 3 ways:
*   custom function, a requestAnimationFrame, and a normal timeout
*
* They can be linked to other frames to adapt to them
* the types of link are:
*   ends: this frame will trigger the execution of the next, next being
*           frames wich relate trought this relation, and those frames that
*           will be executed after this, are counted like being parts of
*           this, "endings"
*   requires: the frames here have to be executed at least one time in
*           between two executions of this frame
*   already: the frames here have to be executed this same execution frame
*           before the execution of this frame (like requires with
*           small time constrain)
*
*/
Frame = (function(){

  var requestAnimationFrame,
    cancelAnimationFrame,
    frame_already_threshold;

  requestAnimationFrame = global_root.requestAnimationFrame;
  cancelAnimationFrame =  global_root.cancelAnimationFrame;
  frame_already_threshold = 20;

  function Frame(opts) {
    if(!opts) opts = {};

    this.td = opts.td || ((opts.times)? 1000/opts.times : 20);
    this.tl = null;
    this.tn = null;
    this.repeat = opts.repeat || false;
    this.repeat_type = opts.repeat_type || 'timeout';
    this.repeatID = null;

    this.f = opts.f || null;

    this.links = {
      starts: [],
      ends: [],
      requires: [],
      already: [],
    }

    //setup links object
    var i, l, link;
    for(link in opts.link)
      this.links[link] = opts[link]
    //double link before links
    for(i=0, l = this.links.starts.length; i<l ;i++)
      this.links.starts[i].ends.push(this);

  }

  Frame.prototype = {
    cancelRepeat: function Frame_cancelRepeat() {
      if(!this.repeatID) return;

      if(this.repeat_type == 'timeout')
        clearTimeout(this.repeatID);
      if(this.repeat_type == 'animframe')
        cancelAnimationFrame(this.repeatID);

      if(this.repeat instanceof Function)
        this.repeat.cancel.call(this);

      this.repeatID = null;
    },
    /**
    * td: temporal delay
    *   if not given, calculated has current time - last time executed
    */
    execute: function Frame_execute(td) {
      var root, i, l, tnow = Date.now();
      if(this.repeatID) { this.cancelRepeat(); this.tn = Date.now(); }
      if(!this.tl)
        this.tl = Date.now();
      if(!td)
        td = tnow - this.tl;


      /**
        start cycle
      */
      for(i=0, l = this.links.requires.length; i<l; i++)
        if(this.links.requires[i].tl < this.tl)
          this.links.requires[i].execute();

      for(i=0, l = this.links.already.length; i<l; i++)
        if(tnow - this.links.already[i].tl > frame_already_threshold )
          this.links.already[i].execute();

      //execute the ones this is before
      for(i=0, l = this.links.ends.length; i < l; i++)
        this.links.ends[i].execute();

      //cycle finished
      this.tl = Date.now();

      if(this.repeat) {
        if(this.repeat instanceof Function) {
            this.repeat();
        }

        else {
          root = this;

          if(this.repeat_type == 'timeout') {
            this.repeatID = setTimeout(function(){root.repeatID = null; root.execute();}, this.dt)
            this.tn = this.tl + td;
          }
          if(this.repeat_type == 'animframe') {
            this.repeatID = requestAnimationFrame(function(){root.repeatID = null; root.execute();});
            this.tn = undefined;
          }
        }
      }

    }
  }

  return Frame;
})()


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
    Physic: Physic,
    GLNSLCompiler: GLNSLCompiler,
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
