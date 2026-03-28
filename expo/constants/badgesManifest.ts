export type BadgeTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type BadgeCategory = 
  | 'Skill:Cleaning'
  | 'Skill:Moving'
  | 'Skill:Handyman'
  | 'Skill:Plumbing'
  | 'Skill:Electrical'
  | 'Skill:Childcare'
  | 'Skill:Nursing'
  | 'Skill:Tutoring'
  | 'Skill:Digital'
  | 'Skill:SocialMedia'
  | 'Skill:Delivery'
  | 'Skill:Landscaping'
  | 'Reputation'
  | 'Economy'
  | 'Speed'
  | 'Community'
  | 'AI'
  | 'Event'
  | 'Safety'
  | 'Creator'
  | 'Misc';

export type UnlockConditionType = 
  | 'count_tasks'
  | 'total_earnings'
  | 'verified_documents'
  | 'streak_days'
  | 'rating_average'
  | 'response_time'
  | 'referrals'
  | 'ai_interactions'
  | 'special_event'
  | 'manual_award';

export interface UnlockCondition {
  type: UnlockConditionType;
  category?: string;
  count?: number;
  amount?: number;
  days?: number;
  rating?: number;
  time_minutes?: number;
  event_id?: string;
  metadata?: Record<string, any>;
}

export interface Badge {
  id: string;
  title: string;
  category: BadgeCategory;
  tier: BadgeTier;
  description: string;
  unlock_condition: UnlockCondition;
  xp_reward: number;
  gritcoin_reward: number;
  visual_asset: string;
  is_verification_required: boolean;
  next_tier_badge_id?: string;
  unlock_message?: string;
  progress_hint?: string;
}

const SKILL_FAMILIES = [
  { key: 'Cleaning', name: 'Cleaning', icon: 'sparkles' },
  { key: 'Moving', name: 'Moving', icon: 'truck' },
  { key: 'Handyman', name: 'Handyman', icon: 'wrench' },
  { key: 'Plumbing', name: 'Plumbing', icon: 'droplet' },
  { key: 'Electrical', name: 'Electrical', icon: 'zap' },
  { key: 'Childcare', name: 'Childcare', icon: 'baby' },
  { key: 'Nursing', name: 'Nursing', icon: 'heart-pulse' },
  { key: 'Tutoring', name: 'Tutoring', icon: 'graduation-cap' },
  { key: 'Digital', name: 'Digital', icon: 'code' },
  { key: 'SocialMedia', name: 'Social Media', icon: 'share-2' },
  { key: 'Delivery', name: 'Delivery', icon: 'package' },
  { key: 'Landscaping', name: 'Landscaping', icon: 'tree-deciduous' },
];

const SKILL_PROGRESSION = [
  { level: 'Novice', tier: 'Common' as BadgeTier, count: 5, xp: 50, grit: 5 },
  { level: 'Skilled', tier: 'Uncommon' as BadgeTier, count: 15, xp: 150, grit: 15 },
  { level: 'Pro', tier: 'Rare' as BadgeTier, count: 50, xp: 500, grit: 50 },
  { level: 'Master', tier: 'Epic' as BadgeTier, count: 150, xp: 1500, grit: 150 },
  { level: 'Legend', tier: 'Legendary' as BadgeTier, count: 500, xp: 5000, grit: 500 },
];

function generateSkillBadges(): Badge[] {
  const badges: Badge[] = [];
  
  SKILL_FAMILIES.forEach(family => {
    SKILL_PROGRESSION.forEach((prog, index) => {
      const badgeId = `badge_skill_${family.key.toLowerCase()}_${prog.level.toLowerCase()}`;
      const nextProg = SKILL_PROGRESSION[index + 1];
      
      badges.push({
        id: badgeId,
        title: `${family.name} ${prog.level}`,
        category: `Skill:${family.key}` as BadgeCategory,
        tier: prog.tier,
        description: `Complete ${prog.count} ${family.name.toLowerCase()} tasks.`,
        unlock_condition: {
          type: 'count_tasks',
          category: family.key,
          count: prog.count,
        },
        xp_reward: prog.xp,
        gritcoin_reward: prog.grit,
        visual_asset: `${family.key.toLowerCase()}_${prog.level.toLowerCase()}.svg`,
        is_verification_required: prog.tier === 'Epic' || prog.tier === 'Legendary',
        next_tier_badge_id: nextProg ? `badge_skill_${family.key.toLowerCase()}_${nextProg.level.toLowerCase()}` : undefined,
        unlock_message: `You've mastered ${prog.level.toLowerCase()}-level ${family.name.toLowerCase()} work!`,
        progress_hint: nextProg ? `Complete ${nextProg.count - prog.count} more ${family.name.toLowerCase()} tasks to reach ${nextProg.level}` : 'Maximum level achieved!',
      });
    });
  });
  
  return badges;
}

const REPUTATION_BADGES: Badge[] = [
  {
    id: 'badge_rep_reliable_bronze',
    title: 'Reliable Bronze',
    category: 'Reputation',
    tier: 'Common',
    description: 'Complete 10 tasks without cancellation.',
    unlock_condition: { type: 'count_tasks', count: 10, metadata: { no_cancellations: true } },
    xp_reward: 100,
    gritcoin_reward: 10,
    visual_asset: 'reliable_bronze.svg',
    is_verification_required: false,
    next_tier_badge_id: 'badge_rep_reliable_silver',
    unlock_message: 'Your reliability is building trust!',
  },
  {
    id: 'badge_rep_reliable_silver',
    title: 'Reliable Silver',
    category: 'Reputation',
    tier: 'Uncommon',
    description: 'Complete 50 tasks without cancellation.',
    unlock_condition: { type: 'count_tasks', count: 50, metadata: { no_cancellations: true } },
    xp_reward: 500,
    gritcoin_reward: 50,
    visual_asset: 'reliable_silver.svg',
    is_verification_required: false,
    next_tier_badge_id: 'badge_rep_reliable_gold',
    unlock_message: 'Clients know they can count on you!',
  },
  {
    id: 'badge_rep_reliable_gold',
    title: 'Reliable Gold',
    category: 'Reputation',
    tier: 'Rare',
    description: 'Complete 200 tasks without cancellation.',
    unlock_condition: { type: 'count_tasks', count: 200, metadata: { no_cancellations: true } },
    xp_reward: 2000,
    gritcoin_reward: 200,
    visual_asset: 'reliable_gold.svg',
    is_verification_required: true,
    next_tier_badge_id: 'badge_rep_reliable_platinum',
    unlock_message: 'You are a pillar of reliability!',
  },
  {
    id: 'badge_rep_reliable_platinum',
    title: 'Reliable Platinum',
    category: 'Reputation',
    tier: 'Epic',
    description: 'Complete 500 tasks without cancellation.',
    unlock_condition: { type: 'count_tasks', count: 500, metadata: { no_cancellations: true } },
    xp_reward: 5000,
    gritcoin_reward: 500,
    visual_asset: 'reliable_platinum.svg',
    is_verification_required: true,
    unlock_message: 'Legendary reliability achieved!',
  },
  {
    id: 'badge_rep_five_star_streak_10',
    title: '5-Star Streak',
    category: 'Reputation',
    tier: 'Uncommon',
    description: 'Receive 10 consecutive 5-star ratings.',
    unlock_condition: { type: 'streak_days', days: 10, metadata: { rating: 5 } },
    xp_reward: 300,
    gritcoin_reward: 30,
    visual_asset: 'five_star_streak_10.svg',
    is_verification_required: false,
    next_tier_badge_id: 'badge_rep_five_star_streak_25',
    unlock_message: 'Excellence is your standard!',
  },
  {
    id: 'badge_rep_five_star_streak_25',
    title: '5-Star Master',
    category: 'Reputation',
    tier: 'Rare',
    description: 'Receive 25 consecutive 5-star ratings.',
    unlock_condition: { type: 'streak_days', days: 25, metadata: { rating: 5 } },
    xp_reward: 1000,
    gritcoin_reward: 100,
    visual_asset: 'five_star_streak_25.svg',
    is_verification_required: false,
    next_tier_badge_id: 'badge_rep_five_star_streak_50',
    unlock_message: 'Perfection is your signature!',
  },
  {
    id: 'badge_rep_five_star_streak_50',
    title: '5-Star Legend',
    category: 'Reputation',
    tier: 'Epic',
    description: 'Receive 50 consecutive 5-star ratings.',
    unlock_condition: { type: 'streak_days', days: 50, metadata: { rating: 5 } },
    xp_reward: 3000,
    gritcoin_reward: 300,
    visual_asset: 'five_star_streak_50.svg',
    is_verification_required: true,
    unlock_message: 'You are a living legend of quality!',
  },
  {
    id: 'badge_rep_quick_responder',
    title: 'Quick Responder',
    category: 'Reputation',
    tier: 'Common',
    description: 'Respond to 20 tasks within 5 minutes.',
    unlock_condition: { type: 'response_time', count: 20, time_minutes: 5 },
    xp_reward: 150,
    gritcoin_reward: 15,
    visual_asset: 'quick_responder.svg',
    is_verification_required: false,
    next_tier_badge_id: 'badge_rep_lightning_responder',
    unlock_message: 'Speed is your superpower!',
  },
  {
    id: 'badge_rep_lightning_responder',
    title: 'Lightning Responder',
    category: 'Reputation',
    tier: 'Uncommon',
    description: 'Respond to 50 tasks within 2 minutes.',
    unlock_condition: { type: 'response_time', count: 50, time_minutes: 2 },
    xp_reward: 400,
    gritcoin_reward: 40,
    visual_asset: 'lightning_responder.svg',
    is_verification_required: false,
    unlock_message: 'You are faster than lightning!',
  },
  {
    id: 'badge_rep_dispute_free_bronze',
    title: 'Dispute-Free Bronze',
    category: 'Reputation',
    tier: 'Common',
    description: 'Complete 25 tasks with zero disputes.',
    unlock_condition: { type: 'count_tasks', count: 25, metadata: { no_disputes: true } },
    xp_reward: 200,
    gritcoin_reward: 20,
    visual_asset: 'dispute_free_bronze.svg',
    is_verification_required: false,
    next_tier_badge_id: 'badge_rep_dispute_free_silver',
    unlock_message: 'Smooth sailing all the way!',
  },
  {
    id: 'badge_rep_dispute_free_silver',
    title: 'Dispute-Free Silver',
    category: 'Reputation',
    tier: 'Uncommon',
    description: 'Complete 100 tasks with zero disputes.',
    unlock_condition: { type: 'count_tasks', count: 100, metadata: { no_disputes: true } },
    xp_reward: 800,
    gritcoin_reward: 80,
    visual_asset: 'dispute_free_silver.svg',
    is_verification_required: false,
    next_tier_badge_id: 'badge_rep_dispute_free_gold',
    unlock_message: 'Conflict resolution master!',
  },
  {
    id: 'badge_rep_dispute_free_gold',
    title: 'Dispute-Free Gold',
    category: 'Reputation',
    tier: 'Rare',
    description: 'Complete 300 tasks with zero disputes.',
    unlock_condition: { type: 'count_tasks', count: 300, metadata: { no_disputes: true } },
    xp_reward: 3000,
    gritcoin_reward: 300,
    visual_asset: 'dispute_free_gold.svg',
    is_verification_required: true,
    unlock_message: 'Perfect harmony in every job!',
  },
];

