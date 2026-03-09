import Joi from "joi";

export const createAccountSchema = Joi.object({
  accountName: Joi.string().min(1).max(100).required(),
  accessKeyId: Joi.string().pattern(/^AKIA/).min(16).max(128).required(),
  secretAccessKey: Joi.string().min(1).max(256).required(),
  sessionToken: Joi.string().allow("").optional(),
  defaultRegion: Joi.string()
    .pattern(/^[a-z]{2}-[a-z]+-\d$/)
    .required(),
  isDefault: Joi.boolean().optional(),
});

export const updateAccountSchema = Joi.object({
  accountName: Joi.string().min(1).max(100).optional(),
  accessKeyId: Joi.string().min(16).max(128).optional(),
  secretAccessKey: Joi.string().min(1).max(256).optional(),
  sessionToken: Joi.string().allow("").optional(),
  defaultRegion: Joi.string()
    .pattern(/^[a-z]{2}-[a-z]+-\d$/)
    .optional(),
  isDefault: Joi.boolean().optional(),
});

export const accountParamsSchema = Joi.object({
  accountId: Joi.string().pattern(/^acc_/).required(),
});
