import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react'; // ✅ New import for Clerk Auth
import './FacultyDashboard.css';

// Sub-components
import MyContent from './MyContent';
import Analytics from './Analytics';
import Settings from './Settings';


const emptyLesson = { title: '', contentFile: null, contentType: 'video' };
const emptyChapter = { chapterTitle: '', lessons: [emptyLesson] };

const FacultyDashboard = () => {
  const { getToken } = useAuth(); // ✅ Hook to retrieve the Clerk JWT token
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Engineering'
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [curriculum, setCurriculum] = useState([emptyChapter]);
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);

  // --- LOGIC ---
  const addChapter = () => {
    setCurriculum(prev => [...prev, { chapterTitle: '', lessons: [{ ...emptyLesson }] }]);
  };

  const deleteChapter = (cIdx) => {
    if (curriculum.length === 1) return alert('At least one chapter is required.');
    setCurriculum(prev => prev.filter((_, i) => i !== cIdx));
  };

  const addLesson = (cIdx) => {
    setCurriculum(prev =>
      prev.map((chapter, i) =>
        i === cIdx
          ? { ...chapter, lessons: [...chapter.lessons, { ...emptyLesson }] }
          : chapter
      )
    );
  };

  const deleteLesson = (cIdx, lIdx) => {
    setCurriculum(prev =>
      prev.map((chapter, i) => {
        if (i !== cIdx) return chapter;
        if (chapter.lessons.length === 1) {
          alert('At least one lesson is required.');
          return chapter;
        }
        return {
          ...chapter,
          lessons: chapter.lessons.filter((_, j) => j !== lIdx)
        };
      })
    );
  };

  const handlePublish = async () => {
    if (!courseData.title.trim() || !courseData.description.trim() || !courseData.category) {
      return alert('Please fill all course details.');
    }
    if (!thumbnail) return alert('Please upload a course thumbnail.');

    setLoading(true);

    try {
      // ✅ Retrieve the secure Clerk Token for the backend middleware
     const token = await getToken({ template: "backend" });
 
      
      const formData = new FormData();
      formData.append('title', courseData.title.trim());
      formData.append('description', courseData.description.trim());
      formData.append('price', courseData.price);
      formData.append('category', courseData.category);
      formData.append('thumbnail', thumbnail);

      const curriculumStructure = curriculum.map(chapter => ({
        chapterTitle: chapter.chapterTitle,
        lessons: chapter.lessons.map(lesson => ({
          title: lesson.title,
          contentType: lesson.contentType
        }))
      }));
      formData.append('curriculum', JSON.stringify(curriculumStructure));

      curriculum.forEach(chapter =>
        chapter.lessons.forEach(lesson => {
          if (lesson.contentFile) {
            formData.append('files', lesson.contentFile);
          }
        })
      );

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/courses/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Passes Clerk token to backend
            
          }
        }
      );

      alert('Course uploaded successfully!');
      setActiveTab('my-content');
    } catch (err) {
      console.error("Upload Error:", err);
      const msg = err.response?.data?.message || 'Upload failed.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">EduPlatform Instructor</div>
        <nav className="sidebar-nav">
          {[
            ['create', '🛠️ Create Course'],
            ['my-content', '📚 My Content'],
            ['analytics', '📊 Analytics'],
            ['settings', '⚙️ Settings']
          ].map(([key, label]) => (
            <div
              key={key}
              className={`nav-item ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </div>
          ))}
        </nav>
      </aside>

      <main className="dashboard-content">
        
        {activeTab === 'create' && (
          <div className="fade-in">
            <header className="content-header">
              <h1>Build New Course</h1>
              <button
                className="publish-btn-main"
                onClick={handlePublish}
                disabled={loading}
              >
                {loading ? 'Publishing...' : '🚀 Publish Now'}
              </button>
            </header>

            <section className="admin-card">
              <div className="card-title-row">
                <h3>General Information</h3>
              </div>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Course Title"
                  value={courseData.title}
                  onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price (₹)" 
                  value={courseData.price}
                  onChange={e => setCourseData({ ...courseData, price: e.target.value })}
                />
                <select 
                  className="category-select"
                  value={courseData.category}
                  onChange={e => setCourseData({ ...courseData, category: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Science">Science</option>
                  <option value="Maths">Maths</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <textarea
                className="textarea-field"
                placeholder="Briefly describe what students will learn..."
                value={courseData.description}
                onChange={e => setCourseData({ ...courseData, description: e.target.value })}
              />

              <div className="thumbnail-upload-zone">
                <input
                  type="file"
                  accept="image/*"
                  id="thumbnailInput"
                  className="hidden-input"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                />
                <label htmlFor="thumbnailInput" className="upload-label">
                  <span className="upload-icon">📸</span>
                  <span className="upload-text">
                    {thumbnail ? `Selected: ${thumbnail.name}` : 'Click to upload course thumbnail'}
                  </span>
                </label>
              </div>
            </section>

            <section className="admin-card">
              <div className="card-title-row">
                <h3>Curriculum Builder</h3>
                <button className="add-chapter-btn-top" onClick={addChapter}>+ New Chapter</button>
              </div>
              
              {curriculum.map((chapter, cIdx) => (
                <div key={cIdx} className="chapter-item">
                  <div className="chapter-head">
                    <input
                      className="chapter-title-input"
                      placeholder="Chapter Title"
                      value={chapter.chapterTitle}
                      onChange={e =>
                        setCurriculum(prev =>
                          prev.map((c, i) => i === cIdx ? { ...c, chapterTitle: e.target.value } : c)
                        )
                      }
                    />
                    <button className="icon-del-btn" title="Delete Chapter" onClick={() => deleteChapter(cIdx)}>🗑️</button>
                  </div>

                  <div className="lesson-list">
                    {chapter.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="lesson-item">
                        <input
                          className="lesson-name-input"
                          placeholder="Lesson Name"
                          value={lesson.title}
                          onChange={e =>
                            setCurriculum(prev =>
                              prev.map((c, i) =>
                                i === cIdx
                                  ? {
                                      ...c,
                                      lessons: c.lessons.map((l, j) => j === lIdx ? { ...l, title: e.target.value } : l)
                                    }
                                  : c
                              )
                            )
                          }
                        />
                        <div className="lesson-file-row">
                          <input
                            type="file"
                            className="mini-file-input"
                            onChange={e =>
                              setCurriculum(prev =>
                                prev.map((c, i) =>
                                  i === cIdx
                                    ? {
                                        ...c,
                                        lessons: c.lessons.map((l, j) => j === lIdx ? { ...l, contentFile: e.target.files[0] } : l)
                                      }
                                    : c
                                )
                              )
                            }
                          />
                          <select
                            className="mini-select"
                            value={lesson.contentType}
                            onChange={e =>
                              setCurriculum(prev =>
                                prev.map((c, i) =>
                                  i === cIdx
                                    ? {
                                        ...c,
                                        lessons: c.lessons.map((l, j) => j === lIdx ? { ...l, contentType: e.target.value } : l)
                                      }
                                    : c
                                )
                              )
                            }
                          >
                            <option value="video">Video</option>
                            <option value="pdf">PDF</option>
                          </select>
                        </div>
                        <button className="lesson-del-btn" onClick={() => deleteLesson(cIdx, lIdx)}>✕</button>
                      </div>
                    ))}
                    <button className="add-lesson-btn-inline" onClick={() => addLesson(cIdx)}>+ Add Lesson</button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'my-content' && <MyContent />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <Settings />}
      
      </main>
    </div>
  );
};

export default FacultyDashboard;
