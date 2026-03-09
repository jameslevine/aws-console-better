import {
  describeInstance,
  getSshCommand,
  listInstances,
  listSecurityGroups,
  rebootInstance,
  startInstance,
  stopInstance,
} from "../../controllers/ec2";

import { Router } from "express";

export const router = Router({ mergeParams: true });

// GET /v1/aws/:accountId/ec2/instances
router.get("/instances", listInstances);

// GET /v1/aws/:accountId/ec2/instances/:instanceId
router.get("/instances/:instanceId", describeInstance);

// POST /v1/aws/:accountId/ec2/instances/:instanceId/start
router.post("/instances/:instanceId/start", startInstance);

// POST /v1/aws/:accountId/ec2/instances/:instanceId/stop
router.post("/instances/:instanceId/stop", stopInstance);

// POST /v1/aws/:accountId/ec2/instances/:instanceId/reboot
router.post("/instances/:instanceId/reboot", rebootInstance);

// GET /v1/aws/:accountId/ec2/instances/:instanceId/ssh-command
router.get("/instances/:instanceId/ssh-command", getSshCommand);

// GET /v1/aws/:accountId/ec2/security-groups
router.get("/security-groups", listSecurityGroups);
