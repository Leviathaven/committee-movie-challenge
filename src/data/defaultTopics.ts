/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MovieTopic, RevealAnimationType } from '../types';

export const SUMMER_MOVIE_TOPICS: { title: string; anim: RevealAnimationType }[] = [
  { title: "A classic 80's movie with ultimate beach or summer vibes", anim: 'ticket' },
  { title: "A terrifying film centering on a giant threat from the deep ocean", anim: 'scratch' },
  { title: "A movie where the characters embark on a reckless road trip", anim: 'neon' },
  { title: "An award-winning animated masterpiece that triggers the waterworks", anim: 'clapper' },
  { title: "A high-tension film that takes place entirely in a single day or night", anim: 'ticket' },
  { title: "A mind-bending sci-fi odyssey about time travel or paradoxes", anim: 'scratch' },
  { title: "A comforting, nostalgic movie from your childhood or teenage years", anim: 'clapper' },
  { title: "A creature feature with roaring dinosaurs or prehistoric monsters", anim: 'neon' },
  { title: "A mega summer blockbuster released the year you turned 18", anim: 'ticket' },
  { title: "A highly stylized movie with a color in its title", anim: 'scratch' },
  { title: "An explosive action thriller set on a single moving vehicle (plane, train, ship)", anim: 'clapper' },
  { title: "A film set at a summer camp, sports camp, or woodsy retreat", anim: 'neon' },
  { title: "An indie darling, cult classic, or film festival award winner", anim: 'ticket' },
  { title: "A film featuring an iconic, highly ranked summer musical soundtrack", anim: 'scratch' },
  { title: "A classic whodunnit murder mystery that keeps you guessing until the end", anim: 'clapper' },
  { title: "A masterpiece that features a legendary, mind-blowing third-act twist", anim: 'neon' },
  { title: "A film directed by an absolute master of modern or classic horror", anim: 'ticket' },
  { title: "A cosmic space opera or retro alien first-contact thriller", anim: 'scratch' },
  { title: "A movie set in a highly stylized neon cyberpunk or dark retro-future", anim: 'neon' },
  { title: "A legendary sports film that makes you want to get up and train immediately", anim: 'clapper' },
  { title: "A culinary film where mouth-watering food plays a central narrative role", anim: 'ticket' },
  { title: "A heartfelt coming-of-age story set under a scorching small-town summer", anim: 'scratch' },
  { title: "A movie based entirely on a comic book, pulp graphic novel, or manga", anim: 'clapper' },
  { title: "A breathtaking, visually stunning nature documentary or adventure survival", anim: 'neon' },
  { title: "An intense, high-stakes heist or caper where the master plan goes wild", anim: 'ticket' },
  { title: "A cinematic masterpiece with a title that is exactly one word long", anim: 'scratch' },
  { title: "A film focusing on thick summer friendships, reunions, or retro nostalgia", anim: 'clapper' },
  { title: "A grand, historically accurate epic that is over 2.5 hours long", anim: 'neon' },
  { title: "A modern comedy that made you laugh out loud several times in public", anim: 'ticket' },
  { title: "A movie starring a legendary actor bekannt for performing their own death-defying stunts", anim: 'scratch' },
  { title: "A gritty post-apocalyptic thriller where heat, sands, or climate is the enemy", anim: 'clapper' },
  { title: "A film detailing a thrilling double life, undercover agent, or secret identity", anim: 'neon' },
  { title: "A highly imaginative fantasy film populated by whimsical or magical creatures", anim: 'ticket' },
  { title: "A movie where extreme weather acts as the primary antagonist of the plot", anim: 'scratch' },
  { title: "A gem you've never heard of before, chosen entirely by a friend", anim: 'clapper' }
];

/**
 * Helper to generate 35 initial topic values based on default set.
 * Staggers unlock dates starting from referenceTime.
 *
 * @param referenceTime The base date from which to start scheduling reveals
 * @param scheduleType 'immediate' | 'daily' | 'weekly'
 */
export function generateDefaultTopics(referenceTime: Date, scheduleType: 'immediate' | 'daily' | 'weekly' = 'immediate'): MovieTopic[] {
  return Array.from({ length: 35 }, (_, idx) => {
    const defaultData = SUMMER_MOVIE_TOPICS[idx] || { title: `Summer Movie Topic #${idx + 1}`, anim: 'ticket' };
    
    let revealAtDate = new Date(referenceTime);
    if (scheduleType === 'daily') {
      // Stagger by index days. Reveal at 9:00 AM each day.
      revealAtDate.setDate(referenceTime.getDate() + idx);
      revealAtDate.setHours(9, 0, 0, 0);
    } else if (scheduleType === 'weekly') {
      // Stagger by index weeks. E.g., Week 1, Week 2...
      const weeksOffset = Math.floor(idx / 5); // 5 topics per week for 7 weeks = 35 topics!
      const daysInWeekOffset = idx % 5; // offset days slightly within the week
      revealAtDate.setDate(referenceTime.getDate() + (weeksOffset * 7) + daysInWeekOffset);
      revealAtDate.setHours(18, 0, 0, 0); // Friday-like weekend evening reveal
    } else {
      // Immediate: set to slightly in the past so it is immediately unlocked
      revealAtDate.setMinutes(revealAtDate.getMinutes() - 10);
    }

    return {
      id: idx + 1,
      title: defaultData.title,
      revealAt: revealAtDate.toISOString(),
      isRevealedByUser: false,
      revealAnimationType: defaultData.anim as RevealAnimationType,
      isCompleted: false,
    };
  });
}
