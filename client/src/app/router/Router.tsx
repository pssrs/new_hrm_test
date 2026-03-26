import { createBrowserRouter, Navigate } from "react-router";
import LoginForm from "../../features/account/LoginPage";
import App from "../../features/home/App";
import EmployeeList from "../../features/employee/EmployeeList";
import RequireAuth from "./RequireAuth";
import EmployeeTab from "../../features/employee/EmployeeTab";
import EmployeePersonalInfoForm from "../../features/employee/form/EmployeePersonalInfoForm";
import EmployeeServiceInfoForm from "../../features/employee/form/EmployeeServiceInfoForm";
import Dashboard from "../../features/home/Dashboard";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {element: <RequireAuth />, children: [
                { path: 'employeelist', element: <EmployeeList /> },
                { path: 'newemployee', element: <EmployeePersonalInfoForm /> },
                { path: 'employee/:id', element: <EmployeePersonalInfoForm /> },
                { path: 'employeeService/:id', element: <EmployeeServiceInfoForm /> },
                { path: 'employeeTab/:id', element: <EmployeeTab /> },
                { path: 'dashboard', element: <Dashboard /> },
            ]},
            { path: '', element: <LoginForm /> },
            { path: '*', element: <Navigate replace to='/not-found' /> },
            { path: 'login', element: <LoginForm /> },
            
        ]
    }
], { basename: import.meta.env.VITE_BASENAME || '/' })