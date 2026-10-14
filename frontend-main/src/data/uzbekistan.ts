export interface District {
  name: string;
  lat?: number;
  lng?: number;
}

export interface Region {
  name: string;
  short: string;
  lat: number;
  lng: number;
  zoom: number;
  cityMatch: string[];
  districts: District[];
}

export const REGIONS: Region[] = [
  {
    name: "Toshkent shahri", short: "Toshkent sh.", lat: 41.2995, lng: 69.2401, zoom: 11,
    cityMatch: ["Toshkent", "Тошкент"],
    districts: [
      { name: "Bektemir", lat: 41.2096, lng: 69.3336 },
      { name: "Chilonzor", lat: 41.2756, lng: 69.1989 },
      { name: "Mirobod", lat: 41.2845, lng: 69.2932 },
      { name: "Mirzo Ulug'bek", lat: 41.3252, lng: 69.3385 },
      { name: "Olmazor", lat: 41.3486, lng: 69.2071 },
      { name: "Sergeli", lat: 41.2229, lng: 69.2227 },
      { name: "Shayxontohur", lat: 41.3247, lng: 69.2255 },
      { name: "Uchtepa", lat: 41.2804, lng: 69.1669 },
      { name: "Yakkasaroy", lat: 41.2840, lng: 69.2682 },
      { name: "Yashnobod", lat: 41.3000, lng: 69.3200 },
      { name: "Yunusobod", lat: 41.3667, lng: 69.2889 },
    ],
  },
  {
    name: "Toshkent viloyati", short: "Toshkent vil.", lat: 41.2213, lng: 69.8597, zoom: 9,
    cityMatch: ["Toshkent viloyati", "Nurafshon", "Angren", "Olmaliq", "Chirchiq", "Bekobod"],
    districts: [
      { name: "Angren" }, { name: "Bekobod" }, { name: "Bo'ka" }, { name: "Bo'stonliq" },
      { name: "Chinoz" }, { name: "Nurafshon" }, { name: "Ohangaron" }, { name: "Olmaliq" },
      { name: "Oqqo'rg'on" }, { name: "Parkent" }, { name: "Piskent" }, { name: "Qibray" },
      { name: "Quyichirchiq" }, { name: "Toshkent tumani" }, { name: "Yangiyo'l" },
      { name: "Zangiota" },
    ],
  },
  {
    name: "Samarqand viloyati", short: "Samarqand", lat: 39.6270, lng: 66.9750, zoom: 9,
    cityMatch: ["Samarqand", "Самарқанд"],
    districts: [
      { name: "Samarqand shahri", lat: 39.6270, lng: 66.9750 },
      { name: "Kattaqo'rg'on" }, { name: "Bulung'ur" }, { name: "Ishtixon" }, { name: "Jomboy" },
      { name: "Narpay" }, { name: "Nurobod" }, { name: "Oqdaryo" }, { name: "Pastdarg'om" },
      { name: "Paxtachi" }, { name: "Payariq" }, { name: "Qo'shrabot" }, { name: "Toyloq" },
      { name: "Urgut" },
    ],
  },
  {
    name: "Buxoro viloyati", short: "Buxoro", lat: 39.7681, lng: 64.4217, zoom: 9,
    cityMatch: ["Buxoro", "Бухоро"],
    districts: [
      { name: "Buxoro shahri", lat: 39.7681, lng: 64.4217 },
      { name: "Kogon" }, { name: "G'ijduvon" }, { name: "Jondor" }, { name: "Olot" },
      { name: "Peshku" }, { name: "Qorako'l" }, { name: "Qorovulbozor" }, { name: "Romitan" },
      { name: "Shofirkon" }, { name: "Vobkent" },
    ],
  },
  {
    name: "Namangan viloyati", short: "Namangan", lat: 40.9983, lng: 71.6726, zoom: 9,
    cityMatch: ["Namangan", "Наманган"],
    districts: [
      { name: "Namangan shahri", lat: 40.9983, lng: 71.6726 },
      { name: "Chust" }, { name: "Chortoq" }, { name: "Kosonsoy" }, { name: "Mingbuloq" },
      { name: "Norin" }, { name: "Pop" }, { name: "To'raqo'rg'on" }, { name: "Uchqo'rg'on" },
      { name: "Uychi" }, { name: "Yangiqo'rg'on" },
    ],
  },
  {
    name: "Andijon viloyati", short: "Andijon", lat: 40.7821, lng: 72.3442, zoom: 9,
    cityMatch: ["Andijon", "Андижон"],
    districts: [
      { name: "Andijon shahri", lat: 40.7821, lng: 72.3442 },
      { name: "Asaka" }, { name: "Baliqchi" }, { name: "Bo'z" }, { name: "Izboskan" },
      { name: "Jalolquduq" }, { name: "Marhamat" }, { name: "Oltinko'l" }, { name: "Paxtaobod" },
      { name: "Qo'rg'ontepa" }, { name: "Shahrixon" }, { name: "Ulug'nor" }, { name: "Xo'jaobod" },
      { name: "Xonobod" },
    ],
  },
  {
    name: "Farg'ona viloyati", short: "Farg'ona", lat: 40.3864, lng: 71.7864, zoom: 9,
    cityMatch: ["Farg'ona", "Фарғона", "Qo'qon", "Marg'ilon", "Quvasoy"],
    districts: [
      { name: "Farg'ona shahri", lat: 40.3864, lng: 71.7864 },
      { name: "Marg'ilon", lat: 40.4711, lng: 71.7243 },
      { name: "Qo'qon", lat: 40.5286, lng: 70.9425 },
      { name: "Quvasoy" }, { name: "Bag'dod" }, { name: "Buvayda" }, { name: "Dang'ara" },
      { name: "Furqat" }, { name: "Oltiariq" }, { name: "Qo'shtepa" }, { name: "Quva" },
      { name: "Rishton" }, { name: "So'x" }, { name: "Toshloq" }, { name: "Uchko'prik" },
      { name: "Yozyovon" },
    ],
  },
  {
    name: "Qashqadaryo viloyati", short: "Qashqadaryo", lat: 38.8606, lng: 65.7890, zoom: 9,
    cityMatch: ["Qashqadaryo", "Qarshi", "Shahrisabz", "Қашқадарё"],
    districts: [
      { name: "Qarshi", lat: 38.8606, lng: 65.7890 },
      { name: "Shahrisabz", lat: 39.0578, lng: 66.8300 },
      { name: "Chiroqchi" }, { name: "Dehqonobod" }, { name: "G'uzor" }, { name: "Kasbi" },
      { name: "Kitob" }, { name: "Koson" }, { name: "Mirishkor" }, { name: "Muborak" },
      { name: "Nishon" }, { name: "Yakkabog'" },
    ],
  },
  {
    name: "Surxondaryo viloyati", short: "Surxondaryo", lat: 37.2242, lng: 67.2783, zoom: 9,
    cityMatch: ["Surxondaryo", "Termiz", "Denov", "Сурхондарё"],
    districts: [
      { name: "Termiz", lat: 37.2242, lng: 67.2783 },
      { name: "Denov", lat: 38.2771, lng: 67.8989 },
      { name: "Angor" }, { name: "Bandixon" }, { name: "Boysun" }, { name: "Jarqo'rg'on" },
      { name: "Muzrabot" }, { name: "Oltinsoy" }, { name: "Qiziriq" }, { name: "Qumqo'rg'on" },
      { name: "Sariosiyo" }, { name: "Sherobod" }, { name: "Sho'rchi" }, { name: "Uzun" },
    ],
  },
  {
    name: "Navoiy viloyati", short: "Navoiy", lat: 40.0844, lng: 65.3792, zoom: 9,
    cityMatch: ["Navoiy", "Навоий", "Zarafshon", "Uchquduq"],
    districts: [
      { name: "Navoiy shahri", lat: 40.0844, lng: 65.3792 },
      { name: "Zarafshon" }, { name: "Karmana" }, { name: "Konimex" }, { name: "Navbahor" },
      { name: "Nurota" }, { name: "Qiziltepa" }, { name: "Tomdi" }, { name: "Uchquduq" },
      { name: "Xatirchi" },
    ],
  },
  {
    name: "Jizzax viloyati", short: "Jizzax", lat: 40.1158, lng: 67.8422, zoom: 9,
    cityMatch: ["Jizzax", "Жиззах", "G'allaorol"],
    districts: [
      { name: "Jizzax shahri", lat: 40.1158, lng: 67.8422 },
      { name: "Arnasoy" }, { name: "Baxmal" }, { name: "Do'stlik" }, { name: "Forish" },
      { name: "G'allaorol" }, { name: "Mirzacho'l" }, { name: "Paxtakor" }, { name: "Yangiobod" },
      { name: "Zafarobod" }, { name: "Zarbdor" }, { name: "Zomin" },
    ],
  },
  {
    name: "Sirdaryo viloyati", short: "Sirdaryo", lat: 40.4861, lng: 68.7841, zoom: 9,
    cityMatch: ["Sirdaryo", "Guliston", "Сирдарё", "Yangiyer", "Shirin"],
    districts: [
      { name: "Guliston", lat: 40.4861, lng: 68.7841 },
      { name: "Yangiyer" }, { name: "Shirin" }, { name: "Boyovut" }, { name: "Sayxunobod" },
      { name: "Sardoba" }, { name: "Sirdaryo tumani" }, { name: "Xovos" }, { name: "Mirzaobod" },
    ],
  },
  {
    name: "Xorazm viloyati", short: "Xorazm", lat: 41.5500, lng: 60.6333, zoom: 9,
    cityMatch: ["Xorazm", "Urganch", "Xiva", "Хоразм", "Урганч"],
    districts: [
      { name: "Urganch", lat: 41.5500, lng: 60.6333 },
      { name: "Xiva", lat: 41.3783, lng: 60.3639 },
      { name: "Bog'ot" }, { name: "Gurlan" }, { name: "Hazorasp" }, { name: "Qo'shko'pir" },
      { name: "Shovot" }, { name: "Tuproqqal'a" }, { name: "Xonqa" }, { name: "Yangiariq" },
      { name: "Yangibozor" },
    ],
  },
  {
    name: "Qoraqalpog'iston Respublikasi", short: "Qoraqalpog'iston", lat: 42.4531, lng: 59.6103, zoom: 8,
    cityMatch: ["Qoraqalpog'iston", "Nukus", "Нукус", "Қорақалпоғистон"],
    districts: [
      { name: "Nukus", lat: 42.4531, lng: 59.6103 },
      { name: "Amudaryo" }, { name: "Beruniy" }, { name: "Chimboy" }, { name: "Ellikqal'a" },
      { name: "Kegeyli" }, { name: "Mo'ynoq" }, { name: "Qanliko'l" }, { name: "Qo'ng'irot" },
      { name: "Qorao'zak" }, { name: "Shumanay" }, { name: "Taxtako'pir" }, { name: "Taxiatosh" },
      { name: "To'rtko'l" }, { name: "Xo'jayli" },
    ],
  },
];

export function findRegion(name: string | null): Region | undefined {
  if (!name) return undefined;
  return REGIONS.find((r) => r.name === name);
}

export function findDistrict(regionName: string | null, districtName: string | null): District | undefined {
  const r = findRegion(regionName);
  if (!r || !districtName) return undefined;
  return r.districts.find((d) => d.name === districtName);
}
