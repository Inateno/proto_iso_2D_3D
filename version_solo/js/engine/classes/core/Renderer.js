/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
*
* @constructor
* Renderer
**/
  
/**
** The Renderer is needed for a GameObject to be visible on screen
** list of params:
**                alpha :         alpha for the color (float between 0 & 1)
**                fillColor :     color of the GameObject (rgb)
**                method :        "fill" or "stroke" or "fillAndStroke"
**                localPosition : position of the renderer (Vector2)
**/

define( [ 'DE.COLORS', 'DE.Vector2', 'DE.CONFIG' ],
function( COLORS, Vector2, CONFIG )
{
  function Renderer( param )
  {
    this.DEName = "Renderer";
    
    param = param || {};
    this.gameObject  = param.gameObject || undefined;
    
    this.alpha       = param.alpha || 1;
    this.fillColor   = param.fillColor  || COLORS.defaultColor;
    this.strokeColor = param.strokeColor  || COLORS.defaultColor;
    this.method      = param.method || "fill";
    this.localPosition  = param.localPosition ||
      new Vector2( param.offsetx || param.offsetX || param.left || param.x || param.offsetLeft || 0
                  , param.offsety || param.offsetY || param.top || param.y || param.offsetTop || 0 );
    
    this.setScale = function( x, y )
    {
      if ( !this.sizes )
        return;
      y = y || x;
      
      this.localPosition.x += ( this.sizes.width * this.sizes.scaleX * 0.5 ) >> 0;
      this.localPosition.y += ( this.sizes.height * this.sizes.scaleY * 0.5 ) >> 0;
      this.sizes.scaleX = x || 0;
      this.sizes.scaleY = y || 0;
      this.localPosition.x -= ( this.sizes.width * this.sizes.scaleX * 0.5 ) >> 0;
      this.localPosition.y -= ( this.sizes.height * this.sizes.scaleY * 0.5 ) >> 0;
    }
    this.scale = function( x, y )
    {
      if ( !this.sizes )
        return;
      this.setScale( this.sizes.scaleX + ( x || 0 ), this.sizes.scaleY + ( y || 0 ) );
    }
  }
  Renderer.prototype.render = function( ctx, physicRatio, ratioz ){}
  
  Renderer.prototype = {
    
    constructor: Renderer
    /***
    * @translate
    * translate the renderer NOT THE GAMEOBJECT
    * Need a Vector2
    */
    , translate: function( vector2 )
    {
      this.localPosition.translate( vector2 );
    }
    
    /***
    * @translateX
    * translate the renderer horizontaly NOT THE GAMEOBJECT
    * Need a int in px
    */
    , translateX: function ( distance )
    {
      this.translate( { x: distance, y: 0 } );
    }
    
    /***
    * @translateY
    * translate the renderer verticaly NOT THE GAMEOBJECT
    * Need a int in px
    */
    , translateY: function ( distance )
    {
      this.translate( { x: 0, y: distance } );
    }
  };
  
  CONFIG.debug.log( "Renderer loaded", 3 );
  return Renderer;
} );