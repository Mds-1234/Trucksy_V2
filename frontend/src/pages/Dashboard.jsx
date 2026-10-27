import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import DriverDashboard from "./DriverDashBoard";
import BusinessDashboard from "./BusinessDashboard";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="py-20 text-center text-sm font-medium text-slate-500">Loading user session...</div>;
  }

  return (
    <div className="w-full">
      {user.role === "business" ? <BusinessDashboard /> : <DriverDashboard />}
    </div>
  );
};

export default Dashboard;
