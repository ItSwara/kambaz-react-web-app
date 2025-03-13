import * as db from "../../Database";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addAssignment } from "./reducer";
import { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap"; // Import Toast components

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
    const [showToast, setShowToast] = useState(false); // State for controlling toast visibility
    const [toastMessage, setToastMessage] = useState(""); // State for toast message

    // Use useEffect to load assignment data when component mounts or aid changes
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
                                <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleSave}>
                                    Save
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}



















// import * as db from "../../Database";
// import { useParams } from "react-router";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { addAssignment } from "./reducer";
// import { useState, useEffect } from "react";

// export default function AssignmentEditor() {
//     const { aid } = useParams();
//     const { cid } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const [title, setTitle] = useState("");
//     const [description, setDescription] = useState("");
//     const [points, setPoints] = useState(0);
//     const [dueDate, setDueDate] = useState("");
//     const [availableFromDate, setAvailableFromDate] = useState("");
//     const [availableUntilDate, setAvailableUntilDate] = useState("");
    
//     // Use useEffect to load assignment data when component mounts or aid changes
//     useEffect(() => {
//         if (aid) {
//             const assignment = db.assignments.find((a) => a._id === aid);
//             if (assignment) {
//                 setTitle(assignment.title);
//                 setDescription(assignment.description);
//                 setPoints(assignment.points);
//                 setDueDate(assignment.due_date);
//                 setAvailableFromDate(assignment.available_from_date);
//                 setAvailableUntilDate(assignment.available_until_date);
//             }
//         }
//     }, [aid]);

//     const handleSave = () => {
//         if (aid) {
//             // Update existing assignment logic here
//             // For now, just navigate back
//             navigate(`/Kambaz/Courses/${cid}/Assignments`);
//         } else {
//             const newAssignment = {
//                 title,
//                 course: cid,
//                 description,
//                 points,
//                 due_date: dueDate,
//                 available_from_date: availableFromDate,
//                 available_until_date: availableUntilDate,
//             };
//             dispatch(addAssignment(newAssignment));
//             navigate(`/Kambaz/Courses/${cid}/Assignments`);
//         }
//     };

//     const handleCancel = () => {
//         navigate(`/Kambaz/Courses/${cid}/Assignments`);
//     };

//     return (
//         <div id="wd-assignments-editor">
//             <form action="#" className="assignment-editor" style={{ maxWidth: "600px", margin: "0 auto" }}>
//                 <label htmlFor="wd-name" className="mb-2">
//                     <b>Assignment Name</b>
//                 </label>
//                 <br />
//                 <input id="wd-name" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
//                 <br />
//                 <textarea id="wd-description" rows={10} className="form-control" value={description} onChange={(e) => setDescription(e.target.value)}>
//                 </textarea>
//                 <br />
//                 <table className="table">
//                     <tbody>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-points">Points</label>
//                             </td>
//                             <td>
//                                 <input id="wd-points" className="form-control" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
//                             </td>
//                         </tr>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-group">Assignment Group</label>
//                             </td>
//                             <td>
//                                 <select id="wd-group" className="form-control">
//                                     <option>ASSIGNMENTS</option>
//                                 </select>
//                             </td>
//                         </tr>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-display-grade-as">Display Grade as</label>
//                             </td>
//                             <td>
//                                 <select id="wd-display-grade-as" className="form-control">
//                                     <option>Percentage</option>
//                                 </select>
//                             </td>
//                         </tr>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-submission-type">Submission Type</label>
//                             </td>
//                             <td className="border p-3">
//                                 <select id="wd-select-submission-type" className="form-select">
//                                     <option selected value="Online">Online</option>
//                                     <option value="In-person">In-person</option>
//                                 </select>
//                                 <p></p>
//                                 <div id="wd-online-options">
//                                     <label>Online Entry Options:</label><br />
//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-text" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-text" className="form-check-label"> Text Entry</label>
//                                     </div>
//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-website" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-website" className="form-check-label">  Website URL</label>
//                                     </div>
//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-recordings" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-recordings" className="form-check-label"> Media Recordings</label>
//                                     </div>
//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-annotations" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-annotations" className="form-check-label">
//                                             Student Annotations
//                                         </label>
//                                     </div>
//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-uploads" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-uploads" className="form-check-label"> File Uploads</label>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-assign-to">Assign</label>
//                             </td>
//                             <td className="border p-3">
//                                 Assign to
//                                 <br />
//                                 <input id="wd-assign-to" className="form-control" defaultValue="Everyone" />
//                                 <br />
//                                 Due
//                                 <br />
//                                 <input id="wd-due-date" type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
//                                 <br />
//                             </td>
//                         </tr>
//                         <tr>
//                             <td></td>
//                             <td >Available from</td>
//                             <td>Until</td>
//                         </tr>
//                         <tr>
//                             <td></td>
//                             <td><input id="wd-available-from" type="date" className="form-control"
//                                 value={availableFromDate} onChange={(e) => setAvailableFromDate(e.target.value)} /></td>
//                             <td><input id="wd-available-until" type="date" className="form-control"
//                                 value={availableUntilDate} onChange={(e) => setAvailableUntilDate(e.target.value)} /></td>
//                         </tr>
//                         <tr>
//                             <td colSpan={2} align="right">
//                                 <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
//                                     Cancel
//                                 </button>
//                                 <button type="button" className="btn btn-danger" onClick={handleSave}>
//                                     Save
//                                 </button>
//                             </td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </form>
//         </div>
//     );
// }





