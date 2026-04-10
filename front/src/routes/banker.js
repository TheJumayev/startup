import BankerDefault from "views/bugalter/default";
import BankerGroups from "views/bugalter/groups/index";
import BankerStudents from "views/bugalter/groups/students";
import BankerTable from "views/bugalter/studentTables";
import BankerDiscount from "views/bugalter/discount/Discount";
import BankerScoreSheet from "views/bugalter/score-sheet/index";
import SuperadminScoreStudent from "views/superadmin/score-sheet/scoreStudents";
import BankerProfile from "views/bugalter/profile/index";
import { MdGroups, MdHome, MdList, MdOutlineMoney, MdPerson, MdSchedule } from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/banker",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <BankerDefault />,
    stranger: false,
    url: "",
  },
  {
    name: "Guruhlar",
    layout: "/banker",
    path: "groups",
    icon: <MdGroups className="h-6 w-6" />,
    component: <BankerGroups />,
  },
  {
    name: "Guruhlar",
    layout: "/banker",
    path: "groups/:id",
    icon: <MdGroups className="h-6 w-6" />,
    component: <BankerStudents />,
    hidden: true,
  },
  {
    name: "Talabalar ro'yxati",
    layout: "/banker",
    path: "student-list",
    icon: <MdList className="h-6 w-6" />,
    component: <BankerTable />,
    stranger: false,
  },
  {
    name: "Chegirmalar",
    layout: "/banker",
    path: "discount",
    icon: <MdOutlineMoney className="h-6 w-6" />,
    component: <BankerDiscount />,
    stranger: false,
  },
  {
    name: "Qaydnoma",
    layout: "/banker",
    path: "score-sheet",
    icon: <MdSchedule className="h-6 w-6" />,
    component: <BankerScoreSheet />,
    stranger: false,
  },
  {
    name: "Qaydnoma",
    layout: "/banker",
    path: "vedimis/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperadminScoreStudent />,
    hidden: true,
  },
  {
    name: "Profile",
    layout: "/banker",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <BankerProfile />,
    stranger: false,
  },
];
export default routes;