import { getPaginated } from "@/lib/api/pagination";
import type { PaginatedResponse } from "@/lib/api/types";
import { apiClient } from "@/lib/api/apiClient";
import type {
  Course,
  CourseApiResponse,
  CourseDetails,
  CourseFilterValues,
  University,
  Faculty,
  Major,
  CourseInfo,
  CourseInfoRequest,
  CourseResourceRequest,
  CreateCourseRequest,
} from "./types";
import { REQUIREMENT_NATURE_MAP, REQUIREMENT_TYPE_MAP } from "./types";

// Fetch course by code (for add dialog step 1)
export const fetchCourseByCode = async (courseCode: string) => {
  const response = await apiClient.get<CourseDetails>(
    `/courses/by-code/${courseCode.toUpperCase()}`
  );
  return response.data;
};

// Helper function to map API response to Course UI type.
// majorName comes from the caller's own selection/context (the by-major
// endpoint doesn't repeat the major's name on every course row since the
// caller already knows which major it asked for).
export const mapApiResponseToCourse = (
  apiCourse: CourseApiResponse,
  majorName: string = ""
): Course => {
  // Map requirement nature and type to badges
  const badges: string[] = [];
  if (apiCourse.requirementNature) {
    badges.push(apiCourse.requirementNature);
  }
  if (apiCourse.requirementType) {
    badges.push(apiCourse.requirementType);
  }

  return {
    id: apiCourse.id,
    code: apiCourse.courseCode ?? "",
    name: apiCourse.courseName,
    major: majorName,
    badges,
    materials: apiCourse.numberOfMaterials,
    quizzes: apiCourse.numberOfQuizzes,
    hasCourseInfo: apiCourse.hasCourseInfo,
  };
};

// Fetch courses by major with filters
export const fetchCoursesByMajor = async (
  majorId: number,
  page: number = 1,
  pageSize: number = 12,
  filters?: CourseFilterValues
): Promise<PaginatedResponse<Course>> => {
  const extraParams: string[] = [];

  // Map filter values to API parameters
  if (filters?.requirement) {
    const mappedValue =
      REQUIREMENT_NATURE_MAP[filters.requirement] || filters.requirement;
    extraParams.push(`requirementNature=${encodeURIComponent(mappedValue)}`);
  }

  if (filters?.courseType) {
    const mappedValue =
      REQUIREMENT_TYPE_MAP[filters.courseType] || filters.courseType;
    extraParams.push(`requirementType=${encodeURIComponent(mappedValue)}`);
  }

  const extraParamsString = extraParams.join("&");

  const response = await getPaginated<CourseApiResponse>(
    `/courses/by-major/${majorId}`,
    page,
    pageSize,
    extraParamsString
  );

  // Map API response to Course type
  const mappedCourses: Course[] = response.items.map((item) =>
    mapApiResponseToCourse(item, filters?.majorName)
  );

  return {
    ...response,
    items: mappedCourses,
  };
};

// Fetch universities
export const fetchUniversities = async (
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<University>> => {
  return getPaginated<University>("/universities", page, pageSize);
};

// Fetch faculties by university
export const fetchFacultiesByUniversity = async (
  universityId: number,
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<Faculty>> => {
  return getPaginated<Faculty>(
    `/faculties/by-university/${universityId}`,
    page,
    pageSize
  );
};

// Fetch majors by faculty
export const fetchMajorsByFaculty = async (
  facultyId: number,
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<Major>> => {
  return getPaginated<Major>(`/majors/by-faculty/${facultyId}`, page, pageSize);
};

// Fetch single university by ID
export const fetchUniversityById = async (
  universityId: number
): Promise<University> => {
  const response = await apiClient.get<University>(
    `/universities/${universityId}`
  );
  return response.data;
};

// Fetch single faculty by ID
export const fetchFacultyById = async (facultyId: number): Promise<Faculty> => {
  const response = await apiClient.get<Faculty>(`/faculties/${facultyId}`);
  return response.data;
};

// Fetch single major by ID
export const fetchMajorById = async (majorId: number): Promise<Major> => {
  const response = await apiClient.get<Major>(`/majors/${majorId}`);
  return response.data;
};

// Fetch courses with full control (for MajorCoursesPage)
export const fetchCoursesRaw = async (
  majorId: number,
  page: number,
  pageSize: number,
  requirementType?: string,
  requirementNature?: string
): Promise<PaginatedResponse<CourseApiResponse>> => {
  const params: Record<string, string> = {
    pageNumber: page.toString(),
    pageSize: pageSize.toString(),
  };

  if (requirementType) {
    params.requirementType = requirementType;
  }
  if (requirementNature) {
    params.requirementNature = requirementNature;
  }

  const response = await apiClient.get<PaginatedResponse<CourseApiResponse>>(
    `/courses/by-major/${majorId}`,
    { params }
  );

  return response.data;
};

// Fetch course info by course ID
export const fetchCourseInfo = async (
  courseId: number
): Promise<CourseInfo> => {
  const response = await apiClient.get<CourseInfo>(`/courses/${courseId}/info`);
  return response.data;
};

// Fetch single course by ID
export const fetchCourseById = async (
  courseId: number
): Promise<CourseDetails> => {
  const response = await apiClient.get<CourseDetails>(
    `/courses/${courseId}`
  );
  return response.data;
};

// ===== Course management (Writer, Admin, SuperAdmin) =====

export const createCourse = async (data: CreateCourseRequest): Promise<void> => {
  await apiClient.post("/courses", data);
};

// Links an existing course (e.g. shared with another major) instead of creating a duplicate.
export const assignCourseToMajor = async (
  courseId: number,
  data: { majorId: number; requirementType: number; requirementNature: number }
): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/assign-to-major`, data);
};

export const createCourseInfo = async (courseId: number, data: CourseInfoRequest): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/info`, data);
};

export const updateCourseInfo = async (courseId: number, data: CourseInfoRequest): Promise<void> => {
  await apiClient.put(`/courses/${courseId}/info`, data);
};

export const addCourseResource = async (courseId: number, data: CourseResourceRequest): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/resources`, data);
};

export const updateCourseResource = async (
  courseId: number,
  resourceId: number,
  data: CourseResourceRequest
): Promise<void> => {
  await apiClient.put(`/courses/${courseId}/resources/${resourceId}`, data);
};

export const deleteCourseResource = async (courseId: number, resourceId: number): Promise<void> => {
  await apiClient.delete(`/courses/${courseId}/resources/${resourceId}`);
};

// ===== Students =====

export const enrollInCourse = async (courseId: number): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/enroll`, { notes: null });
};
