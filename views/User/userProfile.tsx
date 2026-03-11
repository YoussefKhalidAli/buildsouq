import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

export const UserProfile = () => {
  const {
    currentUser,
    updateUserProfile,
    uploadUserProfilePicture,
    getUserPayments,
  } = useStore();

  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [pfp, setPfp] = useState(currentUser?.pfp || "");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const navigate = useNavigate();
  const payments = getUserPayments();

  const saveProfile = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      await updateUserProfile({
        email,
        phone,
        pfp,
      });

      alert("Profile updated");
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePfpUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);

    try {
      const url = await uploadUserProfilePicture(file);
      setPfp(url);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <img
            src={pfp || "https://placehold.co/120"}
            className="w-28 h-28 rounded-full object-cover border"
          />

          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded text-sm font-medium">
            {uploading ? "Uploading..." : "Upload profile picture"}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePfpUpload(file);
              }}
            />
          </label>

          {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* PHONE */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Phone</label>

          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {saveError && (
          <div className="mb-4 text-sm text-red-600">{saveError}</div>
        )}

        <button
          onClick={saveProfile}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* PAYMENTS */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>

        {payments.length === 0 && (
          <p className="text-slate-500">No payments yet</p>
        )}

        {payments.map((order) => {
          const rawDate = order.createdAt || order.date;
          const orderDate = rawDate ? new Date(rawDate) : null;
          return (
            <button
              key={order.id}
              type="button"
              onClick={() => navigate(`/orders/${order.id}`)}
              className="w-full text-left border-b py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 focus:outline-none"
            >
              <span className="font-medium">{order.id}</span>
              <span className="text-sm text-slate-500">
                {orderDate ? orderDate.toLocaleDateString() : "—"}
              </span>
              <span className="text-sm text-slate-500">
                {order.total} EGP
              </span>
              <span className="text-sm text-slate-500 capitalize">
                {order.status}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
