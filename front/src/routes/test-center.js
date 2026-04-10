import TestCenterScore from "views/test-center/score-sheet/index";
import TestCenterScoreStudents from "views/test-center/score-sheet/scoreStudents";
import TestCenterDefault from "views/test-center/default";
import TestCenterGroups from "views/test-center/subject";
import TestCenterGroupStudent from "views/test-center/all-appeals";
import TestCenterStudentDebt from "views/test-center/all-appeals/Debts";
import TestCenterCategories from "views/test-center/categories/index";
import TestCenterCategoriesLesson from "views/test-center/categories/Lessons";
import TestCenterTestsUpload from "views/test-center/Test-yuklash/Test";
import TestCenterTeacher from "views/test-center/teacher";
import TestCenterFinalExam from "views/test-center/FinalExam/index";
import TestCenterFinalExamCodes from "views/test-center/ExamChangeCodeTestCenter";
import TestCenterFinalExamStudents from "views/test-center/FinalExam/students/index";
import TestCenterFinalExamHisobot from "views/test-center/FinalExam/hisobot/index";
import TestCenterMustaqilExam from "views/test-center/MustaqilExam/index";
import TestCenterMustaqilExamStudents from "views/test-center/MustaqilExam/students";
import TestCenterMustaqilExamView from "views/test-center/MustaqilExam/testview";
import TestCenterFinalExamStudentsTests from "views/test-center/FinalExam/students/TestsView";
import TestCenterFinalExamCreate from "views/test-center/FinalExam/create";
import TestCenterFinalExamEdit from "views/test-center/FinalExam/edit";
import TestCenterTeacherMustaqil from "views/test-center/teacherMustaqil/index";
import TestCenterTestGroups from "views/test-center/exam/Groups";
import TestCenterTestGroupsDetails from "views/test-center/exam/TestCenter";
import TestCenterTestStudentDetails from "views/test-center/exam/StudentDetails";
import TestCenterSertificate from "views/admin/Sertifikatlar";
import TestCenterContractFile from "views/test-center/contract-file/index";
import TestCenterTestTeachers from "views/test-center/testTeacher";
import Profile from "views/admin/profile";
import SuperadminScoreSheetAllStudents from "views/superadmin/score-sheet-all-students";

