import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { enrollCourse, unenrollCourse } from "./actions";
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
  setNewCourse: (course: Course) => void;
  setEditMode: (editMode: boolean) => void;
  addNewCourse: () => void;
  deleteCourse: (courseId: string) => void;
  updateCourse: () => void;
}

export default function Dashboard({
  courses,
  newCourse,
  editMode,
  setNewCourse,
  setEditMode,
  addNewCourse,
  deleteCourse,
  updateCourse,
}: DashboardProps) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const { enrollments } = useSelector((state: any) => state.enrollmentReducer);
  const userRole = currentUser.role;
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Fetch user enrollments when component mounts
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        console.log("Fetching enrollments for user:", currentUser._id);
        
        // Include credentials to maintain session
        const response = await axios.get(`/api/users/${currentUser._id}/enrollments`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            // Add CSRF token if your server requires it
            // 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
          }
        });
        
        console.log("Enrollments received:", response.data);
        
        // For each enrollment, dispatch the enrollCourse action to update Redux state
        response.data.forEach((enrollment: any) => {
          dispatch(enrollCourse(enrollment.user, enrollment.course));
        });
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      }
    };
    
    if (currentUser && currentUser._id) {
      fetchEnrollments();
    }
  }, [currentUser, dispatch]);

  // Handle enrollment toggle
  const handleEnroll = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    
    try {
      console.log("Enrolling user in course:", courseId);
      
      // Include credentials to maintain session
      const response = await axios.post(`/api/courses/${courseId}/enroll`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          // Add CSRF token if your server requires it
          // 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });
      
      console.log("Enrollment response:", response.data);
      
      if (response.status === 200) {
        // Update Redux state on success
        dispatch(enrollCourse(currentUser._id, courseId));
        console.log("Redux state updated for enrollment");
      } else {
        console.error("Server returned non-200 status:", response.status);
        alert(`Enrollment failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      const errorMessage = error.response?.data?.message || "Failed to enroll in the course. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle unenrollment
  const handleUnenroll = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    
    try {
      console.log("Unenrolling user from course:", courseId);
      
      // Include credentials to maintain session
      const response = await axios.delete(`/api/courses/${courseId}/enroll`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          // Add CSRF token if your server requires it
          // 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });
      
      console.log("Unenrollment response:", response.data);
      
      if (response.status === 200) {
        // Update Redux state on success
        dispatch(unenrollCourse(currentUser._id, courseId));
        console.log("Redux state updated for unenrollment");
      } else {
        console.error("Server returned non-200 status:", response.status);
        alert(`Unenrollment failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error("Error unenrolling from course:", error);
      const errorMessage = error.response?.data?.message || "Failed to unenroll from the course. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on enrollment
  const userEnrolledCourses = courses.filter((course) =>
    enrollments.some(
      (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
    )
  );

  // Determine which courses to display
  const displayedCourses = showAllCourses ? courses : userEnrolledCourses;

  return (
    <div className="p-4" id="wd-dashboard">
      <div className="d-flex justify-content-between align-items-center">
        <h1 id="wd-dashboard-title">Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAllCourses(!showAllCourses)}
        >
          {showAllCourses ? "Enrolled Courses" : "All Courses"}
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
            <button className="btn btn-primary ms-3" onClick={addNewCourse}>Add</button>
          )}
        </div>
      )}
      <hr />
      <h2 id="wd-dashboard-published">
        {showAllCourses ? `All Courses (${courses.length})` : `Enrolled Courses (${userEnrolledCourses.length})`}
      </h2>
      <hr />
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {displayedCourses.map((course) => {
          const isEnrolled = enrollments.some(
            (enrollment: any) => enrollment.user === currentUser._id && enrollment.course === course._id
          );

          return (
            <div key={course._id} className="col">
              <div className="card" style={{ width: "100%" }}>
                <img
                  src={course.image || `/images/${course._id}.png`}
                  alt="Course"
                  style={{ width: "100%", height: "160px" }}
                />
                <div className="card-body">
                  <h5 className="card-title text-nowrap overflow-hidden">{course.name}</h5>
                  <p className="card-text overflow-hidden" style={{ height: "100px" }}>{course.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <Link
                      to={userRole === "FACULTY" || isEnrolled ? `/Kambaz/Courses/${course._id}/Home` : "#"}
                      onClick={(e) => {
                        if (userRole !== "FACULTY" && !isEnrolled) {
                          e.preventDefault();
                          alert("You must be enrolled to access this course.");
                        }
                      }}
                    >
                      <Button variant="primary" className="btn-lg">Go</Button>
                    </Link>
                    
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
                        onClick={(e) => isEnrolled ? handleUnenroll(course._id, e) : handleEnroll(course._id, e)}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : (isEnrolled ? "Unenroll" : "Enroll")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}











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




