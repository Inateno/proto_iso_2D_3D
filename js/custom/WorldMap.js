/* @author
Inateno aka Rogliano Antoine

cc Dreamirl - 2013

WorldMap3D - plugin permettant de générer une map en 3D dans un espace graphique 2D.
La classe WorldMap3D ne contient que des données spatiales. Elle divise l'espace en chunk (un cube de taille définie)
et créée des maps 3D avec ce chunk. L'interêt étant de diviser l'espace global a gérer à chaque fois, de ne pas rafraichir
les autres si on est pas dessus.

Les chunk sont crées à partir du parametre vector3 passé lors de l'instanciation, c'est un simple objet littéral contenant x-y-z

!!/\!! Précision importante, le Z est la hauteur dans ce moteur, afin de garder une "philosophie" de map 2D, c'est à dire que
X est droite / gauche
Y est haut / bas
comme on le retrouve dans les moteurs Isométriques, permettant aussi de rendre le travail par plan horizontaux (donc plus simple globalement)
(sinon ont aurait eu des plan verticaux)
ici Z est la hauteur
*/
define( [ 'DREAM_ENGINE', 'MapIso3D' ],
function( DE, MapIso3D )
{
  var WorldMap3D = function( chunkSize )
  {
    chunkSize = chunkSize || {};
    this.chunkSize = { "z": chunkSize.z || 4, "y": chunkSize.y || 16, "x": chunkSize.x || 16 }
    
    this.chunks = new Array(); // 3D array with chunks
    
    this.entities = new Array();
  };
  
  /***
   * init@void
   define chunks with given parameters and create MapIso3D
   */
  WorldMap3D.prototype.init = function( datas )
  {
    var chunkSize = this.chunkSize;
    this.sizes = datas.sizes;
    // cut chunk with Z axis
    // index 0 is always the reference for your chunk sizing
    // it's possible to get an empty chunk, but the container array is always cubic and the 0 value need to get maximum sizes
    var zlength = datas.world.length / chunkSize.z >> 0; // warn, if your mapsize if a chunk is a little bigger than this datas, it'll be loose
    var ylength = datas.world[ 0 ].length / chunkSize.y >> 0;
    var xlength = datas.world[ 0 ][ 0 ].length / chunkSize.x >> 0;
    
    var maxI = zlength * ylength * xlength;
    var n = 0;
    for ( var z = 0; z < zlength; ++z )
    {
      this.chunks.push( new Array() );
      for ( var y = 0; y < ylength; ++y )
      {
        this.chunks[ z ].push( new Array() );
        for ( var x = 0, chunkDatas; x < xlength; ++x )
        {
          chunkDatas = new Array();
          
          var lz = z * chunkSize.z;
          var ly = y * chunkSize.y;
          var lx = x * chunkSize.x;
          
          for ( var chunkz = lz, iii = 0; chunkz < lz + chunkSize.z; ++chunkz, ++iii )
          {
            chunkDatas.push( new Array() );
            for ( var chunky = ly, ii = 0; chunky < ly + chunkSize.y; ++chunky, ++ii )
            {
              chunkDatas[ iii ].push( new Array() );
              for ( var chunkx = lx, i = 0; chunkx < lx + chunkSize.x; ++chunkx, ++i )
              {
                chunkDatas[ iii ][ ii ].push( datas.world[ chunkz ][ chunky ][ chunkx ] );
              }
            }
          }
          
          this.chunks[ z ][ y ].push( new MapIso3D( this, chunkDatas, datas.sizes, { "x": lx, "y": ly, "z": lz }, { "marginX": x, "marginY": y } ) );
          this.chunks[ z ][ y ][ x ].zindex = ( z + 1 ) * ( y + 1 ) * ( x + 1 );
          ++n;
        }
        ++n;
      }
      ++n;
    }
    console.log( "WorldMap3D chunked successfully : " + n + " chunks created" );
  };
  
  /***
   * get@Entitie
   * simple get method
   */
  WorldMap3D.prototype.get = function( id )
  {
    for ( var i = 0, ent; ent = this.entities[ i ]; ++i )
    {
      if ( ent.index == id )
        return ent;
    }
    return null;
  }
  
  /***
   * addEntities@void( entities@Array[entitie] )
   add entities in the world, if they don't have a position, give them in the first chunk avalaible
   and add all components needed on entities
   */
  WorldMap3D.prototype.addEntities = function( entities )
  {
    for ( var i = 0, ent; i < entities.length; ++i )
    {
      ent = entities[ i ];
      
      ent.worldPos = this.isoFloatToIsoInt( ent.worldPosFloat )
      this.entities.push( ent );
      this.changeChunk( ent );
      // if entities had a cantMove attr or no move's function
      if ( ent.cantMove || !ent.move )
        continue;
    }
  }
  
  /***
   * remove entitie from chunk and destroy it
   */
  WorldMap3D.prototype.destroyEntitie = function( index )
  {
    // destroy by reference
    if ( isNaN( parseInt( index + 1 ) ) )
    {
      var i = this.entities.indexOf( index ), e = this.entities[ i ];
      this.chunks[ e.chunkLocation.z ][ e.chunkLocation.y ][ e.chunkLocation.z ].remove( e );
      e = undefined;
      delete this.entities[ i ];
      this.entities.splice( i, 1 );
      return;
    }
    
    // destroy by id
    for ( var i = 0, e; e = this.entities[ i ]; ++i )
    {
      if ( e.index == index )
      {
        this.chunks[ e.chunkLocation.z ][ e.chunkLocation.y ][ e.chunkLocation.z ].remove( e );
        e = undefined;
        delete this.entities[ i ];
        this.entities.splice( i, 1 );
        return;
      }
    }
  }
  
  /****
   * convert real iso position to intIso position
   */
  WorldMap3D.prototype.isoFloatToIsoInt = function( isoFloat )
  {
    return {
       "x": ( isoFloat.x / this.sizes.isoSize.x ) >> 0
      ,"y": ( isoFloat.y / this.sizes.isoSize.y ) >> 0
      ,"z": ( isoFloat.z / this.sizes.isoSize.z ) >> 0
    };
  }
  
  /****
   * changeChunk@bool ( entitie@entitie )
   * try change given entitie's chunk with entitie current position
   */
  WorldMap3D.prototype.changeChunk = function( entitie )
  {
    var chunkLocation = this.getChunk( entitie.worldPos );
    
    if ( this.isOutOfRange( chunkLocation, entitie.worldPos ) )
    {
      console.log( "out of range, no more chunk" );
      return false;
    }
    
    if ( entitie.chunkLocation )
    {
      var p = entitie.chunkLocation;
      this.chunks[ p.z ][ p.y ][ p.x ].remove( entitie );
    }
    entitie.chunkLocation = chunkLocation;
    console.log( "go on chunk", chunkLocation, entitie.worldPos );
    this.chunks[ chunkLocation.z ][ chunkLocation.y ][ chunkLocation.x ].addEntitie( entitie );
    
    return true;
  }
  
  /****
   * return chunk location with a world position int
   * or a float world position to an int world position
   */
  WorldMap3D.prototype.getChunk = function( worldPos )
  {
    return { "z": worldPos.z / this.chunkSize.z >> 0
           , "y": worldPos.y / this.chunkSize.y >> 0
           , "x": worldPos.x / this.chunkSize.x >> 0 };
  }
  
  /**
   * @public - unique
   * push all plans inside the given scene
   */
  WorldMap3D.prototype.addInScene = function( scene )
  {
    // scene.add( this.chunks[ 0 ][ 0 ][ 0 ] );
    for ( var z = 0; z < this.chunks.length; ++z )
      for ( var y = 0; y < this.chunks[ z ].length; ++y )
        for ( var x = 0; x < this.chunks[ z ][ y ].length; ++x )
          scene.add( this.chunks[ z ][ y ][ x ] );
  }
  
  /**
   * @public - unique
   * add the capabilities on given GameObjects to work with maps collision
   */
  WorldMap3D.addCollisionCapabilities = function( entities )
  {
    for ( var i = 0; i < entities.length; ++i )
    {
      if ( !ent.tryMove )
        continue;
      // add datas here -> entities.addAutomatism ?
    }
  }
  
  /****
   * isOutOfRange@bool ( chunkLocation@vector3, entitie@entitie )
   *
   */
  WorldMap3D.prototype.isOutOfRange = function( chunkLocation, entitie )
  {
    if ( entitie && ( entitie.z < 1 || entitie.x < 1 || entitie.y < 1 ) )
      return true;
    if ( chunkLocation.z < 0 || chunkLocation.y < 0 || chunkLocation.x < 0
        || chunkLocation.z >= this.chunks.length || chunkLocation.y >= this.chunks[ 0 ].length
        || chunkLocation.x >= this.chunks[ 0 ][ 0 ].length )
      return true;
    return false;
  }
  
  return WorldMap3D;
} );