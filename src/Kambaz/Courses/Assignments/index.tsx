import * as db from "../../Database";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addAssignment } from "./reducer";
import { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

export default function AssignmentEditor() {
    const { aid } = useParams();
    const { cid } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [points, setPoints] = useState(0);
    const [dueDate, setDueDate] = useState("");
    const [availableFromDate, setAvailableFromDate] = useState("");
    const [availableUntilDate, setAvailableUntilDate] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Use useEffect to load assignment data when component mounts
    useEffect(() => {
        if (aid) {
            const assignment = db.assignments.find((a) => a._id === aid);
            if (assignment) {
                setTitle(assignment.title);
                setDescription(assignment.description);
                setPoints(assignment.points);
                setDueDate(assignment.due_date);
                setAvailableFromDate(assignment.available_from_date);
                setAvailableUntilDate(assignment.available_until_date);
            }
        }
    }, [aid]);

    const handleSave = () => {
        if (aid) {
            // Update existing assignment logic here
            setToastMessage("Assignment updated successfully!");
            setShowToast(true);
            
            // Redirect after a short delay to show the toast
            setTimeout(() => {
                navigate(`/Kambaz/Courses/${cid}/Assignments`);
            }, 1500);
        } else {
            const newAssignment = {
                title,
                course: cid,
                description,
                points,
                due_date: dueDate,
                available_from_date: availableFromDate,
                available_until_date: availableUntilDate,
            };
            dispatch(addAssignment(newAssignment));
            
            // Show success toast
            setToastMessage("Assignment added successfully!");
            setShowToast(true);
            
            // Redirect after a short delay to show the toast
            setTimeout(() => {
                navigate(`/Kambaz/Courses/${cid}/Assignments`);
            }, 1500);
        }
    };

    const handleCancel = () => {
        navigate(`/Kambaz/Courses/${cid}/Assignments`);
    };

    return (
        <div id="wd-assignments-editor">
            {/* Toast notification */}
            <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1070 }}>
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)} 
                    delay={1500} 
                    autohide
                    bg="success"
                >
                    <Toast.Header closeButton={true}>
                        <strong className="me-auto">Success</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">{toastMessage}</Toast.Body>
                </Toast>
            </ToastContainer>

            {aid ? (
                db.assignments
                    .filter((a) => a._id === aid)
                    .map((assignment) => (
                        <form action="#" className="assignment-editor" style={{ maxWidth: "600px", margin: "0 auto" }}>
                            <label htmlFor="wd-name" className="mb-2">
                                <b>Assignment Name</b>
                            </label>
                            <br />
                            <input id="wd-name" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
                            <br />
                            <textarea id="wd-description" rows={10} className="form-control" value={description} onChange={(e) => setDescription(e.target.value)}>
                            </textarea>
                            <br />
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td align="right" valign="top">
                                            <label htmlFor="wd-points">Points</label>
                                        </td>
                                        <td>
                                            <input id="wd-points" className="form-control" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="right" valign="top">
                                            <label htmlFor="wd-group">Assignment Group</label>
                                        </td>
                                        <td>
                                            <select id="wd-group" className="form-control">
                                                <option>ASSIGNMENTS</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="right" valign="top">
                                            <label htmlFor="wd-display-grade-as">Display Grade as</label>
                                        </td>
                                        <td>
                                            <select id="wd-display-grade-as" className="form-control">
                                                <option>Percentage</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="right" valign="top">
                                            <label htmlFor="wd-submission-type">Submission Type</label>
                                        </td>
                                        <td className="border p-3">
                                            <select id="wd-select-submission-type" className="form-select">
                                                <option selected value="Online">Online</option>
                                                <option value="In-person">In-person</option>
                                            </select>
                                            <p></p>
                                            <div id="wd-online-options">
                                                <label>Online Entry Options:</label><br />
                                                <div className="form-check">
                                                    <input type="checkbox" name="check-online-options" id="wd-chkbox-text" className="form-check-input" />
                                                    <label htmlFor="wd-chkbox-text" className="form-check-label"> Text Entry</label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="checkbox" name="check-online-options" id="wd-chkbox-website" className="form-check-input" />
                                                    <label htmlFor="wd-chkbox-website" className="form-check-label">  Website URL</label>
                                                </div>

                                                <div className="form-check">
                                                    <input type="checkbox" name="check-online-options" id="wd-chkbox-recordings" className="form-check-input" />
                                                    <label htmlFor="wd-chkbox-recordings" className="form-check-label"> Media Recordings</label>
                                                </div>

                                                <div className="form-check">
                                                    <input type="checkbox" name="check-online-options" id="wd-chkbox-annotations" className="form-check-input" />
                                                    <label htmlFor="wd-chkbox-annotations" className="form-check-label">
                                                        Student Annotations
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input type="checkbox" name="check-online-options" id="wd-chkbox-uploads" className="form-check-input" />
                                                    <label htmlFor="wd-chkbox-uploads" className="form-check-label"> File Uploads</label>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="right" valign="top">
                                            <label htmlFor="wd-assign-to">Assign</label>
                                        </td>
                                        <td className="border p-3">
                                            Assign to
                                            <br />
                                            <input id="wd-assign-to" className="form-control" defaultValue="Everyone" />
                                            <br />
                                            Due
                                            <br />
                                            <input id="wd-due-date" type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                            <br />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td >Available from</td>
                                        <td>Until</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td><input id="wd-available-from" type="date" className="form-control"
                                            value={availableFromDate} onChange={(e) => setAvailableFromDate(e.target.value)} /></td>
                                        <td><input id="wd-available-until" type="date" className="form-control"
                                            value={availableUntilDate} onChange={(e) => setAvailableUntilDate(e.target.value)} /></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} align="right">
                                            <td>
                                                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
                                                    Cancel
                                                </button>
                                            </td>
                                            <td><button type="button" className="btn button-red" onClick={handleSave}>
                                                Save
                                            </button></td>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </form>
                    ))
            ) : (
                <form action="#" className="assignment-editor" style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <label htmlFor="wd-name" className="mb-2">
                        <b>Assignment Name</b>
                    </label>
                    <br />
                    <input id="wd-name" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <br />
                    <textarea id="wd-description" rows={10} className="form-control" value={description} onChange={(e) => setDescription(e.target.value)}>
                    </textarea>
                    <br />
                    <table className="table">
                        <tbody>
                            <tr>
                                <td align="right" valign="top">
                                    <label htmlFor="wd-points">Points</label>
                                </td>
                                <td>
                                    <input id="wd-points" className="form-control" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
                                </td>
                            </tr>
                            <tr>
                                <td align="right" valign="top">
                                    <label htmlFor="wd-group">Assignment Group</label>
                                </td>
                                <td>
                                    <select id="wd-group" className="form-control">
                                        <option>ASSIGNMENTS</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td align="right" valign="top">
                                    <label htmlFor="wd-display-grade-as">Display Grade as</label>
                                </td>
                                <td>
                                    <select id="wd-display-grade-as" className="form-control">
                                        <option>Percentage</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td align="right" valign="top">
                                    <label htmlFor="wd-submission-type">Submission Type</label>
                                </td>
                                <td className="border p-3">
                                    <select id="wd-select-submission-type" className="form-select">
                                        <option selected value="Online">Online</option>
                                        <option value="In-person">In-person</option>
                                    </select>
                                    <p></p>
                                    <div id="wd-online-options">
                                        <label>Online Entry Options:</label><br />
                                        <div className="form-check">
                                            <input type="checkbox" name="check-online-options" id="wd-chkbox-text" className="form-check-input" />
                                            <label htmlFor="wd-chkbox-text" className="form-check-label"> Text Entry</label>
                                        </div>
                                        <div className="form-check">
                                            <input type="checkbox" name="check-online-options" id="wd-chkbox-website" className="form-check-input" />
                                            <label htmlFor="wd-chkbox-website" className="form-check-label">  Website URL</label>
                                        </div>
                                        <div className="form-check">
                                            <input type="checkbox" name="check-online-options" id="wd-chkbox-recordings" className="form-check-input" />
                                            <label htmlFor="wd-chkbox-recordings" className="form-check-label"> Media Recordings</label>
                                        </div>
                                        <div className="form-check">
                                            <input type="checkbox" name="check-online-options" id="wd-chkbox-annotations" className="form-check-input" />
                                            <label htmlFor="wd-chkbox-annotations" className="form-check-label">
                                                Student Annotations
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input type="checkbox" name="check-online-options" id="wd-chkbox-uploads" className="form-check-input" />
                                            <label htmlFor="wd-chkbox-uploads" className="form-check-label"> File Uploads</label>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td align="right" valign="top">
                                    <label htmlFor="wd-assign-to">Assign</label>
                                </td>
                                <td className="border p-3">
                                    Assign to
                                    <br />
                                    <input id="wd-assign-to" className="form-control" defaultValue="Everyone" />
                                    <br />
                                    Due
                                    <br />
                                    <input id="wd-due-date" type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                    <br />
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td >Available from</td>
                                <td>Until</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><input id="wd-available-from" type="date" className="form-control"
                                    value={availableFromDate} onChange={(e) => setAvailableFromDate(e.target.value)} /></td>
                                <td><input id="wd-available-until" type="date" className="form-control"
                                    value={availableUntilDate} onChange={(e) => setAvailableUntilDate(e.target.value)} /></td>
                            </tr>
                            <tr>
                                <td colSpan={2} align="right">
                                    <td>
                                        <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
                                            Cancel
                                        </button>
                                    </td>
                                    <td><button type="button" className="btn button-red" onClick={handleSave}>
                                        Save
                                    </button></td>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            )}
        </div>
    );
}







