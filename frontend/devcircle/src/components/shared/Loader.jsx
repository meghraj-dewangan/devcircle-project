
// Simple spinner shown when data is loading
const Loader = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  )
}

export default Loader
