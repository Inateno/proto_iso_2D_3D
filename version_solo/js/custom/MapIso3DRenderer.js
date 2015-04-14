define( [ 'DREAM_ENGINE' ],
function( DE )
{
  // 3D map renderer
  function MapIso3DRenderer( chunk, sizes )
  {
    DE.Renderer.call( this, {} );
    
    this.buffer = new DE.CanvasBuffer( sizes.caseSize.x * chunk[ 0 ][ 0 ].length
                                      , sizes.caseSize.y * chunk[ 0 ].length + sizes.caseSize.z * chunk.length );
    
    this.chunk = chunk;
    this.sizesDatas = sizes;
    this.sizes = new DE.Sizes( this.buffer.canvas.width, this.buffer.canvas.height, 1, 1 );
    this.buffering();
  }
  
  MapIso3DRenderer.prototype = new DE.Renderer();
  MapIso3DRenderer.prototype.constructor = MapIso3DRenderer;
  MapIso3DRenderer.prototype.supr = DE.Renderer.prototype;
  
  MapIso3DRenderer.prototype.buffering = function()
  {
    var chunk = this.chunk;
    for ( var z = 0; z < chunk.length; ++z )
    {
      for ( var y = 0; y < chunk[ z ].length; ++y )
      {
        for( var x = 0; x < chunk[ z ][ y ].length; ++x )
        {
          this.drawCase( x, y, z, this.buffer.ctx );
        }
      }
    }
  }
  
  MapIso3DRenderer.prototype.drawCase = function( x, y, z, ctx )
  {
    var cs = this.chunk[ z ][ y ][ x ]; // [ 1 ] // dernière dimension pour le multi datas par cases - 0 étant le tileset utilisé
    if ( cs == 0 ){ return; }
    
    var tiles = DE.ImageManager.images[ "tileset" ]; // récupérer le nom du tileset depuis la valeur de la case [ 0 ? ]
    
    var totalCols = tiles.widthFrame / this.sizesDatas.tileSize.w;
    var sx = cs % totalCols;
      if ( sx == 0 ){ sx = totalCols; }
      sx = ( sx - 1 ) * this.sizesDatas.tileSize.w;
    
    var sy = Math.ceil( cs / totalCols );
      sy = ( sy - 1 ) * this.sizesDatas.tileSize.h;
    
    var cx = ( x - y ) * this.sizesDatas.caseSize.x / 2 >> 0;
    var cy = ( x + y ) * this.sizesDatas.caseSize.y / 2 - ( ( z - this.chunk.length + 1 ) * this.sizesDatas.caseSize.z ) >> 0;
    
    ctx.drawImage( tiles
                , sx, sy, this.sizesDatas.tileSize.w
                , this.sizesDatas.tileSize.h
                , cx + ( this.sizes.width / 2 - this.sizesDatas.caseSize.x / 2 )
                , cy
                , this.sizesDatas.caseSize.x
                , this.sizesDatas.caseSize.y + this.sizesDatas.caseSize.z );
  }
  
  MapIso3DRenderer.prototype.render = function( ctx, physicRatio, ratioz )
  {
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    // ctx.fillRect( 0, 0, this.buffer.canvas.width * physicRatio, this.buffer.canvas.height * physicRatio );
    ctx.drawImage( this.buffer.canvas, 0, 0, this.buffer.canvas.width * physicRatio * ratioz, this.buffer.canvas.height * physicRatio * ratioz );
    
    // var chunk = this.chunk;
    // for ( var z = 0; z < chunk.length; ++z )
    // {
    //   for ( var y = 0; y < chunk[ z ].length; ++y )
    //   {
    //     for( var x = 0; x < chunk[ z ][ y ].length; ++x )
    //     {
    //       this.drawCase( x, y, z, this.buffer.ctx );
    //     }
    //   }
    // }
    // ctx.fillStyle = "white";
    // ctx.globalAlpha = 0.09;
    // ctx.fillRect( 0, -1000, this.buffer.canvas.width, 2000 );
    // ctx.globalAlpha = 1;
  }
  
  return MapIso3DRenderer;
} );