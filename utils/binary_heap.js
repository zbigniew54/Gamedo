// ------------------------------------------------------------------------
// BINARY HEAP - kopiec

import * as THREE 		
from '../three/build/three.module.js';
   
// ------------------------------------------------------------------------
// Kopiec umieszcza elementy w takiej kolejności, że na początku jest zawsze ten najmniejszy (wg funkcji oceniającej _scoreFunction)
export class CBinaryHeap  
{
	_content;
	_scoreFunction;
	
// ------------------------------------------------------------------------
constructor( scoreFunction )	// callback który powinien zwracać wartość elemetu = scoreFunction( element ). Element o najmniejszej wartości będzie na poczatku kopca
{ 
	this._content = [];
	this._scoreFunction = scoreFunction;
}
// ------------------------------------------------------------------------
// UWAGA! Zmiana wartości mających wpływ na scoreFunction(element) nie przebuduje kopca
get items(){
	return this._content;
}
// ------------------------------------------------------------------------
// Dodaj element do kopca i umieść go w odpowiednim miejscu
push( elem )
{
	// Add the new element to the end of the array.
	this._content.push( elem );
	
	// Allow it to bubble up.
	this.bubbleUp(this._content.length - 1);
}
// ------------------------------------------------------------------------
// Zwróć pierwszy element (o najmniejszej ocenie)
pop() 
{
	// Store the first element so we can return it later.
	const result = this._content[0];
	
	// Get the element at the end of the array.
	const end = this._content.pop();
	
	// If there are any elements left, put the end element at the
	// start, and let it sink down.
	if( this._content.length > 0 ){
		this._content[0] = end;
		this.sinkDown(0);
	}
	return result;
 }
// ------------------------------------------------------------------------
// Usuń element
remove( elem )
{
	const length = this._content.length;
	
	// To remove a value, we must search through the array to find
	// it.
	for( let i = 0; i < length; i++)
	{
		if( this._content[i] != elem ) continue;
		
		// When it is found, the process seen in 'pop' is repeated
		// to fill up the hole.
		const end = this._content.pop();
		
		// If the element we popped was the one we needed to remove,
		// we're done.
		if( i == length - 1 ) break;
		
		// Otherwise, we replace the removed element with the popped
		// one, and allow it to float up or sink down as appropriate.
		this._content[i] = end;
		this.bubbleUp(i);
		this.sinkDown(i);
		
		break;
	}
}
// ------------------------------------------------------------------------
removeAll(){
	this._content = [];
}
// ------------------------------------------------------------------------
size(){
	return this._content.length;
}
// ------------------------------------------------------------------------
// Uporządkuj przenosząc element w górę kopca
bubbleUp( n ) // index od którego rozpocząć
{
    // Fetch the element that has to be moved.
    const elem = this._content[n];
	const score = this._scoreFunction( elem );
	
    // When at 0, an element can not go up any further.
    while( n > 0 )
	{
		// Compute the parent element's index, and fetch it.
		// const parentN = Math.floor((n + 1) / 2) - 1;
		const parentN = ((n + 1) >> 1) - 1;
		
		const parentElem = this._content[ parentN ];
		
		// If the parent has a lesser score, things are in order and we
		// are done.
		if( score >= this._scoreFunction( parentElem ) )
			break;

		// Otherwise, swap the parent with the current element and
		// continue.
		this._content[parentN] = elem;
		this._content[n] = parentElem;
		n = parentN;
    }
}
// ------------------------------------------------------------------------
// Uporządkuj przenosząc element w dół kopca
sinkDown(n)  // index od którego rozpocząć
{
	// Look up the target element and its score.
	const length = this._content.length;
	const elem = this._content[n];
	const elemScore = this._scoreFunction( elem );

	while(true) 
	{
		// Compute the indices of the child elements.
		const child2N = (n + 1) << 1;
		const child1N = child2N - 1;
		
		// This is used to store the new position of the element,
		// if any.
		let swap = null;
		let child1Score=0;
		
		// If the first child exists (is inside the array)...
		if( child1N < length ) 
		{
			// Look it up and compute its score.
			const child1 = this._content[child1N];
			child1Score = this._scoreFunction(child1);
			
			// If the score is less than our element's, we need to swap.
			if( child1Score < elemScore )
				swap = child1N;
		}
		
		// Do the same checks for the other child.
		if( child2N < length ) 
		{
			const child2 = this._content[child2N];
			const child2Score = this._scoreFunction(child2);
			
			if( child2Score < (swap == null ? elemScore : child1Score) )
				swap = child2N;
		}

		// No need to swap further, we are done.
		if( swap == null ) 
			break;
		else
		{
			// Otherwise, swap and continue.
			this._content[n] = this._content[swap];
			this._content[swap] = elem;
			n = swap;
		}
	}
}
// ------------------------------------------------------------------------
};