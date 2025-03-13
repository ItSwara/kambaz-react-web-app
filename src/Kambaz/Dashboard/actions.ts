export const ENROLL_COURSE = "ENROLL_COURSE";
export const UNENROLL_COURSE = "UNENROLL_COURSE";

export const enrollCourse = (userId: string, courseId: string) => ({
  type: ENROLL_COURSE,
  payload: { userId, courseId },
});

export const unenrollCourse = (userId: string, courseId: string) => ({
  type: UNENROLL_COURSE,
  payload: { userId, courseId },
});