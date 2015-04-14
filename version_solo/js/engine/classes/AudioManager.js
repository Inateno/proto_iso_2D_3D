/***
* @AudioManager

***/

define( [ 'DE.CONFIG', 'buzz' ],
function( CONFIG, buzz )
{
  var AudioManager = new function()
  {
    this.DEName = "AudioManager";
    this.muted = false;
    this.volume = 40;
    
    this.loadAudios = function( audioList )
    {
      this.music.volume = this.volume;
      this.fx.volume = this.volume * 0.75;
      
      for ( var m in audioList )
      {
        var au = audioList[ m ];
        var audio = {};
        audio.name = au[ 0 ];
        audio.preload = au[ 3 ].preload;
        audio.loop = au[ 3 ].loop;
        audio.formats = au[ 2 ].formats;
        audio.sound = new buzz.sound( au[ 1 ], {
          formats: au[ 2 ]
          , preload: au[ 3 ].preload || false
          , loop: au[ 3 ].loop || false
        } );
        if ( au[ 3 ].isMusic )
        {
          this.music.add( audio );
        }
        else
        {
          this.fx.add( audio );
        }
      }
    }
    
    this.mute = function()
    {
      this.music.mute();
      this.fx.mute();
      this.muted = true;
    }
    
    this.unmute = function()
    {
      this.music.unmute();
      this.fx.unmute();
      this.muted = false;
    }
    
    this.toggle = function()
    {
      if ( this.muted )
        this.unmute();
      else
        this.mute();
    }
    
    this.setVolume = function( val, sign )
    {
      if ( sign == "+" )
        this.volume += val;
      else if ( sign == "-" )
        this.volume -= val;
      else
        this.volume = val;
      
      this.checkVolume();
      
      var mval = this.volume;
      this.music.setVolume( mval );
      
      var sval = this.volume * 0.75; //this.fx.volume - val / 100 * this.fx.volume;
      this.fx.setVolume( sval );
    }
    
    this.checkVolume = function()
    {
      this.volume = ( ( this.volume > 100 ) ? 100 : this.volume ) >> 0;
      this.volume = ( ( this.volume < 0 ) ? 0 : this.volume ) >> 0;
    }
    
    /***
    * @music @manager
    ***/
    this.music = new function()
    {
      var _musics = {};
      this.volume = 80;
      this.muted = false;
      this.currentPlayed = "";
      
      this.add = function( mus )
      {
        _musics[ mus.name ] = mus;
      }
      /***
      *
      ***/
      this.stopAllAndPlay = function( name, ignore )
      {
        if ( !ignore ){ var ignore = false; }
        if ( !_musics[ name ] || !_musics[ name ].sound ){ return; }
        
        for ( var m in _musics )
        {
          if ( !this.muted && ( m == name || m == ignore ) ) { continue; }
          _musics[ m ].sound.stop();
        }
        if ( this.muted )
          return;
        
        if ( !_musics[ name ].sound.isPaused() )
          return;
        
        this.currentPlayed = name;
        _musics[ name ].sound.setTime(0);
        _musics[ name ].sound.play();
        _musics[ name ].sound.setVolume( this.volume );
        _musics[ name ].sound.loop();
      }
      
      this.pauseAllAndPlay = function( what )
      {
        for ( var m in _musics )
        {
          if ( !_musics[ m ].sound.isPaused() )
          {
            _musics[ m ].sound.pause();
          }
        }
        if ( this.muted )
          return;
        
        this.currentPlayed = what;
        _musics[ what ].sound.play();
        _musics[ what ].sound.setVolume( this.volume );
      }
      
      this.mute = function()
      {
        this.muted = true;
        for ( var i in _musics )
          _musics[ i ].sound.stop();
      }
      
      this.unmute = function()
      {
        this.muted = false;
        this.stopAllAndPlay( this.currentPlayed );
      }
      
      this.setVolume = function( val )
      {
        this.volume = val || 0;
        for ( var i in _musics )
          _musics[ i ].sound.setVolume( this.volume );
      }
    }
    
    /***
    * @fx @manager
    ***/
    this.fx = new function()
    {
      var _fxs = {};
      this.volume = 80;
      this.muted = false;
      
      this.add = function( fx )
      {
        _fxs[ fx.name ] = fx;
      }
      
      this.play = function( name )
      {
        if ( this.muted )
          return;
        _fxs[ name ].sound.play();
      }
      
      this.mute = function()
      {
        this.muted = true;
        for ( var i in _fxs )
          _fxs[ i ].sound.stop();
      }
      
      this.unmute = function()
      {
        this.muted = false;
      }
      
      this.setVolume = function( val )
      {
        this.volume = val || 0;
        for ( var i in _fxs )
          _fxs[ i ].sound.setVolume( this.volume );
      }
    }
  };
  
  CONFIG.debug.log( "AudioManager loaded", 3 );
  return AudioManager;
} );