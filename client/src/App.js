import { useEffect, useRef, useState } from "react";

const sentences = [
  "The quick brown fox jumps over the lazy dog",
  "Machine learning models require good data",
  "Typing speed varies from person to person",
  "Behavioral patterns help identify users",
  "Data collection must respect privacy rules"
];

function App() {
  const [userId, setUserId] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [currentSentence, setCurrentSentence] = useState("");
  const [inputText, setInputText] = useState("");

  const sessionId = useRef(null);

  const data = useRef({
    session_id: "",
    user_id: "",
    mouse: [],
    clicks: [],
    scroll: [],
    keyboard_timings: [],
    target_sentence: "",
    typed_text: ""
  });

  const lastMouseTime = useRef(0);
  const lastKeyTime = useRef(null);
  const lastScrollTime = useRef(0);

  // ------------------ START SESSION ------------------

  const startSession = () => {
    if (!userId.trim()) {
      alert("Enter User ID first");
      return;
    }

    const randomSentence =
      sentences[Math.floor(Math.random() * sentences.length)];

    const newSessionId = crypto.randomUUID();
    sessionId.current = newSessionId;

    data.current = {
      session_id: newSessionId,
      user_id: userId,
      mouse: [],
      clicks: [],
      scroll: [],
      keyboard_timings: [],
      target_sentence: randomSentence,
      typed_text: ""
    };

    setCurrentSentence(randomSentence);
    setInputText("");
    setIsRecording(true);

    console.log("Session started:", newSessionId);
  };

  // ------------------ STOP + SUBMIT ------------------

  const stopSession = async () => {
    setIsRecording(false);

    data.current.typed_text = inputText;

    try {
      await fetch("http://localhost:5000/api/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data.current)
      });

      console.log("Session saved");
    } catch (err) {
      console.error("Error saving session:", err);
    }
  };

  // ------------------ TRACKING ------------------

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isRecording) return;

      const now = Date.now();
      if (now - lastMouseTime.current > 100) {
        data.current.mouse.push({
          x: e.clientX,
          y: e.clientY,
          t: now
        });
        lastMouseTime.current = now;
      }
    };

    const handleClick = (e) => {
      if (!isRecording) return;

      data.current.clicks.push({
        x: e.clientX,
        y: e.clientY,
        t: Date.now()
      });
    };

    const handleScroll = () => {
      if (!isRecording) return;

      const now = Date.now();

      if (now - lastScrollTime.current > 150) {
        data.current.scroll.push({
          y: window.scrollY,
          t: now
        });

        lastScrollTime.current = now;
      }
    };

    const handleKeyDown = () => {
      if (!isRecording) return;

      const now = Date.now();
      if (lastKeyTime.current !== null) {
        data.current.keyboard_timings.push(
          now - lastKeyTime.current
        );
      }
      lastKeyTime.current = now;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRecording]);

  // ------------------ UI ------------------

  return (
    <div style={{ height: "2000px", padding: "20px" }}>
      <h2>Behavior Data Collection</h2>

      {!isRecording && (
        <>
          <input
            placeholder="Enter User ID (e.g. user_1)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ marginRight: "10px", padding: "5px" }}
          />

          <button onClick={startSession}>
            Start New Session
          </button>
        </>
      )}

      {isRecording && (
        <>
          <p><b>Type this sentence:</b></p>
          <p style={{ color: "blue" }}>{currentSentence}</p>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            cols={60}
          />

          <br /><br />

          <button onClick={stopSession}>
            Submit & Stop
          </button>
        </>
      )}
    </div>
  );
}

export default App;