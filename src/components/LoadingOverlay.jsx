const LoadingOverlay = ({ active }) => {
  if (!active) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
    </div>
  );
};

export default LoadingOverlay;
