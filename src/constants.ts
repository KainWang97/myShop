import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Iron Teapot (Kyusu)",
    price: 120,
    category: "Tea Ritual",
    image: "https://picsum.photos/800/800?random=1",
    shortDescription:
      "Hand-cast iron teapot retaining heat for the perfect brew.",
    details:
      "Crafted in Morioka, this iron teapot develops a unique patina over time. The interior is untreated to allow the iron to subtly enhance the flavor of the tea.",
    material: "Cast Iron",
    origin: "Iwate, Japan",
    stock: 15,
  },
  {
    id: "2",
    name: "Linen Haori Jacket",
    price: 240,
    category: "Apparel",
    image: "https://picsum.photos/800/1000?random=2",
    shortDescription: "Breathable organic linen tailored in a traditional cut.",
    details:
      "A modern reinterpretation of the Haori. Made from 100% organic French linen, dyed with natural indigo. Perfect for layering in transitional seasons.",
    material: "100% Organic Linen",
    origin: "Okayama, Japan",
    stock: 8,
  },
  {
    id: "3",
    name: "Ceramic Flower Vase",
    price: 85,
    category: "Home Decor",
    image: "https://picsum.photos/800/900?random=3",
    shortDescription: "Minimalist stoneware vessel with a matte glaze.",
    details:
      "Wheel-thrown stoneware. The glaze is applied unevenly by hand to create depth and texture, embodying the philosophy of Wabi-sabi.",
    material: "Stoneware Clay",
    origin: "Mashiko, Japan",
    stock: 20,
  },
  {
    id: "4",
    name: "Hinoki Bath Stool",
    price: 150,
    category: "Bath",
    image: "https://picsum.photos/800/800?random=4",
    shortDescription: "Aromatic cypress wood stool for the bath.",
    details:
      "Made from high-quality Hinoki cypress, known for its calming scent and resistance to humidity. Smoothly sanded finish.",
    material: "Hinoki Cypress",
    origin: "Nagano, Japan",
    stock: 12,
  },
  {
    id: "5",
    name: "Indigo Dyed Scarf",
    price: 95,
    category: "Accessories",
    image: "https://picsum.photos/800/800?random=5",
    shortDescription: "Hand-dyed cotton scarf with traditional patterns.",
    details:
      'Utilizing the "Shibori" tie-dye technique. Each piece is unique with slight variations in the pattern.',
    material: "100% Cotton",
    origin: "Tokushima, Japan",
    stock: 25,
  },
  {
    id: "6",
    name: "Wooden Bento Box",
    price: 110,
    category: "Kitchen",
    image: "https://picsum.photos/800/700?random=6",
    shortDescription: "Oval Magewappa bento box made from bent cedar.",
    details:
      "Traditional craftsmanship that bends thin sheets of cedar wood. It regulates moisture naturally, keeping rice fresh and delicious.",
    material: "Akita Cedar",
    origin: "Akita, Japan",
    stock: 18,
  },
];

export const CATEGORIES = [
  "Tea Ritual",
  "Apparel",
  "Home Decor",
  "Bath",
  "Accessories",
  "Kitchen",
];

export const SEASONAL_INDICES = [1, 3, 5];
