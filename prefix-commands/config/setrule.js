const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const RULES = [
  {
    title: '📜 Règlement du Serveur',
    description: 'En rejoignant ce serveur, vous vous engagez à respecter les règles suivantes. Merci de les lire attentivement.',
    color: '#5865F2',
    isHeader: true
  },
  {
    title: '§1 — Respect de Discord et des conditions d\'utilisation',
    description:
      '- Restez polis, respectueux & bienveillants. Les propos insultants, provocateurs, discriminatoires ou diffamatoires sont interdits.\n' +
      '- Le troll vocal/écrit, le spam (messages, réactions, tickets, mentions) ou tout comportement perturbant la bonne ambiance sont proscrits.\n' +
      '- Les attaques personnelles, les règlements de compte publics ou la propagation de rumeurs sont strictement interdits.\n' +
      '- Les discussions politiques, religieuses ou à caractère polémique ne sont pas tolérées.\n' +
      '- Le harcèlement, la provocation, ou toute forme de menace (physique, morale ou psychologique) sont considérés comme des infractions graves.\n' +
      '- Vous devez respecter les [Conditions d\'utilisation](https://discord.com/terms) et les [Directives communautaires de Discord](https://discord.com/guidelines).',
    color: '#ED4245'
  },
  {
    title: '§2 — Contenu & Communication',
    description:
      '- Les contenus NSFW, violents, racistes, homophobes, sexistes, terroristes ou incitant à la haine sont formellement interdits.\n' +
      '- Les pseudos, statuts et images de profil doivent rester appropriés et ne pas être offensants.\n' +
      '- Le spam de réactions, liens, ou mentions est interdit.\n' +
      '- Les messages volontairement provocateurs ou destinés à susciter une réaction négative (ragebait) peuvent être modérés.\n' +
      '- Les contenus suggestifs ou ambigus peuvent être supprimés s\'ils ne sont pas adaptés à un espace communautaire public.',
    color: '#FEE75C'
  },
  {
    title: '§3 — Sécurité, Confidentialité & Arnaques',
    description:
      '- Ne partagez aucune information personnelle (adresse, identifiants, numéros, etc.).\n' +
      '- Le doxxing (diffusion d\'informations privées), le phishing, et toute tentative d\'escroquerie ou de scam sont formellement interdits.\n' +
      '- Ne cliquez pas sur des liens suspects, le staff n\'est jamais responsable d\'une arnaque liée à un lien externe.\n' +
      '- L\'usurpation d\'identité (staff, partenaire, etc.) entraînera un ban immédiat.',
    color: '#EB459E'
  },
  {
    title: '§4 — Triche, Piratage et Activité Illégale',
    description:
      '- Toute triche, utilisation ou partage de logiciels modifiés, ou exploitation de bugs/failles sur Discord est interdite.\n' +
      '- Le partage, achat ou vente de comptes Riot est strictement prohibé.\n' +
      '- Toute manipulation volontaire de l\'intégrité compétitive est interdite, incluant : derank volontaire, throw intentionnel, wintrading, ou recherche de partenaires dans ce but.',
    color: '#FF5500'
  },
  {
    title: '§5 — Publicité, Redirection & Auto-Promotion',
    description:
      '- La publicité, les sollicitations, ou le partage de liens externes sans accord du staff sont interdits.\n' +
      '- Les redirections vers d\'autres serveurs (même par MP) sont interdites.\n' +
      '- La mendicité de skin, Nitro, RP ou autres services n\'est pas tolérée.',
    color: '#57F287'
  },
  {
    title: '§6 — Divers',
    description:
      '- Soyez bienveillants et patients avec les nouveaux membres.\n' +
      '- Rappelez les règles si besoin, mais laissez la modération intervenir en cas de problème.\n' +
      '- Le serveur est un espace d\'échange et de plaisir, gardons-le sain et accueillant.\n' +
      '- Les règles peuvent être mises à jour à tout moment. Il est de la responsabilité de chacun de s\'y conformer.\n' +
      '- Le spam de commandes ou de tickets entraînera un avertissement voire un mute.\n' +
      '- L\'intention supposée (humour, sarcasme, ragebait) ne prime jamais sur le contenu écrit.\n' +
      '- La diffusion d\'informations fausses ou trompeuses concernant le serveur, le staff ou le jeu peut être sanctionnée.',
    color: '#5865F2'
  },
  {
    title: '§7 — Staff & Modération',
    description:
      '- Le staff est là pour maintenir une atmosphère agréable et sécurisée.\n' +
      '- Les décisions du staff sont définitives et doivent être respectées.\n' +
      '- Toute contestation se fait via ticket Modmail, pas en public.\n' +
      '- L\'insolence, l\'agressivité ou le manque de respect envers le staff entraînera une sanction directe.\n' +
      '- La modération intervient uniquement sur les contenus et comportements ayant lieu sur le serveur.',
    color: '#F1C40F'
  },
  {
    title: null,
    description: '-# En rejoignant le serveur, vous acceptez que l\'équipe administrative puisse sanctionner toute action jugée nuisible à la communauté, même non listée ici. Par conséquent, elle est en droit d\'établir des sanctions sans fournir de motifs détaillés.',
    color: '#2F3136',
    isFooter: true
  }
];

module.exports = {
  name: 'setrule',
  category: 'config',
  description: "Envoie le règlement complet du serveur dans le salon actuel.",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Vous devez être administrateur pour envoyer le règlement.");
    }

    const config = client.db.getGuildConfig(message.guild.id);

    // Supprimer le message de commande
    await message.delete().catch(() => {});

    for (const rule of RULES) {
      const embed = new EmbedBuilder()
        .setColor(rule.color || config.theme || '#5865F2')
        .setDescription(rule.description);

      if (rule.title) embed.setTitle(rule.title);
      if (rule.isHeader) {
        embed.setThumbnail(message.guild.iconURL({ dynamic: true }));
        embed.setTimestamp();
      }

      await message.channel.send({ embeds: [embed] });
      // Petit délai pour respecter le rate limit Discord
      await new Promise(r => setTimeout(r, 300));
    }
  }
};
