import DekanDefault from "views/dekan/default";
import DekanAppeal from "views/dekan/appeals/Appeals";
import DekanSchedule from "views/dekan/score-sheet/index";
import DekanScheduleStudent from "views/dekan/score-sheet/scoreStudents";
import DekanFinalExam from "views/dekan/FinalExam/index";
import DekanFinalExamStudents from "views/dekan/FinalExam/students/index";
import DekanFinalExamHisobot from "views/dekan/FinalExam/hisobot/index";
import DekanFinalExamStudentTest from "views/dekan/FinalExam/students/TestsView";
import DekanProfile from "views/dekan/profile/index";
import { MdHome, MdPerson, MdSchedule } from "react-icons/md";
import { IoMdPaper } from "react-icons/io";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/dekan",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <DekanDefault />,
    stranger: false,
  },
  // {
  //   name: "Arizalarni tasdiqlash",
  //   layout: "/dekan",
  //   path: "appeal-dekan",
  //   icon: <MdAllInbox className="h-6 w-6" />,
  //   component: <DekanAppeal />,
  //   stranger: false,
  //   url: "",
  // },
  {
    name: "Qaydnoma",
    layout: "/dekan",
    path: "schedule",
    icon: <MdSchedule className="h-6 w-6" />,
    component: <DekanSchedule />,
    stranger: false,
    url: "",
  },
  {
    name: "Qaydnoma",
    layout: "/dekan",
    path: "schedule/:id",
    icon: <MdSchedule className="h-6 w-6" />,
    component: <DekanScheduleStudent />,
    stranger: false,
    url: "",
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/dekan",
    path: "final-exam",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <DekanFinalExam />,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/dekan",
    path: "final-exam/students/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <DekanFinalExamStudents />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/dekan",
    path: "final-exam/hisobot/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <DekanFinalExamHisobot />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/dekan",
    path: "final-exam/students/tests/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <DekanFinalExamStudentTest />,
    hidden: true,
  },
  {
    name: "Profil",
    layout: "/dekan",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <DekanProfile />,
  },
];
export default routes;
