import MainDashboard from "views/admin/default";
import AdminCheckAppeals from "views/admin/appeals/CheckAppeals";
import AdminAddTeacher from "views/admin/addTeacher";
import AdminDebtStudent from "views/admin/studentDebts";
import SuperAdminCategories from "views/superadmin/categories/index";
import SuperAdminSubCategories from "views/superadmin/subCategories";
import AdminGroups from "views/admin/subject";
import AdminGroupStudent from "views/admin/all-appeals";
import AdminStudentDebt from "views/admin/all-appeals/Debts";
import AdminCategories from "views/admin/categories/index";
import AdminTests from "views/admin/Test-yuklash";
import AdminTestsUpload from "views/admin/Test-yuklash/Test";
import AdminTeacher from "views/admin/teacher";
import AdminTestTeachers from "views/admin/testTeacher";
import AdminTestGroupsDetails from "views/admin/exam/TestCenter";
import AdminTestStudentDetails from "views/admin/exam/StudentDetails";
import AdminSertificate from "views/admin/Sertifikatlar";
import AdminOnlineGroups from "views/admin/online-groups";
import AdminAttendance from "views/admin/online-attendance/index";
import AdminOnlineGroupStudents from "views/admin/online-groups/students";
// import AdminAttendance from "views/admin/attendance";
import AdminAttendanceOnline from "views/admin/online-attendance/one-schedule-list/index";
import AdminOnlineGroupStudent from "views/admin/online-groups/students/induvid";
import Profile from "views/admin/profile";
import AdminCategoriesLesson from "views/admin/categories/Lessons";
import Subject from "views/admin/subject";
import Home from "views/admin/home";
import NFTMarketplace from "views/admin/marketplace";
import DataTables from "views/admin/tables";
import SignIn from "views/auth/SignIn";
import RTLDefault from "views/rtl/default";
import MagistrfileAdmin from "views/admin/magistrFile";
import MagistrfileAdminStatistika from "views/admin/teacher-statistic/index";
import { MdArticle, MdBookmark, MdBookOnline, MdGroups, MdHome, MdInbox, MdPerson, MdQuiz } from "react-icons/md";
import TgUser from "../views/superadmin/tg-user";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "Arizalar",
    layout: "/admin",
    path: "check-appeals",
    icon: <MdInbox className="h-6 w-6" />,
    component: <AdminCheckAppeals />,
  },
  // {
  //   name: "O'qituvchi qo'chish",
  //   layout: "/admin",
  //   path: "add-teacher",
  //   icon: <MdOutlinePersonAddAlt className="h-6 w-6" />,
  //   component: <AdminAddTeacher />,
  // },
  // {
  //   name: "Qarzdor talabalar",
  //   layout: "/admin",
  //   path: "debt",
  //   icon: <MdPerson className="h-6 w-6" />,
  //   component: <AdminDebtStudent />,
  // },
  // {
  //   name: "O'quv rejalar ro'yxati",
  //   layout: "/admin",
  //   path: "curriculum",
  //   icon: <MdArticle className="h-6 w-6" />,
  //   component: <AdminCategories />,
  // },
  // {
  //   name: "Fanlar",
  //   layout: "/admin",
  //   path: "subjects",
  //   icon: <MdAutoAwesomeMotion className="h-6 w-6" />,
  //   component: <AdminSubCategories />,
  // },
  {
    name: "Guruhlar",
    layout: "/admin",
    path: "groups",
    icon: <MdGroups className="h-6 w-6" />,
    component: <AdminGroups />,
  },
  {
    name: "Guruhlar",
    layout: "/admin",
    path: "groups/:id",
    icon: <MdGroups className="h-6 w-6" />,
    component: <AdminGroupStudent />,
    hidden: true,
  },
  {
    name: "Qarzdorliklar",
    layout: "/admin",
    path: "groups/group/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <AdminStudentDebt />,
    hidden: true,
  },
  // {
  //   name: "Test yuklash",
  //   layout: "/admin",
  //   path: "curriculums-subject",
  //   icon: <MdOutlineFileUpload className="h-6 w-6" />,
  //   component: <AdminCategories />,
  // },
  // {
  //   name: "Test yuklash",
  //   layout: "/admin",
  //   path: "tests",
  //   icon: <MdOutlineFileUpload className="h-6 w-6" />,
  //   component: <AdminTests />,
  // },
  // {
  //   name: "Test yuklash",
  //   layout: "/admin",
  //   path: "test-upload/:id",
  //   icon: <MdUpload className="h-6 w-6" />,
  //   component: <AdminTestsUpload />,
  //   hidden: true,
  // },
  // {
  //   name: "O'qituvchi qo'shish",
  //   layout: "/admin",
  //   path: "teachers",
  //   icon: <MdPerson className="h-6 w-6" />,
  //   component: <AdminTeacher />,
  // },
  // {
  //   name: "O'qituvchiga test qo'yish",
  //   layout: "/admin",
  //   path: "test-teacher",
  //   icon: <MdOutlineRule className="h-6 w-6" />,
  //   component: <AdminTestTeachers />,
  //   // hidden: true,
  // },
  // {
  //   name: "Imtihon",
  //   layout: "/admin",
  //   path: "exams",
  //   icon: <MdQuiz className="h-6 w-6" />,
  //   component: <AdminTestGroups />,
  // },
  {
    name: "Imtihon",
    layout: "/admin",
    path: "exams/:id",
    icon: <MdQuiz className="h-6 w-6" />,
    component: <AdminTestGroupsDetails />,
    hidden: true,
  },
  {
    name: "Imtihon",
    layout: "/admin",
    path: "exams/student/:studentId",
    icon: <MdQuiz className="h-6 w-6" />,
    component: <AdminTestStudentDetails />,
    hidden: true,
  },
  // {
  //   name: "Sertifikatlar",
  //   layout: "/admin",
  //   path: "certificates",
  //   icon: <MdArticle className="h-6 w-6" />,
  //   component: <AdminSertificate />,
  // },
  {
    name: "Online Guruhlar",
    layout: "/admin",
    path: "online-group",
    icon: <MdBookOnline className="h-6 w-6" />,
    component: <AdminOnlineGroups />,
  },
  // {
  //   name: "Davomat",
  //   layout: "/admin",
  //   path: "attendance",
  //   icon: <MdArticle className="h-6 w-6" />,
  //   component: <AdminAttendance />,
  // },
  {
    name: "Online Guruh Talabalari",
    layout: "/admin",
    path: "online-group/:groupId",
    hidden: true,
    icon: <MdArticle className="h-6 w-6" />,
    component: <AdminOnlineGroupStudents />,
  },
  {
    name: "Online davomat",
    layout: "/admin",
    path: "online-attendance",
    icon: <MdArticle className="h-6 w-6" />,
    component: <AdminAttendance />,
  },
  {
    name: "Davomat",
    layout: "/admin",
    path: "online-attendance/:id",
    icon: <MdArticle className="h-6 w-6" />,
    component: <AdminAttendanceOnline />,
    hidden: true,
  },
  {
    name: "Talaba Ma'lumoti",
    layout: "/admin",
    path: "online-group/student/:studentId",
    hidden: true,
    icon: <MdArticle className="h-6 w-6" />,
    component: <AdminOnlineGroupStudent />,
  },
  {
    name: "Profile",
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },
  {
    name: "O'quv rejalar ro'yxati",
    layout: "/admin",
    path: "curriculum-subject/:id",
    icon: <MdArticle className="h-6 w-6" />,
    component: <AdminCategoriesLesson />,
    hidden: true,
  },
  // {
  //   name: "Tanlov fanlari",
  //   layout: "/admin",
  //   path: "vote",
  //   icon: <MdBarChart className="h-6 w-6" />,
  //   component: <Subject />,
  // },

  // {
  //
  //   name: "Bosh sahifa",
  //   layout: "/admin",
  //   path: "home",
  //   icon: <MdHome className="h-6 w-6" />,
  //   component: <Home />,
  // },
  // {
  //   name: "NFT Marketplace",
  //   layout: "/admin",
  //   path: "nft-marketplace",
  //   icon: <MdOutlineShoppingCart className="h-6 w-6" />,
  //   component: <NFTMarketplace />,
  //   secondary: true,
  // },
  // {
  //   name: "Data Tables",
  //   layout: "/admin",
  //   icon: <MdBarChart className="h-6 w-6" />,
  //   path: "data-tables",
  //   component: <DataTables />,
  // },

  // {
  //   name: "Sign In",
  //   layout: "/auth",
  //   path: "sign-in",
  //   icon: <MdLock className="h-6 w-6" />,
  //   component: <SignIn />,
  // },
  // {
  //   name: "RTL Admin",
  //   layout: "/rtl",
  //   path: "rtl",
  //   icon: <MdHome className="h-6 w-6" />,
  //   component: <RTLDefault />,
  // },

  {
    name: "O'quv rejalar ro'yxati",
    layout: "/admin",
    path: "curriculum-subject/:id",
    icon: <MdArticle className="h-6 w-6" />,
    component: <AdminCategoriesLesson />,
    hidden: true,
  },
  {
    name: "Magistr biriktirish",
    layout: "/admin",
    path: "magistr-excel",
    icon: <MdArticle className="h-6 w-6" />,
    component: <MagistrfileAdmin />,
  },
  {
    name: "Telegram User",
    layout: "/admin",
    path: "tg-user",
    icon: <MdBookmark className="h-6 w-6" />,
    component: <TgUser />,
  },
  {
    name: "Statistika",
    layout: "/admin",
    path: "statistic-teachers",
    icon: <MdArticle className="h-6 w-6" />,
    component: <MagistrfileAdminStatistika />,
  },
];
export default routes;
