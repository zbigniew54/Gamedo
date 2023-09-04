// ------------------------------------------------------------------------
// GRAPH
 
import  { CVertex2D, CEdge2D } 
from './maths.js';

import  { CBinaryHeap } 
from './binary_heap.js';
  
// ------------------------------------------------------------------------
export class CGraphNode
{
	pos;				// [CVertex2D] pozycja ref do vertexa
	
	edgesArr=[];		// Tablica [CGraphNode] które są połączone z tym węzłem
	 
	userData={}; 
		
// ------------------------------------------------------------------------
constructor(){ 
	this.pos = new CVertex2D(); 
}
// ------------------------------------------------------------------------
// deep copy
copy( n )
{
	this.pos.copy( n.pos );
	this.edgesArr = [...n.edgesArr];
	
	this.userData = Object.assign( {}, n.userData );
}
// ------------------------------------------------------------------------
// Usuwa krawędź (także podwójną) z tego węzła i z sąsiedniego (jeśli tam istnieje)
removeEdge( e )	// indeks krawędzi
{
	const neighbor = this.edgesArr[e];
	
	// Znajdź w sąsiedzie krawęź zwrotną (jeśli istnieje)
	for( let ne=0, nem=neighbor.edgesArr.length; ne<nem; ne++ )
		if( neighbor.edgesArr[ne] === this ){
			neighbor.edgesArr.splice( ne, 1 );	// usuń ją
			break;
		}
		
	// Usuń wskazaną edge w tym node
	this.edgesArr.splice( e, 1 );
}
// ------------------------------------------------------------------------
// Usuń wszystkie krawędzie z tego node i krawędzie prowadzące do tego node od sąsiadów
removeAllEdges()
{
	while( this.edgesArr.length >0 )
		this.removeEdge( 0 );
}
// ------------------------------------------------------------------------
}


