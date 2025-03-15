import World from '../../world/World';
import Interaction from '../Interaction';

export default class PokemonCenterLady extends Interaction {
	private npcIndex: number;
	constructor(world: World, targetID: string, npcIndex: number) {
		super(world, targetID, 'Pokemon center lady');
		this.npcIndex = npcIndex;
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		await this.npcSays('Good morning! Welcome to our Pokemon Center.');
		await this.npcSays('We can heal your Pokemon to perfect health.');
		await this.npcSays('Shall we heal your Pokemon?');

		const response = await this.playerChoice([
			{
				optionText: 'Yes',
			},
			{
				optionText: 'No',
			},
		]);

		if (response === 0) {
			await this.npcSays('OK, may I see your Pokemon?');
			this.world.actions?.healPokemon(this.world.currentPlayerID, this.npcIndex);
			await this.npcSays('Thank you for waiting.');
			await this.npcSays('Your Pokemon are fully healed.');
			await this.npcSays('We hope to see you again!');
		} else {
			await this.npcSays('OK, come back anytime!');
			this.endDialogue();
		}

		this.endDialogue();
	}
}
