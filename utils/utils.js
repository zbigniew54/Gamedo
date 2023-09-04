import { mulRand } 
from '../utils/noise.js';
 
// ------------------------------------------------------------------------
// UTILS - funkcje różne, przydatne też w innych aplikacjach JS
 
// ------------------------------------------------------------------------
// Better 32-bit integer hash function: https://burtleburtle.net/bob/hash/integer.html
export function hash(n)
{
	n=61^n^n>>>16;
	n+=n<<3;
	n=Math.imul(n,668265261);
	return (n^=n>>>15)>>>0;
}

// ------------------------------------------------------------------------
// Tworzy losową permutację dla podanej tablicy. Zmienia kolejność elementów w podanej tablicy
// Fisher-Yates (aka Knuth) Shuffle
export function shuffle( array ) 
{
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle...
	while( currentIndex != 0 ) 
	{ 
		// Pick a remaining element...
		randomIndex = Math.floor( mulRand() * currentIndex );
		currentIndex--;

		// And swap it with the current element.
		[ array[currentIndex], array[randomIndex] ] = [
		  array[randomIndex], array[currentIndex] ];
	}

	return array;
} 
// ------------------------------------------------------------------------
// Przydatne w array.sort()
// Dla liczb lepiej użyć return a-b;
// Oba podowują sortowanie od małych do dużych (rosnąco)
export function compare(a,b)
{
	if( a>b )	return  1; else
	if( a<b )	return -1; else
				return 0;	
}
// ------------------------------------------------------------------------
export function roundPrec( num, prec )	// prec - ile cyfr po przecinku
{
	const c = Math.pow( 10, prec );
	return Math.round(num * c)/c;
}
// ------------------------------------------------------------------------
// Czy a jest równe (w przybliżeniu) b. Granicę przybliżenia +/- określa precision
export function fuzzyEqual( a, b, precision = 0.0001 )
{
	// return ( a >= b-precision || a <= b+precision );
	
	return (Math.abs(a-b) <= precision);
}
// ------------------------------------------------------------------------
// Przycina do podanych wartości
export function clampTo( num, mi, ma ){
    return Math.min(ma, Math.max(num, mi));
}
// ------------------------------------------------------------------------
// Przycina do [0;1]
export function clamp01( num ){
    return clampTo(num,0.0,1.0);
}
// ------------------------------------------------------------------------
// Formatuje liczbę w zależności od lokalnych ustawień
export function numFormat( num ){ 
	return  new Intl.NumberFormat().format( num );
}
// ------------------------------------------------------------------------
// Zwraca liczbę zaokrągloną
export function numToStr( number, precision=1 ) 
{
	if(number >= (1000**3)) {
		return (number/(1000**3)).toFixed(precision) + ' G'; }
	else if(number >= (1000**2)) {
		return (number/(1000**2)).toFixed(precision) + ' M'; }
	else if(number >= 1000 ) {
		return (number/1000).toFixed(precision) + ' k'; } 
	else {
		return numFormat(number); }
}
// ------------------------------------------------------------------------
// Zwraca rozmiar pliku w B, kB lub MB
export function fileSizeToStr( number, precision=1 ) 
{
	if(number >= (1024*1024*1024)) {
		return (number/(1024*1024*1024)).toFixed(precision) + ' GB'; }
	else if(number >= (1024*1024)) {
		return (number/(1024*1024)).toFixed(precision) + ' MB'; }
	else if(number >= 1024 ) {
		return (number/1024).toFixed(0) + ' kB'; } 
	else {
		return numFormat(number) + ' bytes'; }
} 
// ------------------------------------------------------------------------
// Robi deep copy stringu
  
export function strCopy( str ){
    return (' ' + str).slice(1);
}
// ------------------------------------------------------------------------
// Capitalize string
  
