import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";

// Define the type for a course
interface Course {
  _id: string;
  name: string;
  description: string;
  image?: string;
}

// Define the props interface for the Dashboard component
interface DashboardProps {
  courses: Course[];
  newCourse: Course;
  editMode: boolean;
  setCourses: (courses: Course[]) => void;
  setNewCourse: (course: Course) => void;
  setEditMode: (editMode: boolean) => void;
  addNewCourse: () => void;
  deleteCourse: (courseId: string) => void;
  updateCourse: () => void;
}

// Define your base API URL - adjust this to match your server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL  || "https://kambaz-node-server-app-lba7.onrender.com" ;

export default function Dashboard({
  courses,
  newCourse,
  editMode,
  setCourses,
  setNewCourse,
  setEditMode,
  addNewCourse,
  deleteCourse,
  updateCourse,
}: DashboardProps) {
  //const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  
  // Initialize with local state instead of relying on Redux immediately
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const userRole = currentUser.role;
  
  // State for toggle
  const [showAllCourses, setShowAllCourses] = useState(false);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Configure axios to include credentials
  const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for session cookies
  });

  // Fetch all enrollments on component mount
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await api.get(`/api/enrollments`);
        setEnrollments(response.data || []);
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        setEnrollments([]);
      }
    };

    fetchEnrollments();
  }, []);

  // Fetch all courses function
  const fetchAllCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/courses`);
      setCourses(response.data);
    } catch (err) {
      console.error("Error fetching all courses:", err);
      setError("Failed to fetch courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch enrolled courses for the current user
  const fetchEnrolledCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get all enrollments for the current user
      const enrollmentsResponse = await api.get(`/api/users/${currentUser._id}/enrollments`);
      const userEnrollments = enrollmentsResponse.data;
      
      // Get all courses
      const coursesResponse = await api.get(`/api/courses`);
      const allCourses = coursesResponse.data;
      
      // Filter courses based on user enrollments
      const enrolledCourseIds = userEnrollments.map((enrollment: any) => enrollment.course);
      const enrolledCourses = allCourses.filter((course: Course) => 
        enrolledCourseIds.includes(course._id)
      );
      
      setCourses(enrolledCourses);
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError("Failed to fetch enrolled courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle handler
  const handleToggleClick = async () => {
    if (!showAllCourses) {
      // Show all courses
      await fetchAllCourses();
    } else {
      // Show only enrolled courses
      await fetchEnrolledCourses();
    }
    setShowAllCourses(!showAllCourses);
  };

  // Enrollment toggle function
  const toggleEnrollment = async (courseId: string) => {
    const isEnrolled = enrollments.some(
      (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === courseId
    );

    try {
      setError(null);
      if (isEnrolled) {
        // Unenroll
        const response = await api.delete(`/api/courses/${courseId}/enroll`);
        console.log("Unenroll response:", response.data);
        
        // Update local state
        setEnrollments(
          enrollments.filter(
            (e) => !(e.user === currentUser._id && e.course === courseId)
          )
        );
        
        // Refresh courses if viewing enrolled courses
        if (!showAllCourses) {
          await fetchEnrolledCourses();
        }
      } else {
        // Enroll
        const response = await api.post(`/api/courses/${courseId}/enroll`);
        console.log("Enroll response:", response.data);
        setEnrollments([...enrollments, response.data]);
      }
    } catch (err: any) {
      console.error("Error toggling enrollment:", err);
      setError(err.response?.data?.message || "Failed to update enrollment. Please try again.");
    }
  };

  // Compute enrolled courses based on local state
  const userEnrolledCourses = courses.filter((course) =>
    enrollments.some(
      (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
    )
  );

  // Determine which courses to display
  const coursesToDisplay = showAllCourses ? courses : userEnrolledCourses;

  return (
    <div className="p-4" id="wd-dashboard">
      <div className="d-flex justify-content-between align-items-center">
        <h1 id="wd-dashboard-title">Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={handleToggleClick}
          disabled={isLoading}
          id="toggle-courses-button"
        >
          {isLoading 
            ? "Loading..." 
            : (showAllCourses ? "Enrolled Courses" : "All Courses")
          }
        </button>
      </div>
      <hr />
      {userRole === "FACULTY" && (
        <div className="d-flex align-items-start mb-3">
          <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
          <div className="flex-grow-1">
            <input
              type="text"
              className="form-control mb-2"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
            />
            <textarea
              className="form-control"
              rows={3}
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            />
          </div>
          {editMode ? (
            <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
          ) : (
            <button 
              className="btn btn-primary ms-3" 
              onClick={() => {
                addNewCourse();
                // Auto-enroll faculty in their newly created course
                if (newCourse._id) {
                  toggleEnrollment(newCourse._id);
                }
              }}
            >
              Add
            </button>
          )}
        </div>
      )}
      <hr />
      <h2 id="wd-dashboard-published">
        {showAllCourses 
          ? `All Courses (${coursesToDisplay.length})` 
          : `Enrolled Courses (${coursesToDisplay.length})`
        }
      </h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <hr />
      {isLoading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {coursesToDisplay.map((course) => {
            const isEnrolled = enrollments.some(
              (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
            );

            return (
              <div key={course._id} className="col">
                <div className="card" style={{ width: "100%" }}>
                  <Link
                    to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
                    className="text-decoration-none text-dark"
                    onClick={(e) => {
                      if (userRole !== "FACULTY" && !isEnrolled) {
                        e.preventDefault();
                        alert("You must be enrolled to access this course.");
                      }
                    }}
                  >
                    <img
                      src={course.image || `/images/${course._id}.png`}
                      alt="Course"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/reactjs.jpg"; // Fallback image
                      }}
                      style={{ width: "100%", height: "160px" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
                      <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <Button variant="primary" className="btn-lg">Go</Button>
                        {userRole === "FACULTY" ? (
                          <div>
                            <button
                              onClick={(event) => {
                                event.preventDefault();
                                deleteCourse(course._id);
                              }}
                              className="btn btn-danger btn-lg me-2"
                            >
                              Delete
                            </button>
                            <button
                              onClick={(event) => {
                                event.preventDefault();
                                setNewCourse(course);
                                setEditMode(true);
                              }}
                              className="btn btn-warning btn-lg"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button
                            className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleEnrollment(course._id);
                            }}
                          >
                            {isEnrolled ? "Unenroll" : "Enroll"}
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}










// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector, useDispatch } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const dispatch = useDispatch();
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
  
//   // Initialize with local state instead of relying on Redux immediately
//   const [enrollments, setEnrollments] = useState<any[]>([]);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Fetch all enrollments on component mount
//   useEffect(() => {
//     const fetchEnrollments = async () => {
//       try {
//         const response = await axios.get(`${API_BASE_URL}/api/enrollments`);
//         setEnrollments(response.data || []);
//       } catch (err) {
//         console.error("Error fetching enrollments:", err);
//         setEnrollments([]);
//       }
//     };

//     fetchEnrollments();
//   }, []);

//   // Fetch all courses function
//   const fetchAllCourses = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/courses`);
//       setCourses(response.data);
//     } catch (err) {
//       console.error("Error fetching all courses:", err);
//       setError("Failed to fetch courses. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch enrolled courses for the current user
//   const fetchEnrolledCourses = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       // Get all enrollments for the current user
//       const enrollmentsResponse = await axios.get(`${API_BASE_URL}/api/users/${currentUser._id}/enrollments`);
//       const userEnrollments = enrollmentsResponse.data;
      
//       // Get all courses
//       const coursesResponse = await axios.get(`${API_BASE_URL}/api/courses`);
//       const allCourses = coursesResponse.data;
      
//       // Filter courses based on user enrollments
//       const enrolledCourseIds = userEnrollments.map((enrollment: any) => enrollment.course);
//       const enrolledCourses = allCourses.filter((course: Course) => 
//         enrolledCourseIds.includes(course._id)
//       );
      
//       setCourses(enrolledCourses);
//     } catch (err) {
//       console.error("Error fetching enrolled courses:", err);
//       setError("Failed to fetch enrolled courses. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Toggle handler
//   const handleToggleClick = async () => {
//     if (!showAllCourses) {
//       // Show all courses
//       await fetchAllCourses();
//     } else {
//       // Show only enrolled courses
//       await fetchEnrolledCourses();
//     }
//     setShowAllCourses(!showAllCourses);
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = async (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     try {
//       if (isEnrolled) {
//         // Unenroll
//         await axios.delete(`${API_BASE_URL}/api/courses/${courseId}/enroll`);
        
//         // Update local state
//         setEnrollments(
//           enrollments.filter(
//             (e) => !(e.user === currentUser._id && e.course === courseId)
//           )
//         );
        
//         // Refresh courses if viewing enrolled courses
//         if (!showAllCourses) {
//           await fetchEnrolledCourses();
//         }
//       } else {
//         // Enroll
//         const response = await axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`);
//         setEnrollments([...enrollments, response.data]);
//       }
//     } catch (err) {
//       console.error("Error toggling enrollment:", err);
//       setError("Failed to update enrollment. Please try again.");
//     }
//   };

//   // Compute enrolled courses based on local state
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Determine which courses to display
//   const coursesToDisplay = showAllCourses ? courses : userEnrolledCourses;

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//           id="toggle-courses-button"
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button 
//               className="btn btn-primary ms-3" 
//               onClick={() => {
//                 addNewCourse();
//                 // Auto-enroll faculty in their newly created course
//                 if (newCourse._id) {
//                   toggleEnrollment(newCourse._id);
//                 }
//               }}
//             >
//               Add
//             </button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }













// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // State for all fetched courses (separate from props)
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Directly compute enrolled courses whenever needed
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Toggle handler - different behavior for faculty and students
//   const handleToggleClick = () => {
//     if (userRole === "FACULTY") {
//       // FACULTY SPECIFIC TOGGLE LOGIC
//       if (!showAllCourses) {
//         // Going from showing enrolled courses to all courses
//         console.log("Faculty: Showing all courses");
//         // Set the display state without an API call
//         setShowAllCourses(true);
//       } else {
//         // Going from showing all courses to enrolled courses
//         console.log("Faculty: Showing enrolled courses");
//         setShowAllCourses(false);
//       }
//     } else {
//       // STUDENT TOGGLE LOGIC
//       if (!showAllCourses) {
//         // Going to All Courses view
//         setAllFetchedCourses(courses);
//       } 
      
//       // Toggle state
//       setShowAllCourses(!showAllCourses);
//     }
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first
//     if (isEnrolled) {
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
//     } else {
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
//     }
//   };

//   // Determine which courses to display based on role and toggle state
//   let coursesToDisplay;
  
//   if (userRole === "FACULTY") {
//     // Faculty user display logic
//     coursesToDisplay = showAllCourses ? courses : userEnrolledCourses;
//   } else {
//     // Student user display logic
//     coursesToDisplay = showAllCourses 
//       ? courses  // Just use courses prop directly
//       : userEnrolledCourses;
//   }

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }













// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Directly compute enrolled courses whenever needed
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Simple toggle handler - SIMPLIFIED
//   const handleToggleClick = () => {
//     // Toggle state for both faculty and students
//     setShowAllCourses(!showAllCourses);
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first
//     if (isEnrolled) {
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
//     } else {
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
//     }
    
//     // Try API calls (they may fail but local state will work)
//     try {
//       if (isEnrolled) {
//         axios.delete(`${API_BASE_URL}/api/courses/${courseId}/enroll`);
//       } else {
//         axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`);
//       }
//     } catch(e) {
//       // Silently ignore API errors
//     }
//   };

//   // SIMPLIFIED: Determine which courses to display
//   // For both faculty and students, use the same logic
//   const coursesToDisplay = showAllCourses ? courses : userEnrolledCourses;

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }









// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // State for all fetched courses (separate from props)
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Directly compute enrolled courses whenever needed
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Simple toggle handler
//   const handleToggleClick = () => {
//     if (userRole === "FACULTY") {
//       // Faculty specific logic - just toggle without API call
//       setShowAllCourses(!showAllCourses);
//     } else {
//       // STUDENT CODE - UNCHANGED
//       if (!showAllCourses) {
//         // Only fetch if we don't already have courses
//         if (allFetchedCourses.length === 0) {
//           setIsLoading(true);
//           setError(null);
          
//           // Simply use the courses prop instead of making an API call
//           setAllFetchedCourses(courses);
//           setIsLoading(false);
//         }
//       }
      
//       // Toggle state regardless of API call
//       setShowAllCourses(!showAllCourses);
//     }
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first
//     if (isEnrolled) {
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
//     } else {
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
//     }
    
//     // Try API calls (they may fail but local state will work)
//     try {
//       if (isEnrolled) {
//         axios.delete(`${API_BASE_URL}/api/courses/${courseId}/enroll`);
//       } else {
//         axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`);
//       }
//     } catch(e) {
//       // Silently ignore API errors
//     }
//   };

//   // Determine which courses to display
//   let coursesToDisplay;
  
//   if (userRole === "FACULTY") {
//     // Faculty user display logic
//     coursesToDisplay = showAllCourses ? courses : userEnrolledCourses;
//   } else {
//     // Student user display logic
//     coursesToDisplay = showAllCourses 
//       ? (allFetchedCourses.length > 0 ? allFetchedCourses : courses)
//       : userEnrolledCourses;
//   }

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }


















// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (setMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // IMPORTANT: Define the exact API server URL
// // This should be the actual server that runs your Express backend
// const API_SERVER = "http://localhost:4000"; // Adjust this to match your actual backend server

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // State for all fetched courses
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Calculate which courses the user is enrolled in
//   // This is computed on every render, so it's always up to date
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Toggle handler
//   const handleToggleClick = () => {
//     if (userRole === "FACULTY") {
//       // Faculty specific logic - just toggle without API call
//       setShowAllCourses(!showAllCourses);
//     } else {
//       // STUDENT CODE
//       if (!showAllCourses) {
//         // Going from Enrolled to All Courses
//         // Only fetch if we don't already have courses
//         if (allFetchedCourses.length === 0) {
//           setIsLoading(true);
//           setError(null);
          
//           // IMPORTANT: Use absolute URL to bypass Vite's proxy issues
//           // For now, we'll just use the courses from props instead of API
//           setAllFetchedCourses(courses);
//           setIsLoading(false);
//         }
//       }
      
//       // Toggle state regardless of API call
//       setShowAllCourses(!showAllCourses);
//     }
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first for responsive UI
//     if (isEnrolled) {
//       // Unenroll: Remove from local storage and state
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
//     } else {
//       // Enroll: Add to local storage and state
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
//     }
    
//     // We'll skip the API calls since they're failing with 401
//     // and the local state updates are working correctly
//   };

//   // Determine which courses to display
//   let coursesToDisplay;
  
//   if (userRole === "FACULTY") {
//     // Faculty user display logic
//     coursesToDisplay = showAllCourses ? courses : userEnrolledCourses;
//   } else {
//     // Student user display logic
//     coursesToDisplay = showAllCourses 
//       ? (allFetchedCourses.length > 0 ? allFetchedCourses : courses)
//       : userEnrolledCourses;
//   }

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }











// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // State for all fetched courses (separate from props)
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // CRITICAL FIX: Add state for enrolled courses to use when toggling
//   const [enrolledCoursesCache, setEnrolledCoursesCache] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // For faculty, fetch enrollments on mount
//   useEffect(() => {
//     if (userRole === "FACULTY") {
//       axios.get(`/api/users/${currentUser._id}/enrollments`)
//         .then(response => {
//           if (response.data && Array.isArray(response.data)) {
//             setEnrollments(response.data);
//           }
//         })
//         .catch(error => {
//           console.error("Error fetching faculty enrollments:", error);
//         });
//     }
//   }, [userRole, currentUser._id]);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // CRITICAL FIX: Update enrolled courses cache whenever enrollments change
//   useEffect(() => {
//     // Calculate which courses the user is enrolled in
//     const enrolledCourses = courses.filter(course =>
//       enrollments.some(enrollment => 
//         enrollment.user === currentUser._id && 
//         enrollment.course === course._id
//       )
//     );
    
//     // Update the cache
//     setEnrolledCoursesCache(enrolledCourses);
    
//     // Log for debugging
//     console.log(`Updated enrolled courses cache: ${enrolledCourses.length} courses`);
//   }, [enrollments, courses, currentUser._id]);

//   // Simple toggle handler
//   const handleToggleClick = () => {
//     if (userRole === "FACULTY") {
//       // Faculty specific logic
//       setShowAllCourses(!showAllCourses);
//     } else {
//       // Student logic
//       if (!showAllCourses) {
//         // Only fetch if we don't already have courses
//         if (allFetchedCourses.length === 0) {
//           setIsLoading(true);
//           setError(null);
          
//           // Use full URL path with API_BASE_URL
//           axios.get(`${API_BASE_URL}/api/courses`)
//             .then(response => {
//               console.log("API response:", response);
//               if (response.data && Array.isArray(response.data)) {
//                 setAllFetchedCourses(response.data);
//               } else {
//                 setError("Invalid response format from server");
//               }
//             })
//             .catch(error => {
//               console.error("Error fetching courses:", error);
//               setError("Failed to load courses. Please try again.");
//             })
//             .finally(() => {
//               setIsLoading(false);
//             });
//         }
//       }
      
//       // Toggle state regardless of API call
//       setShowAllCourses(!showAllCourses);
//     }
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first
//     if (isEnrolled) {
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
      
//       // Call API with proper URL (but continue even if it fails)
//       axios.delete(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error unenrolling:", err);
//       });
//     } else {
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
      
//       // Call API with proper URL (but continue even if it fails)
//       axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error enrolling:", err);
//       });
//     }
//   };

//   // CRITICAL FIX: Determine which courses to display using the cache for enrolled courses
//   let coursesToDisplay;
  
//   if (userRole === "FACULTY") {
//     coursesToDisplay = showAllCourses ? courses : enrolledCoursesCache;
//   } else {
//     coursesToDisplay = showAllCourses 
//       ? (allFetchedCourses.length > 0 ? allFetchedCourses : courses)
//       : enrolledCoursesCache; // Use the cached enrolled courses
//   }

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }











// student partial //

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // State for all fetched courses (separate from props)
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // For faculty, fetch enrollments on mount
//   useEffect(() => {
//     if (userRole === "FACULTY") {
//       axios.get(`/api/users/${currentUser._id}/enrollments`)
//         .then(response => {
//           if (response.data && Array.isArray(response.data)) {
//             setEnrollments(response.data);
//           }
//         })
//         .catch(error => {
//           console.error("Error fetching faculty enrollments:", error);
//         });
//     }
//   }, [userRole, currentUser._id]);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Directly compute enrolled courses whenever needed
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Simple toggle handler
//   const handleToggleClick = () => {
//     if (userRole === "FACULTY") {
//       // Faculty specific logic - just toggle without API call
//       setShowAllCourses(!showAllCourses);
//     } else {
//       // STUDENT CODE - UNCHANGED
//       if (!showAllCourses) {
//         // Only fetch if we don't already have courses
//         if (allFetchedCourses.length === 0) {
//           setIsLoading(true);
//           setError(null);
          
//           // Use full URL path with API_BASE_URL
//           axios.get(`${API_BASE_URL}/api/courses`)
//             .then(response => {
//               console.log("API response:", response);
//               if (response.data && Array.isArray(response.data)) {
//                 setAllFetchedCourses(response.data);
//               } else {
//                 setError("Invalid response format from server");
//               }
//             })
//             .catch(error => {
//               console.error("Error fetching courses:", error);
//               setError("Failed to load courses. Please try again.");
//             })
//             .finally(() => {
//               setIsLoading(false);
//             });
//         }
//       }
      
//       // Toggle state regardless of API call
//       setShowAllCourses(!showAllCourses);
//     }
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first
//     if (isEnrolled) {
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
      
//       // Call API with proper URL
//       axios.delete(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error unenrolling:", err);
//       });
//     } else {
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
      
//       // Call API with proper URL
//       axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error enrolling:", err);
//       });
//     }
//   };

//   // Determine which courses to display - DEFAULT LOGIC
//   let coursesToDisplay;
  
//   if (userRole === "FACULTY") {
//     // Faculty user display logic: toggle between all courses and enrolled courses
//     coursesToDisplay = showAllCourses ? courses : userEnrolledCourses;
//   } else {
//     // Student user display logic - UNCHANGED
//     coursesToDisplay = showAllCourses 
//       ? (allFetchedCourses.length > 0 ? allFetchedCourses : courses)
//       : userEnrolledCourses;
//   }

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }









// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // State for all fetched courses (separate from props)
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // Faculty courses state (enrolled or all)
//   const [facultyDisplayCourses, setFacultyDisplayCourses] = useState<Course[]>([]);
  
//   // State to track courses to display for both roles
//   const [displayCourses, setDisplayCourses] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Calculate enrolled courses whenever enrollments or courses change
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Update displayed courses when enrollments change
//   useEffect(() => {
//     if (!showAllCourses) {
//       if (userRole === "FACULTY") {
//         setFacultyDisplayCourses(userEnrolledCourses);
//       } else {
//         setDisplayCourses(userEnrolledCourses);
//       }
//     }
//   }, [enrollments, userEnrolledCourses, showAllCourses, userRole]);

//   // Faculty initialization to show enrolled courses by default
//   useEffect(() => {
//     if (userRole === "FACULTY") {
//       // Fetch faculty enrollments from server
//       axios.get(`/api/users/${currentUser._id}/enrollments`)
//         .then(response => {
//           if (response.data && Array.isArray(response.data)) {
//             // Update enrollments with server data
//             setEnrollments(response.data);
//           }
//         })
//         .catch(error => {
//           console.error("Error fetching faculty enrollments:", error);
//         });
        
