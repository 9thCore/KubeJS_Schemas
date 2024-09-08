(function() {
    /**
     * 
     * @returns {Internal.RecipeComponent[]} List of all possible Post Actions
     */
    const getAll = () => {
        const all = [];

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "drop_item",
            (key, value) => {
                switch (key) {
                    case "item":
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "object"], false);
                    case "count":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "nbt":
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "object"], true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.item("item", "count", "nbt")
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "prevent_default",
            LycheeSchemaFunctionality.Validators.alwaysTrue,
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "place",
            (key, value) => {
                switch (key) {
                    case "block":
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "object"], false);
                    case "offsetX":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "offsetY":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "offsetZ":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "execute",
            (key, value) => {
                switch (key) {
                    case "command":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    case "hide":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "boolean", true);
                    case "repeat":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "boolean", true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none
        ));

        return all;
    }

    /**
     * 
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {Function} Builder The Convenient Builder Helper (TM)
     * @returns {Internal.RecipeComponent} Combination of all possible Post Actions
     */
    const getAny = (Component, Builder) => {
        const anyString = Component("anyString");
        const bool = Component("bool");
        const allPostActions = getAll();

        const item = Component("registryObject", {registry: "minecraft:item"});
        const count = Component("intNumberRange", {min: 1});
        const anyInt = Component("anyIntNumber");

        const possibleValues = Builder([
            anyString.key("type"),
            item.key("item").defaultOptional(),
            count.key("count").defaultOptional(),
            LycheeSchemaFunctionality.NBTComponent.getOrString(Component).key("nbt").defaultOptional(),
            LycheeSchemaFunctionality.Block.BlockPredicate.getKey(Component, Builder),
            anyInt.key("offsetX").defaultOptional(),
            anyInt.key("offsetY").defaultOptional(),
            anyInt.key("offsetZ").defaultOptional(),
            anyString.key("command").defaultOptional(),
            bool.key("hide").defaultOptional(),
            bool.key("repeat").defaultOptional(),
            LycheeSchemaFunctionality.ContextualConditions.getKey(Component, Builder)
        ]);

        const postAny = possibleValues.mapIn(object => {
            if (typeof object !== "object") {
                console.SERVER.error(`A Post Action must be an object`);
                return null;
            }

            for (const post of allPostActions) {
                if (post.id === object.type) {
                    // Found Post Action, do stuff
                    return post.handler.call(null, object);
                }
            }

            if ("type" in object) {
                console.SERVER.error(`"${object.type}" is not a valid Post Action type. Must be one of ${LycheeSchemaFunctionality.ComplexData.listPossibleIDs(allPostActions)}`);
            } else {
                console.SERVER.error(`A Post Action must have a type, one of ${LycheeSchemaFunctionality.ComplexData.listPossibleIDs(allPostActions)}`);
            }
            
            return null;
        });

        return postAny.asArrayOrSelf();
    };

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.PostActions.getAny = getAny;
    });
})();