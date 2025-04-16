import { Routes, Route, Navigate } from "react-router";
import Account from "./Account";
import Dashboard from "./Dashboard/Dashboard";
import Courses from "./Courses";
import "./style.css";
import KambazNavigation from "./Navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "./Account/ProtectedRoute";
import Session from "./Account/Session";
import * as courseClient from "./Courses/client";
import * as userClient from "./Account/client";
import { useSelector } from "react-redux";

export default function Kambaz() {
  // Get the logged-in user from Redux
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  // courses state holds the courses to be shown on Dashboard
  const [courses, setCourses] = useState<any[]>([]);
  // enrolling toggles between showing all courses and only enrolled courses
  const [enrolling, setEnrolling] = useState<boolean>(false);

  // If enrolling is false, show only the courses the user is enrolled in.
  const findCoursesForUser = async () => {
    try {
      const enrolledCourses = await userClient.findCoursesForUser(currentUser._id);
      setCourses(enrolledCourses);
    } catch (error) {
      console.error("findCoursesForUser error:", error);
    }
  };

  // If enrolling is true, fetch all courses and tag those the user is enrolled in
  const fetchCourses = async () => {
    try {
      const allCourses = await courseClient.fetchAllCourses();
      const enrolledCourses = await userClient.findCoursesForUser(currentUser._id);
      const coursesWithEnrollment = allCourses.map((course: any) => {
        if (enrolledCourses.find((c: any) => c._id === course._id)) {
          return { ...course, enrolled: true };
        } else {
          return course;
        }
      });
      setCourses(coursesWithEnrollment);
    } catch (error) {
      console.error("fetchCourses error:", error);
    }
  };

  // Update enrollment status for a course
  const updateEnrollment = async (courseId: string, enrolled: boolean) => {
    try {
      if (enrolled) {
        // We only need the courseId for enrollment, userId will be determined by session
        await userClient.enrollIntoCourse(currentUser._id, courseId);
      } else {
        // We only need the courseId for unenrollment, userId will be determined by session
        await userClient.unenrollFromCourse(currentUser._id, courseId);
      }
      
      // Update the local state
      setCourses(
        courses.map((course) => {
          if (course._id === courseId) {
            return { ...course, enrolled: enrolled };
          } else {
            return course;
          }
        })
      );
      
      // Refresh courses based on current mode
      if (enrolled && !enrolling) {
        // If enrolling a new course while in "My Courses" view, we'll need to refetch
        await findCoursesForUser();
      } else if (!enrolled && !enrolling) {
        // If unenrolling a course while in "My Courses" view, we'll need to refetch
        await findCoursesForUser();
      }
    } catch (error) {
      console.error("updateEnrollment error:", error);
    }
  };

  // When currentUser or enrolling state changes, load the appropriate courses
  useEffect(() => {
    if (currentUser) {
      if (enrolling) {
        fetchCourses();
      } else {
        findCoursesForUser();
      }
    }
  }, [currentUser, enrolling]);

  // State for course editing
  const [newCourse, setNewCourse] = useState<any>({
    _id: "1234",
    name: "New Course",
    number: "New Number",
    startDate: "2023-09-10",
    endDate: "2023-12-15",
    credits: 3,
    image: "/images/reactjs.jpg",
    description: "New Description",
  });
  const [editMode, setEditMode] = useState<boolean>(false);

  const deleteCourse = async (courseId: string) => {
    try {
      await courseClient.deleteCourse(courseId);
      setCourses((prevCourses) =>
        prevCourses.filter((course: { _id: string }) => course._id !== courseId)
      );
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const updateCourse = async () => {
    try {
      await courseClient.updateCourse(newCourse);
      setCourses((prevCourses) =>
        prevCourses.map((c: { _id: string }) =>
          c._id === newCourse._id ? newCourse : c
        )
      );
      setNewCourse({
        _id: "1234",
        name: "",
        number: "",
        startDate: "",
        endDate: "",
        image: "/images/reactjs.jpg",
        description: "",
      });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const addNewCourse = async () => {
    try {
      console.log("Submitting new course data:", newCourse);
      if (!newCourse.name || !newCourse.number) {
        console.error("Missing required course fields");
        return;
      }
      const newCourseCreated = await courseClient.createCourse(newCourse);
      if (newCourseCreated && newCourseCreated._id) {
        setCourses((prevCourses) => [...prevCourses, newCourseCreated]);
        setNewCourse({
          _id: "0",
          name: "",
          number: "",
          startDate: "",
          endDate: "",
          image: "/images/reactjs.jpg",
          description: "",
          credits: 3,
        });
        console.log("Course successfully added to state");
      } else {
        console.error("Invalid course data returned:", newCourseCreated);
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message || "Unknown error");
      }
    }
  };

  return (
    <Session>
      <div id="wd-kambaz">
        <KambazNavigation />
        <div className="wd-main-content-offset p-3">
          <Routes>
            <Route path="/" element={<Navigate to="/Kambaz/Account" />} />
            <Route path="/Account/*" element={<Account />} />
            <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    courses={courses}
                    newCourse={newCourse}
                    editMode={editMode}
                    setCourses={setCourses}
                    setNewCourse={setNewCourse}
                    setEditMode={setEditMode}
                    addNewCourse={addNewCourse}
                    deleteCourse={deleteCourse}
                    updateCourse={updateCourse}
                    enrolling={enrolling}
                    setEnrolling={setEnrolling}
                    updateEnrollment={updateEnrollment}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Courses/:cid/*"
              element={
                <ProtectedRoute>
                  <Courses courses={courses} />
                </ProtectedRoute>
              }
            />
            <Route path="/Calendar" element={<h1>Calendar</h1>} />
            <Route path="/Inbox" element={<h1>Inbox</h1>} />
          </Routes>
        </div>
      </div>
    </Session>
  );
}






// import { Routes, Route, Navigate } from "react-router";
// import Account from "./Account";
// import Dashboard from "./Dashboard/Dashboard";
// import Courses from "./Courses";
// import "./style.css";
// import KambazNavigation from "./Navigation";
// import { useEffect, useState } from "react";
// import ProtectedRoute from "./Account/ProtectedRoute";
// import Session from "./Account/Session";
// import * as courseClient from "./Courses/client";
// import * as userClient from "./Account/client";
// import { useSelector } from "react-redux";

// export default function Kambaz() {
//   // Get the logged-in user from Redux
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   // courses state holds the courses to be shown on Dashboard
//   const [courses, setCourses] = useState<any[]>([]);
//   // enrolling toggles between showing all courses and only enrolled courses
//   const [enrolling, setEnrolling] = useState<boolean>(false);

//   // If enrolling is false, show only the courses the user is enrolled in.
//   const findCoursesForUser = async () => {
//     try {
//       const enrolledCourses = await userClient.findCoursesForUser(currentUser._id);
//       setCourses(enrolledCourses);
//     } catch (error) {
//       console.error("findCoursesForUser error:", error);
//     }
//   };

//   // If enrolling is true, fetch all courses and tag those the user is enrolled in
//   const fetchCourses = async () => {
//     try {
//       const allCourses = await courseClient.fetchAllCourses();
//       const enrolledCourses = await userClient.findCoursesForUser(currentUser._id);
//       const coursesWithEnrollment = allCourses.map((course: any) => {
//         if (enrolledCourses.find((c: any) => c._id === course._id)) {
//           return { ...course, enrolled: true };
//         } else {
//           return course;
//         }
//       });
//       setCourses(coursesWithEnrollment);
//     } catch (error) {
//       console.error("fetchCourses error:", error);
//     }
//   };

//   // Update enrollment status for a course
//   const updateEnrollment = async (courseId: string, enrolled: boolean) => {
//     try {
//       if (enrolled) {
//         await userClient.enrollIntoCourse(currentUser._id, courseId);
//       } else {
//         await userClient.unenrollFromCourse(currentUser._id, courseId);
//       }
//       setCourses(
//         courses.map((course) => {
//           if (course._id === courseId) {
//             return { ...course, enrolled: enrolled };
//           } else {
//             return course;
//           }
//         })
//       );
//     } catch (error) {
//       console.error("updateEnrollment error:", error);
//     }
//   };

//   // When currentUser or enrolling state changes, load the appropriate courses
//   useEffect(() => {
//     if (currentUser) {
//       if (enrolling) {
//         fetchCourses();
//       } else {
//         findCoursesForUser();
//       }
//     }
//   }, [currentUser, enrolling]);

//   // State for course editing
//   const [newCourse, setNewCourse] = useState<any>({
//     _id: "1234",
//     name: "New Course",
//     number: "New Number",
//     startDate: "2023-09-10",
//     endDate: "2023-12-15",
//     credits: 3,
//     image: "/images/reactjs.jpg",
//     description: "New Description",
//   });
//   const [editMode, setEditMode] = useState<boolean>(false);

//   const deleteCourse = async (courseId: string) => {
//     try {
//       await courseClient.deleteCourse(courseId);
//       setCourses((prevCourses) =>
//         prevCourses.filter((course: { _id: string }) => course._id !== courseId)
//       );
//     } catch (error) {
//       console.error("Error deleting course:", error);
//     }
//   };

//   const updateCourse = async () => {
//     try {
//       await courseClient.updateCourse(newCourse);
//       setCourses((prevCourses) =>
//         prevCourses.map((c: { _id: string }) =>
//           c._id === newCourse._id ? newCourse : c
//         )
//       );
//       setNewCourse({
//         _id: "1234",
//         name: "",
//         number: "",
//         startDate: "",
//         endDate: "",
//         image: "/images/reactjs.jpg",
//         description: "",
//       });
//       setEditMode(false);
//     } catch (error) {
//       console.error("Error updating course:", error);
//     }
//   };

//   const addNewCourse = async () => {
//     try {
//       console.log("Submitting new course data:", newCourse);
//       if (!newCourse.name || !newCourse.number) {
//         console.error("Missing required course fields");
//         return;
//       }
//       const newCourseCreated = await courseClient.createCourse(newCourse);
//       if (newCourseCreated && newCourseCreated._id) {
//         setCourses((prevCourses) => [...prevCourses, newCourseCreated]);
//         setNewCourse({
//           _id: "0",
//           name: "",
//           number: "",
//           startDate: "",
//           endDate: "",
//           image: "/images/reactjs.jpg",
//           description: "",
//           credits: 3,
//         });
//         console.log("Course successfully added to state");
//       } else {
//         console.error("Invalid course data returned:", newCourseCreated);
//       }
//     } catch (error: any) {
//       console.error("Error creating course:", error);
//       if (error.response) {
//         console.error("Error response data:", error.response.data);
//         console.error("Error response status:", error.response.status);
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//       } else {
//         console.error("Error message:", error.message || "Unknown error");
//       }
//     }
//   };

//   return (
//     <Session>
//       <div id="wd-kambaz">
//         <KambazNavigation />
//         <div className="wd-main-content-offset p-3">
//           <Routes>
//             <Route path="/" element={<Navigate to="/Kambaz/Account" />} />
//             <Route path="/Account/*" element={<Account />} />
//             <Route
//               path="/Dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard
//                     courses={courses}
//                     newCourse={newCourse}
//                     editMode={editMode}
//                     setCourses={setCourses}
//                     setNewCourse={setNewCourse}
//                     setEditMode={setEditMode}
//                     addNewCourse={addNewCourse}
//                     deleteCourse={deleteCourse}
//                     updateCourse={updateCourse}
//                     enrolling={enrolling}
//                     setEnrolling={setEnrolling}
//                     updateEnrollment={updateEnrollment}
//                   />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/Courses/:cid/*"
//               element={
//                 <ProtectedRoute>
//                   <Courses courses={courses} />
//                 </ProtectedRoute>
//               }
//             />
//             <Route path="/Calendar" element={<h1>Calendar</h1>} />
//             <Route path="/Inbox" element={<h1>Inbox</h1>} />
//           </Routes>
//         </div>
//       </div>
//     </Session>
//   );
// }



// import { Routes, Route, Navigate } from "react-router";
// import Account from "./Account";
// import Dashboard from "./Dashboard/Dashboard";
// import Courses from "./Courses";
// import "./style.css";
// import KambazNavigation from "./Navigation";
// import { useEffect, useState } from "react";
// import ProtectedRoute from "./Account/ProtectedRoute";
// import Session from "./Account/Session";
// import * as courseClient from "./Courses/client";
// import * as userClient from "./Account/client";
// import { useSelector } from "react-redux";

// export default function Kambaz() {
//   // Get the logged-in user from Redux
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   // courses state holds the courses to be shown on Dashboard
//   const [courses, setCourses] = useState<any[]>([]);
//   // enrolling toggles between showing all courses and only enrolled courses
//   const [enrolling] = useState<boolean>(false);

//   // If enrolling is false, show only the courses the user is enrolled in.
//   const findCoursesForUser = async () => {
//     try {
//       const enrolledCourses = await userClient.findCoursesForUser(currentUser._id);
//       setCourses(enrolledCourses);
//     } catch (error) {
//       console.error("findCoursesForUser error:", error);
//     }
//   };

//   // If enrolling is true, fetch all courses and then tag those the user is enrolled in.
//   const fetchCourses = async () => {
//     try {
//       const allCourses = await courseClient.fetchAllCourses();
//       const enrolledCourses = await userClient.findCoursesForUser(currentUser._id);
//       const coursesWithEnrollment = allCourses.map((course: any) => {
//         const isEnrolled = enrolledCourses.find((c: any) => c._id === course._id);
//         return isEnrolled ? { ...course, enrolled: true } : course;
//       });
//       setCourses(coursesWithEnrollment);
//     } catch (error) {
//       console.error("fetchCourses error:", error);
//     }
//   };

//   // When currentUser or enrolling state changes, load the appropriate courses.
//   useEffect(() => {
//     if (currentUser) {
//       if (enrolling) {
//         fetchCourses();
//       } else {
//         findCoursesForUser();
//       }
//     }
//   }, [currentUser, enrolling]);

//   // For handling course creation/updating in Dashboard, retain your existing newCourse, editMode etc.
//   const [newCourse, setNewCourse] = useState<any>({
//     _id: "1234",
//     name: "New Course",
//     number: "New Number",
//     startDate: "2023-09-10",
//     endDate: "2023-12-15",
//     credits: 3,
//     image: "/images/reactjs.jpg",
//     description: "New Description",
//   });
//   const [editMode, setEditMode] = useState<boolean>(false);

//   const deleteCourse = async (courseId: string) => {
//     try {
//       await courseClient.deleteCourse(courseId);
//       setCourses((prevCourses) =>
//         prevCourses.filter((course: { _id: string }) => course._id !== courseId)
//       );
//     } catch (error) {
//       console.error("Error deleting course:", error);
//     }
//   };

//   const updateCourse = async () => {
//     try {
//       await courseClient.updateCourse(newCourse);
//       setCourses((prevCourses) =>
//         prevCourses.map((c: { _id: string }) =>
//           c._id === newCourse._id ? newCourse : c
//         )
//       );
//       setNewCourse({
//         _id: "1234",
//         name: "",
//         number: "",
//         startDate: "",
//         endDate: "",
//         image: "/images/reactjs.jpg",
//         description: "",
//       });
//       setEditMode(false);
//     } catch (error) {
//       console.error("Error updating course:", error);
//     }
//   };

//   const addNewCourse = async () => {
//     try {
//       console.log("Submitting new course data:", newCourse);
//       if (!newCourse.name || !newCourse.number) {
//         console.error("Missing required course fields");
//         return;
//       }
//       const newCourseCreated = await courseClient.createCourse(newCourse);
//       if (newCourseCreated && newCourseCreated._id) {
//         setCourses((prevCourses) => [...prevCourses, newCourseCreated]);
//         setNewCourse({
//           _id: "0",
//           name: "",
//           number: "",
//           startDate: "",
//           endDate: "",
//           image: "/images/reactjs.jpg",
//           description: "",
//           credits: 3,
//         });
//         console.log("Course successfully added to state");
//       } else {
//         console.error("Invalid course data returned:", newCourseCreated);
//       }
//     } catch (error: any) {
//       console.error("Error creating course:", error);
//       if (error.response) {
//         console.error("Error response data:", error.response.data);
//         console.error("Error response status:", error.response.status);
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//       } else {
//         console.error("Error message:", error.message || "Unknown error");
//       }
//     }
//   };

//   return (
//     <Session>
//       <div id="wd-kambaz">
//         <KambazNavigation />
//         <div className="wd-main-content-offset p-3">
//           <Routes>
//             <Route path="/" element={<Navigate to="/Kambaz/Account" />} />
//             <Route path="/Account/*" element={<Account />} />
//             <Route
//               path="/Dashboard"
//               element={
//                 <ProtectedRoute>
//                   <Dashboard
//                     courses={courses}
//                     newCourse={newCourse}
//                     editMode={editMode}
//                     setCourses={setCourses}
//                     setNewCourse={setNewCourse}
//                     setEditMode={setEditMode}
//                     addNewCourse={addNewCourse}
//                     deleteCourse={deleteCourse}
//                     updateCourse={updateCourse}
//                     //enrolling={enrolling}
//                     //setEnrolling={setEnrolling}
//                   />
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/Courses/:cid/*"
//               element={
//                 <ProtectedRoute>
//                   <Courses courses={courses} />
//                 </ProtectedRoute>
//               }
//             />
//             <Route path="/Calendar" element={<h1>Calendar</h1>} />
//             <Route path="/Inbox" element={<h1>Inbox</h1>} />
//           </Routes>
//         </div>
//       </div>
//     </Session>
//   );
// }










// import { Routes, Route, Navigate } from "react-router";
// import Account from "./Account";
// import Dashboard from "./Dashboard/Dashboard";
// import Courses from "./Courses";
// import "./style.css";
// import KambazNavigation from "./Navigation";
// import { useEffect, useState } from "react";
// import ProtectedRoute from "./Account/ProtectedRoute";
// import Session from "./Account/Session";
// import * as courseClient from "./Courses/client";
// import * as userClient from "./Account/client";
// import { useSelector } from "react-redux";



// export default function Kambaz() {
//   const [courses, setCourses] = useState<any[]>([]);
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
  
//   const fetchCourses = async () => {
//     try {
//       const courses = await courseClient.fetchAllCourses();
//       setCourses(courses);
//     } catch (error) {
//       console.error(error);
//     }
//   };
  
  
//   useEffect(() => {
//     fetchCourses();
//   }, [currentUser]);

//   const [newCourse, setNewCourse] = useState<any>({
//     _id: "1234",
//     name: "New Course",
//     number: "New Number",
//     startDate: "2023-09-10",
//     endDate: "2023-12-15",
//     credits: 3,
//     image: "/images/reactjs.jpg",
//     description: "New Description",
//   });
//   const [editMode, setEditMode] = useState<boolean>(false);

//   // Event handler functions moved from Dashboard
//   const deleteCourse = async(courseId: string) => {
//     try {
//       // Uncomment this when you have the API ready
//       const status = await courseClient.deleteCourse(courseId);
//       setCourses(
//         courses.filter((course: { _id: string }) => course._id !== courseId)
//       );
//     } catch (error) {
//       console.error("Error deleting course:", error);
//     }
//   };

//   const updateCourse = async() => {
//     try {
//       await courseClient.updateCourse(newCourse);
//       setCourses(
//         courses.map((c: { _id: any }) =>
//           c._id === newCourse._id ? newCourse : c
//         )
//       );
//       // Reset form and exit edit mode
//       setNewCourse({
//         _id: "1234",
//         name: "",
//         number: "",
//         startDate: "",
//         endDate: "",
//         image: "/images/reactjs.jpg",
//         description: "",
//       });
//       setEditMode(false);
//     } catch (error) {
//       console.error("Error updating course:", error);
//     }
//   };

//   // const addNewCourse = async () => {
//   //   try {
//   //     const newCourseCreated = await courseClient.createCourse(newCourse);
//   //     setCourses((prevCourses) => [...prevCourses, newCourseCreated]);
//   //     setNewCourse({
//   //       _id: "0",
//   //       name: "",
//   //       number: "",
//   //       startDate: "",
//   //       endDate: "",
//   //       image: "/images/reactjs.jpg",
//   //       description: "",
//   //     });
//   //   } catch (error) {
//   //     console.error("Error creating course:", error);
//   //   }
//   // };

//   const addNewCourse = async () => {
//     try {
//       console.log("Submitting new course data:", newCourse);
      
//       // Check if required fields are filled
//       if (!newCourse.name || !newCourse.number) {
//         console.error("Missing required course fields");
//         return;
//       }
      
//       const newCourseCreated = await courseClient.createCourse(newCourse);
//       console.log("Response from API:", newCourseCreated);
      
//       if (newCourseCreated && newCourseCreated._id) {
//         setCourses((prevCourses) => [...prevCourses, newCourseCreated]);
//         setNewCourse({
//           _id: "0",
//           name: "",
//           number: "",
//           startDate: "",
//           endDate: "",
//           image: "/images/reactjs.jpg",
//           description: "",
//           credits: 3,
//         });
//         console.log("Course successfully added to state");
//       } else {
//         console.error("API returned success but with invalid course data:", newCourseCreated);
//       }
//     } catch (error: any) { // Type error as 'any' to allow property access
//       console.error("Error creating course:", error);
//       // Log more detailed error information
//       if (error.response) {
//         console.error("Error response data:", error.response.data);
//         console.error("Error response status:", error.response.status);
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//       } else {
//         console.error("Error message:", error.message || "Unknown error");
//       }
//     }
//   };
  
//   return (
//     <Session>
//     <div id="wd-kambaz">
//       <KambazNavigation />

//       <div className="wd-main-content-offset p-3">
//         <Routes>
//           <Route path="/" element={<Navigate to="/Kambaz/Account" />} />
//           <Route path="/Account/*" element={<Account />} />

//           <Route
//             path="/Dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard
//                   courses={courses}
//                   newCourse={newCourse}
//                   editMode={editMode}
//                   setCourses={setCourses} // Fix: Pass the actual setCourses function
//                   setNewCourse={setNewCourse}
//                   setEditMode={setEditMode}
//                   addNewCourse={addNewCourse}
//                   deleteCourse={deleteCourse}
//                   updateCourse={updateCourse}
//                 />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/Courses/:cid/*"
//             element={
//               <ProtectedRoute>
//                 <Courses courses={courses} />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/Calendar" element={<h1>Calendar</h1>} />
//           <Route path="/Inbox" element={<h1>Inbox</h1>} />
//         </Routes>
//       </div>
//     </div>
//     </Session>
//   );
// }


