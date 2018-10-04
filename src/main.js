import _ from 'lodash';
const c = document.getElementById('canvas');
const context = c.getContext('2d');
const screen = {
  w: window.innerWidth,
  h: window.innerHeight
};
let mouse = {
  x:false,
  y:false
};

let mousePos = {
  x:0,
  y:0
};

c.width = screen.w;
c.height = screen.h;
const amount = screen.w / 2;

class Particle {
  constructor(id,x,y) {
    const points = this.randomPointFromCircle();
    this.spreadValues = {
      x: x + points.x,
      y: y + points.y,
    };
    this.id = id;
    this.x = x;
    this.y = y;
    this.x0 = this.x;
    this.y0 = this.y;
    this.xVel = 0;
    this.yVel = 0;
    this.colors = ["#f7c04a","#c99c3c","#e5ab30","#ffb20f"];
    this.color = _.sample(this.colors);
    this.radius = _.random(2,5);
    this.distanceLimit = 0;
    this.state = 'SPREADING';
    this.repel = true;
    this.speed = _.random(0.2,2);
  }
  draw() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = this.color;
    context.fill();
  }
  update() {
    if(this.state === 'MOVING') {
      this.repel = false;
      this.moveToPoint();
    }
    
    if(this.state === 'SPREADING') {
      this.spread();
    }

    if(this.repel) {
      this.repelBees();
    }

    this.x += this.xVel;
    this.y += this.yVel;

    if(this.y < 0) {
      this.y = 0;
    }

    if(this.y > screen.h) {
      this.y = screen.h
    }

    if(this.x < 0) {
      this.x = 0;
    }

    if(this.x > screen.w) {
      this.x = screen.w
    }
    
    this.xVel = 0;
    this.yVel = 0;
    this.draw();
  }
  moveToPoint() {
    const relativeToMouse = this.getRelativeTo(this,mouse);
    const distance = this.getDistance(relativeToMouse);
    const direction = this.getDirection(relativeToMouse, distance);
    const force = this.getForce(distance);
    
    if(Math.floor(distance) === 0) {
      this.setState('SPREADING');
    }

    this.xVel += direction.x * -force * this.speed;
    this.yVel += direction.y * -force * this.speed;
  }
  spread() {
    const newPosition = {
      x: mouse.x + this.spreadValues.x,
      y: mouse.y + this.spreadValues.y
    };
    const relativeToTarget = this.getRelativeTo(newPosition, this);
    const distance = this.getDistance(relativeToTarget);
    const direction = this.getDirection(relativeToTarget, distance);
    const force = this.getForce(distance);
    
    this.xVel += direction.x * force;
    this.yVel += direction.y * force;
    this.showTarget(newPosition);
    if(Math.floor(distance) === 0) {
      this.repel = true;
    }
  }
  repelBees() {
    const relativeToMouse = this.getRelativeTo(this,mousePos);
    const distance = this.getDistance(relativeToMouse);
    const direction = this.getDirection(relativeToMouse, distance);
    const force = this.getRepel(distance);
    
    this.xVel += direction.x * force;
    this.yVel += direction.y * force;
    
  }
  getRelativeTo(v1,v2) {
    const relativeToTarget = {
      x: v1.x - v2.x,
      y: v1.y - v2.y
    };
    return relativeToTarget;
  }
  getDistance(relative) {
    const distance = Math.sqrt(
      relative.x * relative.x + 
      relative.y * relative.y
    );
    
    return distance;
  }
  getForce(distance) {
    let force = distance * (1 / 10);
    return force;
  }
  getRepel(distance) {
    let maxDistance = 100;
    let force = (maxDistance - distance) / maxDistance;

    if(force < 0 ) {
      force = 0;
    }
    return force;
  }
  getDirection(relativeToTarget, distance) {
    if(distance === 0) {
      return {
        x: 0,
        y: 0
      };
    }
    return {
      x: relativeToTarget.x / distance,
      y: relativeToTarget.y / distance
    };
  }
  setState(state) {
    this.state = state;
  }
  updateSpread() {
    const points = this.randomPointFromCircle();
    this.spreadValues = {
      x: points.x,
      y: points.y
    };
  }
  randomPointFromCircle() {
    const radius = screen.h / 4;
    const angle = Math.random() * 2 * Math.PI;
    const radius_sq = Math.random() * radius * radius;
    const x = Math.sqrt(radius_sq) * Math.cos(angle);
    const y = Math.sqrt(radius_sq) * Math.sin(angle);
    return {
      x: x,
      y: y
    };
  }
  showTarget(newPosition) {
    context.beginPath();
    context.arc(newPosition.x, newPosition.y, this.radius, 0, 2 * Math.PI);
    context.fillStyle = 'green';
    context.fill();
  }
}

class Bees {
  constructor(size) {
    this.size = size;
    this.bees = [];
    this.createBees();
  }
  createBees() {
    _.times(this.size, (i) => {
      this.bees.push(new Particle(
        i,
        screen.w / 2,
        screen.h / 2
      ));
    });
  }
  draw() {
    this.bees.forEach(bee => bee.update());
  }
  move() {
    this.bees.forEach(bee => bee.setState('MOVING'));
  }
  updateSpreads() {
    this.bees.forEach(bee => bee.updateSpread());
  }
}

window.addEventListener('click', (e) => {
  mouse = {
    x: e.clientX,
    y: e.clientY
  };
  bees.move();
  bees.updateSpreads();
},true);

window.addEventListener('mousemove', (e) => {
  mousePos = {
    x: e.clientX,
    y: e.clientY
  };
},true);

const animate = () => {
  requestAnimationFrame(animate);
  context.clearRect(0, 0, screen.w, screen.h);
  bees.draw();
};

const bees = new Bees(amount);
animate();