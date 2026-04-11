import MainDashboardSuper from "views/superadmin/default";
import SuperAdminProfile from "views/superadmin/profile";
import GroupsModern from "views/superadmin/groups/GroupsModern";
import GroupDetailModern from "views/superadmin/groups/GroupDetailModern";
import SubjectsModern from "views/superadmin/subjects";
import CurriculumModern from "views/superadmin/curriculum/CurriculumModern";
import UsersModern from "views/superadmin/users";

import {
    MdHome,
    MdPerson,
    MdGroup,
    MdBook,
    MdSchool,
    MdPeople,
} from "react-icons/md";

const routesModern = [
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
        component: <GroupsModern />,
        hidden: false,
    },
    {
        name: "Fanlar",
        layout: "/superadmin",
        path: "subjects",
        icon: <MdBook className="h-6 w-6" />,
        component: <SubjectsModern />,
    },
    {
        name: "O'quv dasturlari",
        layout: "/superadmin",
        path: "curriculum",
        icon: <MdSchool className="h-6 w-6" />,
        component: <CurriculumModern />,
    },
    {
        name: "Foydalanuvchilar",
        layout: "/superadmin",
        path: "users",
        icon: <MdPeople className="h-6 w-6" />,
        component: <UsersModern />,
    },

    {
        name: "Profile",
        layout: "/superadmin",
        path: "profile",
        icon: <MdPerson className="h-6 w-6" />,
        component: <SuperAdminProfile />,
    },
];

// Additional routes for detail pages (not shown in sidebar)
export const detailRoutes = [
    {
        name: "Guruhi Detail",
        layout: "/superadmin",
        path: "groups/:groupId",
        component: <GroupDetailModern />,
    },
];

export default routesModern;

