import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { updateAssignment as updateAssignmentAction } from "./reducer";
import { updateAssignment as updateAssignmentAPI } from "./client";
import { useEffect, useState } from "react";

// Define the RootState type for proper type checking
interface RootState {
  accountReducer: {
    currentUser: {
      role: string;
    };
  };
  assignmentReducer: {
    assignments: Array<any>;
  };
}

export default function AssignmentEditor() {
  const { cid } = useParams();
  const { aid } = useParams();
  const { assignments } = useSelector((state: RootState) => state.assignmentReducer);
  const { currentUser } = useSelector((state: RootState) => state.accountReducer);
  
  // Determine if the user is a student
  const isStudent = currentUser?.role !== "FACULTY";
  
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
    
    // Only allow faculty to save changes
    if (isStudent) return;
    
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
            autoFocus={!isStudent} 
            value={assignmentName}
            onChange={(e) => !isStudent && setAssignmentName(e.target.value)} 
            readOnly={isStudent}
            className={isStudent ? "bg-light" : ""}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="wd-description">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={5} 
            value={assignmentDescription}
            onChange={(e) => !isStudent && setAssignmentDescription(e.target.value)} 
            readOnly={isStudent}
            className={isStudent ? "bg-light" : ""}
          />
        </Form.Group>
        <Form.Group className="mb-3 d-flex" controlId="wd-points">
          <Form.Label className="me-3 w-50 text-end">Points</Form.Label>
          <Form.Control 
            type="number" 
            value={assignmentPoints}
            onChange={(e) => !isStudent && setAssignmentPoints(Number(e.target.value))}
            readOnly={isStudent}
            className={isStudent ? "bg-light" : ""}
          />
        </Form.Group>
        <Form.Group className="mb-3 d-flex" controlId="wd-group">
          <Form.Label className="me-3 w-50 text-end">Assignment Group</Form.Label>
          <Form.Select 
            aria-label="Select Assignment Group"
            disabled={isStudent}
            className={isStudent ? "bg-light" : ""}
          >
              <option value="1">ASSIGNMENTS</option>
              <option value="2">Quiz</option>
              <option value="3">Project</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3 d-flex" controlId="wd-display-grade-as">
            <Form.Label className="me-3 w-50 text-end">Display Grade as</Form.Label>
            <Form.Select 
              aria-label="Select Display Grade as"
              disabled={isStudent}
              className={isStudent ? "bg-light" : ""}
            >
                <option value="1">Percentage</option>
                <option value="2">Points</option>
            </Form.Select>
        </Form.Group>
        {!isStudent && (
          <>
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
          </>
        )}
        
        {/* Student view for assignment details */}
        {isStudent && (
          <div className="mb-4">
            <h4>Assignment Details</h4>
            <div className="border p-3 rounded bg-light">
              <p><strong>Due Date:</strong> {assignmentDueDate}</p>
              <p><strong>Available From:</strong> {assignmentAvailableFrom}</p>
              <p><strong>Points:</strong> {assignmentPoints}</p>
              <p><strong>Submission Type:</strong> Online</p>
            </div>
            
            <div className="mt-4">
              <h4>Submission</h4>
              <div className="border p-3 rounded">
                <p className="text-muted">You haven't submitted anything yet.</p>
                <Button variant="primary">Submit Assignment</Button>
              </div>
            </div>
          </div>
        )}
        
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
                {isStudent ? "Back" : "Cancel"}
              </Button>
            </Col>
            {!isStudent && (
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
            )}
          </Row>
        </Form.Group>
      </Form>
    </Container>
  );
}







// import { Button, Col, Container, Form, Row } from "react-bootstrap";
// import { useNavigate, useParams } from "react-router";
// import { useDispatch, useSelector } from "react-redux";
// import { updateAssignment as updateAssignmentAction } from "./reducer";
// import { updateAssignment as updateAssignmentAPI } from "./client";
// import { useEffect, useState } from "react";

// export default function AssignmentEditor() {
//   const { cid } = useParams();
//   const { aid } = useParams();
//   const { assignments } = useSelector((state: any) => state.assignmentReducer);
//   const assignmentData = assignments.find((a: any) => a._id === aid && a.course === cid);
//   const navigate = useNavigate();
  
//   // Initialize state with assignment data or defaults
//   const [assignmentName, setAssignmentName] = useState<string>("");
//   const [assignmentDescription, setAssignmentDescription] = useState<string>("");
//   const [assignmentPoints, setAssignmentPoints] = useState<number>(0);
//   const [assignmentDueDate, setAssignmentDueDate] = useState<string>("");
//   const [assignmentAvailableFrom, setAssignmentAvailableFrom] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
  
//   const dispatch = useDispatch();

//   // Initialize form with data when component mounts
//   useEffect(() => {
//     if (assignmentData) {
//       setAssignmentName(assignmentData.title);
//       setAssignmentDescription(assignmentData.description);
//       setAssignmentPoints(Number(assignmentData.points));
//       setAssignmentDueDate(assignmentData.due);
//       setAssignmentAvailableFrom(assignmentData.available);
//     }
//   }, [assignmentData]);

//   const handleSave = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     const updatedAssignment = {
//       "_id": aid,
//       "title": assignmentName,
//       "course": cid,
//       "points": assignmentPoints,
//       "description": assignmentDescription,
//       "due": assignmentDueDate,
//       "available": assignmentAvailableFrom,
//       "until": assignmentDueDate
//     };

//     try {
//       // Update the backend
//       await updateAssignmentAPI(updatedAssignment);
      
//       // Update Redux store
//       dispatch(updateAssignmentAction(updatedAssignment));
      
