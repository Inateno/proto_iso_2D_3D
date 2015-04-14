define( [ 'colors', 'scripts/socketEvents' ],
function( colors, socketEvents )
{
  function socketBinder( socket )
  {
    //console.log( "bind socket for", socket );
    var listeners = "";
    for ( var i = socket.previousAccess; i < socket.access; ++i )
    {
      var events = socketEvents[ i + 1 ];
      for ( var n in events )
      {
        listeners += n + " - ";
        socket.on( n, events[ n ] );
      }
    }
    console.myLog( socket.handshake.address.address + " get access to " + listeners
                  , colors.info, 1 );
    
    if ( socket.previousAccess > socket.access )
    {
      console.myLog( "Downgrading access - remove listeners", colors.warn );
    }
    
    socket.setAccess = function( newAccess )
    {
      this.previousAccess = this.access;
      this.access = newAccess;
      socketBinder( this );
    }
  }

  return socketBinder;
} );