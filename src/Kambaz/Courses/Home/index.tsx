import Modules from "../Modules";
import CourseStatus from "./Status";

export default function Home() {
  return (
    <div className="d-flex w-100 justify-content-between align-items-start" id="wd-home">
      <div className="flex-fill pe-3">
        <Modules />
      </div>
      <div className="d-none d-xl-block flex-shrink-0">
        <CourseStatus />
      </div>
    </div>
  )
}