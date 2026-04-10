import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import Snowfall from "react-snowfall";

import AdminLayout from "layouts/admin";
import TeacherLayout from "layouts/teacher";
import DekanLayout from "layouts/dekan";
import StudentLayout from "layouts/student";
// import AuthLayout from "layouts/auth";
import Login from "./views/student/login/Login";
import LoginAdmin from "./config/login/Login";
import IconsAll from "./IconsAll";
import SuperAdminLayout from "layouts/superadmin";
import TestCenterLayout from "layouts/test-center";
import BankerLayout from "layouts/bugalter";
import SecretaryLayout from "layouts/sekretar";
import Shuxrataka from "layouts/shuxrataka";
import Rector from "layouts/rector";
import ErrorPage from "./404/404";
import AddNewSubCategory from "./views/superadmin/subCategories/AddNewSubCategory";
import EditNewSubCategory from "./views/superadmin/subCategories/EditNewSubCategory";
import SingleAppeals from "./views/student/MyAppeals/MyappealView";
import Survey from "./views/student/survey/index";
import WriteAppeal from "views/open/WriteAppeal";
import Open from "views/open/Open";
import OnlineGroup from "views/open/online-group-students/index";
import StudentHistory from "views/admin/appeals/StudentHistory";
import ExamLoginPage from "views/examPage/ExamLoginPage/index";
import ExamSubjects from "views/examPage/studentExamSubjects/index";
import ExamTestWork from "views/examPage/TestWork/index";
import MustaqilTestWork from "views/examPage/TestWork/mustaqilExam";
import CertificateVerify from "views/student/sertifikat/index";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="superadmin/*" element={<SuperAdminLayout />} />
        <Route path="test-center/*" element={<TestCenterLayout />} />
        <Route path="banker/*" element={<BankerLayout />} />
        <Route path="office/*" element={<Shuxrataka />} />
        <Route path="secretary/*" element={<SecretaryLayout />} />
        {/* <Route path="auth/*" element={<AuthLayout />} /> */}
        <Route path="admin/*" element={<AdminLayout />} />
        <Route path="teacher/*" element={<TeacherLayout />} />
        <Route path="dekan/*" element={<DekanLayout />} />
        <Route path="rector/*" element={<Rector />} />
        <Route path="appeals/:id" element={<SingleAppeals />} />
        <Route path="open/" element={<Open />} />
        <Route path="/exam/login" element={<ExamLoginPage />} />
        <Route path="/exam/subject/:id" element={<ExamSubjects />} />
        <Route path="/exam/survey" element={<Survey />} />
        <Route path="/exam/subject/test/:id" element={<ExamTestWork />} />
        <Route path="/exam/mustaqil/test/:id" element={<MustaqilTestWork />} />

        {/*  online talabalar royxati*/}
        <Route path="online-groups/:groupId" element={<OnlineGroup />} />

        <Route path="open/:id" element={<WriteAppeal />} />
        <Route path="student/history/:id" element={<StudentHistory />} />
        <Route
          path="superadmin/subcategories/new"
          element={<AddNewSubCategory />}
        />
        <Route
          path="/mustaqil-talim/certificate/file/:groupId/:curriculumSubjectId/:studentId"
          element={<CertificateVerify />}
        />
        <Route
          path="superadmin/subcategories/edit/:id"
          element={<EditNewSubCategory />}
        />
        <Route path="admin/login" element={<LoginAdmin />} />
        <Route path="student/*" element={<StudentLayout />} />

        <Route path="student/login" element={<Login />} />
        <Route path="icons" element={<IconsAll />} />
        <Route path="/" element={<Navigate to="/student" replace />} />

        <Route path="/404" element={<ErrorPage />} />

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  );
};

export default App;
