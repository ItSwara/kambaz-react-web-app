import axios from "axios";
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const COURSES_API = `${REMOTE_SERVER}/api/courses`;
const axiosWithCredentials = axios.create({ withCredentials: true });

export const fetchAllCourses = async () => {
  const { data } = await axiosWithCredentials.get(COURSES_API);
  return data;
};

export const deleteCourse = async (id: string) => {
    const { data } = await axiosWithCredentials.delete(`${COURSES_API}/${id}`);
    return data;
  };

  
  export const updateCourse = async (course: any) => {
    const { data } = await axiosWithCredentials.put(`${COURSES_API}/${course._id}`, course);
    return data;
  };

  export const findModulesForCourse = async (courseId: string) => {
    const response = await axiosWithCredentials.get(`${COURSES_API}/${courseId}/modules`);
    console.log("Server response data:", response.data);
    return response.data;
  };

  export const createModuleForCourse = async (courseId: string, module: any) => {
    const response = await axiosWithCredentials.post(
      `${COURSES_API}/${courseId}/modules`,
      module
    );
    return response.data;
  };

  export const createCourse = async (course: any) => {
    try {
        console.log("Making API request to create course:", course);
        console.log("API endpoint:", COURSES_API);
        
        // Add additional validation if needed
        if (!course.name || !course.number) {
            throw new Error("Course name and number are required");
        }
        
        // Remove any fields that might cause issues
        const courseToSend = { ...course };
        if (courseToSend._id === "0" || courseToSend._id === "1234") {
            delete courseToSend._id; // Remove placeholder ID before sending to server
        }
        
        const { data } = await axiosWithCredentials.post(COURSES_API, courseToSend);
        console.log("API response data:", data);
        return data;
    } catch (error) {
        console.error("API error in createCourse:", error);
        throw error; // Re-throw to allow handling in component
    }
};

// User operations for a course
export const findUsersForCourse = async (courseId: string) => {
  const response = await axios.get(`${COURSES_API}/${courseId}/users`);
  return response.data;
};
   
  
  
  