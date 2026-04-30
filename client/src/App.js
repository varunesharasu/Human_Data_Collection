import { useEffect, useRef } from "react";

function App() {
  const sessionId = useRef(crypto.randomUUID());

  const data = useRef({
    session_id: sessionId.current,
    mouse: [],
    clicks: [],
    scroll: [],
    keyboard_timings: []
  });

  const lastMouseTime = useRef(0);
  const lastKeyTime = useRef(null);

  useEffect(() => {
    // ------------------ TRACKING ------------------

    const handleMouseMove = (e) => {
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
      data.current.clicks.push({
        x: e.clientX,
        y: e.clientY,
        t: Date.now()
      });
    };

    const handleScroll = () => {
      data.current.scroll.push({
        y: window.scrollY,
        t: Date.now()
      });
    };

    const handleKeyDown = () => {
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

    // ------------------ SENDER ------------------

    const sendBatch = async () => {
      if (
        data.current.mouse.length === 0 &&
        data.current.clicks.length === 0
      ) return;

      try {
        await fetch("http://localhost:5000/api/collect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data.current)
        });

        // CLEAR AFTER SEND
        data.current.mouse = [];
        data.current.clicks = [];
        data.current.scroll = [];
        data.current.keyboard_timings = [];

      } catch (err) {
        console.error("Send failed", err);
      }
    };

    const interval = setInterval(sendBatch, 5000);

    // ------------------ CLEANUP ------------------

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };

  }, []);

  return (
    <div style={{ height: "200vh", padding: "20px" }}>
      <h2>Behavior Tracking Page</h2>
      <textarea placeholder="Type something..." />

      <p>Move mouse, scroll, click, type...</p>
    </div>
  );
}

export default App;