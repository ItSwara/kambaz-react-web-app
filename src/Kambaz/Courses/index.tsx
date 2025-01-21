import { Routes, Route, Navigate } from "react-router";
import CourseNavigation from "./Navigation";
import Modules from "./Modules";
import Home from "./Home";
import Assignments from "./Assignments";


export default function Courses() {
    return (
      <div id="wd-courses" style={{ textAlign: "left" }}>
        <h2>Course 1234</h2>
        <hr />
      <table>
        <tr>
          <td valign="top">
            <CourseNavigation />
          </td>
          <td valign="top">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="Home" element={<h2>Home</h2>} />
              <Route path="Modules" element={<Modules />} />
              <Route path="Assignments" element={<Assignments/>} />
              <Route path="Assignments/:aid" element={<h2>Assignment Editor</h2>} />
              <Route path="People" element={<h2>People</h2>} />
            </Routes>
          </td>
        </tr>
      </table>

      </div>
  );}
  
  