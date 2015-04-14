define( [ 'DREAM_ENGINE' ],
function( DE )
{
  // 3D map renderer
  function MapIso2DRenderer( layer, sizes )
  {
    DE.Renderer.call( this, {} );
    
    this.buffer = new DE.CanvasBuffer( sizes.caseSize.x * layer[ 0 ].length
                                      , sizes.caseSize.y * layer.length + sizes.caseSize.z );
    this.upBuffer = new DE.CanvasBuffer( sizes.caseSize.x * layer[ 0 ].length
                                      , sizes.caseSize.y * layer.length + sizes.caseSize.z );
    this.layer = layer;
    this.sizesDatas = sizes;
    this.sizes = new DE.Sizes( this.buffer.canvas.width, this.buffer.canvas.height, 1, 1 );
    this.buffering();
  }
  
  MapIso2DRenderer.prototype = new DE.Renderer();
  MapIso2DRenderer.prototype.constructor = MapIso2DRenderer;
  MapIso2DRenderer.prototype.supr = DE.Renderer.prototype;
  
  MapIso2DRenderer.prototype.buffering = function()
  {
    var layer = this.layer;
    for ( var y = 0; y < layer.length; ++y )
    {
      for( var x = 0; x < layer[ y ].length; ++x )
      {
        this.drawCase( x, y, this.buffer.ctx );
      }
    }
  }
  
  MapIso2DRenderer.prototype.drawCase = function( x, y, ctx, tileset )
  {
    if ( y < 0 || x < 0 || y >= this.layer.length || x >= this.layer[ y ].length )
      return;
    var cs = this.layer[ y ][ x ]; // [ 1 ] // dernière dimension pour le multi datas par cases - 0 étant le tileset utilisé
    if ( cs == 0 ){ return; }
    
    tileset = tileset || "tileset";
    var tiles = DE.ImageManager.images[ tileset ]; // récupérer le nom du tileset depuis la valeur de la case [ 0 ? ]
    
    var totalCols = tiles.widthFrame / this.sizesDatas.tileSize.w;
    var sx = cs % totalCols;
      if ( sx == 0 ){ sx = totalCols; }
      sx = ( sx - 1 ) * this.sizesDatas.tileSize.w;
    
    var sy = Math.ceil( cs / totalCols );
      sy = ( sy - 1 ) * this.sizesDatas.tileSize.h;
    
    var cx = ( x - y ) * this.sizesDatas.caseSize.x / 2 >> 0;
    var cy = ( x + y ) * this.sizesDatas.caseSize.y / 2 >> 0;
    
    ctx.drawImage( tiles
                , sx, sy
                , this.sizesDatas.tileSize.w
                , this.sizesDatas.tileSize.h
                , ( cx + ( this.sizes.width / 2 - this.sizesDatas.caseSize.x / 2 ) ) >> 0
                , cy >> 0
                , this.sizesDatas.caseSize.x >> 0
                , ( this.sizesDatas.caseSize.y + this.sizesDatas.caseSize.z ) >> 0
    );
  }
  
  MapIso2DRenderer.prototype.redrawPart = function( ctx, physicRatio, ratioz, pos )
  {
    this.upBuffer.ctx.globalCompositeOperation = "destination-out";
    this.upBuffer.ctx.fillRect( 0, 0, this.buffer.canvas.width, this.buffer.canvas.height );
    this.upBuffer.ctx.globalCompositeOperation = "source-over";
    
    this.drawCase( pos.x + 1, pos.y, this.upBuffer.ctx, "tileset" );
    this.drawCase( pos.x + 2, pos.y, this.upBuffer.ctx, "tileset-up" );
    this.drawCase( pos.x, pos.y + 1, this.upBuffer.ctx, "tileset" );
    this.drawCase( pos.x, pos.y + 2, this.upBuffer.ctx, "tileset-up" );
    this.drawCase( pos.x + 1, pos.y + 1, this.upBuffer.ctx, "tileset-up" );
    this.drawCase( pos.x + 2, pos.y + 1, this.upBuffer.ctx, "tileset-up" );
    this.drawCase( pos.x + 1, pos.y + 2, this.upBuffer.ctx, "tileset-up" );
    this.drawCase( pos.x + 2, pos.y + 2, this.upBuffer.ctx, "tileset-up" );
    
    ctx.drawImage( this.upBuffer.canvas, 0, 0, this.buffer.canvas.width * physicRatio * ratioz, this.buffer.canvas.height * physicRatio * ratioz );
  }
  
  MapIso2DRenderer.prototype.render = function( ctx, physicRatio, ratioz )
  {
    // this.buffer.ctx.drawImage( this.savedBuffer.canvas, 0, 0, this.buffer.canvas.width * physicRatio, this.buffer.canvas.height * physicRatio );
    
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
  
  return MapIso2DRenderer;
} );