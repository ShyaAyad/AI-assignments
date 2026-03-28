import { motion } from "framer-motion";

export default function SolvedPopup({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="p-8 text-center bg-white shadow-xl rounded-2xl"
      >
        <h2 className="mb-4 text-3xl font-bold text-green-600">
          🎉 Solved!
        </h2>

        <p className="mb-6 text-gray-600">
          Your puzzle has been solved successfully!
        </p>

        <button
          onClick={onClose}
          className="px-6 py-2 text-white transition bg-green-500 rounded-lg hover:bg-green-600"
        >
          Close
        </button>

      </motion.div>
    </div>
  );
}