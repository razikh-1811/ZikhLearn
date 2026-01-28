import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react'; // ✅ Import Clerk Auth
import axios from 'axios';
import './CourseEditor.css';

const CourseEditor = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth(); // ✅ Hook to get fresh Clerk JWT
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const token = await getToken({template:"backend"}); // ✅ Use Clerk Token
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCourse(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error loading course", err);
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, getToken]);

    // --- CURRICULUM MANAGEMENT ---

    const addChapter = () => {
        setCourse({
            ...course,
            curriculum: [...course.curriculum, { chapterTitle: "New Chapter", lessons: [] }]
        });
    };

    const deleteChapter = (cIdx) => {
        if (window.confirm("Delete this entire chapter and its lessons?")) {
            const newCur = course.curriculum.filter((_, index) => index !== cIdx);
            setCourse({ ...course, curriculum: newCur });
        }
    };

    const addLesson = (cIdx) => {
        const newCur = [...course.curriculum];
        newCur[cIdx].lessons.push({ 
            title: "New Lesson", 
            contentType: "video", 
            contentFile: null, 
            contentUrl: "" 
        });
        setCourse({ ...course, curriculum: newCur });
    };

    const deleteLesson = (cIdx, lIdx) => {
        const newCur = [...course.curriculum];
        newCur[cIdx].lessons.splice(lIdx, 1);
        setCourse({ ...course, curriculum: newCur });
    };

    const handleFileChange = (cIdx, lIdx, file) => {
        const newCur = [...course.curriculum];
        newCur[cIdx].lessons[lIdx].contentFile = file;
        newCur[cIdx].lessons[lIdx].contentUrl = ""; 
        setCourse({ ...course, curriculum: newCur });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = await getToken({template:"backend"}); // ✅ Get fresh Clerk Token for saving
            const formData = new FormData();
            formData.append('title', course.title);
            formData.append('description', course.description);
            formData.append('price', course.price);

            const curriculumStructure = course.curriculum.map(chapter => ({
                chapterTitle: chapter.chapterTitle,
                lessons: chapter.lessons.map(lesson => ({
                    title: lesson.title,
                    contentType: lesson.contentType,
                    contentUrl: lesson.contentUrl 
                }))
            }));
            formData.append('curriculum', JSON.stringify(curriculumStructure));

            course.curriculum.forEach(chapter => {
                chapter.lessons.forEach(lesson => {
                    if (lesson.contentFile) formData.append('files', lesson.contentFile);
                });
            });

            await axios.put(`${import.meta.env.VITE_API_URL}/api/courses/${courseId}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`
                     
                }
            });
            alert("Full course updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Error saving updates. Check your connection or role permissions.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="editor-loading">Fetching Course Content...</div>;

    return (
        <div className="course-editor-page">
            <header className="editor-top-nav">
                <div className="nav-left">
                    <button onClick={() => navigate("/faculty")} className="back-link">← Dashboard</button>
                    <h2>Edit Course: <span className="course-title-header">{course.title}</span></h2>
                </div>
                <button 
                    className="save-btn-primary" 
                    onClick={handleSave} 
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save All Changes"}
                </button>
            </header>

            <div className="editor-container-main">
                <main className="editor-form-area">
                    {/* General Settings */}
                    <section className="editor-section">
                        <h3>General Settings</h3>
                        <div className="input-row">
                            <div className="input-group">
                                <label>Course Title</label>
                                <input type="text" value={course.title} onChange={(e) => setCourse({...course, title: e.target.value})} />
                            </div>
                            <div className="input-group price-group">
                                <label>Price (₹)</label>
                                <input type="number" value={course.price} onChange={(e) => setCourse({...course, price: e.target.value})} />
                            </div>
                        </div>
                    </section>

                    {/* Curriculum Section */}
                    <section className="editor-section">
                        <div className="section-header">
                            <h3>Full Curriculum Builder</h3>
                        </div>
                        
                        {course.curriculum.map((chapter, cIdx) => (
                            <div key={cIdx} className="chapter-edit-card">
                                <div className="chapter-header">
                                    <input 
                                        className="chapter-title-edit" 
                                        value={chapter.chapterTitle} 
                                        onChange={(e) => {
                                            const n = [...course.curriculum];
                                            n[cIdx].chapterTitle = e.target.value;
                                            setCourse({...course, curriculum: n});
                                        }}
                                    />
                                    <button className="del-btn-text" onClick={() => deleteChapter(cIdx)}>Delete Chapter</button>
                                </div>

                                <div className="lesson-edit-list">
                                    {chapter.lessons.map((lesson, lIdx) => (
                                        <div key={lIdx} className="lesson-edit-item-upload">
                                            <div className="lesson-row-top">
                                                <input 
                                                    className="lesson-title-input"
                                                    value={lesson.title} 
                                                    placeholder="Lesson Title"
                                                    onChange={(e) => {
                                                        const n = [...course.curriculum];
                                                        n[cIdx].lessons[lIdx].title = e.target.value;
                                                        setCourse({...course, curriculum: n});
                                                    }}
                                                />
                                                <button className="del-btn-sm" onClick={() => deleteLesson(cIdx, lIdx)}>×</button>
                                            </div>
                                            
                                            <div className="file-upload-zone">
                                                <input type="file" onChange={(e) => handleFileChange(cIdx, lIdx, e.target.files[0])} />
                                                {lesson.contentUrl ? (
                                                    <span className="status-ok">Current: {lesson.contentUrl.split('-').pop()}</span>
                                                ) : lesson.contentFile ? (
                                                    <span className="status-new">Selected: {lesson.contentFile.name}</span>
                                                ) : (
                                                    <span className="status-empty">No file attached</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <button className="add-lesson-btn" onClick={() => addLesson(cIdx)}>+ Add Lesson</button>
                                </div>
                            </div>
                        ))}

                        <div className="curriculum-footer">
                            <button className="add-chapter-btn-outline" onClick={addChapter}>
                                + Add New Chapter
                            </button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default CourseEditor;
