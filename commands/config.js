const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Affiche la configuration de sécurité de S-V Protect.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Configuration S-V Protect')
      .setDescription('Voici l\'état des modules de sécurité sur ce serveur.')
      .addFields(
        { name: '🔗 Anti-Link', value: '✅ **Activé**\n(Supprime les liens, ignore les admins)', inline: true },
        { name: '⏱️ Anti-Spam', value: '✅ **Activé**\n(5 msgs / 5 sec = Timeout 1 min)', inline: true },
        { name: '📢 Anti-Mass Ping', value: '✅ **Activé**\n(> 5 mentions = Timeout 1 min)', inline: false },
        { name: '🚨 Anti-Raid', value: '✅ **Activé**\n(> 10 arrivées / 10 sec = Mode Raid / Kick auto)', inline: false }
      )
      .setColor(0x2b2d31)
      .setFooter({ text: 'S-V Protect - Toujours à l\'affût' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
