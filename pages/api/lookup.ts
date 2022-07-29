import { SpeciesComparator, SpeciesModel } from '@data/pokemon'
import { getPokemonDataByNames } from '@helpers/pokeapi'
import type { NextApiRequest, NextApiResponse } from 'next'

export type LookupApiResponse = {
	pokemon?: SpeciesModel[],
	error?: string,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LookupApiResponse>) {
	switch(req.method) {
		case "GET":
			const reqNames: string[] | string | undefined = req.query.names
			const names = typeof reqNames === "string" ? reqNames.split(",") : reqNames ?? []
			if(names.length) {
				const uniqueNames = new Set(names)
				const results = await getPokemonDataByNames(Array.from(uniqueNames))
				const sorted = Array.from(results).sort(SpeciesComparator())
				res.status(200).json({ pokemon: sorted })
			} else {
				res.status(400).json({ error: "Pokemon names are required", })
			}
			break
		default:
			res.setHeader("Allow", ["GET"])
			res.status(405).json({ error: `Method ${req.method} Not Allowed` })
	}
}
