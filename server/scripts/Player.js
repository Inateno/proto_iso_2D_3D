define( [ 'colors' ],
function( colors )
{
  function Player( index, datas )
  {
    this.index = index;
    this.nick = datas.nick;
    this.level = datas.level;
    
    // stats
    this.hp = datas.hp;
    this.maxhp = datas.maxhp;
    
    this.strength = datas.strength;
    this.defense = datas.defense;
    
    this.position = {
      "x": datas.x
      ,"y": datas.y
      ,"z": datas.z
    };
    
    this.inputs = {
      'vaxe'    : 0
      ,'haxe'   : 0
      ,'jump'   : 0
      ,'attack1': 0
      ,'attack2': 0
    };
    this.previousInputs = {};
    this.changedInputs = {};
    
    this.friends = [];
    
    this.changeInputs = function( inputs )
    {
      var hasChanged = false;
      this.changedInputs = {};
      for ( var i in inputs )
      {
        // inputs possible ?
        if ( this.inputs[ i ] === undefined || inputs[ i ] > 2 || inputs[ i ] < -2 // hacking inputs yay
            || inputs[ i ] == this.inputs[ i ] ) // no change
        {
          delete inputs[ i ];
          continue;
        }
        this.inputs[ i ] = inputs[ i ];
        this.changedInputs[ i ] = inputs[ i ];
        hasChanged = true;
      }
      return hasChanged;
    }
    
    this.toJSON = function( callerId )
    {
      var datas = {
        position: this.position
        ,inputs: this.inputs
        ,nick: this.nick
      };
      
      if ( callerId && ( callerId == this.index || this.friends.indexOf( callerId ) != -1 ) )
      {
        datas.level    = this.level;
        datas.maxhp    = this.maxhp;
        datas.hp       = this.hp;
        datas.strength = this.strength;
        datas.defense  = this.defense;
      }
      return datas;
    }
  }
  
  return Player;
} );