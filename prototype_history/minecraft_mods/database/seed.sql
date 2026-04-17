-- Seed data for Minecraft Mod Conflict Tracker
-- Idempotent: ON CONFLICT DO NOTHING prevents duplicate inserts.

INSERT INTO mod_conflicts (id, primary_mod, conflicting_mod, crash_log_snippet, is_resolved, created_at, updated_at)
VALUES
(
    'a1b2c3d4-0001-4000-8000-000000000001',
    'OptiFine 1.20.1',
    'Sodium 0.5.3',
    E'java.lang.RuntimeException: Mixin apply failed: optifine.mixins.json:MixinChunkRenderDispatcher\n'
    E'\tat org.spongepowered.asm.mixin.transformer.MixinProcessor.applyMixins(MixinProcessor.java:392)\n'
    E'\tat org.spongepowered.asm.mixin.transformer.MixinTransformer.transformClass(MixinTransformer.java:234)\n'
    E'Caused by: org.spongepowered.asm.mixin.injection.throwables.InvalidInjectionException',
    TRUE,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '2 days'
),
(
    'a1b2c3d4-0002-4000-8000-000000000002',
    'JourneyMap 5.9.7',
    'Xaeros Minimap 23.9.3',
    E'[WARN] JourneyMap: Detected conflicting minimap mod: xaerominimap\n'
    E'[ERROR] java.lang.IllegalStateException: Duplicate keybind registration for key.minimap.waypoint\n'
    E'\tat net.minecraft.client.KeyMapping.registerKey(KeyMapping.java:88)',
    FALSE,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
),
(
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Create 0.5.1f',
    'Immersive Engineering 10.1.0',
    E'java.lang.NullPointerException: Cannot invoke "net.minecraft.world.level.block.entity.BlockEntity.getBlockState()"\n'
    E'\tat com.simibubi.create.content.kinetics.base.KineticBlockEntity.tick(KineticBlockEntity.java:201)\n'
    E'\tat blusunrize.immersiveengineering.common.blocks.IEBaseTileEntity.tick(IEBaseTileEntity.java:77)',
    FALSE,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
),
(
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Twilight Forest 4.3.1846',
    'Biomes O Plenty 18.0.0.592',
    E'[ERROR] TwilightForest: Failed to register biome twilightforest:twilight_forest — biome ID collision with biomesoplenty:highland\n'
    E'java.lang.IllegalArgumentException: Duplicate registry key: minecraft:worldgen/biome/twilight_forest\n'
    E'\tat net.minecraftforge.registries.ForgeRegistry.add(ForgeRegistry.java:312)',
    TRUE,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '5 days'
),
(
    'a1b2c3d4-0005-4000-8000-000000000005',
    'Applied Energistics 2 rv6',
    'Refined Storage 1.12.3',
    E'[WARN] AE2: Detected competing item storage network mod: refinedstorage\n'
    E'[ERROR] java.lang.ClassCastException: class appeng.tile.networking.TileCableBus cannot be cast to class refinedstorage.tile.TileBase\n'
    E'\tat refinedstorage.proxy.CommonProxy.onWorldLoad(CommonProxy.java:54)',
    FALSE,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
),
(
    'a1b2c3d4-0006-4000-8000-000000000006',
    'Tinkers Construct 3.8.4',
    'Silent Gear 3.0.3',
    E'java.lang.ExceptionInInitializerError\n'
    E'\tat slimeknights.tconstruct.tools.ToolClientEvents.registerModels(ToolClientEvents.java:112)\n'
    E'Caused by: java.lang.IllegalStateException: Tool material "silentgear:flaxseed" already registered by Tinkers Construct',
    TRUE,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '12 days'
),
(
    'a1b2c3d4-0007-4000-8000-000000000007',
    'Quark r4.0-409',
    'Charm of Undying 6.3.1',
    E'[ERROR] Quark: Module "totem_of_undying_rework" conflicts with Charm of Undying enchantment handler\n'
    E'java.lang.IllegalArgumentException: Enchantment minecraft:binding_curse already has a handler registered\n'
    E'\tat net.minecraftforge.event.enchanting.EnchantmentLevelSetEvent.<init>(EnchantmentLevelSetEvent.java:29)',
    FALSE,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
),
(
    'a1b2c3d4-0008-4000-8000-000000000008',
    'Mekanism 10.4.5',
    'Industrial Foregoing 3.5.14',
    E'java.lang.StackOverflowError\n'
    E'\tat mekanism.common.tile.machine.TileEntityElectricPump.getFluid(TileEntityElectricPump.java:188)\n'
    E'\tat com.buuz135.industrial.block.tile.IndustrialAreaWorkingTile.getFluid(IndustrialAreaWorkingTile.java:77)\n'
    E'\tat mekanism.common.tile.machine.TileEntityElectricPump.getFluid(TileEntityElectricPump.java:188)',
    FALSE,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    'a1b2c3d4-0009-4000-8000-000000000009',
    'Botania r1.20.1-444',
    'Patchouli 1.20.1-84',
    NULL,
    TRUE,
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '40 days'
),
(
    'a1b2c3d4-0010-4000-8000-000000000010',
    'Thermal Expansion 10.3.0',
    'Ender IO 6.0.21',
    E'[ERROR] ThermalExpansion: Recipe conflict detected in Pulverizer — output item matches EnderIO SAG Mill recipe for minecraft:iron_ore\n'
    E'java.lang.IllegalStateException: Duplicate recipe ID: thermal:pulverizer/iron_ore\n'
    E'\tat cofh.thermal.expansion.util.managers.machine.PulverizerRecipeManager.addRecipe(PulverizerRecipeManager.java:99)',
    FALSE,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;