import {
    IconCreditCard,
    IconDotsVertical,
    IconLogout,
    IconNotification,
    IconUserCircle,
    IconDevices,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-provider.jsx";
import { useNavigate } from "react-router";

async function sha256Hex(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(hashBuffer)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export function NavUser() {
    const { isMobile } = useSidebar();
    const [hash, setHash] = useState<string>("");
    const { userObject, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        sha256Hex(userObject.email.trim().toLowerCase()).then(setHash);
    }, [userObject.email]);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {hash && (
                                    <AvatarImage
                                        src={`https://www.gravatar.com/avatar/${hash}?d=404`}
                                        alt={userObject.name}
                                    />
                                )}
                                <AvatarFallback className="rounded-lg">
                                    {userObject.name
                                        .split(" ")
                                        .map((part) => part[0])
                                        .filter(
                                            (char, index, arr) =>
                                                index === 0 ||
                                                index === arr.length - 1,
                                        )
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {userObject.name}
                                </span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {userObject.email}
                                </span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            {/*<DropdownMenuItem
                                onClick={() => navigate("/profile")}
                            >
                                <IconUserCircle />
                                Profiel
                                </DropdownMenuItem>*/}
                            <DropdownMenuItem
                                onClick={() => navigate("/sessions")}
                            >
                                <IconDevices />
                                Actieve apparaten
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <IconLogout />
                                        Uitloggen
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Weet je het zeker?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Je wordt uitgelogd en moet opnieuw
                                            inloggen om toegang te krijgen.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Annuleren
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => logout()}
                                        >
                                            Uitloggen
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
