import { useEffect, useState } from "react";
import { usePageName } from "../hooks/use-page-name";
import { useLocation } from "react-router"
import AppLayout from "../layout.jsx";

export default function LayoutWithPageName() {
    const location = useLocation();
    const pageNameFromHook = usePageName();
    const [pageName, setPageName] = useState(pageNameFromHook);

    useEffect(() => {
        setPageName(pageNameFromHook);
    }, [pageNameFromHook, location.pathname]);

    return <AppLayout pageName={pageName} />;
}
