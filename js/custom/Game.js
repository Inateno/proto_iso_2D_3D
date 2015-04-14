/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
simple Game class declaration example
**/

define( [ 'jquery', 'DREAM_ENGINE', 'DE.GuiLabel', 'DE.GuiImage', 'WorldMap', 'datas', 'Character', 'bindSocket' ],
function( $, DreamE, GuiLabel, GuiImage, WorldMap, solo_datas, Character, bindSocket )
{
  var Game = {};
  
  var IP = "127.0.0.1"/**/, port = 2310;
  
  var $mainProgressBar = $( '#mainLoader .progress.main .progress-bar' );
  var $imgProgress     = $( '#mainLoader .progress.image' );
  var $imgProgressBar  = $( '#mainLoader .progress.image .progress-bar' );
  var $loadState       = $( '#mainLoader .state' );
  
  function socketOnReady( socket )
  {
    setLoader( "Init complete, have fun", 100 );
    
    setTimeout( function()
    {
      $( '#mainLoader' ).fadeOut();
      $( "#formLogin" ).fadeIn();
      $( '#render' ).fadeOut();
      
      $( '.loginBtn' ).click( function()
      {
        var login  = $( '#login' ).val();
        var passwd = $( '#passwd' ).val();
        
        socket.emit( 'connect', login, passwd );
        socket.on( 'logged', function( datas )
        {
          $( "#formLogin" ).fadeOut();
          
          $( '#render' ).fadeIn();
          setLoader( "Load game", 5 );
          $( '#mainLoader' ).fadeIn();
          setTimeout( function()
          {
            Game.connected( socket, datas );
          }, 500 );
        } );
      } );
    }, 1000 );
  }
  
  function socketOnFail()
  {
    $loadState.html( "Fail load socket, please reload or contact me" );
  }
  
  // init
  Game.init = function()
  {
    setLoader( "Load images", 25 );
    $imgProgress.fadeIn();
    
    DreamE.Event.on( 'imageLoaded', function( n, nmax )
    {
      $imgProgressBar.width( ( n / nmax * 100 >> 0 ) + '%' );
      $imgProgressBar.find( '.value' ).html( n + "/" + nmax );
    }, true );
    
    DreamE.CONFIG.DEBUG_LEVEL = 5;
    // render
    Game.render = new DreamE.Render( "render", { fullScreen: "ratioStretch" } );
    Game.render.init();
    
    DreamE.start();
  }
  
  Game.start = function()
  {
    console.log( "engine ready" );
    $imgProgress.fadeOut();
    setLoader( "Fetch Socket lib", 80 );
    var socket = new DreamE.Socket_io( IP, port, 'http', socketOnReady, socketOnFail );
    
    console.log( "wait for connexion" );
  }
  
  Game.connected = function( socket, datas )
  {
    // scene
    Game.scene = new DreamE.Scene( "Test" );
    
    setLoader( "Load world", 40 );
    
    Game.world = new WorldMap( datas.chunksSizes /*{ "x": 30, "y": 30, "z": 4 }*/ );
    Game.world.init( datas.mapDatas /*datas.map2d3d*/ );
    Game.world.addInScene( Game.scene );
    
    Game.myIndex = datas.myIndex;
    Game.player = new Character( Game.myIndex, datas.players[ Game.myIndex ] );
    Game.player.init( true );
    Game.player.socket = socket;
    delete datas.players[ Game.myIndex ];
    
    setLoader( "Create players", 60 );
    
    var players = [ Game.player ];
    for ( var i in datas.players )
    {
      players.push( new Character( i, datas.players[ i ] ) );
      players[ players.length - 1 ].init();
    }
    
    setLoader( "Create environment", 80 );
    // make entities others
    
    Game.world.addEntities( players );

    // camera
    Game.camera = new DreamE.Camera( 1920,1080, 0, 0, { 'name': "PlayerCam", 'backgroundColor': "rgb(50,50,80)" } );
    Game.camera.scene = Game.scene;
    Game.render.add( Game.camera );
    Game.player.camera = Game.camera;
    
    setLoader( "Game loaded", 100 );
    setTimeout( function()
    {
      $( '#mainLoader' ).fadeOut();
      setTimeout( function()
      {
        $( '.coverScreen' ).hide();
      }, 1000 );
      DreamE.States.down( "isLoading" );
    }, 500 );
    
    bindSocket( socket, datas, this );
  };
  
  function setLoader( txt, val )
  {
    $loadState.html( txt );
    $mainProgressBar.width( val + '%' );
  }
  
  window.Game = Game; // debug
  return Game;
} );