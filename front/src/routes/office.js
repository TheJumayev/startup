import OfficeDefault from "views/shuxrataka/default/index";
import OfficeGroups from "views/shuxrataka/subject/index";
import OfficeGroupStudent from "views/shuxrataka/all-appeals/index";
import OfficeStudentDebt from "views/shuxrataka/all-appeals/Debts";
import OfficeOnlineGroups from "views/shuxrataka/online-groups";
// import OfficeAttendance from "views/shuxrataka/attendance/index";
import OfficeOfineAttendance from "views/shuxrataka/ofline-attendance/index";
import OfficeOfineAttendanceOneGroup from "views/shuxrataka/ofline-attendance/one-group/index";
import OfficeAttendance from "views/shuxrataka/online-attendance/index";
import OfficeAttendanceOnline from "views/shuxrataka/online-attendance/one-schedule-list/index";
import OfficeOnlineGroupStudents from "views/shuxrataka/online-groups/students/index";
import OfficeOnlineGroupStudent from "views/shuxrataka/online-groups/students/induvid/index";
import OfficeCheckLessons from "views/shuxrataka/AllHomework/CheckLessons";
import Officestatistic from "views/shuxrataka/teacher-statistic/index";
import OfficeCheckFinalExam from "views/shuxrataka/FinalExam/index";
import OfficeFinalExamCreate from "views/shuxrataka/FinalExam/create";
import OfficeFinalExamEdit from "views/shuxrataka/FinalExam/edit";
import OfficeCheckFinalExamHisobot from "views/shuxrataka/FinalExam/hisobot/index";
import OfficeCheckFinalExamStudentTest from "views/shuxrataka/FinalExam/students/TestsView";
import OfficeCheckFinalExamStudents from "views/shuxrataka/FinalExam/students/index";
import OfficeMagistr from "views/shuxrataka/magistrFile/index";
import OfficeScoreSheet from "views/shuxrataka/score-sheet/index";
import OfficeStudentScore from "views/shuxrataka/score-sheet/scoreStudents";
import OfficeDiscount from "views/shuxrataka/discount/Discount";
import KafolatXati from "views/superadmin/kafolat-xati/Contract";
import Profile from "views/admin/profile";
import SuperAdminLaterStudents from "views/superadmin/later-students/index";
import SuperAdminLaters from "views/superadmin/later-students/allStudents";
import SuperAdminParents from "views/superadmin/parents-meetings/index";
import SuperAdminDalolatnoma from "views/superadmin/dalolatnoma/index";

