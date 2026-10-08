import { Link, useLocation, useSearchParams } from "react-router";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
    const location =useLocation();
    const [params] = useSearchParams();
    const navigate = useNavigate();

    // Message per status
    const defaultMessages = {
        400: "Ongeldige aanvraag.",
        401: "Je moet ingelogd zijn om deze pagina te bekijken.",
        403: "Je hebt geen toegang tot deze pagina.",
        404: "Pagina niet gevonden.",
        500: "Er ging iets mis op de server.",
    }

    // Get status from navigation state (fallback = 404)
    const statusParam = params.get("status");
    const queryStatus = statusParam ? Number(statusParam) : undefined;
    
    const status = 
        location.state?.status ??
        queryStatus ??
        404;

    // Fallback to default message
    const message =
        location.state?.message ||
        defaultMessages[status] ||
        "Er is een onbekende fout opgetreden.";
    
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-start gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6 items-center">

                {/* Logo */}
                <img
                    src="/logo-full.svg"
                    alt="Logo"
                    className="h-15 w-auto"
                />

                {/* Error code */}
                <p className="font-bold text-9xl">
                    {status}
                </p>

                {/* Error message */}
                <p className="text-center text-muted-foreground">
                    {message}
                </p>

                {/* Back to homepage button */}
                <Button
                    onClick={() => navigate("/")}
                    className="mt-4"
                >
                    Ga naar homepagina
                </Button>

            </div>
        </div>
    );
}

