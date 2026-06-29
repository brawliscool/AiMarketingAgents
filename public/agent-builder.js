const platformProfiles = [
  ["instagram", ["instagram", "ig", "reels"], "Instagram"],
  ["tiktok", ["tiktok", "tik tok", "shorts"], "TikTok"],
  ["facebook", ["facebook", "fb", "meta"], "Facebook"],
  ["youtube", ["youtube", "yt", "shorts"], "YouTube"],
  ["x", ["twitter", "x.com", "x "], "X.com"],
  ["reddit", ["reddit", "subreddit"], "Reddit"],
  ["linkedin", ["linkedin", "b2b"], "LinkedIn"],
];

const industryProfiles = [
  ["tire shop", ["tire", "tires", "wheel", "wheels"], "drivers within 25 miles who need tires, wheels, alignments, or quick vehicle service"],
  ["gym", ["gym", "fitness", "trainer", "workout"], "busy local people who want simple fitness wins and accountability"],
  ["restaurant", ["restaurant", "food", "cafe", "tacos", "pizza", "burger"], "local food lovers looking for a reliable spot to eat this week"],
  ["real estate", ["real estate", "realtor", "homes", "apartments"], "buyers, sellers, and renters who need local market guidance"],
  ["car dealership", ["car dealership", "dealer", "truck", "auto sales"], "local buyers comparing vehicles, payments, trade-ins, and financing"],
  ["salon", ["salon", "barber", "lashes", "hair", "nails"], "local clients who book style, beauty, or grooming appointments"],
  ["clothing brand", ["clothing", "apparel", "streetwear", "brand"], "style-focused shoppers who buy from brands with a strong identity"],
];

const goalProfiles = [
  ["Book more appointments", ["book", "appointments", "calls", "consult", "schedule"]],
  ["Generate qualified leads", ["lead", "leads", "quote", "estimate"]],
  ["Increase local sales", ["sale", "sales", "sell", "customers", "revenue"]],
  ["Grow brand awareness", ["followers", "awareness", "views", "reach", "viral"]],
  ["Launch a promotion", ["promo", "promotion", "discount", "special", "offer"]],
];

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function lower(value) {
  return normalize(value).toLowerCase();
}

function includesAny(text, values) {
  return values.some((value) => text.includes(value));
}

function detectPlatform(text) {
  const found = platformProfiles.find(([, keywords]) => includesAny(text, keywords));
  return found ? found[2] : "Instagram";
}

function detectBusiness(raw, text) {
  const directMatch = raw.match(/(?:for my|for a|for an|for the)\s+([^.,\n]+)/i);
  if (directMatch?.[1]) return normalize(directMatch[1]).replace(/^(new|local)\s+/i, "");

  const found = industryProfiles.find(([, keywords]) => includesAny(text, keywords));
  return found ? found[0] : "local business";
}

function detectAudience(text, business) {
  const found = industryProfiles.find(([industry, keywords]) => business.includes(industry) || includesAny(text, keywords));
  return found ? found[2] : "people most likely to buy, book, or request a quote from this business";
}

function detectGoal(text) {
  const found = goalProfiles.find(([, keywords]) => includesAny(text, keywords));
  return found ? found[0] : "Generate qualified leads";
}

function detectTone(text) {
  if (includesAny(text, ["luxury", "premium", "high end", "professional"])) return "professional, premium, and trust-building";
  if (includesAny(text, ["fun", "funny", "meme", "viral", "bold"])) return "bold, direct, and high-energy";
  if (includesAny(text, ["friendly", "local", "community", "family"])) return "friendly, local, and helpful";
  return "clear, confident, and low-hype";
}

function detectSchedule(text, platform) {
  if (text.includes("daily") || text.includes("every day")) return `1 ${platform} post per day plus 3 story updates per week`;
  if (text.includes("weekly") || text.includes("week")) return `5 ${platform} posts per week: 2 educational, 2 offer-driven, 1 proof/testimonial`;
  return `5 ${platform} posts per week with one campaign recap every Friday`;
}

