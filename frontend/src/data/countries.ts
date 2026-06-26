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
    cities: ["Lagos", "Lisboa", "Porto"], arrival_date: "2026-06-01",
    image: "https://images.unsplash.com/photo-1608649944716-228404a0a8bb?w=1600",
    curiosities_pt: ["O primeiro carril foi assentado em 1856.", "A linha do Algarve corre paralela ao mar durante quase 100 km.", "Pastéis de nata no comboio são obrigatórios."],
    curiosities_en: ["The first rail was laid in 1856.", "The Algarve line runs along the sea for nearly 100 km.", "Pastéis de nata on the train are mandatory."],
    lat: 39.3999, lng: -8.2245,
  },
  {
    code: "ES", name_pt: "Espanha", name_en: "Spain", flag: "🇪🇸",
    cities: ["Madrid", "Barcelona"], arrival_date: "2026-06-04",
    image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1600",
    curiosities_pt: ["O AVE liga Madrid a Barcelona em 2h30.", "Espanha tem a maior rede de alta velocidade da Europa.", "Tortilla em qualquer estação."],
    curiosities_en: ["The AVE links Madrid to Barcelona in 2h30.", "Spain has Europe's largest high-speed network.", "Tortilla at every station."],
    lat: 40.4637, lng: -3.7492,
  },
  {
    code: "FR", name_pt: "França", name_en: "France", flag: "🇫🇷",
    cities: ["Paris", "Hendaye"], arrival_date: "2026-06-06",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600",
    curiosities_pt: ["O TGV foi o primeiro comboio comercial a passar os 300 km/h.", "Gare de Lyon serve mais de 100 milhões de pessoas por ano."],
    curiosities_en: ["The TGV was the first commercial train to break 300 km/h.", "Gare de Lyon serves over 100 million people a year."],
    lat: 46.6034, lng: 1.8883,
  },
  {
    code: "DE", name_pt: "Alemanha", name_en: "Germany", flag: "🇩🇪",
    cities: ["Munique", "Berlim"], arrival_date: "2026-06-09",
    image: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=1600",
    curiosities_pt: ["A Deutsche Bahn opera mais de 40.000 km de linhas.", "O ICE é uma das maravilhas modernas da ferrovia."],
    curiosities_en: ["Deutsche Bahn runs over 40,000 km of track.", "The ICE is one of rail's modern wonders."],
    lat: 51.1657, lng: 10.4515,
  },
  {
    code: "AT", name_pt: "Áustria", name_en: "Austria", flag: "🇦🇹",
    cities: ["Viena", "Salzburgo"], arrival_date: "2026-06-12",
    image: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600",
    curiosities_pt: ["A linha de Semmering é Património da UNESCO desde 1998.", "ÖBB Nightjet é o renascimento dos comboios noturnos europeus."],
    curiosities_en: ["The Semmering railway is a UNESCO site since 1998.", "ÖBB Nightjet is the rebirth of European night trains."],
    lat: 47.5162, lng: 14.5501,
  },
  {
    code: "HU", name_pt: "Hungria", name_en: "Hungary", flag: "🇭🇺",
    cities: ["Budapeste"], arrival_date: "2026-06-14",
    image: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1600",
    curiosities_pt: ["A Keleti Pályaudvar é uma das mais belas estações da Europa.", "O comboio para Bucareste atravessa a Transilvânia."],
    curiosities_en: ["Keleti Pályaudvar is one of Europe's finest stations.", "The Bucharest train crosses Transylvania."],
    lat: 47.1625, lng: 19.5033,
  },
  {
    code: "RO", name_pt: "Roménia", name_en: "Romania", flag: "🇷🇴",
    cities: ["Bucareste"], arrival_date: "2026-06-16",
    image: "https://images.unsplash.com/photo-1583309217394-d586ab8efb19?w=1600",
    curiosities_pt: ["A CFR mantém locomotivas a diesel históricas em rotas locais.", "Os Cárpatos vistos do comboio mudam de cor a cada minuto."],
    curiosities_en: ["CFR still operates historic diesel locos on rural lines.", "The Carpathians shift colour by the minute from the train."],
    lat: 45.9432, lng: 24.9668,
  },
  {
    code: "TR", name_pt: "Turquia", name_en: "Turkey", flag: "🇹🇷",
    cities: ["Istambul", "Ancara"], arrival_date: "2026-06-20",
    image: "https://images.unsplash.com/photo-1719082993979-c4a36d62efad?w=1600",
    curiosities_pt: ["O Marmaray atravessa o Bósforo por baixo de água.", "Aqui acaba a Europa e começa a Ásia. Literalmente."],
    curiosities_en: ["The Marmaray runs under the Bosphorus.", "Here Europe ends and Asia begins. Literally."],
    lat: 38.9637, lng: 35.2433,
  },
  {
    code: "GE", name_pt: "Geórgia", name_en: "Georgia", flag: "🇬🇪",
    cities: ["Tbilisi"], arrival_date: "2026-06-23", isAirLink: true,
    image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1600",
    curiosities_pt: ["A única ligação não-ferroviária da viagem: um voo curto até Tbilisi.", "O vinho georgiano tem 8.000 anos."],
    curiosities_en: ["The only non-rail link of the journey: a short flight to Tbilisi.", "Georgian wine is 8,000 years old."],
    lat: 42.3154, lng: 43.3569,
  },
  {
    code: "RU", name_pt: "Rússia", name_en: "Russia", flag: "🇷🇺",
    cities: ["Moscovo", "Irkutsk"], arrival_date: "2026-06-28",
    image: "https://images.unsplash.com/photo-1514970746-d4a465d514d0?w=1600",
    curiosities_pt: ["O Transiberiano cobre 9.289 km. É a viagem.", "Sete fusos horários. Uma vida.", "Lago Baikal: o mais antigo e profundo do mundo."],
    curiosities_en: ["The Trans-Siberian covers 9,289 km. It is the journey.", "Seven time zones. A lifetime.", "Lake Baikal: oldest and deepest on Earth."],
    lat: 61.5240, lng: 105.3188,
  },
  {
    code: "MN", name_pt: "Mongólia", name_en: "Mongolia", flag: "🇲🇳",
    cities: ["Ulan Bator"], arrival_date: "2026-07-08",
    image: "https://images.pexels.com/photos/28103660/pexels-photo-28103660.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    curiosities_pt: ["A estepe parece infinita. E é.", "Uma yurt no horizonte muda tudo."],
    curiosities_en: ["The steppe feels infinite. And it is.", "A yurt on the horizon changes everything."],
    lat: 46.8625, lng: 103.8467,
  },
  {
    code: "CN", name_pt: "China", name_en: "China", flag: "🇨🇳",
    cities: ["Pequim", "Xangai", "Kunming"], arrival_date: "2026-07-12",
    image: "https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=1600",
    curiosities_pt: ["A China tem mais comboios de alta velocidade do que o resto do mundo somado.", "O CR400 atinge os 350 km/h em produção."],
    curiosities_en: ["China has more high-speed rail than the rest of the world combined.", "The CR400 cruises at 350 km/h in service."],
    lat: 35.8617, lng: 104.1954,
  },
  {
    code: "LA", name_pt: "Laos", name_en: "Laos", flag: "🇱🇦",
    cities: ["Luang Prabang", "Vientiane"], arrival_date: "2026-07-22",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600",
    curiosities_pt: ["A linha China-Laos abriu em 2021.", "Atravessa selva, túneis e arrozais."],
    curiosities_en: ["The China-Laos line opened in 2021.", "It cuts through jungle, tunnels and rice paddies."],
    lat: 19.8563, lng: 102.4955,
  },
  {
    code: "TH", name_pt: "Tailândia", name_en: "Thailand", flag: "🇹🇭",
    cities: ["Banguecoque", "Chiang Mai"], arrival_date: "2026-07-26",
    image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=1600",
    curiosities_pt: ["Hua Lamphong era a estação central por mais de um século.", "Pad thai num comboio noturno é uma experiência espiritual."],
    curiosities_en: ["Hua Lamphong was the central station for over a century.", "Pad thai on a night train is a spiritual experience."],
    lat: 15.8700, lng: 100.9925,
  },
  {
    code: "MY", name_pt: "Malásia", name_en: "Malaysia", flag: "🇲🇾",
    cities: ["Kuala Lumpur"], arrival_date: "2026-07-30",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1600",
    curiosities_pt: ["A KTM liga Banguecoque a Singapura quase sem interrupção.", "Selva tropical à janela durante horas."],
    curiosities_en: ["KTM links Bangkok to Singapore almost seamlessly.", "Tropical jungle out the window for hours."],
    lat: 4.2105, lng: 101.9758,
  },
  {
    code: "SG", name_pt: "Singapura", name_en: "Singapore", flag: "🇸🇬",
    cities: ["Singapura"], arrival_date: "2026-08-02",
    image: "https://images.pexels.com/photos/18662417/pexels-photo-18662417.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    curiosities_pt: ["Fim de linha. 20.000 km depois.", "Marina Bay, ao entardecer, depois de quatro décadas de espera."],
    curiosities_en: ["End of the line. 20,000 km later.", "Marina Bay at dusk, forty years in the making."],
    lat: 1.3521, lng: 103.8198,
  },
];
