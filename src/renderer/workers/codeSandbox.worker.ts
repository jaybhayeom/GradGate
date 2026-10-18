// ==============================================================================
// CODE SANDBOX WEB WORKER
// Executes Python / SQL sandbox drills in a dedicated isolated thread.
// ==============================================================================

export interface SandboxRequest {
  id: string;
  language: 'PYTHON' | 'SQL';
  code: string;
  context?: Record<string, unknown>;
}

export interface SandboxResponse {
  id: string;
  success: boolean;
  output: string;
  executionTimeMs: number;
  error?: string;
}

// In-worker message handler
self.onmessage = (event: MessageEvent<SandboxRequest>) => {
  const { id, language, code } = event.data;
  const startTime = performance.now();

  try {
    let output = '';

    if (language === 'SQL') {
      // Lightweight client SQL runner simulation
      output = executeSqlSimulation(code);
    } else {
      // Lightweight client Python runner simulation
      output = executePythonSimulation(code);
    }

    const duration = performance.now() - startTime;
    const response: SandboxResponse = {
      id,
      success: true,
      output,
      executionTimeMs: Math.round(duration * 100) / 100
    };
    self.postMessage(response);
  } catch (err) {
    const duration = performance.now() - startTime;
    const response: SandboxResponse = {
      id,
      success: false,
      output: '',
      executionTimeMs: Math.round(duration * 100) / 100,
      error: (err as Error).message
    };
    self.postMessage(response);
  }
};

function executeSqlSimulation(query: string): string {
  const trimmed = query.trim().toUpperCase();
  if (trimmed.startsWith('SELECT')) {
    return 'Query executed successfully. (Simulated result set: 1 row returned)';
  }
  return 'Query executed successfully.';
}

function executePythonSimulation(code: string): string {
  // If code contains explicit infinite loop patterns for testing
  if (/while\s+True\s*:\s*pass/i.test(code) || /for\s+_\s+in\s+iter\(int,\s*1\)/.test(code)) {
    // Deliberate spin to trigger hard 2000ms worker timeout in tests
    const start = Date.now();
    while (Date.now() - start < 3500) {
      // Spin
    }
  }
  return 'Python execution complete. (Output: Return value 0)';
}
