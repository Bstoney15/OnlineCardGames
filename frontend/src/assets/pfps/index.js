export const PFP_MAP = {
  0: { src: "/src/assets/pfps/airplane.jpg", name: "Airplane" },
  1: { src: "/src/assets/pfps/snowflake.jpg", name: "Snowflake" },
  2: { src: "/src/assets/pfps/ball.jpg", name: "Ball" },
  3: { src: "/src/assets/pfps/car.jpg", name: "Car" },
  4: { src: "/src/assets/pfps/cat.jpg", name: "Cat" },
  5: { src: "/src/assets/pfps/chess.jpg", name: "Chess" },
  6: { src: "/src/assets/pfps/dog.jpg", name: "Dog" },
  7: { src: "/src/assets/pfps/drip.JPG", name: "Water Droplet" },
  8: { src: "/src/assets/pfps/duck.jpg", name: "Duck" },
  9: { src: "/src/assets/pfps/fish.jpg", name: "Fish" },
  10:{ src: "/src/assets/pfps/guitar.jpg", name: "Guitar" },
  11:{ src: "/src/assets/pfps/kick.jpg", name: "Kick" },
  12:{ src: "/src/assets/pfps/red flower.JPG", name: "Red Flower" },
};


// Store.jsx imports:  import ICONS from "./pfps/index.js"
// So we must provide a default export.

const ICONS = Object.keys(PFP_MAP).map((key) => ({
  id: Number(key),
  name: PFP_MAP[key].name,
  src: PFP_MAP[key].src,
  price:100
}));

export default ICONS;
