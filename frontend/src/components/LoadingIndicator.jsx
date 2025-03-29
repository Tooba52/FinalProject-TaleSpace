// Importing the CSS file for the styling of the LoadingIndicator
import "../styles/LoadingIndicator.css";

// LoadingIndicator component that displays a loading spinner
const LoadingIndicator = () => {
  // Returns a div with a loader inside, which is styled in the CSS file
  return (
    <div className="loading-container">
      <div className="loader"></div> {/* The loader itself */}
    </div>
  );
};

// Exporting the LoadingIndicator component for use in other files
export default LoadingIndicator;
