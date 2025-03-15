import World from '../../world/World';
import Interaction from '../Interaction';

export default class man extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Man');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		const playerName = this.world.players.find(player => player.entityID === this.world.currentPlayerID)?.name;
		await this.npcSays('Yo, ' + playerName + '!');
		await this.npcSays('I hear Prof. Elm discovered some new POKEMON.');
		this.endDialogue();
	}
}
