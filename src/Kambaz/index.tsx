import { Routes, Route, Navigate } from "react-router";
import Account from "./Account";
import Dashboard from "./Dashboard/Dashboard";
import Courses from "./Courses";
import "./style.css";
import KambazNavigation from "./Navigation";
import * as db from "./Database";
import { useState } from "react";
import ProtectedRoute from "./Account/ProtectedRoute";

export default function Kambaz() {
  const [courses, setCourses] = useState<any[]>(db.courses);
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
  const deleteCourse = (courseId: string) => {
    setCourses(
      courses.filter((course: { _id: string }) => course._id !== courseId)
    );
  };

  const updateCourse = () => {
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

  const addNewCourse = () => {
    const newCourseWithId = { ...newCourse, _id: Date.now().toString() };
    setCourses([...courses, newCourseWithId]);
    setNewCourse({
      _id: "0",
      name: "",
      number: "",
      startDate: "",
      endDate: "",
      image: "/images/reactjs.jpg",
      description: "",
    });
  };
  return (
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
  );
}
