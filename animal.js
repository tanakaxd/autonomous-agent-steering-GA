class Animal{

	constructor(x=randomGaussian(width,80),y=randomGaussian(height*6/12,80)){
		this.gene = new Gene();
		this.pos=createVector(x,y);
		this.acc=createVector();
		this.vel=p5.Vector.random2D();
		this.lap=0;
		this.buffer=0;
		this.fitness=null;

	}

	trail(paths){ // receiving array of path objects
		let worldRecord = null;
		let worldRecordPath = null;
		let worldRecordProjected = null;
		let desired = createVector(0,0);


		// calculate future position
		let predict = this.vel.copy();
		predict.setMag(this.gene.sight);
		let predictLoc = this.pos.copy().add(predict);

		if(debug)ellipse(predictLoc.x,predictLoc.y,8,8);


		// calculate scalar projection of future position onto the trail,
		// so that you can get the closest point
		// if the distance on the point is within the trail do nothing

		// for each path
		for(let path of paths){
			let p = predictLoc.copy();
			// path.startを起点にするvectorに書き換える
			p.sub(path.start);
			let projectedPoint = this.scalarProjection(p, path.v);
			projectedPoint.add(path.start);
			if(debug)line(projectedPoint.x,projectedPoint.y,predictLoc.x,predictLoc.y);
			if(debug)ellipse(projectedPoint.x,projectedPoint.y,4,4);

			let d = p5.Vector.dist(predictLoc, projectedPoint);

			//projectedPoint（x,y）がpath.startとpath.endの間にあるかどうか
			let checkonthepath =
			((path.start.x-path.r<=projectedPoint.x)&&
				(projectedPoint.x<=path.end.x+path.r)&&
				(path.start.y-path.r<=projectedPoint.y)&&
				(projectedPoint.y<=path.end.y+path.r)) ||
			((path.start.x+path.r>=projectedPoint.x)&&
				(projectedPoint.x>=path.end.x-path.r)&&
				(path.start.y+path.r>=projectedPoint.y)&&
				(projectedPoint.y>=path.end.y-path.r));

			if((worldRecord==null || worldRecord>=d ) && checkonthepath){
				worldRecord = d; //scalar
				worldRecordPath = path.get(); //Path object
				worldRecordProjected = projectedPoint.copy(); //vector
			}
		}
		// 正方形コースの場合マップ四つ角の外側が例外的な位置になる
		// 該当するパターンがない場合、pathの一個目が自動的にworldrecordになるが、
		// それだと辺abをひたすら追従してマップの外にさよならしてしまう
		if(worldRecord==null){
			// 例えばランダムに歩かせる、マップ中央に歩かせる
			// 最善策は比較的近い２pathsを取得して、配列の後の方に入っているpathに追従すること
			// 後の方とはつまりコースとして先のほうということ
			// for (var i = 0; i < paths.length; i++) {

			// 	let p = predictLoc.copy();
			// 	p.sub(path[i].start);
			// 	let projectedPoint = this.scalarProjection(p, path[i].v);
			// 	projectedPoint.add(path[i].start);
			// 	line(projectedPoint.x,projectedPoint.y,predictLoc.x,predictLoc.y);
			// 	ellipse(projectedPoint.x,projectedPoint.y,4,4);
			// 	let d = p5.Vector.dist(predictLoc, projectedPoint);
			// 	if(worldRecord==null || worldRecord>=d ) {
			// 		worldRecord = d; //scalar
			// 		worldRecordPath = path[i+1].get(); //Path object
			// 		worldRecordProjected =  //vector

			// 		書き途中

			// 	}
			// }

			// マップ中央に向かわせる
			let target = createVector(width/2,height/2);
			if(debug)ellipse(target.x,target.y,12,12);
			target.sub(this.pos);
			desired = target.sub(this.vel);


		//mudの中にいる場合も含める
		}else if((worldRecord > (worldRecordPath.r/2)) ){
			// adding some offset to the point
			let target = worldRecordProjected.copy();
			let offset = worldRecordPath.v.setMag(this.gene.aggressivity); //vector
			target.add(offset);
			push();
			fill(200,100,100);
			if(debug)ellipse(target.x,target.y,this.gene.aggressivity/4,this.gene.aggressivity/4);
			pop();
			target.sub(this.pos);
			// seek that target position!
			// desired = target - current
			desired = target.sub(this.vel);
		}

		return desired;

	}

	scalarProjection(p,q){ //return vector
		let point = p.copy();
		let plane = q.copy();
		plane.normalize();
		plane.mult(point.dot(plane));
		return plane;
	}

	separate(others){
		let desired = createVector();
		//全ての自分以外のotherに対して
		//距離を計算する→ある数値以下なら万有引力を計算しdesiredに加算
		for (let other of others){
			if(!(other === this)){
				let d = p5.Vector.dist(this.pos, other.pos);
				if(d==0)d=0.0000001;
				if(d < this.gene.sight){
					let repulsion = p5.Vector.sub(this.pos,other.pos);
					repulsion.div(d*d);
					desired.add(repulsion);
				}
			}
		}
		return desired;
	}

	viscousFriction(){
		let friction = this.vel.copy();
		// friction.normalize();
		let normalforce = this.gene.mass*G;
		friction.mult(-1*muddiness*normalforce);
		return friction;
	}


	calcDesiredForce(){
		// 進もうとする力と抵抗になる力を分けて考えるべきか
		// 進もうとする力のみmaxForceで制限をかける
		// ただそもそも遺伝子でmaxForceという値を持っていることがおかしかもしれない
		// 本来は種々の遺伝的要素によって、その総体として出力できる力が決まるべき
		let sumForce = createVector(0,0);

		// calling every elemental force functions
		let trailForce = this.trail(paths);
		let separateForce = this.separate(population.animals);

		// weight those values
		trailForce.mult(this.gene.punctuality);
		separateForce.mult(this.gene.softhearted);

		// calculate netforce
		sumForce.add(trailForce).add(separateForce);
		let massCoefficient = (this.gene.mass/4);
		// sumForce.limit(this.gene.maxForce);
		sumForce.limit(this.gene.maxForce*massCoefficient); //arbitrary calc

		//muddy case
		let d = p5.Vector.dist(this.pos,mud);
		if(d<mudr){
			let mudFriction = this.viscousFriction();
			sumForce.add(mudFriction);
		}

		// return sum
		return sumForce;

	}

	applyForce(force){
		this.acc.add(force.div(this.gene.mass));
	}

	calcFitness(){
		this.fitness = this.lap*this.lap;
	}

	intercourse(partner){
		let child = new Animal();

		//if Gene object has objectliteral called something
		//for (let key in child.gene.something)

		if(mutationRate<random()){
			if(random()<0.5){
				child.gene.sight = this.gene.sight;
			}else{
				child.gene.sight = partner.gene.sight;
			}
		}
		if(mutationRate<random()){
			if(random()<0.5){
				child.gene.maxForce = this.gene.maxForce;
			}else{
				child.gene.maxForce = partner.gene.maxForce;
			}
		}
		if(mutationRate<random()){
			if(random()<0.5){
				child.gene.maxSpeed = this.gene.maxSpeed;
			}else{
				child.gene.maxSpeed = partner.gene.maxSpeed;
			}
		}
		if(mutationRate<random()){
			if(random()<0.5){
				child.gene.aggressivity = this.gene.aggressivity;
			}else{
				child.gene.aggressivity = partner.gene.aggressivity;
			}
		}
		if(mutationRate<random()){
			if(random()<0.5){
				child.gene.trailWeight = this.gene.trailWeight;
			}else{
				child.gene.trailWeight = partner.gene.trailWeight;
			}
		}
		if(mutationRate<random()){
			if(random()<0.5){
				child.gene.separateWeight = this.gene.separateWeight;
			}else{
				child.gene.separateWeight = partner.gene.separateWeight;
			}
		}
		if(mutationRate<random()){
			if(random()<0.5){
				child.gene.mass = this.gene.mass;
			}else{
				child.gene.mass = partner.gene.mass;
			}
		}
		return child;
	}

	showPersonality(){
		let personality={
			maxForce:this.gene.maxForce.toFixed(3),
			maxSpeed:this.gene.maxSpeed.toFixed(2),
			sight:this.gene.sight.toFixed(1),
			aggressivity:this.gene.aggressivity.toFixed(1),
			punctuality:this.gene.punctuality.toFixed(3),
			softhearted:this.gene.softhearted.toFixed(3),
			mass:this.gene.mass.toFixed(3),
			fitness:this.fitness
		}
		return personality;
	}

	move(){
		this.vel = this.vel.add(this.acc);
		this.vel.limit(this.gene.maxSpeed);
		this.pos = this.pos.add(this.vel);
		if(this.buffer>100 && p5.Vector.dist(this.pos,goal)<goalr){
			this.lap++;
			this.buffer = 0;
		}
		this.buffer++;
		this.acc.mult(0);
	}

	show(){
		// fill(255);
		// ellipse(this.pos.x,this.pos.y,16,16);
		imageMode(CENTER);
		image(img, this.pos.x,this.pos.y,18*sqrt(this.gene.mass),18*sqrt(this.gene.mass));
		if(debug){
			push();
			noFill();
			ellipse(this.pos.x,this.pos.y,this.gene.sight*2);
			rectMode(CENTER);
			rect(this.pos.x,this.pos.y,this.gene.maxForce*100,this.gene.maxSpeed*20);
			pop();
		}
	}

}