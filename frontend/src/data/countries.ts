export type Country = {
  code: string;
  name_pt: string;
  name_en: string;
  flag: string;
  cities: string[];
  arrival_date: string;
  image: string;
  curiosities_pt: string[];
  curiosities_en: string[];
  isAirLink?: boolean;
  lat: number;
  lng: number;
};

export const COUNTRIES: Country[] = [
  {
    code: "PT", name_pt: "Portugal", name_en: "Portugal", flag: "🇵🇹",
    cities: ["Lagos", "Lisboa"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1608649944716-228404a0a8bb?w=1600",
    curiosities_pt: ["O primeiro carril foi assentado em 1856.", "A linha do Algarve corre paralela ao mar durante quase 100 km.", "Pastéis de nata no comboio são obrigatórios."],
    curiosities_en: ["The first rail was laid in 1856.", "The Algarve line runs along the sea for nearly 100 km.", "Pastéis de nata on the train are mandatory."],
    lat: 39.3999, lng: -8.2245,
  },
  {
    code: "ES", name_pt: "Espanha", name_en: "Spain", flag: "🇪🇸",
    cities: ["Madrid", "Barcelona"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600",
    curiosities_pt: ["O AVE liga Madrid a Barcelona em 2h30.", "Espanha tem a maior rede de alta velocidade da Europa.", "Prato típico: paella valenciana, com açafrão e arroz bomba."],
    curiosities_en: ["The AVE links Madrid to Barcelona in 2h30.", "Spain has Europe's largest high-speed network.", "Typical dish: Valencian paella, with saffron and bomba rice."],
    lat: 40.4637, lng: -3.7492,
  },
  {
    code: "FR", name_pt: "França", name_en: "France", flag: "🇫🇷",
    cities: ["Hendaye", "Lyon"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1641893910627-5d77df036185?w=1600",
    curiosities_pt: ["Hendaye é o ponto onde a bitola muda e os comboios europeus se reorganizam.", "Lyon Part-Dieu é uma das maiores estações de cruzamento da Europa.", "Prato típico: quenelle de Lyon, acompanhada por molho Nantua."],
    curiosities_en: ["Hendaye is where the rail gauge changes and European trains reshuffle.", "Lyon Part-Dieu is one of Europe's largest interchange stations.", "Typical dish: Lyon quenelle, served with Nantua sauce."],
    lat: 45.7640, lng: 4.8357,
  },
  {
    code: "DE", name_pt: "Alemanha", name_en: "Germany", flag: "🇩🇪",
    cities: ["Munique"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=1600",
    curiosities_pt: ["A Deutsche Bahn opera mais de 40.000 km de linhas.", "O ICE é uma das maravilhas modernas da ferrovia.", "Prato típico: Weisswurst de Munique com mostarda doce e pretzel."],
    curiosities_en: ["Deutsche Bahn runs over 40,000 km of track.", "The ICE is one of rail's modern wonders.", "Typical dish: Munich Weisswurst with sweet mustard and pretzel."],
    lat: 51.1657, lng: 10.4515,
  },
  {
    code: "AT", name_pt: "Áustria", name_en: "Austria", flag: "🇦🇹",
    cities: ["Viena", "Salzburgo"], arrival_date: "2026-06-12",
    image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600",
    curiosities_pt: ["A linha de Semmering é Património da UNESCO desde 1998.", "ÖBB Nightjet é o renascimento dos comboios noturnos europeus.", "Prato típico: Wiener Schnitzel, dourado e crocante, com batata salsa."],
    curiosities_en: ["The Semmering railway is a UNESCO site since 1998.", "ÖBB Nightjet is the rebirth of European night trains.", "Typical dish: Wiener Schnitzel, golden and crisp, with parsley potatoes."],
    lat: 47.5162, lng: 14.5501,
  },
  {
    code: "HU", name_pt: "Hungria", name_en: "Hungary", flag: "🇭🇺",
    cities: ["Budapeste"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1600",
    curiosities_pt: ["A Keleti Pályaudvar é uma das mais belas estações da Europa.", "O comboio para Bucareste atravessa a Transilvânia.", "Prato típico: goulash, cozinhado em panela com paprica e carne tenra."],
    curiosities_en: ["Keleti Pályaudvar is one of Europe's finest stations.", "The Bucharest train crosses Transylvania.", "Typical dish: goulash, slow-cooked with paprika and tender beef."],
    lat: 47.1625, lng: 19.5033,
  },
  {
    code: "RO", name_pt: "Roménia", name_en: "Romania", flag: "🇷🇴",
    cities: ["Bucareste"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1606820854416-439b3305ff39?w=1600",
    curiosities_pt: ["A CFR mantém locomotivas a diesel históricas em rotas locais.", "Os Cárpatos vistos do comboio mudam de cor a cada minuto.", "Prato típico: sarmale — folhas de couve recheadas com carne picada e arroz."],
    curiosities_en: ["CFR still operates historic diesel locos on rural lines.", "The Carpathians shift colour by the minute from the train.", "Typical dish: sarmale — cabbage leaves stuffed with minced meat and rice."],
    lat: 45.9432, lng: 24.9668,
  },
  {
    code: "TR", name_pt: "Turquia", name_en: "Turkey", flag: "🇹🇷",
    cities: ["Istambul", "Ancara", "Kars"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1719082993979-c4a36d62efad?w=1600",
    curiosities_pt: ["O Marmaray atravessa o Bósforo por baixo de água.", "O Doğu Ekspresi liga Ancara a Kars em 24 horas de paisagem pura.", "Aqui acaba a Europa e começa a Ásia. Literalmente.", "Prato típico: kebab de Adana, com pão fresco, sumagre e cebola roxa."],
    curiosities_en: ["The Marmaray runs under the Bosphorus.", "The Doğu Ekspresi links Ankara to Kars in 24 hours of pure landscape.", "Here Europe ends and Asia begins. Literally.", "Typical dish: Adana kebab, with fresh bread, sumac and red onion."],
    lat: 38.9637, lng: 35.2433,
  },
  {
    code: "GE", name_pt: "Geórgia", name_en: "Georgia", flag: "🇬🇪",
    cities: ["Tbilisi"], arrival_date: "", isAirLink: true,
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1600",
    curiosities_pt: ["A única ligação não-ferroviária da viagem: um voo curto até Tbilisi.", "O vinho georgiano tem 8.000 anos.", "Prato típico: khachapuri adjaruli, em forma de barco, com queijo derretido e ovo."],
    curiosities_en: ["The only non-rail link of the journey: a short flight to Tbilisi.", "Georgian wine is 8,000 years old.", "Typical dish: khachapuri adjaruli, boat-shaped, with melted cheese and egg."],
    lat: 42.3154, lng: 43.3569,
  },
  {
    code: "RU", name_pt: "Rússia", name_en: "Russia", flag: "🇷🇺",
    cities: ["Moscovo", "Irkutsk"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1514970746-d4a465d514d0?w=1600",
    curiosities_pt: ["O Transiberiano cobre 9.289 km. É a viagem.", "Sete fusos horários. Uma vida.", "O Lago Baikal é o mais antigo e profundo do mundo — guarda um quinto da água doce do planeta.", "Prato típico: pelmeni siberianos, cozidos em caldo, com creme azedo."],
    curiosities_en: ["The Trans-Siberian covers 9,289 km. It is the journey.", "Seven time zones. A lifetime.", "Lake Baikal is the oldest and deepest on Earth — holding a fifth of the planet's fresh water.", "Typical dish: Siberian pelmeni, boiled in broth, with sour cream."],
    lat: 61.5240, lng: 105.3188,
  },
  {
    code: "MN", name_pt: "Mongólia", name_en: "Mongolia", flag: "🇲🇳",
    cities: ["Ulaanbaatar"], arrival_date: "",
    image: "https://images.pexels.com/photos/28103660/pexels-photo-28103660.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    curiosities_pt: ["A estepe parece infinita. E é.", "Uma yurt no horizonte muda tudo.", "Prato típico: buuz — empadas de massa cozida ao vapor, recheadas com carneiro."],
    curiosities_en: ["The steppe feels infinite. And it is.", "A yurt on the horizon changes everything.", "Typical dish: buuz — steamed dumplings filled with mutton."],
    lat: 46.8625, lng: 103.8467,
  },
  {
    code: "CN", name_pt: "China", name_en: "China", flag: "🇨🇳",
    cities: ["Pequim", "Kunming"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=1600",
    curiosities_pt: ["A China tem mais comboios de alta velocidade do que o resto do mundo somado.", "O CR400 atinge os 350 km/h em produção.", "Prato típico: pato laqueado de Pequim, fatiado fino, com panquecas e cebolinho."],
    curiosities_en: ["China has more high-speed rail than the rest of the world combined.", "The CR400 cruises at 350 km/h in service.", "Typical dish: Beijing roast duck, thinly sliced, with pancakes and scallion."],
    lat: 35.8617, lng: 104.1954,
  },
  {
    code: "LA", name_pt: "Laos", name_en: "Laos", flag: "🇱🇦",
    cities: ["Vientiane"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600",
    curiosities_pt: ["A linha China-Laos abriu em 2021.", "Atravessa selva, túneis e arrozais.", "Prato típico: laap — saladinha picante de carne, hortelã, limão e arroz tostado."],
    curiosities_en: ["The China-Laos line opened in 2021.", "It cuts through jungle, tunnels and rice paddies.", "Typical dish: laap — a zesty meat salad with mint, lime and toasted rice."],
    lat: 19.8563, lng: 102.4955,
  },
  {
    code: "TH", name_pt: "Tailândia", name_en: "Thailand", flag: "🇹🇭",
    cities: ["Banguecoque"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1600",
    curiosities_pt: ["Hua Lamphong era a estação central por mais de um século.", "Os comboios noturnos para o sul cruzam vilas, pagodes e arrozais.", "Prato típico: pad thai — noodles salteados com camarão, amendoim e lima."],
    curiosities_en: ["Hua Lamphong was the central station for over a century.", "Southbound night trains pass villages, pagodas and rice fields.", "Typical dish: pad thai — stir-fried noodles with shrimp, peanut and lime."],
    lat: 15.8700, lng: 100.9925,
  },
  {
    code: "MY", name_pt: "Malásia", name_en: "Malaysia", flag: "🇲🇾",
    cities: ["Kuala Lumpur"], arrival_date: "",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1600",
    curiosities_pt: ["A KTM liga Banguecoque a Singapura quase sem interrupção.", "Selva tropical à janela durante horas.", "Prato típico: nasi lemak — arroz cozido em leite de coco com sambal, amendoim e ovo."],
    curiosities_en: ["KTM links Bangkok to Singapore almost seamlessly.", "Tropical jungle out the window for hours.", "Typical dish: nasi lemak — coconut rice with sambal, peanuts and egg."],
    lat: 4.2105, lng: 101.9758,
  },
  {
    code: "SG", name_pt: "Singapura", name_en: "Singapore", flag: "🇸🇬",
    cities: ["Singapura"], arrival_date: "",
    image: "https://images.pexels.com/photos/18662417/pexels-photo-18662417.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    curiosities_pt: ["Fim de linha. 20.000 km depois.", "Marina Bay, ao entardecer, depois de quatro décadas de espera.", "Prato típico: chili crab — caranguejo em molho doce-picante de tomate e ovo."],
    curiosities_en: ["End of the line. 20,000 km later.", "Marina Bay at dusk, forty years in the making.", "Typical dish: chili crab — crab in a sweet-spicy tomato and egg sauce."],
    lat: 1.3521, lng: 103.8198,
  },
];
