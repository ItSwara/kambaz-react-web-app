import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AccountNavigation() {

 const { currentUser } = useSelector((state: any) => state.accountReducer);
 const { pathname } = useLocation();
 const active = (path: string) => (pathname.includes(path) ? "active" : "");

 console.log("Navigation component rendered, currentUser:", currentUser);
  console.log("Current pathname:", pathname);
  console.log("Should show Users link:", currentUser && currentUser.role === "ADMIN");
  
    return (
        <div id="wd-account-navigation" className="wd list-group fs-5 rounded-0">
            <Link id="wd-signin-link" to="/Kambaz/Account/Signin" 
            className="list-group-item active border border-0" > Signin  </Link>
            <Link id="wd-signup-link" to="/Kambaz/Account/Signup"
            className="list-group-item text-danger border border-0"> Signup </Link>
            <Link id="wd-profile-link" to="/Kambaz/Account/Profile"
            className="list-group-item text-danger border border-0"> Profile </Link>
            {currentUser && currentUser.role === "ADMIN" && (
       <Link to={`/Kambaz/Account/Users`} className={`list-group-item border border-0 ${active("Users")}`}> Users </Link> )}

        </div>
    );
}