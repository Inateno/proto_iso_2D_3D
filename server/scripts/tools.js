define( [ 'colors', 'scripts/sharedDatas', 'scripts/accounts' ],
function( colors, sharedDatas, accounts )
{
  var tools = new function()
  {
    this.player = new function()
    {
      this.get = function( id, dbSearch )
      {
        var players = sharedDatas.players;
        if ( dbSearch )
          return accounts[ id ] || null;
        return players[ id ] || null;
      }
      
      this.getByNick = function( nick, dbSearch )
      {
        if ( !sharedDatas.playersLinkName[ nick ] )
          return null;
        if ( dbSearch )
          return accounts[ sharedDatas.playersLinkName[ nick ] ] || null;
        return sharedDatas.players[ sharedDatas.playersLinkName[ nick ] ] || null;
      }
      
      this.changeAttr = function( id, attrName, value )
      {
        // TODO - before try if attrName exist and if value type is allowed
        //
        
        var target = tools.player.get( playerIndex, true );
        var byNick = false;
        if ( !target )
        {
          target = tools.player.getByNick( playerIndex, true );
          if ( !target )
          {
            this.emit( "commandError", "Can't find player index " + playerIndex );
            return;
          }
          byNick = true;
        }
        if ( !target.player[ attrName ] )
        {
          this.emit( "commandError", "attribute " + attrName + " not exist for playerId: " + playerIndex );
          return;
        }
        target.player[ attrName ] = value;
        
        var connectedTarget = null;
        if ( !byNick )
          connectedTarget = tools.player.get( playerIndex );
        else
          connectedTarget = tools.player.getByNick( playerIndex );
        
        if ( connectedTarget )
        {
          connectedTarget.player[ attrName ] = value;
          connectedTarget.socket.emit( "changeAttribute", attrName, value );
        }
      }
      
      this.warpTo = function( player, pos, warper )
      {
        player.position.x = destX;
        player.position.y = destY;
        player.position.z = destZ;
        player.socket.emit( 'playerInputs', player.index, player.inputs, player.position );
        player.socket.manager.sockets.emit( 'playerInputs', player.index, player.inputs, player.position );
        
        if ( warper )
          player.socket.emit( "adminMsg", warper.nick + " warped you" );
      }
    };
    
    this.toJSON = function( object, target, datas )
    {
      var result = {};
      if ( !target )
      {
        for ( var i in object )
        {
          if ( object[ i ].toJSON )
            result[ i ] = object[ i ].toJSON( datas );
        }
      }
      else
      {
        if ( !object[ target ] || !object[ target ].toJSON )
        {
          console.myLog( "Error, try call value toJSON of object not exist or toJSON undefined !\n - target:: "
                        + target +  "\n - datas:: " + datas + "\n - object::\n" + JSON.stringify( object )
                      , colors.error );
          result = {};
        }
        else
          result = object[ target ].toJSON( datas );
      }
      return result;
    }
    
    /****
     params@object
     collection@object || collection@array
     return -> @object || @null
     * find objects in collection where params matchs
     */
    this.whereIn = function( params, collection, singleShot )
    {
      var results = [];
      if ( collection.length && collection.prototype.splice )
      {
        for ( var i = 0, o; o = collection[ i ]; ++i )
        {
          var next = false;
          for ( var attr in params )
          {
            if ( next || !o[ attr ] || o[ attr ] != params[ attr ] )
            {
              next = true;
              continue;
            }
          }
          if ( !next && singleShot )
            return o;
          if ( !next )
            results.push( o );
        }
        if ( singleShot )
          return null;
        return results;
      }
      for ( var i in collection )
      {
        var next = false;
        for ( var attr in params )
        {
          if ( next || !collection[ i ][ attr ] || collection[ i ][ attr ] != params[ attr ] )
          {
            next = true;
            continue;
          }
        }
        if ( !next && singleShot )
          return collection[ i ];
        if ( !next )
          results.push( collection[ i ] );
      }
      return results;
    }
    
    /****
     params@object
     collection@object || collection@array
     return -> @object || @null
     * find first object in collection where params matchs
     */
    this.findWhereIn = function( params, collection )
    {
      return this.whereIn( params, collection, true );
    }
  };
  
  return tools;
} );