/// Only Assignment /cid not working //////

// import * as db from "../../Database";
// import { useParams } from "react-router";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { addAssignment } from "./reducer";
// import { useState } from "react";

// export default function AssignmentEditor() {
//     const { aid } = useParams();
//     const { cid } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const [title, setTitle] = useState("");
//     const [description, setDescription] = useState("");
//     const [points, setPoints] = useState(0);
//     const [dueDate, setDueDate] = useState("");
//     const [availableFromDate, setAvailableFromDate] = useState("");
//     const [availableUntilDate, setAvailableUntilDate] = useState("");

//     const assignments = db.assignments;
//     const assignment = assignments.find((a) => a._id === aid);

//     if (aid && assignment) {
//         // Editing an existing assignment
//         setTitle(assignment.title);
//         setDescription(assignment.description);
//         setPoints(assignment.points);
//         setDueDate(assignment.due_date);
//         setAvailableFromDate(assignment.available_from_date);
//         setAvailableUntilDate(assignment.available_until_date);
//     }

//     const handleSave = () => {
//         if (aid && assignment) {
//             // Update existing assignment logic here
//             // For now, just navigate back
//             navigate(`/Kambaz/Courses/${cid}/Assignments`);
//         } else {
//             const newAssignment = {
//                 title,
//                 course: cid,
//                 description,
//                 points,
//                 due_date: dueDate,
//                 available_from_date: availableFromDate,
//                 available_until_date: availableUntilDate,
//             };
//             dispatch(addAssignment(newAssignment));
//             navigate(`/Kambaz/Courses/${cid}/Assignments`);
//         }
//     };

//     const handleCancel = () => {
//         navigate(`/Kambaz/Courses/${cid}/Assignments`);
//     };

