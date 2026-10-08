import { useParams } from "react-router";
import { useAuth } from "@/context/auth-provider.jsx";
import { useEffect, useState } from "react";
import { IconLoader } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LearningGoalCard from "@/components/learning-goal-data.tsx";
import StrengthsAndWeaknesses from "@/components/strengths-and-weaknesses.jsx";
import ChartArea from "@/components/chart-area";

import api from "@/utils/api.js";

export default function Subject() {
    let { paramStudentId, subjectId } = useParams();
    const { userObject } = useAuth();

    const [subjectData, setSubjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [isOpen, setIsOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [selectedGoalData, setSelectedGoalData] = useState(null);
    const [weakpoints, setWeakpoints] = useState(null);
    const [goalDataSnapshot, setGoalDataSnapshot] = useState(null);
    const [timeChartData, setTimeChartData] = useState(null);

    let studentId;

    if (!paramStudentId) {
        studentId = userObject?.id;
    } else {
        studentId = paramStudentId;
    }

    useEffect(() => {
        const fetchGoalData = async () => {
            try {
                let url = `/subject/${subjectId}/learning-goal/${selectedGoal}`
                if (paramStudentId) {
                    url = `/subject/${subjectId}/learning-goal/${selectedGoal}?s_id=${studentId}`
                }
                const response = await api(url, "GET");
                const data = await response.json();
                setSelectedGoalData(data.learning_goals_object);
                setGoalDataSnapshot(data.all_snapshots);
                setTimeChartData(data.chart_data_object)
            } catch (error) {
                console.error("Error fetching goal data:", error);
            }
        };
        const fetchWeakpoints = async () => {
            try {
                let url = `/subject/${subjectId}/learning-goal/${selectedGoal}/strong-weak-points`
                console.log(paramStudentId)
                if (paramStudentId) {
                    url = `/subject/${subjectId}/learning-goal/${selectedGoal}/strong-weak-points?s_id=${studentId}`
                }
                const response = await api(url, "GET");
                const data = await response.json();
                setWeakpoints(data.weakpoints_object);
            } catch (error) {
                console.error("Error fetching weak point data:", error);
            }
        };
        if (selectedGoal) {
            fetchGoalData();
            fetchWeakpoints();
        }
    }, [selectedGoal]);

    useEffect(() => {
        if (subjectData?.learning_goals?.length && !selectedGoal) {
            setSelectedGoal(subjectData.learning_goals[0].id);
        }
    }, [subjectData]);

    useEffect(() => {
        const fetchsubjectData = async () => {
            try {
                const response = await api(`/subject/${subjectId}`, "GET");
                const data = await response.json();
                setSubjectData(data.subject_object);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchsubjectData();
    }, [studentId, subjectId]);

    return (
        <div className="w-[80vw] p-4">
            {loading ? (
                <IconLoader className="m-auto" />
            ) : (
                <div className="w-full h-full">
                    {!paramStudentId ? (
                        <h1 className="text-3xl text-center">
                            Vak pagina voor {subjectData?.name}
                        </h1>
                    ) : (
                        <h1 className="text-3xl text-center">
                            Vak pagina voor student {studentId} en vak{" "}
                            {subjectData?.name}
                        </h1>
                    )}
                    <Tabs
                        defaultValue={subjectData?.learning_goals?.[0]?.id}
                        onValueChange={(value) => setSelectedGoal(value)}
                    >
                        <section className="w-[60vw] bg-accent mt-7 shadow-md rounded-md p-5 m-auto">
                            <h2 className="text-xl text-center">
                                Selecteer een leerdoel
                            </h2>
                            <TabsList className="w-full">
                                {subjectData?.learning_goals?.map((goal) => (
                                    <TabsTrigger
                                        key={goal.id}
                                        className="p-5"
                                        value={goal.id}
                                    >
                                        {goal.title}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                        </section>
                        <section className="w-[60vw] bg-accent mt-7 shadow-md rounded-md p-5 m-auto">
                            <h2 className="text-xl text-center">
                                Leerdoel: {
                                    subjectData?.learning_goals?.find(g => g.id === selectedGoal)?.title
                                    ?? "Laden..."
                                }
                            </h2>
                            {subjectData?.learning_goals?.map((goal) => (
                                <TabsContent key={goal.id} value={goal.id}>
                                    <div>
                                        <LearningGoalCard
                                            data={goalDataSnapshot}
                                            goal={selectedGoalData}
                                        />
                                        <ChartArea
                                            data={timeChartData}
                                        />
                                        {weakpoints && (
                                            <StrengthsAndWeaknesses
                                                keywords={weakpoints.keywords}
                                                analyses={weakpoints.analyses}
                                                weakpoints={
                                                    weakpoints.analyses.weakpoints
                                                }
                                                strongpoints={
                                                    weakpoints.analyses.strongpoints
                                                }
                                            />
                                        )}
                                    </div>
                                </TabsContent>
                            ))}
                        </section>
                    </Tabs>
                </div>
            )}
        </div>
    );
}
