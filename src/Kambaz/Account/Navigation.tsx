import { Link } from "react-router-dom";
export default function AccountNavigation() {
    return (
        <div id="wd-account-navigation" className="wd list-group fs-5 rounded-0">
            <Link id="wd-signin-link" to="/Kambaz/Account/Signin" 
            className="list-group-item active border border-0" > Signin  </Link>
            <Link id="wd-signup-link" to="/Kambaz/Account/Signup"
            className="list-group-item text-danger border border-0"> Signup </Link>
            <Link id="wd-profile-link" to="/Kambaz/Account/Profile"
            className="list-group-item text-danger border border-0"> Profile </Link>
        </div>
    );
}