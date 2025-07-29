import { Link } from "react-router-dom";
import { FaUserPlus, FaUserCheck, FaVideo, FaDatabase } from "react-icons/fa";
import './App.css';

function App() {
  const menuItems = [
    {
      title: "Add Info",
      icon: <FaUserPlus size={40} />,
      path: "/reg",
      bg: "card blue",
    },
    {
      title: "Register Face",
      icon: <FaUserCheck size={40} />,
      path: "/regface",
      bg: "card green",
    },
    {
      title: "Live Page",
      icon: <FaVideo size={40} />,
      path: "/output",
      bg: "card purple",
    },
    {
      title: "Records",
      icon: <FaDatabase size={40} />,
      path: "/rec",
      bg: "card pink",
    },
  ];

  return (
    <>
    <div className="bg-animation"></div>
    
    <div className="container">
      <h1 className="heading">🔐 FaceCrypt Dashboard</h1>
      <div className="grid">
        {menuItems.map((item, idx) => (
          <Link key={idx} to={item.path} className={item.bg}>
            <div className="icon">{item.icon}</div>
            <div className="title">{item.title}</div>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}

export default App;
