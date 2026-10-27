import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Card, { CardBody } from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    email: "",
    password: "",
    role: "driver"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signupUser } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signupUser(form.email, form.password, form.role, form.name, form.contact);
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

      let errorText = serverMsg || "Failed to create account";
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
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create an Account</h1>
          <p className="mt-1 text-sm text-slate-500">Join Trucksy to connect logistics and shipments</p>
        </div>

        <Card className="shadow-md">
          <CardBody className="p-6 sm:p-8">
            {error && <Alert type="error" className="mb-5">{error}</Alert>}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  I want to join as a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "driver" })}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      form.role === "driver"
                        ? "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 text-indigo-950"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.role === "driver" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                        </svg>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.role === "driver" ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                        {form.role === "driver" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="font-semibold text-sm mt-2">Driver</span>
                    <span className="text-xs text-slate-500">Provide freight capacity</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "business" })}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      form.role === "business"
                        ? "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 text-indigo-950"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.role === "business" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.role === "business" ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                        {form.role === "business" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="font-semibold text-sm mt-2">Business</span>
                    <span className="text-xs text-slate-500">Ship goods and cargo</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <Input
                  label="Contact Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                helperText="Must be at least 8 characters long"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full mt-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Log in
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
