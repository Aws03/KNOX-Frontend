// Course display type (used in UI)
export interface Course {
  id: number;
  code: string;
  name: string;
  major: string;
  badges: string[];
  materials: number;
  quizzes: number;
  hasCourseInfo: boolean;
}

// A course in a major's list: GET /courses/by-major/{majorId} (backend CourseSummaryDto)
export interface CourseApiResponse {
  id: number;
  courseName: string;
  description?: string;
  courseCode?: string;
  credits?: number;
  requirementType: string;
  requirementNature: string;
  numberOfMaterials: number;
  numberOfQuizzes: number;
  hasCourseInfo: boolean;
}

// One course: GET /courses/{id} and /courses/by-code/{code} (backend CourseDto)
export interface CourseDetails {
  id: number;
  courseName: string;
  description?: string;
  courseCode?: string;
  credits?: number;
  numberOfMaterials: number;
  numberOfQuizzes: number;
  courseRequirementMappings: {
    id: number;
    courseId: number;
    majorId: number;
    requirementType: string;
    requirementNature: string;
  }[];
}

// Resource type enum values
export type ResourceType =
  | "ECampusCourse"
  | "YouTubeVideo"
  | "YouTubePlaylist"
  | "Article"
  | "BlogPost"
  | "UdemyCourse"
  | "CourseraCourse"
  | "EdXCourse"
  | "LinkedInLearning"
  | "PluralSight"
  | "OtherPlatformCourse"
  | "Other";

// Difficulty level enum
export type DifficultyLevel = "Easy" | "Moderate" | "Hard";

// Course resource type
export interface CourseResource {
  id: number;
  courseInfoId: number;
  title: string;
  type: ResourceType;
  url: string;
  description: string;
  demonstrationVideoUrl: string;
  hasDemonstrationVideo: boolean;
}

// Course info API response
export interface CourseInfo {
  id: number;
  courseId: number;
  difficultyLevel: DifficultyLevel;
  description: string;
  demonstrationVideoUrl: string;
  demonstrationVideoTitle: string;
  resources: CourseResource[];
  resourceCount: number;
}

// Filter types
export interface CourseFilterValues {
  universityId?: number;
  collegeId?: number;
  majorId?: number;
  majorName?: string;
  courseType?: string;
  requirement?: string;
}

// Academic hierarchy types
export interface University {
  id: number;
  name: string;
}

export interface Faculty {
  id: number;
  name: string;
  universityId: number;
}

export interface Major {
  id: number;
  name: string;
  facultyId: number;
}

// Paginated state for filters
export interface PaginatedState<T> {
  items: T[];
  pageNumber: number;
  hasNextPage: boolean;
  loading: boolean;
  parentId: number | null;
}

// Requirement vocabulary: mirrors the backend's RequirementType / RequirementNature enums
// (label -> numeric value sent to the API; the API returns the label).
export const REQUIREMENT_TYPE_MAP: Record<string, string> = {
  University: "1",
  Faculty: "2",
  Major: "3",
  Remedial: "4",
};

export const REQUIREMENT_NATURE_MAP: Record<string, string> = {
  Compulsory: "1",
  Elective: "2",
};

// Available filter options
export const COURSE_TYPES = Object.keys(REQUIREMENT_TYPE_MAP);
export const REQUIREMENT_TYPES = Object.keys(REQUIREMENT_NATURE_MAP);

// Utility function to create initial paginated state
export const createInitialPaginatedState = <T>(): PaginatedState<T> => ({
  items: [],
  pageNumber: 0,
  hasNextPage: true,
  loading: false,
  parentId: null,
});

// Body of POST/PUT /courses/{courseId}/info
export interface CourseInfoRequest {
  difficultyLevel: DifficultyLevel;
  description: string;
  demonstrationVideoUrl: string;
  demonstrationVideoTitle: string;
}

// Body of POST /courses/{courseId}/resources and PUT /courses/{courseId}/resources/{id}
export interface CourseResourceRequest {
  title: string;
  type: ResourceType;
  url: string;
  description: string;
  hasDemonstrationVideo: boolean;
  demonstrationVideoUrl: string;
}

// Body of POST /courses (creates the course in a major)
export interface CreateCourseRequest {
  majorId: number;
  courseName: string;
  courseCode: string;
  description: string;
  credits: number;
  requirementType: number;
  requirementNature: number;
}
