const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'sethierarchie',
  category: 'config',
  description: "Envoie l'embed de la hiérarchie du serveur.",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Vous devez être administrateur pour utiliser cette commande.");
    }

    const config = client.db.getGuildConfig(message.guild.id);

    // Supprimer le message de commande
    await message.delete().catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle('👑 Hiérarchie du Serveur')
      .setDescription('Voici l\'organisation des rôles et des rangs au sein du serveur. Chaque grade a ses propres responsabilités et privilèges.')
      .setColor(config.theme || '#5865F2')
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .addFields(
        {
          name: '🔱 Administration & Direction',
          value: 
            '👑 **Yami 漢** — Fondateur & Directeur\n' +
            '⚔️ **Bras-droit** — Co-Directeur / Administrateur Principal',
          inline: false
        },
        {
          name: '🟢 Haut Commandement',
          value: 
            '🛡️ **Empereur** — Responsable / Administrateur\n' +
            '🔱 **Souverain** — Staff Principal / Modérateur Général',
          inline: false
        },
        {
          name: '🟡 Cadres & Modération',
          value: 
            '⚜️ **Apôtre** — Modérateur Confirmé\n' +
            '📜 **Emissaire** — Modérateur en Test / Helper',
          inline: false
        },
        {
          name: '🔴 Rangs d\'Élite',
          value: 
            '☠️ **Rang X** — Grade Suprême d\'activité\n' +
            '⭐ **Rang S** — Membre très actif et influent\n' +
            '🔺 **Rang A** — Membre actif',
          inline: false
        },
        {
          name: '🟤 Rangs de Progression',
          value: 
            '🔸 **Rang B** — Membre habitué\n' +
            '🔹 **Rang C** — Nouveau membre intégré',
          inline: false
        },
        {
          name: '⚪ Nouveaux & Visiteurs',
          value: 
            '👤 **Novice** — Fraîchement arrivé\n' +
            '👥 **Visiteur** — Rôle d\'attente ou externe',
          inline: false
        }
      )
      .setTimestamp()
      .setFooter({ text: 'S-V Protect • Organisation', iconURL: message.guild.iconURL() });

    await message.channel.send({ embeds: [embed] });
  }
};
