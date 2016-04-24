"use strict";
/*
 
*/
 
 
 
//---BasisSystem--
 
function bootfahren(){
	
	
	//--audio--
	//http://keithwhor.github.io/audiosynth/
	//https://github.com/keithwhor/audiosynth
	/*Synth instanceof AudioSynth; // true
	var testInstance = new AudioSynth;
	testInstance instanceof AudioSynth; // true
	testInstance === Synth; // true
	var piano = Synth.createInstrument('organ');
	//Synth.setSampleRate(4000);
	Synth.setVolume(0.1);
	console.log(Synth.getSampleRate());
		piano.play('C', 4, 1);// plays C4 for 1s using the 'piano' sound profile
		piano.play('E', 4, 1);// plays C4 for 1s using the 'piano' sound profile
		piano.play('A', 4, 1);// plays C4 for 1s using the 'piano' sound profile
		piano.play('F', 4, 1);// plays C4 for 1s using the 'piano' sound profile
	*/
	//---Helper---
	var cE=function(ziel,sElement,id){
			var newElement=document.createElement(sElement);
			if(id!="" && id!=undefined)newElement.id=id;
			ziel.appendChild(newElement);
			return newElement;
		}
	var gE=function(id){if(id=="")return undefined; else return document.getElementById(id);}
	var cA=function(ziel,f_onclick,stext,id){
		var a=cE(ziel,"a");
		a.href="#";		
		if(f_onclick) a.onclick=f_onclick;			
		if(stext) a.innerHTML=stext;			
		if(id) a.id=id;			
		return a;
	}
 
	//Koordinaten als Array [x,y]
	var streckenlaenge2D=function(p1,p2) {
		return Math.sqrt( Math.pow(p2[1]-p1[1],2)+Math.pow(p2[0]-p1[0],2));
	}
	var PunktaufGerade=function(p1,p2,pos){//%
		var re=[0,0];
		re[0]=(p2[0]-p1[0])*pos/100+p1[0];
		re[1]=(p2[1]-p1[1])*pos/100+p1[1];
		return re;
	}	
	var verschiebeP1nach=function(p1,p2, stepp){ 
		 var re=[p1[0],p1[1]];	
		 var ax=p2[0]-p1[0];//weg X
		 var ay=p2[1]-p1[1];//weg Y
		 var p1p2=streckenlaenge2D(p1,p2);
		 if(p1p2!=0){
			 re[0]=ax/p1p2*stepp+p1[0];
			 re[1]=ay/p1p2*stepp+p1[1];
		 }
		 return re;	
	} 
	var ArrayMischen=function(array){
		var t,temp,z;
		for(t=0;t<array.length;t++){
			z=Math.floor(Math.random()*array.length);
			temp=array[t];
			array[t]=array[z];
			array[z]=temp;
		}
	}
	var getPos=function(re,htmlNode){
		while(htmlNode!=undefined){
			if(htmlNode.offsetLeft!=undefined){
					re.x-=htmlNode.offsetLeft;
					re.y-=htmlNode.offsetTop;
					}
			htmlNode=htmlNode.parentNode;
		}
		return re;
	}	
	var drehePunkt=function(p, dreheumPunkt, Winkel){//Winkel in Grad
		 var r=Winkel*Math.PI/180;//Winkel in Bogenmaß
		 var re=[0,0];
		 var flength = Math.sqrt( Math.pow(dreheumPunkt[1]-p[1],2)+Math.pow(dreheumPunkt[0]-p[0],2));
		 var angle = r+Math.atan2(p[1]-dreheumPunkt[1],p[0]-dreheumPunkt[0]);
		 while(angle<0){angle = angle+2*Math.PI;}
		 while(angle>2*Math.PI){angle = angle-2*Math.PI;}
		 re[0]= dreheumPunkt[0]+Math.cos(angle)*flength;
		 re[1]= dreheumPunkt[1]+Math.sin(angle)*flength;
		return re;
	}
 
 
	//---------------------
	var anistat={	
		canvas:undefined,
		cc:undefined,
		cansize:{width:0,height:0},
		lasttime:0,
		Mediapos:0	//sec
	};
	var sprites=[];//ball etc.
 
	var const_2pi360=2*Math.PI/360;
	var const_2pi=2*Math.PI;
 
	var texturen=[];
	//---------------------
 
	this.ini=function(ziel_canvas){
		anistat.canvas=gE(ziel_canvas);
		if(anistat.canvas==undefined)return;
 
 
		anistat.cansize.width=anistat.canvas.width;
		anistat.cansize.height=anistat.canvas.height;
		anistat.cc=anistat.canvas.getContext('2d');
 
		document.addEventListener("keydown", keyDownListener);
		document.addEventListener("keyup", keyUpListener);
		
 /*
		anistat.canvas.onclick=function(e){
				var mausObj={
					x:(document.all ? e.clientX : e.pageX),
					y:(document.all ? e.clientY : e.pageY)
				}
				mausObj=getPos(mausObj,this);				
				createBall(mausObj,27);
		};	*/
 
		var textur1={src:"jj_sprite.png",id:"textur1",ready:false,stat:"-",img:undefined,color:"#c64a56"};
		texturen.push(textur1);
		
 
		loadTexturen();//async
		
		sp=new sprite();
		sp.ini("wasser",0,0,anistat.canvas.width,anistat.canvas.height);
		sp.data={c1:0,c2:0,stepp:16,
				color1:{"str":"#396055",r:0x39,g:0x60,b:0x55},
				color2:{"str":"#5b797b",r:0x5b,g:0x79,b:0x7b},
				cstepp:0,
				csteppmax:100,
				kacheln:[]
				};
				
		for(var i=0;i<21;i++){
			sp.data.kacheln.push({rx:Math.random()*16,ry:Math.random()*16,c:Math.random()});
		}	
		sp.draw=drawWasser;
		sprites.push(sp);
 
 
 
 /*
		var sp=new sprite();
		sp.ini("bootschatten",100,100,160,120,textur1,{x:160,y:0,width:160,height:120});
		sp.data={spritesMin:0,spritesMax:36,spritesPos:0,spritesCounter:0,spritesCounterMax:5,rotate:0,speed:0};		
		sp.calcData=bootCalcData;
		sp.translate=bootTranslate1;
		sprites.push(sp);
		
		sp=new sprite();
		sp.ini("boot",100,100,160,120,textur1,{x:0,y:0,width:160,height:120});
		sp.data={spritesMin:0,spritesMax:36,spritesPos:0,spritesCounter:0,spritesCounterMax:5,rotate:0,speed:0};		
		sp.calcData=bootCalcData;
		sp.translate=bootTranslate1;
		sprites.push(sp);
 */
 
		var em=new emitter();
		em.id="emitterBugwelle";
		em.Lebensdauer=30;
		em.createPartikel=bootEmiterCreatePartikelBugwelle;
		em.translate=bootEmitterTranslateBugwelle;
		em.drawPartikel=bootEmiterPartikelDrawBugwelle;
		sprites.push(em);
		
		var em=new emitter();
		em.id="emitterMotor";
		em.Lebensdauer=30;
		em.createPartikel=bootEmiterCreatePartikelMotor;
		em.translate=bootEmitterTranslateMotor;
		em.drawPartikel=bootEmiterPartikelDrawMotor;
		sprites.push(em);
		
		
		var sp=new sprite();
		sp.ini("bootschatten",250,100,160,120,textur1,{x:160,y:0,width:160,height:120});
		sp.data={spritesMin:0,spritesMax:36,spritesPos:0,spritesCounter:0,spritesCounterMax:5,rotate:0,speed:0,wellencounter:0,wcmax:200};		
		sp.calcData=bootCalcData;
		sp.translate=bootSchattenTranslate;
		sprites.push(sp);
		
		sp=new sprite();
		sp.ini("boot",250,100,160,120,textur1,{x:0,y:0,width:160,height:120});
		sp.data={spritesMin:0,spritesMax:36,spritesPos:0,spritesCounter:0,spritesCounterMax:5,rotate:0,speed:0,wellencounter:0,wcmax:200};		
		sp.calcData=bootCalcData;
		sp.translate=bootTranslate;
		sprites.push(sp);
		
		
		
		start_Animator();
	}
 
	var loadTexturen=function(){
		var i,o;
		for(i=0;i<texturen.length;i++){
			o=texturen[i];
			if(o.img==undefined){//kein Bild?
				o.img=document.createElement("img");//eines erzeugen
				if(o.src!=""){//wenn src angegeben, laden
					o.img.obj=o;
					o.img.onload=texturReady;
					o.stat="load";
					o.img.src=o.src;
					return;//hier break, weiter nachdem das Bild geladen ist
				}
				else{//ansonsten weitermachen
					//nur Farbe
					o.stat="color";
					o.ready=true;
				}
			}
		}	
	}
	var texturReady=function(e){
		this.obj.ready=true;
		this.obj.stat="ready";
		loadTexturen();
	}
 
 
	var getPos=function(re,o){
		while(o!=undefined){
			if(o.offsetLeft!=undefined){
					re.x-=o.offsetLeft;
					re.y-=o.offsetTop;
					}
			o=o.parentNode;
		}
		return re;
	}	
 
	var sprite=function(){
		this.type="sprite";
		this.id="";
		this.x=0;
		this.y=0;
		this.width=0;
		this.height=0;
		this.rotate=0;
		this.textur=undefined;
		this.imgrec={x:0,y:0,width:0,height:0}
		this.canvas_contex=undefined;
		
		this.ini=function(id,px,py,spwidth,spheight,texturObj,imRECT){
			this.id=id;
			this.x=px;
			this.y=py;
			if(spwidth)this.width=spwidth;
			if(spheight)this.height=spheight;
			if(texturObj)this.textur=texturObj;
			if(imRECT)this.imgrec=imRECT;
		}
		
		this.translate=function(){};//overwritable!
		this.calcData=undefined;//overwritable!
		
		this.draw=function(canvas_contex){
			this.canvas_contex=canvas_contex;
			if(this.textur){
				if(this.textur.ready){
					//draw
					canvas_contex.save();
					canvas_contex.translate(this.x, this.y);
					this.translate();
					canvas_contex.drawImage(
						this.textur.img,
						this.imgrec.x, this.imgrec.y, 
						this.imgrec.width, this.imgrec.height,
						0, 0, 
						this.width, this.height);
					canvas_contex.restore();	
				}
			}
			//canvas_contex
		}
	}
	var getSprite=function(id){
		var i;
		for(i=0;i<sprites.length;i++){
			if(sprites[i].id==id)return sprites[i]
		}
		return undefined;
	}
	
	var partikel=function(lebensdauer,xpos,ypos,odata){
		this.id="";
		this.x=xpos;
		this.y=ypos;
		this.lifespan=lebensdauer;
		this.lifecontdown=lebensdauer;
		this.data=odata
		this.live=function(){
			if(this.lifecontdown>0)this.lifecontdown--;
		}
		this.draw=function(cc){}
	}
	var emitter=function(){
		this.type="emitter";
		this.id="";
		this.x=0;//Geburtsposition von neuen Partiekel
		this.y=0;
		
		this.List_partikel=[];
		/*this.geburtsrate=1; //pro Frames (60fps)
		this.start=0; 
		this.stop=0; */
		this.Lebensdauer=10;
		//Lebensdauer,geschwindigkeit (rotation,endgröße)
		
		this.translate=function(){};//overwritable!
		this.calcData=undefined;//overwritable!
		
		this.ini=function(){}
		
		this.drawPartikel=function(){}	//userfunc
		this.createPartikel=function(){}//userfunc
		
		this.draw=function(canvas_contex){			
			this.translate();
			var p,i;
			
			this.createPartikel();			
			
			//Partikel altern lassen & wenn Leben vorbei löschen
			var liste=[];
			for(i=0;i<this.List_partikel.length;i++){
				p=this.List_partikel[i];
				p.live();	
				p.draw(canvas_contex);	
				if(p.lifecontdown>0)liste.push(p);
			}
			this.List_partikel=liste;
		}		
	}
	
	//----userscripte
	var bootCalcData=function(){//boot+schatten
		var richtung,nx,ny,ro;
		var o=this,data=this.data;
		
		data.spritesCounter++;
		if(data.spritesCounter==data.spritesCounterMax){
			data.spritesCounter=0;	
			ro=0;
			if(data.speed<0)ro=2;
			if(data.speed>0)ro=data.speed*2;
			
			if(keyData.isRight)data.rotate+=ro;
			else
			if(keyData.isLeft)data.rotate-=ro;
		
			if(data.rotate<0)data.rotate+=360;
			
			if(data.rotate>=360)data.rotate=0;
			if(data.rotate<0)data.rotate=360-data.rotate;						
			data.spritesPos=(0|data.rotate/(360/data.spritesMax));//0...35
			o.rotate=data.rotate-data.spritesPos*10;						
			o.imgrec.y=data.spritesPos*120;
		}
		
		
		if(keyData.isTop)data.speed+=0.1;
		else
		if(keyData.isDown)data.speed-=0.1;
		
		if(data.speed>3)data.speed=3;
		if(data.speed<-1)data.speed=-1;
	
		if(!keyData.isTop && data.speed>0)data.speed-=0.05;
		if(!keyData.isDown && data.speed<0)data.speed+=0.05;
		//if(data.speed<0.05 && data.speed>-0.05)data.speed=0;
		
		richtung=-data.spritesPos;//0..36
		nx= (data.speed)*Math.sin(2*Math.PI*richtung/36);
		ny=-(data.speed)*Math.cos(2*Math.PI*richtung/36);

		o.x+=nx;
		o.y+=ny;
		if(o.x<-o.width) o.x=anistat.cansize.width;
		if(o.y<-o.height)o.y=anistat.cansize.height;
		if(o.x>anistat.cansize.width)o.x=-o.width;
		if(o.y>anistat.cansize.height)o.y=-o.height;			
	}
	var bootTranslate1=function(){//Rotation
		var cc=this.canvas_contex
		var r=-this.rotate*1;	
		cc.translate(this.width*0.5,this.height*0.5);
		cc.rotate(r*Math.PI/180);
		cc.translate(-this.width*0.5,-this.height*0.5);
	}
	var bootSchattenTranslate=function(){//Rotation mit Skew
		var cc=this.canvas_contex;
		var r=-this.rotate*1.5;//1.5		
		//cc.fillStyle="rgba(255,0,0,0.2)";
		//cc.fillRect(0,0,this.width,this.height);		
		cc.translate(this.width*0.5,this.height*0.5);
		cc.transform(1,this.rotate*0.015,0,1,0,0);
		//cc.transform(1,0,-this.rotate*0.01,1,0,0);
		cc.rotate(r*Math.PI/180);
		cc.translate(-this.width*0.5,-this.height*0.5);
		
		this.data.wellencounter++;
		if(this.data.wellencounter==this.data.wcmax)this.data.wellencounter=this.data.wcmax;
		
		cc.translate(1-1*Math.sin(const_2pi*this.data.wellencounter/this.data.wcmax),0);
		
		//cc.fillRect(0,0,this.width,this.height);
	}
	var bootTranslate=function(){//Rotation mit Skew
		var cc=this.canvas_contex;
		var r=-this.rotate*1.5;//1.5		
		//cc.fillStyle="rgba(255,0,0,0.2)";
		//cc.fillRect(0,0,this.width,this.height);		
		cc.translate(this.width*0.5,this.height*0.5);
		cc.transform(1,this.rotate*0.015,0,1,0,0);
		//cc.transform(1,0,-this.rotate*0.01,1,0,0);
		cc.rotate(r*Math.PI/180);
		cc.translate(-this.width*0.5,-this.height*0.5);
		
		this.data.wellencounter++;
		if(this.data.wellencounter==this.data.wcmax)this.data.wellencounter=this.data.wcmax;
		
		cc.translate(0,1+1*Math.sin(const_2pi*this.data.wellencounter/this.data.wcmax));
		
		//cc.fillRect(0,0,this.width,this.height);
	}
	
	var bootEmiterCreatePartikelMotor=function(){
		//this=emitter
		var i,p;
		//generate Partiekel
		var boot=getSprite("bootschatten");
		if(Math.abs(boot.data.speed)>0.1 ){
			p=new partikel(this.Lebensdauer,this.x,this.y,{speed:boot.data.speed});	//neuer Partikel, an Emitterposition		
			p.id="partikel";
			p.draw=this.drawPartikel;
			this.List_partikel.push(p);	
		}		
	}
	var bootEmitterTranslateMotor=function(){
		var nx,ny;
		var boot=getSprite("bootschatten");
		var xx=boot.x;
		var yy=boot.y;
		//->versetzen an Position vom Motor
		//boot.data.rotate
		
		nx= (50)*Math.sin(2*Math.PI*boot.data.rotate/360);
		ny= (40)*Math.cos(2*Math.PI*boot.data.rotate/360);

		this.x=xx+boot.width*0.5+nx;
		this.y=yy+boot.height*0.5+ny;		
	}
	var bootEmiterPartikelDrawMotor=function(canvas_contex){
		//this=Emiter
		
		canvas_contex.save();
		canvas_contex.translate(this.x, this.y);
		//draw..
		var boot=getSprite("bootschatten");
		var speed=boot.data.speed;
		if(speed<0)speed*=-1;
		if(speed>1)speed=1;
		
		
		canvas_contex.fillStyle="rgba(255,255,255,"+(0.1/this.lifespan*this.lifecontdown)*speed+")"; // 1/this.lifespan*this.lifecontdown
		canvas_contex.scale(1.25,1);
		canvas_contex.beginPath();
		canvas_contex.arc(0,0,  2+(this.lifespan-this.lifecontdown)*1  , 0,const_2pi);
		canvas_contex.fill();		
		
		//console.log(this);
		canvas_contex.restore();		
	}
	
	
	var bootEmiterCreatePartikelBugwelle=function(){
		//this=emitter
		var i,p;
		//generate Partiekel
		var boot=getSprite("bootschatten");
		if((boot.data.speed)>1 ){
			p=new partikel(this.Lebensdauer,this.x,this.y,{speed:boot.data.speed});	//neuer Partikel, an Emitterposition		
			p.id="partikel";
			p.draw=this.drawPartikel;
			this.List_partikel.push(p);	
		}		
	}
	var bootEmitterTranslateBugwelle=function(){
		//this=emitter
		var nx,ny;
		var boot=getSprite("bootschatten");
		var xx=boot.x;
		var yy=boot.y;
		//->versetzen an Position vom Bug
		var speed=boot.data.speed;
		if(speed<0)speed*=-1;	
		if(speed>1)speed=1;		
		nx=(-40*(speed))*Math.sin(2*Math.PI*boot.data.rotate/360);
		ny=(-15*(speed))*Math.cos(2*Math.PI*boot.data.rotate/360);
		this.x=xx+boot.width*0.5+nx;
		this.y=yy+boot.height*0.5+ny;		
	}
	var bootEmiterPartikelDrawBugwelle=function(canvas_contex){
		//this=Partikel
		
		canvas_contex.save();
		canvas_contex.translate(this.x, this.y);
		//draw..
		var speed=this.data.speed;//console.log(speed);
		//if(speed==0)this.live();
		
		if(speed<0)speed*=-1;	
		if(speed>1)speed=1;
		
		var wasser=getSprite("wasser");
		var color={r:29,g:74,b:61};
		if(wasser)color={r:Math.max(wasser.data.color1.r-24,0),
						 g:Math.max(wasser.data.color1.g-24,0),
						 b:Math.max(wasser.data.color1.b-24,0)};
		
		
		canvas_contex.fillStyle="rgba("+color.r+","+color.g+","+color.b+","+(0.1/this.lifespan*this.lifecontdown)+")"; 
							// *speed1/this.lifespan*this.lifecontdown
		canvas_contex.scale(1.25,1);
		canvas_contex.beginPath();
		canvas_contex.arc(0,0,  10+(this.lifespan-this.lifecontdown)*2  , 0,const_2pi);
		canvas_contex.fill();		
		canvas_contex.restore();		
	}
	
	var drawWasser=function(cc){
		var i,sc,v,v2,r,g,b,nx,ny,
			o=this,
			data=this.data;
 
		cc.save();
		//basics
		cc.fillStyle=o.data.color1.str;
		cc.fillRect(o.x, o.y, o.width, o.height);					
		//wellen
		
		
		cc.lineJoin = 'miter';	//round
		
		data.cstepp++;
		if(data.cstepp>data.csteppmax){//couter@60fps
			data.cstepp=0;
			stoppoutp=true;
			}
		
				//console.log(r,g,b)
		var kachelobj,knr=0;
		var knrmax=data.kacheln.length-1;
		var rx,ry;
		
		for(o.c1=0;o.c1<o.width; o.c1+=data.stepp)//16px breite Kacheln
		for(o.c2=0;o.c2<o.height+data.stepp;o.c2+=data.stepp){//16px hohe Kacheln
			kachelobj=data.kacheln[knr];
			rx=kachelobj.rx;
			ry=kachelobj.ry;
			knr++;
			if(knr>knrmax)knr=0;
			
			sc=3.14159*(data.cstepp+o.c1*1+o.c2*1+kachelobj.c*100)/data.csteppmax;
			//sc=3.14159*(o.data.cstepp)/o.data.csteppmax;
			v=(0.5-0.5*Math.cos(2*sc))*0.5;
			//v2=(0.5-0.5*Math.cos(1*sc))*0.5;
			
			//if(o.c1==0 && o.c2==0 &&!stoppoutp)console.log(v);
			
			v=0.5-0.5*Math.cos(2*sc);
			nx=o.x+rx+o.c1+v;
			ny=o.y+ry+o.c2;
			
			r=data.color1.r +(data.color2.r-data.color1.r)*v;
			g=data.color1.g +(data.color2.g-data.color1.g)*v;
			b=data.color1.b +(data.color2.b-data.color1.b)*v;
			
			//cc.strokeStyle="rgba("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+",0.5)";			
			cc.strokeStyle="rgb("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")";			
			
			cc.lineWidth = 2;
			cc.beginPath();
			cc.moveTo(nx,ny);
			cc.lineTo(nx+data.stepp*0.25,ny-v);							
			cc.lineTo(nx+data.stepp*0.5 ,ny);							
			cc.stroke();
			/*
			cc.strokeStyle="rgb("+Math.round(r)+","+Math.round(g)+","+Math.round(b)+")";			
			
			cc.lineWidth = 1;
			cc.beginPath();
			cc.moveTo(nx,ny);
			cc.lineTo(nx+data.stepp*0.25,ny-v);							
			cc.lineTo(nx+data.stepp*0.5 ,ny);							
			cc.stroke();*/
			
		}
		
		cc.restore();	
	}
	
	//----Tastatur----
	var keypressed=-1;
	var keyData={
		isLeft:false,
		isRight:false,
		isTop:false,
		isDown:false
	};
	var keyDownListener=function(e){
		var ev = window.event ? window.event : e;
		//console.log("#",event.keyCode)
		keypressed=ev.keyCode;
		if(keypressed==37 || keypressed==65)keyData.isRight=true;
		if(keypressed==39 || keypressed==68)keyData.isLeft=true;
		if(keypressed==38 || keypressed==87)keyData.isTop=true;
		if(keypressed==40 || keypressed==83)keyData.isDown=true;
	}
	var keyUpListener=function(e){
		var ev = window.event ? window.event : e;
		var evKey=ev.keyCode;
		keypressed=-1;
		if(evKey==37 || evKey==65)keyData.isRight=false;
		if(evKey==39 || evKey==68)keyData.isLeft=false;
		if(evKey==38 || evKey==87)keyData.isTop=false;
		if(evKey==40 || evKey==83)keyData.isDown=false;
	}
 
	//----animator----
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame|| window.webkitcancelAnimationFrame || window.mscancelAnimationFrame;
	var interVal=undefined;
	var start_Animator=function(){
	  anistat.lasttime=(new Date()).getTime();
	  if(requestAnimationFrame){			
			//if(window.performance && window.performance.now) animationStartTime = window.performance.now();
			interVal = requestAnimationFrame(mainRenderAF);
		}
		else{
			interVal=window.setInterval(mainRender, 1000/60);//60fps
			}
	}
	var stop_Animator=function(){
		if(interVal==undefined)return;
		if(requestAnimationFrame){			
			 cancelAnimationFrame(interVal);
		}
		else{
			window.clearInterval(interVal);//60fps
		}	
		interVal=undefined;
	}
	var mainRenderAF=function(){
		mainRender();
		if(interVal!=undefined)
			interVal = requestAnimationFrame(mainRenderAF);
	}
 
	
 
	var renderstat=[];
	var renderstatpos=0;
	for(var i=0;i<300;i++){renderstat.push({fps:0});};
	var stoppoutp=false; 
	
	var mainRender=function(){
		var jetzt=(new Date()).getTime();
		var diff=jetzt-anistat.lasttime;
		anistat.Mediapos+=((diff)/1000);//sec
 
		var info;
		var r,g,b,v;
		var richtung,nx,ny,sc;

		var i,o,cc=anistat.cc;
 
		//getKeyObj
 
		if(anistat.cc!=undefined){
			//anistat.canvas.style.display="none";
			//clear
			cc.fillStyle="rgba(0,0,0,0)";
			cc.clearRect(0, 0,anistat.cansize.width, anistat.cansize.height);
 
			for(i=0;i<sprites.length;i++){
				o=sprites[i];				
				if(o.calcData!=undefined)o.calcData();
				o.draw(cc);
			}
			
			//Debuginfo
 			cc.fillStyle="#000000";
			cc.font="18px Arial";
			cc.fillText("Anzahl:"+sprites.length+" d:"+diff+"ms "+Math.round(1000/diff)+"fps ",2,20);		
/*
			renderstat[renderstatpos]={fps:(1000/diff)};
			renderstatpos++;
			if(renderstatpos==renderstat.length)renderstatpos=0;
			cc.strokeStyle="#FF6666";
			cc.beginPath();
			cc.moveTo(0,anistat.cansize.height/120*60);
			cc.lineTo(anistat.cansize.width,anistat.cansize.height/120*60);
			cc.stroke();
 
			cc.strokeStyle="#FF0000";
			cc.beginPath();
			for(i=0;i<renderstat.length;i++){
				o=renderstat[i];
				if(i==0)
					cc.moveTo(anistat.cansize.width/renderstat.length*i,anistat.cansize.height/120*(120-o.fps));
				else
					cc.lineTo(anistat.cansize.width/renderstat.length*i,anistat.cansize.height/120*(120-o.fps));
			}
			cc.stroke();*/
 
			//anistat.canvas.style.display="block";
		}	
 
 
 
		anistat.lasttime=jetzt;
	}
 
 
}