const ECONOMY_BADGES: Badge[] = [
  { id: 'badge_econ_first_100', title: 'First $100', category: 'Economy', tier: 'Common', description: 'Earn your first $100.', unlock_condition: { type: 'total_earnings', amount: 100 }, xp_reward: 50, gritcoin_reward: 10, visual_asset: 'first_100.svg', is_verification_required: false, next_tier_badge_id: 'badge_econ_first_500', unlock_message: 'Your hustle is paying off!' },
  { id: 'badge_econ_first_500', title: 'First $500', category: 'Economy', tier: 'Uncommon', description: 'Earn your first $500.', unlock_condition: { type: 'total_earnings', amount: 500 }, xp_reward: 200, gritcoin_reward: 25, visual_asset: 'first_500.svg', is_verification_required: false, next_tier_badge_id: 'badge_econ_first_1k', unlock_message: 'Momentum is building!' },
  { id: 'badge_econ_first_1k', title: 'First $1,000', category: 'Economy', tier: 'Rare', description: 'Earn your first $1,000.', unlock_condition: { type: 'total_earnings', amount: 1000 }, xp_reward: 500, gritcoin_reward: 50, visual_asset: 'first_1k.svg', is_verification_required: true, next_tier_badge_id: 'badge_econ_first_5k', unlock_message: 'Four figures - you are serious!' },
  { id: 'badge_econ_first_5k', title: 'First $5,000', category: 'Economy', tier: 'Epic', description: 'Earn your first $5,000.', unlock_condition: { type: 'total_earnings', amount: 5000 }, xp_reward: 2000, gritcoin_reward: 200, visual_asset: 'first_5k.svg', is_verification_required: true, next_tier_badge_id: 'badge_econ_first_10k', unlock_message: 'This is real income now!' },
  { id: 'badge_econ_first_10k', title: 'First $10,000', category: 'Economy', tier: 'Legendary', description: 'Earn your first $10,000.', unlock_condition: { type: 'total_earnings', amount: 10000 }, xp_reward: 5000, gritcoin_reward: 500, visual_asset: 'first_10k.svg', is_verification_required: true, next_tier_badge_id: 'badge_econ_first_25k', unlock_message: 'Five figures - you are a pro!' },
  { id: 'badge_econ_first_25k', title: 'First $25,000', category: 'Economy', tier: 'Legendary', description: 'Earn your first $25,000.', unlock_condition: { type: 'total_earnings', amount: 25000 }, xp_reward: 10000, gritcoin_reward: 1000, visual_asset: 'first_25k.svg', is_verification_required: true, next_tier_badge_id: 'badge_econ_first_50k', unlock_message: 'Elite earner status!' },
  { id: 'badge_econ_first_50k', title: 'First $50,000', category: 'Economy', tier: 'Mythic', description: 'Earn your first $50,000.', unlock_condition: { type: 'total_earnings', amount: 50000 }, xp_reward: 20000, gritcoin_reward: 2000, visual_asset: 'first_50k.svg', is_verification_required: true, unlock_message: 'You are in the top 1 percent!' },
  { id: 'badge_econ_high_value_job', title: 'High Roller', category: 'Economy', tier: 'Rare', description: 'Complete a single task worth $500+.', unlock_condition: { type: 'count_tasks', count: 1, metadata: { min_value: 500 } }, xp_reward: 300, gritcoin_reward: 50, visual_asset: 'high_roller.svg', is_verification_required: false, unlock_message: 'Big jobs, big rewards!' },
  { id: 'badge_econ_weekend_warrior', title: 'Weekend Warrior', category: 'Economy', tier: 'Uncommon', description: 'Complete 20 weekend tasks.', unlock_condition: { type: 'count_tasks', count: 20, metadata: { weekend_only: true } }, xp_reward: 250, gritcoin_reward: 25, visual_asset: 'weekend_warrior.svg', is_verification_required: false, unlock_message: 'Weekends are your playground!' },
];

const SPEED_BADGES: Badge[] = [
  { id: 'badge_speed_same_day_10', title: 'Same-Day Specialist', category: 'Speed', tier: 'Common', description: 'Complete 10 same-day tasks.', unlock_condition: { type: 'count_tasks', count: 10, metadata: { same_day: true } }, xp_reward: 150, gritcoin_reward: 15, visual_asset: 'same_day_specialist.svg', is_verification_required: false, next_tier_badge_id: 'badge_speed_same_day_50', unlock_message: 'Speed is your edge!' },
  { id: 'badge_speed_same_day_50', title: 'Same-Day Master', category: 'Speed', tier: 'Uncommon', description: 'Complete 50 same-day tasks.', unlock_condition: { type: 'count_tasks', count: 50, metadata: { same_day: true } }, xp_reward: 600, gritcoin_reward: 60, visual_asset: 'same_day_master.svg', is_verification_required: false, unlock_message: 'You deliver when it matters!' },
  { id: 'badge_speed_quick_accept_streak', title: 'Quick Accept Streak', category: 'Speed', tier: 'Uncommon', description: 'Accept 15 tasks within 1 minute of posting.', unlock_condition: { type: 'count_tasks', count: 15, metadata: { accept_within_seconds: 60 } }, xp_reward: 300, gritcoin_reward: 30, visual_asset: 'quick_accept_streak.svg', is_verification_required: false, unlock_message: 'First to the finish line!' },
  { id: 'badge_speed_efficiency_expert', title: 'Efficiency Expert', category: 'Speed', tier: 'Rare', description: 'Complete 25 tasks 20% faster than estimated.', unlock_condition: { type: 'count_tasks', count: 25, metadata: { faster_than_estimate: 0.8 } }, xp_reward: 800, gritcoin_reward: 80, visual_asset: 'efficiency_expert.svg', is_verification_required: false, unlock_message: 'Time is money, and you save both!' },
  { id: 'badge_speed_rapid_fire', title: 'Rapid Fire', category: 'Speed', tier: 'Rare', description: 'Complete 5 tasks in a single day.', unlock_condition: { type: 'count_tasks', count: 5, metadata: { single_day: true } }, xp_reward: 500, gritcoin_reward: 50, visual_asset: 'rapid_fire.svg', is_verification_required: false, unlock_message: 'Unstoppable energy!' },
  { id: 'badge_speed_marathon_hustler', title: 'Marathon Hustler', category: 'Speed', tier: 'Epic', description: 'Complete 10 tasks in a single day.', unlock_condition: { type: 'count_tasks', count: 10, metadata: { single_day: true } }, xp_reward: 2000, gritcoin_reward: 200, visual_asset: 'marathon_hustler.svg', is_verification_required: true, unlock_message: 'Superhuman stamina!' },
];

