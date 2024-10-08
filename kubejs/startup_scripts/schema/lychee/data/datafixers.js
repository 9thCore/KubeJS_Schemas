(function() {
    const $ItemStack = Java.loadClass("net.minecraft.world.item.ItemStack");

    const DataFixers = {};
    
    /**
     * @description Extract count from KubeJS-format item string, if available
     * @param {string} item Item in KubeJS format: "minecraft:stone" or "2x minecraft:stone"
     * @returns {[number, ResourceLocation, boolean]} [Item count (1 if item was in base Minecraft format), Item ID, Whether separation passed]
     */
    const separateCountAndID = item => {
        const array = item.match(/^(\d+)x (.+)$/);
        return array !== null ? [Number.parseInt(array[1]), array[2], true] : [1, item, false];
    }

    /**
     * @description Data fixer with no logic
     * @param {object} object 
     * @returns Unmodified object
     */
    DataFixers.none = object => object;

    /**
     * @description Constructor for an item data fixer
     * @param {string} itemKey 
     * @param {string} countKey 
     * @param {string} nbtKey
     * @returns {Function} Data fixer focusing on items: changes KubeJS format of items ({item: "3x minecraft:stone"}) to Lychee format ({item: "minecraft:stone", count: 3})
     */
    DataFixers.item = (itemKey, countKey, nbtKey) => {
        return object => {
            if (!(itemKey in object)) {
                console.SERVER.error(`FATAL: No Item ID or ItemStack provided to ${itemKey}`);
                throw new Error("No item");
            }

            if (object[itemKey] instanceof $ItemStack) {
                const stack = object[itemKey];

                if (stack.hasNBT()) {
                    object[nbtKey] = stack.getNbtString();
                }

                if (countKey in object) {
                    console.SERVER.warn(`Object has both a count: ${object[countKey]} and item with count: ${stack.getCount()}x ${stack.getId()}; discarding item count`);
                } else {
                    object[countKey] = stack.getCount();
                }
                
                // Make into a JS string or something lol
                object[itemKey] = "" + object[itemKey].getId();
            } else {
                const [count, id, pass] = separateCountAndID(object[itemKey]);

                if (pass) {
                    if (countKey in object) {
                        console.SERVER.warn(`Object has both a count: ${object[countKey]} and item with count: ${object[itemKey]}; discarding item count`);
                    } else {
                        object[countKey] = count;
                    }
                }

                object[itemKey] = id;
            }

            return object;
        };
    }

    /**
     * @description Data fixer that recursively fixes unwrapped strings (string -> "string")
     * @param {object} object 
     */
    DataFixers.nbt = object => {
        for (const key in object) {
            if (typeof object[key] === "string" && !object[key].startsWith(`"`)) {
                object[key] = `"${object[key]}"`;
            } else if (typeof object[key] === "object") {
                DataFixers.nbt(object[key]);
            }
        }
        return object;
    }

    /**
     * @description Apply a datafixer to the current object, treating it as a block
     * @param {object} block 
     * @returns {object} Modified object
     */
    DataFixers.blockRaw = block => {
        if (typeof block === "string") {
            if (block === "*") {
                return block;
            } else if (block.startsWith("#")) {
                return {
                    tag: block.substring(1)
                };
            }

            return {
                blocks: [block]
            };
        }

        if (block.nbt !== undefined) {
            // Make into a JS string or something lol
            block.nbt = "" + JsonIO.parseRaw(DataFixers.nbt(block.nbt));
        }

        return block;
    }

    /**
     * @description Apply a datafixer to a subobject of the current object, treating it as a block
     * @param {string} key Key of the block object in the object
     * @returns {Function} Data fixer focusing on blocks; handles the NBT
     */
    DataFixers.block = key => {
        return object => {
            object[key] = DataFixers.blockRaw(object[key]);
            return object;
        };
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.DataFixers = DataFixers;
    });
})();