// import { FaSearch } from "react-icons/fa";
// import { BsFileText, BsThreeDotsVertical } from "react-icons/bs";
// import { FaPlus } from "react-icons/fa";
// import GreenCheckmark from "./GreenCheckmark";
// import { useParams } from "react-router";
// import { Link, useNavigate } from "react-router-dom";
// import * as db from "../../Database";

// export default function Assignments() {
//     const { cid } = useParams();
//     const assignments = db.assignments.filter((assignment) => assignment.course === cid);
//     const navigate = useNavigate();

//     const handleAssignmentClick = (assignmentId: string) => {
//         navigate(`/Kambaz/Courses/${cid}/Assignments/${assignmentId}`);
//     };

//     return (
//         <div className="container-fluid p-0" style={{ maxWidth: "1200px" }}>
//             {/* Search and buttons section */}
//             <div className="d-flex justify-content-between align-items-center mb-5">
//                 <div className="position-relative ms-1" style={{ width: "250px" }}>
//                     <div className="input-group">
//                         <span
//                             className="position-absolute"
//                             style={{
//                                 left: "4px",
//                                 top: "50%",
//                                 transform: "translateY(-50%)",
//                                 zIndex: "1",
//                             }}
//                         >
//                             <FaSearch className="text-secondary" />
//                         </span>
//                         <input
//                             type="text"
//                             className="form-control ps-4 rounded"
//                             placeholder="Search..."
//                             style={{
//                                 paddingLeft: "40px",
//                                 backgroundColor: "#ffffff",
//                                 border: "1px solid #ced4da",
//                                 borderRadius: "4px",
//                                 height: "40px",
//                             }}
//                         />
//                     </div>
//                 </div>

