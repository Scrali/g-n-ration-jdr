/* ==========================================================
   Sagas : de grandes histoires en plusieurs épisodes.
   Chaque épisode rapporte un morceau de l'objet magique et un
   indice sur le Grand Méchant, qu'on rencontre au dernier épisode.
   ========================================================== */

const SAGAS = [
  {
    id: "boussole",
    titre: "La Boussole des Étoiles",
    artefact: "la Boussole des Étoiles",
    fragment: "un morceau de la Boussole des Étoiles",
    intro: "La Boussole des Étoiles montre le chemin à tous les voyageurs du monde. Mais cette nuit, quelqu'un l'a cassée en morceaux, et les morceaux se sont envolés très loin ! Sans elle, tout le monde se perd. Vous avez été choisis pour retrouver tous les morceaux.",
    grandMechant: {
      nom: "le Roi Gris",
      description: "un roi tout gris, avec une cape grise, une couronne grise et de grands yeux tristes",
      raison: "il vit tout seul dans son château et il a cassé la Boussole pour que plus personne ne parte en voyage… parce qu'il a peur qu'on l'oublie",
      solutions: {
        coeur: "Lui promettre de venir le voir souvent, et l'inviter à voyager avec eux.",
        malin: "Réparer la Boussole devant lui pour lui montrer qu'elle peut aussi indiquer le chemin vers son château.",
        force: "Tenir la Boussole tous ensemble pendant qu'elle se reconstruit, même s'il essaie de la reprendre.",
      },
    },
    indices: [
      "Une plume grise est accrochée au morceau.",
      "Quelqu'un a écrit tout petit sur le morceau : « Ne partez pas… »",
      "On voit le dessin d'une couronne grise gravé dessus.",
      "Le morceau sent la poussière, comme une maison où personne ne vient jamais.",
    ],
    finaleLieu: { nom: "Le Château Gris", description: "Un château où tout est gris : les murs, les fleurs, même le ciel au-dessus. Il fait très calme… et un peu triste." },
  },
  {
    id: "livre",
    titre: "Le Livre de toutes les Histoires",
    artefact: "le Livre de toutes les Histoires",
    fragment: "une page du Livre de toutes les Histoires",
    intro: "Quelque part existe un livre magique où sont écrites toutes les histoires du monde. Mais quelqu'un en a arraché les pages ! Depuis, les histoires s'effacent : les contes n'ont plus de fin et les rêves deviennent tout blancs. Il faut retrouver les pages.",
    grandMechant: {
      nom: "Mademoiselle Gomme",
      description: "une grande dame toute rose qui tient une gomme géante",
      raison: "personne ne lui a jamais raconté d'histoire avant de dormir, alors elle trouve injuste que les autres en aient",
      solutions: {
        coeur: "Lui raconter une histoire : celle de cette saga, avec tous les héros !",
        malin: "Écrire une nouvelle page du Livre où elle est l'héroïne.",
        force: "Attraper sa gomme géante avant qu'elle n'efface les héros.",
      },
    },
    indices: [
      "Les bords de la page sont effacés, comme avec une gomme.",
      "Il y a des miettes de gomme rose tout autour.",
      "Une petite écriture au crayon dit : « Et moi ? »",
      "Une trace rose mène vers une tour faite de crayons géants.",
    ],
    finaleLieu: { nom: "La Tour des Crayons", description: "Une tour immense faite de crayons de couleur géants. Tout en haut, une pièce pleine de pages blanches qui volettent." },
  },
  {
    id: "saisons",
    titre: "La Couronne des Saisons",
    artefact: "la Couronne des Saisons",
    fragment: "une pierre de la Couronne des Saisons",
    intro: "La Couronne des Saisons fait venir le printemps, l'été, l'automne et l'hiver chacun à leur tour. Mais ses pierres magiques ont été volées ! Maintenant, il neige partout, tout le temps. Les fleurs ont froid et les oiseaux ne chantent plus.",
    grandMechant: {
      nom: "le Bonhomme Hiver",
      description: "un grand bonhomme de neige avec une écharpe rouge et un nez en carotte",
      raison: "au printemps, il fond : il n'a jamais pu voir une seule fleur de sa vie",
      solutions: {
        coeur: "Lui offrir une fleur enfermée dans un glaçon pour qu'il la garde pour toujours.",
        malin: "Lui construire un abri à l'ombre, bien frais, d'où il pourra regarder le printemps sans fondre.",
        force: "Pousser son traîneau jusqu'en haut de la montagne où il fait froid toute l'année.",
      },
    },
    indices: [
      "La pierre est toute froide, et de petits flocons tournent autour.",
      "À côté, il y a des traces de grosses bottes… et une carotte croquée.",
      "Un bout d'écharpe rouge est accroché à une branche.",
      "Quelqu'un a dessiné une fleur dans la neige, avec un cœur autour.",
    ],
    finaleLieu: { nom: "Le Palais de Glace", description: "Un palais tout en glace, qui brille de mille couleurs. Il fait si froid que le souffle fait de petits nuages." },
  },
  {
    id: "reves",
    titre: "Les Rêves Envolés",
    artefact: "le Grand Sac des Rêves",
    fragment: "une bulle de rêve",
    intro: "Chaque nuit, de petites bulles de rêves s'envolent du Grand Sac des Rêves pour aller dans la tête des enfants endormis. Mais le sac est vide : les bulles se sont échappées partout ! Plus personne ne fait de beaux rêves. Il faut les rattraper.",
    grandMechant: {
      nom: "Monsieur Bâille",
      description: "un petit monsieur avec un bonnet de nuit, un énorme sac et des cernes jusqu'aux genoux",
      raison: "il distribue les rêves toutes les nuits depuis mille ans, il n'a jamais dormi, et personne ne lui a jamais dit merci",
      solutions: {
        coeur: "Lui dire merci et lui chanter une berceuse pour qu'il dorme enfin.",
        malin: "Lui proposer que les héros l'aident à distribuer les rêves, pour qu'il puisse se reposer.",
        force: "Porter son énorme sac tous ensemble jusqu'à la Lune-Hamac.",
      },
    },
    indices: [
      "La bulle fait « Aaaah… » comme un grand bâillement quand on la touche.",
      "Il y a un bonnet de nuit oublié juste à côté.",
      "On trouve une liste : « Rêves à livrer ce soir : 1 000 000. Dormir : jamais. »",
      "Dans la bulle, on voit un petit monsieur qui dort enfin… et qui sourit.",
    ],
    finaleLieu: { nom: "La Lune-Hamac", description: "Un croissant de lune accroché dans le ciel comme un hamac. Autour, des milliers de bulles brillantes flottent doucement." },
  },
];

