/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
* @constructor
* Render
- create a canvas in the given divId (a DOM id)
**/
define( [ 'DE.CONFIG', 'DE.Sizes', 'DE.Time', 'DE.MainLoop', 'DE.CollisionSystem', 'DE.Inputs', 'DE.CanvasBuffer' ],
function( CONFIG, Sizes, Time, MainLoop, CollisionSystem, Inputs, CanvasBuffer )
{
  function Render( divId, param )
  {
    this.DEName = "Render";
    param = param || {};
    this.id = 0;
    this.divId = divId || undefined;
    this.canvas = null;
    this.ctx = null;
    
    this.sizes = new Sizes( param.width || CONFIG.defaultRenderWidth || 100, param.height || CONFIG.defaultRenderHeight || 100, param.scaleX || 1, param.scaleY || 1 );
    this.savedSizes = new Sizes( param.width || CONFIG.defaultRenderWidth || 100, param.height || CONFIG.defaultRenderHeight || 100, param.scaleX || 1, param.scaleY || 1 );
    
    var _drawRatio = 1;
    this.physicRatio = 1;
    
    this.conserveSizes = param.conserveSizes || false;
    this.fullScreenMode = param.fullScreen || null;
    this.cameras = new Array();
    this.maxCameras = 0;
    
    this.freeze = false;

    /***
    * @init
    ***/
    this.init = function()
    {
      if ( !this.canvas )
        MainLoop.addRender( this );
      
      if ( !this.divId )
      {
        this.div = window.document.body;
        CONFIG.debug.log( "%cWARN: you not specified a DOM Object where push the render, it will push in the body *hiiik*", 1, "color:orange" );
      }
      else
      {
        this.div = document.getElementById( this.divId );
        if ( !this.div )
        {
          throw new Error( "Can't found the div by the given id" );
          return false;
        }
      }
      
      if ( this.conserveSizes )
      {
        this.sizes.width  = this.div.offsetWidth.valueOf();
        this.sizes.height = this.div.offsetHeight.valueOf();
      }
      else
      {
        this.div.style.width  = this.sizes.width + "px";
        this.div.style.height = this.sizes.height + "px";
      }
      
      if ( !this.canvas )
      {
        this.canvas = document.createElement( "canvas" );
        this.div.appendChild( this.canvas );
        Inputs.addRender( this );
      }
      this.canvas.width = this.sizes.width.valueOf();
      this.canvas.height= this.sizes.height.valueOf();
      this.canvas.id = this.id;
      
      if ( this.fullScreenMode )
      {
        this.fullScreen( this.fullScreenMode );
        this.resizeOnEventResize();      
      }
      
      if ( !this.ctx )
        this.ctx = this.canvas.getContext( '2d' );
          this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
      if ( !this.buffer )
        this.buffer = new CanvasBuffer( this.sizes.width, this.sizes.height );
      else
        this.buffer.resize( this.sizes.width, this.sizes.height );
    }
    
    /***
     * when screen change index size
     */
    this.screenChangedSizeIndex = function( physicRatio, newSizes )
    {
      this.savedSizes.width  = newSizes.w;
      this.savedSizes.height = newSizes.h;
      this.physicRatio = physicRatio;
      if ( this.canvas )
        this.init();
      
      for ( var i = 0, c; c = this.cameras[ i ]; ++i )
      {
        c.screenChangedSizeIndex( physicRatio, newSizes );
      }
    }
    
    /***
    *
    ***/
    this.resize = function( w, h, stretch )
    {
      if ( this.div != window.document.body )
      {
        this.div.style.width  = w + "px";
        this.div.style.height = h + "px";
      }
      
      this.canvas.width  = w;
      this.canvas.height = h;
      this.sizes.width   = w;
      this.sizes.height  = h;
      
      if ( !stretch )
      {
      }
    }
    
    this.resizeOnEventResize = function()
    {
      if ( !this.fullScreenMode )
        return;
      
      var o = this;
      var recallMethod = function()
      {
        o.fullScreenMethod.call( o );
      };
      if ( window.addEventListener )
      {
       window.addEventListener( "resize", function()
       {
        window.setTimeout( recallMethod, 100 );
       }, false ); 
      }
      else if ( window.attachEvent )
      {
        window.attachEvent( "onresize", function()
        {
          window.setTimeout( recallMethod, 100 ); 
        } );
      }
    }
    
    /***
    *
    ***/
    this.resizeRatio = function( w, h , stretch )
    {
      var baseW = this.savedSizes.width;
      var baseH = this.savedSizes.height;
      var calcRatio = w / baseW;
      
      if ( calcRatio * baseH > h )
      {
        calcRatio = h / baseH;
      }

      var newW = calcRatio * baseW >> 0;
      var newH = calcRatio * baseH >> 0;
      this.resize( newW, newH, stretch );
      
      this.div.style.marginLeft = ( ( w - newW ) / 2 ) + "px";
      this.div.style.marginTop = ( ( h - newH ) / 2 ) + "px";
      this.canvas.style.top = 0;
      
      _drawRatio = newW / this.savedSizes.width;
    }

    var _fullScreenMethod;
    /***
    *
    ***/
    this.changeFullScreenMode = function( mode )
    {
      this.fullScreenMode = mode;
      switch( mode )
      {
        case "ratioStretch" : 
          _fullScreenMethod = function( screenW, screenH )
          {
            this.resizeRatio(screenW, screenH, true);
          };
        break;
        case "fullStretch" : 
          _fullScreenMethod = function( screenW, screenH )
          {
            this.resize(screenW, screenH, true);
          };
        break;
        case "ratio":
          _fullScreenMethod = function( screenW, screenH )
          {
            this.resizeRatio(screenW, screenH, false);
          };
        break;
        // default = nothing
        default:
          _fullScreenMethod = function( screenW, screenH )
          {
            //this.resize(screenW, screenH, false);
          };
        break;
      }
    }
    
    /***
    *
    ***/
    this.fullScreenMethod = function()
    {
      var screenW = ( window.innerWidth || document.documentElement.clientWidth );
      var screenH = ( window.innerHeight || document.documentElement.clientHeight );
      
      var divParentH = window.getComputedStyle( this.div.parentElement, null ).getPropertyValue( 'height' );
      if ( this.div.parentElement != null
          && divParentH && screenH < document.body.clientHeight )
      {
        var divW = this.div.parentElement.innerWidth || this.div.parentElement.clientWidth;
        var divH = this.div.parentElement.innerHeight || this.div.parentElement.clientHeight;
        
        if ( divH < screenH )
          screenH = divH;
        if ( divW < screenW )
          screenW = divW;
      }
      
      if ( !_fullScreenMethod )
      {
        throw ("Render.js : fullScreenMethod need a fullScreenMode, maybe you never used changeFullScreenMode")
      }
      
      _fullScreenMethod.call( this, screenW, screenH );
    }
    
    /***
    *
    ***/
    this.fullScreen = function(mode, automatisme)
    {
      if ( mode )
      {
        this.changeFullScreenMode( mode );
      }

      if ( automatisme )
      {
        //on ajoute au listener Resize
      }

      this.fullScreenMethod();
    }

    /***
    * @render
    renderise all scene
    ***/
    this.render = function()
    {
      if ( this.freeze )
      {
        return;
      }
      
      this.ctx.fillStyle = "black";
      this.ctx.fillRect( 0, 0, this.sizes.width, this.sizes.height );
      
      for ( var i = 0, camera; camera = this.cameras[ i ]; ++i )
      {
        camera.render( this.ctx, _drawRatio, this.physicRatio );
      }
      
      if ( CONFIG.DEBUG_LEVEL > 0 )
      {
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText( "DeltaTime: " + Time.deltaTime
                          , ( this.sizes.width * _drawRatio >> 0 ) - 220
                          , 30 );
        this.ctx.fillText( "FPS: " + Time.fps
                          , ( this.sizes.width * _drawRatio >> 0 ) - 220
                          , 70 );
      }
    }
    
    /**
    * @add
    add a camera on this render
    **/
    this.add = function( camera )
    {
      this.cameras.push( camera );
      this.maxScenes++;
      camera.screenChangedSizeIndex( this.physicRatio, this.savedSizes );
    }
    
    /**
    * @remove
    remove a camera on this render ( not deleted ! )
    **/
    this.remove = function( camera )
    {
      var pos = this.cameras.indexOf( camera );
      if ( pos == -1 )
      {
        CONFIG.debug.log( "Remove camera not found ", 1, camera );
        return;
      }
      
      this.cameras.splice( pos, 1 );
      this.maxScenes--;
    }

    /** @private
    * @add
    return the scollPostion of the window
    **/
    function scrollPosition()
    {
      return {
        x: document.scrollLeft || window.pageXOffset,
        y: document.scrollTop || window.pageYOffset
      };
    }

    function getGoodMouseCoords( x, y )
    {
      var pos = { "x": x, "y": y };
      var elem = this.canvas;
      while( elem )
      {
        pos.x -= elem.offsetLeft;
        pos.y -= elem.offsetTop;
        elem = elem.parentElement;
      }
      return {
        'x': pos.x / _drawRatio + scrollPosition().x >> 0,
        'y': pos.y / _drawRatio + scrollPosition().y >> 0
      };
    }

    this.camerasMouseCollide = function( eventName, x, y )
    {
      var mouse = getGoodMouseCoords.call( this, x, y );
            
      // custom events ? if return true stop propagation now
      if ( this[ 'on' + eventName ]( mouse ) || mouse.stopPropagation )
        return;
      for ( var i = 0; i < this.cameras.length; i++ )
      {
        var camera = this.cameras[ i ];
        if ( camera.sleep ){ continue; }
        
        var cameraObject = { 'x' : camera.position.x - ( camera.sizes.width * 0.5 / camera.sizes.scaleX )
                            ,'y' : camera.position.y - ( camera.sizes.height * 0.5 / camera.sizes.scaleY )
                            ,'width' : camera.sizes.width / camera.sizes.scaleX
                            ,'height' : camera.sizes.height / camera.sizes.scaleY };
        
        if ( CollisionSystem.pointFixedBoxCollision( mouse, cameraObject ) )
        {
          if ( camera[ 'oOn' + eventName ]( mouse, this.physicRatio ) )
            break;
        }
      }
      
      if ( !mouse.stopPropagation )
        this[ 'lastOn' + eventName ]( mouse );
    }
    
    /* Custom Events
    return true to stop bubbling */
    this.onMouseMove = function(){};
    this.onMouseDown = function(){};
    this.onMouseUp = function(){};
    
    /* last event, called after all */
    this.lastOnMouseMove = function(){};
    this.lastOnMouseDown = function(){};
    this.lastOnMouseUp = function(){};
    
    this.oOnMouseDown = function( mouse )
    {
      this.camerasMouseCollide( "MouseDown", mouse.x, mouse.y );
    }
    this.oOnMouseUp = function( mouse )
    {
      this.camerasMouseCollide( "MouseUp", mouse.x, mouse.y );
    }
    this.oOnMouseMove = function( mouse )
    {
      this.camerasMouseCollide( "MouseMove", mouse.x, mouse.y );
    }
  }
  
  CONFIG.debug.log( "Render loaded", 3 );
  return Render;
} );