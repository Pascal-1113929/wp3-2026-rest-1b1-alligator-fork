import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useState } from "react"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const chartConfig = {
    avg: {
        label: "Gemiddelde",
        color: "var(--color-chart-1)",
    },
    kennen: {
        label: "kennen",
        color: "var(--color-chart-1)",
    },
    kunnen: {
        label: "kunnen",
        color: "var(--color-chart-2)",
    },
    confidence: {
        label: "confidence",
        color: "var(--color-chart-3)",
    },
}

const convertToPercentages = (data) => {
    return data.map((item) => {
        const newItem = { ...item };
        Object.keys(newItem).forEach((key) => {
            if (key !== "date" && typeof newItem[key] === "number") {
                newItem[key] = +(newItem[key] * 100).toFixed(1); // multiply by 100 and round to 1 decimal
            }
        });
        return newItem;
    });
};

const ChartArea = ({ data }) => {
    const [toggle, setToggle] = useState(false)

    const percentData = data ? convertToPercentages(data) : [];

    return (
        <div>
            {(!data || data.length < 2) ? (<h2 className="text-xl mb-4">Niet genoeg data om grafiek in te laden</h2>) : (
                <div>
                    <h2 className="text-xl mb-4">Voortgang over tijd</h2>
                    <div>
                        <div className="flex items-center space-x-3">
                            <span className={!toggle ? "font-semibold" : "text-muted-foreground"}>
                                Gemiddelde
                            </span>
                            <Switch
                                id="mode-toggle"
                                checked={toggle}
                                onCheckedChange={setToggle}
                            />
                            <Label className="hidden" htmlFor="mode-toggle">Gemiddelde of losse waardes</Label>
                            <span className={toggle ? "font-semibold" : "text-muted-foreground"}>
                                Losse waardes
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <ChartContainer config={chartConfig}>
                                <LineChart
                                    accessibilityLayer
                                    data={percentData}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`} />
                                    <ChartTooltip
                                        cursor={true}
                                        content={<ChartTooltipContent />}
                                    />
                                    {toggle ? (
                                        ["kennen", "kunnen", "confidence"].map((key, index) => (
                                            <Line
                                                key={key}
                                                dataKey={key}
                                                type="linear"
                                                stroke={`var(--color-chart-${index + 1})`}
                                                strokeWidth={2}
                                                dot={{ fill: `var(--color-chart-${index + 1})` }}
                                                activeDot={{ r: 6 }}
                                            />
                                        ))
                                    ) : (
                                        <Line
                                            dataKey="avg"
                                            type="linear"
                                            stroke="var(--color-chart-1)"
                                            strokeWidth={2}
                                            dot={{ fill: "var(--color-chart-1)" }}
                                            activeDot={{ r: 6 }}
                                        />
                                    )}
                                </LineChart>
                            </ChartContainer>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>

    );
}

export default ChartArea;