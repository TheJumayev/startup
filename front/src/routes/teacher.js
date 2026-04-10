import TeacherHome from "views/teacher/default/index";
import TeacherCurriculum from "views/teacher/curriculum";
import TeacherCurriculumLessons from "views/teacher/curriculum/Lessons";
import TeacherMustaqil from "views/teacher/mustaqil/index";
import TeacherMustaqilLessons from "views/teacher/mustaqil/Lessons";
import TeacherSubjects from "views/teacher/subject";
import TeacherSubjectsLessons from "views/teacher/subject/Lessons";
import TeacherSubjectsLessonsCheck from "views/teacher/curriculum/CheckLessons";
import TeacherAmaliyot from "views/teacher/amaliyot/index";
import TeacherAmaliyotCreate from "views/teacher/amaliyot/CreateAmaliyot";
import TeacherAmaliyotMonths from "views/teacher/amaliyot/AmaliyotTekshirish/StudentMonths";
import TeacherAmaliyotCreateStudents from "views/teacher/amaliyot/AmaliyotTekshirish/index";
import TeacherScoreSchedule from "views/teacher/scoresheetgroup/gruop";
import TeacherScoreScheduleStudents from "views/teacher/scoresheetgroup/scoreStudent";
import TeacherProfile from "views/teacher/profile";
import { MdBorderColor, MdCheckBox, MdChecklist, MdHome, MdInbox, MdPerson, MdScore } from "react-icons/md";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/teacher",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <TeacherHome />,
  },
  {
    name: "Vazifa",
    layout: "/teacher",
    path: "curriculum",
    icon: <MdBorderColor className="h-6 w-6" />,
    component: <TeacherCurriculum />,
  },
  {
    name: "Vazifa",
    layout: "/teacher",
    path: "curriculum/:id",
    icon: <MdBorderColor className="h-6 w-6" />,
    component: <TeacherCurriculumLessons />,
    hidden: true,
  },
  {
    name: "Mustaqil ta'lim",
    layout: "/teacher",
    path: "mustaqil",
    icon: <MdChecklist className="h-6 w-6" />,
    component: <TeacherMustaqil />,
  },
  {
    name: "Mustaqil ta'lim",
    layout: "/teacher",
    path: "mustaqil/:id",
    icon: <MdChecklist className="h-6 w-6" />,
    component: <TeacherMustaqilLessons />,
    hidden: true,
  },
  // {
  //   name: "Fanlar",
  //   layout: "/teacher",
  //   path: "subjects",
  //   icon: <MdAutoAwesomeMotion className="h-6 w-6" />,
  //   component: <TeacherSubjects />,
  // },

  // {
  //   name: "Vazifa tekshirish",
  //   layout: "/teacher",
  //   path: "homework-check",
  //   icon: <MdCheckBox className="h-6 w-6" />,
  //   component: <TeacherSubjects />,
  // },
  // {
  //   name: "Vazifa tekshirish",
  //   layout: "/teacher",
  //   path: "homework-check/:id",
  //   icon: <MdCheckBox className="h-6 w-6" />,
  //   component: <TeacherSubjectsLessons />,
  //   hidden: true,
  // },
  {
    name: "Vazifa tekshirish",
    layout: "/teacher",
    path: "homework-check/lessons/:id",
    icon: <MdCheckBox className="h-6 w-6" />,
    component: <TeacherSubjectsLessonsCheck />,
    hidden: true,
  },
  {
    name: "Amaliyot",
    layout: "/teacher",
    path: "amaliyots",
    icon: <MdInbox className="h-6 w-6" />,
    component: <TeacherAmaliyot />,
  },
  {
    name: "Amaliyot",
    layout: "/teacher",
    path: "amaliyots/:id",
    icon: <MdInbox className="h-6 w-6" />,
    component: <TeacherAmaliyotCreate />,
    hidden: true,
  },
  {
    name: "Amaliyot",
    layout: "/teacher",
    path: "amaliyots/month/:id",
    icon: <MdInbox className="h-6 w-6" />,
    component: <TeacherAmaliyotMonths />,
    hidden: true,
  },
  {
    name: "Amaliyot",
    layout: "/teacher",
    path: "amaliyots/students/:id",
    icon: <MdInbox className="h-6 w-6" />,
    component: <TeacherAmaliyotCreateStudents />,
    hidden: true,
  },
  {
    name: "Qaydnoma",
    layout: "/teacher",
    path: "score-schedule",
    icon: <MdScore className="h-6 w-6" />,
    component: <TeacherScoreSchedule />,
  },
  {
    name: "Qaydnoma",
    layout: "/teacher",
    path: "score-schedule/:id",
    icon: <MdScore className="h-6 w-6" />,
    component: <TeacherScoreScheduleStudents />,
    hidden: true,
  },
  {
    name: "Profile",
    layout: "/teacher",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <TeacherProfile />,
  },
];
export default routes;
