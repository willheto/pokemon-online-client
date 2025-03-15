import World from '../../world/World';
import Interaction from '../Interaction';

export default class CherrygroveGirl extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Girl');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays("POKEMON change?");
        await this.npcSays("I would be shocked if one did that!");
		this.endDialogue();
	}
}
