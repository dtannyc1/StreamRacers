import { uploadImage } from "../lib/streamelements"
import { useState, useRef } from "react"
import { useAuth } from "../context/AuthContext"

const UploadButton = ({ onUploaded }) => {
  const { token, channel } = useAuth()
  const channelId = channel?._id
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFileUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError("Please drop a valid image file.");
      return;
    }
    
    setUploading(true)
    setError(null)
    try {
      const url = await uploadImage(token, channelId, file)
      onUploaded(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => {
    setIsDragging(false)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFileUpload(file)
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          handleFileUpload(e.target.files?.[0])
          e.target.value = '' 
        }}
        className="hidden"
      />
      
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        disabled={uploading}
        className={`
          flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-all
          ${isDragging 
            ? "border-purple-500 bg-purple-500/10 scale-[1.02]" 
            : "border-gray-600 bg-gray-700 hover:border-purple-500"
          }
          ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {uploading ? (
          <div className="flex items-center gap-2">
            <span className="animate-spin text-lg">⟳</span>
            <span className="text-xs">Uploading...</span>
          </div>
        ) : (
          <>
            <span className="text-xl">{isDragging ? "📥" : "📁"}</span>
            <div className="flex flex-col text-center">
              <span className="text-xs font-medium text-white">
                {isDragging ? "Drop to upload" : "Choose file or drag here"}
              </span>
              <span className="text-[10px] text-gray-400">PNG, JPG, GIF</span>
            </div>
          </>
        )}
      </button>
      
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export default UploadButton