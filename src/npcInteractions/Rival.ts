import World from '../world/World';
import Interaction from './Interaction';

export default class Rival extends Interaction {
	constructor(world: World, targetID: string) {
		const player = world.players.find(player => player.entityID === this.world.currentPlayerID);
		const storyProgress = player?.storyProgress;
		super(world, targetID, '???');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays('...');
		await this.npcSays('So this is the famous Elm Pokemon Lab...');
		await this.npcSays('...What are you staring at?');

		this.endDialogue();
	}
}
