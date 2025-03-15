import World from '../../world/World';
import Interaction from '../Interaction';

export default class Officer extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Officer');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays('Different kinds of POKEMON appear past here.');
		await this.npcSays('If you want to catch them all, you have to look everywhere.');
		this.endDialogue();
	}
}
