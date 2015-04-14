define( [ 'DREAM_ENGINE', 'MapIso2DRenderer' ],
function( DE, MapIso2DRenderer )
{
  function MapIso2D( layer, z, sizes, pos, chunkPosition )
  {
    this.init = function( layer, z, sizes, pos, chunkPosition )
    {
      DE.GameObject.call( this, { 'tag': 'MapIso3D'
          , 'x': 0 || 0, 'y': pos.y || 0, 'z': 0, "zindex": z
          , 'renderer': new MapIso2DRenderer( layer, sizes )
      } );
      
      this.position3D = new DE.Vector2( layer.length / 2 >> 0, layer[ 0 ].length / 2 >> 0, z );
    }
    
    this.get3DPosTo2DPos = function( pos3D )
    {
      var screenx = ( pos3D.x - pos3D.y ) * this.sizes.caseSize.x / 2 >> 0;
      var screeny = ( pos3D.x + pos3D.y ) * this.sizes.caseSize.y / 2 - ( pos3D.z * this.sizes.caseSize.z ) >> 0;
      return { "x": screenx, "y": screeny };
    }
    
    this.init( layer, z, sizes, pos, chunkPosition );
    
    this.redrawPart = function( ctx, physicRatio, ratioz, pos )
    {
      ctx.translate( ( this.position.x ) * physicRatio * ratioz >> 0
                  , ( this.position.y ) * physicRatio * ratioz >> 0 );
      ctx.rotate( this.position.rotation );
      
      this.renderers[ 0 ].redrawPart( ctx, physicRatio, ratioz, pos );
      
      ctx.rotate( -this.position.rotation );
      ctx.translate( -( this.position.x ) * physicRatio * ratioz >> 0
                    , -( this.position.y ) * physicRatio * ratioz >> 0 );
    }
  }
  
  MapIso2D.prototype = new DE.GameObject();
  MapIso2D.prototype.constructor = MapIso2D;
  MapIso2D.prototype.supr = DE.GameObject.prototype;
  
  return MapIso2D;
} );