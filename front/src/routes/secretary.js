import SecretarOfflineAttendance from "views/sekretar/attendance/index";
import SecretarViewAttendance from "views/sekretar/ofline-attendance/index";
import SecretarGroupStudents from "views/sekretar/subject/index";
import SecretarGroups from "views/sekretar/all-appeals/index";
import SecretarViewAttendanceOne from "views/sekretar/ofline-attendance/one-group/index";
import { MdArticle, MdGroups, MdHome, MdViewList } from "react-icons/md";
import SuperAdminLaterStudents from "views/superadmin/later-students/index";
import SuperAdminLaters from "views/superadmin/later-students/allStudents";
const routes = [
  {
    name: "Bosh sahifa",
    layout: "/secretary",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <SecretarOfflineAttendance />,
    // stranger: false,
    url: "",
  },
  {
    name: "Davomat",
    layout: "/secretary",
    path: "attendance",
    icon: <MdViewList className="h-6 w-6" />,
    component: <SecretarViewAttendance />,
    // stranger: false,
  },
  {
    name: "Guruhlar",
    layout: "/secretary",
    path: "groups",
    icon: <MdGroups className="h-6 w-6" />,
    component: <SecretarGroupStudents />,
    // stranger: false,
  },
  {
    name: "Davomat",
    layout: "/secretary",
    path: "groups/:id",
    icon: <MdViewList className="h-6 w-6" />,
    component: <SecretarGroups />,
    hidden: true,
  },
  {
    name: "Davomat",
    layout: "/secretary",
    path: "attendance/:id",
    icon: <MdHome className="h-6 w-6" />,
    component: <SecretarViewAttendanceOne />,
    hidden: true,
  },

  {
    name: "Kechikganlarni kiritish",
    layout: "/secretary",
    path: "later-students",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminLaterStudents />,
    hidden: false,
  },
  {
    name: "Kechikganlar ro'yxati",
    layout: "/secretary",
    path: "laters",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminLaters />,
    hidden: false,
  },
];

export default routes;
