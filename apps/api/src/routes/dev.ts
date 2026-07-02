import { Router } from 'express';
import { runRecommendationEngine } from '../services/recommendationEngine';
// We can dynamically run seed function or trigger a subprocess
import { exec } from 'child_process';
import path from 'path';

const router = Router();

router.post('/seed', async (req, res, next) => {
  try {
    console.log('🔄 API-triggered database seeding...');
    
    // Execute seed.ts as a child process to run cleanly
    const seedScriptPath = path.resolve(__dirname, '../../scripts/seed.ts');
    
    exec(`npx ts-node "${seedScriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Seed execution error: ${error}`);
        return res.status(500).json({ error: 'Seeding failed', details: stderr });
      }
      console.log(`Seed output: ${stdout}`);
      res.json({ message: 'Database successfully re-seeded', log: stdout });
    });
  } catch (error) {
    next(error);
  }
});

export default router;
