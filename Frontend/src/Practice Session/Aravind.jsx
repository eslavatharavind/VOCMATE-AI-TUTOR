import React, { useState } from "react";
import "./Aravind.css";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Aravind = () => {
  const { setvoiceId } = useUser();
  const navigate = useNavigate();

  const voices = [
    { label: "Alex", id: "UgBBYS2sOqTuMpoF3BR0", img: "/avatars/UgBBYS2sOqTuMpoF3BR0.png" },
    { label: "Mark", id: "ErXwobaYiN019PkySvjV", img: "/avatars/ErXwobaYiN019PkySvjV.png" },
    { label: "Bill", id: "TX3LPaxmHKxFdv7VOQHJ", img: "/avatars/TX3LPaxmHKxFdv7VOQHJ.png" },
    { label: "Lily", id: "cgSgspJ2msm6clMCkdW9", img: "/avatars/cgSgspJ2msm6clMCkdW9.png" },
    { label: "Anne", id: "21m00Tcm4TlvDq8ikWAM", img: "/avatars/21m00Tcm4TlvDq8ikWAM.png" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? voices.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === voices.length - 1 ? 0 : prev + 1));
  };

  const handleSelect = (id) => {
    setvoiceId(id);
    navigate("/practicetutor");
  };

  return (
    <div className="select_interviewer_page">
      <h2 className="select_interviewer_heading">SELECT YOUR TUTOR</h2>
      <div className="carousel-wrapper">
        <button className="carousel-btn prev" onClick={handlePrev}>&#8249;</button>

        <div className="carousel-slider">
          {voices.map((voice, index) => {
            const isActive = index === currentIndex;
            const isPrev = index === (currentIndex - 1 + voices.length) % voices.length;
            const isNext = index === (currentIndex + 1) % voices.length;

            const className = isActive
              ? "carousel-slide active"
              : isPrev
              ? "carousel-slide prev"
              : isNext
              ? "carousel-slide next"
              : "carousel-slide hidden";

            return (
              <div className={className} key={voice.id}>
                <button className="voice-button" onClick={() => handleSelect(voice.id)}>
                  <img className="voice-image" src={voice.img} alt={voice.label} />
                  <span className="voice-label">{voice.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        <button className="carousel-btn next" onClick={handleNext}>&#8250;</button>
      </div>
    </div>
  );
};

export default Aravind;
