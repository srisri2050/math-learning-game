import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import correctSound from "./sounds/correct.mp3";
import wrongSound from "./sounds/wrong.mp3";
import gameOverSound from "./sounds/gameover.mp3";

const levels = [
  "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", 
  "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", 
  "Grade 10", "Grade 11", "Grade 12"
];

// Function to generate dynamic questions based on grade
const generateQuestion = (level) => {
  const operations = ["+", "-", "×", "÷"];
  let question, answer;

  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  switch (level) {
    case "Kindergarten":
    case "Grade 1":
    case "Grade 2":
    case "Grade 3":
      // Basic Arithmetic Questions
      switch (operation) {
        case "+":
          question = `${num1} + ${num2}`;
          answer = (num1 + num2).toString();
          break;
        case "-":
          question = `${num1} - ${num2}`;
          answer = (num1 - num2).toString();
          break;
        case "×":
          question = `${num1} × ${num2}`;
          answer = (num1 * num2).toString();
          break;
        case "÷":
          question = `${num1 * num2} ÷ ${num2}`;
          answer = num1.toString();
          break;
        default:
          question = "Error generating question";
          answer = "";
      }
      break;

    case "Grade 4":
    case "Grade 5":
      // Adding Fractions
      const numerator = Math.floor(Math.random() * 5) + 1;
      const denominator = Math.floor(Math.random() * 5) + 2; // Avoiding zero as denominator
      question = `What is ${numerator}/${denominator} + ${num1}/${num2}?`;
      answer = ((numerator / denominator) + (num1 / num2)).toFixed(2).toString();
      break;

    case "Grade 6":
    case "Grade 7":
      // Exponents and Square Roots
      const base = Math.floor(Math.random() * 5) + 2;
      const exponent = Math.floor(Math.random() * 3) + 2;
      question = `What is ${base} raised to the power of ${exponent}?`;
      answer = Math.pow(base, exponent).toString();
      break;

    case "Grade 8":
    case "Grade 9":
      // Simple Algebra
      const variable = Math.floor(Math.random() * 10) + 1;
      question = `Solve for x: 2x + ${num1} = ${num2 * variable}`;
      answer = (num2 * variable - num1) / 2;
      break;

    case "Grade 10":
    case "Grade 11":
    case "Grade 12":
      // Quadratic Equations
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const c = Math.floor(Math.random() * 5) - 5;
      question = `Solve the quadratic equation: ${a}x² + ${b}x + ${c} = 0`;
      // Solving quadratic equation using the quadratic formula
      const discriminant = Math.pow(b, 2) - 4 * a * c;
      if (discriminant >= 0) {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        answer = `${root1.toFixed(2)}, ${root2.toFixed(2)}`;
      } else {
        answer = "No real solutions";
      }
      break;

    default:
      question = "Error generating question";
      answer = "";
  }

  return { question, answer };
};

export default function MathGame() {
  const [level, setLevel] = useState("Kindergarten");
  const [question, setQuestion] = useState(generateQuestion(level));
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [name, setName] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState(
    JSON.parse(localStorage.getItem("leaderboard")) || []
  );
  const [timeLimit, setTimeLimit] = useState("Unlimited");
  const [playCorrect] = useSound(correctSound);
  const [playWrong] = useSound(wrongSound);
  const [playGameOver] = useSound(gameOverSound);

  useEffect(() => {
    let countdown;
    if (timeLimit !== "Unlimited") {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            playGameOver();
            endGame();
          }
          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [timeLimit]);

  const endGame = () => {
    setGameOver(true);
    saveLeaderboard();
  };

  const saveLeaderboard = () => {
    if (name && score > 0) {
      const newLeaderboard = [...leaderboard, { name, score }];
      newLeaderboard.sort((a, b) => b.score - a.score);
      newLeaderboard.splice(5); // Keep top 5 scores
      setLeaderboard(newLeaderboard);
      localStorage.setItem("leaderboard", JSON.stringify(newLeaderboard));
    }
  };

  const checkAnswer = () => {
    if (userAnswer === question.answer) {
      setFeedback("✅ Correct!");
      setScore(score + 1);
      playCorrect();
      setQuestion(generateQuestion(level));
      setUserAnswer("");
    } else {
      setFeedback("❌ Try Again!");
      playWrong();
    }
  };

  const startNewGame = () => {
    setLevel("Kindergarten");
    setQuestion(generateQuestion("Kindergarten"));
    setUserAnswer("");
    setFeedback("");
    setScore(0);
    setTimer(30);
    setGameOver(false);
    setName("");
  };

  return (
    <div className="container">
      <motion.h1 className="header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Math Learning Game
      </motion.h1>
      
      {gameOver ? (
        <div className="game-over">
          <p className="game-over-title">Game Over!</p>
          <p className="score">Your Score: {score}</p>
          <div className="name-input">
            <label className="label">Enter your name for the leaderboard:</label>
            <input 
              type="text" 
              className="input"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <button 
              className="button" 
              onClick={saveLeaderboard}
            >
              Save Score
            </button>
          </div>
          <div className="leaderboard">
            <h3 className="leaderboard-title">Leaderboard</h3>
            <ul>
              {leaderboard.map((entry, index) => (
                <li key={index} className="leaderboard-item">
                  <span>{entry.name}</span>
                  <span>{entry.score}</span>
                </li>
              ))}
            </ul>
          </div>
          <button 
            className="button" 
            onClick={startNewGame}
          >
            Start New Game
          </button>
        </div>
      ) : (
        <div className="game-container">
          <p className="time-left">Time Left: {timeLimit === "Unlimited" ? "Unlimited" : `${timer}s`}</p>
          
          <label className="label">Select Time Limit:</label>
          <select 
            className="select" 
            onChange={(e) => setTimeLimit(e.target.value)} 
            value={timeLimit}
          >
            <option value="Unlimited">Unlimited</option>
            <option value="30">30 Seconds</option>
            <option value="60">60 Seconds</option>
            <option value="90">90 Seconds</option>
          </select>

          <label className="label">Select Grade Level:</label>
          <select 
            className="select" 
            onChange={(e) => {
              setLevel(e.target.value);
              setQuestion(generateQuestion(e.target.value));
              setFeedback("");
            }}
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>

          <p className="question">{question.question}</p>
          <input 
            type="text" 
            className="input"
            placeholder="Enter your answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
          <button 
            className="button"
            onClick={checkAnswer}
          >
            Submit Answer
          </button>
          <p className="feedback">{feedback}</p>
          <p className="score">Score: {score}</p>
        </div>
      )}
    </div>
  );
}
