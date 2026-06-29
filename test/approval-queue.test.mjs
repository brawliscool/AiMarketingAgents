import test from "node:test";
import assert from "node:assert/strict";
import { createApprovalQueueService } from "../src/approval/service.js";

function createMemoryStore() {
  const items = [];
  return {
    async listItems() {
      return items.slice();
    },
    async saveItem(item) {
      const index = items.findIndex((existing) => existing.id === item.id);
      if (index >= 0) items[index] = item;
      else items.unshift(item);
      return item;
    },
    mode() {
      return "local";
    },
    fallbackReason() {
      return "";
    },
  };
}

test("approval queue creates item with workflow stages", async () => {
  const service = createApprovalQueueService(createMemoryStore());
  const item = await service.create({
    content: {
      text: "Build a better launch campaign and book a demo today.",
      title: "Launch campaign",
      hashtags: ["#hiveai", "#marketing", "#automation"],
      agentId: "Content Writer",
    },
  });
  assert.equal(item.workflow.length, 8);
  assert.equal(item.workflow[0].status, "Running");
  assert.equal(item.workflow[5].stage, "Owner Approval");
});

test("approval queue can approve then publish", async () => {
  const service = createApprovalQueueService(createMemoryStore());
  let item = await service.create({
    content: { text: "Try HiveAI today and get started.", title: "CTA sample", hashtags: ["#hiveai"] },
  });

  for (let i = 0; i < 6; i += 1) {
    item = await service.applyAction(item.id, { action: "approve", actor: "Owner" });
  }
  assert.equal(item.workflow.find((stage) => stage.stage === "Owner Approval")?.status, "Approved");

  item = await service.applyAction(item.id, { action: "publish", actor: "Owner" });
  assert.equal(item.overallStatus, "Published");
  assert.equal(item.workflow.find((stage) => stage.stage === "Published")?.status, "Approved");
});
