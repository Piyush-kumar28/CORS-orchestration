/**
 * Organization Model - Manages organization/team data for multi-tenant support
 * 
 * This model handles:
 * - Organization/tenant management in multi-tenant architecture
 * - Plan/subscription level tracking (Free, Pro, Enterprise)
 * - URL-safe slug generation for organization identification
 * 
 * @module models/Organization
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * Organization Schema Definition
 * 
 * Fields:
 * - name: Organization/company name (required, unique)
 * - slug: URL-friendly identifier (auto-generated from name, lowercase, unique)
 * - plan: Subscription tier (Free, Pro, Enterprise)
 * - createdAt: Timestamp when organization was created
 * 
 * Multi-Tenant Strategy:
 * - Each organization has its own users, APIs, policies, and logs
 * - All other collections reference organization via ObjectId
 * - Provides complete data isolation between organizations
 * 
 * @type {mongoose.Schema}
 */
const organizationSchema = new mongoose.Schema({
    /** Organization/company name (unique) */
    name: { type: String, required: true },
    /** URL-safe slug identifier (auto-generated from name, lowercase, unique) */
    slug: { type: String, lowercase: true, unique: true }, // generated from name
    /** Subscription/plan level (Free: limited features, Pro: extended, Enterprise: full access) */
    plan: { type: String, enum: ['Free', 'Pro', 'Enterprise'], default: 'Free' },
    /** Timestamp when organization was created */
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', organizationSchema);
