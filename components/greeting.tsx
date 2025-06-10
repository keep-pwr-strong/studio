import { motion } from 'framer-motion';

export const Greeting = () => {
  return (
    <div
      id="greeting"
      key="overview"
      className="max-w-3xl mx-auto md:my-10 px-8 size-full flex flex-col  justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-4xl"
      >
        What would you like to <span className="font-semibold text-[#0f0c6d] dark:text-[#b7cee9]">build</span>?
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-zinc-500 mt-5"
      >
        Build, Innovate, Integrate with <a href="https://pwrlabs.io" target="_blank" rel="noopener noreferrer" className="text-[#0f0c6d]  dark:text-[#b7cee9]">PWR Chain</a>
      </motion.div>
    </div>
  );
};
