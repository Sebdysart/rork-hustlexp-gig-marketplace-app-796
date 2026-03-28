# Badge & Trophy System Rules

## 🎯 Core Principles

1. **Fairness**: All badges must be achievable through legitimate effort
2. **Transparency**: Unlock conditions must be clear and visible
3. **Progression**: Badges should encourage continued engagement
4. **Anti-Fraud**: High-value badges require verification
5. **Accessibility**: All users can earn badges regardless of skill level

## 📋 Badge Unlock Rules

### General Rules

1. **Idempotency**: Badge unlocks are idempotent - duplicate triggers are ignored
2. **Atomicity**: Badge unlocks are atomic - either fully awarded or not at all
3. **Irreversibility**: Once unlocked, badges cannot be removed (except for fraud)
4. **Visibility**: Locked badges show progress hints to guide users
5. **Rewards**: XP and GritCoins are awarded immediately upon unlock

### Verification Requirements

#### Automatic Verification (No Manual Review)
- Common tier badges
- Uncommon tier badges (most)
- Badges with <$1000 earnings requirement
- Badges with <100 task requirement

#### Manual Verification Required
- Epic tier badges
- Legendary tier badges
- Mythic tier badges
- Earnings badges >$1000
- Trade certification badges
- Safety/compliance badges
- Any badge flagged by anti-fraud system

### Verification Process

1. **Document Upload**
   - User uploads required documents
   - System validates document format
   - Documents stored securely
   - Verification team reviews within 24-48 hours

2. **Background Checks**
   - Third-party verification (Checkr, Onfido)
   - Results processed automatically
   - Badge awarded upon successful check
   - Failed checks trigger support ticket

3. **License Verification**
   - License number validated against state databases
   - Expiration date checked
   - License status verified (active, not suspended)
   - Re-verification required on expiration

## 🚫 Anti-Fraud Rules

### Rate Limiting

1. **Badge Unlock Limits**
   - Maximum 20 badges per 24 hours
   - Maximum 5 Epic+ badges per week
   - Maximum 2 Legendary+ badges per month

2. **Progress Update Limits**
   - Maximum 100 progress updates per hour
   - Maximum 1000 progress updates per day

3. **Verification Attempts**
   - Maximum 3 verification attempts per badge
   - 24-hour cooldown after failed attempt
   - Permanent block after 3 failed attempts

### Activity Spike Detection

**Triggers Manual Review:**
- 10+ tasks completed in 1 hour
- 50+ tasks completed in 1 day
- 100+ tasks completed in 1 week (for new accounts)
- Earnings spike >$1000 in 24 hours (for new accounts)

**Automatic Flags:**
- Same-day account creation + Epic badge unlock
- Multiple high-value badges in short timeframe
- Unusual task completion patterns
- Suspicious geographic activity

### Account Age Requirements

- **Common/Uncommon**: No age requirement
- **Rare**: 3+ days old
- **Epic**: 7+ days old
- **Legendary**: 30+ days old
- **Mythic**: 90+ days old

### Previous Flags

- **1 flag**: Warning issued
- **2 flags**: Manual review for all Epic+ badges
- **3+ flags**: Automatic review for all badge unlocks
- **5+ flags**: Badge system temporarily disabled

## 🔄 Badge Re-evaluation

### Periodic Re-checks

1. **License Expiration**
   - Checked monthly
   - Badge disabled if license expired
   - Re-enabled upon renewal

2. **Background Check Refresh**
   - Re-run annually
   - Badge revoked if check fails
   - User notified and given appeal option

3. **Activity Verification**
   - Random spot checks on high-value badges
   - Task completion verification
   - Earnings verification

### Badge Revocation

**Grounds for Revocation:**
- Fraud detected
- Verification failure
- License expiration
- Terms of service violation
- Suspicious activity confirmed

**Revocation Process:**
1. User notified via email + in-app
2. 7-day appeal window
3. XP/GritCoins not clawed back
4. Badge removed from profile
5. Progress reset to 0

## 📞 Appeals Process

### User Can Appeal:
- Badge revocation
- Verification failure
- Fraud flag
- Rate limit block

### Appeal Process:
1. User submits appeal via support
2. Support team reviews within 3 business days
3. Additional documentation may be requested
4. Decision is final (no second appeal)

