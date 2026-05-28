import { Request, Response } from "express";

export const getGithubStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    if (!username) { res.status(400).json({ message: "Username required" }); return; }

    // Fetch user profile
    const profileRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { "User-Agent": "SkillSync-AI" }
    });

    if (!profileRes.ok) {
      res.status(404).json({ message: "GitHub user not found" });
      return;
    }

    const profile = await profileRes.json() as {
      login: string;
      name: string;
      avatar_url: string;
      public_repos: number;
      followers: number;
      following: number;
      bio: string;
    };

    // Fetch repos
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
      headers: { "User-Agent": "SkillSync-AI" }
    });
    const repos = await reposRes.json() as Array<{
      name: string;
      description: string;
      language: string;
      stargazers_count: number;
      html_url: string;
      updated_at: string;
    }>;

    // Fetch events for contribution count
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, {
      headers: { "User-Agent": "SkillSync-AI" }
    });
    const events = await eventsRes.json() as Array<{ type: string; created_at: string }>;

    // Count contributions per day (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const contributionMap: Record<string, number> = {};

    // Build 30-day grid
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      contributionMap[key] = 0;
    }

    // Fill from events
    if (Array.isArray(events)) {
      events.forEach((e) => {
        const date = e.created_at?.split("T")[0];
        if (date && contributionMap[date] !== undefined) {
          contributionMap[date]++;
        }
      });
    }

    const contributions = Object.entries(contributionMap).map(([date, count]) => ({ date, count }));
    const totalContributions = contributions.reduce((sum, c) => sum + c.count, 0);
    const languages = [...new Set((Array.isArray(repos) ? repos : []).map(r => r.language).filter(Boolean))];

    res.status(200).json({
      profile: {
        login: profile.login,
        name: profile.name,
        avatar_url: profile.avatar_url,
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        bio: profile.bio,
      },
      repos: Array.isArray(repos) ? repos.slice(0, 6).map(r => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        url: r.html_url,
        updated: r.updated_at,
      })) : [],
      contributions,
      totalContributions,
      languages,
    });
  } catch (error) {
    console.error("GitHub error:", error);
    res.status(500).json({ message: "Error fetching GitHub data" });
  }
};
