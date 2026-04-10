/**
 * API Model - Manages API/service registration and metadata
 * 
 * This model handles:
 * - Registration of APIs/microservices that require CORS policy management
 * - Unique API key generation for authentication
 * - API status tracking (Active/Inactive) for policy management
 * - API metadata storage (name, URL, description, owner)
 * 
 * @module models/Api
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * API Schema Definition
 * 
 * Fields:
 * - organization: Reference to parent Organization for multi-tenant isolation
 * - name: Human-readable API name
 * - url: Base URL of the API endpoint
 * - key: Unique API key for authentication and policy retrieval
 * - status: Current operational status (Active/Inactive)
 * - description: Purpose and details of the API
 * - owner: Reference to User who owns/manages this API
 * 
 * Indexes:
 * - key (unique): Fast lookup during policy authentication - CRITICAL for performance
 * - organization: Efficient filtering of APIs per organization
 * 
 * @type {mongoose.Schema}
 */
const apiSchema = new mongoose.Schema({
    /** Reference to parent Organization for multi-tenant isolation */
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    /** Human-readable API name */
    name: { type: String, required: true },
    /** Base URL of the API endpoint where CORS policies will be applied */
    url: { type: String, required: true },
    /** Unique API key for authenticating with the CORS platform */
    key: { type: String, required: true },
    /** Current operational status of the API in the CORS system */
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    /** Description of the API's purpose and functionality */
    description: { type: String },
    /** Reference to User who owns/manages this API */
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

/**
 * Index: Fast lookup by API Key
 * 
 * Purpose: Critical for real-time policy authentication
 * - When APIs request policies, lookup by key must be ultra-fast
 * - Ensures O(1) performance for policy retrieval
 * - Unique constraint prevents duplicate keys
 */
// Fast lookup by API Key (Critical for auth)
apiSchema.index({ key: 1 }, { unique: true });

/**
 * Index: Group APIs by Organization
 * 
 * Purpose: Enable efficient filtering of APIs per organization
 * - Supports listing all APIs for a specific organization
 * - Required for multi-tenant isolation queries
 */
// Group APIs by Organization
apiSchema.index({ organization: 1 });

module.exports = mongoose.model('Api', apiSchema);
