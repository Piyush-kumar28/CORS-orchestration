/**
 * Audit Log Model - Comprehensive audit trail for compliance and security
 * 
 * This model handles:
 * - Complete audit trail of all administrative actions (CREATE, UPDATE, DELETE)
 * - Security tracking with IP address and user agent information
 * - Compliance documentation for regulatory requirements
 * - Before/after change tracking for policy modifications
 * 
 * Audit Requirements:
 * - Non-repudiation: Every action is logged with actor information
 * - Immutability: Audit logs cannot be modified (only read)
 * - Retention: Logs are retained per compliance requirements
 * - Traceability: Can reconstruct state at any point in time
 * 
 * @module models/AuditLog
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * Audit Log Schema Definition
 * 
 * Fields:
 * - organization: Organization to which this audit entry belongs
 * - actor: User who performed the action (non-repudiation)
 * - action: Type of action (CREATE, UPDATE, DELETE)
 * - resourceType: Type of resource affected (CorsPolicy, Api, User, etc.)
 * - resourceId: ID of the specific resource that was modified
 * - changes: Object containing before/after state or detailed diff
 * - ipAddress: Source IP address for security analysis
 * - userAgent: Browser/client information for device tracking
 * - createdAt: Timestamp of when action occurred
 * 
 * Use Cases:
 * - Compliance audits: "Who modified policy X on date Y?"
 * - Security investigation: "What changes were made by user Z?"
 * - Data recovery: "What was the state of policy at time T?"
 * - Accountability: Prove which user made specific changes
 * 
 * @type {mongoose.Schema}
 */
const auditLogSchema = new mongoose.Schema({
    /** Organization to which this audit entry belongs */
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    /** User who performed the action (provides non-repudiation) */
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who performed the action
    /** Type of action performed (CREATE, UPDATE, DELETE) */
    action: { type: String, required: true }, // CREATE, UPDATE, DELETE
    /** Type of resource affected (CorsPolicy, Api, User, etc.) */
    resourceType: { type: String, required: true }, // CorsPolicy, Api, User
    /** ID of the specific resource that was modified */
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    /** Before/after snapshot or detailed diff of changes made */
    changes: { type: Object }, // Before/After snapshot or diff
    /** Source IP address for security analysis and device tracking */
    ipAddress: { type: String },
    /** Client user agent string for browser/device identification */
    userAgent: { type: String }
}, { timestamps: true });

/**
 * Index: Quick history lookup by organization
 * 
 * Purpose: Enable efficient audit history queries
 * - List all actions in an organization in reverse chronological order
 * - Common query: "Show me all changes in the last 30 days"
 * - Supports compliance report generation
 */
// Index for quick history lookup
auditLogSchema.index({ organization: 1, createdAt: -1 });

/**
 * Index: Lookup by resource ID
 * 
 * Purpose: Trace all changes to a specific resource
 * - Query: "Show me all changes to this particular CORS policy"
 * - Supports resource-specific audit trails
 */
auditLogSchema.index({ resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
