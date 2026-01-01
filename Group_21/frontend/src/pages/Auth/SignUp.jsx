import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/Inputs/Input";
import api from "../../utils/api";
import { validateEmail, validatePassword } from "../../utils/helper";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) newErrors.email = emailValidation.message;

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid)
      newErrors.password = passwordValidation.message;

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setErrors({
        general:
          err.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-sm text-gray-600">
            Start tracking your expenses today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            label={
              <>
                Full Name <span className="text-red-500">*</span>
              </>
            }
            placeholder="John Doe"
            error={errors.name}
            required
          />

          <Input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            label={
              <>
                Email Address <span className="text-red-500">*</span>
              </>
            }
            placeholder="john@example.com"
            error={errors.email}
            required
          />

          <Input
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            label={
              <>
                Password <span className="text-red-500">*</span>
              </>
            }
            placeholder="••••••••"
            type="password"
            error={errors.password}
            required
          />

          <Input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            label={
              <>
                Confirm Password <span className="text-red-500">*</span>
              </>
            }
            placeholder="••••••••"
            type="password"
            error={errors.confirmPassword}
            required
          />

          {errors.general && (
            <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary group mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Create Account
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            )}
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:text-primary-dark underline-offset-2 hover:underline transition-all"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Signup;
