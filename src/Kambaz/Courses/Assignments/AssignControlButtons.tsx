import { IoEllipsisVertical } from "react-icons/io5";
import GreenCheckmark from "../Modules/GreenCheckmark";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

export default function AssignmentControlButtons({assignmentId, deleteAssignment}: {assignmentId: string; deleteAssignment: (assignmentId: string) => void;}) {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return (
        <div className="float-end">
            <FaTrash className="text-danger me-3 mb-1" onClick={() => handleShow()}/>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-between">
                        <Button variant="danger" onClick={() => {
                            deleteAssignment(assignmentId);
                            handleClose();
                        }}>Yes</Button>
                        <Button variant="secondary" onClick={handleClose}>No</Button>
                    </div>
                </Modal.Body>
            </Modal>
            <GreenCheckmark />
            <IoEllipsisVertical className="fs-4" />
        </div> 
    );
}