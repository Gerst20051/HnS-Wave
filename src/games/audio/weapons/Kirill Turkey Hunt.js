$(document).ready(turkeyHunt);

 var nameT = "";
 var person;
 function setName()
   {
      nameT = $("#name_box").val();
      myDataRef = new Firebase('https://kirillturkey.firebaseio.com/topscores/'+nameT+"/");
      person = new Person(nameT,0);
      leaderboard.addPerson(person);
      $("#name_box").hide();
      $("#").hide();
      $("#go").hide();
      $("#name_t").text("Go shoot some Kirill: "+nameT+"!").show();


   }
   var myDataRef = null;


    var leaderboard = {
      persons: [],
      refreshScores: function(){
         leaderboard.persons.sort(function(a,b){
            return  b.score -a.score;
         });
         $("#score_list").empty();
         leaderboard.persons.forEach( function(person){
            if($.isNumeric(person.score)&&/^[a-z\d\-_\s]+$/i.test(person.name)){
             $("#score_list").append("<li>"+person.name+": "+person.score+ "</li>");
            }
         });

      },
      addPerson: function(person){
         var safe =  true;
         for(var i = 0; i<leaderboard.persons.length; i++){
            if(leaderboard.persons[i].name===person.name){
               safe = false;
               leaderboard.persons[i].score = person.score;
               break;
            }
         }
         if(safe){
            leaderboard.persons.push(person);
         }
      }

   };
   function Person (name, score){
      this.name = name;
      this.score = score;

   }



