// ------------------------------------------------------------------------
// TRIANGULATION - generowanie siatki trójkątów dla podanego zbioru punktów

import  { CVertex2D, CEdge2D, CTriangle2D } 
from './maths.js';
  
// ------------------------------------------------------------------------
// Triangulacja w przestrzeni 2D - wykorzystuje algorytm Bowyer–Watson 
// https://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm

export class CTriangulation2D
{ 
	triArr = [];		// [CTriangle2D] wynikowe trójkąty
	edgesArr = [];		// [CEdge2D] wynikowe krawędzie trójkątów (bez powtórzeń)
	vertArr = [];		// [CVertex2D] wierzchołki użyte do triangulacji
	
// ------------------------------------------------------------------------
clear()
{
	this.triArr = [];
	this.edgesArr = [];
	this.vertArr = [];
}
// ------------------------------------------------------------------------
// Utwórz trójkąt obejmujący wszystkie wierzchołki
// Zwraca nowy obiekt CTriangle2D
static superTriangle( vertsArr )		// tablica CVertex2D
{
	let minx = Infinity; 
	let miny = Infinity;
	let maxx = -Infinity; 
	let maxy = -Infinity;
		
	// vertsArr.forEach( function(v) );
	for( let v of vertsArr )
	{
		minx = Math.min(minx, v.x);
		miny = Math.min(minx, v.y);
		maxx = Math.max(maxx, v.x);
		maxy = Math.max(maxx, v.y);
	}

	const dx = (maxx - minx) * 10;
	const dy = (maxy - miny) * 10;

	const v0 = new CVertex2D(minx - dx, miny - dy * 3);
	const v1 = new CVertex2D(minx - dx, maxy + dy);
	const v2 = new CVertex2D(maxx + dx * 3, maxy + dy);

	return new CTriangle2D(v0, v1, v2);	
}
// ------------------------------------------------------------------------
// Dodaj wierzchołek do zbioru i przebuduj zbiór trójkątów
addVert( v ) 
{
	// console.log("addVert");
	// console.log(v);
	
	let edgesArr = [];

	// Usuń trójkąty z okręgiem opisującym, który zawiera ten vertex
	this.triArr = this.triArr.filter( function(tri) 
	{
		// console.log("tri.inCircumcircle(v)"); 
		// console.log( tri ); 
	
		// Jeśli vert jest w okręgu opisującego trójkąt
		if( tri.inCircumcircle(v) ) 
		{
			// console.warn("v in tri!");
			// console.log( v ); 
			
			// Usuń trojkąt, ale zachowaj jego krawędzie
			edgesArr.push(new CEdge2D(tri.v0, tri.v1));
			edgesArr.push(new CEdge2D(tri.v1, tri.v2));
			edgesArr.push(new CEdge2D(tri.v2, tri.v0));
			return false;
		}
		return true;
	});

	// Unikalne krawędzie -> oblicz polygon powstały po usunięciu trójkątów
	edgesArr = CTriangulation2D.uniqueEdges( edgesArr );

	// Utwóz triangle-fan
	// Podziel polygon na trójkąty (między krawędziami poly a nowy vertexem)
	// const triArr = this.triArr;
	// edgesArr.forEach( function(edge) {
		// triArr.push( new CTriangle2D(edge.v0, edge.v1, v) );
	// }); 
	
	for( let edge of edgesArr )
		this.triArr.push( new CTriangle2D(edge.v0, edge.v1, v) );
	
}
// ------------------------------------------------------------------------
// Usuń duplikaty krawędzi z podanego zbioru
// Zwraca tablicę CEdge2D, nowy zbiór bez duplikatów
static uniqueEdges( edgesArr ) 	// arr of CEdge2D
{
	let uniqEdgesArr = [];
	
	// Dla każdej krawędzi
	for( let i=0; i<edgesArr.length; ++i) 
	{
		let isUnique = true;

		// Sprawdź ją z pozostałymi (z wyjątkiem samej siebie)
		for( let j=0; j<edgesArr.length; ++j) 
		{
			// Jeżeli to nie ta sama krawędź, ale ma takie same vert
			if( i != j && edgesArr[i].equals( edgesArr[j] ) ) 		// 
			{
				isUnique = false;
				break;
			}
		}

		// Edge is unique, add to unique edges array
		if( isUnique )
			uniqEdgesArr.push( edgesArr[i] );
	}

	return uniqEdgesArr;
}
// ------------------------------------------------------------------------
// Tworzy siatkę trójkątów dla podanego zbioru wierzchołków w 2D
// UWAGA! Pracuje w przestrzeni XY
// Wynik zwraca do tablicy this.triArr oraz 
// jeśli calcEdges==true to zapisuje krawędzie (bez powtórzeń) tych trójkątów do this.edgesArr
triangulate( 
	vertsArr, 					 // tablica CVertex2D
	calcEdges=false ) 
{
	// console.log("triangulate"); 
	
	this.edgesArr = [];
	this.vertArr = vertsArr;
	
	// Inicjalizuj tablicę trójkątów jestdnym obejmujących wszystkie verteksy
	const st = CTriangulation2D.superTriangle( vertsArr );
	this.triArr = [ st ];
	
	// console.log("superTriangle"); 
	// console.log(st); 
	 
	// Dodaj każdy wierzchołek do tiangulacji (jeden po drugim) i przebuduj za każdym razem zbiór trójkątów
	for( let v of vertsArr )
		this.addVert( v );
	
	// console.log("result triArr"); 
	// console.log( this.triArr ); 
	
	if( calcEdges )
	{
		// Dla każdego trójkąta
		for( let tri of this.triArr )
		{
			// ignoruj wierzchołki należące do super trójkąta
			const remVert0 = tri.v0.equals( st.v0 ) || tri.v0.equals( st.v1 ) || tri.v0.equals( st.v2 );
			const remVert1 = tri.v1.equals( st.v0 ) || tri.v1.equals( st.v1 ) || tri.v1.equals( st.v2 );
			const remVert2 = tri.v2.equals( st.v0 ) || tri.v2.equals( st.v1 ) || tri.v2.equals( st.v2 );
			
			// Jeśli krawędź jeszcze nie istnieje w zbiorze to ją dodaj
			if( !remVert0 && !remVert1 )
			{
				const e0 = new CEdge2D(tri.v0, tri.v1);
				if( !this.edgeExists( e0 ) )
					this.edgesArr.push( e0 );
			}
			
			if( !remVert1 && !remVert2 )
			{
				const e1 = new CEdge2D(tri.v1, tri.v2);
				if( !this.edgeExists( e1 ) )
					this.edgesArr.push( e1 );
			}
			
			if( !remVert2 && !remVert0 )
			{
				const e2 = new CEdge2D(tri.v2, tri.v0);
				if( !this.edgeExists( e2 ) )
					this.edgesArr.push( e2 );
			}
		}
		// console.log("result edgesArr"); 
		// console.log( this.edgesArr ); 
	}
	
	// Usuń trójkąty współdzielące krawędzie z super trójkątem
	this.triArr = this.triArr.filter( function(tri) 
	{
		return !(tri.v0.equals( st.v0 ) || tri.v0.equals( st.v1 ) || tri.v0.equals( st.v2 ) ||
		  tri.v1.equals( st.v0 ) || tri.v1.equals( st.v1 ) || tri.v1.equals( st.v2 ) ||
		  tri.v2.equals( st.v0 ) || tri.v2.equals( st.v1 ) || tri.v2.equals( st.v2 ) );	  
	});
	
	// console.log("result triArr"); 
	// console.log( this.triArr ); 
}
// ------------------------------------------------------------------------
// Sprawdza czy taka krawędź już istnieje w zbiorze (edgesArr)
// Zwraca tru jeśli już istnieje
edgeExists( edgeA )
{
	// Dla każdej już istniejącej krawędzi
	for( let edgeB of this.edgesArr )
	{
		if( edgeA.equals( edgeB ) )
			return true;
	}
	
	return false;
}
// ------------------------------------------------------------------------
}