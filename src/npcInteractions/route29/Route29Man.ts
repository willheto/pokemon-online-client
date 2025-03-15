import World from '../../world/World';
import Interaction from '../Interaction';

export default class Man extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Man');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays('I wanted to take a break, so I saved to record my progress.');
		this.endDialogue();
	}
}