const COMMUNITY_BADGES: Badge[] = [
  { id: 'badge_comm_referral_bronze', title: 'Referral Bronze', category: 'Community', tier: 'Common', description: 'Refer 3 new users.', unlock_condition: { type: 'referrals', count: 3 }, xp_reward: 100, gritcoin_reward: 20, visual_asset: 'referral_bronze.svg', is_verification_required: false, next_tier_badge_id: 'badge_comm_referral_silver', unlock_message: 'Growing the community!' },
  { id: 'badge_comm_referral_silver', title: 'Referral Silver', category: 'Community', tier: 'Uncommon', description: 'Refer 10 new users.', unlock_condition: { type: 'referrals', count: 10 }, xp_reward: 400, gritcoin_reward: 80, visual_asset: 'referral_silver.svg', is_verification_required: false, next_tier_badge_id: 'badge_comm_referral_gold', unlock_message: 'Community builder!' },
  { id: 'badge_comm_referral_gold', title: 'Referral Gold', category: 'Community', tier: 'Rare', description: 'Refer 25 new users.', unlock_condition: { type: 'referrals', count: 25 }, xp_reward: 1200, gritcoin_reward: 250, visual_asset: 'referral_gold.svg', is_verification_required: false, next_tier_badge_id: 'badge_comm_referral_platinum', unlock_message: 'Ambassador status!' },
  { id: 'badge_comm_referral_platinum', title: 'Referral Platinum', category: 'Community', tier: 'Epic', description: 'Refer 100 new users.', unlock_condition: { type: 'referrals', count: 100 }, xp_reward: 5000, gritcoin_reward: 1000, visual_asset: 'referral_platinum.svg', is_verification_required: true, unlock_message: 'Legendary recruiter!' },
  { id: 'badge_comm_mentor', title: 'Mentor', category: 'Community', tier: 'Rare', description: 'Help 10 new hustlers complete their first task.', unlock_condition: { type: 'count_tasks', count: 10, metadata: { mentor_assist: true } }, xp_reward: 600, gritcoin_reward: 60, visual_asset: 'mentor.svg', is_verification_required: false, unlock_message: 'Paying it forward!' },
  { id: 'badge_comm_top_reviewer', title: 'Top Reviewer', category: 'Community', tier: 'Uncommon', description: 'Leave 50 helpful reviews.', unlock_condition: { type: 'count_tasks', count: 50, metadata: { helpful_reviews: true } }, xp_reward: 300, gritcoin_reward: 30, visual_asset: 'top_reviewer.svg', is_verification_required: false, unlock_message: 'Your feedback matters!' },
  { id: 'badge_comm_squad_leader', title: 'Squad Leader', category: 'Community', tier: 'Rare', description: 'Lead a squad to complete 20 collaborative tasks.', unlock_condition: { type: 'count_tasks', count: 20, metadata: { squad_leader: true } }, xp_reward: 1000, gritcoin_reward: 100, visual_asset: 'squad_leader.svg', is_verification_required: false, unlock_message: 'Leadership excellence!' },
  { id: 'badge_comm_helpful_neighbor', title: 'Helpful Neighbor', category: 'Community', tier: 'Common', description: 'Complete 10 tasks in your local neighborhood.', unlock_condition: { type: 'count_tasks', count: 10, metadata: { local_only: true } }, xp_reward: 150, gritcoin_reward: 15, visual_asset: 'helpful_neighbor.svg', is_verification_required: false, unlock_message: 'Making your community better!' },
  { id: 'badge_comm_global_hustler', title: 'Global Hustler', category: 'Community', tier: 'Epic', description: 'Complete tasks in 5 different cities.', unlock_condition: { type: 'count_tasks', count: 5, metadata: { different_cities: 5 } }, xp_reward: 2000, gritcoin_reward: 200, visual_asset: 'global_hustler.svg', is_verification_required: true, unlock_message: 'World traveler!' },
  { id: 'badge_comm_team_player', title: 'Team Player', category: 'Community', tier: 'Uncommon', description: 'Complete 15 collaborative squad tasks.', unlock_condition: { type: 'count_tasks', count: 15, metadata: { squad_task: true } }, xp_reward: 400, gritcoin_reward: 40, visual_asset: 'team_player.svg', is_verification_required: false, unlock_message: 'Teamwork makes the dream work!' },
];

