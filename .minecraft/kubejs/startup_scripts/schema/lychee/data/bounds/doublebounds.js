(function() {
    /**
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {Function} Builder The Convenient Builder Helper (TM)
     * @returns {Internal.RecipeComponent} Component that represents a DoubleBounds
     */
    const get = (Component, Builder) => {
        const anyDouble = Component("anyDoubleNumber");

        const bounds = Builder([
            anyDouble.key("min").defaultOptional(),
            anyDouble.key("max").defaultOptional()
        ])

        return bounds;
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.Bounds.DoubleBounds.get = get;
    });
})();