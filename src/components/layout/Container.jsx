const Container = ({ children }) => {
  return (
    <div
      className="
        min-h-screen 
        flex flex-col 
        p-4 gap-4
        overflow-x-hidden
      "
    >
      {children}
    </div>
  );
};

export default Container;