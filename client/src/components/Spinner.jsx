// === Spinner.jsx ===

const Spinner = ({ text = "Loading..." }) => (
  <div className="spinner">
    <div className="spinner-icon"></div>
    <p>{text}</p>
  </div>
);

export default Spinner;