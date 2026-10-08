"use client";

import type { Icon } from "@tabler/icons-react";
import { useNavigate } from "react-router";

import { ClassSelector } from "@/components/class-selector";

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Subject {
    id: string;
    name: string;
    icon?: Icon;
}

interface ClassOption {
    id: number;
    name: string;
}

interface NavCoursesProps {
    items: Subject[];
    role?: string;
    selectedClass: ClassOption | null;
    onClassSelect: (classItem: ClassOption) => void;
    loading?: boolean;
    error?: string | null;
}

interface NavItemProps {
    role: string;
    item: Subject;
    classId: number | null;
}

function NavItem({ role, item, classId }: NavItemProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (role === "student") {
            navigate(`/student/subject/${item.id}`);
        } else if (role === "teacher") {
            navigate(`/teacher/subject/${item.id}/class/${classId}`);
        }
    };

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild onClick={handleClick}>
                <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                </div>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function NavCourses({
    items,
    role,
    selectedClass,
    onClassSelect,
    loading = false,
    error = null,
}: NavCoursesProps) {
    const renderClassSelector = () => {
        return (
            <ClassSelector
                role={role}
                selectedClass={selectedClass}
                onClassSelect={onClassSelect}
            />
        );
    };

    const renderSubjects = () => {
        if (loading) {
            return (
                <div className="py-2 text-center text-sm text-muted-foreground">
                    Vakken laden...
                </div>
            );
        }

        if (error) {
            return (
                <div className="py-2 text-center text-sm text-destructive">
                    {error}
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div className="py-2 text-center text-sm text-muted-foreground">
                    {role === "teacher" && !selectedClass
                        ? "Selecteer eerst een klas"
                        : "Geen vakken beschikbaar"}
                </div>
            );
        }

        return (
            <SidebarMenu>
                {items.map((item) => (
                    <NavItem
                        key={item.id}
                        role={role || ""}
                        classId={selectedClass ? selectedClass.id : null}
                        item={item}
                    />
                ))}
            </SidebarMenu>
        );
    };

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Vakken</SidebarGroupLabel>
            {renderClassSelector()}
            {renderSubjects()}
        </SidebarGroup>
    );
}
