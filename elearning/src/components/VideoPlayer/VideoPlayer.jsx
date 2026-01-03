import React from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ src, title }) => {
  if (!src) {
    return <div className="video-error">No video source available</div>;
  }

  return (
    <div className="video-player-container">
      <video
        key={src}
        controls
        autoPlay
        className="video-element"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="video-meta">
        <span className="now-playing-tag">NOW PLAYING</span>
        <h2>{title}</h2>
      </div>
    </div>
  );
};

export default VideoPlayer;
