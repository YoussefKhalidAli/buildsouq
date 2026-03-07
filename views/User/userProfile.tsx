import React, { useState } from "react";
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
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={pfp || "https://placehold.co/80"}
              className="w-20 h-20 rounded-full object-cover"
            />

            <div className="flex-1">
              <input
                type="text"
                placeholder="Profile picture URL"
                value={pfp}
                onChange={(e) => setPfp(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <div className="mt-2 flex items-center gap-2">
                <label className="cursor-pointer text-xs font-bold text-slate-600 hover:text-slate-800">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePfpUpload(file);
                    }}
                  />
                  {uploading ? "Uploading…" : "Upload image"}
                </label>
                {uploadError && (
                  <span className="text-xs text-red-600">{uploadError}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

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
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>

        {payments.length === 0 && (
          <p className="text-slate-500">No payments yet</p>
        )}

        {payments.map((order) => (
          <div key={order.id} className="border-b py-3 flex justify-between">
            <span>{order.id}</span>

            <span>{order.total} EGP</span>

            <span className="text-sm text-slate-500">{order.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
