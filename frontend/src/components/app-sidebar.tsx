import * as React from "react";
import { useEffect, useState } from "react";
import { IconDashboard, IconHexagons, IconHelp } from "@tabler/icons-react";

import { NavCourses } from "@/components/nav-courses";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-provider.jsx";
import { useNavigate } from "react-router";
import api from "@/utils/api";

interface Subject {
    id: string;
    name: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface NavItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
}

const NAV_MAIN_ITEMS: NavItem[] = [
    {
        title: "Overzicht",
        url: "/dashboard",
        icon: IconDashboard,
    },
];

const NAV_SECONDARY_ITEMS: NavItem[] = [
    {
        title: "Hulp nodig?",
        url: "#",
        icon: IconHelp,
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { userObject } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!userObject?.role) {
                setLoading(false);
                return;
            }

            try {
                setError(null);
                const role = userObject.role.role;

                if (role === "student") {
                    const response = await api("/student/subject", "GET");
                    if (!response.ok) {
                        throw new Error(
                            `Failed to fetch student subjects: ${response.status}`,
                        );
                    }
                    const data = await response.json();
                    setSubjects(data.subjects || []);
                } else if (role === "teacher") {
                    if (!selectedClass) {
                        setSubjects([]);
                        return;
                    }
                    const response = await api(
                        `/teacher/${selectedClass.id}/subject`,
                        "GET",
                    );
                    if (!response.ok) {
                        throw new Error(
                            `Failed to fetch teacher subjects: ${response.status}`,
                        );
                    }
                    const data = await response.json();
                    setSubjects(data.all_subjects || []);
                } else {
                    console.warn("Unknown role, cannot fetch subjects", role);
                    setSubjects([]);
                }
            } catch (error) {
                console.error("Error fetching subjects:", error);
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load subjects",
                );
                setSubjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [selectedClass, userObject?.role]);

    const navigate = useNavigate();

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a onClick={() => navigate("/dashboard")}>
                                <img
                                    src="/logo-full.svg"
                                    alt="Logo Test-Correct"
                                    className="h-8 w-auto"
                                />
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={NAV_MAIN_ITEMS} />
                <NavCourses
                    items={subjects}
                    role={userObject?.role?.role}
                    selectedClass={selectedClass}
                    onClassSelect={setSelectedClass}
                    loading={loading}
                    error={error}
                />
                {/*<NavSecondary items={NAV_SECONDARY_ITEMS} className="mt-auto" />*/}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
