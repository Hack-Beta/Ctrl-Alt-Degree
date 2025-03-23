import { FileUp, NotebookPen, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const [isStaggerComplete, setIsStaggerComplete] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

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

  const handleUpload = async () => {
    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:5000/api/upload");
      const data = await response.json();

      if (data.success) {
        setResults(data);
        console.log("OCR Results:", data);
      } else {
        setError(data.error || "Failed to process transcript");
      }
    } catch (err) {
      console.error("Error calling API:", err);
      setError("Error connecting to server. Please try again.");
    } finally {
      setIsProcessing(false);
    }
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

          {results && (
            <motion.div
              className="bg-neutral-800 p-4 rounded-lg max-w-2xl text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-medium mb-2">Analysis Results</h3>
              <p className="text-green-400 mb-2">
                ✓ Successfully processed transcript
              </p>
              <p className="mb-2">
                Found {results.ocr_results.courses.length} courses
              </p>
              <div className="bg-neutral-700 p-3 rounded mt-3">
                <p className="font-medium">AI Analysis:</p>
                <p className="text-neutral-300">{results.ai_analysis}</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="bg-red-900/50 text-white p-4 rounded-lg max-w-xl text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-medium mb-2">Error</h3>
              <p>{error}</p>
            </motion.div>
          )}

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
              onClick={handleUpload}
            >
              {isProcessing ? (
                <Loader size={42} className="animate-spin" />
              ) : (
                <FileUp size={42} />
              )}
              <p>{isProcessing ? "Processing..." : "File Upload"}</p>
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
