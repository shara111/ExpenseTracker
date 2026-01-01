import React, { useState } from "react";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const Input = ({ label, value, onChange, placeholder, type, name, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getInputType = () => {
    if (type === "password") return showPassword ? "text" : "password";
    return type;
  };

  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-800 mb-2">
        {label}
      </label>

      <div className="relative group">
        <input
          name={name}
          type={getInputType()}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border-2 bg-white 
            text-sm text-gray-900 placeholder-gray-400 
            focus:outline-none transition-all duration-200
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                : isFocused
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-gray-200 hover:border-gray-300"
            }`}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-gray-100"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FaRegEyeSlash size={20} />
            ) : (
              <FaRegEye size={20} />
            )}
          </button>
        )}

        {!error && value && type !== "password" && (
          <FaCheckCircle
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
            size={20}
          />
        )}

        {error && (
          <FaTimesCircle
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
            size={20}
          />
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5 font-medium error-message">
          <FaTimesCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
