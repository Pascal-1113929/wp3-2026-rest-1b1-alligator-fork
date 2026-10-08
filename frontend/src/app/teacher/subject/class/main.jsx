import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

import { useAuth } from "@/context/auth-provider.jsx";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";

import { Button } from "@/components/ui/button.tsx";

import { BarChart, BarChart2 } from "@/components/ui/chart.tsx";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

import api from "@/utils/api.js";
import {
    IconBulb,
    IconBolt,
    IconReload,
    IconSquareX,
} from "@tabler/icons-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
    IconInfoCircle,
} from "@tabler/icons-react";

const TeacherSubjectClassPage = () => {
    let { subjectId, classId } = useParams();
    const [classData, setClassData] = useState({});
    const [progressData, setProgressData] = useState([]);
    const [problemTopics, setProblemTopics] = useState([]);
    const [learningGoalOverview, setLearningGoalOverview] = useState([]);
    const [taxonomyAverages, setTaxonomyAverages] = useState([]);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [loadingAi, setLoadingAi] = useState(false);
    const [showAiSuggestions, setShowAiSuggestions] = useState(false);
    const { userObject } = useAuth();
    const navigate = useNavigate();
    const sortedTopics = [...problemTopics].sort(
        (a, b) => a.average - b.average,
    );
    const topicsToShow = sortedTopics.slice(0, 6);
    const getColor = (avg) => {
        if (avg < 0.4) return "bg-red-500";
        if (avg < 0.7) return "bg-yellow-400";
        return "bg-green-500";
    };
    const config = {
        kennen: {
            label: "Kennen",
            color: "#ffe01d",
        },
        kunnen: {
            label: "Kunnen",
            color: "#004df5",
        },
        confidence: {
            label: "Confidence",
            color: "#3dbb56",
        },
    };

    const config2 = {
        onthouden: {
            label: "Onthouden",
            color: "#ffe01d",
        },
        begrijpen: {
            label: "Begrijpen",
            color: "#004df5",
        },
        toepassen: {
            label: "Toepassen",
            color: "#3dbb56",
        },
        analyseren: {
            label: "Analyseren",
            color: "#ffe01d",
        },
    };

    if (!userObject || !userObject.role == "teacher") {
        navigate("/error", { state: 401 });
    }

    if (!subjectId || !classId) {
        navigate("/error", { state: 404 });
    }

    useEffect(() => {
        const fetchClassData = async () => {
            const validate_response = await api(
                `/teacher/${classId}/subject/${subjectId}`,
                "GET",
            );
            const validate_data = await validate_response.json();
            if (
                validate_data.status === "error" &&
                validate_data.message === "class_subject not found"
            ) {
                // navigate("/error", {state: 403})
                console.error("class_subject not valid");
                return;
            }
            const response = await api(`/class/${classId}`, "GET");
            const data = await response.json();
            setClassData(data.class_object);

            const progress_response = await api(
                `/teacher/${classId}/subject/${subjectId}/class-overview`,
            );
            const progress = await progress_response.json();
            setProgressData(progress.students);

            const topics_response = await api(
                `/teacher/${classId}/subject/${subjectId}/problematic-topics`,
            );
            const topics = await topics_response.json();
            setProblemTopics(topics.topics || []);

            const learninggoal_overview = await api(
                `/teacher/${classId}/subject/${subjectId}/learning-goal_overview`,
            );
            const overview = await learninggoal_overview.json();
            setLearningGoalOverview(overview.averages || []);

            const taxonomy_averages = await api(
                `subject/${classId}/subject/${subjectId}/taxonomy_averages`,
            );
            const tax_avg = await taxonomy_averages.json();
            setTaxonomyAverages(tax_avg.goals);
        };

        fetchClassData();
    }, [subjectId, classId]);

    const fetchAiSuggestions = async () => {
        setLoadingAi(true);
        setShowAiSuggestions(true);
        try {
            const response = await api(
                `/teacher/${classId}/subject/${subjectId}/ai-lesson-suggestions`,
                "GET",
            );
            const data = await response.json();
            if (data.status === "ok") {
                setAiSuggestions(data.suggestions || []);
            } else {
                setAiSuggestions([
                    data.message || "Kon geen AI-suggesties genereren.",
                ]);
            }
        } catch (error) {
            console.error("Error fetching AI suggestions:", error);
            setAiSuggestions([
                "Er is een fout opgetreden bij het ophalen van AI-suggesties.",
            ]);
        } finally {
            setLoadingAi(false);
            const data = await response.json();
            setClassData(data.class_object);
        }
    };

    return (
        <div className="w-[80vw] p-4">
            <h1 className="text-3xl text-center">Klas {classData.name}</h1>
            {classData.students && (
                <section>
                    <h2 className="text-xl text-center">Leerlingen</h2>
                    <p className="text-md mb-2">
                        Uitblinkende Leerlingen zijn{" "}
                        <span className="text-green-500">groen</span>,
                        Achterlopende Leerlingen zijn{" "}
                        <span className="text-red-500">rood</span>
                    </p>
                    <HoverCard openDelay={10} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <IconInfoCircle />
                        </HoverCardTrigger>
                        <HoverCardContent className="flex flex-col gap-0.5 text-md" side="top">
                            <div className="flex flex-col gap-1 text-md">
                                <h3 className="text-lg">Berekening uitleg</h3>
                                <p>Wie Uitblinkt en Achterloopt wordt berkened door het klas gemiddelde te pakken en voor Achterlopendhier 5% vanaf halen en voor Uitblinken hier 20% op</p>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Naam</TableHead>
                                <TableHead>Kennen</TableHead>
                                <TableHead>Kunnen</TableHead>
                                <TableHead>Confidence</TableHead>
                                <TableHead>Acties</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classData.students.map((student) => {
                                const progress =
                                    progressData.find(
                                        (p) => p.student_id === student.id,
                                    ) || {};

                                return (
                                    <TableRow
                                        key={student.id}
                                        className={
                                            progress.status == "weak"
                                                ? "bg-red-500 hover:bg-red-900"
                                                : progress.status == "strong"
                                                    ? "bg-green-500 hover:bg-green-900"
                                                    : ""
                                        }
                                    >
                                        <TableCell
                                            className={
                                                progress.status == "weak"
                                                    ? "text-white"
                                                    : progress.status ==
                                                        "strong"
                                                        ? "text-white"
                                                        : ""
                                            }
                                        >
                                            {student.name}
                                        </TableCell>
                                        <TableCell
                                            className={
                                                progress.status == "weak"
                                                    ? "text-white"
                                                    : progress.status ==
                                                        "strong"
                                                        ? "text-white"
                                                        : ""
                                            }
                                        >
                                            {progress.kennen ?? "-"}
                                        </TableCell>
                                        <TableCell
                                            className={
                                                progress.status == "weak"
                                                    ? "text-white"
                                                    : progress.status ==
                                                        "strong"
                                                        ? "text-white"
                                                        : ""
                                            }
                                        >
                                            {progress.kunnen ?? "-"}
                                        </TableCell>
                                        <TableCell
                                            className={
                                                progress.status == "weak"
                                                    ? "text-white"
                                                    : progress.status ==
                                                        "strong"
                                                        ? "text-white"
                                                        : ""
                                            }
                                        >
                                            {progress.confidence ?? "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() =>
                                                    navigate(
                                                        `/student/${student.id}/subject/${subjectId}`,
                                                    )
                                                }
                                            >
                                                Bekijk Leerling Taxonomie
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </section>
            )}

            {taxonomyAverages && (
                <section className="mt-10">
                    <h2 className="text-xl text-center">
                        Gemiddeldes per Leerdoel - per Taxonomie niveau
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full mt-10">
                        {taxonomyAverages.map((goal) => (
                            <BarChart2
                                key={goal.learning_goal_id}
                                data={[
                                    {
                                        title: goal.title,
                                        onthouden:
                                            goal.weak_strong_averages[0]
                                                .taxonomy_scores.Onthouden,
                                        begrijpen:
                                            goal.weak_strong_averages[0]
                                                .taxonomy_scores.Begrijpen,
                                        toepassen:
                                            goal.weak_strong_averages[0]
                                                .taxonomy_scores.Toepassen,
                                        analyseren:
                                            goal.weak_strong_averages[0]
                                                .taxonomy_scores.Analyseren,
                                    },
                                ]}
                                config={config2}
                            ></BarChart2>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-10 w-full mt-10">
                        <div className="mt-10">
                            <h3 className="text-lg font-bold">
                                Sterkste taxonomie niveaus
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50%] font-bold">
                                            Leerdoel
                                        </TableHead>
                                        <TableHead className="font-bold">
                                            Taxonomie niveau
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                {taxonomyAverages.map((goal) => (
                                    <TableBody key={goal.learning_goal_id}>
                                        <TableRow>
                                            <TableCell>{goal.title}</TableCell>
                                            {goal.weak_strong_averages[0]
                                                .strongpoints.length > 0 ? (
                                                goal.weak_strong_averages[0].strongpoints.map(
                                                    (avg) => (
                                                        <TableCell key={avg.id}>
                                                            {avg.taxonomy_level}
                                                        </TableCell>
                                                    ),
                                                )
                                            ) : (
                                                <TableCell>-</TableCell>
                                            )}
                                        </TableRow>
                                    </TableBody>
                                ))}
                            </Table>
                        </div>

                        <div className="mt-10">
                            <h3 className="text-lg font-bold">
                                Zwakste taxonomie niveaus
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50%] font-bold">
                                            Leerdoel
                                        </TableHead>
                                        <TableHead className="font-bold">
                                            Taxonomie niveau
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                {taxonomyAverages.map((goal) => (
                                    <TableBody key={goal.learning_goal_id}>
                                        <TableRow>
                                            <TableCell>{goal.title}</TableCell>
                                            {goal.weak_strong_averages[0]
                                                .weakpoints.length > 0 ? (
                                                goal.weak_strong_averages[0].weakpoints.map(
                                                    (avg) => (
                                                        <TableCell key={avg.id}>
                                                            {avg.taxonomy_level}
                                                        </TableCell>
                                                    ),
                                                )
                                            ) : (
                                                <TableCell>-</TableCell>
                                            )}
                                        </TableRow>
                                    </TableBody>
                                ))}
                            </Table>
                        </div>
                    </div>
                    <div className="mt-15">
                        <h3 className="text-lg font-bold">
                            Algemene gemiddeldes per leerdoel:{" "}
                        </h3>
                        <p>Dit is gesorteerd van hoog naar laag</p>
                        {taxonomyAverages.sort((a, b) => b.weak_strong_averages[0].overall_average - a.weak_strong_averages[0].overall_average).map((goal) => (
                            <div className="mt-5">
                                <p key={goal.learning_goal_id}>
                                    {goal.title}:{" "}
                                    {goal.weak_strong_averages[0].overall_average.toFixed(
                                        2,
                                    )}
                                </p>
                                <Progress
                                    value={
                                        goal.weak_strong_averages[0]
                                            .overall_average * 100
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {learningGoalOverview.length > 0 && (
                <section className="mt-15">
                    <h2 className="text-xl text-center">
                        Gemiddeldes per Leerdoel - Kennen, Kunnen, Confidence
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full mt-10">
                        {learningGoalOverview.map((goal) => (
                            <BarChart
                                key={goal.learning_goal_id}
                                data={[
                                    {
                                        label: goal.learning_goal_title,
                                        kennen: goal.avg_kennen,
                                        kunnen: goal.avg_kunnen,
                                        confidence: goal.avg_confidence,
                                    },
                                ]}
                                config={config}
                            ></BarChart>
                        ))}
                    </div>
                </section>
            )}

            {/* Problematische onderwerpen */}
            {problemTopics.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-xl text-center">
                        Problematische Onderwerpen
                    </h2>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {topicsToShow.map((topic) => (
                            <div
                                key={topic.keyword_id}
                                className="relative group"
                            >
                                <Card className="bg-gray-100 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex flex-col p-0 scale-90 overflow-hidden">
                                    {/* TOP */}
                                    <div className="h-10 flex items-end justify-center text-center px-2">
                                        <h3 className="text-base font-bold">
                                            {topic.title}
                                        </h3>
                                    </div>

                                    {/* BOTTOM */}
                                    <div className="w-full bg-red-500 h-5 flex items-center">
                                        <div
                                            className="h-full flex items-center justify-center text-xs text-white font-bold"
                                            style={{
                                                width: `${topic.average * 100}%`,
                                                backgroundColor: "#004df5",
                                            }}
                                        >
                                            {Math.round(topic.average * 100)}%
                                        </div>
                                    </div>
                                </Card>

                                {/* TOOLTIP */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-white text-black text-xs rounded-xl shadow-lg p-3 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                                    <p>
                                        kennen: {Math.round(topic.kennen * 100)}
                                        %
                                    </p>
                                    <p>
                                        kunnen: {Math.round(topic.kunnen * 100)}
                                        %
                                    </p>
                                    <p>
                                        confidence:{" "}
                                        {Math.round(topic.confidence * 100)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="mt-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl text-center">
                            AI Lesideeën Suggesties
                        </CardTitle>
                        <CardDescription className="text-center">
                            Gebruik AI om lesideeën te genereren op basis van de
                            problematische onderwerpen in deze klas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!showAiSuggestions ? (
                            <div className="text-center">
                                <Button
                                    onClick={fetchAiSuggestions}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <IconBolt />
                                    Genereer AI Lesideeën
                                </Button>
                            </div>
                        ) : (
                            <div>
                                {loadingAi ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                        <p className="text-gray-600">
                                            AI-suggesties worden gegenereerd...
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Dit kan even duren
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {aiSuggestions.length > 0 ? (
                                            aiSuggestions.map(
                                                (suggestion, index) => (
                                                    <Card
                                                        key={index}
                                                        className="bg-gray-50 border-gray-200"
                                                    >
                                                        <CardContent className="pt-6">
                                                            <div className="flex items-start mb-2">
                                                                <div className="bg-blue-100 text-blue-800 rounded-full p-2 mr-3">
                                                                    <IconBulb
                                                                        size={
                                                                            24
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-lg">
                                                                        Suggestie{" "}
                                                                        {index +
                                                                            1}
                                                                    </h4>
                                                                </div>
                                                            </div>
                                                            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                                                                {suggestion}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ),
                                            )
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-600">
                                                    Geen AI-suggesties
                                                    beschikbaar
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="flex justify-between">
                                                <Button
                                                    variant="outline"
                                                    onClick={fetchAiSuggestions}
                                                    disabled={loadingAi}
                                                >
                                                    {loadingAi ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                                            Opnieuw genereren...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconReload />
                                                            Nieuwe suggesties
                                                            genereren
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setShowAiSuggestions(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    <IconSquareX />
                                                    Sluiten
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
};

export default TeacherSubjectClassPage;
