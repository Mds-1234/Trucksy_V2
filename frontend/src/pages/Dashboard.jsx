import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import DriverDashboard from "./DriverDashBoard";
import BusinessDashboard from "./BusinessDashboard";
import Spinner from "../components/Spinner";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Spinner message="Loading user session..." className="py-20" />;
  }

  return (
    <div className="w-full">
      {user.role === "business" ? <BusinessDashboard /> : <DriverDashboard />}
    </div>
  );
};

export default Dashboard;
