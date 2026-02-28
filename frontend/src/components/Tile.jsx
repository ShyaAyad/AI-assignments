import { motion } from "framer-motion";

export default function Tile({ value }) {
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        w-20 h-20 flex items-center justify-center
        text-2xl font-bold rounded-xl shadow-md
        ${value !== 0 ? "bg-blue-500 text-white" : "bg-gray-200"}
      `}
    >
      {value !== 0 ? value : ""}
    </motion.div>
  );
}