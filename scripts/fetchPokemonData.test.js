import { describe, it, expect } from 'vitest'
import { formatBaseName, formatFormName } from './fetchPokemonData.js'

describe('Pokemon Name Formatting', () => {
  describe('formatBaseName', () => {
    it('should format Mr. Mime with period and space', () => {
      expect(formatBaseName('mr-mime')).toBe('Mr. Mime')
    })

    it('should format Mr. Rime with period and space', () => {
      expect(formatBaseName('mr-rime')).toBe('Mr. Rime')
    })

    it('should preserve hyphens in base names', () => {
      expect(formatBaseName('ho-oh')).toBe('Ho-Oh')
      expect(formatBaseName('porygon-z')).toBe('Porygon-Z')
      expect(formatBaseName('kommo-o')).toBe('Kommo-O')
      expect(formatBaseName('jangmo-o')).toBe('Jangmo-O')
      expect(formatBaseName('hakamo-o')).toBe('Hakamo-O')
    })

    it('should capitalize Pokemon without hyphens', () => {
      expect(formatBaseName('pikachu')).toBe('Pikachu')
      expect(formatBaseName('charizard')).toBe('Charizard')
    })

    it('should handle Type: Null correctly', () => {
      expect(formatBaseName('type-null')).toBe('Type-Null')
    })
  })

  describe('formatFormName - Regional Forms', () => {
    it('should format regional forms with proper base names', () => {
      expect(formatFormName('mr-mime-galar', 'Mr. Mime')).toBe('Mr. Mime (Galar)')
      expect(formatFormName('meowth-alola', 'Meowth')).toBe('Meowth (Alola)')
      expect(formatFormName('vulpix-alola', 'Vulpix')).toBe('Vulpix (Alola)')
      expect(formatFormName('ponyta-galar', 'Ponyta')).toBe('Ponyta (Galar)')
      expect(formatFormName('farfetchd-galar', 'Farfetchd')).toBe('Farfetchd (Galar)')
    })

    it('should handle all regional form types', () => {
      expect(formatFormName('rattata-alola', 'Rattata')).toBe('Rattata (Alola)')
      expect(formatFormName('zigzagoon-galar', 'Zigzagoon')).toBe('Zigzagoon (Galar)')
      expect(formatFormName('growlithe-hisui', 'Growlithe')).toBe('Growlithe (Hisui)')
      expect(formatFormName('wooper-paldea', 'Wooper')).toBe('Wooper (Paldea)')
    })
  })

  describe('formatFormName - Mega Forms', () => {
    it('should format Mega forms correctly', () => {
      expect(formatFormName('charizard-mega-x', 'Charizard')).toBe('Mega Charizard X')
      expect(formatFormName('charizard-mega-y', 'Charizard')).toBe('Mega Charizard Y')
      expect(formatFormName('venusaur-mega', 'Venusaur')).toBe('Mega Venusaur')
      expect(formatFormName('blastoise-mega', 'Blastoise')).toBe('Mega Blastoise')
    })

    it('should format Mega forms with mega- prefix', () => {
      expect(formatFormName('mega-charizard-x', 'Charizard')).toBe('Mega Charizard X')
      expect(formatFormName('mega-charizard-y', 'Charizard')).toBe('Mega Charizard Y')
      expect(formatFormName('mega-venusaur', 'Venusaur')).toBe('Mega Venusaur')
    })
  })

  describe('formatFormName - Special Forms', () => {
    it('should format default forms with parentheses', () => {
      expect(formatFormName('meloetta-aria', 'Meloetta')).toBe('Meloetta (Aria)')
      expect(formatFormName('wormadam-plant', 'Wormadam')).toBe('Wormadam (Plant)')
      expect(formatFormName('giratina-altered', 'Giratina')).toBe('Giratina (Altered)')
      expect(formatFormName('shaymin-land', 'Shaymin')).toBe('Shaymin (Land)')
      expect(formatFormName('keldeo-ordinary', 'Keldeo')).toBe('Keldeo (Ordinary)')
    })

    it('should format alternate forms with parentheses', () => {
      expect(formatFormName('meloetta-pirouette', 'Meloetta')).toBe('Meloetta (Pirouette)')
      expect(formatFormName('wormadam-sandy', 'Wormadam')).toBe('Wormadam (Sandy)')
      expect(formatFormName('wormadam-trash', 'Wormadam')).toBe('Wormadam (Trash)')
      expect(formatFormName('giratina-origin', 'Giratina')).toBe('Giratina (Origin)')
      expect(formatFormName('shaymin-sky', 'Shaymin')).toBe('Shaymin (Sky)')
    })

    it('should format Rotom forms correctly', () => {
      expect(formatFormName('rotom-heat', 'Rotom')).toBe('Rotom (Heat)')
      expect(formatFormName('rotom-wash', 'Rotom')).toBe('Rotom (Wash)')
      expect(formatFormName('rotom-frost', 'Rotom')).toBe('Rotom (Frost)')
      expect(formatFormName('rotom-fan', 'Rotom')).toBe('Rotom (Fan)')
      expect(formatFormName('rotom-mow', 'Rotom')).toBe('Rotom (Mow)')
    })

    it('should format Deoxys forms correctly', () => {
      expect(formatFormName('deoxys-attack', 'Deoxys')).toBe('Deoxys (Attack)')
      expect(formatFormName('deoxys-defense', 'Deoxys')).toBe('Deoxys (Defense)')
      expect(formatFormName('deoxys-speed', 'Deoxys')).toBe('Deoxys (Speed)')
    })

    it('should format Castform forms correctly', () => {
      expect(formatFormName('castform-sunny', 'Castform')).toBe('Castform (Sunny)')
      expect(formatFormName('castform-rainy', 'Castform')).toBe('Castform (Rainy)')
      expect(formatFormName('castform-snowy', 'Castform')).toBe('Castform (Snowy)')
    })
  })

  describe('formatFormName - Special Forms with Hyphenated Base Names', () => {
    it('should handle Kommo-O forms correctly', () => {
      expect(formatFormName('kommo-o-totem', 'Kommo-O')).toBe('Kommo-O (Totem)')
    })

    it('should handle forms of Pokemon with hyphens in base names', () => {
      // Test that the base name hyphen is preserved
      expect(formatFormName('ho-oh-special', 'Ho-Oh')).toBe('Ho-Oh (Special)')
    })

    it('should handle Mr. Mime forms correctly', () => {
      // Mr. Mime with space and period should work correctly
      expect(formatFormName('mr-mime-galar', 'Mr. Mime')).toBe('Mr. Mime (Galar)')
    })
  })

  describe('formatFormName - Gigantamax Forms', () => {
    it('should format Gigantamax forms with Gmax', () => {
      expect(formatFormName('pikachu-gmax', 'Pikachu')).toBe('Pikachu (Gmax)')
      expect(formatFormName('charizard-gmax', 'Charizard')).toBe('Charizard (Gmax)')
      expect(formatFormName('meowth-gmax', 'Meowth')).toBe('Meowth (Gmax)')
    })
  })

  describe('formatFormName - Primal and Other Special Forms', () => {
    it('should format Primal forms', () => {
      expect(formatFormName('kyogre-primal', 'Kyogre')).toBe('Kyogre (Primal)')
      expect(formatFormName('groudon-primal', 'Groudon')).toBe('Groudon (Primal)')
    })

    it('should format Origin forms', () => {
      expect(formatFormName('dialga-origin', 'Dialga')).toBe('Dialga (Origin)')
      expect(formatFormName('palkia-origin', 'Palkia')).toBe('Palkia (Origin)')
    })

    it('should format Therian forms', () => {
      expect(formatFormName('tornadus-therian', 'Tornadus')).toBe('Tornadus (Therian)')
      expect(formatFormName('thundurus-therian', 'Thundurus')).toBe('Thundurus (Therian)')
      expect(formatFormName('landorus-therian', 'Landorus')).toBe('Landorus (Therian)')
    })
  })

  describe('formatFormName - Complex Multi-word Forms', () => {
    it('should capitalize each word in form names', () => {
      expect(formatFormName('pikachu-original-cap', 'Pikachu')).toBe('Pikachu (Original Cap)')
      expect(formatFormName('pikachu-partner-cap', 'Pikachu')).toBe('Pikachu (Partner Cap)')
      expect(formatFormName('pikachu-world-cap', 'Pikachu')).toBe('Pikachu (World Cap)')
    })

    it('should handle Kyurem forms', () => {
      expect(formatFormName('kyurem-black', 'Kyurem')).toBe('Kyurem (Black)')
      expect(formatFormName('kyurem-white', 'Kyurem')).toBe('Kyurem (White)')
    })

    it('should handle Necrozma forms', () => {
      expect(formatFormName('necrozma-dusk', 'Necrozma')).toBe('Necrozma (Dusk)')
      expect(formatFormName('necrozma-dawn', 'Necrozma')).toBe('Necrozma (Dawn)')
      expect(formatFormName('necrozma-ultra', 'Necrozma')).toBe('Necrozma (Ultra)')
    })
  })

  describe('formatFormName - Edge Cases', () => {
    it('should handle single-word Pokemon without forms', () => {
      expect(formatFormName('pikachu', 'Pikachu')).toBe('Pikachu')
    })

    it('should handle empty strings gracefully', () => {
      expect(formatFormName('', 'Pokemon')).toBe('')
    })
  })
})
