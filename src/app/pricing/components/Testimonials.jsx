'use client';

import { motion } from 'framer-motion';

export function Testimonials({ testimonials }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true }}
      className='py-20'
    >
      <div className='mx-auto max-w-6xl px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold mb-4'>Loved by teams worldwide</h2>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            See what our customers have to say about their experience with
            Novocode
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className='bg-card p-8 rounded-2xl border shadow-sm hover:shadow-lg transition-shadow duration-300'
            >
              <div className='flex items-center gap-4 mb-6'>
                <div className='w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold'>
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className='font-semibold'>{testimonial.name}</h4>
                  <p className='text-sm text-muted-foreground'>
                    {testimonial.role}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {testimonial.company}
                  </p>
                </div>
              </div>

              <blockquote className='text-muted-foreground leading-relaxed'>
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
