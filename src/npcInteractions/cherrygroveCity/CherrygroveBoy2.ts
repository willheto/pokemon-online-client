import World from '../../world/World';
import Interaction from '../Interaction';

export default class CherrygroveBoy2 extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Boy');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays('POKEMON gain experience in battle and change their form.');
		this.endDialogue();
	}
}