import {
  MdArticle,
  MdBook,
  MdBookOnline,
  MdGroups,
  MdHome,
  MdHomeWork,
  MdOutlineMoney,
  MdPersonPin,
  MdTableView,
  MdPerson,
  MdBookmark,
  MdMeetingRoom,
} from "react-icons/md";
import { IoMdPaper } from "react-icons/io";
import TgUser from "../views/superadmin/tg-user";
import SuperAdminExplanation from "views/superadmin/explanation/index";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/office",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <OfficeDefault />,
    url: "",
  },

  {
    name: "Tushuntirish xatlari",
    layout: "/office",
    path: "explanation",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminExplanation />,
    hidden: false,
  },

  {
    name: "Kechikganlarni kiritish",
    layout: "/office",
    path: "later-students",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminLaterStudents />,
    hidden: false,
  },
  {
    name: "Kechikganlar ro'yxati",
    layout: "/office",
    path: "laters",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminLaters />,
    hidden: false,
  },

  {
    name: "Ota-onalar majlisi",
    layout: "/office",
    path: "meetings",
    icon: <MdMeetingRoom className="h-6 w-6" />,
    component: <SuperAdminParents />,
    hidden: false,
  },
  {
    name: "Dalolatnoma",
    layout: "/office",
    path: "dalolatnoma",
    icon: <MdBook className="h-6 w-6" />,
    component: <SuperAdminDalolatnoma />,
    hidden: false,
  },
  {
    name: "Guruhlar",
    layout: "/office",
    path: "groups",
    icon: <MdGroups className="h-6 w-6" />,
    component: <OfficeGroups />,
  },
  {
    name: "Guruhlar",
    layout: "/office",
    path: "groups/:id",
    icon: <MdGroups className="h-6 w-6" />,
    component: <OfficeGroupStudent />,
    hidden: true,
  },
  {
    name: "Qarzdorliklar",
    layout: "/office",
    path: "groups/group/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <OfficeStudentDebt />,
    hidden: true,
  },
  {
    name: "Online Guruhlar",
    layout: "/office",
    path: "online-group",
    icon: <MdBookOnline className="h-6 w-6" />,
    component: <OfficeOnlineGroups />,
  },
  // {
  //   name: "Davomat",
  //   layout: "/office",
  //   path: "attendance",
  //   icon: <MdArticle className="h-6 w-6" />,
  //   component: <OfficeAttendance />,
  // },
  {
    name: "Offline davomat",
    layout: "/office",
    path: "offline-attendance",
    icon: <MdGroups className="h-6 w-6" />,
    component: <OfficeOfineAttendance />,
  },
  {
    name: "Ofline davomat one group",
    layout: "/office",
    path: "offline-attendance/:id",
    icon: <MdGroups className="h-6 w-6" />,
    component: <OfficeOfineAttendanceOneGroup />,
    hidden: true,
  },
  {
    name: "Online davomat",
    layout: "/office",
    path: "online-attendance",
    icon: <MdArticle className="h-6 w-6" />,
    component: <OfficeAttendance />,
  },

  {
    name: "Davomat",
    layout: "/office",
    path: "online-attendance/:id",
    icon: <MdArticle className="h-6 w-6" />,
    component: <OfficeAttendanceOnline />,
    hidden: true,
  },
  {
    name: "Online Guruh Talabalari",
    layout: "/office",
    path: "online-group/:groupId",
    hidden: true,
    icon: <MdArticle className="h-6 w-6" />,
    component: <OfficeOnlineGroupStudents />,
  },
  {
    name: "Talaba Ma'lumoti",
    layout: "/office",
    path: "online-group/student/:studentId",
    hidden: true,
    icon: <MdArticle className="h-6 w-6" />,
    component: <OfficeOnlineGroupStudent />,
  },
  {
    name: "Vazifa tekshirish",
    layout: "/office",
    path: "check-home",
    icon: <MdHomeWork className="h-6 w-6" />,
    component: <OfficeCheckLessons />,
  },
  {
    name: "Statistika",
    layout: "/office",
    path: "statistic",
    icon: <MdTableView className="h-6 w-6" />,
    component: <Officestatistic />,
    url: "",
  },
  {
    name: "Yakuniy nazorat",
    layout: "/office",
    path: "final-exam",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <OfficeCheckFinalExam />,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/office",
    path: "final-exam/create",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <OfficeFinalExamCreate />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/office",
    path: "final-exam/edit/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <OfficeFinalExamEdit />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/office",
    path: "final-exam/hisobot/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <OfficeCheckFinalExamHisobot />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/office",
    path: "final-exam/students/tests/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <OfficeCheckFinalExamStudentTest />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/office",
    path: "final-exam/students/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <OfficeCheckFinalExamStudents />,
    hidden: true,
  },
  {
    name: "Magistr mavzular",
    layout: "/office",
    path: "magistr",
    icon: <MdBook className="h-6 w-6" />,
    component: <OfficeMagistr />,
    url: "",
  },
  {
    name: "Qaydnoma",
    layout: "/office",
    path: "vedims",
    icon: <MdTableView className="h-6 w-6" />,
    component: <OfficeScoreSheet />,
    url: "",
  },
  {
    name: "Qaydnoma",
    layout: "/office",
    path: "vedims/:id",
    icon: <MdHome className="h-6 w-6" />,
    component: <OfficeStudentScore />,
    url: "",
    hidden: true,
  },
  {
    name: "Chegirma",
    layout: "/office",
    path: "discount",
    icon: <MdOutlineMoney className="h-6 w-6" />,
    component: <OfficeDiscount />,
    url: "",
  },
  {
    name: "Kafolat xati",
    layout: "/office",
    path: "kafolat-xati",
    icon: <MdOutlineMoney className="h-6 w-6" />,
    component: <KafolatXati />,
    url: "",
  },
  {
    name: "Telegram User",
    layout: "/admin",
    path: "tg-user",
    icon: <MdBookmark className="h-6 w-6" />,
    component: <TgUser />,
  },
  {
    name: "Profil",
    layout: "/office",
    path: "profil",
    icon: <MdPersonPin className="h-6 w-6" />,
    component: <Profile />,
    url: "",
  },
];
export default routes;
