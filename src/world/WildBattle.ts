import { canvas2d } from '../graphics/Canvas';
import Player from '../player/Player';
import { ExperienceCurve } from '../util/ExperienceCurve';
import World from './World';

export default class WildBattle {
	// Initial values set on the constructor
	private world: World;
	private player: Player;
	private wildPokemon: SocketPokemon;

	// Battle assets
	public battleEncounterFrames: {
		frame: number;
		image: HTMLImageElement;
	}[] = [];

	public pokemonSpawnFrames: {
		frame: number;
		image: HTMLImageElement;
	}[] = [];

	public pokeballFrames: {
		frame: number;
		image: HTMLImageElement;
	}[] = [];

	public currentEncounterFrame: number = 0;
	public encounterFrameCounter: number = 0;
	public currentBattleIntroFrame: number = 0;
	public battleIntroFrameCounter: number = 0;
	public pokemonCounterCounter: number = 0;
	public enemySentOutCounter: number = 0;
	public playerSentOutCounter: number = 0;

	public battleBackgroundImage: HTMLImageElement | null = null;
	private playerPokemonSprites: HTMLImageElement[] = [];
	private wildPokemonSprite: HTMLImageElement | null = null;
	private statsMeterEnemyImage: HTMLImageElement | null = null;
	private statsMeterPlayerImage: HTMLImageElement | null = null;
	private battleOptionsImage: HTMLImageElement | null = null;
	private hpGaugeImage: HTMLImageElement | null = null;
	public trainerBackImage: HTMLImageElement | null = null;
	public counterPokeBallImage: HTMLImageElement | null = null;
	public pokemonCounterImage: HTMLImageElement | null = null;
	public pokeBallImage: HTMLImageElement | null = null;
	private pokeballBottomHalfImage: HTMLImageElement | null = null;
	private pokeballTopHalfImage: HTMLImageElement | null = null;

	private playerCurrentPokemonIndex: number = 0;

	private isMouseOverFight: boolean = false;
	private activeOption: 'fight' | 'pkmn' | 'pack' | null = null;
	private hoveredMove: number | null = null;

	private playerPokemonHp: number = 0;
	private enemyPokemonHp: number = 0;

	private isMouseOverPkmn: boolean = false;
	private isMouseOverPack: boolean = false;
	private isMouseOverRun: boolean = false;
	private hoveredPokemon: number | null = null;
	private hoveredItem: number | null = null;
	private isHoveringContinue: boolean = false;

	private isEncounterAnimationDone: boolean = false;
	private isIntroDone: boolean = false;

	private eventQueue: SocketWildBattleTurnEvent[] = [];

	private isPlayersPokemonSentOut: boolean = false;
	private isProcessingTurn: boolean = false;

	private displayedTextRow1: string = '';
	private displayedTextRow2: string = '';

	private isThrowingPokeball: boolean = false;
	private pokeballThrowCounter: number = 0;
	private shakeFrameIndex: number = 0;
	private isCaught: boolean = false;

	constructor(world: World, player: Player, wildPokemon: SocketPokemon) {
		this.world = world;
		this.player = player;
		this.wildPokemon = wildPokemon;
		const firstIndexWhereHealthyPokemon = this.player.party.findIndex(pokemon => pokemon?.hp > 0);
		this.playerCurrentPokemonIndex = firstIndexWhereHealthyPokemon;

		this.loadAssets();

		this.playerPokemonHp = this.player.party.filter(pokemon => pokemon !== null)[this.playerCurrentPokemonIndex].hp;
		this.enemyPokemonHp = this.wildPokemon.hp;
	}

	public initBattle() {
		this.world.client.audioManager.isAutoplayOn = false;
		this.world.client.audioManager.playMusic('wild_battle_johto.ogg');
	}

	private runEncounterAnimation() {
		canvas2d.drawImage(this.battleEncounterFrames[this.currentEncounterFrame].image, 0, 0, 1000, 700);

		if (!this.encounterFrameCounter) this.encounterFrameCounter = 0;

		if (this.currentEncounterFrame < 26) {
			// Normal speed for frames 0-25 (increment every 6 frames)
			if (this.encounterFrameCounter % 3 === 0) {
				this.currentEncounterFrame++;
			}
		} else {
			// Triple time for frames 26 and 27 (increment every 18 frames)
			if (this.encounterFrameCounter % 60 === 0) {
				this.currentEncounterFrame++;
			}
		}

		if (this.currentEncounterFrame === 28) {
			this.isEncounterAnimationDone = true;
		}

		this.encounterFrameCounter++;
	}

