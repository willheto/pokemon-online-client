import World from '../../world/World';
import Interaction from '../Interaction';

export default class CherrygrovePokecenterGuy extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Man');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays("It's great. I can store any number of Pokemon, and it's all free.");
		this.endDialogue();
	}
}