import {
  MdArticle,
  MdCode,
  MdGroups,
  MdHome,
  MdOutlineFileUpload,
  MdOutlineRule,
  MdPerson,
  MdQuiz,
  MdSchedule,
  MdTableView,
  MdUpload,
} from "react-icons/md";
import { IoMdPaper } from "react-icons/io";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/test-center",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <TestCenterDefault />,
    // stranger: false,
    url: "",
  },
  {
    name: "Qaydnoma barchasi",
    layout: "/test-center",
    path: "all-score-sheets",
    icon: <MdTableView className="h-6 w-6" />,
    component: <SuperadminScoreSheetAllStudents />,
  },
  {
    name: "Qaydnoma",
    layout: "/test-center",
    path: "vedimis",
    icon: <MdSchedule className="h-6 w-6" />,
    component: <TestCenterScore />,
  },

  {
    name: "Qaydnoma",
    layout: "/test-center",
    path: "vedimis/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <TestCenterScoreStudents />,
    hidden: true,
  },

  {
    name: "Guruhlar",
    layout: "/test-center",
    path: "groups",
    icon: <MdGroups className="h-6 w-6" />,
    component: <TestCenterGroups />,
  },
  {
    name: "Guruhlar",
    layout: "/test-center",
    path: "groups/:id",
    icon: <MdGroups className="h-6 w-6" />,
    component: <TestCenterGroupStudent />,
    hidden: true,
  },
  {
    name: "Qarzdorliklar",
    layout: "/test-center",
    path: "groups/group/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <TestCenterStudentDebt />,
    hidden: true,
  },
  {
    name: "Test yuklash",
    layout: "/test-center",
    path: "curriculums-subject",
    icon: <MdOutlineFileUpload className="h-6 w-6" />,
    component: <TestCenterCategories />,
  },
  {
    name: "O'quv rejalar ro'yxati",
    layout: "/test-center",
    path: "curriculum-subject/:id",
    icon: <MdArticle className="h-6 w-6" />,
    component: <TestCenterCategoriesLesson />,
    hidden: true,
  },
  {
    name: "Test yuklash",
    layout: "/test-center",
    path: "test-upload/:id",
    icon: <MdUpload className="h-6 w-6" />,
    component: <TestCenterTestsUpload />,
    hidden: true,
  },
  {
    name: "O'qituvchi qo'shish",
    layout: "/test-center",
    path: "teachers",
    icon: <MdPerson className="h-6 w-6" />,
    component: <TestCenterTeacher />,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/test-center",
    path: "final-exam",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <TestCenterFinalExam />,
  },
  {
    name: "Yakuniy nazorat kodlari",
    layout: "/test-center",
    path: "codes",
    icon: <MdCode className="h-6 w-6" />,
    component: <TestCenterFinalExamCodes />,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/test-center",
    path: "final-exam/students/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <TestCenterFinalExamStudents />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/test-center",
    path: "final-exam/hisobot/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <TestCenterFinalExamHisobot />,
    hidden: true,
  },
  {
    name: "Mustaqil nazorat",
    layout: "/test-center",
    path: "mustaqi-exam",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <TestCenterMustaqilExam />,
    hidden: false,
  },
  {
    name: "Mustaqil nazorat",
    layout: "/test-center",
    path: "mustaqi-exam/students/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <TestCenterMustaqilExamStudents />,
    hidden: true,
  },
  {
    name: "Mustaqil nazorat",
    layout: "/test-center",
    path: "mustaqi-exam/student/test-view/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <TestCenterMustaqilExamView />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/test-center",
    path: "final-exam/students/tests/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <TestCenterFinalExamStudentsTests />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/test-center",
    path: "final-exam/create",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <TestCenterFinalExamCreate />,
    hidden: true,
  },

  {
    name: "Yakuniy nazorat",
    layout: "/test-center",
    path: "final-exam/edit/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <TestCenterFinalExamEdit />,
    hidden: true,
  },
  {
    name: "Mustaqil dars biriktirsh",
    layout: "/test-center",
    path: "mustaqil",
    icon: <MdPerson className="h-6 w-6" />,
    component: <TestCenterTeacherMustaqil />,
  },
  {
    name: "O'qituvchiga test qo'yish",
    layout: "/test-center",
    path: "test-teacher",
    icon: <MdOutlineRule className="h-6 w-6" />,
    component: <TestCenterTestTeachers />,
  },
  {
    name: "Imtihon",
    layout: "/test-center",
    path: "exams",
    icon: <MdQuiz className="h-6 w-6" />,
    component: <TestCenterTestGroups />,
  },
  {
    name: "Imtihon",
    layout: "/test-center",
    path: "exams/:id",
    icon: <MdQuiz className="h-6 w-6" />,
    component: <TestCenterTestGroupsDetails />,
    hidden: true,
  },
  {
    name: "Imtihon",
    layout: "/test-center",
    path: "exams/student/:studentId",
    icon: <MdQuiz className="h-6 w-6" />,
    component: <TestCenterTestStudentDetails />,
    hidden: true,
  },
  {
    name: "Sertifikatlar",
    layout: "/test-center",
    path: "certificates",
    icon: <MdArticle className="h-6 w-6" />,
    component: <TestCenterSertificate />,
  },
  {
    name: "Kontrakt yuklash",
    layout: "/test-center",
    path: "contract-file",
    icon: <MdUpload className="h-6 w-6" />,
    component: <TestCenterContractFile />,
  },
  {
    name: "Profile",
    layout: "/test-center",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },
];
export default routes;
