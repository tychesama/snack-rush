/**
 * @file specials.js
 * Defines the special items available in SnackRush.
 */

export const SPECIAL_TYPES = {
  STAR: 'star',
  MAGNET: 'magnet',
  NUKE: 'nuke',
  SHIELD: 'shield',
  LIGHTNING: 'lightning',
  HEART: 'heart',
};

export const SPECIAL_ITEMS = {
  [SPECIAL_TYPES.STAR]: {
    id: SPECIAL_TYPES.STAR,
    label: 'Star',
    icon: '⭐',
    description: 'Temporary invincibility.',
    effectType: 'invincibility',
  },
  [SPECIAL_TYPES.MAGNET]: {
    id: SPECIAL_TYPES.MAGNET,
    label: 'Magnet',
    icon: '🧲',
    description: 'Pulls helpful items toward the basket.',
    effectType: 'item-pull',
  },
  [SPECIAL_TYPES.NUKE]: {
    id: SPECIAL_TYPES.NUKE,
    label: 'Nuke',
    icon: '💣',
    description: 'Clears the current screen.',
    effectType: 'screen-clear',
  },
  [SPECIAL_TYPES.SHIELD]: {
    id: SPECIAL_TYPES.SHIELD,
    label: 'Shield',
    icon: '🛡️',
    description: 'Blocks one rotten hit.',
    effectType: 'block-hit',
  },
  [SPECIAL_TYPES.LIGHTNING]: {
    id: SPECIAL_TYPES.LIGHTNING,
    label: 'Lightning',
    icon: '⚡',
    description: 'Temporarily boosts movement speed.',
    effectType: 'movement-boost',
  },
  [SPECIAL_TYPES.HEART]: {
    id: SPECIAL_TYPES.HEART,
    label: 'Heart',
    icon: '❤️',
    description: 'Restores one heart.',
    effectType: 'healing',
  },
};

export const getSpecialById = (id) => SPECIAL_ITEMS[id];

export const getAllSpecials = () => Object.values(SPECIAL_ITEMS);
