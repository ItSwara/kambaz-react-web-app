import { useState, useEffect } from "react";
import PeopleTable from "../Courses/People/Table";
import * as client from "./client";
import { FormControl } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");

  const createUser = async () => {
    const user = await client.createUser({
      firstName: "New",
      lastName: `User${users.length + 1}`,
      username: `newuser${Date.now()}`,
      password: "password123",
      email: `email${users.length + 1}@neu.edu`,
      section: "S101",
      role: "STUDENT",
    });
    setUsers([...users, user]);
  };


  const filterUsersByRole = async (role: string) => {
    setRole(role);
    if (role) {
      const users = await client.findUsersByRole(role);
      setUsers(users);
    } else {
      fetchUsers();
    }
  };

  const [, setName] = useState("");
  const filterUsersByName = async (name: string) => {
    setName(name);
    if (name) {
      const users = await client.findUsersByPartialName(name);
      setUsers(users);
    } else {
      fetchUsers();
    }
  };


  
  // Add console logs to track component rendering
  console.log("Users component rendered");
  
  const fetchUsers = async () => {
    try {
      console.log("fetchUsers function called");
      setLoading(true);
      
      // Log the API URL
      console.log("Attempting to fetch from:", client.USERS_API);
      
      const fetchedUsers = await client.findAllUsers();
      console.log("API response:", fetchedUsers);
      
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
      setError("");
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
    // Listen for the custom event
    useEffect(() => {
        const handleRefreshUsers = () => {
          console.log("Refresh event received, fetching users...");
          fetchUsers();
        };
        
        window.addEventListener('refreshUsers', handleRefreshUsers);
        
        // Cleanup function
        return () => {
          window.removeEventListener('refreshUsers', handleRefreshUsers);
        };
      }, []);



  // Use an empty dependency array to ensure useEffect runs only once
  useEffect(() => {
    console.log("Users component useEffect triggered");
    fetchUsers();
  }, []);
  
  return (
    <div className="p-3">
        <button onClick={createUser} className="float-end btn btn-danger wd-add-people">
        <FaPlus className="me-2" />
        Users
      </button>
      <h2>Users</h2>
      <p>Component is loaded. {loading ? "Loading data..." : `${users.length} users loaded.`}</p>

      <FormControl onChange={(e) => filterUsersByName(e.target.value)} placeholder="Search people"
             className="float-start w-25 me-2 wd-filter-by-name" />
      
      {/* Show loading indicator */}
      {loading && <p>Loading users...</p>}
      
      {/* Show error message if any */} 
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Display users */}
      {!loading && !error && users.length === 0 && (
        <p>No users found. The database might be empty.</p>
      )}

<select value={role} onChange={(e) =>filterUsersByRole(e.target.value)}
              className="form-select float-start w-25 wd-select-role" >
        <option value="">All Roles</option>    <option value="STUDENT">Students</option>
        <option value="TA">Assistants</option> <option value="FACULTY">Faculty</option>
        <option value="ADMIN">Administrators</option>
      </select>
      
      {!loading && !error && users.length > 0 && (
        <PeopleTable users={users} />
      )}
      
      {/* Manual refresh button */}
      <button 
        className="btn btn-primary mt-3" 
        onClick={() => fetchUsers()}
        disabled={loading}
      >
        {loading ? "Loading..." : "Refresh Users"}
      </button>
    </div>
  );
}




// import { useState, useEffect } from "react";
// import { useParams } from "react-router";
// import PeopleTable from "../Courses/People/Table";
// import * as client from "./client";
// export default function Users() {
//  const [users, setUsers] = useState<any[]>([]);
//  const { uid } = useParams();
//  const fetchUsers = async () => {
//    const users = await client.findAllUsers();
//    setUsers(users);
//  };
//  useEffect(() => {
//    fetchUsers();
//  }, [uid]);
//  return (
//    <div>
//      <h3>Users</h3>
//      <PeopleTable users={users} />
//    </div>
// );}
