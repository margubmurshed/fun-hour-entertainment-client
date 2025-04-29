import { createBrowserRouter } from "react-router-dom";
import PrimaryLayout from "../layouts/PrimaryLayout";
import Home from "../pages/Home";
import OpenCash from "../pages/OpenCash";
import AllReceiptsPage from "../pages/AllReceipts";
import Login from "../pages/Login";
import PrivateRoute from "./PrivateRoute";
import CloseCash from "../pages/CloseCash";
import Products from "../pages/Products";
import SellSummary from "../pages/SellSummary";

export const router = createBrowserRouter([
    {
        path: "/", element: <PrimaryLayout />, children: [
            { path: "", element: <PrivateRoute><Home /></PrivateRoute> },
            { path: "open-cash", element: <PrivateRoute><OpenCash /></PrivateRoute> },
            { path: "all-receipts", element: <PrivateRoute><AllReceiptsPage /></PrivateRoute> },
            { path: "close-cash", element: <PrivateRoute><CloseCash /></PrivateRoute> },
            { path: "products", element: <PrivateRoute><Products /></PrivateRoute> },
            { path: "sell-summary", element: <PrivateRoute><SellSummary /></PrivateRoute> },
        ]
    },
    { path: "/login", element: <Login /> }
])