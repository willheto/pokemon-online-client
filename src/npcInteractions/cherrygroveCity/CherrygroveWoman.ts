import World from '../../world/World';
import Interaction from '../Interaction';

export default class CherrygroveWoman extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Woman');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays("When you're with POKEMON, going anywhere is fun.");
		this.endDialogue();
	}
}
