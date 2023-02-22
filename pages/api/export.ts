import { SpeciesComparator, SpeciesModel } from '@data/pokemon'
import { listPokemonSpecies } from '@helpers/pokeapi'
import type { NextApiRequest, NextApiResponse } from 'next'

export type LookupApiResponse = {
	pokemon?: SpeciesModel[],
	error?: string,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	switch(req.method) {
		case "GET":
            const data = await listPokemonSpecies()
			res.status(200).json({ pokemon: data })
			break
		default:
			res.setHeader("Allow", ["GET"])
			res.status(405).json({ error: `Method ${req.method} Not Allowed` })
	}
}
