// ------------------------------------------------------------------------
// FINITE STATE MACHINE - maszyna o skończonej liczbie stanów

export class CFiniteStateMachine
{
	_states={};					// dostępne stany
	_currentState=null;			// aktualny stan
	 
// ------------------------------------------------------------------------
// Kopiuj dane z drugiego obiektu (deep copy)
copy( fsmB )
{
	this._currentState = fsmB._currentState;
	
	this.remAllStates();
	
	for( let stateNameB in fsmB._states )
		this._states[stateNameB] = fsmB._states[stateNameB].clone();
} 
// ------------------------------------------------------------------------
// Utwórz "deep" copy (nowy obiekt) 
clone()
{ 
	let fsm = new this.constructor();
	fsm.copy(this);
	return fsm;
}
// ------------------------------------------------------------------------
// Tworzy nowy dostępny stan 
addState( stateObj )	// obiekt dziedziczący po CState
{ 
	this._states[ stateObj.name ] = stateObj;
	return stateObj;
}
// ------------------------------------------------------------------------
// Usuwa stan o podanej nazwie
remState( stateName )	// nazwa stanu
{ 
	if( stateName in this._states )
	{
		const state = this._states[ stateName ];
		
		if( this._currentState == state )
			this._currentState = null;
		
		state.dispose(); 
		delete this._states[ stateName ];
	}
}
// ------------------------------------------------------------------------
// Usuwa wszystkie stany
remAllStates()
{
	for( let stateName in this._states )
		this._states[ stateName ].dispose(); 
	
	this._states={};
}
// ------------------------------------------------------------------------
// Zwraca stan o podanej nazwie (lub undefined jeśli takiego nie ma)
getState( name )
{ 
	return this._states[ name ];
}
// ------------------------------------------------------------------------
// Ustaw aktualny stan
setState( name )	// [str]nazwa nowego stanu lub null jeśli wyłączyć
{
    const prevState = this._currentState; 
	
	// ten sam?
	if( prevState && prevState.name == name ) 
		return; 
	
	// name == null -> wyłączyć 
	if( !name )
	{
		if( prevState ) 
			prevState.exit();
		this._currentState = null;
	}
	else
	{
		if( !(name in this._states) )
			throw Error( "No such state: "+name );
		
		// Utwórz nowy stan zarejestrowanego typu
		this._currentState = this._states[name];
		
		// Wejdź w nowy stan (z poprzedniego)
		this._currentState.enter( prevState );
	}
}
// ------------------------------------------------------------------------
// Zwraca aktualny stan (lub undefined)
getCurState(){
	return this._currentState;
}
// ------------------------------------------------------------------------
// Policz stany
getNumStates()
{
	let numStates=0;
	for( let stateName in this._states )
		numStates++; 
	return numStates;
}
// ------------------------------------------------------------------------
// Wykonaj dla każdego stanu 
forEach( callback )		// callback( CState ) 
{
	for( let state in this._states )
		callback( this._states[ state ] );
}
// ------------------------------------------------------------------------
}


// ------------------------------------------------------------------------
// Stan - absrakcyjna klasa bazowa
export class CState 
{ 
	// Konstruktor
	constructor(){}
	
	// Zwraca nazwę stanu
	get name(){
		throw Error("Funkcja abstrakcyjna! Brak implementacji!");
		return undefined;
	}

	// Wejdź w ten stan
	enter( prevState ){ 	// poprzedni stan
		throw Error("Funkcja abstrakcyjna! Brak implementacji!"); }
		
	// Wyjdź z tego stanu
	exit(){}
		
	// Posprzątaj - wywoływane tuż przed usunięciem
	dispose(){}
		
	// Zrób kopię tego obiektu (deep copy - osobny obiekt)
	copy(){ }
	
	// Zrób kopię tego obiektu (deep copy - osobny obiekt)
	clone()
	{
		// console.log("CState.clone new=["+this.constructor.name+"]");
		let newState = new this.constructor(); 
		newState.copy( this );
		return newState;
	} 
// ------------------------------------------------------------------------
};