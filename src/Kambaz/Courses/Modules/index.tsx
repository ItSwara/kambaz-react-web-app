import { useState, useEffect } from "react";
import LessonControlButtons from "./LessonControlButtons";
import ModuleControlButtons from "./ModuleControlButtons";
import ModulesControls from "./ModulesControls";
import { BsGripVertical } from "react-icons/bs";
//import { FaCheck } from "react-icons/fa";
import { useParams } from "react-router";
import { FormControl, Modal, Button } from "react-bootstrap";
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
  const [editingNames, setEditingNames] = useState<{ [key: string]: string }>({});
  const { modules } = useSelector((state: any) => state.modulesReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";
  const dispatch = useDispatch();

  // State for alert modal
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Helper function to show student permission alert
  const showStudentAlert = (action: string) => {
    setAlertMessage(`Students cannot ${action} modules.`);
    setShowAlert(true);
  };

  // Updates the module on the server, then dispatches the updated module to Redux
  const saveModule = async (module: any) => {
    if (!isFaculty) {
      showStudentAlert("edit");
      return;
    }
    
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
    if (!isFaculty) {
      showStudentAlert("delete");
      return;
    }
    
    await modulesClient.deleteModule(moduleId);
    dispatch(deleteModule(moduleId));
  };

  const createModuleForCourse = async () => {
    if (!isFaculty) {
      showStudentAlert("add");
      return;
    }
    
    if (!cid) return;
    const newModule = { name: moduleName, course: cid };
    const module = await coursesClient.createModuleForCourse(cid, newModule);
    dispatch(addModule(module));
  };

  const handleModuleEdit = (moduleId: string) => {
    if (!isFaculty) {
      showStudentAlert("edit");
      return;
    }
    
    // Dispatch action to turn editing mode on for this module
    dispatch(editModule(moduleId));
    // Initialize local editing state with the current name
    const module = modules.find((m: any) => m._id === moduleId);
    if (module) {
      setEditingNames((prev) => ({
        ...prev,
        [moduleId]: module.name,
      }));
    }
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
    <div className="container-fluid p-0">
      {/* Student Permissions Alert Modal */}
      <Modal show={showAlert} onHide={() => setShowAlert(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Permission Denied</Modal.Title>
        </Modal.Header>
        <Modal.Body>{alertMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAlert(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Show ModulesControls UI for both faculty and students */}
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
              
              {/* Show same control buttons for both faculty and students */}
              <ModuleControlButtons
                moduleId={module._id}
                deleteModule={(moduleId) => removeModule(moduleId)}
                editModule={(moduleId) => handleModuleEdit(moduleId)}
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
                    
                    {/* Show LessonControlButtons for both faculty and students */}
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









// import { useState, useEffect } from "react";
// import LessonControlButtons from "./LessonControlButtons";
// import ModuleControlButtons from "./ModuleControlButtons";
// import ModulesControls from "./ModulesControls";
// import { BsGripVertical, BsThreeDotsVertical } from "react-icons/bs";
// import { FaCheck } from "react-icons/fa";
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
//   // Local state for holding the editing text for each module (by module._id)
//   const [editingNames, setEditingNames] = useState<{ [key: string]: string }>(
//     {}
//   );
//   const { modules } = useSelector((state: any) => state.modulesReducer);
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const isFaculty = currentUser?.role === "FACULTY";
//   const dispatch = useDispatch();

//   // Updates the module on the server, then dispatches the updated module to Redux
//   const saveModule = async (module: any) => {
//     try {
//       console.log("Saving module:", module);
      
//       if (!module || !module._id) {
//         console.error("Invalid module data:", module);
//         return;
//       }
      
//       const updatedModule = await modulesClient.updateModule(module);
//       console.log("Server response:", updatedModule);
      
//       if (updatedModule) {
//         dispatch(updateModule(updatedModule));
        
//         // Also update the local editing state to clear it for this module
//         setEditingNames((prev) => {
//           const copy = { ...prev };
//           delete copy[module._id];
//           return copy;
//         });
//       }
//     } catch (error) {
//       console.error("Error saving module:", error);
//     }
//   };

//   useEffect(() => {
//     console.log("Modules changed:", modules);
//   }, [modules]);

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

//   const fetchModules = async () => {
//     try {
//       const modulesData = await coursesClient.findModulesForCourse(cid as string);
//       console.log("Modules from API:", modulesData);
//       const safeModules = Array.isArray(modulesData) ? modulesData : [];
//       dispatch(setModules(safeModules));
//     } catch (error) {
//       console.error("Error fetching modules:", error);
//       dispatch(setModules([])); // fallback to empty array on error
//     }
//   };

//   useEffect(() => {
//     fetchModules();
//   }, [cid]);

//   return (
//     <div className="container-fluid p-0">
//       {/* For faculty, show the actual controls */}
//       {isFaculty && (
//         <ModulesControls
//           moduleName={moduleName}
//           setModuleName={setModuleName}
//           addModule={createModuleForCourse}
//         />
//       )}
      
//       {/* For students, show an empty div with the same padding/spacing */}
//       {!isFaculty && (
//         <div className="d-flex justify-content-between align-items-center py-3">
//           {/* This empty div maintains the space where controls would be */}
//         </div>
//       )}
      
//       <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
//         {modules.map((module: any) => (
//           <li
//             key={module._id}
//             className="wd-module list-group-item p-0 mb-5 fs-5 border-gray"
//           >
//             <div
//               style={{
//                 width: "100%",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//               }}
//               className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center"
//             >
//               <BsGripVertical className="me-2 fs-5" />
//               {!module.editing ? (
//                 module.name
//               ) : (
//                 <FormControl
//                   className="w-50 d-inline-block"
//                   value={
//                     editingNames[module._id] !== undefined
//                       ? editingNames[module._id]
//                       : module.name
//                   }
//                   onChange={(e) =>
//                     setEditingNames((prev) => ({
//                       ...prev,
//                       [module._id]: e.target.value,
//                     }))
//                   }
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       const updatedName =
//                         editingNames[module._id] !== undefined
//                           ? editingNames[module._id]
//                           : module.name;
//                       // Update module and turn off editing mode
//                       saveModule({ ...module, name: updatedName, editing: false });
//                       // Clear local editing state for this module
//                       setEditingNames((prev) => {
//                         const copy = { ...prev };
//                         delete copy[module._id];
//                         return copy;
//                       });
//                     }
//                   }}
//                 />
//               )}
              
//               {/* For faculty, show the full control buttons */}
//               {isFaculty && (
//                 <ModuleControlButtons
//                   moduleId={module._id}
//                   deleteModule={(moduleId) => removeModule(moduleId)}
//                   editModule={(moduleId) => {
//                     // Dispatch action to turn editing mode on for this module
//                     dispatch(editModule(moduleId));
//                     // Initialize local editing state with the current name
//                     setEditingNames((prev) => ({
//                       ...prev,
//                       [module._id]: module.name,
//                     }));
//                   }}
//                 />
//               )}
              
//               {/* For students, just show checkmark and three dots without functionality */}
//               {!isFaculty && (
//                 <div className="ms-auto d-flex align-items-center">
//                   <FaCheck className="text-success me-3" />
//                   <BsThreeDotsVertical className="fs-5" />
//                 </div>
//               )}
//             </div>
//             {module.lessons && (
//               <ul className="wd-lessons list-group rounded-0">
//                 {module.lessons.map((lesson: any) => (
//                   <li
//                     key={lesson._id}
//                     className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center"
//                   >
//                     <BsGripVertical className="me-2 fs-3" />
//                     <span>{lesson.name}</span>
                    
//                     {/* For faculty, show the actual control buttons */}
//                     {isFaculty && <LessonControlButtons />}
                    
//                     {/* For students, just show checkmark and three dots without functionality */}
//                     {!isFaculty && (
//                       <div className="ms-auto d-flex align-items-center">
//                         <FaCheck className="text-success me-3" />
//                         <BsThreeDotsVertical className="fs-5" />
//                       </div>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }









// import  { useState, useEffect } from "react";
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
//   // Local state for holding the editing text for each module (by module._id)
//   const [editingNames, setEditingNames] = useState<{ [key: string]: string }>(
//     {}
//   );
//   const { modules } = useSelector((state: any) => state.modulesReducer);
//   const { currentUser } = useSelector((state: any) => state.accountReducer);
//   const dispatch = useDispatch();

//   // Updates the module on the server, then dispatches the updated module to Redux
//   const saveModule = async (module: any) => {
//     try {
//       console.log("Saving module:", module);
      
//       if (!module || !module._id) {
//         console.error("Invalid module data:", module);
//         return;
//       }
      
//       const updatedModule = await modulesClient.updateModule(module);
//       console.log("Server response:", updatedModule);
      
//       if (updatedModule) {
//         dispatch(updateModule(updatedModule));
        
//         // Also update the local editing state to clear it for this module
//         setEditingNames((prev) => {
//           const copy = { ...prev };
//           delete copy[module._id];
//           return copy;
//         });
//       }
//     } catch (error) {
//       console.error("Error saving module:", error);
//     }
//   };

//   useEffect(() => {
//     console.log("Modules changed:", modules);
//   }, [modules]);

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

//   const fetchModules = async () => {
//     try {
//       const modulesData = await coursesClient.findModulesForCourse(cid as string);
//       console.log("Modules from API:", modulesData);
//       const safeModules = Array.isArray(modulesData) ? modulesData : [];
//       dispatch(setModules(safeModules));
//     } catch (error) {
//       console.error("Error fetching modules:", error);
//       dispatch(setModules([])); // fallback to empty array on error
//     }
//   };

//   useEffect(() => {
//     fetchModules();
//   }, [cid]);

//   return (
//     <div className="container p-0">
//       {currentUser?.role === "FACULTY" && (
//         <ModulesControls
//           moduleName={moduleName}
//           setModuleName={setModuleName}
//           addModule={createModuleForCourse}
//         />
//       )}
//       <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
//         {modules.map((module: any) => (
//           <li
//             key={module._id}
//             className="wd-module list-group-item p-0 mb-5 fs-5 border-gray"
//           >
//             <div
//               style={{
//                 width: "100%",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//               }}
//               className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center"
//             >
//               <BsGripVertical className="me-2 fs-5" />
//               {!module.editing ? (
//                 module.name
//               ) : (
//                 <FormControl
//                   className="w-50 d-inline-block"
//                   value={
//                     editingNames[module._id] !== undefined
//                       ? editingNames[module._id]
//                       : module.name
//                   }
//                   onChange={(e) =>
//                     setEditingNames((prev) => ({
//                       ...prev,
//                       [module._id]: e.target.value,
//                     }))
//                   }
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       const updatedName =
//                         editingNames[module._id] !== undefined
//                           ? editingNames[module._id]
//                           : module.name;
//                       // Update module and turn off editing mode
//                       saveModule({ ...module, name: updatedName, editing: false });
//                       // Clear local editing state for this module
//                       setEditingNames((prev) => {
//                         const copy = { ...prev };
//                         delete copy[module._id];
//                         return copy;
//                       });
//                     }
//                   }}
//                 />
//               )}
//               {currentUser?.role === "FACULTY" && (
//                 <ModuleControlButtons
//                   moduleId={module._id}
//                   deleteModule={(moduleId) => removeModule(moduleId)}
//                   editModule={(moduleId) => {
//                     // Dispatch action to turn editing mode on for this module
//                     dispatch(editModule(moduleId));
//                     // Initialize local editing state with the current name
//                     setEditingNames((prev) => ({
//                       ...prev,
//                       [module._id]: module.name,
//                     }));
//                   }}
//                 />
//               )}
//             </div>
//             {module.lessons && (
//               <ul className="wd-lessons list-group rounded-0">
//                 {module.lessons.map((lesson: any) => (
//                   <li
//                     key={lesson._id}
//                     className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center"
//                   >
//                     <BsGripVertical className="me-2 fs-3" />
//                     <span>{lesson.name}</span>
//                     {currentUser?.role === "FACULTY" && <LessonControlButtons />}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// } 



// import  { useState, useEffect } from "react";
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
//   // Local state for holding the editing text for each module (by module._id)
//   const [editingNames, setEditingNames] = useState<{ [key: string]: string }>(
//     {}
//   );
//   const { modules } = useSelector((state: any) => state.modulesReducer);
//   const dispatch = useDispatch();

//   // Updates the module on the server, then dispatches the updated module to Redux
//   // const saveModule = async (module: any) => {
//   //   try {
//   //     console.log("Saving module:", module);
//   //     const updatedModule = await modulesClient.updateModule(module);
//   //     console.log("Server response:", updatedModule);
//   //     dispatch(updateModule(updatedModule));
//   //   } catch (error) {
//   //     console.error("Error saving module:", error);
//   //   }
//   // };
  

//   const saveModule = async (module: any) => {
//     try {
//       console.log("Saving module:", module);
      
//       if (!module || !module._id) {
//         console.error("Invalid module data:", module);
//         return;
//       }
      
//       const updatedModule = await modulesClient.updateModule(module);
//       console.log("Server response:", updatedModule);
      
//       if (updatedModule) {
//         dispatch(updateModule(updatedModule));
        
//         // Also update the local editing state to clear it for this module
//         setEditingNames((prev) => {
//           const copy = { ...prev };
//           delete copy[module._id];
//           return copy;
//         });
//       }
//     } catch (error) {
//       console.error("Error saving module:", error);
//     }
//   };

//   useEffect(() => {
//     console.log("Modules changed:", modules);
//   }, [modules]);



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

//   const fetchModules = async () => {
//     try {
//       const modulesData = await coursesClient.findModulesForCourse(cid as string);
//       console.log("Modules from API:", modulesData);
//       const safeModules = Array.isArray(modulesData) ? modulesData : [];
//       dispatch(setModules(safeModules));
//     } catch (error) {
//       console.error("Error fetching modules:", error);
//       dispatch(setModules([])); // fallback to empty array on error
//     }
//   };

//   useEffect(() => {
//     fetchModules();
//   }, [cid]);

//   return (
//     <div className="container p-0">
//       <ModulesControls
//         moduleName={moduleName}
//         setModuleName={setModuleName}
//         addModule={createModuleForCourse}
//       />
//       <ul id="wd-modules" className="list-group rounded-0 text-start mb-2">
//         {modules.map((module: any) => (
//           <li
//             key={module._id}
//             className="wd-module list-group-item p-0 mb-5 fs-5 border-gray"
//           >
//             <div
//               style={{
//                 width: "100%",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//               }}
//               className="wd-title p-3 ps-2 bg-secondary d-flex align-items-center"
//             >
//               <BsGripVertical className="me-2 fs-5" />
//               {/* If not editing, simply display the module name.
//                   If editing, use a controlled input tied to local state. */}
//               {!module.editing ? (
//                 module.name
//               ) : (
//                 <FormControl
//                   className="w-50 d-inline-block"
//                   value={
//                     editingNames[module._id] !== undefined
//                       ? editingNames[module._id]
//                       : module.name
//                   }
//                   onChange={(e) =>
//                     setEditingNames((prev) => ({
//                       ...prev,
//                       [module._id]: e.target.value,
//                     }))
//                   }
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       const updatedName =
//                         editingNames[module._id] !== undefined
//                           ? editingNames[module._id]
//                           : module.name;
//                       // Update module and turn off editing mode
//                       saveModule({ ...module, name: updatedName, editing: false });
//                       // Clear local editing state for this module
//                       setEditingNames((prev) => {
//                         const copy = { ...prev };
//                         delete copy[module._id];
//                         return copy;
//                       });
//                     }
//                   }}
//                 />
//               )}
//               <ModuleControlButtons
//                 moduleId={module._id}
//                 deleteModule={(moduleId) => removeModule(moduleId)}
//                 editModule={(moduleId) => {
//                   // Dispatch action to turn editing mode on for this module
//                   dispatch(editModule(moduleId));
//                   // Initialize local editing state with the current name
//                   setEditingNames((prev) => ({
//                     ...prev,
//                     [module._id]: module.name,
//                   }));
//                 }}
//               />
//             </div>
//             {module.lessons && (
//               <ul className="wd-lessons list-group rounded-0">
//                 {module.lessons.map((lesson: any) => (
//                   <li
//                     key={lesson._id}
//                     className="wd-lesson list-group-item p-3 ps-2 d-flex align-items-center"
//                   >
//                     <BsGripVertical className="me-2 fs-3" />
//                     <span>{lesson.name}</span>
//                     <LessonControlButtons />
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


