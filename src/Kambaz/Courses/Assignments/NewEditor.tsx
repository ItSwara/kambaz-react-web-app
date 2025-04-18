import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useParams } from "react-router";

export default function AssignmentCreator({handleClose, addAssignment} : {handleClose: () => void; addAssignment: (assigment: object) => void;}) {
  const [assignmentId, setAssignmentId] = useState("A0000");
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentPoints, setAssignmentPoints] = useState(0);
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentAvailableFrom, setAssignmentAvailableFrom] = useState("");
  const [assignmentAvailableUntil, setAssignmentAvailableUntil] = useState("");
  const {cid} = useParams();

  return(
        <div>
            <Form className="p-3 border fs-5 wd-assignments-editor">
                <Form.Group className="mb-2" controlId="wd-id">
                  <Form.Label>Assignment Id</Form.Label>
                  <Form.Control type="text" autoFocus={true} onChange={(e) => setAssignmentId(e.target.value)} defaultValue={assignmentId}/>
                </Form.Group>
                <Form.Group className="mb-2" controlId="wd-name">
                  <Form.Label>Assignment Name</Form.Label>
                  <Form.Control type="text" onChange={(e) => setAssignmentName(e.target.value)} defaultValue={assignmentName}/>
                </Form.Group>
                <Form.Group className="mb-2" controlId="wd-description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={5} defaultValue={assignmentDescription} onChange={(e) => setAssignmentDescription(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="wd-points">
                  <Form.Label className="mt-2">Points</Form.Label>
                  <Form.Control type="number" defaultValue={assignmentPoints} onChange={(e) => setAssignmentPoints(Number(e.target.value))}/>
                </Form.Group>
                <Form.Group className="mt-2" controlId="wd-due-date">
                  <Form.Label>Due</Form.Label>
                  <Form.Control type="datetime-local" onChange={(e) => setAssignmentDueDate(e.target.value)}/>
                </Form.Group>
                <Form.Group className="mt-2">
                  <Form.Group controlId="wd-available-from">
                    <Form.Label>Available From</Form.Label>
                    <Form.Control type="datetime-local"  onChange={(e) => setAssignmentAvailableFrom(e.target.value)} />
                  </Form.Group>
                  <Form.Group className="mt-2" controlId="wd-available-until">
                    <Form.Label>Until</Form.Label>
                    <Form.Control type="datetime-local"  onChange={(e) => setAssignmentAvailableUntil(e.target.value)} />
                  </Form.Group>
                </Form.Group>
                
                <Button variant="primary" type="submit" className="mt-3" onClick={ (e) => {
                    e.preventDefault();
                    addAssignment({ "_id": assignmentId, "title": assignmentName, "course": cid, 
                      "points": assignmentPoints, 
                      "description": assignmentDescription,
                      "due": assignmentDueDate,
                      "available": assignmentAvailableFrom,
                      "until": assignmentAvailableUntil
                    });
                    handleClose();
                    }}>
                    Save Changes
                </Button>
            </Form>
        </div>
    );
}