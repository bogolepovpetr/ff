type LoreEntry = {
  title: string;
  subtitle: string;
  intro: string;
};

type LoreMap = Record<string, Record<string, LoreEntry>>;

const LORE: LoreMap = {
  buildings: {
    en: {
      title: "Buildings",
      subtitle: "The foundations of your empire",
      intro:
        "Every great empire begins with a single foundation stone. From humble farms to towering fortresses, your buildings form the backbone of civilization. Construct wisely, commander — your city's skyline tells the story of your ambition and the strength of your people.",
    },
    ru: {
      title: "Здания",
      subtitle: "Основы вашей империи",
      intro:
        "Каждая великая империя начинается с первого камня в фундаменте. От скромных ферм до величественных крепостей — ваши здания составляют основу цивилизации. Стройте мудро, командир — горизонт вашего города рассказывает историю ваших амбиций и силы вашего народа.",
    },
  },
  troops: {
    en: {
      title: "Troops",
      subtitle: "Your army, your legacy",
      intro:
        "From the disciplined ranks of infantry to the thundering charge of cavalry, your army is your will made manifest on the battlefield. Train your forces well, commander — in the clash of empires, only the strongest survive. Every soldier carries the banner of your ambition.",
    },
    ru: {
      title: "Войска",
      subtitle: "Ваша армия — ваше наследие",
      intro:
        "От дисциплинированных рядов пехоты до громового натиска кавалерии — ваша армия есть воплощение вашей воли на поле битвы. Тренируйте войска хорошо, командир — в столкновении империй выживают лишь сильнейшие. Каждый солдат несёт знамя ваших амбиций.",
    },
  },
  skills: {
    en: {
      title: "Skills",
      subtitle: "Knowledge is the ultimate weapon",
      intro:
        "Through research and mastery, unlock technologies that give your empire the decisive edge. Every skill learned is a step closer to dominion. Invest in knowledge, and your enemies will tremble before the fruits of your wisdom.",
    },
    ru: {
      title: "Навыки",
      subtitle: "Знание — лучшее оружие",
      intro:
        "Исследования и мастерство открывают технологии, дающие вашей империи решающее преимущество. Каждый изученный навык — шаг к господству. Инвестируйте в знания, и враги содрогнутся перед плодами вашей мудрости.",
    },
  },
  heroes: {
    en: {
      title: "Heroes",
      subtitle: "Legends that shape the fate of nations",
      intro:
        "From the divine radiance of Athena to the unstoppable fury of Genghis Khan, heroes are the living embodiment of myth and history. Summon and empower these legendary figures to lead your armies, fortify your cities, and crush your enemies. Each hero brings unique bonuses that can turn the tide of war.",
    },
    ru: {
      title: "Герои",
      subtitle: "Легенды, определяющие судьбу народов",
      intro:
        "От божественного сияния Афины до неудержимой ярости Чингисхана — герои являются живым воплощением мифов и истории. Призывайте и усиливайте этих легендарных личностей, чтобы вести армии, укреплять города и сокрушать врагов. Каждый герой приносит уникальные бонусы, способные изменить ход войны.",
    },
  },
};

export function getLore(
  category: "buildings" | "troops" | "skills" | "heroes",
  lang: string,
): LoreEntry {
  return LORE[category][lang] ?? LORE[category]["en"];
}
