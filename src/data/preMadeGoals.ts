import type { ImageSourcePropType } from 'react-native';
import type { GoalCategory } from '../components/CategoryModal';

export type PreMadeGoalCategory = GoalCategory;

export interface PreMadeGoalItem {
  id: string;
  title: string;
  category: PreMadeGoalCategory;
  coverImage: ImageSourcePropType;
  habitsCount: number;
  tasksCount: number;
  userCount: string;
  habits: { title: string; selectedDays: number[]; reminderTime?: string }[];
  tasks: { title: string; dueDate?: string; reminderTime?: string }[];
  note: string;
}

export const PREMADE_GOALS: PreMadeGoalItem[] = [
  {
    id: '1',
    title: 'Learn New Skills',
    category: 'Learning',
    coverImage: require('../assets/images/cover1.png'),
    habitsCount: 5,
    tasksCount: 4,
    userCount: '+15.2K users',
    habits: [
      { title: 'Practice vocabulary for 15 minutes', selectedDays: [0, 2, 4], reminderTime: '09:00 AM' },
      { title: 'Complete a short listening exercise', selectedDays: [1, 3, 5], reminderTime: '10:00 AM' },
      { title: 'Engage with native speakers', selectedDays: [0, 1, 2, 3, 4], reminderTime: undefined },
      { title: 'Review grammar lessons', selectedDays: [2, 4, 6], reminderTime: '14:00' },
      { title: 'Label objects in your environment', selectedDays: [0, 3, 5], reminderTime: '08:00 AM' },
    ],
    tasks: [
      { title: 'Choose a learning method', dueDate: 'Today', reminderTime: undefined },
      { title: 'Set realistic goals', dueDate: 'Dec 31, 2025', reminderTime: '09:00 AM' },
      { title: 'Find learning resources', dueDate: 'Jan 15, 2026', reminderTime: undefined },
      { title: 'Schedule a weekly review', dueDate: 'Ongoing', reminderTime: '18:00' },
    ],
    note: 'Focus on consistency. Daily practice, even for short periods, is more effective than sporadic cramming sessions. Make learning fun: choose activities you enjoy to stay motivated.',
  },
  {
    id: '2',
    title: 'Exercise Regularly',
    category: 'Health',
    coverImage: require('../assets/images/cover2.png'),
    habitsCount: 4,
    tasksCount: 6,
    userCount: '+12.4K users',
    habits: [
      { title: 'Morning stretch for 10 minutes', selectedDays: [0, 1, 2, 3, 4, 5, 6], reminderTime: '07:00 AM' },
      { title: 'Walk or run 30 minutes', selectedDays: [0, 2, 4], reminderTime: '06:30 AM' },
      { title: 'Strength training', selectedDays: [1, 3, 5], reminderTime: '17:00' },
      { title: 'Track daily steps', selectedDays: [0, 1, 2, 3, 4, 5, 6], reminderTime: undefined },
    ],
    tasks: [
      { title: 'Set weekly exercise goals', dueDate: 'Today', reminderTime: undefined },
      { title: 'Create a workout schedule', dueDate: 'This week', reminderTime: undefined },
      { title: 'Find a workout buddy', dueDate: 'Next week', reminderTime: undefined },
      { title: 'Buy workout gear if needed', dueDate: 'Optional', reminderTime: undefined },
      { title: 'Join a gym or class', dueDate: 'This month', reminderTime: undefined },
      { title: 'Review progress weekly', dueDate: 'Ongoing', reminderTime: 'Sunday 18:00' },
    ],
    note: 'Start small and build up. Consistency beats intensity. Find activities you enjoy so you stick with them long term.',
  },
  {
    id: '3',
    title: 'Learn a New Language',
    category: 'Learning',
    coverImage: require('../assets/images/cover3.png'),
    habitsCount: 6,
    tasksCount: 5,
    userCount: '+19.2K users',
    habits: [
      { title: 'Practice vocabulary for 15 minutes', selectedDays: [0, 2, 4], reminderTime: '09:00 AM' },
      { title: 'Complete a short listening exercise', selectedDays: [1, 3, 5], reminderTime: '10:00 AM' },
      { title: 'Engage with native speakers', selectedDays: [0, 1, 2, 3, 4], reminderTime: undefined },
      { title: 'Review grammar lessons', selectedDays: [2, 4, 6], reminderTime: '14:00' },
      { title: 'Label objects in your environment', selectedDays: [0, 3, 5], reminderTime: '08:00 AM' },
      { title: 'Listen to related podcasts', selectedDays: [1, 4, 6], reminderTime: '19:00' },
    ],
    tasks: [
      { title: 'Choose a language learning method', dueDate: 'Today', reminderTime: undefined },
      { title: 'Set realistic goals', dueDate: 'Dec 31, 2025', reminderTime: '09:00 AM' },
      { title: 'Find language learning resources', dueDate: 'Jan 15, 2026', reminderTime: undefined },
      { title: 'Immerse yourself in the language', dueDate: 'Ongoing', reminderTime: undefined },
      { title: 'Schedule a weekly review', dueDate: 'Ongoing', reminderTime: '18:00' },
    ],
    note: 'Focus on consistency. Daily practice, even for short periods, is more effective than sporadic cramming sessions. Make learning fun: Choose activities you enjoy, like watching movies or listening to music, to stay motivated. Don\'t be afraid to make mistakes—they are part of the learning process.',
  },
];
