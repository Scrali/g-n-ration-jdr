/* ==========================================================
   Deux mondes de plus : les bateaux pirates et la ferme.
   Ils sont ajoutés à la liste THEMES (data.js).
   « playmo » : conseils pour installer la scène avec des Playmobil.
   ========================================================== */

THEMES.splice(3, 0, {
  /* ===================== BATEAUX PIRATES ===================== */
  id: "bateaux",
  nom: "Les Bateaux Pirates",
  emoji: "⛵",
  compagnon: "Coquillette, un bernard-l'ermite qui habite dans une vieille théière",
  creatures: ["une mouette", "un dauphin", "un crabe", "un perroquet", "un phoque", "une tortue de mer", "un poisson volant", "un petit mousse"],
  imprevus: [
    "Le vent tombe d'un coup : les voiles pendent et le bateau ne bouge plus.",
    "Un poisson volant atterrit sur le pont en frétillant.",
    "On aperçoit une bouteille qui flotte, avec un message dedans.",
    "Le cuisinier crie : « Le goûter a disparu ! »",
  ],
  playmo: {
    liste: "un bateau (ou une grande boîte), une figurine de pirate par héros, un perroquet, un coffre et quelques animaux marins",
    conseil: "Une serviette ou un drap bleu sur la table fait une mer parfaite. Faites tanguer le bateau quand il y a des vagues !",
  },
  ambiance: "Vous êtes à bord de La Sardine Joyeuse, un bateau pirate aux voiles rapiécées. Le vent fait claquer le drapeau, les vagues font tanguer le pont, et ça sent le sel et les biscuits de mer.",
  donneurs: [
    "la Capitaine Bouclette, qui a un perroquet sur chaque épaule",
    "Monsieur Popote, le vieux cuisinier du bateau",
    "Mousse Tilou, le plus petit pirate de l'équipage",
    "une mouette messagère très bavarde",
  ],
  problemes: [
    { titre: "La Carte qui S'envole", texte: "la carte du trésor de la Capitaine s'est envolée par-dessus bord ! Une bouteille l'emporte vers l'horizon." },
    { titre: "La Grande Course des Bateaux", texte: "la grande course des bateaux pirates commence demain, mais quelqu'un a volé la barre de La Sardine Joyeuse." },
    { titre: "Le Brouillard Collant", texte: "un brouillard tout collant entoure le bateau, et la boussole tourne dans tous les sens." },
    { titre: "Le Bateau Fantôme", texte: "chaque nuit, un bateau fantôme tout illuminé passe près de vous… et vole les biscuits de l'équipage." },
  ],
  lieux: [
    { nom: "Le Pont du Bateau", description: "Le grand pont en bois, avec les cordages, les tonneaux et la grande barre pour diriger.", playmo: "Posez le bateau au milieu de la table, les héros sur le pont, et un ou deux tonneaux." },
    { nom: "La Cale Sombre", description: "Tout en bas du bateau, il fait sombre. Il y a des caisses, des sacs de farine… et des bruits bizarres.", playmo: "Une boîte à chaussures retournée fait la cale. Éclairez-la avec une lampe de poche !" },
    { nom: "Le Nid de Pie", description: "Tout en haut du grand mât, une petite plateforme d'où l'on voit jusqu'à l'horizon.", playmo: "Posez un héros tout en haut du mât (ou sur une pile de livres), avec une longue-vue." },
    { nom: "L'Île aux Mouettes", description: "Une petite île de sable avec un seul palmier et des centaines de mouettes qui crient.", playmo: "Un coussin ou une serviette jaune pour le sable, un palmier, et des oiseaux tout autour." },
    { nom: "Le Port des Pirates", description: "Un port plein de bateaux de toutes les couleurs, de marchands qui crient et de chats qui chipent du poisson.", playmo: "Alignez tous vos bateaux au bord de la table, avec quelques personnages qui font les marchands." },
  ],
  obstacles: [
    { texte: "Une énorme vague arrive droit sur le bateau !", talent: "force", reussite: "Les héros tiennent la barre tous ensemble : le bateau grimpe la vague comme un toboggan et redescend en douceur.", rate: "Splash ! Tout le monde est arrosé, et un héros glisse sur le pont mouillé (−1 ❤️)." },
    { texte: "Le nœud qui tient la grande voile s'est complètement emmêlé.", talent: "malin", reussite: "En suivant la corde du bout du doigt, les héros défont le nœud. La voile se gonfle !", rate: "Le nœud se défait d'un coup, et la voile tombe sur tout le monde comme une grande couverture." },
    { texte: "Un groupe de dauphins bloque le passage : ils veulent jouer !", talent: "coeur", reussite: "Les héros jouent avec eux en lançant un ballon. Ravis, les dauphins poussent le bateau dans la bonne direction.", rate: "Les dauphins éclaboussent tout le monde en riant, et ne partiront pas avant qu'on leur chante une chanson." },
    { texte: "Un autre bateau pirate s'approche, avec des pirates grognons qui veulent vous empêcher de passer.", talent: "coeur", reussite: "Les héros proposent d'échanger des biscuits. Les pirates grognons deviennent tout souriants et vous laissent passer.", rate: "Ils lancent des tartes à la crème ! Tout le monde est collant… mais on passe quand même." },
    { texte: "Le bateau est coincé sur un banc de sable.", talent: "force", reussite: "Tout le monde pousse avec les rames… et hop, le bateau repart !", rate: "Le bateau se libère d'un coup, et un héros tombe à l'eau. Il faut vite lui lancer une bouée." },
  ],
  rencontres: [
    { pnj: "le petit phoque égaré", texte: "Un petit phoque s'est perdu au milieu de la mer. Il pleure, tout seul sur un morceau de bois.", talent: "coeur", reussite: "Les héros le hissent à bord et le ramènent sur son île. Sa maman, très reconnaissante, vous donne un indice.", rate: "Le petit phoque saute à bord… et ne veut plus repartir avant d'avoir mangé tous les poissons de la cuisine !" },
    { pnj: "le vieux gardien du phare", texte: "Le vieux gardien du phare a perdu ses lunettes. Sans elles, il ne peut plus allumer la grande lumière.", talent: "malin", reussite: "Les héros retrouvent les lunettes… sur sa tête ! Le phare se rallume, et le gardien vous raconte ce qu'il a vu passer cette nuit.", rate: "Les héros cherchent partout et mettent un désordre terrible. Les lunettes étaient dans sa poche." },
    { pnj: "le crabe cuisinier", texte: "Un crabe cuisinier pleure dans sa petite cuisine : sa soupe est ratée, et c'est l'anniversaire de sa mamie.", talent: "coeur", reussite: "Les héros l'aident à rattraper la soupe avec une pincée d'algues. La mamie est ravie, et le crabe vous donne un indice.", rate: "La soupe devient bleue et fait des bulles… mais la mamie adore ça !" },
  ],
  mechants: [
    { nom: "Capitaine Barbe-Grise", description: "un vieux pirate grognon avec une barbe si longue qu'il marche dessus", raison: "il a peur qu'on le trouve trop vieux pour être pirate, et il veut prouver qu'il est encore le meilleur", solutions: { coeur: "Lui proposer d'être le capitaine d'honneur de la grande course.", malin: "Le défier à une partie de devinettes de pirates.", force: "Gagner contre lui au tir à la corde, d'un bateau à l'autre." } },
    { nom: "la Pieuvre Mélodie", description: "une grande pieuvre rose qui adore chanter… très fort", raison: "elle voulait des musiciens pour son concert, et elle a pris tout ce qui brillait pour attirer du monde", solutions: { coeur: "Lui organiser un concert sur le pont, avec tout l'équipage comme public.", malin: "Lui fabriquer des instruments avec des casseroles, en échange de ce qu'elle a pris.", force: "Ramer très vite pour lui échapper pendant son grand final." } },
    { nom: "le Fantôme Biscotte", description: "un tout petit fantôme de pirate qui fait « bouh » avec une voix de souris", raison: "il a faim de biscuits depuis trois cents ans, et personne ne l'a jamais invité à manger", solutions: { coeur: "L'inviter à un grand goûter de biscuits avec tout l'équipage.", malin: "Lui tendre un piège à biscuits pour pouvoir lui parler.", force: "Garder le coffre à biscuits fermé tous ensemble jusqu'au lever du soleil." } },
  ],
  rebondissements: [
    "Une tempête éclate ! Il faut tout attacher sur le pont avant que ça ne s'envole.",
    "Le perroquet de la Capitaine a avalé la clé du coffre. Il ne la rendra qu'en échange d'une chanson.",
    "Un énorme poisson (très gentil) avale le bateau ! Dans son ventre, il y a… un autre bateau.",
  ],
  tresors: [
    "un coffre plein de pièces en chocolat",
    "une boussole qui montre toujours le chemin de la maison",
    "un drapeau pirate à dessiner pour chaque héros",
    "le titre de Capitaine pour une journée entière",
  ],
});

