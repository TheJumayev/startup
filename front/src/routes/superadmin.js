import MainDashboardSuper from "views/superadmin/default";
import SuperAdminProfile from "views/superadmin/profile";
import Groups from "views/superadmin/groups";
import Subjects from "views/superadmin/subjects";
import OquvReja from "views/superadmin/oquv-reja";
import Students from "views/superadmin/students";
import Curriculum from "views/superadmin/curriculum";

import {
  MdHome,
  MdPerson,
  MdGroup,
  MdBook,
  MdSchool,
  MdPeople,
} from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/superadmin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboardSuper />,
  },
  {
    name: "Guruhlar",
    layout: "/superadmin",
    path: "groups",
    icon: <MdGroup className="h-6 w-6" />,
    component: <Groups />,
  },
  {
    name: "Fanlar",
    layout: "/superadmin",
    path: "subjects",
    icon: <MdBook className="h-6 w-6" />,
    component: <Subjects />,
  },
  {
    name: "O'quv reja",
    layout: "/superadmin",
    path: "oquv-reja",
    icon: <MdSchool className="h-6 w-6" />,
    component: <OquvReja />,
  },

  {
    name: "Profile",
    layout: "/superadmin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminProfile />,
  },
];
export default routes;
