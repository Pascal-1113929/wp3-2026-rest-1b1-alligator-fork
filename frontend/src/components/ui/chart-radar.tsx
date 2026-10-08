"use client";

import {
    PolarAngleAxis,
    PolarRadiusAxis,
    PolarGrid,
    Radar,
    RadarChart,
} from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

export const description = "A radar chart with dots";

export function ChartRadarDots({
    config = {
        label: "value",
        color: "var(--chart-1)",
    },
    ...props
}) {
    console.log(props);
    return (
        <ChartContainer config={config} className="mx-auto">
            <RadarChart
                data={props.chart}
                margin={{ top: 0, right: 128, bottom: 0, left: 0 }}
            >
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                    formatter={props.format}
                />
                <PolarAngleAxis dataKey={props.datakey} />
                <PolarRadiusAxis
                    axisLine={false}
                    tick={false}
                    domain={props.domain}
                />
                <PolarGrid />
                <Radar
                    dataKey="value"
                    fill="var(--color-desktop)"
                    fillOpacity={0.6}
                    dot={{
                        r: 4,
                        fillOpacity: 1,
                        stroke: "var(--color-desktop)",
                        strokeWidth: 2,
                    }}
                />
            </RadarChart>
        </ChartContainer>
    );
}
