import { uploadImage } from "../lib/streamelements"
import { useState, useRef } from "react"
import { useAuth } from "../context/AuthContext"

const UploadButton = ({ onUploaded }) => {
  const { token, channel } = useAuth()
  const channelId = channel?._id
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(token, channelId, file)
      onUploaded(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 rounded-lg bg-gray-700 border border-gray-600 px-3 py-1.5 text-xs text-white hover:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? (
          <>
            <span className="animate-spin">⟳</span>
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <span>📁</span>
            <span>Choose file to upload</span>
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default UploadButton