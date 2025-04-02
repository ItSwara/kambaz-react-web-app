import React, { useState , useEffect} from "react";
import LessonControlButtons from "./LessonControlButtons";
import ModuleControlButtons from "./ModuleControlButtons";
import ModulesControls from "./ModulesControls";
import { BsGripVertical } from "react-icons/bs";
import { useParams } from "react-router";
import { FormControl } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { setModules,addModule, deleteModule, updateModule, editModule } from "./reducer";
import * as coursesClient from "../client";
import * as modulesClient from "./client";


export default function Modules() {
    const { cid } = useParams();
    const [moduleName, setModuleName] = useState("");
    const { modules } = useSelector((state: any) => state.modulesReducer);
    const dispatch = useDispatch();

    // const saveModule = async (module: any) => {
    //   await modulesClient.updateModule(module);
    //   dispatch(updateModule(module));
    // };

    const saveModule = async (module: any) => {
      try {
        // Update module on the server
        const updatedModule = await modulesClient.updateModule(module);
    
        // Dispatch the updated module to the store only if it is successfully updated
        if (updatedModule) {
          dispatch(updateModule(updatedModule));
        }
      } catch (error) {
        console.error("Error saving module:", error);
      }
    };
  
    const removeModule = async (moduleId: string) => {
      await modulesClient.deleteModule(moduleId);
      dispatch(deleteModule(moduleId));
    };
  
    const createModuleForCourse = async () => {
      if (!cid) return;
      const newModule = { name: moduleName, course: cid };
      const module = await coursesClient.createModuleForCourse(cid, newModule);
      dispatch(addModule(module));
    };
  
    const fetchModules = async () => {
      const modules = await coursesClient.findModulesForCourse(cid as string);
      dispatch(setModules(modules));
    };
    useEffect(() => {
      fetchModules();
    }, []);
  
  
    return (
      <div className="container p-0">
        <ModulesControls
          moduleName={moduleName}
          setModuleName={setModuleName}
          addModule={createModuleForCourse}
        />
        <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
          {modules
            //.filter((module: any) => module.course === cid)
            .map((module: any) => (
              <li
                key={module._id}
                className="wd-module list-group-item p-0 mb-5 fs-5 border-gray"
              >
                <div
                  style={{
                    width: "100%", // Adjust width as needed
                    whiteSpace: "nowrap", // Prevent text wrapping
                    overflow: "hidden", // Hide overflowing text
                    textOverflow: "ellipsis", // Add ellipsis if text overflows
                  }}
                  className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center"
                >
                  <BsGripVertical className="me-2 fs-5" />
                  {!module.editing && module.name}
                  {module.editing && (
                    <FormControl
                      className="w-50 d-inline-block"
                      onChange={(e) =>
                        dispatch(
                          updateModule({ ...module, name: e.target.value })
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveModule({ ...module, editing: false });
                        }
                      }}
                      defaultValue={module.name}
                    />
                  )}
                  <ModuleControlButtons
                    moduleId={module._id}
                    deleteModule={(moduleId) => removeModule(moduleId)}
                    editModule={(moduleId) => dispatch(editModule(moduleId))}
                  />
                </div>
                {module.lessons && (
                  <ul className="wd-lessons list-group rounded-0">
                    {module.lessons.map(
                      (lesson: {
                        _id: React.Key | null | undefined;
                        name:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | null
                          | undefined;
                      }) => (
                        <li
                          key={lesson._id}
                          className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center"
                        >
                          <BsGripVertical className="me-2 fs-3" />
                          <span>{lesson.name}</span>
                          <LessonControlButtons />
                        </li>
                      )
                    )}
                  </ul>
                )}
              </li>
            ))}
        </ul>
      </div>
    );
  }
  



// export default function Modules() {
//   const { cid } = useParams();
//   const [modules, setModules] = useState<any[]>(db.modules);
//   const [moduleName, setModuleName] = useState("");
//   const addModule = () => {
//     setModules([
//       ...modules,
//       { _id: uuidv4(), name: moduleName, course: cid, lessons: [] },
//     ]);
//     setModuleName("");
//   };
//   const deleteModule = (moduleId: string) => {
//     setModules(modules.filter((m) => m._id !== moduleId));
//   };
//   const editModule = (moduleId: string) => {
//     setModules(
//       modules.map((m) => (m._id === moduleId ? { ...m, editing: true } : m))
//     );
//   };
//   const updateModule = (module: any) => {
//     setModules(modules.map((m) => (m._id === module._id ? module : m)));
//   };

//   return (
//     <div className="container p-0">
//       <ModulesControls
//         setModuleName={setModuleName}
//         moduleName={moduleName}
//         addModule={addModule}
//       />
//       <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
//         {modules
//           .filter((module) => module.course === cid)
//           .map((module) => (
//             <li
//               key={module._id}
//               className="wd-module list-group-item p-0 mb-5 fs-5 border-gray"
//             >
//               <div
//                 style={{
//                   width: "100%", // Adjust width as needed
//                   whiteSpace: "nowrap", // Prevent text wrapping
//                   overflow: "hidden", // Hide overflowing text
//                   textOverflow: "ellipsis", // Add ellipsis if text overflows
//                 }}
//                 className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center"
//               >
//                 <BsGripVertical className="me-2 fs-5" />
//                 {!module.editing && module.name}
//                 {module.editing && (
//                   <FormControl
//                     className="w-50 d-inline-block"
//                     onChange={(e) =>
//                       updateModule({ ...module, name: e.target.value })
//                     }
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         updateModule({ ...module, editing: false });
//                       }
//                     }}
//                     defaultValue={module.name}
//                   />
//                 )}
//                 <span>{module.name}</span>
//                 <ModuleControlButtons
//                   moduleId={module._id}
//                   deleteModule={deleteModule}
//                   editModule={editModule}
//                 />
//               </div>
//               {module.lessons && (
//                 <ul className="wd-lessons list-group rounded-0">
//                   {module.lessons.map(
//                     (lesson: {
//                       _id: React.Key | null | undefined;
//                       name:
//                         | string
//                         | number
//                         | boolean
//                         | React.ReactElement<
//                             any,
//                             string | React.JSXElementConstructor<any>
//                           >
//                         | Iterable<React.ReactNode>
//                         | React.ReactPortal
//                         | null
//                         | undefined;
//                     }) => (
//                       <li
//                         key={lesson._id}
//                         className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center"
//                       >
//                         <BsGripVertical className="me-2 fs-3" />
//                         <span>{lesson.name}</span>
//                         <LessonControlButtons />
//                       </li>
//                     )
//                   )}
//                 </ul>
//               )}
//             </li>
//           ))}
//       </ul>
//     </div>
//   );
// }
