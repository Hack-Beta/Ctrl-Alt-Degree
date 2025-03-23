import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, RegisterData } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function SignUp() {
  const { register, error: authError, isLoading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const userData: RegisterData = {
      firstName,
      lastName,
      email,
      password,
    };

    try {
      await register(userData);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
      <motion.div
        className="w-full max-w-md p-8 space-y-8 bg-neutral-800 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: "easeOut",
          },
        }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { delay: 0.2, duration: 0.3 },
          }}
        >
          <h1 className="text-3xl font-bold text-white">Sign Up</h1>
          <p className="mt-2 text-neutral-400">Create a new account</p>
        </motion.div>

        {(error || authError) && (
          <motion.div
            className="p-3 text-red-500 bg-red-100/10 rounded-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: { duration: 0.2 },
            }}
          >
            {error || authError}
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.3, duration: 0.3 },
            }}
          >
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-neutral-300"
              >
                First Name
              </label>
              <motion.input
                id="firstName"
                type="text"
                required
                className="w-full px-3 py-2 mt-1 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-neutral-300"
              >
                Last Name
              </label>
              <motion.input
                id="lastName"
                type="text"
                required
                className="w-full px-3 py-2 mt-1 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.4, duration: 0.3 },
            }}
          >
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-300"
            >
              Email
            </label>
            <motion.input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.5, duration: 0.3 },
            }}
          >
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-300"
            >
              Password
            </label>
            <motion.input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.6, duration: 0.3 },
            }}
          >
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-neutral-300"
            >
              Confirm Password
            </label>
            <motion.input
              id="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 bg-neutral-700 border border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.7, duration: 0.3 },
            }}
          >
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-white bg-neutral-900 rounded-md hover:bg-white hover:text-black transition-colors duration-200"
              whileHover={{
                scale: 1.02,
                backgroundColor: "#ffffff",
                color: "#000000",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </motion.button>
          </motion.div>
        </form>

        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { delay: 0.8, duration: 0.3 },
          }}
        >
          <p className="text-neutral-400">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