THEMES.push({
  /* ===================== FERME ===================== */
  id: "ferme",
  nom: "La Ferme des Quatre Vents",
  emoji: "🐄",
  compagnon: "Patate, un petit cochon qui adore se rouler dans la boue",
  creatures: ["une poule", "un lapin", "un canard", "une chèvre", "un cochon", "un mouton", "un chat de la ferme", "un hérisson"],
  imprevus: [
    "Le coq se met à chanter en plein milieu de la journée : cocoricooo !",
    "Un petit cochon s'échappe et fonce partout dans la boue.",
    "Le tracteur fait un énorme « BOUM » et un nuage de fumée noire.",
    "Une pluie de plumes tombe du poulailler.",
  ],
  playmo: {
    liste: "la ferme (ou une boîte), des animaux (poules, vaches, cochons, moutons), un tracteur, un fermier ou une fermière",
    conseil: "Un torchon vert fait une prairie, et un papier marron une flaque de boue. Faites les bruits des animaux !",
  },
  ambiance: "Le coq chante, les vaches meuglent, et ça sent le foin et la tarte aux pommes. Autour de la grande ferme rouge, il y a des champs, un étang et un vieux tracteur qui fait « teuf-teuf ».",
  donneurs: [
    "la fermière Rosine, avec ses grosses bottes jaunes",
    "Papi Marcel, qui conduit le vieux tracteur",
    "Marguerite, la vache la plus gentille de la ferme",
    "un poussin très pressé qui parle très vite",
  ],
  problemes: [
    { titre: "Les Œufs Disparus", texte: "tous les œufs du poulailler ont disparu cette nuit, et c'est demain la grande fête de la ferme." },
    { titre: "Le Tracteur en Panne", texte: "le vieux tracteur ne démarre plus, et il faut rentrer le foin avant l'orage." },
    { titre: "Les Animaux Échappés", texte: "quelqu'un a ouvert toutes les barrières : les moutons, les cochons et les lapins se sont sauvés partout !" },
    { titre: "La Citrouille Géante", texte: "la citrouille géante préparée pour le grand concours a disparu du potager." },
  ],
  lieux: [
    { nom: "Le Poulailler", description: "Une petite cabane pleine de poules qui caquettent, avec de la paille dorée partout.", playmo: "Une boîte avec de la paille (ou des bouts de papier jaune), et toutes les poules bien alignées." },
    { nom: "L'Étable", description: "Une grande étable où les vaches mâchent tranquillement leur foin.", playmo: "L'étable ou une boîte retournée avec une porte découpée, et les vaches à l'intérieur." },
    { nom: "Le Potager", description: "Des rangées de carottes, de salades et de citrouilles énormes.", playmo: "Des légumes en plastique ou en pâte à modeler, posés en rangées bien droites." },
    { nom: "L'Étang aux Canards", description: "Un étang avec des nénuphars, des canards et une petite barque.", playmo: "Une assiette bleue (ou un bol d'eau) avec les canards autour." },
    { nom: "Le Grenier à Foin", description: "Tout en haut de la grange, des bottes de foin empilées jusqu'au toit.", playmo: "Empilez des boîtes ou des cubes en tour, et posez les héros tout en haut." },
  ],
  obstacles: [
    { texte: "Un gros taureau dort juste devant la barrière.", talent: "malin", reussite: "Les héros passent sur la pointe des pieds… et il ne se réveille même pas.", rate: "Le taureau ouvre un œil et souffle très fort par le nez. Il faut courir jusqu'à la barrière !" },
    { texte: "Une barrière en bois est bloquée par la boue.", talent: "force", reussite: "Les héros poussent tous ensemble : la barrière s'ouvre avec un grand « sloutch ».", rate: "La barrière s'ouvre d'un coup, et tout le monde glisse dans la boue. Le petit cochon est ravi !" },
    { texte: "Les moutons se sont tous mélangés et bloquent le chemin en bêlant.", talent: "coeur", reussite: "Les héros chantent une berceuse : les moutons se calment et s'écartent gentiment.", rate: "Les moutons s'endorment… au milieu du chemin. Il faut les enjamber un par un." },
    { texte: "Un épouvantail se met à parler et pose une devinette : « Qu'est-ce qui a des dents mais ne mord jamais ? » (un peigne)", talent: "malin", reussite: "« Bravo ! » dit l'épouvantail, et il montre le chemin avec son bras de paille.", rate: "« Perdu ! » L'épouvantail rit tellement qu'il perd son chapeau. Il faut le lui rendre pour passer." },
    { texte: "Une énorme botte de foin dévale la colline, droit vers vous !", talent: "force", reussite: "Les héros l'arrêtent tous ensemble juste avant qu'elle n'écrase le potager.", rate: "La botte de foin roule sur un héros, qui ressort plein de paille, comme un épouvantail (−1 ❤️)." },
  ],
  rencontres: [
    { pnj: "le petit agneau perdu", texte: "Un petit agneau bêle tout seul au milieu du pré : il a perdu son troupeau.", talent: "coeur", reussite: "Les héros le ramènent à sa maman. Elle vous raconte ce qu'elle a vu cette nuit.", rate: "L'agneau suit les héros partout en bêlant très fort à chaque pas. Il faudra retrouver sa maman plus tard." },
    { pnj: "la vieille chèvre Bichette", texte: "La vieille chèvre Bichette a la tête coincée dans la clôture.", talent: "force", reussite: "Les héros écartent doucement les planches. Bichette est libre et vous donne un indice pour vous remercier.", rate: "Bichette sort d'un coup… et mange le chapeau d'un héros." },
    { pnj: "Pompon, le chien de berger", texte: "Pompon, le chien de berger, est tout triste : il n'arrive plus à rassembler les moutons.", talent: "malin", reussite: "Les héros l'aident avec un plan malin. Tout le troupeau est rentré, et Pompon vous suit pour vous aider.", rate: "Les moutons partent dans tous les sens. Pompon soupire… mais il vous remercie d'avoir essayé." },
  ],
  mechants: [
    { nom: "Renard Futé", description: "un renard roux avec un petit gilet et un grand sourire", raison: "il voulait juste un œuf pour son anniversaire, et personne ne l'invite jamais à la ferme", solutions: { coeur: "L'inviter à la fête de la ferme, avec un vrai gâteau d'anniversaire.", malin: "Lui proposer un marché : il rend tout, et il devient le gardien du poulailler.", force: "Le rattraper dans une grande course à travers les champs." } },
    { nom: "les Trois Corbeaux Farceurs", description: "trois corbeaux noirs qui rient très fort", raison: "ils s'ennuient terriblement et font des bêtises pour qu'on les remarque", solutions: { coeur: "Leur proposer de jouer avec les animaux de la ferme.", malin: "Leur fabriquer un épouvantail rigolo avec qui jouer.", force: "Les faire partir en faisant un grand bruit tous ensemble (sans leur faire de mal)." } },
    { nom: "Grignotte la Souris Géante", description: "une souris aussi grosse qu'un chien, avec des moustaches immenses", raison: "elle a bu une potion de croissance par erreur, et maintenant elle a tellement faim qu'elle mange tout", solutions: { coeur: "La rassurer et l'emmener chez le vétérinaire de la ferme.", malin: "Lui faire boire la potion pour rapetisser, cachée dans un bol de lait.", force: "Tenir la porte du grenier fermée tous ensemble pendant qu'on prépare un plan." } },
  ],
  rebondissements: [
    "L'orage éclate ! Il faut rentrer tous les animaux dans la grange avant la pluie.",
    "Le tracteur démarre tout seul et part dans les champs, sans personne au volant !",
    "Toutes les poules se mettent à pondre en même temps : il y a des œufs partout !",
  ],
  tresors: [
    "un panier d'œufs en chocolat",
    "une balade sur le tracteur de Papi Marcel",
    "un petit veau à qui donner un nom",
    "une tarte aux pommes géante",
  ],
});

