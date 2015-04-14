/***
* authors : Antoine Rogliano @Inateno
* @SystemDetection
*
* base code detection with browsers
* for custom detection, give a system object when calling initSystem (in the Game.init)
* get all publics attributes and methods and integrate them
for example: SystemDetection.initSYstem( Windows8App );
***/
define( [ 'DE.CONFIG', 'DE.LangSystem' ],
function( CONFIG, LangSystem )
{
  var SystemDetection = new function()
  {
    this.DEName = "SystemDetection";
    this.currentSystem = 0;
    
    this.init = function()
    {
      LangSystem.getLang();
    }
    this.render = null;
    this.scene = null;
    this.camera = null;
    this.isOverridingMainLoop = false;
    
    this.initSystem = function( system )
    {
      window.addEventListener( "onresize", function( e ){ SystemDetection.checkResize( e ); }, false );
      for ( var i in system )
      {
        this[ i ] = system[ i ];
      }
      
      this.init();
    }
    
    this.checkResize = function(){}
  }
  
  CONFIG.debug.log( "SystemDetection loaded", 3 );
  return SystemDetection;
} );