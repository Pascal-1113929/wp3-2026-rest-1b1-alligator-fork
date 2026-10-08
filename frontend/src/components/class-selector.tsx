"use client";

import { useState, useEffect } from "react";
import { IconSearch } from "@tabler/icons-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/utils/api";

interface ClassOption {
    id: number;
    name: string;
}

interface ClassSelectorProps {
    role?: string;
    selectedClass: ClassOption | null;
    onClassSelect: (classItem: ClassOption) => void;
}

const MAX_CLASSES = 5;

export function ClassSelector({
    role,
    selectedClass,
    onClassSelect,
}: ClassSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
    const [classesLoading, setClassesLoading] = useState(false);
    const [classesError, setClassesError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
            if (role !== "teacher") {
                setClassOptions([]);
                return;
            }

            try {
                setClassesLoading(true);
                setClassesError(null);
                const response = await api("/class", "GET");

                if (!response.ok) {
                    throw new Error(`Kon klassen niet ophalen`);
                }

                const data = await response.json();
                setClassOptions(data.teacher_classes || []);
            } catch (error) {
                console.error(error);
                setClassesError(
                    error instanceof Error
                        ? error.message
                        : "Kon klassen niet laden",
                );
                setClassOptions([]);
            } finally {
                setClassesLoading(false);
            }
        };

        fetchClasses();
    }, [role]);

    const filteredClasses = classOptions.filter((classItem) =>
        classItem.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (role !== "teacher") {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="mb-2 w-full"
                    disabled={classesLoading}
                >
                    {classesLoading ? (
                        "Klassen laden..."
                    ) : selectedClass ? (
                        <span>
                            Klas <strong>{selectedClass.name}</strong>{" "}
                            geselecteerd
                        </span>
                    ) : (
                        "Selecteer klas"
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4} className="w-56">
                <div className="p-2">
                    <div className="relative">
                        <Input
                            placeholder="Klas zoeken..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={classesLoading}
                        />
                        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                </div>
                <DropdownMenuSeparator />

                {classesError ? (
                    <DropdownMenuItem disabled className="text-destructive">
                        {classesError}
                    </DropdownMenuItem>
                ) : filteredClasses.length > 0 ? (
                    <>
                        {filteredClasses
                            .slice(0, MAX_CLASSES)
                            .map((classItem) => (
                                <DropdownMenuItem
                                    key={classItem.id}
                                    onClick={() => onClassSelect(classItem)}
                                >
                                    {classItem.name}
                                </DropdownMenuItem>
                            ))}
                        {filteredClasses.length > MAX_CLASSES && (
                            <DropdownMenuItem disabled>
                                en {filteredClasses.length - MAX_CLASSES} meer
                                klassen...
                            </DropdownMenuItem>
                        )}
                    </>
                ) : (
                    <DropdownMenuItem disabled>
                        {searchQuery
                            ? "Geen klas gevonden"
                            : "Geen klassen beschikbaar"}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
