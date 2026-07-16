module.exports = {
  name: 'dmall',
  category: 'owner',
  description: "Envoie un message privé à tous les membres du serveur.",
  async execute(message, args, client) {
    const text = args.join(' ');
    if (!text) return message.reply("❌ Usage : `+dmall <message>`");

    await message.reply("📨 **Envoi en masse en cours...** Cela peut prendre du temps.");

    const members = await message.guild.members.fetch();
    let sent = 0;
    let failed = 0;

    for (const [id, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send(text);
        sent++;
      } catch (err) {
        failed++;
      }
    }

    return message.channel.send(`✅ Envoi terminé.\n• **${sent}** messages envoyés\n• **${failed}** échecs (DMs fermés)`);
  }
};
