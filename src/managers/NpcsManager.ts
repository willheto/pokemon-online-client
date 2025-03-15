import Cache from '../cache';

interface StaticNpcData {
	npcIndex: number;
	name: string;
	spriteName: string;
	isTalkable: boolean;
}

export default class NpcsManager {
	private npcs: StaticNpcData[] = [];

	constructor() {
		this.loadNpcs();
	}

	private async loadNpcs(): Promise<void> {
		const blob = await Cache.getObjectURLByAssetName('npcs.json');

		if (!blob) {
			throw new Error('Npcs blob not found');
		}

		const npcs = await fetch(blob).then(response => response.json());
		this.npcs = npcs;
	}

	public getNpcInfoByIndex(index: number): StaticNpcData | null {
		return this.npcs.find(npc => npc.npcIndex === index) || null;
	}

	public getAllNpcs(): StaticNpcData[] {
		return this.npcs;
	}
}
