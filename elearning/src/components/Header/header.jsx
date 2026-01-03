import './Header.css';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-left">
        <div className="logo">EduPlatform</div>
        <button className="categories-btn">Categories</button>
      </div>
      
      <div className="header-center">
        <div className="search-bar-wrapper">
          <input type="text" placeholder="Search for anything..." className="search-input" />
          <button className="search-icon-btn">🔍</button>
        </div>
      </div>

      <div className="header-right">
        <span className="nav-text">Teach on EduPlatform</span>
        <div className="header-btns">
          <button className="btn-outline">Log in</button>
          <button className="btn-dark">Sign up</button>
        </div>
      </div>
    </header>
  );
};

export default Header;