//                 <div className="d-flex gap-3">
//                     <button
//                         className="btn rounded px-4 py-2"
//                         style={{
//                             backgroundColor: "#dee2e6",
//                             fontSize: "18px",
//                             border: "none",
//                         }}
//                     >
//                         + Group
//                     </button>
//                     <Link
//                         to={`/Kambaz/Courses/${cid}/Assignments/Create`}
//                         className="btn btn-danger rounded px-4 py-2"
//                         style={{
//                             fontSize: "18px",
//                             backgroundColor: "#dc3545",
//                         }}
//                     >
//                         + Assignment
//                     </Link>
//                 </div>
//             </div>

//             {/* Assignments Header */}
//             <div
//                 className="d-flex justify-content-between align-items-center w-100 border p-3 mb-2"
//                 style={{ backgroundColor: "#dee2e6" }}
//             >
//                 <div className="d-flex align-items-center gap-2">
//                     <BsThreeDotsVertical />
//                     <span>▼</span>
//                     <span style={{ fontSize: "24px", marginLeft: "8px" }}>ASSIGNMENTS</span>
//                 </div>
//                 <div className="d-flex align-items-center gap-2">
//                     <span
//                         className="rounded-pill px-4 py-1"
//                         style={{
//                             backgroundColor: "#dee2e6",
//                             border: "1px solid black",
//                         }}
//                     >
//                         40% of Total
//                     </span>
//                     <FaPlus />
//                     <BsThreeDotsVertical />
//                 </div>
//             </div>

