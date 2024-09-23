import React, { useState, useContext } from "react";
import { MyProfileContext,apiUrl } from "../context/Context";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {

  const navigate =useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const { myProfile, setMyProfile } = useContext<any>(MyProfileContext);

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLTextAreaElement>|React.ChangeEvent<HTMLSelectElement>) => {
    if(e.target instanceof HTMLInputElement && e.target.files && e.target.files[0]){
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setMyProfile({
          ...myProfile,
          [e.target.name]: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }

    const { name, value } = e.target;
    setMyProfile({
      ...myProfile,
      [name]: value,
    });
  };

  //   handle update profile click
  const handleUpdateProfileClick = async () => {
    setIsEditing(true);
    if(isEditing) {
    const res = await fetch(`${apiUrl}/users/update-profile`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(myProfile),
    });

    const result = await res.json();
    console.log(result.data);
    if (res.status === 200) {
      setMyProfile(result.data);
      setIsEditing(false);
    }
}
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg p-6 mx-auto bg-white rounded-lg shadow-lg">
      <button onClick={()=>navigate('/')} className="absolute sm:hidden top-2 left-2 text-xl p-2"><FaArrowLeft/></button>
      <div className="flex flex-col items-center mt-4">
        <label htmlFor="profile-pic" className="relative w-24 h-24 mb-4">
          <img
            src={myProfile?.avatar}
            alt="Profile"
            className="rounded-full border-2 border-gray-300 w-full h-full object-cover"
          />
          <input
            onChange={handleChange}
            type="file"
            name="avatar"
            id="profile-pic"
            disabled={!isEditing}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="fullname"
              value={myProfile?.fullname}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="text-lg font-semibold">{myProfile?.fullname}</p>
          )}
        </div>

        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          {isEditing ? (
            <textarea
              name="bio"
              value={myProfile?.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          ) : (
            <p className="w-[200px] max-h-[150px] whitespace-pre-wrap break-words">{myProfile?.bio}</p>
          )}
        </div>

        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Highlights
          </label>
          {isEditing ? (
            <input
              type="text"
              name="highlights"
              value={myProfile?.highlights}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-[200px] max-h-[150px] break-words">{myProfile?.highlights}</p>
          )}
        </div>

        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Country
          </label>
          {isEditing ? (
            <input
              type="text"
              name="country"
              value={myProfile?.country}
              onChange={handleChange}
              placeholder="Enter your country"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p>{myProfile?.country}</p>
          )}
        </div>

        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          {isEditing ? (
            <select
              name="gender"
              value={myProfile?.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p>{myProfile?.gender}</p>
          )}
        </div>

        <button
          onClick={handleUpdateProfileClick}
          className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
