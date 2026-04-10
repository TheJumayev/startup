import MainDashboardRector from "views/rector/default";
import RectorExpired from "views/rector/expiredAppeals/Expired";
import RectorAdmins from "views/rector/tables";
import RectorDean from "views/rector/dean";
import RectorCategories from "views/rector/categories";
import RectorSubCategories from "views/rector/subCategories";
import RectorAllAppeals from "views/rector/all-appeals";
import RectorProfile from "views/rector/profile";
import { MdArticle, MdAutoAwesomeMotion, MdErrorOutline, MdHome, MdPerson } from "react-icons/md";

const routes = [
  // test-center11111111111
  //   old

  // dekan
  //rector uchun
  {
    name: "Bosh sahifa",
    layout: "/rector",
    path: "rector-default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboardRector />,
  },
  {
    name: "Muddati o'tgan arizalar",
    layout: "/rector",
    path: "rector-expired",
    icon: <MdErrorOutline className="h-6 w-6" />,
    component: <RectorExpired />,
  },
  {
    name: "Adminlar",
    layout: "/rector",
    path: "rector-admins",
    icon: <MdPerson className="h-6 w-6" />,
    component: <RectorAdmins />,
  },
  {
    name: "Mas'ullar",
    layout: "/rector",
    path: "rector-masullar",
    icon: <MdPerson className="h-6 w-6" />,
    component: <RectorDean />,
  },
  // {
  //   name: "Guruhlar",
  //   layout: "/rector",
  //   path: "groups",
  //   icon: <MdCastForEducation className="h-6 w-6" />,
  //   component: <SuperadminGroups />,
  // },
  {
    name: "Kategoriyalar",
    layout: "/rector",
    path: "rector-categories",
    icon: <MdArticle className="h-6 w-6" />,
    component: <RectorCategories />,
  },

  {
    name: "Xizmat turlari",
    layout: "/rector",
    path: "rector-subcategories",
    icon: <MdAutoAwesomeMotion className="h-6 w-6" />,
    component: <RectorSubCategories />,
  },
  {
    name: "Barcha arizalar",
    layout: "/rector",
    path: "rector-appeals",
    icon: <MdArticle className="h-6 w-6" />,
    component: <RectorAllAppeals />,
  },
  {
    name: "Profile",
    layout: "/rector",
    path: "rector-profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <RectorProfile />,
  },

  // {
  //   name: "Data Tables",
  //   layout: "/rector",
  //   icon: <MdBarChart className="h-6 w-6" />,
  //   path: "data-tables",
  //   component: <DataTables />,
  // },
];

export default routes;