	private drawMoves() {
		if (!this.battleOptionsImage) return;
		canvas2d.drawImage(this.battleOptionsImage, 520, 413, 473, 178);

		const mouseX = this.world.mouseScreenX;
		const mouseY = this.world.mouseScreenY;

		canvas2d.strokeStyle = 'rgba(0, 0, 0, 0.5)';
		canvas2d.lineWidth = 2;

		const moves = this.player.party.filter(pokemon => pokemon !== null)[this.playerCurrentPokemonIndex].moves;

		// draw moves
		canvas2d.fillStyle = 'black';
		canvas2d.font = '30px Pkmn';

		for (let i = 0; i < 4; i++) {
			const move = this.world.pokemonMovesManager.getPokemonMoveInfoById(moves[i]);
			if (move) {
				canvas2d.fillText(move.name.toUpperCase(), 560, 460 + i * 35);
			} else {
				canvas2d.fillText('-', 560, 460 + i * 35);
			}

			if (
				mouseX >= 560 - 10 &&
				mouseX <= 910 + 10 &&
				mouseY >= 440 + i * 35 - 10 &&
				mouseY <= 440 + i * 35 + 25
			) {
				canvas2d.strokeRect(560 - 10, 440 + i * 35 - 10, 350, 35);
				this.hoveredMove = i;
			}
		}

		// if hoverin outside of the moves, reset hovered move
		if (mouseX < 560 - 10 || mouseX > 860 + 10 || mouseY < 440 - 10 || mouseY > 440 + 4 * 35 + 10) {
			this.hoveredMove = null;
		}

		if (this.hoveredMove !== null) {
			canvas2d.fillStyle = 'black';
			canvas2d.font = '30px Pkmn';
			const move = this.world.pokemonMovesManager.getPokemonMoveInfoById(moves[this.hoveredMove]);
			if (move) {
				canvas2d.fillText(move.type, 45, 460);
				canvas2d.fillText(`PP: ${move.pp} / ${move.pp}`, 45, 500);
			}
		}
	}

	public update(): void {
		this.processBattleEvents();
	}

	private processBattleEvents(): void {
		const wildBattleTurnEvents = this.world.wildBattleTurnEvents;

		if (wildBattleTurnEvents.length > 0) {
			this.eventQueue = [...wildBattleTurnEvents];
		}

		if (this.isProcessingTurn || this.isPlayersPokemonSentOut === false) {
			return;
		}

		if (this.eventQueue.length === 0) {
			return;
		}

		const nextEvent = this.eventQueue[0];
		const eventType = nextEvent.actionType;

		this.isProcessingTurn = true;
		switch (eventType) {
			case 'FIGHT':
				this.handleFight(nextEvent);
				break;
			case 'POKEMON':
				this.setCurrentPokemon(nextEvent);
				break;
			case 'ITEM':
				this.handleItemUse(nextEvent);
				break;
			case 'RUN':
				this.handleRun(nextEvent);
				break;
		}

		// Remove the event
		this.world.wildBattleTurnEvents = [];
		this.eventQueue.shift();
	}

	private async handleFight(event: SocketWildBattleTurnEvent): Promise<void> {
		const isPlayersMove = event.isPlayersMove;
		const pokemonHpAfterMove = event.newHp;
		const moveUsed = this.world.pokemonMovesManager.getPokemonMoveInfoById(event.moveId);
		const pokemonName = isPlayersMove
			? this.world.pokemonsManager.getPokemonInfoByIndex(
					this.player.party.filter(pokemon => pokemon !== null)[this.playerCurrentPokemonIndex].id,
				)?.name
			: this.world.pokemonsManager.getPokemonInfoByIndex(this.wildPokemon.id)?.name;

		this.world.client.audioManager.playSfx(`${moveUsed?.name.toLowerCase().replace(/ /g, '')}.ogg`, false);
		const sfxLength = await this.world.client.audioManager.getAudioLength(
			`${moveUsed?.name.toLowerCase().replace(/ /g, '')}.ogg`,
		);

		if (isPlayersMove) {
			this.displayedTextRow1 = `${pokemonName} used ${moveUsed?.name}!`;
			if (moveUsed?.power !== null && this.enemyPokemonHp === pokemonHpAfterMove) {
				this.displayedTextRow2 = `But it missed!`;
			}
		} else {
			this.displayedTextRow1 = `Enemy ${pokemonName} used ${moveUsed?.name}!`;
			if (moveUsed?.power !== null && this.playerPokemonHp === pokemonHpAfterMove) {
				this.displayedTextRow2 = `But it missed!`;
			}
		}

		if (moveUsed?.power !== null && moveUsed?.power !== 0) {
			setTimeout(() => {
				this.world.client.audioManager.playSfx(`take_damage.ogg`, false);

				if (event.effect === 1) {
					this.displayedTextRow2 = `It's super effective!`;
				} else if (event.effect === -1) {
					this.displayedTextRow2 = `It's not very effective...`;
				}

				if (isPlayersMove) {
					const interval = setInterval(() => {
						if (this.enemyPokemonHp > pokemonHpAfterMove) {
							this.enemyPokemonHp--;
						} else {
							clearInterval(interval); // Stop when the condition is met

							if (event.isBattleOver) {
								setTimeout(() => {
									const wildPokemonName = this.world.pokemonsManager.getPokemonInfoByIndex(
										this.wildPokemon.id,
									)?.name;
									this.displayedTextRow1 = `Enemy ${wildPokemonName} was defeated!`;
									this.displayedTextRow2 = 'Click here to continue...';
									this.world.client.audioManager.playMusic('wild_victory.ogg');
								}, 1000);
							} else {
								setTimeout(() => {
									this.isProcessingTurn = false;
									this.displayedTextRow1 = '';
									this.displayedTextRow2 = '';
								}, 1000);
							}
						}
					}, 100);
				} else {
					const interval = setInterval(() => {
						if (this.playerPokemonHp > pokemonHpAfterMove) {
							this.playerPokemonHp--;
						} else {
							clearInterval(interval); // Stop when the condition is met

							if (event.isBattleOver) {
								if (event.isAllPokemonsFainted) {
									this.displayedTextRow1 = 'All of your pokemons have fainted!';
									this.displayedTextRow2 = 'Click here to continue...';
									this.world.client.audioManager.isAutoplayOn = true;
								} else {
									setTimeout(() => {
										this.activeOption = 'pkmn';
										this.isProcessingTurn = false;
									}, 1000);
								}
							} else {
								setTimeout(() => {
									this.isProcessingTurn = false;
									this.displayedTextRow1 = '';
									this.displayedTextRow2 = '';
								}, 1000);
							}
						}
					}, 100);

					// TODO: Lose condition
				}
			}, sfxLength + 1000);
		} else {
			setTimeout(() => {
				this.displayedTextRow2 = 'But it failed!';
				setTimeout(() => {
					this.isProcessingTurn = false;
					this.displayedTextRow1 = '';
					this.displayedTextRow2 = '';
				}, 2000);
			}, sfxLength + 1000);
		}
	}

