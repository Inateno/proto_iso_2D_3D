/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
*
* @states
states of the engine, mae sure don't remove the needed states

you can add some of course but be prudent
- don't use them in a gameloop it's work with events system !
**/
define( [ 'DE.Event', 'DE.CONFIG' ],
function( Event, CONFIG )
{
  var states = {
    isLoadingImages: false
    ,isReady   : false
    ,isInited  : false
    ,isLoading : true
  };
  
  var States = new function()
  {
    this.DEName = "States";
    
    this.up = function( who )
    {
      checkIsReady( who, true );
      Event.emit( who, true );
      states[ who ] = true;
    }
    
    this.down = function( who )
    {
      checkIsReady( who, false );
      Event.emit( "not" + who, false );
      states[ who ] = false;
    }
    
    this.get = function( who )
    {
      return states[ who ];
    }
  };
  
  var checkIsReady = function( what, state )
  {
    if ( what == "isReady" || what == "isLoading" )
    {
      return;
    }
    var st = states;
    if ( ( !st.isLoadingImages || ( what == "isLoadingImages" && state === false ) )
    && ( st.isInited || ( what == "isInited" && state === true ) )
    )
    {
      States.up( 'isReady' );
    }
  }
  
  CONFIG.debug.log( "states loaded", 3 );
  return States;
} );