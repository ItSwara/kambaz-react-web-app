import { IoEllipsisVertical } from "react-icons/io5";
import { FaTrash, FaEdit, FaCopy, FaSort } from "react-icons/fa";
import { useState } from "react";
import { Button, Modal, Dropdown } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import GreenCheckmark from "../Assignments/GreenCheckmark";
import * as quizzesClient from "./client";

export default function QuizControlButtons({
  quizId, 
  deleteQuiz, 
  isPublished
}: {
  quizId: string; 
  deleteQuiz: (quizId: string) => void;
  isPublished: boolean;
}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const { cid } = useParams();
    const navigate = useNavigate();
    
    const handleDeleteClose = () => setShowDeleteModal(false);
    const handleDeleteShow = () => setShowDeleteModal(true);
    
    const handleCopyClose = () => setShowCopyModal(false);
    const handleCopyShow = () => setShowCopyModal(true);
    
    const handleEdit = () => {
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${quizId}/edit`);
    };
    
    const togglePublish = async () => {
        try {
            await quizzesClient.updateQuiz({
                _id: quizId,
                published: !isPublished
            });
            // Refresh the page to see changes (you might want to update the Redux store instead)
            window.location.reload();
        } catch (error) {
            console.error("Error toggling publish status:", error);
        }
    };
    
    return (
        <div className="d-flex align-items-center">
            {/* Publish/Unpublish Icon */}
            <div onClick={togglePublish} style={{ cursor: "pointer" }}>
                {isPublished ? (
                    <GreenCheckmark />
                ) : (
                    <span className="text-danger fs-5 me-2">🚫</span>
                )}
            </div>
            
            {/* Dropdown Menu */}
            <Dropdown>
                <Dropdown.Toggle as={IoEllipsisVertical} className="fs-4" style={{ cursor: "pointer", background: "none", border: "none" }}>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item onClick={handleEdit}>
                        <FaEdit className="me-2" /> Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleDeleteShow}>
                        <FaTrash className="me-2" /> Delete
                    </Dropdown.Item>
                    <Dropdown.Item onClick={togglePublish}>
                        {isPublished ? "Unpublish" : "Publish"}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleCopyShow}>
                        <FaCopy className="me-2" /> Copy
                    </Dropdown.Item>
                    <Dropdown.Item>
                        <FaSort className="me-2" /> Sort
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleDeleteClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this quiz? This action cannot be undone.</p>
                    <div className="d-flex justify-content-between">
                        <Button variant="danger" onClick={() => {
                            deleteQuiz(quizId);
                            handleDeleteClose();
                        }}>Delete</Button>
                        <Button variant="secondary" onClick={handleDeleteClose}>Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>
            
            {/* Copy to Course Modal */}
            <Modal show={showCopyModal} onHide={handleCopyClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Copy Quiz to Another Course</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Select a course to copy this quiz to:</p>
                    {/* Here you would implement a dropdown with available courses */}
                    <select className="form-select mb-3">
                        <option>Select a course...</option>
                        <option>CS3200 - Database Design</option>
                        <option>CS4550 - Web Development</option>
                        <option>CS5610 - Advanced Web Development</option>
                    </select>
                    <div className="d-flex justify-content-between">
                        <Button variant="primary" onClick={handleCopyClose}>Copy</Button>
                        <Button variant="secondary" onClick={handleCopyClose}>Cancel</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div> 
    );
}