import api from "../../utils/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { IconLoader2, IconLogin2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function Main() {
    const [heartbeat, setHeartbeat] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getHeartbeat = async () => {
            try {
                const data = await api("/status", "GET");
                setHeartbeat(data.status);
            } catch (error) {
                console.error("Failed to fetch heartbeat:", error);
                setHeartbeat("Error with the API");
            }
        };

        getHeartbeat();
    }, []);

    return (
        <div>
            <header className="flex items-center justify-between p-5 border-b px-[5vw]">
                <img
                    src="/logo-full.svg"
                    alt="Logo Test-Correct"
                    className="h-8 w-auto"
                />
                <nav>
                    <Button onClick={() => navigate("/login")}>
                        Login{" "}
                        <IconLogin2 className="inline-block ml-1 h-4 w-4" />
                    </Button>
                </nav>
            </header>
            <main className="mx-[5vw] mt-5">
                <h1 className="text-3xl">
                    Welkom op Werknaam-LeerKompas van Test Correct
                </h1>
                <div>
                    <p>
                        Dit is de leer analyse applicatie van Test-Correct. Hier
                        kunt u uw leerdata inzien en vooruitgang volgen.
                    </p>
                    <Button onClick={() => navigate("/login")} className="mt-4">
                        Naar applicatie
                    </Button>
                </div>
            </main>
            <footer className="fixed bottom-0 left-0 w-full p-4 bg-white border-t text-center text-sm text-gray-500">
                <p>Dev Footer</p>
                {heartbeat === null ? (
                    <div className="flex items-center justify-center">
                        <IconLoader2 className="animate-spin mr-2 h-4 w-4" />
                        <span>Checking API status...</span>
                    </div>
                ) : (
                    <span>API Status: {heartbeat}</span>
                )}
            </footer>
        </div>
    );
}