// Défis qui marchent dans tous les mondes, pour varier les épisodes
const OBSTACLES_COMMUNS = [
  { texte: "Un grand trou bloque le chemin. Il faut sauter par-dessus.", talent: "force", reussite: "Hop ! Tout le monde atterrit de l'autre côté.", rate: "Un héros reste suspendu au bord par les mains. Ses amis le tirent pour le remonter." },
  { texte: "Une porte fermée a trois boutons de couleur. À côté, une comptine dit : « D'abord le ciel, puis l'herbe, puis le feu. »", talent: "malin", reussite: "Bleu, vert, rouge : la porte s'ouvre avec un « ding » joyeux.", rate: "Mauvais bouton ! La porte arrose tout le monde d'eau froide. Mais au deuxième essai, elle s'ouvre." },
  { texte: "Une grosse créature dort en ronflant au milieu du passage. Il ne faut surtout pas la réveiller.", talent: "malin", reussite: "Sur la pointe des pieds, les héros passent sans un bruit.", rate: "Un héros éternue ! La créature ouvre un œil… puis se rendort en marmonnant. Ouf, mais il faut maintenant courir !" },
  { texte: "Un pont est cassé : il manque des planches au milieu.", talent: "force", reussite: "Les héros posent une grosse branche à la place des planches et traversent.", rate: "Le pont tangue et un objet d'un héros tombe en bas. Il faudra le récupérer plus tard." },
  { texte: "Un brouillard épais tombe d'un coup : on ne voit plus le bout de son nez.", talent: "malin", reussite: "En se tenant par la main et en écoutant les bruits, les héros trouvent la sortie.", rate: "Les héros tournent en rond et se cognent les uns aux autres (bonk !). Ils finissent par sortir… à un endroit inattendu." },
  { texte: "Un gardien très triste bloque le passage : il a perdu son sourire et ne veut plus laisser passer personne.", talent: "coeur", reussite: "Une blague, une grimace, et le gardien éclate de rire. Il ouvre le passage en remerciant les héros.", rate: "Le gardien ne rit pas… mais il est touché qu'on essaie. Il laisse passer les héros si chacun lui fait un compliment." },
  { texte: "Une échelle très, très haute monte vers une petite trappe.", talent: "force", reussite: "Les héros grimpent sans regarder en bas et ouvrent la trappe.", rate: "Un barreau casse ! Le héros glisse et perd 1 ❤️, mais il se rattrape au barreau suivant." },
  { texte: "Un petit être tout seul a étalé ses jouets en travers du chemin. Il boude parce que personne ne joue avec lui.", talent: "coeur", reussite: "Les héros jouent un moment avec lui. Ravi, il range ses jouets et leur fait un grand signe.", rate: "Il ne veut pas jouer à ce jeu-là ! Il faudra en inventer un autre, plus rigolo." },
];
