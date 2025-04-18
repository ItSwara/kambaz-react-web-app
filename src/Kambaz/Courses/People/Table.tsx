import { FaUserCircle } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { findAllUsers } from "../../Account/client";
import axios from "axios";
import { REMOTE_SERVER } from "../../Account/client";
import PeopleDetails from "./Details";

export default function PeopleTable({ users: externalUsers }: { users?: any[] }) {
    const { cid } = useParams();
    const [fetchedUsers, setFetchedUsers] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Only fetch data if no external users are provided
    useEffect(() => {
        async function loadData() {
            // If users are provided externally, don't fetch
            if (externalUsers) {
                setLoading(false);
                return;
            }
            
            try {
                // Fetch all users only if needed
                const userData = await findAllUsers();
                setFetchedUsers(userData);
                
                // Fetch enrollments for filtering
                if (cid) {
                    const enrollmentsResponse = await axios.get(`${REMOTE_SERVER}/api/enrollments`);
                    setEnrollments(enrollmentsResponse.data);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [externalUsers, cid]);
    
    if (loading) return <div>Loading users...</div>;
    
    // Determine which users to display
    let displayUsers = externalUsers || fetchedUsers;
    
    // Filter by course ID only if:
    // 1. We have a course ID
    // 2. We're not using external users
    // 3. We have enrollments data
    if (cid && !externalUsers && enrollments.length > 0) {
        displayUsers = fetchedUsers.filter(usr => 
            enrollments.some(enrollment => 
                enrollment.user === usr._id && enrollment.course === cid
            )
        );

        
    }
    
    return (
        <div id="wd-people-table">
            <PeopleDetails / >
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Login ID</th>
                        <th>Section</th>
                        <th>Role</th>
                        <th>Last Activity</th>
                        <th>Total Activity</th>
                    </tr>
                </thead>
                <tbody>
                    {displayUsers.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center">No users found</td>
                        </tr>
                    ) : (
                        displayUsers.map((user: any) => (
                            <tr key={user._id}>
                                <td className="wd-full-name text-nowrap">
                                <Link to={`/Kambaz/Account/Users/${user._id}`} className="text-decoration-none">

                                    <FaUserCircle className="me-2 fs-1 text-secondary" />
                                    <span className="wd-first-name">{user.firstName}</span>{" "}
                                    <span className="wd-last-name">{user.lastName}</span>
                                    </Link>
                                </td>
                                <td className="wd-login-id">{user.loginId}</td>
                                <td className="wd-section">{user.section}</td>
                                <td className="wd-role">{user.role}</td>
                                <td className="wd-last-activity">{user.lastActivity}</td>
                                <td className="wd-total-activity">{user.totalActivity}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}



// import { FaUserCircle } from "react-icons/fa";
// import { useParams } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { findAllUsers } from "../../Account/client";
// import axios from "axios";
// import { REMOTE_SERVER } from "../../Account/client";

// export default function PeopleTable() {
//     const { cid } = useParams();
//     const [users, setUsers] = useState<any[]>([]);
//     const [enrollments, setEnrollments] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
    
//     useEffect(() => {
//         async function loadData() {
//             try {
//                 // Fetch all users
//                 const userData = await findAllUsers();
//                 setUsers(userData);
                
//                 // Fetch enrollments
//                 const enrollmentsResponse = await axios.get(`${REMOTE_SERVER}/api/enrollments`);
//                 setEnrollments(enrollmentsResponse.data);
//             } catch (error) {
//                 console.error("Error loading data:", error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         loadData();
//     }, []);
    
//     if (loading) return <div>Loading users...</div>;
    
//     // Filter users based on enrollments and course ID
//     const filteredUsers = users.filter(usr => 
//         enrollments.some(enrollment => 
//             enrollment.user === usr._id && enrollment.course === cid
//         )
//     );
    
//     return (
//         <div id="wd-people-table">
//             <table className="table table-striped">
//                 <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>Login ID</th>
//                         <th>Section</th>
//                         <th>Role</th>
//                         <th>Last Activity</th>
//                         <th>Total Activity</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredUsers.length === 0 ? (
//                         <tr>
//                             <td colSpan={6} className="text-center">No users enrolled in this course</td>
//                         </tr>
//                     ) : (
//                         filteredUsers.map((user: any) => (
//                             <tr key={user._id}>
//                                 <td className="wd-full-name text-nowrap">
//                                     <FaUserCircle className="me-2 fs-1 text-secondary" />
//                                     <span className="wd-first-name">{user.firstName}</span>{" "}
//                                     <span className="wd-last-name">{user.lastName}</span>
//                                 </td>
//                                 <td className="wd-login-id">{user.loginId}</td>
//                                 <td className="wd-section">{user.section}</td>
//                                 <td className="wd-role">{user.role}</td>
//                                 <td className="wd-last-activity">{user.lastActivity}</td>
//                                 <td className="wd-total-activity">{user.totalActivity}</td>
//                             </tr>
//                         ))
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );
// }




// import { FaUserCircle } from "react-icons/fa";
// import { useParams } from "react-router-dom";
// import { useState, useEffect } from "react";
// import { findAllUsers } from "../../Account/client"

// export default function PeopleTable() {
//     const { cid } = useParams();
//     const [users, setUsers] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
    
//     useEffect(() => {
//         async function loadUsers() {
//             try {
//                 const data = await findAllUsers();
//                 setUsers(data);
//             } catch (error) {
//                 console.error("Error loading users:", error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         loadUsers();
//     }, []);
    
//     if (loading) return <div>Loading users...</div>;
    
//     return (
//         <div id="wd-people-table">
//             <table className="table table-striped">
//                 <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>Login ID</th>
//                         <th>Section</th>
//                         <th>Role</th>
//                         <th>Last Activity</th>
//                         <th>Total Activity</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {users.length === 0 ? (
//                         <tr>
//                             <td colSpan={6} className="text-center">No users found</td>
//                         </tr>
//                     ) : (
//                         users.map((user: any) => (
//                             <tr key={user._id}>
//                                 <td className="wd-full-name text-nowrap">
//                                     <FaUserCircle className="me-2 fs-1 text-secondary" />
//                                     <span className="wd-first-name">{user.firstName}</span>{" "}
//                                     <span className="wd-last-name">{user.lastName}</span>
//                                 </td>
//                                 <td className="wd-login-id">{user.loginId}</td>
//                                 <td className="wd-section">{user.section}</td>
//                                 <td className="wd-role">{user.role}</td>
//                                 <td className="wd-last-activity">{user.lastActivity}</td>
//                                 <td className="wd-total-activity">{user.totalActivity}</td>
//                             </tr>
//                         ))
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );
// }







// import { FaUserCircle } from "react-icons/fa";
// import { useParams } from "react-router-dom";
// import * as db from "../../Database";

// export default function PeopleTable() {
//     const { cid } = useParams();
//     const { users, enrollments } = db;
//     return (
//         <div id="wd-people-table">
//             <table className="table table-striped">
//                 <thead>
//                     <tr>
//                         <th>Name</th>
//                         <th>Login ID</th>
//                         <th>Section</th>
//                         <th>Role</th>
//                         <th>Last Activity</th>
//                         <th>Total Activity</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {users
//                         `.filter((usr) =>
//                             enrollments.some((enrollment) => enrollment.user === usr._id && enrollment.course === cid)
//                         )`
//                         .map((user: any) => (
//                             <tr key={user._id}>
//                                 <td className="wd-full-name text-nowrap">
//                                     <FaUserCircle className="me-2 fs-1 text-secondary" />
//                                     <span className="wd-first-name">{user.firstName}</span>{" "}
//                                     <span className="wd-last-name">{user.lastName}</span>
//                                 </td>
//                                 <td className="wd-login-id">{user.loginId}</td>
//                                 <td className="wd-section">{user.section}</td>
//                                 <td className="wd-role">{user.role}</td>
//                                 <td className="wd-last-activity">{user.lastActivity}</td>
//                                 <td className="wd-total-activity">{user.totalActivity}</td>
//                             </tr>
//                         ))}
//                 </tbody>
//             </table>
//         </div>);
// }