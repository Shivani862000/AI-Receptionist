"use client";

import { motion } from "framer-motion";

export function HeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden hero-mesh">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_30%),radial-gradient(circle_at_center,rgba(124,58,237,0.1),transparent_52%)]" />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.9),rgba(124,58,237,0.72)_28%,rgba(14,165,233,0.4)_56%,rgba(5,8,22,0)_72%)] blur-[1px] sm:h-[320px] sm:w-[320px]"
        animate={{ scale: [1, 1.06, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/35"
        animate={{ rotate: 360, scale: [1, 1.03, 1] }}
        transition={{ rotate: { duration: 16, repeat: Infinity, ease: "linear" }, scale: { duration: 4.8, repeat: Infinity, ease: "easeInOut" } }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[380px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25"
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl"
        animate={{ scale: [0.95, 1.18, 0.95], opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {[
        { size: "h-3 w-3", color: "bg-cyan-300", x: "18%", y: "30%", duration: 5.4, delay: 0.2 },
        { size: "h-2.5 w-2.5", color: "bg-violet-300", x: "78%", y: "28%", duration: 6.1, delay: 0.4 },
        { size: "h-4 w-4", color: "bg-fuchsia-300", x: "26%", y: "70%", duration: 7.1, delay: 0.1 },
        { size: "h-2 w-2", color: "bg-cyan-200", x: "75%", y: "72%", duration: 5.8, delay: 0.6 },
        { size: "h-2.5 w-2.5", color: "bg-violet-200", x: "50%", y: "16%", duration: 6.6, delay: 0.3 },
      ].map((dot, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full ${dot.size} ${dot.color} shadow-[0_0_20px_rgba(255,255,255,0.28)]`}
          style={{ left: dot.x, top: dot.y }}
          animate={{ y: [0, -16, 0], x: [0, 8, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: dot.duration, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
        />
      ))}
    </div>
  );
}
