import { cn } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import api from "@/utils/api";
import { useAuth } from "@/context/auth-provider.jsx";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await api("/auth/login", "POST", {
                body: JSON.stringify({
                    username,
                    password,
                }),
            });
            const data = await response.json();
            if (data.status === "ok") {
                login(data.token, data.user_object);
                return;
            } else {
                setError(data.message || "Een fout is opgetreden");
            }
        } catch (err) {
            console.error(err);
            setError("Een fout is opgetreden bij het inloggen");
        }
        setIsSubmitting(false);
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welkom terug!</CardTitle>
                    <CardDescription>
                        Voeg uw email en wachtwoord in om in te loggen.
                    </CardDescription>
                </CardHeader>
                {error && (
                    <div className="px-6">
                        <Alert variant="error">
                            <AlertTitle>Foutmelding</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="username">
                                    Gebruikersnaam of Email
                                </FieldLabel>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Gebruikersnaam"
                                    required
                                    autoFocus
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    autoComplete="username"
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">
                                        Wachtwoord
                                    </FieldLabel>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Wachtwoord"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="password"
                                />
                                {/*<div className="flex items-center">
                                    <a
                                        href="#"
                                        className="ml-auto text-sm underline-offset-4 hover:underline"
                                    >
                                        Wachtwoord vergeten?
                                    </a>
                                </div>*/}
                            </Field>
                            <Field>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <IconLoader2 className="animate-spin" />
                                            Logging in...
                                        </>
                                    ) : (
                                        "Login"
                                    )}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
