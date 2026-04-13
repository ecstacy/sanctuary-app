export default function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div className="bg-[#fde8e0] text-[#a73b21] text-xs font-label px-4 py-3 rounded-lg">
      {message}
    </div>
  )
}
