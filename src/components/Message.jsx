const Message = ({ notice, error }) => {
  if (!notice && !error) return null;

  return (
    <div className={`message ${error ? "error" : "notice"}`}>
      {error || notice}
    </div>
  );
};

export default Message;
