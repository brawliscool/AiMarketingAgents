export const supportedPlatforms = ["x", "tiktok", "instagram", "reddit"];

export const platformProfiles = {
  x: {
    id: "x",
    name: "X.com",
    description: "Publish text posts, prepare threads, and sync account health for campaign agents.",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    env: {
      clientId: "X_CLIENT_ID",
      clientSecret: "X_CLIENT_SECRET",
      redirectUri: "X_REDIRECT_URI",
    },
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    description: "Prepare video publishing workflows, creator info lookups, and upload handoffs.",
    scopes: ["user.info.basic", "video.publish", "video.upload"],
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    env: {
      clientId: "TIKTOK_CLIENT_KEY",
      clientSecret: "TIKTOK_CLIENT_SECRET",
      redirectUri: "TIKTOK_REDIRECT_URI",
    },
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    description: "Publish images, videos, reels-ready captions, and business account insights.",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list", "business_management"],
    authUrl: "https://www.facebook.com/v20.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v20.0/oauth/access_token",
    env: {
      clientId: "INSTAGRAM_CLIENT_ID",
      clientSecret: "INSTAGRAM_CLIENT_SECRET",
      redirectUri: "INSTAGRAM_REDIRECT_URI",
    },
  },
  reddit: {
    id: "reddit",
    name: "Reddit",
    description: "Submit subreddit posts, link posts, and discussion-ready campaign copy.",
    scopes: ["identity", "submit", "read"],
    authUrl: "https://www.reddit.com/api/v1/authorize",
    tokenUrl: "https://www.reddit.com/api/v1/access_token",
    env: {
      clientId: "REDDIT_CLIENT_ID",
      clientSecret: "REDDIT_CLIENT_SECRET",
      redirectUri: "REDDIT_REDIRECT_URI",
    },
  },
};

export function normalizePlatform(platform) {
  const normalized = String(platform || "").toLowerCase();
  return supportedPlatforms.includes(normalized) ? normalized : null;
}
