import TeacherDashboard from "views/teacher/default";
import TeacherProfile from "views/teacher/profile";
import TeacherGroups from "views/teacher/groups/GroupsModern";
import TeacherGroupDetail from "views/teacher/groups/GroupDetailModern";
import TeacherCurriculum from "../views/teacher/curriculum";
import TeacherCurriculumDetail from "../views/teacher/curriculum/CurriculumDetail";

import {
    MdHome,
    MdPerson,
    MdGroup,

    MdSchool,
} from "react-icons/md";

const teacherRoutes = [
    {
        name: "Bosh sahifa",
        layout: "/teacher",
        path: "default",
        icon: <MdHome className="h-6 w-6" />,
        component: <TeacherDashboard />,
    },
    {
        name: "Guruhlar",
        layout: "/teacher",
        path: "groups",
        icon: <MdGroup className="h-6 w-6" />,
        component: <TeacherGroups />,
    },

    {
        name: "O'quv dasturlari",
        layout: "/teacher",
        path: "curriculum",
        icon: <MdSchool className="h-6 w-6" />,
        component: <TeacherCurriculum />,
    },

    {
        name: "Profil",
        layout: "/teacher",
        path: "profile",
        icon: <MdPerson className="h-6 w-6" />,
        component: <TeacherProfile />,
    },
];

export const teacherDetailRoutes = [
    {
        name: "Guruh Detail",
        layout: "/teacher",
        path: "groups/:groupId",
        component: <TeacherGroupDetail />,
    },
    {
        name: "Curriculum Detail",
        layout: "/teacher",
        path: "curriculum/:curriculmId",
        component: <TeacherCurriculumDetail />,
    },
];

export default teacherRoutes;

