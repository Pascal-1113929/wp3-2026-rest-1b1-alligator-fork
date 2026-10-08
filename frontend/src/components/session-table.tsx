import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/utils/api";

export const schema = z.object({
    id: z.number(),
    first_login: z.string(),
    last_seen: z.string(),
    location: z.string(),
    device: z.string(),
    is_this_device: z.boolean(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
        accessorKey: "first_login",
        header: "Eerste login",
        cell: ({ row }) => (
            <div className="w-32">
                <span className="text-muted-foreground">
                    {row.original.first_login}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "last_seen",
        header: "Laatst gezien",
        cell: ({ row }) => (
            <div className="w-32">
                <span className="text-muted-foreground">
                    {row.original.last_seen}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "location",
        header: "Locatie",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.original.location}
            </span>
        ),
    },
    {
        accessorKey: "device",
        header: "Apparaat",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.original.device}
                {row.original.is_this_device && (
                    <Badge variant="secondary" className="ml-2">
                        Dit apparaat
                    </Badge>
                )}
            </span>
        ),
    },
    {
        id: "actions",
        header: "Acties",
        cell: ({ row, table }) => {
            const isDisabled = row.original.is_this_device;

            const handleDeactivate = async () => {
                const response = await api(
                    "/user/sessions/" + row.original.id,
                    "DELETE",
                );

                if (response.ok) {
                    toast.info(`Sessie gedeactiveerd`);
                    table.options.meta?.removeSession?.(row.original.id);
                } else {
                    toast.error(`Sessie kon niet worden gedeactiveerd`);
                }
            };

            const button = (
                <div className="inline-block">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isDisabled}
                            >
                                Deactiveren
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Sessie deactiveren
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Weet je zeker dat je deze sessie wilt
                                    deactiveren? Dit zal het apparaat uitloggen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeactivate}>
                                    Deactiveren
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );

            if (isDisabled) {
                return (
                    <Tooltip>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent>
                            Kan dit apparaat niet deactiveren
                        </TooltipContent>
                    </Tooltip>
                );
            }

            return button;
        },
    },
];

export function SessionTable({ data }: { data: z.infer<typeof schema>[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [tableData, setTableData] =
        React.useState<z.infer<typeof schema>[]>(data);

    React.useEffect(() => {
        setTableData(data);
    }, [data]);

    const removeSession = (sessionId: number) => {
        setTableData((prevData) =>
            prevData.filter((session) => session.id !== sessionId),
        );
    };

    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            sorting,
        },
        getRowId: (row) => row.id.toString(),
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        meta: {
            removeSession,
        },
    });

    return (
        <>
            <Toaster />
            <div className="w-full flex-col justify-start gap-6">
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="bg-muted sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Momenteel geen actieve apparaten.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
