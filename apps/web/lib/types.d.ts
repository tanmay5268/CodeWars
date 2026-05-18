import "next-auth";
declare module "next-auth" {
  interface Session {
    user: {
        id: string;
        email: string;
        name: string;
        image?: string;
        stats?: {
          CurrentStreak: number;
          TotalWins: number;
          MatchesPlayed: number;
        };
    };
  }
    }

declare module "next-auth/jwt" {
  interface JWT {
    email: string;
    name: string;
    image?: string;
    stats?: {
      CurrentStreak: number;
      TotalWins: number;
      MatchesPlayed: number;
    };
  }
}
