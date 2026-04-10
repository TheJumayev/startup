import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "layouts/admin";
import StudentLayout from "layouts/student";
import Login from "./views/student/login/Login";
import LoginAdmin from "./config/login/Login";
import SuperAdminLayoutModern from "layouts/superadmin/LayoutModern";
import ErrorPage from "./404/404";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="superadmin/*" element={<SuperAdminLayoutModern />} />
        <Route path="admin/*" element={<AdminLayout />} />
        <Route path="student/*" element={<StudentLayout />} />
        <Route path="/" element={<Navigate to="/student" replace />} />
        <Route path="admin/login" element={<LoginAdmin />} />
        <Route path="student/login" element={<Login />} />
        <Route path="/404" element={<ErrorPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  );
};

export default App;
