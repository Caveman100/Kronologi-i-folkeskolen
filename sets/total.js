// Kortsæt til spillet Epoke. Se LÆS-MIG.md for hvordan man laver et nyt sæt.
// "Total" har ingen egne kort. Den samler kortene fra alle sæt,
// der ikke har  inTotal: false  (Jul er fx ikke med).
registerSet({
  id: "total",
  name: "Total",
  description: "Alle historiekort",
  combine: true,
  startCards: ["pyramiderne", "jesus", "franske-revolution", "maanen"]
});