//       // Faculty starts with enrolled courses
//       setFacultyDisplayCourses(userEnrolledCourses);
//     } else {
//       // Students start with enrolled courses
//       setDisplayCourses(userEnrolledCourses);
//     }
//   }, [userRole, currentUser._id, userEnrolledCourses]);

//   // Toggle handler 
//   const handleToggleClick = () => {
//     if (userRole === "FACULTY") {
//       // FACULTY SPECIFIC TOGGLE LOGIC
//       if (showAllCourses) {
//         // Currently showing ALL courses, switch to ENROLLED
//         console.log("Faculty: Switching to enrolled courses");
//         setFacultyDisplayCourses(userEnrolledCourses);
//         setShowAllCourses(false);
//       } else {
//         // Currently showing ENROLLED courses, switch to ALL
//         console.log("Faculty: Switching to all courses");
//         setFacultyDisplayCourses(courses);
//         setShowAllCourses(true);
//       }
//     } else {
//       // STUDENT TOGGLE LOGIC
//       if (!showAllCourses) {
//         // Only fetch if we don't already have courses
//         if (allFetchedCourses.length === 0) {
//           setIsLoading(true);
//           setError(null);
          
//           // Use full URL path with API_BASE_URL
//           axios.get(`${API_BASE_URL}/api/courses`)
//             .then(response => {
//               console.log("API response:", response);
//               if (response.data && Array.isArray(response.data)) {
//                 setAllFetchedCourses(response.data);
//                 setDisplayCourses(response.data);
//               } else {
//                 setError("Invalid response format from server");
//               }
//             })
//             .catch(error => {
//               console.error("Error fetching courses:", error);
//               setError("Failed to load courses. Please try again.");
//             })
//             .finally(() => {
//               setIsLoading(false);
//             });
//         } else {
//           // Use already fetched courses
//           setDisplayCourses(allFetchedCourses);
//         }
        
//         setShowAllCourses(true);
//       } else {
//         // Going from all to enrolled courses - use latest enrollment data
//         console.log("Student: Switching to enrolled courses:", userEnrolledCourses.length);
//         setDisplayCourses(userEnrolledCourses);
//         setShowAllCourses(false);
//       }
//     }
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first
//     if (isEnrolled) {
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
      
//       // Call API with proper URL
//       axios.delete(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error unenrolling:", err);
//       });
//     } else {
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
      
//       // Call API with proper URL
//       axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error enrolling:", err);
//       });
//     }
//   };

//   // Determine which courses to display based on role
//   const coursesToDisplay = userRole === "FACULTY" ? facultyDisplayCourses : displayCourses;

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }










// not perfect

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // State for all fetched courses (separate from props)
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // Faculty courses state (enrolled or all)
//   const [facultyDisplayCourses, setFacultyDisplayCourses] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Directly compute enrolled courses whenever needed
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Faculty initialization - set to show enrolled courses by default
//   useEffect(() => {
//     if (userRole === "FACULTY") {
//       // Fetch faculty enrollments from server
//       axios.get(`/api/users/${currentUser._id}/enrollments`)
//         .then(response => {
//           if (response.data && Array.isArray(response.data)) {
//             // Update enrollments with server data
//             setEnrollments(response.data);
            
//             // Faculty should start with enrolled courses
//             setFacultyDisplayCourses(userEnrolledCourses);
//           }
//         })
//         .catch(error => {
//           console.error("Error fetching faculty enrollments:", error);
//         });
//     }
//   }, [userRole, currentUser._id]);

//   // Update faculty displayed courses when enrolled courses change
//   useEffect(() => {
//     if (userRole === "FACULTY" && !showAllCourses) {
//       setFacultyDisplayCourses(userEnrolledCourses);
//     }
//   }, [userRole, userEnrolledCourses, showAllCourses]);

//   // Toggle handler 
//   const handleToggleClick = () => {
//     if (userRole === "FACULTY") {
//       // FACULTY SPECIFIC TOGGLE LOGIC
//       if (showAllCourses) {
//         // Currently showing ALL courses, switch to ENROLLED
//         console.log("Faculty: Switching to enrolled courses");
//         setFacultyDisplayCourses(userEnrolledCourses);
//         setShowAllCourses(false);
//       } else {
//         // Currently showing ENROLLED courses, switch to ALL
//         console.log("Faculty: Switching to all courses");
//         setFacultyDisplayCourses(courses);
//         setShowAllCourses(true);
//       }
//     } else {
//       // STUDENT TOGGLE LOGIC - Kept unchanged from the working code
//       if (!showAllCourses) {
//         // Only fetch if we don't already have courses
//         if (allFetchedCourses.length === 0) {
//           setIsLoading(true);
//           setError(null);
          
//           // Use full URL path with API_BASE_URL
//           axios.get(`${API_BASE_URL}/api/courses`)
//             .then(response => {
//               console.log("API response:", response);
//               if (response.data && Array.isArray(response.data)) {
//                 setAllFetchedCourses(response.data);
//               } else {
//                 setError("Invalid response format from server");
//               }
//             })
//             .catch(error => {
//               console.error("Error fetching courses:", error);
//               setError("Failed to load courses. Please try again.");
//             })
//             .finally(() => {
//               setIsLoading(false);
//             });
//         }
//       }
      
//       // Toggle state regardless of API call
//       setShowAllCourses(!showAllCourses);
//     }
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first
//     if (isEnrolled) {
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
      
//       // Call API with proper URL
//       axios.delete(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error unenrolling:", err);
//       });
//     } else {
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
      
//       // Call API with proper URL
//       axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error enrolling:", err);
//       });
//     }
//   };

//   // Determine which courses to display based on role and toggle state
//   let coursesToDisplay;
  
//   if (userRole === "FACULTY") {
//     // Faculty display uses separate state just for faculty
//     coursesToDisplay = facultyDisplayCourses;
//   } else {
//     // STUDENT LOGIC - Untouched from working code
//     coursesToDisplay = showAllCourses 
//       ? (allFetchedCourses.length > 0 ? allFetchedCourses : courses)
//       : userEnrolledCourses;
//   }

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }




//  perfect student login not perfect new enroll not showing // patial faculty login

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // State for all fetched courses (separate from props)
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Directly compute enrolled courses whenever needed
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Toggle handler - different behavior for faculty and students
//   const handleToggleClick = () => {
//     if (userRole === "FACULTY") {
//       // FACULTY SPECIFIC TOGGLE LOGIC
//       if (!showAllCourses) {
//         // Going from showing enrolled courses to all courses
//         console.log("Faculty: Showing all courses");
//         // Set the display state without an API call
//         setShowAllCourses(true);
//       } else {
//         // Going from showing all courses to enrolled courses
//         console.log("Faculty: Showing enrolled courses");
//         setShowAllCourses(false);
//       }
//     } else {
//       // STUDENT TOGGLE LOGIC - Kept unchanged from the working code
//       if (!showAllCourses) {
//         // Only fetch if we don't already have courses
//         if (allFetchedCourses.length === 0) {
//           setIsLoading(true);
//           setError(null);
          
//           // Use full URL path with API_BASE_URL
//           axios.get(`${API_BASE_URL}/api/courses`)
//             .then(response => {
//               console.log("API response:", response);
//               if (response.data && Array.isArray(response.data)) {
//                 setAllFetchedCourses(response.data);
//               } else {
//                 setError("Invalid response format from server");
//               }
//             })
//             .catch(error => {
//               console.error("Error fetching courses:", error);
//               setError("Failed to load courses. Please try again.");
//             })
//             .finally(() => {
//               setIsLoading(false);
//             });
//         }
//       }
      
//       // Toggle state regardless of API call
//       setShowAllCourses(!showAllCourses);
//     }
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first
//     if (isEnrolled) {
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
      
//       // Call API with proper URL
//       axios.delete(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error unenrolling:", err);
//       });
//     } else {
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
      
//       // Call API with proper URL
//       axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error enrolling:", err);
//       });
//     }
//   };

//   // Determine which courses to display based on role and toggle state
//   let coursesToDisplay;
  
//   if (userRole === "FACULTY") {
//     // Faculty user display logic
//     coursesToDisplay = showAllCourses ? courses : userEnrolledCourses;
//   } else {
//     // Student user display logic - Keep the original logic
//     coursesToDisplay = showAllCourses 
//       ? (allFetchedCourses.length > 0 ? allFetchedCourses : courses)
//       : userEnrolledCourses;
//   }

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }















// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // Toggle state for showing all or enrolled courses
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // Courses to display
//   const [displayCourses, setDisplayCourses] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);
  
//   // State for enrollments (localStorage for students, server for faculty)
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // Save enrollments to localStorage (for students)
//   useEffect(() => {
//     if (userRole !== "FACULTY") {
//       localStorage.setItem("enrollments", JSON.stringify(enrollments));
//     }
//   }, [enrollments, userRole]);

//   // For faculty: fetch enrollments from server and initialize display
//   useEffect(() => {
//     if (userRole === "FACULTY") {
//       // Faculty starts with showing all courses
//       setDisplayCourses(courses);
      
//       // Also fetch their enrollments
//       const fetchFacultyEnrollments = async () => {
//         try {
//           const response = await axios.get(`/api/users/${currentUser._id}/enrollments`);
//           if (response.data && Array.isArray(response.data)) {
//             console.log("Faculty enrollments:", response.data);
//             // Only update enrollments, don't change display
//             setEnrollments(response.data);
//           }
//         } catch (error) {
//           console.error("Error fetching faculty enrollments:", error);
//         }
//       };
      
//       fetchFacultyEnrollments();
//     } else {
//       // For students: Initial state shows enrolled courses
//       const studentEnrolledCourses = courses.filter((course) =>
//         enrollments.some(
//           (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//         )
//       );
//       setDisplayCourses(studentEnrolledCourses);
//     }
//   }, [userRole, currentUser._id, courses, enrollments]);

//   // Calculate enrolled courses
//   const userEnrolledCourses = courses.filter((course) => {
//     if (userRole === "FACULTY") {
//       // For faculty, check enrollment without user ID
//       return enrollments.some(enrollment => enrollment.course === course._id);
//     } else {
//       // For students, check with user ID
//       return enrollments.some(
//         enrollment => enrollment.user === currentUser._id && enrollment.course === course._id
//       );
//     }
//   });

//   // Handle toggle click
//   const handleToggleClick = async () => {
//     if (userRole === "FACULTY") {
//       // Faculty toggle behavior
//       if (showAllCourses) {
//         // Switch from all courses to enrolled courses
//         setDisplayCourses(userEnrolledCourses);
//         setShowAllCourses(false);
//       } else {
//         // Switch from enrolled courses to all courses
//         setDisplayCourses(courses);
//         setShowAllCourses(true);
//       }
//     } else {
//       // Student toggle behavior - keep original code
//       if (!showAllCourses) {
//         // Going from enrolled to all courses
//         setIsLoading(true);
//         setError(null);
        
