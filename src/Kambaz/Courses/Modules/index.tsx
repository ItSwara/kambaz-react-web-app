import  { useState, useEffect } from "react";
import LessonControlButtons from "./LessonControlButtons";
import ModuleControlButtons from "./ModuleControlButtons";
import ModulesControls from "./ModulesControls";
import { BsGripVertical } from "react-icons/bs";
import { useParams } from "react-router";
import { FormControl } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import {
  setModules,
  addModule,
  deleteModule,
  updateModule,
  editModule,
} from "./reducer";
import * as coursesClient from "../client";
import * as modulesClient from "./client";

export default function Modules() {
  const { cid } = useParams();
  const [moduleName, setModuleName] = useState("");
  // Local state for holding the editing text for each module (by module._id)
  const [editingNames, setEditingNames] = useState<{ [key: string]: string }>(
    {}
  );
  const { modules } = useSelector((state: any) => state.modulesReducer);
  const dispatch = useDispatch();

  // Updates the module on the server, then dispatches the updated module to Redux
  // const saveModule = async (module: any) => {
  //   try {
  //     console.log("Saving module:", module);
  //     const updatedModule = await modulesClient.updateModule(module);
  //     console.log("Server response:", updatedModule);
  //     dispatch(updateModule(updatedModule));
  //   } catch (error) {
  //     console.error("Error saving module:", error);
  //   }
  // };
  

  const saveModule = async (module: any) => {
    try {
      console.log("Saving module:", module);
      
      if (!module || !module._id) {
        console.error("Invalid module data:", module);
        return;
      }
      
      const updatedModule = await modulesClient.updateModule(module);
      console.log("Server response:", updatedModule);
      
      if (updatedModule) {
        dispatch(updateModule(updatedModule));
        
        // Also update the local editing state to clear it for this module
        setEditingNames((prev) => {
          const copy = { ...prev };
          delete copy[module._id];
          return copy;
        });
      }
    } catch (error) {
      console.error("Error saving module:", error);
    }
  };

  useEffect(() => {
    console.log("Modules changed:", modules);
  }, [modules]);



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
    try {
      const modulesData = await coursesClient.findModulesForCourse(cid as string);
      console.log("Modules from API:", modulesData);
      const safeModules = Array.isArray(modulesData) ? modulesData : [];
      dispatch(setModules(safeModules));
    } catch (error) {
      console.error("Error fetching modules:", error);
      dispatch(setModules([])); // fallback to empty array on error
    }
  };

  useEffect(() => {
    fetchModules();
  }, [cid]);

  return (
    <div className="container p-0">
      <ModulesControls
        moduleName={moduleName}
        setModuleName={setModuleName}
        addModule={createModuleForCourse}
      />
      <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
        {modules.map((module: any) => (
          <li
            key={module._id}
            className="wd-module list-group-item p-0 mb-5 fs-5 border-gray"
          >
            <div
              style={{
                width: "100%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center"
            >
              <BsGripVertical className="me-2 fs-5" />
              {/* If not editing, simply display the module name.
                  If editing, use a controlled input tied to local state. */}
              {!module.editing ? (
                module.name
              ) : (
                <FormControl
                  className="w-50 d-inline-block"
                  value={
                    editingNames[module._id] !== undefined
                      ? editingNames[module._id]
                      : module.name
                  }
                  onChange={(e) =>
                    setEditingNames((prev) => ({
                      ...prev,
                      [module._id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const updatedName =
                        editingNames[module._id] !== undefined
                          ? editingNames[module._id]
                          : module.name;
                      // Update module and turn off editing mode
                      saveModule({ ...module, name: updatedName, editing: false });
                      // Clear local editing state for this module
                      setEditingNames((prev) => {
                        const copy = { ...prev };
                        delete copy[module._id];
                        return copy;
                      });
                    }
                  }}
                />
              )}
              <ModuleControlButtons
                moduleId={module._id}
                deleteModule={(moduleId) => removeModule(moduleId)}
                editModule={(moduleId) => {
                  // Dispatch action to turn editing mode on for this module
                  dispatch(editModule(moduleId));
                  // Initialize local editing state with the current name
                  setEditingNames((prev) => ({
                    ...prev,
                    [module._id]: module.name,
                  }));
                }}
              />
            </div>
            {module.lessons && (
              <ul className="wd-lessons list-group rounded-0">
                {module.lessons.map((lesson: any) => (
                  <li
                    key={lesson._id}
                    className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center"
                  >
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


// import React, { useState, useEffect } from "react";
// import LessonControlButtons from "./LessonControlButtons";
// import ModuleControlButtons from "./ModuleControlButtons";
// import ModulesControls from "./ModulesControls";
// import { BsGripVertical } from "react-icons/bs";
// import { useParams } from "react-router";
// import { FormControl } from "react-bootstrap";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   setModules,
//   addModule,
//   deleteModule,
//   updateModule,
//   editModule,
// } from "./reducer";
// import * as coursesClient from "../client";
// import * as modulesClient from "./client";

// export default function Modules() {
//   const { cid } = useParams();
//   const [moduleName, setModuleName] = useState("");
//   const { modules } = useSelector((state: any) => state.modulesReducer);
//   const dispatch = useDispatch();

//   // const saveModule = async (module: any) => {
//   //   await modulesClient.updateModule(module);
//   //   dispatch(updateModule(module));
//   // };

//   const saveModule = async (module: any) => {
//     try {
//       // Update module on the server
//       const updatedModule = await modulesClient.updateModule(module);

//       // Dispatch the updated module to the store only if it is successfully updated
     
//         dispatch(updateModule(updatedModule));
  
//     } catch (error) {
//       console.error("Error saving module:", error);
//     }
//   };

//   const removeModule = async (moduleId: string) => {
//     await modulesClient.deleteModule(moduleId);
//     dispatch(deleteModule(moduleId));
//   };

//   const createModuleForCourse = async () => {
//     if (!cid) return;
//     const newModule = { name: moduleName, course: cid };
//     const module = await coursesClient.createModuleForCourse(cid, newModule);
//     dispatch(addModule(module));
//   };

//   // const fetchModules = async () => {
//   //   const modules = await coursesClient.findModulesForCourse(cid as string);
//   //   console.log(modules)
//   //   dispatch(setModules(modules));
//   // };

//   const fetchModules = async () => {
//     try {
//       const modules = await coursesClient.findModulesForCourse(cid as string);
//       console.log("Modules from API:", modules);
//       const safeModules = Array.isArray(modules) ? modules : [];
//       dispatch(setModules(safeModules));
//     } catch (error) {
//       console.error("Error fetching modules:", error);
//       dispatch(setModules([])); // fallback to empty array on error
//     }
//   };
  

//   useEffect(() => {
//     fetchModules();
//   }, []);

//   return (
//     <div className="container p-0">
//       <ModulesControls
//         moduleName={moduleName}
//         setModuleName={setModuleName}
//         addModule={createModuleForCourse}
//       />
//       <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
//         {modules
//           //.filter((module: any) => module.course === cid)
//           .map((module: any) => (
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
//                       dispatch(
//                         updateModule({ ...module, name: e.target.value })
//                       )
//                     }
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         saveModule({ ...module, editing: false });
//                       }
//                     }}
//                     defaultValue={module.name}
//                   />
//                 )}
//                 <ModuleControlButtons
//                   moduleId={module._id}
//                   deleteModule={(moduleId) => removeModule(moduleId)}
//                   editModule={(moduleId) => dispatch(editModule(moduleId))}
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