export function strCapitalize( str )
{
	const newStr = strCopy( str ).toLowerCase();
	return newStr[0].toUpperCase() + newStr.substring(1);
}
// ------------------------------------------------------------------------
// Liczy ile dany znak <character> występuje w podanym stringu <str>
export function strCountChr( str, character )
{ 
	let count=0;
    for(let i=0; i<str.length; count+=+(character===str[i++]));
	return count;
}
// ------------------------------------------------------------------------
// Liczy ile dany string <strB> występuje w podanym stringu <str>
export function strCountStr( str, strB )
{ 
	let count=-1;
    for(let index=-2; index != -1; count++,index=str.indexOf(strB,index+1) );
	return count;
}
// ------------------------------------------------------------------------
// usuwa tagi html ze stringu 
export function stripTags( str ){
	return str.replace( /(<([^>]+)>)/ig, '' );
}  
// ------------------------------------------------------------------------
// Zwraca samą nazwę pliku (z rozszerzeniem) z podanej ścieżki
  
export function getFileName( path ){
    return ''+path.replace(/^.*(\\|\/|\:)/, '');
}
// ------------------------------------------------------------------------
// Zwraca samą nazwę pliku (z rozszerzeniem) z podanej ścieżki
  
export function getFileNameOnly( path ){
    return trimFileExt( getFileName( path ) );
}
// ------------------------------------------------------------------------
// Zwraca samą nazwę ścieżkę do folderu w którym jest plik
  
export function getDirName( path ){
    const matchArr = path.match(/^.*(\\|\/|\:)/ );
	
	return matchArr? ''+matchArr[0]: '';
}
// ------------------------------------------------------------------------
// Usuwa rozszerzenie z podanej ścieżki. Zostawia tylko nazwę pliku i poprzedzającą ją path
  
export function trimFileExt( path ){
	return ''+path.replace(/\.[^\.]+$/, '');
}
// ------------------------------------------------------------------------
// Zwraca rozszerzenie pliku z podanej ścieżki (zawsze lower case)
  
export function getFileExt( path ){
	// regex = new RegExp('[^.]+$');
	const matchArr = path.match(/[^.]+$/);
	return matchArr? ''+matchArr[0].toLowerCase(): '';
}
// ------------------------------------------------------------------------
// Usuwa wszystko co następuje po url (kwerendy ?param=1 &param=2, porty itp)
export function urlOnly( path ){
	const matchArr = path.match(/(http:|https:|.:)?[^\?|\&|$\:]*/); 
	return matchArr? ''+matchArr[0]: '';
}
// ------------------------------------------------------------------------
// Zwraca absolutną ścieżkę podstawową (folder aktualnego pliku html/php)
// np.: https://gamedo.com/app/editor/
export function basePath(){
	return getDirName( window.location.href );
}
// ------------------------------------------------------------------------
// Zamienia path zawierający .. i . na path odpowiadający tej samej lokalizacji bez .. i .
// Może wymagać addSlash() jeśli path nie zawiera nazwy pliku
export function resolvePath( path )
{
	const dirsArr = path.split('/');
	
	let newPathArr = [];
	
	for( let dir of dirsArr )
	{
		if( dir == '.' || dir == '' )
			continue;
		else
		if( dir == '..' )
			newPathArr.pop();
		else
		{
			if( dir == 'http:' || dir == 'https:' )
				dir = dir + '/';
			
			newPathArr.push( dir );
		}
	}

	return newPathArr.join('/');
} 
// ------------------------------------------------------------------------

export const MAX_NAME_LEN=64;
// const NAME_REG_EXP = /\A[a-zA-Z0-9_\-,]+\z/;
export const NAME_DISALOW_CHARS = /[^a-zA-Z0-9_ \-,]/;

export const NAME_FMT_DESCR = "Name can only contain letters, digits, spaces and '-' ',' '_'. It can`t start from '_'. It must have 1-64 characters."

// ------------------------------------------------------------------------
// Sprawdza czy string jest prawidłową nazwą i zwraca true/false

// Nazwa może zawierać tylko małe litery, duże litery, cyfry, myślnik '-', przecinek ',', może zawierać podkreślnik '_', ale nie może się od niego zaczynać. Nie może zwierać polskich znaków. Musi mieć co najmniej jeden znak długości i nie więcej niż 64 znaków.

