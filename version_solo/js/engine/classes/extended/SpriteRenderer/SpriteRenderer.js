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

define( [ 'DE.Renderer', 'DE.ImageManager', 'DE.Sizes', 'DE.SpriteRenderer.render', 'DE.CONFIG', 'DE.Time' ],
function( Renderer, ImageManager, Sizes, SpriteRender, CONFIG, Time )
{
  function SpriteRenderer( param )
  {
    param = param || {};
    Renderer.call( this, param );
    
    this.DEName = "SpriteRenderer";
    
    param.spriteName = param.spriteName || undefined;
    
    this.spriteName = param.spriteName || undefined;
    if ( !this.spriteName )
    {
      if ( CONFIG.DEBUG && CONFIG.DEBUG_LEVEL >= 3 )
      {
        CONFIG.debug.log( "%cWARN: SpriteRenderer :: No spriteName defined -- declaration canceled", 1, "color:red" );
      }
      return false;
    }
    this.startFrame = param.startFrame || 0;
    this.endFrame  = param.endFrame || ImageManager.images[ this.spriteName ].totalFrame || 0;
    this.totalLine  = param.totalLine || ImageManager.images[ this.spriteName ].totalLine || 0;
    
    this.eachAnim  = param.eachAnim || ImageManager.images[ this.spriteName ].eachAnim || 0;
    this.lastAnim  = Date.now();
    
    this.frameSizes = new Sizes( ImageManager.images[ this.spriteName ].widthFrame
                    , ImageManager.images[ this.spriteName ].heightFrame
                    , 1, 1 );
    
    // need save given sizes, then:
    // param.w * physicRatio to get real width to display (if there is a width)
    // and when the currentRatioIndex change, get the new ratio and made again the calcul with saved values
    /*
    if ( param.w || param.width || param.Width || param.h || param.height || param.Height )
    {
      this.savedSizes = { "w": param.width || param.w || param.Width || undefined
                        , "h": param.height || param.h || param.Height || undefined };
      this.sizes = new Sizes( this.savedSizes.w * physicRatio || ImageManager.images[ this.spriteName ].widthFrame
                          , this.savedSizes.h * physicRatio || ImageManager.images[ this.spriteName ].heightFrame
                          , param.scaleX, param.scaleY );
    }
    */
    
    param.scaleX = param.scale || param.scaleX || param.scalex || 1;
    param.scaleY = param.scale || param.scaleY || param.scaley || 1;
    this.sizes  = new Sizes( param.width || param.w || ImageManager.images[ this.spriteName ].widthFrame
                  , param.height  || param.h || ImageManager.images[ this.spriteName ].heightFrame
                  , param.scaleX, param.scaleY );

    this.isAnimated = param.isAnimated || ImageManager.images[ this.spriteName ].isAnimated;
    this.isPaused  = param.paused || param.isPaused
        ImageManager.images[ this.spriteName ].isPaused || false;
    this.isReversed  = param.reversed || param.isreversed || param.isReversed
        || ImageManager.images[ this.spriteName ].isReversed || false;
    this.isOver = false;
    this.isLoop = ( param.isLoop != undefined ) ? param.isLoop : ImageManager.images[ this.spriteName ].isLoop;
    
    this.currentFrame  = this.startFrame || 0;
    this.currentLine  = param.startLine || 0;
    
    this.localPosition.x -= ( this.sizes.width * this.sizes.scaleX * 0.5 );
    this.localPosition.y -= ( this.sizes.height * this.sizes.scaleY * 0.5 );
    
    this.setFrame = function( frame )
    {
      if ( frame+1 >= this.endFrame )
      {
        this.currentFrame = this.endFrame-1;
      }
      else if ( frame < this.startFrame )
      {
        this.currentFrame = this.startFrame;
      }
      else
      {
        this.currentFrame = frame;
      }
    }
    
    this.restartAnim = function()
    {
      this.isOver = false;
      if ( !this.isReversed )
        this.currentFrame = this.startFrame;
      else
        this.currentFrame = this.endFrame - 1;
      this.lastAnim = Time.currentTime;
    }
    
    this.onAnimEnd = function(){}
  }

  SpriteRenderer.prototype = new Renderer();
  SpriteRenderer.prototype.constructor = SpriteRenderer;
  SpriteRenderer.prototype.supr = Renderer.prototype;
  
  SpriteRenderer.prototype.render = SpriteRender;
  
  CONFIG.debug.log( "SpriteRenderer loaded", 3 );
  return SpriteRenderer;
} );