	private setCurrentPokemon(event: SocketWildBattleTurnEvent) {
		const pokemonIndex = event.switchedPokemonIndex;
		this.playerCurrentPokemonIndex = pokemonIndex;
		this.playerPokemonHp = this.player.party.filter(pokemon => pokemon !== null)[this.playerCurrentPokemonIndex].hp;

		// check if in event queue there is a fight event with new hp
		const fightEvent = this.eventQueue.find(e => e.actionType === 'FIGHT');

		this.isPlayersPokemonSentOut = false;
		this.playerSentOutCounter = 0;
		this.isProcessingTurn = false;
		this.displayedTextRow1 = '';
		this.displayedTextRow2 = '';
	}

	private handleRun(event: SocketWildBattleTurnEvent): void {
		if (event.isRunSuccessful) {
			this.displayedTextRow1 = 'Got away safely!';
			this.displayedTextRow2 = 'Click here to continue...';
		} else {
			this.displayedTextRow1 = "Can't escape!";
			setTimeout(() => {
				this.isProcessingTurn = false;
				this.displayedTextRow1 = '';
				this.displayedTextRow2 = '';
			}, 3000);
		}
	}

	private handlePokeBallUse(event: SocketWildBattleTurnEvent): void {
		const pokemonName = this.world.pokemonsManager.getPokemonInfoByIndex(this.wildPokemon.id)?.name;
		const isCaught = event.isCaught;
		this.isThrowingPokeball = true;
		this.isCaught = isCaught;
		const playerName = this.player.name;
		this.displayedTextRow1 = `${playerName} used the Poke Ball.`;
	}

	private handleItemUse(event: SocketWildBattleTurnEvent): void {
		switch (event.itemUsedId) {
			case 4: // Poke Ball
				this.handlePokeBallUse(event);
				break;
			default:
				this.displayedTextRow1 = 'Absolutely nothing happened!';
		}
	}