// ------------------------------------------------------------------------
export class CGraph
{
	nodesArr=[];			// Tablica [CGraphNode]
	  
// ------------------------------------------------------------------------
add( node )
{
	this.nodesArr.push( node );
	return node;
}
// ------------------------------------------------------------------------
createNode(){
	return this.add( new CGraphNode() );
}
// ------------------------------------------------------------------------
// Tworzy graf z podanych tablic krawędzi 
// UWAGA! Krawędzie jednego węzła grafu muszą wskazywać na ten sam obiekt CVertex2D, nie wystarczą obiekty o takich samych wartościach (różne verteksy w tym samym miejscu)
create( edgesArr )	// tablica CEdge2D
{
	const nodesMap = new Map();
	this.nodesArr=[];
	 
	for( let e of edgesArr )		// e= {v0,v1}, v={x,y}
	{
		// Vertex 0 -> Node 0
		let node0 = nodesMap.get( e.v0 );
		if( !node0 )
		{
			node0 = new CGraphNode();
			this.nodesArr.push(node0);
			nodesMap.set( e.v0, node0 );
			node0.pos.copy( e.v0 );
			
			if( "userData" in e.v0 )
				node0.userData = Object.assign( {}, e.v0.userData );
		}
		
		// Vertex 1 -> Node 1
		let node1 = nodesMap.get( e.v1 );
		if( !node1 )
		{
			node1 = new CGraphNode();
			this.nodesArr.push(node1);
			nodesMap.set( e.v1, node1 );
			node1.pos.copy( e.v1 );
			
			if( "userData" in e.v1 )
				node1.userData = Object.assign( {}, e.v1.userData );
		}
		
		// Dodaj krawędzie z węzłów 0->1 i 1->0
		node0.edgesArr.push( node1 );
		node1.edgesArr.push( node0 );
	}
}
// ------------------------------------------------------------------------
// Tworzy Minimum Spanning Tree algorytmem Primma
// Usuwa zbędne krawędzie, ale zostawia tyle aby można było dotrzeć do każdego węzła grafu. Preferuje te krawędzie, które mają mniejszy edge.weight = weightFunc(nodeA, nodeB)
// weightFunc - callback obliczający wagę krawędzi między dwoma węzłami:	weightFunc(nodeA, nodeB) -> zwraca [float]waga
primsMST( weightFunc, storeOldEdges=false )	// jeżeli true to zachowuje stare krawędzie dla każdego węzła w node.userData.oldEdgesArr
{ 
	if( this.nodesArr <= 1 )
		return;
	
	// Mapa węzłów, które już dodaliśmy do nowego grafu
	let addedNodesMap = new Map();		// node => node
	 
	// Krawędzie po których można iść dalej, posortowane wg edge.weight
	// Kilka krawędzi może prowadzić to tego samego węzła
	let openEdges = new CBinaryHeap( function( e ){ 
		return e.w; });
	// { n0; n1; w }
	  
	let curNode = this.nodesArr[0];
	
	// Oznacz, że dodaliśmy ten węzeł do nowego grafu
	addedNodesMap.set( curNode, curNode );
	 
	// Krawędzie tego węzła
	for( let neighborNode of curNode.edgesArr )
	{
		const newEdge = { 
			n0:	curNode, 		// zawsze należy do grafu
			n1:	neighborNode, 	// może nie należeć do grafu - to kierunek ruchu
			w:	weightFunc(curNode, neighborNode) 
		}; 
		
		// Dodaj krawędź do openEdges
		openEdges.push( newEdge );
	}
	
	// Zachowaj stare krawędzie
	if( storeOldEdges )
		curNode.userData.oldEdgesArr = curNode.edgesArr;
	
	// Usuń stare krawędzie z tego węzła
	curNode.edgesArr=[];
		  
	for( let i=0; i< this.nodesArr.length-1; i++ )
	{  
		// Pobierz krawędź o najmniejszym weight
		// Spośród wszystkich dostępnych krawędzi
		let curEdge;
		let nextNode;

		do{
			curEdge = openEdges.pop(); 
			
			// n0 zawsze należy do grafu, n1 to kierunek ruchu
			nextNode = curEdge.n1;
			
			// węzeł z którego idziemy do n1 (to nie zawsze bieżący węzeł) 	
			curNode = curEdge.n0;	
		}
		// Powtarzaj jeśli krawędź prowadzi do węzła będącego już w grafie
		while( addedNodesMap.get( nextNode ) );
		 
		// Oznacz, że dodaliśmy ten węzeł do nowego grafu
		addedNodesMap.set( nextNode, nextNode );
		 
		// Krawędzie nowego węzła dodaj do openEdges
		for( let neighborNode of nextNode.edgesArr )
		{
			const newEdge = { 
				n0:	nextNode, 		// n0: zawsze należy do grafu
				n1:	neighborNode, 	// n1: może nie należeć do grafu - to kierunek ruchu
				w:	weightFunc(nextNode, neighborNode) 
			}; 
			// Dodaj krawędź do openEdges
			openEdges.push( newEdge );
		}
		
		// Zachowaj stare krawędzie
		if( storeOldEdges )
			nextNode.userData.oldEdgesArr = nextNode.edgesArr;
		
		// Usuń stare krawędzie z tego węzła
		nextNode.edgesArr=[];
 
		// Dodaj wybraną krawędź do nowego grafu łacząc ze sobą właściwe węzły
		curNode.edgesArr.push( nextNode ); 	// poprzedni węzeł prowadzi do obecngo
		nextNode.edgesArr.push( curNode );	// następny prowadzi do poprzedniego 
	} 
}
// ------------------------------------------------------------------------
// Przywraca niektóre z node.userData.oldEdgesArr
// ratio - jaki procent krawędzi przywrócić
// weightFunc(nodeA,nodeB) - callback zwracający wagę dla przywracanej krawędzi. Krawędzie o najmniejszych wagach zostaną przywrócone.
restoreOldEdges( ratio, weightFunc )
{
	let redundantEdges = new CBinaryHeap( function( e ){ return e.w; }); // { n0; n1; w }
		
	for( let n of this.nodesArr )
	{ 
		const oldEdgesArr = n.userData.oldEdgesArr;
		 
		// oldEdgesArr zawiera tylko zbędne krawędzie
		for( let neigborNode of oldEdgesArr )
		{
			// Jeżeli ta krawędź jest w edgesArr tzn że tworzy MST -> nie można jej usunąć i nie trzeba przywracać
			if( n.edgesArr.includes( neigborNode ) )
				continue;

			let edgeExists=false;
			 
			// Sprawdź czy krawędź łącząca dwa takie węzły istnieje w kopcu
			for( let item of redundantEdges.items )
			{
				if( n == item.n0 && neigborNode == item.n1 ||
					n == item.n1 && neigborNode == item.n0 )
				{
					edgeExists=true;
					break;
				}
			} 
			
			if( !edgeExists )
				redundantEdges.push({
					n0: n,
					n1: neigborNode,
					w: weightFunc( n, neigborNode )
				});
		} 
	}
	 
	const numToRestore = Math.round( ratio * redundantEdges.size() ); 
	
	for( let i=0; i< numToRestore; i++ )
	{
		// Pobierz zbędną/nadmiarową krawędź i połącz ze sobą węzły grafu
		const edge = redundantEdges.pop();
		edge.n0.edgesArr.push( edge.n1 );
		edge.n1.edgesArr.push( edge.n0 );
	}
}
// ------------------------------------------------------------------------
// Tworzy i zwraca tablicę krawędzi {start:CGraphNode,end:CGraphNode} bez powtórzeń. Zakłada, że wszystkie krawędzie są dwustronne.
createEdgesArr()
{
	const edgesArr = [];
	const processedNodes = new Map();	// CGraphNode => true
	
	for( const node of this.nodesArr )
	{
		for( const neighbor of node.edgesArr )
		{
			// Jeśli tego node jeszcze nie przetwarzaliśmy
			if( !processedNodes.get( neighbor ) )
				edgesArr.push({ start:node, end:neighbor });
		}
		
		// Ignoruj krawędzie prowadzące do tego node (nie twórz duplikatów)
		processedNodes.set( node, true ); 
	}
	
	return edgesArr;
}
// ------------------------------------------------------------------------
}