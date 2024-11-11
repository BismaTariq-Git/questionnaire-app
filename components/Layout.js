import '../styles/globals.css';

const Layout = ({ children }) => {
  return (
    <main className="flex-1 bg-gradient-to-r from-[#010101] to-[#4D4D4D] min-h-screen">
      {children}
    </main>
  );
};

export default Layout;
