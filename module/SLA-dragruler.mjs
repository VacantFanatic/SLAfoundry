Hooks.once("dragRuler.ready", (SpeedProvider) => {
    class SLASpeedProvider extends SpeedProvider {
        get colors() {
            return [
                {id: "close", default: 0x3ae62e, name: "Closing Movement"},
                {id: "rush", default: 0xe6c42e, name: "Rush Movement" },
                { id: "none", default: 0xfc5623, name: "No Movement Allowed" }
            ]
        }

        getRanges(token) {

            let close = token.actor.system.movement.closing
            let rush = token.actor.system.movement.rush
            let hClose = close / 2
            let hRush = rush / 2
            let none = 0

            //console.log("Loading terrain type...")

            //let terrainName = canvas.terrain.terrainFromPixels(token.x, token.y)[0]?.environment ?? "global"
            //console.log("Terrain type is", terrainName)

            //console.log("Terrain type is", terrainName)

            let Close = { range: close, color: "close" }
            let Rush = { range: rush, color: "rush" }
            let half_Base = { range: hClose, color: "close" }
            let half_Full = { range: hRush, color: "rush" }
            let noMove = { range: none, color: "none" }

			let ranges = [
                Close,
				Rush
            ]

            if (token.actor.statuses.has("stun")) {
                ranges = [
                    half_Base,
                    half_Full
                ];
                return ranges;
            }
            if (token.actor.statuses.has("blind")) {
                ranges = [
                    Base
                ];
                return ranges;
            }

            //conditions with no movement
            if (token.actor.statuses.has("restrain")) {
                ranges = [noMove];
                return ranges;
            }
            if (token.actor.statuses.has("paralysis")) {
                ranges = [noMove];
                return ranges;
            }
            if (token.actor.statuses.has("dead")) {
                ranges = [noMove];
                return ranges;
            }
            if (token.actor.statuses.has("unconscious")) {
                ranges = [noMove];
                return ranges;
            }
            if (token.actor.statuses.has("prone")) {
                ranges = [noMove];
                return ranges;
            }
            if (token.actor.statuses.has("incapacitated")) {
                ranges = [noMove];
                return ranges;
            }
            return ranges
        }
    }
    dragRuler.registerSystem("slaindustries", SLASpeedProvider)
})
