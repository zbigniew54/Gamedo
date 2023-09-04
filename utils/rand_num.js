import { mulRand, mulberry32 } 
from '../utils/noise.js';

// ------------------------------------------------------------------------
// Interpolacja w zakresie [0:1]
export const RNI = {
	CONST:			1,			// min
	LINEAR:			2,			// x^1
	QUADRATIC_IN:	3,			// x^2
	QUADRATIC_OUT:	4,			// 1-(1-x)^2
	CUBIC_IN:		5,			// x^3
	CUBIC_OUT:		6,			// 1-(1-x)^3
	QUARTIC_IN:		7,			// x^4
	QUARTIC_OUT:	8,			// 1-(1-x)^4
	QUINTIC_IN:		9,			// x^5
	QUINTIC_OUT:	10			// 1-(1-x)^5
}; 
// ------------------------------------------------------------------------
// Generuje losową liczbę z podanego zakresu przy zastosowaniu wybranej interpolacji
export class CRandNum
{
	min;						// [float]
	max;						// [float]
	interpolation;				// interpolacja, rozkład
	 
	// Konstruktor
	constructor(nmin,nmax=undefined,lerp=undefined)
	{
		this.min=nmin;
		if( nmax === undefined )
			this.max=nmin;
		else
			this.max=nmax;
		if( lerp === undefined )
			this.interpolation = RNI.CONST;
		else
			this.interpolation=lerp;
	}
	
	// Pobierz wartość pomiędzy [min, max] uwzględniając 'interpolation'
	getLerp( factor )	// [0:1]
	{ 
		if( this.interpolation == RNI.CONST )
			return this.min; 
		
		const x = factor;
		
		const omx = 1.0-x;
		let y=0;
		switch( this.interpolation )
		{
			case RNI.LINEAR:  		y=x;			break;
			
			case RNI.QUADRATIC_OUT:	y=1-omx*omx;	break;	// 1-(1-x)^2
			case RNI.QUADRATIC_IN:	y=x*x;			break;
			
			case RNI.CUBIC_OUT:		y=1-Math.pow(omx,3);	break;	// 1-(1-x)^3
			case RNI.CUBIC_IN:		y=Math.pow(x,4);		break;
			
			case RNI.QUARTIC_OUT:	y=1-Math.pow(omx,4);	break;	// 1-(1-x)^4
			case RNI.QUARTIC_IN:	y=Math.pow(x,4);		break;
			
			case RNI.QUINTIC_OUT:	y=1-Math.pow(omx,5);	break;	// 1-(1-x)^5
			case RNI.QUINTIC_IN:	y=Math.pow(x,5);		break;
			default:
				throw Error("Unknown interpolation mode");
			
		}
		// console.log("y=["+y+"]");
			
		return this.min + y * (this.max-this.min); 
	}
	
	// Zwraca losową liczbę z zakresu [min, max) uwzględniając interpolację
	getRand( seed=undefined )	// opcjonalny seed
	{
		const x = (seed===undefined)? 
			mulRand():
			mulberry32( seed )();
		
		return this.getLerp( x );
	}
	
	// Zapisuje ustawienia do obiektu, który można zapisać w formacie JSON
	exportJSON(obj)
	{
		obj.min = this.min;
		obj.max = this.max;
		obj.lerp_int = this.interpolation;
	} 
	// Importuje ustawienia z obiektu odczytanego z JSON
	importJSON(obj)
	{
		if( !obj ) return;
		if( "min" in obj )
			this.min = parseFloat( obj.min );
		if( "max" in obj )
			this.max = parseFloat( obj.max );
		if( "lerp_int" in obj )
			this.interpolation = parseInt( obj.lerp_int, 10 ); 
	}
	
	clone(){
		const rn = new CRandNum();
		rn.copy(this);
		return rn;
	}
	copy(rnB){
		this.min=rnB.min;
		this.max=rnB.max;
		this.interpolation=rnB.interpolation;
	}
}
// ------------------------------------------------------------------------