export function nameValidate( nameStr )	// string
{ 
	// Pusty lub za długi string
	if( nameStr.length == 0 || nameStr.length > MAX_NAME_LEN ||
	
		// Zaczyna się od podkreślnika (zastrzeżone dla helperów)
		nameStr.substring(0,1) == "_" ||
		
		// Zawiera niedoszwolone znaki
		nameStr.match( NAME_DISALOW_CHARS )!=null
	)
		return false;
		
	else
		return true;
}
// ------------------------------------------------------------------------
// Usuwa niedozwolone znaki z nazwy. Zwraca prawidłową nazwę lub pusty string

export function nameSanitize( nameStr )	// string
{
	let newName = nameStr.replace( /[^a-zA-Z0-9_ \-,]/, '' ); 
	
	const maxLenIdx = Math.min(newName.length,MAX_NAME_LEN);
	
	if( newName.substring(0,1) == "_" )
		return ''+newName.substring(1,maxLenIdx-1);
	else
		return ''+newName.substring(0,maxLenIdx);
}
// ------------------------------------------------------------------------
// Liczy kosinus kąta między dwoma wektorami
// Ten kąt może być w zakresie [0:180] stopni
// cos(a) jest > 0 gdy a < 90 albo a=[0:90]
// cos(a) jest < 0 gdy a > 90 albo a=[90:180]
// cos(a) == 1 to a=0
// cos(a) == 0 to a=90
// cos(a) ==-1 to a=180
export function cosAngle( vecA, vecB )	// [THREE.Vector3]
{
	return vecA.dot( vecB ) / (vecA.length() * vecB.length())
}
// Dużo szybsza wersja dla znormalizowanych wektorów (długość==1.0)
export function cosAngleNormalized( vecA, vecB )	// [THREE.Vector3] normalized!
{
	return vecA.dot( vecB );
}
// ------------------------------------------------------------------------
// Konwertuje stopnie na radiany 
export function degToRad( degrees ) 
{ 
	return degrees / 180 * Math.PI;
}
// ------------------------------------------------------------------------
// Konwertuje radiany na stopnie 
export function radToDeg( radians ) 
{ 
	return radians / Math.PI * 180;
}
// ------------------------------------------------------------------------
// Konwertuj ArrayBuffer do stringu Base64
// np: data = arrayBufferToBase64( treeAttribute.array.buffer );
export function arrayBufferToBase64( buffer ) 
{
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
	
    for( var i = 0; i < len; i++ )
        binary += String.fromCharCode( bytes[ i ] );
	
    return window.btoa( binary );
}
// ------------------------------------------------------------------------
// Konwertuj string Base64 do ArrayBuffer
// np: const fa = new Float32Array( base64ToArrayBuffer( jsonAttrib.data ));
export function base64ToArrayBuffer( base64 ) 
{
    var binary_string = window.atob( base64 );
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
	
    for( var i = 0; i < len; i++ )
        bytes[i] = binary_string.charCodeAt(i);
	
    return bytes.buffer;
}  
const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );
// ------------------------------------------------------------------------
export function download( fileName, blob )
{
	link.href = URL.createObjectURL( blob );
	link.download = fileName;
	link.click();
}
// ------------------------------------------------------------------------
// Pobiera dane jako plik tekstowy
export function downloadText( fileName, textStr )
{
	download( fileName, new Blob( [ textStr ], { type: 'text/plain' } ) );
} 
// ------------------------------------------------------------------------
// Pobiera dane jako plik binarny
export function downloadBinary( fileName, bufferBin ) 
{
	download( fileName, new Blob( [ bufferBin ], { type: 'application/octet-stream' } ) );
}
// ------------------------------------------------------------------------
// Wykrywa URL w stringu i zamienia go na link
export function urlify(text) 
{
    var urlRegex = /\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/ig;
	
    return text.replace(urlRegex, function(url,b,c) 
	{
        var url2 = (c == 'www.') ?  'http://' +url : url;
        return '<a href="' +url2+ '" target="_blank">' + url + '</a>';
    }); 
}
// ------------------------------------------------------------------------
// Usuwa wszystkich potomków wskazanego elementu DOM
export function removeAllChildElems( dom )
{
	let child = dom.firstElementChild;
	while( child )
	{
		child.remove();
		child = dom.firstElementChild;
	}
}
// ------------------------------------------------------------------------
// Zwraca losowy element podanej tablicy.
// Losuje uwzględniając wagę zwracaną przez weightFunc( tabEl ). Waga musi być >= 0
// sumW to suma wag dla wszystkich elementów arr, jeśli nie zostanie podana to zostanie obliczona, co spowolni losowanie
// forceRandVal - to liczba z zakresu [0;1) którą należy użyć zamiast wynegerowanej przez mulRand()
// W przypadku gdy forceRandVal == 1.0 -> zwróci ostatni element
export function randWeight( arr, weightFunc, sumW=undefined, forceRandVal=undefined )
{ 
	if( sumW===undefined )
		sumW = sumWeight( arr, weightFunc );
	
	let chosenElem;
	
	// Wybierz losowo moduł uwzględniając wagi zawarte w userData.frequency
	const randVal = ((forceRandVal!==undefined)?forceRandVal: mulRand() )*sumW;
	
	let rs=0;
	for( let el of arr )
	{
		rs += weightFunc( el );
		chosenElem = el;	// dzięki temu zawsze jakiś element zostanie wylosowany nawet w razie błędu weightFunc
		
		// Jeśli wylosowana wartość jest w przedziale tego elementu
		if( randVal < rs )
			return chosenElem;
	}
	
	// Sprawdzaj te sytuacje tylkow przypadku niepowodzenia losowania
	// 1. Pusta arr
	if( arr.length == 0 ){
		console.error( "Empty arr!" );
		return undefined;
	}
	
	else 
		return arr[ arr.length-1 ];
}
// ------------------------------------------------------------------------
export function sumWeight( arr, weightFunc )
{
	let sum=0;
	for( let el of arr )
		sum += Math.max(0, weightFunc(el) );
	return sum;
}
// ------------------------------------------------------------------------
// Liniowa interpolacja
export function lerp( a, b, t )	// t=[0;1] 
{
	return a + (b-a)*t;
}
// ------------------------------------------------------------------------
// Wygładzona interpolacja
export function smoothStep( a, b, t )	// t=[0;1] 
{  
    return lerp(a, b, t * t * (3 - 2 * t) ); 
} 
// ------------------------------------------------------------------------
// Wygładzona interpolacja
export function sinStep( a, b, t )	// t=[0;1] 
{  
    return lerp(a, b, 0.5+0.5*Math.sin(Math.PI*(t-0.5)) ); 
} 
// ------------------------------------------------------------------------
// Oblicza indeks dal podanej wartości w histogramie
// numVal ilość wartości w histogramie
// maxVal to maksymalna możliwa wartość, a minVal minimalna
export function histogramValIdx( value, numVal, maxVal, minVal=0 )
{
	return Math.floor( (value-minVal) / (maxVal-minVal) * numVal );
}
// ------------------------------------------------------------------------
// Tworzy histogram dla podanej tablicy danych (dataArr)
// Histogram zapisuje do tablicy histArr
// dataArr może zawierać float lub int gdzie maxVal to maksymalna możliwa wartość, a minVal minimalna
// numVal ilość wartości w histogramie
export function histogram( histArr, dataArr, numVal, maxVal, minVal=0 )
{
	histArr.length = numVal;
	histArr.fill(0);	
	
	for( let v of dataArr )	
		// const idx =  Math.floor( (v-minVal) / (maxVal-minVal) * numVal );
		histArr[ histogramValIdx( v, numVal, maxVal, minVal ) ] += 1;
	
}
// ------------------------------------------------------------------------
// Dystrybuanta dla histogramu
// Wynik zapisuje do tablicy cdfArr
// Zwraca minimalną niezerową wartość w cdfArr
export function cdf( cdfArr, histArr )
{
	let sum = 0;
	let cdfMin=0;
	
	// for( let i=0; i<256; i++ )
	for( let h of histArr )
	{
		sum += h;
		if( sum!=0 && cdfMin==0 )
			cdfMin = sum;
			
		cdfArr.push( sum ); 
	}
	return cdfMin;
}
// ------------------------------------------------------------------------
// Wyrównuje histogram dla podanej wartości value = histArr[valIdx]
// valIdx można obliczyć dla danej wartośći przy pomocy histogramValIdx()
// cdfArr - dystrybuanta dla histogramu
// cdfMin - najmniejsza niezerowa wartość histogramu
// numValues - ilość wartości w histogramie
// Zwraca wartość w zakresie [0:1]
export function histogramEqualization( cdfArr, cdfMin, valIdx )
{
	const cdfMax = cdfArr[cdfArr.length-1]; 
	return (cdfArr[ valIdx ]-cdfMin) / (cdfMax-cdfMin);
}
// ------------------------------------------------------------------------
// Wyrównuje histogram w podanym obrazie (zbiorze pikseli)
export function imageHistogramEqualization( pixels )
{
	const numValues=256;	// 8-bitowy piksel przyjmuje jedną z 256 wartości
	// Utwórz histogram
	let histArr=[];
	createHistogram( histArr, pixels, numValues, 255, 0 );
	
	// Dystrybuanta dla histogramu
	let cdfArr=[]; 
	const cdfMin = cdf( cdfArr, histArr ) ;
	
	const numPixels = pixels.length;
	for( let p=0; p<numPixels; p++ )
	{		
		const v = histogramEqualization( cdfArr, cdfMin, pixels[p] );
		pixels[p] = Math.round( v * 255 );
	}
}
// ------------------------------------------------------------------------
// Upper-case first letter 
export function ucFirst(str)
{
	return str.charAt(0).toUpperCase() + str.slice(1);
}
// ------------------------------------------------------------------------
// Modulo operator
export function modulo( a, n )
{
	return ((a % n ) + n ) % n;
}	
// ------------------------------------------------------------------------
// returns {x,y} =[-1:1]
export function randPointInCircle( radius )
{ 
	const pos={x:0,y:0};
	
	do{
		pos.x = mulRand()*2.0-1.0;
		pos.y = mulRand()*2.0-1.0;
	}while( (pos.x*pos.x + pos.y*pos.y) > 1.0 )

	pos.x*=radius;
	pos.y*=radius;

	return pos;
}
// ------------------------------------------------------------------------
// Converts an HSL color value to RGB. Conversion formula adapted from http://en.wikipedia.org/wiki/HSL_color_space.
// Returns color={r,g,b} = [0:1]
export function hslToRgb( h, s, l )	// hue, saturation, lightness [0:1]
{
    let r, g, b;

    if( s == 0 )
        r = g = b = l; // achromatic
    else
	{
		function hue2rgb(p, q, t)
		{
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
		}

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {r:r,g:g,b:b};
} 
// ------------------------------------------------------------------------
// Converts an RGB color value to HSL. Conversion formula adapted from http://en.wikipedia.org/wiki/HSL_color_space.
// Returns color={h,s,l} = [0:1]
export function rgbToHsl(r, g, b)	// [0:1]
{ 
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if( max == min )
		h = s = 0; // achromatic
    else
	{
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {h:h, s:s, l:l};
}
// ------------------------------------------------------------------------
// Dodaj slash na końciu path jeśli go tam nie ma
export function addSlash( path )
{
	return ( path!='' && path.substring( path.length-1, path.length )!='/')? ( path+'/'):  path;
}
// ------------------------------------------------------------------------
// await sleep(x) wstrzymuje wykonanie na x milisek
// await może być użyte tylko w funkcji oznaczonej jako async i tą funkcję wstrzymuje
// sleep(x).then( callback ) wywołuje callback po x milisek
export function sleep(ms){
	return new Promise( resolve => setTimeout(resolve, ms) );
}  
// ------------------------------------------------------------------------