const AI_BADGES: Badge[] = [
  { id: 'badge_ai_prompt_master', title: 'Prompt Master', category: 'AI', tier: 'Common', description: 'Use AI Task Creator 20 times.', unlock_condition: { type: 'ai_interactions', count: 20, metadata: { interaction_type: 'task_creator' } }, xp_reward: 100, gritcoin_reward: 10, visual_asset: 'prompt_master.svg', is_verification_required: false, next_tier_badge_id: 'badge_ai_prompt_legend', unlock_message: 'AI is your co-pilot!' },
  { id: 'badge_ai_prompt_legend', title: 'Prompt Legend', category: 'AI', tier: 'Uncommon', description: 'Use AI Task Creator 100 times.', unlock_condition: { type: 'ai_interactions', count: 100, metadata: { interaction_type: 'task_creator' } }, xp_reward: 500, gritcoin_reward: 50, visual_asset: 'prompt_legend.svg', is_verification_required: false, unlock_message: 'AI mastery achieved!' },
  { id: 'badge_ai_auto_hustler', title: 'Auto-Hustler', category: 'AI', tier: 'Uncommon', description: 'Complete 10 tasks via Auto-Hustle mode.', unlock_condition: { type: 'count_tasks', count: 10, metadata: { auto_hustle: true } }, xp_reward: 300, gritcoin_reward: 30, visual_asset: 'auto_hustler.svg', is_verification_required: false, next_tier_badge_id: 'badge_ai_auto_hustler_pro', unlock_message: 'Automation expert!' },
  { id: 'badge_ai_auto_hustler_pro', title: 'Auto-Hustler Pro', category: 'AI', tier: 'Rare', description: 'Complete 50 tasks via Auto-Hustle mode.', unlock_condition: { type: 'count_tasks', count: 50, metadata: { auto_hustle: true } }, xp_reward: 1000, gritcoin_reward: 100, visual_asset: 'auto_hustler_pro.svg', is_verification_required: false, unlock_message: 'AI-powered efficiency!' },
  { id: 'badge_ai_coach_student', title: 'AI Coach Student', category: 'AI', tier: 'Common', description: 'Complete 5 AI Coach recommendations.', unlock_condition: { type: 'ai_interactions', count: 5, metadata: { interaction_type: 'coach_recommendation' } }, xp_reward: 150, gritcoin_reward: 15, visual_asset: 'coach_student.svg', is_verification_required: false, unlock_message: 'Learning from the best!' },
  { id: 'badge_ai_foreman_apprentice', title: 'AI Foreman Apprentice', category: 'AI', tier: 'Common', description: 'Use AI Foreman 15 times.', unlock_condition: { type: 'ai_interactions', count: 15, metadata: { interaction_type: 'foreman' } }, xp_reward: 120, gritcoin_reward: 12, visual_asset: 'foreman_apprentice.svg', is_verification_required: false, unlock_message: 'AI is your assistant!' },
  { id: 'badge_ai_verification_trusted', title: 'AI Verification Trusted', category: 'AI', tier: 'Rare', description: 'Pass 25 AI verifications with 100% accuracy.', unlock_condition: { type: 'count_tasks', count: 25, metadata: { ai_verification_perfect: true } }, xp_reward: 800, gritcoin_reward: 80, visual_asset: 'verification_trusted.svg', is_verification_required: false, unlock_message: 'AI trusts your work!' },
  { id: 'badge_ai_smart_matcher', title: 'Smart Matcher', category: 'AI', tier: 'Uncommon', description: 'Accept 20 AI-matched tasks.', unlock_condition: { type: 'count_tasks', count: 20, metadata: { ai_matched: true } }, xp_reward: 350, gritcoin_reward: 35, visual_asset: 'smart_matcher.svg', is_verification_required: false, unlock_message: 'Perfect matches every time!' },
];

