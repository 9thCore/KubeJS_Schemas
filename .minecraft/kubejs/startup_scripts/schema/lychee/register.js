(function() {
    const $RecipeSchema = Java.loadClass("dev.latvian.mods.kubejs.recipe.schema.RecipeSchema");
    const commonProperties = []; // Set inside of the registry event

    /**
     * @description Add optional properties which are common to every recipe type
     * @param {object[]} specificProperties Properties specific for this recipe only (i.e. not any shared properties)
     * @returns {object[]} specific + global properties
     */
    const applyCommonProperties = specificProperties => {
        return specificProperties.concat(commonProperties);
    }

    /**
     * @description Add properties common to all recipe types and register the given schema
     * @param {Internal.RecipeSchemaRegistryEventJS} event man this class name is long
     * @param {ResourceLocation} id
     * @param {object[]} specificProperties Properties specific for this recipe only (i.e. without any shared properties)
     */
    const register = (event, id, specificProperties) => {
        event.register(id, new $RecipeSchema(applyCommonProperties(specificProperties)));
    }

    /**
     * @description Get the Convenient Component Helper (TM)
     * @param {Internal.RecipeSchemaRegistryEventJS} event 
     * @returns 
     */
    const convenientComponentHelper = event => {
        return (name, args) => event.components[name](args);
    }

    /**
     * @description Get the Convenient Builder Helper (TM)
     * @param {Internal.RecipeSchemaRegistryEventJS} event 
     * @returns 
     */
    const convenientBuilderHelper = event => {
        return keys => convenientComponentHelper(event)("bool").builder(keys);
    }

    StartupEvents.recipeSchemaRegistry(event => {
        const Component = convenientComponentHelper(event);
        const Builder = convenientBuilderHelper(event);
        
        const itemIn = Component("inputItem").asArrayOrSelf();
        const itemInKey = itemIn.key("item_in");

        const blockIn = Component("inputBlock").asArrayOrSelf();
        const blockInKey = blockIn.key("block_in");

        commonProperties.push(
            LycheeSchemaFunctionality.PostActions.getKey(Component, Builder),
            LycheeSchemaFunctionality.ContextualConditions.getKey(Component, Builder)
        );

        // Platform-specific conditions
        // Forge's don't seem to be doing anything, perhaps KubeJS' recipes run too late?
        // In theory, the user should know what mods, items and tags exist at runtime (as they make the pack)
        // I'll avoid implementing either version now, and will do later if a valid usecase arrives
        if (Platform.isForge()) {
            // commonProperties.push(LycheeSchemaFunctionality.ForgeConditions.getKey(Component, Builder));
        } else if (Platform.isFabric()) {
            // commonProperties.push(LycheeSchemaFunctionality.FabricConditions.getKey(Component, Builder));
        }

        register(event, "lychee:block_interacting", [itemInKey, blockInKey]);
    });
})();

/**
 * An object that includes all other Lychee recipe schema related objects, such that they don't end up flooding the startup script environment
 * @type {object}
 * @property {object} PostActions - Object that provides interfacing with Lychee recipe Post Actions
 * @property {object} ContextualConditions - Object that provides interfacing with Lychee recipe Contextual Conditions
 * @property {object} ForgeConditions - Object that provides interfacing with Forge Conditions
 * @property {object} FabricConditions - Object that provides interfacing with Fabric Conditions
 * @property {object} DataFixers - Object that provides various data fixers, used to ensure complex data is in the Lychee format
 * @property {object} Validators - Object that provides various validators, used to ensure complex data is correct
 * @property {Function} ComplexData - Constructor of a bare-bones entry in a recipe's Post Actions, Contextual Conditions etc., with an optional validator and data fixer
 * @property {object} NBTComponent - Object that provides interfacing with the NBT system, particularly getting a Recipe Component representing it
 */
const LycheeSchemaFunctionality = {
    PostActions: {
        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeComponent} Component that represents all possible Post Actions
         */
        getAny: (Component, Builder) => {
            throw new Error("Not implemented");
        },

        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeKey} Key that represents all possible Post Actions
         */
        getKey: (Component, Builder) => {
            return LycheeSchemaFunctionality.PostActions.getAny(Component, Builder).key("post");
        }
    },
    ContextualConditions: {
        /**
         * @description This method should always return and not error
         * @returns {Internal.RecipeComponent} Component that represents all possible Contextual Conditions
         */
        getAny: () => {
            throw new Error("Not implemented");
        },

        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeKey} Optional key that represents all possible Contextual Conditions
         */
        getKey: (Component, Builder) => {
            return LycheeSchemaFunctionality.ContextualConditions.getAny(Component, Builder).key("contextual").defaultOptional();
        }
    },
    ForgeConditions: {
        /**
         * @description If the current modloader is Forge, should return and not error; otherwise, will error
         * @returns {Internal.RecipeComponent} Component that represents all possible Forge Conditions
         */
        getAny: () => {
            throw new Error("Not implemented");
        },

        /**
         * @description If the current modloader is Forge, should return and not error; otherwise, will error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeKey} Optional key that represents all possible Forge Conditions
         */
        getKey: (Component, Builder) => {
            return LycheeSchemaFunctionality.ForgeConditions.getAny(Component, Builder).key("conditions").defaultOptional();
        }
    },
    FabricConditions: {
        /**
         * @description If the current modloader is Fabric, should return and not error; otherwise, will error
         * @returns {Internal.RecipeComponent} Component that represents all possible Fabric Conditions
         */
        getAny: () => {
            throw new Error("Not implemented");
        },

        /**
         * @description If the current modloader is Fabric, should return and not error; otherwise, will error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeKey} Optional key that represents all possible Fabric Conditions
         */
        getKey: (Component, Builder) => {
            return LycheeSchemaFunctionality.FabricConditions.getAny(Component, Builder).key("fabric:load_conditions").defaultOptional();
        }
    },
    DataFixers: {
        // Dummy, will be set up later
    },
    Validators: {
        // Dummy, will be set up later
    },
    /**
     * @constructor
     * @param {string} id ID of the object
     * @param {Function} validator Validator run on every component of the object: first arg is key, second arg is value, return value is [passed: boolean, errorMessage: string]
     * @param {Function} dataFixer Fixer for the entire object
     * @returns {{id: string, handler: Function}}
     */
    ComplexData: (id, validator, dataFixer) => {
        throw new Error("Not implemented");
    },
    NBTComponent: {
        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @returns {Internal.RecipeComponent} Component that represents NBT
         */
        get: (Component) => {
            throw new Error("Not implemented");
        },

        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @returns {Internal.RecipeKey} Optional key that represents NBT
         */
        getKey: (Component) => {
            return LycheeSchemaFunctionality.NBTComponent.get(Component).key("nbt").defaultOptional();
        }
    }
}