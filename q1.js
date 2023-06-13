const products = [
  {
    name: "item 1",
    price: 10000,
    category: "category 1",
  },

  {
    name: "",
    price: 10000,
    category: "category 2",
  },

  {
    name: "item 3",
    priee: 10000,
    category: "category 3",
  },

  {
    name: "item 4",
    discount: 0,
    price: 10000,
    category: "category 4",
  },

  {
    name: "item 5",
    price_value: 0,
    category: "category 5",
  },

  {
    name: "item 6",
    prod_price: 10000,
    total_whatever: null,
  },
  {
    name: "item 7",
    total_price: 20000,
    category: "category 7",
  },
];

let total = 0;

for (const product of products) {
  for (const [key, value] of Object.entries(product)) {
    if (key !== "discount" && typeof value === "number") {
      total += value;
    }
  }
}
