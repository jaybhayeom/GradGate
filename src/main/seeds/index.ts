// ==============================================================================
// COMPLETE CURRICULUM SEED RUNNER (All 8 GATE DA Sections + Full Mocks)
// ==============================================================================

import type { Database as DatabaseType } from 'better-sqlite3';
import { seedSectionProbStats } from './seed_01_prob_stats';
import { seedSectionLinearAlgebra } from './seed_02_linear_algebra';
import { seedSectionCalculusOpt } from './seed_03_calculus_opt';
import { seedSectionProgDsa } from './seed_04_dsa_python';
import { seedSectionDbmsDw } from './seed_05_dbms_dw';
import { seedSectionMachineLearning } from './seed_06_machine_learning';
import { seedSectionArtificialIntelligence } from './seed_07_artificial_intelligence';
import { seedSectionGeneralAptitude } from './seed_08_general_aptitude';
import { seedFullMocks } from './seed_09_full_mocks';

export function seedAllCurriculum(db: DatabaseType): void {
  const tx = db.transaction(() => {
    seedSectionProbStats(db);
    seedSectionLinearAlgebra(db);
    seedSectionCalculusOpt(db);
    seedSectionProgDsa(db);
    seedSectionDbmsDw(db);
    seedSectionMachineLearning(db);
    seedSectionArtificialIntelligence(db);
    seedSectionGeneralAptitude(db);
    seedFullMocks(db);
  });

  tx();
}

export * from './seed_01_prob_stats';
export * from './seed_02_linear_algebra';
export * from './seed_03_calculus_opt';
export * from './seed_04_dsa_python';
export * from './seed_05_dbms_dw';
export * from './seed_06_machine_learning';
export * from './seed_07_artificial_intelligence';
export * from './seed_08_general_aptitude';
export * from './seed_09_full_mocks';
