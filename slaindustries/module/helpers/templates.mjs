/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/slaindustries/templates/actor/parts/actor-traits.html",
    "systems/slaindustries/templates/actor/parts/actor-items.html",
    "systems/slaindustries/templates/actor/parts/actor-formulae.html",
	"systems/slaindustries/templates/actor/parts/actor-skills.html",
    "systems/slaindustries/templates/actor/parts/actor-effects.html",
	"systems/slaindustries/templates/actor/parts/actor-ranged.html",
	"systems/slaindustries/templates/actor/parts/actor-melee.html",
	"systems/slaindustries/templates/actor/parts/actor-armor.html",
  ]);
};
