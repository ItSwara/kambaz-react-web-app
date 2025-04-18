import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true });
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const MODULES_API = `${REMOTE_SERVER}/api/modules`;
//const COURSES_API = `${REMOTE_SERVER}/api/courses`;
export const deleteModule = async (moduleId: string) => {
 const response = await axiosWithCredentials.delete(`${MODULES_API}/${moduleId}`);
 return response.data; };

//  export const updateModule = async (module: any) => {
//     const { data } = await axiosWithCredentials.put(`${MODULES_API}/${module._id}`, module);
//     console.log("API response:", data);
//     return data;
//   };

// In your client.js file
export const updateModule = async (module: { _id: any; }) => {
  try {
    console.log("Sending update for module:", module);
    const { data } = await axiosWithCredentials.put(`${MODULES_API}/${module._id}`, module);
    console.log("API response:", data);
    
    // If the server returned null, return the original module as a fallback
    if (!data) {
      console.warn("Server returned null, using original module as fallback");
      return module;
    }
    
    return data;
  } catch (error) {
    console.error("API error:", error);
    // Return the original module as a fallback
    return module;
  }
};


// // In client.ts
// export const findModulesForCourse = async (courseId: string) => {
//   const response = await axiosWithCredentials.get(`${COURSES_API}/${courseId}/modules`);
//   return response.data;
//  };
 
  