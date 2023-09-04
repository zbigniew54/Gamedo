// ------------------------------------------------------------------------
// Manager zasobów współdzielonych
// Służy do śledzenia ile obiektów wykorzystuje dany zasób i kiedy można go usunąć
export class CSharedResMgr
{
	_resources;		// Map ( name => {refCount: 0, resource: resH, onDispose: callback })
	
	constructor()
	{
		this._resources = new Map;
	}
	
	// Rejestruje zasów w ResMgr. Wywoływać po załadowaniu zasobu lub utworzeniu obiektu przez new.
	// Jeśli nazwa jest zajęta to aktualizuje ten zasób
	register( 
		name, 					// nazwa zasobu
		resH, 					// uchwyt (referencja) bezpośrednio do zasobu
		onDispose=undefined, 	// onDispose(res) - callback wywoływany gdy obiekt jest usuwany (unlock). Jeśli undefined to zasób nie jest nigdy wyładowywyany, nawet gdy refCount <= 0
		lock=false 				// czy zablokować zaraz po zarejestrowaniu
	)
	{
		// Sprawdź czy taki już istnieje
		const resItem = this._resources.get( name );

		// Jeśli nie - to rejestruj nowy
		if( !resItem )
		{
			this._resources.set( name, {refCount: lock?1:0, resource: resH, onDispose:onDispose } ); 
		}
		// Jeśli istnieje to aktualizuj go i ew lock++
		else
		{
			console.error("Zasób już zarejestrowany: ["+name+"]");
			if( lock ) resItem.refCount++;
			resItem.resource = resH;
			resItem.onDispose = onDispose;
		}
	}
	
	// Zamienia istniejący w resMgr obiekt na nowy (podany)
	// Od tej pory zasób będzie miał referencję do podanego obiektu
	// nie zmieniane są: nazwa, zasobu, refCount, onDispose
	// Jeśli zasób o nazwie 'name' nie istnieje to rzuca wyjątek, chyba że ignoreInfNoExists==true wtedy ignoruje i nic nie robi
	updateResObj( name, newResObj, ignoreInfNoExists=false )
	{
		const resItem = this._resources.get( name );
		if( !resItem ){
			if( !ignoreInfNoExists )
				throw Error("Resource does not exist ["+name+"]");
		}
		else
			resItem.resource = newResObj;
	}
	
	// Zablokuj zasób - zwiększ licznik referencji - oznacz że jest używany przez +1 obiekt
	// Wywoływać po zbindowaniu zasobu do obiektu który go współdzieli
	lock( name )
	{
		let resM = this._resources.get( name );
		if( resM ){
			resM.refCount += 1;
		}
		// Nie ma takiego zasobu? 
		else
			console.error( "  nie zarejestrowany zasób: "+name);
	}
	
	// Odblokuj zasób - zmniejsz licznik referencji 
	// Jeśli refCount == 0 to wywołaj res.onDispose(res.resource), usuń zasób z ResMgr i zwróć true
	// Jeśli po unlock refCount>0 tzn że jakiśinny obiekt korzysta z tego zasobu, więc return false
	// Wywoływać po odbindowaniu zasobu od obiektu który go współdzielił lub usunięciu tego obiektu
	unlock( name )
	{
		let resM = this._resources.get( name );
		if( resM )
		{
			resM.refCount -= 1;
			
			if( resM.refCount <= 0 )
			{
				if( resM.onDispose )
				{
					resM.onDispose( resM.resource );
				
					resM.resource = null;		// zwolnij i pozwól wyładować
					resM.refCount = 0;
					resM.onDispose = undefined;		// żeby nie usunąć dwa razy
				}
			}
		}
		else
			console.error( "  nie zarejestrowany zasób: "+name);
	}
	
	// Usuń i wyładuj wszystkie zasoby
	clear()
	{
		// Dla każdego zasobu - wyładuj go
		this._resources.forEach( function(resM){
			// console.log(resM);
			if( resM.onDispose )
				resM.onDispose( resM.resource );
		});
		
		// Usuń wszystkie elementy
		this._resources.clear();
	}
	
	// Wywołaj callback dla każdego zasobu (który nie został wyładowany)
	forEach( callback ){	// callback(res, resName)
		this._resources.forEach( function(resItem, key){
			if( resItem.resource ) 
				callback( resItem.resource, key ); 
		} );
	}
	
	// Wywołaj callback dla każdego zasobu (który nie został wyładowany) (tak samo jak forEach)
	// Jeśli callback zwraca true kontynuuje pętle (continue) a jeśli false to ją przerywa (break)
	every( callback )	// callback(res, resName)
	{
		for( const [key,resItem] of this._resources )
		{
			if( resItem.resource ){
				if( callback( resItem.resource, key ) === false ) 
					break;
			}
		}
	}
	
	// Pobierz jeden zasób
	// Zwraca undefined jeśli takiego nie ma (lub został wyładowany)
	getRes( name )
	{
		const resItem = this._resources.get( name );
		if( resItem && resItem.resource )
			return resItem.resource;
		else
			return undefined;
	}
	
	// Zwraca ilość referencji do tego zasobu (ilość obiektów które zablokowały ten zasób)
	getRefCount( name ){
		let resM = this._resources.get( name );		
		return resM? resM.refCount: 0;
	}
	
	// Zmień nazwę tego zasobu w resMgr
	// Należy wywoływać gdy zmieniło się res.name
	// Jeśli istnieje już element o nazwie newName to zwraca false
	// Jeśli nie istnieje element o nazwie oldName to zwraca false
	// Jeśli wszystko ok to zwraca true
	resChangeName( oldName, newName )
	{
		const newNameExists = this._resources.get( newName );	
		if( newNameExists )
			return false; 
		
		const resM = this._resources.get( oldName );	
		if( !resM )
			return false; 	
		
		this._resources.delete( oldName );	
		this._resources.set( newName, resM );	
		
		return true; 		
	}
	
	// Ustawia callback wywoływany gdy refCount==0 
	// Jeśli ten callback jest == undefined to nie można nigdy wyładować takiego zasobu
	resOnDispose( name, onDispose )	// może być == undefined
	{
		let resM = this._resources.get( name );	
		if( resM )
			resM.onDispose = onDispose;
	}
	
	// Zwraca ilość zasobów
	size(){
		return this._resources.size; }
}
// ------------------------------------------------------------------------