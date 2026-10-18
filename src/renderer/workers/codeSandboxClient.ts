// ==============================================================================
// CODE SANDBOX CLIENT MANAGER
// Enforces a strict 2,000ms timeout on Web Worker execution.
// Terminating and respawning the worker if code hangs (e.g. while True: pass).
// ==============================================================================

import type { SandboxRequest, SandboxResponse } from './codeSandbox.worker';

export class CodeSandboxClient {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (res: SandboxResponse) => void;
      reject: (err: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();

  private workerFactory: () => Worker;

  constructor(
    workerFactory = () =>
      new Worker(new URL('./codeSandbox.worker.ts', import.meta.url), { type: 'module' })
  ) {
    this.workerFactory = workerFactory;
    this.initWorker();
  }

  private initWorker(): void {
    try {
      this.worker = this.workerFactory();
    } catch {
      this.worker = null;
      return;
    }

    if (!this.worker) return;

    this.worker.onmessage = (event: MessageEvent<SandboxResponse>) => {
      const { id } = event.data;
      const pending = this.pendingRequests.get(id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(id);
        pending.resolve(event.data);
      }
    };

    this.worker.onerror = (err) => {
      console.error('[SANDBOX-WORKER] Error in Web Worker:', err);
    };
  }

  public async execute(
    language: 'PYTHON' | 'SQL',
    code: string,
    timeoutMs = 2000
  ): Promise<SandboxResponse> {
    if (!this.worker) {
      this.initWorker();
    }

    const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const request: SandboxRequest = { id, language, code };

    return new Promise<SandboxResponse>((resolve, reject) => {
      // 2,000ms hard timeout guard
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        // Terminate worker immediately to kill runaway CPU spin
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        // Respawn clean worker
        this.initWorker();
        reject(
          new Error(
            `Execution timed out (${timeoutMs}ms limit exceeded). Infinite loop or long calculation terminated.`
          )
        );
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });

      if (this.worker) {
        this.worker.postMessage(request);
      } else {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(new Error('Web Worker unavailable in this environment'));
      }
    });
  }

  public terminate(): void {
    for (const [, req] of this.pendingRequests) {
      clearTimeout(req.timer);
    }
    this.pendingRequests.clear();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const codeSandboxClient = new CodeSandboxClient();
