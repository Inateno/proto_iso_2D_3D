/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
* @constructor
* main.js
- load all customs files
add your files here but don't remove DREAM_ENGINE

-- problem with require.js ? give a look on api doc --> http://requirejs.org/docs/api.html#jsfiles
**/
require.config( {
  baseUrl: "./js/custom/"
  , paths: {
    'DREAM_ENGINE': '../engine/main'
    // core engine classes
    , 'DE.CONFIG'          : '../engine/CONFIG'
    , 'DE.COLORS'          : '../engine/COLORS'
    , 'DE.States'          : '../engine/states'
    , 'DE.Event'           : '../engine/classes/Event'
    , 'DE.Time'            : '../engine/classes/core/Time'
    , 'DE.Vector2'         : '../engine/classes/core/Vector2'
    , 'DE.Sizes'           : '../engine/classes/core/Sizes'
    , 'DE.ImageManager'    : '../engine/classes/ImageManager'
    , 'DE.AudioManager'    : '../engine/classes/AudioManager'
    , 'DE.CollisionSystem' : '../engine/classes/CollisionSystem'
    , 'DE.MainLoop'        : '../engine/classes/MainLoop'
    , 'DE.SystemDetection' : '../engine/classes/SystemDetection'
    , 'DE.LangSystem'      : '../engine/classes/LangSystem'
    , 'DE.Screen'          : '../engine/classes/Screen'
    
    , 'DE.Collider'     : '../engine/classes/core/Collider'
    , 'DE.Renderer'     : '../engine/classes/core/Renderer'
    , 'DE.Render'       : '../engine/classes/core/Render'
    , 'DE.Camera'       : '../engine/classes/core/Camera'
    , 'DE.Scene'        : '../engine/classes/core/Scene'
    , 'DE.Rigidbody'    : '../engine/classes/core/Rigidbody'
    , 'DE.CanvasBuffer' : '../engine/classes/core/CanvasBuffer'
    , 'DE.GamePad'      : '../engine/classes/gamepad'
    , 'DE.Inputs'       : '../engine/classes/Inputs'
    , 'DE.Gui'          : '../engine/classes/core/Gui'
    , 'DE.BaseGui'      : '../engine/classes/core/Gui/BaseGui' // BaseGui need extend
    , 'DE.GuiButton'    : '../engine/classes/core/Gui/Button'
    , 'DE.GuiImage'     : '../engine/classes/core/Gui/Image'
    , 'DE.GuiLabel'     : '../engine/classes/core/Gui/Label'

    // GameObject
    , 'DE.GameObject': '../engine/classes/core/GameObject/GameObject'
    , 'DE.GameObject.render': '../engine/classes/core/GameObject/GameObject.render'
    , 'DE.GameObject.update': '../engine/classes/core/GameObject/GameObject.update'

    // colliders
    , 'DE.FixedBoxCollider'    : '../engine/classes/extended/FixedBoxCollider'
    , 'DE.OrientedBoxCollider' : '../engine/classes/extended/OrientedBoxCollider'
    , 'DE.CircleCollider'      : '../engine/classes/extended/CircleCollider'

    // renderers
    , 'DE.BoxRenderer'           : '../engine/classes/extended/BoxRenderer/BoxRenderer'
    , 'DE.BoxRenderer.render'    : '../engine/classes/extended/BoxRenderer/BoxRenderer.render'
    , 'DE.CircleRenderer'        : '../engine/classes/extended/CircleRenderer/CircleRenderer'
    , 'DE.CircleRenderer.render' : '../engine/classes/extended/CircleRenderer/CircleRenderer.render'
    , 'DE.SpriteRenderer'        : '../engine/classes/extended/SpriteRenderer/SpriteRenderer'
    , 'DE.SpriteRenderer.render' : '../engine/classes/extended/SpriteRenderer/SpriteRenderer.render'
    , 'DE.TextRenderer'          : '../engine/classes/extended/TextRenderer/TextRenderer'
    , 'DE.TextRenderer.render'   : '../engine/classes/extended/TextRenderer/TextRenderer.render'
    , 'DE.TileRenderer'          : '../engine/classes/extended/TileRenderer/TileRenderer'
    , 'DE.TileRenderer.render'   : '../engine/classes/extended/TileRenderer/TileRenderer.render'

    // DATAS
    ,'DE.imagesDatas' : '../datas/imagesDatas'
    ,'DE.inputsList'  : '../datas/inputsList'
    ,'DE.audiosList'  : '../datas/audiosList'
    ,'DE.dictionnary' : '../datas/dictionnary'
    
    ,'gameLoop'          : 'gameLoop'
    ,'Game'              : 'Game'
    ,'WorldMap'          : 'WorldMap'
    ,'MapIso3D'          : 'MapIso3D'
    ,'MapIso2D'          : 'MapIso2D'
    ,'MapIso3DRenderer'  : 'MapIso3DRenderer'
    ,'MapIso2DRenderer'  : 'MapIso2DRenderer'
    ,'datas'             : 'datas'
    ,'Character'         : 'Character'
    ,'bindSocket'        : 'bindSocket'
    
    , 'buzz'          : '../ext_libs/buzz-require'
    , 'jquery'        : '../ext_libs/jquery'
    , 'stash'         : '../ext_libs/stash-require'
    , 'handjs'        : '../ext_libs/hand-require'
    
    // DE PLugins
    , 'DE.Socket'     : '../plugins/Socket.io'
  }
  , shim: {
    'jquery': {
      exports: '$'
    }
  }
  , urlArgs: 'bust=' + Date.now()
} );

// init here your game with your code by using the Engine (as DreamE)
require( [ 'DREAM_ENGINE', 'gameLoop', 'Game', 'DE.imagesDatas', 'DE.audiosList', 'DE.inputsList', 'DE.dictionnary', 'DE.Socket' ],
function( DreamE, gameLoop, Game, images, audios, inputs, dictionnary )
{
  console.log( "My Custom loads" );
  
  // DreamE.GameName = "Test";
  DreamE.init(
  {
    'customLoop': gameLoop, 'onReady': Game.init
    , 'onStart': Game.start, 'loader': { "scale": 2 }
    , 'images': images, 'audios': audios
    , 'inputs': inputs, 'dictionnary': dictionnary
  } );
  window.DREAM_E = DreamE;
} );