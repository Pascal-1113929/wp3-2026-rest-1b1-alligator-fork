import { Progress } from "@/components/ui/progress";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    IconInfoCircle,
} from "@tabler/icons-react";


const StrengthsAndWeaknesses = ({ keywords, analyses, weakpoints, strongpoints }) => {

    const getBarColor = (type) => {
        if (type === "weak") return "bg-red-500";
        if (type === "strong") return "bg-green-500";
        return "bg-gray-300";
    }

    console.log(analyses)

    return (
        <div>
            {weakpoints === null && strongpoints === null ? (
                <h2 className="text-xl mb-4">Geen zwakke of sterke punten gevonden voor deze leerdoelen.</h2>
            ) : weakpoints.length === 0 && strongpoints.length === 0 ? (
                <h2 className="text-xl mb-4">Geen zwakke of sterke punten gevonden voor deze leerdoelen.</h2>
            ) : (
                <div>
                    <h2 className="text-xl mb-4">Zwakke Punten per onderwerp</h2>
                    <div>
                        {keywords.map((keyword, index) => (
                            <div key={index}>
                                <h3 className="text-lg">
                                    <HoverCard openDelay={10} closeDelay={100}>
                                        <HoverCardTrigger asChild>
                                            <span className="flex flex-row">
                                                {keyword.name}<IconInfoCircle />
                                            </span>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="flex flex-col gap-0.5 text-md" side="top">
                                            <div className="flex flex-col gap-1 text-md">
                                                <p>
                                                    <strong>Algemeen gemiddelde:</strong> {analyses.overall_average.toFixed(2)}<br />
                                                    Deze zwakken en sterke punten worden hierop gebaseerd.
                                                </p>
                                                <p>
                                                    <strong>Zwakke punten:</strong> 5% onder het gemiddelde → {analyses.weakpoints_clearance_threshold.toFixed(2)}

                                                </p>
                                                <p>
                                                    <strong>Sterke punten:</strong> 20% boven het gemiddelde → {analyses.strongpoints_clearance_threshold.toFixed(2)}
                                                </p>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                </h3>
                                {/* Weakpoints */}
                                {weakpoints?.length > 0 && (
                                    <div className="mb-2">
                                        <p className="font-medium text-red-600 mb-1">Zwakke punten:</p>
                                        {weakpoints.map((wp, index) => (
                                            <div key={index} className="flex items-center mb-1">
                                                <span className="w-32">{wp.taxonomy_level}</span>
                                                <Progress
                                                    value={wp.score * 100}
                                                    className="w-[40vw] rounded-full bg-gray-200"
                                                    indicatorClassName={getBarColor("weak")}
                                                />
                                                <span className="ml-2 font-mono">{wp.score.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Strongpoints */}
                                {strongpoints?.length > 0 && (
                                    <div className="mb-2">
                                        <p className="font-medium text-green-600 mb-1">Sterke punten:</p>
                                        {strongpoints.map((sp, index) => (
                                            <div key={index} className="flex items-center mb-1">
                                                <span className="w-32">{sp.taxonomy_level}</span>
                                                <Progress
                                                    value={sp.score * 100}
                                                    className="w-[40vw] rounded-full bg-gray-200"
                                                    indicatorClassName={getBarColor("strong")}
                                                />
                                                <span className="ml-2 font-mono">{sp.score.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StrengthsAndWeaknesses;