import World from '../../world/World';
import Interaction from '../Interaction';

export default class Mom extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Mom');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		const player = this.world.players.find(player => player.entityID === this.world.currentPlayerID);

		if (player?.storyProgress === 3) {
			await this.npcSays("So, what was PROF.ELM's errand?");
			await this.npcSays('... That does sound challenging.');
			await this.npcSays('But, you should be proud that people rely on you.');
			this.endDialogue();
		} else if (player?.storyProgress && player.storyProgress < 3) {
			await this.npcSays('Prof. Elm is waiting for you.');
			await this.npcSays('Hurry up baby!');
			this.endDialogue();
		}
	}
}
