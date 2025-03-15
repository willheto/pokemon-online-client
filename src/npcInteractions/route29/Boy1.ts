import World from '../../world/World';
import Interaction from '../Interaction';

export default class Boy1 extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Boy');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays('POKEMON hide in the grass.');
		await this.npcSays("Who knows when they'll pop out...");
		this.endDialogue();
	}
}
