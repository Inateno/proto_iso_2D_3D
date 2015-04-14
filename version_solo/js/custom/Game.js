/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
simple Game class declaration example
**/

define( [ 'DREAM_ENGINE', 'DE.GuiLabel', 'DE.GuiImage', 'WorldMap', 'datas', 'Character' ],
function( DreamE, GuiLabel, GuiImage, WorldMap, datas, Character )
{
  var Game = {};
  
  // init
  Game.init = function()
  {
    DreamE.CONFIG.DEBUG_LEVEL = 5;
    
    // render
    Game.render = new DreamE.Render( "render", { fullScreen: "ratioStretch" } );
    Game.render.init();
    
    DreamE.start();
  }
  
  Game.start = function()
  {
    // scene
    Game.scene = new DreamE.Scene( "Test" );
    
    // Game.scene.add( new DreamE.GameObject( { "x": 300, "y": 300 } ) );
    
    // Game.scene.player = new Player( 200, 200 );
    Game.world = new WorldMap( { "x": 30, "y": 30, "z": 4 } );
    Game.world.init( datas.map2d3d );
    Game.world.addInScene( Game.scene );
    
    Game.player = new Character( 1, Game.scene, "ogre", 10, 31 );
    Game.player.init( true );
    Game.world.addEntities( [ Game.player ] );

    // camera
    Game.camera = new DreamE.Camera( 1920,1080, 0, 0, { 'name': "Test zoom 100%", 'backgroundColor': "rgb(50,50,80)" } );
    Game.camera.scene = Game.scene;
    Game.render.add( Game.camera );
    Game.player.camera = Game.camera;
    
    setTimeout( function(){ DreamE.States.down( "isLoading" ); }, 500 );
  };
  window.Game = Game; // debug
  return Game;
} );