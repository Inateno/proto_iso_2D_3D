/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
*
* @constructor
* Collider
**/
  
/**
** The Collider is needed for a GameObject to calculate contact with other GameObject
** list of params:
**                type -> CONFIG.COLLISION_TYPE. CIRCLE | ORIENTED_BOX | FIXED_BOX
**/

define( [ 'DE.Vector2', 'DE.CONFIG' ],
function( Vector2, CONFIG )
{
  function Collider( param )
  {
    this.DEName = "Collider";
    
    param           = param || {};
    this.type       = param.type || undefined;
    this.gameObject = param.gameObject || undefined;
    
    this.localPosition = param.localPosition || new Vector2( param.offsetX || param.offsetLeft || 0, param.offsetY || param.offsetTop || 0 );
    
    this.isColliding   = false;
    this.isTrigger     = param.isTrigger || false;
    this.collideWith   = new Array();
    
    this.getRealPosition = function()
    {
      var x = this.gameObject.position.x + this.localPosition.x;
      var y = this.gameObject.position.y + this.localPosition.y;
      
      var parent = this.gameObject.parent;
      if ( parent != undefined )
      {
        x += parent.position.x;
        y += parent.position.y;
        while ( parent.parent != undefined )
        {
          parent = parent.parent;
          x += parent.position.x;
          y += parent.position.y;
        }
      }
      return { x: x, y: y };
    }
    
    this.debugRender = function( ctx, physicRatio, ratioz )
    {
      if ( !this.debugBuffer )
        return;
      ctx.drawImage( this.debugBuffer.canvas
                      , this.localPosition.x * physicRatio * ratioz >> 0
                      , this.localPosition.y * physicRatio * ratioz >> 0
                      , this.debugBuffer.canvas.width * physicRatio * ratioz >> 0
                      , this.debugBuffer.canvas.height * physicRatio * ratioz >> 0 );
    }
  }
  
  CONFIG.debug.log( "Collider loaded", 3 );
  return Collider;
} );