//     return (
//         <div id="wd-assignments-editor">
//             <form action="#" className="assignment-editor" style={{ maxWidth: "600px", margin: "0 auto" }}>
//                 <label htmlFor="wd-name" className="mb-2">
//                     <b>Assignment Name</b>
//                 </label>
//                 <br />
//                 <input id="wd-name" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
//                 <br />
//                 <textarea id="wd-description" rows={10} className="form-control" value={description} onChange={(e) => setDescription(e.target.value)}>
//                 </textarea>
//                 <br />
//                 <table className="table">
//                     <tbody>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-points">Points</label>
//                             </td>
//                             <td>
//                                 <input id="wd-points" className="form-control" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
//                             </td>
//                         </tr>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-group">Assignment Group</label>
//                             </td>
//                             <td>
//                                 <select id="wd-group" className="form-control">
//                                     <option>ASSIGNMENTS</option>
//                                 </select>
//                             </td>
//                         </tr>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-display-grade-as">Display Grade as</label>
//                             </td>
//                             <td>
//                                 <select id="wd-display-grade-as" className="form-control">
//                                     <option>Percentage</option>
//                                 </select>
//                             </td>
//                         </tr>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-submission-type">Submission Type</label>
//                             </td>
//                             <td className="border p-3">
//                                 <select id="wd-select-submission-type" className="form-select">
//                                     <option selected value="Online">Online</option>
//                                     <option value="In-person">In-person</option>
//                                 </select>
//                                 <p></p>
//                                 <div id="wd-online-options">
//                                     <label>Online Entry Options:</label><br />
//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-text" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-text" className="form-check-label"> Text Entry</label>
//                                     </div>
//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-website" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-website" className="form-check-label">  Website URL</label>
//                                     </div>

//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-recordings" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-recordings" className="form-check-label"> Media Recordings</label>
//                                     </div>

//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-annotations" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-annotations" className="form-check-label">
//                                             Student Annotations
//                                         </label>
//                                     </div>

//                                     <div className="form-check">
//                                         <input type="checkbox" name="check-online-options" id="wd-chkbox-uploads" className="form-check-input" />
//                                         <label htmlFor="wd-chkbox-uploads" className="form-check-label"> File Uploads</label>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr>
//                             <td align="right" valign="top">
//                                 <label htmlFor="wd-assign-to">Assign</label>
//                             </td>
//                             <td className="border p-3">
//                                 Assign to
//                                 <br />
//                                 <input id="wd-assign-to" className="form-control" defaultValue="Everyone" />
//                                 <br />
//                                 Due
//                                 <br />
//                                 <input id="wd-due-date" type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
//                                 <br />
//                             </td>
//                         </tr>
//                         <tr>
//                             <td></td>
//                             <td >Available from</td>
//                             <td>Until</td>
//                         </tr>
//                         <tr>
//                             <td></td>
//                             <td><input id="wd-available-from" type="date" className="form-control"
//                                 value={availableFromDate} onChange={(e) => setAvailableFromDate(e.target.value)} /></td>
//                             <td><input id="wd-available-until" type="date" className="form-control"
//                                 value={availableUntilDate} onChange={(e) => setAvailableUntilDate(e.target.value)} /></td>
//                         </tr>
//                         <tr>
//                             <td colSpan={2} align="right">
//                                 <td>
//                                     <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
//                                         Cancel
//                                     </button>
//                                 </td>
//                                 <td><button type="button" className="btn button-red" onClick={handleSave}>
//                                     Save
//                                 </button></td>
//                             </td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </form>
//         </div>
//     );
// }









 /// OLD CODE ////
// import * as db from "../../Database";
// import { useParams } from "react-router";
// import { Link } from "react-router-dom";

