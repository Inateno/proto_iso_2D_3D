/***
*
*
*
*/
define ( [ 'DE.CONFIG' ],
function( CONFIG )
{
  var LangSystem = new function()
  {
    this.DEName = "LangSystem";
    this.currentLang = "en";
    
    this.dictionnary = {};
    this.avalaibleLang = new Array();
    
    this.init = function( dictionnary )
    {
      for ( var i in dictionnary )
      {
        this.dictionnary[ i ] = dictionnary[ i ];
        this.avalaibleLang.push( i );
      }
    }
    
    this.get = function( what )
    {
      return this.dictionnary[ this.currentLang ][ what ] || null;
    }
    
    this.forceGet = function( lang, what )
    {
      if ( this.avalaibleLang.indexOf( lang ) == -1 )
        return null;
      return this.dictionnary[ this.currentLang ][ what ] || null;
    }
    
    this.getLang = function( lang )
    {
      this.currentLang = "en";
      if ( !lang )
        lang = navigator.language || "en";
      
      for ( var i in this.dictionnary )
        if ( lang.match( i ) )
          this.currentLang = i;
    }
  };
  
  CONFIG.debug.log( "LangSystem loaded", 3 );
  return LangSystem;
} );