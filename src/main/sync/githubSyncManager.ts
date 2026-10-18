// ==============================================================================
// GITHUB OTA SYNC MANAGER FOR GRADGATE
// Responsibilities:
//   1. Check if curriculum.db exists in content directory on first launch.
//   2. Download manifest.json and curriculum.db.gz from GitHub release/raw repository.
//   3. Verify SHA-256 checksum against manifest.
//   4. Decompress atomically without touching user_profile.db.
//   5. Fall back seamlessly to local bundled seed database when offline.
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { EventEmitter } from 'node:events';
import type { ContentManifest, SyncProgress, UpdateCheckResult } from '../../shared/types';
import Database from 'better-sqlite3';

export interface GitHubSyncOptions {
  contentDir: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  baseUrlOverride?: string;
  bundledSeedPath?: string;
}

export class GitHubSyncManager extends EventEmitter {
  private contentDir: string;
  private curriculumDbPath: string;
  private manifestPath: string;
  private baseUrl: string;
  private bundledSeedPath?: string;

  constructor(options: GitHubSyncOptions) {
    super();
    this.contentDir = options.contentDir;
    this.curriculumDbPath = path.join(this.contentDir, 'curriculum.db');
    this.manifestPath = path.join(this.contentDir, 'manifest.json');
    this.bundledSeedPath = options.bundledSeedPath;

    const owner = options.repoOwner || 'jaybhayeom';
    const repo = options.repoName || 'GradGate';
    const branch = options.branch || 'main';

    this.baseUrl =
      options.baseUrlOverride ||
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/release-bundle`;
  }

  public getCurriculumDbPath(): string {
    return this.curriculumDbPath;
  }

  public isCurriculumAvailable(): boolean {
    return fs.existsSync(this.curriculumDbPath) && fs.statSync(this.curriculumDbPath).size > 0;
  }

  public getCurrentManifest(): ContentManifest | null {
    if (!fs.existsSync(this.manifestPath)) return null;
    try {
      const raw = fs.readFileSync(this.manifestPath, 'utf8');
      return JSON.parse(raw) as ContentManifest;
    } catch {
      return null;
    }
  }

  private emitProgress(progress: SyncProgress): void {
    this.emit('progress', progress);
  }

  public async bootstrapFirstLaunch(): Promise<boolean> {
    if (this.isCurriculumAvailable()) {
      return true;
    }

    if (!fs.existsSync(this.contentDir)) {
      fs.mkdirSync(this.contentDir, { recursive: true });
    }

    this.emitProgress({
      phase: 'CHECKING',
      bytesDownloaded: 0,
      totalBytes: 0,
      percent: 0,
      message: 'Checking for curriculum package...'
    });

    try {
      // Attempt online fetch from GitHub
      const success = await this.downloadAndExtractPackage();
      if (success) return true;
    } catch (err) {
      console.warn('[GITHUB-SYNC] Remote bootstrap failed, trying local bundled fallback:', (err as Error).message);
    }

    // Fallback to local bundled seed if available
    return this.applyLocalBundledFallback();
  }

  public async checkForCurriculumUpdates(): Promise<UpdateCheckResult> {
    const currentManifest = this.getCurrentManifest();
    const currentVersion = currentManifest?.version || '0.0.0';

    try {
      const manifestUrl = `${this.baseUrl}/manifest.json`;
      const response = await fetch(manifestUrl, { cache: 'no-cache' });
      if (!response.ok) {
        return {
          updateAvailable: false,
          currentVersion,
          latestVersion: currentVersion,
          manifest: currentManifest
        };
      }

      const remoteManifest = (await response.json()) as ContentManifest;
      const isNewer = this.compareSemver(remoteManifest.version, currentVersion) > 0;

      return {
        updateAvailable: isNewer,
        currentVersion,
        latestVersion: remoteManifest.version,
        manifest: remoteManifest
      };
    } catch (err) {
      return {
        updateAvailable: false,
        currentVersion,
        latestVersion: currentVersion,
        manifest: currentManifest
      };
    }
  }

  public async applyCurriculumUpdate(): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.downloadAndExtractPackage();
      return {
        success,
        message: success ? 'Curriculum database successfully updated' : 'Update failed'
      };
    } catch (err) {
      const message = (err as Error).message;
      this.emitProgress({
        phase: 'ERROR',
        bytesDownloaded: 0,
        totalBytes: 0,
        percent: 0,
        message: `Update error: ${message}`
      });
      return { success: false, message };
    }
  }

  private async downloadAndExtractPackage(): Promise<boolean> {
    const manifestUrl = `${this.baseUrl}/manifest.json`;
    const archiveUrl = `${this.baseUrl}/curriculum.db.gz`;

    // 1. Fetch remote manifest
    this.emitProgress({
      phase: 'CHECKING',
      bytesDownloaded: 0,
      totalBytes: 0,
      percent: 5,
      message: 'Fetching manifest metadata...'
    });

    const manifestRes = await fetch(manifestUrl, { cache: 'no-cache' });
    if (!manifestRes.ok) {
      throw new Error(`Failed to fetch manifest: HTTP ${manifestRes.status}`);
    }
    const manifest = (await manifestRes.json()) as ContentManifest;

    // 2. Download compressed archive
    this.emitProgress({
      phase: 'DOWNLOADING',
      bytesDownloaded: 0,
      totalBytes: 0,
      percent: 15,
      message: 'Downloading curriculum bundle...'
    });

    const archiveRes = await fetch(archiveUrl);
    if (!archiveRes.ok) {
      throw new Error(`Failed to fetch archive: HTTP ${archiveRes.status}`);
    }

    const totalBytes = Number(archiveRes.headers.get('content-length') || 0);
    const arrayBuffer = await archiveRes.arrayBuffer();
    const compressedBuffer = Buffer.from(arrayBuffer);

    this.emitProgress({
      phase: 'DOWNLOADING',
      bytesDownloaded: compressedBuffer.length,
      totalBytes: totalBytes || compressedBuffer.length,
      percent: 60,
      message: 'Download complete. Decompressing...'
    });

    // 3. Decompress Gzip
    this.emitProgress({
      phase: 'EXTRACTING',
      bytesDownloaded: compressedBuffer.length,
      totalBytes: totalBytes || compressedBuffer.length,
      percent: 75,
      message: 'Decompressing curriculum database...'
    });

    const decompressed = zlib.gunzipSync(compressedBuffer);

    // 4. Verify SHA-256 checksum of decompressed DB
    this.emitProgress({
      phase: 'VERIFYING',
      bytesDownloaded: compressedBuffer.length,
      totalBytes: totalBytes || compressedBuffer.length,
      percent: 85,
      message: 'Verifying SHA-256 integrity...'
    });

    const actualHash = crypto.createHash('sha256').update(decompressed).digest('hex');
    if (manifest.sha256_checksum && actualHash !== manifest.sha256_checksum) {
      throw new Error(
        `SHA-256 verification failed! Expected ${manifest.sha256_checksum}, got ${actualHash}`
      );
    }

    // 5. Atomic write to temp file then rename
    const tempFile = path.join(this.contentDir, `curriculum.db.tmp-${Date.now()}`);
    fs.writeFileSync(tempFile, decompressed);

    // Verify temp file is a valid SQLite DB
    try {
      const testDb = new Database(tempFile, { readonly: true });
      testDb.prepare('PRAGMA integrity_check').get();
      testDb.close();
    } catch (testErr) {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      throw new Error(`Corrupted SQLite database received: ${(testErr as Error).message}`);
    }

    // Atomic swap: replace curriculum.db
    if (fs.existsSync(this.curriculumDbPath)) {
      fs.unlinkSync(this.curriculumDbPath);
    }
    fs.renameSync(tempFile, this.curriculumDbPath);

    // Save manifest
    fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));

    this.emitProgress({
      phase: 'COMPLETE',
      bytesDownloaded: compressedBuffer.length,
      totalBytes: compressedBuffer.length,
      percent: 100,
      message: 'Curriculum database ready.'
    });

    return true;
  }

  public applyLocalBundledFallback(): boolean {
    if (this.bundledSeedPath && fs.existsSync(this.bundledSeedPath)) {
      this.emitProgress({
        phase: 'EXTRACTING',
        bytesDownloaded: 0,
        totalBytes: 0,
        percent: 50,
        message: 'Copying bundled curriculum seed...'
      });

      fs.copyFileSync(this.bundledSeedPath, this.curriculumDbPath);

      const localManifest: ContentManifest = {
        version: '1.0.0-bundled',
        schema_version: 1,
        published_at: new Date().toISOString(),
        sha256_checksum: crypto
          .createHash('sha256')
          .update(fs.readFileSync(this.curriculumDbPath))
          .digest('hex'),
        total_questions: 0,
        total_nodes: 0,
        total_lectures: 0,
        notes: 'Locally bundled initial seed fallback'
      };

      fs.writeFileSync(this.manifestPath, JSON.stringify(localManifest, null, 2));

      this.emitProgress({
        phase: 'COMPLETE',
        bytesDownloaded: 0,
        totalBytes: 0,
        percent: 100,
        message: 'Local seed fallback installed.'
      });

      return true;
    }

    return false;
  }

  private compareSemver(v1: string, v2: string): number {
    const parse = (v: string) =>
      v
        .replace(/^v/, '')
        .split('-')[0]
        .split('.')
        .map((n) => parseInt(n, 10) || 0);

    const [maj1, min1, pat1] = parse(v1);
    const [maj2, min2, pat2] = parse(v2);

    if (maj1 !== maj2) return maj1 - maj2;
    if (min1 !== min2) return min1 - min2;
    return pat1 - pat2;
  }
}
