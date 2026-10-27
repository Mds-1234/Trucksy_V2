import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Card, { CardBody } from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loginUser } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate("/dashboard");
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.message;
      const details =
        err.response?.data?.details ||
        err.response?.data?.error?.details;

      let errorText = serverMsg || "Failed to log in";
      if (details && typeof details === "string" && !errorText.includes(details)) {
        errorText = `${errorText}: ${details}`;
      } else if (Array.isArray(details)) {
        errorText = `${errorText}: ${details.map((d) => d.message || d).join(", ")}`;
      }
      setError(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to manage your shipments and routes</p>
        </div>

        <Card className="shadow-md">
          <CardBody className="p-6 sm:p-8">
            {error && <Alert type="error" className="mb-5">{error}</Alert>}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full mt-2"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Create an account
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;
