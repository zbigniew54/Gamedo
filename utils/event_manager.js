// ------------------------------------------------------------------------
// Służy do rejestrowania funkcji które mają być wykonane za każdym razem gdy nastąpi określone zdarzenie
export class CEventManager
{
	// Zarejestrowane eventy i callbacki
	// events["event_name"][callback_idx] = callback
	// Gdy wystąpi zdarzenie zostanie wywołana funkcja 
	// callback({event: "eventName", target: (obj) })
	events = { 
	};			
	
// ------------------------------------------------------------------------
// Rejestruj zdarzenie by można było do niego dodawać callbacki
registerEvent( eventName )
{ 
	if( this.events.hasOwnProperty( eventName ) ) 
		console.warn("Istnieje już takie zdarzenie: ["+eventName+"]")
	else
		this.events[eventName] = [];
}
// ------------------------------------------------------------------------
// Podpina podany 'callback' pod zdarzenie 'eventName'
// Gdy wystąpi zdarzenie zostanie wywołana funkcja callback({event: "eventName", target: eventTarget z func. notifyEvent() })
addCallback( eventName, callback )
{ 
	if( !this.events.hasOwnProperty( eventName ) )
		throw Error("Nieznane zdarzenie: ["+eventName+"]");
	else
		this.events[eventName].push( callback );
}
// ------------------------------------------------------------------------
// Wywołuje callbacki skojarzone z tym eventem
notifyEvent( eventName, eventTarget )	// nazwa zdarzenia, obiekt zwiazany ze zdarzeniem (np ten co je wywyłał)
{ 
	if( !this.events.hasOwnProperty( eventName ) )
		throw Error("Nieznane zdarzenie: ["+eventName+"]");
	else
	{
		for( let cb of this.events[eventName] )
			cb( {event: eventName, target: eventTarget } );
	}
}
// ------------------------------------------------------------------------
}

// ------------------------------------------------------------------------
// Służy do rejestrowania funkcji które mają być wykonane jednorazowo po zakończeniu określonego zadania. Po wywołaniu callbacki są usuwane.
export class CTaskManager
{
	// Zarejestrowane zadania i callbacki
	// tasks["tasks_name"][callback_idx] = callback
	// Gdy zadanie task zostanie zakończone zostanie wywołana funkcja 
	// callback({name: "taskName", target: (obj) })
	tasks = { 
	};			
	
// ------------------------------------------------------------------------
// Rejestruj task by można było do niego dodawać callbacki
registerTask( taskName )
{ 
	if( this.tasks.hasOwnProperty( taskName ) )
		throw Error("Task name exists: ["+taskName+"]");
	
	this.tasks[taskName] = [];
}
// ------------------------------------------------------------------------
// Podpina podany 'callback' pod task 'taskName'
// Gdy wystąpi task zostanie wywołana funkcja callback({name: "taskName", target: eventTarget z func. notifyEvent() })
addCallback( taskName, callback )
{ 
	if( !this.tasks.hasOwnProperty( taskName ) )
		throw Error("Unknown task: ["+taskName+"]");
	else
		this.tasks[ taskName ].push( callback );
}
// ------------------------------------------------------------------------
// Wywołuje callbacki skojarzone z tym eventem
notify( taskName, taskTarget )	// nazwa zadania, obiekt zwiazany z zadaniem (np ten co je wywołał lub zakończył)
{ 
	if( !this.tasks.hasOwnProperty( taskName ) )
		throw Error("Unknown task: ["+taskName+"]");
	else
	{
		for( let cb of this.tasks[taskName] )
			cb( {name: taskName, target: taskTarget } );
		
		// Usuń wszystkie callbacki do tego task
		this.tasks[ taskName ] = [];
	}
}
// ------------------------------------------------------------------------
	
}