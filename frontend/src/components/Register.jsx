import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register, reset } from "../api/auth/authSlice";
import Header from "./common/Header";
import Footer from "./common/Footer";
import emailServices from "../api/emails/user";
import registrationbackground from "../assets/registrationbackground.png";
import { GrMapLocation } from "react-icons/gr";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../firebase.js";
import { v4 as uuidv4 } from 'uuid';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    address: "",
    phone: "",
    image: "",
  });
  const [isImageUploading, setIsImageUploading] = useState(false); // Track image upload
  const { name, email, password, password2, address, phone, image } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Handle image upload

const handleImageUpload = async (e) => {
  const img = e.target.files[0];
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  const maxSize = 5 * 1024 * 1024; // 5MB limit

  if (img && allowedTypes.includes(img.type)) {
    if (img.size > maxSize) {
      toast.error("Image size should not exceed 5MB.");
      return;
    }

    setIsImageUploading(true);
    
    try {
      const storage = getStorage(app);
      const uniqueImageName = uuidv4() + '-' + img.name; // Generate unique name using uuid
      const storageRef = ref(storage, "images/" + uniqueImageName);
      await uploadBytes(storageRef, img);
      const downloadUrl = await getDownloadURL(storageRef);
      setFormData((prevData) => ({
        ...prevData,
        image: downloadUrl,
      }));
      setIsImageUploading(false); // Reset the uploading state after success
    } catch (error) {
      console.log(error);
      toast.error("Image upload failed. Please try again.");
      setIsImageUploading(false); // Reset the uploading state on error
    }
  } else {
    toast.error("Only .png, .jpg, and .jpeg files are allowed.");
  }
};

  // const convertToBase64 = (e) => {
  //   console.log(e);
  //   var reader = new FileReader();
  //   reader.readAsDataURL(e.target.files[0]);
  //   reader.onload = () => {
  //     const imgElement = document.createElement("img");
  //     imgElement.src = reader.result;
  //     imgElement.onload = () => {
  //       const canvas = document.createElement("canvas");
  //       const MAX_WIDTH = 630;
  //       const MAX_HEIGHT = 630;
  //       let width = imgElement.width;
  //       let height = imgElement.height;

  //       if (width > height) {
  //         if (width > MAX_WIDTH) {
  //           height *= MAX_WIDTH / width;
  //           width = MAX_WIDTH;
  //         }
  //       } else {
  //         if (height > MAX_HEIGHT) {
  //           width *= MAX_HEIGHT / height;
  //           height = MAX_HEIGHT;
  //         }
  //       }
  //       canvas.width = width;
  //       canvas.height = height;
  //       const ctx = canvas.getContext("2d");
  //       ctx.drawImage(imgElement, 0, 0, width, height);
  //       const dataURL = canvas.toDataURL(e.target.files[0].type, 0.5);
  //       setImage(dataURL);
  //     };
  //   };
  //   reader.onerror = (error) => {
  //     console.log("Error: ", error);
  //   };
  //   setFormData({ ...formData, image: image });
  // };

  const handleMapClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const apiURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`;
          fetch(apiURL)
            .then((response) => response.json())
            .then((data) => {
              const address = data.results[0].formatted_address;
              setFormData((prevData) => ({ ...prevData, address }));
            })
            .catch((error) => console.log(error));
        },
        (error) => console.log(error)
      );
    }
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (isImageUploading) {
      toast.error("Image is still uploading. Please wait.");
      return;
    }

    if (password !== password2) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!image) {
      toast.error("Please upload an image.");
      return;
    }

    const userData = {
      name,
      email,
      password,
      address,
      phone,
      image,
      role: "USER",
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(email)) {
      if (/^\d{10}$/.test(phone)) {
        dispatch(register(userData));
        emailServices.register(userData);
      } else {
        toast.error("Phone number should be a 10-digit number.");
      }
    } else {
      toast.error("The email address is invalid.");
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate("/");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <div
        style={{ backgroundImage: `url(${registrationbackground})` }}
        className="min-h-screen bg-cover bg-gray-100 flex flex-col justify-center"
      >
        <div className="p-10 xs:p-0 mx-auto w-[700px]">
          <div className="bg-white drop-shadow-2xl shadow w-[500px] mx-auto rounded-lg divide-y divide-gray-200">
            <div className="px-5 py-7">
              <h1 className="font-bold text-center text-2xl mb-5">Register</h1>

              {/* Name Input */}
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Name</label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />

              {/* Email Input */}
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Email</label>
              <input
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                type="email"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />

              {/* Address Input */}
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Address</label>
              <div className="flex">
                <input
                  id="address"
                  name="address"
                  value={address}
                  onChange={onChange}
                  type="text"
                  className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
                />
                <div
                  className="flex rounded-lg content-center border h-[40px] m-1 cursor-pointer"
                  onClick={handleMapClick}
                >
                  <GrMapLocation className="m-[15px]" />
                </div>
              </div>

              {/* Phone Number Input */}
              <label className="font-semibold text-sm text-gray-600 pb-1 block">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                value={phone}
                onChange={onChange}
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />

              {/* Password Inputs */}
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Password</label>
              <input
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                type="password"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />
              <label className="font-semibold text-sm text-gray-600 pb-1 block">
                Confirm Password
              </label>
              <input
                id="password2"
                name="password2"
                value={password2}
                onChange={onChange}
                type="password"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />

              {/* Image Upload */}
              <label className="font-semibold text-sm text-gray-600 pb-1 block">Add Image</label>
              <input
                className="w-full h-full py-5 pb-8 file:rounded-full file:h-[45px] file:w-[130px] file:bg-secondary file:text-white"
                accept="image/*"
                type="file"
                onChange={handleImageUpload}
              />
              {isImageUploading && <p>Uploading image...</p>} {/* Show image uploading status */}

              {/* Register Button */}
              <button
                onClick={onSubmit}
                type="button"
                className="h-[45px] bg-primary rounded-full transition duration-200 hover:bg-[#E38E00] focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                <span className="inline-block mr-2">Register</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Registration;
