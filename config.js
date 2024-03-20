import {
  bannerImagesData1,
  bannerImagesData2,
} from "./assets/2023-08-21/data.js";
// -- IMPORT --
const banner_20240320 = await fetch(
  "./assets/2024-03-20/data.json?r=" + Math.random()
);
const banner_20240201 = await fetch(
  "./assets/2024-02-01/data.json?r=" + Math.random()
);
const banner_20231212 = await fetch(
  "./assets/2023-12-12/data.json?r=" + Math.random()
);
const banner_20231117 = await fetch(
  "./assets/2023-11-17/data.json?r=" + Math.random()
);
const banner_20231026 = await fetch(
  "./assets/2023-10-26/data.json?r=" + Math.random()
);
const banner_20231001 = await fetch(
  "./assets/2023-10-01/data.json?r=" + Math.random()
);

export default [
  // -- ADD NEW --
  {
    name: "New banner - 2024-03-20",
    data: await banner_20240320.json(),
  },
  {
    name: "Keep the program - Bao Jiaza",
    data: await banner_20240201.json(),
  },
  {
    name: "Snow on ice - Aurora",
    data: await banner_20231212.json(),
  },
  {
    name: "Autumn leaves kite - Mouse",
    data: await banner_20231117.json(),
  },
  {
    name: "Working squirrel - Owl",
    data: await banner_20231026.json(),
  },
  {
    name: "Moon on the sea - Rabbit",
    data: await banner_20231001.json(),
  },
  {
    name: "Above the sea - Crocodile",
    data: bannerImagesData2,
  },
  {
    name: "Marine life - Turtle",
    data: bannerImagesData1,
  },
];
