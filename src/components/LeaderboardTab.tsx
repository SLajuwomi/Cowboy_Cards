import React from 'react';
import { IonSpinner } from '@ionic/react';
import Leaderboard from '@/components/Leaderboard'; // Assuming Leaderboard component path

// TODO: Move this type to a shared types file (e.g., src/types/index.ts)
//       to avoid duplication and maintain consistency across the application.
type GetClassScoresRow = {
  UserID: number;
  Username: string;
  ClassScore: number;
};

interface LeaderboardTabProps {
  leaderboardData: GetClassScoresRow[];
  loadingScores: boolean;
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  leaderboardData,
  loadingScores,
}) => {
  return (
    <>
      {loadingScores ? (
        <div className="flex justify-center items-center p-8">
          <IonSpinner name="circular" />
          <span className="ml-2">Calculating scores...</span>
        </div>
      ) : (
        <Leaderboard leaderboard={leaderboardData} />
      )}
    </>
  );
};

export default LeaderboardTab;
