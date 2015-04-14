define( [ 'DREAM_ENGINE', 'DE.GamePad' ],
function( DE, GamePad )
{
  var _coefAirReductor = 0.99;
  var _coefAirFriction = 0.9;
  var _maxAttractionForce = 200;
  var _attractionForce = 0.15;
  
  // herits from GameObject
  function Character( index, playerDatas )
  {
    console.log( playerDatas );
    var _self = this;
    DE.GameObject.call( this, { 'name': 'Player' + index, 'tag': 'Player'
        , 'x': 0, 'y': 0, 'z': 0, "zindex": 2
        // , 'collider': new DE.FixedBoxCollider( { 'width': 50, 'height': 50 } )
        , 'renderer': new DE.SpriteRenderer( { 'spriteName': playerDatas.skin || 'ogre', "scale": 0.3, "offsetTop": -10 } )
    } );
    
    this.addRenderer( new DE.SpriteRenderer( { 'spriteName': "marker", "offsetTop": 0 } ) );
    // this.addRenderer( new DE.SpriteRenderer( { 'spriteName': "marker", "offsetTop": 32 } ) );
    // this.addRenderer( new DE.SpriteRenderer( { 'spriteName': "marker", "offsetLeft": 30, "offsetTop": 16 } ) );
    // this.addRenderer( new DE.SpriteRenderer( { 'spriteName': "marker", "offsetLeft": -30, "offsetTop": 16 } ) );
    this.addRenderer( new DE.TextRenderer( { 'fillColor': 'white', 'offsetY': -80, 'fontSize': 16 }, 100, 30, playerDatas.nick ) );
    
    this.renderers[ 0 ].currentLine = 6;
    
    // player datas
    this.nick = playerDatas.nick;
    this.level= playerDatas.level;
    this.maxHp= playerDatas.maxHp;
    this.hp   = playerDatas.hp;
    this.index= index;
    this.strength = playerDatas.strength;
    this.defense  = playerDatas.defense;
    
    this.dir = 0; // direction - need for other players
    
    // define all start - stop animation
    var _anims = {
      "stand": [ 0 ] // stand
      ,"walk": [ 1, 4 ] // walk
      ,"hit": [ 4, 7 ] // hit
      ,"sleep": [ 7 ] // sleep
      ,"fall":[ 6 ]
    };
    this.camera = null;
    
    // movements
    this.tryMove  = true;
    this.onGround = false;
    this.nextMove = { "x": 0, "y": 0, "z": 0 };
    this.lastMove = { "x": 0, "y": 0, "z": 0 };
    
    this.forces   = { "x": 0, "y": 0, "z": 0 };
    
    this.runSpeed = 6;
    this.walkSpeed= 0.55;
    
    this.density = 5;
    this.jumpForce = 1.3;
    
    this.previousPosition = new DE.Vector2( 0, 0, 0 );
    this.worldPosFloat = new DE.Vector2( playerDatas.position.x, playerDatas.position.y, playerDatas.position.z ); // saved world position on last logout
    this.worldPos = undefined; // position with int cases in the world - calculated by the world
    this.chunkPos = undefined; // position with int cases in the chunk - calculated by the chunk
    this.chunkPosFloat = undefined; // real iso pixel position in the chunk - calculated and by moves by the chunk
    
    this.inputs = {
      'vaxe'    : 0
      ,'haxe'   : 0
      ,'jump'   : 0
      ,'attack1': 0
      ,'attack2': 0
    };
    this.previousInputs = {}
    /****
     * init@void ( isMyIndex@bool )
     */
    this.init = function( isMyIndex )
    {
      if ( isMyIndex )
      {
        this.addAutomatism( "controller", { "type": "myPlayerController" } );
        
        // camera mousewheel control
        DE.Inputs.on( "axeMoved", "wheelTop", function()
        {
          _self.camera.realposition.z--;
          _self.camera.focus( _self );
        } );
        DE.Inputs.on( "axeMoved", "wheelDown", function()
        {
          _self.camera.realposition.z++;
          _self.camera.focus( _self );
        } );
      }
      else
      {
        this.addAutomatism( "controller", { "type": "controller" } );
      }
    }
    
    /****
     * setDir@void ( dir@int[ 0 - 7 ] )
     change character direction (renderer line)
     */
    this.setDir = function( dir ) // 0 left, 1 top-left, 2 top, 3top-right, 4 right, 5 bottom right, 6 bottom, 7 bottom left
    {
      if ( dir == null )
        return;
      this.dir = dir;
      this.renderers[ 0 ].currentLine = dir;
    }
    
    /***
     * startAnim@void ( index@string )
      change current animation (change frame range)
     */
    this.startAnim = function( index )
    {
      if ( !_anims[ index ] )
      {
        console.log( "Specified a bad index when try to start an animation: " + index + "- tag:: " + this.tag );
        return;
      }
      var rd = this.renderers[ 0 ];
      if ( _anims[ index ].length == 1 )
      {
        rd.currentFrame = _anims[ index ];
        rd.isAnimated = false;
        return;
      }
      rd.startFrame = _anims[ index ][ 0 ];
      rd.endFrame = _anims[ index ][ 1 ];
      rd.isAnimated = true;
    }
    
    /***
     * myPlayerController@void
     * check controls on player character
      (called only if binded on init)
     */
    this.myPlayerController = function()
    {
      if ( !this.camera )
      {
        console.log( "It's your player mmh ? There is no camera, how do you want play with it ?" );
        return;
      }
      
      for ( var i in this.inputs )
      {
        this.previousInputs[ i ] = this.inputs[ i ];
        this.inputs[ i ] = 0;
      }
      
      if ( DE.Inputs.key( "left" ) )
      {
        this.inputs.haxe -= 1;
        this.inputs.vaxe += 1;
      }
      if ( DE.Inputs.key( "right" ) )
      {
        this.inputs.haxe += 1;
        this.inputs.vaxe -= 1;
      }
      
      if ( DE.Inputs.key( "up" ) )
      {
        this.inputs.haxe -= 1;
        this.inputs.vaxe -= 1;
      }
      
      if ( DE.Inputs.key( "down" ) )
      {
        this.inputs.haxe += 1;
        this.inputs.vaxe += 1;
      }
      
      if ( DE.Inputs.key( "jump" ) )
      {
        this.inputs.jump = true;
      }
      
      // camera control keyboard
      if ( DE.Inputs.key( "zoom+" ) )
      {
        this.camera.realposition.z--;
        this.camera.focus( this );
      }
      if ( DE.Inputs.key( "zoom-" ) )
      {
        this.camera.realposition.z++;
        this.camera.focus( this );
      }
      
      for ( var i in this.inputs )
      {
        if ( this.inputs[ i ] !== this.previousInputs[ i ] )
        {
          console.log( "input changed, send it " + this.inputs[ i ] + " !== " + this.previousInputs[ i ] );
          this.socket.emit( "changedInput", this.inputs, this.worldPosFloat );
          break;
        }
      }
      
      this.controller();
    }
    
    this.controller = function()
    {
      if ( this.inputs.haxe || this.inputs.vaxe )
      {
        this.forces.x += this.walkSpeed * this.inputs.haxe;
        this.forces.y += this.walkSpeed * this.inputs.vaxe;
      }
      // jump
      if ( this.forces.z == 0 && this.inputs.jump )
      {
        this.forces.z += this.jumpForce;
      }
      if ( !this.touchedGround )
      {
        this.forces.z -= 0.5;
      }
      
      if ( this.forces.x != 0 || this.forces.y != 0 || this.forces.z != 0 )
      {
        this.setDir( this.vectorToDir( { "x": this.inputs.haxe, "y": this.inputs.vaxe } ) );
        this.tryMove = true;
      }
      else
        this.startAnim( "stand" );
    }
    
    /***
     * vectorToDir@int ( vector@vector2 )
     return int direction with a vector2 (0 to 7)
     */
    this.vectorToDir = function( vector2 )
    {
      var x = vector2.x;
      var y = vector2.y;
      if ( x == 0 && y == 0 )
        return null;
      // up, up-left, left
      if ( x < 0 )
        return y < 0 ? 2 : y > 0 ? 0 : 1;
      // down, down-right, right
      if ( x > 0 )
        return y < 0 ? 4 : y > 0 ? 6 : 5;
      
      // down-left, up-right
      return y > 0 ? 7 : 3;
    }
    
    /****
     * apply nextMove on isometric position (don't move the character on the screen)
     */
    this.moveIso = function()
    {
      this.tryMove = false;
      this.lastMove.x = this.nextMove.x;
      this.lastMove.y = this.nextMove.y;
      this.lastMove.z = this.nextMove.z;
      
      this.chunkPosFloat.x += this.nextMove.x;
      this.chunkPosFloat.y += this.nextMove.y;
      this.chunkPosFloat.z += this.nextMove.z;
      this.startAnim( "walk" );
    }
    
    /****
     * move2D, set the player position in the screen with given coords
     */
    this.move2D = function( coords )
    {
      this.previousPosition.x = this.position.x;
      this.previousPosition.y = this.position.y;
      
      this.position.x = coords.x;
      this.position.y = coords.y;
      
      if ( this.camera )
        this.camera.focus( this );
    }
    
    /****
     * stop@void
     * stop all animations
     */
    this.stop = function()
    {
      this.tryMove = false;
      this.forces.x = 0;
      this.forces.y = 0;
      this.forces.z = 0;
      
      this.startAnim( "stand" );
    }
    
    /****
     * fall@void
     * start fall animation and set tryMove at true
     */
    this.fall = function()
    {
      this.startAnim( "fall" );
      this.tryMove = true;
    }
    
    /****
     * rollbackPosition@void
     * restore previous position
     */
    this.rollbackPosition = function()
    {
      delete this.position;
      this.position = this.previousPosition;
    }
    
    this.updateDatas = function( datas )
    {
      this.nick = datas.nick;
      this.updatePosition( datas );
    }
    
    this.updatePosition = function( worldPosFloat )
    {
      this.worldPosFloat = worldPosFloat
      this.updateFromWorld = true;
    }
    
    
    
    
    
    
    
    
    
    
    
    // a trier
    
    /***
    * @calculatePhysic
    */
    this.calculatePhysic = function()
    {
      /*
      if ( resources.settings.mode == 0 )
      {
        var gamePad = GamePad.gamePadsInfos[this.index];
        var axeH = 0;
        if ( gamePad )
          axeH = gamePad.axes[0];
        if ( this.index == 0 )
        {
          axeH = ( DreamE.Inputs.key( "left" ) ) ? -1 : axeH;
          if ( DreamE.Inputs.key( "right" ) )
            axeH = 1;
        }
        
        if ( axeH < -0.65)
          this.gravity.x -= config.maxPlayerForceX * -axeH;
        else if ( axeH > 0.65)
          this.gravity.x += config.maxPlayerForceX * axeH;
      }
      
      var x = 0, y = 0;
      if ( !this.gravity.ylocked )
      {
        y = this.mass * this.gravity.y * _coefAirFriction;
        this.gravity.y += ( ( Math.abs( this.gravity.y ) > _maxAttractionForce ) ? 0 : _attractionForce ) * this.gravity.side;
        this.gravity.y *= _coefAirReductor;
        this.gravity.y = ( this.gravity.y * 100 >> 0 ) / 100;
      }
      if ( !this.gravity.xlocked )
      {
        x = this.moveSpeed * this.gravity.x * _coefAirFriction;
        this.gravity.x *= _coefAirFriction;
        this.gravity.x = ( Math.abs( this.gravity.x ) < 0.4 ) ? 0 : this.gravity.x;
        this.gravity.x = ( this.gravity.x * 100 >> 0 ) / 100;
      }
      this.nextMove = { "x": x, "y": y };
      */
    }
    
    this.jump = function()
    {
      if ( this.disable )
        return;
      if ( this.jumpUsed && this.secondJumpUsed )
        return;
      
      _charRenderers[ "gr" + this.skin ].jump.restartAnim();
      _charRenderers[ "gr" + this.skin ].i_jump.restartAnim();
      
      if ( this.jumpUsed )
        this.secondJumpUsed = true;
      this.jumpUsed = true;
      if ( this.environment == "noGravity" )
      {
        if ( this.gravity.side == 1 )
        {
          this.renderers[ 0 ] = _charRenderers[ "gr" + this.skin ].jump;
          this.addAutomatism( "invertion", { "type": "invertSide", "interval": 200, "persistant": false } )
        }
        else if ( this.gravity.side == -1 )
        {
          this.renderers[ 0 ] = _charRenderers[ "gr" + this.skin ].i_jump;
          this.addAutomatism( "invertion", { "type": "invertSide", "interval": 200, "persistant": false } )
        }
        this.gravity.side = ( this.gravity.side > 0 ) ? -1 : 1;
      }
      else
      {
        this.gravity.side = 1;
        this.renderers[ 0 ] = _charRenderers[ "gr" + this.skin ].jump;
      }
      this.gravity.y = -3.5 * this.gravity.side;// * DE.Time.deltaTime;
      // this.gravity = ( this.gravity > 0 ) ? -1 : 1;
    }
  }
  
  Character.prototype = new DE.GameObject();
  Character.prototype.constructor = Character;
  Character.prototype.supr = DE.GameObject.prototype;
  
  return Character;
} );