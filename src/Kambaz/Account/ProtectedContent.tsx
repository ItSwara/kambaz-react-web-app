import { useSelector } from "react-redux";

export default function ProtectedContent({ children, allowedRoles }: 
    { children: any;
        allowedRoles: string[];
    }) {
    const { currentUser } = useSelector((state: any) => state.accountReducer);
    if (currentUser && allowedRoles.includes(currentUser.role)) {
        return children;
    }
    return null;
}