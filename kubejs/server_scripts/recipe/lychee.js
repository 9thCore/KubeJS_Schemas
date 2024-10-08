ServerEvents.recipes(event => {
    event.recipes.lychee.block_interacting(
        [
            {
                type: "prevent_default"
            },
            {
                type: "drop_item",
                item: Item.of("2x minecraft:raw_iron")
                // Alternative forms of the above:
                // item: Item.of("minecraft:raw_iron", 2)
                // item: Item.of("minecraft:raw_iron"), count: 2 // This does not work (because Item.of() returns a stack with 1 item), don't combine the two systems please
                // item: "minecraft:raw_iron", count: 2
                
                // NBT is also supported!
                // item: Item.of("minecraft:stone_sword", 1, {Damage: 100})
                // item: "minecraft:stone_sword", nbt: {Damage: 100}
            },
            {
                type: "place",
                block: {
                    tag: "minecraft:campfires", // Matches first block with this tag
                    state: {
                        lit: false
                    },
                    nbt: {
                        Items: [
                            {
                                Slot: 0,
                                id: "minecraft:porkchop", // Note that strings in NBT data will be auto-wrapped in ""
                                // id: "\"minecraft:porkchop\"", // Can also wrap manually, if desired
                                Count: 1
                            }
                        ]
                        // CookingTotalTimes: [100, 0, 0, 0] // This does not work in object NBT, due to using a special array: [I; 0, 0, 0, 0]. Use the string form instead!
                    }
                    // Alternative form:
                    // nbt: "{Items: [{Slot: 0, id: \"minecraft:porkchop\", Count: 1}], CookingTotalTimes: [I; 100, 0, 0, 0]}" // CookingTotalTimes works here
                },
                offsetX: 0,
                offsetY: 1
                // offsetZ: 0 // Defaults to 0, no need to add!
            },
            {
                type: "add_item_cooldown",
                s: 1
            }
        ],
        "minecraft:iron_pickaxe",
        "#forge:stone",
        // Needlessly convoluted to test the system
        {
            type: "or",
            contextual: [
                {
                    type: "and",
                    contextual: [
                        {
                            type: "difficulty",
                            difficulty: [0, "easy"]
                        },
                        {
                            type: "weather",
                            weather: "thunder"
                        }
                    ]
                },
                {
                    type: "weather",
                    weather: "clear"
                }
            ]
        }
    );

    event.recipes.lychee.block_clicking(
        [
            {
                type: "prevent_default"
            },
            {
                type: "custom",
                id: "test_action",
                custom: "property",
                thisWorks: true,
                soDoes: [
                    "this",
                    2, // "too"
                    true, "!"
                ],
                complexObjectType: {
                    // be careful of numbers in strings! they will become normal numbers, kubejs limitation as far as i can tell
                    // (first tries reading as a number, before a string, lest a real number becomes a string by mistake)
                    array: [1, 2.351, "3.8", "false", false],
                    youGetTheGist: true,
                    nest: {
                        eggs: 0
                    }
                },
                class: "first-class"
            },
            {
                type: "damage_item",
                damage: 2.5
            },
            {
                type: "random",
                rolls: 3,
                entries: [
                    {
                        type: "execute",
                        command: "execute as @a run say HELLO HI HELLO"
                    }
                ],
                empty_weight: 8
            },
            {
                type: "if",
                then: [
                    {
                        type: "execute",
                        command: "execute as @a run say Passed!"
                    },
                    {
                        type: "explode",
                        block_interaction: "keep"
                    }
                ],
                else: [
                    {
                        type: "execute",
                        command: "execute as @a run say Did not pass!"
                    },
                    {
                        type: "hurt",
                        damage: 5
                    },
                    {
                        type: "cycle_state_property",
                        block: "minecraft:wheat",
                        property: "age"
                    }
                ],
                contextual: {
                    type: "weather",
                    weather: "clear"
                }
            }
        ],
        "minecraft:stone_hoe",
        {
            blocks: ["minecraft:wheat"],
            state: {
                age: {
                    min: 1,
                    max: 3
                }
            }
        }
    );

    event.recipes.lychee.item_burning(
        [
            {
                type: "drop_item",
                item: Item.of("acacia_button", 4)
            }
        ],
        "#minecraft:anvil"
    );

    event.recipes.lychee.item_inside(
        {
            type: "explode",
            block_interaction: "keep"
        },
        "#forge:armors",
        "minecraft:water",
        2
    );

    event.recipes.lychee.anvil_crafting(
        {
            type: "place",
            offsetY: 1,
            block: "minecraft:light_blue_carpet"
        },
        ["minecraft:iron_sword", "minecraft:diamond"],
        Item.of("minecraft:diamond_sword"),
        2,
        4,
        {
            type: "hurt",
            damage: 2
        }
    );

    event.recipes.lychee.block_crushing(
        {
            type: "drop_item",
            item: "4x minecraft:stone_pressure_plate"
        },
        "minecraft:stone"
    );

    event.recipes.lychee.lightning_channeling(
        {
            type: "execute",
            command: "weather clear"
        },
        "minecraft:copper_ingot"
    );

    // execute on all exploded items
    event.recipes.lychee.item_exploding(
        {
            type: "drop_item",
            item: "2x minecraft:firework_rocket"
        }
    );

    event.recipes.lychee.block_exploding(
        {
            type: "execute",
            command: "setblock ~ ~ ~ minecraft:sandstone"
        },
        "minecraft:sand"
    );

    event.recipes.lychee.random_block_ticking(
        {
            type: "drop_item",
            item: "minecraft:gunpowder"
        },
        "minecraft:oak_log"
    );

    event.recipes.lychee.dripstone_dripping(
        {
            type: "place",
            block: "wet_sponge"
        },
        "minecraft:water",
        "minecraft:sponge"
    );

    event.recipes.lychee.crafting(
        {
            type: "break" // do nothing on craft
        },
        [
            'aaa',
            'a a',
            ' a '
        ],
        {
            a: "minecraft:chest"
        },
        "minecraft:chest"
    ).assembling({
        type: "hurt",
        damage: 2
    });
});