/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
* @constructor
* main.js create engine dependencies
**/
define([ 'DE.CONFIG', 'DE.COLORS', 'DE.Time', 'DE.Vector2', 'DE.Sizes', 'DE.ImageManager', 'DE.CollisionSystem', 'DE.Collider', 'DE.Renderer', 'DE.Scene', 'DE.Rigidbody', 'DE.CanvasBuffer', 'DE.GameObject', 'DE.FixedBoxCollider', 'DE.OrientedBoxCollider', 'DE.CircleCollider', 'DE.BoxRenderer', 'DE.CircleRenderer', 'DE.SpriteRenderer', 'DE.Render', 'DE.MainLoop', 'DE.Event', 'DE.States', 'DE.Inputs', 'DE.Camera', 'DE.TextRenderer', 'DE.TileRenderer', 'DE.AudioManager'
, 'DE.Gui', 'DE.BaseGui', 'DE.GuiButton', 'DE.GuiLabel', 'DE.GuiImage', 'DE.LangSystem', 'DE.SystemDetection', 'DE.GamePad', 'DE.Screen' ]
  , function()
  {
    var DREAM_ENGINE = {};
    
    var _startedAt = Date.now();
    for ( var a in arguments )
    {
      var arg = arguments[ a ];
      // if ( typeof arg === "function" )
      // {
        // console.log( arg.toString().match(/function ([^\(]+)/)[ 1 ] );
      // }
      // else if ( typeof arg === "object" )
      // {
        // console.log( arg.toString() );
      // }
      
      var name = arguments[ a ].DEName;
      if ( !name && typeof arg === "function" )
      {
        var tryName = new arguments[ a ]();
        var name = tryName.DEName || undefined;
        delete tryName;
      }
      if ( !name )
      {
        console.log( "%cNo name for " + a, "color:red", arguments[ a ] );
        continue;
      }
      DREAM_ENGINE[ name ] = arguments[ a ];
      delete DREAM_ENGINE[ name ].DEName;
    }
    
    /***
    * @init
    ***/
    DREAM_ENGINE.init = function( param )
    {
      DREAM_ENGINE.Screen.init( param.images );
      DREAM_ENGINE.Screen.udpateScreenSizes();
      
      param = param || {};
      
      param.loader            = param.loader || {};
      param.loader.name       = param.loader.name || "loader"
      param.loader.url        = param.loader.url || "loader"
      param.loader.totalFrame = param.loader.totalFrame || 16;
      param.loader.eachAnim   = param.loader.eachAnim || 45;
      param.loader.ext        = param.loader.ext || "png";
      param.loader.isAnimated = true;
      param.loader.scale      = param.loader.scale || 1;
      
      DREAM_ENGINE.LangSystem.init( param.dictionnary );
      DREAM_ENGINE.SystemDetection.init();
      
      DREAM_ENGINE.Event.on( 'notisLoadingImages', function()
      {
        DREAM_ENGINE.MainLoop.loader = new DREAM_ENGINE.SpriteRenderer( { "spriteName": "loader", "scale": param.loader.scale } );
        if ( param.onReady )
          param.onReady();
        else
          console.log( "%cNo initialisation function given", "color:red" );
        
        if ( param.onStart )
          DREAM_ENGINE.Event.on( 'isReady', function()
          {
            var delay = ( Date.now() - _startedAt );
            if ( delay >= 5000 )
            {
              param.onStart();
            }
            else
            {
              DREAM_ENGINE.CONFIG.debug.log( "start in ", ( 1000 - delay ), "ms" )
              setTimeout( function()
              {
                param.onStart();
              }, ( 1000 - delay ) );
            }
          }, false );
        else
          console.log( "%cNo start function given", "color:red" );
        
        DREAM_ENGINE.ImageManager.arrayLoader( param.images );
        DREAM_ENGINE.AudioManager.loadAudios( param.audios );
        
        DREAM_ENGINE.Inputs.init( param.inputs );
        
        DREAM_ENGINE.States.up( 'isInited' );
        if ( param.customLoop )
        {
          DREAM_ENGINE.MainLoop.customLoop = param.customLoop;
        }
      }, false );
      this.ImageManager.pushImage( param.loader.name, param.loader.url, param.loader.ext, param.loader );
    }
    
    /***
    * @start
    - launch the loop engine
    ***/
    DREAM_ENGINE.start = function()
    {
      this.MainLoop.launched = true;
      this.MainLoop.loop();
    }
    
    // Supprimer le Event et le state du DREAM_ENGINE pour qu'il reste privé ( à confirmer )
    DREAM_ENGINE.on = DREAM_ENGINE.Event.on;
    DREAM_ENGINE.deltaTime = DREAM_ENGINE.Time.getDelta();
    
    // requestAnimationFrame declaration
    if ( !window.requestAnimationFrame )
    {
      window.requestAnimationFrame = ( function()
        {
          return window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element )
          {
            window.setTimeout( callback, 1000 / 60 );
          };
        }
      )();
    }
    
    return DREAM_ENGINE;
  }
);