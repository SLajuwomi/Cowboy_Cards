export interface Flashcard {
  ID: number;
  Front: string;
  Back: string;
  SetID: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface FlashcardSet {
  ID: number;
  SetName: string;
  SetDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface SetUser {
  UserID: number;
  SetID: number;
  Role: string;
  SetScore: number;
  IsPrivate: boolean;
  SetName: string;
  SetDescription: string;
}

export interface CardHistory {
  UserID: number;
  CardID: number;
  Score: number;
  TimesAttempted: number;
  IsMastered: boolean;
  CreatedAt: string;
}

export interface Class {
  ID: number;
  ClassName: string;
  ClassDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  login_streak: number;
  created_at: string;
  numClasses: number;
  cardsStudied: number;
  cardsMastered: number;
  totalCardViews: number;
}
