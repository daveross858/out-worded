"use client";
import React, { useState, useEffect, useRef } from 'react';

const VOWELS = ['a', 'e', 'i', 'o', 'u'];
const SUFFIXES = ['ing', 'ed', 'ly', 'ship', 'tion'];
const PREFIXES = ['Ba', 'Be', 'Bi', 'Bo', 'Bu'];

      function isValidWord(word, prefix) {
        if (!word || word.length < 4) return false; // no 3-letter words
        if (!word.toLowerCase().startsWith(prefix.toLowerCase())) return false;
        let hasPattern = false;
        for (let i = 0; i < word.length - 1; i++) {
          if (!VOWELS.includes(word[i].toLowerCase()) && VOWELS.includes(word[i + 1].toLowerCase())) {
            hasPattern = true;
            break;
          }
        }
        let hasSuffix = SUFFIXES.some(suffix => word.toLowerCase().endsWith(suffix));
        return hasPattern || hasSuffix;
      }

      function getScore(word, timeTaken) {
        let base = word.length;
        if (SUFFIXES.some(suffix => word.endsWith(suffix))) base += 2;
        if (base > 0 && timeTaken < 10) base += 1;
        return base;
      }

      export default function OutWordedGame() {
  const [playerWords, setPlayerWords] = useState([]);
  const [opponentWords, setOpponentWords] = useState([]);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API (SpeechRecognition)
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (e) => {
      const last = e.results.length - 1;
      const transcript = e.results[last][0].transcript;
      if (transcript) {
        setInput(transcript.trim());
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  function startListening() {
    if (!recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setMessage('Listening…');
    } catch (e) {
      // ignore start errors when already started
    }
  }

  function stopListening() {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }

  function toggleListening() {
    if (isListening) stopListening(); else startListening();
  }

  function handlePlay() {
  setIsPaused(false);
  setIsStopped(false);
  setIsStarted(true);
  setMessage('Game started!');
  }

  function handlePause() {
    setIsPaused(true);
    setMessage('Game paused.');
  }

  function handleStop() {
    setIsStopped(true);
    setIsPaused(false);
    setTimer(30);
  setIsStarted(false);
  setMessage('Game stopped.');
  }
  useEffect(() => {
    if (!isStarted || isStopped) return;
    if (timer === 0) {
      setMessage('Time up! Turn skipped.');
      setIsPlayerTurn(false);
      setTimeout(() => {
        handleOpponentTurn();
      }, 1000);
      return;
    }
    if (!isPlayerTurn || isPaused) return;
    const interval = setInterval(() => {
      setTimer(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isPlayerTurn, isPaused, isStopped, isStarted]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!isPlayerTurn) return;
    if (!isValidWord(input, PREFIXES[round % PREFIXES.length])) {
      setMessage('Invalid word (min 4 letters, must match prefix, pattern or suffix).');
      setInput('');
      return;
    }
    setPlayerWords([...playerWords, input]);
    const score = getScore(input, 30 - timer);
    setPlayerScore(playerScore + score);
    setMessage(`Valid! +${score} points.`);
    setInput('');
    setIsPlayerTurn(false);
  handleOpponentTurn();
  }

  function handleOpponentTurn() {
    const prefix = PREFIXES[round % PREFIXES.length];
    const oppWord = generateOpponentWord(prefix);
    setOpponentWords([...opponentWords, oppWord]);
    const oppScore = getScore(oppWord, Math.random() * 10);
    setOpponentScore(opponentScore + oppScore);
    setMessage(`Opponent played: ${oppWord} (+${oppScore})`);
    setRound(round + 1);
    setIsPlayerTurn(true);
    setTimer(30);
  }

  function generateOpponentWord(prefix) {
    const words = [
      prefix + 'king',
      prefix + 'tion',
      prefix + 'ing',
      prefix + 'ed',
      prefix + 'ly',
      prefix + 'ship',
    ];
    return words[Math.floor(Math.random() * words.length)];
  }

  return (
  <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
    <div
      className="w-[350px] max-w-full h-[700px] bg-gray-900 rounded-[2.5rem] shadow-2xl border-4 border-gray-700 flex flex-col mx-auto p-4 pt-16 relative overflow-y-auto"
      style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Notch */}
  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-gray-700 rounded-full"></div>
      <div className="flex justify-center mt-6 mb-2">
        <div className="bg-white rounded-xl px-4 py-3 flex flex-col items-center">
          <img src="/outworded_traced.svg" alt="OutWorded Logo" className="h-16 w-auto" />
          <span className="mt-2 text-2xl font-bold text-gray-900 tracking-wide">OutWorded</span>
        </div>
      </div>
      {!
        isStarted ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-gray-100 mb-4">Welcome to OutWorded</h1>
            <p className="text-gray-300 max-w-xs mb-6">Press start to begin your game. Build words with the round prefix or finish with a bonus suffix.</p>
            <button
              onClick={handlePlay}
              className="bg-green-600 text-white text-lg px-8 py-4 rounded-2xl shadow-lg hover:bg-green-700"
            >
              Start Game
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-4 mt-2">
              <button
                onClick={handlePlay}
                disabled={!isPaused && !isStopped}
                className="bg-green-700 text-white px-4 py-2 rounded-full shadow hover:bg-green-800 disabled:opacity-50"
              >
                Start
              </button>
              <button
                onClick={handlePause}
                disabled={isPaused || isStopped}
                className="bg-yellow-600 text-white px-4 py-2 rounded-full shadow hover:bg-yellow-700 disabled:opacity-50"
              >
                Pause
              </button>
              <button
                onClick={handleStop}
                disabled={isStopped}
                className="bg-red-700 text-white px-4 py-2 rounded-full shadow hover:bg-red-800 disabled:opacity-50"
              >
                Stop
              </button>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 mb-3 text-center">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-blue-900/40 border border-blue-500/60 shadow">
                <span className="text-xs uppercase tracking-wider mr-2 text-blue-300">Prefix</span>
                <span className="text-3xl font-extrabold text-blue-400">{PREFIXES[round % PREFIXES.length]}</span>
              </div>
              <p className="mt-2 text-sm text-gray-400">Build words that follow the pattern (alphabet + vowel) or end with: <span className="font-semibold text-gray-200">{SUFFIXES.join(', ')}</span></p>
            </div>
            <div className="flex flex-col items-center mb-2">
              <p className="text-xl font-mono mb-1 text-gray-100">⏰ <span className="font-bold text-blue-400">{timer}s</span></p>
              <p className="text-sm text-gray-400">{isPlayerTurn ? 'Your turn' : 'Opponent turn'} {isPaused ? '(Paused)' : ''} {isStopped ? '(Stopped)' : ''}</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-2">
              <div className="relative w-full">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Enter word starting with ${PREFIXES[round % PREFIXES.length]}`}
                  className="w-full pr-12 px-3 py-2 rounded-lg border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500"
                  disabled={!isPlayerTurn || timer === 0 || isPaused || isStopped || !isStarted}
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={!isStarted || !isPlayerTurn || isPaused || isStopped || !isSpeechSupported}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-sm shadow ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white disabled:opacity-50`}
                >
                  {isListening ? 'Stop' : '🎤 Speak'}
                </button>
              </div>
              <span className="text-xs text-gray-400 min-h-[1rem]">{!isSpeechSupported ? 'Voice input not supported in this browser.' : (isListening ? 'Listening…' : '')}</span>
              <button
                type="submit"
                disabled={!isPlayerTurn || timer === 0 || isPaused || isStopped || !isStarted}
                className="w-full bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50"
              >
                Submit
              </button>
            </form>
            <p className="text-center text-sm text-red-400 mb-2 min-h-[1.5rem]">{message}</p>
            <div className="flex justify-between gap-4 mt-2">
              <div className="bg-blue-950 rounded-xl p-2 flex-1">
                <h4 className="text-blue-300 font-semibold text-center mb-1">You</h4>
                <ul className="list-disc list-inside text-sm mb-1 text-gray-100">
                  {playerWords.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
                <div className="text-center font-bold text-blue-400">Score: {playerScore}</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-2 flex-1">
                <h4 className="text-gray-300 font-semibold text-center mb-1">Opponent</h4>
                <ul className="list-disc list-inside text-sm mb-1 text-gray-100">
                  {opponentWords.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
                <div className="text-center font-bold text-gray-400">Score: {opponentScore}</div>
              </div>
            </div>
          </>
        )}
  {/* Home bar */}
  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-2 bg-gray-300 rounded-full"></div>
    </div>
  </div>
  );
}
