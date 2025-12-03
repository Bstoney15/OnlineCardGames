/**
 * Profile picture map
 * Created by Mya Hoersdig
 * each pfp entry contains path, name of image, and price of item
 */

export const PFP_MAP = {
  0: { src: "/src/assets/pfps/airplane.jpg", name: "Airplane", price: 100, },
  1: { src: "/src/assets/pfps/snowflake.jpg", name: "Snowflake", price: 120, },
  2: { src: "/src/assets/pfps/ball.jpg", name: "Ball", price: 90, },
  3: { src: "/src/assets/pfps/car.jpg", name: "Car", price: 150, },
  4: { src: "/src/assets/pfps/cat.jpg", name: "Cat", price: 200, },
  5: { src: "/src/assets/pfps/chess.jpg", name: "Chess", price: 110, },
  6: { src: "/src/assets/pfps/dog.jpg", name: "Dog", price: 140, },
  7: { src: "/src/assets/pfps/drip.JPG", name: "Water Droplet", price: 130, },
  8: { src: "/src/assets/pfps/duck.jpg", name: "Duck", price: 80, },
  9: { src: "/src/assets/pfps/fish.jpg", name: "Fish", price: 95, },
  10:{ src: "/src/assets/pfps/guitar.jpg", name: "Guitar", price: 170, },
  11:{ src: "/src/assets/pfps/kick.jpg", name: "Kick", price: 125, },
  12:{ src: "/src/assets/pfps/red flower.JPG", name: "Red Flower", price: 160, },
};


// Store.jsx imports:  import ICONS from "./pfps/index.js"
// So we must provide a default export.

const ICONS = Object.keys(PFP_MAP).map((key) => ({
  id: Number(key),
  name: PFP_MAP[key].name,
  src: PFP_MAP[key].src,
  price:PFP_MAP[key].price
}));

export default ICONS;