### Appeal Outcomes:
- **Approved**: Badge restored, flag removed
- **Denied**: Badge remains revoked, flag stands
- **Partial**: Badge restored with conditions

## 🎁 Special Badge Rules

### Event Badges

1. **Time-Limited**
   - Available only during event period
   - Cannot be unlocked after event ends
   - Clearly marked as "Limited Edition"

2. **Participation Requirements**
   - Must complete task during event window
   - Event-specific criteria must be met
   - No retroactive awards

### Founder Badges

1. **One-Time Award**
   - Awarded to first 100 users
   - Cannot be earned after cohort full
   - Permanent and non-transferable

### Beta Tester Badges

1. **Cohort-Based**
   - Awarded to users who joined during beta
   - Metadata includes join date
   - Special leaderboard for beta testers

## 🏆 Trophy Rules

### Trophy Unlock

1. **Automatic Award**
   - Trophies awarded automatically when conditions met
   - No manual verification required
   - Instant visibility boost applied

2. **Visibility Boost**
   - Boost applies immediately
   - Cumulative across multiple trophies
   - Maximum boost cap: 200%

3. **Trophy Display**
   - Displayed on profile
   - Shown in search results
   - Highlighted in task applications

## 🔒 Security & Privacy

### Data Protection

1. **Verification Documents**
   - Encrypted at rest
   - Encrypted in transit
   - Deleted after 90 days (if not needed)
   - Access logged and audited

2. **Badge Data**
   - Public: Badge title, tier, unlock date
   - Private: Unlock conditions, progress details
   - User controls visibility settings

3. **Analytics**
   - Anonymized for aggregate reporting
   - No PII in analytics events
   - User can opt out of analytics

## 📊 Badge System Maintenance

### Regular Audits

1. **Monthly**
   - Review fraud flags
   - Check verification queue
   - Analyze badge unlock rates

2. **Quarterly**
   - Review badge balance
   - Adjust unlock conditions if needed
   - Add new badges

3. **Annually**
   - Comprehensive system review
   - User satisfaction survey
   - Badge system roadmap update

### Badge Adjustments

**Can Be Adjusted:**
- XP rewards (up or down 20%)
- GritCoin rewards (up or down 20%)
- Unlock condition thresholds (up or down 10%)
- Verification requirements

**Cannot Be Adjusted:**
- Badge tier (Common → Rare, etc.)
- Badge category
- Already-unlocked badges

**Adjustment Process:**
1. Proposal with rationale
2. User feedback period (7 days)
3. Implementation with notice
4. Grandfathering for in-progress badges

## 🌍 Localization Rules

### Translation Requirements

1. **Must Translate**
   - Badge titles
   - Badge descriptions
   - Unlock messages
   - Progress hints

2. **Do Not Translate**
   - Badge IDs
   - Category names (internal)
   - Visual asset names

3. **Translation Quality**
   - Professional translation required
   - Cultural sensitivity review
   - Native speaker approval

## ♿ Accessibility Rules

### Visual Requirements

1. **Color Contrast**
   - All tier colors meet WCAG AA
   - Alternative indicators (borders, patterns)
   - High contrast mode available

2. **Text Alternatives**
   - Alt text for all badge icons
   - Screen reader friendly descriptions
   - Keyboard navigation support

3. **Motion**
   - Reduced motion option
   - No essential information in animations only
   - Static fallbacks for all animations

## 📝 Badge Naming Conventions

### Internal IDs
Format: `badge_{category}_{name}_{tier}`
Example: `badge_skill_cleaning_novice`

### Visual Assets
Format: `{category}_{name}_{tier}.svg`
Example: `cleaning_novice.svg`

### Display Names
- Clear and concise
- No jargon or abbreviations
- Culturally appropriate
- Maximum 30 characters

## 🔄 Version Control

### Badge Manifest Versioning

- **Major version**: Breaking changes to badge structure
- **Minor version**: New badges added
- **Patch version**: Bug fixes, text updates

### Changelog

All changes to badge system must be documented:
- Date of change
- Type of change
- Affected badges
- Rationale
- Migration notes (if applicable)

---

**Last Updated**: 2025-10-15
**Version**: 1.0
**Approved By**: Product Team
**Next Review**: 2026-01-15
