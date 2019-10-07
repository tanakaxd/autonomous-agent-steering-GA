class Gene{
	constructor(){
		this.sight = randomGaussian(80,25);
		this.maxForce = constrain(randomGaussian(1,0.25),0.1,10);
		this.maxSpeed = randomGaussian(5,1);
		this.aggressivity = randomGaussian(50,20);
		this.punctuality = randomGaussian(1,0.25);
		this.softhearted = randomGaussian(10,2);
		this.mass = randomGaussian(4,1);
		this.lifespan=null;
		this.flying=null;
	}

	// crossover(){

	// }

	// mutation(){

	// }
	returnObjectLiteral(){
		let obl = {
			sight : this.sight,
			maxForce : this.maxForce,
			maxSpeed : this.maxSpeed,
			aggressivity : this.aggressivity,
			punctuality : this.punctuality,
			softheadted : this.softhearted,
			mass : this.mass,
			lifespan : this.lifespan,
			flying : this.flying
		}
		return obl;
	}
}