const EVENT_BADGES: Badge[] = [
  { id: 'badge_event_beta_tester', title: 'Beta Tester', category: 'Event', tier: 'Common', description: 'Joined HustleXP during beta phase.', unlock_condition: { type: 'special_event', event_id: 'beta_cohort' }, xp_reward: 500, gritcoin_reward: 100, visual_asset: 'beta_tester.svg', is_verification_required: false, unlock_message: 'You helped build HustleXP!' },
  { id: 'badge_event_founder', title: 'Founder', category: 'Event', tier: 'Mythic', description: 'One of the first 100 users.', unlock_condition: { type: 'special_event', event_id: 'founder_cohort' }, xp_reward: 5000, gritcoin_reward: 1000, visual_asset: 'founder.svg', is_verification_required: false, unlock_message: 'Legendary founder status!' },
  { id: 'badge_event_summer_hustle_2025', title: 'Summer Hustle 2025', category: 'Event', tier: 'Uncommon', description: 'Complete 5 outdoor tasks during Summer 2025 event.', unlock_condition: { type: 'special_event', event_id: 'summer_2025', metadata: { task_count: 5 } }, xp_reward: 300, gritcoin_reward: 30, visual_asset: 'summer_hustle_2025.svg', is_verification_required: false, unlock_message: 'Summer vibes!' },
  { id: 'badge_event_holiday_helper_2024', title: 'Holiday Helper 2024', category: 'Event', tier: 'Uncommon', description: 'Complete 10 tasks during Holiday 2024 event.', unlock_condition: { type: 'special_event', event_id: 'holiday_2024', metadata: { task_count: 10 } }, xp_reward: 400, gritcoin_reward: 40, visual_asset: 'holiday_helper_2024.svg', is_verification_required: false, unlock_message: 'Spreading holiday cheer!' },
  { id: 'badge_event_city_launch_nyc', title: 'NYC Launch Pioneer', category: 'Event', tier: 'Rare', description: 'Completed a task during NYC launch week.', unlock_condition: { type: 'special_event', event_id: 'launch_nyc' }, xp_reward: 600, gritcoin_reward: 60, visual_asset: 'city_launch_nyc.svg', is_verification_required: false, unlock_message: 'NYC hustle begins!' },
  { id: 'badge_event_city_launch_la', title: 'LA Launch Pioneer', category: 'Event', tier: 'Rare', description: 'Completed a task during LA launch week.', unlock_condition: { type: 'special_event', event_id: 'launch_la' }, xp_reward: 600, gritcoin_reward: 60, visual_asset: 'city_launch_la.svg', is_verification_required: false, unlock_message: 'LA hustle begins!' },
  { id: 'badge_event_city_launch_chicago', title: 'Chicago Launch Pioneer', category: 'Event', tier: 'Rare', description: 'Completed a task during Chicago launch week.', unlock_condition: { type: 'special_event', event_id: 'launch_chicago' }, xp_reward: 600, gritcoin_reward: 60, visual_asset: 'city_launch_chicago.svg', is_verification_required: false, unlock_message: 'Chicago hustle begins!' },
  { id: 'badge_event_million_tasks', title: 'Million Tasks Celebration', category: 'Event', tier: 'Epic', description: 'Active when HustleXP hit 1 million tasks.', unlock_condition: { type: 'special_event', event_id: 'million_tasks_milestone' }, xp_reward: 1000, gritcoin_reward: 100, visual_asset: 'million_tasks.svg', is_verification_required: false, unlock_message: 'Part of history!' },
  { id: 'badge_event_new_year_2025', title: 'New Year Hustler 2025', category: 'Event', tier: 'Common', description: 'Complete a task on New Year Day 2025.', unlock_condition: { type: 'special_event', event_id: 'new_year_2025' }, xp_reward: 200, gritcoin_reward: 20, visual_asset: 'new_year_2025.svg', is_verification_required: false, unlock_message: 'Starting the year strong!' },
  { id: 'badge_event_earth_day_2025', title: 'Earth Day Hero 2025', category: 'Event', tier: 'Uncommon', description: 'Complete 3 eco-friendly tasks on Earth Day 2025.', unlock_condition: { type: 'special_event', event_id: 'earth_day_2025', metadata: { task_count: 3 } }, xp_reward: 350, gritcoin_reward: 35, visual_asset: 'earth_day_2025.svg', is_verification_required: false, unlock_message: 'Saving the planet!' },
  { id: 'badge_event_black_friday_2024', title: 'Black Friday Hustler 2024', category: 'Event', tier: 'Uncommon', description: 'Complete 5 tasks on Black Friday 2024.', unlock_condition: { type: 'special_event', event_id: 'black_friday_2024', metadata: { task_count: 5 } }, xp_reward: 500, gritcoin_reward: 50, visual_asset: 'black_friday_2024.svg', is_verification_required: false, unlock_message: 'Shopping season hustle!' },
  { id: 'badge_event_anniversary_year_1', title: '1 Year Anniversary', category: 'Event', tier: 'Rare', description: 'Active user for 1 full year.', unlock_condition: { type: 'special_event', event_id: 'anniversary_year_1' }, xp_reward: 1000, gritcoin_reward: 100, visual_asset: 'anniversary_year_1.svg', is_verification_required: false, unlock_message: 'One year of hustle!' },
];

