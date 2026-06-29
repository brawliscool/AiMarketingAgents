import { motion } from "framer-motion";
import { Brain, CheckCircle, Eye, Lightning, Repeat, Wrench } from "@phosphor-icons/react";
import "./AgentLoopSection.css";

const loopSteps = [
  {
    label: "Observe",
    icon: Eye,
    copy: "Read the goal, context, data, tools, and current task state.",
  },
  {
    label: "Reason / plan",
    icon: Brain,
    copy: "Pick the next best move and decide what needs to happen first.",
  },
  {
    label: "Act",
    icon: Wrench,
    copy: "Write, edit, schedule, run commands, call APIs, or use tools.",
  },
  {
    label: "Review result",
    icon: CheckCircle,
    copy: "Check the output, catch issues, and compare it to the goal.",
  },
  {
    label: "Repeat",
    icon: Repeat,
    copy: "Keep looping until the task is ready for owner approval.",
  },
];

export function AgentLoopSection() {
  return (
    <section className="agent-loop-section" aria-labelledby="agent-loop-heading">
      <div className="agent-loop-copy">
        <span className="agent-loop-kicker">
          <span />
          Agent loop engine
        </span>
        <h2 id="agent-loop-heading">Autonomous marketing agents that keep improving.</h2>
        <p>
          HiveAI runs the same loop strong coding agents use: observe the state, plan the next step, act with tools, check the result, and repeat until the work is done.
        </p>
      </div>

      <div className="agent-loop-orbit" aria-hidden="true">
        <motion.div className="agent-loop-runner" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
        <div className="agent-loop-core">
          <Lightning size={26} weight="fill" />
          <strong>HiveAI</strong>
          <span>Agent cycle</span>
        </div>
        {loopSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.article
              className="agent-loop-node"
              style={{ "--rotation": `${-90 + index * 72}deg` }}
              key={step.label}
              initial={{ opacity: 0, scale: 0.86 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.08 }}
            >
              <Icon size={20} />
              <strong>{step.label}</strong>
              <span>{step.copy}</span>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default AgentLoopSection;