//             {/* Dynamic Assignment List */}
//             <div className="border rounded">
//                 <div className="border-start border-success border-4">
//                     <ul className="list-group w-100">
//                         {assignments.map((assignment) => (
//                             <div key={assignment._id}>
//                                 <li
//                                     className="list-group-item border-0 px-4"
//                                     onClick={() => handleAssignmentClick(assignment._id)}
//                                     style={{ cursor: "pointer" }}
//                                 >
//                                     <div className="d-flex justify-content-between align-items-start">
//                                         <div className="d-flex align-items-start">
//                                             <BsThreeDotsVertical className="me-2 mt-1" />
//                                             <BsFileText
//                                                 className="text-success me-2"
//                                                 style={{ fontSize: "22px" }}
//                                             />
//                                             <div>
//                                                 <div className="fs-5 fw-bold">{assignment.title}</div>
//                                                 <div>
//                                                     <span className="text-danger">Multiple Modules</span>
//                                                     <span className="text-secondary"> | </span>
//                                                     <span className="fw-bold">Not available until</span>
//                                                     <span className="text-secondary">
//                                                         {" "}
//                                                         {assignment.available_from_date} |
//                                                     </span>
//                                                     <br />
//                                                     <span>
//                                                         {" "}
//                                                         Due {assignment.due_date} |{" "}
//                                                         {assignment.points} pts
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="d-flex align-items-center">
//                                             <GreenCheckmark />
//                                             <BsThreeDotsVertical className="ms-2" />
//                                         </div>
//                                     </div>
//                                 </li>

//                                 {/* Add horizontal line for all except last item */}
//                                 {assignments.indexOf(assignment) !== assignments.length - 1 && (
//                                     <hr className="my-2 mx-3" />
//                                 )}
//                             </div>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// }








// // src/Kambaz/Courses/Assignments/index.tsx
// import { Link } from "react-router-dom";
// import { useParams } from "react-router";
// import * as db from "../../Database";
// import { BsThreeDotsVertical, BsFileText } from "react-icons/bs";
// import GreenCheckmark from "./GreenCheckmark";

// export default function Assignments() {
//     const { cid } = useParams();
//     const assignments = db.assignments.filter((assignment: { course: string | undefined; }) => assignment.course === cid);

//     return (
//         <div className="container-fluid p-0" style={{ maxWidth: "1200px" }}>
//             {/* ... */}
//             <div className="border rounded">
//                 <div className="border-start border-success border-4">
//                     <ul className="list-group w-100">
//                         {assignments.map((assignment) => (
//                             <div key={assignment._id}>
//                                 <li className="list-group-item border-0 px-4">
//                                     <div className="d-flex justify-content-between align-items-start">
//                                         <div className="d-flex align-items-start">
//                                             <BsThreeDotsVertical className="me-2 mt-1" />
//                                             <BsFileText className="text-success me-2" style={{ fontSize: '22px' }} />
//                                             <div>
//                                                 <div className="fs-5 fw-bold">
//                                                     <Link to={`/Kambaz/Courses/${cid}/Assignments/${assignment._id}`} style={{
//                                                         textDecoration: 'none',
//                                                         color: 'inherit'
//                                                     }}>
//                                                         {assignment.title}
//                                                     </Link>
//                                                 </div>
//                                                 <div>
//                                                     <span className="text-danger">Multiple Modules</span>
//                                                     <span className="text-secondary"> | </span>
//                                                     <span className="fw-bold">Not available until</span>
//                                                     <span className="text-secondary"> May 6 at 12:00am |</span>
//                                                     <br />
//                                                     <span><span className="fw-bold">Due</span> May 13 at 11:59pm | 100 pts</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="d-flex align-items-center">
//                                             <GreenCheckmark />
//                                             <BsThreeDotsVertical className="ms-2" />
//                                         </div>
//                                     </div>
//                                 </li>
//                                 {/* Add horizontal line for all except last item */}
//                                 {assignments.indexOf(assignment) !== assignments.length - 1 && 
//                                   <hr className="my-2 mx-3" />
//                                 }
//                             </div>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//             <div className="d-flex gap-3">
//                 <button className="btn rounded px-4 py-2" 
//                     style={{ 
//                         backgroundColor: "#dee2e6",
//                         fontSize: "18px",
//                         border: "none"
//                     }}>
//                     + Group
//                 </button>
//                 <Link to={`/Kambaz/Courses/${cid}/Assignments/Create`} className="btn btn-danger rounded px-4 py-2" 
//                     style={{ 
//                         fontSize: "18px",
//                         backgroundColor: "#dc3545"
//                     }}>
//                     + Assignment
//                 </Link>
//             </div>
//         </div>
//     );
// }













