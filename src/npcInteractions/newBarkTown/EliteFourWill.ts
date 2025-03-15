import World from '../../world/World';
import Interaction from '../Interaction';

export default class EliteFourWill extends Interaction {
	constructor(world: World, targetID: string) {
		super(world, targetID, 'Will');
		this.startDialogue();
	}

	public async startDialogue(): Promise<void> {
		const playerName = this.world.players.find(player => player.entityID === this.world.currentPlayerID)?.name;
		await this.npcSays('Welcome to POKEMON LEAGUE, ' + playerName + '.');
		await this.npcSays('Allow me to introduce myself. I am WILL.');
		await this.npcSays('I have trained all around the world, making my psychic POKEMON powerful.');
		await this.npcSays("And, at last, I've been accepted into the ELITE FOUR.");
		await this.npcSays('I can only keep getting better. Losing is not an option.');
		this.world.actions?.forceNpcBattlePlayer(this.world.currentPlayerID, this.targetID);
		this.endDialogue();
	}
}
