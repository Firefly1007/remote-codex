import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import toml from '@iarna/toml';

const router = express.Router();

router.get('/claude/status', async (req, res) => {
  try {
    const credentialsResult = await checkClaudeCredentials();

    if (credentialsResult.authenticated) {
      return res.json({
        authenticated: true,
        email: credentialsResult.email || 'Authenticated',
        method: credentialsResult.method  // 'api_key' or 'credentials_file'
      });
    }

    return res.json({
      authenticated: false,
      email: null,
      method: null,
      error: credentialsResult.error || 'Not authenticated'
    });

  } catch (error) {
    console.error('Error checking Claude auth status:', error);
    res.status(500).json({
      authenticated: false,
      email: null,
      method: null,
      error: error.message
    });
  }
});

router.get('/cursor/status', async (req, res) => {
  try {
    const result = await checkCursorStatus();

    res.json({
      authenticated: result.authenticated,
      email: result.email,
      method: result.method,
      error: result.error
    });

  } catch (error) {
    console.error('Error checking Cursor auth status:', error);
    res.status(500).json({
      authenticated: false,
      email: null,
      method: null,
      error: error.message
    });
  }
});

router.get('/codex/status', async (req, res) => {
  try {
    const result = await checkCodexCredentials();

    res.json({
      authenticated: result.authenticated,
      email: result.email,
      method: result.method,
      error: result.error
    });

  } catch (error) {
    console.error('Error checking Codex auth status:', error);
    res.status(500).json({
      authenticated: false,
      email: null,
      method: null,
      error: error.message
    });
  }
});

router.get('/gemini/status', async (req, res) => {
  try {
    const result = await checkGeminiCredentials();

    res.json({
      authenticated: result.authenticated,
      email: result.email,
      method: result.method,
      error: result.error
    });

  } catch (error) {
    console.error('Error checking Gemini auth status:', error);
    res.status(500).json({
      authenticated: false,
      email: null,
      method: null,
      error: error.message
    });
  }
});

router.get('/kimi/status', async (req, res) => {
  try {
    const result = await checkKimiCredentials();

    res.json({
      authenticated: result.authenticated,
      email: result.email,
      method: result.method,
      error: result.error
    });

  } catch (error) {
    console.error('Error checking Kimi auth status:', error);
    res.status(500).json({
      authenticated: false,
      email: null,
      method: null,
      error: error.message
    });
  }
});

/**
 * Checks Claude authentication credentials using two methods with priority order:
 *
 * Priority 1: ANTHROPIC_API_KEY environment variable
 * Priority 2: ~/.claude/.credentials.json OAuth tokens
 *
 * The Claude Agent SDK prioritizes environment variables over authenticated subscriptions.
 * This matching behavior ensures consistency with how the SDK authenticates.
 *
 * References:
 * - https://support.claude.com/en/articles/12304248-managing-api-key-environment-variables-in-claude-code
 *   "Claude Code prioritizes environment variable API keys over authenticated subscriptions"
 * - https://platform.claude.com/docs/en/agent-sdk/overview
 *   SDK authentication documentation
 *
 * @returns {Promise<Object>} Authentication status with { authenticated, email, method }
 *   - authenticated: boolean indicating if valid credentials exist
 *   - email: user email or auth method identifier
 *   - method: 'api_key' for env var, 'credentials_file' for OAuth tokens
 */
async function checkClaudeCredentials() {
  // Priority 1: Check for ANTHROPIC_API_KEY environment variable
  // The SDK checks this first and uses it if present, even if OAuth tokens exist.
  // When set, API calls are charged via pay-as-you-go rates instead of subscription.
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()) {
    return {
      authenticated: true,
      email: 'API Key Auth',
      method: 'api_key'
    };
  }

  // Priority 2: Check ~/.claude/.credentials.json for OAuth tokens
  // This is the standard authentication method used by Claude CLI after running
  // 'claude /login' or 'claude setup-token' commands.
  try {
    const credPath = path.join(os.homedir(), '.claude', '.credentials.json');
    const content = await fs.readFile(credPath, 'utf8');
    const creds = JSON.parse(content);

    const oauth = creds.claudeAiOauth;
    if (oauth && oauth.accessToken) {
      const isExpired = oauth.expiresAt && Date.now() >= oauth.expiresAt;

      if (!isExpired) {
        return {
          authenticated: true,
          email: creds.email || creds.user || null,
          method: 'credentials_file'
        };
      }
    }

    return {
      authenticated: false,
      email: null,
      method: null
    };
  } catch (error) {
    return {
      authenticated: false,
      email: null,
      method: null
    };
  }
}

