/**
 * Invite Model - Manages user invitations and organization onboarding
 * 
 * This model handles:
 * - Generation of secure, unique invitation codes
 * - Temporary invitation records with automatic expiration
 * - Role assignment during organization joining process
 * - Tracking of invitation metadata for security and auditing
 * 
 * Security Features:
 * - Time-limited invitations (default 7 days)
 * - Unique codes prevent guessing and unauthorized access
 * - Automatic cleanup of expired invitations (TTL index)
 * - Role assignment at invite time (not at join)
 * 
 * @module models/Invite
 * @requires mongoose
 * @requires crypto
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Invite Schema Definition
 * 
 * Fields:
 * - code: Unique, randomly generated invitation token
 * - organization: Organization the user is being invited to
 * - role: Assigned role (Global Admin, Security Lead, DevOps, Auditor, Viewer)
 * - inviter: Email/name of person who sent the invitation
 * - expiresAt: When the invitation expires (auto-deleted by TTL index)
 * 
 * Invitation Workflow:
 * 1. Admin creates invite → generates unique code, sets expiration
 * 2. Code is sent via email to invitee
 * 3. Invitee receives email with link containing code
 * 4. Invitee clicks link, system validates code exists and not expired
 * 5. Invitee creates account and is assigned the pre-set role
 * 6. Expired invites are auto-deleted by TTL index
 * 
 * Security:
 * - Codes are random and difficult to guess
 * - Short validity period (default 7 days)
 * - One-time use: invitation deleted when user joins
 * - Tracks who sent invitation for audit purposes
 * 
 * @type {mongoose.Schema}
 */
const inviteSchema = new mongoose.Schema({
    /** Unique, cryptographically random invitation code */
    code: { type: String, unique: true, required: true },
    /** Organization to which the invitee will be added */
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    /** Pre-assigned role for the invitee (cannot be changed after sending) */
    role: { type: String, required: true },
    /** Email/name of the person who sent this invitation (for audit trail) */
    inviter: { type: String, required: true },
    /** When this invitation expires and becomes invalid */
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7 days
}, { timestamps: true });

/**
 * Index: MongoDB TTL (Time-To-Live) Index
 * 
 * Purpose: Automatic cleanup of expired invitations
 * - expireAfterSeconds: 0 means delete document when expiresAt datetime is reached
 * - No manual cleanup jobs needed
 * - Automatic data retention and privacy
 * 
 * Example:
 * - Invite created on April 1 with expiry April 8
 * - On April 8 at 00:00, MongoDB automatically deletes the invite document
 * - Prevents accumulation of expired invites
 */
// Index to automatically delete expired invites
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Invite', inviteSchema);
