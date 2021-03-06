var comandos = {
	gerais: {
		MORTE: 20,
		ESQUERDA: -5,
		DIREITA: +5, 
		COSTAS: -5,
		CIMA: +5
	},
	ataques : {
		lanca: {
			COSTAS: 4, ESQUERDA: 5, FRENTE: 6, DIREITA: 7
		},
		arco: {
			COSTAS: 16, ESQUERDA: 17, FRENTE: 18, DIREITA: 19
		}
	},
	movimentos: {
		COSTAS: 8, ESQUERDA: 9, FRENTE: 10, DIREITA: 11
	}
};

function Player(context, imagem) {
	this.direcao = comandos.ataques.arco.FRENTE;
	this.spritesheet = new Spritesheet(context, imagem, 21, 13, 13);
	this.spritesheet.linha = this.direcao;
	this.velocidadeNormal = 70;
	this.spritesheet.intervalo = this.velocidadeNormal;
	this.position = {x: context.canvas.width/2 - this.spritesheet.tamanho.largura/2 , y: context.canvas.height/2 - this.spritesheet.tamanho.altura/2 };
	this.atirando = false;
	this.context = context;
	this.hp = 100;
	this.vidas = 2;
	this.mana = 100;
	this.mobile = mobilecheck();
};

Player.prototype = {
	desenhar: function () {
		this.spritesheet.linha = this.direcao;
		this.spritesheet.desenhar(this.position.x, this.position.y);
		this.hud();
	},
	hud: function () {
		this.context.save();
		this.context.shadowOff();
		this.context.fillStyle = "rgba(200, 15, 15, 0.9)";
		this.context.fillRect(this.context.canvas.width/9, this.context.canvas.height/13,  (this.hp/100) * this.context.canvas.width/3 , 25);
		this.context.strokeRect(this.context.canvas.width/9, this.context.canvas.height/13,  this.context.canvas.width/3 , 25);

		this.context.fillStyle = "rgba(15, 15, 200, 0.7)";
		this.context.fillRect(this.context.canvas.width/9, this.context.canvas.height/13 + 25,  (this.mana/100) * this.context.canvas.width/3 , 25);
		this.context.strokeRect(this.context.canvas.width/9, this.context.canvas.height/13 + 25,  this.context.canvas.width/3 , 25);

		this.context.drawImage(this.context.assets.imagens.hud, 30, 20, this.context.assets.imagens.hud.width/2, this.context.assets.imagens.hud.height/2);

		this.context.fillStyle = "gold";
		this.context.font ='50px PiecesOfEight';
		this.context.fillText("x" + this.vidas, this.context.assets.imagens.hud.width/2 - 30, this.context.assets.imagens.hud.height/2 + 20);
		this.context.strokeText("x" + this.vidas, this.context.assets.imagens.hud.width/2 - 30, this.context.assets.imagens.hud.height/2 + 20);

		if ( 50 > this.mana) {
			this.context.globalAlpha=.5;
		}
		this.context.drawImage(this.context.assets.imagens.heal, this.context.canvas.width/9, this.context.canvas.height/6, this.context.assets.imagens.heal.height/1.3, this.context.assets.imagens.heal.height/1.3);
		this.context.globalAlpha=1;

		if (this.hastePower || 60 > this.mana ) {
			this.context.globalAlpha=.5;
		}
		this.context.drawImage(this.context.assets.imagens.haste, this.context.canvas.width/9 + (this.context.assets.imagens.heal.width/1.3) * 1.1 , this.context.canvas.height/6, this.context.assets.imagens.haste.height/1.3, this.context.assets.imagens.haste.height/1.3);
		this.context.globalAlpha=1;

		if (true || 70 > this.mana ) {
			this.context.globalAlpha=.5;
		}
		this.context.drawImage(this.context.assets.imagens.fireball, this.context.canvas.width/9 + (this.context.assets.imagens.heal.width/1.3) * 2.175, this.context.canvas.height/6, this.context.assets.imagens.fireball.height/1.3, this.context.assets.imagens.fireball.height/1.3);
		this.context.globalAlpha=1;

		this.context.restore();
	},

	atualizar: function () {
		if (this.atirando || this.mobile) {
			this.spritesheet.proximoQuadro();
			this.spritesheet.fimDoCiclo = function() {
				this.atirando = false;
			}.bind(this);				

			this.spritesheet.acaoIntermediaria(8, function () {
				var position = {x: this.position.x + this.spritesheet.tamanho.largura/2, y: this.position.y + this.spritesheet.tamanho.altura/1.9 - 5};
				var velocidade = 0, eixo = 'y', imagem;
				switch(this.direcao) {
					case comandos.ataques.arco.ESQUERDA:
						velocidade = comandos.gerais.ESQUERDA;
						eixo = 'x';
						imagem = this.context.assets.imagens.flechasEsquerda;
						break;
					case comandos.ataques.arco.DIREITA:
						velocidade = comandos.gerais.DIREITA;
						eixo = 'x';
						imagem = this.context.assets.imagens.flechasDireita;
						break;
					case comandos.ataques.arco.COSTAS:
						velocidade = comandos.gerais.COSTAS;
						eixo = 'y';
						imagem = this.context.assets.imagens.flechasCima;
						break;
					case comandos.ataques.arco.FRENTE:
						velocidade = comandos.gerais.CIMA;
						imagem = this.context.assets.imagens.flechasBaixo;
						eixo = 'y';
						break;

				}
				var f = new Flecha(this.context, imagem, position, velocidade, eixo);
				this.context.assets.sons.atirar.currentTime = 0.0;
				this.context.assets.sons.atirar.play();
				this.context.assets.sprites.push(f);
				this.context.colisor.sprites.push(f);
			}.bind(this));
		}
		if (0 >= this.hp) {
			this.hp = 0;
			this.morreu();
		}

		if (100 > this.mana) this.mana += .02;
		if (this.potion) { 
			if (100 > this.hp) this.hp += 1;
			this.potion--;
		}
		if ( this.hastePower) {
			if (+new Date() > this.hastePower) this.hastePower = undefined;
		} else {
			this.spritesheet.intervalo = this.velocidadeNormal;
		}
	},

	atirar: function () {
		if (! this.atirando) this.atirando = true;
	},
	retangulosColisao: function() {
      var rets = 
      [ 
        {x: this.position.x + this.spritesheet.tamanho.largura/4, y: this.position.y, largura: this.spritesheet.tamanho.largura/2, altura: this.spritesheet.tamanho.altura }
      ];
      
      if ( this.context.colisor.desenharQuadrados ) {
	      
	      for (var i in rets) {
			this.context.save();
			this.context.shadowBlur = 0;
			this.context.shadowOffsetX = 0;
			this.context.shadowOffsetY = 0;
			this.context.strokeStyle = 'yellow';
			this.context.strokeRect(rets[i].x, rets[i].y, rets[i].largura, 
			        rets[i].altura);
			this.context.restore();
	      }    
	  }
      return rets;
  	},

  	colidiuCom: function(outro) {
   	},

   	haste: function () {
   		if ( this.mana >= 60) {
   			this.hastePower = +new Date() + 10000;
   			this.context.assets.sprites.push(new Magic(this.context, this.context.assets.imagens.hasteMagic, {linhas: 6, colunas: 5} , this.context.assets.sons.hasteMagic, this.position, 120));
	   		this.spritesheet.intervalo = this.spritesheet.intervalo/2;
	   		this.mana -= 60;
   		}
   	},

   	heal: function () {
   		if (this.mana >= 50) {
   			this.context.assets.sprites.push(new Magic(this.context, this.context.assets.imagens.healMagic, {linhas: 4, colunas: 5} , this.context.assets.sons.healMagic, this.position));
			this.potion = 50;
	   		this.mana -= 50;
		}
	},

	morreu: function () {
		if (this.vidas > 0) {
			this.context.assets.sprites.map(function (f) {
				if(f instanceof Enemy) {
					f.morrer();
				}
			});
			this.hp = 100;
			this.mana = 100;
			this.vidas -- ;
		} else {
			this.context.gameOver = true;
		}
   	}

};
