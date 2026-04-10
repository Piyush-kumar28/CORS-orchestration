/**
 * CORS Policy Model - Core model for managing Cross-Origin Resource Sharing policies
 * 
 * This model handles:
 * - Dynamic CORS policy management (origins, methods, headers)
 * - Fine-grained control over allowed/blocked origins
 * - HTTP method-level access control (GET, POST, PUT, DELETE, PATCH, HEAD)
 * - Request header validation and credential support
 * - Preflight caching configuration
 * 
 * Key Features:
 * - Both allowlist (allowedOrigins) and blacklist (blacklistedOrigins) support
 * - Can be applied globally (organization-level) or per-API
 * - Real-time activation/deactivation without API restart
 * - Preflight cache control (maxAge) for performance optimization
 * 
 * @module models/CorsPolicy
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * CORS Policy Schema Definition
 * 
 * Fields:
 * - organization: Reference to parent Organization for multi-tenant isolation
 * - apiId: Optional reference to specific API (null = organization-wide policy)
 * - name: Human-readable policy name (e.g., "Partner Access", "Public API")
 * - allowedOrigins: Array of origins that CAN access the resource
 * - blacklistedOrigins: Array of origins that are explicitly DENIED
 * - allowedMethods: HTTP methods allowed (GET, POST, PUT, DELETE, OPTIONS, etc.)
 * - allowedHeaders: Request headers allowed (Content-Type, Authorization, etc.)
 * - allowCredentials: Whether cookies/credentials are allowed in CORS requests
 * - maxAge: Preflight cache duration in seconds (browser caches this time)
 * - isActive: Toggle policy on/off without deletion
 * 
 * Indexes:
 * - (organization, name) unique: Prevent duplicate policy names per organization
 * - isActive: Fast lookup of all active policies for a given organization
 * 
 * CORS Flow:
 * 1. API receives request from browser with Origin header
 * 2. Check if origin in blacklistedOrigins → DENY
 * 3. Check if origin in allowedOrigins → CHECK methods & headers
 * 4. Check if request method in allowedMethods → CHECK headers
 * 5. Check if headers in allowedHeaders → ALLOW with CORS headers
 * 6. Browser caches preflight for maxAge seconds
 * 
 * @type {mongoose.Schema}
 */
const corsPolicySchema = new mongoose.Schema({
    /** Reference to parent Organization for multi-tenant isolation */
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    /** Optional reference to specific API (null = organization-wide policy) */
    apiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Api', required: false }, // Link to specific API
    /** Human-readable policy name (e.g., "Partner Access", "Public API") */
    name: { type: String, required: true }, // e.g., "Partner Access"
    /** Allowed origins array (e.g., ["https://partner.com", "*.google.com", "http://localhost:3000"]) */
    allowedOrigins: [{ type: String, required: true }], // e.g., ["https://partner.com", "*.google.com"]
    /** Blacklisted/blocked origins - takes precedence over allowedOrigins */
    blacklistedOrigins: [{ type: String }], // Explicitly blocked origins
    /** Allowed HTTP methods for CORS requests */
    allowedMethods: [{ type: String, default: ['GET', 'POST'] }], // GET, POST, PUT, DELETE, OPTIONS
    /** Allowed request headers for CORS requests */
    allowedHeaders: [{ type: String, default: ['Content-Type', 'Authorization'] }],
    /** Allow credentials (cookies, authorization headers) in cross-origin requests */
    allowCredentials: { type: Boolean, default: false },
    /** Preflight cache time in seconds (how long browser caches preflight response) */
    maxAge: { type: Number, default: 86400 }, // Preflight cache time in seconds (24 hours default)
    /** Toggle policy on/off without deletion (important for audit trail) */
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

/**
 * Index: Ensure unique policy name per organization
 * 
 * Purpose: Prevent accidental duplicate policy names
 * - Users cannot create two policies with same name in same organization
 * - Supports clear policy identification and management
 */
// Ensure unique policy name per organization
corsPolicySchema.index({ organization: 1, name: 1 }, { unique: true });

/**
 * Index: Fast lookup for active policies
 * 
 * Purpose: Optimize retrieval of active policies
 * - When an API comes online, must quickly load all active policies
 * - Supports filtering: activeOnly = true queries
 * - Critical for real-time policy synchronization
 */
// Fast lookup for active policies
corsPolicySchema.index({ isActive: 1 });

module.exports = mongoose.model('CorsPolicy', corsPolicySchema);
