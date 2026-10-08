import { SessionTable } from "@/components/session-table";
import api from "@/utils/api";
import { useEffect, useState } from "react";

export default function Page() {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const fetchSessions = async () => {
            const response = await api("/user/sessions", "GET");
            const data = await response.json();

            setSessions(data.session_object);
        };
        fetchSessions();
    }, []);

    useEffect(() => {
        console.log("aaa", sessions);
    }, [sessions]);

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                        <SessionTable data={sessions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
