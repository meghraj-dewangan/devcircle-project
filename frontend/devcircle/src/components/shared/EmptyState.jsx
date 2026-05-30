
const EmptyState = ({ message = 'Nothing here yet' }) => {
    
  return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default EmptyState
