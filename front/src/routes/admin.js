import MainDashboard from "views/admin/default";
import Profile from "views/admin/profile";
import { MdArticle, MdBookmark, MdBookOnline, MdGroups, MdHome, MdInbox, MdPerson, MdQuiz } from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  
  {
    name: "Profile",
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },
  
];
export default routes;
