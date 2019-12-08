const express = require("express");
const app = express();
const port = 80;

require("./routes/index")(app);


app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
