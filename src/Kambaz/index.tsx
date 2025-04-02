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
import { Course } from "./Courses/reducer";

export default function Kambaz() {
  const [courses, setCourses] = useState<any[]>([]);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const fetchCourses = async () => {
    try {
      const courses = await userClient.findMyCourses();
      setCourses(courses);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchCourses();
  }, [currentUser]);

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

  // Event handler functions moved from Dashboard
  const deleteCourse = async(courseId: string) => {
    //const status = await courseClient.deleteCourse(courseId);
    setCourses(
      courses.filter((course: { _id: string }) => course._id !== courseId)
    );
  };

  const updateCourse = async() => {
    await courseClient.updateCourse(newCourse);
    setCourses(
      courses.map((c: { _id: any }) =>
        c._id === newCourse._id ? newCourse : c
      )
    );
    // Reset form and exit edit mode
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
  };

  const addNewCourse = async () => {
    try {
      const newCourseCreated = await userClient.createCourse(newCourse);
      setCourses((prevCourses) => [...prevCourses, newCourseCreated]);
      setNewCourse({
        _id: "0",
        name: "",
        number: "",
        startDate: "",
        endDate: "",
        image: "/images/reactjs.jpg",
        description: "",
      });
    } catch (error) {
      console.error("Error creating course:", error);
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
                  //setCourses={setCourses}
                  setNewCourse={setNewCourse}
                  setEditMode={setEditMode}
                  addNewCourse={addNewCourse}
                  deleteCourse={deleteCourse}
                  updateCourse={updateCourse} setCourses={function (_courses: Course[]): void {
                    throw new Error("Function not implemented.");
                  } }              />
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
