// ------------------------------------------------------------------------
// MATHS - różne matematyczne

// ------------------------------------------------------------------------
export class CVertex2D
{
	x;
	y;
	constructor(nx,ny){
		this.x=nx; this.y=ny; }
	equals( vert ){
		return this.x == vert.x && this.y == vert.y; }
	copy( vert ){
		this.x = vert.x;
		this.y = vert.y;
	}
}
// ------------------------------------------------------------------------
export class CEdge2D
{
	v0;			// ref do [CVertex2D]
	v1;			// ref do [CVertex2D]
	// weight=0;	// waga krawędzi
	
	constructor(nv0,nv1){
		this.v0=nv0; this.v1=nv1; }
		
	equals( edge )
	{  
		return (this.v0.equals( edge.v0 ) && this.v1.equals( edge.v1 )) || (this.v0.equals( edge.v1 ) && this.v1.equals( edge.v0 ));
	}
	copy( edge )
	{
		this.v0 = vert.v0;
		this.v1 = vert.v1;
		// this.weight = vert.weight;
	}
	
	// Zwraca nową krawędź w której zamienione są ze sobą v0 i v1
	inverse(){
		return new CEdge2D( this.v1, this.v0 ); }
}
// ------------------------------------------------------------------------
export class CTriangle2D
{
	v0;			// ref do [CVertex2D]
	v1;			// ref do [CVertex2D]
	v2;			// ref do [CVertex2D]
	
	center;		// [CVertex2D] środek okręgu opisującego trójkąt
	radius;		// [float] promień okreśgu opisującego trójkąt
	
// ------------------------------------------------------------------------
// Konstruktor
constructor(nv0,nv1,nv2)
{
	this.v0=nv0; this.v1=nv1; this.v2=nv2;
	this.calcCircumcircle();
}
// ------------------------------------------------------------------------
copy( tri )
{
	this.v0 = tri.v0;
	this.v1 = tri.v1;
	this.v2 = tri.v2;
	this.center = new CVertex2D(tri.center.x, tri.center.y)
	this.radius = tri.radius; 
}
// ------------------------------------------------------------------------
// Oblicz okrąg opisująy ten trójkąt
// Reference: http://www.faqs.org/faqs/graphics/algorithms-faq/ Subject 1.04
calcCircumcircle()
{
	const A = this.v1.x - this.v0.x;
	const B = this.v1.y - this.v0.y;
	const C = this.v2.x - this.v0.x;
	const D = this.v2.y - this.v0.y;

	const E = A * (this.v0.x + this.v1.x) + B * (this.v0.y + this.v1.y);
	const F = C * (this.v0.x + this.v2.x) + D * (this.v0.y + this.v2.y);

	const G = 2.0 * (A * (this.v2.y - this.v1.y) - B * (this.v2.x - this.v1.x));

	let dx, dy;

	// Collinear points, get extremes and use midpoint as center
	if(Math.round(Math.abs(G)) == 0) 
	{
		const minx = Math.min(this.v0.x, this.v1.x, this.v2.x);
		const miny = Math.min(this.v0.y, this.v1.y, this.v2.y);
		const maxx = Math.max(this.v0.x, this.v1.x, this.v2.x);
		const maxy = Math.max(this.v0.y, this.v1.y, this.v2.y);

		this.center = new CVertex2D((minx + maxx) / 2, (miny + maxy) / 2);

		dx = this.center.x - minx;
		dy = this.center.y - miny;
	} 
	else 
	{
		const cx = (D * E - B * F) / G;
		const cy = (A * F - C * E) / G;

		this.center = new CVertex2D(cx, cy);

		dx = this.center.x - this.v0.x;
		dy = this.center.y - this.v0.y;
	}
	this.radius = Math.sqrt(dx * dx + dy * dy);
}
// ------------------------------------------------------------------------
// Czy vertex v jest wewnątrz okręgu opisującego trójkąt
inCircumcircle( v ) 
{
	const dx = this.center.x - v.x;
	const dy = this.center.y - v.y;
	return Math.sqrt(dx * dx + dy * dy) <= this.radius;
}
// ------------------------------------------------------------------------
}