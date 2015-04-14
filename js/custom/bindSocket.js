define( [],
function()
{
  function bindSocket( socket, datas, Game )
  {
    // bind socket
    socket.on( 'playerInputs', function( index, inputs, worldPosFloat )
    {
      var pl = Game.world.get( index )
      pl.inputs = inputs;
      pl.updatePosition( worldPosFloat );
    } );
    socket.on( 'playerJoin', function( index, pdatas )
    {
      var player = Game.world.get( index );
      if ( !player )
      {
        player = new Character( index, pdatas );
        player.init();
        Game.world.addEntities( [ player ] );
      }
      else
      {
        player.updateDatas( pdatas );
      }
    } );
    socket.on( 'playerLeave', function( index )
    {
      Game.world.destroyEntitie( index );
    } );
  }
  return bindSocket;
} );