//       // Navigate back
//       navigate(-1);
//     } catch (error) {
//       console.error("Failed to update assignment:", error);
//       alert("Failed to update assignment. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // If assignment not found
//   if (!assignmentData) {
//     return (
//       <Container>
//         <div className="alert alert-warning">Assignment not found</div>
//         <Button onClick={() => navigate(-1)}>Go Back</Button>
//       </Container>
//     );
//   }

//   return (
//     <Container id="wd-assignments-editor">
//       <Form className="p-3 border fs-5 wd-assignments-editor"> 
//         <Form.Group className="mb-3" controlId="wd-name">
//           <Form.Label>Assignment Name</Form.Label>
//           <Form.Control 
//             type="text" 
//             autoFocus={true} 
//             value={assignmentName}
//             onChange={(e) => setAssignmentName(e.target.value)} 
//           />
//         </Form.Group>
//         <Form.Group className="mb-3" controlId="wd-description">
//           <Form.Label>Description</Form.Label>
//           <Form.Control 
//             as="textarea" 
//             rows={5} 
//             value={assignmentDescription}
//             onChange={(e) => setAssignmentDescription(e.target.value)} 
//           />
//         </Form.Group>
//         <Form.Group className="mb-3 d-flex" controlId="wd-points">
//           <Form.Label className="me-3 w-50 text-end">Points</Form.Label>
//           <Form.Control 
//             type="number" 
//             value={assignmentPoints}
//             onChange={(e) => setAssignmentPoints(Number(e.target.value))}
//           />
//         </Form.Group>
//         <Form.Group className="mb-3 d-flex" controlId="wd-group">
//           <Form.Label className="me-3 w-50 text-end">Assignment Group</Form.Label>
//           <Form.Select aria-label="Select Assignment Group">
//               <option value="1">ASSIGNMENTS</option>
//               <option value="2">Quiz</option>
//               <option value="3">Project</option>
//           </Form.Select>
//         </Form.Group>
//         <Form.Group className="mb-3 d-flex" controlId="wd-display-grade-as">
//             <Form.Label className="me-3 w-50 text-end">Display Grade as</Form.Label>
//             <Form.Select aria-label="Select Display Grade as">
//                 <option value="1">Percentage</option>
//                 <option value="2">Points</option>
//             </Form.Select>
//         </Form.Group>
//         <Form.Group className="mb-3 d-flex" controlId="wd-submission-type">
//           <Form.Label className="me-3 w-50 text-end">Submission Type</Form.Label>
//           <Form.Group className="p-3 mb-3 w-100 border" controlId="wd-online-entry-options">
//             <Form.Select aria-label="Select Submission Type">
//                   <option value="1">Online</option>
//                   <option value="2">In Person</option>
//                   <option value="3">External Tool</option>
//             </Form.Select>
//             <Form.Label>Online Entry Options</Form.Label>
//             <Form.Check type="checkbox" label="Text Entry" id="wd-text-entry" />
//             <Form.Check type="checkbox" label="Website URL" id="wd-website-url" />
//             <Form.Check type="checkbox" label="File Upload" id="wd-file-upload" />
//             <Form.Check type="checkbox" label="Media Recordings" id="wd-media-recordings" />
//             <Form.Check type="checkbox" label="Student Annotation" id="wd-student-annotation" />
//           </Form.Group>
//         </Form.Group>
//         <Form.Group className="mb-3 d-flex" controlId="wd-assign-to">
//           <Form.Label className="me-3 w-50 text-end">Assign</Form.Label>
//           <Form.Group className="p-3 mb-3 w-100 border" controlId="wd-assign-to">
//             <Form.Label className="me-3">Assign to</Form.Label>
//             <Form.Control type="text" placeholder="Everyone" />
//             <Form.Group className="mt-2" controlId="wd-due-date">
//               <Form.Label>Due</Form.Label>
//               <Form.Control 
//                 type="datetime-local" 
//                 value={assignmentDueDate}
//                 onChange={(e) => setAssignmentDueDate(e.target.value)}
//               />
//             </Form.Group>
//             <Form.Group className="mt-2 d-flex justify-content-end">
//               <Form.Group className="w-50" controlId="wd-available-from">
//                 <Form.Label>Available From</Form.Label>
//                 <Form.Control 
//                   type="datetime-local" 
//                   value={assignmentAvailableFrom}
//                   onChange={(e) => setAssignmentAvailableFrom(e.target.value)} 
//                 />
//               </Form.Group>
//               <Form.Group className="ms-2 w-50" controlId="wd-available-until">
//                 <Form.Label className="me-2">Until</Form.Label>
//                 <Form.Control 
//                   type="datetime-local" 
//                   value={assignmentDueDate}
//                   onChange={(e) => setAssignmentDueDate(e.target.value)} 
//                 />
//               </Form.Group>
//             </Form.Group>
//           </Form.Group>
//         </Form.Group>
//         <hr />
//         <Form.Group className="d-flex justify-content-end">
//           <Row>
//             <Col>
//               <Button 
//                 variant="secondary" 
//                 size="lg"  
//                 id="wd-cancel" 
//                 onClick={() => navigate(-1)}
//                 disabled={isLoading}
//               >
//                 Cancel
//               </Button>
//             </Col>
//             <Col>
//               <Button 
//                 variant="secondary" 
//                 className="bg-danger text-white" 
//                 size="lg" 
//                 id="wd-save" 
//                 onClick={handleSave}
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Saving..." : "Save"}
//               </Button>
//             </Col>
//           </Row>
//         </Form.Group>
//       </Form>
//     </Container>
//   );
// }







