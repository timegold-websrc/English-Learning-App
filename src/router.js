import Vue from 'vue'
import Router from 'vue-router'

// Layouts
import Layout from '@/components/Layout/Layout'
import LayoutPage from '@/components/Layout/LayoutPage'
//// Student views
const StudentLogin = () => import('@/views/StudentViews/Auth/Login.vue')
const StudentResetPassword = () => import('@/views/StudentViews/Auth/ResetPassword.vue')
const StudentRegister = () => import('@/views/StudentViews/Auth/Register.vue')

const Privacy = () => import('@/views/CommonPages/PrivacyTerms.vue')
const Service = () => import('@/views/CommonPages/ServiceAgree.vue')

const Home = () => import('@/views/StudentViews/Home.vue')
const Messages = () => import('@/views/StudentViews/Messages.vue')

const Courses = () => import('@/views/StudentViews/Courses/Courses.vue')
const Units = () => import('@/views/StudentViews/Courses/Courseunits.vue')
const Lesson = () => import('@/views/StudentViews/Courses/Lesson.vue')

const Homework = () => import('@/views/StudentViews/Homework/Homework.vue')
const Completed = () => import('@/views/StudentViews/Homework/Complete.vue')
const UnCompleted = () => import('@/views/StudentViews/Homework/Uncomplete.vue')
const Over = () => import('@/views/StudentViews/Homework/Over.vue')

const Collection = () => import('@/views/StudentViews/Review/Collection.vue')
const Review = () => import('@/views/StudentViews/Review/Review.vue')
const ReviewLesson = () => import('@/views/StudentViews/Review/ReviewLesson.vue')
const ReviewRange = () => import('@/views/StudentViews/Review/ReviewRange.vue')

// const ExtraCourse = () => import('@/views/StudentViews/ExtraCourse/ExtraCourse.vue')
const ExtraBooks = () => import('@/views/StudentViews/ExtraCourse/ExtraBooks.vue')
const ExtraView = () => import('@/views/StudentViews/ExtraCourse/ExtraView.vue')

const AnalyticResult = () => import('@/views/StudentViews/AnalyticResult.vue')
const Settings = () => import('@/views/StudentViews/Settings.vue')
const ResetPass = () => import('@/views/StudentViews/ResetPass.vue')


///// Teacher Views //////////
const TeacherLogin = () => import('@/views/TeacherViews/Auth/Login.vue')
const TeacherResetPassword = () => import('@/views/TeacherViews/Auth/ResetPassword.vue')
const TeacherRegister = () => import('@/views/TeacherViews/Auth/Register.vue')

const TeacherDashboard = () => import('@/views/TeacherViews/AdminDashboard.vue')
const TeacherCourse = () => import('@/views/TeacherViews/Course/Course.vue')
const TeacherImportBook = () => import('@/views/TeacherViews/Course/ImportBook.vue')
const TeacherUnits = () => import('@/views/TeacherViews/Course/Units.vue')
const TeacherLessons = () => import('@/views/TeacherViews/Course/Lessons.vue')
const TeacherSentences = () => import('@/views/TeacherViews/Course/Sentences.vue')
const TeacherEditSentences = () => import('@/views/TeacherViews/Course/EditSentences.vue')

const TeacherBooks = () => import('@/views/TeacherViews/Books/Books.vue')
const TeacherHomework = () => import('@/views/TeacherViews/Homework/Homework.vue')
const TeacherHomeworkView = () => import('@/views/TeacherViews/Homework/HomeworkView.vue')
const TeacherCourseHomework = () => import('@/views/TeacherViews/Homework/CourseHomework.vue')
const TeacherSelfHomework = () => import('@/views/TeacherViews/Homework/SelfHomework.vue')
const TeacherHomeworkResults = () => import('@/views/TeacherViews/Homework/HomeworkResults.vue')
const TeacherStudentResults = () => import('@/views/TeacherViews/Homework/StudentResults.vue')
const TeacherStatistics = () => import('@/views/TeacherViews/Homework/Statistics.vue')

const TeacherResultDetails = () => import('@/views/TeacherViews/ResultDetails.vue')

const TeacherClass = () => import('@/views/TeacherViews/Class/Class.vue')
const TeacherClassDetail = () => import('@/views/TeacherViews/Class/ClassDetail.vue')

const TeacherStudent = () => import('@/views/TeacherViews/Student/Student.vue')
const TeacherStudentInfo = () => import('@/views/TeacherViews/Student/StudentInfo.vue')
const TeacherCourseResults = () => import('@/views/TeacherViews/Student/CourseResults.vue')
const TeacherSettings = () => import('@/views/TeacherViews/Settings.vue')

const ErrorPage = () => import('@/views/CommonPages/404.vue')

