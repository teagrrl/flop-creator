import type { NextApiRequest, NextApiResponse } from 'next'
import * as SpeciesData from "./species.json"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	switch(req.method) {
		case "GET":
			res.status(200).json(SpeciesData)
			break
		default:
			res.setHeader("Allow", ["GET"])
			res.status(405).json({ error: `Method ${req.method} Not Allowed` })
	}
}
