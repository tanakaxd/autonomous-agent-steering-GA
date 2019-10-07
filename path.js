class Path{
	constructor(start,end){
		this.start = start;
		this.end = end;
		this.r = 60;
		this.v = p5.Vector.sub(end,start);
	}

	pave(){
		strokeWeight(this.r);
		stroke(255);
		line(this.start.x,this.start.y,this.end.x,this.end.y);
	}
	draw(){
		strokeWeight(1);
		stroke(0);
		line(this.start.x,this.start.y,this.end.x,this.end.y);
	}

	get(){
		let dup = new Path(this.start, this.end);
		return dup;
	}

}