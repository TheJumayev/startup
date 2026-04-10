import MainDashboardStudent from "views/student/dashboard";
import StudentDebts from "views/student/debt";
import StudentMagistr from "views/student/magistr";
import StudentMyAttendance from "views/student/my-attendance";
import StudentHayfsand from "views/student/hayfsan/index";
import StudentHomework from "views/student/Homework/index";
import StudentHomeworkCurriculm from "views/student/Homework/curriculms/Index";
import StudentHomeworkCurriculmVazifa from "views/student/Homework/curriculms/vazifalar/Vazifalar";
import StudentMustaqil from "views/student/mustaqil-talim/index";
import StudentMustaqilCurriculm from "views/student/mustaqil-talim/curriculms/Index";
import StudentTestWork from "views/student/mustaqil-talim/curriculms/vazifalar/testWork";
import StudentMustqilCurriculmVazifa from "views/student/mustaqil-talim/curriculms/vazifalar/Vazifalar";
import StudentTestKnowledge from "views/student/TestKnowledge";
import StudentTestKnowledgeTesting from "views/student/TestKnowledge/Test";
import StudentSubjectMedia from "views/student/subject/VideoLessons";
import StudentSubjectMediaLesson from "views/student/subject/Lesson";
import StudentVideo from "views/student/watchVideo";
import StudentVideoLessons from "views/student/watchVideo/VideoLessons";
import StudentOfflineAttendance from "views/student/offline-attendance";
import StudentOfflineAttendanceControl from "views/student/offline-attendance/attendance";
import StudentVideoLessonFiles from "views/student/watchVideo/Lesson";
import MainDashboardStudentTest from "views/student/Test";
// import StudentAppeals from "views/student/appeals"
import StudentMyAppealsView from "views/student/MyAppeals/MyappealView";
import StudentAmaliyot from "views/student/AmaliyotUpload/index";
import StudentAmaliyotUpload from "views/student/AmaliyotUpload/AmaliyotUpload";
import StudentScoreExam from "views/student/score/index";
import StudentCabinet from "views/student/kabinet";
import SurveyStudent from "views/student/survey";
import GroupStudentsPhone from "views/student/group-students"
import StudentProfile from "views/student/profile/index";
import {
  MdAccountCircle,
  MdAddTask,
  MdArticle,
  MdBook,
  MdComputer,
  MdFontDownload,
  MdHome,
  MdHomeWork,
  MdInbox,
  MdOndemandVideo,
  MdOutlineRule,
  MdOutlineViewList,
  MdPerson,
  MdScore,
} from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/student",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboardStudent />,
    stranger: false,
    url: "",
  },
  {
    name: "Qarzdorlik fanlar",
    layout: "/student",
    path: "debts",
    icon: <MdOutlineViewList className="h-6 w-6" />,
    component: <StudentDebts />,
    stranger: false,
    url: "",
  },
  {
    name: "Desertatsiya mavzusi",
    layout: "/student",
    path: "magistr",
    icon: <MdBook className="h-6 w-6" />,
    component: <StudentMagistr />,
    stranger: false,
    url: "",
  },
  {
    name: "Davomat ko'rish",
    layout: "/student",
    path: "my-davomat",
    icon: <MdArticle className="h-6 w-6" />,
    component: <StudentMyAttendance />,
    stranger: false,
    url: "",
  },
  {
    name: "Hayfsanlarni ko'rish",
    layout: "/student",
    path: "hayfsand",
    icon: <MdArticle className="h-6 w-6" />,
    component: <StudentHayfsand />,
    stranger: false,
    url: "",
  },
  // {
  //   name: "Fan",
  //   layout: "/student",
  //   path: "subject",
  //   icon: <MdPlayLesson className="h-6 w-6" />,
  //   component: <StudentSubject />,
  //   stranger: false,
  //   url: "",
  //   isOnline: true,
  // },
  {
    name: "Qo'shimcha vazifalar",
    layout: "/student",
    path: "homework",
    icon: <MdHomeWork className="h-6 w-6" />,
    component: <StudentHomework />,
    stranger: false,
    url: "",
  },
  {
    name: "Qo'shimcha vazifalar",
    layout: "/student",
    path: "homeworks/:id",
    icon: <MdHomeWork className="h-6 w-6" />,
    component: <StudentHomeworkCurriculm />,
    stranger: false,
    url: "",
    hidden: true,
  },
  {
    name: "Qo'shimcha vazifalar",
    layout: "/student",
    path: "homeworks/homework/:id",
    icon: <MdHomeWork className="h-6 w-6" />,
    component: <StudentHomeworkCurriculmVazifa />,
    stranger: false,
    url: "",
    hidden: true,
  },
  {
    name: "Mustqail ta'lim",
    layout: "/student",
    path: "mustaqil-talim",
    icon: <MdComputer className="h-6 w-6" />,
    component: <StudentMustaqil />,
    stranger: false,
    url: "",
    hidden: false,
  },
  {
    name: "Mustqail ta'lim",
    layout: "/student",
    path: "mustaqil-talim/:id",
    icon: <MdComputer className="h-6 w-6" />,
    component: <StudentMustaqilCurriculm />,
    stranger: false,
    url: "",
    hidden: true,
  },
  {
    name: "Mustqail ta'lim",
    layout: "/student",
    path: "mustaqil-talim/test/:id",
    icon: <MdComputer className="h-6 w-6" />,
    component: <StudentTestWork />,
    stranger: false,
    url: "",
    hidden: true,
  },
  {
    name: "Mustqail ta'lim",
    layout: "/student",
    path: "mustaqil-talim/work/:id",
    icon: <MdComputer className="h-6 w-6" />,
    component: <StudentMustqilCurriculmVazifa />,
    hidden: true,
  },
  {
    name: "Bilimni sinab ko'rish",
    layout: "/student",
    path: "test-knowledge",
    icon: <MdOutlineRule className="h-6 w-6" />,
    component: <StudentTestKnowledge />,
    stranger: false,
    url: "",
  },
  {
    name: "Bilimni sinab ko'rish",
    layout: "/student",
    path: "test-knowledge/:id",
    icon: <MdOutlineRule className="h-6 w-6" />,
    component: <StudentTestKnowledgeTesting />,
    stranger: false,
    url: "",
    hidden: true,
  },
  {
    name: "Video darslar",
    layout: "/student",
    path: "subject/media-subject/:id",
    icon: <MdOndemandVideo className="h-6 w-6" />,
    component: <StudentSubjectMedia />,
    stranger: false,
    url: "",
    isOnline: true,
    hidden: true,
  },
  {
    name: "Video darslar",
    layout: "/student",
    path: "subject/media-subject/lesson/:id",
    icon: <MdOndemandVideo className="h-6 w-6" />,
    component: <StudentSubjectMediaLesson />,
    stranger: false,
    url: "",
    isOnline: true,
    hidden: true,
  },
  // {
  //   name: "Video darslar",
  //   layout: "/student",
  //   path: "media-lessons",
  //   icon: <MdOndemandVideo className="h-6 w-6" />,
  //   component: <StudentVideo />,
  //   stranger: false,
  //   url: "",
  //   isOnline: true,
  // },
  {
    // name: "Video darslar",
    layout: "/student",
    path: "media-lessons/:id",
    // icon: <MdOndemandVideo className="h-6 w-6" />,
    component: <StudentVideoLessons />,
    stranger: false,
    url: "",
    hidden: true,
    // isOnline: true,
  },
  {
    name: "Davomat kiritish",
    layout: "/student",
    path: "group-offline-davomat",
    icon: <MdAddTask className="h-6 w-6" />,
    component: <StudentOfflineAttendance />,
  },
  {
    name: "Guruh talabalari",
    layout: "/student",
    path: "group/students",
    icon: <MdAddTask className="h-6 w-6" />,
    component: <GroupStudentsPhone />,
  },
  {
    name: "Davomat kiritish",
    layout: "/student",
    path: "group-offline-davomat/:id",
    icon: <MdAddTask className="h-6 w-6" />,
    component: <StudentOfflineAttendanceControl />,
    url: "",
    hidden: true,
  },
  {
    // name: "Video darslar",
    layout: "/student",
    path: "media-lessons/lesson/:id",
    // icon: <MdOndemandVideo className="h-6 w-6" />,
    component: <StudentVideoLessonFiles />,
    stranger: false,
    url: "",
    hidden: true,
    // isOnline: true,
  },
  // {
  //   name: "Mening arizam",
  //   layout: "/student",
  //   path: "appeal/:id",
  //   icon: <MdHome className="h-6 w-6" />,
  //   component: <StatusAppeal />,
  //   stranger: false,
  //   url: ""
  // },
  {
    name: "Test",
    layout: "/student",
    path: "test/:id",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboardStudentTest />,
    stranger: false,
    hidden: true,
  },
  // {
  //   name: "Ariza topshirish",
  //   layout: "/student",
  //   path: "appeals",
  //   icon: <MdAddTask className="h-6 w-6" />,
  //   component: <StudentAppeals />,
  //   stranger: false,
  //   url: "",
  // },
  // {
  //   name: "Mening arizalarim",
  //   layout: "/student",
  //   path: "myappeal",
  //   icon: <MdInbox className="h-6 w-6" />,
  //   component: <StudentMyAppeals />,
  //   stranger: false,
  //   url: "",
  // },
  {
    name: "Mening arizalarim",
    layout: "/student",
    path: "myappeal/:id",
    icon: <MdInbox className="h-6 w-6" />,
    component: <StudentMyAppealsView />,
    stranger: false,
    url: "",
    hidden: true,
  },
  {
    name: "Amaliyot",
    layout: "/student",
    path: "amaliyot",
    icon: <MdFontDownload className="h-6 w-6" />,
    component: <StudentAmaliyot />,
    stranger: false,
  },
  {
    name: "Amaliyot",
    layout: "/student",
    path: "amaliyot/:id",
    icon: <MdAccountCircle className="h-6 w-6" />,
    component: <StudentAmaliyotUpload />,
    stranger: false,
    hidden: true,
  },
  {
    name: "Imtihon baholar",
    layout: "/student",
    path: "score",
    icon: <MdScore className="h-6 w-6" />,
    component: <StudentScoreExam />,
    stranger: false,
  },
  // {
  //   name: "Shaxsiy ma'lumotlar",
  //   layout: "/student",
  //   path: "cabinet",
  //   icon: <MdAccountCircle className="h-6 w-6" />,
  //   component: <StudentCabinet />,
  //   stranger: false,
  // },
  // {
  //   name: "O'qtuvchilarni baholash",
  //   layout: "/student",
  //   path: "survey",
  //   icon: <MdOutlineThumbsUpDown className="h-6 w-6" />,
  //   component: <SurveyStudent />,
  //   stranger: false,
  // },
  {
    name: "Profile",
    layout: "/student",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <StudentProfile />,
    stranger: false,
  },
];
export default routes;
