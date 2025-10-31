/**
 * Session and Cookie Handling Middleware
 * Manages session persistence, cookie relay, and authentication state
 */

const session = require('express-session');
const cookieParser = require('cookie-parser');

/**
 * Configure session middleware
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
function configureSessionMiddleware(options = {}) {
  const sessionConfig = {
    secret: options.sessionSecret || process.env.SESSION_SECRET || 'geforcenow-proxy-secret',
    resave: options.resave || false,
    saveUninitialized: options.saveUninitialized || true,
    cookie: {
      maxAge: options.cookieMaxAge || (24 * 60 * 60 * 1000), // 24 hours
      httpOnly: options.httpOnly || true,
      secure: options.secure || process.env.NODE_ENV === 'production',
      sameSite: options.sameSite || 'lax'
    },
    name: 'geforcenow-session',
    ...options
  };

  return session(sessionConfig);
}

/**
 * Cookie relay middleware
 * Handles forwarding cookies from proxied requests
 */
class CookieRelayMiddleware {
  constructor(options = {}) {
    this.options = {
      stripSecure: options.stripSecure || false,
      stripHttpOnly: options.stripHttpOnly || false,
      cookieWhitelist: options.cookieWhitelist || [],
      cookieBlacklist: options.cookieBlacklist || [],
      ...options
    };
    this.cookieStore = new Map();
  }

  /**
   * Express middleware for cookie relay
   */
  middleware() {
    return (req, res, next) => {
      // Store incoming cookies
      const cookies = cookieParser.signedCookies(req, this.options.sessionSecret);
      this.storeCookies(req.sessionID, cookies);

      // Attach cookie relay methods to response
      res.relaySetCookie = (cookieString) => {
        this.relayCookie(req.sessionID, cookieString);
      };

      next();
    };
  }

  /**
   * Store cookies for a session
   * @param {string} sessionId - Session ID
   * @param {Object} cookies - Cookies to store
   */
  storeCookies(sessionId, cookies) {
    if (!this.cookieStore.has(sessionId)) {
      this.cookieStore.set(sessionId, {});
    }
    const sessionCookies = this.cookieStore.get(sessionId);
    Object.assign(sessionCookies, cookies);
  }

  /**
   * Relay cookie from proxied response
   * @param {string} sessionId - Session ID
   * @param {string} cookieString - Cookie string from Set-Cookie header
   */
  relayCookie(sessionId, cookieString) {
    try {
      const parsed = this.parseCookieString(cookieString);
      
      // Check whitelist/blacklist
      if (this.options.cookieWhitelist.length > 0) {
        if (!this.options.cookieWhitelist.includes(parsed.name)) {
          return;
        }
      }
      
      if (this.options.cookieBlacklist.includes(parsed.name)) {
        return;
      }

      // Apply option overrides
      if (this.options.stripSecure) {
        parsed.attributes.secure = false;
      }
      if (this.options.stripHttpOnly) {
        parsed.attributes.httpOnly = false;
      }

      // Store in session
      this.storeCookies(sessionId, { [parsed.name]: parsed.value });
      
      console.log(`[Cookie Relay] Stored cookie: ${parsed.name} for session ${sessionId}`);
    } catch (error) {
      console.error(`[Cookie Relay] Error relaying cookie:`, error);
    }
  }

  /**
   * Parse cookie string
   * @param {string} cookieString - Cookie string
   * @returns {Object} Parsed cookie
   */
  parseCookieString(cookieString) {
    const parts = cookieString.split(';').map(s => s.trim());
    const [nameValue] = parts;
    const [name, value] = nameValue.split('=');
    
    const attributes = {};
    for (let i = 1; i < parts.length; i++) {
      const [attrName, attrValue] = parts[i].split('=').map(s => s.trim());
      attributes[attrName.toLowerCase()] = attrValue || true;
    }

    return { name, value, attributes };
  }

  /**
   * Get cookies for a session
   * @param {string} sessionId - Session ID
   * @returns {Object} Session cookies
   */
  getCookies(sessionId) {
    return this.cookieStore.get(sessionId) || {};
  }

  /**
   * Clear cookies for a session
   * @param {string} sessionId - Session ID
   */
  clearCookies(sessionId) {
    this.cookieStore.delete(sessionId);
  }
}

/**
 * Authentication state middleware
 * Manages user authentication state across proxy requests
 */
class AuthenticationStateMiddleware {
  constructor(options = {}) {
    this.options = options;
    this.states = new Map();
  }

  /**
   * Express middleware
   */
  middleware() {
    return (req, res, next) => {
      // Initialize auth state if not exists
      if (!this.states.has(req.sessionID)) {
        this.states.set(req.sessionID, {
          isAuthenticated: false,
          user: null,
          loginTime: null,
          lastActivity: Date.now()
        });
      }

      const authState = this.states.get(req.sessionID);
      authState.lastActivity = Date.now();

      // Attach auth methods to request
      req.setAuthState = (user) => {
        this.setAuthState(req.sessionID, user);
      };

      req.getAuthState = () => {
        return this.getAuthState(req.sessionID);
      };

      req.clearAuthState = () => {
        this.clearAuthState(req.sessionID);
      };

      next();
    };
  }

  /**
   * Set authentication state
   * @param {string} sessionId - Session ID
   * @param {Object} user - User object
   */
  setAuthState(sessionId, user) {
    const state = this.states.get(sessionId) || {};
    state.isAuthenticated = true;
    state.user = user;
    state.loginTime = Date.now();
    this.states.set(sessionId, state);
    console.log(`[Auth State] User authenticated for session ${sessionId}`);
  }

  /**
   * Get authentication state
   * @param {string} sessionId - Session ID
   * @returns {Object} Auth state
   */
  getAuthState(sessionId) {
    return this.states.get(sessionId) || {
      isAuthenticated: false,
      user: null
    };
  }

  /**
   * Clear authentication state
   * @param {string} sessionId - Session ID
   */
  clearAuthState(sessionId) {
    this.states.delete(sessionId);
    console.log(`[Auth State] Auth state cleared for session ${sessionId}`);
  }

  /**
   * Get statistics
   * @returns {Object} Stats
   */
  getStats() {
    return {
      activeSessions: this.states.size,
      authenticatedUsers: Array.from(this.states.values()).filter(s => s.isAuthenticated).length
    };
  }
}

module.exports = {
  configureSessionMiddleware,
  CookieRelayMiddleware,
  AuthenticationStateMiddleware,
  cookieParser
};
