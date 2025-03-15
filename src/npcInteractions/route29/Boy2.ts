import World from '../../world/World';
import Interaction from '../Interaction';

export default class Boy2 extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Boy');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays('Yo. How are your POKEMON?');
		await this.npcSays("If they're weak and not ready for battle, keep out of the grass.");
		this.endDialogue();
	}
}
