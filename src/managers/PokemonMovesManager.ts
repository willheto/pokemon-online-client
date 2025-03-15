import Cache from '../cache';

interface StaticPokemonMoveData {
	id: number;
	name: string;
	type: string;
	category: number;
	power: number | null;
	accuracy: number | null;
	pp: number;
}

export default class PokemonMovesManager {
	private pokemonMoves: StaticPokemonMoveData[] = [];

	constructor() {
		this.loadPokemonMoves();
	}

	private async loadPokemonMoves(): Promise<void> {
		const blob = await Cache.getObjectURLByAssetName('pokemonMoves.json');

		if (!blob) {
			throw new Error('PokemonMoves blob not found');
		}

		const pokemonMoves = await fetch(blob).then(response => response.json());
		this.pokemonMoves = pokemonMoves;
	}

	public getPokemonMoveInfoById(id: number): StaticPokemonMoveData | null {
		return this.pokemonMoves.find(pokemonMove => pokemonMove.id === id) || null;
	}

	public getAllPokemonMoves(): StaticPokemonMoveData[] {
		return this.pokemonMoves;
	}
}
