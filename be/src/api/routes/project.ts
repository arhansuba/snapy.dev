// src/api/routes/project.ts
import { Router, Request } from 'express';
import { ProjectModel } from '../../db/models/Project';
import { validate } from '../middleware/validation/validator';
import { createProjectSchema, updateProjectSchema } from '../middleware/validation/schemas';
import { requirePlan } from '../middleware/requirePlan';

import { PlanType } from '../../services/payment/plans';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    plan: PlanType;
  };
}

const router = Router();

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const projects = await ProjectModel.getUserProjects(req.user!.id);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project || project.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  validate(createProjectSchema),
  requirePlan([PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE]),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const project = await ProjectModel.create(req.user!.id, req.body);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  validate(updateProjectSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const project = await ProjectModel.findById(req.params.id);
      if (!project || project.userId !== req.user!.id) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const updatedProject = await ProjectModel.update(req.params.id, req.body);
      res.json(updatedProject);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (!project || project.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    await ProjectModel.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;