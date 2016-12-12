try {
  if(twgl)  //requires
    try {
      (function NEngineBootStrap () {

        var global_root = this;

        	/**
  # NEngine.js
  <br/>
  A n-dimensional, full featured graphical-physical engine for the web.
<br/><br/>

  ## Features:
<br/><br/>

  ### N-dimensional geometry library and N-dimensional physical library:
  <br/>
  It contains basic n-dimensional polyhedrals and a basic geometry collision library to use in the physical system.
<br/><br/>

  ### Extended shader language:
  <br/>
  To create the n-dimensional shaders, it features an extended version of the Opengl Shading language called OpenGl N Shading Language or NSL using a small transcompiler that extends OGSL datatypes like matrices and vectors into N.
<br/><br/>

  ### Easy N-dimensional design and shader creation with Space Hierarchies:
  <br/>
  To manipulate multiple data spaces, and allow the existence of 3d spaces interacting with 5d spaces and handle simultaneously the two types of physics to later connect them into the same space, and to also simplify the shader organization and creation in the rendering, organizes its data into a Space Hierarchy that represents in a graph like manner, the spaces involved and the transformations in between them.
<br/><br/>

  ### New possible universes:
  <br/>
  Space Hierarchies allows to represent non-linear transformations like Bézier curves or fractal mappings from, for example object space into world space that modify the rendering and the physics for the interacting objects in those spaces. Thats right!, you can now create 3D hipersphere curved spaces inside 4D universes and simulate outer space accelerated expansion, or put many of those 4D universes inside six dimension spaces, curved like 4D hiperplanes, to construct complex space systems on which lot of different and interesting things can happen. You imagine literally seeing your galactic army crossing the universe bending into another reality?, now you can.
<br/><br/>

  ### Really fast:
  <br/>
  For all of its capabilities it has a good performance, that can work very good also in a smartphone, thanks to NMath optimization system on which it compiles extremely optimized hardcoded math operations in the given dimension in real time. Anyway, i need support improving the data structures in physics system and overall engine design because i´m not an expert.
<br/><br/>

  ## How it works:
<br/><br/>

  It builds its optimized mathematical functions from NMath, and directly projects dimension 'n' into dimension 'm' (commonly m = 3)  inside the vertex shader, using webgl. A port to other platforms, with other rendering power would be interesting, but always maintaining its web approach so currently i´m more interested in translate parts of it into something easy to translate into asm, like c.
<br/><br/>

  Currently uses a little bit of twgl to work.
<br/><br/>
  ## Usage:

* @fileoverview
* @author Nicolás Narváez
* @version 0.5.8.10
*/

/**
@namespace NEngine
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

global_root.NEngine = (function NEngineInit () {

  var math, Obj, renderer, geometry,
    util,
    Engine,
    Frame,
    Physics,
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
/**
@namespace geometry
@memberof NEngine
@desc All geometry stuff, geoms and utilitary functions
*/
geometry = (function() {

  /**
  @memberof NEngine.geometry
  @function clone
  @desc Creates a copy in memory of the geometry
  @param {Geom} original
  @return {Geom} copy
  */
  function clone(g) {

  }

  /**
  @memberof NEngine.geometry
  @function boundingBox
  @desc configures Geom boundingBox data
  @param {Geom} geom
  @return {Geom} this
  @
  */
  function boundingBox(g) {
    var box = {};

    return box;
  }
  /**
  @memberof NEngine.geometry
  @function boundingSphere
  @desc sets value of boundingSphereRadius
  @param {Geom} geom
  @return {Geom} this
  */
  function boundingSphere(g) {
  }

  /*
  function join()
  */

  /**
  @memberof NEngine.geometry
  @method concat
  @description
  Creates new geom space and fills it with the geoms in the given order
  if an entity is passed, applies transformations before adding
  TODO: n geoms to one (optimize)
  @param {Geom} a first geom
  @param {Geom} b last geom
  @param {Boolean} [keep_geom=false] if true, then the first geom will be
  modified and returned as the joined geom
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

  /**
  @memberof NEngine.geometry
  @method forEach
  @desc String forEach for geometries, applies transformations if it
  recieves an entity
  */
  function forEach(src) {

  }


  /**
  @memberof NEngine.geometry
  @method twglize
  @desc Convierte una geometria desde el formato Geom a el de twgl para
  usarse con la libreria
  @param {Geom} Geom La geometria a convertir
  @return {twglGeom} La geometria transformada
  */
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

  /**
  @memberof NEngine.geometry
  @class Geom
  @desc Represents a Geometry object, contains collision data, vertex,
  colours and faces lists, those are in a data dictionary so adding more
  data lists is easy (like uniform data)
  it also contains the buffers generated for the shader

  <br/><br/>
  Al the data lists follow the webgl format for buffers, you can check the
  format in their documentation, but here is a small review: <br/><br/>

  A 3D vertex list looks like this: <br/> [ v1_x, v1_y, v1_z, v2_x, v2_y, ... ,
  vn_y, vn_z ] <br/>
  All elements being float type <br/><br/>
  For colors, they correspond to the vertex they match:<br/>
  [v1_cr, v1_cg, v1_cb, [v1_ca] , v2_cr, .. , vn_cb, [vn_ca] ] <br/>
  v1_cr means vertex 1 colour red, as you can see, each color can
  have 3 or four components (colour alpha is optional), but anyway this is
  just shader dependant, better look at the webgl docs! <br/><br/>
  The faces list and the edges list are the same, but their elements
  are Integers instead of Floats and they represent an index in the vertex
  data list, for example, a face list like this: [0, 2, 1] means a triangle
  that has the first vertex in it first edge, the third on its second and so
  on. <br/><br/><br/>
  TODO: prepare standard simplex array for n-dimensional tesselation (faces for
  n-dimensional objects have (n-1) dimensions) and a simple way to cut them
  in shader program or a similar mechanism
  @property {Object} data - contains data lists of elements
  @property {Array} data.vertex
  @property {Array} data.color
  @property {Array} data.edges
  @property {Array} data.faces

  @property {Object} buffers - this contains the shader program buffers,
  one of the is generated for each data list

  @property {Integer} dim - dimensionality of the geom

  @property {Float} boundingBoxMin - normally, shortest vertex component
  @property {Float} boundingBoxMax - normally largest vertex component
  @property {Float} boundingSphereRadius - bigger distance to a vertex
  */
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
    /**
    @memberof NEngine.geometry.Geom.prototype
    @method concat
    @param {Geom} joining_geom the geom to join into this
    @desc a shortcut to concat, like calling concat(this, ...)
    @return {Geom} concat(this, ...)
    */
    function concat_geom(b) {
      return concat(this, b);
    }
    /**
    @memberof NEngine.geometry.Geom.prototype
    @method twglize
    @desc shortcut to twglize(this)
    @return {twglGeom} twglize(this)
    */
    function twglize_geom() {
      return twglize(this);
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

/**
@memberof NEngine.geometry
@function grid{n}

@param {Object} options cfg object
@param {Integer} options.size the subdivisions of the grid for each axis
@param {Integer} options.size_{component} you can target specific components
(x, y, z, w) to override options.size on it
@param {Float} options.length the length of the grid on all axis
@param {Float} options.length_{component} you can target specific components
(x, y, z, w) to override options.length on it
@param {Boolean} options.wire if generate wire or face data on data buffers

@desc creates a grid geometry, a grid is understod as a 2 dimensional net, this
time we extend it to n dimensions. Each axis repeats the grid onto it,
perpendicular to all the others. You specify de dimension choosing the n
letter: (grid3, grid4)
<br/><br/>
TODO: extend to N
@return {Geom} grid finished geometry
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

/**
@memberof NEngine.geometry
@function simplex{n}

@param {Object} options cfg object
@param {Integer} options.size the size (length) of the simplex
@param {Boolean} options.wire if generate wire or face data on data buffers

@desc creates a simplex, a simplex is the simplest regular polyhedra on a given
dimension, resembles the triangle but in the given dimension. For n-d a simplex
has n-1 vertex and many faces has (n-1)-d subsimplex (subcollections) that
tesellate it (dont collide when filling it)  <br/><br/>
You specify de dimension choosing the n letter: (simplex3, simplex4)
<br/><br/>
TODO: extend to N
@return {Geom} simplex finished geometry
*/
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
    i = (ops.wire)?new GLINDEX_ARRAY_TYPE([ //if a wire
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
    new GLINDEX_ARRAY_TYPE([  //if 3D face (4D sub-filling)
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

/**
@memberof NEngine.geometry
@function octahedron{n}

@param {Object} options cfg object
@param {Float} size its length, size

@desc just the n-dimensional extension of the octahedron
<br/><br/>
You specify de dimension choosing the n letter: (octahedron3, octahedron4)
<br/><br/>
TODO: extend to N
@return {Geom} octahedron finished geometry
*/

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

/**
@memberof NEngine.geometry
@function axis{n}

@param {Object} options cfg object

@desc an axis in n-d is just n orthogonal lines that intersec in the origin
this one has a different colour for each line so you can use it as a guide
<br/><br/>
You specify de dimension choosing the n letter: (axis3, axis4)
<br/><br/>
TODO: extend to N
@return {Geom} axis finished geometry
*/

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

/**
@memberof NEngine
@class SubSpace
@desc represents minimal space data, used in defining entities or similar
stuff, a rotation plus a translation, possible deprecated on the near future
when processing efficiency gets more tested
@prop {Vector} p position, length = dim
@prop {Matrix} r rotation, length = dim*dim

@param {Object} cfg
@param {Integer} cfg.dim - dimension of the subspace
*/
SubSpace = function SubSpace(cfg) {
  this.p = new NMath['vec'+cfg.dim].create();
  this.r = new NMath['mat'+cfg.dim].createIdentity();
};

/**
@memberof NEngine
@class Camera
@desc Represents a camera. It has a position, rotation, and viewport
transformation, it offers methods for easy input connection

@prop {Object} cfg - configuration object used on construction

@prop {Integer} dim
*/
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

/**
@memberof NEngine
@class Entity
@desc Has minimal abstract object information position, rotation, meta-data,
geometry, material, collision config.
<br/><br/>
Its extremely useful to represent a dynamic object that can interact physically
with its environment, can be pluged into physics spaces and have meta-data.

@prop {Integer} dim - Dimensionality of Ent.
@prop {Geom} geometry - The visual geometry for the entity
@prop {Material} material - The material data for the shader
@prop {Object} collider - Collision processing info (type of detection,
geom, etc)
@prop {Object} phy - Physical data, for physical processors (elasticity, mass,
friction coeficient, etc)
@prop {SpaceNode} container - The SpaceNode that holds this entity
*/
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

    this.collider = null;
    this.phy = null;

    this.container = null;
  }

  Entity.defaults = {
    dim: 4,
  }

  Entity.prototype = {
    /**
    @memberof NEngine.Entity.prototype
    @method set
    @param {(PhysicModule|String|Integer)} type - The module that defines the
    type you want to set into this entity, it can be the module, its
    registered name, or its enum Integer in the PhysicModulesEnum
    @param {Object} opt - The options passed to the convert function of the
    module.
    @desc Requires that the entity is previously registered on a space node.
    <br/><br/>
    Sets a physics type on the entity, using a module object, module name, or
    module enum. Checks whether the objects array in the entity container (a
    SpaceNode) has the needed object type array instantiated, and conects this
    entity to it so it will be processed by the processors of the given type.
    <br/><br/>
    This way you can configure an entity to be of a given type and be
    processed by the processors that process that type in the SpaceTree
    */
    setType: function set(type, opts) {
      var container = this.container, objects;
      if(!container) return;

      //sanitizes type parameter
      if(type instanceof String || typeof type == 'string')
        type = NEngine.Physics.PhysicModules[type];
      else  if(type instanceof 'Number' || typeof type == 'number')
        type = NEngine.Physics.PhysicModulesEnum[type];

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

/**
@memberof NEngine
@class Obj
@desc An old implementation of Entity. If you have problems with camera control
use this instead, but beware, the new Camera object will make all you do with
this object useless.
@deprecated
*/
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
            if( (i === 0 && config.stereo_crossed) || (i !== 0 && !config.stereo_crossed) )
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
    PMatrix: PMatrix,
    PMatrix3: PMatrix3,
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

/**
@namespace GLNSLCompiler
@memberof NEngine
@desc Contains all related to GLNSLCompiler classes, functions and
  utilities \n \n
  Using the compiler: \n
  Just call "compile(code, config)", extra information is
  on the function docs
  TODO: scope resolution, currently only non-creating scope sentences are
  translated, like non [ifs, fors, functions, etc]
*/
GLNSLCompiler = (function GLNSLCompilerLoader() {
	var module = {}

	/**
@namespace Util
@memberof NEngine.GLNSLCompiler
@desc General utilities, that could be rehusable outside this application,
	like glsl grammar dictionaries, or more atomic and agnostic
	transcompiling utils.
*/
var Util = (function UtilLoader() {
var module = {}
/**
@namespace Grammar
@memberof NEngine.GLNSLCompiler.Util
@desc Contains glsl grammar definition, useful grammar lists
*/
module.Grammar = (function(){
  var grammar_lists, grammar_;

  grammar_ = {
    identifier: "[_a-zA-Z][_\\w]*"
  }

  grammar_lists = {
    datatypes: [
      'void',
      'bool',
      'int',
      'float',
      'sampler2D',
      'samplerCube',
      'vec.*\\s',
      'bvec.*\\s',
      'ivec.*\\s',
      'mat.*\\s',
      'mat.*\\s',//n*m matrix
      '[\\w\\s]+["\']', //dynamic type
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
    grammar_: grammar_,
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
returns if given char is scaped or not
*/
function is_scaped(src, i) {
  var scape = 0
  while(src[i-scape-1] == '\\') scape++
  return scape%2 != 0
}

/**
@class SymbolTree
@memberof NEngine.GLNSLCompiler.Util
@desc This was created in a moment of despair. Now i cant find a use to it...
	mmmm, maybe just a middle-level tool
  <br/>
  Helps handling source mapping, stripping, scaping, etc. Provides
  functions to translate on its context (subsections of it, etc) like
  interpolate. </br> </br>
  the level of source mapping it makes is low, doesnt create recursive
  SymbolTree trees, but does create symbols trees
@prop {String} src - Initial src str
@prop {Object<Symbol_key, str>} symbols - Maps mapped source symbols into
  the src, each symbol contains the mapping into src from mapped
@param {String} src -
*/
function SymbolTree(src) { if(!(this instanceof SymbolTree)) return new SymbolTree(src)
	this.src = src
	this.symbols = {root: src}
	this.symbols_count = 0
}
SymbolTree.prototype = {
	delimiter_pairs: {
	'(': ['\\(','\\)'],
	'{': ['\\{','\\}'],
	'[': ['\\[','\\]'],
	},
	/**
	@method
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree
	@desc rot tree accessor
	*/
	root: function root() {
		return this.symbols['root']
	},
	/**
	@method
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree
	@desc returns symbols found in str as a dictionary
	*/
	symbols: function symbols(str) {
		var syms = [], sym,
			reg = RegExp(/\"(.*?)\"/gi),
			res

		while(res = reg.exec(str))
			if(sym = this.symbols[res[1]]) syms.push(sym)

		return syms
	},
	/**
	@method
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree
	@desc interpolates all the symbols in the str
	*/
	interpolate: function interpolate(str) {
		var syms = this.symbols, sym

		while(res = (/".*"/gi).exec(str))
			str = str.replace(res[0], syms[res[0]])

		return str
	},
	/**
	@method
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree
	@desc Takes the strings delimited by the delimiter off, into a mapping
	avoids scaped delimiters and transparently resolves nested expressions
	including them in each strip ( 'aaa(asd(ss)asd)l' => 'aaa"symbolkey"l' ),
	stripts every encounter
	*/
	strip: function(delimiter, exclude) {
		var regexp, res, res_list=[], regexp_,
			map = this.root(),
			symkey, sym, self = this

		delimiter = this.delimiter_pairs[delimiter] || delimiter

		if(delimiter instanceof Array) {
			regexp = delimiter[0]+'(.*)'+delimiter[1]
			regexp = new RegExp(regexp, 'gim')

			while(res = regexp.exec(map))	res_list.push(res)

			res_list.forEach(function(e) {
				symkey = '"'+self.symbols_count+'"'
				sym = (exclude)? e[0]: e[1]

				map = map.replace( sym, symkey)
				self.symbols[symkey] = sym

				self.symbols_count++
			})

		}
		this.symbols['root'] = map
		return this
	},
}

module.serialize = serialize
module.is_scaped = is_scaped
module.SymbolTree =  SymbolTree
return module;
})()

	module.Util = Util
	var Expression = (function ExpressionLoader() {
/**
* @memberof NEngine.GLNSLCompiler
* @class Expression
* @desc a and b point to expresions (variable expression) and in
* Used to create recursive translable expressión trees
*
* operator == null this.a contains a variable ("literal expression")
* if operator == 'function' then a points to function and b to parametters
*   expressions
*/
function Expression(opts) {
  this.src = opts.src || null;
  this.sentence = opts.sentence || null
  this.scope = opts.scope || opts.sentence.scope || null;

  this.a = opts.a || null;
  this.b = opts.b || null;
  this.inside_parenthesis = false;
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
      reg: /([^\+\-\^\|&!=<>%\*/](?:\+\+)*(?:--)*)(=)([^=])/gi,
    },
    {
      id: '+',
      reg: /([^\+](?:\+\+)*)(\+)([^\+=])/gi,
    },
    {
      id: '-',
      reg: /([^\-](?:--)*)(-)([^-=])/gi,
    },
    {
      id: '*',
      reg: /()(\*)([^=])/gi,
    },
    {
      id: '/',
      reg: /()(\/)([^=])/gi,
    },
  ],

  /**
  the variable type of the object returned by the expressión
  */
  vartype: function vartype() {

    return {
      replicates: false
    }
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
  * then splits the text by the lower precedence operator, and starts
  * the new expressions sending them the code with the parenthesis instead
  * of the variables
  */
  interpret: function interpret() {
    var re, res, i,
      src = this.src, src_map,
      operators = this.operators, op;

	 console.log('variable expression input: ', this.src )

    re = /^\s*\((.*)\)\s*$/gi;
    while( res = re.exec(src) ) {
		this.inside_parenthesis = true
		src = res[1];
    }

    //create parenthesis table
	src_map = Util.SymbolTree(src)
	src_map.strip('(').strip('[')
	src = src_map.root()

    //split by the lower operator precedence, if found, start resolving
    //recursively
    for(i = 0, l = operators.length; i < l; i++) {
      op = operators[i]
	  res = op.reg.exec(src)

	  if(res) {
		  this.operator = op

		  this.a = new Expression({
			  sentence: this.sentence,
			  src: src_map.interpolate(
				  src.substr(0, res.index+res[1].length) )
		  })

		  this.b = new Expression({
			  sentence: this.sentence,
			  src: src_map.interpolate(
				  src.substr(res.index+res[1].length +res[2].length) ),
		  })

		  i=l
	  }
    }

    //when there was no operator found, this is a variable or a literal
    //or a function
    if(!this.a) {
		res = (/^\s*([_a-z][_a-z0-9]*)\s*(\(([^]*)\))*/gi).exec(src)
		console.log('variable exp', src, res)

		if(res && res[1] && !src.match('\\[')) {	//isnt a literal
			this.a = this.scope.getVariable(res[1])
			console.log('getting variable', res[1], this.a)

			if(res[2]) { //function
				this.b = src_map.interpolate(res[3])	//get arguments
				this.op = 'function'
			}
		}
		else
			this.a = src	//literal
    }

  }
}

return Expression
})()
/*
TODO:
	- define constructor dynamic_variables
	- connect dynamic_variables to getVariable
	- test first variable declaration translations
	- translate first expressions
	- start translating full code 
*/

	module.Expression = Expression
	var Variable = (function VariableLoader() {


/**
@memberof NEngine.GLNSLCompiler
@class Variable
@desc Represents a variable in a scope

@prop {Sentence} sentence - The sentence containing var declaration
@prop {Integer} sentence_place - Place in the declaration sentence
@prop {Scope} scope - Container Scope

@prop {String} type - "primitive" or "function"
@prop {Object} type_data: object with more specific datatype data
  for primitives is on the format provided by Vartypes.types
@prop {Array} qualifiers - array with datatype dependant data <br/>
  primitives: variable declaration qualifiers <br/>
      format: [invariant, storage, precision, typeCodeName] <br/>
  function: return and parameters variables <br/>
      format: [return, params [..]]

@prop {String} value - Given value, if this is a literal
  variable (value variable)
@prop {String} name - Variable name

@param {Object} opts - The options object
  @param {Sentence} opts.sentence - The sentence containing var declaration
  @param {Integer} opts.sentence_place -
  @param {Scope} opts.scope -

  @param {Stxring} opts.type - "primitive" or "function"
  @param {Array} opts.qualifiers - storage, precission, return value, etc

  @param {String} opts.value -
  @param {String} opts.name -
*/
function Variable(opts) {
  this.sentence = opts.sentence || null
  this.sentence_place = opts.sentence_place || 0
  this.scope = opts.scope || opts.sentence.scope || null

  //typological data
  this.type = opts.type || null
  this.qualifiers = opts.qualifiers || null
  this.type_data = null

  //variable specific
  this.value = opts.value || null
  this.name = opts.name || ''

  if(this.qualifiers && this.type) {
    this.config()

    if(this.name)	this.declare()
  }
}
Variable.prototype = {
  /**
  @memberof NEngine.GLNSLCompiler.Variable
  @desc Sets it type_data
  */
  config: function config() {
    if(!(this.type == 'primitive')) return

    var datatype, types = VarTypes.types,
      type, prim_qualifier = this.qualifiers[3],
      reg_res

    for(datatype in types) {
      type = types[datatype]
      reg_res = RegExp(type.exp).exec(prim_qualifier)
      if(reg_res)
        this.type_data = type.constructor( this.qualifiers, reg_res )

      break;
    }

    this.type_data
  },
  /**
  @memberof NEngine.GLNSLCompiler.Variable
  @desc registers to the variable dictionary in the scope
  @throws Error if its identifier was already declared
  */
  declare: function() {
    if(!this.scope || !this.name) return

    if(this.scope.variables[this.name])
      throw "variable "+this.name+" already declared";


    //register to variable scope
    this.scope.variables[this.name] = this;
  }
}

return Variable

})()

	module.Variable = Variable
	/**
@namespace Vartypes
@memberof NEngine.GLNSLCompiler
@desc Contains all operation-resolving code, dependand on the specific
  variable type
*/
var VarTypes = (function() {
  /**
  @memberof NEngine.GLNSLCompiler.Vartypes
  @class VarType
  @desc Its prototype depends on the specific vartype
  @prop {Object} operations - Operation handler functions
  @prop {String} codename - A unique identifier for the vartype, calculated has
    precision + prim_type
  @prop {RegExp} type - The regexp that matches the type.

  */
  var type, types ={
    /**
    They fill the type_data of variables, help sharing
    code among different configurations of primitives for the same
    primitive datatypes <br/>

    */
    vecn: {
      exp: /vec(\d+)/gi,
      /**
      * creates type info from variable declaration information
      */
      constructor : function (qualifiers, reg_res) {
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
      exp: /mat(\d+)(_(\d+))*/gi,
      /**
      Sets codename from variable
      */
      constructor: function(qualifiers, reg_res) {
        //if(reg_res[])
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
    },
    scalar: {
      exp: /(bool|int|float)/gi,
      constructor: function(qualifiers) {

      }
    },
  }

  /**
  Append to each type construcotr, the type name to the resulting type object
  */
  for(type in types)
    types[type].constructor = (function() {
    var type_name = type,
      type_obj = types[type],
      type_constructor = type_obj.constructor;

    function VarType(qualifiers) {
      if( !(this instanceof VarType) )
        return new VarType()

      type_constructor.call(this, qualifiers)
      this.type = type_name
      this.codename = qualifiers[2] || '' + qualifiers[3]
    }
    VarType.prototype = type_obj

    return VarType
  })()


  return {
    types: types,
  }
})();

	module.VarTypes = VarTypes
	var Sentence = (function SentenceLoader() {


/**
@memberof NEngine.GLNSLCompiler
@class Sentence
@desc represents a single glsl sentence has inf. about variables,
  post-translation, and source location every range is in global (rootScope)
  coordinates

@prop {String} src - Sentence code excluding semicolon
@prop {Scope} scope - containing scope
@prop {Integer[]} range - the indexes that limit this.src inside source code
@prop {Integer} number - the index of this sentence in the scope sentence list;

@prop {String} type - declaration, expression (this has subtypes: f.call,
  operation, etc), null, etc <br/>
    null represents an instruction that doesnt needs translation or that does
    nothing at all
@prop {Scope} thisScope - filled only on sentence-block containing sentences
@prop {Expression|Expression[]} components - expressions in variables
	declaration, sentences in flow modifiers
@prop {Variable[]} variables - The variables declarated

@param {Object} opts - The options object
  @param {String} opts.src
  @param {Scope} opts.scope
  @param {Integer[]} opts.range
  @param {Integer} opts.number
  @param {String} opts.type
  @param {Scope} opts.thisScope
  @param {Expression|Expression[]} opts.components
*/
function Sentence(opts) {
  this.src = opts.src;
  this.scope = opts.scope || null;
  this.range = opts.range || null;
  this.number = opts.number || -1;

  this.type = opts.type || null;
  //only scope containing sentences (ifs, fors, etc)
  this.thisScope = opts.thisScope || null;

  this.components = opts.components || [];
  this.variables = [];
  this.strings = opts.strings || []

  //result sentence
  this.out = null;


  if(this.src && this.scope && this.number) {
    this.scope.addSentence(this);
    this.interpret();
  }
}
Sentence.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Sentence
	@desc fills the sentence information interpreting the sentence str components
	list, its type and type related cfg, recognizes the sentence type and
	configures it accordingly currently only types declaration, expression and
	null are implemented, expression sentences include assignation
	*/
	interpret: function interpret() {
		var src = this.src, re, str, str_map, res, i, opts, srcmap,
			lists = Util.Grammar.grammar_lists, variable, expression;

		if ( src.match(/^\s*for/gi) ){ //for
			this.type = 'for'
		}
		else if ( src.match(/^\s*while/gi) ){ //while
			this.type = 'while'
		}
		else if ( src.match(/^\s*if/gi) ){ //if
			this.type = 'if'
		}
		else if ( src.match(/^\s*else/gi) ){ //else
			this.type = 'else'
		}
		else if ( src.match(/^\s*switch/gi) ){ //switch
			this.type = 'switch'
		}
		else if (this.thisScope) {
			//structs also are here
			this.type = 'function'
		}
		/*
		detects declaration
		initiates scope variables
		*/
		else if( res = RegExp(
				"\\s*(invariant)*\\s*("+lists.storage_qualifiers.join('|')+")*\\s*"+
				"("+lists.precision_qualifiers.join('|')+")*\\s*"+
				"("+lists.datatypes.join('|')+")*\\s*([^]*)", 'gi'
			).exec(src) ) {
			console.log(res)

			this.type = 'declaration'

			//verify sentence
			// format: invariant, storage, precision, name
			res.shift();
			res[0] = res[0] || null;
			res[1] = res[1] || 'none';
			if(!res[3]) throw "no datatype on variable declaration";

			//variable constructor data
			opts = {
				sentence: this,
				type: 'primitive',
				qualifiers: res,
			}

			//interpolate dynamic variables
			str_map = Util.SymbolTree(res[4])
			str_map.strip('(')
			str = str_map.root()

			re = /([^,]+)/g;
			this.variables = [];

			while(res = re.exec(str)) {
				console.log('variable declared:',res)
				opts.sentence_place = this.variables.length;
				opts.name = (/\w+/g).exec(res)[0];

				console.log('variable opts: ',opts)
				variable = new Variable(opts);
				this.variables.push(variable);

				if( res[0].match('=') ) {
					expression = new Expression({
						sentence: this,
						src: str_map.interpolate(res[0]),
					})
				}
				else expression = null
				console.log('variable expression: ',expression)
				this.components.push(expression);
			}
		}
		else if( src.match(/^\s*\w+\s*/gi) ) { //expression
			this.type = "expression"

		}
		else
			this.type = null
	},
	/**
	@memberof NEngine.GLNSLCompiler.Sentence
	@desc Tells you if this needs translation
	@return {Boolean}
	*/
	needsTranslation: function() {
		var needs = false;
		if(this.type == 'declaration' || this.type == 'expression') {
			this.variables.forEach(function(e){
				if(e.translatable) needs = true
			})
		}

		return needs
	},
	/**
	@memberof NEngine.GLNSLCompiler.Sentence
	@desc generates a valid GLSL sentence (or group of sentences) that mimics the
	functionality on this sentence and stores it in this.out as a str it works
	differently on each sentence type
	@return {String} translated
	*/
	translate: function() {

	}
}
return Sentence
})()

	module.Sentence = Sentence
	var Scope = (function ScopeLoader() {

/**
@memberof NEngine.GLNSLCompiler
@class Scope
@desc Represents a recursive Scope tree. <br/> <br/>
  The rootScope contains the cache of the temp variables
  used in intermediate operations (on translated code). This cache
  gets added to the begining during translation

@prop {CodeTree} code_tree - On rootScope, points to container CodeTree
@prop {Scope} rootScope - Root Scope of the tree
@prop {String} src - Contained code, currently only root-scope has

@prop {Scope} parent - Parent Scope
@prop {Scope[]} childs - Child Scopes

@prop {Integer[]} range - Start and end index of code in rootScope.src
@prop {Object.<String, Variable>} variables - Dictionary object for scope variables
@prop {Object.<String, Variable>} variables - scope variables generated on ask
		constructor functions, dim-dependant functions, etc
@prop {Sentence[]} sentences - Holds scope sentences

@prop {Object.<TypeCodeName, CacheData>} cacheVariables -  contains
  current new temp_variables for extended datatypes
@prop {Object} cacheVariables.typeCodeName - A specific datatype cache
@prop {Variable[]} cacheVariables.typeCodeName.vars - The cache variables
@prop {Variable[]} cacheVariables.typeCodeName.history - The cachevariables
  arranged by last used
*/
function Scope(opts) {
  this.code_tree = null;

  this.rootScope = null;
  this.src = null;

  this.parent = null;
  this.childs = [];

  this.range = null;
  this.variables = {};
  this.dynamic_variables = {};
  this.sentences = [];

  this.cacheVariables = {};
}
Scope.prototype = {
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc Correctly sets the parentScope
  */
  setParent: function(parent) {
    this.unsetParent();
    this.parent = parent;
    parent.childs.push(this);

    this.rootScope = parent.rootScope || parent;
  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc Correctly unsets the parentScope
  */
  unsetParent: function() {
    if(!this.parent) return;

    this.parent.childs.splice(this.parent.childs.indexOf(this),1);
    this.parent = null;
  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc Recursively in the scope tree searches the variable
  @param {String} varname - Target variable name
  @return {Variable} Return null if it cant be find
  */
  getVariable: function(varname) {
    var link, scope = this, variable;
    while(scope) {
      if(variable = scope.variables[varname]) break

      scope = scope.parent;
    }

    return variable;
  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc If this scope is the scopeRoot or not
  @return {Boolean} isScopeRoot
  */
  isRoot: function() {
    return !this.rootScope || (this.rootScope == this)
  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc Ensures that a given type has its cache variables instantiated for
    operations upon it, this is useful only during translation and final
    code writting. <br/>
    Adds them to variables array (avoid colisions) and cacheVariables
    (inform cache creation) sentence array. This affects only rootScope
    (only a single copy of each typecache is necessary) <br/> <br/>
    cache variable names: ___GLNSL_cache_(typeCodeName)_(cacheindex)
  @param {Variable} variable - The variable to ensure cache, needs to
    have its qualifiers, and type_data set
  */
  ensureTypeCache: function ensureTypeCache(variable) {
    if( !this.isRoot() )
      return this.rootScope.ensureTypeCache(variable)

    var cache, i, l, type=variable.data_type,
      codename = type.codename

    if(! (cache = this.cacheVariables[codename]) ) {
      cache = this.cacheVariables[codename] = {
        vars: [],
        history: []
      }

      //create cache
      for(i=0,l=3; i<l; i++) {
        cache.vars.push(
          Variable({
            scope: this,
            type: 'primitive',
            qualifiers: [null, 'none',  //those arent relevant to cache scoping
              variable.qualifiers[2],
              variable.qualifiers[3]],
            name: "___GLNSL_cache_"+ codename +'_'+i
          })
        )
        cache.history[i] = cache.vars[i]
      }
    }

  },
  /**
  @memberof NEngine.GLNSLCompiler.Scope
  @desc Iterates over the cached variables to avoid dataloss on
    two-handed cache operations (they require 3 cache vars)
  @param {Variable} variable - Contains datatype description
    (precision+datatype)
  @return {Variable} variable - The cache variable you needed
  */
  getTypeCache: function getTypeCache(variable) {
    this.ensureTypeCache(variable)
    var codename = variable.data_type.codename,
      cache = this.cacheVariables[codename],
      res = cache.history.shift()

    cache.history.push(res)

    return res
  },
  addSentence: function(sentence) {
    sentence.number = this.sentences.push[sentence];
  },
  built_in: {
	  variables: {
	  },
	  dynamic_variables: {
		  'vecn': {
			  regexp: /vec(\d+)/gi,
			  //generator functions have to be called from a scope
			  gen: function vecn_constructor_scopevarinit(reg_res) {
				  return new Variable({
					  scope: this,
					  type: 'function',
					  name: reg_res[0]
				  })
			  }

		  },
	  },
  },
}

return Scope
})()

	module.Scope = Scope
	var CodeTree = (function CodeTreeLoader() {

/**
@memberof NEngine.GLNSLCompiler
@class CodeTree
@desc Represents the code structure as a scope recursive tree that contains
variables and sentences, it holds general tree data and objects, the
recursive scope chain is implemented by the scope objects starting
by the root "this.rootScope", it also gives you interfaces to manipulate it,
generate an interpretation (interpret()) of the source, translate it
(translate()) semantically-structurally, and then write it down (write()).
:TODO:
  implement SrcMap usage, to standarize code manipulation across different
    semantic-level objects

@prop {String} src - the source code for this tree
@prop {String} out - The translated output from the last usage
@prop {Scope} rootScope - The root of the scope tree, scope objects contain
  most of the relevant data: variables, sentences, etc.
@prop {Sentence[]} sentences - The sentences in the whole codetree, they also
  are indexed in their respective scopes, thought sentence.scope.sentences
*/
function CodeTree(src, js_variables) {
  if(!(this instanceof CodeTree))
    return new CodeTree(src, js_variables);

  this.js_variables = js_variables || {}
  this.src = {
    original: src,
    mapped: null,
    symbols: {
      strings: [],
    }
  }
  this.out = null;

  this.rootScope = null;
  this.sentences = [];

  if(src)
    this.interpret();
}
CodeTree.prototype = {
  /**
  @memberof NEngine.GLNSLCompiler.CodeTree
  @method interpret
  @desc create scope tree and fills with sentences, also maps each string to
    a symbols in the src mapping, referenced has "string_number"

    TODO: pass all transofgmrations to srcmap actions

  @param {String} src - The source code to interpret, this.src is default
  */
  interpret: function interpret(src) {
    var r, reg, str,
      i, i_o, l, c,  //index, index_original, length, character
      in_string = false,
      in_string_scape,
      strings = [],
      strings_map,
      string,
      sentence, //holds last created sentence object
      index_a,  //start of current sentence ( for´s, if´s, etc, also count )
      scope_parent,
      scope_current;

    if(!src) src = this.src.original
    else this.src.original = src

    // remove comments
    this.src.original = src = src.
      replace(/\/\*.*?\*\//gi, '').
      replace(/\/\/.*?\n/gi, '')

    //execute js
    reg = /'(.*?)'/gi
    while(r=reg.exec(src))
      //replace each captured js str with its execution
      this.src.original = src = src.
        replace(r[0], this.shader.js_execute(r[1]).res )

    strings_map = this.src.symbols.strings
    this.src.mapped = src

    scope_current = new Scope()
    scope_current.src = this.src;
    scope_current.range = [0]
    scope_current.code_tree = this;

    for(i=0, i_o=0, l = src.length, sentence_number = 0, index_a = 0;
        i<l ; i++, i_o++) {

      c = src[i];

      //end string
      if(in_string) {
        if(c == in_string) {

          //handle scaped string delimitter
          in_string_scape = 0 //will contain number of scapes
          while(src[i-in_string_scape-1] == '\\')
            in_string_scape++

          if(in_string_scape%2) { //wasnt scaped

            string.range.push(i_o)
            string.value = src.substr(string.range_mapped[0],
              string.range_mapped[1] - string.range_mapped[0] + 1)
            //strip the string
            src = this.src.mapped = src.substr(0, string.range_mapped[0]+1) +
              (strings_map.length-1) +
              src.substr( string.range_mapped[1])

            //restore index, state
            i = string.range_mapped
            in_string = false
            continue
          }
        }
      }
      //start string
      else if(c == '"' || c == "'") {
        in_string = c

        string = {
          value: null,
          range: [i_o], //the range on src.original
          range_mapped: [i] //the range on the src.mapped
        }
        strings.push(string)
        strings_map.push(string)
        string.range_mapped.push(
          i+ (""+(strings_map.length-1)).length + 1
        )
        continue
      }

      if(!in_string) {

        if(c == '{') {
          scope_parent = scope_current;
          scope_current = new Scope();  //TODO:get scope from last sentence
          scope_current.setParent(scope_parent);
          scope_current.range = [i];
        }
        //{: to recognize also scope-creating sentences
        if(c == ';' || c == '{' || c == '}') {
          sentence = new Sentence({
            src: src.substr(index_a, i),
            range: [index_a, i-1],
            scope: (c=='{')? scope_parent: scope_current,
            thisScope: (c=='{')? scope_current: null,
            strings: strings,
          });
          this.sentences.push(sentence)
          index_a = i+1  //inmediatly after [{,}] symbol
          strings = []
        }
        if(c == '}') {
          scope_current.range.push(i);
          scope_current = scope_parent;
        }

      }

    }
    scope_current.range.push(src.length - 1)

    this.rootScope = scope_current;
  },
  /**
  * detects sentences that use glnsl syntax or datatypes and ask them to
  * translate
  */
  translate: function translate() {
    if(!this.rootScope) return null;

    var i, l, sentences = this.sentences, sentence,
      src = this.src,
      out = "",
      a = 0, b;

    //for each sentence that needs translation
    for(i=0, l = this.sentences.length; i<l; i++) {
      sentence = sentences[i];
      if(sentence.needsTranslation()) {

        //add translated sentence to previous non-translated content into out
        b = sentence.range[0];
        out += src.substr(a, b) + sentence.translate();
        a = sentence.range[1]+1;
      }
    }

    //add remaining piece.
    b = src.length;
    out += src.substr(a,b);
    return this.out = out;
  },
  /**
  * TODO separate code sintesis from code translation
  * code translation should be able to detect specific regions that have
  * changed, and write also should be
  * it uses the translated sentences versions to generate an
  * updated src string
  */
  write: function write() {

  },
}

return CodeTree
})()

	module.CodeTree = CodeTree
	var Shader = (function ShaderLoader() {

/**
@class Shader
@memberof NEngine.GLNSLCompiler

@prop {Object<varname, value>} js_variables - A dictionary indicating the
    js variable values in glnsl js interpolation, they represent a state
    machine for computing the final shader projection
*/
function Shader(opts) {
	if(!(this instanceof Shader)) return new Shader(opts)

	this.src = opts.src || ''
	this.code_tree = null
	this.out = null

	this.js_variables = opts.js_variables || {}
	this.uniforms = opts.uniforms || {}
	this.attributes = opts.attributes || {}

	//OpenGL Shader Program
	this.program = null
}

Shader.prototype = {
	/**
	executes the src str adding code_tree.shader.js_variables to its context
	TODO currently only one line expression evaluation functions allowed
	TODO develop arbitrarily complex js (possible using function expression)
	*/
	js_execute: function js_execute(src, opts) {
		var f, args, keys , body, res, vars

		res = {}

		vars = this.js_variables
		keys = Object.keys(vars)

		//TODO(maybeready) sending js_variables by parameters allows updating
		//results withouth recompiling function
		args = keys.join(",")
		body = "var "+
			keys.map(function(e){
				e+"="+e+'||'+vars[e]
			}).join(',') + ";"+
			"return "+src

		try {
			res.f = f = Function(args, body)
			try {
				res.res = f()
			}
			catch(e) {
				res.err = "Exception executing js function: \n\n"+src+
					"\n\nException: "+e
			}
		}
		catch(e) {
			res.err = 'Exception compiling shader function: \n\n'+src+
				"\n\nException: "+e
		}
		return res
	},
	/**
	Shortcut
	*/
	compile: function Shader_compile() {
		this.code_tree = new CodeTree(this.src, this.js_variables)
		return code_tree.translate()
	}
}
return Shader
})()

	module.Shader = Shader

	/**
	@memberof NEngine.GLNSLCompiler
	@function compile
	@desc Compiles src using cfg
	@param {String} src - Contains the raw GLSL code
	@param {Object} cfg - Config container
	@return {String} translated
	*/
	function compile(src, js_variables) {
		return CodeTree(src, js_variables).translate()
	}
	module.compile = compile

	var test_code = document.getElementById("testshader").innerHTML;

	console.log('precompiled: ', test_code)
	console.log('compiled', compile(test_code) )

	return module
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
/**
@namespace Physic
@memberof NEngine
@desc All physic related stuff, structures to index and optimize n-dimensional
spaces with lots or hundreds of entities like space trees. It also holds the
PhysicModules wich define diferent kinds of physic processors and physic
types, and defines the SpaceGraph for easy space configuration (lots of TODO
here)
<br/><br/>
Space and SpaceNode implement an axis oriented topology
cappable of optimize them for collisisions and interspace
intersections.
<br/><br/>
Space is the SpaceNode network container, and holds common configurations
for every SpaceNode.<br/>
SpaceNode is a recursive representation of a n-axis
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

  /**
  interfaze PhysicModule
  */

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
    register: function phy_module_reg(module) {

    },
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
    Physics: Physics,
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
