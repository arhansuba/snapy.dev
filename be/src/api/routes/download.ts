import { Router } from 'express';
import { validate } from '../middleware/validation/validator';
import { AuthMiddleware } from '../middleware/auth';
import { PlanType } from '../../services/payment/plans';
import { ProjectModel } from '../../db/models/Project';
import archiver from 'archiver';
import { ValidationError } from '../../utils/errors';
import { AuthenticatedRequest } from '../middleware/auth';
import { Response } from 'express-serve-static-core';

const router = Router();

router.get(
 '/project/:id',
 AuthMiddleware.authenticate,
 requirePlan([PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE]),
 async (req: AuthenticatedRequest, res: Response<any, Record<string, any>, number>, next: (arg0: unknown) => void) => {
   try {
     const { id } = req.params;
     const project = await ProjectModel.findById(id);

     if (!project) {
       throw new ValidationError('Project not found');
     }

     if (project.userId !== req.user!.id) {
       throw new ValidationError('Unauthorized access');
     }

     // Create a zip archive
     const archive = archiver('zip', {
       zlib: { level: 9 } // Maximum compression
     });

     // Set response headers
     res.setHeader('Content-Type', 'application/zip');
     res.setHeader('Content-Disposition', `attachment; filename=${project.name}.zip`);

     // Pipe archive data to response
     archive.pipe(res);

     // Add files to the archive
     for (const [path, content] of Object.entries(project.files)) {
       archive.append(content as string | Buffer, { name: path });
     }

     // Handle archive errors
     archive.on('error', (err) => {
       throw err;
     });

     // Finalize archive
     await archive.finalize();
   } catch (error) {
     next(error);
   }
 }
);

router.get(
 '/component/:id',
 AuthMiddleware.authenticate,
 requirePlan([PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE]),
 async (req: AuthenticatedRequest, res: Response<any, Record<string, any>, number>, next: (arg0: unknown) => void) => {
   try {
     const { id } = req.params;
     const component = await ProjectModel.getComponent(id) as unknown as { userId: string, name: string, code: string, styles?: string, types?: string, dependencies: Record<string, string>, description?: string };

     if (!component) {
       throw new ValidationError('Component not found');
     }

     if (component.userId !== req.user!.id) {
       throw new ValidationError('Unauthorized access');
     }

     // Create a zip archive
     const archive = archiver('zip', {
       zlib: { level: 9 }
     });

     // Set response headers
     res.setHeader('Content-Type', 'application/zip');
     res.setHeader('Content-Disposition', `attachment; filename=${component.name}.zip`);

     // Add component files
     archive.append(component.code, { name: 'index.tsx' });
     
     if (component.styles) {
       archive.append(component.styles, { name: 'styles.css' });
     }
     
     if (component.types) {
       archive.append(component.types, { name: 'types.ts' });
     }

     // Add package.json with dependencies
     const packageJson = {
       name: component.name.toLowerCase(),
       version: '1.0.0',
       dependencies: component.dependencies
     };

     archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' });

     // Add README
     const readme = `# ${component.name}

## Description
${component.description || 'No description provided.'}

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`jsx
import { ${component.name} } from './${component.name}';

// Example usage
<${component.name} />
\`\`\`
`;

     archive.append(readme, { name: 'README.md' });

     // Handle archive errors
     archive.on('error', (err) => {
       throw err;
     });

     // Pipe archive data to response
     archive.pipe(res);

     // Finalize archive
     await archive.finalize();
   } catch (error) {
     next(error);
   }
 }
);

// Track downloads
router.post(
 '/track/:type/:id',
 AuthMiddleware.authenticate,
 async (req: AuthenticatedRequest, res, next) => {
   try {
     const { type, id } = req.params;
     
     // Track download based on type (project or component)
     if (type === 'project') {
       await ProjectModel.trackDownload(id);
     } else if (type === 'component') {
       await ProjectModel.trackComponentDownload(id);
     }

     res.json({ success: true });
   } catch (error) {
     next(error);
   }
 }
);

export default router;

function requirePlan(arg0: PlanType[]): import("express-serve-static-core").RequestHandler<{ id: string; }, any, any, import("qs").ParsedQs, Record<string, any>> {
    throw new Error('Function not implemented.');
}