//         // Make API call to fetch all courses
//         axios.get("/api/courses")
//           .then(response => {
//             if (response.data && Array.isArray(response.data)) {
//               console.log("Fetched all courses:", response.data.length);
//               setDisplayCourses(response.data);
//             } else {
//               console.error("Unexpected response format:", response.data);
//               setDisplayCourses(courses); // Fallback to props courses
//             }
//           })
//           .catch(error => {
//             console.error("Error fetching courses:", error);
//             setError("Failed to load all courses");
//             setDisplayCourses(courses); // Fallback to props courses
//           })
//           .finally(() => {
//             setIsLoading(false);
//           });
        
//         setShowAllCourses(true);
//       } else {
//         // Going from all to enrolled courses
//         console.log("Showing enrolled courses:", userEnrolledCourses.length);
//         setDisplayCourses(userEnrolledCourses);
//         setShowAllCourses(false);
//       }
//     }
//   };

//   // Toggle enrollment for a course
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     if (isEnrolled) {
//       // Unenroll
//       axios.delete(`/api/courses/${courseId}/enroll`)
//         .then(() => {
//           // Update local state on success
//           setEnrollments(prev => 
//             prev.filter(enrollment => 
//               !(enrollment.user === currentUser._id && enrollment.course === courseId)
//             )
//           );
//         })
//         .catch(error => {
//           console.error("Error unenrolling:", error);
//         });
//     } else {
//       // Enroll
//       axios.post(`/api/courses/${courseId}/enroll`)
//         .then(response => {
//           // Update local state with server response
//           if (response.data && response.data._id) {
//             setEnrollments(prev => [...prev, response.data]);
//           } else {
//             // Fallback if response doesn't have expected structure
//             setEnrollments(prev => [
//               ...prev, 
//               { user: currentUser._id, course: courseId }
//             ]);
//           }
//         })
//         .catch(error => {
//           console.error("Error enrolling:", error);
//         });
//     }
//   };

//   // Debug info
//   console.log("Role:", userRole, "ShowAll:", showAllCourses, "Display:", displayCourses.length);

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${displayCourses.length})` 
//           : `Enrolled Courses (${displayCourses.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : displayCourses.length === 0 ? (
//         <div className="text-center p-5">
//           <p className="text-muted">
//             {showAllCourses 
//               ? "No courses available." 
//               : "You are not enrolled in any courses yet."}
//           </p>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {displayCourses.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }










// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // Toggle state for showing all courses 
//   const [showAllCourses, setShowAllCourses] = useState(userRole === "FACULTY");
  
//   // Courses to display
//   const [displayCourses, setDisplayCourses] = useState<Course[]>(courses);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);
  
//   // State for enrollments
//   const [enrollments, setEnrollments] = useState<Array<{ _id?: string; user: string; course: string }>>([]);

//   // Fetch enrollments when the component mounts
//   useEffect(() => {
//     const fetchEnrollments = async () => {
//       try {
//         const userId = currentUser._id;
//         const response = await axios.get(`/api/users/${userId}/enrollments`);
//         if (response.data && Array.isArray(response.data)) {
//           console.log("Server enrollments:", response.data);
//           setEnrollments(response.data);
//         }
//       } catch (error) {
//         console.error("Error fetching enrollments:", error);
//       }
//     };
    
//     fetchEnrollments();
//   }, [currentUser._id]);

//   // Calculate enrolled courses
//   const userEnrolledCourses = courses.filter((course) => 
//     enrollments.some(enrollment => enrollment.course === course._id)
//   );

//   // Set initial displayed courses based on user role
//   useEffect(() => {
//     if (userRole === "FACULTY") {
//       // Faculty users see all courses by default
//       setDisplayCourses(courses);
//       setShowAllCourses(true);
//     } else {
//       // Students see only enrolled courses by default
//       setDisplayCourses(userEnrolledCourses);
//       setShowAllCourses(false);
//     }
//   }, [userRole, courses, userEnrolledCourses]);

//   // Handle toggle button click
//   const handleToggleClick = async () => {
//     // If current view is "Enrolled Courses", switch to "All Courses"
//     if (!showAllCourses) {
//       setIsLoading(true);
      
//       try {
//         // Fetch all courses from the API
//         const response = await axios.get("/api/courses");
//         if (response.data && Array.isArray(response.data)) {
//           setDisplayCourses(response.data);
//         } else {
//           // Fallback to using the courses prop
//           setDisplayCourses(courses);
//         }
//       } catch (error) {
//         console.error("Error fetching all courses:", error);
//         // Fallback to using the courses prop
//         setDisplayCourses(courses);
//       } finally {
//         setIsLoading(false);
//       }
      
//       setShowAllCourses(true);
//     } 
//     // If current view is "All Courses", switch to "Enrolled Courses"
//     else {
//       if (userRole === "FACULTY") {
//         // For faculty, show all enrolled courses
//         setDisplayCourses(userEnrolledCourses);
//       } else {
//         // For students, show enrolled courses
//         setDisplayCourses(userEnrolledCourses);
//       }
      
//       setShowAllCourses(false);
//     }
//   };

//   // Toggle enrollment for a course (for students)
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.course === courseId
//     );

//     if (isEnrolled) {
//       // Unenroll
//       axios.delete(`/api/courses/${courseId}/enroll`)
//         .then(() => {
//           // Update local state
//           setEnrollments(prev => 
//             prev.filter(enrollment => enrollment.course !== courseId)
//           );
//         })
//         .catch(error => {
//           console.error("Error unenrolling:", error);
//         });
//     } else {
//       // Enroll
//       axios.post(`/api/courses/${courseId}/enroll`)
//         .then(response => {
//           if (response.data && response.data._id) {
//             setEnrollments(prev => [...prev, response.data]);
//           } else {
//             setEnrollments(prev => [
//               ...prev, 
//               { user: currentUser._id, course: courseId }
//             ]);
//           }
//         })
//         .catch(error => {
//           console.error("Error enrolling:", error);
//         });
//     }
//   };

//   // Debug information
//   console.log("User Role:", userRole);
//   console.log("Show All Courses:", showAllCourses);
//   console.log("Enrollment count:", enrollments.length);
//   console.log("Enrolled courses count:", userEnrolledCourses.length);
//   console.log("Displayed courses count:", displayCourses.length);

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses 
//                 ? (userRole === "FACULTY" ? "My Enrolled Courses" : "Enrolled Courses") 
//                 : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${displayCourses.length})` 
//           : (userRole === "FACULTY" 
//               ? `My Enrolled Courses (${displayCourses.length})` 
//               : `Enrolled Courses (${displayCourses.length})`)
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : displayCourses.length === 0 ? (
//         <div className="text-center p-5">
//           <p className="text-muted">
//             {showAllCourses 
//               ? "No courses available." 
//               : "You are not enrolled in any courses yet."}
//           </p>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {displayCourses.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }










// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // Toggle state for showing all or enrolled courses
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // Courses to display
//   const [displayCourses, setDisplayCourses] = useState<Course[]>([]);
  
//   // All fetched courses when "All Courses" is clicked
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // Loading states
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);
  
//   // State for enrollments
//   const [enrollments, setEnrollments] = useState<Array<{ _id?: string; user: string; course: string }>>([]);

//   // Fetch enrollments on component mount
//   useEffect(() => {
//     const fetchEnrollments = async () => {
//       try {
//         const userId = currentUser._id;
//         console.log("Fetching enrollments for user:", userId);
        
//         const response = await axios.get(`/api/users/${userId}/enrollments`);
//         if (response.data && Array.isArray(response.data)) {
//           console.log("Server enrollments:", response.data);
//           setEnrollments(response.data);
          
//           // Save to localStorage for persistence
//           localStorage.setItem("enrollments", JSON.stringify(response.data));
//         }
//       } catch (error) {
//         console.error("Error fetching enrollments:", error);
        
//         // Fallback to localStorage if API fails
//         const storedEnrollments = JSON.parse(localStorage.getItem("enrollments") || "[]");
//         setEnrollments(storedEnrollments);
//       }
//     };
    
//     fetchEnrollments();
//   }, [currentUser._id]);
  
//   // Calculate which courses the user is enrolled in
//   // Show debug info for enrollment matching
//   const userEnrolledCourses = courses.filter((course) => {
//     const matchingEnrollment = enrollments.find(
//       enrollment => enrollment.course === course._id
//     );
    
//     if (matchingEnrollment) {
//       console.log(`Match found for course ${course._id}: ${course.name}`);
//       return true;
//     }
    
//     // Log courses that don't match
//     console.log(`No enrollment match for course ${course._id}: ${course.name}`);
//     if (enrollments.length > 0) {
//       console.log(`Available enrollment course IDs: ${enrollments.map(e => e.course).join(', ')}`);
//     }
    
//     return false;
//   });

//   // Set initial display courses
//   useEffect(() => {
//     if (!showAllCourses) {
//       console.log(`Setting displayed courses to ${userEnrolledCourses.length} enrolled courses`);
//       setDisplayCourses(userEnrolledCourses);
//     } else if (allFetchedCourses.length > 0) {
//       console.log(`Setting displayed courses to ${allFetchedCourses.length} all courses`);
//       setDisplayCourses(allFetchedCourses);
//     } else {
//       console.log(`Setting displayed courses to ${courses.length} prop courses`);
//       setDisplayCourses(courses);
//     }
//   }, [showAllCourses, userEnrolledCourses, allFetchedCourses, courses]);

//   // Handle toggle click
//   const handleToggleClick = () => {
//     if (!showAllCourses) {
//       // Going from enrolled to all courses
//       setIsLoading(true);
//       setError(null);
      
//       // Make API call to fetch all courses
//       axios.get("/api/courses")
//         .then(response => {
//           if (response.data && Array.isArray(response.data)) {
//             console.log("Fetched all courses:", response.data.length);
//             setAllFetchedCourses(response.data);
//           } else {
//             console.error("Unexpected response format:", response.data);
//             setAllFetchedCourses(courses); // Fallback to props courses
//           }
//         })
//         .catch(error => {
//           console.error("Error fetching courses:", error);
//           setError("Failed to load all courses");
//           setAllFetchedCourses(courses); // Fallback to props courses
//         })
//         .finally(() => {
//           setIsLoading(false);
//         });
      
//       setShowAllCourses(true);
//     } else {
//       // Going from all to enrolled courses
//       setShowAllCourses(false);
//     }
//   };

//   // Toggle enrollment for a course
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.course === courseId
//     );

//     if (isEnrolled) {
//       // Unenroll
//       axios.delete(`/api/courses/${courseId}/enroll`)
//         .then(() => {
//           // Update local state on success
//           setEnrollments(prev => 
//             prev.filter(enrollment => enrollment.course !== courseId)
//           );
//         })
//         .catch(error => {
//           console.error("Error unenrolling:", error);
//         });
//     } else {
//       // Enroll
//       axios.post(`/api/courses/${courseId}/enroll`)
//         .then(response => {
//           // Update local state with server response
//           if (response.data && response.data._id) {
//             setEnrollments(prev => [...prev, response.data]);
//           } else {
//             // Fallback if response doesn't have expected structure
//             setEnrollments(prev => [
//               ...prev, 
//               { user: currentUser._id, course: courseId }
//             ]);
//           }
//         })
//         .catch(error => {
//           console.error("Error enrolling:", error);
//         });
//     }
//   };

//   // Force manual refresh of enrollments
//   const refreshEnrollments = async () => {
//     try {
//       const userId = currentUser._id;
//       console.log("Manually refreshing enrollments for user:", userId);
//       const response = await axios.get(`/api/users/${userId}/enrollments`);
      
//       if (response.data && Array.isArray(response.data)) {
//         console.log("Received enrollments:", response.data);
//         setEnrollments(response.data);
//       }
//     } catch (error) {
//       console.error("Error refreshing enrollments:", error);
//     }
//   };

//   // Debug render information
//   console.log("User Role:", userRole);
//   console.log("Current enrollments count:", enrollments.length);
//   console.log("Enrollment course IDs:", enrollments.map(e => e.course));
//   console.log("Available course IDs:", courses.map(c => c._id));
//   console.log("User enrolled courses count:", userEnrolledCourses.length);
//   console.log("Currently displayed courses count:", displayCourses.length);

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <div>
//           <button 
//             className="btn btn-secondary me-2" 
//             onClick={refreshEnrollments}
//           >
//             Refresh Enrollments
//           </button>
//           <button
//             className="btn btn-primary"
//             onClick={handleToggleClick}
//             disabled={isLoading}
//           >
//             {isLoading 
//               ? "Loading..." 
//               : (showAllCourses ? "Enrolled Courses" : "All Courses")
//             }
//           </button>
//         </div>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       {/* Debug info for faculty */}
//       {userRole === "FACULTY" && (
//         <div className="alert alert-secondary">
//           <p><strong>Debug Info:</strong></p>
//           <p>User ID: {currentUser._id}</p>
//           <p>Enrollments: {enrollments.length}</p>
//           <p>Enrollment course IDs: {enrollments.map(e => e.course).join(', ')}</p>
//           <p>Available course IDs: {courses.map(c => c._id).join(', ')}</p>
//           <p>Enrolled Courses: {userEnrolledCourses.length}</p>
//           <p>Displayed Courses: {displayCourses.length}</p>
//         </div>
//       )}
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${displayCourses.length})` 
//           : `Enrolled Courses (${displayCourses.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : displayCourses.length === 0 ? (
//         <div className="text-center p-5">
//           <p className="text-muted">
//             {showAllCourses 
//               ? "No courses available." 
//               : "You are not enrolled in any courses yet."}
//           </p>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {displayCourses.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }















// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector, useDispatch } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
//   const dispatch = useDispatch();
  
//   // Toggle state for showing all or enrolled courses
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // Courses to display (all or enrolled)
//   const [displayCourses, setDisplayCourses] = useState<Course[]>([]);
  
//   // Loading states
//   const [isLoading, setIsLoading] = useState(false);
//   const [isInitializing, setIsInitializing] = useState(true);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);
  
//   // State for enrollments (localStorage)
//   const [enrollments, setEnrollments] = useState<Array<{ _id?: string; user: string; course: string }>>([]);

//   // First-time initialization
//   useEffect(() => {
//     // Initial async setup 
//     const initialize = async () => {
//       setIsInitializing(true);
//       try {
//         // First load enrollments from localStorage as initial data
//         const storedEnrollments = JSON.parse(localStorage.getItem("enrollments") || "[]");
//         console.log("Initial enrollments from localStorage:", storedEnrollments);
//         setEnrollments(storedEnrollments);
        
//         // Then fetch from server to get the most up-to-date data
//         const userId = currentUser._id;
//         console.log("Fetching enrollments for user:", userId);
        
//         const response = await axios.get(`/api/users/${userId}/enrollments`);
//         if (response.data && Array.isArray(response.data)) {
//           console.log("Server enrollments:", response.data);
//           // Replace local enrollments with server data
//           setEnrollments(response.data);
//           localStorage.setItem("enrollments", JSON.stringify(response.data));
//         }
//       } catch (error) {
//         console.error("Error initializing enrollments:", error);
//       } finally {
//         setIsInitializing(false);
//       }
//     };
    
//     initialize();
//   }, [currentUser._id]);

//   // Update localStorage when enrollments change
//   useEffect(() => {
//     if (!isInitializing) {
//       localStorage.setItem("enrollments", JSON.stringify(enrollments));
//     }
//   }, [enrollments, isInitializing]);

//   // Calculate enrolled courses based on enrollments
//   const userEnrolledCourses = courses.filter((course) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     );
//     return isEnrolled;
//   });

//   // Update displayed courses
//   useEffect(() => {
//     if (!isInitializing) {
//       if (showAllCourses) {
//         // If already showing all courses, keep doing that
//         // We'll fetch and set these in the handleToggleClick function
//       } else {
//         // Show enrolled courses
//         console.log("Setting displayed courses to enrolled courses:", userEnrolledCourses.length);
//         setDisplayCourses(userEnrolledCourses);
//       }
//     }
//   }, [userEnrolledCourses, showAllCourses, isInitializing]);

//   // Handle toggle click
//   const handleToggleClick = () => {
//     if (!showAllCourses) {
//       // Going from enrolled to all courses
//       setIsLoading(true);
//       setError(null);
      
//       // Make API call to fetch all courses
//       axios.get("/api/courses")
//         .then(response => {
//           if (response.data && Array.isArray(response.data)) {
//             console.log("Fetched all courses:", response.data.length);
//             setDisplayCourses(response.data);
//           } else {
//             console.error("Unexpected response format:", response.data);
//             setDisplayCourses(courses); // Fallback to props courses
//           }
//         })
//         .catch(error => {
//           console.error("Error fetching courses:", error);
//           setError("Failed to load all courses");
//           setDisplayCourses(courses); // Fallback to props courses
//         })
//         .finally(() => {
//           setIsLoading(false);
//         });
      
//       setShowAllCourses(true);
//     } else {
//       // Going from all to enrolled courses
//       console.log("Showing enrolled courses:", userEnrolledCourses.length);
//       setDisplayCourses(userEnrolledCourses);
//       setShowAllCourses(false);
//     }
//   };

//   // Toggle enrollment for a course
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     if (isEnrolled) {
//       // Unenroll
//       axios.delete(`/api/courses/${courseId}/enroll`)
//         .then(() => {
//           // Update local state on success
//           setEnrollments(prev => 
//             prev.filter(enrollment => 
//               !(enrollment.user === currentUser._id && enrollment.course === courseId)
//             )
//           );
//         })
//         .catch(error => {
//           console.error("Error unenrolling:", error);
//         });
//     } else {
//       // Enroll
//       axios.post(`/api/courses/${courseId}/enroll`)
//         .then(response => {
//           // Update local state with server response
//           if (response.data && response.data._id) {
//             setEnrollments(prev => [...prev, response.data]);
//           } else {
//             // Fallback if response doesn't have expected structure
//             setEnrollments(prev => [
//               ...prev, 
//               { user: currentUser._id, course: courseId }
//             ]);
//           }
//         })
//         .catch(error => {
//           console.error("Error enrolling:", error);
//         });
//     }
//   };

//   // Force manual refresh of enrollments
//   const refreshEnrollments = async () => {
//     try {
//       const userId = currentUser._id;
//       console.log("Manually refreshing enrollments for user:", userId);
//       const response = await axios.get(`/api/users/${userId}/enrollments`);
      
//       if (response.data && Array.isArray(response.data)) {
//         console.log("Received enrollments:", response.data);
//         setEnrollments(response.data);
//       }
//     } catch (error) {
//       console.error("Error refreshing enrollments:", error);
//     }
//   };

//   // Debug render information
//   console.log("User Role:", userRole);
//   console.log("Current enrollments count:", enrollments.length);
//   console.log("Current enrollments:", enrollments);
//   console.log("User enrolled courses count:", userEnrolledCourses.length);
//   console.log("Currently displayed courses count:", displayCourses.length);

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <div>
//           {isInitializing ? (
//             <span className="me-3">Loading enrollments...</span>
//           ) : (
//             <button 
//               className="btn btn-secondary me-2" 
//               onClick={refreshEnrollments}
//             >
//               Refresh Enrollments
//             </button>
//           )}
//           <button
//             className="btn btn-primary"
//             onClick={handleToggleClick}
//             disabled={isLoading || isInitializing}
//           >
//             {isLoading 
//               ? "Loading..." 
//               : (showAllCourses ? "Enrolled Courses" : "All Courses")
//             }
//           </button>
//         </div>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       {/* Debug info for faculty */}
//       {userRole === "FACULTY" && (
//         <div className="alert alert-secondary">
//           <p>Debug Info:</p>
//           <p>User ID: {currentUser._id}</p>
//           <p>Enrollments: {enrollments.length}</p>
//           <p>Enrolled Courses: {userEnrolledCourses.length}</p>
//           <p>Displayed Courses: {displayCourses.length}</p>
//         </div>
//       )}
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${displayCourses.length})` 
//           : `Enrolled Courses (${displayCourses.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading || isInitializing ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : displayCourses.length === 0 ? (
//         <div className="text-center p-5">
//           <p className="text-muted">
//             {showAllCourses 
//               ? "No courses available." 
//               : "You are not enrolled in any courses yet."}
//           </p>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {displayCourses.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }













// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // Toggle state for showing all or enrolled courses
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // Courses to display (all or enrolled)
//   const [displayCourses, setDisplayCourses] = useState<Course[]>(courses);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);
  
//   // State for enrollments (localStorage)
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // Save enrollments to localStorage
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Calculate enrolled courses (for all users including faculty)
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Set initial display courses based on user role
//   useEffect(() => {
//     if (userRole === "FACULTY") {
//       // Check if toggled to show all courses
//       if (showAllCourses) {
//         setDisplayCourses(courses);
//       } else {
//         // Show enrolled courses for faculty too
//         setDisplayCourses(userEnrolledCourses);
//       }
//     } else {
//       // Students initially see enrolled courses
//       setDisplayCourses(userEnrolledCourses);
//     }
//   }, [userRole, courses, userEnrolledCourses, showAllCourses]);

//   // Handle toggle click
//   const handleToggleClick = () => {
//     if (!showAllCourses) {
//       // Going from enrolled to all courses
//       setIsLoading(true);
//       setError(null);
      
//       // Make API call to fetch all courses
//       axios.get("/api/courses")
//         .then(response => {
//           if (response.data && Array.isArray(response.data)) {
//             setDisplayCourses(response.data);
//           } else {
//             console.error("Unexpected response format:", response.data);
//             setDisplayCourses(courses); // Fallback to props courses
//           }
//         })
//         .catch(error => {
//           console.error("Error fetching courses:", error);
//           setError("Failed to load all courses");
//           setDisplayCourses(courses); // Fallback to props courses
//         })
//         .finally(() => {
//           setIsLoading(false);
//         });
      
//       setShowAllCourses(true);
//     } else {
//       // Going from all to enrolled courses (for both faculty and students)
//       setDisplayCourses(userEnrolledCourses);
//       setShowAllCourses(false);
//     }
//   };

//   // Toggle enrollment for a course
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     if (isEnrolled) {
//       // Unenroll
//       axios.delete(`/api/courses/${courseId}/enroll`)
//         .then(() => {
//           // Update local state on success
//           setEnrollments(prev => 
//             prev.filter(enrollment => 
//               !(enrollment.user === currentUser._id && enrollment.course === courseId)
//             )
//           );
//         })
//         .catch(error => {
//           console.error("Error unenrolling:", error);
//         });
//     } else {
//       // Enroll
//       axios.post(`/api/courses/${courseId}/enroll`)
//         .then(response => {
//           // Update local state with server response
//           if (response.data && response.data._id) {
//             setEnrollments(prev => [...prev, response.data]);
//           } else {
//             // Fallback if response doesn't have expected structure
//             setEnrollments(prev => [
//               ...prev, 
//               { user: currentUser._id, course: courseId }
//             ]);
//           }
//         })
//         .catch(error => {
//           console.error("Error enrolling:", error);
//         });
//     }
//   };

//   // Determine what to show for toggle button label
//   const getToggleButtonLabel = () => {
//     if (isLoading) {
//       return "Loading...";
//     }
    
//     if (showAllCourses) {
//       return "Enrolled Courses";
//     } else {
//       return "All Courses";
//     }
//   };

//   // Determine header text based on toggle state
//   const getHeaderText = () => {
//     if (showAllCourses) {
//       return `All Courses (${displayCourses.length})`;
//     } else {
//       return `Enrolled Courses (${displayCourses.length})`;
//     }
//   };

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {getToggleButtonLabel()}
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {getHeaderText()}
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {displayCourses.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }






// faculty login

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // Toggle state for showing all or enrolled courses
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // Courses to display (all or enrolled)
//   const [displayCourses, setDisplayCourses] = useState<Course[]>(courses);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);
  
//   // State for enrollments (localStorage)
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // Save enrollments to localStorage
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Calculate enrolled courses (for students)
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Set initial display courses based on user role
//   useEffect(() => {
//     if (userRole === "FACULTY") {
//       // Faculty initially sees all courses from props
//       setDisplayCourses(courses);
//     } else {
//       // Students initially see enrolled courses
//       setDisplayCourses(userEnrolledCourses);
//     }
//   }, [userRole, courses, userEnrolledCourses]);

//   // Handle toggle click
//   const handleToggleClick = () => {
//     if (!showAllCourses) {
//       // Going from enrolled/filtered to all courses
//       setIsLoading(true);
//       setError(null);
      
//       // Make API call to fetch all courses
//       axios.get("/api/courses")
//         .then(response => {
//           if (response.data && Array.isArray(response.data)) {
//             setDisplayCourses(response.data);
//           } else {
//             console.error("Unexpected response format:", response.data);
//             setDisplayCourses(courses); // Fallback to props courses
//           }
//         })
//         .catch(error => {
//           console.error("Error fetching courses:", error);
//           setError("Failed to load all courses");
//           setDisplayCourses(courses); // Fallback to props courses
//         })
//         .finally(() => {
//           setIsLoading(false);
//         });
      
//       setShowAllCourses(true);
//     } else {
//       // Going from all to enrolled/filtered courses
//       if (userRole === "FACULTY") {
//         // For faculty, show original courses prop (could be filtered in parent)
//         setDisplayCourses(courses);
//       } else {
//         // For students, show enrolled courses
//         setDisplayCourses(userEnrolledCourses);
//       }
//       setShowAllCourses(false);
//     }
//   };

//   // Toggle enrollment for a course
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     if (isEnrolled) {
//       // Unenroll
//       axios.delete(`/api/courses/${courseId}/enroll`)
//         .then(() => {
//           // Update local state on success
//           setEnrollments(prev => 
//             prev.filter(enrollment => 
//               !(enrollment.user === currentUser._id && enrollment.course === courseId)
//             )
//           );
//         })
//         .catch(error => {
//           console.error("Error unenrolling:", error);
//         });
//     } else {
//       // Enroll
//       axios.post(`/api/courses/${courseId}/enroll`)
//         .then(response => {
//           // Update local state with server response
//           if (response.data && response.data._id) {
//             setEnrollments(prev => [...prev, response.data]);
//           } else {
//             // Fallback if response doesn't have expected structure
//             setEnrollments(prev => [
//               ...prev, 
//               { user: currentUser._id, course: courseId }
//             ]);
//           }
//         })
//         .catch(error => {
//           console.error("Error enrolling:", error);
//         });
//     }
//   };

//   // Determine what to show for toggle button label based on user role
//   const getToggleButtonLabel = () => {
//     if (isLoading) {
//       return "Loading...";
//     }
    
//     if (showAllCourses) {
//       return userRole === "FACULTY" ? "My Courses" : "Enrolled Courses";
//     } else {
//       return "All Courses";
//     }
//   };

//   // Determine header text based on toggle state and user role
//   const getHeaderText = () => {
//     if (showAllCourses) {
//       return `All Courses (${displayCourses.length})`;
//     } else {
//       return userRole === "FACULTY" 
//         ? `My Courses (${displayCourses.length})` 
//         : `Enrolled Courses (${displayCourses.length})`;
//     }
//   };

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {getToggleButtonLabel()}
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {getHeaderText()}
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {displayCourses.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }





















//// Perfect for student login ///

// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// // Define your base API URL - adjust this to match your server
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
  
//   // State for toggle
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // State for enrollments from localStorage
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // State for all fetched courses (separate from props)
//   const [allFetchedCourses, setAllFetchedCourses] = useState<Course[]>([]);
  
//   // Loading state
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Error state
//   const [error, setError] = useState<string | null>(null);

//   // Save enrollments to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   // Directly compute enrolled courses whenever needed
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Simple toggle handler
//   const handleToggleClick = () => {
//     if (!showAllCourses) {
//       // Only fetch if we don't already have courses
//       if (allFetchedCourses.length === 0 && userRole !== "FACULTY") {
//         setIsLoading(true);
//         setError(null);
        
//         // Use full URL path with API_BASE_URL
//         axios.get(`${API_BASE_URL}/api/courses`)
//           .then(response => {
//             console.log("API response:", response);
//             if (response.data && Array.isArray(response.data)) {
//               setAllFetchedCourses(response.data);
//             } else {
//               setError("Invalid response format from server");
//             }
//           })
//           .catch(error => {
//             console.error("Error fetching courses:", error);
//             setError("Failed to load courses. Please try again.");
//           })
//           .finally(() => {
//             setIsLoading(false);
//           });
//       }
//     }
    
//     // Toggle state regardless of API call
//     setShowAllCourses(!showAllCourses);
//   };

//   // Enrollment toggle function
//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // Update local state first
//     if (isEnrolled) {
//       setEnrollments(prev => 
//         prev.filter(enrollment => 
//           !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         )
//       );
      
//       // Call API with proper URL
//       axios.delete(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error unenrolling:", err);
//       });
//     } else {
//       setEnrollments(prev => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
      
//       // Call API with proper URL
//       axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error enrolling:", err);
//       });
//     }
//   };

//   // Determine which courses to display
//   // If showing all courses, use allFetchedCourses if available, otherwise use prop courses
//   // If showing enrolled courses, use userEnrolledCourses
//   const coursesToDisplay = showAllCourses 
//     ? (userRole === "FACULTY" ? courses : (allFetchedCourses.length > 0 ? allFetchedCourses : courses))
//     : userEnrolledCourses;

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={handleToggleClick}
//           disabled={isLoading}
//         >
//           {isLoading 
//             ? "Loading..." 
//             : (showAllCourses ? "Enrolled Courses" : "All Courses")
//           }
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses 
//           ? `All Courses (${coursesToDisplay.length})` 
//           : `Enrolled Courses (${coursesToDisplay.length})`
//         }
//       </h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <hr />
//       {isLoading ? (
//         <div className="text-center p-5">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <div className="row row-cols-1 row-cols-md-3 g-4">
//           {coursesToDisplay.map((course) => {
//             const isEnrolled = enrollments.some(
//               (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//             );

//             return (
//               <div key={course._id} className="col">
//                 <div className="card" style={{ width: "100%" }}>
//                   <Link
//                     to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                     className="text-decoration-none text-dark"
//                     onClick={(e) => {
//                       if (userRole !== "FACULTY" && !isEnrolled) {
//                         e.preventDefault();
//                         alert("You must be enrolled to access this course.");
//                       }
//                     }}
//                   >
//                     <img
//                       src={course.image || `/images/${course._id}.png`}
//                       alt="Course"
//                       style={{ width: "100%", height: "160px" }}
//                     />
//                     <div className="card-body">
//                       <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                       <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                       <div className="d-flex justify-content-between align-items-center">
//                         <Button variant="primary" className="btn-lg">Go</Button>
//                         {userRole === "FACULTY" ? (
//                           <div>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 deleteCourse(course._id);
//                               }}
//                               className="btn btn-danger btn-lg me-2"
//                             >
//                               Delete
//                             </button>
//                             <button
//                               onClick={(event) => {
//                                 event.preventDefault();
//                                 setNewCourse(course);
//                                 setEditMode(true);
//                               }}
//                               className="btn btn-warning btn-lg"
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         ) : (
//                           <button
//                             className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                             onClick={(e) => {
//                               e.preventDefault();
//                               toggleEnrollment(course._id);
//                             }}
//                           >
//                             {isEnrolled ? "Unenroll" : "Enroll"}
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }





// partially working

// import  { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {  Button } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   //setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
//   //const navigate = useNavigate();
//   const [showAllCourses, setShowAllCourses] = useState(false);
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   const toggleEnrollment = (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     // First update local state for responsive UI
//     if (isEnrolled) {
//       setEnrollments((prev) => {
//         return prev.filter(
//           (enrollment) => !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         );
//       });
      
//       // Then call API in background
//       axios.delete(`/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error unenrolling:", err);
//       });
//     } else {
//       setEnrollments((prev) => [
//         ...prev, 
//         { user: currentUser._id, course: courseId }
//       ]);
      
//       // Then call API in background
//       axios.post(`/api/courses/${courseId}/enroll`).catch(err => {
//         console.error("Error enrolling:", err);
//       });
//     }
//   };

//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={() => setShowAllCourses(!showAllCourses)}
//         >
//           {showAllCourses ? "Enrolled Courses" : "All Courses"}
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses ? `All Courses (${courses.length})` : `Published Courses (${userEnrolledCourses.length})`}
//       </h2>
//       <hr />
//       <div className="row row-cols-1 row-cols-md-3 g-4">
//         {(showAllCourses ? courses : userEnrolledCourses).map((course) => {
//           const isEnrolled = enrollments.some(
//             (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//           );

//           return (
//             <div key={course._id} className="col">
//               <div className="card" style={{ width: "100%" }}>
//                 <Link
//                   to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                   className="text-decoration-none text-dark"
//                   onClick={(e) => {
//                     if (userRole !== "FACULTY" && !isEnrolled) {
//                       e.preventDefault();
//                       alert("You must be enrolled to access this course.");
//                     }
//                   }}
//                 >
//                   <img
//                     src={course.image || `/images/${course._id}.png`}
//                     alt="Course"
//                     style={{ width: "100%", height: "160px" }}
//                   />
//                   <div className="card-body">
//                     <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                     <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                     <div className="d-flex justify-content-between align-items-center">
//                       <Button variant="primary" className="btn-lg">Go</Button>
//                       {userRole === "FACULTY" ? (
//                         <div>
//                           <button
//                             onClick={(event) => {
//                               event.preventDefault();
//                               deleteCourse(course._id);
//                             }}
//                             className="btn btn-danger btn-lg me-2"
//                           >
//                             Delete
//                           </button>
//                           <button
//                             onClick={(event) => {
//                               event.preventDefault();
//                               setNewCourse(course);
//                               setEditMode(true);
//                             }}
//                             className="btn btn-warning btn-lg"
//                           >
//                             Edit
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                           onClick={(e) => {
//                             e.preventDefault();
//                             toggleEnrollment(course._id);
//                           }}
//                         >
//                           {isEnrolled ? "Unenroll" : "Enroll"}
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }







// // import  { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {  Button } from "react-bootstrap";
// import { useSelector, useDispatch } from "react-redux";
// import axios from "axios";
// import { enrollCourse, unenrollCourse } from "./actions";
// import { useEffect, useState } from "react";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   //setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
//   const dispatch = useDispatch();
//   //const navigate = useNavigate();
//   const [showAllCourses, setShowAllCourses] = useState(false);
  
//   // Start with localStorage for enrollments (as in your original code)
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

//   // Fetch server-side enrollments on mount
//   useEffect(() => {
//     const fetchEnrollments = async () => {
//       try {
//         // Only fetch if we have a currentUser
//         if (currentUser && currentUser._id) {
//           const response = await axios.get(`/api/users/${currentUser._id}/enrollments`);
//           if (response.data && Array.isArray(response.data)) {
//             // Update local state with server data
//             setEnrollments(response.data);
//             // Also update localStorage for backward compatibility
//             localStorage.setItem("enrollments", JSON.stringify(response.data));
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching enrollments:", error);
//         // If API fails, we still have localStorage data as fallback
//       }
//     };

//     fetchEnrollments();
//   }, [currentUser]);

//   // Keep localStorage in sync with state (as in your original code)
//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   const toggleEnrollment = async (courseId: string) => {
//     const isEnrolled = enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//     );

//     try {
//       if (isEnrolled) {
//         // Unenroll from course
//         await axios.delete(`/api/courses/${courseId}/enroll`);
        
//         // Update local state (as before)
//         setEnrollments((prev) => {
//           return prev.filter(
//             (enrollment) => !(enrollment.user === currentUser._id && enrollment.course === courseId)
//           );
//         });
        
//         // Update Redux if needed
//         dispatch(unenrollCourse(currentUser._id, courseId));
//       } else {
//         // Enroll in course
//         const response = await axios.post(`/api/courses/${courseId}/enroll`);
//         const newEnrollment = response.data;
        
//         // Update local state (as before)
//         setEnrollments((prev) => [...prev, newEnrollment]);
        
//         // Update Redux if needed
//         dispatch(enrollCourse(currentUser._id, courseId));
//       }
//     } catch (error) {
//       console.error("Error toggling enrollment:", error);
      
//       // Fallback to local-only toggle if API fails
//       if (isEnrolled) {
//         setEnrollments((prev) => {
//           return prev.filter(
//             (enrollment) => !(enrollment.user === currentUser._id && enrollment.course === courseId)
//           );
//         });
//       } else {
//         setEnrollments((prev) => [
//           ...prev, 
//           { user: currentUser._id, course: courseId }
//         ]);
//       }
//     }
//   };

//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={() => setShowAllCourses(!showAllCourses)}
//         >
//           {showAllCourses ? "Enrolled Courses" : "All Courses"}
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses ? `All Courses (${courses.length})` : `Published Courses (${userEnrolledCourses.length})`}
//       </h2>
//       <hr />
//       <div className="row row-cols-1 row-cols-md-3 g-4">
//         {(showAllCourses ? courses : userEnrolledCourses).map((course) => {
//           const isEnrolled = enrollments.some(
//             (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//           );

//           return (
//             <div key={course._id} className="col">
//               <div className="card" style={{ width: "100%" }}>
//                 <Link
//                   to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                   className="text-decoration-none text-dark"
//                   onClick={(e) => {
//                     if (userRole !== "FACULTY" && !isEnrolled) {
//                       e.preventDefault();
//                       alert("You must be enrolled to access this course.");
//                     }
//                   }}
//                 >
//                   <img
//                     src={course.image || `/images/${course._id}.png`}
//                     alt="Course"
//                     style={{ width: "100%", height: "160px" }}
//                   />
//                   <div className="card-body">
//                     <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                     <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                     <div className="d-flex justify-content-between align-items-center">
//                       <Button variant="primary" className="btn-lg">Go</Button>
//                       {userRole === "FACULTY" ? (
//                         <div>
//                           <button
//                             onClick={(event) => {
//                               event.preventDefault();
//                               deleteCourse(course._id);
//                             }}
//                             className="btn btn-danger btn-lg me-2"
//                           >
//                             Delete
//                           </button>
//                           <button
//                             onClick={(event) => {
//                               event.preventDefault();
//                               setNewCourse(course);
//                               setEditMode(true);
//                             }}
//                             className="btn btn-warning btn-lg"
//                           >
//                             Edit
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                           onClick={(e) => {
//                             e.preventDefault();
//                             toggleEnrollment(course._id);
//                           }}
//                         >
//                           {isEnrolled ? "Unenroll" : "Enroll"}
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }










// import  { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {  Button } from "react-bootstrap";
// import { useSelector } from "react-redux";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setCourses: (courses: Course[]) => void;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   //setCourses,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const userRole = currentUser.role;
//   //const navigate = useNavigate();
//   const [showAllCourses, setShowAllCourses] = useState(false);
//   const [enrollments, setEnrollments] = useState<Array<{ user: string; course: string }>>(() => {
//     return JSON.parse(localStorage.getItem("enrollments") || "[]");
//   });

  

//   useEffect(() => {
//     localStorage.setItem("enrollments", JSON.stringify(enrollments));
//   }, [enrollments]);

//   const toggleEnrollment = (courseId: string) => {
//     setEnrollments((prev) => {
//       const isEnrolled = prev.some(
//         (enrollment) => enrollment.user === currentUser._id && enrollment.course === courseId
//       );
//       if (isEnrolled) {
//         return prev.filter(
//           (enrollment) => !(enrollment.user === currentUser._id && enrollment.course === courseId)
//         );
//       } else {
//         return [...prev, { user: currentUser._id, course: courseId }];
//       }
//     });
//   };

//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={() => setShowAllCourses(!showAllCourses)}
//         >
//           {showAllCourses ? "Enrolled Courses" : "All Courses"}
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses ? `All Courses (${courses.length})` : `Published Courses (${userEnrolledCourses.length})`}
//       </h2>
//       <hr />
//       <div className="row row-cols-1 row-cols-md-3 g-4">
//         {(showAllCourses ? courses : userEnrolledCourses).map((course) => {
//           const isEnrolled = enrollments.some(
//             (enrollment) => enrollment.user === currentUser._id && enrollment.course === course._id
//           );

//           return (
//             <div key={course._id} className="col">
//               <div className="card" style={{ width: "100%" }}>
//                 <Link
//                   to={userRole === "FACULTY" ? `/Kambaz/Courses/${course._id}/Home` : (isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#")}
//                   className="text-decoration-none text-dark"
//                   onClick={(e) => {
//                     if (userRole !== "FACULTY" && !isEnrolled) {
//                       e.preventDefault();
//                       alert("You must be enrolled to access this course.");
//                     }
//                   }}
//                 >
//                   <img
//                     src={course.image || `/images/${course._id}.png`}
//                     alt="Course"
//                     style={{ width: "100%", height: "160px" }}
//                   />
//                   <div className="card-body">
//                     <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                     <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                     <div className="d-flex justify-content-between align-items-center">
//                       <Button variant="primary" className="btn-lg">Go</Button>
//                       {userRole === "FACULTY" ? (
//                         <div>
//                           <button
//                             onClick={(event) => {
//                               event.preventDefault();
//                               deleteCourse(course._id);
//                             }}
//                             className="btn btn-danger btn-lg me-2"
//                           >
//                             Delete
//                           </button>
//                           <button
//                             onClick={(event) => {
//                               event.preventDefault();
//                               setNewCourse(course);
//                               setEditMode(true);
//                             }}
//                             className="btn btn-warning btn-lg"
//                           >
//                             Edit
//                           </button>
//                         </div>
//                       ) : (
//                         <button
//                           className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                           onClick={(e) => {
//                             e.preventDefault();
//                             toggleEnrollment(course._id);
//                           }}
//                         >
//                           {isEnrolled ? "Unenroll" : "Enroll"}
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


















// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector, useDispatch } from "react-redux";
// import { enrollCourse, unenrollCourse } from "./actions";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const dispatch = useDispatch();
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const { enrollments } = useSelector((state: any) => state.enrollmentReducer);
//   const userRole = currentUser.role;
//   const [showAllCourses, setShowAllCourses] = useState(false);
//   const [loading, setLoading] = useState(false);
  
//   // Fetch user enrollments when component mounts
//   useEffect(() => {
//     const fetchEnrollments = async () => {
//       try {
//         console.log("Fetching enrollments for user:", currentUser._id);
        
//         // Include credentials to maintain session
//         const response = await axios.get(`/api/users/${currentUser._id}/enrollments`, {
//           withCredentials: true,
//           headers: {
//             'Content-Type': 'application/json',
//             // Add CSRF token if your server requires it
//             // 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
//           }
//         });
        
//         console.log("Enrollments received:", response.data);
        
//         // For each enrollment, dispatch the enrollCourse action to update Redux state
//         response.data.forEach((enrollment: any) => {
//           dispatch(enrollCourse(enrollment.user, enrollment.course));
//         });
//       } catch (error) {
//         console.error("Error fetching enrollments:", error);
//       }
//     };
    
//     if (currentUser && currentUser._id) {
//       fetchEnrollments();
//     }
//   }, [currentUser, dispatch]);

//   // Handle enrollment toggle
//   const handleEnroll = async (courseId: string, e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setLoading(true);
    
//     try {
//       console.log("Enrolling user in course:", courseId);
      
//       // Include credentials to maintain session
//       const response = await axios.post(`/api/courses/${courseId}/enroll`, {}, {
//         withCredentials: true,
//         headers: {
//           'Content-Type': 'application/json',
//           // Add CSRF token if your server requires it
//           // 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
//         }
//       });
      
//       console.log("Enrollment response:", response.data);
      
//       if (response.status === 200) {
//         // Update Redux state on success
//         dispatch(enrollCourse(currentUser._id, courseId));
//         console.log("Redux state updated for enrollment");
//       } else {
//         console.error("Server returned non-200 status:", response.status);
//         alert(`Enrollment failed: ${response.data.message || 'Unknown error'}`);
//       }
//     } catch (error: any) {
//       console.error("Error enrolling in course:", error);
//       const errorMessage = error.response?.data?.message || "Failed to enroll in the course. Please try again.";
//       alert(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Handle unenrollment
//   const handleUnenroll = async (courseId: string, e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setLoading(true);
    
//     try {
//       console.log("Unenrolling user from course:", courseId);
      
//       // Include credentials to maintain session
//       const response = await axios.delete(`/api/courses/${courseId}/enroll`, {
//         withCredentials: true,
//         headers: {
//           'Content-Type': 'application/json',
//           // Add CSRF token if your server requires it
//           // 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
//         }
//       });
      
//       console.log("Unenrollment response:", response.data);
      
//       if (response.status === 200) {
//         // Update Redux state on success
//         dispatch(unenrollCourse(currentUser._id, courseId));
//         console.log("Redux state updated for unenrollment");
//       } else {
//         console.error("Server returned non-200 status:", response.status);
//         alert(`Unenrollment failed: ${response.data.message || 'Unknown error'}`);
//       }
//     } catch (error: any) {
//       console.error("Error unenrolling from course:", error);
//       const errorMessage = error.response?.data?.message || "Failed to unenroll from the course. Please try again.";
//       alert(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter courses based on enrollment
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Determine which courses to display
//   const displayedCourses = showAllCourses ? courses : userEnrolledCourses;

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={() => setShowAllCourses(!showAllCourses)}
//         >
//           {showAllCourses ? "Enrolled Courses" : "All Courses"}
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses ? `All Courses (${courses.length})` : `Enrolled Courses (${userEnrolledCourses.length})`}
//       </h2>
//       <hr />
//       <div className="row row-cols-1 row-cols-md-3 g-4">
//         {displayedCourses.map((course) => {
//           const isEnrolled = enrollments.some(
//             (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
//           );

//           return (
//             <div key={course._id} className="col">
//               <div className="card" style={{ width: "100%" }}>
//                 <img
//                   src={course.image || `/images/${course._id}.png`}
//                   alt="Course"
//                   style={{ width: "100%", height: "160px" }}
//                 />
//                 <div className="card-body">
//                   <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                   <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <Link
//                       to={userRole === "FACULTY" || isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#"}
//                       onClick={(e) => {
//                         if (userRole !== "FACULTY" && !isEnrolled) {
//                           e.preventDefault();
//                           alert("You must be enrolled to access this course.");
//                         }
//                       }}
//                     >
//                       <Button variant="primary" className="btn-lg">Go</Button>
//                     </Link>
                    
//                     {userRole === "FACULTY" ? (
//                       <div>
//                         <button
//                           onClick={(event) => {
//                             event.preventDefault();
//                             deleteCourse(course._id);
//                           }}
//                           className="btn btn-danger btn-lg me-2"
//                         >
//                           Delete
//                         </button>
//                         <button
//                           onClick={(event) => {
//                             event.preventDefault();
//                             setNewCourse(course);
//                             setEditMode(true);
//                           }}
//                           className="btn btn-warning btn-lg"
//                         >
//                           Edit
//                         </button>
//                       </div>
//                     ) : (
//                       <button
//                         className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                         onClick={(e) => isEnrolled ? handleUnenroll(course._id, e) : handleEnroll(course._id, e)}
//                         disabled={loading}
//                       >
//                         {loading ? "Processing..." : (isEnrolled ? "Unenroll" : "Enroll")}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }











// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Button } from "react-bootstrap";
// import { useSelector, useDispatch } from "react-redux";
// import { enrollCourse, unenrollCourse } from "./actions";
// import axios from "axios";

// // Define the type for a course
// interface Course {
//   _id: string;
//   name: string;
//   description: string;
//   image?: string;
// }

// // Define the props interface for the Dashboard component
// interface DashboardProps {
//   courses: Course[];
//   newCourse: Course;
//   editMode: boolean;
//   setNewCourse: (course: Course) => void;
//   setEditMode: (editMode: boolean) => void;
//   addNewCourse: () => void;
//   deleteCourse: (courseId: string) => void;
//   updateCourse: () => void;
// }

// export default function Dashboard({
//   courses,
//   newCourse,
//   editMode,
//   setNewCourse,
//   setEditMode,
//   addNewCourse,
//   deleteCourse,
//   updateCourse,
// }: DashboardProps) {
//   const dispatch = useDispatch();
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const { enrollments } = useSelector((state: any) => state.enrollmentReducer);
//   const userRole = currentUser.role;
//   const [showAllCourses, setShowAllCourses] = useState(false);
//   const [loading, setLoading] = useState(false);
  
//   // Fetch user enrollments when component mounts
//   useEffect(() => {
//     const fetchEnrollments = async () => {
//       try {
//         console.log("Fetching enrollments for user:", currentUser._id);
//         const response = await axios.get(`/api/users/${currentUser._id}/enrollments`);
//         console.log("Enrollments received:", response.data);
        
//         // For each enrollment, dispatch the enrollCourse action to update Redux state
//         response.data.forEach((enrollment: any) => {
//           dispatch(enrollCourse(enrollment.user, enrollment.course));
//         });
//       } catch (error) {
//         console.error("Error fetching enrollments:", error);
//       }
//     };
    
//     if (currentUser && currentUser._id) {
//       fetchEnrollments();
//     }
//   }, [currentUser, dispatch]);

//   // Handle enrollment toggle
//   const handleEnroll = async (courseId: string, e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setLoading(true);
    
//     try {
//       console.log("Enrolling user in course:", courseId);
//       const response = await axios.post(`/api/courses/${courseId}/enroll`);
//       console.log("Enrollment response:", response.data);
      
//       // Update Redux state
//       dispatch(enrollCourse(currentUser._id, courseId));
//     } catch (error) {
//       console.error("Error enrolling in course:", error);
//       alert("Failed to enroll in the course. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Handle unenrollment
//   const handleUnenroll = async (courseId: string, e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setLoading(true);
    
//     try {
//       console.log("Unenrolling user from course:", courseId);
//       const response = await axios.delete(`/api/courses/${courseId}/enroll`);
//       console.log("Unenrollment response:", response.data);
      
//       // Update Redux state
//       dispatch(unenrollCourse(currentUser._id, courseId));
//     } catch (error) {
//       console.error("Error unenrolling from course:", error);
//       alert("Failed to unenroll from the course. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter courses based on enrollment
//   const userEnrolledCourses = courses.filter((course) =>
//     enrollments.some(
//       (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
//     )
//   );

//   // Determine which courses to display
//   const displayedCourses = showAllCourses ? courses : userEnrolledCourses;

//   return (
//     <div className="p-4" id="wd-dashboard">
//       <div className="d-flex justify-content-between align-items-center">
//         <h1 id="wd-dashboard-title">Dashboard</h1>
//         <button
//           className="btn btn-primary"
//           onClick={() => setShowAllCourses(!showAllCourses)}
//         >
//           {showAllCourses ? "Enrolled Courses" : "All Courses"}
//         </button>
//       </div>
//       <hr />
//       {userRole === "FACULTY" && (
//         <div className="d-flex align-items-start mb-3">
//           <h5 className="me-3">{editMode ? "Edit Course" : "New Course"}</h5>
//           <div className="flex-grow-1">
//             <input
//               type="text"
//               className="form-control mb-2"
//               value={newCourse.name}
//               onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
//             />
//             <textarea
//               className="form-control"
//               rows={3}
//               value={newCourse.description}
//               onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
//             />
//           </div>
//           {editMode ? (
//             <button className="btn btn-warning ms-3" onClick={updateCourse}>Update</button>
//           ) : (
//             <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
//           )}
//         </div>
//       )}
//       <hr />
//       <h2 id="wd-dashboard-published">
//         {showAllCourses ? `All Courses (${courses.length})` : `Enrolled Courses (${userEnrolledCourses.length})`}
//       </h2>
//       <hr />
//       <div className="row row-cols-1 row-cols-md-3 g-4">
//         {displayedCourses.map((course) => {
//           const isEnrolled = enrollments.some(
//             (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
//           );

//           return (
//             <div key={course._id} className="col">
//               <div className="card" style={{ width: "100%" }}>
//                 <img
//                   src={course.image || `/images/${course._id}.png`}
//                   alt="Course"
//                   style={{ width: "100%", height: "160px" }}
//                 />
//                 <div className="card-body">
//                   <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
//                   <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
//                   <div className="d-flex justify-content-between align-items-center">
//                     <Link
//                       to={userRole === "FACULTY" || isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#"}
//                       onClick={(e) => {
//                         if (userRole !== "FACULTY" && !isEnrolled) {
//                           e.preventDefault();
//                           alert("You must be enrolled to access this course.");
//                         }
//                       }}
//                     >
//                       <Button variant="primary" className="btn-lg">Go</Button>
//                     </Link>
                    
//                     {userRole === "FACULTY" ? (
//                       <div>
//                         <button
//                           onClick={(event) => {
//                             event.preventDefault();
//                             deleteCourse(course._id);
//                           }}
//                           className="btn btn-danger btn-lg me-2"
//                         >
//                           Delete
//                         </button>
//                         <button
//                           onClick={(event) => {
//                             event.preventDefault();
//                             setNewCourse(course);
//                             setEditMode(true);
//                           }}
//                           className="btn btn-warning btn-lg"
//                         >
//                           Edit
//                         </button>
//                       </div>
//                     ) : (
//                       <button
//                         className={`btn btn-lg ${isEnrolled ? "btn-danger" : "btn-success"}`}
//                         onClick={(e) => isEnrolled ? handleUnenroll(course._id, e) : handleEnroll(course._id, e)}
//                         disabled={loading}
//                       >
//                         {loading ? "Processing..." : (isEnrolled ? "Unenroll" : "Enroll")}
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }






