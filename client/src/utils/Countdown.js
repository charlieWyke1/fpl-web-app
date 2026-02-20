import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext.js";

import "./Countdown.css";

export default function Countdown({ targetDate, onExpired }) {
  const { user } = useUser();
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  // Helper function to calculate time left
  function getTimeLeft() {
    const now = new Date();
    const difference = targetDate - now;

    if (difference <= 0) return null; // Countdown finished

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  // Update every second
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTime = getTimeLeft();
      setTimeLeft(updatedTime);

      if (!updatedTime) {
        onExpired?.(true); // notify parent
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpired]);

  if (!timeLeft) {
    return <span>Cut-off passed!</span>;
  }

  return (
    <div className="countDown">
      <h4>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
        {timeLeft.seconds}s
      </h4>
      <h5>Untill GameWeek {user?.currentGW} deadline</h5>
    </div>
  );
}