	public draw() {
		if (this.isEncounterAnimationDone === false) {
			this.runEncounterAnimation();
			return;
		}

		if (!this.battleBackgroundImage) return;
		canvas2d.drawImage(this.battleBackgroundImage, 0, 0, 1000, 600);

		if (this.displayedTextRow1 !== '') {
			canvas2d.fillStyle = 'black';
			canvas2d.font = '30px Pkmn';
			canvas2d.fillText(this.displayedTextRow1, 45, 485);
		}

		if (this.displayedTextRow2 !== '') {
			canvas2d.fillStyle = this.isMouseOverContinueButton() ? 'red' : 'black';
			canvas2d.font = '30px Pkmn';
			canvas2d.fillText(this.displayedTextRow2, 45, 545);
		}

		if (this.isIntroDone === false) {
			this.drawIntro();
			return;
		}

		this.drawPokemonAndItsStats(false);

		if (this.isPlayersPokemonSentOut === false) {
			this.sentOutPlayerPokemon();
			return;
		}

		this.drawPokemonAndItsStats(true);
		if (this.isCaught && !this.isThrowingPokeball) {
			canvas2d.drawImage(this.pokeballFrames[0].image, 795, 140, 70, 70);
		}
		if (this.isThrowingPokeball) {
			this.pokeballThrowCounter++;
			// first, first frame flies from player to enemy over 60 frames
			const frameIndex = Math.floor(this.pokeballThrowCounter / 10) % 4;

			if (this.pokeballThrowCounter < 45) {
				const startX = 220;
				const startY = 240;
				const endX = 970;

				// Calculate the progress of the throw (0 to 1)
				const progress = this.pokeballThrowCounter / 60;

				// Calculate the x-coordinate based on linear interpolation
				const curveX = startX + (endX - startX) * progress;

				// Make the y-coordinate follow an upward arc first and then fall
				const curveY = startY + Math.pow(progress - 0.5, 2) * 400 - Math.sin(progress * Math.PI) * 200;

				// Draw the Pokéball at the calculated position
				canvas2d.drawImage(this.pokeballFrames[frameIndex].image, curveX, curveY, 70, 70);
			} else if (this.pokeballThrowCounter < 55) {
				//this.pokeballThrowCounter = 0;
				// just draw the pokeball on the ground
				canvas2d.drawImage(this.pokeballFrames[frameIndex].image, 795, 140, 70, 70);
			} else if (this.pokeballThrowCounter < 80) {
				//this.pokeballThrowCounter = 0;
				// just draw the pokeball on the ground
				if (!this.pokeballBottomHalfImage || !this.pokeballTopHalfImage) return;
				canvas2d.drawImage(this.pokeballBottomHalfImage, 795, 175, 70, 35);

				// draw the top half of the pokeball going up
				const startY = 140;
				const endY = -50;

				// Calculate the progress of the throw (0 to 1)
				const progress = (this.pokeballThrowCounter - 55) / 45;

				// Calculate the y-coordinate based on linear interpolation
				const curveY = startY + (endY - startY) * progress;

				// Draw the Pokéball at the calculated position
				canvas2d.drawImage(this.pokeballTopHalfImage, 795, curveY, 70, 35);
			} else if (this.pokeballThrowCounter < 100) {
				if (!this.pokeballBottomHalfImage || !this.pokeballTopHalfImage) return;
				canvas2d.drawImage(this.pokeballTopHalfImage, 795, -50, 70, 35);
				canvas2d.drawImage(this.pokeballBottomHalfImage, 795, 175, 70, 35);
			} else if (this.pokeballThrowCounter < 120) {
				// make top half go down
				const startY = -50;
				const endY = 140;

				// Calculate the progress of the throw (0 to 1)
				const progress = (this.pokeballThrowCounter - 100) / 20;

				// Calculate the y-coordinate based on linear interpolation
				const curveY = startY + (endY - startY) * progress;

				// Draw the Pokéball at the calculated position
				if (!this.pokeballTopHalfImage) return;
				canvas2d.drawImage(this.pokeballTopHalfImage, 795, curveY, 70, 35);
				if (!this.pokeballBottomHalfImage) return;
				canvas2d.drawImage(this.pokeballBottomHalfImage, 795, 175, 70, 35);
			} else if (this.pokeballThrowCounter < 160) {
				// Make the Pokéball do a more noticeable jump
				const startY = 140;

				// Calculate the progress of the bounce (0 to 1)
				const progress = (this.pokeballThrowCounter - 120) / 40;

				// Use a sine wave to make the bounce more natural and pronounced
				const curveY = startY - Math.sin(progress * Math.PI) * 50;

				// Draw the Pokéball at the calculated position
				canvas2d.drawImage(this.pokeballFrames[frameIndex].image, 795, curveY, 70, 70);
			} else if (this.pokeballThrowCounter < 340) {
				canvas2d.drawImage(this.pokeballFrames[this.shakeFrameIndex].image, 795, 140, 70, 70);
				// increment the shake frame index every 10 frames

				// if at frame 1, stay on that frame for 50 frames
				if (this.shakeFrameIndex === 1 && this.pokeballThrowCounter % 10 === 0) {
					this.shakeFrameIndex++;
				} else if (this.shakeFrameIndex === 0 && this.pokeballThrowCounter % 10 === 0) {
					this.shakeFrameIndex++;
				} else if (this.shakeFrameIndex === 2 && this.pokeballThrowCounter % 10 === 0) {
					this.shakeFrameIndex++;
				} else if (this.shakeFrameIndex === 3 && this.pokeballThrowCounter % 10 === 0) {
					this.shakeFrameIndex = 0;
				}
			} else if (this.isCaught) {
				this.isThrowingPokeball = false;
				const pokemonName = this.world.pokemonsManager.getPokemonInfoByIndex(this.wildPokemon.id)?.name;
				this.world.client.audioManager.playMusic('wild_victory.ogg');
				this.displayedTextRow1 = 'Gotcha! Wild ' + pokemonName + ' was caught!';
				this.displayedTextRow2 = 'Click here to continue...';
			} else {
				this.isThrowingPokeball = false;
				this.pokeballThrowCounter = 0;
				const pokemonName = this.world.pokemonsManager.getPokemonInfoByIndex(this.wildPokemon.id)?.name;
				this.displayedTextRow1 = 'The wild ' + pokemonName + ' broke free!';
				setTimeout(() => {
					this.isProcessingTurn = false;
					this.displayedTextRow1 = '';
					this.displayedTextRow2 = '';
				}, 3000);
			}
		}

		if (this.activeOption === 'fight') {
			this.drawMoves();
		}

		if (this.activeOption === 'pkmn') {
			this.drawPokemonList();
		}

		if (this.activeOption === 'pack') {
			this.drawPack();
		}

		if (
			this.displayedTextRow1 === '' &&
			this.displayedTextRow2 === '' &&
			this.activeOption === null &&
			this.eventQueue.length === 0
		) {
			this.drawBattleOptions();
		}
	}

	private leaveBattle() {
		this.world.battle = null;
		this.world.client.audioManager.isAutoplayOn = true;
	}

