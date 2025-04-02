import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { updateAssignment as updateAssignmentAction } from "./reducer";
import { updateAssignment as updateAssignmentAPI } from "./client";
import { useEffect, useState } from "react";

export default function AssignmentEditor() {
  const { cid } = useParams();
  const { aid } = useParams();
  const { assignments } = useSelector((state: any) => state.assignmentReducer);
  const assignmentData = assignments.find((a: any) => a._id === aid && a.course === cid);
  const navigate = useNavigate();
  
  // Initialize state with assignment data or defaults
  const [assignmentName, setAssignmentName] = useState<string>("");
  const [assignmentDescription, setAssignmentDescription] = useState<string>("");
  const [assignmentPoints, setAssignmentPoints] = useState<number>(0);
  const [assignmentDueDate, setAssignmentDueDate] = useState<string>("");
  const [assignmentAvailableFrom, setAssignmentAvailableFrom] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const dispatch = useDispatch();

  // Initialize form with data when component mounts
  useEffect(() => {
    if (assignmentData) {
      setAssignmentName(assignmentData.title);
      setAssignmentDescription(assignmentData.description);
      setAssignmentPoints(Number(assignmentData.points));
      setAssignmentDueDate(assignmentData.due);
      setAssignmentAvailableFrom(assignmentData.available);
    }
  }, [assignmentData]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const updatedAssignment = {
      "_id": aid,
      "title": assignmentName,
      "course": cid,
      "points": assignmentPoints,
      "description": assignmentDescription,
      "due": assignmentDueDate,
      "available": assignmentAvailableFrom,
      "until": assignmentDueDate
    };

    try {
      // Update the backend
      await updateAssignmentAPI(updatedAssignment);
      
      // Update Redux store
      dispatch(updateAssignmentAction(updatedAssignment));
      
      // Navigate back
      navigate(-1);
    } catch (error) {
      console.error("Failed to update assignment:", error);
      alert("Failed to update assignment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If assignment not found
  if (!assignmentData) {
    return (
      <Container>
        <div className="alert alert-warning">Assignment not found</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  return (
    <Container id="wd-assignments-editor">
      <Form className="p-3 border fs-5 wd-assignments-editor"> 
        <Form.Group className="mb-3" controlId="wd-name">
          <Form.Label>Assignment Name</Form.Label>
          <Form.Control 
            type="text" 
            autoFocus={true} 
            value={assignmentName}
            onChange={(e) => setAssignmentName(e.target.value)} 
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="wd-description">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={5} 
            value={assignmentDescription}
            onChange={(e) => setAssignmentDescription(e.target.value)} 
          />
        </Form.Group>
        <Form.Group className="mb-3 d-flex" controlId="wd-points">
          <Form.Label className="me-3 w-50 text-end">Points</Form.Label>
          <Form.Control 
            type="number" 
            value={assignmentPoints}
            onChange={(e) => setAssignmentPoints(Number(e.target.value))}
          />
        </Form.Group>
        <Form.Group className="mb-3 d-flex" controlId="wd-group">
          <Form.Label className="me-3 w-50 text-end">Assignment Group</Form.Label>
          <Form.Select aria-label="Select Assignment Group">
              <option value="1">ASSIGNMENTS</option>
              <option value="2">Quiz</option>
              <option value="3">Project</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3 d-flex" controlId="wd-display-grade-as">
            <Form.Label className="me-3 w-50 text-end">Display Grade as</Form.Label>
            <Form.Select aria-label="Select Display Grade as">
                <option value="1">Percentage</option>
                <option value="2">Points</option>
            </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3 d-flex" controlId="wd-submission-type">
          <Form.Label className="me-3 w-50 text-end">Submission Type</Form.Label>
          <Form.Group className="p-3 mb-3 w-100 border" controlId="wd-online-entry-options">
            <Form.Select aria-label="Select Submission Type">
                  <option value="1">Online</option>
                  <option value="2">In Person</option>
                  <option value="3">External Tool</option>
            </Form.Select>
            <Form.Label>Online Entry Options</Form.Label>
            <Form.Check type="checkbox" label="Text Entry" id="wd-text-entry" />
            <Form.Check type="checkbox" label="Website URL" id="wd-website-url" />
            <Form.Check type="checkbox" label="File Upload" id="wd-file-upload" />
            <Form.Check type="checkbox" label="Media Recordings" id="wd-media-recordings" />
            <Form.Check type="checkbox" label="Student Annotation" id="wd-student-annotation" />
          </Form.Group>
        </Form.Group>
        <Form.Group className="mb-3 d-flex" controlId="wd-assign-to">
          <Form.Label className="me-3 w-50 text-end">Assign</Form.Label>
          <Form.Group className="p-3 mb-3 w-100 border" controlId="wd-assign-to">
            <Form.Label className="me-3">Assign to</Form.Label>
            <Form.Control type="text" placeholder="Everyone" />
            <Form.Group className="mt-2" controlId="wd-due-date">
              <Form.Label>Due</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={assignmentDueDate}
                onChange={(e) => setAssignmentDueDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-2 d-flex justify-content-end">
              <Form.Group className="w-50" controlId="wd-available-from">
                <Form.Label>Available From</Form.Label>
                <Form.Control 
                  type="datetime-local" 
                  value={assignmentAvailableFrom}
                  onChange={(e) => setAssignmentAvailableFrom(e.target.value)} 
                />
              </Form.Group>
              <Form.Group className="ms-2 w-50" controlId="wd-available-until">
                <Form.Label className="me-2">Until</Form.Label>
                <Form.Control 
                  type="datetime-local" 
                  value={assignmentDueDate}
                  onChange={(e) => setAssignmentDueDate(e.target.value)} 
                />
              </Form.Group>
            </Form.Group>
          </Form.Group>
        </Form.Group>
        <hr />
        <Form.Group className="d-flex justify-content-end">
          <Row>
            <Col>
              <Button 
                variant="secondary" 
                size="lg"  
                id="wd-cancel" 
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Button 
                variant="secondary" 
                className="bg-danger text-white" 
                size="lg" 
                id="wd-save" 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </Col>
          </Row>
        </Form.Group>
      </Form>
    </Container>
  );
}















// import { Button, Col, Container, Form, Row } from "react-bootstrap";
// import { useNavigate, useParams } from "react-router";
// import { useDispatch, useSelector } from "react-redux";
// import { updateAssignment } from "./reducer";
// import { useState } from "react";


// export default function AssignmentEditor() {
//   const { cid } = useParams();
//   const {aid} = useParams();
//   const {assignments} = useSelector((state: any) => state.assignmentReducer)
//   const assignment = assignments.filter((assignment: any) => assignment._id === aid && assignment.course === cid);
//   const navigate = useNavigate();
  
//   const [assignmentName, setAssignmentName] = useState<string>(assignment[0].title);
//   const [assignmentDescription, setAssignmentDescription] = useState<string>(assignment[0].description);
//   const [assignmentPoints, setAssignmentPoints] = useState(Number(assignment[0].points));
//   const [assignmentDueDate, setAssignmentDueDate] = useState(assignment[0].due);
//   const [assignmentAvailableFrom, setAssignmentAvailableFrom] = useState(assignment[0].available);
 
//   const dispatch = useDispatch();

//     return (
//       <Container id="wd-assignments-editor">
//         { assignment.length === 1  &&
//           (
//             <Form className="p-3 border fs-5 wd-assignments-editor"> 
//               <Form.Group className="mb-3" controlId="wd-name">
//                 <Form.Label>Assignment Name</Form.Label>
//                 <Form.Control type="text" autoFocus={true} defaultValue={`${assignmentName}`} onChange={(e) => setAssignmentName(e.target.value)} />
//               </Form.Group>
//               <Form.Group className="mb-3" controlId="wd-description">
//                 <Form.Label>Description</Form.Label>
//                 <Form.Control as="textarea" rows={5} defaultValue={`${assignmentDescription}`} onChange={(e) => setAssignmentDescription(e.target.value)} />
//               </Form.Group>
//               <Form.Group className="mb-3 d-flex" controlId="wd-points">
//                 <Form.Label className="me-3 w-50 text-end">Points</Form.Label>
//                 <Form.Control type="number" defaultValue={`${assignmentPoints}`} onChange={(e) => setAssignmentPoints(Number(e.target.value))}/>
//               </Form.Group>
//               <Form.Group className="mb-3 d-flex" controlId="wd-group">
//                 <Form.Label className="me-3 w-50 text-end">Assignment Group</Form.Label>
//                 <Form.Select aria-label="Select Assignment Group">
//                     <option value="1">ASSIGNMENTS</option>
//                     <option value="2">Quiz</option>
//                     <option value="3">Project</option>
//                 </Form.Select>
//               </Form.Group>
//               <Form.Group className="mb-3 d-flex" controlId="wd-display-grade-as">
//                   <Form.Label className="me-3 w-50 text-end">Display Grade as</Form.Label>
//                   <Form.Select aria-label="Select Display Grade as">
//                       <option value="1">Percentage</option>
//                       <option value="2">Points</option>
//                   </Form.Select>
//               </Form.Group>
//               <Form.Group className="mb-3 d-flex" controlId="wd-submission-type">
//                 <Form.Label className="me-3 w-50 text-end">Submission Type</Form.Label>
//                 <Form.Group className="p-3 mb-3 w-100 border" controlId="wd-online-entry-options">
//                   <Form.Select aria-label="Select Submission Type">
//                         <option value="1">Online</option>
//                         <option value="2">In Person</option>
//                         <option value="3">External Tool</option>
//                   </Form.Select>
//                   <Form.Label>Online Entry Options</Form.Label>
//                   <Form.Check type="checkbox" label="Text Entry" id="wd-text-entry" />
//                   <Form.Check type="checkbox" label="Website URL" id="wd-website-url" />
//                   <Form.Check type="checkbox" label="File Upload" id="wd-file-upload" />
//                   <Form.Check type="checkbox" label="Media Recordings" id="wd-media-recordings" />
//                   <Form.Check type="checkbox" label="Student Annotation" id="wd-student-annotation" />
//                 </Form.Group>
//               </Form.Group>
//               <Form.Group className="mb-3 d-flex" controlId="wd-assign-to">
//                 <Form.Label className="me-3 w-50 text-end">Assign</Form.Label>
//                 <Form.Group className="p-3 mb-3 w-100 border" controlId="wd-assign-to">
//                   <Form.Label className="me-3">Assign to</Form.Label>
//                   <Form.Control type="text" placeholder="Everyone" />
//                   <Form.Group className="mt-2" controlId="wd-due-date">
//                     <Form.Label>Due</Form.Label>
//                     <Form.Control type="datetime-local" defaultValue={`${assignmentDueDate}`} onChange={(e) => setAssignmentDueDate(e.target.value)}/>
//                   </Form.Group>
//                   <Form.Group className="mt-2 d-flex justify-content-end">
//                     <Form.Group className="w-50" controlId="wd-available-from">
//                       <Form.Label>Available From</Form.Label>
//                       <Form.Control type="datetime-local" defaultValue={`${assignmentAvailableFrom}`} onChange={(e) => setAssignmentAvailableFrom(e.target.value)} />
//                     </Form.Group>
//                     <Form.Group className="ms-2 w-50" controlId="wd-available-until">
//                       <Form.Label className="me-2">Until</Form.Label>
//                       <Form.Control type="datetime-local" defaultValue={`${assignmentDueDate}`} onChange={(e) => setAssignmentDueDate(e.target.value)} />
//                     </Form.Group>
//                   </Form.Group>
                  
//                 </Form.Group>
                
//               </Form.Group>
//               <hr />
//               <Form.Group className="d-flex justify-content-end">
//                 <Row>
//                   <Col>
//                     <Button variant="secondary" size="lg"  id="wd-cancel" onClick={ () => navigate(-1)}>Cancel</Button>
//                   </Col>
//                   <Col>
//                     <Button variant="secondary" className="bg-danger text-white" size="lg" id="wd-save" onClick={(e) => {
//                       e.preventDefault();
//                       dispatch(updateAssignment({
//                         "_id": aid,
//                         "title": assignmentName,
//                         "course": cid,
//                         "points": assignmentPoints,
//                         "description": assignmentDescription,
//                         "due": assignmentDueDate,
//                         "available": assignmentAvailableFrom,
//                         "until": assignmentDueDate
//                       }));
//                       navigate(-1);
//                     }}>Save</Button>
//                   </Col>
//                 </Row>
//               </Form.Group>
//             </Form>
//           )
//         }  
//       </Container>
//   );
// }











//MINE

// import * as db from "../../Database";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { addAssignment } from "./reducer";
// import { useState, useEffect } from "react";
// import { Toast, ToastContainer } from "react-bootstrap";

// export default function AssignmentEditor() {
//     const { aid, cid } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const [title, setTitle] = useState("");
//     const [description, setDescription] = useState("");
//     const [points, setPoints] = useState(0);
//     const [dueDate, setDueDate] = useState("");
//     const [availableFromDate, setAvailableFromDate] = useState("");
//     const [availableUntilDate, setAvailableUntilDate] = useState("");
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState("");

//     // Use useEffect to load assignment data when component mounts
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
//             setToastMessage("Assignment updated successfully!");
//             setShowToast(true);
            
//             // Redirect after a short delay to show the toast
//             setTimeout(() => {
//                 navigate(`/Kambaz/Courses/${cid}/Assignments`);
//             }, 1500);
//         } else {
//             const newAssignment = {
//                 _id: Date.now().toString(), // Generate a unique ID for the new assignment
//                 title,
//                 course: cid,
//                 description,
//                 points,
//                 due_date: dueDate,
//                 available_from_date: availableFromDate,
//                 available_until_date: availableUntilDate,
//             };
//             dispatch(addAssignment(newAssignment));
            
//             // Show success toast
//             setToastMessage("Assignment added successfully!");
//             setShowToast(true);
            
//             // Redirect after a short delay to show the toast
//             setTimeout(() => {
//                 navigate(`/Kambaz/Courses/${cid}/Assignments`);
//             }, 1500);
//         }
//     };

//     const handleCancel = () => {
//         navigate(`/Kambaz/Courses/${cid}/Assignments`);
//     };

//     return (
//         <div id="wd-assignments-editor">
//             {/* Toast notification */}
//             <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1070 }}>
//                 <Toast 
//                     show={showToast} 
//                     onClose={() => setShowToast(false)} 
//                     delay={1500} 
//                     autohide
//                     bg="success"
//                 >
//                     <Toast.Header closeButton={true}>
//                         <strong className="me-auto">Success</strong>
//                     </Toast.Header>
//                     <Toast.Body className="text-white">{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>

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








// import * as db from "../../Database";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { addAssignment } from "./reducer";
// import { useState, useEffect } from "react";
// import { Toast, ToastContainer } from "react-bootstrap";

// export default function AssignmentEditor() {
//     const { aid, cid } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const [title, setTitle] = useState("");
//     const [description, setDescription] = useState("");
//     const [points, setPoints] = useState(0);
//     const [dueDate, setDueDate] = useState("");
//     const [availableFromDate, setAvailableFromDate] = useState("");
//     const [availableUntilDate, setAvailableUntilDate] = useState("");
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState("");

//     // Use useEffect to load assignment data when component mounts
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
//             setToastMessage("Assignment updated successfully!");
//             setShowToast(true);
            
//             // Redirect after a short delay to show the toast
//             setTimeout(() => {
//                 navigate(`/Kambaz/Courses/${cid}/Assignments`);
//             }, 1500);
//         } else {
//             const newAssignment = {
//                 _id: Date.now().toString(), // Generate a unique ID for the new assignment
//                 title,
//                 course: cid,
//                 description,
//                 points,
//                 due_date: dueDate,
//                 available_from_date: availableFromDate,
//                 available_until_date: availableUntilDate,
//             };
//             dispatch(addAssignment(newAssignment));
            
//             // Show success toast
//             setToastMessage("Assignment added successfully!");
//             setShowToast(true);
            
//             // Redirect after a short delay to show the toast
//             setTimeout(() => {
//                 navigate(`/Kambaz/Courses/${cid}/Assignments`);
//             }, 1500);
//         }
//     };

//     const handleCancel = () => {
//         navigate(`/Kambaz/Courses/${cid}/Assignments`);
//     };

//     return (
//         <div id="wd-assignments-editor">
//             {/* Toast notification */}
//             <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1070 }}>
//                 <Toast 
//                     show={showToast} 
//                     onClose={() => setShowToast(false)} 
//                     delay={1500} 
//                     autohide
//                     bg="success"
//                 >
//                     <Toast.Header closeButton={true}>
//                         <strong className="me-auto">Success</strong>
//                     </Toast.Header>
//                     <Toast.Body className="text-white">{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>

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









// import * as db from "../../Database";
// import { useParams } from "react-router";
// import {  useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { addAssignment } from "./reducer";
// import { useState, useEffect } from "react";
// import { Toast, ToastContainer } from "react-bootstrap";

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
//     const [showToast, setShowToast] = useState(false);
//     const [toastMessage, setToastMessage] = useState("");

//     // Use useEffect to load assignment data when component mounts
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
//             setToastMessage("Assignment updated successfully!");
//             setShowToast(true);
            
//             // Redirect after a short delay to show the toast
//             setTimeout(() => {
//                 navigate(`/Kambaz/Courses/${cid}/Assignments`);
//             }, 1500);
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
            
//             // Show success toast
//             setToastMessage("Assignment added successfully!");
//             setShowToast(true);
            
//             // Redirect after a short delay to show the toast
//             setTimeout(() => {
//                 navigate(`/Kambaz/Courses/${cid}/Assignments`);
//             }, 1500);
//         }
//     };

//     const handleCancel = () => {
//         navigate(`/Kambaz/Courses/${cid}/Assignments`);
//     };

//     return (
//         <div id="wd-assignments-editor">
//             {/* Toast notification */}
//             <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1070 }}>
//                 <Toast 
//                     show={showToast} 
//                     onClose={() => setShowToast(false)} 
//                     delay={1500} 
//                     autohide
//                     bg="success"
//                 >
//                     <Toast.Header closeButton={true}>
//                         <strong className="me-auto">Success</strong>
//                     </Toast.Header>
//                     <Toast.Body className="text-white">{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>

//             {aid ? (
//                 db.assignments
//                     .filter((a) => a._id === aid)
//                     .map((_assignment) => (
//                         <form action="#" className="assignment-editor" style={{ maxWidth: "600px", margin: "0 auto" }}>
//                             <label htmlFor="wd-name" className="mb-2">
//                                 <b>Assignment Name</b>
//                             </label>
//                             <br />
//                             <input id="wd-name" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
//                             <br />
//                             <textarea id="wd-description" rows={10} className="form-control" value={description} onChange={(e) => setDescription(e.target.value)}>
//                             </textarea>
//                             <br />
//                             <table className="table">
//                                 <tbody>
//                                     <tr>
//                                         <td align="right" valign="top">
//                                             <label htmlFor="wd-points">Points</label>
//                                         </td>
//                                         <td>
//                                             <input id="wd-points" className="form-control" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td align="right" valign="top">
//                                             <label htmlFor="wd-group">Assignment Group</label>
//                                         </td>
//                                         <td>
//                                             <select id="wd-group" className="form-control">
//                                                 <option>ASSIGNMENTS</option>
//                                             </select>
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td align="right" valign="top">
//                                             <label htmlFor="wd-display-grade-as">Display Grade as</label>
//                                         </td>
//                                         <td>
//                                             <select id="wd-display-grade-as" className="form-control">
//                                                 <option>Percentage</option>
//                                             </select>
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td align="right" valign="top">
//                                             <label htmlFor="wd-submission-type">Submission Type</label>
//                                         </td>
//                                         <td className="border p-3">
//                                             <select id="wd-select-submission-type" className="form-select">
//                                                 <option selected value="Online">Online</option>
//                                                 <option value="In-person">In-person</option>
//                                             </select>
//                                             <p></p>
//                                             <div id="wd-online-options">
//                                                 <label>Online Entry Options:</label><br />
//                                                 <div className="form-check">
//                                                     <input type="checkbox" name="check-online-options" id="wd-chkbox-text" className="form-check-input" />
//                                                     <label htmlFor="wd-chkbox-text" className="form-check-label"> Text Entry</label>
//                                                 </div>
//                                                 <div className="form-check">
//                                                     <input type="checkbox" name="check-online-options" id="wd-chkbox-website" className="form-check-input" />
//                                                     <label htmlFor="wd-chkbox-website" className="form-check-label">  Website URL</label>
//                                                 </div>

//                                                 <div className="form-check">
//                                                     <input type="checkbox" name="check-online-options" id="wd-chkbox-recordings" className="form-check-input" />
//                                                     <label htmlFor="wd-chkbox-recordings" className="form-check-label"> Media Recordings</label>
//                                                 </div>

//                                                 <div className="form-check">
//                                                     <input type="checkbox" name="check-online-options" id="wd-chkbox-annotations" className="form-check-input" />
//                                                     <label htmlFor="wd-chkbox-annotations" className="form-check-label">
//                                                         Student Annotations
//                                                     </label>
//                                                 </div>
//                                                 <div className="form-check">
//                                                     <input type="checkbox" name="check-online-options" id="wd-chkbox-uploads" className="form-check-input" />
//                                                     <label htmlFor="wd-chkbox-uploads" className="form-check-label"> File Uploads</label>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td align="right" valign="top">
//                                             <label htmlFor="wd-assign-to">Assign</label>
//                                         </td>
//                                         <td className="border p-3">
//                                             Assign to
//                                             <br />
//                                             <input id="wd-assign-to" className="form-control" defaultValue="Everyone" />
//                                             <br />
//                                             Due
//                                             <br />
//                                             <input id="wd-due-date" type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
//                                             <br />
//                                         </td>
//                                     </tr>
//                                     <tr>
//                                         <td></td>
//                                         <td >Available from</td>
//                                         <td>Until</td>
//                                     </tr>
//                                     <tr>
//                                         <td></td>
//                                         <td><input id="wd-available-from" type="date" className="form-control"
//                                             value={availableFromDate} onChange={(e) => setAvailableFromDate(e.target.value)} /></td>
//                                         <td><input id="wd-available-until" type="date" className="form-control"
//                                             value={availableUntilDate} onChange={(e) => setAvailableUntilDate(e.target.value)} /></td>
//                                     </tr>
//                                     <tr>
//                                         <td colSpan={2} align="right">
//                                             <td>
//                                                 <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
//                                                     Cancel
//                                                 </button>
//                                             </td>
//                                             <td><button type="button" className="btn button-red" onClick={handleSave}>
//                                                 Save
//                                             </button></td>
//                                         </td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </form>
//                     ))
//             ) : (
//                 <form action="#" className="assignment-editor" style={{ maxWidth: "600px", margin: "0 auto" }}>
//                     <label htmlFor="wd-name" className="mb-2">
//                         <b>Assignment Name</b>
//                     </label>
//                     <br />
//                     <input id="wd-name" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
//                     <br />
//                     <textarea id="wd-description" rows={10} className="form-control" value={description} onChange={(e) => setDescription(e.target.value)}>
//                     </textarea>
//                     <br />
//                     <table className="table">
//                         <tbody>
//                             <tr>
//                                 <td align="right" valign="top">
//                                     <label htmlFor="wd-points">Points</label>
//                                 </td>
//                                 <td>
//                                     <input id="wd-points" className="form-control" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td align="right" valign="top">
//                                     <label htmlFor="wd-group">Assignment Group</label>
//                                 </td>
//                                 <td>
//                                     <select id="wd-group" className="form-control">
//                                         <option>ASSIGNMENTS</option>
//                                     </select>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td align="right" valign="top">
//                                     <label htmlFor="wd-display-grade-as">Display Grade as</label>
//                                 </td>
//                                 <td>
//                                     <select id="wd-display-grade-as" className="form-control">
//                                         <option>Percentage</option>
//                                     </select>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td align="right" valign="top">
//                                     <label htmlFor="wd-submission-type">Submission Type</label>
//                                 </td>
//                                 <td className="border p-3">
//                                     <select id="wd-select-submission-type" className="form-select">
//                                         <option selected value="Online">Online</option>
//                                         <option value="In-person">In-person</option>
//                                     </select>
//                                     <p></p>
//                                     <div id="wd-online-options">
//                                         <label>Online Entry Options:</label><br />
//                                         <div className="form-check">
//                                             <input type="checkbox" name="check-online-options" id="wd-chkbox-text" className="form-check-input" />
//                                             <label htmlFor="wd-chkbox-text" className="form-check-label"> Text Entry</label>
//                                         </div>
//                                         <div className="form-check">
//                                             <input type="checkbox" name="check-online-options" id="wd-chkbox-website" className="form-check-input" />
//                                             <label htmlFor="wd-chkbox-website" className="form-check-label">  Website URL</label>
//                                         </div>
//                                         <div className="form-check">
//                                             <input type="checkbox" name="check-online-options" id="wd-chkbox-recordings" className="form-check-input" />
//                                             <label htmlFor="wd-chkbox-recordings" className="form-check-label"> Media Recordings</label>
//                                         </div>
//                                         <div className="form-check">
//                                             <input type="checkbox" name="check-online-options" id="wd-chkbox-annotations" className="form-check-input" />
//                                             <label htmlFor="wd-chkbox-annotations" className="form-check-label">
//                                                 Student Annotations
//                                             </label>
//                                         </div>
//                                         <div className="form-check">
//                                             <input type="checkbox" name="check-online-options" id="wd-chkbox-uploads" className="form-check-input" />
//                                             <label htmlFor="wd-chkbox-uploads" className="form-check-label"> File Uploads</label>
//                                         </div>
//                                     </div>
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td align="right" valign="top">
//                                     <label htmlFor="wd-assign-to">Assign</label>
//                                 </td>
//                                 <td className="border p-3">
//                                     Assign to
//                                     <br />
//                                     <input id="wd-assign-to" className="form-control" defaultValue="Everyone" />
//                                     <br />
//                                     Due
//                                     <br />
//                                     <input id="wd-due-date" type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
//                                     <br />
//                                 </td>
//                             </tr>
//                             <tr>
//                                 <td></td>
//                                 <td >Available from</td>
//                                 <td>Until</td>
//                             </tr>
//                             <tr>
//                                 <td></td>
//                                 <td><input id="wd-available-from" type="date" className="form-control"
//                                     value={availableFromDate} onChange={(e) => setAvailableFromDate(e.target.value)} /></td>
//                                 <td><input id="wd-available-until" type="date" className="form-control"
//                                     value={availableUntilDate} onChange={(e) => setAvailableUntilDate(e.target.value)} /></td>
//                             </tr>
//                             <tr>
//                                 <td colSpan={2} align="right">
//                                     <td>
//                                         <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
//                                             Cancel
//                                         </button>
//                                     </td>
//                                     <td><button type="button" className="btn button-red" onClick={handleSave}>
//                                         Save
//                                     </button></td>
//                                 </td>
//                             </tr>
//                         </tbody>
//                     </table>
//                 </form>
//             )}
//         </div>
//     );
// }













// import * as db from "../../Database";
// import { useParams } from "react-router";
// import {  useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { addAssignment } from "./reducer";
// import { useState, useEffect } from "react";
// import { Toast, ToastContainer } from "react-bootstrap"; // Import Toast components

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
//     const [showToast, setShowToast] = useState(false); // State for controlling toast visibility
//     const [toastMessage, setToastMessage] = useState(""); // State for toast message

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
//             setToastMessage("Assignment updated successfully!");
//             setShowToast(true);
            
//             // Redirect after a short delay to show the toast
//             setTimeout(() => {
//                 navigate(`/Kambaz/Courses/${cid}/Assignments`);
//             }, 1500);
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
            
//             // Show success toast
//             setToastMessage("Assignment added successfully!");
//             setShowToast(true);
            
//             // Redirect after a short delay to show the toast
//             setTimeout(() => {
//                 navigate(`/Kambaz/Courses/${cid}/Assignments`);
//             }, 1500);
//         }
//     };

//     const handleCancel = () => {
//         navigate(`/Kambaz/Courses/${cid}/Assignments`);
//     };

//     return (
//         <div id="wd-assignments-editor">
//             {/* Toast notification */}
//             <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1070 }}>
//                 <Toast 
//                     show={showToast} 
//                     onClose={() => setShowToast(false)} 
//                     delay={1500} 
//                     autohide
//                     bg="success"
//                 >
//                     <Toast.Header closeButton={true}>
//                         <strong className="me-auto">Success</strong>
//                     </Toast.Header>
//                     <Toast.Body className="text-white">{toastMessage}</Toast.Body>
//                 </Toast>
//             </ToastContainer>

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

