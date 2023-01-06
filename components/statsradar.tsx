import React from "react"
import { Chart, LineElement, PointElement, RadialLinearScale, Filler, Tooltip } from "chart.js"
import { Radar } from "react-chartjs-2"
import { BaseStatsModel } from "@data/pokemon"
import { PokemonPoolStats } from "@components/pickban"

type StatsRadarProps = {
    stats: BaseStatsModel,
    pool?: PokemonPoolStats,
}

Chart.register(LineElement, PointElement, RadialLinearScale, Filler, Tooltip)

const radarColor = "rgb(191, 155, 16)"
const radarBackgroundColor = "rgba(191, 155, 6, 0.2)"
const radarBorderColor = "rgb(255, 255, 255)"
const gridColor = "rgba(255, 255, 255, 0.1)"

export default function StatsRadar({ stats, pool }: StatsRadarProps) {
    const labels = ["Speed", ["Physical", "Attack"], ["Physical", "Bulk"], ["Special", "Bulk"], ["Special", "Attack"]]
    const max = pool ? [
        Math.max(...pool.speed),
        Math.max(...pool.attack),
        Math.max(...pool.physicalBulk),
        Math.max(...pool.specialBulk),
        Math.max(...pool.specialAttack),
    ] : undefined
    const values = [
        stats.speed,
        stats.attack,
        stats.physicalBulk,
        stats.specialBulk,
        stats.specialAttack,
    ]
    const adjustedValues = max ? values.map((value, index) => value / max[index] * 100) : values

    return (
        <div className="relative">
            {/*<div className="absolute top-0 right-0 px-2 py-0.5 rounded-md text-sm bg-gray-600 cursor-pointer">?</div>*/}
            <Radar
                height={250}
                width={250}
                options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    let label = values[context.dataIndex].toLocaleString()
                                    if(context.dataIndex === 2) label += " NEAT" // number earthquake attacks taken
                                    if(context.dataIndex === 3) label += " TUFF" // turns until flames faint
                                    return label
                                },
                            }
                        }
                    },
                    scales: {
                        r: {
                            pointLabels: {
                                font: {
                                    size: 12,
                                },
                                color: "rgb(255, 255, 255)",
                            },
                            angleLines: {
                                color: gridColor,
                                lineWidth: 2,
                            },
                            ticks: {
                                count: 5,
                                display: false,
                            },
                            grid: {
                                color: gridColor,
                            },
                            min: 0,
                            max: 100,
                        }
                    },
                }}
                data={{
                    labels,
                    datasets: [{
                        data: adjustedValues,
                        fill: true,
                        borderWidth: 2,
                        pointBorderWidth: 1,
                        borderColor: radarColor,
                        backgroundColor: radarBackgroundColor,
                        pointBorderColor: radarBorderColor,
                        pointBackgroundColor: radarColor,
                        pointHoverBorderColor: radarColor,
                        pointHoverBackgroundColor: radarBorderColor,
                    }]
                }}
            />
        </div>
    )
}