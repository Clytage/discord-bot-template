import { requestPermission } from "./utils/functions/requestPermission.ts";
import { Bot } from "./structures/Bot.ts";

const bot = new Bot();

await requestPermission("net");
bot.start();
