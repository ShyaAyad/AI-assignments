// import motion from framer-motion (for animation)
import { motion } from "framer-motion";

// this component shows one tile (box)
export default function Tile({ value }) {

  // return what we show on screen
  return (

    // motion.div is like normal div but with animation
    <motion.div

      // this makes smooth movement when layout changes
      layout

      // animation settings (spring effect)
      transition={{ type: "spring", stiffness: 300, damping: 30 }}

      // styles for the tile
      className={`
        w-20 h-20 flex items-center justify-center   // size and center content
        text-2xl font-bold rounded-xl shadow-md      // text and design

        // if value is not 0 → blue tile
        // if value is 0 → empty gray tile
        ${value !== 0 ? "bg-blue-500 text-white" : "bg-gray-200"}
      `}
    >

      {/* show number if not 0, else show nothing */}
      {value !== 0 ? value : ""}

    </motion.div>
  );
}
