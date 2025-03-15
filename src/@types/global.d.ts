declare const LOGIN_SERVER_ADDRESS: string;
declare const UPDATE_SERVER_ADDRESS: string;
declare const GAME_SERVER_ADDRESS: string;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type BattleActionType = 'FIGHT' | 'ITEM' | 'POKEMON' | 'RUN';



interface DialogueStep {
	speaker: string;
	text: string;
	options?: DialogueOption[];
	onStepComplete?: () => void;
}

interface DialogueOption {
	optionText: string;
	optionAction: () => void;
}

interface SocketGameState {
	tickTalkEvents: SocketTalkEvent[];
	tickSoundEvents: SocketSoundEvent[];
	tickBattleEvents: SocketBattleEvent[];
	tickBattleTurnEvents: SocketBattleTurnEvent[];
	tickWildPokemonEvents: SocketWildPokemonEvent[];
	tickWildBattleTurnEvents: SocketWildBattleTurnEvent[];

	players: SocketPlayer[];
	npcs: SocketNpc[];

	chatMessages: SocketChatMessage[];
	items: SocketItem[];
	shops: SocketShop[];

	playerID: string;
	onlinePlayers: string[];
}

interface SocketTalkEvent {
	talkerID: string;
	targetID: string;
	targetIndex: number;
	dialogueNumber: number;
}

interface SocketSoundEvent {
	soundName: string;
	isSfx: boolean;
	shouldInterrupt: boolean;
	entityID: string; // Played to whom
}

interface SocketBattleEvent {
	entity1ID: string;
	entity2ID: string;
}

interface SocketBattleTurnEvent {
	playerID: string;
	opponentID: string;
	moveId: number;
	newHp: number;
	isBattleOver: boolean;
	isAllPokemonsFainted: boolean;
	isPlayerWinner: boolean;
	isRunSuccessful: boolean;
	itemUsedId: number;
	switchedPokemonIndex: number;
	effect: number;
	actionType: BattleActionType;
	isCaught: boolean;
}

interface SocketWildPokemonEvent {
	entityID: string;
	wildPokemon: SocketPokemon;
}

interface SocketPokemon {
	id: number;
	xp: number;
	hp: number;
	maxHp: number;
	moves: number[];
}

interface SocketWildBattleTurnEvent {
	playerID: string;
	moveId: number;
	newHp: number;
	isPlayersMove: boolean;
	isBattleOver: boolean;
	isAllPokemonsFainted: boolean;
	isPlayerWinner: boolean;
	isRunSuccessful: boolean;
	itemUsedId: number;
	switchedPokemonIndex: number;
	effect: number;
	actionType: BattleActionType;
	isCaught: boolean;
}

interface SocketNpc extends SocketEntity {
	npcIndex: number;
}

interface SocketPlayer extends SocketEntity {
	storyProgress: number;
	inventory: number[];
	inventoryAmounts: number[];
}

interface SocketEntity {
	entityID: string;
	worldX: number;
	worldY: number;
	nextTileDirection: Direction | null;
	facingDirection: Direction;
	name: string;
	currentChunk: number;
	party: SocketPokemon[];
}

interface SocketChatMessage {
	senderName: string;
	message: string;
	timeSent: string;
	isGlobal: boolean;
	isChallenge: boolean;
	challengerID: string;
}

interface SocketItem {
	itemID: number;
	name: string;
	spriteName: string;
	value: number;
	isStackable: boolean;
	amount: number;
	worldX: number | null;
	worldY: number | null;
}

interface SocketShop {
	shopID: string;
	shopName: string;
	sellsAtPercentage: number;
	buysAtPercentage: number;
	buysAnything: boolean;
}
