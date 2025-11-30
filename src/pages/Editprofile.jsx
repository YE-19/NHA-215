import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; // تأكد من مسار firebase.js عندك
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditProfile() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        skills: [],
        about: "",
    });
    const [skillInput, setSkillInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;
            const userDoc = doc(db, "users", auth.currentUser.uid);
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFormData({
                    name: data.name || "",
                    email: auth.currentUser.email || "",
                    skills: data.skills || [],
                    about: data.about || "",
                });
                setAllSkills(data.allSkills || []);
            }
            setLoading(false);
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSkill = () => {
        if (skillInput.trim() !== "" && !formData.skills.includes(skillInput.trim())) {
            const updatedSkills = [...formData.skills, skillInput.trim()];
            setFormData({ ...formData, skills: updatedSkills });
            setSkillInput("");
            const updatedAllSkills = Array.from(new Set([...allSkills, skillInput.trim()]));
            setAllSkills(updatedAllSkills);
        }
    };

    const handleRemoveSkill = (skill) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter((s) => s !== skill),
        });
    };

    const handleSkillInput = (e) => {
        const value = e.target.value;
        setSkillInput(value);
        if (value.trim() === "") {
            setSuggestions([]);
        } else {
            const filtered = allSkills.filter((s) =>
                s.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        }
    };

    const handleSelectSuggestion = (skill) => {
        if (!formData.skills.includes(skill)) {
            setFormData({ ...formData, skills: [...formData.skills, skill] });
        }
        setSkillInput("");
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
            name: formData.name,
            about: formData.about,
            skills: formData.skills,
            allSkills: allSkills,
        });

        navigate("/profile-page");
    };

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#090f0fff] to-[#0c5c5fff] text-white p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-[#121212] p-8 rounded-xl shadow-lg"
            >
                <h1 className="text-3xl font-bold text-[#20bec4ff] mb-4">
                    Edit Your Profile
                </h1>

                {/* Name */}
                <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-300">Full Name</span>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md bg-[#1c1c1c] border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-[#0E898E]"
                    />
                </label>

                {/* Email (Read-only) */}
                <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-300">Email</span>
                    <input
                        name="email"
                        value={formData.email}
                        type="email"
                        disabled
                        className="mt-1 block w-full rounded-md bg-[#1c1c1c] border border-gray-700 px-3 py-2 text-gray-400 cursor-not-allowed"
                    />
                </label>

                {/* About */}
                <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-300">About</span>
                    <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md bg-[#1c1c1c] border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-[#0E898E]"
                        placeholder="Write something about yourself..."
                    />
                </label>

                {/* Skills */}
                <label className="block mb-4 relative">
                    <span className="text-sm font-medium text-gray-300">Skills</span>
                    <div className="flex mt-1">
                        <input
                            name="skills"
                            value={skillInput}
                            onChange={handleSkillInput}
                            placeholder="Add a skill..."
                            className="block w-full rounded-l-md bg-[#1c1c1c] border border-gray-700 px-3 py-2 text-white focus:ring-2 focus:ring-[#0E898E]"
                        />
                        <button
                            type="button"
                            onClick={handleAddSkill}
                            className="bg-[#20bec4ff] text-[#121212] px-3 py-2 rounded-r-md font-semibold hover:bg-[#60e9eeff] transition"
                        >
                            Add
                        </button>
                    </div>
                    {suggestions.length > 0 && (
                        <ul className="absolute z-10 bg-[#1c1c1c] border border-gray-700 rounded-md mt-1 w-full max-h-40 overflow-y-auto">
                            {suggestions.map((skill, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSelectSuggestion(skill)}
                                    className="px-3 py-2 hover:bg-[#0E898E] cursor-pointer"
                                >
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="bg-[#0E898E] text-[#121212] px-2 py-1 rounded-md flex items-center gap-2"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="text-[#121212] font-bold hover:text-red-600"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </label>

                {/* Submit */}
                <div className="flex justify-between items-center">
                    <button
                        type="submit"
                        className="bg-[#20bec4ff] text-[#121212] font-semibold px-4 py-2 rounded-md hover:bg-[#60e9eeff] transition"
                    >
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/profile-page")}
                        className="text-gray-400 hover:text-[#20bec4ff]"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
