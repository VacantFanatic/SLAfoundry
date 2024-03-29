import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class slaindustriesActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["slaindustries", "sheet", "actor"],
      template: "systems/slaindustries/templates/actor/actor-sheet.html",
      width:850,
      height: 750,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "traits" }]
    });
  }

  /** @override */
  get template() {
    return `systems/slaindustries/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();
    context.config = CONFIG.slaindustries;

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
     //v.label = game.i18n.localize(CONFIG.slaindustries.abilities[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
	const ranged =[];
	const melee = [];
	const armor = [];
    const traits = [];
    const drugs = [];
    const formulae = {
        "aware": [],
        "blast": [],
        "comm": [],
        "enh": [],
        "heal": [],
        "prot": [],
        "fold": [],
        "sense": [],
        "tele": [],
        "therm": []
    };

    // Iterate through items, allocating to containers
      let curWT = 0;
      for (let i of context.items) {
      //calculate current encumberance here?
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
          gear.push(i);
          curWT += i.system.weight;
      }
	  //Append to ranged
	  else if (i.type === 'ranged') {
          ranged.push(i);
          curWT += i.system.weight;
      }
	  //Append to melee
	  else if (i.type === 'melee') {
          melee.push(i);
          curWT += i.system.weight;
      }
	  //Append to armor
	  else if (i.type === 'armor') {
          armor.push(i);
          curWT += i.system.weight;
      }
      // Append to traits.
      else if (i.type === 'trait') {
        traits.push(i);
      }
      // Append to formulae.
      else if (i.type === 'formulae') {
        if (i.system.discipline != undefined) {
          formulae[i.system.discipline].push(i);
        }
      }
      // Append to formulae.
      else if (i.type === 'drug') {
          drugs.push(i);
      }
  }

    // Assign and return
    context.gear = gear;
	context.ranged = ranged;
	context.melee = melee;
	context.armor = armor;
    context.traits = traits;
    context.formulae = formulae;
    context.drugs = drugs;
    context.system.enc.cur = curWT;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }

    if (dataset.rollType == 'skill') {
        let abty = this.actor.system.abilities[dataset.attribute] || 0;
        let skill = this.actor.system.skills[dataset.skill] || 0;
        let mod = abty + skill;
		let rank = ~~skill + 1;
        let rolls = [new Roll("1d10+"+mod)];
        for (let i = 0; i < rank; i++) {
            rolls.push(new Roll("1d10+"+mod));
        }
        ChatMessage.create({rolls, type: CONST.CHAT_MESSAGE_TYPES.ROLL, flavor: "Rolling " + element.innerText });
        return rolls;
    }

      if (dataset.rollType == 'ranged') {
          let abty = dataset.attribute;
          let mod = abty;
          let skill = this.actor.system.skills[dataset.skill];
          let rank = skill + 1;
          let rolls = [new Roll("1d10+"+mod)];
          for (let i = 0; i < rank; i++) {
                rolls.push(new Roll("1d10+"+mod));
          }
          ChatMessage.create({rolls, type: CONST.CHAT_MESSAGE_TYPES.ROLL, flavor: "Rolling " + dataset.skill });
          return rolls;
        }

        if (dataset.rollType == 'melee') {
            let abty = this.actor.system.abilities[dataset.attribute];
            let mod = abty.value;
            let skill = this.actor.system.skills[dataset.skill];
            let rank = skill.rank + 1;
            let rolls = [new Roll("1d10+"+mod)];
            for (let i = 0; i < rank; i++) {
                    rolls.push(new Roll("1d10+"+mod));
            }
            ChatMessage.create({rolls, type: CONST.CHAT_MESSAGE_TYPES.ROLL, flavor: "Rolling " + dataset.skill });
            return rolls;
        }

        if (dataset.rollType === 'damage') {
            let formula = dataset.formula;
            let roll = new Roll(formula);
            ChatMessage.create({ roll, type: CONST.CHAT_MESSAGE_TYPES.ROLL, flavor: "Rolling Damage! Minimum Damage: "+dataset.min });
            return roll;
        }

    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

}
