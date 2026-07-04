import { motion } from 'framer-motion';

export default function LoadingDots() {
  return (
    <div className="loading-dots">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="dot"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