async function checkCursorStatus() {
  // Priority 1: Check ~/.cursor/config.json for API key configuration
  // Cursor CLI can be configured via config file without login
  try {
    const configPath = path.join(os.homedir(), '.cursor', 'config.json');
    const content = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(content);

    if (config.apiKey || config.api_key) {
      return {
        authenticated: true,
        email: 'Config Auth',
        method: 'config_file'
      };
    }
  } catch (e) {
    // Config file doesn't exist or is invalid, continue to other checks
  }

  // Priority 2: Check ~/.cursor/cli-config.json for API key
  try {
    const cliConfigPath = path.join(os.homedir(), '.cursor', 'cli-config.json');
    const content = await fs.readFile(cliConfigPath, 'utf8');
    const config = JSON.parse(content);

    if (config.apiKey || config.api_key) {
      return {
        authenticated: true,
        email: 'Config Auth',
        method: 'config_file'
      };
    }
  } catch (e) {
    // Config file doesn't exist or is invalid, continue
  }

  // Priority 3: Check cursor-agent status (login-based auth)
  return new Promise((resolve) => {
    let processCompleted = false;

    const timeout = setTimeout(() => {
      if (!processCompleted) {
        processCompleted = true;
        if (childProcess) {
          childProcess.kill();
        }
        resolve({
          authenticated: false,
          email: null,
          error: 'Command timeout'
        });
      }
    }, 5000);

    let childProcess;
    try {
      childProcess = spawn('cursor-agent', ['status']);
    } catch (err) {
      clearTimeout(timeout);
      processCompleted = true;
      resolve({
        authenticated: false,
        email: null,
        error: 'Cursor CLI not found or not installed'
      });
      return;
    }

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      if (processCompleted) return;
      processCompleted = true;
      clearTimeout(timeout);

      if (code === 0) {
        const emailMatch = stdout.match(/Logged in as ([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);

        if (emailMatch) {
          resolve({
            authenticated: true,
            email: emailMatch[1],
            method: 'login'
          });
        } else if (stdout.includes('Logged in')) {
          resolve({
            authenticated: true,
            email: 'Logged in',
            method: 'login'
          });
        } else {
          resolve({
            authenticated: false,
            email: null,
            error: 'Not logged in'
          });
        }
      } else {
        resolve({
          authenticated: false,
          email: null,
          error: stderr || 'Not logged in'
        });
      }
    });

    childProcess.on('error', (err) => {
      if (processCompleted) return;
      processCompleted = true;
      clearTimeout(timeout);

      resolve({
        authenticated: false,
        email: null,
        error: 'Cursor CLI not found or not installed'
      });
    });
  });
}

async function checkCodexCredentials() {
  // Priority 1: Check OPENAI_API_KEY environment variable
  // Codex CLI uses OpenAI API and can be configured via env var
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
    return {
      authenticated: true,
      email: 'API Key Auth',
      method: 'api_key'
    };
  }

  // Priority 2: Check ~/.codex/auth.json
  try {
    const authPath = path.join(os.homedir(), '.codex', 'auth.json');
    const content = await fs.readFile(authPath, 'utf8');
    const auth = JSON.parse(content);

    // Tokens are nested under 'tokens' key
    const tokens = auth.tokens || {};

    // Check for valid tokens (id_token or access_token)
    if (tokens.id_token || tokens.access_token) {
      // Try to extract email from id_token JWT payload
      let email = 'Authenticated';
      if (tokens.id_token) {
        try {
          // JWT is base64url encoded: header.payload.signature
          const parts = tokens.id_token.split('.');
          if (parts.length >= 2) {
            // Decode the payload (second part)
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
            email = payload.email || payload.user || 'Authenticated';
          }
        } catch {
          // If JWT decoding fails, use fallback
          email = 'Authenticated';
        }
      }

      return {
        authenticated: true,
        email,
        method: 'credentials_file'
      };
    }

    // Also check for OPENAI_API_KEY in auth.json as fallback
    if (auth.OPENAI_API_KEY) {
      return {
        authenticated: true,
        email: 'API Key Auth',
        method: 'config_file'
      };
    }

    return {
      authenticated: false,
      email: null,
      method: null,
      error: 'No valid tokens found'
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        authenticated: false,
        email: null,
        method: null,
        error: 'Codex not configured'
      };
    }
    return {
      authenticated: false,
      email: null,
      method: null,
      error: error.message
    };
  }
}

