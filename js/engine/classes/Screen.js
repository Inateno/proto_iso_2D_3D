define( [ 'DE.CONFIG', 'DE.ImageManager' ],
function( CONFIG, ImageManager )
{
  var Screen = new function()
  {
    this.DEName = "Screen";
    
    this.screenSizes = {};
    this.conceptionSizeIndex = 0;
    this.ratioToConception = 1;
    // index de la taille courante
    this.currentSizeIndex = 0;
    
    // taille actuelle de l'écran
    this.realScreenSize = { "w": 0, "h": 0 };
    
    this.init = function( imgDatas )
    {
      if ( !imgDatas )
      {
        console.log( "%cFATAL ERROR %cyou need to pass the file containing all images datas when call DreamEngine.init", "color:red;background:black", "color: red" );
      }
      // taille d'écrans disponible (parmis les différentes tailles d'images)
      this.screenSizes = imgDatas.screenSizes || [ { "w": 1920, "h": 1080, "path": "" } ];
      
      // index de la taille d'écran avec laquelle le jeu a été conçu
      this.conceptionSizeIndex = imgDatas.conceptionSizeIndex || 0;
    }
    
    this.udpateScreenSizes = function( e )
    {
      // return; // FUCKING DEBUG
      this.realScreenSize.w = ( window.innerWidth || document.documentElement.clientWidth );
      this.realScreenSize.h = ( window.innerHeight || document.documentElement.clientHeight );
      
      var sizes = this.screenSizes;
      this.currentSizeIndex = 0;
      var nearest = 0;
      for ( var i = 0; i < sizes.length; ++i )
      {
        this.currentSizeIndex = i;
        // if current sizes is highter possible sizes value, we get it
        if ( sizes[ i ].w <= this.realScreenSize.w && sizes[ i ].h <= this.realScreenSize.h )
        {
          // get the delta on this size and previous
          if ( i > 0 )
          {
            var dw = Math.abs( sizes[ i ].w - this.realScreenSize.w );
            var dh = Math.abs( sizes[ i ].h - this.realScreenSize.h );
            
            var pdw = Math.abs( sizes[ i - 1 ].w - this.realScreenSize.w );
            var pdh = Math.abs( sizes[ i - 1 ].h - this.realScreenSize.h );
            
            // get previous if the delta is lower
            if ( pdw < dw && pdh < dh )
              this.currentSizeIndex = i - 1;
          }
          break;
        }
      }
      
      CONFIG.debug.log( "Choosen screen size index is " + this.currentSizeIndex, 2
                  , this.realScreenSize, this.screenSizes[ this.currentSizeIndex ] );
      
      this.ratioToConception = sizes[ this.currentSizeIndex ].w / this.screenSizes[ this.conceptionSizeIndex ].w;
      CONFIG.debug.log( "Physical ratio is :: " + this.ratioToConception, 2 );
      ImageManager.pathPrefix = Screen.screenSizes[ Screen.currentSizeIndex ].path;
      
      ImageManager.imageNotRatio = false;
      if ( Screen.screenSizes[ Screen.currentSizeIndex ].ratio == false )
      {
        CONFIG.debug.log( "image not ratio", 2 );
        ImageManager.imageNotRatio = true;
      }
    }
  }
  
  CONFIG.debug.log( "Screens loaded", 3 );
  return Screen;
} );