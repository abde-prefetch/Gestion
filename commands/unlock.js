const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Déverrouille le salon actuel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    const channel = interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null, // Remet la permission par défaut
      });

      await interaction.reply({ content: '🔓 **Déverrouillage activé.** Le salon est de nouveau ouvert.' });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Impossible de déverrouiller ce salon. Vérifiez mes permissions.', ephemeral: true });
    }
  },
};
