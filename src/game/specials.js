/**
 * @file specials.js
 * Defines the special items available in SnackRush.
 */

/**
 * TYPES of special items.
 * They are distinct from normal candy and 'bad' food.
 */
export const SPECIAL_TYPES = {
  STAR: 'star',
  MAGNET: 'magnet',
  NUKE: 'nuke',
  SHIELD: 'shield',
  LIGHTNING: 'lightning',
  HEART: 'heart'
};

/**
 * The source of truth for special items.
 */
export const SPECIAL_ITEMS = {
  [SPECIAL_TYPES.STAR]: {
    id: 'star_invincibility',
    label: 'Star',
    icon: '⭐',
    desc: 'Invincibility for 5 seconds.',
    type: 'protection'
  },
  [SPECIAL_TYPES.MAGNET]: {
    id: 'magnet_pull',
    label: 'Magnet',
    icon: '🧲',
    desc: 'Pull items closer for 3 seconds.',
    type: 'utility'
  },
  [SPECIAL_TYPES.NUKE]: {
    id: 'nuke_clear',
    label: 'Nuke',
    icon: '💣',
    desc: 'Clear all objects from the screen.',
    type: 'cleansing'
  },
  [SPECIAL_TYPES.SHIELD]: {
    id: 'shield_block',
    label: 'Shield',
    icon: '🛡️',
    desc: 'Block one hit without losing a point.',
    type: 'protection'
  },
  [SPECIAL_TYPES.LIGHTNING]: {
    id: 'lightning_speed',
    label: 'Lightning',
    icon: '⚡',
    desc: 'Movement speed boost for 7 seconds.',
    type: 'movement'
  },
  [SPECIAL_TYPES.HEART]: {
    id: 'heart_life',
    label: 'Heart',
    icon: '❤️',
    desc: 'Instant heart refill.',
    type: 'healing'
  }
};

/**
 * Helper to get a specific special by its type.
 */
export const getSpecialById = (type) => SPECIAL_ITEMS[type];

/**
 * Returns all available specialties for UI lists or generation.
 */
export const getAllSpecials = () => Object.values(SPECIAL_ITEMS);