Vue.use(Router)

export default new Router({
    // mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/teacher',
            redirect: '/teacher/course'
        },

        {
            path: '/',
            component: Layout,
            children: [
                {
                    path: '/home',
                    component: Home,
                    meta: {requireAuth: true, role: 'both'}
                },
                {
                    path: '/course',
                    component: Courses,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/course/unit',
                    component: Units,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/course/lesson',
                    component: Lesson,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/homework',
                    component: Homework,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/homework/complete',
                    component: Completed,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/homework/uncomplete',
                    component: UnCompleted,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/homework/over',
                    component: Over,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/collection',
                    component: Collection,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/collection/review',
                    component: Review,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/collection/review/lesson',
                    component: ReviewLesson,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/collection/review/range',
                    component: ReviewRange,
                    meta: {requireAuth: true, role: 'student'}
                },
                // {
                //     path: '/extracourse',
                //     component: ExtraCourse
                // },
                {
                    path: '/extracourse',
                    component: ExtraBooks,
                    meta: {requireAuth: true, role: 'both'}
                },
                {
                    path: '/extracourse/extraview',
                    component: ExtraView,
                    meta: {requireAuth: true, role: 'both'}
                },
                {
                    path: '/messages',
                    component: Messages,
                    meta: {requireAuth: true, role: 'both'}
                },

                {
                    path: '/analytic_result',
                    component: AnalyticResult,
                    meta: {requireAuth: true, role: 'both'}
                },

                {
                    path: '/settings',
                    component: Settings,
                    meta: {requireAuth: true, role: 'student'}
                },
                {
                    path: '/reset_pass',
                    component: ResetPass,
                    meta: {requireAuth: true, role: 'student'}
                }
            ]
        },
        // User Pages
        {
            path: '/',
            component: LayoutPage,
            children: [
                {
                    component: StudentLogin,
                    path: '/login',
                },
                {
                    component: StudentResetPassword,
                    path: '/resetpassword',
                },
                {
                    component: StudentRegister,
                    path: '/register',
                },
                

                {
                    component: TeacherLogin,
                    path: '/teacher/login',
                },
                {
                    component: TeacherResetPassword,
                    path: '/teacher/resetpassword',
                },
                {
                    component: TeacherRegister,
                    path: '/teacher/register',
                },
                

                {
                    component: Privacy,
                    path: '/privacy',
                },
                {
                    component: Service,
                    path: '/service',
                }
            ]
        },

        {
            path: '/teacher',
            component: Layout,
            children: [
                {
                    path: '/teacher/dashboard',
                    component: TeacherDashboard,
                    meta: {requireAuth: true, role: 'admin'}
                },
                {
                    path: '/teacher/course',
                    component: TeacherCourse,
                    meta: {requireAuth: true, role: 'admin'}
                },
                {
                    path: '/teacher/course/import_book',
                    component: TeacherImportBook,
                    meta: {requireAuth: true, role: 'admin'}
                },
                {
                    path: '/teacher/course/units',
                    component: TeacherUnits,
                    meta: {requireAuth: true, role: 'admin'}
                },
                {
                    path: '/teacher/course/lessons',
                    component: TeacherLessons,
                    meta: {requireAuth: true, role: 'admin'}
                },
                {
                    path: '/teacher/course/sentences',
                    component: TeacherSentences,
                    meta: {requireAuth: true, role: 'admin'}
                },
                {
                    path: '/teacher/course/edit_sentences',
                    component: TeacherEditSentences,
                    meta: {requireAuth: true, role: 'admin'}
                },
                {
                    path: '/teacher/books',
                    component: TeacherBooks,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/homework',
                    component: TeacherHomework,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/homeworks',
                    component: TeacherHomeworkView,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/homework/homeworksInCourse',
                    component: TeacherCourseHomework,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/homework/self_homework',
                    component: TeacherSelfHomework,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/homework/homework_results',
                    component: TeacherHomeworkResults,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/homework/student_results',
                    component: TeacherStudentResults,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/homework/statistics',
                    component: TeacherStatistics,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/result_details',
                    component: TeacherResultDetails,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/class',
                    component: TeacherClass,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/class/detail',
                    component: TeacherClassDetail,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/student',
                    component: TeacherStudent,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/student/student_info',
                    component: TeacherStudentInfo,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/student/course_results',
                    component: TeacherCourseResults,
                    meta: {requireAuth: true, role: 'teacher'}
                },
                {
                    path: '/teacher/settings',
                    component: TeacherSettings,
                    meta: {requireAuth: true, role: 'admin'}
                }
            ]
        },
        // Not found route
        {
            path: '*',
            component: ErrorPage
            // redirect: '/error'
        }
    ]
})