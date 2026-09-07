import { createBrowserRouter } from "react-router";
import LoginForm from "../../features/account/LoginPage";
import App from "../../features/home/App";
import RequireAuth from "./RequireAuth";
import AdminRoute from "./AdminRoute";
import EmployeeInfo from "../shared/components/employee/EmployeeTab";
import HomePage from "@/features/home/HomePage";
import EmployeeList from "../shared/components/employee/list/EmployeeList";
import EmployeeForm from "../shared/components/employee/form/employee/EmployeeForm";
import EmployeeChangesList from "../shared/components/employee/changes/EmployeeChangesList";
import EmployeeOrgChart from "../shared/components/employee/organizationalChart/EmployeeOrgChart";
import EmployeeCalendar from "../shared/components/employee/calendar/EmployeeCalendar";
import EmployeeSalaryList from "../shared/components/employee/salary/EmployeeSalaryList";
import EmployeeLeavesList from "../shared/components/employee/leaves/EmployeeLeavesList";
import UserList from "../shared/components/user/UserList";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {element: <RequireAuth />, children: [
                { path: 'employee/:id', element: <EmployeeInfo /> },
                { path: 'employeeList', element: <EmployeeList /> },
                { path: 'homepage', element: <HomePage /> },
                { path: 'newemployee', element: <EmployeeForm /> },
                { path: 'changes', element: <EmployeeChangesList /> },
                { path: 'leaves', element: <EmployeeLeavesList /> },
                { path: 'orgchart', element: <EmployeeOrgChart /> },
                { path: 'calendar', element: <EmployeeCalendar /> },
                { path: 'salary', element: <EmployeeSalaryList /> },
                { path: 'users', element: <AdminRoute><UserList /></AdminRoute> }
            ]},
            { path: '', element: <LoginForm /> },
            { path: '*', element: <LoginForm /> },
            { path: 'login', element: <LoginForm /> },
            
        ]
    }
], { basename: import.meta.env.VITE_BASENAME || '/' })