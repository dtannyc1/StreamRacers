const Modal = ({ title, message, onConfirm, confirmLabel = 'OK' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-gray-800 border border-gray-700 p-6 flex flex-col gap-4 shadow-xl">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal