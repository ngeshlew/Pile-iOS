import styles from './Blobs.module.scss';
import { AnimatePresence, motion } from 'framer-motion';

const Blobs = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ scale: 20, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div>/* content */</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Blobs;
