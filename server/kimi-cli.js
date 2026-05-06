import { createSession } from '@moonshot-ai/kimi-agent-sdk';

let activeKimiSessions = new Map();

async function queryKimi(command, options = {}, ws) {
  const { sessionId, cwd, projectPath, thinkingParam } = options;
  const workingDirectory = cwd || projectPath || process.cwd();

  let session;
  let currentSessionId = sessionId;

  try {
    // Create or resume session
    const sessionOptions = {
      workDir: workingDirectory,
      thinking: thinkingParam?.thinking || false,
    };

    if (sessionId && activeKimiSessions.has(sessionId)) {
      // Resume existing session
      session = activeKimiSessions.get(sessionId).session;
      currentSessionId = sessionId;
    } else {
      // Create new session
      session = createSession(sessionOptions);
      currentSessionId = session.sessionId;

      // Track the session
      activeKimiSessions.set(currentSessionId, {
        session,
        status: 'running',
        startedAt: new Date().toISOString()
      });

      // Send session created event
      sendMessage(ws, {
        type: 'session-created',
        sessionId: currentSessionId,
        provider: 'kimi'
      });
    }

    // Execute with streaming
    const turn = session.prompt(command);

    for await (const event of turn) {
      // Check if session was aborted
      const tracked = activeKimiSessions.get(currentSessionId);
      if (!tracked || tracked.status === 'aborted') {
        break;
      }

      const transformed = transformKimiEvent(event, currentSessionId);
      if (transformed) {
        sendMessage(ws, transformed);
      }
    }

    // Send completion
    sendMessage(ws, {
      type: 'session-complete',
      sessionId: currentSessionId,
      provider: 'kimi'
    });

    // Clean up
    activeKimiSessions.delete(currentSessionId);
    return { success: true, sessionId: currentSessionId };

  } catch (error) {
    console.error('[Kimi] Error:', error.message);

    sendMessage(ws, {
      type: 'error',
      error: error.message,
      sessionId: currentSessionId,
      provider: 'kimi'
    });

    // Clean up on error
    if (currentSessionId) {
      activeKimiSessions.delete(currentSessionId);
    }
    return { success: false, error: error.message };
  }
}

function transformKimiEvent(event, sessionId) {
  if (!event) return null;

  switch (event.type) {
    case 'ContentPart':
      if (event.payload?.type === 'text') {
        return {
          type: 'assistant',
          content: event.payload.text,
          sessionId,
          provider: 'kimi'
        };
      }
      if (event.payload?.type === 'think') {
        return {
          type: 'thinking',
          content: event.payload.think,
          sessionId,
          provider: 'kimi',
          isThinking: true
        };
      }
      break;

    case 'ToolCall':
      return {
        type: 'tool_use',
        name: event.payload?.function?.name || 'unknown',
        input: event.payload?.function?.arguments || {},
        toolUseId: event.payload?.id || '',
        sessionId,
        provider: 'kimi'
      };

    case 'ToolResult':
      return {
        type: 'tool_result',
        content: event.payload?.content || '',
        toolUseId: event.payload?.tool_use_id || '',
        sessionId,
        provider: 'kimi'
      };

    case 'StatusUpdate':
      if (event.payload?.usage) {
        return {
          type: 'token-usage',
          usage: event.payload.usage,
          sessionId,
          provider: 'kimi'
        };
      }
      break;
  }

  return null;
}

function sendMessage(ws, data) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
}

async function abortKimiSession(sessionId) {
  const tracked = activeKimiSessions.get(sessionId);
  if (tracked) {
    tracked.status = 'aborted';
    try {
      // Interrupt the current turn if possible
      if (tracked.currentTurn) {
        await tracked.currentTurn.interrupt();
      }
    } catch (e) {
      // Ignore interrupt errors
    }
    activeKimiSessions.delete(sessionId);
    return true;
  }
  return false;
}

function getActiveKimiSessions() {
  return Array.from(activeKimiSessions.entries()).map(([id, data]) => ({
    sessionId: id,
    status: data.status,
    startedAt: data.startedAt
  }));
}

export {
  queryKimi,
  abortKimiSession,
  getActiveKimiSessions
};
