import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./context/auth-provider.jsx";
import "./index.css";
import { IconLoader2 } from "@tabler/icons-react";
import Dashboard from "./app/dashboard/main.tsx";
import Profile from "./app/dashboard/profile.jsx";
import Sessions from "./app/dashboard/sessions.jsx";
import Home from "./app/home/main.jsx";
import Login from "./app/auth/login.tsx";
import Subject from "./app/student/subject/main.jsx";
import LayoutWithPageName from "./components/layout-wrapper.jsx";
import TeacherSubjectClassPage from "./app/teacher/subject/class/main.jsx";
import NotFoundPage from "./app/http_error/not_found.jsx"

const root = document.getElementById("root");

export function App() {
    const { userToken, loading } = useAuth();

    useEffect(() => {}, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <IconLoader2 className="w-10 h-10 animate-spin text-black" />
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path=""
                    element={
                        import.meta.env.tauri2 ? (
                            <Navigate to="/login" replace />
                        ) : (
                            <Home />
                        )
                    }
                />

                <Route
                    path="/login"
                    element={
                        userToken ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Login />
                        )
                    }
                />

                <Route
                    element={
                        userToken ? (
                            <LayoutWithPageName />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/sessions" element={<Sessions />} />
                    <Route path="/student">
                        {/* Firts one if for student to only acces thier own subjects */}
                        <Route
                            path="subject/:subjectId"
                            element={<Subject />}
                        />
                        {/* This one if for teachers to acces the info of a specific student */}
                        <Route
                            path=":paramStudentId/subject/:subjectId"
                            element={<Subject />}
                        />
                    </Route>
                    <Route path="/teacher">
                        <Route
                            path="subject/:subjectId/class/:classId"
                            element={<TeacherSubjectClassPage />}
                        />
                    </Route>
                </Route>
                 <Route path="/error" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

createRoot(root).render(
    <AuthProvider>
        <App />
    </AuthProvider>,
);
