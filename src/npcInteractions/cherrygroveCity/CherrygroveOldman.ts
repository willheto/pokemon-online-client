import World from '../../world/World';
import Interaction from '../Interaction';

export default class CherrygroveOldman extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Old man');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays("You're a rookie trainer, aren't you? I can tell!");
		await this.npcSays("That's okay! Everyone is a rookie at some point.");
		await this.npcSays("If you'd like, I can teach you a few things.");

		const response = await this.playerChoice([
			{
				optionText: 'No',
			},
		]);

		if (response === 0) {
			await this.npcSays('OK, then!');
		}

		this.endDialogue();
	}
}
