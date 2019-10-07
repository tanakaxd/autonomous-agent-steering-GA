let paths = [];
let points = [];
let a,b,c,d,e,f;
let ab,bc,cd,de,ef,fa;
let count=0;
let debug = false;
let img;
let population;
let goal;
let goalr = 150;
let mud;
let mudr = 250;
let mutationRate = 0.01;
let muddiness = 0.1;
let G = 1;

function preload(){
	img = loadImage("kaeru.png");
}

function setup() {
	let button1 = select("#stop");
	let button2 = select("#resume");
	button1.mousePressed(stop);
	button2.mousePressed(resume);

	// frameRate(1);
	createCanvas(1000,600);
	a = createVector(width/6,height/6);
	b = createVector(width*9/12,height*3/12);
	c = createVector(width*5/6,height*5/6);
	d = createVector(width*3/6,height*11/12);
	e = createVector(width*2/12,height*9/12);
	f = createVector(width*1/12,height*3/6);
	points=[a,b,c,d,e,f];
	// console.log(points);

	// ab = new Path(createVector(0,200),createVector(width,height/2));
	ab = new Path(a,b);
	bc = new Path(b,c);
	cd = new Path(c,d);
	de = new Path(d,e);
	ef = new Path(e,f);
	fa = new Path(f,a);
	paths= [ab,bc,cd,de,ef,fa];

	goal = createVector(width*9.5/12,height*6.5/12);
	mud = createVector(width/12,height/2);

	population = new Population();
	population.showAnimalsPersonality()
	let genp = createP(population.generation);


	// animals.push(new Animal(500,200));

}

function draw() {
	background(230);

	count++;
	if(count>3000){
		population.evaluate();
		population.selection();
		population.showAnimalsPersonality();
		count = 0;
	}

	for(let path of paths){
		path.pave();
	}
	// not to overwrap
	for(let path of paths){
		path.draw();
	}
	noFill();
	ellipse(goal.x,goal.y,goalr*2);
	fill(170,133,108,200);
	ellipse(mud.x,mud.y,mudr*2);

	population.run();

}

	function mousePressed(){
		let p = createVector(mouseX,mouseY);
		for(let animal of population.animals){
			let d = p5.Vector.dist(p,animal.pos);
			if(d < 9*sqrt(animal.gene.mass)){
				// console.log(animal.showPersonality());
				console.log(animal);
			}
		}
	}

	function stop(){
		noLoop();
	}

	function resume(){
		loop();
	}