"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartRadarDots } from "@/components/ui/chart-radar";
import api from "@/utils/api";

const TAXONOMY_LEVELS = ["Onthouden", "Begrijpen", "Toepassen", "Analyseren"];

export function ChartTaxonomy() {
    const [taxonomyData, setTaxonomyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTaxonomyData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await api("/dashboard/taxonomy", "GET");

                if (!response.ok) {
                    throw new Error("Kon taxonomie data niet ophalen");
                }

                const data = await response.json();
                setTaxonomyData(data.taxonomy);
            } catch (err) {
                console.error("Error fetching taxonomy data:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Er is een fout opgetreden bij het ophalen van de data",
                );
                const emptyData = {};
                TAXONOMY_LEVELS.forEach((level) => {
                    emptyData[level] = { kennen: 0, kunnen: 0, confidence: 0 };
                });
                setTaxonomyData(emptyData);
            } finally {
                setLoading(false);
            }
        };

        fetchTaxonomyData();
    }, []);

    const getChartData = () => {
        if (!taxonomyData) return {};

        const chartData = {};

        TAXONOMY_LEVELS.forEach((level) => {
            const levelData = taxonomyData[level] || {
                kennen: 0,
                kunnen: 0,
                confidence: 0,
            };

            chartData[level] = [
                { item: "Kennen", value: levelData.kennen },
                { item: "Kunnen", value: levelData.kunnen },
                { item: "Vertrouwen", value: levelData.confidence },
            ];
        });

        return chartData;
    };

    const chartData = getChartData();

    const renderChart = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Taxonomie data laden...
                        </p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Probeer de pagina te vernieuwen
                        </p>
                    </div>
                </div>
            );
        }

        if (!chartData || Object.keys(chartData).length === 0) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Nog geen taxonomie data beschikbaar
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Er zijn nog geen scores geregistreerd
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
                {TAXONOMY_LEVELS.map((level) => {
                    const data = chartData[level] || [
                        { item: "Kennen", value: 0 },
                        { item: "Kunnen", value: 0 },
                        { item: "Vertrouwen", value: 0 },
                    ];

                    const hasData = data.some((item) => item.value > 0);

                    return (
                        <div
                            key={level}
                            className="flex flex-col items-center min-w-0 p-2"
                        >
                            <div className="w-full h-full min-h-0">
                                {hasData ? (
                                    <ChartRadarDots
                                        chart={data}
                                        datakey="item"
                                        format={(value) =>
                                            `${(value * 100).toFixed(0)}%`
                                        }
                                        domain={[0, 1]}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">
                                                Geen data
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm font-bold mt-2">
                                {level}
                            </div>
                            {hasData && (
                                <div className="text-xs text-muted-foreground mt-1 text-center">
                                    {data.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-center gap-1"
                                        >
                                            <span className="font-medium">
                                                {item.item}:
                                            </span>
                                            <span>
                                                {(item.value * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader className="items-center">
                <CardTitle>Taxonomie Overzicht</CardTitle>
                <CardDescription>
                    Toont je voortgang in verschillende vaardigheden per
                    taxonomieniveau
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 flex flex-col items-center">
                {renderChart()}
            </CardContent>
        </Card>
    );
}
