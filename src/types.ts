/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RevealAnimationType = 'scratch' | 'ticket' | 'clapper' | 'neon';

export interface MovieTopic {
  id: number; // 1 to 35
  title: string; // Text prompt/topic description (e.g., "A movie that takes place on an island")
  hint?: string; // Hint / clue to the topic name shown pre-reveal
  hintImage?: string; // Base64 data URL or external URL for hint picture
  hintImageName?: string; // Original name or source of hint image (if file)
  image?: string; // Base64 data URL or external URL for custom picture (revealed)
  imageName?: string; // Original name of uploaded image file (if applicable)
  author?: string; // Author who created/suggested this topic
  revealAt: string; // ISO Date string (e.g., "2026-06-01T20:00:00Z")
  isRevealedByUser: boolean; // Flag to track if the player has triggered the actual reveal animation
  revealAnimationType: RevealAnimationType; // Custom micro-game or animated theme to reveal
  isCompleted: boolean; // Checked off once friends have watched a movie for it
  watchedMovieTitle?: string; // Title of the watched movie
  watchedMovieRating?: number; // User rating for the movie (1-5 stars)
  notes?: string; // Mini-review or journal entry
}

export interface ChallengeConfig {
  challengeTitle: string; // Custom challenge title (e.g., "Summer Cinescapes 2026")
  creatorName: string; // Name of the creator
  topics: MovieTopic[];
}
