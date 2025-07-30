const Spinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center text-blue-500 py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mb-2"></div>
    <p>{text}</p>
  </div>
);

export default Spinner;