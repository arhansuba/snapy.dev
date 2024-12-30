import { Router } from 'express';
import { AuthMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validation/validator';
import { aiRateLimit } from '../middleware/ai-rate-limit.middleware';
import { PlanType } from '../../services/payment/plans';
import { DeepSeek } from '../../llm/deepseek';
import { ProjectModel } from '../../db/models/Project';
import { PromptUsageModel } from '../../db/models/Prompt';
import { ValidationError } from '../../utils/errors';
import { requirePlan } from '../middleware/requirePlan';
import { z } from 'zod';
import { CodeGenerationRequest } from '../../llm/types';

const router = Router();

const VALID_FRAMEWORKS = ['react', 'vue', 'angular'] as const;
const VALID_STYLING = ['tailwind', 'css', 'scss'] as const;

// Validation schema
const generateSchema = z.object({
  prompt: z.string(),
  type: z.enum(['component', 'page', 'api', 'full-app']),
  framework: z.enum(VALID_FRAMEWORKS).optional(),
  styling: z.enum(VALID_STYLING).optional(),
  name: z.string().optional()
});

type GenerateRequest = z.infer<typeof generateSchema>;

// Generate code endpoint
router.post(
  '/',
  AuthMiddleware.authenticate,
  requirePlan([PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE]),
  aiRateLimit,
  validate(generateSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { prompt, type, framework = 'react', styling = 'tailwind', name } = req.body as GenerateRequest;

      const llm = new DeepSeek();
      const response = await llm.generateCode({
        prompt,
        type,
        framework,
        styling
      } as CodeGenerationRequest);

      await PromptUsageModel.create(req.user!.id, {
        prompt,
        response: response.text,
        tokens: response.tokens
      });

      if (type === 'full-app' || name) {
        const project = await ProjectModel.create(req.user!.id, {
          name: name || 'Untitled Project',
          framework,
          styling,
          files: {
            ...(response.files || {}),
            'README.md': generateReadme(name || 'Untitled Project', prompt, framework, styling)
          }
        });

        return res.json({
          success: true,
          projectId: project.id,
          files: response.files || {}
        });
      }

      res.json({
        success: true,
        code: response.text,
        language: framework
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/regenerate/:projectId/:path*',
  AuthMiddleware.authenticate,
  requirePlan([PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE]),
  aiRateLimit,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { projectId, path } = req.params;
      const { prompt } = req.body;

      const project = await ProjectModel.findById(projectId);
      if (!project) {
        throw new ValidationError('Project not found');
      }

      if (project.userId !== req.user!.id) {
        throw new ValidationError('Unauthorized access');
      }

      const llm = new DeepSeek();
      const response = await llm.generateCode({
        prompt,
        type: 'component',
        framework: project.framework as (typeof VALID_FRAMEWORKS)[number],
        styling: project.styling as (typeof VALID_STYLING)[number],
        context: {
          projectFiles: project.files,
          currentFile: path
        }
      } as CodeGenerationRequest);

      await ProjectModel.updateFile(projectId, path, response.text);

      await PromptUsageModel.create(req.user!.id, {
        prompt,
        response: response.text,
        tokens: response.tokens
      });

      res.json({
        success: true,
        code: response.text
      });
    } catch (error) {
      next(error);
    }
  }
);

function generateReadme(projectName: string, description: string, framework: string, styling: string): string {
  return `# ${projectName}
... // Same README template as before
`;
}

export default router;