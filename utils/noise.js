// ------------------------------------------------------------------------
import { lerp, smoothStep, sinStep, hash, randPointInCircle } 
from '../utils/utils.js';

// ------------------------------------------------------------------------
// Mulberry32, a fast high quality PRNG: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
export function mulberry32(a) 
{
	return function() 
	{
		let t = a += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
}
// ------------------------------------------------------------------------
// Generuje losową liczbę float [0;1)
let mbr = mulberry32( hash(7) );
export function mulRand(){ return mbr(); }

// ------------------------------------------------------------------------
let seed = hash(7);
export function setSeed( s )
{
	seed = hash(s);
	mbr = mulberry32( seed );
} 
// ------------------------------------------------------------------------
// Generuje deterministyczną (zależną od podanych parametrów, przewidywalną) pseudo-losową liczbę. Dla podanych wartości x,y wynik jest zawsze taki sam
// Funkcja ciągła
// Zwraca float z zakresu [0;1)
export function random1d(x)	// float
{  
	const m = mulberry32( x + seed ); 
	return m(); 
}
// ------------------------------------------------------------------------
// Generuje deterministyczną (zależną od podanych parametrów, przewidywalną) pseudo-losową liczbę. Dla podanych wartości x,y wynik jest zawsze taki sam
// Funkcja ciągła
// Zwraca float z zakresu [0;1)
export function random2d(x,y)	// float
{  
	const m = mulberry32( x*1.9873 + y*941778.231 + seed ); 
	return m(); 
}
// ------------------------------------------------------------------------
export function noise1d( x, easeFunc=smoothStep )
{
	const fx=Math.floor(x);
	const cx=Math.ceil(x); 
	 
	return easeFunc( random1d( fx ), random1d( cx ), x-fx ); 
}
// ------------------------------------------------------------------------
export function noise2d( x, y, easeFunc=smoothStep )
{
	const fx=Math.floor(x);
	const cx=Math.ceil(x);
	const fy=Math.floor(y);
	const cy=Math.ceil(y);
	
	const TL = random2d( fx, cy );
	const TR = random2d( cx, cy );
	const BL = random2d( fx, fy );
	const BR = random2d( cx, fy );
	
	const tx = x-fx; 
	const T = easeFunc( TL, TR, tx );
	const B = easeFunc( BL, BR, tx );
	
	return easeFunc( B, T, y-fy );
}
// ------------------------------------------------------------------------
// Generuje fraktalny (warstwowy, samopowtarzalny) szum dla koordynatów 2d
// Dopasowuje ilość iteracji w zależności od wielkości generowanego obrazu (imgSize)
// Zaczyna samplowanie co imgSize pikseli, aż dojdzie do samplowania do piksel

// [imgSize][int] (1:n) Rozmiar tworzonego obrazu. Najlepiej jeśli jest pow2
// Zacznij od samplowania co 'imgSize' pikseli - czyli pierwszy i ostatni piksel
// Pierwsza iteracja da bardzo rozmyty obraz o dużej wadze (amplitude), a każdy kolejny będzie bardziej szczegółowy ale o coraz mniejszej wadze amplidute*persistance
// Aby uzyskać efekt przybliżenia generowanego szumu 2d można jako imgSize podać mniejszą wartość niż rzeczywiste wymiary obrazu (wysokość/szerokość)
// Ten efekt "przybliżenia" powoduje większe zagęszczenie tworzonych wzorów (większy chaos)

// [persistance] (0:n) Mnożnik amplitudy każdej kolejnej iteracji. Wartości od 0.5 do 1.0 są najciekawsze. Wartości powyżej 1.0 degenerują obraz do zwykłego szumu.
// persistance = bliskie 0.0 -> brak szumu (więcej niż 1 iteracja nie ma sensu)
// persistance = 0.5 ->? brownian noise (każda kolejna iteracja ma połowę mniejszą amplitudę). Średni szum
// persistance = 1.0 ->? white noise (każda kolejna iteracja ma taką samą amplitudę). Spory szum.

// Zwraca wartość float [0;1)
export function fractalNoise( 
	x, y, 				// float [0:imgSize] Koordynaty dla których samplowany jest 2d szum
	imgSize,			// [int] (1:n) Rozmiar tworzonego obrazu. Najlepiej jeśli jest pow2
	persistance=0.5,  	// [float] (0:n) Mnożnik amplitudy każdej kolejnej iteracji
)
{
	// Ile razy większa ma być częstotliwość w każdej kolejnej iteracji
	// Najsensowniejsza wartość dla obrazów to 2. 
	// Dzięki temu co iterację zwiększamy rozdzielczość dwukrotnie
	const freqChange = 2.0;		
	 
	// Zacznij od samplowania co 'imgSize' pikseli - czyli pierwszy i ostatni piksel
	// Pierwsza iteracja da bardzo rozmyty obraz o dużej wadze (amplitude) a każdy kolejny będzie bardziej szczegółowy ale o coraz mniejszej wadze amplidute*persistance
	let frequency = (imgSize>1)? 1/imgSize: 1.0;
	 
	let value = 0.0;
	let amplitude = 1.0;
	  
	let max=0;	// maksymalna możliwa do uzyskania wartość
	
	// for( let i=0; i<iterations; i++ )
	while( frequency <= 1.0 )	// Nie sampluj gęściej niż co piksel
	{
		max += amplitude;
		value += amplitude * noise2d( frequency*x, frequency*y, smoothStep );
		frequency *= freqChange;
		amplitude *= persistance;
	}  
	
	return value / max;	// normalizuj wynik aby był w zakresie [0;1)
} 
// ------------------------------------------------------------------------
// Zwraca wartość float [0;1)
export function fractalNoise1d( 
	x,  				// Koordynaty dla których samplowany jest 1d szum
	imgSize,			// [int] (1:n) Rozmiar tworzonego obrazu (zakłada, że wartości x są w zakresie od 0 do imgSize-1)
	persistance=0.5,  	// [float] (0:n) Mnożnik amplitudy każdej kolejnej iteracji
)
{
	// Ile razy większa ma być częstotliwość w każdej kolejnej iteracji
	// Najsensowniejsza wartość dla obrazów to 2. 
	// Dzięki temu co iterację zwiększamy rozdzielczość dwukrotnie
	const freqChange = 2.0;		
	 
	// Zacznij od samplowania co 'imgSize' pikseli - czyli pierwszy i ostatni piksel
	// Pierwsza iteracja da bardzo rozmyty obraz o dużej wadze (amplitude) a każdy kolejny będzie bardziej szczegółowy ale o coraz mniejszej wadze amplidute*persistance
	let frequency = (imgSize>1)? 1/imgSize: 1.0;
	 
	let value = 0.0;
	let amplitude = 1.0;
	  
	let max=0;	// maksymalna możliwa do uzyskania wartość
	
	// for( let i=0; i<iterations; i++ )
	while( frequency <= 1.0 )	// Nie sampluj gęściej niż co piksel
	{
		max += amplitude;
		value += amplitude * noise1d( frequency*x, smoothStep );
		frequency *= freqChange;
		amplitude *= persistance;
	}  
	
	return value / max;	// normalizuj wynik aby był w zakresie [0;1)
} 
// ------------------------------------------------------------------------



// ------------------------------------------------------------------------
export class CCellularPattern
{
	cellsArr=[]			// array of {x,y,val} 
	_stepSize; 
	
// ------------------------------------------------------------------------
// Generuje nowy zestaw losowych komórek
generateCells( 
	numCells,			// [int] ilość komórek wzdłuż jednego wymiaru (wysz i szer)
	chaosFactor )		// [0:1] 0 brak chaosu, komóki regularnie ułożone, 1 - poprzesuwane nawet o początkową odległość między nimi
{ 
	const sumCells=numCells*numCells;
	this._stepSize = 1.0 / numCells 
	
	const offsetRadius = Math.min(1,Math.max( 0, chaosFactor )) * this._stepSize
	
	this.cellsArr.length=0
	 
	for( let y=0; y < numCells; y++ )
		for( let x=0; x < numCells; x++ ) 
		{
			const offset = randPointInCircle( offsetRadius )
			
			const newCell = { 
				x:(x+0.5)*this._stepSize+offset.x, 
				y:(y+0.5)*this._stepSize+offset.y,
				val: Math.round(mulRand()*sumCells)/sumCells } 
				
			this.cellsArr.push( newCell )
		}
}
// ------------------------------------------------------------------------
// Oblicz najmniejszą możliwą odległość do komórki
cellGetDist( cell, x, y )
{
	const ox = cell.x-x;
	const oy = cell.y-y;
	return Math.sqrt(ox*ox + oy*oy); 	
}
// ------------------------------------------------------------------------
// Pobiera najbliższą komórkę dla podanych koordynatów
// Zawija komórki na krawędzi - tworząc seamless pattern
// Zwraca {x,y,val,dist}
getClosestCell(x,y)		//[0:1]
{
	let closestCell;	// {x,y,val}
	let closestDist;
	
	for( let cell of this.cellsArr )
	{ 
		let newDist = this.cellGetDist( cell, x, y )
		
		if( x < 0.5 )
		{
			newDist = Math.min( newDist, this.cellGetDist( cell, x+1, y ))
		
			if( y < 0.5 )
				newDist = Math.min( newDist, this.cellGetDist( cell, x+1, y+1 ))
			else
				newDist = Math.min( newDist, this.cellGetDist( cell, x+1, y-1 ))
		}
		else
		{
			newDist = Math.min( newDist, this.cellGetDist( cell, x-1, y ))
		
			if( y < 0.5 )
				newDist = Math.min( newDist, this.cellGetDist( cell, x-1, y+1 ))
			else
				newDist = Math.min( newDist, this.cellGetDist( cell, x-1, y-1 ))
		}
		
		if( y < 0.5 )
			newDist = Math.min( newDist, this.cellGetDist( cell, x, y+1 ))
		else
			newDist = Math.min( newDist, this.cellGetDist( cell, x, y-1 ))
		 
		
		if( closestDist === undefined || newDist < closestDist ){
			closestDist = newDist;
			closestCell = cell;
		}
	}
	
	closestCell.dist = closestDist
	
	return closestCell;
}
// ------------------------------------------------------------------------
// Dla podanych koordynatów znajduje najbliższą komórkę i zwraca jej losową wartość [0:1] 
getCellVal(x,y)		//[0:1]
{
	return this.getClosestCell(x,y).val;
}
// ------------------------------------------------------------------------
// Pobiera odległość do najbliższej komórki
// Zwraca [0:1] gdzie 0 oznacza na środku komórki, a 1 oznacza że odległość jest większa od początkowej odległości między komórkami this._stepSize
getMinDist(x,y)		//[0:1]
{
	const closestDist = this.getClosestCell(x,y).dist;
	return Math.min(1.0,closestDist/this._stepSize);
}
// ------------------------------------------------------------------------
}


// ------------------------------------------------------------------------
// Zwraca wektor normalnej {x,y,z} [-1:1] gdzie z oznacza wysokość
export function heightToNormal( 
	x, y, 				// Koordynaty dla których samplowany jest obraz
	imgSize,			// [int] (1:n) Rozmiar samplowaneg obrazu 
	scale,
	samplerFunc )		// funkcja zwracająca wysokość [0:1] dla podanych koordynatów: height = samplerFunc(x,y)
{
	const offset = 1.0/imgSize;
	
	const T = samplerFunc( x, y+offset );
	const B = samplerFunc( x, y-offset );
	const R = samplerFunc( x+offset, y );
	const L = samplerFunc( x-offset, y );
	
	const BL = samplerFunc( x-offset, y-offset );
	const TL = samplerFunc( x-offset, y+offset );
	const TR = samplerFunc( x+offset, y+offset );
	const BR = samplerFunc( x+offset, y-offset );
	 
	const n = {x:0,y:0,z:0};
	n.x = scale * -(BR-BL+2*(R-L)+TR-TL);
	n.y = scale * -(TL-BL+2*(T-B)+TR-BR);
	n.z = 1.0;
	
	const len = Math.sqrt( n.x*n.x + n.y*n.y + n.z*n.z );
	n.x /= len;
	n.y /= len;
	n.z /= len;
	return n;
}	