import React, { useEffect, useRef, useState } from "react";
import "./Dino.css";

function Dino() {
  const dinoRef = useRef();
  const cactusRef = useRef();
  const [score, setScore] = useState(0);

  const jump = () => {
    if (!!dinoRef.current && dinoRef.current.classList != "jump") {
      dinoRef.current.classList.add("jump");
      setTimeout(function () {
        !!dinoRef.current && dinoRef.current.classList.remove("jump");
      }, 300);
    }
  };

  useEffect(() => {
    const isAlive = setInterval(function () {
      // get current dino Y position
      const dinoTop = parseInt(
        !!dinoRef.current && getComputedStyle(dinoRef.current).getPropertyValue("top")
      );

      // get current cactus X position
      let cactusLeft = parseInt(
        !!cactusRef.current && getComputedStyle(cactusRef.current).getPropertyValue("left")
      );

      // detect collision
      if (cactusLeft < 40 && cactusLeft > 0 && dinoTop >= 140) {
        // collision
        setScore(0);
      } else {
        setScore(score + 1);
      }
    }, 10);

    return () => clearInterval(isAlive);
  });

  useEffect(() => {
    document.addEventListener("keydown", jump);
    return () => document.removeEventListener("keydown", jump);
  }, []);

  return (
    <div className="game">
      Score : {score}
      <div id="dino" ref={dinoRef} className="inline-block p-3 rounded-lg bg-neutral-700 text-white rounded-tl-none">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
          <div
            className="w-2 h-2 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
      <div id="cactus" ref={cactusRef}></div>
    </div>
  );
}

export default Dino;
