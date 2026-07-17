const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'setpalmaresimage',
  category: 'config',
  description: "Définit l'image de bannière affichée sur le palmarès.",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Vous devez être administrateur pour configurer l'image du palmarès.");
    }

    const url = args[0];
    if (!url) {
      return message.reply("❌ Usage : `+setpalmaresimage <url-de-limage>` ou `+setpalmaresimage off` pour la retirer.");
    }

    if (url.toLowerCase() === 'off') {
      const config = client.db.getGuildConfig(message.guild.id);
      const palmares = config.palmares || {};
      palmares.image = null;
      client.db.updateGuildConfig(message.guild.id, { palmares });
      return message.reply("✅ L'image du palmarès a été retirée. Refaites `+palmares setup` pour mettre à jour le panel.");
    }

    if (!url.startsWith('http')) {
      return message.reply("❌ Veuillez fournir une URL valide (commençant par http/https).");
    }

    const config = client.db.getGuildConfig(message.guild.id);
    const palmares = config.palmares || {};
    palmares.image = url;
    client.db.updateGuildConfig(message.guild.id, { palmares });
    return message.reply(`✅ L'image du palmarès a été mise à jour.\nLien : ${url}\nRefaites \`+palmares setup\` pour afficher le nouveau panel.`);
  }
};