// Conseils Playmobil pour les autres mondes
const PLAYMO_MONDES = {
  foret: { liste: "des arbres, des animaux de la forêt, une maison ou une cabane, une figurine par héros", conseil: "Des coussins verts ou un plaid font une forêt parfaite. Une lampe de poche pour la nuit !" },
  chateau: { liste: "un château (ou des boîtes empilées), des chevaliers, une princesse ou un roi, un dragon", conseil: "Construisez les tours avec des boîtes ou des Lego, et faites un pont-levis avec un livre." },
  pirates: { liste: "une île, un bateau, des pirates, un coffre au trésor, des palmiers", conseil: "Une serviette jaune pour la plage et une bleue pour la mer. Cachez le coffre sous un coussin !" },
  espace: { liste: "une fusée (ou une bouteille vide), des astronautes, des robots, des figurines bizarres pour les extraterrestres", conseil: "Éteignez la lumière et utilisez une lampe de poche pour les étoiles." },
  dinos: { liste: "des dinosaures, des explorateurs, une jeep, des plantes", conseil: "Des plantes vertes et des cailloux font une jungle préhistorique. Un oreiller sous un drap fait un volcan !" },
  mer: { liste: "des poissons, des sirènes, des plongeurs, un bateau, des coquillages", conseil: "Un drap bleu sur la table, et des vrais coquillages si vous en avez." },
};
THEMES.forEach((t) => { if (!t.playmo && PLAYMO_MONDES[t.id]) t.playmo = PLAYMO_MONDES[t.id]; });

function playmoLieu(lieu) {
  return lieu.playmo || `Installez « ${lieu.nom} » sur la table avec ce que vous avez : figurines, Lego, coussins, boîtes…`;
}
