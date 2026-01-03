import "./CategoryBar.css";

const CategoryBar = ({ setSelectedCategory, selectedCategory }) => {
  const categories = [
    "All", "Engineering", "Sciences", "Mathematics", 
    "Computer Science", "Business", "Health"
  ];

  return (
    <div className="category-bar">
      <ul className="category-list">
        {categories.map((cat) => (
          <li key={cat}>
            <button 
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryBar;