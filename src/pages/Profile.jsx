import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const navigate = useNavigate();

  // جلب بيانات المستخدم
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          const initialData = {
            name: user.displayName || "User",
            email: user.email,
            about: "",
            skills: [],
          };
          await setDoc(userRef, initialData);
          setUserData(initialData);
        } else {
          setUserData(snap.data());
        }
      } else {
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // اضافة مهارة جديدة
  const handleAddSkill = async () => {
    const skill = newSkill.trim();
    if (!skill || (userData.skills || []).includes(skill)) return;

    const updatedSkills = [...(userData.skills || []), skill];
    await updateDoc(doc(db, "users", auth.currentUser.uid), { skills: updatedSkills });
    setUserData({ ...userData, skills: updatedSkills });
    setNewSkill("");
  };

  // تسجيل الخروج مضبوط
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/signin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a1111] text-white">
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] flex flex-col items-center p-8 text-white">
      <div className="w-full max-w-3xl bg-[#121212] p-8 rounded-2xl shadow-xl">

        {/* اسم المستخدم */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-32 h-32 rounded-full bg-[#1c1c1c] flex items-center justify-center text-4xl font-bold text-[#20bec4ff] shadow-lg border-2 border-[#20bec4ff] overflow-hidden">
            {userData.name[0].toUpperCase()}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-[#20bec4ff]">{userData.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{userData.email}</p>

            <button
              onClick={() => navigate("/Edit-profile")}
              className="mt-4 text-sm text-[#20bec4ff] underline hover:text-[#60e9eeff]"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <hr className="my-6 border-gray-700" />

        {/* About */}
        <div>
          <h2 className="text-xl font-semibold text-[#20bec4ff] mb-3">About</h2>
          <p className="text-gray-300 leading-relaxed">
            {userData.about || "No information added yet."}
          </p>
        </div>

        {/* Skills */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[#20bec4ff] mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {userData.skills.length > 0 ? (
              userData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-[#1c1c1c] text-gray-300 px-3 py-1 rounded-full border border-[#20bec4ff] text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No skills added yet.</p>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a new skill"
              className="w-full bg-[#1c1c1c] border border-[#20bec4ff] text-white px-4 py-2 rounded-md focus:outline-none"
            />
            <button
              onClick={handleAddSkill}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#20bec4ff] text-[#121212] px-3 py-1 rounded hover:bg-[#5ef3f7ff]"
            >
              Add
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="mt-10 text-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-md bg-[#20bec4ff] text-[#121212] font-semibold hover:bg-[#5ef3f7ff]"
          >
            Log out
          </button>
        </div>

      </div>
    </div>
  );
}
