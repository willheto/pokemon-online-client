import World from '../../world/World';
import Interaction from '../Interaction';

export default class CherrygrovePokecenterWoman extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Woman');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays('The COMMUNICATION CENTER upstairs was just built.');
		await this.npcSays("But the devs haven't implemented it yet.");
		this.endDialogue();
	}
}
