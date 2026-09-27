import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../../app/App";
import AuthLayout from "@/shared/layout/AuthLayout";
import { ProtectedRoute } from "@/lib/router/ProtectedRoute";
import DashboardLayout from "@/shared/layout/DashboardLayout";

// Pages load on demand: each route is its own chunk, so the first visit downloads only what it shows.
const HomePage = lazy(() => import("../../features/home/pages/HomePage"));
const AboutPage = lazy(() => import("../../features/home/pages/AboutPage"));
const NotFoundPage = lazy(() => import("@/features/home/pages/NotFoundPage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/ResetPasswordPage"));
const VerifyAccountPage = lazy(() => import("@/features/auth/pages/VerifyAccountPage"));
const CoursesPage = lazy(() => import("@/features/courses/pages/CoursesPage"));
const CourseInfoPage = lazy(() => import("@/features/courses/pages/CourseInfoPage"));
const FolderPage = lazy(() => import("@/features/materials/pages/FolderPage"));
const QuizzesPage = lazy(() => import("@/features/quizzes/pages/QuizzesPage"));
const QuizQuestionsPage = lazy(() => import("@/features/quizzes/pages/QuizQuestionPage"));
const AddQuizPage = lazy(() => import("@/features/quizzes/pages/AddQuizPage"));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));
const EditProfilePage = lazy(() => import("@/features/profile/pages/EditProfilePage"));
const AnalyticsPage = lazy(() => import("@/features/dashboard/pages/AnalyticsPage"));
const ManageUniversitiesPage = lazy(() => import("@/features/universities/pages/ManageUniversitiesPage"));
const UniversityDetailsPage = lazy(() => import("@/features/universities/pages/UniversityDetailsPage"));
const FacultyDetailsPage = lazy(() => import("@/features/universities/pages/FacultyDetailsPage"));
const ManageUsersPage = lazy(() => import("@/features/users/pages/ManageUsersPage"));
const WriterStatisticsPage = lazy(() => import("@/features/dashboard/pages/WriterStatisticsPage"));
const MajorCoursesPage = lazy(() => import("@/features/courses/pages/MajorCoursesPage"));
const MaterialExplorerPage = lazy(() => import("@/features/materials/pages/MaterialExplorerPage"));
const ManageResourcesPage = lazy(() => import("@/features/courses/pages/ManageResourcesPage"));

// Role guards mirror the API's [Authorize(Roles = ...)] attributes (Roles.WriterOrAbove, Roles.AdminOrAbove).
const CONTENT_MANAGERS = ["Writer", "Admin", "SuperAdmin"];
const ADMINS = ["Admin", "SuperAdmin"];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Has Header + Footer
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/:courseId/info", element: <CourseInfoPage /> },
      // Course files are private: listing them hands out signed URLs, so it needs a signed-in user.
      {
        path: "courses/:courseId/materials",
        element: (
          <ProtectedRoute>
            <MaterialExplorerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/folder/:folderId",
        element: (
          <ProtectedRoute>
            <FolderPage />
          </ProtectedRoute>
        ),
      },
      { path: "courses/:courseId/quizzes", element: <QuizzesPage /> },
      {
        path: "courses/:courseId/quizzes/add",
        element: (
          <ProtectedRoute requiredRoles={CONTENT_MANAGERS}>
            <AddQuizPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/quizzes/new",
        element: (
          <ProtectedRoute requiredRoles={CONTENT_MANAGERS}>
            <QuizQuestionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/quizzes/:quizId",
        element: <QuizQuestionsPage />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/edit",
        element: (
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />, // No Header/Footer, just Outlet
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "verify-account", element: <VerifyAccountPage /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requiredRoles={CONTENT_MANAGERS}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRoles={["SuperAdmin"]}>
            <AnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "universities",
        element: (
          <ProtectedRoute requiredRoles={ADMINS}>
            <ManageUniversitiesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "universities/:id",
        element: (
          <ProtectedRoute requiredRoles={ADMINS}>
            <UniversityDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "universities/:universityId/faculties/:facultyId",
        element: <FacultyDetailsPage />,
      },
      {
        path: "universities/:universityId/faculties/:facultyId/majors/:majorId",
        element: <MajorCoursesPage />,
      },
      // Dashboard management routes for materials, quizzes, and resources
      {
        path: "courses/:courseId/materials",
        element: <MaterialExplorerPage mode="manage" />,
      },
      {
        path: "courses/:courseId/folder/:folderId",
        element: <FolderPage mode="manage" />,
      },
      {
        path: "courses/:courseId/quizzes",
        element: <QuizzesPage mode="manage" />,
      },
      {
        path: "courses/:courseId/quizzes/add",
        element: <AddQuizPage />,
      },
      {
        path: "courses/:courseId/resources",
        element: <ManageResourcesPage />,
      },
      {
        path: "users",
        element: (
          <ProtectedRoute requiredRoles={ADMINS}>
            <ManageUsersPage />
          </ProtectedRoute>
        ),
      },
      { path: "writer-statistics", element: <WriterStatisticsPage /> },
    ],
  },
]);
