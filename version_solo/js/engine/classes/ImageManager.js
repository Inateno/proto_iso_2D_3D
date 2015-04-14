/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
*
* @singleton
* ImageManager
**/

define( [ 'DE.CONFIG', 'DE.States', 'DE.CanvasBuffer' ],
function( CONFIG, States, CanvasBuffer )
{
  var ImageManager = new function()
  {
    this.DEName = "ImageManager";
    
    this.images          = {};
    this.imagesLoaded    = 0;
    this.imagesRequested = 0;
    this.defaultImages   = [];
    this.pathPrefix      = "";
    this.imageNotRatio   = false;
    this.folderName      = "img";
    
    this.arrayLoader = function( imagesDatas )
    {
      if ( !imagesDatas )
      {
        CONFIG.debug.log( "%cno images loaded", 1, "color:red" );
        return;
      }
      
      this.folderName = imagesDatas.folderName;
      
      var imgs = imagesDatas.imagesList;
      for ( var i = 0, img; img = imgs[ i ]; i++ )
      {
        this.pushImage( img[ 0 ], img[ 1 ], img[ 2 ], img[ 3 ] );
      }
      if ( imagesDatas.imagesList.length == 0 )
      {
        States.down( 'isLoadingImages' );
      }
    }
    
    /***
    * @pushImage
      - name:String - url:String - extension:String - param:Object -
    push an image in this.images and load it
    ***/
    this.pushImage = function( name, url, extension, param )
    {
      param = param || {};
      
      this.images[ name ] = new Image();
      
      var img  = this.images[ name ];
      img.src  = this.folderName + "/" + this.pathPrefix + url + "." + extension;
      img.name = name;
      img.totalFrame = param.totalFrame || 1;
      img.totalLine  = param.totalLine || 1;
      img.eachAnim   = param.eachAnim || 0;
      img.isReversed = param.isReversed || false;
      img.isAnimated = param.isAnimated || false;
      img.isPaused   = param.isPaused || false;
      img.isLoop     = ( param.isLoop != undefined ) ? param.isLoop : true;
      
      if ( img.totalFrame == 0 )
      {
        img.isAnimated = false;
      }
      
      img.onload = function()
      {
        this.widthFrame = this.width / this.totalFrame >> 0;
        this.heightFrame = this.height / this.totalLine >> 0;
        ImageManager.imageLoaded( this );
      }
      this.imagesRequested++;
      States.up( 'isLoadingImages' );
    }
    
    /***
    * @imageLoaded
      - img:Image reference
    called when an image is loaded
    ***/
    this.imageLoaded = function( img )
    {
      CONFIG.debug.log( "Image:" + img.name + " correctly loaded", 3 );
      var buff = new CanvasBuffer( img.width, img.height )
        , cvs = buff.canvas
        , ctx = buff.ctx;
      
      cvs.name = img.name;
      cvs.totalFrame = img.totalFrame;
      cvs.totalLine  = img.totalLine;
      cvs.eachAnim   = img.eachAnim;
      cvs.isReversed = img.isReversed;
      cvs.isAnimated = img.isAnimated;
      cvs.isPaused   = img.isPaused;
      cvs.isLoop     = img.isLoop;
      cvs.widthFrame = img.widthFrame;
      cvs.heightFrame= img.heightFrame;
      ctx.drawImage( img, 0, 0 );
      this.images[ name ] = cvs;
      
      this.imagesLoaded++;
      
      if ( this.imagesLoaded == this.imagesRequested )
      {
        States.down( 'isLoadingImages' );
      }
    }
  };
  
  CONFIG.debug.log( "ImageManager loaded", 3 );
  return ImageManager;
} );