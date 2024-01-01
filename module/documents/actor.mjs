/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class slaindustriesActor extends Actor {



  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
    }



  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
      // documents or derived data.
  }


  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const flags = actorData.flags.slaindustries || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

    // Override _preCreate so that we can apply default token settings.
  async _preCreate(data, options, userId) {
      await super._preCreate(data, options, userId);
      if (data.type === 'character') {
          this.updateSource({ 'prototypeToken.actorLink': true });
      }
  }


  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;
      // Make modifications to data here. For example:
      const systemData = actorData.system;
      systemData.init = systemData.abilities.dex + systemData.abilities.conc;
      //add max encumberance calc here
      let str = systemData.abilities.str;
      if (str < 3) {
         systemData.enc.max = 8;
      }
      else {
         systemData.enc.max = str * 3;
      }
      let s = systemData.species;
      switch (s) {
          case "human": 
          case "froth":
          case "ebb":
          case "neo":
          default:
              systemData.movement.closing = 2;
              systemData.movement.rush= 5;
              break;
          case "storm_313":
          case "shaktar":
              systemData.movement.closing = 3;
              systemData.movement.rush = 6;
              break;
          case "storm_717":
              systemData.movement.closing = 4;
              systemData.movement.rush = 6;
              break;
          case "advCar":
              systemData.movement.closing = 4;
              systemData.movement.rush = 7;
              break;
          case "wraith":
              systemData.movement.closing = 4;
              systemData.movement.rush = 8;
              break;              
      }
      switch (s) {
          case "neo":
              systemData.health.max = 11 + str;
              break;
          case "human":
          case "ebb":
          default:
              systemData.health.max = 14 + str;
              break;
          case "storm_313":
              systemData.health.max = 22 + str;
          case "shaktar":
              systemData.health.max = 19 + str;
              break;
          case "storm_717":
          case "Advanced Carrien":
              systemData.health.max = 20 + str;
              break;
          case "wraith":
              systemData.health.max = 14 + str;
              break; 
          case "froth":
              systemData.health.max = 15 + str;
              break;
      }
    // Loop through ability scores, and add their modifiers to our sheet output.
	//for (let [key, ability] of Object.entries(systemData.abilities)) {
      // Calculate the modifier using d20 rules.
     // ability.mod = Math.floor((ability.value - 10) / 2);
    //}
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;
    // Make modifications to data here. For example:
    const systemData = actorData.system;
    //systemData.xp = (systemData.cr * systemData.cr) * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.scl) {
      data.scl = data.scl ?? "10";
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}