async function checkGeminiCredentials() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return {
      authenticated: true,
      email: 'API Key Auth',
      method: 'api_key'
    };
  }

  try {
    const credsPath = path.join(os.homedir(), '.gemini', 'oauth_creds.json');
    const content = await fs.readFile(credsPath, 'utf8');
    const creds = JSON.parse(content);

    if (creds.access_token) {
      let email = 'OAuth Session';

      try {
        // Validate token against Google API
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${creds.access_token}`);
        if (tokenRes.ok) {
          const tokenInfo = await tokenRes.json();
          if (tokenInfo.email) {
            email = tokenInfo.email;
          }
        } else if (!creds.refresh_token) {
          // Token invalid and no refresh token available
          return {
            authenticated: false,
            email: null,
            method: null,
            error: 'Access token invalid and no refresh token found'
          };
        } else {
          // Token might be expired but we have a refresh token, so CLI will refresh it
          try {
            const accPath = path.join(os.homedir(), '.gemini', 'google_accounts.json');
            const accContent = await fs.readFile(accPath, 'utf8');
            const accounts = JSON.parse(accContent);
            if (accounts.active) {
              email = accounts.active;
            }
          } catch (e) { }
        }
      } catch (e) {
        // Network error, fallback to checking local accounts file
        try {
          const accPath = path.join(os.homedir(), '.gemini', 'google_accounts.json');
          const accContent = await fs.readFile(accPath, 'utf8');
          const accounts = JSON.parse(accContent);
          if (accounts.active) {
            email = accounts.active;
          }
        } catch (err) { }
      }

      return {
        authenticated: true,
        email: email,
        method: 'credentials_file'
      };
    }

    return {
      authenticated: false,
      email: null,
      method: null,
      error: 'No valid tokens found in oauth_creds'
    };
  } catch (error) {
    return {
      authenticated: false,
      email: null,
      method: null,
      error: 'Gemini CLI not configured'
    };
  }
}

/**
 * Checks Kimi authentication by reading ~/.kimi/config.toml
 * Kimi SDK stores auth in [providers."managed:kimi-code"] section
 * with either api_key or oauth fields.
 */
async function checkKimiCredentials() {
  try {
    const kimiDir = process.env.KIMI_SHARE_DIR || path.join(os.homedir(), '.kimi');
    const configPath = path.join(kimiDir, 'config.toml');
    const content = await fs.readFile(configPath, 'utf8');
    const config = toml.parse(content);

    const providers = config.providers;
    if (!providers) {
      return {
        authenticated: false,
        email: null,
        method: null,
        error: 'No providers configured'
      };
    }

    // Check for managed:kimi-code provider (the default Kimi provider)
    const kimiProvider = providers['managed:kimi-code'];
    if (kimiProvider) {
      // Check for API key
      if (kimiProvider.api_key && kimiProvider.api_key.trim()) {
        return {
          authenticated: true,
          email: 'API Key Auth',
          method: 'config_file'
        };
      }

      // Check for OAuth configuration
      if (kimiProvider.oauth) {
        return {
          authenticated: true,
          email: 'OAuth Session',
          method: 'credentials_file'
        };
      }
    }

    // Also check for any provider with a valid api_key
    for (const [name, provider] of Object.entries(providers)) {
      if (provider.api_key && provider.api_key.trim()) {
        return {
          authenticated: true,
          email: `Config Auth (${name})`,
          method: 'config_file'
        };
      }
    }

    return {
      authenticated: false,
      email: null,
      method: null,
      error: 'No valid credentials found in Kimi config'
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        authenticated: false,
        email: null,
        method: null,
        error: 'Kimi not configured'
      };
    }
    return {
      authenticated: false,
      email: null,
      method: null,
      error: error.message
    };
  }
}

export default router;