	private drawPack() {
		// white screen first
		canvas2d.fillStyle = 'white';
		canvas2d.fillRect(0, 0, 1000, 600);

		// draw pokemon
		const playerInventoryLength = this.player.inventory.filter(item => item !== 0).length;
		const playerInventory = this.player.inventory;

		canvas2d.fillStyle = 'black';
		canvas2d.font = '30px Pkmn';
		for (let i = 0; i < playerInventoryLength; i++) {
			const item = this.world.itemsManager.getItemInfoById(playerInventory[i]);
			if (!item) return;
			canvas2d.fillText(`${item.name.toUpperCase()}`, 45, 50 + i * 60);
			const itemAmount = this.player.inventoryAmounts[i];
			canvas2d.font = '30px Pkmn';
			canvas2d.fillText(`x${itemAmount}`, 400, 50 + i * 60);

			if (
				this.world.mouseScreenX >= 45 - 10 &&
				this.world.mouseScreenX <= 45 - 10 + (1000 - 10 - 35) &&
				this.world.mouseScreenY >= 50 + i * 60 - 40 &&
				this.world.mouseScreenY <= 50 + i * 60 - 40 + 50
			) {
				canvas2d.strokeStyle = 'rgba(0, 0, 0, 0.5)';
				canvas2d.lineWidth = 2;
				canvas2d.strokeRect(45 - 10, 50 + i * 60 - 40, 1000 - 10 - 35, 50);
				this.hoveredItem = i;
			}
		}

		// draw cancel
		canvas2d.fillStyle = 'black';
		canvas2d.fillText('CANCEL', 45, 50 + playerInventoryLength * 60);

		if (
			this.world.mouseScreenX >= 45 - 10 &&
			this.world.mouseScreenX <= 45 - 10 + (1000 - 10 - 35) &&
			this.world.mouseScreenY >= 50 + playerInventoryLength * 60 - 40 &&
			this.world.mouseScreenY <= 50 + playerInventoryLength * 60 - 40 + 50
		) {
			canvas2d.strokeStyle = 'rgba(0, 0, 0, 0.5)';
			canvas2d.lineWidth = 2;
			canvas2d.strokeRect(45 - 10, 50 + playerInventoryLength * 60 - 40, 1000 - 10 - 35, 50);

			this.hoveredItem = -1;
		}
	}

	private drawPokemonList() {
		// white screen first
		canvas2d.fillStyle = 'white';
		canvas2d.fillRect(0, 0, 1000, 600);

		// draw pokemon
		const playerPokemonCount = this.player.party.filter(pokemon => pokemon !== null).length;

		canvas2d.fillStyle = 'black';
		canvas2d.font = '30px Pkmn';

		this.hoveredPokemon = null; // Reset before checking hovers

		const playerPartyWithoutNulls = this.player.party.filter(pokemon => pokemon !== null);

		for (let i = 0; i < playerPokemonCount; i++) {
			const pokemon = playerPartyWithoutNulls[i]; // Use filtered array
			const pokemonData = this.world.pokemonsManager.getPokemonInfoByIndex(pokemon?.id);
			if (!pokemonData) return;
			const isFainted = pokemon.hp === 0;
			const isCurrentPokemon = i === this.playerCurrentPokemonIndex;
			canvas2d.fillStyle = isFainted || isCurrentPokemon ? 'gray' : 'black';
			canvas2d.fillText(`${pokemonData.name.toUpperCase()}`, 45, 50 + i * 60);

			// Draw level
			canvas2d.font = '30px Pkmn';
			canvas2d.fillText(`Lv. ${ExperienceCurve.getLevelByExperience(pokemon.xp)}`, 400, 50 + i * 60);

			if (!this.hpGaugeImage) return;
			canvas2d.drawImage(this.hpGaugeImage, 650, 22 + i * 60, 340, 30);

			const pokemonsCurrentHp = pokemon.hp;
			const pokemonMaxHp = pokemon.maxHp;

			canvas2d.fillStyle = pokemonsCurrentHp / pokemonMaxHp > 0.5 ? 'green' : 'orange';
			canvas2d.fillRect(730, 22 + 5 + i * 60, (pokemonsCurrentHp / pokemonMaxHp) * 240, 15);

			if (
				this.world.mouseScreenX >= 45 - 10 &&
				this.world.mouseScreenX <= 45 - 10 + (1000 - 10 - 35) &&
				this.world.mouseScreenY >= 50 + i * 60 - 40 &&
				this.world.mouseScreenY <= 50 + i * 60 - 40 + 50
			) {
				if (isFainted || isCurrentPokemon) continue;
				canvas2d.strokeStyle = 'rgba(0, 0, 0, 0.5)';
				canvas2d.lineWidth = 2;
				canvas2d.strokeRect(45 - 10, 50 + i * 60 - 40, 1000 - 10 - 35, 50);
				this.hoveredPokemon = i; // Set hovered index
			}
		}

		// Draw cancel only if current Pokémon is not fainted
		if (playerPartyWithoutNulls[this.playerCurrentPokemonIndex].hp > 0) {
			canvas2d.fillStyle = 'black';
			canvas2d.fillText('CANCEL', 45, 50 + playerPokemonCount * 60);

			if (
				this.world.mouseScreenX >= 45 - 10 &&
				this.world.mouseScreenX <= 45 - 10 + (1000 - 10 - 35) &&
				this.world.mouseScreenY >= 50 + playerPokemonCount * 60 - 40 &&
				this.world.mouseScreenY <= 50 + playerPokemonCount * 60 - 40 + 50
			) {
				canvas2d.strokeStyle = 'rgba(0, 0, 0, 0.5)';
				canvas2d.lineWidth = 2;
				canvas2d.strokeRect(45 - 10, 50 + playerPokemonCount * 60 - 40, 1000 - 10 - 35, 50);
				this.hoveredPokemon = -1; // Set hover to cancel button
			}
		}
	}

