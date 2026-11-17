import { useCallback, useContext, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import MarketContext from "../context/MarketContext";
import axios from "../utils/axios";

export default function PhotoUpload({ profile = false }) {
  const { user } = useContext(MarketContext);
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Release the preview URL when the image changes or the page unmounts
  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  function selectFile(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      return setError("Please choose an image file");
    }
    setError("");
    setMessage("");
    setFile(selected);
    setImageSrc(URL.createObjectURL(selected));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  const onCropComplete = useCallback((_croppedArea, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function upload() {
    if (!file || !croppedAreaPixels) return setError("Choose an image first");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("x", Math.round(croppedAreaPixels.x));
    formData.append("y", Math.round(croppedAreaPixels.y));
    formData.append("width", Math.round(croppedAreaPixels.width));
    formData.append("height", Math.round(croppedAreaPixels.height));
    if (user?.email) formData.append("email", user.email);

    const url = profile
      ? "http://localhost:9000/images/profile"
      : "http://localhost:9000/images";

    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await axios.post(url, formData);
      setMessage(data?.message || "Image uploaded");
      setFile(null);
      setImageSrc(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="absolute w-full md:w-1/2 left-0 md:left-1/4 top-24 bg-orange-500 rounded-lg shadow-2xl p-5">
      <h3 className="text-white text-center text-4xl mb-5 underline font-bold">
        {profile ? "Upload Profile Photo" : "Upload Photo"}
      </h3>

      <div className="text-center">
        <label className="inline-block text-lg text-white bg-cyan-500 p-2 rounded-lg shadow-2xl hover:scale-95 cursor-pointer">
          {imageSrc ? "Choose a different image" : "Choose an image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={selectFile}
          />
        </label>
      </div>

      {imageSrc && (
        <>
          <div className="relative w-full h-80 mt-5 bg-gray-800 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={profile ? 1 : 4 / 3}
              cropShape={profile ? "round" : "rect"}
              showGrid={!profile}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <label className="flex items-center gap-3 mt-4 text-lg text-white">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-cyan-500"
            />
          </label>
        </>
      )}

      {error && (
        <p className="mx-auto mt-3 w-fit rounded bg-red-100 p-2 text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="mx-auto mt-3 w-fit rounded bg-green-100 p-2 text-green-700">
          {message}
        </p>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={upload}
          disabled={!imageSrc || loading}
          className="text-lg text-white bg-cyan-500 p-2 rounded-lg shadow-2xl hover:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </main>
  );
}
