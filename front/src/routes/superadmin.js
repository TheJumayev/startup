import MainDashboardSuper from "views/superadmin/default";
import SuperadminAdmins from "views/superadmin/tables";
import SuperadminBanker from "views/superadmin/banker";
import SuperadminDeans from "views/superadmin/DeansBxu/Dean";
import SuperAdminTeacher from "views/superadmin/teacher";
import SuperAdminTeacherMustaqil from "views/superadmin/teacherMustaqil/index";
// import SuperAdminStudent from "views/superadmin/AllStudents/index";
import SuperadminScoreSheetAllStudents from "views/superadmin/score-sheet-all-students";
import SuperadminVedimis from "views/superadmin/score-sheet/index";
import SuperadminFinalExam from "views/superadmin/FinalExam/index";
import SuperadminFinalExamCode from "views/superadmin/ExamChangeCodeTestCenter/index";
import SuperadminFinalExamStudents from "views/superadmin/FinalExam/students/index";
import SuperadminFinalExamStudentsTests from "views/superadmin/FinalExam/students/TestsView";
import SuperadminFinalExamCreate from "views/superadmin/FinalExam/create";
import SuperadminHisobotExam from "views/superadmin/FinalExam/hisobot/index";
import SuperadminFinalExamEdit from "views/superadmin/FinalExam/edit";
import SuperadminMustaqilExam from "views/superadmin/MustaqilExam/index";
import SuperadminMustaqilExamStudents from "views/superadmin/MustaqilExam/students";
import SuperadminMustaqilExamView from "views/superadmin/MustaqilExam/testview";
import SuperadminMustaqilExamTestView from "views/superadmin/MustaqilExam/testview";
import SuperadminFinalIpconfig from "views/superadmin/ExamChangeCodeTestCenter/ipconfig";
import SuperadminAddStudent from "views/superadmin/addStudent/index";
import SuperadminStudentEdit from "views/superadmin/addStudent/student";
import SuperAdminSubCategories from "views/superadmin/subCategories";
import SuperAdminSecretary from "views/superadmin/secretary";
import SuperAdminCurriculumTeacher from "views/superadmin/TeachearCurriculum";
import SuperAdminDebts from "views/superadmin/studentDebts";
import CheckLessons from "views/superadmin/AllHomework/CheckLessons";
import CheckLessonsTeacher from "views/superadmin/teacher-statistic/index";
import SuperAdminFaculty from "views/superadmin/faculty";
import SuperAdminSpeciality from "views/superadmin/speciality";
import SuperAdminCurriculum from "views/superadmin/curriculum";
import SuperAdminCategoriesLesson from "views/superadmin/categories/Lessons";
import SurveySuperadmin from "views/superadmin/survey/index";
import SuperadminGroups from "views/superadmin/group";
import SuperAdminSuperGroup from "views/superadmin/super-group/index";
import OfineAttendance from "views/superadmin/ofline-attendance";
import OfineAttendanceOneGroup from "views/superadmin/ofline-attendance/one-group/index";
import SuperadminTestGroups from "views/superadmin/exam/Groups";
import SuperadminTestGroupsDetails from "views/superadmin/exam/TestCenter";
import SuperadminTestStudentDetails from "views/superadmin/exam/StudentDetails";
import SuperAdminAllAppeals from "views/superadmin/all-appeals";
import SuperAdminDeptStudent from "views/superadmin/all-appeals/Debts";
import SuperAdminToken from "views/superadmin/token";
import SuperAdminProfile from "views/superadmin/profile";
import SuperAdminStudentTable from "views/superadmin/Talabalar-bazasi/StudentTable";
import SuperAdminTests from "views/superadmin/Test-yuklash";
import SuperAdminCertificate from "views/superadmin/Sertifikatlar";
import SuperAdminOnlineGroups from "views/superadmin/online-groups";
import SuperAdminAttendance from "views/superadmin/online-attendance/index";
import SuperAdminAttendanceOnline from "views/superadmin/online-attendance/one-schedule-list/index";
import TgGroup from "views/superadmin/tg-group/index";
import TgUser from "views/superadmin/tg-user/index";
import SuperAdminOnlineGroupStudents from "views/superadmin/online-groups/students";
import SuperAdminOnlineGroupStudent from "views/superadmin/online-groups/students/induvid";
import SuperAdminOnlineSubjects from "views/superadmin/online-subjects/index";
import SuperAdminTestUpload from "views/superadmin/Test-yuklash/Test";
import SuperAdminMagistr from "views/superadmin/magistrFile/index";
import SuperAdminAppeals from "views/superadmin/Appeal";
import Contract from "views/superadmin/contract/Contract";
import StuList from "views/superadmin/studentTablesBugalter/index";
import SuperadminDiscount from "views/superadmin/discount/Discount";
import FaceId from "views/superadmin/faceIdStudent/index";
import FaceIdStudent from "views/superadmin/faceIdStudent/StudentTables";
import Amaliyot from "views/superadmin/AmaliyotStudent/index";
import AmaliyotStudents from "views/superadmin/AmaliyotStudent/AmaliyotStudents";
import AmaliyotStudentsCheck from "views/superadmin/AmaliyotStudent/AmaliyotTekshirish/index";
import AmaliyotStudentsmonths from "views/superadmin/AmaliyotStudent/AmaliyotTekshirish/StudentMonths";
import KafolatXati from "views/superadmin/kafolat-xati/Contract";
import SuperadminScoreStudent from "views/superadmin/score-sheet/scoreStudents";
import SuperAdminCategories from "views/superadmin/categories/index";
import SuperAdminExplanation from "views/superadmin/explanation/index";
import SuperAdminLaterStudents from "views/superadmin/later-students/index";
import SuperAdminLaters from "views/superadmin/later-students/allStudents";
import SuperAdminParents from "views/superadmin/parents-meetings/index";
import SuperAdminDalolatnoma from "views/superadmin/dalolatnoma/index";

