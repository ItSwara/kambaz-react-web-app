// import LessonControlButtons from "./LessonControlButtons";
// import ModuleControlButtons from "./ModuleControlButtons";
// import ModulesControls from "./ModulesControls";
// import { BsGripVertical } from "react-icons/bs";
// import { useParams } from "react-router";
// import * as db from "../../Database";

// export default function Modules() {
//     return (
//         <div className="container p-0" >
//             <ModulesControls />
//             <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
//                 <li className="wd-module list-group-item p-0 mb-5 fs-5 border-gray">
//                     <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center">
//                         <BsGripVertical className="me-2 fs-3" />
//                         <span>Week 1</span>
//                         <ModuleControlButtons />
//                     </div>
//                     <ul className="wd-lessons list-group rounded-0">
//                         <li className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
//                             <BsGripVertical className="me-2 fs-3" />
//                             <span>LEARNING OBJECTIVES</span>
//                             <LessonControlButtons />
//                         </li>
//                         <li className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
//                             <BsGripVertical className="me-2 fs-3" />
//                             <span>Introduction to the course</span>
//                             <LessonControlButtons />
//                         </li>
//                         <li className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
//                             <BsGripVertical className="me-2 fs-3" />
//                             <span>Learn what is Web Development</span>
//                             <LessonControlButtons />
//                         </li>
//                         <li className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
//                             <BsGripVertical className="me-2 fs-3" />
//                             <span>LESSON 1</span>
//                             <LessonControlButtons />
//                         </li>
//                         <li className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
//                             <BsGripVertical className="me-2 fs-3" />
//                             <span>LESSON 2</span>
//                             <LessonControlButtons />
//                         </li>
//                     </ul>
//                 </li>
//                 <li className="wd-module list-group-item p-0 mb-5 fs-5 border-gray">
//                     <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center">
//                         <BsGripVertical className="me-2 fs-3" />
//                         <span>Week 2</span>
//                         <ModuleControlButtons />
//                     </div>
//                     <ul className="wd-lessons list-group rounded-0">
//                         <li className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
//                             <BsGripVertical className="me-2 fs-3" />
//                             <span>LEARNING OBJECTIVES</span>
//                             <LessonControlButtons />
//                         </li>
//                         <li className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
//                             <BsGripVertical className="me-2 fs-3" />
//                             <span>LESSON 1</span>
//                             <LessonControlButtons />
//                         </li>
//                         <li className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
//                             <BsGripVertical className="me-2 fs-3" />
//                             <span>LESSON 2</span>
//                             <LessonControlButtons />
//                         </li>
//                     </ul>
//                 </li>
//             </ul>
//         </div>
//     );
// }


// import LessonControlButtons from "./LessonControlButtons";
// import ModuleControlButtons from "./ModuleControlButtons";
// import ModulesControls from "./ModulesControls";
// import { BsGripVertical } from "react-icons/bs";
// import { useParams } from "react-router";
// import * as db from "../../Database";

// export default function Modules() {
//     const { cid } = useParams();
//     const modules = db.modules;
    
//     return (
//         <div className="container p-0" >
//             <ModulesControls />
//             <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
//                 <li className="wd-module list-group-item p-0 mb-5 fs-5 border-gray">
//                     <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center">
//                         <BsGripVertical className="me-2 fs-3" />
//                         <span>Week 1</span>
//                         <ModuleControlButtons />
//                     </div>
//                     <ul className="wd-lessons list-group rounded-0">
//                         {modules
//                             .filter((module) => module.course === cid)
//                             .map((module) => (
//                                 module.lessons?.map((lesson) => (
//                                     <li key={lesson._id} className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
//                                         <BsGripVertical className="me-2 fs-3" />
//                                         <span>{lesson.name}</span>
//                                         <LessonControlButtons />
//                                     </li>
//                                 ))
//                             ))}
//                     </ul>
//                 </li>
//             </ul>
//         </div>
//     );
// }



import LessonControlButtons from "./LessonControlButtons";
import ModuleControlButtons from "./ModuleControlButtons";
import ModulesControls from "./ModulesControls";
import { BsGripVertical } from "react-icons/bs";
import { useParams } from "react-router";
import * as db from "../../Database";

export default function Modules() {
    const { cid } = useParams();
    const modules = db.modules;
    
    return (
        <div className="container p-0" >
            <ModulesControls />
            <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
                {modules
                    .filter((module) => module.course === cid)
                    .map((module) => (
                        <li key={module._id} className="wd-module list-group-item p-0 mb-5 fs-5 border-gray">
                            <div className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center">
                                <BsGripVertical className="me-2 fs-3" />
                                <span>{module.name}</span>
                                <ModuleControlButtons />
                            </div>
                            {module.lessons && (
                                <ul className="wd-lessons list-group rounded-0">
                                    {module.lessons.map((lesson) => (
                                        <li key={lesson._id} 
                                            className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center">
                                            <BsGripVertical className="me-2 fs-3" />
                                            <span>{lesson.name}</span>
                                            <LessonControlButtons />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
            </ul>
        </div>
    );
}