// export default function AssignmentEditor() {
//     const { aid } = useParams();
//     const { cid } = useParams();
//     const assignments = db.assignments;
//     return (
//         <div id="wd-assignments-editor">
//             {assignments
//                 .filter((assignment) => assignment._id === aid)
//                 .map((assignment) => (
//                     <form action="#" className="assignment-editor" style={{ maxWidth: "600px", margin: "0 auto" }}>
//                         <label htmlFor="wd-name" className="mb-2">
//                             <b>Assignment Name</b>
//                         </label>
//                         <br />
//                         <input id="wd-name" className="form-control" defaultValue={assignment.title} />
//                         <br />
//                         <textarea id="wd-description" rows={10} className="form-control">
//                             {assignment.description}
//                         </textarea>
//                         <br />
//                         <table className="table">
//                             <tbody>
//                                 <tr>
//                                     <td align="right" valign="top">
//                                         <label htmlFor="wd-points">Points</label>
//                                     </td>
//                                     <td>
//                                         <input id="wd-points" className="form-control" defaultValue={assignment.points} />
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td align="right" valign="top">
//                                         <label htmlFor="wd-group">Assignment Group</label>
//                                     </td>
//                                     <td>
//                                         <select id="wd-group" className="form-control">
//                                             <option>ASSIGNMENTS</option>
//                                         </select>
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td align="right" valign="top">
//                                         <label htmlFor="wd-display-grade-as">Display Grade as</label>
//                                     </td>
//                                     <td>
//                                         <select id="wd-display-grade-as" className="form-control">
//                                             <option>Percentage</option>
//                                         </select>
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td align="right" valign="top">
//                                         <label htmlFor="wd-submission-type">Submission Type</label>
//                                     </td>
//                                     <td className="border p-3">
//                                         <select id="wd-select-submission-type" className="form-select">
//                                             <option selected value="Online">Online</option>
//                                             <option value="In-person">In-person</option>
//                                         </select>
//                                         <p></p>
//                                         <div id="wd-online-options">
//                                             <label>Online Entry Options:</label><br />
//                                             <div className="form-check">
//                                                 <input type="checkbox" name="check-online-options" id="wd-chkbox-text" className="form-check-input" />
//                                                 <label htmlFor="wd-chkbox-text" className="form-check-label"> Text Entry</label>
//                                             </div>
//                                             <div className="form-check">
//                                                 <input type="checkbox" name="check-online-options" id="wd-chkbox-website" className="form-check-input" />
//                                                 <label htmlFor="wd-chkbox-website" className="form-check-label">  Website URL</label>
//                                             </div>

//                                             <div className="form-check">
//                                                 <input type="checkbox" name="check-online-options" id="wd-chkbox-recordings" className="form-check-input" />
//                                                 <label htmlFor="wd-chkbox-recordings" className="form-check-label"> Media Recordings</label>
//                                             </div>

//                                             <div className="form-check">
//                                                 <input type="checkbox" name="check-online-options" id="wd-chkbox-annotations" className="form-check-input" />
//                                                 <label htmlFor="wd-chkbox-annotations" className="form-check-label">
//                                                     Student Annotations
//                                                 </label>
//                                             </div>

//                                             <div className="form-check">
//                                                 <input type="checkbox" name="check-online-options" id="wd-chkbox-uploads" className="form-check-input" />
//                                                 <label htmlFor="wd-chkbox-uploads" className="form-check-label"> File Uploads</label>
//                                             </div>
//                                         </div>
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td align="right" valign="top">
//                                         <label htmlFor="wd-assign-to">Assign</label>
//                                     </td>
//                                     <td className="border p-3">
//                                         Assign to
//                                         <br />
//                                         <input id="wd-assign-to" className="form-control" defaultValue="Everyone" />
//                                         <br />
//                                         Due
//                                         <br />
//                                         <input id="wd-due-date" type="date" className="form-control" defaultValue={assignment.due_date} />
//                                         <br />
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td></td>
//                                     <td >Available from</td>
//                                     <td>Until</td>
//                                 </tr>
//                                 <tr>
//                                     <td></td>
//                                     <td><input id="wd-available-from" type="date" className="form-control"
//                                         defaultValue={assignment.available_from_date} /></td>
//                                     <td><input id="wd-available-until" type="date" className="form-control"
//                                         defaultValue={assignment.available_until_date} /></td>
//                                 </tr>
//                                 <tr>
//                                     <td colSpan={2} align="right">
//                                         <td>
//                                             <Link to={`/Kambaz/Courses/${cid}/Assignments`} type="button" className="btn btn-secondary me-2" id="wd-cancel">
//                                                 Cancel
//                                             </Link>
//                                         </td>
//                                         <td><Link to={`../Assignments`} type="button" className="btn button-red" id="wd-save">
//                                             Save
//                                         </Link>
//                                         </td>
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </form>
//                 ))}
//         </div>
//     );
// }