import {
  MdAccountCircle,
  MdBookOnline,
  MdBorderColor,
  MdFolderSpecial,
  MdHome,
  MdPerson,
  MdGroups,
  MdPlayLesson,
  MdOutlineRule,
  MdAddTask,
  MdArticle,
  MdAutoAwesomeMotion,
  MdErrorOutline,
  MdUpload,
  MdOutlineFileUpload,
  MdBook,
  MdOndemandVideo,
  MdInbox,
  MdOutlineViewList,
  MdList,
  MdBookmark,
  MdOutlineMoney,
  MdHomeWork,
  MdCheckBox,
  MdQuiz,
  MdFace,
  MdTableView,
  MdOutlineThumbsUpDown,
  MdSchedule,
  MdScore,
  MdPersonPin,
  MdCode,
  MdApi,
  MdChecklist,
  MdComputer,
  MdFontDownload,
  MdViewList,
  MdMeetingRoom,
} from "react-icons/md";
import { IoMdPaper } from "react-icons/io";

const routes = [
  {
    name: "Bosh sahifa",
    layout: "/superadmin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboardSuper />,
  },
  // {
  //   name: "Muddati o'tgan arizalar",
  //   layout: "/superadmin",
  //   path: "expired",
  //   icon: <MdErrorOutline className="h-6 w-6" />,
  //   component: <Expired />,
  // },
  {
    name: "Adminlar",
    layout: "/superadmin",
    path: "admins",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperadminAdmins />,
  },
  {
    name: "Bugalter",
    layout: "/superadmin",
    path: "banker",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperadminBanker />,
  },
  {
    name: "Tutor",
    layout: "/superadmin",
    path: "deans",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperadminDeans />,
  },
  {
    name: "O'qituvchilar",
    layout: "/superadmin",
    path: "teacher",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminTeacher />,
  },
  {
    name: "Mustaqil dars biriktirsh",
    layout: "/superadmin",
    path: "mustaqil",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminTeacherMustaqil />,
  },
  // {
  //   name: "Talabalar",
  //   layout: "/superadmin",
  //   path: "students",
  //   icon: <MdGroups className="h-6 w-6" />,
  //   component: <SuperAdminStudent />,
  // },
  {
    name: "Qaydnoma barchasi",
    layout: "/superadmin",
    path: "all-score-sheets",
    icon: <MdTableView className="h-6 w-6" />,
    component: <SuperadminScoreSheetAllStudents />,
  },
  {
    name: "Qaydnoma",
    layout: "/superadmin",
    path: "vedimis",
    icon: <MdTableView className="h-6 w-6" />,
    component: <SuperadminVedimis />,
  },
  {
    name: "Qaydnoma",
    layout: "/superadmin",
    path: "vedimis/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperadminScoreStudent />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/superadmin",
    path: "final-exam",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminFinalExam />,
  },
  {
    name: "Yakuniy nazorat kodlari",
    layout: "/superadmin",
    path: "codes",
    icon: <MdCode className="h-6 w-6" />,
    component: <SuperadminFinalExamCode />,
  },

  {
    name: "Yakuniy nazorat",
    layout: "/superadmin",
    path: "final-exam/students/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminFinalExamStudents />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/superadmin",
    path: "final-exam/students/tests/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminFinalExamStudentsTests />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/superadmin",
    path: "final-exam/create",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminFinalExamCreate />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/superadmin",
    path: "final-exam/hisobot/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminHisobotExam />,
    hidden: true,
  },
  {
    name: "Yakuniy nazorat",
    layout: "/superadmin",
    path: "final-exam/edit/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminFinalExamEdit />,
    hidden: true,
  },

  {
    name: "Mustaqil ta'lim imthoni",
    layout: "/superadmin",
    path: "exam-mustaqil",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminMustaqilExam />,
  },
  {
    name: "Mustaqil ta'lim imthoni",
    layout: "/superadmin",
    path: "exam-mustaqil/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminMustaqilExamStudents />,
    hidden: true,
  },
  {
    name: "Mustaqil ta'lim imthoni",
    layout: "/superadmin",
    path: "exam-mustaqil/student/test-view/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminMustaqilExamView />,
    hidden: true,
  },
  {
    name: "Mustaqil ta'lim imthoni",
    layout: "/superadmin",
    path: "exam-mustaqil/test/:id",
    icon: <IoMdPaper className="h-6 w-6" />,
    component: <SuperadminMustaqilExamTestView />,
    hidden: true,
  },

  {
    name: "Davomat",
    layout: "/superadmin",
    path: "attendance",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminAttendance />,
  },
  {
    name: "Davomat",
    layout: "/superadmin",
    path: "attendance/:id",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminAttendanceOnline />,
    hidden: true,
  },
  {
    name: "Test komp",
    layout: "/superadmin",
    path: "ipconfig",
    icon: <MdApi className="h-6 w-6" />,
    component: <SuperadminFinalIpconfig />,
  },
  {
    name: "Talaba qo'shish",
    layout: "/superadmin",
    path: "add-student",
    icon: <MdGroups className="h-6 w-6" />,
    component: <SuperadminAddStudent />,
  },
  {
    name: "Talaba qo'shish",
    layout: "/superadmin",
    path: "add-student/:id",
    icon: <MdGroups className="h-6 w-6" />,
    component: <SuperadminStudentEdit />,
    hidden: true,
  },
  {
    name: "Sekretarlar",
    layout: "/superadmin",
    path: "secretary",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminSecretary />,
  },
  // {
  //   name: "O'qituvchilarni biriktirish",
  //   layout: "/superadmin",
  //   path: "teachers-curriculum",
  //   icon: <MdPerson className="h-6 w-6" />,
  //   component: <SuperAdminCurriculumTeacher />,
  // },
  {
    name: "Qarzdor talabalar",
    layout: "/superadmin",
    path: "debts",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminDebts />,
  },
  {
    name: "Vazifa tekshirish",
    layout: "/superadmin",
    path: "check-home",
    icon: <MdHomeWork className="h-6 w-6" />,
    component: <CheckLessons />,
  },
  {
    name: "Statistika",
    layout: "/superadmin",
    path: "upload-homeworks",
    icon: <MdTableView className="h-6 w-6" />,
    component: <CheckLessonsTeacher />,
  },
  {
    name: "Fakultet",
    layout: "/superadmin",
    path: "faculty",
    icon: <MdAutoAwesomeMotion className="h-6 w-6" />,
    component: <SuperAdminFaculty />,
  },
  {
    name: "Mutaxasislik",
    layout: "/superadmin",
    path: "speciality",
    icon: <MdFolderSpecial className="h-6 w-6" />,
    component: <SuperAdminSpeciality />,
  },

  {
    name: "O'quv reja",
    layout: "/superadmin",
    path: "curriculum",
    icon: <MdBorderColor className="h-6 w-6" />,
    component: <SuperAdminCurriculum />,
  },
  {
    name: "O'quv reja",
    layout: "/superadmin",
    path: "curriculum/:id",
    icon: <MdBorderColor className="h-6 w-6" />,
    component: <SuperAdminCurriculum />,
    hidden: true,
  },

  {
    name: "O'quv reja fanlari",
    layout: "/superadmin",
    path: "curriculums-subject",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminCategories />,
  },
  {
    name: "O'quv rejalar ro'yxati",
    layout: "/superadmin",
    path: "curriculum-subject/:id",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminCategoriesLesson />,
    hidden: true,
  },
  {
    name: "So'rovnoma",
    layout: "/superadmin",
    path: "survey",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SurveySuperadmin />,
  },
  // {
  //   name: "NewSubcategory",
  //   layout: "/superadmin",
  //   path: "newsubcategory",
  //   icon: <MdArticle className="h-6 w-6" />,
  //   component: <AddNewSubCategory />,
  // },

  {
    name: "Fanlar",
    layout: "/superadmin",
    path: "subjects",
    icon: <MdAutoAwesomeMotion className="h-6 w-6" />,
    component: <SuperAdminSubCategories />,
  },
  {
    name: "Guruhlar",
    layout: "/superadmin",
    path: "groups",
    icon: <MdGroups className="h-6 w-6" />,
    component: <SuperadminGroups />,
  },
  {
    name: "Super Guruhlar",
    layout: "/superadmin",
    path: "super-groups",
    icon: <MdGroups className="h-6 w-6" />,
    component: <SuperAdminSuperGroup />,
  },
  {
    name: "Ofline davomat",
    layout: "/superadmin",
    path: "ofline-attendance",
    icon: <MdGroups className="h-6 w-6" />,
    component: <OfineAttendance />,
  },

  {
    name: "Ofline davomat one group",
    layout: "/superadmin",
    path: "ofline-attendance/:id",
    icon: <MdGroups className="h-6 w-6" />,
    component: <OfineAttendanceOneGroup />,
    hidden: true,
  },
  {
    name: "Imtihon",
    layout: "/superadmin",
    path: "exams",
    icon: <MdGroups className="h-6 w-6" />,
    component: <SuperadminTestGroups />,
  },
  {
    name: "Imtihon",
    layout: "/superadmin",
    path: "exams/:id",
    icon: <MdGroups className="h-6 w-6" />,
    component: <SuperadminTestGroupsDetails />,
    hidden: true,
  },
  {
    name: "Imtihon",
    layout: "/superadmin",
    path: "exams/student/:studentId",
    icon: <MdGroups className="h-6 w-6" />,
    component: <SuperadminTestStudentDetails />,
    hidden: true,
  },
  {
    name: "Talabalar",
    layout: "/superadmin",
    path: "groups/:groupId",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminAllAppeals />,
    hidden: true,
  },
  {
    name: "Qarzdorliklar",
    layout: "/superadmin",
    path: "groups/group/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminDeptStudent />,
    hidden: true,
  },
  {
    name: "Token",
    layout: "/superadmin",
    path: "token",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminToken />,
  },
  {
    name: "Profile",
    layout: "/superadmin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminProfile />,
  },
  {
    name: "Talabalar bazasi",
    layout: "/superadmin",
    path: "students-update",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminStudentTable />,
  },
  // {
  //   name: "Test yuklash",
  //   layout: "/superadmin",
  //   path: "tests",
  //   icon: <MdOutlineFileUpload className="h-6 w-6" />,
  //   component: <SuperAdminTests />,
  // },
  {
    name: "Sertifikat olganlar",
    layout: "/superadmin",
    path: "certificates",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminCertificate />,
  },

  {
    name: "Online Guruhlar",
    layout: "/superadmin",
    path: "online-group",
    icon: <MdBookOnline className="h-6 w-6" />,
    component: <SuperAdminOnlineGroups />,
  },
  {
    name: "Davomat",
    layout: "/superadmin",
    path: "attendance",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminAttendance />,
  },
  {
    name: "Davomat",
    layout: "/superadmin",
    path: "attendance/:id",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminAttendanceOnline />,
    hidden: true,
  },
  {
    name: "Tushuntirish xatlari",
    layout: "/superadmin",
    path: "explanation",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminExplanation />,
    hidden: false,
  },
  {
    name: "Kechikganlarni kiritish",
    layout: "/superadmin",
    path: "later-students",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminLaterStudents />,
    hidden: false,
  },
  {
    name: "Kechikganlar ro'yxati",
    layout: "/superadmin",
    path: "laters",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminLaters />,
    hidden: false,
  },
  {
    name: "Ota-onalar majlisi",
    layout: "/superadmin",
    path: "meetings",
    icon: <MdMeetingRoom className="h-6 w-6" />,
    component: <SuperAdminParents />,
    hidden: false,
  },
  {
    name: "Dalolatnoma",
    layout: "/superadmin",
    path: "dalolatnoma",
    icon: <MdBook className="h-6 w-6" />,
    component: <SuperAdminDalolatnoma />,
    hidden: false,
  },
  {
    name: "Telegram guruh",
    layout: "/superadmin",
    path: "tg-group",
    icon: <MdBookmark className="h-6 w-6" />,
    component: <TgGroup />,
  },
  {
    name: "Telegram User",
    layout: "/superadmin",
    path: "tg-user",
    icon: <MdBookmark className="h-6 w-6" />,
    component: <TgUser />,
  },
  {
    name: "Online Guruhlar Talabalari",
    layout: "/superadmin",
    path: "online-group/:groupId",
    hidden: true,
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminOnlineGroupStudents />,
  },

  {
    name: "Talaba Ma'lumoti",
    layout: "/superadmin",
    path: "online-group/student/:studentId",
    hidden: true,
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminOnlineGroupStudent />,
  },
  // {
  //   name: "Online Fanlar",
  //   layout: "/superadmin",
  //   path: "online-subjects",
  //   icon: <MdAutoAwesomeMotion className="h-6 w-6" />,
  //   component: <SuperAdminOnlineSubjects />,
  // //  hidden: true,
  // },

  {
    name: "Test yuklash",
    layout: "/superadmin",
    path: "test-upload/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <SuperAdminTestUpload />,
    hidden: true,
  },

  {
    name: "Magistr Excel",
    layout: "/superadmin",
    path: "magistr-excel",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminMagistr />,
  },
  {
    name: "Arizalar",
    layout: "/superadmin",
    path: "appeals",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperAdminAppeals />,
  },
  {
    name: "Contract",
    layout: "/superadmin",
    path: "contract",
    icon: <MdArticle className="h-6 w-6" />,
    component: <Contract />,
  },
  {
    name: "Kontraktlar ro'yxati",
    layout: "/superadmin",
    path: "stu-list",
    icon: <MdArticle className="h-6 w-6" />,
    component: <StuList />,
  },
  {
    name: "Chegirmalar",
    layout: "/superadmin",
    path: "discount-students",
    icon: <MdArticle className="h-6 w-6" />,
    component: <SuperadminDiscount />,
  },

  {
    name: "FACE ID",
    layout: "/superadmin",
    path: "face-group",
    icon: <MdFace className="h-6 w-6" />,
    component: <FaceId />,
  },
  {
    name: "FACE",
    layout: "/superadmin",
    path: "face-group/:id",
    icon: <MdFace className="h-6 w-6" />,
    component: <FaceIdStudent />,
    hidden: true,
  },
  {
    name: "Kafolat xati",
    layout: "/superadmin",
    path: "kafolat-xati",
    icon: <MdFace className="h-6 w-6" />,
    component: <KafolatXati />,
  },
  {
    name: "Amaliyot",
    layout: "/superadmin",
    path: "amaliyot-group",
    icon: <MdInbox className="h-6 w-6" />,
    component: <Amaliyot />,
  },
  {
    name: "Amaliyot",
    layout: "/superadmin",
    path: "amaliyot-group/:id",
    icon: <MdInbox className="h-6 w-6" />,
    component: <AmaliyotStudents />,
    hidden: true,
  },
  {
    name: "Amaliyot",
    layout: "/superadmin",
    path: "amaliyots/students/:id",
    icon: <MdInbox className="h-6 w-6" />,
    component: <AmaliyotStudentsCheck />,
    hidden: true,
  },
  {
    name: "Amaliyot",
    layout: "/superadmin",
    path: "amaliyots/month/:id",
    icon: <MdInbox className="h-6 w-6" />,
    component: <AmaliyotStudentsmonths />,
    hidden: true,
  },

  // {
  //   name: "Data Tables",
  //   layout: "/superadmin",
  //   icon: <MdBarChart className="h-6 w-6" />,
  //   path: "data-tables",
  //   component: <DataTables />,
  // },
  // {
  //   name: "NewSubcategory",
  //   layout: "/superadmin",
  //   path: "newsubcategory",
  //   icon: <MdArticle className="h-6 w-6" />,
  //   component: <AddNewSubCategory />,
  // },
];
export default routes;
