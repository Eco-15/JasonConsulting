'use client';

import React, { useState } from 'react';

// --- Data for the image accordion ---
const accordionItems = [
  {
    id: 1,
    title: 'Business Coach',
    imageUrl: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnj0dbcQGkELmIuFY2xWfjP3dbMtw8TZ1SDK7p',
    link: '/contact',
  },
  {
    id: 2,
    title: 'Public Speaker',
    imageUrl: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnWW7ZGbwDoEgx6u7dLy8etIN1pvK3aPWcf5AR',
    link: '/contact',
  },
  {
    id: 3,
    title: 'Entrepreneur',
    imageUrl: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnAyXegpBerOcK61jIM4ZmgSpzHL7Ci8FnD0Xt',
  },
  {
    id: 4,
    title: 'Leadership Trainer',
    imageUrl: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnCiRNubykjw7PSNi0m8alYrGqn6LoI9hUxsv4',
    link: 'https://leaderforlife.com',
  },
  {
    id: 5,
    title: 'Content Creator',
    imageUrl: 'https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOni9O2gK8hoXrM9uw83NK7abLqpjmcBkZtgnyx',
    link: 'https://youtube.com/@jasongraziani',
  },
];

// --- Accordion Item Component ---
const AccordionItem = ({ item, isActive, onMouseEnter }: {
  item: { id: number; title: string; imageUrl: string; link?: string };
  isActive: boolean;
  onMouseEnter: () => void;
}) => {
  const isExternalLink = item.link && item.link.startsWith('http');

  const content = (
    <>
      {/* Background Image */}
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = 'https://placehold.co/400x450/2d3748/ffffff?text=Image+Error';
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Caption Text - hidden on mobile */}
      <span
        className={`
          absolute text-white text-lg font-semibold whitespace-nowrap
          transition-all duration-300 ease-in-out
          hidden md:block
          ${
            isActive
              ? 'bottom-6 left-1/2 -translate-x-1/2 rotate-0' // Active state: horizontal, bottom-center
              // Inactive state: vertical, positioned at the bottom, for all screen sizes
              : 'w-auto text-left bottom-24 left-1/2 -translate-x-1/2 rotate-90'
          }
        `}
      >
        {item.title}
      </span>
    </>
  );

  const className = `
    relative h-[450px] rounded-2xl overflow-hidden cursor-pointer
    transition-all duration-700 ease-in-out
    ${isActive ? 'w-[400px]' : 'w-[60px]'}
  `;

  if (item.link) {
    return (
      <a
        href={item.link}
        className={className}
        onMouseEnter={onMouseEnter}
        target={isExternalLink ? '_blank' : undefined}
        rel={isExternalLink ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={className}
      onMouseEnter={onMouseEnter}
    >
      {content}
    </div>
  );
};


// --- Main App Component ---
export function LandingAccordionItem() {
  const [activeIndex, setActiveIndex] = useState(4);

  const handleItemHover = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="bg-white font-sans">
      <section className="container mx-auto px-4 pt-32 pb-12 md:pt-40 md:pb-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Left Side: Text Content */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter">
              <span className="text-gray-900">Transforming Leaders, </span>
              <span className="gold-gradient-text">Building Legacies</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
              Jason Graziani — Business Coach, Public Speaker, Entrepreneur, and Developer of Leaders. Empowering individuals and organizations to reach their full potential through coaching, leadership development, and business solutions.
            </p>
            <div className="mt-8">
              <a
                href="/contact"
                className="inline-block silver-gradient-outline text-black font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get In Touch
              </a>
            </div>
          </div>

          {/* Right Side: Image Accordion */}
          <div className="w-full md:w-1/2">
            {/* Changed flex-col to flex-row to keep the layout consistent */}
            <div className="flex flex-row items-center justify-center gap-4 overflow-x-auto p-4">
              {accordionItems.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isActive={index === activeIndex}
                  onMouseEnter={() => handleItemHover(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
