const { EmbedBuilder } = require('discord.js');
const { OWNER_IDS } = require('../../config');

module.exports = {
  name: 'listowner',
  category: 'owner',
  description: "Affiche les propriétaires absolus du bot.",
  async execute(message, args, client) {
    const ownerList = OWNER_IDS.map((id, i) => `**${i + 1}.** <@${id}> (${id})`).join('\n');
    const embed = new EmbedBuilder()
      .setTitle('👑 Propriétaires Globaux du Bot')
      .setDescription(ownerList)
      .setColor(client.db.getGuildConfig(message.guild.id).theme || '#5865F2')
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
