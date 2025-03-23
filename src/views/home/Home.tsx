import { FileUp, NotebookPen } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const [isStaggerComplete, setIsStaggerComplete] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    if (isStaggerComplete) {
      const timer = setTimeout(() => {
        setShowCards(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isStaggerComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
        when: "beforeChildren",
        ease: "easeOut",
        onComplete: () => setIsStaggerComplete(true),
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const cardsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 90,
      },
    },
  };

  const waveVariants = {
    hidden: { rotate: 0 },
    wave: {
      rotate: [0, 15, -5, 15, 0],
      transition: {
        duration: 1.2,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
        repeat: 1,
        repeatDelay: 0.3,
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="flex flex-col h-full text-center items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-5xl font-medium tracking-tight text-white/70"
          variants={itemVariants}
        >
          Welcome, <span className="text-white/100">{user?.firstName}</span>{" "}
          <motion.span
            initial="hidden"
            animate={isStaggerComplete ? "wave" : "hidden"}
            variants={waveVariants}
            style={{ display: "inline-block", originX: 0.7, originY: 0.7 }}
          >
            👋
          </motion.span>
        </motion.h2>

        <motion.div className="flex flex-col items-center gap-20">
          <motion.h1
            className="text-5xl font-semibold tracking-tight text-white/40 mt-10"
            variants={itemVariants}
          >
            Make Your Transcript to Get Started!
          </motion.h1>

          <motion.div
            className="flex gap-16 justify-center text-xl mb-3"
            variants={cardsContainerVariants}
            initial="hidden"
            animate={showCards ? "visible" : "hidden"}
          >
            <motion.div
              className="filecard"
              variants={cardVariants}
              whileHover="hover"
              initial="initial"
              style={{ transition: "none" }}
            >
              <FileUp size={42} />
              <p>File Upload</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              initial="initial"
              style={{ transition: "none" }}
            >
              <Link
                to={"/transcript-setup"}
                className="filecard"
                style={{ transition: "none" }}
              >
                <NotebookPen size={42} />
                <p>Manual Input</p>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
