import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import * as userClient from "../Account/client.ts";
import { useEffect, useState } from "react";

export default function ProtectedCourseRoute({ children, cid }: { children: any, cid: any }) {
  const [courses, setCourses] = useState<any[]>([]);
  const { currentUser } = useSelector((state: any) => state.accountReducer);

  const findCoursesForUser = async () => { 
     try { 
       const courses = await userClient.findCoursesForUser(currentUser._id);
       setCourses(courses); 
      } catch (error) { 
        console.error(error); 
      } 
    }; 

  useEffect(() => {
    findCoursesForUser();
  }
  , [currentUser]);

  if (courses.find((c: any) => c.course === cid)!= -1) {
    return children;
  } else {
    return <Navigate to="/Kambaz/Dashboard" />;
  }

}