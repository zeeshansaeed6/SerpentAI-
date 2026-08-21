import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which of these features is a definitive sign of a venomous King Cobra?",
    options: [
      "Bright green color across the entire body",
      "Expandable neck hood with chevron/stripe patterns & distinctive hiss",
      "Rattle at the end of the tail",
      "Triangular body with blue spots"
    ],
    correct: 1,
    explanation: "King cobras can expand their hood when threatened and produce a unique low-frequency growling hiss. They are the longest venomous snakes on earth!"
  },
  {
    id: 2,
    question: "If someone is bitten by a venomous snake, what is the FIRST thing you should NEVER do?",
    options: [
      "Keep the victim calm and still",
      "Remove rings, watches, and tight clothing",
      "Cut the bite wound or try to suck out the venom",
      "Call emergency medical services immediately"
    ],
    correct: 2,
    explanation: "Cutting the wound or attempting to suck out venom does not remove venom, causes severe tissue damage/infection, and can poison the rescuer!"
  },
  {
    id: 3,
    question: "Is the popular pet snake 'Ball Python' venomous?",
    options: [
      "Yes, it has mild neurotoxic venom",
      "Yes, it has deadly hemotoxic venom",
      "No, it is a non-venomous constrictor and completely harmless to humans",
      "Only juveniles are venomous"
    ],
    correct: 2,
    explanation: "Ball Pythons (Python regius) are completely non-venomous constrictors. They curl into a ball when frightened, hence the name."
  },
  {
    id: 4,
    question: "Which Indian snake is part of the infamous 'Big Four' and causes the most bite fatalities worldwide?",
    options: [
      "Green Vine Snake",
      "Russell's Viper (Daboia russelii)",
      "Indian Rock Python",
      "Rat Snake (Dhaman)"
    ],
    correct: 1,
    explanation: "Russell's Viper is responsible for the vast majority of severe snakebite envenomations in Asia due to its potent hemotoxic venom and high venom yield."
  },
  {
    id: 5,
    question: "What is the primary difference between a Coral Snake (Deadly) and a Milk/Scarlet Kingsnake (Harmless)?",
    options: [
      "Red touches yellow = kill a fellow (Coral); Red touches black = venom lack (Milk snake)",
      "Milk snakes only live in water",
      "Coral snakes have rattles",
      "Milk snakes have hoods"
    ],
    correct: 0,
    explanation: "The famous rhyme 'Red on yellow, kill a fellow; red on black, friend of Jack' helps identify North American coral snakes from harmless mimic kingsnakes!"
  }
];

export default function QuizSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (idx) => {
    if (selectedOption !== null) return; // Prevent changing after selection
    setSelectedOption(idx);
    setShowExplanation(true);

    if (idx === currentQ.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderRadius: '24px' }}>
        {!quizFinished ? (
          <>
            {/* Header / Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <Award size={18} /> Snake ID & Safety Challenge
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', marginBottom: '2rem', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>

            {/* Question */}
            <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              {currentQ.question}
            </h3>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {currentQ.options.map((opt, idx) => {
                let btnStyle = {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1'
                };

                if (selectedOption !== null) {
                  if (idx === currentQ.correct) {
                    btnStyle = {
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10b981',
                      color: '#34d399'
                    };
                  } else if (idx === selectedOption) {
                    btnStyle = {
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #ef4444',
                      color: '#f87171'
                    };
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className="glass-card"
                    style={{
                      ...btnStyle,
                      padding: '1rem 1.25rem',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      cursor: selectedOption === null ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '12px'
                    }}
                  >
                    <span>{opt}</span>
                    {selectedOption !== null && (
                      idx === currentQ.correct ? (
                        <CheckCircle2 size={20} color="#34d399" />
                      ) : idx === selectedOption ? (
                        <XCircle size={20} color="#ef4444" />
                      ) : null
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div style={{
                background: selectedOption === currentQ.correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: selectedOption === currentQ.correct ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                color: '#e2e8f0',
                lineHeight: 1.5
              }}>
                <strong style={{ color: selectedOption === currentQ.correct ? '#34d399' : '#f87171' }}>
                  {selectedOption === currentQ.correct ? 'Correct! ' : 'Incorrect! '}
                </strong>
                {currentQ.explanation}
              </div>
            )}

            {/* Next button */}
            {selectedOption !== null && (
              <button
                onClick={handleNext}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
              >
                <span>{currentIndex + 1 === QUIZ_QUESTIONS.length ? 'See Final Score' : 'Next Question'}</span>
                <ArrowRight size={18} />
              </button>
            )}
          </>
        ) : (
          /* Finished Screen */
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#34d399'
            }}>
              <Sparkles size={45} />
            </div>

            <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>
              Quiz Completed!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.5rem' }}>
              You scored <strong style={{ color: '#34d399', fontSize: '1.4rem' }}>{score}</strong> out of <strong>{QUIZ_QUESTIONS.length}</strong>
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '14px',
              padding: '1.25rem',
              maxWidth: '450px',
              margin: '0 auto 2rem',
              border: '1px solid var(--border-glass)',
              fontSize: '0.9rem',
              color: '#cbd5e1'
            }}>
              {score === 5
                ? '🏆 Master Herpetologist! You have perfect instincts for snake safety & identification.'
                : score >= 3
                ? '🛡️ Great job! You know the critical rules to stay safe around venomous reptiles.'
                : '📚 Keep studying! Review the Encyclopedia guide to sharpen your snake knowledge.'}
            </div>

            <button onClick={restartQuiz} className="btn btn-primary">
              <RotateCcw size={18} /> Retake Quiz Challenge
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