function buildAgentPlan(rawPrompt) {
  const raw = normalize(rawPrompt);
  const text = lower(raw);
  const platform = detectPlatform(text);
  const business = detectBusiness(raw, text);
  const businessLower = lower(business);
  const audience = detectAudience(text, businessLower);
  const goal = detectGoal(text);
  const tone = detectTone(text);
  const schedule = detectSchedule(text, platform);
  const modelName = "gpt-4o-mini";
  const briefPrompt = [
    `Act as a ${platform} marketing agent for ${business}.`,
    `Primary goal: ${goal}.`,
    `Target audience: ${audience}.`,
    `Brand tone: ${tone}.`,
    "Create content ideas, hooks, captions, hashtags, and posting recommendations that can be approved by the business owner.",
    "Prioritize posts that show proof, explain the offer clearly, answer objections, and make the next step easy.",
  ].join("\n");

  return {
    modelName,
    prompt: briefPrompt,
    platforms: platform,
    postingSchedule: schedule,
    thingsToAvoid: "Avoid fake claims, spammy hashtags, copied competitor posts, unsafe promises, and posting without owner approval.",
    socialPlatform: platform,
    socialAccountId: `${businessLower.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "business"}-${platform.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
    summary: [
      ["Business", business],
      ["Platform", platform],
      ["Goal", goal],
      ["Audience", audience],
      ["Tone", tone],
      ["Schedule", schedule],
    ],
  };
}

function setReactField(field, value) {
  if (!field) return;
  const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

function findField(label) {
  return document.querySelector(`[aria-label="${label}"]`);
}

function fillBrief(plan) {
  setReactField(findField("Model name"), plan.modelName);
  setReactField(findField("Prompt"), plan.prompt);
  setReactField(findField("Platforms"), plan.platforms);
  setReactField(findField("Posting schedule"), plan.postingSchedule);
  setReactField(findField("Things to avoid"), plan.thingsToAvoid);
  setReactField(findField("Social platform"), plan.socialPlatform);
  setReactField(findField("Platform account or page ID"), plan.socialAccountId);
}

function renderSummary(panel, plan) {
  const summary = panel.querySelector(".ai-builder-summary");
  summary.replaceChildren(
    ...plan.summary.map(([label, value]) => {
      const item = document.createElement("span");
      const labelNode = document.createElement("strong");
      labelNode.textContent = label;
      item.append(labelNode, document.createTextNode(String(value)));
      return item;
    }),
  );
  summary.hidden = false;
}

function mountBuilder() {
  const page = document.querySelector(".briefs-page");
  if (!page || page.querySelector(".ai-brief-composer")) return;

  const panel = document.createElement("section");
  panel.className = "ai-brief-composer panel";
  panel.innerHTML = `
    <div class="ai-brief-head">
      <span class="electric-kicker">AI Agent Builder</span>
      <h2>Describe the agent you want</h2>
      <p>Type one sentence and HiveAI will auto-fill the brief, platform, audience, tone, schedule, and goal.</p>
    </div>
    <label class="ai-brief-prompt">
      <span>Agent request</span>
      <textarea rows="3" placeholder="Example: Create an Instagram marketing agent for my tire shop to get more local tire and wheel customers."></textarea>
    </label>
    <div class="ai-brief-actions">
      <button type="button" class="primary-button">Build agent brief</button>
      <button type="button" class="secondary-button" data-example="Create a TikTok marketing agent for my gym to book more local training consultations.">Use example</button>
    </div>
    <div class="ai-builder-summary" hidden></div>
  `;

  const hero = page.querySelector(".briefs-hero");
  hero?.insertAdjacentElement("afterend", panel);

  const textarea = panel.querySelector("textarea");
  panel.querySelector("[data-example]")?.addEventListener("click", (event) => {
    textarea.value = event.currentTarget.dataset.example;
    textarea.focus();
  });

  panel.querySelector(".primary-button")?.addEventListener("click", () => {
    const request = normalize(textarea.value) || "Create an Instagram marketing agent for my tire shop to get more local tire and wheel customers.";
    textarea.value = request;
    const plan = buildAgentPlan(request);
    fillBrief(plan);
    renderSummary(panel, plan);
    page.querySelector(".builder-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const observer = new MutationObserver(mountBuilder);
observer.observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", mountBuilder);
mountBuilder();
