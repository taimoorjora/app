var screenSizeWidth=(98*window.innerWidth)/100;
var screenSizeHeight=(98*window.innerHeight)/100;
var spaceOnSides=(7*screenSizeWidth)/100;
var spaceOnTop=(10*screenSizeHeight)/100;
///////////////////////////////Set Values///////////
var blockOrignalWidth=36;
var blockOrginalHeight=52;
var shapeArraySize=40;
////////////////////////////////////////////////
var blockWidth=(screenSizeWidth-spaceOnSides*2)/shapeArraySize;
var scaleTile=1+(blockWidth-blockOrignalWidth)/blockOrignalWidth;
var blockHeight=blockOrginalHeight*scaleTile;

var bricksInRow=shapeArraySize;
var bricksRows=5;
var game=new Phaser.Game(
  screenSizeWidth,screenSizeHeight,
  Phaser.AUTO,
  "breaker",
  {
    preload:phaserPreload,
    create:phaserCreate,
    update:phaserUpdate

  }
);
var shape=[
  [1,1,1,1,1,0,1,1,1,1,0,0,1,1,1,0,1,0,0,1,0,0,1,1,1,0,1,0,0,1,0,1,1,1,0,0,1,1,1,1],
  [0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0],
  [0,0,1,0,0,0,1,1,1,1,0,1,0,0,0,0,1,1,1,1,0,1,0,0,0,0,1,0,0,1,0,1,1,1,0,0,1,1,1,1],
  [0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,1,0,0,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0,0],
  [0,0,1,0,0,0,1,1,1,1,0,0,1,1,1,0,1,0,0,1,0,0,1,1,1,0,0,1,1,0,0,1,1,1,0,0,1,1,1,1]
];
////////////////////////////////////////////////////////////////////////////////////////////Pre LOader
function phaserPreload(){

  game.load.image("background","assets/background5.jpg");

  game.load.image("tile6","assets/tile7.png");
  game.load.image("paddle","assets/paddle2.png");
  game.load.image("ball","assets/ball1.png");
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// Phase Creator
function phaserCreate(){

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.checkCollision.down=false;
  background=game.add.tileSprite(0,0,screenSizeWidth,screenSizeHeight,"background");
  tiles=game.add.group();
  tiles.enableBody=true;
  tiles.physicsdBodyType=Phaser.Physics.ARCADE;
  for(var i=0;i<bricksRows;i++)
  {
    for(var j=0;j<bricksInRow;j++)
    {
      if(shape[i][j]===1)
      {
        var tile=tiles.create(spaceOnSides+(j*blockWidth),spaceOnTop+(i*blockHeight),"tile6");
        tile.body.bounce.set(1);

        tile.scale.setTo(scaleTile,scaleTile);
        tile.body.immovable=true;
      }
    }
  }

  paddle=game.add.sprite(game.world.centerX,(80*screenSizeHeight)/100,"paddle");
  paddle.anchor.setTo(.5,.5);
  game.physics.enable(paddle,Phaser.Physics.ARCADE);
  paddle.body.collideWorldBounds=true;
  paddle.body.bounce.set(1);
  paddle.body.immovable=true;

  ball=game.add.sprite(game.world.centerX,paddle.y-16,"ball");
  ball.anchor.set(.0);
  ball.checkWorldBounds=true;
  game.physics.enable(ball,Phaser.Physics.ARCADE);
  ball.body.collideWorldBounds=true;
  ball.body.bounce.set(1);

  ball.events.onOutOfBounds.add(helpers.death,this);

  scoreText=game.add.text(32,(85*screenSizeHeight)/100,"Score: 0",defaultTextOptions);
  livesText=game.add.text(32,(90*screenSizeHeight)/100,"lives: 3",defaultTextOptions);
  comboText=game.add.text(32,(82*screenSizeHeight)/100,"COMBO",defaultTextOptions);
  comboText.visible=false;
  introText=game.add.text(game.world.centerX,400,"- click to start -",boldTextOptions);
  introText.anchor.setTo(0.5,0.5);
  game.input.onDown.add(helpers.relase,this);

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// phase Creator
function phaserUpdate(){
  paddle.x=game.input.x;

  if(paddle.x<24){
    paddle.x=24;
  }else if (paddle.x>game.width-24) {
    paddle.x=game.width-24;
  }

  if(ballOnPaddle)
  {
    ball.body.x=paddle.x;
  }
  else {
    game.physics.arcade.collide(ball,paddle,helpers.ballCollideWithPaddle,null,this);
    game.physics.arcade.collide(ball,tiles,helpers.ballCollideWithTile,null,this);
  }

  if(comboCheck===true&&combo>1)
  {
    comboText.visible=true;
  }
  else {
    comboText.visible=false;
  }
}

var ball,paddle,tiles,scoreText,livesText,introText,background;

var ballOnPaddle=true;
var lives=3;
var score=0;
var combo=0;
var comboCheck=false;

var defaultTextOptions={font:"20px Arial",align:"left",fill:"#000000"};
var boldTextOptions={font:"40px Arial",fill:"#000000",align:"center"};

var helpers={
  relase:function(){
    if(ballOnPaddle)
    {
      ballOnPaddle=false;
      comboCheck=false;
      combo=0;
      ball.body.velocity.y=-300;
      ball.body.velocity.x=-75;
      introText.visible=false;
    }
  },
  death:function()
  {
    comboCheck=false;
    combo=0;
    lives--;
    livesText.text="lives: "+lives;
    if(lives===0)
    {
      helpers.gameOver();
    }
    else {
      ballOnPaddle=true;
      ball.reset(paddle.body.x+16,paddle.y-16);
    }
  },
  gameOver:function()
  {
    comboCheck=false;
    combo=0;
    ball.body.velocity.set(0,0);
    introText.text="Game Over!";
    introText.visible=true;
  },
  ballCollideWithTile:function(ball,tile){
    tile.kill();
    comboCheck=true;
    combo++;

    if(combo>1)
    {
      score=score+combo*20;
      comboText.text="COMBO: "+combo;
    }
    score=score+10;
    scoreText.text="Score: "+score;
    if(tiles.countLiving()<=0){
      score+=1000;
      scoreText.text="Score: "+score;
      introText.text="- Next Level - ";

      ballOnPaddle=true;
      ball.body.velocity.set(0);
      ball.x=paddle.x+16;
      ball.y=paddle.y-16;

      tiles.callAll("revive");
    }
  },

  ballCollideWithPaddle:function(ball,paddle)
  {
    var diff=0;

    combo=false;
    combo=0;
    if(ball.x<paddle.x)
    {
      diff=paddle.x-ball.x;
      ball.body.velocity.x=(-10*diff);
    }
    else if (ball.x>paddle.x) {
      diff=ball.x-paddle.x;
      ball.body.velocity.x=(10*diff);

    }
    else  {
      ball.body.velocity.x=2+Math.random()*8;
    }
  }

};
