/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
*
* SpriteRenderer
**/

/**
** The SpriteRenderer is child of Renderer
** It draws a sprite for the gameObject
** need the GameObject to draw
** list of params are the sames as Renderer
**/

define( [ 'DE.ImageManager', 'DE.CONFIG', 'DE.Time' ],
function( ImageManager, CONFIG, Time )
{
  function SpriteRender( ctx, physicRatio, ratioz )
  {
    if ( this.spriteName === undefined )
    {
      CONFIG.debug.log( "%cWARN: No image name on a SpriteRenderer", 1, "color:red" );
      return false;
    }
    if ( this.isAnimated && !this.isPaused && !this.isOver )
    {
      if ( Time.currentTime - this.lastAnim > this.eachAnim )
      {
        var nLoop = ( Time.currentTime - this.lastAnim ) / this.eachAnim >> 0;
        this.lastAnim = Time.currentTime;
        
        while ( nLoop > 0 )
        {
          if ( !this.isReversed )
          {
            if ( !this.isLoop && this.currentFrame+1 >= this.endFrame )
            {
              this.isOver = true;
              this.onAnimEnd();
            }
            else
            {
              this.currentFrame = ( this.currentFrame+1 >= this.endFrame ) ? this.startFrame : this.currentFrame+1 ;
            }
          }
          else
          {
            if ( !this.isLoop && this.currentFrame-1 < this.startFrame )
            {
              this.isOver = true;
              this.onAnimEnd();
            }
            else
            {
              this.currentFrame = ( this.currentFrame-1 < this.startFrame ) ? this.endFrame-1 : this.currentFrame-1 ;
            }
          }
          nLoop--;
        }
      }
    }
    
    ctx.globalAlpha = this.alpha;
    
    // if images are not in the good size (ex: render size is 1280*720, images are 1920*1080), just apply physicRatio on final width size
    if ( ImageManager.imageNotRatio )
    {
      // console.log( physicRatio );
      ctx.drawImage( ImageManager.images[ this.spriteName ]
              , this.frameSizes.width * this.currentFrame, this.frameSizes.height * this.currentLine
              , this.frameSizes.width, this.frameSizes.height
              , this.localPosition.x * physicRatio * ratioz >> 0
              , this.localPosition.y * physicRatio * ratioz >> 0
              , this.sizes.width * physicRatio * this.sizes.scaleX * ratioz >> 0
              , this.sizes.height * physicRatio * this.sizes.scaleY * ratioz >> 0 );
    }
    else
    {
      ctx.drawImage( ImageManager.images[ this.spriteName ]
              , this.frameSizes.width * this.currentFrame, this.frameSizes.height * this.currentLine
              , this.frameSizes.width, this.frameSizes.height
              , this.localPosition.x * ratioz >> 0
              , this.localPosition.y * ratioz >> 0
              , this.sizes.width * this.sizes.scaleX * ratioz >> 0
              , this.sizes.height * this.sizes.scaleY * ratioz >> 0 );
    }
    ctx.globalAlpha = 1;
  };
  
  CONFIG.debug.log( "SpriteRender.render loaded", 3 );
  return SpriteRender;
} );