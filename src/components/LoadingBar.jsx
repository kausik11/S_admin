const LoadingBar = ({ active }) => (
  <div className={active ? "loading-bar active" : "loading-bar"}>
    <span />
  </div>
);

export default LoadingBar;
