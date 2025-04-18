import { Routes, Route  } from "react-router";
import CourseNavigation from "./Navigation";
import Modules from "./Modules";
import Home from "./Home";
import Assignments from "./Assignments";
import AssignmentEditor from "./Assignments/Editor";
import { FaAlignJustify } from "react-icons/fa";
import PeopleTable from "./People/Table";
import {  useParams ,useLocation} from "react-router";
import Quizzes from "./Quizzes";
import QuizDetails from "./Quizzes/QuizDetails";




export default function Courses({ courses }: { courses: any[]; }) {
  const { cid } = useParams();
  const course = courses.find((course) => course._id === cid);
  const { pathname } = useLocation();
  const debug = course
  console.log ("courseObj", debug);
    return (
      <div id="wd-courses" >
        <h2 className="text-danger d-flex align-items-center">
        <FaAlignJustify className="me-4 fs-4 mb-1" />
        {course && course.name} &gt; {pathname.split("/")[4]} </h2>

        <div className="d-flex">
    <div className="d-none d-md-block">

            <CourseNavigation/>
          </div>
            <div className="text-start"
             
             >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="Home" element={<Home/>} />
              <Route path="Modules" element={<Modules />} />
              <Route path="Assignments" element={<Assignments/>} />
              <Route path="Assignments/:aid" element={<AssignmentEditor />} />
              <Route path="People"  element={<PeopleTable />}  />
              <Route path = "Quizzes/*" element={<Quizzes/>} />
              <Route path="Quizzes/:qid" element={<QuizDetails />} />
            </Routes>
            </div>
            </div>

      </div>
  );}
  

