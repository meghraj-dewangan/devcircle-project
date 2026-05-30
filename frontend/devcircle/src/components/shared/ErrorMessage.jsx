
const ErrorMessage = ({ message }) => {
    
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-3">
      {message}
    </div>
  )
}

export default ErrorMessage
