/**
* @ContributorsList
* @Inateno / http://inateno.com / http://dreamirl.com
*
***
*
* @singleton
Event

you can add some Events on what you want, by default there are on engine "states".
When you want create an event callback, create it like that: on( 'somethin', function(){ myfunction(); } ) because callbacks are deleted
**/
define( [ 'DE.CONFIG' ],
function( CONFIG )
{
  var Event = new function()
  {
    this.DEName = "Event";
  };
  
  Event.listenersFor = {};
  Event.persistentFor = {};
  Event.on = function( eventName, callback, persistent )
  {
    if ( !Event.listenersFor[ eventName ] )
    {
      Event.listenersFor[ eventName ] = new Array();
      Event.persistentFor[ eventName ] = new Array();
    }
    Event.listenersFor[ eventName ].push( callback );
    Event.persistentFor[ eventName ].push( persistent || false );
  };
  
  Event.emit = function()
  {
    var args = Array.prototype.slice.call( arguments );
    var eventName = args.shift();
    
    var listeners = Event.listenersFor[ eventName ] || [];
    var persistent = Event.persistentFor[ eventName ] || [];
    for ( var i = 0; i < listeners.length; i++ )
    {
      /*try
      {*/
        listeners[ i ].apply( Event, args );
        // not persistents event are removed
        if ( persistent && !persistent[ i ] )
        {
          var pers = persistent[ i ];
          var callback = listeners[ i ];
          listeners.splice( i, 1 );
          persistent.splice( i, 1 );
          delete pers;
          delete callback;
          i--;
        }
      /*}
      catch ( e )
      {
        console.warn( 'Error on event ' + eventName );
        throw( e );
      }*/
    }
  };
  
  CONFIG.debug.log( "Event loaded", 3 );
  
  Event.addEventCapabilities = function (object) 
  {
    
    object.listenersFor = {};
    
    object.on = function (eventName, callback) {
        if (!object.listenersFor[eventName]) {
            object.listenersFor[eventName] = [];
        }
        object.listenersFor[eventName].push(callback);
    };
    
    object.emit = function () {
        var args = Array.prototype.slice.call(arguments);
        var eventName = args.shift();
        var listeners = object.listenersFor[eventName] || [];
        
        for (var i=0; i < listeners.length; i++) {
            try {
                listeners[i].apply(object, args);
            } catch (e) {
               console.error('Error on event '+eventName);
               throw(e);
            }
        };
    };

    object.del = function(eventName, f)
    {
      if (!f)
      {
        delete object.listenersFor[eventName];
        return;
      }
      else
      {
        for (var i in object.listenersFor[eventName])
        {
          if (object.listenersFor[eventName][i] == f)
          {
            object.listenersFor[eventName].splice(i,1);
            return true;
          }
        }
      }
      return;
    }
  };
  
  CONFIG.debug.log( "Event classes loaded", 3 );
  return Event;
} );