/**
 * HTTP Rewriter Module
 * Handles rewriting of HTML, CSS, and JavaScript content
 * to proxy URLs and fix relative paths
 */

const cheerio = require('cheerio');

/**
 * Rewrite HTML content to proxy URLs
 * @param {string} html - The HTML content
 * @param {string} proxyBaseUrl - The proxy server base URL
 * @param {string} targetUrl - The original target URL
 * @returns {string} Rewritten HTML
 */
function rewriteHtml(html, proxyBaseUrl, targetUrl) {
  try {
    const $ = cheerio.load(html);
    
    // Rewrite src attributes
    $('[src]').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        $(elem).attr('src', rewriteUrl(src, proxyBaseUrl, targetUrl));
      }
    });
    
    // Rewrite href attributes
    $('[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && !href.startsWith('javascript:')) {
        $(elem).attr('href', rewriteUrl(href, proxyBaseUrl, targetUrl));
      }
    });
    
    // Rewrite action attributes
    $('[action]').each((i, elem) => {
      const action = $(elem).attr('action');
      if (action) {
        $(elem).attr('action', rewriteUrl(action, proxyBaseUrl, targetUrl));
      }
    });
    
    // Rewrite data-* attributes that might contain URLs
    $('[data-url], [data-src], [data-href]').each((i, elem) => {
      ['data-url', 'data-src', 'data-href'].forEach(attr => {
        const value = $(elem).attr(attr);
        if (value) {
          $(elem).attr(attr, rewriteUrl(value, proxyBaseUrl, targetUrl));
        }
      });
    });
    
    return $.html();
  } catch (error) {
    console.error('Error rewriting HTML:', error);
    return html;
  }
}

/**
 * Rewrite CSS content to proxy URLs
 * @param {string} css - The CSS content
 * @param {string} proxyBaseUrl - The proxy server base URL
 * @param {string} targetUrl - The original target URL
 * @returns {string} Rewritten CSS
 */
function rewriteCss(css, proxyBaseUrl, targetUrl) {
  try {
    // Rewrite url() references
    const urlPattern = /url\(['"]?([^)'"]+)['"]?\)/gi;
    return css.replace(urlPattern, (match, url) => {
      const rewritten = rewriteUrl(url, proxyBaseUrl, targetUrl);
      return `url('${rewritten}')`;
    });
  } catch (error) {
    console.error('Error rewriting CSS:', error);
    return css;
  }
}

/**
 * Rewrite JavaScript content to proxy URLs in strings
 * @param {string} js - The JavaScript content
 * @param {string} proxyBaseUrl - The proxy server base URL
 * @param {string} targetUrl - The original target URL
 * @returns {string} Rewritten JavaScript
 */
function rewriteJavaScript(js, proxyBaseUrl, targetUrl) {
  try {
    // Basic rewriting of fetch/XMLHttpRequest URLs
    // This is a simple implementation and may need enhancement
    const stringPattern = /['"]((https?:)?\/\/[^'"]+)['"]|['"](\/[^'"]+)['"]|['"]([^'"\/][^'"]*(?:api|endpoint)[^'"]*)['"]'/gi;
    
    return js.replace(stringPattern, (match, fullUrl, protocol, relativePath, apiPath) => {
      const urlToRewrite = fullUrl || relativePath || apiPath;
      if (urlToRewrite) {
        const rewritten = rewriteUrl(urlToRewrite, proxyBaseUrl, targetUrl);
        return match.replace(urlToRewrite, rewritten);
      }
      return match;
    });
  } catch (error) {
    console.error('Error rewriting JavaScript:', error);
    return js;
  }
}

/**
 * Helper function to rewrite a single URL
 * @param {string} url - The URL to rewrite
 * @param {string} proxyBaseUrl - The proxy server base URL
 * @param {string} targetUrl - The original target URL
 * @returns {string} Rewritten URL
 */
function rewriteUrl(url, proxyBaseUrl, targetUrl) {
  // Skip empty URLs, anchors, and javascript: URLs
  if (!url || url === '#' || url.startsWith('javascript:')) {
    return url;
  }
  
  // Already proxied
  if (url.startsWith(proxyBaseUrl)) {
    return url;
  }
  
  // Absolute URLs (http/https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `${proxyBaseUrl}/proxy?url=${encodeURIComponent(url)}`;
  }
  
  // Protocol-relative URLs
  if (url.startsWith('//')) {
    return `${proxyBaseUrl}/proxy?url=${encodeURIComponent('https:' + url)}`;
  }
  
  // Relative URLs
  if (url.startsWith('/')) {
    const targetBase = new URL(targetUrl);
    const absoluteUrl = `${targetBase.protocol}//${targetBase.host}${url}`;
    return `${proxyBaseUrl}/proxy?url=${encodeURIComponent(absoluteUrl)}`;
  }
  
  // Relative paths (relative to current page)
  if (!url.startsWith('#')) {
    const targetBase = new URL(targetUrl);
    const absoluteUrl = new URL(url, targetUrl).href;
    return `${proxyBaseUrl}/proxy?url=${encodeURIComponent(absoluteUrl)}`;
  }
  
  return url;
}

module.exports = {
  rewriteHtml,
  rewriteCss,
  rewriteJavaScript,
  rewriteUrl
};
