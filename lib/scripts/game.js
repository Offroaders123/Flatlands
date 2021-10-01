// Canvas
const canvas = document.querySelector("#canvas");
const bounds = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d",{ alpha: false });

let scaling = 4;

new ResizeObserver(() => {
  canvas.width = canvas.offsetWidth / scaling;
  canvas.height = canvas.offsetHeight / scaling;
  ctx.imageSmoothingEnabled = false;
  animate({ recursive: false });
}).observe(canvas);

let tick = 0;

// Input
const key = {
  left: false,
  right: false,
  up: false,
  down: false
};
document.addEventListener("keydown",event => {
  if (event.repeat || document.activeElement != document.body) return;
  if (["ArrowLeft","a"].includes(event.key)) key.left = true;
  if (["ArrowRight","d"].includes(event.key)) key.right = true;
  if (["ArrowUp","w"].includes(event.key)) key.up = true;
  if (["ArrowDown","s"].includes(event.key)) key.down = true;
});
document.addEventListener("keyup",event => {
  if (document.activeElement != document.body) return;
  if (["ArrowLeft","a"].includes(event.key)) key.left = false;
  if (["ArrowRight","d"].includes(event.key)) key.right = false;
  if (["ArrowUp","w"].includes(event.key)) key.up = false;
  if (["ArrowDown","s"].includes(event.key)) key.down = false;
});
document.addEventListener("contextmenu",event => event.preventDefault());

// Environment
const grassSprite = new Image();
grassSprite.src = "./lib/sprites/ground.png";
let grassPattern;
grassSprite.addEventListener("load",() => grassPattern = ctx.createPattern(grassSprite,"repeat"));

const explored = {
  left: 0,
  right: canvas.width,
  top: 0,
  bottom: canvas.height
};

// Player
const playerSprite = new Image();
playerSprite.src = "./lib/sprites/player_guy.png";
class Player {
  constructor(){
    this.x = 0;
    this.y = 0;
    this.width = 16;
    this.height = 32;
    this.offsetX = () => Math.round(canvas.width / 2);
    this.offsetY = () => Math.round(canvas.height / 2);
    this.speed = 2;
    this.tick = 0;
    this.ticks = 36;
    this.frame = 0;
    this.frames = 2;
    this.column = 0;
    this.columns = 4;
		this.facing = 1;
  }
  update(){
    if (key.left) this.x += this.speed;
    if (key.right) this.x -= this.speed;
    if (key.up) this.y += this.speed;
    if (key.down) this.y -= this.speed;

    this.tick++;
			if ((key.left || key.right)) {
				if(this.column !== 1) this.column = 1;
      	if (this.frame < this.frames - 1 && this.tick > this.ticks - 1){
        	this.frame++;
      	} else if (this.tick > this.ticks/2) {
      	  this.frame = 0;
      	}
			} else if (key.up) {
					if(this.column !== 3) this.column = 3;
      	if (this.frame < this.frames - 1 && this.tick > this.ticks - 1){
        	this.frame++;
      	} else if (this.tick > this.ticks/2) {
      	  this.frame = 0;
      	}
			} else if (key.down) {
					if(this.column !== 2) this.column = 2;
      	if (this.frame < this.frames - 1 && this.tick > this.ticks - 1){
        	this.frame++;
      	} else if (this.tick > this.ticks/2) {
      	  this.frame = 0;
      	}
			} else {
					this.frame = 0;
					this.column = 0;
			}
    if (this.tick > this.ticks - 1){
      this.tick = 0;
		}
  }
  draw(){
		ctx.save();
		if (key.right) this.facing = 1;
		if (key.left || this.facing === 0) {
			this.facing = 0;
			ctx.save();  // save the current canvas state
	    ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
		}
    ctx.drawImage(playerSprite,this.width * ((key.left || key.right || key.up || key.down) ? this.frame : 0),(key.left || key.right || key.up || key.down) ? this.height * this.column : 0,this.width,this.height,this.offsetX() - this.width / 2,this.offsetY() - this.height / 2,this.width,this.height);
  	ctx.restore();
	}
}
const player = new Player();

// Trees
const treesArray = [];
const treeSprite = new Image();
treeSprite.src = "./lib/sprites/treeFull.png";
class Tree {
  constructor(){
    this.x = Math.floor(Math.random() * canvas.width) - player.x - 96 / 2;
    if (key.up){
      this.y = canvas.height / -2 - player.y - 96 / 2;
      if (explored.top > this.y) explored.top = this.y;
    }
    if (key.down){
      this.y = canvas.height - player.y;
      if (explored.bottom < this.y) explored.bottom = this.y;
    }
    this.width = 96;
    this.height = 150;
  }
  draw(){
    ctx.drawImage(treeSprite,this.x + player.x,this.y + player.y,this.width,this.height);
  }
}
function handleTrees(){
  if (tick % 20 == 0){
    if (canvas.height / -2 - player.y < explored.top || canvas.height - player.y > explored.bottom){
      if (key.up) treesArray.unshift(new Tree());
      if (key.down) treesArray.push(new Tree());
    }
  }
}

// Coordinates
const coordinates = document.querySelector("#coordinates");
function setCoordinateLabel(){
  coordinates.textContent = `(${Math.round(player.x / 16) * -1}, ${Math.round(player.y / 16)})`;
}

// Rendering
function animate({ recursive = true } = {}){

  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (grassPattern) grassPattern.setTransform(new DOMMatrix([1,0,0,1,player.offsetX() + player.x,player.offsetY() + player.y]));
  ctx.fillStyle = (grassPattern) ? grassPattern : "#779c43";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  player.update();
	handleTrees();
	var inFront = treesArray.filter((val) => -val.y <= player.y + 8);
	var inBack = treesArray.filter((val) => !(-val.y <= player.y + 8));
	inBack.forEach((tree) => {
		tree.draw();
	});
  player.draw();
	inFront.forEach((tree) => {
		tree.draw();
	});
  setCoordinateLabel();
  tick++;
  if (recursive) window.requestAnimationFrame(animate);
}
animate();
