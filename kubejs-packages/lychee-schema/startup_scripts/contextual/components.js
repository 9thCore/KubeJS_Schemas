(function() {
    /**
     * @description Helper for the shared code of conditions using other conditions
     * @param {boolean} isArray 
     * @returns {Function} Validator
     */
    const recursiveContextualValidator = (isArray) => (key, value) => {
        switch (key) {
            case "contextual":
                if (Array.isArray(value) !== isArray) {
                    return LycheeSchemaFunctionality.Validators.alwaysFalse(`Key ${key} ${isArray ? "must" : "cannot"} be an array for this ContextualCondition!`);
                }
                return LycheeSchemaFunctionality.Validators.type(key, value, "object", false);
            default:
                return LycheeSchemaFunctionality.Validators.alwaysTrue();
        }
    };

    /**
     * 
     * @returns {Internal.RecipeComponent[]} List of all possible Contextual Conditions
     */
    const getAll = () => {
        const all = [];

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "weather",
            (key, value) => {
                switch (key) {
                    case "weather":
                        return LycheeSchemaFunctionality.Validators.oneOf(key, value, ["clear", "rain", "thunder"]);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["weather"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "not",
            recursiveContextualValidator(false),
            LycheeSchemaFunctionality.DataFixers.none,
            ["contextual"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "or",
            recursiveContextualValidator(true),
            LycheeSchemaFunctionality.DataFixers.none,
            ["contextual"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "and",
            recursiveContextualValidator(true),
            LycheeSchemaFunctionality.DataFixers.none,
            ["contextual"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "chance",
            (key, value) => {
                switch (key) {
                    case "chance":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["chance"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "custom",
            (key, value) => {
                switch (key) {
                    case "id":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["id"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "location",
            (key, value) => {
                switch (key) {
                    case "offsetX":
                    case "offsetY":
                    case "offsetZ":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "predicate":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "object", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["offsetX", "offsetY", "offsetZ", "predicate"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "difficulty",
            (key, value) => {
                switch (key) {
                    case "difficulty":
                        if (Array.isArray(value)) {
                            return LycheeSchemaFunctionality.Validators.forEveryEntryMultiType(key, value, ["string", "number"], false);
                        }
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "number"], false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["difficulty"]
        ));

        return all;
    }

    /**
     * 
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {Function} Builder The Convenient Builder Helper (TM)
     * @returns {Internal.RecipeComponent} Combination of all possible Contextual Conditions
     */
    const getAny = (Component, Builder) => {
        const allContextual = getAll();
        return LycheeSchemaFunctionality.ComplexData.handle(Component, allContextual, []);
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.ContextualConditions.getAny = getAny;
    });
})();