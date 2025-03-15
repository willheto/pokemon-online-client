import World from '../../world/World';
import Interaction from '../Interaction';

export default class CherrygroveBoy1 extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Boy');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays("MR. POKEMON's house is still farther up ahead.");
		this.endDialogue();
	}
}
