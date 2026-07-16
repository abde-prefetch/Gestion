module.exports = {
  name: 'restart',
  category: 'owner',
  description: "Redémarre le bot (Owner uniquement).",
  async execute(message, args, client) {
    await message.reply("🔄 Redémarrage du bot **Gestion** en cours...");
    process.exit(0);
  }
};
