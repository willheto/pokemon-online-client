import Cache from '../cache';

interface StaticPokemonData {
	pokemonIndex: number;
	name: string;
	sprite: string;
	type1: string;
	type2: string | null;
	hp: number;
	attack: number;
	defense: number;
	specialAttack: number;
	specialDefense: number;
	speed: number;
	movesLearned: StaticMoveLearnData[];
}

interface StaticMoveLearnData {
	level: number;
	name: string;
}

const missingNo: StaticPokemonData = {
	pokemonIndex: 0,
	name: 'MissingNo',
	type1: 'normal',
	type2: null,
	sprite: 'missingNo',
	hp: 33,
	attack: 136,
	defense: 0,
	specialAttack: 6,
	specialDefense: 6,
	speed: 29,
	movesLearned: [{ level: 1, name: 'Tackle' }],
};

export default class PokemonsManager {
	private pokemonData: StaticPokemonData[] = [];

	constructor() {
		this.loadPokemons();
	}

	private async loadPokemons(): Promise<void> {
		const blob = await Cache.getObjectURLByAssetName('pokemons.json');

		if (!blob) {
			throw new Error('Pokemons blob not found');
		}

		const pokemons = await fetch(blob).then(response => response.json());
		this.pokemonData = pokemons;
	}

	public getPokemonInfoByIndex(index: number): StaticPokemonData {
		return this.pokemonData.find(pokemon => pokemon.pokemonIndex === index) || missingNo;
	}

	public getAllPokemons(): StaticPokemonData[] {
		return this.pokemonData;
	}
}
