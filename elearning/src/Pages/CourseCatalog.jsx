import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from 'axios';
import './CourseCatalog.css';

const CourseCatalog = ({ searchQuery = "" }) => {
    const { user, isLoaded: userLoaded } = useUser();
    const { getToken } = useAuth();
    const [courses, setCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState([]); 
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const categories = ["All", "Engineering", "Science", "Maths", "Computer Science", "Others"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const courseRes = await axios.get('http://localhost:5000/api/courses');
                
                if (user) {
                    const token = await getToken();
                    const userRes = await axios.get('http://localhost:5000/api/users/profile-status', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const ids = userRes.data.enrolledCourses?.map(id => id.toString()) || [];
                    setEnrolledIds(ids);
                }
                setCourses(courseRes.data);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userLoaded) fetchData();
    }, [user, userLoaded, getToken]);

    const filteredCourses = courses.filter(course => {
        const isEnrolled = enrolledIds.includes(course._id.toString());
        if (isEnrolled) return false;

        const dbCategory = course.category ? course.category.trim() : "";
        const categoryMatch = selectedCategory === "All" || 
                              dbCategory.toLowerCase() === selectedCategory.toLowerCase();
        
        const searchMatch = (course.title || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        return categoryMatch && searchMatch;
    });

    // ✅ UPDATED LOADING SECTION ONLY
    if (loading || !userLoaded) {
        return (
            <div className="catalog-loader-container">
                <div className="catalog-spinner"></div>
                <p>Syncing Catalog...</p>
            </div>
        );
    }

    return (
        <div className="catalog-wrapper">
            <header className="catalog-hero">
                <h1>Unlock Your Potential</h1>
                <p>Browse our specialized modules in Engineering and Sciences.</p>
            </header>

            <div className="category-filter-bar">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="catalog-grid">
                {filteredCourses.map(course => (
                    <div key={course._id} className="course-card-ui" onClick={() => navigate(`/course/${course._id}`)}>
                        <div className="course-thumb">
                            <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} />
                        </div>
                        <div className="course-details">
                            <span className="card-cat-tag">{course.category}</span>
                            <h3>{course.title}</h3>
                            <div className="course-meta">
                                <span className="price-tag-ui">₹{course.price}</span>
                                <button className="view-btn">View Details</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseCatalog;