var player;
var asteroids = [];
var bullets = [];
var score = 0;
const sound = new Audio("beep.wav");
const sound2 = new Audio("crash.wav");
var initial_asteroid_number = 10;
var epochTime = new Date().getTime();
var time_limit = 5 * 1000;
var game_over = false;
var game_over_time = -1;

function my_setup(){
  createCanvas(windowWidth, windowHeight);
  player = new Player()
  player.set_heading(get_angle());
  asteroids = [];
  bullets = [];
  score = 0;
  epochTime = new Date().getTime();
  time_limit = 5 * 1000;
  for (var i = 0; i < initial_asteroid_number; i++) {
    asteroids.push(new Asteroid());
  }
  for (var i = 0; i < initial_asteroid_number; i++) {
    asteroids[i].set_size();
    asteroids[i].set_pos();
    asteroids[i].set_vel();
  }
}
function setup() {
  my_setup();
}
function draw() {
  textAlign(CENTER);
  if(game_over){
    background(0, 0, 0);
    var game_over_text = "Game Over\n Your score: " + score;
    textSize(40);
    fill(255, 0, 0);
    text(game_over_text, windowWidth/2, windowHeight/2);
    if(new Date().getTime() - game_over_time > (5000)){
      game_over = false;
      my_setup();
    }
  }
  else{
    background(0);
    update_values();
  } 
}
function keyPressed() {

  if(keyCode==32){
    player.fire=true;
  }
  if(keyCode==RIGHT_ARROW){
    player.move_right=true;
  }
  if(keyCode==LEFT_ARROW){
    player.move_left=true;
  }
  if(keyCode==UP_ARROW){
    player.move_up=true;
  }
  if(keyCode==DOWN_ARROW){
    player.move_down=true;
  }
}

function keyReleased() {
  if(keyCode==32){
    player.fire=false;
  }
  if(keyCode==RIGHT_ARROW){
    player.move_right=false;
  }
  if(keyCode==LEFT_ARROW){
    player.move_left=false;
  }
  if(keyCode==UP_ARROW){
    player.move_up=false;
  }
  if(keyCode==DOWN_ARROW){
    player.move_down=false;
  }
}

get_angle = function(){
  return Math.atan2(mouseY-player.pos.y, mouseX-player.pos.x);
}
update_values = function(){
  var score_text = "Score = "+score;
  console.log(score_text);
  console.log(score_text.length);
  textSize(40);
  fill(255,0,0);
  text(score_text,windowWidth-250,50);
  player.set_heading(get_angle())
  player.render();
  player.move();
  player.boundary();
  player.fire_bullet();

  for(var i=0;i<asteroids.length;i++){
    asteroids[i].move();
    asteroids[i].render();
    asteroids[i].boundary();
  }

  for(var i=0;i<bullets.length;i++){
    bullets[i].render();
    bullets[i].move();
  }
  check_collision();

  
}
distance = function(bullet,asteroid){
  var delta_y = bullet.pos.y - asteroid.pos.y;
  var delta_x = bullet.pos.x - asteroid.pos.x;
  delta_y*=delta_y;
  delta_x*=delta_x;
  var ans = sqrt(delta_y+delta_x);
  return ans;
}
update_asteroid_list = function(){
  
  var temp = []
  for (var i = 0; i < asteroids.length; i++) {
    if (!asteroids[i].destroyed) {
      temp.push(asteroids[i]);
    }
  }
  asteroids = temp;
  if ((new Date().getTime() - epochTime >= (time_limit)) && asteroids.length < 20)
  {
      epochTime = new Date().getTime();
      time_limit = max(time_limit - 200,2000);
      var na = new Asteroid();
      na.size = 80;
      na.set_pos();
      na.set_vel();
      asteroids.push(na);
  }
}
update_bullet_list = function(){
  var temp = []
  for (var i = 0; i < bullets.length; i++) {
    if (!bullets[i].destroyed) {
      temp.push(bullets[i]);
    }
  }
  bullets = temp;
}
check_collision = function(){  
  update_asteroid_list();
  update_bullet_list();
  for(var j=0;j<asteroids.length;j++){
    for(var i=0;i<bullets.length;i++){
      asteroids[j].hit_time=Math.max(0,asteroids[j].hit_time-1);
      if(distance(bullets[i],asteroids[j])<(asteroids[j].size)){
        if (!asteroids[j].destroyed){
          asteroids[j].destroyed = true;
          bullets[i].destroyed = true;
          score += 1;
          sound.play();
          if (80==asteroids[j].size){
            var temp = new Asteroid();
            temp.size = 60;
            temp.pos.x = asteroids[j].pos.x;
            temp.pos.y = asteroids[j].pos.y;
            translate(temp.pos.x, temp.pos.y);
            temp.set_vel();
            asteroids.push(temp);
          }
          else if (60 == asteroids[j].size) {
            var temp = new Asteroid();
            temp.size = 40;
            temp.pos.x = asteroids[j].pos.x;
            temp.pos.y = asteroids[j].pos.y;
            translate(temp.pos.x, temp.pos.y);
            temp.set_vel();
            asteroids.push(temp);
          }
        }
      }
    }
  }
  for (var j = 0; j < asteroids.length; j++){
    if (!asteroids[j].destroyed){
      if(distance(player, asteroids[j]) < (asteroids[j].size + 10)){
        game_over = true;
        game_over_time = new Date().getTime();
        sound2.play();
        setTimeout(() => {
          sound2.pause();
          sound2.currentTime = 0;
        },1000);
      }
    }
  }
}

