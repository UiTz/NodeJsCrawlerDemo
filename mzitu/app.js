const express = require("express");
const app = express();

require("./routes/index")(app);


app.listen("8081", () => {
  console.log("http://localhost:8081/");
});
