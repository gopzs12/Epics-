import { useState } from "react";
import { motion } from "framer-motion";

export default function Profile() {

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [edit, setEdit] = useState(false);

  const [user, setUser] = useState({
    name: storedUser?.name || "",
    role: storedUser?.role || "",
    employeeId: storedUser?.employeeId || "EMP001",
    email: storedUser?.email || "user@factory.com",
    phone: storedUser?.phone || "9876543210",
    factory: storedUser?.factory || "Tiruppur Knitwear Pvt Ltd",
    joined: storedUser?.joined || "2024-01-01"
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    localStorage.setItem("user", JSON.stringify(user));
    setEdit(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center p-12 dark:text-white"
    >

      <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-2xl w-full max-w-3xl">

        {/* Avatar */}
        <div className="flex items-center gap-8 mb-10">

          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 capitalize">
              {user.role}
            </p>
          </div>

        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-6">

          <Field label="Employee ID" name="employeeId" value={user.employeeId} edit={edit} onChange={handleChange} />
          <Field label="Email" name="email" value={user.email} edit={edit} onChange={handleChange} />
          <Field label="Phone" name="phone" value={user.phone} edit={edit} onChange={handleChange} />
          <Field label="Factory Name" name="factory" value={user.factory} edit={edit} onChange={handleChange} />
          <Field label="Joined Date" name="joined" value={user.joined} edit={edit} onChange={handleChange} />
          <Field label="Role" name="role" value={user.role} edit={edit} onChange={handleChange} />

        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-10">

          {!edit ? (
            <button
              onClick={() => setEdit(true)}
              className="bg-black text-white px-6 py-3 rounded-xl"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={saveProfile}
              className="bg-green-600 text-white px-6 py-3 rounded-xl"
            >
              Save Changes
            </button>
          )}

          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-xl"
          >
            Logout
          </button>

        </div>

      </div>

    </motion.div>
  );
}

function Field({ label, name, value, edit, onChange }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </p>

      {edit ? (
        <input
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-3 rounded-xl border dark:bg-gray-700"
        />
      ) : (
        <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
          {value}
        </div>
      )}

    </div>
  );
}
