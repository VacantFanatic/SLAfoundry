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
    const systemData = actorData.system;
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
      systemData.init = systemData.abilities.dex.value + systemData.abilities.conc.value;
      //add max encumberance calc here
      let str = systemData.abilities.str.value;
      if (str < 3) {
         systemData.attributes.enc.max = 8;
      }
      else {
         systemData.attributes.enc.max = str * 3;
      }
      let s = systemData.attributes.species.value;
      switch (s) {
          case "Human": 
          case "Frother":
          case "Ebonite":
          case "Neophron":
          default:
              systemData.movement.closing.value = 2;
              systemData.movement.rush.value = 5;
              break;
          case "Stormer 313 'Malice'":
          case "Shaktar":
              systemData.movement.closing.value = 3;
              systemData.movement.rush.value = 6;
              break;
          case "Stormer 717 'Xeno'":
              systemData.movement.closing.value = 4;
              systemData.movement.rush.value = 6;
              break;
          case "Advanced Carrien":
              systemData.movement.closing.value = 4;
              systemData.movement.rush.value = 7;
              break;
          case "Wraithen":
              systemData.movement.closing.value = 4;
              systemData.movement.rush.value = 8;
              break;              
      }
      switch (s) {
          case "Neophron":
              systemData.health.max = 11 + str;
              break;
          case "Human":
          case "Ebonite":
          default:
              systemData.health.max = 14 + str;
              break;
          case "Stormer 313 'Malice'":
              systemData.health.max = 22 + str;
          case "Shaktar":
              systemData.health.max = 19 + str;
              break;
          case "Stormer 717 'Xeno'":
          case "Advanced Carrien":
              systemData.health.max = 20 + str;
              break;
          case "Wraithen":
              systemData.health.max = 14 + str;
              break; 
          case "Frother":
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
    if (data.attributes.scl) {
      data.scl = data.attributes.scl.value ?? 10;
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