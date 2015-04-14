/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
* @constructor
* Camera

**/
define( [ 'DE.CONFIG', 'DE.Sizes', 'DE.Vector2', 'DE.CanvasBuffer', 'DE.CollisionSystem', 'DE.ImageManager' ],
function( CONFIG, Sizes, Vector2, CanvasBuffer, CollisionSystem, ImageManager )
{
  function Camera( width, height, x, y, param )
  {
    this.DEName = "Camera";
    param = param || {};
    
    this.name   = param.name || "";
    this.tag    = param.tag || "";
    this.scene  = null;
    this.gui    = undefined;
    
    this.sizes      = new Sizes( width, height, param.scale || param.scaleX || 1, param.scale || param.scaleY || 1 );
    this.savedSizes = new Sizes( width, height, param.scale || param.scaleX || 1, param.scale || param.scaleY || 1 );
    // position in the scene
    this.position      = new Vector2( x + width * 0.5, y + height * 0.5, param.z || -10 );
    this.savedPosition = new Vector2( x + width * 0.5, y + height * 0.5, param.z || -10 );
    
    // position inside the sceneworld
    this.realposition = new Vector2( param.realx || x, param.realy || y , param.realz || param.z || -10 );
    
    this.opacity = param.opacity || 1;
    this.backgroundColor = param.backgroundColor || null;
    this.backgroundImage = param.backgroundImage || null;
    
    this.cameras = new Array();
    this.maxCameras  = 0;
    
    this.freeze  = false;
    this.sleep  = false;
    
    this.startX = 0
    this.startY = 0
    var _buffer  = new CanvasBuffer( this.sizes.width, this.sizes.height );
    var _gameObjects = new Array();
    /***
    * @render
    renderise the view in the scene
    ***/
    this.render = function( ctx, drawRatio, physicRatio )
    {
      if ( this.sleep )
      {
        return;
      }
      
      if ( !this.freeze )
      {
        _buffer.ctx.globalAlpha  = this.opacity;
        
        if ( this.backgroundColor != null )
        {
          _buffer.ctx.fillStyle = this.backgroundColor;
          _buffer.ctx.fillRect( 0, 0, this.sizes.width, this.sizes.height );
        }
        if ( this.backgroundImage != null )
        {
          _buffer.ctx.drawImage( ImageManager.images[ this.backgroundImage ], 0, 0, this.sizes.width, this.sizes.height );
        }
        
        _buffer.ctx.save();
        // renderize here game objects
        if ( this.scene )
        {
          _gameObjects = this.scene.getGameObjects();
          for ( var i = 0, t = _gameObjects.length, g,ratioz; i < t; i++ )
          {
            g = _gameObjects[ i ];
            if ( g && !g.disable
              && g.position.z > this.realposition.z
              && ( g.position.x + g.biggerOffset.width >= this.realposition.x
                && g.position.x - g.biggerOffset.width <= this.realposition.x + this.savedSizes.width )
              && ( g.position.y + g.biggerOffset.height >= this.realposition.y
                && g.position.y - g.biggerOffset.height <= this.realposition.y + this.savedSizes.height )
            )
            {
              ratioz = ( Math.abs( this.realposition.z + g.position.z ) - 10 ) * 0.1 + 1;
              g.render( _buffer.ctx, physicRatio, ratioz, this.realposition, this.sizes );
            }
          }
        }
        else
        {
          _buffer.ctx.textAlign = "center";
          _buffer.ctx.fillStyle = "white";
          _buffer.ctx.fillText( "No scene affiliated :(", this.sizes.width * 0.5, this.sizes.height * 0.5 );
        }
        
        _buffer.ctx.restore();
        _buffer.ctx.globalAlpha = this.opacity;
        
        if ( CONFIG.DEBUG )
        {
          _buffer.ctx.fillStyle = "white";
          _buffer.ctx.textAlign = "left";
          _buffer.ctx.fillText( "Camera " + this.name, 10, 20);
          
          _buffer.ctx.strokeStyle = "red";
          _buffer.ctx.strokeRect( 0, 0, ( this.sizes.width * this.sizes.scaleX ) >> 0
                                     , ( this.sizes.height * this.sizes.scaleY ) >> 0 );
          
          _buffer.ctx.fillStyle = "yellow";
          _buffer.ctx.fillRect( this.sizes.width - 10, this.sizes.height - 10, 10, 10 );
          _buffer.ctx.fillRect( this.sizes.width - 10, 0, 10, 10 );
          _buffer.ctx.fillRect( 0, this.sizes.height - 10, 10, 10 );
          _buffer.ctx.fillRect( 0, 0, 10, 10 );
          
          _buffer.ctx.fillRect( this.sizes.width * 0.5
                              ,this.sizes.height * 0.5
                              , 20, 5 );
          _buffer.ctx.fillRect( this.sizes.width * 0.5
                              ,this.sizes.height * 0.5
                              , 5, 20 );
        }
      }
      
      ctx.translate( this.position.x * drawRatio >> 0
                    , this.position.y * drawRatio >> 0 );
      ctx.rotate( this.position.rotation );
      
      ctx.drawImage( _buffer.canvas
            , -this.sizes.width * drawRatio * 0.5 >> 0
            , -this.sizes.height * drawRatio * 0.5 >> 0
            , this.sizes.width * this.sizes.scaleX * drawRatio >> 0
            , this.sizes.height * this.sizes.scaleY * drawRatio >> 0 );
      
      ctx.rotate( -this.position.rotation );
      ctx.translate( -this.position.x * drawRatio >> 0
                    , -this.position.y * drawRatio >> 0 );
      
      if ( this.gui )
      {
        this.gui.render( ctx, this.sizes, drawRatio, physicRatio );
      }
    }
    
    /***
     * when screen sizes index change (Screen classes)
     */
    this.screenChangedSizeIndex = function( physicRatio, newSizes )
    {
      this.sizes.width  = this.savedSizes.width * physicRatio >> 0;
      this.sizes.height = this.savedSizes.height * physicRatio >> 0;
      this.position.x = this.savedPosition.x * physicRatio >> 0;
      this.position.y = this.savedPosition.y * physicRatio >> 0;
      _buffer.canvas.width = this.sizes.width;
      _buffer.canvas.height = this.sizes.height;
    }
    
    /**
    * @add
    add a camera on this camera
    **/
    this.add = function( camera )
    {
      this.cameras.push( camera );
      this.maxCameras++;
    }
    
    /**
    * @remove
    remove a camera affilied in this camera ( not deleted ! )
    **/
    this.remove = function( camera )
    {
      var pos = this.cameras.indexOf( scene );
      if ( pos == -1 )
      {
        CONFIG.debug.log( "%cRemove camera not found ", 1, "color:orange", camera );
        return;
      }
      
      this.cameras.splice( pos, 1 );
      this.maxCameras--;
    }
    
    /****
     * focus camera on given target
     */
    this.focus = function( gameObject, offsets )
    {
      offsets = offsets || undefined;
      
      var ratioz = ( Math.abs( this.realposition.z + gameObject.position.z ) - 10 ) * 0.1 + 1;
      this.realposition.x = gameObject.getPos().x - ( this.sizes.width * 0.5 ) / ratioz;
      this.realposition.y = gameObject.getPos().y - ( this.sizes.height * 0.5 ) / ratioz;
    }
    
    this.convertMousePos = function( mouse, physicRatio )
    {
      mouse = { x: mouse.x / physicRatio / this.sizes.scaleX, y: mouse.y / physicRatio / this.sizes.scaleY };
      return mouse;
    }
    /***
    * @option custom events
    return true if you want stop propagation
    */
    this.onMouseDown = function(){};
    this.onMouseUp = function(){};
    this.onMouseMove = function(){};
    
    /* last event, called after all */
    this.lastOnMouseMove = function(){};
    this.lastOnMouseDown = function(){};
    this.lastOnMouseUp = function(){};
    
    /***
    * @EVENTS @onMouseDown
    */
    this.oOnMouseDown = function( mouse, physicRatio )
    {
      mouse = this.convertMousePos( mouse, physicRatio );
      
      if ( this.onMouseDown( mouse ) || mouse.stopPropagation )
        return;
      if ( this.gui && this.gui.onMouseDown( mouse ) || mouse.stopPropagation )
        return;
      
      mouse.x += this.realposition.x;
      mouse.y += this.realposition.y;
      for ( var i = _gameObjects.length - 1, g; i >= 0; --i )
      {
        g = _gameObjects[ i ];
        if ( g.disable || !g.collider || !g.onMouseDown ){ continue; }
        if ( CollisionSystem.checkCollisionWith( mouse, g.collider ) )
        {
          if ( g.onMouseDown( mouse ) )
            break;
        }
      }
      
      if ( !mouse.stopPropagation )
        this.lastOnMouseDown( mouse );
    }
    
    /***
    * @EVENTS @onMouseUp
    */
    this.oOnMouseUp = function( mouse, physicRatio )
    {
      mouse = this.convertMousePos( mouse, physicRatio );
      // console.log( mouse );
      if ( this.onMouseUp( mouse ) || mouse.stopPropagation )
        return;
      if ( this.gui && this.gui.onMouseUp( mouse ) || mouse.stopPropagation )
        return;
      
      mouse.x += this.realposition.x;
      mouse.y += this.realposition.y;
      for ( var i = _gameObjects.length - 1, g; i >= 0; --i )
      {
        g = _gameObjects[ i ];
        if ( g.disable || !g.collider || !g.onMouseUp ){ continue; }
        if ( CollisionSystem.checkCollisionWith( mouse, g.collider ) )
        {
          if ( g.onMouseUp( mouse ) )
            break;
        }
      }
      
      if ( !mouse.stopPropagation )
        this.lastOnMouseUp( mouse );
    }
    
    /***
    * @EVENTS @onMouseMove
    */
    this.oOnMouseMove = function( mouse, physicRatio )
    {
      mouse = this.convertMousePos( mouse, physicRatio );
      
      if ( this.onMouseMove( mouse ) || mouse.stopPropagation )
        return;
      if ( this.gui && this.gui.onMouseMove( mouse ) || mouse.stopPropagation )
        return;
      
      mouse.x += this.realposition.x;
      mouse.y += this.realposition.y;
      for ( var i = _gameObjects.length - 1, g; i >= 0; --i )
      {
        g = _gameObjects[ i ];
        if ( g.disable || !g.collider || !g.onMouseMove){ continue; }
        if ( CollisionSystem.checkCollisionWith( mouse, g.collider ) )
        {
          if ( g.onMouseMove( mouse ) )
            return;
        }
      }
      
      if ( !mouse.stopPropagation )
        this.lastOnMouseMove( mouse );
    }
  }
  
  CONFIG.debug.log( "Camera loaded", 3 );
  return Camera;
} );