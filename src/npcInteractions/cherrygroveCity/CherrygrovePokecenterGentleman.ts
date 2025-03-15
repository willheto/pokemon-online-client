import World from '../../world/World';
import Interaction from '../Interaction';

export default class CherrygrovePokecenterGentleman extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Gentleman');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays('That PC is free for any trainer to use.');
		this.endDialogue();
	}
}
