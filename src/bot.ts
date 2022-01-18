import { Rin } from "./structures/Rin";
import { Intents } from "discord.js";

const rin = new Rin({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

void rin.build();
