
import React from "react";
import aravindImg from "../assets/aravind.jpg";
import chinnuImg from "../assets/chinnu.jpg";
import "./Practice.css";

const ChinnuPractice = () => {
  return (
    <div className="practice-container">
      <h2><span className="highlight">English Speaking Partner</span></h2>
      <p>Practice your English conversation skills with AI assistance</p>

      <div className="chat-card">
        <div className="chat-header">
          <strong>Conversation</strong>
          <select>
            <option>Choose a Conversation Topic</option>
            <option>Shopping</option>
            <option>Job Interview</option>
          </select>
        </div>

        <div className="chat-body">
          <p className="bot-msg">
            Hello! I'm your AI speaking partner. I'm here to help you practice English conversation. Choose a topic or just start talking!
          </p>
          <div className="avatars">
            <div className="action">
              <img src={chinnuImg} alt="Speak" />
              <p>Speak</p>
            </div>
            <div className="action">
              <img src={aravindImg} alt="Listen" />
              <p>Listen</p>
            </div>
          </div>
          <input type="text" placeholder="Type Your Message..." />
        </div>
      </div>

      <div className="tips">
        <div className="tip blue">
          <strong>Listen Carefully</strong>
          <p>Pay attention to pronunciation and intonation.</p>
        </div>
        <div className="tip green">
          <strong>Practice Regularly</strong>
          <p>Even 10 minutes daily can boost your skills.</p>
        </div>
        <div className="tip gray">
          <strong>Don't Fear Mistakes</strong>
          <p>Focus on communication rather than perfection.</p>
        </div>
      </div>
    </div>
  );
};

export default ChinnuPractice;
