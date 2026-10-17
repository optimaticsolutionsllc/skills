export type Vector4 = readonly [number, number, number, number];
export type Clip = {
  id: string;
  text: string;
  reason: string;
  vector: Vector4;
  x: number;
  y: number;
  color: string;
};
export type SearchExample = { text: string; label: string; vector: Vector4; x: number; y: number };

export const labels = ['Time', 'Clients', 'Posts', 'Care'] as const;

// These are made-up 4-number teaching cards, NOT output from an embedding model.
export const sentences: { text: string; vector: Vector4 }[] = [
  { text: 'I want my weekends free.', vector: [0.96, 0.11, 0.05, 0.03] },
  { text: 'Too many meetings eat my time.', vector: [0.93, 0.09, 0.06, 0.04] },
  { text: 'How do I find better clients?', vector: [0.09, 0.97, 0.18, 0.11] },
];
export const queries: SearchExample[] = [
  { label: '⏰ I want my Saturdays back', text: 'How can I get my Saturdays back?', vector: [0.98, 0.12, 0.05, 0.03], x: 113, y: 87 },
  { label: '📣 Marketing that brings clients', text: 'How do I get clients without wasting time on posts?', vector: [0.16, 0.87, 0.83, 0.03], x: 232, y: 174 },
  { label: '🤝 Make clients feel cared for', text: 'How do I make a new client feel looked after?', vector: [0.12, 0.22, 0.06, 0.97], x: 327, y: 252 },
];
export const clips: Clip[] = [
  { id: 'A', text: 'I cut useless meetings and got my week back.', reason: 'Fewer meetings can give an owner more time.', vector: [0.97, 0.12, 0.05, 0.08], x: 90, y: 80, color: '#75edc7' },
  { id: 'B', text: 'My team can now run daily tasks without me.', reason: 'Systems help an owner leave day-to-day work.', vector: [0.92, 0.09, 0.12, 0.13], x: 142, y: 115, color: '#75edc7' },
  { id: 'C', text: 'I stopped chasing everybody and spoke to the people I could help.', reason: 'Find people who fit the service.', vector: [0.16, 0.98, 0.22, 0.07], x: 291, y: 85, color: '#9bbdff' },
  { id: 'D', text: 'A clear offer made sales talks much easier.', reason: 'Better offer and sales process.', vector: [0.07, 0.98, 0.28, 0.08], x: 350, y: 124, color: '#9bbdff' },
  { id: 'E', text: 'I quit posting everywhere just to look busy. I picked one channel.', reason: 'Less busywork in social media marketing.', vector: [0.19, 0.44, 0.98, 0.03], x: 86, y: 258, color: '#ffcc81' },
  { id: 'F', text: 'I planned posts around real questions from clients.', reason: 'Make marketing useful instead of noisy.', vector: [0.13, 0.30, 0.98, 0.15], x: 157, y: 279, color: '#ffcc81' },
  { id: 'G', text: 'I sent a small gift to make a new client feel welcome.', reason: 'Show thoughtful care to a client.', vector: [0.10, 0.09, 0.09, 0.99], x: 304, y: 250, color: '#f7aeb0' },
  { id: 'H', text: 'I listened before giving a client the next step.', reason: 'Good service means hearing what matters.', vector: [0.12, 0.21, 0.09, 0.98], x: 351, y: 278, color: '#f7aeb0' },
];
export const pipelineSteps: { title: string; description: string; example?: string; icon: string; short: string }[] = [
  { title: '1. John speaks on video', short: 'Get video', icon: '🎥', description: 'Rose has a recording of a coaching session. A video file contains pictures and sound. The number maker cannot search that video by itself.' },
  { title: '2. Turn speech into written words', short: 'Get words', icon: '📝', description: 'A tool such as Fireflies writes down the speech. Now the app has text it can use. Check errors: speech tools can mix up names and words.' },
  { title: '3. Cut the words into short pieces', short: 'Cut into bits', icon: '🧩', description: 'A long meeting may cover ten different stories. Split it into smaller sections. Keep each section tied to the right video and time.', example: 'Clip: demo-meeting.mp4 • 00:12:18–00:12:42 • “I cut useless meetings and got my week back.”' },
  { title: '4. Make an embedding', short: 'Make numbers', icon: '🔢', description: 'The embedding model reads ONE text section and outputs a number list. In the Letz Go workshop model, that list had 512 numbers.', example: '[ 0.027, −0.113, 0.084, … 512 numbers in total ]' },
  { title: '5. Save the text AND its place', short: 'Save both', icon: '🗂️', description: 'For each clip, save the text, the numbers, the video link, and the time. When number search finds a good match, Rose can jump right to the real source.', example: '{ clip: "demo-meeting.mp4", time: "00:12:18", words: "I cut useless meetings…", numbers: [ … ] }' },
];
export const quizQuestions: { question: string; choices: string[]; correct: number; feedback: string }[] = [
  { question: 'What is an embedding?', choices: ['A list of numbers made from words', 'A full recording of John', 'A post that is ready to publish'], correct: 0, feedback: 'Right. A model reads text and makes numbers so the computer can compare it with other text.' },
  { question: 'Rose types “I want my weekends back.” A clip says “I cut meetings and got my week back.” Can an embedding help?', choices: ['No, the words are different', 'Yes, it can find similar ideas', 'Yes, but it also proves the clip is true'], correct: 1, feedback: 'Right. It can connect different words that share an idea. But it does not prove a claim.' },
  { question: 'What else must Tim save with each embedding?', choices: ['Just the numbers', 'Only a nice title', 'The source video, time, and real words'], correct: 2, feedback: 'Exactly. The numbers help you find something. The source tells you what was really said.' },
];