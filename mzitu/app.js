const express = require("express");
const app = express();

require("./routes/index")(app);


app.listen("80", () => {
  console.log("http://localhost:8081/");
});