function Player(){
  this.pos = createVector(width/2,height/2)
  this.size = 25;
  this.heading = 0;
  this.velocity = createVector(0,0);
  this.acc = createVector(0,0);
  this.move_up=false;
  this.move_down=false;
  this.move_right=false;
  this.move_left=false;
  this.unit_speed = 0.1;
  this.max_speed= 5;
  this.fire=false;
  this.last_fire=0;

  this.move = function(){

    velx = player.velocity.x;
    vely = player.velocity.y;
    if(this.move_right){
      velx=Math.min(velx+this.unit_speed,this.max_speed);
    }
    else if(this.move_left){
      velx=Math.max(velx-this.unit_speed,-this.max_speed);
    }
    else if(this.move_up){
      vely=Math.max(vely-this.unit_speed,-this.max_speed);
    }
    else if(this.move_down){
      vely=Math.min(vely+this.unit_speed,this.max_speed);
    }
    player.velocity.x=velx;
    player.velocity.y=vely;


    this.pos.add(this.velocity)
    this.velocity.x*=0.98;
    this.velocity.y*=0.98;

    this.fire_bullet = function(){
      if(this.fire && this.last_fire==0){
        var temp = new Bullet();
      temp.pos.x = this.pos.x;
      temp.pos.y = this.pos.y;
      temp.velocity = p5.Vector.fromAngle(this.heading);
      temp.velocity.mult(7);
      bullets.push(temp);
      this.last_fire=30;
      }
      this.last_fire = Math.max(0,this.last_fire-1);
    }
  }

  this.boundary = function(){
    if(this.pos.x>width+10){
      this.pos.x=-10;
    }
    if(this.pos.y>height+10){
      this.pos.y=-10;
    }
    if(this.pos.x<-10){
      this.pos.x=width+10;
    }
    if(this.pos.y<-10){
      this.pos.y=height+10;
    }
  }
  this.set_vel = function(x,y){
    this.velocity.x = x;
    this.velocity.y = y;
  }


  this.render = function(){
    push();
    translate(this.pos.x,this.pos.y);
    rotate(this.heading + radians(+90))
    fill(0, 0, 255);
    stroke(255, 255, 255);
    strokeWeight(2);
    triangle(-this.size, this.size, this.size, this.size, 0, -this.size);
    pop();
  }
  this.set_heading = function(new_heading){
    this.heading = new_heading;
  }
}



function Asteroid(){
  this.pos = createVector(0,0);
  this.size=10;
  this.vel_y;
  this.vel_x;
  this.hit_time=0;
  this.destroyed=false;
  this.render = function(){
    push();
    translate(this.pos.x,this.pos.y);
    fill(100,100 , 100);
    ellipse(0,0,this.size);
    // noFill();
    // stroke(220,20,60);
    pop();
  }
  this.set_size = function(){
    this.size = random([2,3,4]);
    this.size*=20;
  }
  this.set_pos  = function(){
    this.pos.x = random(width);
    this.pos.y = random(height);
    translate(this.pos.x,this.pos.y);
  }
  this.set_vel = function(){
    this.vel_y = random(-3,4);
    this.vel_x = random(-3,4);
  }
  this.move = function(){
    this.pos.x+=this.vel_x*(0.8);
    this.pos.y+=this.vel_y*(0.8);
  }
  this.boundary = function(){
    if(this.pos.x>width+25){
      this.pos.x=-25;
    }
    if(this.pos.y>height+25){
      this.pos.y=-25;
    }
    if(this.pos.x<-25){
      this.pos.x=width+25;
    }
    if(this.pos.y<-25){
      this.pos.y=height+25;
    }
  }
}


function Bullet(){
  this.pos = createVector();
  this.velocity = createVector();
  this.destroyed = false;
  

  this.move = function(){
    this.pos.add(this.velocity);
  }
  this.render = function(){
    push();
    stroke(255,255,0);
    strokeWeight(10);
    point(this.pos.x,this.pos.y);
    pop();
  }
}
