import World from '../../world/World';
import Interaction from '../Interaction';

export default class Woman extends Interaction {
	public dialogueNumber: number = 0;

	constructor(world: World, targetID: string, dialogueNumber: number = 0) {
		super(world, targetID, 'Woman');
		this.dialogueNumber = dialogueNumber;
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		const player = this.world.players.find(player => player.entityID === this.world.currentPlayerID);

		if (player?.storyProgress && player.storyProgress >= 3) {
			await this.npcSays('Oh! Your POKEMON is adorable! I wish I had one!');
		} else if (this.dialogueNumber === 1) {
			await this.npcSays(`Wait ${player?.name}!`);
			await this.npcSays("What do you think you're doing?");
			await this.npcSays("It's dangerous to go out without a Pokemon!");
			await this.npcSays('Wild Pokemon jump out of the grass!');
			this.world.client.audioManager.isAutoplayOn = true;
		} else {
			await this.npcSays('Wow, your pokegear is impressive!');
			await this.npcSays('Did your mom get it for you?');
		}
		this.endDialogue();
	}
}
