"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-provider.jsx";
import { ChartTaxonomy } from "@/components/chart-taxonomy";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    IconBook,
    IconSchool,
    IconUsers,
    IconBuilding,
} from "@tabler/icons-react";
import api from "@/utils/api";

export default function Page() {
    const { userObject } = useAuth();
    const [stats, setStats] = useState({
        totalSubjects: 0,
        totalStudents: 0,
        totalClasses: 0,
    });
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    const isTeacher = userObject?.role?.role === "teacher";

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statsResponse = await api("/dashboard/stats", "GET");
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData.stats);
                }

                const subjectsResponse = await api(
                    "/dashboard/subjects",
                    "GET",
                );
                if (subjectsResponse.ok) {
                    const subjectsData = await subjectsResponse.json();
                    setSubjects(subjectsData.subjects);
                }

                const classesResponse = await api("/dashboard/classes", "GET");
                if (classesResponse.ok) {
                    const classesData = await classesResponse.json();
                    setClasses(classesData.classes);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isTeacher]);

    const renderStatsCards = () => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {isTeacher ? "Klassen" : "Klas"}
                    </CardTitle>
                    <IconBuilding className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {isTeacher
                            ? stats.totalClasses || classes.length
                            : classes.length > 0
                              ? 1
                              : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {isTeacher ? "Actieve klassen" : "Huidige klas"}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {isTeacher ? "Studenten" : "Vakken"}
                    </CardTitle>
                    {isTeacher ? (
                        <IconUsers className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <IconBook className="h-4 w-4 text-muted-foreground" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {isTeacher
                            ? stats.totalStudents
                            : stats.totalSubjects || subjects.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {isTeacher ? "Totaal studenten" : "Actieve vakken"}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {isTeacher ? "Vakken" : "Docenten"}
                    </CardTitle>
                    <IconBook className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {isTeacher
                            ? stats.totalSubjects || subjects.length
                            : "1"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {isTeacher ? "Actieve vakken" : "Hoofddocent"}
                    </p>
                </CardContent>
            </Card>
        </div>
    );

    const renderSubjectsList = () => (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>
                    {isTeacher ? "Vakken die je geeft" : "Jouw vakken"}
                </CardTitle>
                <CardDescription>
                    {isTeacher
                        ? "Alle vakken die je onderwijst"
                        : "Vakken waar je aan deelneemt"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {subjects.length > 0 ? (
                    <div className="space-y-3">
                        {subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <IconBook className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {subject.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {isTeacher ? "Docent" : "Student"}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="outline">
                                    {subject.type === "teacher"
                                        ? "Docent"
                                        : "Student"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <IconBook className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            {isTeacher
                                ? "Nog geen vakken toegewezen"
                                : "Nog geen vakken in je klas"}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderClassesList = () => (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>
                    {isTeacher ? "Jouw klassen" : "Jouw klas"}
                </CardTitle>
                <CardDescription>
                    {isTeacher
                        ? "Overzicht van al je klassen"
                        : "Informatie over je klas"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {classes.length > 0 ? (
                    <div className="space-y-4">
                        {classes.map((classInfo) => (
                            <div
                                key={classInfo.id}
                                className="p-4 rounded-lg border space-y-3 hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <IconSchool className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {classInfo.name}
                                            </h3>
                                            {isTeacher && (
                                                <p className="text-sm text-muted-foreground">
                                                    {classInfo.studentCount}{" "}
                                                    studenten
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge>
                                        {isTeacher ? "Docent" : "Student"}
                                    </Badge>
                                </div>

                                {classInfo.subjects.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">
                                            Vakken ({classInfo.subjectCount}):
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {classInfo.subjects.map(
                                                (
                                                    subject: string,
                                                    index: number,
                                                ) => (
                                                    <Badge
                                                        key={index}
                                                        variant="secondary"
                                                    >
                                                        {subject}
                                                    </Badge>
                                                ),
                                            )}
                                            {classInfo.subjectCount >
                                                classInfo.subjects.length && (
                                                <Badge variant="outline">
                                                    +
                                                    {classInfo.subjectCount -
                                                        classInfo.subjects
                                                            .length}{" "}
                                                    meer
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <IconSchool className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            {isTeacher
                                ? "Nog geen klassen toegewezen"
                                : "Nog niet ingedeeld in een klas"}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const renderLoadingState = () => (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Dashboard laden...</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-6 md:gap-8">
                <div className="flex flex-col gap-6 py-4 md:py-6">
                    {loading ? (
                        renderLoadingState()
                    ) : (
                        <>
                            <div className="px-4 lg:px-6">
                                <Card className="overflow-hidden border-primary/20">
                                    <CardContent className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                                        Welkom terug,{" "}
                                                        {userObject?.name ||
                                                            "Gebruiker"}
                                                        !
                                                    </h1>
                                                    <Badge
                                                        className="w-fit"
                                                        variant={
                                                            isTeacher
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {isTeacher
                                                            ? "Docent"
                                                            : "Student"}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground text-sm md:text-base max-w-3xl">
                                                    {isTeacher
                                                        ? "Hier vind je een overzicht van al je klassen, studenten en vakken."
                                                        : "Hier vind je een overzicht van je klas en vakken."}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="px-4 lg:px-6">
                                {renderStatsCards()}
                            </div>

                            <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 lg:grid-cols-2">
                                {renderSubjectsList()}
                                {renderClassesList()}
                            </div>

                            {subjects.length > 0 && (
                                <div className="px-4 lg:px-6">
                                    <ChartTaxonomy />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}