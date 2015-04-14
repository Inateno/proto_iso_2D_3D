define( [ 'DREAM_ENGINE', 'stash' ],
function( DE, stash )
{
  var Windows8App = new function()
  {
    this.init = function()
    {
      if ( !WinJS )
        throw new Error( "WinJS is not defined, a Windows8App need it !" );
      var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
      settingsPane.addEventListener( "commandsrequested", function (e)
      {
        var customButton = new Windows.UI.ApplicationSettings.SettingsCommand(
          "Options", DE.LangSystem.get( 'settings' ) || 'Settings'
          , function( e )
          {
            // go on settings menu
            Windows8App.onSettingsPanel();
          }
        );
        e.request.applicationCommands.append(customButton);
      } );
      
      WinJS.Application.onsettings = function(e)
      {
        Windows8App.onSettings( e );
      }
      
      WinJS.Application.onunload = function(e)
      {
        Windows8App.onUnload( e );
      }
      
      // override gamepads detection, bind it manually
      this.plugToGamePadLib();
      
      DE.ImageManager.pushImage( "snapped", "images/snapped", "jpg", { "load": true } );
      WinJS.Application.start();
      DE.LangSystem.getLang( Windows.Globalization.Language.currentInputMethodLanguageTag );
      window.addEventListener( "resize", function(){ Windows8App.checkResize(); }, false );
    }
    
    this.onSettings = function(e){}
    this.onUnload = function(e){}
    this.onResize = function( isOverridingMainLoop ){}
    
    this.checkResize = function()
    {
      if ( Windows.UI.ViewManagement.ApplicationView.value == 2 )
      {
        for ( var i = 0, j; j = DE.MainLoop.renders[ i ]; i++ )
        {
          j.canvas.parentElement.previousState = j.canvas.parentElement.style.display;
          j.canvas.parentElement.style.display = "none";
          j.canvas.previousState = j.canvas.style.display;
          j.canvas.style.display = "none";
        }
        // display my render and hide others
        if ( this.render )
        {
          this.render.canvas.parentElement.style.display = "block";
          this.render.canvas.style.display = "inline-block";
        }
        // display DOM ?
        if ( this.elem )
          this.elem.style.display = "block";
        this.onResize( true );
        this.isOverridingMainLoop = true;
      }
      else if ( this.isOverridingMainLoop )
      {
        // display my render and hide others
        if ( this.render )
        {
          this.render.canvas.parentElement.style.display = "none";
          this.render.canvas.style.display = "none";
        }
        // display DOM ?
        if ( this.elem )
          this.elem.style.display = "none";
        for ( var i = 0, j; j = DE.MainLoop.renders[ i ]; i++ )
        {
          j.canvas.parentElement.style.display = j.canvas.parentElement.previousState;
          j.canvas.style.display = j.canvas.previousState;
        }
        this.onResize( false );
        this.isOverridingMainLoop = false;
      }
    }
    
    this.plugToGamePadLib = function()
    {
      //First arg is cpp->javascript class , second arg is nbr of gamepads
      DE.GamePad.adaptToWindowsLib(GameController, 4);
    }
    
    // sample to see your application rated
    this.askIf = null;
    this.askToRate = function()
    {
      var lang = DE.LangSystem.currentLang;
      var askIf = ( this.askIf != null ) ? stash.get( this.askIf ) : true;
      if ( askIf && !stash.get( 'rated' ) )
      {
        var md = new Windows.UI.Popups.MessageDialog( DE.LangSystem.get( 'askToRate' ) );
        var result, resultOptions = [
          DE.LangSystem.get( "rateYep" ) || "Yes"
          , DE.LangSystem.get( "rateLater" ) || "Later"
          , DE.LangSystem.get( "rateNop" ) || "No, never"
        ];
        for (var i = 0, cmd; i < resultOptions.length; ++i )
        {
          cmd = new Windows.UI.Popups.UICommand();
          cmd.label = resultOptions[ i ];
          cmd.id = i;
          cmd.invoked = function( c )
          {
            result = c.id;
          }
          md.commands.append( cmd );
        }
        
        md.showAsync().then( function( c )
        {
          if ( result == 1 )
            return;
          if ( result == 0 )
          {
            Windows.System.Launcher.launchUriAsync(
              new Windows.Foundation.Uri("ms-windows-store:REVIEW?PFN=Dreamirl.Tribal-run_b2ycza82k38da")
            );
          }
          stash.set( 'rated', true );
        } );
      }
    }
  };
  
  return Windows8App;
} );