import World from '../world/World';
import CherrygroveBoy1 from './cherrygroveCity/CherrygroveBoy1';
import CherrygroveBoy2 from './cherrygroveCity/CherrygroveBoy2';
import CherrygroveGirl from './cherrygroveCity/CherrygroveGirl';
import CherrygroveOldman from './cherrygroveCity/CherrygroveOldman';
import CherrygrovePokecenterGentleman from './cherrygroveCity/CherrygrovePokecenterGentleman';
import CherrygrovePokecenterGuy from './cherrygroveCity/CherrygrovePokecenterGuy';
import CherrygrovePokecenterWoman from './cherrygroveCity/CherrygrovePokecenterWoman';
import CherrygroveWoman from './cherrygroveCity/CherrygroveWoman';
import PokemonCenterLady from './cherrygroveCity/PokemonCenterLady';
import EliteFourWill from './newBarkTown/EliteFourWill';
import Elm from './newBarkTown/Elm';
import Man from './newBarkTown/Man';
import Mom from './newBarkTown/Mom';
import Woman from './newBarkTown/Woman';
import Rival from './Rival';
import Boy1 from './route29/Boy1';
import Boy2 from './route29/Boy2';
import Route29Man from './route29/Route29Man';
import Boy from './route29route46connect/Boy';
import Officer from './route29route46connect/Officer';

export default class NpcInteraction {
	private world: World;

	constructor(world: World) {
		this.world = world;
	}

	public startNpcInteraction(npcIndex: number, targetID: string, dialogueNumber: number): void {
		if (npcIndex === 1) {
			new Rival(this.world, targetID);
		} else if (npcIndex === 2) {
			new Mom(this.world, targetID);
		} else if (npcIndex === 3) {
			new Woman(this.world, targetID, dialogueNumber);
		} else if (npcIndex === 4) {
			new Man(this.world, targetID);
		} else if (npcIndex === 5) {
			new Elm(this.world, targetID, dialogueNumber);
		} else if (npcIndex === 6) {
			new Boy1(this.world, targetID);
		} else if (npcIndex === 7) {
			new Boy2(this.world, targetID);
		} else if (npcIndex === 8) {
			new Route29Man(this.world, targetID);
		} else if (npcIndex === 9) {
			new Officer(this.world, targetID);
		} else if (npcIndex === 10) {
			new Boy(this.world, targetID);
		} else if (npcIndex === 11) {
			new PokemonCenterLady(this.world, targetID, 11);
		} else if (npcIndex === 12) {
			new CherrygrovePokecenterGuy(this.world, targetID);
		} else if (npcIndex === 13) {
			new CherrygrovePokecenterWoman(this.world, targetID);
		} else if (npcIndex === 14) {
			new CherrygrovePokecenterGentleman(this.world, targetID);
		} else if (npcIndex === 15) {
			new CherrygroveBoy1(this.world, targetID);
		} else if (npcIndex === 16) {
			new CherrygroveOldman(this.world, targetID);
		} else if (npcIndex === 17) {
			new CherrygroveWoman(this.world, targetID);
		} else if (npcIndex === 18) {
			new CherrygroveGirl(this.world, targetID);
		} else if (npcIndex === 19) {
			new CherrygroveBoy2(this.world, targetID);
		} else if (npcIndex === 20) {
			new EliteFourWill(this.world, targetID);
		} else {
			this.world.actions?.sendChatMessage(
				this.world.currentPlayerID,
				"He doesn't seem to want to talk to you.",
				false,
			);
		}
	}
}