	private drawBattleOptions() {
		if (!this.battleOptionsImage) return;
		canvas2d.drawImage(this.battleOptionsImage, 520, 413, 473, 178);

		const mouseX = this.world.mouseScreenX;
		const mouseY = this.world.mouseScreenY;

		canvas2d.strokeStyle = 'rgba(0, 0, 0, 0.5)';
		canvas2d.lineWidth = 2;

		// draw fight
		canvas2d.fillStyle = 'black';
		canvas2d.font = '30px Pkmn';
		canvas2d.fillText('FIGHT', 580, 485);

		// draw pokemon
		canvas2d.fillStyle = 'black';
		canvas2d.font = '30px Pkmn';
		canvas2d.fillText('PACK', 580, 545);

		// draw bag
		canvas2d.fillStyle = 'black';
		canvas2d.font = '30px Pkmn';
		canvas2d.fillText('PKMN', 830, 485);

		// draw run
		canvas2d.fillStyle = 'black';
		canvas2d.font = '30px Pkmn';
		canvas2d.fillText('RUN', 830, 545);

		if (mouseX >= 580 - 10 && mouseX <= 720 + 10 && mouseY >= 465 - 15 && mouseY <= 490) {
			canvas2d.strokeRect(580 - 10, 465 - 15, 160, 40);
			this.isMouseOverFight = true;
		} else if (mouseX >= 580 - 10 && mouseX <= 720 + 10 && mouseY >= 525 - 15 && mouseY <= 550) {
			canvas2d.strokeRect(580 - 10, 525 - 15, 160, 40);
			this.isMouseOverPack = true;
		} else if (mouseX >= 830 - 10 && mouseX <= 970 + 10 && mouseY >= 465 - 15 && mouseY <= 490) {
			canvas2d.strokeRect(830 - 10, 465 - 15, 135, 40);
			this.isMouseOverPkmn = true;
		} else if (mouseX >= 830 - 10 && mouseX <= 970 + 10 && mouseY >= 525 - 15 && mouseY <= 550) {
			canvas2d.strokeRect(830 - 10, 525 - 15, 135, 40);
			this.isMouseOverRun = true;
		} else {
			this.isMouseOverFight = false;
			this.isMouseOverPack = false;
			this.isMouseOverPkmn = false;
			this.isMouseOverRun = false;
		}
	}

