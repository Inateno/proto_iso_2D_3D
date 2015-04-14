/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
* @constructor
* MainLoop
**/

define( [ 'DE.Time', 'DE.CONFIG', 'DE.States', "DE.Inputs", "DE.GamePad", "DE.SystemDetection", "DE.Screen" ],
function( Time, CONFIG, States, Inputs, GamePad, SystemDetection, Screen )
{
  var MainLoop = new function()
  {
    this.DEName = "MainLoop";
    this.launched = false;
    
    this.renders = new Array();
    this.scenes = new Array();
    
    this.maxRenders = 1;
    this.loader = null;
    /***
    * @loop
    ***/
    this.loop = function()
    {
      if ( !MainLoop.launched )
      {
        return;
      }
      requestAnimationFrame( MainLoop.loop );
      
      if ( !Time.update() ){ return; }
      
      if ( States.get( "isLoading" ) )
      {
        if ( !MainLoop.loader )
          return;
        for ( var i = 0, j; j = MainLoop.renders[ i ]; i++ )
        {
          j.ctx.translate( j.sizes.width * 0.5, j.sizes.height * 0.5 );
          MainLoop.loader.render( j.ctx, 1, 1 );
          j.ctx.translate( -j.sizes.width * 0.5, -j.sizes.height * 0.5 );
        }
        return;
      }
      else if ( SystemDetection.isOverridingMainLoop )
      {
        if ( !SystemDetection.render )
          return;
        
        SystemDetection.render.render();
        SystemDetection.scene.update( Time.currentTime );
      }
      else if ( States.get( 'isReady' ) )
      {
        GamePad.update( Time.currentTime );
        for ( var i = 0, j; j = MainLoop.renders[ i ]; i++ )
        {
          j.render();
          //j.update(); // call waiting input here
        }
        MainLoop.customLoop( Time.currentTime );
       
        for ( var i = 0, j; j = MainLoop.scenes[ i ]; i++ )
        {
          if ( !j.freeze && !j.sleep )
          {
            j.update();
          }
        }
      }
    };
    
    /***
    * @addRender
    ***/
    this.addRender = function( render )
    {
      render.id = this.maxRenders++;
      this.renders.push( render );
      
      if ( render.fullScreenMode == "ratioStretch" )
        render.screenChangedSizeIndex( Screen.ratioToConception, Screen.screenSizes[ Screen.currentSizeIndex ] );
    };
    
    this.screenChangedSizeIndex = function()
    {
      if ( render.fullScreenMode == "ratioStretch" )
        for ( var i = 0, r; r = this.renders[ i ]; ++i )
          r.screenChangedSizeIndex( Screen.ratioToConception, Screen.screenSizes[ Screen.currentSizeIndex ] );
    }
    
    /***
    * @addScene
    ***/
    this.addScene = function( scene )
    {
      this.scenes.push( scene );
    }
    
    /***
    * @customLoop
    need to override in customs files
    ***/
    this.customLoop = function( time ){}
  };
  
  CONFIG.debug.log( "MainLoop loaded", 3 );
  return MainLoop;
} );