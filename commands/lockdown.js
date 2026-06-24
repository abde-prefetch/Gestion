const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Verrouille le salon actuel pour empêcher les membres d\'envoyer des messages.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  async execute(interaction) {
    const channel = interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
      });

      await interaction.reply({ content: '🔒 **Verrouillage activé.** Le salon a été restreint. Utilisez `/unlock` pour le déverrouiller.' });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Impossible de verrouiller ce salon. Vérifiez mes permissions.', ephemeral: true });
    }
  },
};