// import { FaSearch } from "react-icons/fa";
// import { BsFileText, BsThreeDotsVertical } from "react-icons/bs";
// import { FaPlus } from "react-icons/fa";
// import GreenCheckmark from "./GreenCheckmark";
// import { useParams } from "react-router";
// import * as db from "../../Database";
// import { Link } from "react-router";

// export default function Assignments() {
//   const { cid } = useParams();
//   const assignments = db.assignments.filter((assignment) => assignment.course === cid);

//   return (
//     <div className="container-fluid p-0" style={{ maxWidth: "1200px" }}>
//       {/*  search and buttons section */}
//       <div className="d-flex justify-content-between align-items-center mb-5">
//     <div className="position-relative ms-1" style={{ width: "250px" }}>   
//       <div className="input-group">
//      <span className="position-absolute" style={{ 
//       left: "4px", 
//       top: "50%", 
//       transform: "translateY(-50%)", 
//       zIndex: "1" 
//     }}>
//       <FaSearch className="text-secondary" />
//     </span>
//     <input
//       type="text"
//       className="form-control ps-4 rounded"
//       placeholder="Search..."
//       style={{ 
//         paddingLeft: "40px",
//         backgroundColor: "#ffffff",
//         border: "1px solid #ced4da", 
//         borderRadius: "4px",        
//         height: "40px"               
//       }}
//     />
//   </div>
// </div>

// <div className="d-flex gap-3">
//             <button className="btn rounded px-4 py-2" 
//                 style={{ 
//                     backgroundColor: "#dee2e6",
//                     fontSize: "18px",
//                     border: "none"
//                 }}>
//                 + Group
//             </button>
//             <Link to={`/Kambaz/Courses/${cid}/Assignments/Create`} className="btn btn-danger rounded px-4 py-2" 
//                 style={{ 
//                     fontSize: "18px",
//                     backgroundColor: "#dc3545"
//                 }}>
//                 + Assignment
//             </Link>
//         </div>
//     </div>

//     {/* Assignments Header */}
//     <div className="d-flex justify-content-between align-items-center w-100 border p-3 mb-2" 
//       style={{ backgroundColor: "#dee2e6" }}>
//       <div className="d-flex align-items-center gap-2">
//         <BsThreeDotsVertical />
//         <span>▼</span>
//         <span style={{ fontSize: "24px", marginLeft: "8px" }}>ASSIGNMENTS</span>
//       </div>
//       <div className="d-flex align-items-center gap-2">
//         <span className=" rounded-pill px-4 py-1" 
//           style={{ backgroundColor: "#dee2e6" ,
//           border:"1px solid black" 
//           }}>
//           40% of Total
//         </span>
//         <FaPlus />
//         <BsThreeDotsVertical />
//       </div>
//     </div>

// {/* Dynamic ness of Assignment names */}

//       <div className="border rounded">
//         <div className="border-start border-success border-4">
//           <ul className="list-group w-100">
//             {assignments.map((assignment) => (
//               <div key={assignment._id}>
//                 <li className="list-group-item border-0 px-4">
//                   <div className="d-flex justify-content-between align-items-start">
//                     <div className="d-flex align-items-start">
//                       <BsThreeDotsVertical className="me-2 mt-1" />
//                       <BsFileText className="text-success me-2" style={{ fontSize: '22px' }} />
//                       <div>
//                         <div className="fs-5 fw-bold">
//                           <a href={`#/Kambaz/Courses/${cid}/Assignments/${assignment._id}`}
//                             style={{
//                               textDecoration: 'none',
//                               color: 'inherit'
//                             }}>
//                             {assignment.title}
//                           </a>
//                         </div>
//                         <div>
//                           <span className="text-danger">Multiple Modules</span>
//                           <span className="text-secondary"> | </span>
//                           <span className="fw-bold">Not available until</span>
//                           <span className="text-secondary"> May 6 at 12:00am |</span>
//                           <br />
//                           <span><span className="fw-bold">Due</span> May 13 at 11:59pm | 100 pts</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="d-flex align-items-center">
//                       <GreenCheckmark />
//                       <BsThreeDotsVertical className="ms-2" />
//                     </div>
//                   </div>
//                 </li>
//                 {/* Add horizontal line for all except last item */}
//                 {assignments.indexOf(assignment) !== assignments.length - 1 && 
//                   <hr className="my-2 mx-3" />
//                 }
//               </div>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }




