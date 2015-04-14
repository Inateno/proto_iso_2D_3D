define( [ 'DREAM_ENGINE', 'MapIso3DRenderer', 'MapIso2D' ],
function( DE, MapIso3DRenderer, MapIso2D )
{
  function MapIso3D( world, chunk, sizes, startPosition, options )
  {
    options = options || {};
    this.chunk = chunk;
    this.sizes = sizes;
    this.world = world;
    this.layers   = new Array();
    
    this.chunkPos = { "z": startPosition.z, "y": startPosition.y, "x": startPosition.x };
    this.margin = { "z": 0, "y": options.marginY || 0 , "x": options.marginX || 0 };
    // idée en cours::
    /* le MapIso3D contient un tableau de layer, un layer par couche Z
      Si il n'y a personne dans ce chunk, il se bufferise complètement avec les objets statiques.
      Si il y a des objets dynamique, il se bufferise au mieux (à définir plus tard)
      
      Si il y a des joueurs, se sont les renderers des layers qui sont appelés, par ordre de z-index
      
      --> un chunk doit connaître les joueurs et éléments dynamique qui sont dans sa zone afin de les gérer / afficher au mieux.
      --> il vaut mieux tenter de mettre les layers et players en enfant du chunk, cela évitera d'avoir un code "crade"
      -> au final un chunk sera un peu comme une scène dans la scene, sauf que c'est un gameObject avec une position 3D
      */
    this.init = function( startPosition )
    {
      startPosition.x += this.chunk[ 0 ][ 0 ].length / 2 >> 0;
      startPosition.y += this.chunk[ 0 ].length / 2 >> 0;
      startPosition.z += this.chunk.length / 2 - 1 >> 0;
      
      var pos = this.get3DPosTo2DPos( startPosition ), margin;
      for ( var z = 0; z < this.chunk.length; ++z )
      {
        // create a 2DMap by layer
        pos = { "x": 0, "y": ( this.chunk.length - 1 - z ) * this.sizes.caseSize.z >> 0 };
        this.layers.push( new MapIso2D( this.chunk[ z ], z, this.sizes, pos, startPosition ) );
      }
      pos = this.get3DPosTo2DPos( startPosition );
      margin = this.get3DPosTo2DPos( this.margin );
      
      DE.GameObject.call( this, { 'tag': 'MapIso3D'
          , 'x': pos.x + margin.x || 0, 'y': pos.y + margin.y || 0, 'z': 0, "zindex": 0
          , 'renderer': new MapIso3DRenderer( this.chunk, this.sizes )
      } );
      
      this.addAutomatism( "collisions", { "type": "calculateCollisions" } );
    }
    
    /****
     * calculateCollisions@void
     * check all entities movements
     */
    this.airFriction   = 0.98;
    this.floorFriction = 0.9;
    this.floorFrictionReductor = 0.6;
    this.airFrictionReductor   = 0.9;
    this.minValueForceApplied  = 0.2;
    var _somethingMove = false;
    this.calculateCollisions = function()
    {
      _somethingMove = false;
      
      for ( var i = 0, ent; ent = this.childrens[ i ]; ++i )
      {
        if ( ent.updateFromWorld )
        {
          ent.chunkPosFloat = this.worldPosToChunkPosFloat( ent.worldPosFloat );
          ent.chunkPos = this.isoFloatToIsoInt( ent.chunkPosFloat );
          ent.move2D( this.get3DFloatPosTo2DPos( ent.chunkPosFloat ) );
          ent.updateFromWorld = false;
          ent.tryMove = false;
        }
        
        // no move from this entitie
        if ( !ent.tryMove )
          continue;
        _somethingMove = true;
        
        // TODO: définir si chaque entité réagit différement a la physique (il me semble que oui->arbre/plantes)
        //ent.calculatePhysic( this.airFriction, this.floorFriction );
        
        ent.nextMove.x = ent.forces.x * this.floorFriction * DE.Time.deltaTime >> 0;
        ent.nextMove.y = ent.forces.y * this.floorFriction * DE.Time.deltaTime >> 0;
        ent.nextMove.z = ent.density * ent.forces.z * this.airFriction * DE.Time.deltaTime >> 0;
        
        var pos = { "x": ent.nextMove.x, "y": ent.nextMove.y, "z": ent.nextMove.z }; // next pos
        pos.x += ent.chunkPosFloat.x;
        pos.y += ent.chunkPosFloat.y;
        pos.z += ent.chunkPosFloat.z;
        
        var cpos = ent.chunkPos; // current pos
        
        // reduce forces with frictionReductor
        ent.forces.x *= this.floorFrictionReductor;
        ent.forces.y *= this.floorFrictionReductor;
        ent.forces.z *= this.airFrictionReductor;
        // set to 0 if forces < minForces allowed (to prevent to much useless calculs)
        for ( var f in ent.forces )
        {
          var v = ent.forces[ f ] * 10;
          if ( ( ( v ^( v >> 31 ) ) - ( v >> 31 ) ) * 0.1 < this.minValueForceApplied )
            ent.forces[ f ] = 0;
        }
        
        pos = this.isoFloatToIsoInt( { "x":pos.x, "y":pos.y, "z": pos.z } );
        // chunk limits
        // TODO add Z limit
        if ( this.isOutOfChunk( { "x": pos.x, "y": pos.y, "z": 1 } ) )
        {
          console.log( "out of chunk" );
          ent.moveIso();
          ent.chunkPos = this.isoFloatToIsoInt( ent.chunkPosFloat );
          ent.worldPos = this.getWorldPos( ent.chunkPos ); // get world pos
          ent.worldPosFloat = this.getWorldPosFloat( ent.chunkPosFloat );
          console.log( ent.chunkPos );
          ent.move2D( this.get3DFloatPosTo2DPos( ent.chunkPosFloat ) );
          
          // can return false if it's the end of the world but should not appear because collision will set at the limits
          // TODO - add chunk collision verification before warp it, in this case should return false
          if ( !this.world.changeChunk( ent ) )
          {
            //ent.rollbackPosition(); // TODO - not working anymore, miss previousPos for isoPos
            //ent.chunkPos = this.isoFloatToIsoInt( ent.chunkPosFloat );
            ent.stop();
          }
          continue;
        }
        
        // check only axe by axe to prevent bad stuck and improve move gameplay feeling
        if ( this.chunk[ cpos.z ][ cpos.y ][ pos.x ] )
        {
          ent.nextMove.x = 0;
          ent.forces.x = 0;
        }
        if ( this.chunk[ cpos.z ][ pos.y ][ cpos.x ] )
        {
          ent.nextMove.y = 0;
          ent.forces.y = 0;
        }
        if ( this.chunk[ pos.z ][ cpos.y ][ cpos.x ] )
        {
          ent.nextMove.z = 0;
          ent.forces.z = 0;
          ent.touchedGround = true;
          ent.chunkPosFloat.z = ( pos.z + 1 ) * this.sizes.isoSize.z;
        }
        
        // stucked
        if ( !ent.touchedGround && ent.nextMove.x == 0 && ent.nextMove.y == 0 && ent.nextMove.z == 0 )
        {
          pos = this.isoFloatToIsoInt( ent.chunkPosFloat );
          // maybe current location is corrupted
          if ( this.chunk[ pos.z ][ pos.y ][ pos.x ] )
          {
            ent.position.x = ent.previousPosition.x;
            ent.position.y = ent.previousPosition.y;
          }
          ent.stop();
        }
        // can move
        else
        {
          ent.moveIso();
          ent.chunkPos = this.isoFloatToIsoInt( ent.chunkPosFloat );
          
          // fall ?
          if ( ent.chunkPos.z > 0 && !this.chunk[ ent.chunkPos.z - 1 ][ ent.chunkPos.y ][ ent.chunkPos.x ] )
          {
            ent.touchedGround = false;
          }
          // console.log( ent.index, ent.chunkPos );
          ent.move2D( this.get3DFloatPosTo2DPos( ent.chunkPosFloat ) );
        }
        ent.worldPosFloat = this.getWorldPosFloat( ent.chunkPosFloat );
      }
      
      if ( this.childrens.length > 1 && _somethingMove )
      {
        this.childrens.sort( function( a, b )
        {
          if ( b.zindex == a.zindex )
          {
            if ( b.position.y == a.position.y )
              return a.position.x - b.position.x;
            return a.position.y - b.position.y;
          }
          return a.zindex - b.zindex;
        } );
      }
    }
    
    /***
     * addEntitie@void ( entitie@entitie )
     add an entitie in this chunk, entities are childrens
     */
    this.addEntitie = function( entitie )
    {
      // entitie.chunkLocation = this.chunkPos;
      var oldpos = null;
      if ( entitie.chunkPosFloat )
        oldpos = this.get3DFloatPosTo2DPos( entitie.chunkPosFloat );
      
      entitie.chunkPos = {
        "x": entitie.worldPos.x - this.chunkPos.x,
        "y": entitie.worldPos.y - this.chunkPos.y,
        "z": entitie.worldPos.z - this.chunkPos.z
      };
      entitie.chunkPosFloat = {
        "x": ( entitie.chunkPos.x ) * this.sizes.isoSize.x + this.sizes.isoSize.x / 2 >> 0,
        "y": ( entitie.chunkPos.y ) * this.sizes.isoSize.y + this.sizes.isoSize.y / 2 >> 0,
        "z": ( entitie.chunkPos.z ) * this.sizes.isoSize.z
      };
      
      entitie.move2D( this.get3DFloatPosTo2DPos( entitie.chunkPosFloat ) );
      if ( oldpos )
      {
        entitie.position.x -= ( oldpos.x - entitie.position.x );
        entitie.position.y -= ( oldpos.y - entitie.position.y );
      }
      
      this.add( entitie );
    }
    
    /****
     * coordScreenToIso@vector3 ( coord@vector3 )
     * the z value isn't used but it's usefull to get it to return a vector3
     * return the local position in the current chunk
     */
    this.coordScreenToIso = function( coord )
    {
      coord.x -= this.chunk[ 0 ][ 0 ].length / 2 * this.sizes.caseSize.x;
      coord.y += ( coord.z - this.chunk.length ) * this.sizes.caseSize.z;
      return {
         "x": ( coord.x / this.sizes.caseSize.x + coord.y / this.sizes.caseSize.y >> 0 )
        ,"y": ( coord.y / this.sizes.caseSize.y - coord.x / this.sizes.caseSize.x >> 0 )
        ,"z": coord.z
      };
    }
    
    /****
     * convert real iso position to intIso position
     */
    this.isoFloatToIsoInt = function( isoFloat )
    {
      return {
         "x": ( isoFloat.x / this.sizes.isoSize.x ) >> 0
        ,"y": ( isoFloat.y / this.sizes.isoSize.y ) >> 0
        ,"z": ( isoFloat.z / this.sizes.isoSize.z ) >> 0
      };
    }
    
    /****
     * convert intIso position to floatIso position
     */
    this.isoIntToIsoFloat = function( isoInt )
    {
      return {
         "x": ( isoFloat.x * this.sizes.isoSize.x ) >> 0
        ,"y": ( isoFloat.y * this.sizes.isoSize.y ) >> 0
        ,"z": ( isoFloat.z * this.sizes.isoSize.z ) >> 0
      };
    }
    
    /****
     * get3DPosTo2DPos@vector2 ( pos3D@vector3 )
     * give a int chunk position and get a 2D screen position
     */
    this.get3DPosTo2DPos = function( pos3D )
    {
      var screenx = ( this.chunk[ 0 ][ 0 ].length / 2 * this.sizes.caseSize.x ) + ( -pos3D.y + pos3D.x ) * this.sizes.caseSize.x / 2 >> 0;
      var screeny = ( pos3D.y + pos3D.x ) * this.sizes.caseSize.y / 2 - ( ( pos3D.z - this.chunk.length ) * this.sizes.caseSize.z ) >> 0;
      screeny += this.sizes.caseSize.y*0.5 >> 0;
      return { "x": screenx, "y": screeny };
    }
    
    this.get3DFloatPosTo2DPos = function( pos3D )
    {
      var screenx = ( this.chunk[ 0 ][ 0 ].length / 2 * this.sizes.caseSize.x ) + ( -pos3D.y + pos3D.x ) >> 0;
      var screeny = ( pos3D.y + pos3D.x ) * 0.5 - ( pos3D.z - this.chunk.length * this.sizes.caseSize.z ) >> 0;
      //screeny += this.sizes.caseSize.y*0.5 >> 0;
      return { "x": screenx, "y": screeny };
    }
    
    /****
     * isOutOfChunk@bool ( pos@vector3 )
     * return true if position isn't in the chunk
     */
    this.isOutOfChunk = function( pos )
    {
      if ( pos.x < 0 || pos.y < 0 || pos.z < 0
          || pos.z >= this.chunk.length || pos.y >= this.chunk[ 0 ].length
          || pos.x >= this.chunk[ 0 ][ 0 ].length )
        return true;
      return false;
    }
    
    /****
     * getWorldPos@vector3 ( entitie@entitie )
     * return the entitie's world position
     * ( current chunkPos + entitie locale chunkPos )
     */
    this.getWorldPos = function( chunkPos )
    {
      return {
        "x": this.chunkPos.x + chunkPos.x
        ,"y": this.chunkPos.y + chunkPos.y
        ,"z": this.chunkPos.z + chunkPos.z
      };
    }
    
    this.getWorldPosFloat = function( chunkPosFloat )
    {
      return {
        "x": this.chunkPos.x * this.sizes.isoSize.x + chunkPosFloat.x
        ,"y": this.chunkPos.y * this.sizes.isoSize.y + chunkPosFloat.y
        ,"z": this.chunkPos.z * this.sizes.isoSize.z + chunkPosFloat.z
      };
    }
    
    this.worldPosToChunkPos = function( worldPos )
    {
      return {
        "x": worldPos.x - this.chunkPos.x
        ,"y": worldPos.y - this.chunkPos.y
        ,"z": worldPos.z - this.chunkPos.z
      };
    }
    this.worldPosToChunkPosFloat = function( worldPosFloat )
    {
      return {
        "x": worldPosFloat.x - this.chunkPos.x * this.sizes.isoSize.x
        ,"y": worldPosFloat.y - this.chunkPos.y * this.sizes.isoSize.y
        ,"z": worldPosFloat.z - this.chunkPos.z * this.sizes.isoSize.z
      };
    }
    
    this.init( startPosition );
  }
  
  MapIso3D.prototype = new DE.GameObject();
  MapIso3D.prototype.constructor = MapIso3D;
  MapIso3D.prototype.supr = DE.GameObject.prototype;
  
  /****
   * render@void
   * overriding GameObject rendering
   */
  MapIso3D.prototype.render = function( ctx, physicRatio, ratioz, camPosition, camSizes )
  {
    if ( this.disable ){ return; }
    physicRatio = physicRatio || 1;
    ratioz      = ratioz || 1;
    camPosition = camPosition || { x:0, y:0 };
    camSizes    = camSizes || { width:0, height:0 };
    
    ctx.translate( ( this.position.x - camPosition.x ) * physicRatio * ratioz >> 0
                  , ( this.position.y - camPosition.y ) * physicRatio * ratioz >> 0 );
    ctx.rotate( this.position.rotation );
    
    // si il n'y a pas d'entité on draw simplement le buffer global
      // this.renderers[ 0 ].render( ctx, physicRatio, ratioz );
      // if ( this.childrens.length )
      //   this.childrens[ 0 ].render( ctx, physicRatio, ratioz );
      
    if ( this.childrens.length == 0 )
    {
      this.renderers[ 0 ].render( ctx, physicRatio, ratioz );
    }
    // TODO: rajouter le draw des autres
    else //if ( 1 == 2 )
    {
      // draw du buffer dans tout les cas
      this.renderers[ 0 ].render( ctx, physicRatio, ratioz );
      
      // ensuite pour chaque enfant, on va le draw et redraw juste après les cases au dessus de lui
      for ( var i = 0, child; child = this.childrens[ i ]; ++i )
      {
        child.render( ctx, physicRatio, ratioz );
        
        // il faut connaître le z de l'enfant courant
        var z = child.chunkPos.z;
        
        var cleanPos = {
          "x": child.chunkPos.x
          , "y": child.chunkPos.y
        };
        
        ctx.globalAlpha = 0.8;
        for ( var l = z; l < this.chunk.length; ++l )
        {
          this.layers[ l ].redrawPart( ctx, physicRatio, ratioz, cleanPos );
          // this.layers[ l ].render( ctx, physicRatio, ratioz );
        }
        ctx.globalAlpha = 1;
      }
      
    }
    
    if ( DE.CONFIG.DEBUG_LEVEL > 1 )
    {
      ctx.fillStyle = "yellow";
      ctx.fillRect ( 0, 0, 20 ,5 );
      ctx.fillStyle = "pink";
      ctx.fillRect ( 0, 0, 5 ,20 );
      
      if ( this.collider !== null )
        this.collider.debugRender( ctx, physicRatio, ratioz );
    }
    ctx.rotate( -this.position.rotation );
    ctx.translate( -( this.position.x - camPosition.x ) * physicRatio * ratioz >> 0
                  , -( this.position.y - camPosition.y ) * physicRatio * ratioz >> 0 );
  }
  
  return MapIso3D;
} );