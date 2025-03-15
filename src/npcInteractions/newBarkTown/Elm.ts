import World from '../../world/World';
import Interaction from '../Interaction';

export default class Elm extends Interaction {
	public dialogueNumber: number = 0;

	constructor(world: World, targetID: string, dialogueNumber: number = 0) {
		super(world, targetID, 'Elm');
		this.dialogueNumber = dialogueNumber;
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		if (this.dialogueNumber !== 0) {
			switch (this.dialogueNumber) {
				case 155:
					await this.npcSays("You'll take CYNDAQUIL, the fire POKEMON?");
					break;
				case 158:
					await this.npcSays('Do you want TOTODILE, the water POKEMON?');
					break;
				case 152:
					await this.npcSays('So, you like CHIKORITA, the grass POKEMON?');
					break;
			}

			const response = await this.playerChoice([
				{
					optionText: 'Yes',
				},
				{
					optionText: 'No',
				},
			]);

			if (response === 0) {
				await this.npcSays("I think that's a great POKEMON too!");
				await this.npcSays('MR.POKEMON lives near CHERRYGROVE, the next city.');
				await this.npcSays('It is almost a direct route to there.');
				await this.npcSays('If your POKEMON is hurt, you should heal it with this machine.');
				this.endDialogue();
				this.world.actions?.updateStoryProgress(this.world.currentPlayerID, 3);
				return;
			} else {
				await this.npcSays('Think it over carefully. Your partner is important.');
				this.endDialogue();
				return;
			}
		}

		const player = this.world.players.find(player => player.entityID === this.world.currentPlayerID);

		if (player?.storyProgress === 3) {
			await this.npcSays('MR. POKEMON goes everywhere and finds rarities.');
			await this.npcSays("Too bad they're just rare and not very useful...");
			await this.npcSays(`${player?.name}, I'm counting on you!`);
		} else if (player?.storyProgress === 2) {
			await this.npcSays('Go on, pick one!');
		} else {
			await this.npcSays(`${player?.name}! There you are! I needed to ask you a favor.`);
			await this.npcSays('I have an acquaintance called MR.POKEMON. ');
			await this.npcSays('He keeps finding weird things and raving about his discoveries.');
			await this.npcSays("Anyway, I just got an e-mail from him saying that this time it's real.");
			await this.npcSays(
				"It is intriguing, but we're busy with our POKEMON research. Could you look into it for us?",
			);
			await this.npcSays("I'll give you a POKEMON for a partner. They're all rare POKEMON that we just found.");
			await this.npcSays('Go on, pick one!');
			this.world.actions?.updateStoryProgress(this.world.currentPlayerID, 2);
		}
		this.endDialogue();
	}
}
