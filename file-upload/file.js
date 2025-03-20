import { cut } from "./cut.js";

const fileInput = document.getElementById("file");
fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    const chunks = await cut(file);
    console.log(chunks);
});