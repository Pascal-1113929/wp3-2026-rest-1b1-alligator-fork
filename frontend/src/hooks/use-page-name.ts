import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";
import api from "../utils/api";

const pages = [
    { key: "dashboard", name: "Dashboard", url: "/dashboard" },
    { key: "home", name: "Home", url: "/" },
    { key: "profile", name: "Profiel", url: "/profile" },
    { key: "sessions", name: "Actieve apparaten", url: "/sessions" },
];

async function fetchSubjectName(subjectId) {
    try {
        const response = await api(`/subject/${subjectId}`, "GET");
        const data = await response.json();
        return data.subject_object.name;
    }
    catch (error) {
        console.error("Error fetching subject name:", error);
        return "Subject not found";
    }
}

async function fetchClassName(classId) {
    try {
        const response = await api(`/class/${classId}`, "GET");
        const data = await response.json();
        return data.class_object.name;
    }
    catch (error) {
        console.error("Error fetching class name:", error);
        return "class not found";
    }
}

export function usePageName() {
    const location = useLocation();
    const { subjectId } = useParams();
    const [pageName, setPageName] = useState("Loading...");

    useEffect(() => {
        async function resolvePage() {
            const pathname = location.pathname;
            const matchedPage = pages.find((page) => page.url === pathname);

            const subjectMatch = pathname.match(
                /^\/student(?:\/[^/]+)?\/subject\/([^/]+)\/?$/
            );

            const teacherClassMatch = pathname.match(
                /^\/teacher\/subject\/([^/]+)\/class\/([^/]+)\/?$/
            );

            if (teacherClassMatch) {
                const subjectId = teacherClassMatch[1];
                const classId = teacherClassMatch[2];
                const subjectName = await fetchSubjectName(subjectId);
                const className = await fetchClassName(classId)
                return `${subjectName} - Klas ${className}`;
            } else if (subjectMatch) {
                const subjectId = subjectMatch[1];
                return await fetchSubjectName(subjectId);
            }
            else {
                const selectedPage = matchedPage
                    ? matchedPage.name
                    : "Page not found in list";
                return selectedPage;
            }
        }

        resolvePage().then(setPageName);
    }, [location, subjectId]);

    return pageName;
}
