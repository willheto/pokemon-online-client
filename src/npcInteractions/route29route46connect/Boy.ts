import World from '../../world/World';
import Interaction from '../Interaction';

export default class Boy extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Boy');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays("You can't climb ledges.");
		await this.npcSays("But you can jump down from them to take a shortcut.");
		this.endDialogue();
	}
}
