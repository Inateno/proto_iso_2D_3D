/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
*
* @singleton
Inputs
// handjs dont need to be included, just call to activate it
**/
define( [ 'DE.CONFIG', 'DE.GamePad', 'handjs' ],
function( CONFIG, gamePad )
{
  var Inputs = new function()
  {
    this.DEName = "Inputs";
    
    this.isListening = false;
    
    // push names here
    // .i = case sensitive
    // default is not case sensitive
    this.usedInputs = {};
    
    // @private renders, stock renders to bind inputs and call them
    var _renders = {};
    this.kbLostFocus = false;
    this.mouse = {
      'x': 0
      ,'y':0
      ,'isDown':false
    };
    this.dbInputs = {
      "MOUSE":{
        "leftClick":1000000001
        ,"rightClick":1000000002
        ,"wheelTop":1000000003
        ,"wheelDown":1000000004
      }
      ,"KEYBOARD":{
        "up":38
        ,"down":40
        ,"left":37
        ,"right":39
        ,"space":32
        ,"shift":16
        ,"caps":20
        ,"tab":9
        ,"d":68,"q":81,"z":90,"s":83,"a":65,"e":69,"r":82,"t":84,"y":89,"u":85,"i":73,"o":79,"p":80,"f":70
        ,"g":71,"h":72,"j":74,"k":75,"l":76,"m":77,"w":87,"x":88,"c":67,"v":86,"b":66,"n":78
        ,"enter":13,"return":8
        ,"PAD+":107, "PAD-":109, "PAD*":106, "PAD/":111, "PAD0":96, "PAD1":97, "PAD2":98, "PAD3":99, "PAD4":100
        ,"PAD5":101, "PAD6":102, "PAD7":103, "PAD8":104, "PAD9":105
      }
      ,"GAMEPADBUTTONS":{
        "A" : 0
        ,"B" : 1
        ,"Y": 3
        ,"X" : 2
        ,"D-Up" : 12
        ,"D-Right" : 15
        ,"D-Left" : 14
        ,"D-Bot" : 13
        ,"select": 8
        ,"start" : 9
        ,"RBS" : 7
        ,"RTS" : 5
        ,"LBS" : 6
        ,"LTS" : 4
        ,"power" : 16
      }
      ,"GAMEPADAXES":
      {
        'LHorizontal' : 0
        ,'LVertical' : 1
        ,'RHorizontal' : 2
        ,'RVertical' : 3
      }
      
    };
    
    this.queue = {
      'keyDown': {}
      , 'keyUp': {}
      , 'mouseDown': {}
      , 'mouseUp': {}
      , 'btnMoved': {}
      , 'axeMoved' : {}
      , 'axeStart' : {}
      , 'axeStop' : {}
    };
    
    this.on = function( type, input, callback )
    {
      if ( !this.queue[ type ][ input ] )
      {
        console.log( '%cWARN:: Try to bind on a non existant input ::: ' + type + ' - ' + input, "color:red" );
        return 
      }
      this.queue[ type ][ input ].push( callback );
    }
    
    /***
    * @init
    * need object customInputs
    ***/
    this.init = function( customInputs )
    {
      var newInputs = {};
      
      for ( var i in customInputs )
      {
        newInputs[ i ] = {};
        
        newInputs[ i ].inputs = new Array();
        for ( var n = 0, I; I = customInputs[ i ].keycodes[ n ]; n++ )
        {
          var type = ( I[ 0 ] == "K" || I[ 0 ] == "k" ) ? "KEYBOARD" : "MOUSE";
          var data = I.split(".");
          var gamePadID = 0;
          var name;
          if (data[0][0] == "G" )
          {
            
            if (data[0][1])
            {
              gamePadID = parseInt(data[0][1]);
            }
            if (data[1] =="A" )
            {
              type = "GAMEPADAXES"
            }
            else
            {
              type = "GAMEPADBUTTONS";
            }
            name = data[2];
          }
          else
          {
            name = I.slice( 2, I.length );
          }
          if ( typeof this.dbInputs[ type ][ name ] == "undefined" )
          {
            console.log( "%cAn input couldn't be found in the database, did you respect the caseSensitive ?:" + type + "." + name + "\n Ignoring it and continue...", "color:red");
            continue;
          }
          
          if (type == "GAMEPADBUTTONS")
          {
            gamePad.plugBtnToInput(this, i, gamePadID, this.dbInputs[ type ][ name ] );
          }
          if (type == "GAMEPADAXES")
          {
            gamePad.plugAxeToInput(this, i, gamePadID, this.dbInputs[ type ][ name ] );
          }
          newInputs[ i ].inputs.push( { "code": this.dbInputs[ type ][ name ], "type": type } );
        }
        newInputs[ i ].interval = customInputs[ i ].interval || 0;
        newInputs[ i ].lastCall  = Date.now();
        newInputs[ i ].actions  = {};
        newInputs[ i ].isDown  = false;
        newInputs[ i ].isLongPress  = customInputs[ i ].isLongPress || false;
        newInputs[ i ].stayOn  = customInputs[ i ].stayOn || false;

        newInputs[ i ].numberCall  = 0;
        newInputs[ i ].numberPress  = 0;

        if ( newInputs[ i ].stayOn )
        {
          newInputs[ i ].lastCall = Date.now() + newInputs[ i ].interval;
        }
        
        this.queue[ 'keyDown' ][ i ] = new Array();
        this.queue[ 'keyUp' ][ i ] = new Array();
        this.queue[ 'mouseDown' ][ i ] = new Array();
        this.queue[ 'mouseUp' ][ i ] = new Array();
        this.queue[ 'btnMoved'][ i ] = new Array();
        this.queue[ 'axeMoved'][ i ] = new Array();
        this.queue[ 'axeStart'][ i ] = new Array();
        this.queue[ 'axeStop'][ i ] = new Array();
       }
      this.usedInputs = newInputs;
      this.toggleListeners();
    }
    
    /***
    * @public @get
    return the queried key or false
    ***/
    this.get = function( name )
    {
      if ( this.usedInputs[ name ] )
      {
        return this.usedInputs[ name ];
      }
      return false;
    }
    
    /***
     * trigger manually an event
     */
    this.trigger = function( eventType, keyName )
    {
      for ( var ev in Inputs.queue[ eventType ][ keyName ] )
      {
        Inputs.queue[ eventType ][ keyName ][ ev ]();
      }
    }
    
    /***
    * @public @key
    return the key state
    ***/
    this.key = function( name )
    {
      if ( this.usedInputs[ name ] && this.usedInputs[ name ].isDown
        && ( !this.usedInputs[ name ].interval || Date.now() - this.usedInputs[ name ].lastCall >= this.usedInputs[ name ].interval )
      )
      {
        if ( !Inputs.usedInputs[ name ].stayOn )
        {
          Inputs.usedInputs[ name ].lastCall = Date.now();
        }
        Inputs.usedInputs[ name ].numberCall++;
        return true;
      }
      return false;
    }
    
    /***
    * @toggleListeners
    ***/
    this.toggleListeners = function( canvas, bind )
    {
      var target = canvas || window;
      if ( this.isListening && !bind )
      {
        if ( target.removeEventListener )
        {
          target.removeEventListener( "keydown", Inputs.keyDown, false );
          target.removeEventListener( "keyup", Inputs.keyUp, false );
          target.removeEventListener( "keypress", Inputs.keyPress, false );
        }
        else if ( target.detachEvent )
        {
          target.detachEvent( "onkeydown", Inputs.keyDown );
          target.detachEvent( "onkeyup", Inputs.keyUp );
          target.detachEvent( "onkeypress", Inputs.keyPress );
        }
      }
      else
      {
        if ( target.addEventListener )
        {
          target.addEventListener( "keydown", Inputs.keyDown, false );
          target.addEventListener( "keyup", Inputs.keyUp, false );
          target.addEventListener( "keypress", Inputs.keyPress, false );
        }
        else if ( target.attachEvent )
        {
          target.attachEvent( "onkeydown", Inputs.keyDown );
          target.attachEvent( "onkeyup", Inputs.keyUp );
          target.attachEvent( "onkeypress", Inputs.keyPress );
        }
      }
    }
    
    /***
    * @private @findInput
    ***/
    this.findInput = function( code, type )
    {
      // parse all gamesInputs
      for ( var i in Inputs.usedInputs )
      {
        // parse each inputs
        for ( var t in Inputs.usedInputs[ i ].inputs )
        {
          var input = Inputs.usedInputs[ i ].inputs[ t ].code
            , tp = Inputs.usedInputs[ i ].inputs[ t ].type;
          
          if ( input == code && tp == type )
          {
            return i;
          }
        }
      }
      return false;
    }
    
    /***
    * @keyDown
    ***/
    this.keyDown = function( event )
    {
      if ( Inputs.kbLostFocus )
        return false;
      var e = event || window.event;
      var code = e.which || e.keyCode;
      /*
      * need add an "on" keydown event handler here
      */
      var isDown = Inputs.findInput( code, "KEYBOARD" );
      if ( isDown !== false )
      {
        if ( !Inputs.usedInputs[ isDown ].isDown && Date.now() - Inputs.usedInputs[ isDown ].lastCall >= Inputs.usedInputs[ isDown ].interval )
        {
          // it's a long press key type ?
          if ( Inputs.usedInputs[ isDown ].isLongPress && !Inputs.usedInputs[ isDown ].stayOn )
          {
            Inputs.usedInputs[ isDown ].lastCall = Date.now();
          }
          
          /* specific on keydown event handler here */
          if ( !Inputs.usedInputs[ isDown ].isDown )
          {
            for ( var ev in Inputs.queue[ 'keyDown' ][ isDown ] )
            {
              Inputs.queue[ 'keyDown' ][ isDown ][ ev ]();
            }
          }
          Inputs.usedInputs[ isDown ].isDown = true;
        }
        Inputs.usedInputs[ isDown ].numberPress++;
        // e.preventDefault();
      }
      // return false;
    }
    /***
    * @keyUp
    ***/
    this.keyUp = function( event )
    {
      if ( Inputs.kbLostFocus )
        return false;
      var e = event || window.event;
      var code = e.which || e.keyCode;
      /*
      * need add an "on" keyup event handler here (no precise case)
      */
      var isUp = Inputs.findInput( code, "KEYBOARD" );
      if ( isUp !== false )
      {
        if ( Inputs.usedInputs[ isUp ].isDown )
        {
          /* "on" keyup event handler here */
          for ( var ev in Inputs.queue[ 'keyUp' ][ isUp ] )
          {
            Inputs.queue[ 'keyUp' ][ isUp ][ ev ]();
          }
        }

        if ( Inputs.usedInputs[ isUp ].stayOn )
        {
          Inputs.usedInputs[ isUp ].lastCall = Date.now();
        }

        Inputs.usedInputs[ isUp ].isDown = false;
      }
      // e.preventDefault();
      // return false;
    }
    
    /***
    * @keyPress
    useless method ?
    ***/
    this.keyPress = function( event )
    {
      var e = event || window.event;
      var key = e.which || e.keyCode;
      var code = e.keyCode;

      var isUp = Inputs.findInput( code, "KEYBOARD" );
      if ( isUp !== false )
      {
        if ( Inputs.usedInputs[ isUp ].isDown )
        {
          /*
          * need add an "on" keyup event handler here
          */
        }
        // Inputs.usedInputs[ isUp ].isDown = false;
      }
      
      // e.preventDefault();
      // return false;
    }
    
    /***
    * @EVENT @public @mouseDown
    */
    this.mouseDown = function( event )
    {
      if ( _renders[ event.target.id ] )
      {
        Inputs.mouse.isDown = true;
        Inputs.mouse.x = event.clientX;
        Inputs.mouse.y = event.clientY;
        Inputs.mouse.index = event.index || 0;
        _renders[ event.target.id ].oOnMouseDown( Inputs.mouse );
      }
      
      // catch general events 'on', 'mouseDown' if there is
      var isDown = Inputs.findInput( 1000000001, "MOUSE" );
      if ( isDown !== false )
      {
        if ( !Inputs.usedInputs[ isDown ].isDown )
        {
          /* "on" event handler here */
          for ( var ev in Inputs.queue[ 'mouseDown' ][ isDown ] )
          {
            Inputs.queue[ 'mouseDown' ][ isDown ][ ev ]();
          }
        }
        
        Inputs.usedInputs[ isDown ].isDown = true;
      }
      // event.preventDefault();
      return false;
    }
    
    /***
    * @EVENT @public @mouseUp
    */
    this.mouseUp = function( event )
    {
      if ( _renders[ event.target.id ] )
      {
        Inputs.mouse.isDown = false;
        Inputs.mouse.x = event.clientX;
        Inputs.mouse.y = event.clientY;
        Inputs.mouse.index = event.index || 0;
        _renders[ event.target.id ].oOnMouseUp( Inputs.mouse );
      }
      
      // catch general events 'on', 'mouseUp' if there is
      var isDown = Inputs.findInput( 1000000001, "MOUSE" );
      if ( isDown !== false )
      {
        if ( Inputs.usedInputs[ isDown ].isDown )
        {
          /* "on" event handler here */
          for ( var ev in Inputs.queue[ 'mouseUp' ][ isDown ] )
          {
            Inputs.queue[ 'mouseUp' ][ isDown ][ ev ]();
          }
        }
        Inputs.usedInputs[ isDown ].isDown = false;
      }
      
      event.preventDefault();
      return false;
    }
    
    /***
    * @EVENT @public @mouseMove
    */
    this.mouseMove = function( event )
    {
      if ( _renders[ event.target.id ] )
      {
        Inputs.mouse.isDown = true;
        Inputs.mouse.x = event.clientX;
        Inputs.mouse.y = event.clientY;
        Inputs.mouse.index = event.index || 0;
        _renders[ event.target.id ].oOnMouseMove( Inputs.mouse, "MOUSE" );
      }
      
      Inputs.mouse.x = event.clientX;
      Inputs.mouse.y = event.clientY;
    }
    
    /***
    *
    */
    this.mouseClick = function( event )
    {
      /*
      * need add an "on" mouseclick event handler here
      */
    }
    
    /* MOUSE DOUBLE CLICK */
    this.mouseDbClick = function(){}
    // prefer using the getMouseButton something like that
    this.rightClick = function( event )
    {
      event.preventDefault();
      event.stopPropagation();
    }

    /***
    * @addEvent
    ***/
    this.addEvent = function( event )
    {
    }
    
    /***
    * @public @addActionInput
    * @param
      @string inputName
      @int id
      @function callback
    - bind a callback on given input name
    */
    this.addActionInput = function( inputName, id, action )
    {
      if ( !this.checkInputExist( inputName ) )
      {
        return;
      }
      
      if ( CONFIG.DEBUG && CONFIG.DEBUG_LEVEL >= 3 && this.usedInputs[ inputName ].actions[ id ] )
      {
        CONFIG.debug.log( "Replace the action " + id + " on input " + inputName, 3 );
      }
      this.usedInputs[ inputName ].actions[ id ] = action;
    }
    /***
    * @public @removeActionInput
    * @param
      @string inputName
      @int id
    - remove a give action, on input name
    */
    this.removeActionInput = function( inputName, id )
    {
      if ( !this.checkInputExist( inputName ) )
      {
        return;
      }
      
      if ( !this.usedInputs[ inputName ].actions[ id ] )
      {
        throw new Error( "Try to remove a not founded action by id:: " + id );
        return;
      }
      CONFIG.debug.log( "Remove the action " + id + " on input " + inputName, 3 );
      delete this.usedInputs[ inputName ].actions[ id ];
    }
    
    /***
    * @public @checkInputExist
    * @param
      @string inputName
    - check existence of given input by name
    */
    this.checkInputExist = function( inputName )
    {
      if ( !this.usedInputs[ inputName ] )
      {
        CONFIG.debug.log( "Try to access an input not defined:: " + inputName, 1 );
        return false;
      }
      return true;
    }
    
    /***
    * @public @addRender
      @Render render
    - add render to bind events on
    */
    this.addRender = function( render )
    {
      _renders[ render.id ] = render;
      
      var canvas = render.canvas;
      // handjs :)
      canvas.addEventListener( "PointerDown", Inputs.mouseDown, false );
      canvas.addEventListener( "PointerUp", Inputs.mouseUp, false );
      canvas.addEventListener( "PointerOut", Inputs.mouseMove, false );
      canvas.addEventListener( "mouseclick", Inputs.mouseClick, false );
      canvas.addEventListener( "mousedbclick", Inputs.mouseDbClick, false );
      canvas.addEventListener( "PointerMove", Inputs.mouseMove, false );
      canvas.addEventListener( "contextmenu", Inputs.rightClick, false );
      canvas.addEventListener( "DOMMouseScroll", Inputs.mouseWheel, false ); // seems not working
      canvas.addEventListener( "mousewheel", Inputs.mouseWheel, false ); // same here
      canvas.onmousewheel = Inputs.mouseWheel; // that work, sure
      
      // Lol
      if ( window.attachEvent )
      {
        canvas.attachEvent("onmousewheel", Inputs.mouseWheel);
      }
      
      // origin
      // canvas.addEventListener( "mousedown", Inputs.mouseDown, false );
      // canvas.addEventListener( "mouseup", Inputs.mouseUp, false );
      // canvas.addEventListener( "mousemove", Inputs.mouseMove, false );
      // canvas.addEventListener( "touchstart", Inputs.touchMouseDown );
      // canvas.addEventListener( "touchmove", Inputs.touchMouseMove );
      // canvas.addEventListener( "touchend", Inputs.touchUp );
    }
    
    /***
    * @public @removeRender
    * @param
      @int renderId
    - remove the given render and remove events
    */
    this.removeRender = function( renderId )
    {
      if ( !_renders[ renderId ].canvas )
      {
        CONFIG.debug.log( "[INPUTS] Try to remove a renders but not found :: " + renderId, 1 );
        return;
      }
      
      _renders[ renderId ].canvas.removeEventListener( "PointerDown", Inputs.mouseDown, false );
      _renders[ renderId ].canvas.removeEventListener( "PointerUp", Inputs.mouseUp, false );
      _renders[ renderId ].canvas.removeEventListener( "PointerOut", Inputs.mouseUp, false );
      _renders[ renderId ].canvas.removeEventListener( "mouseclick", Inputs.mouseClick, false );
      _renders[ renderId ].canvas.removeEventListener( "mousedbclick", Inputs.mouseDbClick, false );
      _renders[ renderId ].canvas.removeEventListener( "PointerMove", Inputs.mouseMove, false );
      _renders[ renderId ].canvas.removeEventListener( "contextmenu", Inputs.rightClick, false );
      _renders[ renderId ].canvas.removeEventListener( "DOMMouseScroll", Inputs.mouseWheel, false );
      
      // _renders[ renderId ].canvas.removeEventListener( "mousedown", Inputs.mouseDown, false );
      // _renders[ renderId ].canvas.removeEventListener( "mouseup", Inputs.mouseUp, false );
      // _renders[ renderId ].canvas.removeEventListener( "mousemove", Inputs.mouseMove, false );
      // _renders[ renderId ].canvas.removeEventListener( "touchstart", Inputs.touchMouseDown );
      // _renders[ renderId ].canvas.removeEventListener( "touchmove", Inputs.touchMouseMove );
      // _renders[ renderId ].canvas.removeEventListener( "touchend", Inputs.touchUp );
      
      delete( _renders[ renderId ] );
    }
    
    this.mouseWheel = function( e )
    {
      var dir = e.wheelDelta > 0 ? 1 : -1;
      /* FIREFOX */
      if ( e.detail )
        dir = e.detail < 0 ? 1 : -1;
      
      if ( dir == 1 )
        Inputs.trigger( 'axeMoved', 'wheelTop' );
      else
        Inputs.trigger( 'axeMoved', 'wheelDown' );
    }
  };
  
  CONFIG.debug.log( "Inputs loaded", 3 );
  return Inputs;
} );