const SAFETY_BADGES: Badge[] = [
  { id: 'badge_safety_verified_id', title: 'Verified ID', category: 'Safety', tier: 'Common', description: 'Complete ID verification.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'id' } }, xp_reward: 100, gritcoin_reward: 10, visual_asset: 'verified_id.svg', is_verification_required: true, unlock_message: 'Trust verified!' },
  { id: 'badge_safety_background_checked', title: 'Background Checked', category: 'Safety', tier: 'Uncommon', description: 'Pass background check.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'background_check' } }, xp_reward: 300, gritcoin_reward: 30, visual_asset: 'background_checked.svg', is_verification_required: true, unlock_message: 'Safety first!' },
  { id: 'badge_safety_certified_electrician', title: 'Certified Electrician', category: 'Safety', tier: 'Rare', description: 'Upload and verify electrician license.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'license_electrician' } }, xp_reward: 800, gritcoin_reward: 80, visual_asset: 'certified_electrician.svg', is_verification_required: true, unlock_message: 'Licensed professional!' },
  { id: 'badge_safety_certified_plumber', title: 'Certified Plumber', category: 'Safety', tier: 'Rare', description: 'Upload and verify plumber license.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'license_plumber' } }, xp_reward: 800, gritcoin_reward: 80, visual_asset: 'certified_plumber.svg', is_verification_required: true, unlock_message: 'Licensed professional!' },
  { id: 'badge_safety_certified_hvac', title: 'Certified HVAC', category: 'Safety', tier: 'Rare', description: 'Upload and verify HVAC license.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'license_hvac' } }, xp_reward: 800, gritcoin_reward: 80, visual_asset: 'certified_hvac.svg', is_verification_required: true, unlock_message: 'Licensed professional!' },
  { id: 'badge_safety_insured', title: 'Insured Professional', category: 'Safety', tier: 'Epic', description: 'Upload and verify liability insurance.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'insurance' } }, xp_reward: 1500, gritcoin_reward: 150, visual_asset: 'insured.svg', is_verification_required: true, unlock_message: 'Fully protected!' },
  { id: 'badge_safety_first_aid_certified', title: 'First Aid Certified', category: 'Safety', tier: 'Uncommon', description: 'Upload and verify first aid certification.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'first_aid' } }, xp_reward: 250, gritcoin_reward: 25, visual_asset: 'first_aid_certified.svg', is_verification_required: true, unlock_message: 'Safety trained!' },
  { id: 'badge_safety_cpr_certified', title: 'CPR Certified', category: 'Safety', tier: 'Uncommon', description: 'Upload and verify CPR certification.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'cpr' } }, xp_reward: 250, gritcoin_reward: 25, visual_asset: 'cpr_certified.svg', is_verification_required: true, unlock_message: 'Life saver!' },
  { id: 'badge_safety_nursing_license', title: 'Licensed Nurse', category: 'Safety', tier: 'Epic', description: 'Upload and verify nursing license.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'license_nursing' } }, xp_reward: 2000, gritcoin_reward: 200, visual_asset: 'nursing_license.svg', is_verification_required: true, unlock_message: 'Healthcare hero!' },
  { id: 'badge_safety_drivers_license', title: 'Verified Driver', category: 'Safety', tier: 'Common', description: 'Upload and verify driver license.', unlock_condition: { type: 'verified_documents', metadata: { doc_type: 'drivers_license' } }, xp_reward: 100, gritcoin_reward: 10, visual_asset: 'drivers_license.svg', is_verification_required: true, unlock_message: 'Ready to roll!' },
];

const CREATOR_BADGES: Badge[] = [
  { id: 'badge_creator_viral_task', title: 'Viral Task Poster', category: 'Creator', tier: 'Rare', description: 'Post a task that receives 100+ applications.', unlock_condition: { type: 'count_tasks', count: 1, metadata: { applications_min: 100, poster_mode: true } }, xp_reward: 1000, gritcoin_reward: 100, visual_asset: 'viral_task.svg', is_verification_required: false, unlock_message: 'Your task went viral!' },
  { id: 'badge_creator_sponsored_campaign', title: 'Sponsored Campaign', category: 'Creator', tier: 'Epic', description: 'Complete a sponsored brand campaign.', unlock_condition: { type: 'count_tasks', count: 1, metadata: { sponsored: true } }, xp_reward: 2000, gritcoin_reward: 200, visual_asset: 'sponsored_campaign.svg', is_verification_required: true, unlock_message: 'Brand partnership!' },
  { id: 'badge_creator_influencer_bronze', title: 'Influencer Bronze', category: 'Creator', tier: 'Uncommon', description: 'Post 10 social media tasks.', unlock_condition: { type: 'count_tasks', count: 10, category: 'SocialMedia', metadata: { poster_mode: true } }, xp_reward: 300, gritcoin_reward: 30, visual_asset: 'influencer_bronze.svg', is_verification_required: false, next_tier_badge_id: 'badge_creator_influencer_silver', unlock_message: 'Social media savvy!' },
  { id: 'badge_creator_influencer_silver', title: 'Influencer Silver', category: 'Creator', tier: 'Rare', description: 'Post 50 social media tasks.', unlock_condition: { type: 'count_tasks', count: 50, category: 'SocialMedia', metadata: { poster_mode: true } }, xp_reward: 1000, gritcoin_reward: 100, visual_asset: 'influencer_silver.svg', is_verification_required: false, next_tier_badge_id: 'badge_creator_influencer_gold', unlock_message: 'Influencer status!' },
  { id: 'badge_creator_influencer_gold', title: 'Influencer Gold', category: 'Creator', tier: 'Epic', description: 'Post 200 social media tasks.', unlock_condition: { type: 'count_tasks', count: 200, category: 'SocialMedia', metadata: { poster_mode: true } }, xp_reward: 3000, gritcoin_reward: 300, visual_asset: 'influencer_gold.svg', is_verification_required: true, unlock_message: 'Top influencer!' },
  { id: 'badge_creator_content_king', title: 'Content King', category: 'Creator', tier: 'Rare', description: 'Post 100 digital/creative tasks.', unlock_condition: { type: 'count_tasks', count: 100, category: 'Digital', metadata: { poster_mode: true } }, xp_reward: 1200, gritcoin_reward: 120, visual_asset: 'content_king.svg', is_verification_required: false, unlock_message: 'Creative powerhouse!' },
  { id: 'badge_creator_repeat_poster', title: 'Repeat Poster', category: 'Creator', tier: 'Common', description: 'Post 10 tasks as a poster.', unlock_condition: { type: 'count_tasks', count: 10, metadata: { poster_mode: true } }, xp_reward: 150, gritcoin_reward: 15, visual_asset: 'repeat_poster.svg', is_verification_required: false, next_tier_badge_id: 'badge_creator_power_poster', unlock_message: 'Building your network!' },
  { id: 'badge_creator_power_poster', title: 'Power Poster', category: 'Creator', tier: 'Uncommon', description: 'Post 50 tasks as a poster.', unlock_condition: { type: 'count_tasks', count: 50, metadata: { poster_mode: true } }, xp_reward: 600, gritcoin_reward: 60, visual_asset: 'power_poster.svg', is_verification_required: false, next_tier_badge_id: 'badge_creator_mega_poster', unlock_message: 'Task posting pro!' },
  { id: 'badge_creator_mega_poster', title: 'Mega Poster', category: 'Creator', tier: 'Rare', description: 'Post 200 tasks as a poster.', unlock_condition: { type: 'count_tasks', count: 200, metadata: { poster_mode: true } }, xp_reward: 2000, gritcoin_reward: 200, visual_asset: 'mega_poster.svg', is_verification_required: true, unlock_message: 'Elite task creator!' },
  { id: 'badge_creator_generous_tipper', title: 'Generous Tipper', category: 'Creator', tier: 'Uncommon', description: 'Give tips on 25 completed tasks.', unlock_condition: { type: 'count_tasks', count: 25, metadata: { tipped: true, poster_mode: true } }, xp_reward: 400, gritcoin_reward: 40, visual_asset: 'generous_tipper.svg', is_verification_required: false, unlock_message: 'Generosity appreciated!' },
];

const MISC_BADGES: Badge[] = [
  { id: 'badge_misc_first_task', title: 'First Task', category: 'Misc', tier: 'Common', description: 'Complete your very first task.', unlock_condition: { type: 'count_tasks', count: 1 }, xp_reward: 50, gritcoin_reward: 10, visual_asset: 'first_task.svg', is_verification_required: false, unlock_message: 'Your journey begins!' },
  { id: 'badge_misc_first_tip_given', title: 'First Tip Given', category: 'Misc', tier: 'Common', description: 'Give your first tip.', unlock_condition: { type: 'count_tasks', count: 1, metadata: { first_tip: true } }, xp_reward: 50, gritcoin_reward: 5, visual_asset: 'first_tip_given.svg', is_verification_required: false, unlock_message: 'Generosity unlocked!' },
  { id: 'badge_misc_100_photos', title: 'Photo Pro', category: 'Misc', tier: 'Uncommon', description: 'Upload 100 task completion photos.', unlock_condition: { type: 'count_tasks', count: 100, metadata: { photo_uploaded: true } }, xp_reward: 300, gritcoin_reward: 30, visual_asset: 'photo_pro.svg', is_verification_required: false, unlock_message: 'Picture perfect!' },
  { id: 'badge_misc_early_bird', title: 'Early Bird', category: 'Misc', tier: 'Common', description: 'Complete 10 tasks before 8 AM.', unlock_condition: { type: 'count_tasks', count: 10, metadata: { before_8am: true } }, xp_reward: 200, gritcoin_reward: 20, visual_asset: 'early_bird.svg', is_verification_required: false, unlock_message: 'Morning motivation!' },
  { id: 'badge_misc_night_owl', title: 'Night Owl', category: 'Misc', tier: 'Common', description: 'Complete 10 tasks after 10 PM.', unlock_condition: { type: 'count_tasks', count: 10, metadata: { after_10pm: true } }, xp_reward: 200, gritcoin_reward: 20, visual_asset: 'night_owl.svg', is_verification_required: false, unlock_message: 'Burning the midnight oil!' },
  { id: 'badge_misc_perfect_week', title: 'Perfect Week', category: 'Misc', tier: 'Uncommon', description: 'Complete at least 1 task every day for 7 days.', unlock_condition: { type: 'streak_days', days: 7 }, xp_reward: 400, gritcoin_reward: 40, visual_asset: 'perfect_week.svg', is_verification_required: false, unlock_message: 'Consistency is key!' },
  { id: 'badge_misc_perfect_month', title: 'Perfect Month', category: 'Misc', tier: 'Rare', description: 'Complete at least 1 task every day for 30 days.', unlock_condition: { type: 'streak_days', days: 30 }, xp_reward: 2000, gritcoin_reward: 200, visual_asset: 'perfect_month.svg', is_verification_required: false, unlock_message: 'Unstoppable dedication!' },
  { id: 'badge_misc_jack_of_all_trades', title: 'Jack of All Trades', category: 'Misc', tier: 'Rare', description: 'Complete tasks in 8 different skill categories.', unlock_condition: { type: 'count_tasks', count: 8, metadata: { different_categories: 8 } }, xp_reward: 1000, gritcoin_reward: 100, visual_asset: 'jack_of_all_trades.svg', is_verification_required: false, unlock_message: 'Versatility master!' },
  { id: 'badge_misc_specialist', title: 'Specialist', category: 'Misc', tier: 'Uncommon', description: 'Complete 50 tasks in a single category.', unlock_condition: { type: 'count_tasks', count: 50, metadata: { single_category: true } }, xp_reward: 500, gritcoin_reward: 50, visual_asset: 'specialist.svg', is_verification_required: false, unlock_message: 'Focused excellence!' },
  { id: 'badge_misc_profile_complete', title: 'Profile Complete', category: 'Misc', tier: 'Common', description: 'Fill out 100% of your profile.', unlock_condition: { type: 'special_event', event_id: 'profile_complete' }, xp_reward: 100, gritcoin_reward: 10, visual_asset: 'profile_complete.svg', is_verification_required: false, unlock_message: 'Looking good!' },
];

export const BADGES_MANIFEST: Badge[] = [
  ...generateSkillBadges(),
  ...REPUTATION_BADGES,
  ...ECONOMY_BADGES,
  ...SPEED_BADGES,
  ...COMMUNITY_BADGES,
  ...AI_BADGES,
  ...EVENT_BADGES,
  ...SAFETY_BADGES,
  ...CREATOR_BADGES,
  ...MISC_BADGES,
];

export function getBadgeById(id: string): Badge | undefined {
  return BADGES_MANIFEST.find(badge => badge.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES_MANIFEST.filter(badge => badge.category === category);
}

export function getBadgesByTier(tier: BadgeTier): Badge[] {
  return BADGES_MANIFEST.filter(badge => badge.tier === tier);
}

export function getNextTierBadge(currentBadgeId: string): Badge | undefined {
  const currentBadge = getBadgeById(currentBadgeId);
  if (!currentBadge?.next_tier_badge_id) return undefined;
  return getBadgeById(currentBadge.next_tier_badge_id);
}
