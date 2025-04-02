import axios from "axios";

// Define the interfaces
export interface Course {
  _id: string;
  name: string;
  description: string;
  image?: string;
}

export interface Enrollment {
  _id: string;
  user: string;
  course: string;
}

// API endpoints for courses
export const fetchCourses = async (): Promise<Course[]> => {
  const response = await axios.get("/api/courses");
  return response.data;
};

// API endpoints for enrollments
export const fetchUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
  const response = await axios.get(`/api/users/${userId}/enrollments`);
  return response.data;
};

export const enrollInCourse = async (courseId: string): Promise<Enrollment> => {
  const response = await axios.post(`/api/courses/${courseId}/enroll`);
  return response.data;
};

export const unenrollFromCourse = async (courseId: string): Promise<void> => {
  await axios.delete(`/api/courses/${courseId}/enroll`);
};







// import axios from "axios";

// // Create axios instance with credentials
// const axiosWithCredentials = axios.create({ withCredentials: true });

// // Server URL - update with your server URL if using environment variables
// const REMOTE_SERVER = import.meta.env.REACT_APP_REMOTE_SERVER || "";

// // API endpoints
// export const enrollCourse = async (userId: string, courseId: string) => {
//     console.log("Enrolling user in course:", userId, courseId);
//     const response = await axiosWithCredentials.post(
//         `${REMOTE_SERVER}/api/courses/${courseId}/enroll`
//     );
//     console.log("Enrollment response:", response.data);
//     return response.data;
// };

// export const unenrollCourse = async (userId: string, courseId: string) => {
//     console.log("Unenrolling user from course:", userId, courseId);
//     const response = await axiosWithCredentials.delete(
//         `${REMOTE_SERVER}/api/courses/${courseId}/enroll`
//     );
//     console.log("Unenrollment response:", response.data);
//     return response.data;
// };

// export const getUserEnrollments = async (userId: string) => {
//     console.log("Fetching enrollments for user:", userId);
//     const response = await axiosWithCredentials.get(
//         `${REMOTE_SERVER}/api/users/${userId}/enrollments`
//     );
//     console.log("Enrollments received:", response.data);
//     return response.data;
// };

// export const getAllCourses = async () => {
//     const response = await axiosWithCredentials.get(`${REMOTE_SERVER}/api/courses`);
//     return response.data;
// };