	private drawPokemonAndItsStats(isPlayer: boolean) {
		if (!isPlayer) {
			if (!this.wildPokemonSprite) return;

			if (this.pokeballThrowCounter < 80) {
				canvas2d.drawImage(this.wildPokemonSprite, 750, 0, 200, 200);
			} else {
				if (this.pokeballThrowCounter < 85) {
					if (this.pokeballThrowCounter === 84) {
						this.world.client.audioManager.playSfx('ball_poof.ogg', false);
					}
					canvas2d.drawImage(this.pokemonSpawnFrames[3].image, 750, 0, 200, 200);
				} else if (this.pokeballThrowCounter < 90) {
					canvas2d.drawImage(this.pokemonSpawnFrames[2].image, 750, 0, 200, 200);
				} else if (this.pokeballThrowCounter < 95) {
					canvas2d.drawImage(this.pokemonSpawnFrames[1].image, 750, 0, 200, 200);
				} else if (this.pokeballThrowCounter < 100) {
					canvas2d.drawImage(this.pokemonSpawnFrames[0].image, 750, 0, 200, 200);
				}
			}

			if (!this.statsMeterEnemyImage) return;
			canvas2d.drawImage(this.statsMeterEnemyImage, 45, 50, 400, 76);
			const pokemon = this.wildPokemon;
			const pokemonData = this.world.pokemonsManager.getPokemonInfoByIndex(pokemon?.id);
			if (!pokemonData) return;

			// draw name
			canvas2d.fillStyle = 'black';
			canvas2d.font = '30px Pkmn';
			canvas2d.fillText(
				`${pokemonData.name.toUpperCase()} Lv. ${ExperienceCurve.getLevelByExperience(pokemon.xp)}`,
				45,
				30,
			);

			// draw hp bar
			canvas2d.fillStyle = 'green';
			canvas2d.fillRect(161, 63, (this.enemyPokemonHp / pokemon.maxHp) * 243, 13);
		} else {
			canvas2d.drawImage(this.playerPokemonSprites[this.playerCurrentPokemonIndex], 50, 200, 200, 200);

			if (!this.statsMeterPlayerImage) return;
			// 3.59 ratio
			canvas2d.drawImage(this.statsMeterPlayerImage, 550, 280, 400, 111);

			const pokemon = this.player.party.filter(pokemon => pokemon !== null)[this.playerCurrentPokemonIndex];
			const pokemonData = this.world.pokemonsManager.getPokemonInfoByIndex(pokemon?.id);
			if (!pokemonData) return;

			// draw name
			canvas2d.fillStyle = 'black';
			canvas2d.font = '30px Pkmn';
			canvas2d.fillText(
				`${pokemonData.name.toUpperCase()} Lv. ${ExperienceCurve.getLevelByExperience(pokemon.xp)}`,
				590,
				260,
			);

			// draw hp bar
			// Draw HP bar
			canvas2d.fillStyle = 'green';
			canvas2d.fillRect(672, 288, (this.playerPokemonHp / pokemon.maxHp) * 243, 13);

			// Calculate experience and drawing
			canvas2d.fillStyle = '#2088f8';

			const currentLevel = ExperienceCurve.getLevelByExperience(pokemon.xp);
			const currentLevelXp = ExperienceCurve.getExperienceForLevel(currentLevel);
			const nextLevelXp = ExperienceCurve.getExperienceForLevel(currentLevel + 1);

			// The XP bar should start where the HP bar ends (i.e., starting at y + 13)
			const xpBarXStart = 672 + 243; // starting X position
			const xpBarYStart = 375; // starting Y position

			// Calculate the width of the XP bar
			// bar "0" is current level xp, bar "1" is next level xp
			const xpBarWidth0 = ((pokemon.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 243;

			const xpBarWidth = xpBarWidth0;
			// Draw the XP bar starting from the right, growing left
			canvas2d.fillRect(xpBarXStart - xpBarWidth, xpBarYStart, xpBarWidth, 11);

			// draw hp / hp
			canvas2d.fillStyle = 'black';
			canvas2d.font = '40px Pkmn';
			canvas2d.fillText(this.playerPokemonHp.toString(), 680, 350);
			canvas2d.fillText(`${pokemon.maxHp}`, 820, 350);
		}
	}

	private sentOutPlayerPokemon() {
		const pokemon = this.player.party.filter(pokemon => pokemon !== null)[this.playerCurrentPokemonIndex];
		const pokemonName = this.world.pokemonsManager.getPokemonInfoByIndex(pokemon?.id)?.name;

		this.playerSentOutCounter++;

		if (this.playerSentOutCounter > 120) {
			// draw spawn animation
			if (this.playerSentOutCounter < 125) {
				if (this.playerSentOutCounter === 121) {
					this.world.client.audioManager.playSfx('ball_poof.ogg', false);
				}
				canvas2d.drawImage(this.pokemonSpawnFrames[0].image, 50, 200, 200, 200);
			} else if (this.playerSentOutCounter < 130) {
				canvas2d.drawImage(this.pokemonSpawnFrames[1].image, 50, 200, 200, 200);
			} else if (this.playerSentOutCounter < 135) {
				canvas2d.drawImage(this.pokemonSpawnFrames[2].image, 50, 200, 200, 200);
			} else if (this.playerSentOutCounter < 140) {
				canvas2d.drawImage(this.pokemonSpawnFrames[3].image, 50, 200, 200, 200);
			}

			if (this.playerSentOutCounter > 165) {
				this.isPlayersPokemonSentOut = true;
				this.displayedTextRow1 = '';
				this.displayedTextRow2 = '';
			}
		} else {
			this.displayedTextRow1 = `Go! ${pokemonName.toUpperCase()}!`;
		}
	}

	private drawIntro(): void {
		if (!this.trainerBackImage) return;
		if (!this.wildPokemonSprite) return;

		if (this.currentBattleIntroFrame * 5 <= 750) this.currentBattleIntroFrame++;
		canvas2d.drawImage(this.wildPokemonSprite, this.currentBattleIntroFrame * 5, 0, 200, 200);
		canvas2d.drawImage(this.trainerBackImage, 800 - this.currentBattleIntroFrame * 5, 200, 200, 200);

		if (this.currentBattleIntroFrame * 5 >= 750) {
			this.drawPokemonCounter();
		}
		if (this.currentBattleIntroFrame * 5 === 750) {
			this.world.client.audioManager.playSfx('positioned.ogg', false);
			const wildPokemonData = this.world.pokemonsManager.getPokemonInfoByIndex(this.wildPokemon.id);

			this.displayedTextRow1 = `Wild ${wildPokemonData?.name.toUpperCase()} appeared!`;

			setTimeout(() => {
				this.isIntroDone = true;
			}, 2000);
		}
	}

	private drawPokemonCounter() {
		if (!this.pokemonCounterImage) return;

		canvas2d.save();
		canvas2d.scale(-1, 1);

		canvas2d.translate(-490, 0); // Move it back to the correct position after flipping

		// Adjust x position for mirrored drawing
		canvas2d.drawImage(this.pokemonCounterImage, -45 - 400, 300, 400, 76);
		canvas2d.restore();

		const playerPokemonCount = this.player.party.filter(pokemon => pokemon !== null).length;

		Array.from({ length: playerPokemonCount }, (_, i) => i).forEach(i => {
			if (!this.counterPokeBallImage) return;
			// from left to right
			canvas2d.drawImage(this.counterPokeBallImage, 579 + 38 * (i + 1) + i * 2, 304, 38, 38);
		});

		this.pokemonCounterCounter++;
	}

	public handleClick(event: MouseEvent) {
		if (this.isMouseOverContinueButton()) {
			this.leaveBattle();
			return;
		}

		if (this.isHoveringContinue) {
			this.leaveBattle();
			return;
		}
		if (this.isProcessingTurn) return;

		if (this.activeOption === null) {
			if (this.isMouseOverFight) {
				this.activeOption = 'fight';
				return;
			}

			if (this.isMouseOverPkmn) {
				this.activeOption = 'pkmn';
				return;
			}

			if (this.isMouseOverPack) {
				this.activeOption = 'pack';
				return;
			}

			if (this.isMouseOverRun) {
				this.world.actions?.sendBattleAction(this.player.entityID, 'RUN');
				return;
			}
		}

		if (this.activeOption === 'fight') {
			const hoveredMove = this.hoveredMove;
			if (hoveredMove !== null) {
				const moveId = this.player.party.filter(pokemon => pokemon !== null)[this.playerCurrentPokemonIndex]
					.moves[hoveredMove];

				if (moveId === null) return;
				const move = this.world.pokemonMovesManager.getPokemonMoveInfoById(moveId);
				if (!move) return;

				this.world.actions?.sendBattleAction(this.player.entityID, 'FIGHT', moveId);
				this.activeOption = null;
			}
		} else if (this.activeOption === 'pkmn') {
			if (this.hoveredPokemon !== null) {
				if (this.hoveredPokemon === -1) {
					this.activeOption = null;
					return;
				}
				this.world.actions?.sendBattleAction(this.player.entityID, 'POKEMON', this.hoveredPokemon);
				this.activeOption = null;
			}
		} else if (this.activeOption === 'pack') {
			if (this.hoveredItem !== null) {
				if (this.hoveredItem === -1) {
					this.activeOption = null;
					return;
				}
				this.world.actions?.sendBattleAction(this.player.entityID, 'ITEM', this.hoveredItem);
				this.activeOption = null;
			}
		}
	}

	private async loadAssets(): Promise<void> {
		const sprite = await this.world.spriteCache.getSprite('blank_battle_screen.png');
		if (sprite) {
			this.battleBackgroundImage = sprite;
		}

		const numberOfFrames = 28;

		for (let i = 1; i < numberOfFrames + 1; i++) {
			const battleEncounterFrame = await this.world.spriteCache.getSprite(`encounter_frame_${i}.png`);
			if (battleEncounterFrame) {
				this.battleEncounterFrames.push({
					frame: i,
					image: battleEncounterFrame,
				});
			}
		}

		for (let i = 1; i < 4 + 1; i++) {
			const pokemonSpawnFrame = await this.world.spriteCache.getSprite(`spawn_pokemon_frame_${i}.png`);
			if (pokemonSpawnFrame) {
				this.pokemonSpawnFrames.push({
					frame: i,
					image: pokemonSpawnFrame,
				});
			}
		}

		for (let i = 1; i < 4 + 1; i++) {
			const pokeballFrame = await this.world.spriteCache.getSprite(`battle_pokeball_${i}.png`);
			if (pokeballFrame) {
				this.pokeballFrames.push({
					frame: i,
					image: pokeballFrame,
				});
			}
		}

		this.trainerBackImage = await this.world.spriteCache.getSprite('trainer_back.png');
		this.pokemonCounterImage = await this.world.spriteCache.getSprite('pokemon_counter.png');
		this.counterPokeBallImage = await this.world.spriteCache.getSprite('counter_poke_ball.png');
		this.statsMeterEnemyImage = await this.world.spriteCache.getSprite('stats_meter_enemy.png');
		this.statsMeterPlayerImage = await this.world.spriteCache.getSprite('stats_meter_player.png');
		this.battleOptionsImage = await this.world.spriteCache.getSprite('battle_options.png');
		this.hpGaugeImage = await this.world.spriteCache.getSprite('hp_gauge.png');
		this.pokeballBottomHalfImage = await this.world.spriteCache.getSprite('battle_pokeball_bottom.png');
		this.pokeballTopHalfImage = await this.world.spriteCache.getSprite('battle_pokeball_top.png');

		this.player.party.forEach(async (pokemon, index) => {
			const pokemonData = this.world.pokemonsManager.getPokemonInfoByIndex(pokemon?.id);
			if (!pokemonData) return;

			if (pokemon) {
				const sprite = await this.world.spriteCache.getSprite(`${pokemonData.sprite}_back.png`);
				if (sprite) {
					this.playerPokemonSprites[index] = sprite;
				} else {
					throw new Error(`Failed to load sprite for ${pokemonData.name}`);
				}
			}
		});

		const pokemonData = this.world.pokemonsManager.getPokemonInfoByIndex(this.wildPokemon.id);
		if (!pokemonData) return;

		const wildPokemonSprite = await this.world.spriteCache.getSprite(`${pokemonData.sprite}.png`);
		if (wildPokemonSprite) {
			this.wildPokemonSprite = wildPokemonSprite;
		} else {
			throw new Error(`Failed to load sprite for ${pokemonData.name}`);
		}
	}

	private isMouseOverContinueButton(): boolean {
		canvas2d.font = '30px Pkmn';
		const clickToContinueTextLength =
			// meassure text length
			canvas2d.measureText('Click here to continue...').width;

		return (
			this.world.mouseScreenX >= 45 &&
			this.world.mouseScreenX <= 45 + clickToContinueTextLength &&
			this.world.mouseScreenY >= 545 - 40 &&
			this.world.mouseScreenY <= 545 + 10 &&
			this.displayedTextRow2.includes('continue')
		);
	}
}
