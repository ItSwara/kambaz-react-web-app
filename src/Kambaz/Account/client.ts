import axios from "axios";
const axiosWithCredentials = axios.create({ withCredentials: true ,
  headers: {
    'Content-Type': 'application/json'
  }
 });
export const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
export const USERS_API = `${REMOTE_SERVER}/api/users`;

export const signin = async (credentials: any) => {
  const response = await axiosWithCredentials.post( `${USERS_API}/signin`, credentials );
  return response.data;
};

export const signup = async (user: any) => {
    const response = await axiosWithCredentials.post(`${USERS_API}/signup`, user);
    return response.data;
  };

export const updateUser = async (user: any) => {
    const response = await axiosWithCredentials.put(`${USERS_API}/${user._id}`, user);
    return response.data;
  };
  

  export const profile = async () => {
    const response = await axiosWithCredentials.post(`${USERS_API}/profile`);
    return response.data;
  };

  export const signout = async () => {
    const response = await axiosWithCredentials.post(`${USERS_API}/signout`);
    return response.data;
  };

  export const findMyCourses = async () => {
    const { data } = await axiosWithCredentials.get(`${USERS_API}/current/courses`);
    return data;
  };

  export const createCourse = async (course: any) => {
    const { data } = await axiosWithCredentials.post(`${USERS_API}/current/courses`, course);
    return data;
  };

  export const findAllUsers = async () => {
    console.log("Sending request to:", USERS_API);
    try {
      const response = await axiosWithCredentials.get(USERS_API);
      console.log("Response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };
  
  export const findUsersByRole = async (role: string) => {
    const response = await
      axios.get(`${USERS_API}?role=${role}`);
    return response.data;
  };

  export const findUsersByPartialName = async (name: string) => {
    const response = await axios.get(`${USERS_API}?name=${name}`);
    return response.data;
  };

  export const findUserById = async (id: string) => {
    const response = await axios.get(`${USERS_API}/${id}`);
    return response.data;
  };

  export const deleteUser = async (userId: string) => {
    const response = await axios.delete( `${USERS_API}/${userId}` );
    return response.data;
  };

  export const createUser = async (user: any) => {
    const response = await axios.post(`${USERS_API}`, user);
    return response.data;
  };


  export const findCoursesForUser = async (userId: string) => {
    const response = await axiosWithCredentials.get(`${USERS_API}/${userId}/courses`);
    return response.data;
  };
  


// New functions for enrollment
export const enrollIntoCourse = async (_userId: string, courseId: string) => {
  try {
    // Try the format that matches your existing dashboard.client.ts
    const response = await axiosWithCredentials.post(`${REMOTE_SERVER}/api/courses/${courseId}/enroll`);
    console.log("Enrollment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in enrollIntoCourse:", error);
    throw error;
  }
};

export const unenrollFromCourse = async (_userId: string, courseId: string) => {
  try {
    // Try the format that matches your existing dashboard.client.ts
    const response = await axiosWithCredentials.delete(`${REMOTE_SERVER}/api/courses/${courseId}/enroll`);
    console.log("Unenrollment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in unenrollFromCourse:", error);
    throw error;
  }
};
  
  
  
  
  
  
  
  
  
  