function turkeyHunt(){
   console.log("Hello world!");
   var canvas = document.getElementById('canvas');
   var ctx;
   var kirillTurkey = new KirillTurkey();
   var crosshair = new Crosshair();
   canvas.style.cursor = "none";
   var background = new Image();
   background.src = "images/background.png";
   setInterval(mainLoop, 30);
   var gobbleOne = new Audio("images/gobbleOne.wav"); // buffers automatically when created
   var gobbleTwo = new Audio("images/gobbleTwo.wav");
   var gunShot = new Audio("images/gun-gunshot-01.wav");
   var  gunCock = new Audio("images/gun-cocking-01.wav");

   var comboCounter = new ComboCounter();
   var scoreCounter = new ScoreCounter();
   var alertText = null;
   var name = "Test";

   var allRef = new Firebase('https://kirillturkey.firebaseio.com/topscores/');

   var muchPain = null;






   allRef.on('value', function(snapshot) {
     if(snapshot.val() === null) {
     }
     else {
      snapshot.forEach(function(childSnapshot){
                p = new Person(childSnapshot.val().name, childSnapshot.val().score);
                leaderboard.addPerson(p);
      });
      leaderboard.refreshScores();

     }
   });


   function mainLoop(){
      kirillTurkey.move();
      draw();
   }


   if (canvas.getContext){
         ctx = canvas.getContext('2d');

   }

   canvas.addEventListener('click', function(evt) {
      var mousePos = getMousePos(canvas, evt);
      shoot(mousePos);

   }, false);

    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        crosshair.x =  mousePos.x;
        crosshair.y = mousePos.y;
        //crosshair.draw(ctx);

      }, false);

   function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
   }
   var f = null;
   var ready = true;
   var blood=  null;


   function updateLeaderboard(){
      if(myDataRef!==null){
         console.log("Alert2!");

         myDataRef.update({name: nameT, score: scoreCounter.score});
      }
   }


   function shoot(mousePos){
      if(ready){
         ready = false;
         f = new Flare(mousePos.x, mousePos.y);
         gunShot.play();
               setTimeout(function(){
            gunCock.play();
            ready = true;
         }, 500);
         if(kirillTurkey.containsPoint(mousePos)){
               kirillTurkey.makeSound();
               blood = new BloodSplatter(mousePos.x, mousePos.y);
               kirillTurkey.speed++;
               comboCounter.combo++;
               scoreCounter.increaseScore();
               updateLeaderboard();
               if(Math.random()<0.1){
                  muchPain = new MuchPain(Math.random()*150+30);
               }

         }
         else
         {
            comboCounter.combo = 0;
         }
      }
   }


   function draw()
   {
      ctx.drawImage(background, 0,0);
      kirillTurkey.draw(ctx);
      crosshair.draw(ctx);
      if(f!==null){
         f.draw(ctx);
      }
      if(blood!==null){
         blood.draw(ctx);
      }
      if(alertText!==null)
      {
      alertText.draw(ctx);
      }
      if(muchPain!==null)
      {
         muchPain.draw(ctx);
      }
   comboCounter.draw(ctx);
      scoreCounter.draw(ctx);

   }

   function makeMove(){
      move = [];
      move.push(30);
      return 10;
   }




   function KirillTurkey ()
   {
      this.speed = 1;
      this.moves = 0;
      this.width = 230;
      this.height = 225;
      this.x = 0;
      this.y = 200;
      this.headXOffset = 132;
      this.headYOffeset = 0;
      this.body =  new Image();
      this.body.onload = function() { draw();};
      this.body.src = "images/turkey.png";
      this.head = new Image();
      this.head.src = "images/kirill_head.png";
      this.yMove = false;
      this.move = function(){
         if(this.moves<=0){
            this.moves = makeMove();
         }
            this.x += this.speed;
            if(this.speed>40){
               if(this.yMove===false){
                  alertText = new AlertText("Kirill has entered a frantic state!",75);
               }
               this.yMove = true;
               this.speed = 10;
            }
            //this.moves = this.moves - this.moves/5;
            if(this.yMove){
               this.y-=this.speed/(Math.random()*3);
               if(this.y<=-300){
                  this.y = 300;
               }
            }
            if(this.x>500){
               this.x=-100;
            }

      };
      this.makeSound = function(){
        var sound =  2*Math.random();
        if(sound>1){
            setTimeout(function(){gobbleTwo.play();}, 50);
        }
        else{
            gobbleOne.play();
        }
      };

      this.draw =  function(ctx){
         ctx.drawImage(this.body,this.x, this.y);
         ctx.drawImage(this.head, this.x+this.headXOffset,this.y+this.headYOffeset);
         //ctx.fillRect(this.x, this.y, this.width, this.height);
      };
      this.containsPoint =function(mousePos){
            var mX = mousePos.x;
            var mY = mousePos.y;
            if(mX>=this.x&&mY>=this.y&&mX<=this.x+this.width&&mY<=this.y+this.height){
               return true;
            }
            return false;
      };

   }

   function Crosshair(){
      this.x = 0;
      this.y = 0;
      this.width = 35;
      this.height = 35;
      this.image = new Image();
      this.image.src = "images/crosshair.png";

      this.draw = function(ctx){
         ctx.drawImage(this.image, this.x-this.width/2,this.y-this.height/2, this.width, this.height);
      };

   }

   function Flare(x,y){
      this.x =x;
      this.y = y;
      this.image = new Image();
      this.image.src = "images/flare.png";
      this.width = 20;
      this.height= 20;
      this.draw = function(ctx){
         if(this.width===0){
            return;
         }
         ctx.drawImage(this.image, this.x-12,this.y-12,this.width,this.height);
         this.width +=15;
         this.height+=15;
         this.x-=4;
         this.y-=4;
         if(this.width>=75){
            this.width = 0;
         }
         if(this.height>=75){
            this.height = 0;
         }
         //console.log("Drawing "+this.x+" "+this.y);
      };


   }

   function MuchPain(duration){

      this.image = new Image();
      this.image.src = "images/much_pain.png";
      this.width = 100;
      this.height= 100;
      this.count = 0;
      this.duration = duration;

       this.draw = function(ctx){
         if(this.count>this.duration){
            return;
         }

         ctx.drawImage(this.image, kirillTurkey.x+150, kirillTurkey.y-60,this.width,this.height);
         this.count++;

      };
   }


   function BloodSplatter(x,y){
      this.x =x;
      this.y = y;
      this.image = new Image();
      this.image.src = "images/ink_splatter.png";
      this.width = 50;
      this.height= 50;
      this.alpha = 255;
       this.draw = function(ctx){
         if(this.alpha<=0){
            return;
         }
         ctx.save();
         ctx.globalAlpha = this.alpha/255;


         ctx.drawImage(this.image, this.x-12,this.y-12,this.width,this.height);
         this.alpha-=5;
         ctx.restore();

      };
   }

   function ComboCounter(){
      this.x = 500;
      this.y = 50;
      this.combo = 1;
      this.draw = function(ctx){
         ctx.font="20px Georgia";
         ctx.fillText("Combo: "+this.combo,this.x, this.y);
      };
   }
   function ScoreCounter(){
      this.x = 20;
      this.y = 50;
      this.score = 0;
      this.draw = function(ctx){
         ctx.font="24px Georgia";
         ctx.fillText("Score: "+this.score,this.x, this.y);
      };
      this.increaseScore = function(){
         this.score+= comboCounter.combo*5;
      };
   }
   function AlertText(text, duration){
      this.text = text;
      this.count =  0;
      this.duration = duration;
      this.draw = function(ctx){
         if(this.count>duration){
            return;
         }
         ctx.font="36px Georgia";
         ctx.fillText(this.text, 50, 150);
         this.count ++;
      };

   }


}
