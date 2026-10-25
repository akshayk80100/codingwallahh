/**
 * Coding Wallah Skills - Central Production Runtime Configuration
 * Handles environment detection, dynamic production URLs, and brand constants.
 * Eliminates hardcoded localhost URLs in production.
 */
(function() {
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname.endsWith('.local');

  window.CW_CONFIG = {
    brandName: "Coding Wallah Skills",
    brandShort: "CW Skills",
    tagline: "Master Real-World Engineering • From Code to Career",
    isLocal: isLocal,
    isProduction: !isLocal,
    
    // Dynamic Base URL - never hardcodes localhost in production
    baseUrl: window.location.origin,
    
    // API Endpoints - uses relative paths in production or local port in development
    apiBaseUrl: isLocal ? (window.location.port === '5000' ? '' : 'http://localhost:5000') : '/api',
    
    // Supported Production Domains
    productionDomains: [
      "codingwallahskills.com",
      "www.codingwallahskills.com",
      "codingwallahskills.in"
    ],
    
    // Active Version
    version: "2.1.0",
    releaseYear: 2026
  };
})();
